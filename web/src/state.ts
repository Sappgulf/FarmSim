import { allInventoryItems, cropOptions, cropYield, farmLevel, initialSellOrders, productionRecipes, seasonForDay } from './data'
import type { CropKey, FarmState, InventoryKey, ProductionItem, ProductionPhase, ProductionRecipeKey } from './data'

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
  | { type: 'BUY_SEEDS'; crop: CropKey; quantity: number }
  | { type: 'SELL_INVENTORY'; item: InventoryKey; quantity: number }
  | { type: 'EXPAND_FARM' }
  | { type: 'HARVEST_PLOT'; plotId: number }
  | { type: 'WATER_PLOT'; plotId: number }
  | { type: 'SELECT_EMPTY_PLOTS' }
  | { type: 'CLEAR_PLOT_SELECTION' }
  | { type: 'RESTORE_FARM'; farm: FarmState }

const validQuantity = (quantity: number) => Number.isSafeInteger(quantity) && quantity > 0
const ledger = (money: number) => Math.round(money * 100) / 100

function advanceProductionItem(item: ProductionItem): ProductionItem {
  if (item.phase === 'ready') return item
  const progress = Math.min(1, item.progress + 0.5)
  const phase: ProductionPhase = progress >= 1 ? 'ready' : progress > 0 ? 'in-progress' : 'queued'
  return {
    ...item,
    progress,
    phase,
    status: `${Math.round(progress * 2)} / 2 days`,
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
  if (!cropOptions.some((item) => item.key === crop) || selected.length === 0 || state.seedStock[crop] < selected.length || new Set(selected).size !== selected.length || selected.some((id) => !state.plots[id]?.available || state.plots[id].crop !== null)) return state

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
    xp: state.xp + selected.length,
  }
}

function waterPlots(state: FarmState, target?: number): FarmState {
  if (state.weather === 'Rainy') return state
  const plots = { ...state.plots }
  let changed = false
  Object.keys(plots).forEach((key) => {
    const id = Number(key)
    const plot = plots[id]
    if ((target === undefined || id === target) && plot.crop !== null && !plot.ready && !plot.watered) {
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
    season: seasonForDay(state.day + 1),
    weather: ['Sunny', 'Cloudy', 'Rainy', 'Sunny', 'Windy'][(state.day + 1) % 5],
    animalProducts: {
      eggs: Math.min(12, state.animalProducts.eggs + 2),
      milk: Math.min(6, state.animalProducts.milk + 1),
    },
    plots,
    productionQueue: state.productionQueue.map(advanceProductionItem),
    sellOrders: state.sellOrders.length === 0 ? initialSellOrders.map((order) => ({ ...order })) : state.sellOrders,
  }
}

function harvestPlots(state: FarmState, target?: number): FarmState {
  const plots = { ...state.plots }
  const inventory = { ...state.inventory }
  let harvested = false
  let count = 0

  Object.keys(plots).forEach((key) => {
    const id = Number(key)
    const plot = plots[id]
    if ((target !== undefined && id !== target) || !plot.crop || !plot.ready) return
    const crop = cropOptions.find((option) => option.key === plot.crop)
    inventory[plot.crop] += crop ? cropYield(crop, state.season) : 1
    plots[id] = { ...plot, crop: null, watered: false, growthDays: 0, ready: false }
    harvested = true
    count += 1
  })

  return harvested ? { ...state, inventory, plots, xp: state.xp + count * 4, harvestedPlots: state.harvestedPlots + count } : state
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
        status: '0 / 2 days',
        remaining: '2 days',
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
  if (!order || !validQuantity(quantity) || order.amount < quantity || state.inventory[order.icon] < quantity) return state

  const remainingAmount = order.amount - quantity
  const sellOrders = remainingAmount === 0
    ? state.sellOrders.filter((entry) => entry.id !== orderId)
    : state.sellOrders.map((entry) => entry.id === orderId ? { ...entry, amount: remainingAmount } : entry)

  return {
    ...state,
    money: ledger(state.money + quantity * order.price),
    xp: state.xp + quantity,
    shippedGoods: state.shippedGoods + quantity,
    inventory: {
      ...state.inventory,
      [order.icon]: state.inventory[order.icon] - quantity,
    },
    sellOrders,
  }
}

function reduceCancelProduction(state: FarmState, id: string): FarmState {
  const item = state.productionQueue.find((entry) => entry.id === id)
  const recipe = productionRecipes.find((entry) => entry.key === item?.recipe)
  if (!item || !recipe || item.phase === 'ready') return state
  return { ...state, inventory: item.progress === 0 ? { ...state.inventory, [recipe.input]: state.inventory[recipe.input] + recipe.inputAmount } : state.inventory, productionQueue: state.productionQueue.filter((item) => item.id !== id) }
}

function buySeeds(state: FarmState, cropKey: CropKey, quantity: number): FarmState {
  const crop = cropOptions.find((item) => item.key === cropKey)
  if (!crop || !validQuantity(quantity) || quantity > 1000 || state.money < quantity * crop.seedPrice) return state
  return { ...state, money: ledger(state.money - quantity * crop.seedPrice), seedStock: { ...state.seedStock, [cropKey]: state.seedStock[cropKey] + quantity } }
}

function sellInventory(state: FarmState, itemKey: InventoryKey, quantity: number): FarmState {
  const item = allInventoryItems.find((entry) => entry.key === itemKey)
  if (!item || !validQuantity(quantity) || state.inventory[itemKey] < quantity) return state
  return { ...state, money: ledger(state.money + quantity * item.price), inventory: { ...state.inventory, [itemKey]: state.inventory[itemKey] - quantity }, shippedGoods: state.shippedGoods + quantity, xp: state.xp + quantity }
}

function expandFarm(state: FarmState): FarmState {
  const locked = Object.values(state.plots).filter((plot) => !plot.available).slice(0, 5)
  if (farmLevel(state) < 2 || state.money < 500 || locked.length === 0) return state
  const plots = { ...state.plots }
  locked.forEach((plot) => { plots[plot.id] = { ...plot, available: true } })
  return { ...state, plots, money: ledger(state.money - 500) }
}

function reduceRemoveSellOrder(state: FarmState, id: string): FarmState {
  if (!state.sellOrders.some((order) => order.id === id)) return state
  return { ...state, sellOrders: state.sellOrders.filter((order) => order.id !== id) }
}

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case 'RESTORE_FARM':
      return action.farm
    case 'SELECT_EMPTY_PLOTS': {
      const selectedPlotIds = Object.values(state.plots).filter((plot) => plot.available && plot.crop === null).map((plot) => plot.id)
      return { ...state, selectedPlotIds }
    }
    case 'CLEAR_PLOT_SELECTION':
      return state.selectedPlotIds.length ? { ...state, selectedPlotIds: [] } : state
    case 'HARVEST_PLOT':
      return harvestPlots(state, action.plotId)
    case 'WATER_PLOT':
      return waterPlots(state, action.plotId)
    case 'BUY_SEEDS':
      return buySeeds(state, action.crop, action.quantity)
    case 'SELL_INVENTORY':
      return sellInventory(state, action.item, action.quantity)
    case 'EXPAND_FARM':
      return expandFarm(state)
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
