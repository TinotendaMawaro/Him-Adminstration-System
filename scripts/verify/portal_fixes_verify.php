<?php
/*
 * Regression checks for: the app/web login CSRF (419) bug, saving zone information + zone history, the pastor dashboard
 * composition data, and profile-photo upload.   Run:  MAILING_ENABLED=false php scripts/verify/portal_fixes_verify.php
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\User;
use App\Models\ZoneHistory;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

$pass = 0; $fail = 0;
$ok = function (string $name, bool $cond, string $detail = '') use (&$pass, &$fail) {
    $cond ? $pass++ : $fail++;
    echo ($cond ? '  ok   ' : '  FAIL ') . $name . ($cond || !$detail ? '' : "  -> $detail") . "\n";
};
$call = function (string $method, string $uri, array $data = [], ?string $token = null, array $headers = [], array $files = []) use ($http) {
    Cache::flush();
    auth()->forgetGuards();
    $server = array_merge(['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.55.' . random_int(1, 250) . '.' . random_int(1, 250)], $headers);
    if ($token) { $server['HTTP_AUTHORIZATION'] = "Bearer {$token}"; }
    if ($files) { unset($server['CONTENT_TYPE']); }
    $r = $http->handle(Request::create($uri, $method, $files ? $data : [], [], $files, $server, $files ? null : json_encode($data)));
    return [$r->getStatusCode(), json_decode($r->getContent(), true) ?? []];
};

echo "== Origins that used to trigger 'CSRF token mismatch' (HTTP 419) ==\n";
foreach (['https://localhost', 'http://localhost', 'capacitor://localhost', 'https://him-administration-system.vercel.app'] as $origin) {
    [$c] = $call('POST', '/api/login', ['email' => 'nobody@example.com', 'password' => 'x'], null, ['HTTP_ORIGIN' => $origin]);
    $ok("login from {$origin} is not 419", $c !== 419, "got {$c}");
    [$c] = $call('POST', '/api/forgot-password', ['email' => 'nobody@example.com'], null, ['HTTP_ORIGIN' => $origin]);
    $ok("forgot-password from {$origin} is not 419", $c !== 419, "got {$c}");
}

$pastor = User::where('role', 'pastor')->where('is_active', true)->whereNotNull('zone_id')->first();
$token = $pastor->createToken('verify')->plainTextToken;
$zoneBefore = \App\Models\Zone::find($pastor->zone_id)->only(['name', 'phone', 'location', 'description', 'year_established']);

echo "== Zone information save ==\n";
[$c, $b] = $call('PUT', '/api/pastors/zone', ['name' => $zoneBefore['name'], 'description' => 'Verified description', 'location' => '', 'year_established' => null, 'address' => '', 'phone' => ''], $token);
$ok('saving with blank optional fields succeeds', $c === 200 && ($b['success'] ?? false), "got {$c} " . json_encode($b));
$ok('the description was stored', \App\Models\Zone::find($pastor->zone_id)->description === 'Verified description');

echo "== Zone history ==\n";
$before = ZoneHistory::where('zone_id', $pastor->zone_id)->count();
[$c, $b] = $call('POST', '/api/pastors/zone-history', ['date' => now()->subDay()->toDateString(), 'category' => 'milestone', 'notes' => 'Crossed one hundred members'], $token);
$ok('adding a history entry returns 201', $c === 201, "got {$c} " . json_encode($b));
$ok('the entry is stored', ZoneHistory::where('zone_id', $pastor->zone_id)->count() > $before);
[$c, $b] = $call('GET', '/api/pastors/zone-history', [], $token);
$ok('the timeline lists the new entry', $c === 200 && str_contains(json_encode($b), 'Crossed one hundred members'));
[$c] = $call('POST', '/api/pastors/zone-history', ['date' => now()->addDays(3)->toDateString(), 'category' => 'event', 'notes' => 'future'], $token);
$ok('future dates are refused', $c === 422, "got {$c}");
[$c] = $call('POST', '/api/pastors/zone-history', ['date' => now()->toDateString(), 'category' => 'bogus', 'notes' => 'x y z'], $token);
$ok('unknown categories are refused', $c === 422, "got {$c}");
$member = User::where('role', 'member')->where('is_active', true)->first();
$mt = $member->createToken('verify')->plainTextToken;
[$c] = $call('POST', '/api/pastors/zone-history', ['date' => now()->toDateString(), 'category' => 'note', 'notes' => 'members cannot'], $mt);
$ok('a member cannot add zone history', in_array($c, [401, 403], true), "got {$c}");

echo "== Pastor dashboard composition (pie chart) ==\n";
[$c, $b] = $call('GET', '/api/dashboard/metrics', [], $token);
$d = $b['data']['distribution'] ?? null;
$ok('metrics include the distribution', $c === 200 && is_array($d), "got {$c}");
$ok('status slices sum to the zone member count', $d && array_sum(array_column($d['status'], 'value')) === \App\Models\Member::where('zone_id', $pastor->zone_id)->count());
$ok('home-group slices sum to the people in the zone', $d && array_sum(array_column($d['home_groups'], 'value')) === User::where('zone_id', $pastor->zone_id)->whereIn('role', ['member', 'partner', 'hod'])->where('is_active', true)->count());

echo "== Profile photo ==\n";
$png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAHElEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAPBuEpAAAcsZk9gAAAAASUVORK5CYII=');
$tmp = tempnam(sys_get_temp_dir(), 'png'); file_put_contents($tmp, $png);
[$c, $b] = $call('POST', '/api/profile/photo', [], $mt, [], ['photo' => new UploadedFile($tmp, 'me.png', 'image/png', null, true)]);
$member->refresh();
$ok('a real image is accepted', $c === 200 && !empty($member->profile_photo), "got {$c} " . json_encode($b));
$ok('the stored photo is an absolute URL the apps can load', str_starts_with((string) $member->profile_photo, 'http'), (string) $member->profile_photo);
file_put_contents($tmp, '<?php echo 1;');
[$c] = $call('POST', '/api/profile/photo', [], $mt, [], ['photo' => new UploadedFile($tmp, 'evil.png', 'image/png', null, true)]);
$ok('a script renamed to .png is refused', in_array($c, [422, 400], true), "got {$c}");
@unlink($tmp);

// leave no trace
$pastor->tokens()->where('name', 'verify')->delete();
$member->tokens()->where('name', 'verify')->delete();
\App\Models\Zone::where('id', $pastor->zone_id)->update(array_intersect_key($zoneBefore, array_flip(['description'])) + []);
ZoneHistory::where('zone_id', $pastor->zone_id)->where(fn ($q) => $q->where('notes', 'like', 'Milestone: Crossed one hundred%')->orWhere('notes', 'like', 'Zone details updated by%'))->delete();

echo "\nRESULT: {$pass} passed, {$fail} failed\n";
exit($fail ? 1 : 0);
