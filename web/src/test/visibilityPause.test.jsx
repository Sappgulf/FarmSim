import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../components/farm-sim/context/GameContext';
import { TickProvider } from '../components/farm-sim/context/TickContext';
import { FarmSimCore } from '../components/farm-sim/core/FarmSim';

vi.mock('../components/farm-sim/systems/SoundSystem', () => ({
  getSoundSystem: () => ({
    setEnabled: vi.fn(),
    resume: vi.fn().mockResolvedValue(),
    play: vi.fn(),
    stop: vi.fn(),
  }),
}));

vi.mock('../components/farm-sim/systems/MusicSystem', () => ({
  getMusicSystem: () => ({
    setEnabled: vi.fn(),
    resume: vi.fn().mockResolvedValue(),
    play: vi.fn(),
    stop: vi.fn(),
    setSeason: vi.fn(),
    isPlaying: false,
  }),
}));

const setDocumentVisibility = (hidden) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (hidden ? 'hidden' : 'visible'),
  });
};

const restoreDocumentProperty = (prop, descriptor) => {
  if (descriptor) {
    Object.defineProperty(document, prop, descriptor);
    return;
  }
  delete document[prop];
};

function StateProbe({ onUpdate }) {
  const game = useGame();
  useEffect(() => {
    onUpdate(game);
  }, [game, onUpdate]);
  return null;
}

describe('Visibility pause behavior', () => {
  it('keeps manual pause state after hide/show visibility events', async () => {
    const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');
    const latest = { current: null };

    try {
      setDocumentVisibility(false);

      const { unmount } = render(
        <GameProvider>
          <TickProvider>
            <FarmSimCore />
            <StateProbe onUpdate={(game) => { latest.current = game; }} />
          </TickProvider>
        </GameProvider>
      );

      await waitFor(() => {
        expect(latest.current).toBeTruthy();
      });

      act(() => {
        latest.current.actions.pauseGame();
      });

      await waitFor(() => {
        expect(latest.current.state.gameLoop.paused).toBe(true);
      });

      act(() => {
        setDocumentVisibility(true);
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(latest.current.state.gameLoop.paused).toBe(true);
      });

      act(() => {
        setDocumentVisibility(false);
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(latest.current.state.gameLoop.paused).toBe(true);
      });

      unmount();
    } finally {
      restoreDocumentProperty('hidden', hiddenDescriptor);
      restoreDocumentProperty('visibilityState', visibilityDescriptor);
    }
  });
});
