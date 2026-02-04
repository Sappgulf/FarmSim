# QA Harness — FarmSim (Sprint D1)

**Date:** 2026-02-04  
**Purpose:** Deterministic, repeatable QA suite for stress, content validation, and perf snapshots.

## Enable QA Mode
1. `npm run dev`
2. Open the app with debug enabled: `http://localhost:5173/?debug=1`
3. The **QA Mode** panel appears in the bottom-right.

## Run the QA Suite
- Click **Run QA Suite** in the QA Mode panel.
- The suite runs sequentially and prints results in the panel.
- Use **Copy Report** to capture a Markdown-friendly report.

## Tests Included
1. **Tabs Smoke Test**
   - Opens all tabs and checks rendering (no tab error UI).
2. **Plot Stress**
   - Fills all plots ready → harvests all (3 cycles).
3. **Notifications Stress**
   - Spawns 50 notifications → clears them → checks timer stability.
4. **Mini-game Smoke**
   - Starts and cancels the fishing mini-game (if present).
5. **Save/Load Integrity**
   - Saves to QA-only slot → loads → validates schema → reloads state.
6. **Content Validation**
   - Runs ContentManager validation (errors fail, warnings reported).
7. **30-Day Simulation**
   - Advances 30 Almanac day rollovers and verifies counters.
8. **Farm Card Export Smoke**
   - Renders a Farm Card PNG and validates blob output.
9. **Farm Card Export Repeat**
   - Renders Farm Card 5× to smoke-check repeat export stability.
10. **Farm Card Theme Swap**
   - Switches themes and verifies exported card colors change.
11. **Farm Card Identity Persist**
   - Saves + reloads farm name/theme/spotlight selections.

## How QA Mode Works
- **Deterministic:** QA runs with the game loop paused and auto-save disabled.
- **Safe:** Uses QA-only localStorage keys (`farm_sim_enhanced_v2__qa__`).
- **Repeatable:** Each test starts from a reset baseline state.

## Adding a New Test
1. Edit `src/components/farm-sim/qa/qaTests.js`.
2. Add an entry:
```js
{
  id: 'my_test',
  name: 'My Test',
  timeoutMs: 5000,
  run: async (ctx) => {
    ctx.log('Step 1');
    // use ctx.actions / ctx.helpers / ctx.switchToTab / ctx.sleep
    return { detail: 'Optional summary' };
  }
}
```
3. The QA panel auto-renders a button for the new test.

## Debug Helpers
Shared helpers live in:
- `src/components/farm-sim/debug/debugActions.js`

These are reused by:
- `DebugStressPanel`
- `QAModePanel` (QA suite)

## Report Format
Use **Copy Report** in the QA panel. The output includes:
- Suite status + metrics
- Per-test status, durations, console errors/warnings, and perf snapshots

## Clearing QA Data
Use the **Clear QA Data** button in QA Mode to remove QA-only saves.
