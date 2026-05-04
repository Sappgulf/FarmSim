import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, renderHook, screen } from '@testing-library/react';
import { GameProvider, useGame } from '../components/farm-sim/context/GameContext';
import NotificationSystem from '../components/farm-sim/ui/NotificationSystem';

const NotificationTestWrapper = ({ children }) => (
  <GameProvider>
    <NotificationSystem />
    {children}
  </GameProvider>
);

describe('NotificationSystem', () => {
  it('mounts only visible notifications and shows overflow summary', () => {
    const { result } = renderHook(() => useGame(), { wrapper: NotificationTestWrapper });

    act(() => {
      result.current.actions.updateOnboarding({ onboardingSkipped: true });
    });

    act(() => {
      for (let i = 0; i < 8; i += 1) {
        result.current.actions.addNotification({
          message: `Queued notification ${i}`,
          type: 'info',
        });
      }
    });

    expect(document.querySelectorAll('.notification-enter')).toHaveLength(5);
    expect(screen.getByText('+3 more notifications')).toBeInTheDocument();
  });

  it('uses live-region semantics with severity roles', () => {
    const { result } = renderHook(() => useGame(), { wrapper: NotificationTestWrapper });

    act(() => {
      result.current.actions.updateOnboarding({ onboardingSkipped: true });
    });

    act(() => {
      result.current.actions.addNotification({
        message: 'Background sync complete',
        type: 'info',
      });
      result.current.actions.addNotification({
        message: 'Failed to save game',
        type: 'error',
      });
    });

    const notificationRegion = screen.getByRole('region', { name: 'Game notifications' });
    expect(notificationRegion).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('hides info toasts during onboarding but still shows errors', () => {
    const { result } = renderHook(() => useGame(), { wrapper: NotificationTestWrapper });

    act(() => {
      result.current.actions.updateOnboarding({
        onboardingSkipped: false,
        onboardingStep: 0,
      });
      result.current.actions.addNotification({ message: 'Almanac tip', type: 'info' });
      result.current.actions.addNotification({ message: 'Something broke', type: 'error' });
    });

    expect(screen.queryByText('Almanac tip')).not.toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });
});
