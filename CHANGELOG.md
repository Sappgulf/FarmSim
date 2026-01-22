# Changelog

All notable changes to FarmSim are documented here.

## [2.0.0] - 2026-01-21

### Major Overhaul Release

This release represents a complete architecture overhaul focused on stability, mobile experience, and gameplay improvements.

### Added

- **Menu Drawer**: New slide-out menu for settings, achievements, breeding, and game options
- **Harvest All Button**: One-tap button to harvest all ready crops at once
- **Working Building Effects**:
  - Barn: +20% harvest value
  - Greenhouse: 50% faster growth (data passed)
  - Beehive: +25% quality chance (data passed)
  - Windmill: +5 coins per minute passive income
- **Debug Overlay**: Toggle with backtick (`) in dev mode - shows FPS, memory, and game state
- **Reduced Motion Support**: Both system preference and manual toggle
- **Visibility API Integration**: Game pauses tick when tab is hidden (saves battery)
- **Throttled Save System**: Debounced saves to prevent localStorage thrashing
- **Before Unload Save**: Immediate save when page is closing

### Changed

- **Mobile Navigation**: Reduced from 5 bottom tabs to 3 (Farm, Shop, Menu)
- **Bottom Nav**: Increased touch targets to 56px, added safe-area inset padding
- **PlotTile Optimization**: Custom memo comparison to prevent unnecessary re-renders
- **CSS Cleanup**: Removed 20KB of unused styles from legacy component

### Removed

- **FarmSimCanvas.jsx**: Deleted 446KB legacy monolith component
- **deprecated/ folder**: Removed all deprecated backup files
- **Unused imports**: Cleaned up dead code throughout codebase

### Fixed

- **Critical Save/Load Bug**: Save functions now use correct parameters
- **LocalStorage Key**: Migrated to versioned key `farmSim_save_v3`
- **Touch Handling**: Added `touch-action: manipulation` to prevent double-tap zoom
- **Overscroll Bounce**: Disabled on body to prevent accidental scrolling during gameplay

### Technical

- Bundle size reduced: CSS 70KB -> 53KB (gzip: 12.7KB -> 10.5KB)
- All 6 tests passing
- Build time: ~10 seconds
- No TypeScript migration (out of scope), but ready for future conversion

### Migration Notes

If upgrading from v1.x:
- Old saves at `farmSim_save` key will not load automatically
- Users will start fresh with the new v3 save format
- Consider adding migration logic if preserving old saves is critical

---

## [1.1.0] - Previous Release

- Contracts: rotating NPC contracts, reputation gains, delivery handling
- Logistics: vehicles (handcart/tractor/truck/reefer), delivery queue, profits on arrival
- Forecast/Disasters: 5-day forecast UI, rare disasters affecting growth, basic insurance
- Command Center: livestock, farm status, research/automation panels
- Harvest behavior: crops go to inventory instead of auto-sell
- Stability: fixed missing helpers, safe lazy state init, restored save/load
