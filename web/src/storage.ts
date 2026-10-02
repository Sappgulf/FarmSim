import type { CropKey, FarmState, InventoryKey, PlotState, ProductionItem, ProductionPhase, SellOrder } from './data'
import { allInventoryItems, createInitialPlots, createNewFarmState, cropOptions, initialFarmState, productionRecipes, seasonForDay } from './data'
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './state'

type StoredProductionItem = Partial<ProductionItem> & {
  id?: string
  label?: string
  icon?: ProductionItem['icon']
  progress?: number
  status?: string
  remaining?: string
}

type StoredSellOrder = Omit<SellOrder, 'payoutPerUnit'> & { payoutPerUnit?: number }

export type StoredState = Partial<Omit<FarmState, 'plots' | 'inventory' | 'productionQueue' | 'sellOrders'>> & {
  plots?: Record<string, Partial<PlotState>>
  inventory?: Partial<Record<InventoryKey, number>>
  productionQueue?: StoredProductionItem[]
  sellOrders?: StoredSellOrder[]
  selectedPlots?: number[]
  plantedPlots?: number
  plantedPlotIds?: number[]
  wateredPlotIds?: number[]
  growthDays?: number
  readyPlotIds?: number[]
  plantedCrop?: CropKey | null
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const count = (value: unknown, fallback: number, max = 1_000_000) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.min(max, Math.floor(value)) : fallback
const cropKey = (value: unknown): CropKey | null => cropOptions.some((crop) => crop.key === value) ? value as CropKey : null
const validWeather = ['Sunny', 'Cloudy', 'Rainy', 'Windy']

export function migratePlots(parsed: StoredState): Record<number, PlotState> {
  const plots = createInitialPlots()
  const legacyPlanted = Array.isArray(parsed.plantedPlotIds) ? parsed.plantedPlotIds : []
  const legacyWatered = Array.isArray(parsed.wateredPlotIds) ? parsed.wateredPlotIds : []
  const legacyReady = Array.isArray(parsed.readyPlotIds) ? parsed.readyPlotIds : []
  Object.values(plots).forEach((base) => {
    const raw = isRecord(parsed.plots) ? parsed.plots[String(base.id)] : undefined
    const stored = isRecord(raw) ? raw : {}
    const crop = cropKey('crop' in stored ? stored.crop : legacyPlanted.includes(base.id) ? parsed.plantedCrop : null)
    const definition = cropOptions.find((item) => item.key === crop)
    const ready = crop !== null && (stored.ready === true || legacyReady.includes(base.id))
    const growth = crop ? count(stored.growthDays ?? parsed.growthDays, 0, definition!.growthDays) : 0
    plots[base.id] = {
      id: base.id,
      available: typeof stored.available === 'boolean' ? stored.available : base.available,
      crop,
      watered: crop !== null && (stored.watered === true || legacyWatered.includes(base.id)),
      growthDays: ready ? definition!.growthDays : growth,
      ready: crop !== null && (ready || growth === definition!.growthDays),
    }
    if (!plots[base.id].available) plots[base.id] = { ...base, available: false }
  })
  return plots
}

export function migrateStoredState(parsed: StoredState): FarmState {
  const plots = migratePlots(parsed)
  const seedStock = { ...initialFarmState.seedStock }
  cropOptions.forEach((crop) => { seedStock[crop.key] = count(parsed.seedStock?.[crop.key], seedStock[crop.key]) })
  const inventory = { ...initialFarmState.inventory }
  allInventoryItems.forEach((item) => { inventory[item.key] = count(parsed.inventory?.[item.key], inventory[item.key]) })
  const ids = new Set<string>()
  const productionQueue: ProductionItem[] = Array.isArray(parsed.productionQueue) ? parsed.productionQueue.flatMap((raw) => {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id || ids.has(raw.id)) return []
    const recipe = productionRecipes.find((item) => item.key === (raw.recipe ?? raw.icon))
    if (!recipe) return []
    ids.add(raw.id)
    const progress = typeof raw.progress === 'number' && Number.isFinite(raw.progress) ? Math.max(0, Math.min(1, raw.progress)) : 0
    const phase: ProductionPhase = progress === 1 ? 'ready' : progress > 0 ? 'in-progress' : 'queued'
    return [{ id: raw.id, recipe: recipe.key, label: recipe.label, icon: recipe.icon, progress, phase, status: `${Math.round(progress * 2)} / 2 days`, remaining: phase === 'ready' ? 'Ready to collect' : progress > 0 ? 'Ready tomorrow' : '2 days' }]
  }).slice(0, 5) : initialFarmState.productionQueue.map((item) => ({ ...item, status: `${Math.round(item.progress * 2)} / 2 days`, remaining: item.progress > 0 ? 'Ready tomorrow' : '2 days' }))
  const orderIds = new Set<string>()
  const sellOrders = Array.isArray(parsed.sellOrders) ? parsed.sellOrders.flatMap((raw) => {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id || orderIds.has(raw.id)) return []
    const item = allInventoryItems.find((item) => item.key === raw.icon)
    if (!item || typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price <= 0 || raw.price > 10000) return []
    const amount = count(raw.amount, 0)
    if (amount === 0) return []
    orderIds.add(raw.id)
    const price = Math.round(raw.price * 100) / 100
    return [{ id: raw.id, label: item.label, icon: item.key, amount, price, payoutPerUnit: price }]
  }) : initialFarmState.sellOrders.map((order) => ({ ...order }))
  const selected = parsed.selectedPlotIds ?? parsed.selectedPlots
  const selectedPlotIds = Array.isArray(selected) ? [...new Set(selected)].filter((id) => Number.isSafeInteger(id) && plots[id]?.available && plots[id].crop === null) : initialFarmState.selectedPlotIds.filter((id) => plots[id].crop === null)
  const day = Math.max(1, count(parsed.day, initialFarmState.day, 100000))
  const money = typeof parsed.money === 'number' && Number.isFinite(parsed.money) && parsed.money >= 0 ? Math.round(Math.min(parsed.money, 1e9) * 100) / 100 : initialFarmState.money
  return {
    money, day, season: seasonForDay(day), weather: validWeather.includes(parsed.weather ?? '') ? parsed.weather! : 'Sunny',
    seedStock, inventory, plots, selectedPlotIds, productionQueue, sellOrders,
    animalProducts: { eggs: count(parsed.animalProducts?.eggs, 6, 12), milk: count(parsed.animalProducts?.milk, 3, 6) },
    shippedGoods: count(parsed.shippedGoods, 0), xp: count(parsed.xp, 0), harvestedPlots: count(parsed.harvestedPlots, 0),
  }
}

