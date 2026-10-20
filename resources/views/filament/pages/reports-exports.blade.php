<x-filament-panels::page>
    <x-filament::section heading="Filters" description="These apply to the financial reports. People and event reports are always complete.">
        {{ $this->form }}
    </x-filament::section>

    @foreach ($this->catalogue() as $group => $reports)
        <div>
            <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $group }}</h3>
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                @foreach ($reports as $r)
                    <x-filament::section>
                        <div class="flex h-full flex-col justify-between gap-4">
                            <div>
                                <div class="font-semibold">{{ $r['title'] }}</div>
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $r['description'] }}</p>
                            </div>
                            <div>
                                <x-filament::button tag="a" :href="$this->url($r['key'], $r['scoped'])" icon="heroicon-o-arrow-down-tray" size="sm">Download CSV</x-filament::button>
                            </div>
                        </div>
                    </x-filament::section>
                @endforeach
            </div>
        </div>
    @endforeach

    <p class="text-xs text-gray-500">Files are generated live from the database, open directly in Excel, and every download is recorded in the audit log.</p>
</x-filament-panels::page>
