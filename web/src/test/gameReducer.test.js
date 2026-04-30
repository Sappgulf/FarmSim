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

  it('returns same state reference for no-op inventory updates', () => {
    const seeded = {
      ...initialState,
      inventory: { ...initialState.inventory },
    };
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_INVENTORY,
      payload: seeded.inventory,
    });

    expect(next).toBe(seeded);
  });

  it('returns same state reference for no-op full plot updates', () => {
    const seeded = {
      ...initialState,
      plots: [...initialState.plots],
    };
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_PLOTS,
      payload: seeded.plots,
    });

    expect(next).toBe(seeded);
  });

  it('returns same state reference when UPDATE_PLOT receives unchanged entry', () => {
    const seeded = {
      ...initialState,
      plots: [...initialState.plots],
    };
    const unchangedPlot = seeded.plots[0];
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_PLOT,
      payload: { index: 0, plot: unchangedPlot },
    });

    expect(next).toBe(seeded);
  });

  it('supports functional payloads for processing state slices', () => {
    const seeded = {
      ...initialState,
      processingFacilities: [{ id: 'flour_mill', level: 1, isProcessing: false }],
      processingQueue: [{ id: 1, facilityId: 'flour_mill', output: 'flour', quantity: 1 }],
      processedInventory: { flour: 2 },
    };

    const nextFacilities = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES,
      payload: (current) => [
        ...(current || []),
        { id: 'juice_press', level: 1, isProcessing: false },
      ],
    });

    expect(nextFacilities.processingFacilities).toHaveLength(2);
    expect(nextFacilities.processingFacilities[1].id).toBe('juice_press');

    const nextQueue = gameReducer(nextFacilities, {
      type: GAME_ACTIONS.UPDATE_PROCESSING_QUEUE,
      payload: (current) => (current || []).filter((item) => item.id !== 1),
    });

    expect(nextQueue.processingQueue).toEqual([]);

    const nextInventory = gameReducer(nextQueue, {
      type: GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY,
      payload: (current) => ({
        ...(current || {}),
        flour: Number(current?.flour || 0) + 3,
      }),
    });

    expect(nextInventory.processedInventory.flour).toBe(5);
  });

  it('returns same state reference for no-op processing inventory merges', () => {
    const seeded = {
      ...initialState,
      processedInventory: { flour: 2 },
    };
    const next = gameReducer(seeded, {
      type: GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY,
      payload: (current) => current,
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

describe('toast notifications reducer', () => {
  it('bursts duplicates into one stacked toast instead of unreadable spam', () => {
    let state = gameReducer(initialState, {
      type: GAME_ACTIONS.ADD_NOTIFICATION,
      payload: { message: 'Coins earned', type: 'success' },
    });
    expect(state.notifications).toHaveLength(1);
    const firstId = state.notifications[0].id;
    const historyAfterFirst = state.notificationHistory?.length ?? 0;

    state = gameReducer(state, {
      type: GAME_ACTIONS.ADD_NOTIFICATION,
      payload: { message: 'Coins earned', type: 'success' },
    });

    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].id).toBe(firstId);
    expect(state.notifications[0].count).toBe(2);
    expect(state.notificationHistory?.length ?? 0).toBe(historyAfterFirst);
  });
});

