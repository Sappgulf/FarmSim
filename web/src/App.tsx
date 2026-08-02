import { useCallback, useEffect, useRef, useReducer, useState } from 'react'
import type { CropKey, ProductionRecipeKey, Screen } from './data'
import { cropOptions, productionRecipes, screenFromHash } from './data'
import { farmReducer, type FarmAction } from './state'
import { plantedCrop, plantedPlotIds, readyPlotIds, wateredPlotIds } from './selectors'
import { loadFarmState, saveFarmState } from './storage'
import { BarnMarket } from './components/BarnMarket'
import { FarmOverview } from './components/FarmOverview'
import { FieldPlanning } from './components/FieldPlanning'
import { TopBar } from './components/TopBar'
import './styles.css'

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => screenFromHash())
  const [state, dispatch] = useReducer(farmReducer, undefined, loadFarmState)
  const [selectedCrop, setSelectedCrop] = useState<CropKey>('wheat')
  const [barnFocus, setBarnFocus] = useState<'barn' | 'market'>('barn')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onHashChange = () => setScreen(screenFromHash())
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
    saveFarmState(state)
  }, [state])

  const navigate = useCallback((nextScreen: Screen) => {
    setScreen(nextScreen)
    window.history.replaceState(null, '', `#${nextScreen}`)
  }, [])

  const plant = useCallback(() => {
    if (state.selectedPlotIds.length === 0) {
      announce('Select at least one available plot to plant.')
      return
    }
    if (plantedPlotIds(state).length > 0) {
      announce('Harvest the current crop before planting another field.')
      return
    }
    const selectedCount = state.selectedPlotIds.length
    dispatch({ type: 'PLANT_SELECTED_PLOTS', crop: selectedCrop })
    announce(`${selectedCount} plots planted with ${selectedCrop}.`)
  }, [announce, selectedCrop, state])

  const water = useCallback(() => {
    const planted = plantedPlotIds(state)
    const watered = wateredPlotIds(state)
    if (planted.length === 0) {
      announce('Plant a crop before watering the field.')
      return
    }
    if (readyPlotIds(state).length > 0) {
      announce('Those crops are ready to harvest.')
      return
    }
    if (watered.length === planted.length) {
      announce('All planted crops are watered for today.')
      return
    }
    dispatch({ type: 'WATER_PLOTS' })
    announce(`${planted.length} crops watered. Advance the day to grow them.`)
  }, [announce, state])

  const advanceDay = useCallback(() => {
    const beforeReady = readyPlotIds(state).length
    const action: FarmAction = { type: 'ADVANCE_DAY' }
    const next = farmReducer(state, action)
    dispatch(action)
    if (readyPlotIds(next).length > beforeReady) {
      announce(`Day ${next.day}: ${readyPlotIds(next).length} crops are ready to harvest.`)
    } else if (plantedPlotIds(state).length > 0 && wateredPlotIds(state).length < plantedPlotIds(state).length) {
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
    const cropLabel = cropOptions.find((option) => option.key === crop)?.label.toLowerCase() ?? 'crop'
    dispatch({ type: 'HARVEST_PLOTS' })
    announce(`${ready.length} ${cropLabel} plots harvested and added to inventory.`)
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
    announce(`${item?.label ?? 'Production item'} removed from the queue.`)
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

  const handleUnbuilt = useCallback((label: string) => announce(`${label} is mapped for the next farm slice.`), [announce])

  const focusTask = useCallback((task: string) => {
    if (task.includes('Plant') || task.includes('Water') || task.includes('Harvest')) {
      navigate('planning')
    } else if (task.includes('Ship') || task.includes('Collect')) {
      navigate('barn')
    } else {
      announce(`${task} is mapped for the next farm slice.`)
    }
  }, [announce, navigate])

  return (
    <div className="app-frame">
      <TopBar state={state} onHome={() => navigate('overview')} onAdvanceDay={advanceDay} />
      <main>
        {screen === 'overview' && <FarmOverview state={state} onNavigate={navigate} onUnbuilt={handleUnbuilt} onFocusTask={focusTask} onAdvanceDay={advanceDay} />}
        {screen === 'planning' && <FieldPlanning state={state} selectedCrop={selectedCrop} onSelectCrop={setSelectedCrop} onTogglePlot={togglePlot} onPlant={plant} onWater={water} onHarvest={harvest} onAdvanceDay={advanceDay} onNavigate={navigate} onUnbuilt={handleUnbuilt} />}
        {screen === 'barn' && <BarnMarket state={state} focus={barnFocus} onFocusChange={setBarnFocus} onShip={ship} onCancelProduction={cancelQueueItem} onStartProduction={queueRecipe} onCollectProduction={collectQueueItem} onRemoveSellOrder={removeOrder} onNavigate={navigate} onUnbuilt={handleUnbuilt} />}
      </main>
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
