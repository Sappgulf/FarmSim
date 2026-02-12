Original prompt: ok lets continue the next perf options

## 2026-02-12 - Sub-agent orchestration setup (debug/fix/improve/scout)
- Skills handling:
  - Used `skill-creator` because the request was to create reusable sub-agent behavior.
- Implemented a parallel sub-agent runner with isolated git worktrees:
  - Added `scripts/subagents/run-parallel.sh` to launch role-based Codex agents concurrently.
  - Added role prompts:
    - `scripts/subagents/prompts/debug.md`
    - `scripts/subagents/prompts/fix.md`
    - `scripts/subagents/prompts/improve.md`
    - `scripts/subagents/prompts/scout.md`
  - Added helper scripts:
    - `scripts/subagents/status.sh` (inspect latest run summary)
    - `scripts/subagents/cleanup.sh` (remove run worktrees; optional branch deletion)
  - Added usage docs: `scripts/subagents/README.md`
- Project script wiring:
  - `package.json` now includes:
    - `npm run agents:run`
    - `npm run agents:status`
    - `npm run agents:cleanup`
- Live run validation:
  - Executed `npm run agents:run -- --agents scout --run-id smoke-scout`.
  - Successful scout branch/worktree created (`subagent/smoke-scout-scout`) with run artifacts under `.subagents/runs/smoke-scout/`.
  - Promoted scout improvement into main branch:
    - Added `clearFarmCache()` helper and migrated Settings reset/cache-clear flows off `localStorage.clear()`.
    - Added regression tests in `src/test/gamePersistence.test.js`.
    - Upgraded localStorage test mock (`key`, `length`) in `src/test/setup.js`.
  - Added `.subagents/` to `.gitignore` and excluded `.subagents/**` from Vitest discovery in `vitest.config.js`.

## Validation
- `bash -n` passed for all sub-agent scripts.
- `npm run agents:run -- --help` passed.
- `npm run agents:status` passed.
- `npm run agents:cleanup -- --help` passed.
- `npm run qa:full` passed (`npm test` + `npm run build`).

## 2026-02-12 - Fresh parallel pass (core perf + debug UI quality)
- Skills handling:
  - Read available skill docs and followed guidance.
  - No skill matched this request (`skill-creator` / `skill-installer` are for skill management), so implementation proceeded directly.
- Track 1 (performance / core rerender reduction):
  - `FarmSimCore` migrated off broad `useGame()` root subscription.
  - Now uses targeted `useGameSelector` slices (`paused`, `fps`, settings flags, season/weather/theme, ghost state) + `useGameStore()` snapshot reads for the system loop.
  - System update loop now reads `store.getState()` per frame, preserving latest-state behavior without forcing whole-core rerenders on unrelated state changes.
- Track 2 (UI / debug overlay quality):
  - `DebugOverlay.jsx` improvements:
    - Added `Escape` close support (in addition to backtick toggle).
    - Fixed level readout to use `level` with fallback to `levelId`.
    - Memory metric now renders correctly when value is `0`.
    - Plot counts switched from per-render filter to single-pass memoized counting.

## Validation
- `npm test` passed (20 files / 61 tests).
- `npm run build` passed.

## 2026-02-12 - Parallel pass (UI nav + selector perf tightening)
- Skills check:
  - Reviewed available skills (`skill-creator`, `skill-installer`) per request.
  - Neither matched this implementation task, so proceeded with direct code improvements.
- Track 1 (UI / navigation discoverability + accessibility):
  - `NavBar.jsx` now includes an active-section context row for multi-tab sections with explicit expand/collapse control.
  - Added per-section micro-cues (`N tabs` / `Hide`) to make nested navigation discoverable on mobile.
  - Added ARIA state wiring for sections/sub-tabs (`aria-expanded`, `aria-controls`, `aria-current`, richer labels).
  - Auto-opens sub-tabs when active tab belongs to the selected section.
