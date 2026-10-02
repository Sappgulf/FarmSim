import { useCallback, useEffect, useMemo, useRef, useReducer, useState } from 'react'
import type { CropKey, FarmState, InventoryKey, ProductionRecipeKey, Screen } from './data'
import { cropOptions, cropProfit, formatMoney, productionRecipes, screenFromHash } from './data'
import { farmReducer, type FarmAction } from './state'
import { plantedCrop, plantedPlotIds, plantedPlots, readyPlotIds, wateredPlotIds } from './selectors'
import { loadFarmSession, saveFarmState } from './storage'
import { BarnMarket } from './components/BarnMarket'
import { FarmOverview } from './components/FarmOverview'
import { FieldPlanning } from './components/FieldPlanning'
import { TopBar } from './components/TopBar'
import './styles.css'

type GameplayCoach = {
  title: string
  detail: string
  actionLabel: string
  actionCommand: string | null
  tone: 'positive' | 'warning' | 'info'
  recommendedCrop: CropKey
}

const getDisplayCropLabel = (crop: CropKey) => cropOptions.find((item) => item.key === crop)!.label

const pickRecommendedCrop = (state: FarmState, fallback: CropKey): CropKey => {
  const crops = cropOptions.filter((crop) => state.seedStock[crop.key] > 0)
  return crops.sort((a, b) => cropProfit(b, state.season) / b.growthDays - cropProfit(a, state.season) / a.growthDays)[0]?.key ?? fallback
}

