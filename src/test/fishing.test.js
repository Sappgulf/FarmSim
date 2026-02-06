import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FishingSystem } from '../components/farm-sim/systems/FishingSystem';

const buildBaseState = () => ({
  coins: 500,
  xp: 0,
  fishing: {
    pond: {
      level: 1,
      population: 100,
      maxPopulation: 100,
    },
    stats: {
      totalCaught: 0,
      totalValue: 0,
      largestFish: 0,
      byType: {},
      streak: 0,
      bestStreak: 0,
      escapes: 0,
    },
  },
});

describe('FishingSystem', () => {
  let state;
  let actions;
  let system;

  beforeEach(() => {
    state = buildBaseState();
    actions = {
      updateFishing: vi.fn(),
      earnMoney: vi.fn(),
      spendMoney: vi.fn(),
      addXP: vi.fn(),
      addToInventory: vi.fn(),
      addNotification: vi.fn(),
    };
    system = new FishingSystem(state, actions);
  });

  it('starts a catch when pond population is healthy', () => {
    const result = system.castLine();

    expect(result.success).toBe(true);
    expect(result.catch).toBeTruthy();
    expect(system.getActiveCatch()).toBeTruthy();
    expect(actions.updateFishing).toHaveBeenCalled();
  });

  it('grants rewards through helper actions on catch success', () => {
    const result = system.castLine();
    expect(result.success).toBe(true);

    // Force a deterministic success outcome.
    system.activeCatch.playerPosition = system.activeCatch.fishPosition;
    system.activeCatch.progress = 1;

    const success = system.catchSuccess();

    expect(success.caught).toBe(true);
    expect(actions.earnMoney).toHaveBeenCalledTimes(1);
    expect(actions.addXP).toHaveBeenCalledTimes(1);
    expect(actions.addToInventory).toHaveBeenCalledWith(success.fish.id, 1);
  });


  it('applies early-game tuning while rewarding catch streak mastery', () => {
    const makeCatchState = () => ({
      fish: {
        id: 'common',
        name: 'Common Fish',
        emoji: '🐟',
        baseValue: 20,
        difficulty: 1,
        size: { min: 5, max: 15 },
      },
      size: 10,
      difficulty: 1,
      elapsedMs: 1000,
      timeLimit: 10000,
      qualityWindowMs: 900,
      lineTension: 0.1,
    });

    state.progression = { level: 3 };
    state.fishing.stats.streak = 0;
    system = new FishingSystem(state, actions);
    system.activeCatch = makeCatchState();
    system.catchSuccess();
    const earlyValue = actions.earnMoney.mock.calls[0][0];

    actions.earnMoney.mockClear();

    state.progression = { level: 10 };
    state.fishing.stats.streak = 5;
    system = new FishingSystem(state, actions);
    system.activeCatch = makeCatchState();
    system.catchSuccess();
    const lateStreakValue = actions.earnMoney.mock.calls[0][0];

    expect(earlyValue).toBeLessThan(lateStreakValue);
  });

  it('records escape and resets streak when fish gets away', () => {
    state.fishing.stats.streak = 4;
    system = new FishingSystem(state, actions);
    expect(system.castLine().success).toBe(true);

    const escaped = system.fishEscaped('timeout');

    expect(escaped.escaped).toBe(true);
    expect(actions.updateFishing).toHaveBeenCalled();
    const latestUpdate = actions.updateFishing.mock.calls[actions.updateFishing.mock.calls.length - 1][0];
    expect(latestUpdate.stats.streak).toBe(0);
    expect(latestUpdate.stats.escapes).toBeGreaterThan(0);
  });
});
