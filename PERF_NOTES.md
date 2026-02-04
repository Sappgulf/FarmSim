# Performance Notes — AAA Polish Pass

**Date:** 2026-02-03

## Baseline
- Runtime metrics not captured in this environment (no browser session).
- Known loops:
  - Systems update loop in `FarmSim` (rAF throttled to 10 FPS).
  - FPS/auto-save loop in `GameContext` (rAF).

## Changes Applied
- Reduced allocations in crop growth scanning by removing per-tick filter calls in `FarmingSystem.updateCropGrowth`.
- Expanded debug-only performance overlay to surface action trace depth + debug report copy for faster profiling/triage.
- Added debug-only stress panel controls to exercise hot paths without manual setup.
- Added ContentManager to load/validate content once at boot; no per-tick content scanning.
- Festival mini-game v2 runs rAF only while the modal is open; no global timers or per-tick work outside the mini-game.

## After
- Runtime metrics not captured in this environment.

## Follow-Up Measurements (Recommended)
- FPS avg + worst frame (5s) with full plots + notifications spam.
- Update/render time comparison with/without overlays.
- Listener/timer counts after rapid tab switching.
- Memory usage before/after running the stress suite twice.

---

## 2026-02-03 — Pets/Notifications Polish

### Baseline
- `npm run build` (passes with npm http-proxy warning + browserslist data warning).

### Changes Applied
- Added `formatDisplayLabel` helper for snake_case → title-case labels and reused across tabs.
- Notification timers now pause on hover/press and clean up timers on close/unmount (no per-tick updates).
- Pets tab layout uses event-driven updates (render-on-open/data change only).

### After
- Runtime metrics not captured in this environment (Playwright browser crashed).

## 2026-02-03 — UI Polish + Perfect Harvest Mini-Game

### Baseline
- Automated tests only (`npm run test -- --run`); no browser profiling.

### Changes Applied
- Added Perfect Harvest timing mini-game (event/board gated, rAF-driven when open only).
- Standardized tab icon rendering to lucide icons; added icon validation warnings in debug content preflight.

### After
- No regressions observed in automated tests.
- Runtime metrics not captured in this environment.
