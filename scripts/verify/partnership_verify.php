<?php
/*
 * Partnership lifecycle: status, expiry, renewal by payment, the marketplace and partner-only teachings lock, monthly reminders,
 * plus the security changes (password policy, department roster access).   Run:  MAILING_ENABLED=false php scripts/verify/partnership_verify.php
 * Everything it changes is put back.
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Enums\PartnerStatus;
use App\Enums\PaymentType;
use App\Models\Community\Teaching;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\User;
use App\Services\PartnershipService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

$pass = 0; $fail = 0;
$ok = function (string $name, bool $cond, $detail = '') use (&$pass, &$fail) {
    $cond ? $pass++ : $fail++;
    echo ($cond ? '  ok   ' : '  FAIL ') . $name . ($cond || $detail === '' ? '' : '  -> ' . (is_string($detail) ? $detail : json_encode($detail))) . "\n";
};
$call = function (string $method, string $uri, array $data = [], ?string $token = null) use ($http) {
    Cache::flush();
    auth()->forgetGuards();
    $server = ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.66.' . random_int(1, 250) . '.' . random_int(1, 250)];
    if ($token) { $server['HTTP_AUTHORIZATION'] = "Bearer {$token}"; }
    $r = $http->handle(Request::create($uri, $method, [], [], [], $server, $data ? json_encode($data) : null));
    return [$r->getStatusCode(), json_decode($r->getContent(), true) ?? []];
};

$svc = app(PartnershipService::class);
$partnerUser = User::where('role', 'partner')->where('is_active', true)->whereHas('partner')->first();
$partner = Partner::where('user_id', $partnerUser->id)->first();
$orig = $partner->only(['status', 'renewal_date']);
$token = $partnerUser->createToken('pv')->plainTextToken;
$member = User::where('role', 'member')->where('is_active', true)->whereDoesntHave('partner')->first();
$mt = $member->createToken('pv')->plainTextToken;

$set = fn (string $status, ?string $renewal) => Partner::where('id', $partner->id)->update(['status' => $status, 'renewal_date' => $renewal]);   // straight to the database: the model object can be stale

echo "== Status ==\n";
$set('active', now()->addDays(20)->toDateString());
$ok('active with a future renewal date', $svc->state($partnerUser->fresh())['status'] === 'active' && $svc->inGoodStanding($partnerUser->fresh()));
$set('active', now()->addDays(3)->toDateString());
$s = $svc->state($partnerUser->fresh());
$ok('inside the last 7 days it is "expiring" but still in good standing', $s['status'] === 'expiring' && $s['in_good_standing'] && $s['days_left'] === 3, $s);
$set('active', now()->subDays(2)->toDateString());
$ok('a past renewal date is "expired" and locked', $svc->state($partnerUser->fresh())['status'] === 'expired' && $svc->isLockedOut($partnerUser->fresh()));
$set('pending', null);
$ok('pending is neither good standing nor locked', $svc->state($partnerUser->fresh())['status'] === 'pending' && !$svc->isLockedOut($partnerUser->fresh()));
$ok('a member who never partnered is "none" and not locked', $svc->state($member)['status'] === 'none' && !$svc->isLockedOut($member));

echo "== Marketplace lock ==\n";
$set('active', now()->addDays(20)->toDateString());
[$c] = $call('GET', '/api/market/listings', [], $token);
$ok('active partner can browse the marketplace', $c === 200, $c);
[$c, $b] = $call('GET', '/api/community/bootstrap', [], $token);
$ok('bootstrap carries the partnership state and can_sell', ($b['data']['partnership']['status'] ?? null) === 'active' && ($b['data']['can_sell'] ?? false) === true, $b['data']['partnership'] ?? $b);
$set('expired', now()->subDays(3)->toDateString());
[$c, $b] = $call('GET', '/api/market/listings', [], $token);
$ok('expired partner is locked out (403, partnership_expired)', $c === 403 && ($b['code'] ?? '') === 'partnership_expired', [$c, $b['code'] ?? null]);
[$c, $b] = $call('GET', '/api/community/bootstrap', [], $token);
$ok('expired partner cannot sell', ($b['data']['can_sell'] ?? true) === false && ($b['data']['partnership']['locked'] ?? false) === true);
[$c] = $call('GET', '/api/market/listings', [], $mt);
$ok('a member who never partnered still uses the marketplace', $c === 200, $c);

echo "== Partner-only teachings ==\n";
$t = Teaching::create(['title' => 'Partners only test', 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video_id' => 'dQw4w9WgXcQ', 'speaker' => 'Test', 'status' => 'published', 'partners_only' => true, 'published_at' => now()->subMinute()]);
[$c, $b] = $call('GET', '/api/watch/teachings', [], $mt);
$row = collect($b['data']['items'] ?? [])->firstWhere('id', $t->id);
$ok('a non-partner sees it locked, with no video link in the response', $row && ($row['locked'] ?? false) && !isset($row['embed']) && !isset($row['url']), $row);
$set('active', now()->addDays(20)->toDateString());
[$c, $b] = $call('GET', '/api/watch/teachings', [], $token);
$row = collect($b['data']['items'] ?? [])->firstWhere('id', $t->id);
$ok('an active partner can watch it', $row && ($row['locked'] ?? true) === false && !empty($row['embed']), $row);
$t->delete();

echo "== Renewal by payment ==\n";
$set('expired', now()->subDays(5)->toDateString());
$pay = new Payment(); $pay->user_id = $partnerUser->id; $pay->type = PaymentType::Partnership;
$svc->recordPayment($pay);
$partner->refresh();
$ok('a partnership payment reactivates an expired partner', $partner->status === PartnerStatus::Active, (string) $partner->status->value);
$ok('and pushes the renewal date about a month ahead', $partner->renewal_date && Carbon::parse($partner->renewal_date)->between(now()->addDays(27), now()->addDays(32)), (string) $partner->renewal_date);
$before = $partner->renewal_date->toDateString();
$pay2 = new Payment(); $pay2->user_id = $partnerUser->id; $pay2->type = PaymentType::Tithe;
$svc->recordPayment($pay2);
$ok('a tithe does not touch the partnership', $partner->fresh()->renewal_date->toDateString() === $before);

echo "== Lifecycle command ==\n";
$set('active', now()->subDay()->toDateString());
Notification::where('category', 'partnership')->where('user_id', $partnerUser->id)->delete();
Artisan::call('partners:lifecycle');
$ok('it expires a lapsed partner and tells them', $partner->fresh()->status === PartnerStatus::Expired && Notification::where('user_id', $partnerUser->id)->where('title', 'Your partnership has expired')->exists());
Artisan::call('partners:lifecycle');
$ok('running it again does not notify twice', Notification::where('user_id', $partnerUser->id)->where('title', 'Your partnership has expired')->count() === 1);
$ok('members who are not partners get the monthly invitation, once', Notification::where('user_id', $member->id)->where('title', 'Become a partner this month')->count() === 1);
$set('active', now()->addDays(3)->toDateString());
Notification::where('user_id', $partnerUser->id)->where('category', 'partnership')->delete();
Artisan::call('partners:lifecycle');
$ok('an active partner within a week of renewal gets a reminder', Notification::where('user_id', $partnerUser->id)->where('title', 'Partnership renewal reminder')->exists(), trim(Artisan::output()) . ' | status=' . Partner::find($partner->id)->status->value . ' renewal=' . Partner::find($partner->id)->renewal_date);

echo "== Security ==\n";
[$c, $b] = $call('POST', '/api/register', ['name' => 'Weak', 'surname' => 'Pass', 'email' => 'weak' . random_int(1000, 9999) . '@example.com', 'phone' => '0771234567', 'zone_code' => 'R0101', 'password' => 'abcdefg1', 'password_confirmation' => 'abcdefg1', 'terms_accepted' => true]);
$ok('a short, single-case password is refused at sign-up', $c === 422 && isset($b['errors']['password']), [$c, $b['errors'] ?? null]);
$ok('API tokens expire after 7 days', (int) config('sanctum.expiration') === 10080, config('sanctum.expiration'));
$deptOther = \App\Models\Department::where('id', '!=', (int) $member->department_id)->first();
[$c] = $call('GET', '/api/departments/' . $deptOther->id . '/members', [], $mt);
$ok("a member cannot read another department's roster", $c === 403, $c);
$hod = User::where('role', 'hod')->where('is_active', true)->whereNotNull('department_id')->first();
if ($hod) {
    $ht = $hod->createToken('pv')->plainTextToken;
    [$c, $b] = $call('GET', '/api/departments/' . $hod->department_id . '/members', [], $ht);
    $ok('a department head can read their own roster', $c === 200 && isset($b['members']), $c);
    $hod->tokens()->where('name', 'pv')->delete();
}

// put everything back
Partner::where('id', $partner->id)->update(['status' => $orig['status'] instanceof \BackedEnum ? $orig['status']->value : $orig['status'], 'renewal_date' => $orig['renewal_date']]);
Notification::whereIn('user_id', [$partnerUser->id, $member->id])->where('category', 'partnership')->delete();
$partnerUser->tokens()->where('name', 'pv')->delete();
$member->tokens()->where('name', 'pv')->delete();

echo "\nRESULT: {$pass} passed, {$fail} failed\n";
exit($fail ? 1 : 0);
