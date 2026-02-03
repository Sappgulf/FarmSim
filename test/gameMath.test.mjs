import { describe, it, expect } from 'vitest';
import { applyMultiplierRound, clamp } from '../src/utils/gameMath.mjs';

describe('gameMath', () => {
  it('applyMultiplierRound applies pricing math with rounding', () => {
    expect(applyMultiplierRound(10, 1.25)).toBe(13);
    expect(applyMultiplierRound(10, 0.5)).toBe(5);
    expect(applyMultiplierRound(0.4, 1.1)).toBe(1);
  });

  it('clamp enforces bounds', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(9, 0, 3)).toBe(3);
  });
});
