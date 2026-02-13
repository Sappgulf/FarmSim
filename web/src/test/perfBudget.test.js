import { describe, it, expect, vi } from 'vitest';
import { FarmingSystem } from '../components/farm-sim/systems/FarmingSystem';

describe('Performance Budget', () => {
  it('keeps farming sim update under 4ms avg on a 20x20 grid', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    try {
      const gridSize = 20;
      const plotCount = gridSize * gridSize;
      const now = Date.now();

      const crop = { id: 'carrot', name: 'Carrot', growthTime: 30, stages: 3, baseValue: 3, emoji: '🥕' };
      const plots = Array(plotCount).fill(null).map((_, id) => ({
        id,
        state: 'growing',
        crop,
        plantedAt: now - 10_000,
        growthStage: 1,
        progress: 0.1,
        waterLevel: 100,
        soilFertility: 1,
        rotationHistory: [],
        weatherModifier: 1,
        growthBoost: 1,
      }));

      const state = {
        plots,
        weather: 'sunny',
        season: { config: { bonuses: { growthSpeed: 1.0 } } },
        inventory: {},
        level: 1,
      };

      const actions = {
        updatePlots: vi.fn(),
        addNotification: vi.fn(),
        earnMoney: vi.fn(),
        addXP: vi.fn(),
        updateInventory: vi.fn(),
      };

      const system = new FarmingSystem(state, actions);
      const iterations = 80;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const start = performance.now();
      for (let i = 0; i < iterations; i += 1) {
        vi.setSystemTime(now + (i * 300)); // bypass growth throttle for each update pass
        system.update(state);
      }
      const totalMs = performance.now() - start;

      vi.useRealTimers();

      const avgTickMs = totalMs / iterations;
      console.info(`[perf] Web FarmingSystem 20x20 avg tick: ${avgTickMs.toFixed(3)}ms`);
      expect(avgTickMs).toBeLessThan(4);
    } finally {
      vi.useRealTimers();
      debugSpy.mockRestore();
    }
  });
});
