import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FarmGrid } from '../components/farm/FarmGrid'

const mockPlots = [
  { state: 'empty', progress: 0, seed: null },
  { state: 'planted', progress: 0.5, seed: { name: 'Wheat', emoji: '🌾' } },
  { state: 'ready', progress: 1, seed: { name: 'Corn', emoji: '🌽' } },
  { state: 'empty', progress: 0, seed: null },
  { state: 'withered', progress: 0.8, seed: { name: 'Tomato', emoji: '🍅' } },
  { state: 'empty', progress: 0, seed: null },
  { state: 'planted', progress: 0.3, seed: { name: 'Carrot', emoji: '🥕' } },
  { state: 'empty', progress: 0, seed: null },
  { state: 'empty', progress: 0, seed: null },
]

describe('FarmGrid Component', () => {
  const defaultProps = {
    plots: mockPlots,
    gridSize: 3,
    selectedSeed: 'wheat',
    onPlotClick: vi.fn(),
    onPlotRightClick: vi.fn(),
    animationsEnabled: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render correct number of plots', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const plotElements = screen.getAllByRole('button')
      expect(plotElements).toHaveLength(9) // 3x3 grid = 9 plots
    })

    it('should display plot states correctly', () => {
      render(<FarmGrid {...defaultProps} />)
      
      // Check for ready crop (should show harvest emoji)
      expect(screen.getByText('🌽')).toBeInTheDocument()
      
      // Check for withered crop
      expect(screen.getByText('💀')).toBeInTheDocument()
    })

    it('should show progress indicators for growing crops', () => {
      render(<FarmGrid {...defaultProps} />)
      
      // Should have progress bars for planted crops
      const progressBars = document.querySelectorAll('.progress-bar')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  describe('Interactions', () => {
    it('should call onPlotClick when plot is clicked', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const firstPlot = screen.getAllByRole('button')[0]
      fireEvent.click(firstPlot)
      
      expect(defaultProps.onPlotClick).toHaveBeenCalledWith(0)
    })

    it('should call onPlotRightClick on right click', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const firstPlot = screen.getAllByRole('button')[0]
      fireEvent.contextMenu(firstPlot)
      
      expect(defaultProps.onPlotRightClick).toHaveBeenCalledWith(0)
    })

    it('should prevent context menu on right click', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const firstPlot = screen.getAllByRole('button')[0]
      const contextMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      })
      
      Object.defineProperty(contextMenuEvent, 'preventDefault', {
        value: vi.fn(),
      })
      
      firstPlot.dispatchEvent(contextMenuEvent)
      expect(contextMenuEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('Visual States', () => {
    it('should apply different styles for different plot states', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const plots = screen.getAllByRole('button')
      
      // Empty plot should have empty styling
      expect(plots[0]).toHaveClass('border-gray-300')
      
      // Ready plot should have ready styling  
      expect(plots[2]).toHaveClass('border-green-500')
      
      // Withered plot should have withered styling
      expect(plots[4]).toHaveClass('border-red-500')
    })

    it('should show correct emoji for each plot state', () => {
      render(<FarmGrid {...defaultProps} />)
      
      // Empty plots should show selected seed emoji or default
      expect(screen.getByText('🌾')).toBeInTheDocument() // wheat selected
      
      // Growing plot should show growing emoji
      expect(screen.getByText('🌱')).toBeInTheDocument()
      
      // Ready plot should show crop emoji
      expect(screen.getByText('🌽')).toBeInTheDocument()
      
      // Withered plot should show death emoji
      expect(screen.getByText('💀')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should apply correct grid layout based on gridSize', () => {
      render(<FarmGrid {...defaultProps} gridSize={4} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveStyle('grid-template-columns: repeat(4, 1fr)')
    })

    it('should handle different grid sizes', () => {
      const { rerender } = render(<FarmGrid {...defaultProps} gridSize={2} />)
      
      let gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveStyle('grid-template-columns: repeat(2, 1fr)')
      
      rerender(<FarmGrid {...defaultProps} gridSize={5} />)
      gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveStyle('grid-template-columns: repeat(5, 1fr)')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const plots = screen.getAllByRole('button')
      plots.forEach((plot, index) => {
        expect(plot).toHaveAttribute('aria-label', expect.stringContaining(`Plot ${index + 1}`))
      })
    })

    it('should be keyboard navigable', () => {
      render(<FarmGrid {...defaultProps} />)
      
      const firstPlot = screen.getAllByRole('button')[0]
      firstPlot.focus()
      
      fireEvent.keyDown(firstPlot, { key: 'Enter' })
      expect(defaultProps.onPlotClick).toHaveBeenCalledWith(0)
    })
  })

  describe('Animations', () => {
    it('should apply animation classes when enabled', () => {
      render(<FarmGrid {...defaultProps} animationsEnabled={true} />)
      
      const plots = screen.getAllByRole('button')
      plots.forEach(plot => {
        expect(plot).toHaveClass('transition-all')
      })
    })

    it('should not apply animation classes when disabled', () => {
      render(<FarmGrid {...defaultProps} animationsEnabled={false} />)
      
      const plots = screen.getAllByRole('button')
      plots.forEach(plot => {
        expect(plot).not.toHaveClass('transition-all')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty plots array', () => {
      render(<FarmGrid {...defaultProps} plots={[]} />)
      
      const plots = screen.queryAllByRole('button')
      expect(plots).toHaveLength(0)
    })

    it('should handle null seed data gracefully', () => {
      const plotsWithNullSeed = [
        { state: 'planted', progress: 0.5, seed: null }
      ]
      
      render(<FarmGrid {...defaultProps} plots={plotsWithNullSeed} />)
      
      // Should not crash and should render something
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
