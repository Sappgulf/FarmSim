import { describe, it, expect } from 'vitest';
import {
  calculateHarvestValue,
  getAutoHarvestConfig,
  getHydroponicsGrowthBonus,
  getSeedCostMultiplier,
  getSprinklerConfig,
} from '../utils/farmUpgrades';

describe('farmUpgrades', () => {
  it('stacks quality seeds and market terminal harvest multipliers', () => {
    const base = calculateHarvestValue(20, 1.0, {});
    const boosted = calculateHarvestValue(20, 1.0, {
      quality_seeds: 1,
      market_terminal: 1,
    });

    expect(base).toBe(24);
    expect(boosted).toBe(31);
  });

  it('upgrades sprinkler config when rain collector is owned', () => {
    expect(getSprinklerConfig({ sprinkler: 1 })).toEqual({ intervalMs: 12000, waterAmount: 6 });
    expect(getSprinklerConfig({ sprinkler: 1, rain_collector: 1 })).toEqual({ intervalMs: 10000, waterAmount: 10 });
  });

  it('returns tool configs for advanced upgrades', () => {
    expect(getSeedCostMultiplier({ precision_hoe: 1 })).toBe(0.9);
    expect(getHydroponicsGrowthBonus({ hydroponics_rack: 1 })).toBe(1.08);
    expect(getAutoHarvestConfig({ drone_harvester: 1 })).toEqual({ intervalMs: 15000, maxPlotsPerTick: 2 });
  });
});
