import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../components/farm-sim/context/GameReducer';
import { GAME_ACTIONS } from '../components/farm-sim/context/GameActions';

describe('gameReducer economy guards', () => {
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
});
