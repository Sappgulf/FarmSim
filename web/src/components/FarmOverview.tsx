import { ArrowRight, Check, ChevronRight, Droplets, Package, Sprout } from 'lucide-react'
import type { FarmState, Screen } from '../data'
import { plantedCrop, plantedPlotIds, readyPlotIds, wateredPlotIds } from '../selectors'
import { AssetIcon } from './AssetIcon'
import { AppNav } from './AppNav'

type FarmOverviewProps = {
  state: FarmState
  onNavigate: (screen: Screen) => void
  onUnbuilt: (label: string) => void
  onFocusTask: (task: string) => void
  onAdvanceDay: () => void
}

export function FarmOverview({ state, onNavigate, onUnbuilt, onFocusTask, onAdvanceDay }: FarmOverviewProps) {
  const crop = plantedCrop(state)
  const cropLabel = crop === 'tomato' ? 'Tomato' : crop === 'corn' ? 'Corn' : 'Wheat'
  const plantedIds = plantedPlotIds(state)
  const readyIds = readyPlotIds(state)
  const wateredIds = wateredPlotIds(state)
  const plantedCount = plantedIds.length
  const readyCount = readyIds.length
  const wateredProgress = plantedCount === 0 ? 8 : Math.min(wateredIds.length, 12)
  const plantedComplete = plantedCount >= 12
  const shippedComplete = state.shippedGoods >= 5
  const waterComplete = plantedCount > 0 && wateredProgress >= Math.min(plantedCount, 12)
  const nextUp = readyCount > 0 ? `Harvest ${readyCount} ${cropLabel}` : plantedCount > 0 && wateredIds.length < plantedCount ? `Water ${plantedCount} ${cropLabel}` : plantedCount > 0 ? `Advance to Day ${state.day + 1}` : `Plant 12 ${cropLabel}`

  const tasks = [
    { label: readyCount > 0 ? `Harvest ${readyCount} ${cropLabel}` : 'Water 12 crops', detail: readyCount > 0 ? `${readyCount} ready` : `${wateredProgress} / 12`, icon: readyCount > 0 ? <Check size={26} className="task-check" /> : <Droplets size={26} className="task-icon-water" />, complete: waterComplete },
    { label: 'Collect eggs', detail: '6 / 6', icon: <AssetIcon asset="chicken" size={40} />, complete: true },
    { label: `Plant 12 ${cropLabel}`, detail: `${Math.min(plantedCount, 12)} / 12`, icon: <AssetIcon asset={crop ?? 'wheat'} size={42} />, complete: plantedComplete },
    { label: 'Ship 5 goods', detail: `${Math.min(state.shippedGoods, 5)} / 5`, icon: <Package size={26} />, complete: shippedComplete },
  ]

  return (
    <section className="overview-screen screen-surface" aria-labelledby="overview-heading" aria-describedby="overview-scene-description">
      <p id="overview-scene-description" className="sr-only">A spring farm with a barn, pond, vegetable plots, wheat field, and winding paths.</p>
      <div className="farm-scene">
        <div className="scene-vignette" />
        <div className="task-panel panel">
          <div className="panel-heading-row">
            <h1 id="overview-heading">Tasks</h1>
            <ClipboardGlyph />
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <button className={`task-row ${task.complete ? 'is-complete' : ''} ${task.label.includes('Plant') && !task.complete ? 'is-highlighted' : ''}`} key={task.label} type="button" onClick={() => onFocusTask(task.label)}>
                <span className="task-visual">{task.icon}</span>
                <span className="task-copy"><strong>{task.label}</strong><small>{task.detail}</small></span>
                {task.complete ? <Check size={20} className="task-check" aria-label="Complete" /> : <ChevronRight size={18} className="task-chevron" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <button className="link-button" type="button" onClick={() => onUnbuilt('View all tasks')}>View all tasks <ChevronRight size={17} /></button>
        </div>

        <button className="scene-callout" type="button" aria-live="polite" onClick={() => nextUp.startsWith('Advance') ? onAdvanceDay() : onFocusTask(nextUp)}>
            <span className="callout-pin"><Sprout size={19} /></span>
            <span><small>Next Up</small><strong>{nextUp}</strong></span>
            <ArrowRight size={18} />
        </button>

        <div className={`plot-highlight ${plantedComplete ? 'is-planted' : ''}`} aria-hidden="true">
          <span className="plot-sprouts"><i /><i /><i /><i /><i /><i /></span>
        </div>

        <AppNav variant="overview" onNavigate={onNavigate} onUnbuilt={onUnbuilt} />
      </div>
    </section>
  )
}

function ClipboardGlyph() {
  return <span className="clipboard-glyph" aria-hidden="true"><span /></span>
}
