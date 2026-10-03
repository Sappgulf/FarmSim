export type Screen = 'overview' | 'planning' | 'barn'
export type CropKey = 'wheat' | 'tomato' | 'corn'
export type InventoryKey = 'wheat' | 'tomato' | 'corn' | 'eggs' | 'milk' | 'grain' | 'wool' | 'cheese' | 'bread' | 'butter'
export type ProductionRecipeKey = 'cheese' | 'bread' | 'butter'
export type ProductionPhase = 'queued' | 'in-progress' | 'ready'

export type CropOption = {
  key: CropKey
  label: string
  icon: CropKey
  seasonFit: string
  fitTone: 'great' | 'good' | 'okay'
  growthTime: string
  waterNeed: string
  waterLevel: 1 | 2 | 3
  growthDays: number
  projectedReturn: number
  harvestYield: number
  seedPrice: number
  preferredSeason: string
}

export type InventoryItem = {
  key: InventoryKey
  label: string
  icon: InventoryKey
  price: number
}

export type ProductionItem = {
  id: string
  recipe: ProductionRecipeKey
  label: string
  icon: 'cheese' | 'bread' | 'butter'
  progress: number
  phase: ProductionPhase
  status: string
  remaining: string
}

export type ProductionRecipe = {
  key: ProductionRecipeKey
  label: string
  icon: ProductionRecipeKey
  input: InventoryKey
  inputAmount: number
  outputAmount: number
}

export type PlotState = {
  id: number
  available: boolean
  crop: CropKey | null
  watered: boolean
  growthDays: number
  ready: boolean
}

export type SellOrder = {
  id: string
  label: string
  icon: CropKey | InventoryKey
  amount: number
  price: number
  payoutPerUnit: number
}

export type FarmState = {
  money: number
  day: number
  season: string
  weather: string
  seedStock: Record<CropKey, number>
  animalProducts: { eggs: number; milk: number }
  selectedPlotIds: number[]
  plots: Record<number, PlotState>
  shippedGoods: number
  inventory: Record<InventoryKey, number>
  productionQueue: ProductionItem[]
  sellOrders: SellOrder[]
  xp: number
  harvestedPlots: number
}

export const cropOptions: CropOption[] = [
  {
    key: 'wheat',
    label: 'Wheat',
    icon: 'wheat',
    seasonFit: 'Great',
    fitTone: 'great',
    growthTime: '4 days',
    waterNeed: 'Low',
    waterLevel: 1,
    growthDays: 4,
    projectedReturn: 480,
    harvestYield: 2,
    seedPrice: 1,
    preferredSeason: 'Spring',
  },
  {
    key: 'tomato',
    label: 'Tomato',
    icon: 'tomato',
    seasonFit: 'Good',
    fitTone: 'good',
    growthTime: '6 days',
    waterNeed: 'Medium',
    waterLevel: 2,
    growthDays: 6,
    projectedReturn: 720,
    harvestYield: 3,
    seedPrice: 3,
    preferredSeason: 'Summer',
  },
  {
    key: 'corn',
    label: 'Corn',
    icon: 'corn',
    seasonFit: 'Okay',
    fitTone: 'okay',
    growthTime: '5 days',
    waterNeed: 'High',
    waterLevel: 3,
    growthDays: 5,
    projectedReturn: 660,
    harvestYield: 2,
    seedPrice: 2,
    preferredSeason: 'Fall',
  },
]

export const unavailablePlots = new Set([0, 1, 4, 5, 10, 14, 19, 24, 25, 28, 29])
export const plotIds = Array.from({ length: 30 }, (_, index) => index)

export function createInitialPlots(): Record<number, PlotState> {
  return Object.fromEntries(plotIds.map((id) => [id, { id, available: !unavailablePlots.has(id), crop: null, watered: false, growthDays: 0, ready: false }]))
}

export const inventoryItems: InventoryItem[] = [
  { key: 'eggs', label: 'Eggs', icon: 'eggs', price: 4 },
  { key: 'milk', label: 'Milk', icon: 'milk', price: 6 },
  { key: 'grain', label: 'Grain', icon: 'grain', price: 2 },
  { key: 'wool', label: 'Wool', icon: 'wool', price: 5 },
]

export const cropInventoryItems: InventoryItem[] = [
  { key: 'wheat', label: 'Wheat', icon: 'wheat', price: 2.2 },
  { key: 'tomato', label: 'Tomato', icon: 'tomato', price: 3.4 },
  { key: 'corn', label: 'Corn', icon: 'corn', price: 2.8 },
]

