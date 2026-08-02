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
  selectedPlotIds: number[]
  plots: Record<number, PlotState>
  shippedGoods: number
  inventory: Record<InventoryKey, number>
  productionQueue: ProductionItem[]
  sellOrders: SellOrder[]
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
  { key: 'bread', label: 'Bread', icon: 'bread', input: 'grain', inputAmount: 3, outputAmount: 1 },
  { key: 'butter', label: 'Butter', icon: 'butter', input: 'milk', inputAmount: 1, outputAmount: 1 },
]

export const initialSellOrders: SellOrder[] = [
  { id: 'wheat-order', label: 'Wheat', icon: 'wheat', amount: 60, price: 2.2, payoutPerUnit: 22 },
  { id: 'eggs-order', label: 'Eggs', icon: 'eggs', amount: 24, price: 4.5, payoutPerUnit: 4.5 },
  { id: 'milk-order', label: 'Milk', icon: 'milk', amount: 12, price: 6.2, payoutPerUnit: 6.2 },
]

export const initialFarmState: FarmState = {
  money: 2430,
  day: 12,
  season: 'Spring',
  weather: 'Sunny',
  selectedPlotIds: [6, 7, 8, 11, 12, 13, 16, 17, 18, 21, 22, 23],
  plots: createInitialPlots(),
  shippedGoods: 0,
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

export const marketTrends = [
  { label: 'Wheat', icon: 'wheat' as const, note: 'High demand', change: '+12%', direction: 'up' as const },
  { label: 'Eggs', icon: 'eggs' as const, note: 'Steady', change: '+8%', direction: 'up' as const },
  { label: 'Milk', icon: 'milk' as const, note: 'Low supply', change: '-5%', direction: 'down' as const },
  { label: 'Corn', icon: 'corn' as const, note: 'High demand', change: '+15%', direction: 'up' as const },
]

export const screenFromHash = (): Screen => {
  const hash = window.location.hash.replace('#', '')
  return hash === 'planning' || hash === 'barn' ? hash : 'overview'
}
