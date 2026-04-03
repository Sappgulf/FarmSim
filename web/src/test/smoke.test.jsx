import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import FarmSim from '../components/farm-sim/core/FarmSim';
import { GameProvider } from '../components/farm-sim/context/GameContext';

// Mock the complex systems to isolate UI testing
vi.mock('../components/farm-sim/systems/SoundSystem', () => ({
    getSoundSystem: () => ({
        setEnabled: vi.fn(),
        resume: vi.fn().mockResolvedValue(),
        play: vi.fn(),
        stop: vi.fn(),
    })
}));

vi.mock('../components/farm-sim/systems/MusicSystem', () => ({
    getMusicSystem: () => ({
        setEnabled: vi.fn(),
        resume: vi.fn().mockResolvedValue(),
        play: vi.fn(),
        stop: vi.fn(),
        setSeason: vi.fn(),
        isPlaying: false
    })
}));

describe('FarmSim Smoke Test', () => {
    it('renders the game without crashing', async () => {
        render(
            <GameProvider>
                <FarmSim />
            </GameProvider>
        );

        expect(screen.getByTestId('start-screen')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /start farming/i }));

        await waitFor(() => {
            expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
        });

        expect(screen.getAllByText(/Farming/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Shop/i).length).toBeGreaterThan(0);

        // Check if plot grid rendered (might be harder to text-match, so we check existence)
        // Assuming plots have some identifiable role or class, or we just trust the text checks for now.
    });
});
