# FarmSim Developer Notes

## Architecture Overview
- **Entry point**: `index.html` loads the React app via `src/main.jsx`.
- **Core game shell**: `src/components/farm-sim/core/FarmSim.jsx` composes the UI and wires systems.
- **State management**: `src/components/farm-sim/context/GameContext.jsx` owns the reducer, game loop, save/load, and action dispatchers.
- **Systems layer**: `src/components/farm-sim/systems/` contains isolated gameplay systems (farming, weather, quests, etc.).
- **Data/config**: `src/components/farm-sim/constants/` holds game configuration for crops, buildings, achievements, progression, and quests.
- **UI**: `src/components/farm-sim/ui/` is split into reusable components and tab content.

## Game Loop & Update Flow
- **Authoritative loop**: The fixed-step loop lives in `GameContext.jsx` and ticks systems on a 10 FPS cadence.
- **Systems updates**: Each system implements `update(state)` and is invoked by the central loop in `FarmSim.jsx`/`GameContext.jsx`.
- **Dirty updates**: Plot updates are batched and only written when changes are detected (e.g., growth, withering, automation).

## State Shape (High-Level)
- **Core**: `coins`, `xp`, `level`, `gridSize`.
- **Farm**: `plots`, `inventory`, `buildings`, `processing` queues.
- **Progression**: `achievements`, `research`, `genetics`, `dailyQuests`, `weeklyContracts`.
- **Automation**: `automation.lastAutoWaterAt` tracks the auto-watering cadence.
- **Systems**: `weather`, `season`, `livestock`, `fishing`, `pets`.

## Key Files
- `src/components/farm-sim/core/FarmSim.jsx` — top-level UI composition and system initialization.
- `src/components/farm-sim/context/GameContext.jsx` — reducer, loop, save/load, actions.
- `src/components/farm-sim/context/GamePersistence.js` — save versioning, migration, backup handling.
- `src/components/farm-sim/systems/FarmingSystem.js` — crop growth, harvesting, and automation logic.
- `src/components/farm-sim/systems/QuestSystem.js` — daily/weekly quest generation + progress.
- `src/components/farm-sim/constants/questData.js` — data-driven quest/contract templates.

## Feature Inventory
| Feature | Status | Location | Notes / Gaps |
| --- | --- | --- | --- |
| Day rollover backbone | Implemented | `SeasonSystem.js`, `GameContext.jsx` | Single day advance event triggers weather + market refreshes. |
| Seasons | ALREADY IMPLEMENTED (polished) | `SeasonSystem.js`, `GameHeader.jsx`, `CozyStatusBar.jsx` | Day-in-season shown in cozy status bar. |
| Weather | ALREADY IMPLEMENTED (polished) | `WeatherSystem.js`, `WeatherTab.jsx`, `CozyStatusBar.jsx` | Changes only on day rollover + daily outlook forecast. |
| Town reputation | Implemented | `SocialTab.jsx`, `GameContext.jsx`, `constants/townData.js` | 3 tiers with claimable rewards and vendor perk. |
| Collections / encyclopedia | Implemented | `CollectionsTab.jsx`, `constants/collectionData.js`, `GameContext.jsx` | Milestones + subtle sell bonuses per crop. |
| Market daily changes | Implemented | `EconomicSystem.js`, `constants/marketData.js`, `ShopTab.jsx` | Daily featured crop + market mood. |
| HUD/top bar | Implemented | `GameHeader.jsx`, `CozyStatusBar.jsx` | Compact status bar with season/weather/rep/collections. |
| Tab system rendering | ALREADY IMPLEMENTED | `GameSidebar.jsx`, `NavBar.jsx`, `TabWrapper.jsx` | Tab cache + keyboard/focus handling. |
| Performance instrumentation | ALREADY IMPLEMENTED | `DebugService.js`, `PerformanceOverlay.jsx`, `FPSCounter.jsx` | Debug-gated overlay + metrics counters. |
| Save versioning/migrations | ALREADY IMPLEMENTED (updated) | `GamePersistence.js` | v5 migration with market + town rewards. |
| Core farming loop | Implemented | `FarmingSystem.js`, `FarmGrid.jsx` | Stable growth/harvest loop with water + fertility. |
| Daily quests | Implemented | `QuestSystem.js`, `DailyQuestsTab.jsx` | Streak bonus and claim flow. |
| Weekly contracts | Implemented | `QuestSystem.js`, `DailyQuestsTab.jsx` | Weekly cadence (Mon reset). |
| Upgrade system | Partial | `ShopTab.jsx`, `ResearchTab.jsx`, `buildingData.js` | Shop + research upgrades exist; building upgrade UI is limited. |
| Automation (earned) | Implemented | `FarmingSystem.js`, `ShopTab.jsx`, `buildingData.js` | Sprinkler tool + well auto-watering. |
| Data-driven crops | Implemented | `constants/cropData.js` | New crops via config. |
| Data-driven buildings | Implemented | `constants/buildingData.js` | Levels and effects in config. |
| Data-driven quests | Implemented | `constants/questData.js` | Daily/weekly templates in config. |
| Save validation + backup | Implemented | `GamePersistence.js` | Backup slot + fallback on load. |
| Notifications/toasts | Implemented | `NotificationSystem.jsx` | Capped, auto-dismiss, close guards. |
| Livestock system | Implemented | `LivestockSystem.js`, `LivestockTab.jsx` | Production loops. |
| Fishing system | Implemented | `FishingSystem.js`, `FishingTab.jsx` | Minigame + upgrades. |

## Notes
- Avoid duplicating features: check `constants/` and `systems/` before adding new mechanics.
- Save/load flows should go through `GamePersistence.js` to keep validation consistent.
- Any new system should provide: UI surface, persistence hooks, and tests.
