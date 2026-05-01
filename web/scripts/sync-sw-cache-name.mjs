/**
 * Keeps `public/sw.js` CACHE_NAME aligned with `package.json` version (e.g. farmsim-sw-v5.5.4).
 * Run automatically before `vite build`; safe no-op when already in sync.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const pkgPath = path.join(webRoot, 'package.json');
const swPath = path.join(webRoot, 'public', 'sw.js');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = typeof pkg.version === 'string' ? pkg.version.trim() : '';
if (!version) {
  console.error('[sync-sw] Missing package.json version');
  process.exit(1);
}

const nextCacheName = `farmsim-sw-v${version}`;
let sw = fs.readFileSync(swPath, 'utf8');
const pattern = /const\s+CACHE_NAME\s*=\s*['"][^'"]+['"]\s*;/;
if (!pattern.test(sw)) {
  console.error('[sync-sw] Could not find CACHE_NAME declaration in sw.js');
  process.exit(1);
}

const replaced = sw.replace(pattern, `const CACHE_NAME = '${nextCacheName}';`);
if (replaced === sw) {
  console.log('[sync-sw] CACHE_NAME already', nextCacheName);
} else {
  fs.writeFileSync(swPath, replaced, 'utf8');
  console.log('[sync-sw] Updated CACHE_NAME →', nextCacheName);
}