const buildGameplayCoach = (state: FarmState, selectedCrop: CropKey): GameplayCoach => {
  const ready = readyPlotIds(state)
  const planted = plantedPlotIds(state)
  const watered = wateredPlotIds(state)
  const readyCount = ready.length
  const plantedCount = planted.length
  const wateredCount = state.weather === 'Rainy' ? plantedCount : watered.length
  const readyLabel = 'crops'
  const recommendedCrop = pickRecommendedCrop(state, selectedCrop)

  if (readyCount > 0) {
    return {
      title: `${readyCount} ${readyCount === 1 ? 'plot is' : 'plots are'} ready`,
      detail: `Collect now to keep momentum and turn growth into coins quickly.`,
      actionLabel: `Harvest ${readyCount}`,
      actionCommand: `Harvest ${readyCount} ${readyLabel}`,
      tone: 'positive',
      recommendedCrop,
    }
  }

  if (plantedCount > 0 && wateredCount < plantedCount) {
    return {
      title: `${plantedCount - wateredCount} planted plots need water`,
      detail: `Water now to preserve growth and avoid stalled progression.`,
      actionLabel: `Water ${plantedCount - wateredCount} plots`,
      actionCommand: `Water ${plantedCount} ${readyLabel}`,
      tone: 'warning',
      recommendedCrop,
    }
  }

  if (plantedCount > 0) {
    return {
      title: 'Growth is in progress',
      detail: `Watered crops grow when you end the day. Rain waters every planted plot.`,
      actionLabel: 'End day',
      actionCommand: 'Advance day',
      tone: 'info',
      recommendedCrop,
    }
  }

  const recommendedLabel = getDisplayCropLabel(recommendedCrop)

  return {
    title: `Your ${state.season.toLowerCase()} planting plan`,
    detail: `${recommendedLabel} has the best profit per growing day among your stocked seeds.`,
    actionLabel: `Plant ${recommendedLabel}`,
    actionCommand: `Plant ${recommendedLabel}`,
    tone: 'info',
    recommendedCrop,
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => screenFromHash())
  const [session] = useState(() => loadFarmSession())
  const [state, dispatch] = useReducer(farmReducer, session.state)
  const [saveWarning, setSaveWarning] = useState(session.warning)
  const [selectedCrop, setSelectedCrop] = useState<CropKey>('wheat')
  const [barnFocus, setBarnFocus] = useState<'barn' | 'market'>(() => window.location.hash.endsWith('/market') ? 'market' : 'barn')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)
  const recommendedCrop = useMemo(() => pickRecommendedCrop(state, selectedCrop), [state, selectedCrop])
  const gameplayCoach = useMemo(() => buildGameplayCoach(state, selectedCrop), [state, selectedCrop])

  useEffect(() => {
    const onHashChange = () => {
      setScreen(screenFromHash())
      setBarnFocus(window.location.hash.endsWith('/market') ? 'market' : 'barn')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  const announce = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3400)
  }, [])

  useEffect(() => {
    if (session.canSave && !saveFarmState(state)) setSaveWarning('Changes are not saving. Keep this tab open and retry when storage is available.')
  }, [state, session.canSave])

  const navigate = useCallback((nextScreen: Screen, focus?: 'barn' | 'market') => {
    setScreen(nextScreen)
    const nextFocus = focus ?? barnFocus
    if (focus) setBarnFocus(focus)
    const hash = nextScreen === 'barn' ? `#barn/${nextFocus}` : `#${nextScreen}`
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
    document.getElementById('game-main')?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [barnFocus])

  const plant = useCallback(() => {
    if (state.selectedPlotIds.length === 0) {
      announce('Select at least one available plot to plant.')
      return
    }
    if (state.seedStock[selectedCrop] < state.selectedPlotIds.length) {
      announce(`You need ${state.selectedPlotIds.length - state.seedStock[selectedCrop]} more ${selectedCrop} seeds.`)
      return
    }
    const selectedCount = state.selectedPlotIds.length
    dispatch({ type: 'PLANT_SELECTED_PLOTS', crop: selectedCrop })
    announce(`${selectedCount} plots planted with ${selectedCrop}.`)
  }, [announce, selectedCrop, state])

  const water = useCallback(() => {
    const planted = plantedPlotIds(state)
    const thirsty = state.weather === 'Rainy' ? [] : plantedPlots(state).filter((plot) => !plot.ready && !plot.watered)
    if (planted.length === 0) {
      announce('Plant a crop before watering the field.')
      return
    }
    if (thirsty.length === 0) {
      announce('All planted crops are watered for today.')
      return
    }
    dispatch({ type: 'WATER_PLOTS' })
    announce(`${thirsty.length} ${thirsty.length === 1 ? 'crop' : 'crops'} watered. Advance the day to grow them.`)
  }, [announce, state])

  const advanceDay = useCallback(() => {
    const beforeReady = readyPlotIds(state).length
    const action: FarmAction = { type: 'ADVANCE_DAY' }
    const next = farmReducer(state, action)
    dispatch(action)
    if (readyPlotIds(next).length > beforeReady) {
      const count = readyPlotIds(next).length
      announce(`Day ${next.day}: ${count} ${count === 1 ? 'crop is' : 'crops are'} ready to harvest.`)
    } else if (state.weather !== 'Rainy' && plantedPlots(state).some((plot) => !plot.ready && !plot.watered)) {
      announce(`Day ${next.day}: the unwatered crops did not grow.`)
    } else {
      announce(`Day ${next.day} started. Production queue moved forward.`)
    }
  }, [announce, state])

  const harvest = useCallback(() => {
    const ready = readyPlotIds(state)
    const crop = plantedCrop(state)
    if (ready.length === 0 || !crop) {
      announce('No crops are ready to harvest yet.')
      return
    }
    dispatch({ type: 'HARVEST_PLOTS' })
    announce(`${ready.length} plots harvested and added to inventory. Seasonal yield bonuses included.`)
  }, [announce, state])

  const togglePlot = useCallback((plotId: number) => {
    dispatch({ type: 'TOGGLE_PLOT_SELECTION', plotId })
  }, [])

  const ship = useCallback((orderId: string, quantity: number) => {
    const order = state.sellOrders.find((entry) => entry.id === orderId)
    const action: FarmAction = { type: 'SHIP_GOODS', orderId, quantity }
    const next = farmReducer(state, action)
    if (next === state) {
      announce(!order ? 'There is no active sell order for that shipment.' : order.amount < quantity ? `Only ${order.amount} ${order.label.toLowerCase()} remain on this order.` : `You need ${quantity} ${order.label.toLowerCase()} to fill this shipment.`)
      return
    }
    dispatch(action)
    announce(`${quantity} ${order?.label.toLowerCase() ?? 'goods'} shipped — +$${(next.money - state.money).toLocaleString()} added to the farm ledger.`)
  }, [announce, state])

  const cancelQueueItem = useCallback((id: string) => {
    const item = state.productionQueue.find((entry) => entry.id === id)
    dispatch({ type: 'CANCEL_PRODUCTION', id })
    announce(item?.progress === 0 ? `${item.label} cancelled; ingredients returned.` : `${item?.label ?? 'Production'} cancelled. Ingredients already in use cannot be returned.`)
  }, [announce, state.productionQueue])

  const queueRecipe = useCallback((recipe: ProductionRecipeKey) => {
    const action: FarmAction = { type: 'START_PRODUCTION', recipe }
    const next = farmReducer(state, action)
    if (next === state) {
      const recipeDefinition = productionRecipes.find((entry) => entry.key === recipe)
      announce(state.productionQueue.length >= 5 ? 'The production queue is full.' : `You need ${recipeDefinition?.inputAmount ?? 1} ${recipeDefinition?.input ?? 'inputs'} to start this recipe.`)
      return
    }
    dispatch(action)
    announce(`${recipe[0].toUpperCase()}${recipe.slice(1)} added to the production queue.`)
  }, [announce, state])

  const collectQueueItem = useCallback((id: string) => {
    const item = state.productionQueue.find((entry) => entry.id === id)
    if (!item || item.phase !== 'ready') {
      announce(`${item?.label ?? 'That item'} is not ready yet.`)
      return
    }
    dispatch({ type: 'COLLECT_PRODUCTION', id })
    announce(`${item.label} collected and added to inventory.`)
  }, [announce, state.productionQueue])

  const removeOrder = useCallback((id: string) => {
    const order = state.sellOrders.find((entry) => entry.id === id)
    if (!order) return
    dispatch({ type: 'REMOVE_SELL_ORDER', id })
    announce(`${order.label} sell order removed.`)
  }, [announce, state.sellOrders])

  const collectAnimalProducts = useCallback((product: 'eggs' | 'milk') => {
    const quantity = state.animalProducts[product]
    if (quantity < 1) {
      announce(`No ${product} are ready yet. Advance the day to keep production moving.`)
      return
    }
    dispatch({ type: 'COLLECT_ANIMAL_PRODUCTS', product })
    announce(`Collected ${quantity} ${product} and moved them into inventory.`)
  }, [announce, state.animalProducts])

  const focusTask = useCallback((task: string) => {
    if (task.startsWith('Advance')) advanceDay()
    else if (task.startsWith('Water')) water()
    else if (task.startsWith('Harvest')) harvest()
    else if (task.startsWith('Plant')) {
      setSelectedCrop(recommendedCrop)
      navigate('planning')
    } else if (task.startsWith('Ship') || task.startsWith('Sell')) {
      navigate('barn', 'market')
    } else if (task.includes('Collect')) {
      navigate('barn', 'barn')
    }
  }, [advanceDay, harvest, navigate, recommendedCrop, water])

  const transact = useCallback((action: FarmAction, message: string) => {
    if (farmReducer(state, action) === state) {
      announce('That action is unavailable. Check your stock, balance, and farm level.')
      return
    }
    dispatch(action)
    announce(message)
  }, [announce, state])

  const buySeeds = (crop: CropKey, quantity: number) => transact({ type: 'BUY_SEEDS', crop, quantity }, `${quantity} ${crop} seeds added to your seed box.`)
  const sellInventory = (item: InventoryKey, quantity: number) => {
    const next = farmReducer(state, { type: 'SELL_INVENTORY', item, quantity })
    transact({ type: 'SELL_INVENTORY', item, quantity }, `Sold ${quantity} ${item} for ${formatMoney(next.money - state.money)}.`)
  }
  const expand = () => transact({ type: 'EXPAND_FARM' }, 'New plots cleared! Open Fields to plant them.')
  const interactPlot = (id: number) => {
    const plot = state.plots[id]
    if (plot.ready) transact({ type: 'HARVEST_PLOT', plotId: id }, `Plot ${id + 1} harvested.`)
    else if (plot.crop) transact({ type: 'WATER_PLOT', plotId: id }, `Plot ${id + 1} watered.`)
    else {
      dispatch({ type: 'TOGGLE_PLOT_SELECTION', plotId: id })
      navigate('planning')
    }
  }

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      coordinateSystem: 'Farm plots use row-major IDs 0-29, left-to-right and top-to-bottom.',
      screen,
      day: state.day,
      season: state.season,
      weather: state.weather,
      money: state.money,
      selectedCrop,
      seedStock: state.seedStock,
      animalProducts: state.animalProducts,
      selectedPlots: state.selectedPlotIds,
      plantedPlots: plantedPlotIds(state),
      wateredPlots: wateredPlotIds(state),
      readyPlots: readyPlotIds(state),
      inventory: state.inventory,
      productionQueue: state.productionQueue.map(({ id, recipe, progress, phase }) => ({ id, recipe, progress, phase })),
      sellOrders: state.sellOrders.map(({ id, icon, amount, payoutPerUnit }) => ({ id, item: icon, amount, payoutPerUnit })),
    })
    window.advanceTime = async () => Promise.resolve()
    return () => {
      delete window.render_game_to_text
      delete window.advanceTime
    }
  }, [screen, selectedCrop, state])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'f' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select') || target?.isContentEditable) return
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => announce('Could not exit fullscreen.'))
      else if (document.documentElement.requestFullscreen) void document.documentElement.requestFullscreen().catch(() => announce('Fullscreen is unavailable in this browser.'))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
      <div className="app-frame">
      <a className="skip-link" href="#game-main" onClick={(event) => { event.preventDefault(); document.getElementById('game-main')?.focus() }}>Skip to game</a>
      <TopBar state={state} coach={gameplayCoach} onHome={() => navigate('overview')} onAdvanceDay={advanceDay} />
      {saveWarning && <div className="save-warning" role="alert">{saveWarning}{session.canSave && <button type="button" onClick={() => { if (saveFarmState(state)) setSaveWarning('') }}>Retry save</button>}</div>}
      <main id="game-main" tabIndex={-1}>
        {screen === 'overview' && <FarmOverview state={state} coach={gameplayCoach} onNavigate={navigate} onFocusTask={focusTask} onAdvanceDay={advanceDay} onInteractPlot={interactPlot} onExpand={expand} />}
        {screen === 'planning' && <FieldPlanning state={state} selectedCrop={selectedCrop} onSelectCrop={setSelectedCrop} onTogglePlot={togglePlot} onPlant={plant} onWater={water} onHarvest={harvest} onAdvanceDay={advanceDay} onNavigate={navigate} recommendedCrop={recommendedCrop} onBuySeeds={buySeeds} />}
        {screen === 'barn' && <BarnMarket state={state} focus={barnFocus} onFocusChange={(focus) => navigate('barn', focus)} onShip={ship} onCancelProduction={cancelQueueItem} onStartProduction={queueRecipe} onCollectProduction={collectQueueItem} onCollectAnimalProducts={collectAnimalProducts} onRemoveSellOrder={removeOrder} onNavigate={navigate} onBuySeeds={buySeeds} onSellInventory={sellInventory} />}
      </main>
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
