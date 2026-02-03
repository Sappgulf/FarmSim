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

## After
- Runtime metrics not captured in this environment.

## Follow-Up Measurements (Recommended)
- FPS avg + worst frame (5s) with full plots + notifications spam.
- Update/render time comparison with/without overlays.
- Listener/timer counts after rapid tab switching.
- Memory usage before/after running the stress suite twice.
