/*
 * Privacy shield for the web portals and the head-office console.
 *
 * Browsers cannot truly forbid screenshots (that is only possible inside the Android app, which blocks them at system level),
 * so this raises the bar where it can:
 *   - when the window or tab loses focus (screen-capture tools, switching apps, the Snipping Tool overlay) everything is blurred,
 *   - the Print Screen key wipes the clipboard and blurs the page,
 *   - elements marked  data-sensitive  (credentials, passwords) cannot be right-clicked or dragged and are hidden from print,
 *   - printing the whole page with Ctrl/Cmd+P hides sensitive elements.
 * It never blocks normal work: copy / paste of text and the ID-card print flow are unaffected.
 */
(function () {
    if (window.__himPrivacy) { return; }
    window.__himPrivacy = true;

    var css = '' +
        'html.hm-private body>*:not(.hm-priv-mask){filter:blur(22px) saturate(.6)!important;transition:filter .12s ease;pointer-events:none!important}' +
        '.hm-priv-mask{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(8,16,32,.55);color:#fff;font:600 16px Inter,system-ui,sans-serif;text-align:center;padding:24px}' +
        'html.hm-private .hm-priv-mask{display:flex}' +
        '@media print{[data-sensitive]{display:none!important}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    function mask() {
        if (document.querySelector('.hm-priv-mask')) { return; }
        var m = document.createElement('div'); m.className = 'hm-priv-mask';
        m.innerHTML = '<div>Hidden to protect personal information<br><span style="font-weight:400;opacity:.85;font-size:13px">Return to this window to continue</span></div>';
        document.body.appendChild(m);
    }
    function on() { mask(); document.documentElement.classList.add('hm-private'); }
    function off() { document.documentElement.classList.remove('hm-private'); }

    window.addEventListener('blur', on);
    window.addEventListener('focus', off);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { on(); } else { off(); } });

    document.addEventListener('keyup', function (e) {
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            try { navigator.clipboard.writeText(' '); } catch (x) { /* not allowed */ }
            on(); setTimeout(off, 1600);
        }
    });
    document.addEventListener('keydown', function (e) {
        // Windows + Shift + S / macOS Cmd + Shift + 3/4/5 are OS-level; the blur above is what helps there.
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && /^(s|3|4|5)$/i.test(e.key)) { on(); setTimeout(off, 1600); }
    });
    document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('[data-sensitive]')) { e.preventDefault(); } });
    document.addEventListener('dragstart', function (e) { if (e.target.closest && e.target.closest('[data-sensitive]')) { e.preventDefault(); } });
})();
