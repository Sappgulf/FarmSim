const VERSION = 'v2';
const RUNTIME = `farm-runtime-${VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Claim control immediately
    await self.clients.claim();
    // Clean up old caches
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('farm-runtime-') && k !== RUNTIME).map(k => caches.delete(k)));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME);
    // Navigation requests: try network first, fall back to cache
    if (req.mode === 'navigate') {
      try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await cache.match(req);
        if (cached) return cached;
        // As a last resort, try cached root
        const root = await cache.match('/');
        if (root) return root;
        throw e;
      }
    }
    // Stale-while-revalidate for others
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then((res) => {
      cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});


