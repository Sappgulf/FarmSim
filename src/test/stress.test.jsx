import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import FarmSim from '../components/farm-sim/core/FarmSim';
import { GameProvider, useGame } from '../components/farm-sim/context/GameContext';
import { TAB_IDS } from '../components/farm-sim/ui/GameSidebar';

vi.mock('../components/farm-sim/systems/SoundSystem', () => ({
  getSoundSystem: () => ({
    setEnabled: vi.fn(),
    setVolume: vi.fn(),
    resume: vi.fn().mockResolvedValue(),
    play: vi.fn(),
    stop: vi.fn(),
    playClickSound: vi.fn(),
  }),
}));

vi.mock('../components/farm-sim/systems/MusicSystem', () => ({
  getMusicSystem: () => ({
    setEnabled: vi.fn(),
    setVolume: vi.fn(),
    resume: vi.fn().mockResolvedValue(),
    play: vi.fn(),
    stop: vi.fn(),
    setSeason: vi.fn(),
    isPlaying: false,
  }),
}));

describe('FarmSim Stress Regressions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles rapid tab switching without crashing', async () => {
    const rafMock = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    const cafMock = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    render(<FarmSim />);

    await waitFor(() => {
      expect(typeof window.switchToTab).toBe('function');
    });

    act(() => {
      for (let i = 0; i < TAB_IDS.length * 8; i += 1) {
        window.switchToTab(TAB_IDS[i % TAB_IDS.length]);
      }
      window.switchToTab('settings');
    });

    expect(typeof window.switchToTab).toBe('function');

    rafMock.mockRestore();
    cafMock.mockRestore();
  });

  it('handles notification flood and duplicate close calls safely', () => {
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider });

    act(() => {
      for (let i = 0; i < 60; i += 1) {
        result.current.actions.addNotification({
          id: `stress-note-${i}`,
          message: `Stress message ${i}`,
          type: 'info',
        });
      }
    });

    expect(result.current.state.notifications).toHaveLength(60);

    const ids = result.current.state.notifications.map((notification) => notification.id);

    act(() => {
      ids.forEach((id) => {
        result.current.actions.clearNotification(id);
        result.current.actions.clearNotification(id);
      });
    });

    expect(result.current.state.notifications).toHaveLength(0);
  });

  it('keeps state valid during repeated save/load cycles', () => {
    const { result } = renderHook(() => useGame(), { wrapper: GameProvider });

    act(() => {
      result.current.actions.setCoins(999);
      result.current.actions.setXp(500);
    });

    expect(() => {
      act(() => {
        for (let i = 0; i < 30; i += 1) {
          result.current.actions.saveGame();
          result.current.actions.loadGame();
        }
      });
    }).not.toThrow();

    const rawSave = localStorage.getItem('farm_sim_enhanced_v2');
    expect(rawSave).toBeTruthy();
    expect(() => JSON.parse(rawSave)).not.toThrow();
    expect(Number.isFinite(result.current.state.coins)).toBe(true);
    expect(result.current.state.coins).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.current.state.xp)).toBe(true);
  });
});
