# Performance Notes

## Baseline Observations
- Frame/update work continued while the tab was hidden, which kept requestAnimationFrame loops active even when the game wasn't visible.
- Per-plot particle effects queried the DOM each time, which added avoidable layout lookups during rapid harvesting or cures.
- Debug overlays and performance metrics were always mounted in development, even when not explicitly enabled, and event listener counts were not observable.

## Improvements Applied
- Added a debug-gated instrumentation layer (`?debug=1` or `window.__DEV__ = true`) to expose FPS, update time, render time, tick time, active tiles, entities, particles, and listener counts without impacting normal gameplay.
- Reduced background work by pausing tick updates and system/FPS loops when the page is hidden, with a safe auto-save on hide.
- Cached plot DOM references and exposed plot-center lookups to avoid repeated `querySelector` calls during particle effects.
- Tracked event listeners created by the game UI to surface listener counts in the performance overlay.

## How to Verify
1. Start the dev server with `npm run dev` and open the game.
2. Append `?debug=1` to the URL (or set `window.__DEV__ = true` in the console).
3. Press the backtick key (`) to toggle the performance overlay.
4. Confirm:
   - FPS updates once per second.
   - Update/render/tick times change during activity.
   - Active tiles and entity counts match the farm state.
   - Listener count is non-zero.
5. Switch the tab away for a few seconds, then return:
   - The update loop remains stable (no giant jumps).
   - The tick counter resumes smoothly.

## 2026-02-01 Stress Stabilization Pass
- Added debug-only action tracing and error capture to isolate hot paths without impacting production performance.
- Added a capped notification backlog to prevent timer storms under rapid toast bursts.
- Hardened notification close handling to avoid redundant timers/state churn during rapid dismissals.
- Added debug-only invariant checks to surface DOM/state mismatches for plots and notifications before they degrade performance.
