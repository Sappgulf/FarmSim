/**
 * Offline / PWA shell. Vite's build manifest supplies every hashed runtime bundle.
 *
 * Release hygiene: keep CACHE_NAME in sync with `web/package.json` "version" when you ship
 * (e.g. farmsim-sw-v5.5.4) so activate() prunes old caches after deploy.
 *
 * Strategy: navigation requests try network first, fall back to cached shell; other GETs use
 * cache-if-available then refresh cache when network succeeds.
 */
const CACHE_NAME = 'farmsim-sw-v0.3.1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/farm-world-v3.webp',
  './assets/crop-stages-v3.webp',
  './assets/farm-assets-sheet-alpha.webp',
];

const IS_LOCAL_DEV =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil((async () => {
    const response = await fetch('./precache-manifest.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('The offline build manifest is unavailable.');
    const manifest = await response.json();
    const bundles = Object.values(manifest).flatMap((entry) =>
      [entry.file, ...(entry.css || []), ...(entry.assets || [])].filter(Boolean).map((path) => `./${path}`),
    );
    const cache = await caches.open(CACHE_NAME);
    // A partial shell must not replace an existing working offline installation.
    await cache.addAll([...new Set([...ASSETS, './precache-manifest.json', ...bundles])]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      if (IS_LOCAL_DEV) {
        await Promise.all(keys.filter((key) => key.startsWith('farmsim-sw-')).map((key) => caches.delete(key)));
        return;
      }
      await Promise.all(
        keys.filter((key) => key.startsWith('farmsim-sw-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
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

      const url = new URL(req.url);
      const assetDirectory = new URL('./assets/', self.location.href);
      // Module/style requests carry Origin, while install-time prefetches do not.
      // These same-origin static files have identical bytes for every Origin.
      const isOwnAsset = url.origin === assetDirectory.origin && url.pathname.startsWith(assetDirectory.pathname);
      const cached = await cache.match(req, { ignoreVary: isOwnAsset });
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
