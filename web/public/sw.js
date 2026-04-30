/**
 * Lightweight offline / PWA shell. Keep precache minimal; hashed bundles network-first elsewhere.
 *
 * IMPORTANT: Bump CACHE_NAME when you change caching rules or precached shell assets so
 * activate() evicts stale caches for existing users (see README in farm-sim/).
 */
const CACHE_NAME = 'farmsim-sw-v5.5.4';

const ASSETS = ['./', './index.html', './manifest.json', './icons/favicon.svg'];

const IS_LOCAL_DEV =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(ASSETS).catch(() =>
          Promise.all(ASSETS.map((url) => cache.add(url).catch(() => undefined))),
        ),
      ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      if (IS_LOCAL_DEV) {
        await Promise.all(keys.map((k) => caches.delete(k)));
        return;
      }
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (IS_LOCAL_DEV) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      if (req.mode === 'navigate') {
        try {
          const res = await fetch(req);
          if (res.ok) {
            try {
              await cache.put(req, res.clone());
            } catch {
              /* ignore opaque / unsupported bodies */
            }
          }
          return res;
        } catch (e) {
          const cached = await cache.match(req);
          if (cached) return cached;
          const root = (await cache.match('./')) || (await cache.match('/')) || null;
          if (root) return root;
          throw e;
        }
      }

      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(async (res) => {
        if (res.ok) {
          try {
            await cache.put(req, res.clone());
          } catch {
            /* ignore */
          }
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })(),
  );
});
