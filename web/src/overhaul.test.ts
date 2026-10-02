import { describe, expect, it } from 'vitest'
import { createNewFarmState, cropOptions, initialFarmState, seasonForDay } from './data'
import { farmReducer, type FarmAction } from './state'
import { loadFarmSession, migrateStoredState, saveFarmState } from './storage'

const act = (state: ReturnType<typeof createNewFarmState>, action: FarmAction) => farmReducer(state, action)
describe('Sustainable farm loop and transaction boundaries', () => {
  it('supports mixed crops, per-tile care, and per-crop harvests', () => {
    let farm = act({ ...createNewFarmState(), selectedPlotIds: [6] }, { type: 'PLANT_SELECTED_PLOTS', crop: 'wheat' })
    farm = act(farm, { type: 'TOGGLE_PLOT_SELECTION', plotId: 7 })
    farm = act(farm, { type: 'PLANT_SELECTED_PLOTS', crop: 'tomato' })
    for (let i = 0; i < 4; i++) farm = act(act(farm, { type: 'WATER_PLOTS' }), { type: 'ADVANCE_DAY' })
    expect(farm.plots[6].ready).toBe(true)
    expect(farm.plots[7]).toMatchObject({ crop: 'tomato', ready: false, growthDays: 4 })
    const harvest = act(farm, { type: 'HARVEST_PLOT', plotId: 6 })
    expect(harvest.inventory.wheat).toBe(3)
    expect(harvest.plots[7].crop).toBe('tomato')
    expect(act(harvest, { type: 'HARVEST_PLOT', plotId: 6 })).toBe(harvest)
  })
  it.each([NaN, Infinity, -1, 0, 1.5])('rejects quantity %s without changing state', (quantity) => {
    expect(act(initialFarmState, { type: 'SHIP_GOODS', orderId: 'wheat-order', quantity })).toBe(initialFarmState)
    expect(act(initialFarmState, { type: 'BUY_SEEDS', crop: 'wheat', quantity })).toBe(initialFarmState)
    expect(act(initialFarmState, { type: 'SELL_INVENTORY', item: 'wheat', quantity })).toBe(initialFarmState)
  })
  it('sells every crop and processed item for the displayed price, rounded to cents', () => {
    let farm = { ...createNewFarmState(), money: 0, inventory: { ...createNewFarmState().inventory, wheat: 3, tomato: 1, cheese: 1 } }
    farm = act(farm, { type: 'SELL_INVENTORY', item: 'wheat', quantity: 3 })
    farm = act(farm, { type: 'SELL_INVENTORY', item: 'tomato', quantity: 1 })
    farm = act(farm, { type: 'SELL_INVENTORY', item: 'cheese', quantity: 1 })
    expect(farm.money).toBe(22)
    expect(farm.shippedGoods).toBe(5)
  })
  it('replenishes seeds without overdrawing the ledger and unlocks land at level 2', () => {
    const fresh = createNewFarmState()
    const bought = act(fresh, { type: 'BUY_SEEDS', crop: 'tomato', quantity: 10 })
    expect(bought.money).toBe(90)
    expect(bought.seedStock.tomato).toBe(18)
    expect(act(bought, { type: 'BUY_SEEDS', crop: 'tomato', quantity: 100 })).toBe(bought)
    expect(act({ ...fresh, money: 500 }, { type: 'EXPAND_FARM' }).money).toBe(500)
    const expanded = act({ ...fresh, xp: 60, money: 500 }, { type: 'EXPAND_FARM' })
    expect(Object.values(expanded.plots).filter((plot) => plot.available)).toHaveLength(24)
    expect(expanded.money).toBe(0)
  })
  it('survives 120 simulated days with restocking, production, sales, and seasons', () => {
    let farm = createNewFarmState()
    for (let day = 0; day < 120; day++) {
      farm = act(farm, { type: 'HARVEST_PLOTS' })
      farm = act(farm, { type: 'COLLECT_ANIMAL_PRODUCTS', product: 'eggs' })
      farm = act(farm, { type: 'COLLECT_ANIMAL_PRODUCTS', product: 'milk' })
      farm = act(farm, { type: 'START_PRODUCTION', recipe: 'bread' })
      for (const item of [...farm.productionQueue]) if (item.phase === 'ready') farm = act(farm, { type: 'COLLECT_PRODUCTION', id: item.id })
      for (const [item, quantity] of Object.entries(farm.inventory)) if (quantity) farm = act(farm, { type: 'SELL_INVENTORY', item: item as keyof typeof farm.inventory, quantity })
      const free = Object.values(farm.plots).filter((plot) => plot.available && !plot.crop)
      if (free.length) {
        if (farm.seedStock.wheat < free.length) farm = act(farm, { type: 'BUY_SEEDS', crop: 'wheat', quantity: 30 })
        farm = act({ ...farm, selectedPlotIds: free.map((plot) => plot.id) }, { type: 'PLANT_SELECTED_PLOTS', crop: 'wheat' })
      }
      farm = act(act(farm, { type: 'WATER_PLOTS' }), { type: 'ADVANCE_DAY' })
      expect(Number.isFinite(farm.money) && farm.money >= 0).toBe(true)
      expect(Object.values(farm.inventory).every((value) => Number.isSafeInteger(value) && value >= 0)).toBe(true)
    }
    expect(farm.money).toBeGreaterThan(120)
    expect(farm.harvestedPlots).toBeGreaterThan(300)
    expect(farm.season).toBe(seasonForDay(121))
    expect(farm.xp).toBeGreaterThan(1000)
  })
  it('returns untouched workshop ingredients once and completes batches in two days', () => {
    const fresh = { ...createNewFarmState(), inventory: { ...createNewFarmState().inventory, milk: 2 } }
    const queued = act(fresh, { type: 'START_PRODUCTION', recipe: 'cheese' })
    const id = queued.productionQueue[0].id
    const cancelled = act(queued, { type: 'CANCEL_PRODUCTION', id })
    expect(cancelled.inventory.milk).toBe(2)
    expect(act(cancelled, { type: 'CANCEL_PRODUCTION', id })).toBe(cancelled)
    const completed = act(act(queued, { type: 'ADVANCE_DAY' }), { type: 'ADVANCE_DAY' })
    expect(completed.productionQueue[0]).toMatchObject({ phase: 'ready', status: '2 / 2 days', remaining: 'Ready to collect' })
  })
})

