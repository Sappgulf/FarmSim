# Dev Notes — AAA Polish Audit

**Date:** 2026-02-04

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
  - Almanac (`AlmanacTab.jsx`)
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
- **Decorations/Anchors**: decor catalog + placement mode backed by content pipeline and `decorateMode`. (`content/decor.json`, `src/components/farm-sim/constants/decorData.js`, `src/components/farm-sim/ui/FarmGrid.jsx`)

### Calendar / Day / Seasons / Weather / Events / Shop Rotation
- **Seasons**: `SeasonSystem` handles 4-season loop + transitions. (`src/components/farm-sim/systems/SeasonSystem.js`)
- **Weather**: dynamic weather + forecast in `WeatherSystem`. (`src/components/farm-sim/systems/WeatherSystem.js`)
- **Events**: seasonal event list + rewards loaded from content pipeline. (`content/festivals.json`, `src/components/farm-sim/ui/tabs/EventsTab.jsx`)
- **Day rollover**: Almanac day count + daily insight uses date key checks in GameContext autosave loop. (`src/components/farm-sim/context/GameContext.jsx`)
- **Daily Quests**: daily reset logic + streak bonuses. (`src/components/farm-sim/ui/tabs/DailyQuestsTab.jsx`, `src/components/farm-sim/systems/QuestSystem.js`)
- **Daily Challenges**: daily reset + streaks. (`src/components/farm-sim/ui/tabs/ChallengesTab.jsx`)
- **Mystery Shop**: rotating pack offerings. (`src/components/farm-sim/ui/tabs/MysteryShopTab.jsx`)
- **Town Board**: Cozy Goals prompts, “What’s New” highlights, Welcome Back summary, Daily Delight, and Weekly Visits rewards. (`src/components/farm-sim/ui/tabs/EventsTab.jsx`, `src/utils/cozyGoals.js`)

### Collections / Achievements / Scrapbook / Almanac / Philosophy
- **Achievements**: achievements data + tab UI. (`src/components/farm-sim/constants/achievementData.js`, `src/components/farm-sim/ui/tabs/AchievementsTab.jsx`)
- **Scrapbook**: legacy memory panel used inside Achievements tab with memory flags. (`src/components/panels/ScrapbookPanel.jsx`, `src/components/farm-sim/context/GameContext.jsx`)
- **Almanac**: event-driven knowledge journal with philosophy-flavored copy. (`src/components/farm-sim/ui/tabs/AlmanacTab.jsx`, `src/data/almanac.js`, `src/components/farm-sim/context/GameContext.jsx`)
- **Philosophy**: stored in FarmSim state for Almanac flavor. (`src/components/farm-sim/context/GameReducer.js`)
- **Farm Themes + Farm Card**: theme selection + Farm Card export, spotlight selection, and farm name stored in save. (`src/data/farmThemes.js`, `src/utils/farmCard.js`, `src/components/farm-sim/ui/tabs/AlmanacTab.jsx`)

### Mini-Games
- **Fishing mini-game**: `FishingSystem` + `FishingTab`. (`src/components/farm-sim/systems/FishingSystem.js`, `src/components/farm-sim/ui/tabs/FishingTab.jsx`)
- **Festival Timing (Perfect Harvest v2)**: data-driven rule sets + engine + modal UI, launched from Events tab. (`content/minigames.json`, `src/components/farm-sim/minigames/PerfectHarvestEngine.js`, `src/components/farm-sim/ui/minigames/PerfectHarvestModal.jsx`, `src/components/farm-sim/ui/tabs/EventsTab.jsx`)

### Notifications / Toasts
- **NotificationSystem**: top-right stack with auto-dismiss + manual close. (`src/components/farm-sim/ui/NotificationSystem.jsx`)

### Onboarding (Soft Tutorial)
- **Overlay UI**: `src/components/farm-sim/ui/Tutorial.jsx` (3-step, non-blocking, event-driven).
- **State + persistence**: `onboardingSeen`, `onboardingStep`, `onboardingSkipped` in `GameReducer` + `GamePersistence`.
- **Triggers**: plant/harvest in `FarmGrid`, Town Board open in `FarmSim` tab change.
- **Early wins**: memory + almanac unlocks + first harvest bonus in `GameContext.recordOnboardingEvent`.

### Debug / QA Tooling (Debug-only via `?debug=1`)
- **Performance + Crash Overlay**: rolling FPS + frame metrics, entity counts, crash capture. (`src/components/farm-sim/ui/PerformanceOverlay.jsx`, `src/utils/debugTools.js`)
- **Stress Panel**: plot fill/harvest, notification spawn/clear, tab stress, buildings toggle, day advance. (`src/components/farm-sim/ui/DebugStressPanel.jsx`)

### Audio / Settings
- **Sound + Music systems**: `SoundSystem` + `MusicSystem` with settings toggles. (`src/components/farm-sim/systems/SoundSystem.js`, `src/components/farm-sim/systems/MusicSystem.js`, `src/components/farm-sim/ui/tabs/settings/AudioSettings.jsx`)

