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

## Tabs / Panels / Routes Inventory (Current Entry Point: FarmSim)
**Primary tabs rendered in the sidebar (`GameSidebar`):** (`src/components/farm-sim/ui/GameSidebar.jsx`)
- Farming: `FarmingTab`. (`src/components/farm-sim/ui/tabs/FarmingTab.jsx`)
- Inventory: `InventoryTab`. (`src/components/farm-sim/ui/tabs/InventoryTab.jsx`)
- Shop: `ShopTab`. (`src/components/farm-sim/ui/tabs/ShopTab.jsx`)
- Buildings: `BuildingsTab`. (`src/components/farm-sim/ui/tabs/BuildingsTab.jsx`)
- Expand: `ExpandTab`. (`src/components/farm-sim/ui/tabs/ExpandTab.jsx`)
- Research: `ResearchTab`. (`src/components/farm-sim/ui/tabs/ResearchTab.jsx`)
- Genetics: `GeneticsTab`. (`src/components/farm-sim/ui/tabs/GeneticsTab.jsx`)
- Weather: `WeatherTab`. (`src/components/farm-sim/ui/tabs/WeatherTab.jsx`)
- Pets: `PetsTab`. (`src/components/farm-sim/ui/tabs/PetsTab.jsx`)
- Livestock: `LivestockTab`. (`src/components/farm-sim/ui/tabs/LivestockTab.jsx`)
- Fishing (mini-game): `FishingTab`. (`src/components/farm-sim/ui/tabs/FishingTab.jsx`)
- Challenges: `ChallengesTab`. (`src/components/farm-sim/ui/tabs/ChallengesTab.jsx`)
- Events / Town Board: `EventsTab`. (`src/components/farm-sim/ui/tabs/EventsTab.jsx`)
- Processing: `ProcessingTab`. (`src/components/farm-sim/ui/tabs/ProcessingTab.jsx`)
- Achievements: `AchievementsTab`. (`src/components/farm-sim/ui/tabs/AchievementsTab.jsx`)
- Almanac: `AlmanacTab`. (`src/components/farm-sim/ui/tabs/AlmanacTab.jsx`)
- Social: `SocialTab`. (`src/components/farm-sim/ui/tabs/SocialTab.jsx`)
- Analytics (debug): `AnalyticsTab`. (`src/components/farm-sim/ui/tabs/AnalyticsTab.jsx`)
- Mystery Shop: `MysteryShopTab`. (`src/components/farm-sim/ui/tabs/MysteryShopTab.jsx`)
- Quests: `DailyQuestsTab`. (`src/components/farm-sim/ui/tabs/DailyQuestsTab.jsx`)
- Disease Management: `DiseaseManagementTab`. (`src/components/farm-sim/ui/tabs/DiseaseManagementTab.jsx`)
- Settings: `SettingsTab`. (`src/components/farm-sim/ui/tabs/SettingsTab.jsx`)

**Legacy/alternate UI (not wired to entrypoint):**
- `FarmGame` + panel tabs + `BottomNav`. (`src/components/FarmGame.jsx`, `src/components/panels/*`, `src/components/game/*`)

## Icon System / Assets
- **UI icons**: lucide-react icons and emoji in NavBar/Tab labels. (`src/components/farm-sim/ui/NavBar.jsx`, `src/components/farm-sim/ui/GameSidebar.jsx`)
- **Content icons**: content JSON uses `emoji`/`icon` fields (crops/decor/festivals) normalized via ContentManager. (`content/*.json`, `src/content/ContentManager.js`)

## Mini-Games (Existing)
- **Fishing mini-game**: `FishingSystem` + `FishingTab`. (`src/components/farm-sim/systems/FishingSystem.js`, `src/components/farm-sim/ui/tabs/FishingTab.jsx`)
- **Festival timing mini-game**: Perfect Harvest v2 engine + modal + Events tab. (`content/minigames.json`, `src/components/farm-sim/minigames/PerfectHarvestEngine.js`, `src/components/farm-sim/ui/minigames/PerfectHarvestModal.jsx`, `src/components/farm-sim/ui/tabs/EventsTab.jsx`)

## Notifications / Toasts
- **Notification stack**: `NotificationSystem`. (`src/components/farm-sim/ui/NotificationSystem.jsx`)
- **Legacy notifications**: `NotificationStack`. (`src/components/game/NotificationStack.jsx`)

## Save / Load
- **Persistence + migrations**: `GamePersistence`. (`src/components/farm-sim/context/GamePersistence.js`)
- **Reducer state**: `GameReducer`. (`src/components/farm-sim/context/GameReducer.js`)
- **Auto-save + load**: `GameContext`. (`src/components/farm-sim/context/GameContext.jsx`)

## Performance / Debug Instrumentation
- **FPS counter**: `FPSCounter`. (`src/components/farm-sim/ui/FPSCounter.jsx`)
- **Performance overlay**: `PerformanceOverlay`. (`src/components/farm-sim/ui/PerformanceOverlay.jsx`)
- **Stress tools**: `DebugStressPanel`. (`src/components/farm-sim/ui/DebugStressPanel.jsx`)
- **Debug hooks**: `debugTools`. (`src/utils/debugTools.js`)

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
