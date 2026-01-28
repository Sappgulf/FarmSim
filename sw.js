const CACHE_NAME = 'farmsim-pwa-v1';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png'
    // Note: main.jsx and index.css will be cached dynamically or should be added here if paths are stable/known without build hash
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // We try to caché the shell. If some files fail (like main.jsx if path is wrong), it's okay for now as we have a fetch strategy.
            // However, for a robust PWA, these should be exact.
            // Since we don't know the build output filenames (vite hashes), we rely on runtime caching for those or just cache the known static entry points.
            // We will try strictly available files.
            return cache.addAll(APP_SHELL);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Only handle same-origin requests
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Clone the request because it's a one-time use stream
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response because it's a one-time use stream
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch((err) => {
                console.error('Fetch failed:', err);
                // Optional: Return a reliable offline fallback page here if available
            });
        })
    );
});
