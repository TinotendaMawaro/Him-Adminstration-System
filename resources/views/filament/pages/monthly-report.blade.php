@php
    $rows = $this->rows();
    $expected = $this->expected();
    $sum = fn ($k) => $rows->sum($k);
    $fmt = fn ($n) => number_format((float) $n, 2);
    $zonesFiled = $rows->where('reports_submitted', '>', 0)->count();
@endphp
<x-filament-panels::page>
    <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="w-64">{{ $this->form }}</div>
        <x-filament::button tag="a" :href="$this->exportUrl()" icon="heroicon-o-arrow-down-tray">Download CSV</x-filament::button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @foreach ([
            ['Active members', number_format($sum('active_members')), $sum('new_members') . ' new this month'],
            ['Income recorded', $fmt($sum('recorded_income')), 'completed payments'],
            ['Income reported by pastors', $fmt($sum('reported_income')), 'from weekly reports'],
            ['Reports filed', $sum('reports_submitted') . ' / ' . ($rows->count() * $expected), $zonesFiled . ' of ' . $rows->count() . ' zones reported · ' . $sum('reports_late') . ' late'],
        ] as [$label, $value, $hint])
            <x-filament::section>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ $label }}</div>
                <div class="mt-1 text-2xl font-semibold">{{ $value }}</div>
                <div class="mt-1 text-xs text-gray-500">{{ $hint }}</div>
            </x-filament::section>
        @endforeach
    </div>

    <x-filament::section heading="Zones" :description="'Each zone is expected to file ' . $expected . ' weekly reports in ' . $this->monthDate()->format('F Y') . '. Highlighted income differences mean the pastor’s report and the payments recorded in the system disagree.'">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b text-left text-xs uppercase tracking-wide text-gray-500 dark:border-white/10">
                        <th class="py-2 pr-3">Region</th><th class="py-2 pr-3">Zone</th><th class="py-2 pr-3">Pastor</th>
                        <th class="py-2 pr-3 text-right">Members</th><th class="py-2 pr-3 text-right">New</th>
                        <th class="py-2 pr-3 text-right">Reports</th><th class="py-2 pr-3 text-right">Avg attend.</th>
                        <th class="py-2 pr-3 text-right">First-timers</th><th class="py-2 pr-3 text-right">Converts</th>
                        <th class="py-2 pr-3 text-right">Reported</th><th class="py-2 text-right">Recorded</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($rows as $r)
                        @php $gap = abs((float) $r->reported_income - (float) $r->recorded_income) > 0.5 && ($r->reported_income > 0 || $r->recorded_income > 0); @endphp
                        <tr class="border-b last:border-0 dark:border-white/5">
                            <td class="py-2 pr-3">{{ $r->region }}</td>
                            <td class="py-2 pr-3 font-medium">{{ $r->zone_code }} · {{ $r->zone }}</td>
                            <td class="py-2 pr-3">{{ $r->pastor ?? '—' }}</td>
                            <td class="py-2 pr-3 text-right">{{ $r->active_members }}</td>
                            <td class="py-2 pr-3 text-right">{{ $r->new_members }}</td>
                            <td class="py-2 pr-3 text-right {{ $r->reports_submitted < $expected ? 'text-danger-600 font-semibold' : '' }}">{{ $r->reports_submitted }}/{{ $expected }}@if($r->reports_late) <span class="text-xs text-warning-600">({{ $r->reports_late }} late)</span>@endif</td>
                            <td class="py-2 pr-3 text-right">{{ $r->avg_attendance }}</td>
                            <td class="py-2 pr-3 text-right">{{ $r->first_timers }}</td>
                            <td class="py-2 pr-3 text-right">{{ $r->conversions }}</td>
                            <td class="py-2 pr-3 text-right {{ $gap ? 'text-warning-600 font-semibold' : '' }}">{{ $fmt($r->reported_income) }}</td>
                            <td class="py-2 text-right {{ $gap ? 'text-warning-600 font-semibold' : '' }}">{{ $fmt($r->recorded_income) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="11" class="py-6 text-center text-gray-500">No zones yet.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>
</x-filament-panels::page>
