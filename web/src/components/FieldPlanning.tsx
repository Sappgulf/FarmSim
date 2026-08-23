import { ArrowLeft, Check, Clock3, Droplets, Leaf, Map, Sprout } from 'lucide-react'
import type { CropKey, FarmState, Screen } from '../data'
import { cropOptions, unavailablePlots } from '../data'
import { growthDays, plantedPlotIds, readyPlotIds, selectedPlotIds, wateredPlotIds } from '../selectors'
import { AssetIcon } from './AssetIcon'
import { AppNav } from './AppNav'

type FieldPlanningProps = {
  state: FarmState
  selectedCrop: CropKey
  onSelectCrop: (crop: CropKey) => void
  onTogglePlot: (plot: number) => void
  onPlant: () => void
  onWater: () => void
  onHarvest: () => void
  onAdvanceDay: () => void
  onNavigate: (screen: Screen) => void
}

export function FieldPlanning({ state, selectedCrop, onSelectCrop, onTogglePlot, onPlant, onWater, onHarvest, onAdvanceDay, onNavigate }: FieldPlanningProps) {
  const activeCrop = cropOptions.find((crop) => crop.key === selectedCrop) ?? cropOptions[0]
  const selectedIds = selectedPlotIds(state)
  const plantedIds = plantedPlotIds(state)
  const wateredIds = wateredPlotIds(state)
  const readyIds = readyPlotIds(state)
  const selectedCount = selectedIds.length
  const plantedCount = plantedIds.length
  const wateredCount = wateredIds.length
  const readyCount = readyIds.length
  const selectedSet = new Set(selectedIds)
  const plantedSet = new Set(plantedIds)
  const wateredSet = new Set(wateredIds)
  const readySet = new Set(readyIds)
  const plotCountLabel = selectedCount === 0 ? 'Select plots' : `Plant ${selectedCount} plots`
  const hasEnoughSeeds = state.seedStock[selectedCrop] >= selectedCount

  return (
    <section className="planning-screen screen-surface" aria-labelledby="planning-heading">
      <div className="planning-main">
        <div className="planning-heading-row">
          <button className="icon-button" type="button" aria-label="Back to farm overview" onClick={() => onNavigate('overview')}><ArrowLeft size={21} /></button>
          <div><h1 id="planning-heading">Field Planning</h1><p>Select plots and choose a crop to plant.</p></div>
        </div>

        <div className="field-art" aria-label="Field plot planning map">
          <div className="field-art-wash" />
          <div className="plot-grid" role="group" aria-label="30 farm plots">
            {Array.from({ length: 30 }, (_, index) => {
              const plot = state.plots[index]
              const isUnavailable = !plot?.available || unavailablePlots.has(index)
              const isSelected = selectedSet.has(index)
              const isPlanted = plantedSet.has(index)
              const isWatered = wateredSet.has(index)
              const isReady = readySet.has(index)
              const plotStatus = isUnavailable ? 'unavailable' : isReady ? 'ready to harvest' : isWatered ? 'watered' : isPlanted ? 'planted' : isSelected ? 'selected' : 'available'
              return (
                <button
                  className={`plot-tile ${isUnavailable ? 'is-unavailable' : ''} ${isSelected ? 'is-selected' : ''} ${isPlanted ? 'is-planted' : ''} ${isWatered ? 'is-watered' : ''} ${isReady ? 'is-ready' : ''}`}
                  type="button"
                  aria-label={`Plot ${index + 1}: ${plotStatus}`}
                  aria-pressed={isSelected}
                  disabled={isUnavailable || plantedCount > 0}
                  onClick={() => onTogglePlot(index)}
                  key={index}
                >
                  {isReady ? <Check size={17} strokeWidth={2.6} aria-hidden="true" /> : (isSelected || isPlanted) && <Sprout size={17} strokeWidth={2.4} aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          <div className="field-fence field-fence-top" />
          <div className="field-fence field-fence-bottom" />
        </div>

      <div className="plot-legend" aria-label="Plot legend">
        <span><i className="legend-swatch selected" />Selected ({selectedCount})</span>
        {plantedCount > 0 && <span><i className="legend-swatch planted" />Planted ({plantedCount})</span>}
        {readyCount > 0 && <span><i className="legend-swatch ready" />Ready ({readyCount})</span>}
        <span><i className="legend-swatch available" />Available</span>
        <span><i className="legend-swatch unavailable" />Unavailable</span>
        </div>
      </div>

      <aside className="crop-chooser panel" aria-label="Crop choices">
        <div className="chooser-title"><div><h2>Choose a crop</h2><p>Compare fit, time, and return.</p></div><Leaf size={19} /></div>
        <div className="crop-options">
          {cropOptions.map((crop) => (
            <button className={`crop-card ${crop.key === selectedCrop ? 'is-selected' : ''}`} type="button" key={crop.key} onClick={() => onSelectCrop(crop.key)} aria-pressed={crop.key === selectedCrop}>
              <AssetIcon asset={crop.icon} size={64} />
              <span className="crop-card-copy">
                <span className="crop-card-title"><strong>{crop.label}</strong>{crop.key === selectedCrop && <span className="crop-fit-badge"><Check size={12} /> Best fit</span>}</span>
                <span className="crop-stat"><span>Season Fit</span><strong className={`fit-${crop.fitTone}`}><Leaf size={13} /> {crop.seasonFit}</strong></span>
                <span className="crop-stat"><span>Growth Time</span><strong><Clock3 size={13} /> {crop.growthTime}</strong></span>
                <span className="crop-stat"><span>Water Need</span><strong className="water-stat"><Droplets size={13} /> {crop.waterNeed}</strong></span>
                <span className="crop-stat"><span>Projected Return</span><strong className="return-stat"><span className="coin-dot">$</span>${crop.projectedReturn}</strong></span>
                <span className="crop-stat seed-stat"><span>Seed Stock</span><strong>{state.seedStock[crop.key]} seeds · {crop.harvestYield}× yield</strong></span>
              </span>
            </button>
          ))}
        </div>
        <p className="field-progress" aria-live="polite">
          {readyCount > 0 ? `${readyCount} plots are ready to harvest.` : plantedCount > 0 ? `${wateredCount} / ${plantedCount} watered · ${growthDays(state)} / ${activeCrop.growthDays} growth days` : !hasEnoughSeeds ? `Need ${selectedCount - state.seedStock[selectedCrop]} more ${selectedCrop} seeds.` : `${selectedCount} plots selected · ${state.seedStock[selectedCrop]} seeds available.`}
        </p>
        {readyCount > 0 ? (
          <button className="primary-button plant-button" type="button" onClick={onHarvest}><Check size={20} /> Harvest {readyCount} plots</button>
        ) : plantedCount > 0 && wateredCount < plantedCount ? (
          <button className="primary-button plant-button" type="button" onClick={onWater}><Droplets size={20} /> Water {plantedCount} plots</button>
        ) : plantedCount > 0 ? (
          <button className="primary-button plant-button" type="button" onClick={onAdvanceDay}><Clock3 size={20} /> Advance to day {state.day + 1}</button>
        ) : (
          <button className="primary-button plant-button" type="button" disabled={selectedCount === 0 || !hasEnoughSeeds} onClick={onPlant}><Sprout size={20} /> {plotCountLabel}</button>
        )}
      </aside>

      <AppNav variant="planning" onNavigate={onNavigate} />
      <button className="planning-map-link" type="button" onClick={() => onNavigate('overview')}><Map size={16} /> Return to map</button>
      <span className="planning-active-crop" aria-live="polite">{activeCrop.label} selected · {activeCrop.growthDays} days</span>
    </section>
  )
}
