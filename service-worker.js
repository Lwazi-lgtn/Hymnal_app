// Bump this any time index.html, styles.css, app.js, or hymns.json change.
// The browser only re-fetches and re-caches files when CACHE_NAME itself
// changes — keeping the same name means updates never reach devices that
// already have the app installed/cached.
const CACHE_NAME = "oac-hymnal-v5";

const urlsToCache = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./hymns.json",
    "./manifest.json",
    "./app_pic.png"   // matches the icon filename currently in manifest.json
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            // Activate this new service worker immediately instead of
            // waiting for all tabs to close — otherwise updates can sit
            // "waiting" indefinitely on a page that's always open.
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
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});