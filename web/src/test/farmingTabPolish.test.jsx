import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FarmingTab from '../components/farm-sim/ui/tabs/FarmingTab';

const mockActions = {
  setSelectedCrop: vi.fn(),
  addNotification: vi.fn(),
  waterAllPlots: vi.fn(),
  harvestAllReadyCrops: vi.fn(),
  fertilizeAllPlots: vi.fn(),
  treatAllDiseases: vi.fn(),
};

const mockState = {
  level: 1,
  coins: 140,
  selectedCrop: null,
  inventory: {},
  season: {
    current: 'spring',
    config: { name: 'Spring' },
  },
  weather: 'sunny',
  plots: Array.from({ length: 4 }, () => ({ state: 'empty', soilFertility: 1 })),
};

vi.mock('../components/farm-sim/context/GameContext', () => ({
  useGame: () => ({ state: mockState, actions: mockActions }),
}));

describe('FarmingTab polish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders crop choices as real buttons with a single farm quick-action surface', async () => {
    const user = userEvent.setup();

    render(<FarmingTab />);

    expect(screen.getByText('Field advice')).toBeInTheDocument();
    expect(screen.getByText('One action surface for board-wide farm work.')).toBeInTheDocument();

    const waterAction = screen.getByRole('button', {
      name: 'Water, 0. No dry active plots',
    });
    expect(waterAction).toBeDisabled();

    const carrotButton = screen.getByRole('button', {
      name: /Select Carrot\. Costs 12 coins, grows in 60 seconds, sells for 24 coins/,
    });
    await user.click(carrotButton);

    expect(mockActions.setSelectedCrop).toHaveBeenCalledWith('carrot');
    expect(mockActions.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info' })
    );
  });
});