- Track 2 (performance / render-path cleanup):
  - `GameHeader.jsx` reduced broad subscriptions by deriving compact summary selectors:
    - achievement summary key (`unlocked|total`)
    - built-building count
  - `GameSidebar.jsx` now subscribes directly to derived primitive counts (`inventoryCount`, `builtCount`, `animalCount`) instead of whole objects/arrays.
  - `goalHints.js` expanded `getNextGoalFromCounts` to accept `builtBuildings` / `hasBuiltStructure`, allowing callers with precomputed counts to avoid object scans.
  - `QAModePanel.jsx` keeps store-snapshot model (`useGameStore`) to avoid tick-driven rerenders from global state subscriptions.

## Validation
- `npm test` passed (20 files / 61 tests).
- `npm run build` passed.

## 2026-02-12 - Parallel pass (UI agent + perf agent) after npm install
- Environment/tooling:
  - Installed Node.js + npm via Homebrew (`node v25.6.1`, `npm 11.9.0`) so local validation can run again.
- Track 1 (UI / discoverability + accessibility):
  - Polished `NavBar.jsx` for mobile discoverability:
    - Added active-section context row with explicit expand/collapse control for multi-tab sections.
    - Added visual tab-count cues (`N tabs` / `Hide`) on section buttons.
    - Added ARIA state wiring (`aria-expanded`, `aria-controls`, `aria-label`, `aria-current`) for section/sub-tab controls.
- Track 2 (Performance / selector cleanup):
  - Reduced broad subscriptions and repeated derivations:
    - `QAModePanel.jsx` now uses `useGameStore` snapshot reads (previous pass) and remains isolated from tick churn.
    - `GameHeader.jsx` now subscribes to compact achievement/building summaries instead of whole `achievements`/`buildings` objects.
    - `GameSidebar.jsx` now subscribes directly to primitive counts (`inventoryCount`, `builtCount`, `animalCount`) instead of full objects/arrays.
  - `goalHints.js` now supports `builtBuildings` / `hasBuiltStructure` hints in `getNextGoalFromCounts`, avoiding mandatory object scans in call sites that already have derived counts.

## Validation
- `npm test` passed (20 files / 61 tests).
- `npm run build` passed.

## 2026-02-12 - Parallel pass (UI + Performance tracks)
- Track A (Performance / debug tooling):
  - Refactored `QAModePanel.jsx` away from broad `useGame()` subscriptions.
  - Switched to `useGameActions` + `useGameStore` (+ `useGameSystems`) so live game ticks no longer force QA panel rerenders.
  - QA helpers and perf snapshots now use click-time `store.getState()` reads.
- Track B (UI + render-path cleanup):
  - `GameHeader.jsx` season tooltip countdown is now live-updating via a dedicated `SeasonCountdown` component using shared `useTick()`.
  - Fixed stale countdown behavior that previously only recomputed when season changed.
  - Reduced selector hot-path cost by replacing per-update plot counting selector with `plots` slice subscription + memoized count derivation on `plots` ref change.

## Validation
- Could not run `npm test` / `npm run build` in this environment because Node.js/npm binaries are unavailable (`node not found`, `npm not found`).

## TODO / Next
- Run `npm test` and `npm run build` on a Node-enabled machine.
- Optional next parallel pass:
  - UI track: mobile nav discoverability/accessibility polish in `NavBar.jsx` (labels, expanded state cues).
  - Performance track: reduce heavy derived work in header/sidebar selectors further where counts can be keyed by stable refs.

## 2026-02-12 - Settings tab selector/perf pass
- Migrated `SettingsTab.jsx` off broad `useGame()` reads:
  - Replaced with `useGameSelector` for targeted slices (`settings`, `paused`, `fps`), `useGameActions` for commands, and `useGameStore` for click-time export snapshots.
  - Wrapped settings handlers in `useCallback` so memoized settings subcomponents keep stable function props across unrelated rerenders.
