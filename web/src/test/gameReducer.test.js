import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../components/farm-sim/context/GameReducer';
import { GAME_ACTIONS } from '../components/farm-sim/context/GameActions';

describe('gameReducer economy guards', () => {

  it('bootstraps a starter kit without pre-harvest stockpile bloat', () => {
    expect(initialState.inventory).toMatchObject({
      lettuce: 4,
      carrot: 3,
      fertilizer: 2,
      pesticide: 2,
      starter_flag: 1,
    });
    expect(initialState.inventory.water_boost || 0).toBe(0);
  });
  it('clamps coins to non-negative finite values', () => {
    const next = gameReducer(initialState, {
      type: GAME_ACTIONS.SET_COINS,
      payload: () => -250,
    });

    expect(next.coins).toBe(0);
  });

  it('keeps previous XP when payload is non-finite', () => {
    const seeded = { ...initialState, xp: 120, level: 2 };
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.SET_XP,
      payload: Number.NaN,
    });

    expect(next.xp).toBe(120);
    expect(next.level).toBe(2);
  });

  it('recalculates level from sanitized XP', () => {
    const next = gameReducer(initialState, {
      type: GAME_ACTIONS.SET_XP,
      payload: 500,
    });

    expect(next.xp).toBe(500);
    expect(next.level).toBeGreaterThan(1);
  });

  it('returns same state reference for no-op game loop merges', () => {
    const seeded = {
      ...initialState,
      gameLoop: { ...initialState.gameLoop, paused: false },
    };
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_GAME_LOOP,
      payload: { paused: false },
    });

    expect(next).toBe(seeded);
  });

  it('returns same state reference for no-op settings merges', () => {
    const seeded = {
      ...initialState,
      settings: { ...initialState.settings, autoSave: true },
    };
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_SETTINGS,
      payload: { autoSave: true },
    });

    expect(next).toBe(seeded);
  });

  it('keeps prestige initialized when PRESTIGE_RESET has no payload', () => {
    const seeded = {
      ...initialState,
      prestige: {
        tier: 2,
        totalRebirths: 5,
        legacyPoints: 42,
        legacyBonuses: { growth: 0.1 },
        heirloomSeeds: ['heirloom_turnip'],
      },
      coins: 999,
    };

    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.PRESTIGE_RESET,
    });

    expect(next.prestige).toEqual(initialState.prestige);
    expect(next.coins).toBe(initialState.coins);
  });
});
