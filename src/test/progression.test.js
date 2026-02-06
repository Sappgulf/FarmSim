import { describe, expect, it } from 'vitest';
import { applyXpTuning, getLevelFromXp, getXpForLevel } from '../components/farm-sim/systems/progression';
import { migrateSaveData } from '../components/farm-sim/context/GamePersistence';

describe('progression tuning', () => {
  it('uses non-linear XP requirements', () => {
    const d1 = getXpForLevel(3) - getXpForLevel(2);
    const d2 = getXpForLevel(8) - getXpForLevel(7);
    const d3 = getXpForLevel(15) - getXpForLevel(14);
    expect(d1).toBeGreaterThan(0);
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
  });

  it('applies harvest diminishing returns by crop each day', () => {
    let tracker = {};
    let first = 0;
    let ninth = 0;
    for (let i = 1; i <= 9; i += 1) {
      const result = applyXpTuning(12, { source: 'harvest', cropId: 'parsnip' }, tracker, '2026-02-06');
      tracker = result.tracker;
      if (i === 1) first = result.grantedXp;
      if (i === 9) ninth = result.grantedXp;
    }
    expect(first).toBeGreaterThan(ninth);
  });

  it('caps minigame XP per day', () => {
    let tracker = {};
    let total = 0;
    for (let i = 0; i < 15; i += 1) {
      const result = applyXpTuning(20, { source: 'minigame', minigameId: 'fishing', skillFactor: 1 }, tracker, '2026-02-06');
      tracker = result.tracker;
      total += result.grantedXp;
    }
    expect(total).toBeLessThanOrEqual(120);
  });

  it('migrates old saves with valid level/xp and tracker defaults', () => {
    const migrated = migrateSaveData({ saveVersion: 13, xp: 5000, level: 1, coins: 200, gridSize: 3, plots: [] });
    expect(migrated.level).toBeGreaterThanOrEqual(getLevelFromXp(5000));
    expect(migrated.progressionXpTracker).toBeDefined();
    expect(Array.isArray(migrated.recentXpEvents)).toBe(true);
  });
});
