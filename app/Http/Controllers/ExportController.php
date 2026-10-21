<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Services\AuditTrail;
use App\Services\StatsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Streams CSV exports for the Master / Finance / Events portals.
 * Each report declares which roles may download it; access is enforced here, server-side.
 */
class ExportController extends Controller
{
    /** report key => [allowed roles, filename stem] */
    private const REPORTS = [
        'pastors'        => [['master'], 'pastors'],
        'zones'          => [['master'], 'zones-summary'],
        'members'        => [['master'], 'members'],
        'member-growth'  => [['master'], 'member-growth'],
        'financial'      => [['master', 'finance'], 'financial-summary'],
        'contributions'  => [['master', 'finance'], 'contributions-by-zone'],
        'tithers'        => [['master', 'finance'], 'tithers'],
        'offerings'      => [['master', 'finance'], 'offerings'],
        'seeds'          => [['master', 'finance'], 'seeds'],
        'payments'       => [['master', 'finance'], 'payments'],
        'registrations'  => [['master', 'event'], 'event-registrations'],
        'events'         => [['master', 'event'], 'events-summary'],
    ];

    public function __invoke(Request $request, string $report, StatsService $stats): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user, 401);
        abort_unless(isset(self::REPORTS[$report]), 404);

        [$roles, $stem] = self::REPORTS[$report];
        abort_unless($user->hasAnyRole($roles) && $user->is_active, 403);

        $validated = $request->validate([
            'period' => ['nullable', 'in:' . implode(',', array_keys(StatsService::periodOptions()))],
            'region' => ['nullable', 'integer', 'exists:regions,id'],
            'event'  => ['nullable', 'integer', 'exists:events,id'],
        ]);

        [$from, $to] = $stats->periodBounds($validated['period'] ?? 'this_year');
        $regionId    = $validated['region'] ?? null;

        [$headers, $rows] = match ($report) {
            'pastors'       => $this->pastors(),
            'zones'         => $this->zones($stats),
            'members'       => $this->members(),
            'member-growth' => $this->memberGrowth($stats),
            'financial'     => $this->financial($stats, $from, $to),
            'contributions' => $this->contributions($stats, $from, $to, $regionId),
            'tithers'       => $this->contributors($stats, 'tithe', $from, $to, $regionId),
            'offerings'     => $this->contributors($stats, 'offering', $from, $to, $regionId),
            'seeds'         => $this->contributors($stats, 'seed', $from, $to, $regionId),
            'payments'      => $this->payments($from, $to, $regionId),
            'registrations' => $this->registrations($validated['event'] ?? null),
            'events'        => $this->events(),
        };

        AuditTrail::record('export.downloaded', $user, null, [
            'report' => $report, 'period' => $validated['period'] ?? null, 'region' => $regionId, 'rows' => count($rows),
        ]);

        $filename = sprintf('%s-%s.csv', $stem, now()->format('Ymd-His'));

        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel opens accents correctly
            fputcsv($out, $headers);
            foreach ($rows as $row) {
                fputcsv($out, array_map([$this, 'safe'], array_values((array) $row)));
            }
            fclose($out);
        }, $filename, [
            'Content-Type'           => 'text/csv; charset=UTF-8',
            'Cache-Control'          => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /** Neutralise spreadsheet formula injection (cells starting with = + - @ tab or CR). */
    private function safe(mixed $value): mixed
    {
        if (is_string($value) && $value !== '' && in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'" . $value;
        }

        return $value;
    }

    // ─── Report builders: [headers, rows] ─────────────────────────────────────

    private function pastors(): array
    {
        $rows = DB::table('pastors as p')
            ->leftJoin('users as u', 'u.id', '=', 'p.user_id')
            ->leftJoin('zones as z', 'z.id', '=', 'p.zone_id')
            ->leftJoin('regions as r', 'r.id', '=', DB::raw('COALESCE(p.region_id, z.region_id)'))
            ->whereNull('p.deleted_at')->orderBy('r.name')->orderBy('z.code')
            ->selectRaw("p.code, CONCAT_WS(' ', p.title, p.name, p.surname) as pastor, u.email, COALESCE(r.name,'—') as region,
                COALESCE(z.code,'—') as zone_code, COALESCE(z.name,'—') as zone,
                IF(p.is_general_overseer,'Yes','No') as general_overseer, IF(p.is_regional_leader,'Yes','No') as regional_leader,
                IF(p.is_zone_pastor,'Yes','No') as zone_pastor, p.ordained_date,
                (SELECT COUNT(*) FROM members m WHERE m.zone_id = p.zone_id AND m.deleted_at IS NULL AND m.status='active') as active_members_in_zone")
            ->get();

        return [['Code', 'Pastor', 'Email', 'Region', 'Zone code', 'Zone', 'General overseer', 'Regional leader', 'Zone pastor', 'Ordained', 'Active members in zone'], $rows->all()];
    }

    private function zones(StatsService $s): array
    {
        return [['Region', 'Zone code', 'Zone', 'Active members', 'Pastors', 'Home groups', 'Income YTD', 'Last report'], $s->zoneSummary()->all()];
    }

    private function members(): array
    {
        $rows = DB::table('members as m')
            ->leftJoin('users as u', 'u.id', '=', 'm.user_id')
            ->leftJoin('zones as z', 'z.id', '=', 'm.zone_id')
            ->leftJoin('regions as r', 'r.id', '=', 'z.region_id')
            ->leftJoin('home_groups as h', 'h.id', '=', 'm.home_group_id')
            ->whereNull('m.deleted_at')->orderBy('r.name')->orderBy('z.code')->orderBy('m.surname')
            ->selectRaw("m.member_code, m.name, m.surname, u.email, COALESCE(r.name,'—') as region, COALESCE(z.name,'—') as zone,
                COALESCE(h.name,'—') as home_group, m.status, IF(m.is_baptised,'Yes','No') as baptised, m.membership_date")
            ->get();

        return [['Member code', 'Name', 'Surname', 'Email', 'Region', 'Zone', 'Home group', 'Status', 'Baptised', 'Member since'], $rows->all()];
    }

    private function memberGrowth(StatsService $s): array
    {
        $g = $s->memberGrowth(24);
        $rows = [];
        foreach ($g['labels'] as $i => $label) {
            $rows[] = [$label, $g['new'][$i], $g['total'][$i]];
        }

        return [['Month', 'New members', 'Total members'], $rows];
    }

    private function financial(StatsService $s, $from, $to): array
    {
        $rows = $s->incomeByType($from, $to)->map(fn ($r) => [$r->label, $r->total])->all();
        $rows[] = ['TOTAL', $s->income($from, $to)];

        return [['Contribution type', 'Total (' . $from->toDateString() . ' to ' . $to->toDateString() . ')'], $rows];
    }

    private function contributions(StatsService $s, $from, $to, ?int $regionId): array
    {
        return [['Region', 'Zone code', 'Zone', 'Tithes', 'Offerings', 'Seeds', 'Building fund', 'Missions', 'Partnership', 'Other', 'Total', 'Contributors'],
            $s->contributionsByZone($from, $to, $regionId)->all()];
    }

    private function contributors(StatsService $s, string $type, $from, $to, ?int $regionId): array
    {
        return [['Person', 'Email', 'Zone', 'Region', 'Payments', 'Total', 'Last paid'], $s->contributors($type, $from, $to, $regionId)->all()];
    }

    private function payments($from, $to, ?int $regionId): array
    {
        $rows = DB::table('payments as p')
            ->join('users as u', 'u.id', '=', 'p.user_id')
            ->leftJoin('zones as z', 'z.id', '=', 'p.zone_id')
            ->leftJoin('regions as r', 'r.id', '=', 'z.region_id')
            ->whereNull('p.deleted_at')->whereBetween(DB::raw('COALESCE(p.paid_at, p.created_at)'), [$from, $to])
            ->when($regionId, fn ($q) => $q->where('z.region_id', $regionId))
            ->orderByDesc('p.created_at')
            ->selectRaw("p.receipt_number, p.reference, u.name, COALESCE(z.name,'—') as zone, COALESCE(r.name,'—') as region,
                p.type, p.amount, p.currency, p.method, p.status, p.paid_at, p.transaction_id,
                IF(p.gateway IS NULL, 'counter', 'online') as source, p.client_reference")
            ->get();

        return [['Receipt', 'Reference', 'Payer', 'Zone', 'Region', 'Type', 'Amount', 'Currency', 'Method', 'Status', 'Paid at', 'Transaction ID', 'Source', 'Online reference'], $rows->all()];
    }

    private function registrations(?int $eventId): array
    {
        $rows = DB::table('event_registrations as er')
            ->join('events as e', 'e.id', '=', 'er.event_id')
            ->join('users as u', 'u.id', '=', 'er.user_id')
            ->leftJoin('zones as z', 'z.id', '=', 'u.zone_id')
            ->when($eventId, fn ($q) => $q->where('er.event_id', $eventId))
            ->orderBy('e.starts_at')->orderBy('er.created_at')
            ->selectRaw("e.title, e.starts_at, er.reference_number, u.name, u.email, u.phone, COALESCE(z.name,'—') as zone,
                er.status, er.amount_due, er.amount_paid, er.created_at")
            ->get();

        return [['Event', 'Starts', 'Reference', 'Name', 'Email', 'Phone', 'Zone', 'Status', 'Amount due', 'Amount paid', 'Registered'], $rows->all()];
    }

    private function events(): array
    {
        $rows = DB::table('events as e')->whereNull('e.deleted_at')->orderByDesc('e.starts_at')
            ->selectRaw("e.title, e.type, e.status, e.starts_at, e.venue_name, e.capacity,
                (SELECT COUNT(*) FROM event_registrations x WHERE x.event_id = e.id AND x.status <> 'cancelled') as registered,
                (SELECT COUNT(*) FROM event_registrations x WHERE x.event_id = e.id AND x.status = 'attended') as attended,
                (SELECT COALESCE(SUM(x.amount_paid),0) FROM event_registrations x WHERE x.event_id = e.id) as collected")
            ->get();

        return [['Event', 'Type', 'Status', 'Starts', 'Venue', 'Capacity', 'Registered', 'Attended', 'Collected'], $rows->all()];
    }
}
