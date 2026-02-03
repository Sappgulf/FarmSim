# Dev Notes — AAA Polish Audit

**Date:** 2026-02-03

## Inventory (Feature + UI)

### Primary Screens / Tabs
- **Farm grid + HUD**: `FarmGrid` + `GameHeader` core UI for plots, stats, and season context. (`src/components/farm-sim/ui/FarmGrid.jsx`, `src/components/farm-sim/ui/GameHeader.jsx`)
- **Tab stack** (all inside `GameSidebar`):
  - Farming (`FarmingTab.jsx`)
  - Inventory (`InventoryTab.jsx`)
  - Shop (`ShopTab.jsx`)
  - Buildings (`BuildingsTab.jsx`)
  - Research (`ResearchTab.jsx`)
  - Genetics (`GeneticsTab.jsx`)
  - Weather (`WeatherTab.jsx`)
  - Pets (`PetsTab.jsx`)
  - Livestock (`LivestockTab.jsx`)
  - Fishing (`FishingTab.jsx`)
  - Challenges (`ChallengesTab.jsx`)
  - Events (`EventsTab.jsx`)
  - Processing (`ProcessingTab.jsx`)
  - Achievements (`AchievementsTab.jsx`)
  - Social (`SocialTab.jsx`)
  - Analytics (`AnalyticsTab.jsx`)
  - Mystery Shop (`MysteryShopTab.jsx`)
  - Daily Quests (`DailyQuestsTab.jsx`)
  - Diseases (`DiseaseManagementTab.jsx`)
  - Expand (`ExpandTab.jsx`)
  - Settings (`SettingsTab.jsx`)
  - Source: `src/components/farm-sim/ui/GameSidebar.jsx`

### Farm Grid / Plots / Scene Layers
- **Plots**: `plots` live in `GameReducer` state and are rendered in `FarmGrid`. (`src/components/farm-sim/context/GameReducer.js`, `src/components/farm-sim/ui/FarmGrid.jsx`)
- **Overlays**: season transitions + weather effects handled in `FarmSim` and `WeatherEffects`. (`src/components/farm-sim/core/FarmSim.jsx`, `src/components/farm-sim/ui/WeatherEffects.jsx`)
- **Particles**: shared particle system for harvest/level effects. (`src/components/farm-sim/ui/ParticleEffect.jsx`)

### Buildings / Anchors / Decorations
- **Buildings**: data + effects defined in `buildingData`, owned in `state.buildings`. (`src/components/farm-sim/constants/buildingData.js`, `src/components/farm-sim/context/GameReducer.js`)
- **Decorations/Anchors**: no dedicated decorations system found in active FarmSim path.

### Calendar / Day / Seasons / Weather / Events / Shop Rotation
- **Seasons**: `SeasonSystem` handles 4-season loop + transitions. (`src/components/farm-sim/systems/SeasonSystem.js`)
- **Weather**: dynamic weather + forecast in `WeatherSystem`. (`src/components/farm-sim/systems/WeatherSystem.js`)
- **Events**: seasonal event list + rewards in `EventsTab`. (`src/components/farm-sim/ui/tabs/EventsTab.jsx`)
- **Daily Quests**: daily reset logic + streak bonuses. (`src/components/farm-sim/ui/tabs/DailyQuestsTab.jsx`, `src/components/farm-sim/systems/QuestSystem.js`)
- **Daily Challenges**: daily reset + streaks. (`src/components/farm-sim/ui/tabs/ChallengesTab.jsx`)
- **Mystery Shop**: rotating pack offerings. (`src/components/farm-sim/ui/tabs/MysteryShopTab.jsx`)

### Collections / Achievements / Scrapbook / Mood / Philosophy
- **Achievements**: achievements data + tab UI. (`src/components/farm-sim/constants/achievementData.js`, `src/components/farm-sim/ui/tabs/AchievementsTab.jsx`)
- **Scrapbook / Mood / Philosophy**: legacy identity loop lives outside active FarmSim. (`src/components/game/StoryDashboard.jsx`, `src/components/panels/ScrapbookPanel.jsx`)

### Notifications / Toasts
- **NotificationSystem**: top-right stack with auto-dismiss + manual close. (`src/components/farm-sim/ui/NotificationSystem.jsx`)

### Debug / QA Tooling (Debug-only via `?debug=1`)
- **Performance + Crash Overlay**: rolling FPS + frame metrics, entity counts, crash capture. (`src/components/farm-sim/ui/PerformanceOverlay.jsx`, `src/utils/debugTools.js`)
- **Stress Panel**: plot fill/harvest, notification spawn/clear, tab stress, buildings toggle, day advance. (`src/components/farm-sim/ui/DebugStressPanel.jsx`)

### Audio / Settings
- **Sound + Music systems**: `SoundSystem` + `MusicSystem` with settings toggles. (`src/components/farm-sim/systems/SoundSystem.js`, `src/components/farm-sim/systems/MusicSystem.js`, `src/components/farm-sim/ui/tabs/settings/AudioSettings.jsx`)

### Save / Load / Versioning
- **Save/Migrate**: `GamePersistence` handles versioned saves + fallback backup. (`src/components/farm-sim/context/GamePersistence.js`)
- **Save UI**: Settings tab manual save/load. (`src/components/farm-sim/ui/tabs/SettingsTab.jsx`)

## Key Systems (Where They Live)
- **State + Actions**: `GameContext` + `GameReducer`. (`src/components/farm-sim/context/GameContext.jsx`, `src/components/farm-sim/context/GameReducer.js`)
- **Core loops**: systems update loop in `FarmSim`; FPS/auto-save loop in `GameContext`. (`src/components/farm-sim/core/FarmSim.jsx`, `src/components/farm-sim/context/GameContext.jsx`)
- **Debug tools**: debug overlay + crash capture. (`src/components/farm-sim/ui/PerformanceOverlay.jsx`, `src/utils/debugTools.js`)

## Duplicates / Legacy Notes
- Legacy non-FarmSim UI (e.g. `src/components/FarmGame.jsx`, `src/components/game/*`, `src/components/panels/*`) appears unused by current entry point (`src/main.jsx`). Keep for now to avoid save/schema breakage.
