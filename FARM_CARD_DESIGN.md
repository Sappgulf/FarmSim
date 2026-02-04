# Farm Card Design (Sprint F2)

## Purpose
Create a single, deterministic Farm Card export layout that is theme-aware, mobile-safe, and fast to render (<100ms target). The card is a square 1080×1080 PNG designed for sharing.

## Layout Summary (Single Layout)
```
┌──────────────────────────────────────────┐
│ Farm Name (2 lines max)      Farm Card   │
│ Season • Day                                │
│ Mood Tier • Philosophy                      │
│ Companion                                   │
│ ┌──────────── Spotlight Box ────────────┐ │
│ │ Title + 2–4 lines of highlight text   │ │
│ └──────────────────────────────────────┘ │
│ FarmSim • Share your cozy farm             │
└──────────────────────────────────────────┘
```

### Spacing
- Outer padding: 70px
- Card radius: 48px
- Spotlight box radius: 36px

### Typography
- Farm Name: 58px, bold, 2 lines max
- Metadata rows: 26–32px
- Spotlight text: 26px, 4 lines max
- Footer: 22px

## Fields (Data Model)
- **Farm Name**: `state.farmName` (default “Willowbrook Farm”).
- **Season + Day**: `state.season.current` + `state.almanac.counters.dayCount` (min 1).
- **Mood Tier**: derived from existing progress (memories + almanac + cozy goals) using existing `MOOD_TIERS`.
- **Philosophy**: `state.philosophy` (label from `PHILOSOPHIES`, “Unchosen” if missing).
- **Pet Companion**: first pet in `state.pets` or “No companion yet”.
- **Highlight**: Spotlight selection (latest memory, favorite memory, or favorite almanac page). Falls back to featured crop if no identity data.
- **Branding**: “FarmSim • Share your cozy farm”.

## Spotlight Rules
- **Latest Memory (auto)**: uses last unlocked memory if available.
- **Favorite Memory**: selectable in the Scrapbook panel.
- **Favorite Almanac Page**: selectable in Almanac tab.
- **Fallback**: featured crop description when no spotlight is available.

## Theme Behavior
- Farm Card colors use Farm Theme palette:
  - Accent, accent soft, background gradient, card surface, border, ink.
- Theme is stored in save data and applied via CSS variables and canvas palette.

## Rendering Constraints
- Canvas-only render at 1080×1080.
- Text wrapping and truncation are deterministic.
- Export uses `canvas.toBlob` (PNG) and cleans up object URLs.
- No blocking UI (requestAnimationFrame + async blob creation).

