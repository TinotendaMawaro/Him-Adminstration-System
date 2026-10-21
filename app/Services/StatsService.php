<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Read-only aggregates behind the Master / Finance / Events dashboards and CSV exports.
 * Everything here is computed from live tables, never hard-coded.
 *
 * Money is summed as stored (the app transacts in a single currency, USD by default).
 */
class StatsService
{
    // ─── Time helpers ─────────────────────────────────────────────────────────

    /** The first day of each of the last $months months, oldest first. */
    public function monthStarts(int $months = 12): Collection
    {
        $start = now()->startOfMonth()->subMonths($months - 1);

        return collect(range(0, $months - 1))->map(fn ($i) => $start->copy()->addMonths($i));
    }

    public function periodBounds(string $period): array
    {
        return match ($period) {
            'this_month'   => [now()->startOfMonth(), now()->endOfDay()],
            'last_month'   => [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()],
            'this_quarter' => [now()->startOfQuarter(), now()->endOfDay()],
            'this_year'    => [now()->startOfYear(), now()->endOfDay()],
            'last_year'    => [now()->subYear()->startOfYear(), now()->subYear()->endOfYear()],
            'last_12'      => [now()->subMonths(11)->startOfMonth(), now()->endOfDay()],
            default        => [now()->startOfYear(), now()->endOfDay()],
        };
    }

    public static function periodOptions(): array
    {
        return [
            'this_month'   => 'This month',
            'last_month'   => 'Last month',
            'this_quarter' => 'This quarter',
            'this_year'    => 'Year to date',
            'last_year'    => 'Last year',
            'last_12'      => 'Last 12 months',
        ];
    }

    // ─── Headline numbers ─────────────────────────────────────────────────────

    public function kpis(): array
    {
        $thisMonth = $this->income(now()->startOfMonth(), now()->endOfDay());
        $lastMonth = $this->income(now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth());

        $newThis = $this->newMembers(now()->startOfMonth(), now()->endOfDay());
        $newLast = $this->newMembers(now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth());

        return [
            'pastors'          => DB::table('pastors')->whereNull('deleted_at')->count(),
            'zones'            => DB::table('zones')->count(),
            'regions'          => DB::table('regions')->count(),
            'active_members'   => DB::table('members')->whereNull('deleted_at')->where('status', 'active')->count(),
            'new_members'      => $newThis,
            'new_members_prev' => $newLast,
            'active_partners'  => DB::table('partners')->whereNull('deleted_at')->where('status', 'active')->count(),
            'home_groups'      => DB::table('home_groups')->count(),
            'income_month'     => $thisMonth,
            'income_prev'      => $lastMonth,
            'income_ytd'       => $this->income(now()->startOfYear(), now()->endOfDay()),
            'pending_payments' => DB::table('payments')->whereNull('deleted_at')->where('status', PaymentStatus::Pending->value)
                ->where(fn ($q) => $q->whereNull('gateway')->orWhere('gateway_status', 'SUCCESS_MISMATCH'))->count(),
        ];
    }

    public function income(CarbonInterface $from, CarbonInterface $to, ?string $type = null, ?int $zoneId = null): float
    {
        return (float) DB::table('payments')
            ->whereNull('deleted_at')
            ->where('status', PaymentStatus::Completed->value)
            ->whereBetween('paid_at', [$from, $to])
            ->when($type, fn ($q) => $q->where('type', $type))
            ->when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->sum('amount');
    }

    public function newMembers(CarbonInterface $from, CarbonInterface $to): int
    {
        return DB::table('members')->whereNull('deleted_at')->whereBetween('membership_date', [$from->toDateString(), $to->toDateString()])->count();
    }

