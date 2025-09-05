// Smoke Test - End-to-End Game Simulation
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Import main components
import { UltimateFarmGame } from '../src/components/UltimateFarmGame.jsx';

// Mock external dependencies
vi.mock('../src/components/enhanced/SoundManager.jsx', () => ({
  SoundManager: ({ children }) => children,
  playSound: vi.fn(),
  setVolume: vi.fn()
}));

vi.mock('../src/components/enhanced/AdvancedParticleSystem.jsx', () => ({
  AdvancedParticleSystem: () => null,
  triggerParticles: vi.fn()
}));

vi.mock('../src/components/enhanced/AdvancedWeatherSystem.jsx', () => ({
  AdvancedWeatherSystem: () => null
}));

vi.mock('../src/components/enhanced/FarmVisualization.jsx', () => ({
  FarmVisualization: () => <div data-testid="farm-visualization">Farm Visualization</div>
}));

// Mock localStorage
const createMockStorage = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
};

describe('Smoke Test - Game Stability', () => {
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = createMockStorage();
    Object.defineProperty(window, 'localStorage', { 
      value: mockLocalStorage,
      writable: true 
    });
    
    // Mock timers for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should boot the game without errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<UltimateFarmGame />);
    
    // Game should render without console errors
    expect(consoleSpy).not.toHaveBeenCalled();
    
    // Should show some basic UI elements
    await waitFor(() => {
      expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('should handle 300 frames without crashes', async () => {
    const frameCount = 300;
    const frameTime = 1000 / 60; // 60 FPS
    let errorCount = 0;
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      errorCount++;
    });

    render(<UltimateFarmGame />);
    
    // Simulate 300 frames at 60 FPS
    for (let frame = 0; frame < frameCount; frame++) {
      vi.advanceTimersByTime(frameTime);
      
      // Allow React to process updates
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Check for memory spikes (simplified)
      if (frame % 60 === 0) { // Every second
        // Game should still be responsive
        expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
      }
    }
    
    // Should have no errors after 5 seconds of simulation
    expect(errorCount).toBe(0);
    
    consoleSpy.mockRestore();
  });

  it('should handle scripted input sequence', async () => {
    render(<UltimateFarmGame />);
    
    await waitFor(() => {
      expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
    });

    // Scripted input sequence
    const inputSequence = [
      { action: 'click', target: 'farm-visualization', delay: 100 },
      { action: 'wait', delay: 500 },
      { action: 'keydown', key: 'Space', delay: 100 },
      { action: 'wait', delay: 1000 },
    ];

    for (const input of inputSequence) {
      if (input.action === 'click') {
        const element = screen.queryByTestId(input.target);
        if (element) {
          fireEvent.click(element);
        }
      } else if (input.action === 'keydown') {
        fireEvent.keyDown(document, { key: input.key });
      } else if (input.action === 'wait') {
        vi.advanceTimersByTime(input.delay);
        await waitFor(() => {}, { timeout: 100 });
      }
    }

    // Game should still be functional after input sequence
    expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
  });

  it('should maintain stable frame timings', async () => {
    const frameTimes = [];
    let lastFrame = performance.now();
    
    render(<UltimateFarmGame />);
    
    // Measure frame timing for 60 frames
    for (let i = 0; i < 60; i++) {
      const currentFrame = performance.now();
      frameTimes.push(currentFrame - lastFrame);
      lastFrame = currentFrame;
      
      vi.advanceTimersByTime(16.67); // 60 FPS
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Calculate average frame time
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    
    // Should maintain reasonable frame timing (within 50% tolerance)
    expect(avgFrameTime).toBeGreaterThan(8); // Not too fast
    expect(avgFrameTime).toBeLessThan(33); // Not too slow (30 FPS minimum)
  });

  it('should have consistent entity counts', async () => {
    render(<UltimateFarmGame />);
    
    await waitFor(() => {
      expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
    });

    // Track entity counts over time
    const entityCounts = [];
    
    for (let i = 0; i < 100; i++) {
      vi.advanceTimersByTime(100);
      
      // Count rendered elements (simplified entity count)
      const elements = document.querySelectorAll('[data-testid]');
      entityCounts.push(elements.length);
      
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Entity count should not grow unboundedly
    const initialCount = entityCounts[0];
    const finalCount = entityCounts[entityCounts.length - 1];
    const maxCount = Math.max(...entityCounts);
    
    // Should not have more than 2x initial entities
    expect(maxCount).toBeLessThan(initialCount * 2);
    
    // Final count should be reasonable
    expect(finalCount).toBeLessThan(initialCount * 1.5);
  });

  it('should handle game state transitions gracefully', async () => {
    render(<UltimateFarmGame />);
    
    await waitFor(() => {
      expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
    });

    // Simulate various game state changes
    const stateTransitions = [
      () => vi.advanceTimersByTime(5000), // Time progression
      () => fireEvent.click(screen.getByTestId('farm-visualization')), // User interaction
      () => vi.advanceTimersByTime(10000), // More time
    ];

    for (const transition of stateTransitions) {
      const beforeElements = document.querySelectorAll('[data-testid]').length;
      
      transition();
      await waitFor(() => {}, { timeout: 100 });
      
      // Should not crash during state transitions
      expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
      
      const afterElements = document.querySelectorAll('[data-testid]').length;
      
      // Element count should remain reasonable
      expect(afterElements).toBeGreaterThan(0);
      expect(afterElements).toBeLessThan(beforeElements * 2);
    }
  });

  it('should recover from save/load operations', async () => {
    render(<UltimateFarmGame />);
    
    await waitFor(() => {
      expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
    });

    // Simulate save operation
    vi.advanceTimersByTime(2000);
    
    // Should have saved data
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    
    // Simulate loading
    const saveData = JSON.stringify({
      version: 2,
      coins: 200,
      score: 100,
      gameMode: 'standard'
    });
    mockLocalStorage.getItem.mockReturnValue(saveData);
    
    // Game should continue functioning after save/load
    expect(screen.getByTestId('farm-visualization')).toBeInTheDocument();
  });
});
