import { ArrowRight, CalendarDays, Coins, Leaf, SunMedium } from 'lucide-react'
import type { FarmState } from '../data'
import { Brand } from './Brand'

type TopBarProps = {
  state: FarmState
  onHome: () => void
  onAdvanceDay: () => void
}

export function TopBar({ state, onHome, onAdvanceDay }: TopBarProps) {
  return (
    <header className="topbar">
      <Brand onClick={onHome} />
      <div className="topbar-context" aria-label="Farm status">
        <div className="status-chip"><CalendarDays size={16} strokeWidth={2.2} /><span>Day {state.day}</span></div>
        <div className="status-chip"><Leaf size={16} strokeWidth={2.2} /><span>{state.season}</span></div>
        <div className="status-chip money-chip"><Coins size={16} strokeWidth={2.2} /><span>${state.money.toLocaleString()}</span></div>
        <div className="weather-chip" role="img" aria-label={`Weather: ${state.weather}`} title={state.weather}><SunMedium size={26} strokeWidth={1.8} aria-hidden="true" /></div>
        <button className="advance-day-button" type="button" aria-label="Advance to next day" onClick={onAdvanceDay}><span>Advance day</span><ArrowRight size={16} aria-hidden="true" /></button>
      </div>
    </header>
  )
}
