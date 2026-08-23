import { cropOptions, productionRecipes } from './data'
import type { CropKey, FarmState, ProductionItem, ProductionPhase, ProductionRecipeKey } from './data'

export const STORAGE_KEY = 'farmsim-state-v2'
export const LEGACY_STORAGE_KEY = 'farmsim-state-v1'

export type FarmAction =
  | { type: 'TOGGLE_PLOT_SELECTION'; plotId: number }
  | { type: 'PLANT_SELECTED_PLOTS'; crop: CropKey }
  | { type: 'WATER_PLOTS' }
  | { type: 'ADVANCE_DAY' }
  | { type: 'HARVEST_PLOTS' }
  | { type: 'COLLECT_ANIMAL_PRODUCTS'; product: 'eggs' | 'milk' }
  | { type: 'START_PRODUCTION'; recipe: ProductionRecipeKey }
  | { type: 'COLLECT_PRODUCTION'; id: string }
  | { type: 'CANCEL_PRODUCTION'; id: string }
  | { type: 'SHIP_GOODS'; orderId: string; quantity: number }
  | { type: 'REMOVE_SELL_ORDER'; id: string }

function advanceProductionItem(item: ProductionItem): ProductionItem {
  if (item.phase === 'ready') return item
  const progress = Math.min(1, item.progress + 0.5)
  const phase: ProductionPhase = progress >= 1 ? 'ready' : progress > 0 ? 'in-progress' : 'queued'
  return {
    ...item,
    progress,
    phase,
    remaining: phase === 'ready' ? 'Ready to collect' : phase === 'in-progress' ? 'Ready tomorrow' : 'Queued',
  }
}

function togglePlotSelection(state: FarmState, plotId: number): FarmState {
  const plot = state.plots[plotId]
  if (!plot || !plot.available || plot.crop !== null) return state
  const selected = state.selectedPlotIds.includes(plotId)
  return {
    ...state,
    selectedPlotIds: selected ? state.selectedPlotIds.filter((id) => id !== plotId) : [...state.selectedPlotIds, plotId],
  }
}

function reducePlantSelectedPlots(state: FarmState, crop: CropKey): FarmState {
  const selected = state.selectedPlotIds
  if (selected.length === 0 || state.seedStock[crop] < selected.length || new Set(selected).size !== selected.length || selected.some((id) => !state.plots[id]?.available || state.plots[id].crop !== null)) return state

  const plots = { ...state.plots }
  selected.forEach((id) => {
    const plot = plots[id]
    plots[id] = { ...plot, crop, watered: false, growthDays: 0, ready: false }
  })

  return {
    ...state,
    seedStock: { ...state.seedStock, [crop]: state.seedStock[crop] - selected.length },
    selectedPlotIds: [],
    plots,
  }
}

function waterPlots(state: FarmState): FarmState {
  const plots = { ...state.plots }
  let changed = false
  Object.keys(plots).forEach((key) => {
    const id = Number(key)
    const plot = plots[id]
    if (plot.crop !== null && !plot.ready && !plot.watered) {
      plots[id] = { ...plot, watered: true }
      changed = true
    }
  })
  return changed ? { ...state, plots } : state
}

function reduceAdvanceFarmDay(state: FarmState): FarmState {
  const plots = { ...state.plots }
  Object.keys(plots).forEach((key) => {
    const id = Number(key)
    const plot = plots[id]
    if (!plot.crop) return
    const crop = cropOptions.find((option) => option.key === plot.crop)
    const receivesWater = plot.watered || state.weather === 'Rainy'
    const growthDays = crop ? Math.min(crop.growthDays, plot.growthDays + (receivesWater ? 1 : 0)) : plot.growthDays
    plots[id] = { ...plot, watered: false, growthDays, ready: plot.ready || (crop ? growthDays >= crop.growthDays : false) }
  })

  return {
    ...state,
    day: state.day + 1,
    weather: ['Sunny', 'Cloudy', 'Rainy', 'Sunny', 'Windy'][(state.day + 1) % 5],
    animalProducts: {
      eggs: Math.min(12, state.animalProducts.eggs + 2),
      milk: Math.min(6, state.animalProducts.milk + 1),
    },
    plots,
    productionQueue: state.productionQueue.map(advanceProductionItem),
  }
}

function harvestPlots(state: FarmState): FarmState {
  const plots = { ...state.plots }
  const inventory = { ...state.inventory }
  let harvested = false

  Object.keys(plots).forEach((key) => {
    const id = Number(key)
    const plot = plots[id]
    if (!plot.crop || !plot.ready) return
    const crop = cropOptions.find((option) => option.key === plot.crop)
    inventory[plot.crop] += crop?.harvestYield ?? 1
    plots[id] = { ...plot, crop: null, watered: false, growthDays: 0, ready: false }
    harvested = true
  })

  return harvested ? { ...state, inventory, plots, selectedPlotIds: [] } : state
}

function reduceCollectAnimalProducts(state: FarmState, product: 'eggs' | 'milk'): FarmState {
  const quantity = state.animalProducts[product]
  if (quantity <= 0) return state
  return {
    ...state,
    inventory: { ...state.inventory, [product]: state.inventory[product] + quantity },
    animalProducts: { ...state.animalProducts, [product]: 0 },
  }
}

