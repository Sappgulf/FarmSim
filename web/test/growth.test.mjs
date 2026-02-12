import { describe, it, expect } from 'vitest';
import { getGrowthStage } from '../src/systems/growth.mjs';

describe('growth', () => {
  it('getGrowthStage clamps to bounds', () => {
    expect(getGrowthStage(0, 10, 3)).toBe(0);
    expect(getGrowthStage(9, 10, 3)).toBe(0);
    expect(getGrowthStage(10, 10, 3)).toBe(1);
    expect(getGrowthStage(45, 10, 3)).toBe(3);
    expect(getGrowthStage(999, 10, 3)).toBe(3);
  });
});
