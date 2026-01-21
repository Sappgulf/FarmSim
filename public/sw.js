const VERSION = 'v4';
const RUNTIME = `farm-runtime-${VERSION}`;
const PRECACHE_URLS = ['/', '/index.html'];

const IS_LOCAL_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    (async () => {
      const cache = await caches.open(RUNTIME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const keys = await caches.keys();
    // In local dev, clear everything to avoid "stuck on old UI/code".
    if (IS_LOCAL_DEV) {
      await Promise.all(keys.map(k => caches.delete(k)));
      return;
    }
    await Promise.all(keys.filter(k => k.startsWith('farm-runtime-') && k !== RUNTIME).map(k => caches.delete(k)));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (IS_LOCAL_DEV) {
    event.respondWith(fetch(req));
    return;
  }

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
        // As a last resort, try cached root or index.html
        const root = (await cache.match('/')) || (await cache.match('/index.html'));
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