export const processedInventoryItems: InventoryItem[] = [
  { key: 'cheese', label: 'Cheese', icon: 'cheese', price: 12 },
  { key: 'bread', label: 'Bread', icon: 'bread', price: 9 },
  { key: 'butter', label: 'Butter', icon: 'butter', price: 10 },
]

export const productionRecipes: ProductionRecipe[] = [
  { key: 'cheese', label: 'Cheese', icon: 'cheese', input: 'milk', inputAmount: 2, outputAmount: 1 },
  { key: 'bread', label: 'Bread', icon: 'bread', input: 'wheat', inputAmount: 2, outputAmount: 1 },
  { key: 'butter', label: 'Butter', icon: 'butter', input: 'milk', inputAmount: 1, outputAmount: 1 },
]

export const initialSellOrders: SellOrder[] = [
  { id: 'wheat-order', label: 'Wheat', icon: 'wheat', amount: 60, price: 2.2, payoutPerUnit: 2.2 },
  { id: 'eggs-order', label: 'Eggs', icon: 'eggs', amount: 24, price: 4.5, payoutPerUnit: 4.5 },
  { id: 'milk-order', label: 'Milk', icon: 'milk', amount: 12, price: 6.2, payoutPerUnit: 6.2 },
]

export const initialFarmState: FarmState = {
  money: 2430,
  day: 12,
  season: 'Spring',
  weather: 'Sunny',
  seedStock: { wheat: 36, tomato: 18, corn: 24 },
  animalProducts: { eggs: 6, milk: 3 },
  selectedPlotIds: [6, 7, 8, 11, 12, 13, 16, 17, 18, 21, 22, 23],
  plots: createInitialPlots(),
  shippedGoods: 0,
  xp: 0,
  harvestedPlots: 0,
  inventory: {
    wheat: 60,
    tomato: 0,
    corn: 0,
    eggs: 36,
    milk: 18,
    grain: 120,
    wool: 15,
    cheese: 0,
    bread: 0,
    butter: 0,
  },
  productionQueue: [
    { id: 'cheese', recipe: 'cheese', label: 'Cheese', icon: 'cheese', progress: 0.66, phase: 'in-progress', status: '2 / 3', remaining: 'Ready in 1h 20m' },
    { id: 'bread', recipe: 'bread', label: 'Bread', icon: 'bread', progress: 0.5, phase: 'in-progress', status: '1 / 2', remaining: 'Ready in 2h 50m' },
    { id: 'butter', recipe: 'butter', label: 'Butter', icon: 'butter', progress: 0, phase: 'queued', status: '0 / 2', remaining: 'Queued' },
  ],
  sellOrders: initialSellOrders,
}

export const allInventoryItems = [...cropInventoryItems, ...inventoryItems, ...processedInventoryItems]
export const SEASON_LENGTH = 28
export const seasons = ['Spring', 'Summer', 'Fall', 'Winter']
export const seasonForDay = (day: number) => seasons[Math.floor((day - 1) / SEASON_LENGTH) % seasons.length]
export const seasonDay = (day: number) => (day - 1) % SEASON_LENGTH + 1
export const farmLevel = (state: FarmState) => Math.floor(state.xp / 60) + 1
export const cropYield = (crop: CropOption, season: string) => crop.harvestYield + (crop.preferredSeason === season ? 1 : 0)
export const cropProfit = (crop: CropOption, season: string) => {
  const price = cropInventoryItems.find((item) => item.key === crop.key)!.price
  return Math.round((cropYield(crop, season) * price - crop.seedPrice) * 100) / 100
}
export const formatMoney = (money: number) => money.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function createNewFarmState(): FarmState {
  return {
    ...initialFarmState,
    day: 1,
    money: 120,
    seedStock: { wheat: 8, tomato: 8, corn: 8 },
    animalProducts: { eggs: 2, milk: 1 },
    selectedPlotIds: [6, 7, 8, 11],
    inventory: Object.fromEntries(allInventoryItems.map((item) => [item.key, 0])) as FarmState['inventory'],
    productionQueue: [],
    plots: createInitialPlots(),
    sellOrders: initialSellOrders.map((order) => ({ ...order })),
  }
}

export const screenFromHash = (): Screen => {
  const hash = window.location.hash.replace('#', '').split('/')[0]
  return hash === 'planning' || hash === 'barn' ? hash : 'overview'
}
