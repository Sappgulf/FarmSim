# FarmSim Performance Report

## Architecture Overview

| Component | Technology |
|-----------|-----------|
| **Runtime** | Browser (Chrome/Safari/Firefox) |
| **Framework** | React 18.2.0 |
| **Build Tool** | Vite 4.0.0 |
| **Styling** | Tailwind CSS 3.3.0 |
| **Testing** | Vitest 0.34.6 |

### Main Loop Architecture
- **FPS Counter Loop**: `GameContext.jsx` lines 697-747 - runs via `requestAnimationFrame`, updates FPS counter every 1000ms
- **System Update Loop**: `FarmSim.jsx` lines 136-172 - throttled to 10 FPS (100ms), updates all game systems
- **Game Systems** (12 total): `FarmingSystem`, `WeatherSystem`, `SeasonSystem`, `EconomicSystem`, `AchievementSystem`, `DiseaseSystem`, `DisasterSystem`, `LivestockSystem`, `FishingSystem`, `SoundSystem`, `MusicSystem`, `QuestSystem`

### Render Path
1. React renders `FarmSimCore` component
2. `GameHeader` - top bar with stats
3. `FarmGrid` - main gameplay area (N×N plot grid)
4. `GameSidebar` - tabs with various systems
5. `NotificationSystem` - toast notifications
6. `ParticleEffectsManager` - visual effects overlay
7. `FPSCounter` / `PerformanceOverlay` - dev overlays

---

## Baseline Hotspots Identified (BEFORE)

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| **25+ setInterval calls** | Each FarmPlot component had its own 1-second interval | High CPU, timer thrashing |
| **React re-renders in particle loop** | `useState` called 60x/sec in animation loop | High CPU, GC pressure |
| **Missing update timing** | No instrumentation to measure system update cost | Blind spots |
| **No quality presets** | No way to reduce effects on low-end devices | Poor mobile experience |

---

## Optimization Changes Implemented

### 1. Centralized Tick Provider
- **File**: `src/components/farm-sim/context/TickContext.jsx` (NEW)
- **Change**: Created single 1-second interval shared by all components
- **Impact**: Reduced N intervals to 1 (25+ → 1 for 5×5 grid)

### 2. FarmGrid Interval Consolidation
- **File**: `src/components/farm-sim/ui/FarmGrid.jsx`
- **Change**: Replaced per-plot `setInterval` with `useTick()` hook
- **Impact**: Eliminated 25 concurrent timers

### 3. GameHeader Interval Consolidation
- **File**: `src/components/farm-sim/ui/GameHeader.jsx`
- **Change**: Replaced `setInterval` for time display with `useTick()`
- **Impact**: Eliminated 1 more timer

### 4. Particle System Optimization (prior session)
- **File**: `src/components/farm-sim/ui/ParticleEffect.jsx`
- **Change**: Replaced `useState` animation loop with direct DOM manipulation via refs
- **Impact**: 60+ re-renders/sec → 1 initial render

### 5. Performance Overlay
- **File**: `src/components/farm-sim/ui/PerformanceOverlay.jsx` (NEW)
- **Change**: Added comprehensive dev overlay with backtick toggle
- **Features**: FPS, frame time, update time, memory, entity counts

### 6. Update Time Instrumentation
- **File**: `src/components/farm-sim/core/FarmSim.jsx`
- **Change**: Added `window.__lastUpdateTime` measurement around system updates
- **Impact**: Enables profiling of game logic cost

### 7. Performance Settings Module
- **File**: `src/performance.js` (NEW)
- **Features**: Quality presets (Low/Medium/High), particle caps, entity limits, adaptive quality

---

## After Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Active Intervals | 25+ | 1 | 96% reduction |
| Particle Re-renders | 60/sec | 1 total | ~99% reduction |
| Test Suite | 9 pass | 9 pass | ✅ No regressions |

---

## How to Profile

```bash
# Start dev server
npm run dev

# Open Chrome DevTools > Performance tab
# Record 10-second session while:
# 1. Planting full 5x5 grid
# 2. Waiting for harvest
# 3. Harvesting all (triggers particles)

# Check Performance Overlay
# Press ` (backtick) to toggle dev overlay

# Check for:
# - Long Tasks (>50ms)
# - Update time in overlay
# - Memory stability in 10-min run
```

---

## Future Headroom Ideas

1. **Web Workers**: Move heavy system calculations off main thread
2. **Virtual Grid**: Only render visible plots for very large grids
3. **Object Pooling**: Reuse particle objects instead of creating new ones
4. **Canvas Rendering**: Move particle system to canvas for GPU acceleration
5. **Lazy Loading**: Code-split tabs that aren't visible on load
