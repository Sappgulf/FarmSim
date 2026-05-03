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

    // Check for main game elements
    // We expect the Header, Grid, and Sidebar to be present
    // Using simple text matchers for things likely to be in the UI

    // Header usually shows coins/level
    expect(screen.getByText(/Level 1/i)).toBeInTheDocument();

    // Sidebar usually has tabs
    expect(screen.getByText(/Farming/i)).toBeInTheDocument();
    expect(screen.getByText(/Shop/i)).toBeInTheDocument();

    // Check if plot grid rendered (might be harder to text-match, so we check existence)
    // Assuming plots have some identifiable role or class, or we just trust the text checks for now.
  });
});
