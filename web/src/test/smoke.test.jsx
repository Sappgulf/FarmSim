import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FarmSim from '../components/farm-sim/core/FarmSim';
import { GameProvider } from '../components/farm-sim/context/GameContext';

// Mock the complex systems to isolate UI testing
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

describe('FarmSim Smoke Test', () => {
  it('renders the game without crashing', async () => {
    render(
      <GameProvider>
        <FarmSim />
      </GameProvider>
    );

    expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Farm gameplay and controls' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Farm playfield' })).toHaveAttribute(
      'data-mobile-priority',
      'primary'
    );
    expect(screen.getByRole('complementary', { name: 'Farm tools' })).toHaveAttribute(
      'data-mobile-priority',
      'support'
    );
    expect(screen.getByRole('navigation', { name: 'Game section navigation' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Open Farming' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Items\. Items, shop, and processing/i })
    ).toBeInTheDocument();
  });
});
