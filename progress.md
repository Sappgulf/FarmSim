Original prompt: ok lets continue the next perf options

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
