import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameState } from '../hooks/useGameState'

describe('useGameState Hook', () => {
  let result

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useGameState())
    result = hookResult
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(result.current.coins).toBe(100)
      expect(result.current.score).toBe(0)
      expect(result.current.levelId).toBe('lvl1')
      expect(result.current.prestigeLevel).toBe(0)
      expect(result.current.plots).toHaveLength(25) // Should be 25 plots, not 9
      expect(result.current.notifications).toHaveLength(0)
    })

    it('should initialize plots with empty state', () => {
      result.current.plots.forEach(plot => {
        expect(plot.state).toBe('empty')
        expect(plot.progress).toBe(0)
      })
    })
  })

  describe('Coin Management', () => {
    it('should add coins correctly', () => {
      act(() => {
        result.current.addCoins(50)
      })
      expect(result.current.coins).toBe(150)
    })

    it('should spend coins when sufficient funds available', () => {
      let success
      act(() => {
        success = result.current.spendCoins(30)
      })
      expect(success).toBe(true)
      expect(result.current.coins).toBe(70)
    })

    it('should not spend coins when insufficient funds', () => {
      let success
      act(() => {
        success = result.current.spendCoins(200)
      })
      expect(success).toBe(false)
      expect(result.current.coins).toBe(100) // Should remain unchanged
    })

    it('should handle fractional coin amounts', () => {
      act(() => {
        result.current.addCoins(25.75)
      })
      expect(result.current.coins).toBe(125.75)
    })
  })

  describe('Notification System', () => {
    it('should add notifications with correct properties', () => {
      act(() => {
        result.current.addNotification('Test message', 'success')
      })

      const notification = result.current.notifications[0]
      expect(notification.message).toBe('Test message')
      expect(notification.type).toBe('success')
      expect(notification.id).toBeDefined()
      expect(notification.timestamp).toBeDefined()
    })

    it('should limit notifications to maximum of 5', () => {
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.addNotification(`Message ${i}`, 'info')
        }
      })

      expect(result.current.notifications).toHaveLength(5)
      expect(result.current.notifications[0].message).toBe('Message 2') // First two should be removed
    })

    it('should auto-dismiss notifications after timeout', async () => {
      act(() => {
        result.current.addNotification('Auto dismiss test', 'info')
      })

      expect(result.current.notifications).toHaveLength(1)

      // Fast-forward time past the auto-dismiss timeout
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(result.current.notifications).toHaveLength(0)
    })
  })

  describe('Game State Utilities', () => {
    it('should provide current time in seconds', () => {
      const time1 = result.current.nowSec()
      vi.advanceTimersByTime(1000)
      const time2 = result.current.nowSec()
      
      expect(time2 - time1).toBeGreaterThanOrEqual(1)
    })

    it('should handle pause functionality', () => {
      expect(result.current.paused).toBe(false)
      
      act(() => {
        result.current.setPaused(true)
      })
      
      expect(result.current.paused).toBe(true)
    })
  })

  describe('Inventory Management', () => {
    it('should update inventory correctly', () => {
      act(() => {
        result.current.setInventory({ wheat: 5, corn: 3 })
      })

      expect(result.current.inventory.wheat).toBe(5)
      expect(result.current.inventory.corn).toBe(3)
    })

    it('should handle inventory updates with functions', () => {
      act(() => {
        result.current.setInventory(prev => ({ ...prev, wheat: 10 }))
      })

      expect(result.current.inventory.wheat).toBe(10)
    })
  })

  describe('Building Management', () => {
    it('should track building ownership', () => {
      act(() => {
        result.current.setBuildings({ barn: 2, greenhouse: 1 })
      })

      expect(result.current.buildings.barn).toBe(2)
      expect(result.current.buildings.greenhouse).toBe(1)
    })
  })

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0
      
      renderHook(() => {
        renderCount++
        return useGameState()
      })

      // Initial render
      expect(renderCount).toBe(1)

      // State updates should be batched
      act(() => {
        result.current.addCoins(10)
        result.current.spendCoins(5)
      })

      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThan(5)
    })
  })
})
