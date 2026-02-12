import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import GameErrorBoundary from '../components/GameErrorBoundary';
import { GameProvider, useGame } from '../components/farm-sim/context/GameContext';
import { SAVE_KEY } from '../components/farm-sim/context/GamePersistence';

describe('Debug regressions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('tracks daily quest progress when coins are earned', () => {
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider });

    act(() => {
      result.current.actions.updateDailyQuests({
        quests: [
          {
            id: 'quest-earn-1',
            type: 'earn',
            description: 'Earn 200 coins total',
            target: 200,
            reward: 75,
            difficulty: 'easy',
            progress: 0,
            completed: false,
            claimed: false,
          },
        ],
        lastResetTime: Date.now(),
        streak: 0,
        totalCompleted: 0,
      });
    });

    act(() => {
      result.current.actions.earnMoney(250, 'harvest');
    });

    expect(result.current.state.dailyQuests.quests[0].progress).toBeGreaterThan(0);
  });

  it('clears the active save key when reset is triggered from the error boundary', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ coins: 500 }));
    localStorage.setItem('farmLifeSave', JSON.stringify({ coins: 10 }));

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const boundary = new GameErrorBoundary({});
    boundary.setState = vi.fn();
    try {
      boundary.handleRestart();
    } catch {
      // jsdom can throw for window.location.reload in tests.
    }

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(localStorage.getItem('farmLifeSave')).toBeNull();

    consoleErrorSpy.mockRestore();
    confirmSpy.mockRestore();
  });
});
