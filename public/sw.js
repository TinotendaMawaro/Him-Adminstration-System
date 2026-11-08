/* Heartfelt service worker: makes the app open instantly and keep working with a weak connection.
 *  - hashed build files (/assets/*) and images: cache first (they never change under the same name)
 *  - page navigations: network first, falling back to the last good copy of the app shell when offline
 *  - /api, /admin, /finance, /events, /livewire and anything that is not a plain GET: never cached (always live, never stale or shared)
 */
const VERSION = "hm-v1";
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
        e.respondWith(fetch(req).then((res) => { caches.open(VERSION).then((c) => c.put("/", res.clone())); return res; }).catch(() => caches.match("/")));
        return;
    }

    if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/") || url.pathname.startsWith("/js/")) {
        e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone())); return res; })));
    }
});
