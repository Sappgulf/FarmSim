import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Monorepo root (parent of `web/`) */
const repoRoot = join(__dirname, '..', '..');
const contentRoot = join(repoRoot, 'shared', 'content');

/**
 * @param {string} dir
 * @returns {string[]}
 */
function collectJsonFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      out.push(...collectJsonFiles(p));
    } else if (name.endsWith('.json')) {
      out.push(p);
    }
  }
  return out;
}

describe('shared/content JSON', () => {
  it('every JSON file parses', () => {
    const files = collectJsonFiles(contentRoot);
    expect(files.length).toBeGreaterThan(8);
    for (const file of files) {
      const raw = readFileSync(file, 'utf8');
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        throw new Error(`Invalid JSON: ${file}: ${e instanceof Error ? e.message : e}`);
      }
      expect(parsed).not.toBe(null);
    }
  });
});
