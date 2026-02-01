# FarmSim Developer Notes

## Feature/Systems Inventory
**Sprint A: Stability + Performance Lock**

### Core Systems (src/components/farm-sim/systems)

| System | Status | Key Responsibilities | Notes / Duplicates |
| :--- | :--- | :--- | :--- |
| **FarmingSystem** | Implemented | Crop growth, planting, harvesting, water, fertility, automation. | Core loop. Handled in `update()`. |
| **SeasonSystem** | **ACTIVE** | Season cycle (Spring/Summer/Fall/Winter), Day Advancement (Legacy 30s/2m). | **ACTIVE TIME SOURCE**: Configured in `FarmSim.jsx`. |
| **CalendarSystem** | **INACTIVE** | Day/Week tracking, Festivals, Configurable day length (8m). | **ORPHAN**: File exists but is NOT instantiated in `GameContext`. Safe to update/refactor later. |
| **WeatherSystem** | Implemented | Daily weather events, forecasts, modifiers (growth/yield). | Driven by `onDayAdvance`. |
| **EconomicSystem** | Implemented | Market prices, daily crop trends, shop transaction logic. | Driven by `onDayAdvance`. |
| **QuestSystem** | Implemented | Daily Quests, Weekly Contracts, Streaks. | Driven by `onDayAdvance`. |
| **AchievementSystem**| Implemented | Tracking stats, unlocking achievements. | Checks every 5s (interval). |
| **LivestockSystem** | Implemented | Animal production (milk/wool), hunger, feeding. | Ticks every update (10FPS). |
| **FishingSystem** | Implemented | Fishing minigame mechanics, fish catching. | Independent state. |
| **DiseaseSystem** | Implemented | Crop diseases spread/cure. | Ticks every update. |
| **DisasterSystem** | Implemented | Random events (storm, drought, pests). | Low probability checks. |
| **RotationEngine** | **INACTIVE** | Deterministic shop rotation RNG (Cosmetics). | **ORPHAN**: Unused. |
| **Sound/Music** | Implemented | Audio management. | Event-driven + state changes. |

### UI Components (src/components/farm-sim/ui)

| Component | Status | Key Features |
| :--- | :--- | :--- |
| **FarmGrid** | Polished | Main gameplay area. Canvas/DOM hybrid (implied). Handles plots, placement. |
| **GameHeader** | Polished | HUD, XP/Coins, Level, Save/Pause controls. |
| **GameSidebar** | Polished | Tab navigation. |
| **NavBar** | Polished | Mobile bottom nav. |
| **CozyStatusBar** | Polished | Season, Day, Weather, Rep display. Connects to `SeasonSystem`. |
| **NotificationSystem**| Polished | Toasts management. |
| **Tabs** | Polished | `Inventory`, `Buildings`, `Social`, `Analytics`, `Settings`, etc. |

### Debug & Dev Tools (src/components/farm-sim/ui)

| Tool | Status | Features | Phase 1/2 Gap |
| :--- | :--- | :--- | :--- |
| **DevDebugOverlay** | Partial | XP/Perf stats. Copy Report. | Missing live "Action Trace" feed. |
| **DevErrorOverlay** | Implemented| Captures global errors + recent actions log. | **COVERS "CRASH CAPTURE" & "ACTION TRACE"**. |
| **DevStressPanel** | Partial | Fill/Harvest/Notify/Stress Loop. | Missing "Rapid Tab Switch" & "Advance 30 Days". |
| **FPSCounter** | Basic | Simple FPS number. | - |
| **PerformanceOverlay**| Advanced | FPS, Timer/Listener counts, worst frame. | Good for Phase 1. |

### Architecture & Data

- **GameContext**: Central Loop (10FPS), State Reducer, Action Dispatcher.
- **Persistence**: `GamePersistence.js` handles Save/Load/Backup/Migration.
- **Constants**: `cropData`, `buildingData`, `questData`, `socialData`, `inventoryData`, `buildingDisplayData` (Centralized).

## Roadmap: Sprint A (Stability + Performance)
1.  **Audit**: Complete. Identified overlaps (`Season` vs `Calendar`).
2.  **Safety Net**:
    - Ensure `DevErrorOverlay` catches ALL crashes (React Error Boundary + window.onerror).
    - Enhance `DevStressPanel` with missing stress tests.
3.  **Crash Fixes**: Fix potential double-advancement from dual time systems. Fix hot-loop allocations.
4.  **Perf Lock**: Optimize `FarmGrid` rendering (cache DOM). Optimize `GameContext` reducer.

## "No Duplicates" Strategy
- **Time System**: `SeasonSystem` is dominant (UI dependency). `CalendarSystem` will be effectively muted (update loop disabled) to prevent conflicts, while preserving its helper utility methods if needed.
- **Debug Tools**: Use existing `Dev*` components. Do not create new files. Enhance `DevStressPanel`.