- Simplified settings section props to avoid passing whole `state` object:
  - `GameplaySettings.jsx` now receives explicit booleans + toggle handlers.
  - `AudioSettings.jsx` now receives explicit booleans + volume handlers.
  - `GameStats.jsx` now self-subscribes with targeted selectors instead of receiving root `state`.
- Save key hardening:
  - Replaced repeated string literals with shared `SAVE_KEY` in reset/import/clear-cache paths.

## Validation
- Could not run `npm test` / `npm run build` in this environment because Node.js/npm binaries are unavailable (`node not found`, `npm not found`).

## TODO / Next
- Re-run `npm test` and `npm run build` once Node/npm are available to confirm no regressions.
- Optional follow-up perf pass: migrate other debug-heavy surfaces (`QAModePanel`, `DebugOverlay`) to selector/store snapshot patterns where helpful.

## 2026-02-11 - Perf iteration
- Migrated more always-mounted UI away from whole-state `useGame()` subscriptions:
  - `PerformanceOverlay.jsx` now subscribes with `useGameSelector` to targeted primitives/counts.
  - `DebugStressPanel.jsx` now uses `useGameActions` + `useGameStore` click-time snapshots and only subscribes to entitlement slices.
- Reduced crop-growth write frequency further:
  - `FarmingSystem.updateCropGrowth()` now avoids per-tick progress writes and only updates on stage boundaries or `planted -> growing`, plus `ready` transitions.
- Kept growth visuals smooth by deriving live progress from timestamps in `FarmGrid.jsx` and forcing a lightweight 1Hz tick redraw while the farming tab is active.

## TODO / Next
- Validate runtime behavior in browser (Playwright loop + screenshots + console check).
- If stable, consider applying selector/store migration to additional debug-only surfaces (`QAModePanel`, `DebugOverlay`) where useful.
- Validation run:
  - `npm test` passed (19 files / 57 tests)
  - `npm run build` passed
  - Browser smoke with Playwright fallback script (skill client currently exits early with `page.addInitScript: Target page/context closed`).
  - Runtime check artifacts:
    - `output/web-game/manual-shot.png` (initial UI)
    - `output/web-game/manual-flow.png` (after one plot click)
    - `output/web-game/manual-flow.json` confirms onboarding step transition Plant -> Harvest and no console/page errors.

## 2026-02-11 - Perf + UX polish follow-up
- Farm grid performance cleanup:
  - `FarmGrid.jsx` migrated from broad `useGame()` to targeted `useGameSelector` slices + `useGameActions`.
  - Removed global `liveNow` 1Hz parent tick that re-rendered the full grid.
  - Added per-plot local 1Hz ticker only for `planted/growing` plots so idle/ready/empty plots stay stable.
- Farming keyboard UX:
  - Added arrow-key navigation between plot buttons (`ArrowUp/Down/Left/Right`) while preserving Enter/Space activate behavior.
  - Added `data-plot-button="true"` marker and focus-routing via grid refs.
- Soil fertility update optimization:
  - `FarmingSystem.updateSoilFertility()` switched to copy-on-write updates; avoids map+diff over full array when no fertility change.
- Validation:
  - `npm run build` passed.
  - `npm test` passed (20 files / 61 tests).
  - Playwright smoke (manual fallback) confirmed:
    - No console/page errors
    - Onboarding advances to "Harvest it" after planting
    - Arrow-key plot focus path works (`focusMoved: true`)
    - Screenshot: `output/web-game/polish-smoke.png`

## TODO / Next
- Continue selector migration in other heavy always-mounted UI (`SettingsTab` still reads broad `useGame()` state).
- Investigate why skill client script occasionally hangs in this environment (manual Playwright fallback is stable).

## 2026-02-11 - Upgrade + visual polish pass
- Skills used this turn:
  - `develop-web-game` for implement+validate loop.
  - `playwright` for browser automation and screenshot checks.
