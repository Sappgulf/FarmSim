import { ArrowRight, Check, Droplets, Package, Sprout, Warehouse } from 'lucide-react'
import type { CropKey, FarmState, Screen } from '../data'
import { farmLevel, formatMoney, seasonDay } from '../data'
import { plantedPlots, plotList, readyPlotIds } from '../selectors'
import { AppNav } from './AppNav'
import { FarmPlots } from './FarmPlots'

type GameplayCoach = { title: string; detail: string; actionLabel: string; actionCommand: string | null; tone: 'positive' | 'warning' | 'info'; recommendedCrop: CropKey }
type Props = { state: FarmState; onNavigate: (screen: Screen) => void; onFocusTask: (task: string) => void; onAdvanceDay: () => void; coach: GameplayCoach; onInteractPlot: (id: number) => void; onExpand: () => void }

export function FarmOverview({ state, onNavigate, onFocusTask, onAdvanceDay, coach, onInteractPlot, onExpand }: Props) {
  const plots = plotList(state)
  const planted = plantedPlots(state)
  const ready = readyPlotIds(state).length
  const thirsty = state.weather === 'Rainy' ? 0 : planted.filter((plot) => !plot.ready && !plot.watered).length
  const free = plots.filter((plot) => plot.available && !plot.crop).length
  const locked = plots.filter((plot) => !plot.available).length
  const level = farmLevel(state)
  return <section className="overview-screen screen-surface" aria-labelledby="overview-heading">
    <div className="homestead-heading"><div><p className="eyebrow">Your little corner of the countryside</p><h1 id="overview-heading">A new day on the homestead</h1></div><span>{state.season} {seasonDay(state.day)} / 28 · Level {level}</span></div>
    <div className={`farm-scene live-world weather-${state.weather.toLowerCase()}`}>
      <div className="scene-vignette" />
      <aside className="task-panel panel farm-journal" aria-label="Farm journal">
        <p className="eyebrow">Farm journal</p>
        <h2>{coach.title}</h2><p>{coach.detail}</p>
        {coach.actionCommand && <button className="primary-button journal-action" type="button" onClick={() => onFocusTask(coach.actionCommand!)}>{coach.actionLabel}<ArrowRight size={17} /></button>}
        <div className="journal-metrics"><span><Check size={16} />{ready} ready</span><span><Droplets size={16} />{thirsty} need water</span><span><Sprout size={16} />{free} empty plots</span></div>
        <div className="level-progress"><span>Level {level} · {state.xp % 60} / 60 XP</span><div role="progressbar" aria-label="Progress to next farm level" aria-valuenow={state.xp % 60} aria-valuemin={0} aria-valuemax={60}><i style={{ width: `${state.xp % 60 / 60 * 100}%` }} /></div></div>
        <p className="journal-note">Plant → water → end day → harvest → sell. In-season crops yield one extra unit per plot.</p>
      </aside>
      <FarmPlots state={state} onPlot={onInteractPlot} interactiveCrops />
      <div className="world-hint">Tap a crop to water or harvest · Empty soil opens your planting plan</div>
    </div>
    <div className="farm-dock">
      <button type="button" onClick={() => onNavigate('barn')}><Warehouse size={20} /><span><strong>Visit the barn</strong><small>{state.animalProducts.eggs} eggs · {state.animalProducts.milk} milk ready</small></span><ArrowRight size={17} /></button>
      <button type="button" onClick={() => onFocusTask('Sell goods')}><Package size={20} /><span><strong>Town market</strong><small>Sell your harvest & stock up on seeds</small></span><ArrowRight size={17} /></button>
      {locked > 0 ? <button type="button" onClick={onExpand} disabled={level < 2 || state.money < 500}><Sprout size={20} /><span><strong>Clear {Math.min(5, locked)} new plots</strong><small>Level 2 · {formatMoney(500)}</small></span></button> : <span className="farm-complete">All 30 plots are yours.</span>}
      <button type="button" className="end-day-dock" onClick={onAdvanceDay}>End day <ArrowRight size={17} /></button>
    </div>
    <AppNav variant="overview" onNavigate={onNavigate} />
  </section>
}
