# FarmSim Performance Benchmarks

Date: 2026-02-12

## Method

Commands used:

```bash
npm --prefix web run test -- --run src/test/perfBudget.test.js
swift test --package-path ios/GameCore --filter testSimTickPerformance20x20
```

## Before vs After

### Web (20x20 sim tick budget)
- Baseline target: `< 4ms avg tick`
- After: `0.513ms avg tick` (`src/test/perfBudget.test.js` output)
- Result: passes budget with margin.

### iOS GameCore (20x20 sim tick budget)
- Baseline target: `< 4ms avg tick`
- After: `0.072ms avg tick` (`GameCoreTests.testSimTickPerformance20x20` output)
- Result: passes budget with margin.

### Structural Perf Changes (Measured by topology/count)
- Web plot growth UI timer topology:
  - Before: up to `N` `setInterval` timers (`N = growing plots`, worst-case 400 on 20x20)
  - After: `1` shared tick timer via `TickContext`
  - Delta at 20x20 full-growth scenario: `400 -> 1` timers (`-99.75%`).
- iOS save write pressure:
  - Before: one disk save per mutation in `GameStore.syncState`
  - After: save writes coalesced with `350ms` debounce (`pendingSaveTask`)
  - Effect: burst interactions are merged into a single write window.

## Instrumentation Added
- Web: dev HUD with localStorage toggles
  - `farm.perf.hud=1` to show
  - `farm.perf.log=1` to log periodic metrics
- iOS: Debug overlay + signposts
  - Overlay shows FPS, node count, and tick ms
  - Signposted intervals: `content_load`, `save_load`, `save_write`, `sim_tick`

## Notes
- Web tick benchmark measures simulation update cost, not full browser paint/layout time.
- iOS benchmark measures GameCore simulation cost in tests; scene frame stability is monitored via debug overlay in app runtime.
