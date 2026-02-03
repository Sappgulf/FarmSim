# Quality Gates — FarmSim Quality Lock

**Date:** 2026-02-03  
**Scope:** FarmSim runtime + UI (HTML/JS)

## Acceptance Criteria (Flawless = All Pass)
1. **Zero console errors** in normal play (new game, load game, tab navigation).
2. **Zero crashes under stress** (run stress suite twice; no unhandled errors).
3. **No progressive slowdown** after repeated stress cycles.
4. **Instant-feeling tab switching** (no stacked listeners/timers).
5. **Animation quality**: transforms/opacity where possible, no layout thrash.
6. **Save/load integrity**: saves never corrupt state; older saves migrate cleanly.
7. **Debug/profiling tools OFF by default** (only via `?debug=1`).

## How to Test (Required)
### 1) Baseline Smoke
1. `npm run smoke-test -- --run`
2. Load the app (`npm run dev`) and confirm no console errors on initial load.

### 2) Debug Mode Validation
1. Launch with `?debug=1`.
2. Confirm Performance Overlay shows:
   - rolling FPS avg + worst frame (last 5s)
   - update vs render time
   - counts: plots, notifications, buildings, decorations (if any), timers, listeners.
3. Trigger a test error (optional) and confirm crash overlay shows stack + action trace + Copy Debug Report.

### 3) Stress Suite (Run Twice)
Use the Debug Stress Panel (`?debug=1`):
1. **Fill Plots** → **Ready Plots** → **Harvest All**.
2. **+50 Notifs** then **Clear Notifs** rapidly.
3. **Stress Tabs** (30+ switches).
4. **Place Builds** → **Clear Builds**.
5. **Advance 30 Days**.
6. Repeat steps 1–5 a second time.
7. Confirm:
   - No crashes
   - No console errors
   - Timers/listeners stable (no upward creep)

### 4) Save/Load Integrity
1. Save game after stress suite.
2. Reload the page and load save.
3. Confirm:
   - State loads with no console errors
   - Grid size + plots intact
   - Settings retained
   - No NaN/negative values

### 5) Mobile Fit (375px width)
1. Resize to 375px width.
2. Confirm:
   - No horizontal scroll
   - Tap targets ≥ 44px
   - NavBar + panels usable
   - Debug overlays don’t block essential controls (in debug only)
