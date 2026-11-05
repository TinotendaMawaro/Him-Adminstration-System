<x-filament-panels::page>
    <script src="{{ asset('js/him-idcard.js') }}?v={{ filemtime(public_path('js/him-idcard.js')) }}"></script>

    <div x-data="{
            card: null, busy: false, error: null,
            async init() {
                try {
                    this.card = await HIMCard.prepare(@js($this->card()));
                } catch (e) { this.error = 'The card could not be drawn.'; }
            },
            async png() { this.busy = true; try { await HIMCard.downloadPng(this.card, 'HIM-ID-' + this.card.number); } finally { this.busy = false; } },
        }" class="space-y-6">

        <x-filament::section heading="Your Heartfelt ID card" description="Scan the QR code to confirm the card is genuine. Download it to keep on your phone, or print it at credit-card size.">
            <div class="mb-5 flex flex-wrap gap-3">
                <x-filament::button x-on:click="png()" x-bind:disabled="!card || busy" icon="heroicon-o-arrow-down-tray">Download PNG</x-filament::button>
                <x-filament::button color="gray" x-on:click="HIMCard.downloadSvg(card, 'HIM-ID-' + card.number)" x-bind:disabled="!card" icon="heroicon-o-photo">Download SVG</x-filament::button>
                <x-filament::button color="gray" x-on:click="HIMCard.print(card)" x-bind:disabled="!card" icon="heroicon-o-printer">Print</x-filament::button>
            </div>
            <p x-show="error" x-text="error" class="text-sm text-danger-600"></p>
            <div x-effect="if (card) HIMCard.mount($el, card)" class="grid gap-6 md:grid-cols-2" style="max-width: 980px;"></div>
        </x-filament::section>
    </div>
</x-filament-panels::page>
