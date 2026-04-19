const CACHE_NAME = "coloring-app-v1.3";

const ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/img/part.jpg",
    "/img/bird.jpg",
    "/img/tiger.jpg",
    "/img/lion.jpg"
];

// Install
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Fetch (offline)
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});