export type FarmSession = { state: FarmState; warning: string; canSave: boolean }
function browserStorage(): Storage | undefined {
  // Accessing localStorage itself can throw in restricted browsers.
  try { return typeof window === 'undefined' ? undefined : window.localStorage } catch { return undefined }
}

export function loadFarmSession(storage: Storage | undefined = browserStorage()): FarmSession {
  const fresh = () => createNewFarmState()
  if (!storage) return { state: fresh(), warning: 'Saving is unavailable. Keep this tab open to retain this session.', canSave: false }
  let stored: string | null = null
  try {
    stored = storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return { state: fresh(), warning: '', canSave: true }
    const parsed: unknown = JSON.parse(stored)
    if (!isRecord(parsed)) throw new Error('Invalid save')
    if ('schemaVersion' in parsed && parsed.schemaVersion !== 2 && parsed.schemaVersion !== 3) {
      return { state: fresh(), warning: 'This save belongs to another game version. Your saved file is preserved; this session will not overwrite it.', canSave: false }
    }
    const farm = 'schemaVersion' in parsed ? parsed.farm : parsed
    if (!isRecord(farm)) throw new Error('Invalid farm')
    return { state: migrateStoredState(farm as StoredState), warning: '', canSave: true }
  } catch {
    if (stored === null) return { state: fresh(), warning: 'Saving is unavailable. Keep this tab open to retain this session.', canSave: false }
    // Preserve corrupt data for recovery before allowing a new save to replace it.
    try {
      if (stored) storage.setItem(`${STORAGE_KEY}-recovery-${Date.now()}`, stored)
      return { state: fresh(), warning: 'The save could not be read. A recovery copy was kept and a new farm is ready.', canSave: true }
    } catch {
      return { state: fresh(), warning: 'Saving is unavailable. Your previous save has been preserved.', canSave: false }
    }
  }
}

export function loadFarmState(storage: Storage | undefined = browserStorage()): FarmState {
  return loadFarmSession(storage).state
}

export function saveFarmState(state: FarmState, storage: Storage | undefined = browserStorage()): boolean {
  try {
    if (!storage) return false
    const existing = storage.getItem(STORAGE_KEY)
    if (existing) {
      let parsed: unknown
      try {
        parsed = JSON.parse(existing)
      } catch {
        storage.setItem(`${STORAGE_KEY}-recovery-${Date.now()}`, existing)
      }
      if (isRecord(parsed) && 'schemaVersion' in parsed && parsed.schemaVersion !== 2 && parsed.schemaVersion !== 3) return false
    }
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 3, farm: state }))
    return true
  } catch { return false }
}
