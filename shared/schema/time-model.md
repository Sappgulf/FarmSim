# Web Time Model (FarmSim)

Generated from current web runtime (`web/src/main.jsx` -> `web/src/components/farm-sim/core/FarmSim.jsx`) on 2026-02-13.

## Summary

- Time progression is **loop-based**.
- Core sim systems run in a throttled `requestAnimationFrame` loop at ~**10Hz**.
- Crop growth is **real-time timestamp based** (seconds elapsed since `plantedAt`), not day-boundary based.
- "Day rollover" in web is tied to **real-world day key** changes (`YYYY-MM-DD`), checked from the autosave/master loop.

## Tick + Day Rules

- System loop:
  - `web/src/components/farm-sim/core/FarmSim.jsx:188`
  - Target update rate: `10 FPS` (`targetFPS = 10`, `targetFrameTime = 100ms`) (`FarmSim.jsx:193-195`).
  - Update order each tick: season -> weather -> farming -> livestock -> fishing -> economy -> achievements -> disease -> disaster (`FarmSim.jsx:211-221`).
- Pause rules:
  - Sim pauses when tab/document is hidden (`document.hidden`) via `gameLoop.paused` updates (`web/src/components/farm-sim/context/GameContext.jsx:204-224`).
  - No dedicated menu/sheet pause rule in web runtime; tabs/side panels do not stop loop.
- Day rollover trigger:
  - Master loop checks every ~30s (`GameContext.jsx:305-316`).
  - If `getDayKey()` differs from `almanac.lastDayKey`, emits `day_rollover` events (`GameContext.jsx:307-313`).
  - `recordAlmanacEvent('day_rollover')` increments `counters.dayCount` and updates `lastDayKey` (`GameContext.jsx:1156-1179`).

## Crop Growth Rules

- Farming update is tick-driven, but growth is derived from wall-clock timestamps:
  - `timeSincePlanted = (Date.now() - plantedAt) / 1000` (`web/src/components/farm-sim/systems/FarmingSystem.js:137-139`).
  - Progress and stage are computed from elapsed seconds and modifiers (`FarmingSystem.js:144-160`).
- Growth scan is throttled to ~250ms (`FarmingSystem.js:87-93`).
- Ready threshold at ~90% effective growth time (`FarmingSystem.js:163-178`).
- Overripe/wither checks run ~1Hz with a 45s harvest window (`FarmingSystem.js:224-231`, `252-260`).

## Autosave Rules

- Autosave is debounced and deduplicated by a signature excluding ephemeral notification payloads (`GameContext.jsx:226-280`).
- Master loop attempts autosave checks every ~30s when auto-save is enabled (`GameContext.jsx:305-316`).
- On each check:
  - day rollover events may be emitted first,
  - then debounced autosave executes (`GameContext.jsx:314`).

## Offline Catch-up

- No explicit "offline simulation replay" loop.
- Effective catch-up behavior exists for timestamp-driven systems because progress is recomputed from saved timestamps at runtime.
- Real-world day counters catch up only when day-key checks run after resume/active loop.

## Parity Decision For iOS

To remove manual day advancement while preserving existing iOS day-based crop definitions, iOS uses an automatic, deterministic `TimeEngine` and maps elapsed runtime into day rollovers. This keeps continuous play flow while preserving current GameCore crop/day mechanics.
