import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

describe('safe-area utilities', () => {
  it('defines right safe-area utility for iOS landscape notches', () => {
    const css = readFileSync('src/index.css', 'utf-8');

    expect(css).toMatch(/\.safe-area-pr\s*\{[\s\S]*padding-right:\s*env\(safe-area-inset-right,\s*0px\);/);
  });
});
