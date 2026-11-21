<?php
/*
 * Web vs app sign-in, the pastor's own profile, the members filter, home group invitations / leader appointments and the group channel.
 * Everything runs inside a database transaction that is rolled back at the end.
 *   MAILING_ENABLED=false php scripts/verify/pastor_portal_verify.php
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\Community\Channel;
use App\Models\Community\ChannelMember;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\HomeGroupInvitation;
use App\Models\LeaderPromotionRequest;
use App\Models\Member;
use App\Models\Pastor;
use App\Models\User;
use App\Services\UserHistoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$pass = 0; $fail = 0;
$ok = function (string $name, bool $cond, $detail = '') use (&$pass, &$fail) {
    $cond ? $pass++ : $fail++;
    echo ($cond ? '  ok   ' : '  FAIL ') . $name . ($cond || $detail === '' ? '' : '  -> ' . (is_string($detail) ? $detail : json_encode($detail))) . "\n";
};
$call = function (string $method, string $uri, array $data = [], ?string $token = null, array $headers = []) use ($http) {
    Cache::flush(); auth()->forgetGuards();
    $server = ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.77.' . random_int(1, 250) . '.' . random_int(1, 250)];
    if ($token) { $server['HTTP_AUTHORIZATION'] = "Bearer {$token}"; }
    foreach ($headers as $k => $v) { $server['HTTP_' . strtoupper(str_replace('-', '_', $k))] = $v; }
    $r = $http->handle(Request::create($uri, $method, [], [], [], $server, $data ? json_encode($data) : null));
    return [$r->getStatusCode(), json_decode($r->getContent(), true), $r];
};

DB::beginTransaction();

// A pastor whose zone has members and a home group, and two plain members of that zone.
$group = HomeGroup::whereHas('zone.users', fn ($q) => $q->where('role', 'member')->where('is_active', true))->whereHas('zone.pastors', fn ($q) => $q->has('pastor'))->first();
$zone = $group->zone;
$pastor = $zone->pastors()->has('pastor')->first();
$pt = $pastor->createToken('pv')->plainTextToken;
$people = User::where('zone_id', $zone->id)->where('role', 'member')->where('is_active', true)->whereNull('home_group_id')->limit(2)->get();
if ($people->count() < 2) { $people = User::where('zone_id', $zone->id)->where('role', 'member')->where('is_active', true)->limit(2)->get(); foreach ($people as $p) { $p->update(['home_group_id' => null]); } }
[$alice, $bob] = [$people[0], $people[1]];
$alice->update(['home_group_id' => null]); $bob->update(['home_group_id' => null]);
$group->update(['leader_id' => null, 'meeting_day' => null, 'meeting_time' => null, 'location' => null]);
$app = ['X-HIM-Client' => 'app'];

echo "== Members sign in on the app only ==\n";
$alice->forceFill(['password' => Hash::make('Verify-Pass-2026')])->save();
[$c, $b] = $call('POST', '/api/login', ['email' => $alice->email, 'password' => 'Verify-Pass-2026']);
$ok('a member cannot sign in from the website (403, app only)', $c === 403 && ($b['app_only'] ?? false) === true && ($b['redirect'] ?? '') === '/download', [$c, $b['message'] ?? null]);
[$c, $b] = $call('POST', '/api/login', ['email' => $alice->email, 'password' => 'Verify-Pass-2026'], null, $app);
$ok('the same member signs in from the app', $c === 200 && !empty($b['token']), $c);
[$c, $b] = $call('POST', '/api/register', ['name' => 'Web Joiner', 'email' => 'webjoin' . random_int(100, 999) . '@example.com', 'password' => 'Verify-Pass-2026', 'password_confirmation' => 'Verify-Pass-2026', 'phone' => '0771234567', 'address' => '1 Test Rd', 'zone_code' => $zone->code]);
$ok('joining from the website is refused and points to the download page', $c === 403 && ($b['app_only'] ?? false) === true, $c);
$hod = User::where('role', 'hod')->where('is_active', true)->first();
if ($hod) {
    $hod->forceFill(['password' => Hash::make('Verify-Pass-2026')])->save();
    [$c, $b] = $call('POST', '/api/login', ['email' => $hod->email, 'password' => 'Verify-Pass-2026']);
    $ok('a head of department is a member too: the website sends them to the app', $c === 403 && ($b['app_only'] ?? false) === true, $c);
    [$c] = $call('POST', '/api/login', ['email' => $hod->email, 'password' => 'Verify-Pass-2026'], null, $app);
    $ok('and they sign in on the app', $c === 200, $c);
}

echo "== Pastor profile ==\n";
[$c, $b] = $call('GET', '/api/pastors/profile', [], $pt);
$ok('profile loads with zone, region and country filled in', $c === 200 && !empty($b['data']['zone']) && array_key_exists('country', $b['data']) && array_key_exists('next_of_kin_name', $b['data']), $c);
$payload = ['title' => 'Apostle', 'first_name' => 'Chipo', 'surname' => 'Vutabwashe', 'email' => $pastor->email, 'phone' => '+263 77 000 0000', 'date_of_birth' => '1980-05-17', 'address' => '12 Test Avenue',
    'next_of_kin_name' => 'Tendai Vutabwashe', 'next_of_kin_phone' => '+263 77 111 1111', 'next_of_kin_relationship' => 'Spouse', 'qualifications' => 'BTh, MDiv', 'position' => 'Pastor in Charge'];
[$c, $b] = $call('PUT', '/api/pastors/profile', $payload, $pt);
$ok('profile saves', $c === 200 && ($b['data']['full_name'] ?? '') === 'Apostle Chipo Vutabwashe', [$c, $b['message'] ?? $b['errors'] ?? null]);
[$c, $b] = $call('GET', '/api/pastors/profile', [], $pt);
$ok('every field comes back', ($b['data']['next_of_kin_name'] ?? '') === 'Tendai Vutabwashe' && ($b['data']['qualifications'] ?? '') === 'BTh, MDiv' && ($b['data']['date_of_birth'] ?? '') === '1980-05-17' && ($b['data']['position'] ?? '') === 'Pastor in Charge' && ($b['data']['phone'] ?? '') === '+263 77 000 0000');
$other = User::where('id', '!=', $pastor->id)->first();
[$c] = $call('PUT', '/api/pastors/profile', array_merge($payload, ['email' => $other->email]), $pt);
$ok('an email that belongs to someone else is refused', $c === 422, $c);
[$c] = $call('GET', '/api/pastors/profile', [], $alice->createToken('pv')->plainTextToken);
$ok('members cannot open the pastor profile endpoint', $c === 403, $c);

echo "== Members list and filter ==\n";
[$c, $b] = $call('GET', '/api/members/filter-options', [], $pt);
$ok('filter options list this zone\'s departments and home groups', $c === 200 && isset($b['data']['departments'], $b['data']['home_groups']) && collect($b['data']['home_groups'])->contains('id', $group->id), $c);
[$c, $b] = $call('GET', '/api/members?per_page=100', [], $pt);
$zoneOnly = $c === 200 && collect($b['data'])->every(fn ($m) => ($m['zone']['id'] ?? null) === $zone->id);
$ok('the list only ever has people of the pastor\'s zone', $zoneOnly, $c);
foreach (['hod', 'hg_leader', 'music', 'dept:' . (Department::value('id') ?? 1), 'hg:' . $group->id] as $f) {
    [$c, $b] = $call('GET', '/api/members?group=' . urlencode($f), [], $pt);
    $ok("filter '{$f}' works and stays in the zone", $c === 200 && collect($b['data'])->every(fn ($m) => ($m['zone']['id'] ?? null) === $zone->id), [$c, $b['message'] ?? null]);
}
[$c] = $call('GET', '/api/members?group=nonsense', [], $pt);
$ok('an unknown filter is refused', $c === 422, $c);
$member = Member::where('user_id', $bob->id)->first();
if ($member) {
    [$c, $b] = $call('GET', '/api/pastors/members/' . $member->id . '/360', [], $pt);
    $ok('opening a member gives phone, email, home group role and partnership', $c === 200 && isset($b['data']['profile']['email']) && array_key_exists('home_group_role', $b['data']['profile']) && array_key_exists('partner', $b['data']['profile']), $c);
}

echo "== Home group invitation -> group channel ==\n";
[$c, $b] = $call('POST', '/api/homegroups/' . $group->id . '/invite', ['member_id' => $alice->id, 'message' => 'Come and join us'], $pt);
$ok('the pastor can invite a member of the zone', in_array($c, [200, 201], true), [$c, $b['message'] ?? null]);
$ok('inviting does NOT put them in the group yet', $alice->fresh()->home_group_id === null);
$outsider = User::where('zone_id', '!=', $zone->id)->where('role', 'member')->first();
[$c] = $call('POST', '/api/homegroups/' . $group->id . '/invite', ['member_id' => $outsider->id], $pt);
$ok('a member of another zone cannot be invited', $c >= 400 && $c < 500 || $c === 422, $c);
$at = $alice->createToken('pv')->plainTextToken;
[$c, $b] = $call('GET', '/api/homegroup-invitations', [], $at, $app);
$inv = collect($b['invitations'] ?? [])->firstWhere('status', 'pending');
$ok('the member sees the invitation in the app', $c === 200 && $inv !== null, $c);
[$c, $b] = $call('POST', '/api/homegroup-invitations/' . $inv['id'] . '/accept', [], $at, $app);
$ok('accepting puts them in the home group', $c === 200 && (int) $alice->fresh()->home_group_id === (int) $group->id, [$c, $b['message'] ?? null]);
$channel = Channel::where('home_group_id', $group->id)->first();
$ok('the group has a private channel', $channel !== null && $channel->is_private);
$ok('and they are in it', $channel && ChannelMember::where('channel_id', $channel->id)->where('user_id', $alice->id)->where('status', 'active')->exists());
[$c, $b] = $call('GET', '/api/home-group/channel', [], $at, $app);
$ok('the app can find the group channel', $c === 200 && (int) ($b['data']['channel_id'] ?? 0) === (int) $channel->id, $c);

echo "== Group meeting schedule ==\n";
$ok('a group with no meeting set is reported without a day or time (shown as "to be advised")', $group->fresh()->meeting_day === null && $group->fresh()->meeting_time === null);

echo "== Leader appointment needs acceptance ==\n";
[$c, $b] = $call('POST', '/api/homegroups/' . $group->id . '/assign-leader', ['leader_id' => $alice->id], $pt);
$ok('the pastor appoints a leader', $c === 200, [$c, $b['message'] ?? null]);
$ok('nobody leads until they accept', $group->fresh()->leader_id === null && LeaderPromotionRequest::where('user_id', $alice->id)->where('status', 'pending')->exists());
[$c, $b] = $call('GET', '/api/home-group/my-promotion', [], $at, $app);
$promo = $b['promotion'] ?? null;
$ok('the member sees the appointment', $c === 200 && $promo !== null, $c);
[$c, $b] = $call('POST', '/api/home-group/promotion/' . $promo['id'] . '/respond', ['action' => 'accept'], $at, $app);
$ok('accepting makes them the leader', $c === 200 && (int) $group->fresh()->leader_id === (int) $alice->id, [$c, $b['message'] ?? null]);
$ok('and they stay a member (the app is where they lead)', $alice->fresh()->role->value === 'member' && $alice->fresh()->tokens()->count() >= 1);
$ok('the leader now owns the group channel', (int) $channel->fresh()->owner_id === (int) $alice->id && ChannelMember::where('channel_id', $channel->id)->where('user_id', $alice->id)->value('role') === 'owner');

// Bob joins by his own request being approved? Simplest: the pastor invites and Bob accepts.
$call('POST', '/api/homegroups/' . $group->id . '/invite', ['member_id' => $bob->id], $pt);
$bt = $bob->createToken('pv')->plainTextToken;
[, $b] = $call('GET', '/api/homegroup-invitations', [], $bt, $app);
$binv = collect($b['invitations'] ?? [])->firstWhere('status', 'pending');
$call('POST', '/api/homegroup-invitations/' . $binv['id'] . '/accept', [], $bt, $app);
$ok('a second member joins the group and its channel', ChannelMember::where('channel_id', $channel->id)->where('user_id', $bob->id)->where('status', 'active')->exists());
$ok('the channel member count follows', (int) $channel->fresh()->members_count === ChannelMember::where('channel_id', $channel->id)->where('status', 'active')->count());

$when = now()->addDays(3)->setTime(18, 30);
[$c, $b] = $call('POST', '/api/channels/' . $channel->id . '/meetings', ['title' => 'Home group evening', 'starts_at' => $when->toIso8601String(), 'mode' => 'in_person', 'location' => '5 Leader Street'], $at, $app);
$ok('the leader schedules a meeting in the channel', in_array($c, [200, 201], true), [$c, $b['message'] ?? null]);
$ok('the group\'s schedule now shows that day, time and place', $group->fresh()->meeting_day === $when->format('l') && str_starts_with((string) $group->fresh()->meeting_time?->format('H:i'), '18:30') && $group->fresh()->location === '5 Leader Street', $group->fresh()->only(['meeting_day', 'meeting_time', 'location']));
[$c] = $call('POST', '/api/channels/' . $channel->id . '/meetings', ['title' => 'Bob schedules', 'starts_at' => $when->toIso8601String(), 'mode' => 'online'], $bt, $app);
$ok('an ordinary group member cannot schedule meetings', $c === 403, $c);

echo "== Leaving the group leaves the channel ==\n";
$bob->fresh()->update(['home_group_id' => null]);
$ok('the channel membership goes with it', !ChannelMember::where('channel_id', $channel->id)->where('user_id', $bob->id)->exists());

echo "== Department head leads from the app ==\n";
$dept = Department::where('zone_id', $zone->id)->first() ?? Department::whereNull('zone_id')->first();
$carol = User::where('zone_id', $zone->id)->where('role', 'member')->where('is_active', true)->whereNotIn('id', [$alice->id, $bob->id])->first();
if ($dept && $carol) {
    $carol->update(['department_id' => $dept->id]);
    $dchan = Channel::where('department_id', $dept->id)->first();
    $ok('joining a department puts the person in its channel', $dchan && ChannelMember::where('channel_id', $dchan->id)->where('user_id', $carol->id)->where('status', 'active')->exists());
    $dept->update(['hod_id' => $carol->id, 'hod_status' => 'pending']);
    $dept->update(['hod_status' => 'accepted']);
    $ok('when the head accepts they own the department channel', (int) $dchan->fresh()->owner_id === (int) $carol->id);
    $ct = $carol->createToken('pv')->plainTextToken;
    [$c, $b] = $call('GET', '/api/department/channel', [], $ct, $app);
    $ok('the app finds the department channel and knows they are the head', $c === 200 && ($b['data']['is_head'] ?? false) === true, [$c, $b]);
    [$c] = $call('POST', '/api/channels/' . $dchan->id . '/meetings', ['title' => 'Department meeting', 'starts_at' => now()->addDays(2)->toIso8601String(), 'mode' => 'online'], $ct, $app);
    $ok('the head schedules a department meeting', in_array($c, [200, 201], true), $c);
    $dave = User::where('zone_id', $zone->id)->where('role', 'member')->whereNotIn('id', [$alice->id, $bob->id, $carol->id])->first();
    if ($dave) {
        $dave->update(['department_id' => $dept->id]);
        [$c] = $call('POST', '/api/channels/' . $dchan->id . '/meetings', ['title' => 'Sneaky', 'starts_at' => now()->addDays(2)->toIso8601String(), 'mode' => 'online'], $dave->createToken('pv')->plainTextToken, $app);
        $ok('an ordinary department member cannot', $c === 403, $c);
    }
}

echo "== Hover history shows the group and role ==\n";
$t = app(UserHistoryService::class)->timeline($alice->fresh(), $pastor);
$ok('home group and Leader role are on the card', ($t['person']['home_group'] ?? null) === $group->name && ($t['person']['home_group_role'] ?? null) === 'Leader', $t['person'] ?? null);

DB::rollBack();
echo "\nRESULT: {$pass} passed, {$fail} failed (all changes rolled back)\n";
exit($fail ? 1 : 0);
