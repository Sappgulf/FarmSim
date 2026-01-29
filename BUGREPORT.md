# Crash Bug Report — Plot + Notification Stress

## Summary
Stress testing the farm grid and notification system could crash the game under rapid plot updates and toast dismissals. The failures centered around notification close races and plot index safety under extreme bulk updates, which surfaced when the last plot was touched, when all plots were full, and when notifications were closed rapidly.

## Reproduction (Deterministic)
Use the new debug stress panel to reproduce the original crash patterns.

1. Start the dev server and open the game with debug enabled: `http://localhost:5173/?debug=1`.
2. Open the **Stress Panel** (bottom-left).
3. Repro steps:
   - **Last plot crash**: Click **Fill last plot only**, then rapidly interact with that plot (plant/harvest/clear) while running the stress test.
   - **All plots full**: Click **Fill all plots**, then trigger **Harvest all plots** repeatedly.
   - **Notification close crash**: Click **Spawn 50 notifications**, then **Close notifications rapidly**.
   - **Combination**: Run **60s stress test**; it repeatedly fills/harvests plots and spams/clears notifications.

The debug overlay will capture the error stack trace, last actions, and recent logs when a crash occurs.

## Root Cause Analysis
1. **Notification close race**
   - The close handler was not idempotent. Rapid close events + auto-dismiss timers could attempt to close the same notification multiple times, which triggered overlapping state updates and stale timer callbacks.
2. **Plot index safety**
   - Plot actions assumed valid indices at all times. Stress tooling and edge-case UI interactions (especially on the last plot) could dispatch plot updates with invalid indices or missing plot objects, producing undefined access in downstream updates.

## Fixes Applied
- **Notification hardening**
  - Close handlers are now idempotent via a `closingIds` guard.
  - Cleanup of close state is performed whenever notifications are removed.
  - Notification DOM nodes are tagged for invariants checks and debugging.
- **Plot hardening**
  - Plot update, plant, and harvest actions now validate indices before mutating state.
  - Missing plot objects short-circuit safely in debug mode with trace entries.
- **Debug safety net**
  - Global error overlay captures stack traces, recent logs, and action history.
  - Debug action tracing and invariant checks surface mismatched DOM/state counts and invalid numeric state.
  - Debug-only stress panel provides deterministic reproduction buttons.

## Verification Checklist
- Use the Stress Panel to run:
  - Fill all plots
  - Fill last plot only
  - Harvest all plots
  - Spawn 50 notifications → Close notifications rapidly
  - Run the 60s stress test twice
- Ensure:
  - No crashes
  - Debug overlay remains empty (no captured errors)
  - Notifications and plots continue to update normally