describe('Save recovery', () => {
  it('backs up corrupt JSON and permits the recovered farm to save', () => {
    localStorage.clear()
    const corrupt = '{broken save'
    localStorage.setItem('farmsim-state-v2', corrupt)
    const session = loadFarmSession(localStorage)
    expect(session.canSave).toBe(true)
    expect(saveFarmState(session.state, localStorage)).toBe(true)
    expect(JSON.parse(localStorage.getItem('farmsim-state-v2')!).schemaVersion).toBe(3)
    const backups = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)!)
      .filter((key) => key.startsWith('farmsim-state-v2-recovery-'))
    expect(backups.some((key) => localStorage.getItem(key) === corrupt)).toBe(true)
    localStorage.clear()
  })
  it('normalizes hostile data, duplicate IDs, invalid crops, and quantities', () => {
    const farm = migrateStoredState({ money: NaN, day: -2, seedStock: { wheat: -1, tomato: NaN, corn: Infinity }, selectedPlotIds: [6, 6, 100, 7], plots: { 7: { crop: 'potato' as never, growthDays: -4 }, 6: { crop: 'wheat', growthDays: Infinity } }, productionQueue: [{ id: 'x', recipe: 'bread', progress: NaN }, { id: 'x', recipe: 'bread' }] })
    expect(farm.selectedPlotIds).toEqual([7])
    expect(farm.plots[7].crop).toBeNull()
    expect(farm.productionQueue).toHaveLength(1)
    expect(farm.productionQueue[0].progress).toBe(0)
    expect(farm.money).toBe(initialFarmState.money)
    expect(cropOptions.every((crop) => Number.isSafeInteger(farm.seedStock[crop.key]))).toBe(true)
  })
  it('preserves unsupported version data and disables overwriting', () => {
    localStorage.clear()
    localStorage.setItem('farmsim-state-v2', JSON.stringify({ schemaVersion: 99, farm: { money: 99 } }))
    const before = localStorage.getItem('farmsim-state-v2')
    expect(loadFarmSession(localStorage).canSave).toBe(false)
    expect(saveFarmState(createNewFarmState(), localStorage)).toBe(false)
    expect(localStorage.getItem('farmsim-state-v2')).toBe(before)
    localStorage.clear()
  })
  it('handles blocked storage access without claiming the farm was saved', () => {
    const blocked = { getItem() { throw new Error('Denied') }, setItem() { throw new Error('Denied') } } as unknown as Storage
    expect(loadFarmSession(blocked).canSave).toBe(false)
    expect(saveFarmState(createNewFarmState(), blocked)).toBe(false)
  })
})
