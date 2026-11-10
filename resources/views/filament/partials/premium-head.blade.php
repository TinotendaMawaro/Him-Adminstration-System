<script src="/js/him-privacy.js" defer></script>
<script src="/js/him-history.js" defer></script>
<style>
    :root { --portal-accent: {{ $accent }}; }
    /* Premium finish: softer cards, crisper tables, branded sidebar accent */
    .fi-section, .fi-wi-stats-overview-stat, .fi-ta-ctn { border-radius: 14px !important; }
    .fi-wi-stats-overview-stat { box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.12); }
    .fi-wi-stats-overview-stat-value { letter-spacing: -.02em; font-weight: 700; }
    .fi-sidebar-item-active > a, .fi-sidebar-item.fi-active > a { box-shadow: inset 3px 0 0 var(--portal-accent); }
    .fi-header-heading { letter-spacing: -.02em; font-weight: 700; }
    .fi-ta-header-cell { text-transform: uppercase; font-size: .68rem; letter-spacing: .06em; }
    .fi-ta-row:hover { background: rgba(0,0,0,.015); }
    .fi-topbar { backdrop-filter: saturate(180%) blur(10px); }
    @media print { .fi-sidebar, .fi-topbar { display: none !important; } }
</style>
<script>
    /*
     * Browser autofill / password managers can fill a field without firing an input event, so Livewire never
     * learns about the value and the form is submitted empty ("The email address field is required").
     * Re-announce every filled field just before the form submits (capture phase, so we run first).
     */
    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form || !form.querySelectorAll) return;
        form.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea').forEach(function (el) {
            if (el.value !== '') {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }, true);
</script>
