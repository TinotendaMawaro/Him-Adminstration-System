@php
    $rows = array_filter([
        [$c['login_label'] ?? 'Login', $c['login'] ?? '', false],
        (!empty($c['code']) && ($c['code'] !== ($c['login'] ?? null))) ? ['Code', $c['code'], false] : null,
        ['Temporary password', $c['password'] ?? '', true],
    ]);
    $all = ($c['name'] ?? '') . "\n" . ($c['login_label'] ?? 'Login') . ': ' . ($c['login'] ?? '') . (!empty($c['code']) && $c['code'] !== ($c['login'] ?? null) ? "\nCode: " . $c['code'] : '') . "\nTemporary password: " . ($c['password'] ?? '');
@endphp

<div x-data="{ done: null, copy(text, key) { navigator.clipboard.writeText(text).then(() => { this.done = key; setTimeout(() => this.done = null, 1800); }); } }" class="space-y-4" data-sensitive>
    <div class="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
        <p class="text-lg font-bold text-gray-950 dark:text-white">{{ $c['name'] ?? '' }}</p>
        <p class="text-sm text-gray-500">{{ $c['role'] ?? '' }}@if(!empty($c['zone'])) · {{ $c['zone'] }}@endif</p>
    </div>

    @foreach ($rows as $i => [$label, $value, $secret])
        <div>
            <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $label }}</p>
            <div class="flex items-center gap-2">
                <code class="flex-1 select-all rounded-lg bg-gray-100 px-3 py-2.5 font-mono text-base font-bold tracking-wide text-gray-950 dark:bg-white/10 dark:text-white">{{ $value }}</code>
                <button type="button" x-on:click="copy(@js($value), {{ $i }})"
                        class="rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500">
                    <span x-show="done !== {{ $i }}">Copy</span><span x-show="done === {{ $i }}" x-cloak>Copied ✓</span>
                </button>
            </div>
        </div>
    @endforeach

    <button type="button" x-on:click="copy(@js($all), 'all')" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/20 dark:text-gray-200">
        <span x-show="done !== 'all'">Copy everything</span><span x-show="done === 'all'" x-cloak>Copied ✓</span>
    </button>

    <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
        <p class="font-bold">Protect this information</p>
        <p class="mt-1">These details are shown once and are not stored. Hand them over privately, never by screenshot or open message. The person must change the password on first sign-in. Every other device they were signed in on has been signed out.</p>
    </div>
</div>
