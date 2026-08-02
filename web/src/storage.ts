import type { CropKey, FarmState, InventoryKey, PlotState, ProductionItem, ProductionPhase, SellOrder } from './data'
import { createInitialPlots, initialFarmState, plotIds, productionRecipes } from './data'
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

type PersistedEnvelopeV2 = {
  schemaVersion: 2
  farm: StoredState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractStoredState(parsed: unknown): StoredState | null {
  if (!isRecord(parsed)) return null
  if (parsed.schemaVersion === 2 && isRecord(parsed.farm)) return parsed.farm as StoredState
  return parsed as StoredState
}

export function migratePlots(parsed: StoredState): Record<number, PlotState> {
  const plots = createInitialPlots()
  const legacyPlanted = parsed.plantedPlotIds ?? []
  const legacyWatered = parsed.wateredPlotIds ?? []
  const legacyReady = parsed.readyPlotIds ?? []
  const legacyCrop = parsed.plantedCrop ?? null
  const legacyGrowth = parsed.growthDays ?? 0

  plotIds.forEach((id) => {
    const base = plots[id]
    const stored = parsed.plots?.[String(id)]
    if (stored) {
      plots[id] = {
        ...base,
        ...stored,
        id,
        available: stored.available ?? base.available,
        crop: stored.crop !== undefined ? stored.crop : base.crop,
        watered: stored.watered ?? base.watered,
        growthDays: stored.growthDays ?? base.growthDays,
        ready: stored.ready ?? base.ready,
      }
      return
    }
    if (legacyPlanted.includes(id)) {
      plots[id] = {
        ...base,
        crop: legacyCrop,
        watered: legacyWatered.includes(id),
        growthDays: legacyGrowth,
        ready: legacyReady.includes(id),
      }
    }
  })

  return plots
}

function normalizeProductionQueue(parsed: StoredState): ProductionItem[] {
  if (!Array.isArray(parsed.productionQueue)) return initialFarmState.productionQueue

  return parsed.productionQueue.flatMap((item) => {
    const recipeKey = item.recipe ?? item.icon
    const recipe = productionRecipes.find((entry) => entry.key === recipeKey)
    if (!recipe || !item.id) return []

    const progress = typeof item.progress === 'number' ? Math.max(0, Math.min(1, item.progress)) : 0
    const phase: ProductionPhase = item.phase ?? (progress >= 1 ? 'ready' : progress > 0 ? 'in-progress' : 'queued')
    return [{
      id: item.id,
      recipe: recipe.key,
      label: item.label ?? recipe.label,
      icon: item.icon ?? recipe.icon,
      progress,
      phase,
      status: item.status ?? `0 / ${recipe.outputAmount}`,
      remaining: item.remaining ?? (phase === 'ready' ? 'Ready to collect' : phase === 'in-progress' ? 'Ready tomorrow' : 'Queued'),
    }]
  })
}

export function migrateStoredState(parsed: StoredState): FarmState {
  const sellOrders = Array.isArray(parsed.sellOrders)
    ? parsed.sellOrders.map((order) => ({
        ...order,
        payoutPerUnit: order.payoutPerUnit ?? (order.icon === 'wheat' ? 22 : order.price),
      }))
    : initialFarmState.sellOrders

  return {
    ...initialFarmState,
    money: parsed.money ?? initialFarmState.money,
    day: parsed.day ?? initialFarmState.day,
    season: parsed.season ?? initialFarmState.season,
    weather: parsed.weather ?? initialFarmState.weather,
    selectedPlotIds: parsed.selectedPlotIds ?? parsed.selectedPlots ?? initialFarmState.selectedPlotIds,
    plots: migratePlots(parsed),
    shippedGoods: parsed.shippedGoods ?? initialFarmState.shippedGoods,
    inventory: { ...initialFarmState.inventory, ...(parsed.inventory ?? {}) },
    productionQueue: normalizeProductionQueue(parsed),
    sellOrders,
  }
}

function browserStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage
}

export function loadFarmState(storage: Storage | undefined = browserStorage()): FarmState {
  try {
    if (!storage) return initialFarmState
    const stored = storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return initialFarmState
    const parsed = extractStoredState(JSON.parse(stored))
    return parsed ? migrateStoredState(parsed) : initialFarmState
  } catch {
    return initialFarmState
  }
}

export function saveFarmState(state: FarmState, storage: Storage | undefined = browserStorage()): boolean {
  try {
    if (!storage) return false
    const envelope: PersistedEnvelopeV2 = { schemaVersion: 2, farm: state }
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}