    /** Percentage change, null when there is nothing to compare against. */
    public static function change(float|int $current, float|int $previous): ?float
    {
        if ($previous == 0) {
            return $current > 0 ? null : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    // ─── Time series ──────────────────────────────────────────────────────────

    /** @return array{labels: array, new: array, total: array} */
    public function memberGrowth(int $months = 12): array
    {
        $months   = $this->monthStarts($months);
        $from     = $months->first();
        $baseline = DB::table('members')->whereNull('deleted_at')->where('membership_date', '<', $from->toDateString())->count();

        $perMonth = DB::table('members')->whereNull('deleted_at')
            ->where('membership_date', '>=', $from->toDateString())
            ->selectRaw("DATE_FORMAT(membership_date, '%Y-%m') as m, COUNT(*) as c")
            ->groupBy('m')->pluck('c', 'm');

        $running = $baseline;
        $new = $total = [];
        foreach ($months as $m) {
            $c       = (int) ($perMonth[$m->format('Y-m')] ?? 0);
            $running += $c;
            $new[]   = $c;
            $total[] = $running;
        }

        return ['labels' => $months->map->format('M Y')->all(), 'new' => $new, 'total' => $total];
    }

    /** Monthly completed income split by payment type. @return array{labels: array, series: array<string, array>} */
    public function incomeByTypeMonthly(int $months = 12, ?int $zoneId = null): array
    {
        $ms   = $this->monthStarts($months);
        $rows = DB::table('payments')->whereNull('deleted_at')
            ->where('status', PaymentStatus::Completed->value)
            ->where('paid_at', '>=', $ms->first())
            ->when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as m, type, SUM(amount) as total")
            ->groupBy('m', 'type')->get();

        $types  = $rows->pluck('type')->unique()->values();
        $series = [];
        foreach ($types as $type) {
            $series[$type] = $ms->map(fn ($m) => round((float) ($rows->first(fn ($r) => $r->type === $type && $r->m === $m->format('Y-m'))->total ?? 0), 2))->all();
        }

        return ['labels' => $ms->map->format('M Y')->all(), 'series' => $series];
    }

    /** Weekly-report attendance summed per month. */
    public function attendanceMonthly(int $months = 12): array
    {
        $ms   = $this->monthStarts($months);
        $rows = DB::table('reports')->where('report_date', '>=', $ms->first()->toDateString())
            ->selectRaw("DATE_FORMAT(report_date, '%Y-%m') as m, SUM(attendance) as a")->groupBy('m')->pluck('a', 'm');

        return [
            'labels' => $ms->map->format('M Y')->all(),
            'data'   => $ms->map(fn ($m) => (int) ($rows[$m->format('Y-m')] ?? 0))->all(),
        ];
    }

    // ─── Breakdowns ───────────────────────────────────────────────────────────

    public function incomeByRegion(CarbonInterface $from, CarbonInterface $to): Collection
    {
        return DB::table('payments as p')
            ->join('zones as z', 'z.id', '=', 'p.zone_id')
            ->join('regions as r', 'r.id', '=', 'z.region_id')
            ->whereNull('p.deleted_at')->where('p.status', PaymentStatus::Completed->value)
            ->whereBetween('p.paid_at', [$from, $to])
            ->groupBy('r.id', 'r.name')->orderByDesc(DB::raw('SUM(p.amount)'))
            ->selectRaw('r.name as label, ROUND(SUM(p.amount), 2) as total')->get();
    }

    public function incomeByType(CarbonInterface $from, CarbonInterface $to): Collection
    {
        return DB::table('payments')->whereNull('deleted_at')->where('status', PaymentStatus::Completed->value)
            ->whereBetween('paid_at', [$from, $to])->groupBy('type')->orderByDesc(DB::raw('SUM(amount)'))
            ->selectRaw('type as label, ROUND(SUM(amount), 2) as total')->get();
    }

    public function membersByRegion(): Collection
    {
        return DB::table('members as m')
            ->join('zones as z', 'z.id', '=', 'm.zone_id')
            ->join('regions as r', 'r.id', '=', 'z.region_id')
            ->whereNull('m.deleted_at')->where('m.status', 'active')
            ->groupBy('r.id', 'r.name')->orderByDesc(DB::raw('COUNT(*)'))
            ->selectRaw('r.name as label, COUNT(*) as total')->get();
    }

    public function pastorsByRegion(): Collection
    {
        return DB::table('pastors as p')
            ->leftJoin('zones as z', 'z.id', '=', 'p.zone_id')
            ->leftJoin('regions as r', 'r.id', '=', DB::raw('COALESCE(p.region_id, z.region_id)'))
            ->whereNull('p.deleted_at')
            ->groupBy('r.id', 'r.name')->orderByDesc(DB::raw('COUNT(*)'))
            ->selectRaw("COALESCE(r.name, 'Unassigned') as label, COUNT(*) as total")->get();
    }

    // ─── Ledgers (finance + exports) ──────────────────────────────────────────

    /**
     * One row per zone with each contribution type as a column, rolled up to region.
     * This is the automated "tithes / offerings / seeds by zone and region" list.
     */
    public function contributionsByZone(CarbonInterface $from, CarbonInterface $to, ?int $regionId = null): Collection
    {
        return DB::table('zones as z')
            ->leftJoin('regions as r', 'r.id', '=', 'z.region_id')
            ->leftJoin('payments as p', function ($j) use ($from, $to) {
                $j->on('p.zone_id', '=', 'z.id')
                    ->whereNull('p.deleted_at')
                    ->where('p.status', PaymentStatus::Completed->value)
                    ->whereBetween('p.paid_at', [$from, $to]);
            })
            ->when($regionId, fn ($q) => $q->where('z.region_id', $regionId))
            ->groupBy('z.id', 'z.code', 'z.name', 'r.name')
            ->orderBy('r.name')->orderBy('z.code')
            ->selectRaw("
                COALESCE(r.name, '—') as region, z.code as zone_code, z.name as zone,
                COALESCE(SUM(CASE WHEN p.type = 'tithe' THEN p.amount END), 0) as tithes,
                COALESCE(SUM(CASE WHEN p.type = 'offering' THEN p.amount END), 0) as offerings,
                COALESCE(SUM(CASE WHEN p.type = 'seed' THEN p.amount END), 0) as seeds,
                COALESCE(SUM(CASE WHEN p.type = 'building_fund' THEN p.amount END), 0) as building_fund,
                COALESCE(SUM(CASE WHEN p.type = 'missions' THEN p.amount END), 0) as missions,
                COALESCE(SUM(CASE WHEN p.type = 'partnership' THEN p.amount END), 0) as partnership,
                COALESCE(SUM(CASE WHEN p.type NOT IN ('tithe','offering','seed','building_fund','missions','partnership') THEN p.amount END), 0) as other,
                COALESCE(SUM(p.amount), 0) as total,
                COUNT(DISTINCT p.user_id) as contributors
            ")->get();
    }

    /** Per-person giving for one contribution type — the automated tithers / offering / seed list. */
    public function contributors(string $type, CarbonInterface $from, CarbonInterface $to, ?int $regionId = null, ?int $zoneId = null): Collection
    {
        return DB::table('payments as p')
            ->join('users as u', 'u.id', '=', 'p.user_id')
            ->leftJoin('zones as z', 'z.id', '=', 'p.zone_id')
            ->leftJoin('regions as r', 'r.id', '=', 'z.region_id')
            ->whereNull('p.deleted_at')->where('p.status', PaymentStatus::Completed->value)
            ->where('p.type', $type)->whereBetween('p.paid_at', [$from, $to])
            ->when($regionId, fn ($q) => $q->where('z.region_id', $regionId))
            ->when($zoneId, fn ($q) => $q->where('p.zone_id', $zoneId))
            ->groupBy('u.id', 'u.name', 'u.email', 'z.name', 'r.name')
            ->orderByDesc(DB::raw('SUM(p.amount)'))
            ->selectRaw("u.name as person, u.email, COALESCE(z.name, '—') as zone, COALESCE(r.name, '—') as region,
                COUNT(*) as payments, SUM(p.amount) as total, MAX(p.paid_at) as last_paid")->get();
    }

    /** Zone / region directory used by the master export. */
    public function zoneSummary(): Collection
    {
        return DB::table('zones as z')
            ->leftJoin('regions as r', 'r.id', '=', 'z.region_id')
            ->orderBy('r.name')->orderBy('z.code')
            ->selectRaw("
                COALESCE(r.name, '—') as region, z.code, z.name,
                (SELECT COUNT(*) FROM members m WHERE m.zone_id = z.id AND m.deleted_at IS NULL AND m.status = 'active') as active_members,
                (SELECT COUNT(*) FROM pastors pa WHERE pa.zone_id = z.id AND pa.deleted_at IS NULL) as pastors,
                (SELECT COUNT(*) FROM home_groups h WHERE h.zone_id = z.id) as home_groups,
                (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.zone_id = z.id AND p.deleted_at IS NULL AND p.status = 'completed' AND p.paid_at >= ?) as income_ytd,
                (SELECT MAX(rp.report_date) FROM reports rp WHERE rp.zone_id = z.id) as last_report
            ", [now()->startOfYear()])->get();
    }
}
