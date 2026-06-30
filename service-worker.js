const CACHE_NAME = "oac-hymnal-v1";

const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
    "/hymns.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});