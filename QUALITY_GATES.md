# Quality Gates — FarmSim Quality Lock

**Date:** 2026-02-04  
**Scope:** FarmSim runtime + UI (HTML/JS) + QA Harness
**Reference:** `QA_HARNESS.md`

## Acceptance Criteria (Flawless = All Pass)
1. **Zero console errors** in normal play (new game, load game, tab navigation).
2. **QA Suite passes twice** in a row with identical results.
3. **Zero unhandled errors** during QA suite (errors > 0 = fail).
4. **Content validation errors = 0** (warnings allowed, listed).
5. **No progressive slowdown** after repeated stress cycles (review perf snapshot).
6. **Instant-feeling tab switching** (no stacked listeners/timers).
7. **Save/load integrity**: saves never corrupt state; older saves migrate cleanly.
8. **Debug/profiling tools OFF by default** (only via `?debug=1`).

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
3. Confirm **QA Mode** panel appears (bottom-right).
4. Trigger a test error (optional) and confirm crash overlay shows stack + action trace + Copy Debug Report.

### 3) QA Suite (Run Twice)
Use the QA Mode panel (`?debug=1`):
1. Click **Run QA Suite**.
2. Copy the report and verify all tests pass.
3. Run the suite a second time and confirm identical pass/fail results.
4. Confirm:
   - No console errors
   - No unhandled errors
   - Content validation errors = 0
   - Timers/listeners stable (no upward creep)

### 4) Save/Load Integrity
1. Run **Save/Load Integrity** in QA Mode.
2. Confirm:
   - QA save slot loads with no console errors
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
