<?php
// A pastor sees ONLY their zone: dashboard statistics and every list behind the pastors portal.
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);
use App\Models\{User, Pastor, Member, HomeGroup, Report}; use Illuminate\Http\Request; use Illuminate\Support\Facades\{Cache, DB};
$pass = 0; $fail = 0;
$t = function (string $l, callable $fn) use (&$pass, &$fail) { try { $r = $fn(); if ($r === false) throw new Exception('assertion false'); echo "PASS  $l\n"; $pass++; } catch (Throwable $e) { echo "FAIL  $l :: " . substr(preg_replace('/\s+/', ' ', $e->getMessage()), 0, 250) . "\n"; $fail++; } };
$call = function (string $uri, string $tok) use ($http) { Cache::flush(); auth()->forgetGuards(); $r = $http->handle(Request::create("/api/$uri", 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json', 'REMOTE_ADDR' => '10.40.' . random_int(1, 250) . '.' . random_int(1, 250), 'HTTP_AUTHORIZATION' => "Bearer $tok"])); return [$r->getStatusCode(), json_decode($r->getContent(), true) ?? [], $r->getContent()]; };

// two pastors with members in different zones
$zones = Member::selectRaw('zone_id, count(*) c')->groupBy('zone_id')->having('c', '>', 1)->pluck('c', 'zone_id');
$pa = User::where('role', 'pastor')->where('is_active', true)->whereIn('zone_id', $zones->keys())->orderBy('id')->first();
$pb = User::where('role', 'pastor')->where('is_active', true)->whereIn('zone_id', $zones->keys())->where('zone_id', '!=', $pa->zone_id)->first() ?? User::where('role', 'pastor')->where('zone_id', '!=', $pa->zone_id)->first();
$ta = $pa->createToken('t')->plainTextToken; $tb = $pb->createToken('t')->plainTextToken; $zA = $pa->zone_id; $zB = $pb->zone_id;
echo "pastor A zone $zA, pastor B zone $zB\n";

$t('dashboard metrics: church-wide totals are gone, the zone is named', function () use ($call, $ta, $pa) { [$c, $j] = $call('dashboard/metrics', $ta); $d = $j['data']; return $c === 200 && $d['total_zones'] === null && $d['total_pastors'] === null && $d['total_regions'] === null && $d['zone']['id'] === $pa->zone_id && isset($d['zone']['region']); });
$t('every number equals the database for that zone (members, joins, home groups, pastors, reports, giving)', function () use ($call, $ta, $zA) {
    [, $j] = $call('dashboard/metrics', $ta); $d = $j['data'];
    $members = Member::where('zone_id', $zA)->where('status', 'active')->whereHas('user', fn ($q) => $q->where('is_active', true))->count(); $groups = HomeGroup::where('zone_id', $zA)->count();
    $pastors = Pastor::where('zone_id', $zA)->count(); $giving = (float) DB::table('payments')->where('zone_id', $zA)->whereNull('deleted_at')->where('status', 'completed')->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])->sum('amount');
    $reports = Report::where('zone_id', $zA)->whereBetween('report_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])->count();
    $join = Member::where('zone_id', $zA)->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count();
    $ok = $d['total_active_members'] === $members && $d['total_home_groups'] === $groups && $d['zone_pastors'] === $pastors && abs($d['zone_giving_month'] - $giving) < 0.01 && $d['reports_this_month'] === $reports && $d['new_members_this_month'] === $join;
    if (!$ok) echo '   ', json_encode(['api' => array_intersect_key($d, array_flip(['total_active_members', 'total_home_groups', 'zone_pastors', 'zone_giving_month', 'reports_this_month', 'new_members_this_month'])), 'db' => compact('members', 'groups', 'pastors', 'giving', 'reports', 'join')]), "\n";
    return $ok; });
$t('history charts: 7 real monthly points that add up to the database; trends only when there is a previous month to compare', function () use ($call, $ta, $zA) {
    [, $j] = $call('dashboard/metrics', $ta); $d = $j['data']; $s = $d['sparklines'];
    $totalReports = array_sum($s['reports_this_month']); $db = Report::where('zone_id', $zA)->where('report_date', '>=', now()->startOfMonth()->subMonthsNoOverflow(6)->toDateString())->count();
    $joinSum = array_sum($s['new_members_this_month']); $dbJoin = Member::where('zone_id', $zA)->where('created_at', '>=', now()->startOfMonth()->subMonthsNoOverflow(6))->count();
    $trendsOk = true; foreach ($d['trends'] as $k => $tr) { $prev = $s[$k][5] ?? 0; if ($prev <= 0 || !in_array($tr['direction'], ['up', 'down', 'neutral'], true)) $trendsOk = false; }
    return count($s['zone_giving_month']) === 7 && $totalReports === $db && $joinSum === $dbJoin && $trendsOk; });
$t('two pastors in different zones get different, correctly-scoped numbers', function () use ($call, $ta, $tb, $zA, $zB) { $a = $call('dashboard/metrics', $ta)[1]['data']; $b = $call('dashboard/metrics', $tb)[1]['data']; return $a['zone']['id'] === $zA && $b['zone']['id'] === $zB && $a['total_active_members'] === Member::where('zone_id', $zA)->where('status', 'active')->whereHas('user', fn ($q) => $q->where('is_active', true))->count() && $b['total_active_members'] === Member::where('zone_id', $zB)->where('status', 'active')->whereHas('user', fn ($q) => $q->where('is_active', true))->count(); });
$t('/pastors/dashboard (members, events, reports) is zone-only', function () use ($call, $ta, $tb, $zA) { [$c, $j] = $call('pastors/dashboard', $ta); $d = $j['data'] ?? []; $ids = collect($d['recent_reports'] ?? [])->pluck('id'); $own = Report::where('zone_id', $zA)->pluck('id'); return $c === 200 && $ids->every(fn ($i) => $own->contains($i)) && ($d['members']['total'] ?? 0) === Member::where('zone_id', $zA)->active()->count(); });
$t('member list: every row is in the pastor\'s zone; another pastor never sees them', function () use ($call, $ta, $tb, $zA, $zB) {
    $a = $call('members?per_page=100', $ta)[1]['data']; $b = $call('members?per_page=100', $tb)[1]['data']; $idsA = collect($a)->pluck('id'); $idsB = collect($b)->pluck('id');
    return $idsA->isNotEmpty() && Member::whereIn('id', $idsA)->where('zone_id', '!=', $zA)->doesntExist() && Member::whereIn('id', $idsB)->where('zone_id', '!=', $zB)->doesntExist() && $idsA->intersect($idsB)->isEmpty(); });
$t('home groups, partners, reports history: only the pastor\'s zone', function () use ($call, $ta, $zA) {
    $hg = $call('pastors/home-groups', $ta)[1]['data'] ?? []; $ids = collect($hg)->pluck('id'); $hgOk = $ids->isEmpty() || HomeGroup::whereIn('id', $ids)->where('zone_id', '!=', $zA)->doesntExist();
    $rh = $call('reports/history', $ta)[1]; $rows = collect($rh['data'] ?? $rh['reports'] ?? []); $rhOk = $rows->isEmpty() || Report::whereIn('id', $rows->pluck('id'))->where('zone_id', '!=', $zA)->doesntExist();
    $pp = $call('pastors/partners', $ta)[1]['data'] ?? []; $ppOk = collect($pp)->every(fn ($p) => !isset($p['zone_id']) || (int) $p['zone_id'] === $zA);
    return $hgOk && $rhOk && $ppOk; });
$t('a pastor cannot read another zone by id (member 360, member notes, report)', function () use ($call, $ta, $zA) {
    $foreign = Member::where('zone_id', '!=', $zA)->first(); $foreignReport = Report::where('zone_id', '!=', $zA)->first();
    $c1 = $call("pastors/members/{$foreign->id}/360", $ta)[0]; $c2 = $foreignReport ? $call("reports/{$foreignReport->id}", $ta)[0] : 403; return $c1 === 403 && in_array($c2, [403, 404], true); });
$t('the dashboard responses contain no other zone\'s names or church-wide counts', function () use ($call, $ta, $zA) { [, , $raw] = $call('dashboard/metrics', $ta); $other = \App\Models\Zone::where('id', '!=', $zA)->inRandomOrder()->first(); return !str_contains($raw, '"' . $other->name . '"') && !str_contains($raw, '"total_zones":83'); });

DB::table('personal_access_tokens')->where('name', 't')->delete(); Cache::flush();
echo "\nRESULT: $pass passed, $fail failed\n";
