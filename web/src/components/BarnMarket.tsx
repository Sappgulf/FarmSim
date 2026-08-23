import { useState } from 'react'
import { BarChart3, Check, ChevronDown, Clock3, Package, Store, Trash2, TrendingDown, TrendingUp, Truck, Warehouse } from 'lucide-react'
import type { FarmState, ProductionRecipeKey, Screen } from '../data'
import { cropInventoryItems, inventoryItems, marketTrends, processedInventoryItems, productionRecipes } from '../data'
import { AssetIcon } from './AssetIcon'
import { AppNav } from './AppNav'

type BarnMarketProps = {
  state: FarmState
  focus: 'barn' | 'market'
  onFocusChange: (focus: 'barn' | 'market') => void
  onShip: (orderId: string, quantity: number) => void
  onCancelProduction: (id: string) => void
  onStartProduction: (recipe: ProductionRecipeKey) => void
  onCollectProduction: (id: string) => void
  onCollectAnimalProducts: (product: 'eggs' | 'milk') => void
  onRemoveSellOrder: (id: string) => void
  onNavigate: (screen: Screen) => void
}

export function BarnMarket({ state, focus, onFocusChange, onShip, onCancelProduction, onStartProduction, onCollectProduction, onCollectAnimalProducts, onRemoveSellOrder, onNavigate }: BarnMarketProps) {
  const [shipQuantities, setShipQuantities] = useState<Record<string, number>>({})
  const optionalInventoryItems = [...cropInventoryItems, ...processedInventoryItems].filter((item) => state.inventory[item.key] > 0)
  const displayInventoryItems = [...inventoryItems, ...optionalInventoryItems]
  const wheatOrder = state.sellOrders.find((order) => order.id === 'wheat-order')

  const quantityForOrder = (orderId: string, amount: number, inventory: number) => Math.min(shipQuantities[orderId] ?? 5, amount, inventory)

  return (
    <section className="barn-screen screen-surface" aria-labelledby="barn-heading">
      <div className="barn-tabs" role="tablist" aria-label="Barn and market focus">
        <button className={focus === 'barn' ? 'is-active' : ''} type="button" role="tab" aria-selected={focus === 'barn'} aria-controls="barn-operations" onClick={() => onFocusChange('barn')}><Warehouse size={21} /> Barn</button>
        <button className={focus === 'market' ? 'is-active' : ''} type="button" role="tab" aria-selected={focus === 'market'} aria-controls="market-operations" onClick={() => onFocusChange('market')}><Store size={21} /> Market</button>
      </div>

      <div className={`barn-content ${focus === 'barn' ? 'focus-barn' : 'focus-market'}`}>
        <div className="barn-column" id="barn-operations" role="tabpanel" aria-label="Barn operations">
          <div className="section-title-row"><div><h1 id="barn-heading">Inventory</h1><p>Everything ready to move through the farm.</p></div><Package size={21} /></div>
          <div className="inventory-grid">
            {displayInventoryItems.map((item) => (
              <div className="inventory-card" key={item.key}>
                <AssetIcon asset={item.icon} size={58} />
                <strong>{state.inventory[item.key]}</strong>
                <span>{item.label}</span>
                <small>${item.price} each</small>
              </div>
            ))}
          </div>

          <section className="production-panel inner-panel" aria-labelledby="animal-production-heading">
            <div className="inner-panel-heading"><h2 id="animal-production-heading">Animal Production</h2><ChevronDown size={16} /></div>
            <div className="animal-row"><AssetIcon asset="chicken" size={46} /><div className="animal-copy"><strong>Chickens</strong><span>{state.animalProducts.eggs} / 12 eggs</span></div><div className="progress-line"><i style={{ width: `${state.animalProducts.eggs / 12 * 100}%` }} /></div><button className="collect-button" type="button" disabled={state.animalProducts.eggs < 1} onClick={() => onCollectAnimalProducts('eggs')}><AssetIcon asset="eggs" size={25} /> Collect {state.animalProducts.eggs}</button></div>
            <div className="animal-row"><AssetIcon asset="cow" size={46} /><div className="animal-copy"><strong>Cows</strong><span>{state.animalProducts.milk} / 6 milk</span></div><div className="progress-line"><i style={{ width: `${state.animalProducts.milk / 6 * 100}%` }} /></div><button className="collect-button" type="button" disabled={state.animalProducts.milk < 1} onClick={() => onCollectAnimalProducts('milk')}><AssetIcon asset="milk" size={25} /> Collect {state.animalProducts.milk}</button></div>
          </section>

          <section className="production-panel inner-panel" aria-labelledby="queue-heading">
            <div className="inner-panel-heading"><h2 id="queue-heading">Production Queue</h2><Clock3 size={16} /></div>
            <div className="recipe-actions" aria-label="Start production">
              {productionRecipes.map((recipe) => (
                <button className="recipe-button" type="button" key={recipe.key} onClick={() => onStartProduction(recipe.key)} disabled={state.productionQueue.length >= 5 || state.inventory[recipe.input] < recipe.inputAmount} aria-label={`Start ${recipe.label} production`}>
                  <AssetIcon asset={recipe.icon} size={30} />
                  <span><strong>{recipe.label}</strong><small>{recipe.inputAmount} {recipe.input} → {recipe.outputAmount}</small></span>
                </button>
              ))}
            </div>
            {state.productionQueue.length === 0 ? <div className="empty-queue"><Check size={20} /> Queue clear — add a recipe to keep the barn moving.</div> : state.productionQueue.map((item) => (
              <div className="queue-row" key={item.id}>
                <AssetIcon asset={item.icon} size={42} />
                <div className="queue-copy"><strong>{item.label}</strong><span>{item.phase === 'ready' ? 'Ready' : item.status}</span></div>
                <div className="queue-progress"><i style={{ width: `${item.progress * 100}%` }} /></div>
                <span className="queue-time">{item.remaining}</span>
                <button className="mini-icon-button" type="button" aria-label={`${item.phase === 'ready' ? 'Collect' : 'Cancel'} ${item.label}`} onClick={() => item.phase === 'ready' ? onCollectProduction(item.id) : onCancelProduction(item.id)}>{item.phase === 'ready' ? <Check size={15} /> : <Trash2 size={15} />}</button>
              </div>
            ))}
          </section>
        </div>

        <aside className="market-column" id="market-operations" role="tabpanel" aria-label="Market operations">
          <section className="market-trends inner-panel" aria-labelledby="market-trends-heading">
            <div className="inner-panel-heading"><h2 id="market-trends-heading">Market Trends</h2><BarChart3 size={16} /></div>
            <svg className="trend-chart" viewBox="0 0 300 70" role="img" aria-label="Market trend chart rising over the last seven days">
              <title>Market trend chart</title>
              <path d="M0 56 L32 39 L62 46 L94 25 L124 40 L156 27 L186 42 L218 12 L250 27 L300 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {[0, 32, 62, 94, 124, 156, 186, 218, 250, 300].map((x, index) => <circle key={x} cx={x} cy={[56, 39, 46, 25, 40, 27, 42, 12, 27, 4][index]} r="3.5" fill="currentColor" />)}
            </svg>
            <div className="trend-list">
              {marketTrends.map((trend) => {
                const TrendIcon = trend.direction === 'up' ? TrendingUp : TrendingDown
                return <div className="trend-row" key={trend.label}><AssetIcon asset={trend.icon} size={29} /><span><strong>{trend.label}</strong><small>{trend.note}</small></span><b className={trend.direction}>{<TrendIcon size={14} />} {trend.change}</b></div>
              })}
            </div>
          </section>

          <section className="sell-orders inner-panel" aria-labelledby="sell-orders-heading">
            <div className="inner-panel-heading"><h2 id="sell-orders-heading">Sell Orders</h2><Truck size={16} /></div>
            {state.sellOrders.length === 0 ? <div className="empty-queue"><Check size={20} /> No active sell orders.</div> : state.sellOrders.map((order) => {
              const inventory = state.inventory[order.icon]
              const maxQuantity = Math.min(order.amount, inventory)
              const quantity = quantityForOrder(order.id, order.amount, inventory)
              return (
                <div className="sell-row" key={order.id}>
                  <AssetIcon asset={order.icon} size={35} />
                  <span><strong>{order.label}</strong><small>{order.amount} units</small></span>
                  <span className="sell-order-meta"><b>${order.price.toFixed(2)} ea</b><span className="sell-order-actions">
                    <label className="sr-only" htmlFor={`ship-quantity-${order.id}`}>Quantity of {order.label} to ship</label>
                    <input
                      className="sell-quantity"
                      id={`ship-quantity-${order.id}`}
                      type="number"
                      min={1}
                      max={maxQuantity}
                      value={quantity}
                      onChange={(event) => {
                        const nextQuantity = Number(event.target.value)
                        setShipQuantities((current) => ({ ...current, [order.id]: Number.isFinite(nextQuantity) ? Math.max(1, Math.min(maxQuantity, nextQuantity)) : 1 }))
                      }}
                      disabled={maxQuantity < 1}
                    />
                    <button className="mini-icon-button sell-ship-button" type="button" aria-label={`Ship ${quantity} ${order.label}`} onClick={() => onShip(order.id, quantity)} disabled={maxQuantity < 1}><Truck size={14} /></button>
                    <button className="mini-icon-button" type="button" aria-label={`Remove ${order.label} sell order`} onClick={() => onRemoveSellOrder(order.id)}><Trash2 size={15} /></button>
                  </span></span>
                </div>
              )
            })}
          </section>

          <button className="primary-button ship-button" type="button" onClick={() => onShip('wheat-order', 5)} disabled={state.inventory.wheat < 5 || !wheatOrder || wheatOrder.amount < 5}><Truck size={20} /> Ship goods</button>
        </aside>
      </div>

      <AppNav variant="barn" onNavigate={onNavigate} />
    </section>
  )
}
