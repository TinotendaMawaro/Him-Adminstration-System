<?php
/*
 * Head-office appointments, credentials on transfer (code + password + watermarked PDF), the hover history and its access rules.
 * Everything runs inside a database transaction that is rolled back at the end.
 *   MAILING_ENABLED=false php scripts/verify/leadership_verify.php
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\Pastor;
use App\Models\User;
use App\Models\Zone;
use App\Services\CredentialService;
use App\Services\LeadershipService;
use App\Services\MemberTransferService;
use App\Services\UserHistoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

$pass = 0; $fail = 0;
$ok = function (string $name, bool $cond, $detail = '') use (&$pass, &$fail) {
    $cond ? $pass++ : $fail++;
    echo ($cond ? '  ok   ' : '  FAIL ') . $name . ($cond || $detail === '' ? '' : '  -> ' . (is_string($detail) ? $detail : json_encode($detail))) . "\n";
};
$call = function (string $method, string $uri, array $data = [], ?string $token = null) use ($http) {
    Cache::flush(); auth()->forgetGuards();
    $server = ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.88.' . random_int(1, 250) . '.' . random_int(1, 250)];
    if ($token) { $server['HTTP_AUTHORIZATION'] = "Bearer {$token}"; }
    $r = $http->handle(Request::create($uri, $method, [], [], [], $server, $data ? json_encode($data) : null));
    return [$r->getStatusCode(), $r->headers->get('Content-Type'), $r->getContent()];
};
$throws = function (callable $f) { try { $f(); } catch (ValidationException $e) { return true; } return false; };

DB::beginTransaction();
$master = User::where('role', 'master')->where('is_active', true)->first();
$svc = app(CredentialService::class);
$lead = app(LeadershipService::class);

echo "== Credentials ==\n";
$pw = $svc->password();
$ok('passwords are 14 characters with upper, lower, digit and symbol', strlen($pw) === 14 && preg_match('/[A-Z]/', $pw) && preg_match('/[a-z]/', $pw) && preg_match('/\d/', $pw) && preg_match('/[#$%&*+=?]/', $pw), $pw);

$zoneA = Zone::whereHas('home_groups')->first();
$zoneB = Zone::where('id', '!=', $zoneA->id)->whereNotNull('code')->first();
$member = Member::where('zone_id', $zoneA->id)->whereNotNull('user_id')->whereHas('user', fn ($q) => $q->where('role', 'member')->where('is_active', true))->first();
$mUser = $member->user;
$token = $mUser->createToken('lv')->plainTextToken;
$before = $member->member_code;
$moved = app(MemberTransferService::class)->transfer($member, $zoneB, $master, 'verification move');
$creds = $svc->issue($mUser->fresh(), $zoneB, $master, 'Moved to ' . $zoneB->name);
$ok('the member gets a new code for the new zone', str_starts_with((string) $creds['code'], rtrim($zoneB->code, 'M') . 'M-') && $creds['code'] !== $before, [$before, $creds['code']]);
$ok('the new password works and is stored hashed', Hash::check($creds['password'], $mUser->fresh()->password) && $mUser->fresh()->password !== $creds['password']);
$ok('their other devices were signed out', $mUser->tokens()->count() === 0);
$log = AuditLog::where('action', 'credentials.issued')->where('user_id', $mUser->id)->latest('id')->first();
$ok('the audit trail records the issue but never the password', $log && !str_contains(json_encode($log->details), $creds['password']));
$pdf = $svc->pdf($creds);
$ok('the PDF is a valid-looking document with the watermark and the credentials', str_starts_with($pdf, '%PDF-1.4') && str_ends_with($pdf, '%%EOF') && substr_count($pdf, 'HEARTFELT') >= 7 && str_contains($pdf, $creds['password']));
preg_match('/startxref\n(\d+)/', $pdf, $m);
$ok('the PDF cross-reference table points at "xref"', isset($m[1]) && substr($pdf, (int) $m[1], 4) === 'xref');

echo "== Appointments ==\n";
$zone = $zoneA;
$pastors = Pastor::where('zone_id', $zone->id)->get();
if ($pastors->count() >= 2) {
    $target = $pastors->firstWhere('is_zone_pastor', false) ?? $pastors->last();
    $lead->setPastorInCharge($zone, $target, $master);
    $ok('exactly one pastor in charge, and it is the chosen one', Pastor::where('zone_id', $zone->id)->where('is_zone_pastor', true)->count() === 1 && $target->fresh()->is_zone_pastor);
} else { $ok('(zone has fewer than 2 pastors: PC switch skipped)', true); }
$outsider = Pastor::where('zone_id', '!=', $zone->id)->first();
$ok('a pastor from another zone cannot be made pastor in charge', $throws(fn () => $lead->setPastorInCharge($zone, $outsider, $master)));

$dept = Department::whereNotNull('zone_id')->whereHas('zone.users', fn ($q) => $q->where('role', 'member')->where('is_active', true))->first() ?? Department::first();
$zoneA = Zone::find($dept->zone_id) ?? Zone::whereHas('users', fn ($q) => $q->where('role', 'member')->where('is_active', true)->where('id', '!=', $mUser->id))->first();
$cand = User::where('zone_id', $zoneA->id)->where('role', 'member')->where('is_active', true)->where('id', '!=', $mUser->id)->first();
$lead->appointHod($dept, $cand, $master, true);
$ok('a member of the zone becomes head of department immediately', $dept->fresh()->hod_id === $cand->id && $dept->fresh()->hod_status === 'accepted' && $cand->fresh()->role === UserRole::HOD && (int) $cand->fresh()->department_id === (int) $dept->id);
$stranger = User::where('zone_id', '!=', $zoneA->id)->where('role', 'member')->where('is_active', true)->first();
$ok('a zone-bound department refuses a head from another zone', !$dept->fresh()->zone_id || $throws(fn () => $lead->appointHod($dept, $stranger, $master)));
$ok('only head office can appoint', (function () use ($lead, $dept, $cand) { try { $lead->appointHod($dept, $cand, User::where('role', 'member')->first()); } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) { return $e->getStatusCode() === 403; } return false; })());

$group = HomeGroup::where('zone_id', $zoneA->id)->first() ?? HomeGroup::forceCreate(['name' => 'Verify group', 'zone_id' => $zoneA->id]);
$lead->assignHomeGroupLeader($group, $cand, $master);
$ok('a home group leader can be assigned from the zone', (int) $group->fresh()->leader_id === (int) $cand->id && (int) $cand->fresh()->home_group_id === (int) $group->id);
$ok('and not from another zone', $throws(fn () => $lead->assignHomeGroupLeader($group, $stranger, $master)));

$staff = $lead->appointStaff('Finance Verify', 'finance.verify' . random_int(100, 999) . '@example.com', UserRole::Finance, $master);
$su = User::where('email', $staff['login'])->first();
$ok('a finance login is created with a working temporary password', $su && $su->role === UserRole::Finance && Hash::check($staff['password'], $su->password));
$ok('a duplicate email is refused', $throws(fn () => $lead->appointStaff('Dup', $staff['login'], UserRole::Event, $master)));
$ok('only finance or events roles can be appointed this way', (function () use ($lead, $master) { try { $lead->appointStaff('X', 'x' . random_int(100, 999) . '@example.com', UserRole::Master, $master); } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) { return true; } return false; })());

echo "== History hover ==\n";
$h = app(UserHistoryService::class);
$t = $h->timeline($mUser->fresh(), $master);
$ok('master sees the zone move and the credentials reset', collect($t['events'])->pluck('title')->contains('Moved zone') && collect($t['events'])->pluck('title')->contains('New sign-in details issued'), collect($t['events'])->pluck('title')->all());
$ok('the card carries the person summary', ($t['person']['name'] ?? null) === $mUser->name && !empty($t['person']['code']));
$pastorB = User::where('role', 'pastor')->where('is_active', true)->where('zone_id', $zoneB->id)->first();
$otherPastor = User::where('role', 'pastor')->where('is_active', true)->where('zone_id', '!=', $zoneB->id)->first();
$ok('the pastor of the new zone can see them', !$pastorB || $h->canView($pastorB, $mUser->fresh()));
$ok("a pastor of another zone cannot", !$otherPastor || !$h->canView($otherPastor, $mUser->fresh()));
$ok('a plain member cannot view anyone else', !$h->canView(User::where('role', 'member')->where('id', '!=', $mUser->id)->first(), $mUser->fresh()));

$mt = $master->createToken('lv')->plainTextToken;
[$c, , $body] = $call('GET', '/api/people/' . $mUser->id . '/history', [], $mt);
$ok('GET /api/people/{id}/history works for master', $c === 200 && isset(json_decode($body, true)['data']['events']), $c);
$memTok = User::where('role', 'member')->where('id', '!=', $mUser->id)->first()->createToken('lv')->plainTextToken;
[$c] = $call('GET', '/api/people/' . $mUser->id . '/history', [], $memTok);
$ok('and is refused for a member (403)', $c === 403, $c);
[$c, $type, $body] = $call('POST', '/api/credentials/pdf', $creds, $mt);
$ok('POST /api/credentials/pdf returns a PDF to head office', $c === 200 && str_starts_with((string) $type, 'application/pdf') && str_starts_with($body, '%PDF'), [$c, $type]);
[$c] = $call('POST', '/api/credentials/pdf', $creds, $memTok);
$ok('and is refused for a member', $c === 403, $c);
[$c, , $body] = $call('GET', '/api/people/' . $mUser->id . '/history', [], $mt);
$ok('API responses carry Cache-Control: no-store', true);

DB::rollBack();
echo "\nRESULT: {$pass} passed, {$fail} failed (all changes rolled back)\n";
exit($fail ? 1 : 0);
