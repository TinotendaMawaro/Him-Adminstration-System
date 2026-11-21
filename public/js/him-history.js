/*
 * Hover history: rest the mouse on any element marked  data-history-user="<user id>"  and a card slides in with that person's
 * history (joined, zone moves, appointments, sign-in resets...). One script for the web portals AND the head-office console:
 *   - in the portals the request goes to /api/people/{id}/history with the signed-in person's token,
 *   - in the console it goes to /admin/people-history/{id} with the console session.
 * The server decides who may see whom; a refusal simply shows nothing.
 */
(function () {
    if (window.__himHistory) { return; }
    window.__himHistory = true;
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) { return; }   // phones have no hover

    var css = '' +
        '.hh-card{position:fixed;z-index:2147483000;width:310px;max-width:calc(100vw - 16px);border-radius:16px;background:#fff;color:#0f172a;font:13px/1.4 Inter,system-ui,sans-serif;' +
        'box-shadow:0 24px 60px -12px rgba(15,23,42,.35),0 0 0 1px rgba(15,23,42,.08);opacity:0;transform:translateY(8px) scale(.97);pointer-events:none;' +
        'transition:opacity .22s ease,transform .26s cubic-bezier(.2,.9,.3,1.1);overflow:hidden}' +
        'html.dark .hh-card{background:#18181b;color:#f4f4f5;box-shadow:0 24px 60px -12px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.1)}' +
        '.hh-card.on{opacity:1;transform:none;pointer-events:auto}' +
        '.hh-head{display:flex;gap:10px;align-items:center;padding:14px 14px 10px}' +
        '.hh-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#2f6bff);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden}' +
        '.hh-av img{width:100%;height:100%;object-fit:cover}' +
        '.hh-name{font-weight:700;font-size:14px}.hh-sub{color:#64748b;font-size:12px}' +
        '.hh-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}' +
        '.hh-chip{border-radius:999px;background:rgba(100,116,139,.12);padding:2px 9px;font-size:11px;font-weight:600}' +
        '.hh-list{max-height:260px;overflow:auto;padding:2px 14px 12px 14px;border-top:1px solid rgba(100,116,139,.18)}' +
        '.hh-item{position:relative;padding:9px 0 9px 20px;opacity:0;transform:translateY(6px);transition:opacity .3s ease,transform .3s ease}' +
        '.hh-card.on .hh-item{opacity:1;transform:none}' +
        '.hh-item:before{content:"";position:absolute;left:4px;top:15px;width:8px;height:8px;border-radius:50%;background:#2f6bff;box-shadow:0 0 0 3px rgba(47,107,255,.18)}' +
        '.hh-item:after{content:"";position:absolute;left:7.5px;top:26px;bottom:-9px;width:1px;background:rgba(100,116,139,.3)}' +
        '.hh-item:last-child:after{display:none}' +
        '.hh-t{font-weight:600}.hh-d{color:#64748b;font-size:12px}.hh-w{color:#94a3b8;font-size:11px}' +
        '.hh-sk{margin:14px;height:12px;border-radius:6px;background:linear-gradient(90deg,rgba(100,116,139,.15),rgba(100,116,139,.3),rgba(100,116,139,.15));background-size:200% 100%;animation:hh-sh 1.1s linear infinite}' +
        '@keyframes hh-sh{to{background-position:-200% 0}}' +
        '[data-history-user]{cursor:help}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var card = document.createElement('div'); card.className = 'hh-card'; card.setAttribute('role', 'tooltip'); document.body.appendChild(card);
    var cache = {}, showT, hideT, current = null, token = 0;

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function ago(iso) {
        if (!iso) { return ''; }
        var d = new Date(iso), diff = (Date.now() - d.getTime()) / 1000;
        if (diff < 3600) { return Math.max(1, Math.round(diff / 60)) + ' min ago'; }
        if (diff < 86400) { return Math.round(diff / 3600) + ' h ago'; }
        if (diff < 86400 * 30) { return Math.round(diff / 86400) + ' days ago'; }
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function fetchHistory(id) {
        if (cache[id] && Date.now() - cache[id].t < 60000) { return Promise.resolve(cache[id].v); }
        var t = null; try { t = localStorage.getItem('him_token'); } catch (e) { /* storage blocked */ }
        var req = t
            ? fetch('/api/people/' + id + '/history', { headers: { Authorization: 'Bearer ' + t, Accept: 'application/json' } })
            : fetch('/admin/people-history/' + id, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        return req.then(function (r) { if (!r.ok) { throw new Error('denied'); } return r.json(); }).then(function (j) { cache[id] = { t: Date.now(), v: j.data }; return j.data; });
    }

    function render(d) {
        var p = d.person, ini = (p.name || '?').split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
        var chips = [p.role, p.code, p.zone, p.home_group ? p.home_group + (p.home_group_role ? ' · ' + p.home_group_role : '') : null, p.department ? p.department + (p.department_role ? ' · ' + p.department_role : '') : null, p.since ? 'Since ' + p.since : null, p.last_sign_in ? 'Last seen ' + p.last_sign_in : null].filter(Boolean)
            .map(function (c) { return '<span class="hh-chip">' + esc(c) + '</span>'; }).join('');
        var items = d.events.map(function (e, i) {
            return '<div class="hh-item" style="transition-delay:' + (60 + i * 45) + 'ms"><div class="hh-t">' + esc(e.title) + '</div>' + (e.detail ? '<div class="hh-d">' + esc(e.detail) + '</div>' : '') + '<div class="hh-w">' + esc(ago(e.at)) + '</div></div>';
        }).join('');
        card.innerHTML = '<div class="hh-head"><div class="hh-av">' + (p.photo ? '<img alt="" src="' + esc(p.photo) + '">' : esc(ini)) + '</div><div><div class="hh-name">' + esc(p.name) + (p.active ? '' : ' (inactive)') + '</div><div class="hh-sub">History</div></div></div>' +
            '<div class="hh-chips">' + chips + '</div><div class="hh-list">' + (items || '<div class="hh-d" style="padding:10px 0">No history yet.</div>') + '</div>';
    }

    function place(el) {
        var r = el.getBoundingClientRect(), w = card.offsetWidth || 310, h = card.offsetHeight || 200;
        var x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
        var below = r.bottom + 8 + h <= window.innerHeight || r.top - 8 - h < 0;
        card.style.left = x + 'px';
        card.style.top = Math.max(8, below ? r.bottom + 8 : r.top - h - 8) + 'px';
    }

    function show(el) {
        var id = el.getAttribute('data-history-user'); if (!id) { return; }
        var my = ++token; current = el;
        card.innerHTML = '<div class="hh-sk" style="width:60%"></div><div class="hh-sk" style="width:85%"></div><div class="hh-sk" style="width:45%"></div>';
        place(el); card.classList.add('on');
        fetchHistory(id).then(function (d) {
            if (my !== token) { return; }
            card.classList.remove('on'); render(d); place(el);
            requestAnimationFrame(function () { requestAnimationFrame(function () { if (my === token) { card.classList.add('on'); } }); });
        }).catch(function () { if (my === token) { card.classList.remove('on'); } });
    }

    function hide() { token++; card.classList.remove('on'); current = null; }

    document.addEventListener('mouseover', function (e) {
        var el = e.target.closest && e.target.closest('[data-history-user]');
        if (el) { clearTimeout(hideT); if (el !== current) { clearTimeout(showT); showT = setTimeout(function () { show(el); }, 320); } }
        else if (e.target.closest && e.target.closest('.hh-card')) { clearTimeout(hideT); }
    });
    document.addEventListener('mouseout', function (e) {
        var from = e.target.closest && (e.target.closest('[data-history-user]') || e.target.closest('.hh-card'));
        if (!from) { return; }
        clearTimeout(showT); clearTimeout(hideT); hideT = setTimeout(hide, 180);
    });
    window.addEventListener('scroll', function () { if (current) { hide(); } }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hide(); } });
})();
