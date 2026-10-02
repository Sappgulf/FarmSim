import { ArrowRight, CalendarDays, Cloud, CloudRain, Coins, Leaf, Sparkles, SunMedium, Wind } from 'lucide-react'
import type { FarmState } from '../data'
import { Brand } from './Brand'
import { formatMoney, seasonDay } from '../data'

type CoachTone = 'positive' | 'warning' | 'info'

type GameplayCoach = {
  title: string
  tone: CoachTone
}

type TopBarProps = {
  state: FarmState
  coach: GameplayCoach
  onHome: () => void
  onAdvanceDay: () => void
}

export function TopBar({ state, coach, onHome, onAdvanceDay }: TopBarProps) {
  const WeatherIcon = state.weather === 'Rainy' ? CloudRain : state.weather === 'Cloudy' ? Cloud : state.weather === 'Windy' ? Wind : SunMedium
  return (
    <header className="topbar">
      <Brand onClick={onHome} />
      <div className={`hud-coach coach-${coach.tone}`} role="status" aria-live="polite">
        <Sparkles size={14} strokeWidth={2} />
        <span>{coach.title}</span>
      </div>
      <div className="topbar-context" aria-label="Farm status">
        <div className="status-chip day-chip"><CalendarDays size={16} strokeWidth={2.2} /><span>Day {state.day}</span></div>
        <div className="status-chip season-chip"><Leaf size={16} strokeWidth={2.2} /><span>{state.season} {seasonDay(state.day)}</span></div>
        <div className="status-chip money-chip"><Coins size={16} strokeWidth={2.2} /><span>{formatMoney(state.money)}</span></div>
        <div className={`weather-chip weather-${state.weather.toLowerCase()}`} role="img" aria-label={`Weather: ${state.weather}`} title={state.weather}><WeatherIcon size={26} strokeWidth={1.8} aria-hidden="true" /></div>
        <button className="advance-day-button" type="button" aria-label="Advance to next day" onClick={onAdvanceDay}><span>Advance day</span><ArrowRight size={16} aria-hidden="true" /></button>
      </div>
    </header>
  )
}
