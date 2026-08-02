import { BookOpen, Box, Home, Map, PawPrint, Sprout, Store, Warehouse, Hammer, Package, Tractor, ClipboardList } from 'lucide-react'
import type { Screen } from '../data'

type NavItem = {
  label: string
  icon: typeof Home
  target?: Screen
}

type AppNavProps = {
  variant: 'overview' | 'planning' | 'barn'
  onNavigate: (screen: Screen) => void
  onUnbuilt: (label: string) => void
}

const navigation: Record<AppNavProps['variant'], NavItem[]> = {
  overview: [
    { label: 'Build', icon: Hammer },
    { label: 'Crops', icon: Sprout, target: 'planning' },
    { label: 'Animals', icon: PawPrint, target: 'barn' },
    { label: 'Inventory', icon: Box, target: 'barn' },
    { label: 'Map', icon: Map, target: 'overview' },
    { label: 'Journal', icon: BookOpen },
  ],
  planning: [
    { label: 'Overview', icon: Map, target: 'overview' },
    { label: 'Field Planning', icon: Sprout, target: 'planning' },
    { label: 'Soil Info', icon: ClipboardList },
    { label: 'Crop Guide', icon: BookOpen },
  ],
  barn: [
    { label: 'Overview', icon: Home, target: 'overview' },
    { label: 'Animals', icon: PawPrint, target: 'barn' },
    { label: 'Production', icon: Warehouse, target: 'barn' },
    { label: 'Storage', icon: Package, target: 'barn' },
    { label: 'Market', icon: Store, target: 'barn' },
  ],
}

export function AppNav({ variant, onNavigate, onUnbuilt }: AppNavProps) {
  return (
    <nav className={`app-nav app-nav-${variant}`} aria-label="Farm navigation">
      {navigation[variant].map(({ label, icon: Icon, target }) => {
        const isCurrent = (variant === 'overview' && label === 'Map') || (variant === 'planning' && label === 'Field Planning') || (variant === 'barn' && label === 'Market')
        return (
          <button
            className={`nav-item ${isCurrent ? 'is-current' : ''}`}
            type="button"
            key={label}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => target ? onNavigate(target) : onUnbuilt(label)}
          >
            <Icon size={22} strokeWidth={isCurrent ? 2.6 : 2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