- Track A (interaction/gameplay polish):
  - Added a new context-aware `Field Advisor` card in `FarmingTab` that recommends the highest-priority action (treat, harvest, water, plant, or fertilize) and provides a one-click CTA.
  - Quick Actions now show live counts and disabled states for unavailable actions:
    - Water button shows thirsty-plot count
    - Harvest button shows ready-plot count
    - Treat button shows diseased-plot count
  - Added keyboard hint strip directly under quick actions for W/H/F/T.
- Track B (visual/world polish):
  - Added a seasonal+weather atmosphere strip under farm title in `FarmGrid`:
    - season mood label
    - weather condition note
    - growth pace state
    - contextual seasonal hint
  - Keeps the farm view feeling more alive without changing gameplay logic.
- Validation:
  - `npm test` passed (20 files / 61 tests)
  - `npm run build` passed
  - Playwright screenshots captured for upgraded UI:
    - `output/web-game/polish-upgrades.png`
    - `output/web-game/polish-upgrades-action.png`
    - `output/web-game/polish-upgrades-verified.png`
    - `output/web-game/probe.png`
  - No console/page errors observed during smoke runs.
- Note:
  - On fresh runs, the onboarding tooltip can visually cover the new advisor card area until skipped.

## 2026-02-12 - Phase 0 discovery (monorepo + iOS prep)
- Current web entrypoint:
  - `src/main.jsx` mounts `FarmSim` from `src/components/farm-sim/core/FarmSim.jsx` inside `GameErrorBoundary`.
- Current state storage:
  - Main runtime save is persisted to `localStorage` via `src/components/farm-sim/context/GamePersistence.js` with `SAVE_KEY = farm_sim_enhanced_v2` and `SAVE_VERSION = 16`.
  - Legacy save paths still exist (`farmSim_save_v3`, `farmLifeSave`) for migration/cleanup compatibility.
- Grid logic location:
  - Plot state shape is initialized in `initializePlots()` inside `src/components/farm-sim/context/GamePersistence.js`.
  - Core grid state mutations live in `src/components/farm-sim/context/GameReducer.js` (`UPDATE_PLOT`, `UPDATE_PLOTS`, `SET_GRID_SIZE`).
  - Plant/grow/harvest runtime behavior is driven by `src/components/farm-sim/systems/FarmingSystem.js` and wired from `GameContext`.
- JSON files used at runtime:
  - Runtime canonical loader is `src/content/ContentManager.js`.
  - It currently imports base JSON from `/content`: `crops.json`, `decor.json`, `festivals.json`, `almanac.json`, `minigames.json`, `strings.json`.
  - It also eager-loads pack JSONs via `import.meta.glob('../../content/packs/**/...')`.

## 2026-02-12 - Monorepo + native iOS MVP delivered
- Completed:
  - Restructured repo into `/web`, `/shared`, `/ios`.
  - Web remains runnable from repo root via forwarding scripts.
  - Canonical content moved to `shared/content` and wired into web via `@content` alias.
  - Added shared schema + save/content contracts and deterministic sim vectors.
  - Added native iOS app scaffold (`SwiftUI` + `SpriteView`) and `ios/GameCore` Swift package.
  - Added playable iOS loop: tap tile to plant, advance day, harvest ready crop, save/load.
- Validation:
  - `npm run test` passed.
  - `npm run build` passed.
  - `swift test --package-path ios/GameCore` passed.
  - `xcodegen generate --spec ios/project.yml` passed.
  - `xcodebuild -project ios/FarmSim.xcodeproj -scheme FarmSim -destination 'platform=iOS Simulator,name=iPhone 17' build` passed.
  - Note: requested `iPhone 15` simulator destination is unavailable on this machine.
- Next steps:
  - Replace placeholder SpriteKit tile visuals with authored sprites + crop stage art.
  - Polish HUD/action bar layout and interaction states (selected seed, ready indicators, disabled affordances).
  - Add native iOS audio layer (plant/harvest/day-advance feedback + ambient loop).
  - Add local notifications for crop-ready reminders when app is backgrounded.
