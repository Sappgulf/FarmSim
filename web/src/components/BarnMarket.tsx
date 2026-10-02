import { useState } from 'react'
import { Check, ChevronDown, Clock3, Package, Store, Trash2, Truck, Warehouse } from 'lucide-react'
import type { CropKey, FarmState, InventoryKey, ProductionRecipeKey, Screen } from '../data'
import { allInventoryItems, cropInventoryItems, cropOptions, formatMoney, inventoryItems, processedInventoryItems, productionRecipes } from '../data'
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
  onBuySeeds: (crop: CropKey, quantity: number) => void
  onSellInventory: (item: InventoryKey, quantity: number) => void
  onNavigate: (screen: Screen) => void
}

export function BarnMarket({ state, focus, onFocusChange, onShip, onCancelProduction, onStartProduction, onCollectProduction, onCollectAnimalProducts, onRemoveSellOrder, onNavigate, onBuySeeds, onSellInventory }: BarnMarketProps) {
  const [shipQuantities, setShipQuantities] = useState<Record<string, number>>({})
  const optionalInventoryItems = [...cropInventoryItems, ...processedInventoryItems].filter((item) => state.inventory[item.key] > 0)
  const displayInventoryItems = [...inventoryItems, ...optionalInventoryItems]


  const quantityForOrder = (orderId: string, amount: number, inventory: number) => Math.min(shipQuantities[orderId] ?? 5, amount, inventory)

  return (
    <section className="barn-screen screen-surface" aria-labelledby="barn-heading">
      <div className="market-page-heading"><p className="eyebrow">From your farm to the town</p><h1 id="barn-heading">Barn & Market</h1><p>Collect, craft, sell, and plant again.</p></div>
      <div className="barn-tabs" role="tablist" aria-label="Barn and market focus">
        <button className={focus === 'barn' ? 'is-active' : ''} type="button" role="tab" aria-selected={focus === 'barn'} id="barn-tab" aria-controls="barn-operations" tabIndex={focus === 'barn' ? 0 : -1} onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'End'].includes(event.key)) { event.preventDefault(); onFocusChange('market'); document.getElementById('market-tab')?.focus() } }} onClick={() => onFocusChange('barn')}><Warehouse size={21} /> Barn</button>
        <button className={focus === 'market' ? 'is-active' : ''} type="button" role="tab" aria-selected={focus === 'market'} id="market-tab" aria-controls="market-operations" tabIndex={focus === 'market' ? 0 : -1} onKeyDown={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) { event.preventDefault(); onFocusChange('barn'); document.getElementById('barn-tab')?.focus() } }} onClick={() => onFocusChange('market')}><Store size={21} /> Market</button>
      </div>

      <div className={`barn-content ${focus === 'barn' ? 'focus-barn' : 'focus-market'}`}>
        <div className="barn-column" id="barn-operations" role="tabpanel" aria-labelledby="barn-tab" hidden={focus !== 'barn'}>
          <div className="section-title-row"><div><h2>Inventory</h2><p>Everything ready to move through the farm.</p></div><Package size={21} /></div>
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
            <div className="inner-panel-heading"><h2 id="queue-heading">Workshop · 2 day batches</h2><Clock3 size={16} /></div>
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
                <button className="mini-icon-button" type="button" title={item.phase === 'ready' ? 'Collect finished goods' : item.progress === 0 ? 'Cancel and return ingredients' : 'Ingredients in use; cancellation does not refund them'} aria-label={`${item.phase === 'ready' ? 'Collect' : 'Cancel'} ${item.label}`} onClick={() => item.phase === 'ready' ? onCollectProduction(item.id) : onCancelProduction(item.id)}>{item.phase === 'ready' ? <Check size={15} /> : <Trash2 size={15} />}</button>
              </div>
            ))}
          </section>
        </div>

        <aside className="market-column" id="market-operations" role="tabpanel" aria-labelledby="market-tab" hidden={focus !== 'market'}>
          <section className="inner-panel seed-shop" aria-labelledby="seed-shop-heading">
            <div className="inner-panel-heading"><h2 id="seed-shop-heading">Seed shop</h2><Store size={18} /></div>
            <p>Restock at any time. One seed plants one plot.</p>
            {cropOptions.map((crop) => <div className="seed-shop-row" key={crop.key}><AssetIcon asset={crop.key} size={42} /><span><strong>{crop.label}</strong><small>{state.seedStock[crop.key]} seeds in stock</small></span><button className="collect-button" type="button" disabled={state.money < crop.seedPrice * 10} aria-label={`Buy 10 ${crop.label} seeds for ${formatMoney(crop.seedPrice * 10)}`} onClick={() => onBuySeeds(crop.key, 10)}>Buy 10 · {formatMoney(crop.seedPrice * 10)}</button></div>)}
          </section>
          <section className="inner-panel" aria-labelledby="farm-stall-heading">
            <div className="inner-panel-heading"><h2 id="farm-stall-heading">Farm stall</h2><Package size={18} /></div>
            <p>Sell any goods at the listed price. No order required.</p>
            {allInventoryItems.filter((item) => state.inventory[item.key] > 0).map((item) => <div className="seed-shop-row" key={item.key}><AssetIcon asset={item.icon} size={42} /><span><strong>{item.label}</strong><small>{state.inventory[item.key]} in stock · {formatMoney(item.price)} each</small></span><button className="collect-button" type="button" aria-label={`Sell all ${state.inventory[item.key]} ${item.label} for ${formatMoney(item.price * state.inventory[item.key])}`} onClick={() => onSellInventory(item.key, state.inventory[item.key])}>Sell all · {formatMoney(item.price * state.inventory[item.key])}</button></div>)}
            {allInventoryItems.every((item) => state.inventory[item.key] === 0) && <div className="empty-queue">Your stall is empty. Harvest crops or collect animal goods to sell.</div>}
          </section>

          <section className="sell-orders inner-panel" aria-labelledby="sell-orders-heading">
            <div className="inner-panel-heading"><h2 id="sell-orders-heading">Town orders</h2><Truck size={16} /></div>
            {state.sellOrders.length === 0 ? <div className="empty-queue"><Check size={20} /> Orders return tomorrow. Your farm stall stays open.</div> : state.sellOrders.map((order) => {
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
                      step={1}
                      max={maxQuantity}
                      value={quantity}
                      onChange={(event) => {
                        const nextQuantity = Number(event.target.value)
                        setShipQuantities((current) => ({ ...current, [order.id]: Number.isFinite(nextQuantity) ? Math.max(1, Math.min(maxQuantity, Math.floor(nextQuantity))) : 1 }))
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


        </aside>
      </div>

      <AppNav variant="barn" onNavigate={onNavigate} />
    </section>
  )
}
