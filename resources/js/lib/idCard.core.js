/*
 * Heartfelt International Ministries — ID card renderer.
 *
 * One vanilla script shared by the React portals (members, pastors, partners, HODs) and the Filament staff portals
 * (master, finance, events). `scripts/build-idcard.mjs` bundles it with the `qrcode-generator` library into
 * public/js/him-idcard.js. The card is drawn as a single SVG (so it is sharp at any size), and can be downloaded as
 * PNG or SVG, or printed at credit-card size (85.6 × 54 mm).
 *
 *   const card = await HIMCard.prepare(data);   // data = GET /api/id-card  (loads the logo + photo)
 *   HIMCard.mount(el, card);                    // show front + back
 *   HIMCard.downloadPng(card, 'name');  HIMCard.downloadSvg(card, 'name');  HIMCard.print(card);
 */
(function (root) {
    'use strict';

    var W = 856, H = 540; // 85.6 x 54 mm at 10 px per mm
    var NAVY = '#0f2744', NAVY2 = '#1e3a5f', GOLD = '#c9a84c', GOLD2 = '#e8cf8a';

    var THEMES = {
        member:  { accent: GOLD,      label: 'MEMBER' },
        partner: { accent: '#7c9cff', label: 'PARTNER' },
        hod:     { accent: '#4fd1a5', label: 'DEPARTMENT HEAD' },
        pastor:  { accent: '#f08a5d', label: 'PASTOR' },
        staff:   { accent: '#b794f4', label: 'STAFF' },
    };

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function initials(name) {
        var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        return ((parts[0] || '')[0] || '') + ((parts.length > 1 ? parts[parts.length - 1][0] : '') || '');
    }

    /** The QR code as SVG <rect>s (drawn inside a given square), no external image, always crisp. */
    function qrPaths(text, x, y, size) {
        var qr = root.qrcode(0, 'M');
        qr.addData(String(text));
        qr.make();
        var n = qr.getModuleCount(), cell = size / n, d = '';
        for (var r = 0; r < n; r++) {
            for (var c = 0; c < n; c++) {
                if (qr.isDark(r, c)) {
                    d += 'M' + (x + c * cell).toFixed(2) + ' ' + (y + r * cell).toFixed(2) + 'h' + (cell + 0.4).toFixed(2) + 'v' + (cell + 0.4).toFixed(2) + 'h-' + (cell + 0.4).toFixed(2) + 'z';
                }
            }
        }
        return '<path d="' + d + '" fill="#0b1b30"/>';
    }

    function field(x, y, label, value, accent) {
        return '<text x="' + x + '" y="' + y + '" font-family="Arial, Helvetica, sans-serif" font-size="17" letter-spacing="2.5" fill="' + accent + '" font-weight="700">' + esc(label) + '</text>' +
            '<text x="' + x + '" y="' + (y + 34) + '" font-family="Arial, Helvetica, sans-serif" font-size="29" fill="#ffffff" font-weight="600">' + esc(value || '—') + '</text>';
    }

    function front(card) {
        var t = THEMES[card.kind] || THEMES.member, a = t.accent;
        var name = card.full_name || '';
        var nameSize = name.length > 26 ? 34 : name.length > 20 ? 40 : 48;
        var photo = card.photo_data
            ? '<clipPath id="ph"><circle cx="118" cy="268" r="74"/></clipPath><image href="' + card.photo_data + '" x="44" y="194" width="148" height="148" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph)"/>'
            : '<circle cx="118" cy="268" r="74" fill="' + NAVY2 + '"/><text x="118" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="' + a + '">' + esc(initials(name).toUpperCase()) + '</text>';

        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + NAVY + '"/><stop offset="1" stop-color="' + NAVY2 + '"/></linearGradient>' +
            '<linearGradient id="gd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + GOLD2 + '"/></linearGradient></defs>' +
            '<rect width="' + W + '" height="' + H + '" rx="34" fill="url(#bg)"/>' +
            '<circle cx="780" cy="40" r="210" fill="' + a + '" opacity="0.07"/><circle cx="60" cy="520" r="170" fill="#ffffff" opacity="0.04"/>' +
            '<rect x="0" y="0" width="' + W + '" height="12" rx="6" fill="url(#gd)"/>' +
            // header
            (card.logo_data ? '<rect x="36" y="34" width="86" height="86" rx="18" fill="#ffffff"/><image href="' + card.logo_data + '" x="42" y="40" width="74" height="74" preserveAspectRatio="xMidYMid meet"/>' : '') +
            '<text x="140" y="72" font-family="Georgia, serif" font-size="30" fill="#ffffff" font-weight="700" letter-spacing="1">HEARTFELT</text>' +
            '<text x="140" y="104" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="' + GOLD2 + '" letter-spacing="3.5">INTERNATIONAL MINISTRIES</text>' +
            '<rect x="' + (W - 36 - 190) + '" y="46" width="190" height="42" rx="21" fill="none" stroke="' + a + '" stroke-width="2.5"/>' +
            '<text x="' + (W - 36 - 95) + '" y="74" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="2.5" fill="' + a + '">' + esc(card.role_label ? String(card.role_label).toUpperCase() : t.label) + '</text>' +
            // photo + name
            '<circle cx="118" cy="268" r="80" fill="none" stroke="url(#gd)" stroke-width="5"/>' + photo +
            '<text x="226" y="236" font-family="Georgia, serif" font-size="' + nameSize + '" fill="#ffffff" font-weight="700">' + esc(name) + '</text>' +
            '<rect x="226" y="252" width="90" height="4" rx="2" fill="url(#gd)"/>' +
            field(226, 300, 'ZONE', card.zone, a) +
            field(226, 380, 'DATE OF BIRTH', card.dob, a) +
            field(226, 460, (card.number_label || 'MEMBER NO.').toUpperCase(), card.number, a) +
            // QR
            '<rect x="' + (W - 36 - 214) + '" y="206" width="214" height="214" rx="20" fill="#ffffff"/>' +
            qrPaths(card.verify_url, W - 36 - 214 + 16, 222, 182) +
            '<text x="' + (W - 36 - 107) + '" y="452" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" letter-spacing="2.5" fill="' + GOLD2 + '">SCAN TO VERIFY</text>' +
            '<rect x="0" y="' + (H - 14) + '" width="' + W + '" height="14" fill="url(#gd)" opacity="0.9"/>' +
            '</svg>';
    }

    function back(card) {
        var t = THEMES[card.kind] || THEMES.member, a = t.accent;
        // Short lines: the QR code sits on the right, so the text must stay in the left 500px.
        var lines = [
            'This card identifies the holder as a',
            (card.role_label || t.label).toLowerCase() + ' of Heartfelt International Ministries.',
            'It remains the property of the ministry.',
            'To confirm it is genuine, scan the code',
            'or open the address below.',
        ];

        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
            '<defs><linearGradient id="bgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + NAVY2 + '"/><stop offset="1" stop-color="' + NAVY + '"/></linearGradient>' +
            '<linearGradient id="gdb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + GOLD2 + '"/></linearGradient></defs>' +
            '<rect width="' + W + '" height="' + H + '" rx="34" fill="url(#bgb)"/>' +
            '<rect x="44" y="92" width="90" height="4" rx="2" fill="url(#gdb)"/>' +
            '<rect x="0" y="0" width="' + W + '" height="12" rx="6" fill="url(#gdb)"/>' +
            '<text x="44" y="64" font-family="Georgia, serif" font-size="26" fill="#ffffff" font-weight="700">Heartfelt International Ministries</text>' +
            '<text x="44" y="150" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#d6dfeb">' +
            lines.map(function (l, i) { return '<tspan x="44" dy="' + (i ? 30 : 0) + '">' + esc(l) + '</tspan>'; }).join('') + '</text>' +
            '<text x="44" y="330" font-family="Arial, Helvetica, sans-serif" font-size="15" letter-spacing="2.5" fill="' + a + '" font-weight="700">VERIFY</text>' +
            '<text x="44" y="358" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#ffffff">' + esc(String(card.verify_url || '').replace(/^https?:\/\//, '').slice(0, 52)) + '</text>' +
            '<text x="44" y="410" font-family="Arial, Helvetica, sans-serif" font-size="15" letter-spacing="2.5" fill="' + a + '" font-weight="700">CONTACT</text>' +
            '<text x="44" y="438" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#ffffff">' + esc(card.support_email || '') + '</text>' +
            '<text x="44" y="486" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#9fb0c6">Issued ' + esc(card.issued || '') + '  ·  ' + esc((card.number_label || 'No.') + ' ' + (card.number || '')) + '</text>' +
            '<rect x="' + (W - 44 - 250) + '" y="170" width="250" height="250" rx="22" fill="#ffffff"/>' +
            qrPaths(card.verify_url, W - 44 - 250 + 18, 188, 214) +
            '<rect x="0" y="' + (H - 14) + '" width="' + W + '" height="14" fill="url(#gdb)" opacity="0.9"/>' +
            '</svg>';
    }

    function toDataUri(url) {
        if (!url) return Promise.resolve(null);
        return fetch(url, { credentials: 'same-origin' })
            .then(function (r) { if (!r.ok) throw new Error('image'); return r.blob(); })
            .then(function (b) { return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.readAsDataURL(b); }); })
            .catch(function () { return null; });
    }

    var logoCache = null;

    /** Loads the logo + photo as data URIs (an SVG drawn to a canvas cannot fetch images itself) and renders both sides. */
    function prepare(data) {
        var card = Object.assign({}, data);
        logoCache = logoCache || toDataUri(data.logo_url || '/images/logo.jpeg');
        return Promise.all([logoCache, toDataUri(data.photo_url)]).then(function (r) {
            card.logo_data = r[0];
            card.photo_data = r[1];
            card.frontSvg = front(card);
            card.backSvg = back(card);
            return card;
        });
    }

    function mount(el, card) {
        el.innerHTML = '<div class="him-card-side">' + card.frontSvg + '</div><div class="him-card-side">' + card.backSvg + '</div>';
        Array.prototype.forEach.call(el.querySelectorAll('svg'), function (s) { s.style.width = '100%'; s.style.height = 'auto'; s.style.display = 'block'; s.style.borderRadius = '14px'; s.style.boxShadow = '0 10px 30px rgba(15,39,68,.25)'; });
    }

    function save(blob, filename) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
    }

    function svgToImage(svg) {
        return new Promise(function (res, rej) {
            var img = new Image();
            img.onload = function () { res(img); };
            img.onerror = rej;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });
    }

    /** One PNG with the front above the back, 3x resolution (print quality). */
    function downloadPng(card, name) {
        var scale = 3, gap = 40;
        return Promise.all([svgToImage(card.frontSvg), svgToImage(card.backSvg)]).then(function (imgs) {
            var c = document.createElement('canvas');
            c.width = W * scale;
            c.height = (H * 2 + gap) * scale;
            var g = c.getContext('2d');
            g.scale(scale, scale);
            g.fillStyle = '#e9edf3';
            g.fillRect(0, 0, W, H * 2 + gap);
            g.drawImage(imgs[0], 0, 0, W, H);
            g.drawImage(imgs[1], 0, H + gap, W, H);
            return new Promise(function (res) { c.toBlob(function (b) { save(b, (name || 'id-card') + '.png'); res(); }, 'image/png'); });
        });
    }

    function downloadSvg(card, name) {
        // Front and back in one file, stacked.
        var both = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + (H * 2 + 40) + '" width="' + W + '" height="' + (H * 2 + 40) + '">' +
            '<g>' + card.frontSvg + '</g><g transform="translate(0 ' + (H + 40) + ')">' + card.backSvg + '</g></svg>';
        save(new Blob([both], { type: 'image/svg+xml' }), (name || 'id-card') + '.svg');
    }

    /** Opens a clean print view: front and back at real credit-card size (85.6 x 54 mm). */
    function print(card) {
        var w = window.open('', '_blank', 'width=900,height=700');
        if (!w) { alert('Allow pop-ups to print your card.'); return; }
        w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>ID card</title><style>' +
            '@page{size:A4;margin:12mm}body{margin:0;font-family:Arial,sans-serif;color:#0f2744}' +
            '.sheet{display:flex;flex-direction:column;align-items:center;gap:10mm;padding-top:6mm}' +
            '.sheet svg{width:85.6mm;height:54mm;display:block;-webkit-print-color-adjust:exact;print-color-adjust:exact;border-radius:3mm}' +
            'p{font-size:11px;color:#667;text-align:center;margin:0}@media print{p{display:none}}</style></head><body><div class="sheet">' +
            card.frontSvg + card.backSvg + '<p>Print at 100% scale. Cut along the card edge, fold front and back together and laminate.</p></div>' +
            '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>');
        w.document.close();
    }

    root.HIMCard = { prepare: prepare, mount: mount, downloadPng: downloadPng, downloadSvg: downloadSvg, print: print, frontSvg: front, backSvg: back };
})(typeof window !== 'undefined' ? window : this);
