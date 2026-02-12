import { describe, it, expect, vi } from 'vitest';
import GameContext, { GameProvider, useGame } from '../components/farm-sim/context/GameContext'; // check export later
import { renderHook, act } from '@testing-library/react';

// Access internal functions if possible, but GameContext usually doesn't export them directly.
// We will test via the Provider's context values.

// Mock systems
vi.mock('../components/farm-sim/systems/SoundSystem', () => ({
    getSoundSystem: () => ({ setEnabled: vi.fn(), resume: vi.fn(), play: vi.fn() })
}));
vi.mock('../components/farm-sim/systems/MusicSystem', () => ({
    getMusicSystem: () => ({ setEnabled: vi.fn(), setSeason: vi.fn(), stop: vi.fn() })
}));

describe('Save System Stability', () => {
    // Clear localStorage before each test
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('should load default state when no save exists', () => {
        const { result } = renderHook(() => useGame(), { wrapper: GameProvider });
        expect(result.current.state.coins).toBe(140); // Default coins
        expect(result.current.state.level).toBe(1);
    });

    it('should handle corrupted save data gracefully and fallback to default', () => {
        // Inject corrupted JSON
        localStorage.setItem('farm_sim_enhanced_v2', '{ "corrupted": true, "coins": "NaN" }');

        // We expect it to either load what it can or reset if validation fails
        // In this codebase, let's see behavior. Ideally it should not crash.

        // Note: The current GameContext implementation might try to migrate.
        // If migration fails, it might return null and load initial state.

        let result;
        expect(() => {
            const hook = renderHook(() => useGame(), { wrapper: GameProvider });
            result = hook.result;
        }).not.toThrow();

        // Check if critical state is preserved or reset
        // If it reset, coins should be 100.
        // If it loaded partial, coins might be NaN (which is bad).
        // The goal of this test is to ensure SAFETY.

        expect(result.current.state).toBeDefined();
        // Verify it's a valid number
        expect(typeof result.current.state.coins).toBe('number');
        expect(isNaN(result.current.state.coins)).toBe(false);
    });

    it('should persist game state after saving', () => {
        const { result } = renderHook(() => useGame(), { wrapper: GameProvider });

        act(() => {
            result.current.actions.setCoins(500);
        });

        // Split act to allow effect to run
        act(() => {
            result.current.actions.saveGame();
        });

        // Check localStorage
        const saved = JSON.parse(localStorage.getItem('farm_sim_enhanced_v2'));
        expect(saved.coins).toBe(500);
    });

    it('auto-save persists farmName changes even when tracked economy fields do not change', () => {
        vi.useFakeTimers();
        const rafMock = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => (
            setTimeout(() => callback(Date.now()), 1000)
        ));
        const cafMock = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
            clearTimeout(id);
        });

        try {
            const { result, unmount } = renderHook(() => useGame(), { wrapper: GameProvider });

            act(() => {
                vi.advanceTimersByTime(35000);
            });
            const firstSave = JSON.parse(localStorage.getItem('farm_sim_enhanced_v2'));
            expect(firstSave.farmName).toBe('Willowbrook Farm');

            act(() => {
                result.current.actions.setFarmName('Regression Acres');
            });

            act(() => {
                vi.advanceTimersByTime(35000);
            });
            const secondSave = JSON.parse(localStorage.getItem('farm_sim_enhanced_v2'));
            expect(secondSave.farmName).toBe('Regression Acres');

            unmount();
        } finally {
            rafMock.mockRestore();
            cafMock.mockRestore();
            vi.useRealTimers();
        }
    });

    it('auto-save persists plot layout changes without relying on economy fields', () => {
        vi.useFakeTimers();
        const rafMock = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => (
            setTimeout(() => callback(Date.now()), 1000)
        ));
        const cafMock = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
            clearTimeout(id);
        });

        try {
            const { result, unmount } = renderHook(() => useGame(), { wrapper: GameProvider });

            act(() => {
                vi.advanceTimersByTime(35000);
            });
            const firstSave = JSON.parse(localStorage.getItem('farm_sim_enhanced_v2'));
            expect(firstSave.plots[0].state).toBe('empty');

            const updatedPlot = {
                ...result.current.state.plots[0],
                state: 'decor',
                decorationId: 'stone_path',
                decorationPlacedAt: Date.now(),
                crop: null,
            };

            act(() => {
                result.current.actions.updatePlot(0, updatedPlot);
            });

            act(() => {
                vi.advanceTimersByTime(35000);
            });

            const secondSave = JSON.parse(localStorage.getItem('farm_sim_enhanced_v2'));
            expect(secondSave.plots[0].state).toBe('decor');
            expect(secondSave.plots[0].decorationId).toBe('stone_path');

            unmount();
        } finally {
            rafMock.mockRestore();
            cafMock.mockRestore();
            vi.useRealTimers();
        }
    });
});
