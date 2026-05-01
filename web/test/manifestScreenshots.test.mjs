import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, '..');
const manifestPath = join(webRoot, 'public', 'manifest.json');

describe('PWA manifest assets', () => {
  it('lists screenshots that exist on disk', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    expect(Array.isArray(manifest.screenshots)).toBe(true);
    for (const shot of manifest.screenshots) {
      const rel = String(shot.src || '').replace(/^\.\//, '');
      expect(rel.length).toBeGreaterThan(0);
      const abs = join(webRoot, 'public', rel);
      expect(
        existsSync(abs),
        `Missing ${rel} — run: npm run gen:screenshots`,
      ).toBe(true);
    }
  });
});
