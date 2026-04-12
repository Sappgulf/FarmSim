import { describe, it, expect } from 'vitest';
import { getPlotCounts, getMinSeedCost, getNextGoalFromCounts } from '../src/utils/goalHints.js';

describe('goalHints', () => {
  describe('getPlotCounts', () => {
    it('counts plot states correctly', () => {
      const plots = [
        { state: 'empty' },
        { state: 'planted' },
        { state: 'growing' },
        { state: 'ready' },
        { state: 'empty' },
        null,
      ];
      const result = getPlotCounts(plots);
      expect(result.empty).toBe(2);
      expect(result.active).toBe(3);
      expect(result.ready).toBe(1);
    });

    it('handles empty array', () => {
      const result = getPlotCounts([]);
      expect(result).toEqual({ active: 0, ready: 0, empty: 0 });
    });

    it('handles undefined input', () => {
      const result = getPlotCounts();
      expect(result).toEqual({ active: 0, ready: 0, empty: 0 });
    });
  });

  describe('getMinSeedCost', () => {
    it('returns minimum seed cost for level', () => {
      const cost = getMinSeedCost(1);
      expect(cost).toBeGreaterThan(0);
    });

    it('returns minimum seed cost for negative level (defaults to level 1)', () => {
      const cost = getMinSeedCost(-1);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('getNextGoalFromCounts', () => {
    it('handles empty input', () => {
      const result = getNextGoalFromCounts();
      expect(result).toBeDefined();
    });

    it('returns a goal object with expected properties', () => {
      const result = getNextGoalFromCounts({ ready: 0, empty: 5, active: 0, coins: 100, level: 1 });
      expect(result).toBeDefined();
      expect(result).toHaveProperty('emoji');
      expect(result).toHaveProperty('text');
    });
  });
});