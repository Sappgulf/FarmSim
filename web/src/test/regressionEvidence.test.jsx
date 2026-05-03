import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { GameProvider, useGame } from '../components/farm-sim/context/GameContext';
import { SAVE_KEY } from '../components/farm-sim/context/GamePersistence';
import { getDebugMetrics, initDebugTools } from '../utils/debugTools';

const restoreDebugGlobals = () => {
  const originals = window.__farmDebugOriginals;
  if (originals) {
    window.setTimeout = originals.setTimeout;
    window.clearTimeout = originals.clearTimeout;
    window.setInterval = originals.setInterval;
    window.clearInterval = originals.clearInterval;
    EventTarget.prototype.addEventListener = originals.addEventListener;
    EventTarget.prototype.removeEventListener = originals.removeEventListener;
    console.error = originals.consoleError;
    console.warn = originals.consoleWarn;
  }

  delete window.__farmDebugOriginals;
  delete window.__farmDebugInitialized;
  delete window.__farmDebug;
};

describe('Regression evidence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.history.replaceState({}, '', '/');
    restoreDebugGlobals();
  });

  it('persists inventory-only progress in autosave de-duplication', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
      setTimeout(() => callback(performance.now()), 16)
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => clearTimeout(id));

    const { result, unmount } = renderHook(() => useGame(), { wrapper: GameProvider });

    act(() => {
      vi.advanceTimersByTime(35000);
    });

    const baselineSave = JSON.parse(localStorage.getItem(SAVE_KEY));
    expect(baselineSave).toBeTruthy();
    const baselineCarrots = baselineSave.inventory?.carrot || 0;

    act(() => {
      result.current.actions.addToInventory('carrot', 5);
    });
    expect(result.current.state.inventory.carrot).toBe(baselineCarrots + 5);

    act(() => {
      vi.advanceTimersByTime(35000);
    });

    const secondSave = JSON.parse(localStorage.getItem(SAVE_KEY));
    expect(secondSave.inventory?.carrot).toBe(baselineCarrots + 5);

    unmount();
  });

  it('does not count completed timeouts as active debug metrics', () => {
    vi.useFakeTimers();
    window.history.replaceState({}, '', '/?debug=1');

    initDebugTools();

    const timeoutCallback = vi.fn();
    window.setTimeout(timeoutCallback, 10);
    vi.advanceTimersByTime(20);

    expect(timeoutCallback).toHaveBeenCalledTimes(1);
    const metrics = getDebugMetrics();
    expect(metrics.timeoutCount).toBe(0);
  });
});
