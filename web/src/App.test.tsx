import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'
import { createNewFarmState } from './data'
import { saveFarmState } from './storage'

beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); localStorage.clear(); window.history.replaceState(null, '', '#overview') })
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })
const click = (name: string | RegExp) => {
  const button = screen.getByRole('button', { name, hidden: true })
  expect(button).toBeVisible()
  fireEvent.click(button)
}

describe('Active FarmSim player workflows', () => {
  it('plants, grows, harvests, sells, restocks, and reloads a real save', () => {
    const game = render(<App />)
    click('Plant Wheat')
    click('Plant 4 wheat plots')
    for (let day = 0; day < 4; day++) {
      const water = screen.queryByRole('button', { name: 'Water 4 plots', hidden: true })
      if (water) fireEvent.click(water)
      click('Advance to next day')
    }
    click('Harvest 4 plots')
    click('Homestead')
    click(/Town market/)
    expect(screen.getByRole('tabpanel', { name: 'Market' })).toBeVisible()
    click('Sell all 12 Wheat for $26.40')
    click('Buy 10 Wheat seeds for $10.00')
    const saved = JSON.parse(localStorage.getItem('farmsim-state-v2')!)
    expect(saved).toMatchObject({ schemaVersion: 3, farm: { day: 5, money: 136.4, seedStock: { wheat: 14 }, inventory: { wheat: 0 }, harvestedPlots: 4 } })
    game.unmount()
    render(<App />)
    expect(screen.getByText('$136.40')).toBeVisible()
    expect(screen.getByText('Day 5')).toBeVisible()
  })

  it('keeps growth duration independent of the next selected crop', () => {
    const farm = createNewFarmState()
    farm.plots[6] = { ...farm.plots[6], crop: 'wheat', growthDays: 2, watered: false }
    farm.selectedPlotIds = []
    saveFarmState(farm)
    window.history.replaceState(null, '', '#planning')
    render(<App />)
    click(/Tomato/)
    expect(screen.getByRole('button', { name: 'Plot 7: Wheat, 2 of 4 growth days, needs water' })).toBeInTheDocument()
    expect(screen.getByText('2 / 4 days · 0 watered')).toBeInTheDocument()
  })

  it('makes tab selection meaningful and keyboard navigable', () => {
    window.history.replaceState(null, '', '#barn')
    render(<App />)
    const market = screen.getByRole('tab', { name: 'Market' })
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Barn' }), { key: 'ArrowRight' })
    expect(market).toHaveAttribute('aria-selected', 'true')
    expect(market).toHaveFocus()
    expect(screen.queryByRole('tabpanel', { name: 'Barn' })).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Barn & Market' })).toBeVisible()
  })

  it('reports growth truthfully when rain waters the crops', () => {
    const farm = createNewFarmState()
    farm.weather = 'Rainy'
    farm.plots[6] = { ...farm.plots[6], crop: 'wheat', growthDays: 0, watered: false }
    farm.selectedPlotIds = []
    saveFarmState(farm)
    render(<App />)
    click('Advance to next day')
    expect(screen.queryByText(/unwatered crops did not grow/)).toBeNull()
    const saved = JSON.parse(localStorage.getItem('farmsim-state-v2')!)
    expect(saved.farm.plots[6].growthDays).toBe(1)
  })

  it('shows a persistent warning when saving is disabled by a newer file', () => {
    const file = JSON.stringify({ schemaVersion: 999, farm: { money: 999 } })
    localStorage.setItem('farmsim-state-v2', file)
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('will not overwrite')
    click('Advance to next day')
    expect(localStorage.getItem('farmsim-state-v2')).toBe(file)
  })
})
