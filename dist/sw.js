/* Heartfelt service worker: makes the app open instantly and keep working with a weak connection.
 *  - hashed build files (/assets/*) and images: cache first (they never change under the same name)
 *  - page navigations: network first, falling back to the last good copy of the app shell when offline
 *  - /api, /admin, /finance, /events, /livewire and anything that is not a plain GET: never cached (always live, never stale or shared)
 */
const VERSION = "hm-v2";
const SHELL = ["/", "/icons/icon-192.png", "/images/logo.jpeg"];
const NEVER = /^\/(api|admin|finance|events|livewire|forgot-password|reset-password|pay|receipts|email|verify|storage)(\/|$)/;

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
    e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
    const req = e.request;
    const url = new URL(req.url);
    if (req.method !== "GET" || url.origin !== self.location.origin || NEVER.test(url.pathname)) return;

    if (req.mode === "navigate") {
        // Copy the response BEFORE handing it to the page (a body can only be read once), and only keep good pages.
        e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("/", copy)); } return res; }).catch(() => caches.match("/")));
        return;
    }

    if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/") || url.pathname.startsWith("/js/")) {
        e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })));
    }
});
