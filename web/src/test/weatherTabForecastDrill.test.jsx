import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeatherTab from '../components/farm-sim/ui/tabs/WeatherTab';

const mockActions = {
  addNotification: vi.fn(),
  earnMoney: vi.fn(),
  addXP: vi.fn(),
};

const mockState = {
  weather: 'rainy',
  weatherForecast: [
    { type: 'sunny', duration: 20 },
    { type: 'snow', duration: 24 },
    { type: 'windy', duration: 30 },
  ],
};

vi.mock('../components/farm-sim/context/GameContext', () => ({
  useGame: () => ({ state: mockState, actions: mockActions }),
}));

describe('WeatherTab forecast drill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the live forecast instead of a random pattern', async () => {
    const user = userEvent.setup();
    render(<WeatherTab />);

    await user.click(screen.getByRole('button', { name: /Start Forecast Drill/ }));

    expect(screen.getByText('Call the +3d forecast')).toBeInTheDocument();
    expect(screen.getAllByText('sunny').length).toBeGreaterThan(0);
    expect(screen.getAllByText('snow').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /Windy/ }));

    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    expect(mockActions.earnMoney).toHaveBeenCalledWith(60);
    expect(mockActions.addXP).toHaveBeenCalledWith(
      30,
      expect.objectContaining({ label: 'Forecast Drill' })
    );
  });
});
