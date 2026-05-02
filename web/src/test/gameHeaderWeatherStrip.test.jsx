import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import GameHeader from '../components/farm-sim/ui/GameHeader';

const mockState = {
  coins: 200,
  xp: 420,
  level: 4,
  cosmeticTokens: 3,
  recentXpEvents: [],
  buildings: { barn: { built: true } },
  weather: 'rainy',
  season: {
    config: {
      name: 'Spring',
      icon: '🌸',
      description: 'Fresh season in bloom.',
      weatherWeights: { sunny: 0.5, rainy: 0.25, cloudy: 0.25 },
    },
    lastChangeTime: Date.now() - 6_000,
  },
  farmTheme: 'orchard',
  farmName: 'QA Plot',
  settings: { autoSave: true },
  gameLoop: { lastSaveTime: Date.now() - 2000 },
  plots: [{ state: 'ready' }, { state: 'empty' }, { state: 'growing' }],
  achievements: [{ unlocked: true }, { unlocked: false }, { unlocked: true }],
  weatherForecast: [
    { type: 'sunny', duration: 20 },
    { type: 'stormy', duration: 18 },
    { type: 'cloudy', duration: 25 },
  ],
};

const switchToTabSpy = vi.fn();

vi.mock('../components/farm-sim/context/GameContext', () => ({
  useGameSelector: (selector) => selector(mockState),
  useGameActions: () => ({ addNotification: vi.fn(), addNotificationWithAction: vi.fn() }),
  useTick: vi.fn(),
  useGameStore: () => ({ state: mockState }),
  useGame: () => ({ state: mockState }),
}));

vi.mock('../components/farm-sim/context/TickContext', () => ({
  useTick: () => {},
}));

describe('GameHeader Weather Strip', () => {
  beforeEach(() => {
    window.switchToTab = switchToTabSpy;
    switchToTabSpy.mockClear();
  });

  afterEach(() => {
    delete window.switchToTab;
  });

  it('renders next-day forecast chips and routes to Weather tab', async () => {
    const user = userEvent.setup();
    render(<GameHeader />);

    expect(screen.getByRole('button', { name: 'Open Weather' })).toBeInTheDocument();
    expect(screen.getByText('Forecast')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('☀️')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open weather forecast Tomorrow' }));
    expect(switchToTabSpy).toHaveBeenCalledWith('weather');
  });
});
