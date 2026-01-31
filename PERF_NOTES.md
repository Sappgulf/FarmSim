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

## 2026-02-02 Profiling + Loop Consolidation Pass

### Baseline Metrics (debug=1, Playwright headless, 3s sample after Fill all plots + Spawn 50 notifications)
- FPS: 1 (rolling avg FPS: 3)
- Frame time avg: 388.5ms (worst 1016.6ms / last 5s)
- Update time: 0.10ms
- Render time: 11.3ms
- Tick time: 0.10ms

### Top 3 Bottlenecks (avg/max over 5s, same run)
1. `systems:update` — avg 0.84ms, max 4.10ms
2. `system:farming` — avg 0.49ms, max 2.90ms
3. `system:livestock` — avg 0.14ms, max 3.50ms

### Improvements Applied
- Consolidated to a single authoritative game loop with fixed timestep and accumulator.
- Added debug-gated profiler helpers + perf overlay enhancements (rolling FPS, worst frame, timers).
- Reduced allocations in farming growth/withering/soil updates by avoiding full-array rebuilds when unchanged.

### After Metrics
- Unable to capture headless Playwright post-change metrics due to a Chromium crash (SIGSEGV). Re-run with `?debug=1`, press backtick to show the overlay, and use the Stress Panel (Fill all plots + Spawn 50 notifications) to capture updated FPS/frame/tick/update/render values.

## 2026-02-09 Tab Navigation + Cache Pass

### Baseline Metrics (debug=1)
- Average FPS: Not measured in this environment.
- Worst frame: Not measured in this environment.
- Tick time: Not measured in this environment.
- Render time: Not measured in this environment.

### Improvements Applied
- Added tab preloading on hover/focus to reduce tab-switch latency.
- Added a small keep-alive cache for the most recent tabs to avoid heavy remount work on rapid switching.
- Cached screen shake container lookup to avoid repeated DOM queries during visual feedback.

### After Metrics (debug=1)
- Average FPS: Not measured in this environment.
- Worst frame: Not measured in this environment.
- Tick time: Not measured in this environment.
- Render time: Not measured in this environment.

### Biggest Bottleneck Removed
- Removed repeated DOM lookup on screen shake triggers; reduced tab switch jank by keeping recently visited tab panels mounted.

## 2026-02-10 Cozy Systems + Loop Trim Pass

### Baseline Metrics (debug=1)
- Average FPS: Not measured in this environment.
- Worst frame: Not measured in this environment.
- Tick time: Not measured in this environment.
- Render time: Not measured in this environment.

### Improvements Applied
- Reduced per-tick allocations in WeatherSystem by only copying plots when changes occur.
- Added early exits in season day tracking to avoid unnecessary updates when no day rolls over.
- Batched collection updates on harvest actions rather than per-render updates.

### After Metrics (debug=1)
- Average FPS: Not measured in this environment.
- Worst frame: Not measured in this environment.
- Tick time: Not measured in this environment.
- Render time: Not measured in this environment.
