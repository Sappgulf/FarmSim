import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'
import { createNewFarmState } from './data'
import { saveFarmState } from './storage'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  // jsdom has no dialog implementation; native modal behavior is checked in the browser.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', ''); this.querySelector<HTMLElement>('[autofocus]')?.focus() } },
    close: { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open') } },
  })
  localStorage.clear()
  window.history.replaceState(null, '', '#overview')
})
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

  it('preserves progress written by another tab instead of overwriting it', () => {
    render(<App />)
    const otherFarm = { ...createNewFarmState(), day: 9, money: 450 }
    saveFarmState(otherFarm)
    const otherSave = localStorage.getItem('farmsim-state-v2')!
    fireEvent(window, new StorageEvent('storage', { key: 'farmsim-state-v2', newValue: otherSave }))
    click('Advance to next day')
    expect(localStorage.getItem('farmsim-state-v2')).toBe(otherSave)
    expect(screen.getByRole('alert')).toHaveTextContent('another tab')
  })

  it('sends an empty seed box to the shop with truthful advice', () => {
    const farm = createNewFarmState()
    farm.seedStock = { wheat: 0, tomato: 0, corn: 0 }
    saveFarmState(farm)
    render(<App />)
    click('Restock seeds')
    expect(screen.getByRole('tabpanel', { name: 'Market' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Seed shop' })).toBeVisible()
  })

  it('keeps focus on a clicked market tab', () => {
    window.history.replaceState(null, '', '#barn')
    render(<App />)
    const market = screen.getByRole('tab', { name: 'Market' })
    market.focus()
    fireEvent.click(market)
    expect(market).toHaveFocus()
  })

  it('disables redundant watering on rainy homestead plots', () => {
    const farm = createNewFarmState()
    farm.weather = 'Rainy'
    farm.plots[6] = { ...farm.plots[6], crop: 'wheat' }
    saveFarmState(farm)
    render(<App />)
    expect(screen.getByRole('button', { name: /Plot 7: Wheat.*rain watered/ })).toBeDisabled()
  })

  it('selects and clears all empty land without selecting planted or locked plots', () => {
    const farm = createNewFarmState()
    farm.plots[6] = { ...farm.plots[6], crop: 'wheat' }
    saveFarmState(farm)
    window.history.replaceState(null, '', '#planning')
    render(<App />)
    click('Select 18 empty plots')
    expect(screen.getByRole('button', { name: 'Plant 18 wheat plots' })).toBeDisabled()
    const saved = JSON.parse(localStorage.getItem('farmsim-state-v2')!)
    expect(saved.farm.selectedPlotIds).toHaveLength(18)
    expect(saved.farm.selectedPlotIds).not.toContain(6)
    click('Clear selection')
    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeDisabled()
  })

  it('lets a farm with $1 buy one seed while bulk purchases stay disabled', () => {
    saveFarmState({ ...createNewFarmState(), money: 1 })
    window.history.replaceState(null, '', '#barn/market')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Buy 10 Wheat seeds for $10.00' })).toBeDisabled()
    click('Buy 1 Wheat seed for $1.00')
    const saved = JSON.parse(localStorage.getItem('farmsim-state-v2')!)
    expect(saved.farm).toMatchObject({ money: 0, seedStock: { wheat: 9 } })
  })

  it('confirms cancellation after production starts and preserves ingredients on rejection', () => {
    const farm = createNewFarmState()
    farm.productionQueue = [{ id: 'batch', recipe: 'cheese', label: 'Cheese', icon: 'cheese', phase: 'in-progress', progress: 0.5, status: '1 / 2 days', remaining: 'Ready tomorrow' }]
    saveFarmState(farm)
    window.history.replaceState(null, '', '#barn')
    render(<App />)
    const cancel = screen.getByRole('button', { name: 'Cancel Cheese' })
    cancel.focus()
    click('Cancel Cheese')
    expect(screen.getByRole('dialog', { name: 'Cancel this batch?' })).toBeVisible()
    click('Keep batch')
    expect(cancel).toHaveFocus()
    expect(JSON.parse(localStorage.getItem('farmsim-state-v2')!).farm.productionQueue).toHaveLength(1)
    click('Cancel Cheese')
    click('Cancel batch anyway')
    expect(JSON.parse(localStorage.getItem('farmsim-state-v2')!).farm.productionQueue).toHaveLength(0)
    expect(JSON.parse(localStorage.getItem('farmsim-state-v2')!).farm.inventory.milk).toBe(0)
  })

  it('previews a valid backup, restores it only on confirmation, and keeps a recovery copy', async () => {
    render(<App />)
    const before = localStorage.getItem('farmsim-state-v2')!
    click('Open farm guide and saves')
    const file = new File(['backup'], 'farm.json', { type: 'application/json' })
    const backup = { schemaVersion: 3, farm: { ...createNewFarmState(), day: 9, money: 450 } }
    Object.defineProperty(file, 'text', { value: async () => JSON.stringify(backup) })
    fireEvent.change(screen.getByLabelText('Choose a backup to restore'), { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText('Restore day 9?')).toBeVisible())
    expect(localStorage.getItem('farmsim-state-v2')).toBe(before)
    click('Restore this farm')
    await waitFor(() => expect(screen.getByText('Day 9')).toBeVisible())
    expect(screen.getByText('$450.00')).toBeVisible()
    const recoveryKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)!).filter((key) => key.includes('-recovery-'))
    expect(recoveryKeys.some((key) => localStorage.getItem(key) === before)).toBe(true)
  })

  it('rejects malformed backup files without changing progress', async () => {
    render(<App />)
    const before = localStorage.getItem('farmsim-state-v2')
    click('Open farm guide and saves')
    const file = new File(['bad'], 'bad.json')
    Object.defineProperty(file, 'text', { value: async () => '{bad' })
    fireEvent.change(screen.getByLabelText('Choose a backup to restore'), { target: { files: [file] } })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('not valid JSON'))
    expect(localStorage.getItem('farmsim-state-v2')).toBe(before)
  })
})
