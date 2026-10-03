import { Home, Sprout, Warehouse } from 'lucide-react'
import type { Screen } from '../data'

type NavItem = {
  label: string
  icon: typeof Home
  target?: Screen
}

type AppNavProps = {
  variant: 'overview' | 'planning' | 'barn'
  onNavigate: (screen: Screen) => void
}

const navigation: NavItem[] = [
  { label: 'Homestead', icon: Home, target: 'overview' },
  { label: 'Fields', icon: Sprout, target: 'planning' },
  { label: 'Barn & Market', icon: Warehouse, target: 'barn' },
]

export function AppNav({ variant, onNavigate }: AppNavProps) {
  return (
    <nav className={`app-nav app-nav-${variant}`} aria-label="Farm navigation">
      {navigation.map(({ label, icon: Icon, target }) => {
        const isCurrent = target === (variant === 'overview' ? 'overview' : variant === 'planning' ? 'planning' : 'barn')
        return (
          <button
            className={`nav-item ${isCurrent ? 'is-current' : ''}`}
            type="button"
            key={label}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => target && onNavigate(target)}
          >
            <Icon size={22} strokeWidth={isCurrent ? 2.6 : 2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