### Save / Load / Versioning
- **Save/Migrate**: `GamePersistence` handles versioned saves + fallback backup, including retention state. (`src/components/farm-sim/context/GamePersistence.js`)
- **App version**: single source of truth in `src/config/release.js` (APP_VERSION + release mode flag; save schema version remains separate).
- **Almanac state**: stored under `state.almanac` (unlocked pages, dates, counters, last day key). (`src/components/farm-sim/context/GameReducer.js`)
- **Save UI**: Settings tab manual save/load. (`src/components/farm-sim/ui/tabs/SettingsTab.jsx`)

## Content Pipeline (Season Pack Pipeline v1)

### File Map
- **Content manager + validator**: `src/content/ContentManager.js` (loads base content, merges packs, validates, exposes maps). 
- **Base content schemas**: `content/` (JSON files for crops, decor, festivals, almanac, strings).
- **Season packs**: `content/packs/<pack_id>/` with `pack.json` + optional content files.
- **Starter pack (data-only)**: `content/packs/starter-pack-v1/` (welcome decor).
- **Adapters**:
  - Crops: `src/components/farm-sim/constants/cropData.js`
  - Decor: `src/components/farm-sim/constants/decorData.js`
  - Almanac: `src/data/almanac.js`
  - Philosophy strings: `src/data/identity.js`

### Debug Hooks (Dev-only)
- **Re-validate content** + **Print content report** buttons in Debug Stress Panel (`?debug=1`). (`src/components/farm-sim/ui/DebugStressPanel.jsx`)

### Entitlements (Sprint G3 — Monetization-Ready Cosmetics)
- **Entitlement manager**: central gating + persistence helpers live in `src/components/farm-sim/entitlements/EntitlementManager.js`.
- **Save location**: entitlements stored in save data under `state.entitlements` (mode + unlocked pack IDs).
- **Premium mode**: dev-only toggle in Debug Stress Panel (`?debug=1`); release mode forces free access.
- **Cosmetic fallback**: locked premium decor reverts to default in premium mode with a notification.

## Key Systems (Where They Live)
- **State + Actions**: `GameContext` + `GameReducer`. (`src/components/farm-sim/context/GameContext.jsx`, `src/components/farm-sim/context/GameReducer.js`)
- **Core loops**: systems update loop in `FarmSim`; FPS/auto-save loop in `GameContext`. (`src/components/farm-sim/core/FarmSim.jsx`, `src/components/farm-sim/context/GameContext.jsx`)
- **Debug tools**: debug overlay + crash capture. (`src/components/farm-sim/ui/PerformanceOverlay.jsx`, `src/utils/debugTools.js`)

## Duplicates / Legacy Notes
- Legacy non-FarmSim UI (e.g. `src/components/FarmGame.jsx`, `src/components/game/*`, `src/components/panels/*`) appears unused by current entry point (`src/main.jsx`). Keep for now to avoid save/schema breakage.

## Season Pack v1 (Sprint F1) — Additions vs Extensions

### Added (New, Data-Only Content)
- Season Pack v1 expansion: Snowdrop, Turnip, Ginger Root crops; Winter Hearth decor set; Winter Hearth Market festival. (`content/packs/season-pack-v1/*`)
- Almanac pages for pack crops, festival, decor moments, pets, and Cozy Goals. (`content/packs/season-pack-v1/almanac.json`)

### Extended (Existing Systems)
- Town Board: Cozy Goals generation, completion rewards, and “What’s New” pack highlights with dismiss tracking. (`src/components/farm-sim/ui/tabs/EventsTab.jsx`, `src/utils/cozyGoals.js`)
- Almanac + Scrapbook: new pack memories, crop triggers, decor triggers, and festival-specific unlocks. (`src/data/identity.js`, `src/components/farm-sim/context/GameContext.jsx`)
- Save/load: Cozy Goals + “What’s New” state persisted safely. (`src/components/farm-sim/context/GameReducer.js`, `src/components/farm-sim/context/GamePersistence.js`)

### Polished (Feedback / Audio / Accessibility)
- Added audio ducking for music during sound effects. (`src/components/farm-sim/systems/SoundSystem.js`, `src/components/farm-sim/systems/MusicSystem.js`)

## Sprint I1-I3 (Cozy Variety Expansion)

- **Data definitions:** `src/data/cozyExpansion.js` contains crop trait tables, rare moments, decor sets, farm titles, weekly special day copy, and visual accent tokens.
- **State + logic:** `GameContext.recordCozyExpansionEvent` in `src/components/farm-sim/context/GameContext.jsx` handles trait discovery, rare moment idempotency, decor set completion checks, and title unlocks/event notifications.
- **Save safety:** `GameReducer` adds `cozyExpansion` defaults; `GamePersistence` migrates/normalizes to save version 12 with optional fields for old saves.
- **UI surfaces:**
  - `AlmanacTab` shows trait discoveries and farm title selection.
  - `EventsTab` shows weekly special-day copy and current active title in Farm Card summary.
  - `farmCard` rendering includes active title text.
- **Visual accents:** `FarmSim` applies time-of-day tint/filter accents and reuses `WeatherEffects` for low-cost weather ambience (visual-only).

