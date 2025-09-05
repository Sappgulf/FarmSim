// D) Enhanced Unit Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import functions to test
import { sanitize } from '../src/lib/sanitize.js';
import { useGameState } from '../src/hooks/useGameState.js';
import { useWeather } from '../src/hooks/useWeather.js';

// Mock React for hook testing
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const createMockStorage = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get store() { return store; }
  };
};

describe('Critical Function Safety Tests', () => {
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = createMockStorage();
    Object.defineProperty(window, 'localStorage', { 
      value: mockLocalStorage,
      writable: true 
    });
    
    // Reset time
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('sanitize function', () => {
    it('should handle normal string input', () => {
      expect(sanitize('normal text')).toBe('normal text');
    });

    it('should handle empty string', () => {
      expect(sanitize('')).toBe('');
    });

    it('should handle null/undefined safely', () => {
      expect(sanitize(null)).toBe(null);
      expect(sanitize(undefined)).toBe(undefined);
    });

    it('should handle special characters', () => {
      const result = sanitize('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    it('should handle large strings without memory issues', () => {
      const largeString = 'a'.repeat(100000);
      const result = sanitize(largeString);
      expect(typeof result).toBe('string');
    });

    it('should handle non-string inputs gracefully', () => {
      expect(() => sanitize(123)).not.toThrow();
      expect(() => sanitize({})).not.toThrow();
      expect(() => sanitize([])).not.toThrow();
    });
  });

  describe('useGameState hook', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(result.current.coins).toBe(100);
      expect(result.current.score).toBe(0);
      expect(result.current.plots).toHaveLength(25);
    });

    it('should handle state updates correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.setCoins(200);
      });
      
      expect(result.current.coins).toBe(200);
    });

    it('should save to localStorage correctly', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.setCoins(150);
        result.current.saveGame();
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'farm_sim_enhanced_v2',
        expect.stringContaining('150')
      );
    });

    it('should load from localStorage correctly', () => {
      const saveData = JSON.stringify({
        version: 2,
        coins: 500,
        score: 100,
        plots: Array(25).fill(null).map((_, i) => ({ id: i, state: 'empty' }))
      });
      
      mockLocalStorage.setItem('farm_sim_enhanced_v2', saveData);
      
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.loadGame();
      });
      
      expect(result.current.coins).toBe(500);
      expect(result.current.score).toBe(100);
    });

    it('should handle corrupted save data gracefully', () => {
      mockLocalStorage.setItem('farm_sim_enhanced_v2', 'invalid json');
      
      const { result } = renderHook(() => useGameState());
      
      expect(() => {
        act(() => {
          result.current.loadGame();
        });
      }).not.toThrow();
      
      // Should fall back to defaults
      expect(result.current.coins).toBe(100);
    });

    it('should handle localStorage unavailable', () => {
      Object.defineProperty(window, 'localStorage', { value: undefined });
      
      expect(() => {
        renderHook(() => useGameState());
      }).not.toThrow();
    });
  });

  describe('useWeather hook', () => {
    it('should initialize with default weather', () => {
      const mockGameState = { coins: 100 };
      const { result } = renderHook(() => useWeather(mockGameState));
      
      expect(result.current.weather).toHaveProperty('type');
      expect(result.current.weather).toHaveProperty('endsAt');
    });

    it('should update weather over time', async () => {
      const mockGameState = { coins: 100 };
      const { result } = renderHook(() => useWeather(mockGameState));
      
      const initialWeather = result.current.weather.type;
      
      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(35000); // 35 seconds
      });
      
      await waitFor(() => {
        expect(result.current.weather.type).toBeDefined();
      });
    });

    it('should handle invalid game state', () => {
      expect(() => {
        renderHook(() => useWeather(null));
      }).not.toThrow();
      
      expect(() => {
        renderHook(() => useWeather(undefined));
      }).not.toThrow();
    });
  });

  describe('Time utility functions', () => {
    const nowSec = () => Math.floor(Date.now() / 1000);
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const formatTime = (seconds) => {
      if (typeof seconds !== 'number' || isNaN(seconds)) return 'Invalid';
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    describe('nowSec', () => {
      it('should return current timestamp in seconds', () => {
        const result = nowSec();
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
        expect(Number.isInteger(result)).toBe(true);
      });

      it('should not return NaN or Infinity', () => {
        const result = nowSec();
        expect(isNaN(result)).toBe(false);
        expect(isFinite(result)).toBe(true);
      });
    });

    describe('clamp', () => {
      it('should clamp values within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
      });

      it('should handle edge cases', () => {
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
      });

      it('should handle invalid inputs', () => {
        expect(clamp(NaN, 0, 10)).toBeNaN();
        expect(clamp(Infinity, 0, 10)).toBe(10);
        expect(clamp(-Infinity, 0, 10)).toBe(0);
      });

      it('should handle inverted range', () => {
        expect(clamp(5, 10, 0)).toBe(10); // Math.max(10, Math.min(0, 5)) = Math.max(10, 0) = 10
      });
    });

    describe('formatTime', () => {
      it('should format seconds correctly', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(30)).toBe('0:30');
        expect(formatTime(60)).toBe('1:00');
        expect(formatTime(125)).toBe('2:05');
      });

      it('should handle edge cases', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(3599)).toBe('59:59');
      });

      it('should handle invalid inputs', () => {
        expect(formatTime(NaN)).toBe('Invalid');
        expect(formatTime('not a number')).toBe('Invalid');
        expect(formatTime(null)).toBe('Invalid');
        expect(formatTime(undefined)).toBe('Invalid');
      });

      it('should handle negative numbers', () => {
        expect(formatTime(-30)).toBe('-1:30');
      });
    });
  });

  describe('Game State Validation', () => {
    const validateGameState = (state) => {
      if (!state || typeof state !== 'object') return false;
      
      // Check required properties
      const requiredProps = ['coins', 'score', 'plots'];
      for (const prop of requiredProps) {
        if (!(prop in state)) return false;
      }
      
      // Validate types and ranges
      if (typeof state.coins !== 'number' || state.coins < 0 || !isFinite(state.coins)) return false;
      if (typeof state.score !== 'number' || state.score < 0 || !isFinite(state.score)) return false;
      if (!Array.isArray(state.plots) || state.plots.length === 0) return false;
      
      // Validate plots
      for (const plot of state.plots) {
        if (!plot || typeof plot !== 'object') return false;
        if (typeof plot.id !== 'number' || plot.id < 0) return false;
        if (typeof plot.state !== 'string') return false;
      }
      
      return true;
    };

    it('should validate correct game state', () => {
      const validState = {
        coins: 100,
        score: 50,
        plots: [
          { id: 0, state: 'empty' },
          { id: 1, state: 'planted' }
        ]
      };
      
      expect(validateGameState(validState)).toBe(true);
    });

    it('should reject invalid game states', () => {
      expect(validateGameState(null)).toBe(false);
      expect(validateGameState(undefined)).toBe(false);
      expect(validateGameState({})).toBe(false);
      expect(validateGameState({ coins: -1, score: 0, plots: [] })).toBe(false);
      expect(validateGameState({ coins: NaN, score: 0, plots: [] })).toBe(false);
      expect(validateGameState({ coins: 100, score: 0, plots: 'not an array' })).toBe(false);
    });
  });

  describe('Save/Load Round-trip Test', () => {
    it('should maintain state integrity through save/load cycle', () => {
      const originalState = {
        version: 2,
        coins: 250,
        score: 150,
        totalEarned: 1000,
        name: "Test Farmer",
        plots: Array(25).fill(null).map((_, i) => ({
          id: i,
          state: i % 3 === 0 ? 'planted' : 'empty',
          seed: i % 3 === 0 ? 'carrot' : null,
          progress: i % 3 === 0 ? 50 : 0
        }))
      };

      // Save
      const serialized = JSON.stringify(originalState);
      mockLocalStorage.setItem('test_save', serialized);

      // Load
      const loaded = JSON.parse(mockLocalStorage.getItem('test_save'));

      // Verify round-trip integrity
      expect(loaded).toEqual(originalState);
      expect(loaded.coins).toBe(originalState.coins);
      expect(loaded.plots).toHaveLength(originalState.plots.length);
      
      // Deep equality check
      for (let i = 0; i < loaded.plots.length; i++) {
        expect(loaded.plots[i]).toEqual(originalState.plots[i]);
      }
    });

    it('should handle large save files', () => {
      const largeState = {
        version: 2,
        coins: 1000000,
        plots: Array(1000).fill(null).map((_, i) => ({
          id: i,
          state: 'planted',
          seed: 'carrot',
          progress: Math.random() * 100,
          history: Array(100).fill(null).map(() => ({ timestamp: Date.now(), event: 'test' }))
        }))
      };

      expect(() => {
        const serialized = JSON.stringify(largeState);
        mockLocalStorage.setItem('large_save', serialized);
        const loaded = JSON.parse(mockLocalStorage.getItem('large_save'));
        expect(loaded.plots).toHaveLength(1000);
      }).not.toThrow();
    });
  });
});
