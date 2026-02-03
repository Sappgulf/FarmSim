# Feature Inventory — FarmSim

**Date:** 2026-02-03

## Core Systems
- **Game state + reducer**: `GameContext` + `GameReducer`. (`src/components/farm-sim/context/GameContext.jsx`, `src/components/farm-sim/context/GameReducer.js`)
- **Save/load + migrations**: `GamePersistence`. (`src/components/farm-sim/context/GamePersistence.js`)
- **Season + weather**: `SeasonSystem`, `WeatherSystem`. (`src/components/farm-sim/systems/SeasonSystem.js`, `src/components/farm-sim/systems/WeatherSystem.js`)
- **Farming loop**: `FarmingSystem` + grid UI. (`src/components/farm-sim/systems/FarmingSystem.js`, `src/components/farm-sim/ui/FarmGrid.jsx`)
- **Economy**: `EconomicSystem` + shop UI. (`src/components/farm-sim/systems/EconomicSystem.js`, `src/components/farm-sim/ui/tabs/ShopTab.jsx`)
- **Achievements + memory**: `AchievementSystem`, memory flags in state. (`src/components/farm-sim/systems/AchievementSystem.js`, `src/components/farm-sim/context/GameReducer.js`)

## Content Pipeline (Season Pack Pipeline v1)
- **Content loader/validator**: `src/content/ContentManager.js`
- **Base content**: `content/*.json`
- **Season packs**: `content/packs/<pack_id>/`

## UI + Navigation
- **App entry**: `src/main.jsx`, `src/components/farm-sim/core/FarmSim.jsx`
- **Top HUD + stats**: `GameHeader`. (`src/components/farm-sim/ui/GameHeader.jsx`)
- **Sidebar tabs**: `GameSidebar` + individual tab components. (`src/components/farm-sim/ui/GameSidebar.jsx`, `src/components/farm-sim/ui/tabs/*`)
- **Bottom navigation**: `NavBar`. (`src/components/farm-sim/ui/NavBar.jsx`)

## Content-Driven Features
- **Crops**: `content/crops.json` via `cropData` adapter. (`src/components/farm-sim/constants/cropData.js`)
- **Decor**: `content/decor.json` via `decorData` adapter. (`src/components/farm-sim/constants/decorData.js`)
- **Festivals**: `content/festivals.json` used in Events tab. (`src/components/farm-sim/ui/tabs/EventsTab.jsx`)
- **Almanac**: `content/almanac.json` via `src/data/almanac.js` and `src/systems/almanac.js`
- **Strings/philosophies**: `content/strings.json` via `src/data/identity.js`

## Debug & QA Tooling (Debug-only via `?debug=1`)
- **Performance + crash overlay**: `PerformanceOverlay`. (`src/components/farm-sim/ui/PerformanceOverlay.jsx`)
- **Stress panel**: `DebugStressPanel`. (`src/components/farm-sim/ui/DebugStressPanel.jsx`)

## Legacy/Inactive
- Legacy UI components in `src/components/game/*` and `src/components/panels/*` are retained but not used by the current entry point (`src/main.jsx`).
