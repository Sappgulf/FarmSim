import { describe, expect, it } from 'vitest'
import { initialFarmState } from './data'
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './state'
import { loadFarmState, migrateStoredState, saveFarmState, type StoredState } from './storage'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('FarmSim persistence', () => {
  it('writes and reads an explicit v2 farm envelope', () => {
    const storage = new MemoryStorage()
    const state = { ...initialFarmState, day: 19, money: 2710 }

    expect(saveFarmState(state, storage)).toBe(true)
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ schemaVersion: 2, farm: { day: 19, money: 2710 } })
    expect(loadFarmState(storage)).toEqual(state)
  })

  it('migrates legacy aggregate plot fields into canonical plot records', () => {
    const storage = new MemoryStorage()
    const legacy: StoredState = {
      day: 14,
      money: 2500,
      selectedPlots: [6, 7],
      plantedPlotIds: [6, 7],
      plantedPlots: 2,
      wateredPlotIds: [6],
      growthDays: 2,
      readyPlotIds: [],
      plantedCrop: 'tomato',
    }
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy))

    const migrated = loadFarmState(storage)
    expect(migrated.day).toBe(14)
    expect(migrated.money).toBe(2500)
    expect(migrated.selectedPlotIds).toEqual([6, 7])
    expect(migrated.plots[6]).toMatchObject({ crop: 'tomato', watered: true, growthDays: 2, ready: false })
    expect(migrated.plots[7]).toMatchObject({ crop: 'tomato', watered: false, growthDays: 2, ready: false })
    expect(migrated.plots[5].crop).toBeNull()
  })

  it('normalizes legacy production items and rejects malformed storage safely', () => {
    const migrated = migrateStoredState({
      productionQueue: [{ id: 'bread', icon: 'bread', progress: 1 }],
    })
    expect(migrated.productionQueue[0]).toMatchObject({ id: 'bread', recipe: 'bread', phase: 'ready', remaining: 'Ready to collect' })

    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{not valid json')
    expect(loadFarmState(storage)).toEqual(initialFarmState)
  })
})
