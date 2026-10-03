import { describe, expect, it, vi } from 'vitest'
import { createNewFarmState, initialFarmState } from './data'
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './state'
import { loadFarmSession, loadFarmState, migrateStoredState, parseFarmBackup, serializeFarmState, saveFarmState, writeFarmState, type StoredState } from './storage'

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
  it('checks the loaded save even when no storage event has been delivered', () => {
    const storage = new MemoryStorage()
    saveFarmState(createNewFarmState(), storage)
    const session = loadFarmSession(storage)
    saveFarmState({ ...createNewFarmState(), money: 450 }, storage)
    const otherSave = storage.getItem(STORAGE_KEY)
    expect(writeFarmState(session.state, session.savedValue, storage).status).toBe('conflict')
    expect(storage.getItem(STORAGE_KEY)).toBe(otherSave)
  })

  it('round trips current backups and rejects unsupported, incomplete, or invalid farms', () => {
    const farm = createNewFarmState()
    expect(parseFarmBackup(serializeFarmState(farm))).toEqual(farm)
    expect(() => parseFarmBackup('{broken')).toThrow()
    expect(() => parseFarmBackup(JSON.stringify({ schemaVersion: 99, farm }))).toThrow()
    expect(() => parseFarmBackup(JSON.stringify({ schemaVersion: 3, farm: {} }))).toThrow()
    expect(() => parseFarmBackup(serializeFarmState({ ...farm, money: -1 }))).toThrow()
    expect(() => parseFarmBackup(serializeFarmState({ ...farm, seedStock: { ...farm.seedStock, wheat: 1.5 } }))).toThrow()
  })

  it('refuses a restore if its recovery copy cannot be kept', () => {
    const storage = new MemoryStorage()
    saveFarmState(createNewFarmState(), storage)
    const before = storage.getItem(STORAGE_KEY)
    const failing = { getItem: storage.getItem.bind(storage), setItem: () => { throw new Error('Full') } } as unknown as Storage
    expect(writeFarmState({ ...createNewFarmState(), money: 450 }, before, failing, true).status).toBe('unavailable')
    expect(storage.getItem(STORAGE_KEY)).toBe(before)
  })

  it('keeps separate recovery files for two restores in the same millisecond', () => {
    const storage = new MemoryStorage()
    const farm = createNewFarmState()
    saveFarmState(farm, storage)
    const first = storage.getItem(STORAGE_KEY)!
    const time = vi.spyOn(Date, 'now').mockReturnValue(42)
    let second: string
    try {
      writeFarmState({ ...farm, money: 450 }, first, storage, true)
      second = storage.getItem(STORAGE_KEY)!
      writeFarmState({ ...farm, money: 600 }, second, storage, true)
    } finally { time.mockRestore() }
    const recoveryKeys = Array.from({ length: storage.length }, (_, index) => storage.key(index)!).filter((key) => key.includes('-recovery-'))
    expect(recoveryKeys).toHaveLength(2)
    expect(recoveryKeys.map((key) => storage.getItem(key))).toEqual([first, second])
  })
  it('writes and reads an explicit v3 farm envelope', () => {
    const storage = new MemoryStorage()
    const state = { ...initialFarmState, day: 19, money: 2710 }

    expect(saveFarmState(state, storage)).toBe(true)
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ schemaVersion: 3, farm: { day: 19, money: 2710 } })
    expect(loadFarmState(storage)).toEqual(migrateStoredState(state))
  })

  it('backfills seed stock and animal production for older v2 saves', () => {
    const migrated = migrateStoredState({ day: 20 })
    expect(migrated.seedStock).toEqual(initialFarmState.seedStock)
    expect(migrated.animalProducts).toEqual(initialFarmState.animalProducts)
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
    expect(migrated.selectedPlotIds).toEqual([])
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
    expect(loadFarmState(storage)).toEqual(createNewFarmState())
    expect(storage.length).toBe(2)
  })
})
