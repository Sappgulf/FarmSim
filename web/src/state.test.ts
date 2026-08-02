import { describe, expect, it } from 'vitest'
import { initialFarmState } from './data'
import { plantedCrop, plantedPlotIds, readyPlotIds, selectedPlotIds, growthDays } from './selectors'
import { advanceFarmDay, cancelProduction, collectProduction, harvestReadyPlots, plantSelectedPlots, removeSellOrder, startProduction, shipWheat, waterPlantedPlots } from './state'

describe('FarmSim state transitions', () => {
  it('plants exactly the selected plots and records the crop', () => {
    const next = plantSelectedPlots(initialFarmState, 'wheat')
    expect(plantedPlotIds(next)).toHaveLength(12)
    expect(plantedPlotIds(next)).toEqual(initialFarmState.selectedPlotIds)
    expect(plantedCrop(next)).toBe('wheat')
    expect(selectedPlotIds(next)).toEqual([])
    expect(next.plots[6].crop).toBe('wheat')
  })

  it('ships five wheat and updates money, inventory, and progress', () => {
    const next = shipWheat(initialFarmState, 5)
    expect(next.money).toBe(2540)
    expect(next.inventory.wheat).toBe(55)
    expect(next.shippedGoods).toBe(5)
    expect(next.sellOrders.find((order) => order.id === 'wheat-order')?.amount).toBe(55)
  })

  it('does not ship when the inventory cannot satisfy the order', () => {
    const state = { ...initialFarmState, inventory: { ...initialFarmState.inventory, wheat: 2 } }
    expect(shipWheat(state, 5)).toEqual(state)
  })

  it('rejects an order that cannot cover the requested quantity', () => {
    const state = { ...initialFarmState, sellOrders: initialFarmState.sellOrders.map((order) => order.id === 'wheat-order' ? { ...order, amount: 3 } : order) }
    expect(shipWheat(state, 5)).toBe(state)
  })

  it('removes a production item without disturbing the remaining queue', () => {
    const next = cancelProduction(initialFarmState, 'bread')
    expect(next.productionQueue.map((item) => item.id)).toEqual(['cheese', 'butter'])
  })

  it('removes only the requested sell order', () => {
    const next = removeSellOrder(initialFarmState, 'eggs-order')
    expect(next.sellOrders.map((order) => order.id)).toEqual(['wheat-order', 'milk-order'])
  })

  it('does not grow unwatered plots when the day advances', () => {
    const planted = plantSelectedPlots(initialFarmState, 'wheat')
    const next = advanceFarmDay(planted)
    expect(next.day).toBe(13)
    expect(growthDays(next)).toBe(0)
    expect(readyPlotIds(next)).toEqual([])
  })

  it('grows watered plots and makes them ready on the exact growth boundary', () => {
    let state = plantSelectedPlots(initialFarmState, 'wheat')
    for (let day = 0; day < 4; day += 1) {
      state = advanceFarmDay(waterPlantedPlots(state))
    }

    expect(state.day).toBe(16)
    expect(growthDays(state)).toBe(4)
    expect(readyPlotIds(state)).toEqual(initialFarmState.selectedPlotIds)
    expect(state.plots[6].ready).toBe(true)
  })

  it('harvests ready plots into the selected crop inventory and clears the field', () => {
    let state = plantSelectedPlots(initialFarmState, 'wheat')
    for (let day = 0; day < 4; day += 1) state = advanceFarmDay(waterPlantedPlots(state))

    const next = harvestReadyPlots(state)
    expect(next.inventory.wheat).toBe(72)
    expect(plantedPlotIds(next)).toEqual([])
    expect(readyPlotIds(next)).toEqual([])
    expect(plantedCrop(next)).toBeNull()
    expect(next.plots[6]).toMatchObject({ crop: null, watered: false, growthDays: 0, ready: false })
  })

  it('starts production by consuming inputs and collects ready output once', () => {
    const queued = startProduction(initialFarmState, 'cheese')
    expect(queued.inventory.milk).toBe(16)
    expect(queued.productionQueue).toHaveLength(4)

    const advanced = advanceFarmDay(queued)
    const collected = collectProduction(advanced, 'cheese')
    expect(collected.inventory.cheese).toBe(1)
    expect(collected.productionQueue.some((item) => item.id === 'cheese')).toBe(false)
    expect(collectProduction(collected, 'cheese')).toEqual(collected)
  })
})
