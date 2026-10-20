@php
    $rows = $this->getRows();
    $cols = ['tithes' => 'Tithes', 'offerings' => 'Offerings', 'seeds' => 'Seeds', 'building_fund' => 'Building', 'missions' => 'Missions', 'partnership' => 'Partnership', 'other' => 'Other'];
    $money = fn ($v) => '$' . number_format((float) $v, 2);
    $grand = $rows->sum('total');
@endphp

<x-filament-panels::page>
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="w-full md:max-w-xl">{{ $this->form }}</div>
        <x-filament::button tag="a" :href="$this->exportUrl()" icon="heroicon-o-arrow-down-tray" color="gray">Export CSV</x-filament::button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @foreach ([['Total', $grand], ['Tithes', $rows->sum('tithes')], ['Offerings', $rows->sum('offerings')], ['Seeds', $rows->sum('seeds')]] as [$label, $value])
            <x-filament::section>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ $label }}</div>
                <div class="text-2xl font-bold tracking-tight">{{ $money($value) }}</div>
            </x-filament::section>
        @endforeach
    </div>

    <x-filament::section :heading="'By zone and region'" description="Built automatically from receipted payments. Voided and pending payments are excluded.">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
                        <th class="py-2 pr-4">Zone</th>
                        @foreach ($cols as $label)<th class="px-3 py-2 text-right">{{ $label }}</th>@endforeach
                        <th class="px-3 py-2 text-right">Total</th>
                        <th class="px-3 py-2 text-right">Givers</th>
                    </tr>
                </thead>
                <tbody>
                @forelse ($rows->groupBy('region') as $region => $zones)
                    <tr class="bg-gray-50 font-semibold dark:bg-white/5">
                        <td class="py-2 pr-4">{{ $region }}</td>
                        @foreach ($cols as $key => $label)<td class="px-3 py-2 text-right">{{ $money($zones->sum($key)) }}</td>@endforeach
                        <td class="px-3 py-2 text-right">{{ $money($zones->sum('total')) }}</td>
                        <td class="px-3 py-2 text-right">{{ $zones->sum('contributors') }}</td>
                    </tr>
                    @foreach ($zones as $z)
                        <tr class="border-b border-gray-100 dark:border-white/5">
                            <td class="py-2 pl-4 pr-4 text-gray-600 dark:text-gray-300"><span class="font-mono text-xs text-gray-400">{{ $z->zone_code }}</span> {{ $z->zone }}</td>
                            @foreach ($cols as $key => $label)<td class="px-3 py-2 text-right tabular-nums">{{ (float) $z->$key ? $money($z->$key) : '—' }}</td>@endforeach
                            <td class="px-3 py-2 text-right font-medium tabular-nums">{{ (float) $z->total ? $money($z->total) : '—' }}</td>
                            <td class="px-3 py-2 text-right tabular-nums">{{ $z->contributors ?: '—' }}</td>
                        </tr>
                    @endforeach
                @empty
                    <tr><td colspan="{{ count($cols) + 3 }}" class="py-8 text-center text-gray-500">No zones found.</td></tr>
                @endforelse
                </tbody>
                <tfoot>
                    <tr class="border-t-2 border-gray-300 font-bold dark:border-white/20">
                        <td class="py-3 pr-4">Grand total</td>
                        @foreach ($cols as $key => $label)<td class="px-3 py-3 text-right">{{ $money($rows->sum($key)) }}</td>@endforeach
                        <td class="px-3 py-3 text-right">{{ $money($grand) }}</td>
                        <td class="px-3 py-3 text-right">{{ $rows->sum('contributors') }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </x-filament::section>
</x-filament-panels::page>
