import { ArrowLeft, Check, Clock3, Droplets, Sprout } from 'lucide-react'
import { cropOptions, cropProfit, cropYield, formatMoney, type CropKey, type FarmState, type Screen } from '../data'
import { plantedPlots, readyPlotIds } from '../selectors'
import { AssetIcon } from './AssetIcon'
import { AppNav } from './AppNav'
import { FarmPlots } from './FarmPlots'

type Props = { state: FarmState; selectedCrop: CropKey; onSelectCrop: (crop: CropKey) => void; onTogglePlot: (plot: number) => void; onSelectEmpty: () => void; onClearSelection: () => void; onPlant: () => void; onWater: () => void; onHarvest: () => void; onAdvanceDay: () => void; onNavigate: (screen: Screen) => void; recommendedCrop: CropKey; onBuySeeds: (crop: CropKey, quantity: number) => void }

export function FieldPlanning({ state, selectedCrop, onSelectCrop, onTogglePlot, onSelectEmpty, onClearSelection, onPlant, onWater, onHarvest, onAdvanceDay, onNavigate, recommendedCrop, onBuySeeds }: Props) {
  const selected = state.selectedPlotIds.length
  const planted = plantedPlots(state)
  const ready = readyPlotIds(state).length
  const thirsty = state.weather === 'Rainy' ? 0 : planted.filter((plot) => !plot.ready && !plot.watered).length
  const enough = state.seedStock[selectedCrop] >= selected
  const empty = Object.values(state.plots).filter((plot) => plot.available && !plot.crop).length
  const primary = selected > 0 ? { label: `Plant ${selected} ${selectedCrop} ${selected === 1 ? 'plot' : 'plots'}`, action: onPlant, disabled: !enough, icon: Sprout } : ready > 0 ? { label: `Harvest ${ready} ${ready === 1 ? 'plot' : 'plots'}`, action: onHarvest, icon: Check } : thirsty > 0 ? { label: `Water ${thirsty} ${thirsty === 1 ? 'plot' : 'plots'}`, action: onWater, icon: Droplets } : planted.length > 0 ? { label: `End day ${state.day}`, action: onAdvanceDay, icon: Clock3 } : { label: 'Select empty plots to plant', action: onPlant, disabled: true, icon: Sprout }
  const PrimaryIcon = primary.icon
  return <section className="planning-screen screen-surface" aria-labelledby="planning-heading">
    <div className="planning-main">
      <div className="planning-heading-row"><button className="icon-button" type="button" aria-label="Back to farm overview" onClick={() => onNavigate('overview')}><ArrowLeft size={21} /></button><div><p className="eyebrow">Make room for something good</p><h1 id="planning-heading">Field Planning</h1><p>Mix crops on empty plots. Water daily, or let the rain help.</p></div></div>
      <div className="field-action-bar"><button className="primary-button" type="button" disabled={primary.disabled} onClick={primary.action}><PrimaryIcon size={20} />{primary.label}</button>{selected > 0 && thirsty > 0 && <button className="secondary-button" type="button" onClick={onWater}>Water {thirsty}</button>}{selected > 0 && ready > 0 && <button className="secondary-button" type="button" onClick={onHarvest}>Harvest {ready}</button>}</div>
      <div className="field-selection-actions" aria-label="Plot selection"><button className="secondary-button" type="button" disabled={empty === 0 || selected === empty} onClick={onSelectEmpty}>Select {empty} empty plots</button><button className="secondary-button" type="button" disabled={selected === 0} onClick={onClearSelection}>Clear selection</button></div>
      <div className={`field-art live-world weather-${state.weather.toLowerCase()}`}><FarmPlots state={state} onPlot={onTogglePlot} /></div>
      <div className="plot-legend"><span><i className="legend-swatch selected" />{selected} selected</span><span><i className="legend-swatch planted" />{planted.length} planted</span><span><i className="legend-swatch ready" />{ready} ready</span><span><i className="legend-swatch unavailable" />Locked land</span></div>
      <div className="crop-progress-list" aria-label="Growing crops">{cropOptions.map((crop) => {
        const group = planted.filter((plot) => plot.crop === crop.key)
        if (!group.length) return null
        const min = Math.min(...group.map((plot) => plot.growthDays))
        const max = Math.max(...group.map((plot) => plot.growthDays))
        return <p key={crop.key}><strong>{crop.label} · {group.length} {group.length === 1 ? 'plot' : 'plots'}</strong><span>{min === max ? min : `${min}–${max}`} / {crop.growthDays} days · {group.filter((plot) => plot.watered || state.weather === 'Rainy').length} watered</span></p>
      })}</div>
    </div>
    <aside className="crop-chooser panel" aria-label="Crop choices">
      <div className="chooser-title"><div><h2>Choose your next harvest</h2><p>Yield and profit if harvested in {state.season.toLowerCase()}. Seasons may change while crops grow.</p></div></div>
      <div className="crop-options">{cropOptions.map((crop) => <div className="crop-choice" key={crop.key}>
        <button className={`crop-card ${crop.key === selectedCrop ? 'is-selected' : ''}`} type="button" onClick={() => onSelectCrop(crop.key)} aria-pressed={crop.key === selectedCrop}>
          <AssetIcon asset={crop.icon} size={64} /><span className="crop-card-copy"><span className="crop-card-title"><strong>{crop.label}</strong>{crop.key === selectedCrop && <span className="crop-fit-badge"><Check size={12} />Selected</span>}</span><span className="crop-stat"><span>Harvest</span><strong>{cropYield(crop, state.season)} units · {crop.growthDays} days</strong></span><span className="crop-stat"><span>Net profit / plot</span><strong className="return-stat">{formatMoney(cropProfit(crop, state.season))}</strong></span><span className="crop-stat seed-stat"><span>Seeds</span><strong>{state.seedStock[crop.key]} in stock</strong></span>{crop.key === recommendedCrop && <small className="crop-recommend-badge">Best profit per growing day</small>}</span>
        </button>
        <div className="seed-buy-actions"><button className="seed-buy-button" type="button" onClick={() => onBuySeeds(crop.key, 1)} disabled={state.money < crop.seedPrice}>Buy 1 {crop.label.toLowerCase()} seed · {formatMoney(crop.seedPrice)}</button><button className="seed-buy-button" type="button" onClick={() => onBuySeeds(crop.key, 10)} disabled={state.money < crop.seedPrice * 10}>Buy 10 · {formatMoney(crop.seedPrice * 10)}</button></div>
      </div>)}</div>
      <p className="field-progress" role="status">{!enough ? `Buy ${selected - state.seedStock[selectedCrop]} more ${selectedCrop} seeds to plant your selection.` : `${selected} plots selected · one seed per plot.`}</p>
      <p className="planner-note">{state.weather === 'Rainy' ? 'Rain waters every crop today.' : 'Unwatered crops wait until watered; they do not wither.'} All workshop batches take two days.</p>
    </aside>
    <AppNav variant="planning" onNavigate={onNavigate} />
  </section>
}
