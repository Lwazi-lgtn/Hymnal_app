// Bump this any time index.html, styles.css, app.js, or the static asset
// list changes. The browser only re-fetches and re-caches files when
// CACHE_NAME itself changes — keeping the same name means updates never
// reach devices that already have the app installed/cached.
const CACHE_NAME = "oac-hymnal-v18";

const urlsToCache = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./hymns.json",
    "./hymns-description.json",
    "./manifest.json",
    "./app_pic.png"   // matches the icon filename currently in manifest.json
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    // hymns.json gets network-first treatment so content edits show up
    // right away for visitors with a connection, falling back to cache
    // when offline.
    if (url.pathname.endsWith("hymns.json")) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Everything else stays cache-first for fast, reliable offline loads.
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});