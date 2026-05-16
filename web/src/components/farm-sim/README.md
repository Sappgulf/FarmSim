# FarmSim Web Architecture

The web app is a React 18 + Vite FarmLife client. `core/FarmSim.jsx` is still the active shell, but it now delegates low-risk lifecycle work into focused hooks so the file remains an orchestrator instead of a second state system.

## Current Shape

```text
src/components/farm-sim/
├── context/                 # game state, reducer, persistence, selector store
├── core/                    # shell orchestration and lifecycle hooks
├── systems/                 # scheduled gameplay systems
├── ui/                      # header, farm grid, nav, panels, notifications
└── ui/tabs/                 # section-specific tools and town/workshop flows
```

Important entry points:

- `core/FarmSim.jsx`: providers, system creation, central scheduler, shell layout.
- `core/useFarmNavigation.js`: active tab/section persistence and board-open onboarding event.
- `core/useFarmAudioLifecycle.js`: sound/music globals, enabled state, first user-interaction resume.
- `core/useSeasonTransitionEffect.js`: reduced-motion-safe season transition DOM effect.
- `core/useTimeOfDayVisualState.js`: time-of-day tint and nightfall event.
- `core/useVisualWeatherRotation.js`: deterministic fallback visual weather events.
- `ui/FarmRhythmPanel.jsx`: player-facing Today / next-best-move summary.

## State And Saves

- `context/GamePersistence.js` owns web save versioning and migration.
- `context/GameReducer.js` owns initial state and reducer-level caps such as active notification limits.
- Shared save-contract truth lives in `shared/schema/save-contract.md`.
- Do not change save shape without migration, initial-state, schema, example, and test updates.

## Performance Rules

- Keep gameplay updates on the central scheduler in `FarmSim.jsx`.
- Use `useGameSelector` for view data instead of passing broad state objects.
- Avoid per-plot timers and persistent JS animation loops when CSS or the scheduler is enough.
- Keep transient UI arrays capped; long history belongs in history-specific fields.

## UX Rules

- The farm playfield is the primary workspace.
- Board, quest, challenge, weather, achievement, and settings flows belong under `Town`.
- New player guidance should answer what happened, what can be done now, why it matters, and what unlock it builds toward.
- Visible buttons must either work or be clearly disabled with a reason.
