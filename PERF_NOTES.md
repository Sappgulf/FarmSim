# Performance Notes — AAA Polish Pass

**Date:** 2026-02-03

## Baseline
- Runtime metrics not captured in this environment (no browser session).
- Known loops:
  - Systems update loop in `FarmSim` (rAF throttled to 10 FPS).
  - FPS/auto-save loop in `GameContext` (rAF).

## Changes Applied
- Added Page Visibility pause to stop nonessential loop work when the tab is hidden.
- Added debug-only performance overlay with rolling 5s frame metrics and hot counts (timers/listeners).
- Added save backup slot for last-good state to reduce recovery risk.

## After
- Runtime metrics not captured in this environment.

## Follow-Up Measurements (Recommended)
- FPS avg + worst frame (5s) with full plots + notifications spam.
- Update/render time comparison with/without overlays.
- Listener/timer counts after rapid tab switching.
