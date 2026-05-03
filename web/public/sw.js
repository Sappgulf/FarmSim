const CACHE_NAME = 'farmsim-v5.5.4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/favicon.svg'
];

const IS_LOCAL_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const keys = await caches.keys();
    // In local dev, clear everything to avoid stale cache issues
    if (IS_LOCAL_DEV) {
      await Promise.all(keys.map(k => caches.delete(k)));
      return;
    }
    // Clean old caches
    await Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    );
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Skip caching in dev
  if (IS_LOCAL_DEV) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    
    // Navigation requests: network first, fallback to cache
    if (req.mode === 'navigate') {
      try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await cache.match(req);
        if (cached) return cached;
        const root = (await cache.match('/')) || (await cache.match('/index.html'));
        if (root) return root;
        throw e;
      }
    }
    
    // Stale-while-revalidate for other requests
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    
    return cached || fetchPromise;
  })());
});
