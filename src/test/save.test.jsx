import { describe, it, expect, vi } from 'vitest';
import GameContext, { GameProvider, useGame } from '../components/farm-sim/context/GameContext'; // check export later
import { renderHook, act } from '@testing-library/react';
import { SAVE_BACKUP_KEY, SAVE_KEY } from '../components/farm-sim/context/GamePersistence';

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
        expect(result.current.state.coins).toBe(100); // Default coins
        expect(result.current.state.level).toBe(1);
    });

    it('should handle corrupted save data gracefully and fallback to default', () => {
        // Inject corrupted JSON
        localStorage.setItem(SAVE_KEY, '{ "corrupted": true, "coins": "NaN" }');

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
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        expect(saved.coins).toBe(500);
    });

    it('should keep a backup save before overwriting', () => {
        const initialSave = JSON.stringify({ coins: 250, saveVersion: 2 });
        localStorage.setItem(SAVE_KEY, initialSave);

        const { result } = renderHook(() => useGame(), { wrapper: GameProvider });

        act(() => {
            result.current.actions.setCoins(800);
            result.current.actions.saveGame();
        });

        const backup = JSON.parse(localStorage.getItem(SAVE_BACKUP_KEY));
        expect(backup.coins).toBe(250);
    });
});
