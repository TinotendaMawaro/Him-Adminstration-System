@php
    $all = $this->getRows();
    $rows = $all->take($this->limit());
    $money = fn ($v) => '$' . number_format((float) $v, 2);
    $export = $this->exportUrl();
@endphp

<x-filament-panels::page>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="w-full lg:max-w-4xl">{{ $this->form }}</div>
        @if ($export)
            <x-filament::button tag="a" :href="$export" icon="heroicon-o-arrow-down-tray" color="gray">Export CSV</x-filament::button>
        @endif
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
        <x-filament::section><div class="text-sm text-gray-500 dark:text-gray-400">People who gave</div><div class="text-2xl font-bold">{{ number_format($all->count()) }}</div></x-filament::section>
        <x-filament::section><div class="text-sm text-gray-500 dark:text-gray-400">Total given</div><div class="text-2xl font-bold">{{ $money($all->sum('total')) }}</div></x-filament::section>
        <x-filament::section><div class="text-sm text-gray-500 dark:text-gray-400">Average per person</div><div class="text-2xl font-bold">{{ $all->count() ? $money($all->sum('total') / $all->count()) : '$0.00' }}</div></x-filament::section>
    </div>

    <x-filament::section>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
                        <th class="py-2 pr-4">#</th><th class="py-2 pr-4">Person</th><th class="px-3 py-2">Zone</th><th class="px-3 py-2">Region</th>
                        <th class="px-3 py-2 text-right">Gifts</th><th class="px-3 py-2 text-right">Total</th><th class="px-3 py-2 text-right">Last gift</th>
                    </tr>
                </thead>
                <tbody>
                @forelse ($rows as $i => $r)
                    <tr class="border-b border-gray-100 dark:border-white/5">
                        <td class="py-2 pr-4 text-gray-400">{{ $i + 1 }}</td>
                        <td class="py-2 pr-4"><div class="font-medium">{{ $r->person }}</div><div class="text-xs text-gray-400">{{ $r->email }}</div></td>
                        <td class="px-3 py-2">{{ $r->zone }}</td>
                        <td class="px-3 py-2">{{ $r->region }}</td>
                        <td class="px-3 py-2 text-right tabular-nums">{{ $r->payments }}</td>
                        <td class="px-3 py-2 text-right font-semibold tabular-nums">{{ $money($r->total) }}</td>
                        <td class="px-3 py-2 text-right text-gray-500">{{ \Carbon\Carbon::parse($r->last_paid)->format('d M Y') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="py-10 text-center text-gray-500">No receipted gifts match these filters yet.</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
        @if ($all->count() > $this->limit())
            <p class="mt-3 text-xs text-gray-500">Showing the top {{ $this->limit() }} of {{ number_format($all->count()) }} givers. Export the CSV for the full list.</p>
        @endif
    </x-filament::section>
</x-filament-panels::page>