function reduceStartProduction(state: FarmState, recipeKey: ProductionRecipeKey): FarmState {
  const recipe = productionRecipes.find((item) => item.key === recipeKey)
  if (!recipe || state.productionQueue.length >= 5 || state.inventory[recipe.input] < recipe.inputAmount) return state

  let suffix = 1
  let id = `${recipe.key}-${state.day}-${suffix}`
  while (state.productionQueue.some((item) => item.id === id)) {
    suffix += 1
    id = `${recipe.key}-${state.day}-${suffix}`
  }

  return {
    ...state,
    inventory: {
      ...state.inventory,
      [recipe.input]: state.inventory[recipe.input] - recipe.inputAmount,
    },
    productionQueue: [
      ...state.productionQueue,
      {
        id,
        recipe: recipe.key,
        label: recipe.label,
        icon: recipe.icon,
        progress: 0,
        phase: 'queued',
        status: `0 / ${recipe.outputAmount}`,
        remaining: 'Queued',
      },
    ],
  }
}

function reduceCollectProduction(state: FarmState, id: string): FarmState {
  const item = state.productionQueue.find((entry) => entry.id === id)
  const recipe = item && productionRecipes.find((entry) => entry.key === item.recipe)
  if (!item || !recipe || item.phase !== 'ready') return state

  return {
    ...state,
    inventory: {
      ...state.inventory,
      [item.recipe]: state.inventory[item.recipe] + recipe.outputAmount,
    },
    productionQueue: state.productionQueue.filter((entry) => entry.id !== id),
  }
}

function reduceShipGoods(state: FarmState, orderId: string, quantity: number): FarmState {
  const order = state.sellOrders.find((entry) => entry.id === orderId)
  if (!order || quantity <= 0 || order.amount < quantity || state.inventory[order.icon] < quantity) return state

  const remainingAmount = order.amount - quantity
  const sellOrders = remainingAmount === 0
    ? state.sellOrders.filter((entry) => entry.id !== orderId)
    : state.sellOrders.map((entry) => entry.id === orderId ? { ...entry, amount: remainingAmount } : entry)

  return {
    ...state,
    money: state.money + quantity * order.payoutPerUnit,
    shippedGoods: state.shippedGoods + quantity,
    inventory: {
      ...state.inventory,
      [order.icon]: state.inventory[order.icon] - quantity,
    },
    sellOrders,
  }
}

function reduceCancelProduction(state: FarmState, id: string): FarmState {
  if (!state.productionQueue.some((item) => item.id === id)) return state
  return { ...state, productionQueue: state.productionQueue.filter((item) => item.id !== id) }
}

function reduceRemoveSellOrder(state: FarmState, id: string): FarmState {
  if (!state.sellOrders.some((order) => order.id === id)) return state
  return { ...state, sellOrders: state.sellOrders.filter((order) => order.id !== id) }
}

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case 'TOGGLE_PLOT_SELECTION':
      return togglePlotSelection(state, action.plotId)
    case 'PLANT_SELECTED_PLOTS':
      return reducePlantSelectedPlots(state, action.crop)
    case 'WATER_PLOTS':
      return waterPlots(state)
    case 'ADVANCE_DAY':
      return reduceAdvanceFarmDay(state)
    case 'HARVEST_PLOTS':
      return harvestPlots(state)
    case 'COLLECT_ANIMAL_PRODUCTS':
      return reduceCollectAnimalProducts(state, action.product)
    case 'START_PRODUCTION':
      return reduceStartProduction(state, action.recipe)
    case 'COLLECT_PRODUCTION':
      return reduceCollectProduction(state, action.id)
    case 'CANCEL_PRODUCTION':
      return reduceCancelProduction(state, action.id)
    case 'SHIP_GOODS':
      return reduceShipGoods(state, action.orderId, action.quantity)
    case 'REMOVE_SELL_ORDER':
      return reduceRemoveSellOrder(state, action.id)
  }
}

export const togglePlot = (state: FarmState, plotId: number) => farmReducer(state, { type: 'TOGGLE_PLOT_SELECTION', plotId })
export const plantSelectedPlots = (state: FarmState, crop: CropKey) => farmReducer(state, { type: 'PLANT_SELECTED_PLOTS', crop })
export const waterPlantedPlots = (state: FarmState) => farmReducer(state, { type: 'WATER_PLOTS' })
export const advanceFarmDay = (state: FarmState) => farmReducer(state, { type: 'ADVANCE_DAY' })
export const harvestReadyPlots = (state: FarmState) => farmReducer(state, { type: 'HARVEST_PLOTS' })
export const collectAnimalProducts = (state: FarmState, product: 'eggs' | 'milk') => farmReducer(state, { type: 'COLLECT_ANIMAL_PRODUCTS', product })
export const startProduction = (state: FarmState, recipe: ProductionRecipeKey) => farmReducer(state, { type: 'START_PRODUCTION', recipe })
export const collectProduction = (state: FarmState, id: string) => farmReducer(state, { type: 'COLLECT_PRODUCTION', id })
export const shipGoods = (state: FarmState, orderId: string, quantity: number) => farmReducer(state, { type: 'SHIP_GOODS', orderId, quantity })
export const shipWheat = (state: FarmState, quantity = 5) => shipGoods(state, 'wheat-order', quantity)
export const cancelProduction = (state: FarmState, id: string) => farmReducer(state, { type: 'CANCEL_PRODUCTION', id })
export const removeSellOrder = (state: FarmState, id: string) => farmReducer(state, { type: 'REMOVE_SELL_ORDER', id })
