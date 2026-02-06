# TIME_VISUALS

Sprint I2 adds visual-only ambience layers with no gameplay effects.

## Time of Day Accents
- **Morning (06:00–10:59):** warm tint overlay + slight saturation boost.
- **Dusk (17:00–19:59):** orange/purple tint overlay.
- **Night (20:00–04:59):** cool blue tint and softer saturation/brightness.
- **Day (fallback):** neutral visuals.

Implementation:
- `FarmSim` applies a root filter and translucent overlay based on period.
- Period is recomputed once per minute (no new rAF loops).
- Reduced motion users keep stable transitions via existing CSS transitions only.

## Weather Micro Accents
- Existing `WeatherEffects` overlay is reused with lower intensity (`0.45`) for ambient layering.
- If no saved visual weather exists, a visual-only weather flag rotates slowly by day count.
- One weather accent is active at a time.

## Weekly Rhythm
- Added weekly cosmetic day: **Market Glow Day**.
- Announced via Town Board copy only (Events tab).
- No mechanics, timers, or economy modifiers are applied.

