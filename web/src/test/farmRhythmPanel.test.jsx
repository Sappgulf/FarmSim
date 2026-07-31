import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FarmRhythmPanel from '../components/farm-sim/ui/FarmRhythmPanel';

const mockActions = {
  harvestAllReadyCrops: vi.fn(),
  treatAllDiseases: vi.fn(),
  waterAllPlots: vi.fn(),
  prepareWeatherPlan: vi.fn(),
  setSelectedCrop: vi.fn(),
  addNotification: vi.fn(),
};

let mockState;

vi.mock('../components/farm-sim/context/GameContext', () => ({
  useGameActions: () => mockActions,
  useGameSelector: (selector) => selector(mockState),
}));

describe('FarmRhythmPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      plots: [
        { state: 'ready', crop: { id: 'lettuce' }, waterLevel: 100 },
        { state: 'growing', crop: { id: 'carrot' }, waterLevel: 20 },
        { state: 'withered', crop: { id: 'corn' }, waterLevel: 10 },
        { state: 'empty', crop: null, waterLevel: 100 },
      ],
      livestock: {
        animals: [{ hunger: 82, happiness: 70, health: 100, hasProduct: true }],
      },
      dailyChallenges: [{ completed: true, claimed: false }],
      dailyQuests: { quests: [{ completed: true, claimed: false }] },
      inventory: { lettuce: 1 },
      coins: 140,
      level: 1,
      weather: 'rainy',
      weatherPlan: 'observe',
      weatherForecast: ['sunny', 'cloudy'],
      season: {
        config: {
          name: 'Spring',
          bonuses: { growthSpeed: 1.25, marketPrices: 1 },
          description: 'Perfect growing conditions.',
        },
      },
      farmTheme: 'meadow',
      cozyExpansion: { farmTitles: { activeId: 'home_grower' } },
    };
  });

  it('summarizes today and runs the highest priority action', async () => {
    const user = userEvent.setup();
    render(<FarmRhythmPanel onNavigate={vi.fn()} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Spring')).toBeInTheDocument();
    expect(screen.getByText('Rainy')).toBeInTheDocument();
    expect(screen.getByText('+25% growth · rain helps water')).toBeInTheDocument();
    expect(screen.getByText('Next unlock:')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Harvest Ready/i }));

    expect(mockActions.harvestAllReadyCrops).toHaveBeenCalledTimes(1);
  });

  it('routes to animals when care/product needs are the next best move', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockState.plots = mockState.plots.map((plot) => ({ ...plot, state: 'growing' }));

    render(<FarmRhythmPanel onNavigate={navigate} />);

    await user.click(screen.getByRole('button', { name: /Check Animals/i }));

    expect(navigate).toHaveBeenCalledWith('livestock');
  });

  it('runs the weather field plan from the rhythm panel', async () => {
    const user = userEvent.setup();
    mockState.weather = 'sunny';

    render(<FarmRhythmPanel onNavigate={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Tend the beds/i }));

    expect(mockActions.prepareWeatherPlan).toHaveBeenCalledTimes(1);
  });
});
