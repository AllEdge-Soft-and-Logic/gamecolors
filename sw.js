const CACHE_NAME = "coloring-app-v1.5"; // 🔥 change version on every update

const ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/img/part.jpg",
    "/img/bird.jpg",
    "/img/tiger.jpg",
    "/img/lion.jpg"
];

// ✅ Install → cache assets
self.addEventListener("install", (e) => {
    self.skipWaiting(); // 🔥 activate immediately

    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// ✅ Activate → delete old cache
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key); // 🔥 remove old versions
                    }
                })
            )
        )
    );

    self.clients.claim(); // 🔥 control page immediately
});

// ✅ Fetch → Network First (always get latest)
self.addEventListener("fetch", (e) => {
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Update cache in background
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, clone);
                });
                return res;
            })
            .catch(() => caches.match(e.request)) // offline fallback
    );
});