import { Check, Droplets, LockKeyhole, Sprout } from 'lucide-react'
import { cropOptions, type FarmState } from '../data'
import { plotList } from '../selectors'
import { CropStageIcon } from './CropStageIcon'

type Props = { state: FarmState; onPlot: (id: number) => void; interactiveCrops?: boolean }

export function FarmPlots({ state, onPlot, interactiveCrops = false }: Props) {
  return <div className="live-plot-grid" role="group" aria-label="Farm plots, arranged in five rows and six columns">
    {plotList(state).map((plot) => {
      const selected = state.selectedPlotIds.includes(plot.id)
      const crop = cropOptions.find((item) => item.key === plot.crop)
      const status = !plot.available ? 'locked' : plot.ready ? `${crop?.label}, ready to harvest` : crop ? `${crop.label}, ${plot.growthDays} of ${crop.growthDays} growth days, ${plot.watered ? 'watered' : state.weather === 'Rainy' ? 'rain watered' : 'needs water'}` : selected ? 'selected for planting' : 'empty'
      return <button type="button" key={plot.id} className={`live-plot ${!plot.available ? 'locked' : ''} ${selected ? 'selected' : ''} ${plot.crop ? 'planted' : ''} ${plot.watered ? 'watered' : ''} ${plot.ready ? 'ready' : ''}`}
        aria-label={`Plot ${plot.id + 1}: ${status}`} aria-pressed={plot.crop ? undefined : selected}
        disabled={!plot.available || (!interactiveCrops && !!plot.crop) || (interactiveCrops && !!plot.crop && !plot.ready && plot.watered)}
        onClick={() => onPlot(plot.id)}>
        {crop ? <CropStageIcon crop={crop.key} growthDays={plot.growthDays} totalDays={crop.growthDays} ready={plot.ready} /> : !plot.available ? <LockKeyhole size={14} aria-hidden="true" /> : selected ? <Sprout size={21} aria-hidden="true" /> : <span className="plot-number">{plot.id + 1}</span>}
        {plot.ready && <Check className="live-plot-mark" size={16} aria-hidden="true" />}
        {plot.watered && !plot.ready && <Droplets className="live-plot-mark water" size={14} aria-hidden="true" />}
      </button>
    })}
  </div>
}
