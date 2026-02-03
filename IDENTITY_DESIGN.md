# Identity Design (FarmSim)

**Date:** 2026-02-03

## Current State (Audit)
- **No existing Farm Mood system** found in `src/` or docs.
- **No existing Farm Memory/Scrapbook system** found in `src/` or docs.
- **No existing Farm Philosophy selection** found in `src/` or docs.
- Related systems present:
  - Weather + seasons in `src/hooks/useWeather.js`.
  - Day/night cycle in `src/hooks/useDayNight.js`.
  - Achievements + notifications in `src/hooks/useAchievements.js` and `src/components/game/NotificationStack.jsx`.
  - Core gameplay hooks in `src/hooks/useFarm.js` and `src/hooks/useGameState.js`.
  - Save/load in `src/utils/save.mjs` and `src/components/FarmGame.jsx`.

## Identity Loop v1 (Implemented)
Goal: Make identity feel present in first 10 minutes, keep cozy direction without quests, stay event-driven and light.

### 1) Town Board “Story Dashboard”
- Compact panel that surfaces:
  - Today’s vibe (mood tier + 1-line flavor).
  - One cozy suggestion (philosophy-aligned).
  - Memory teaser (next page hint / chapter progress).
  - Small pulse / badge when new story activity occurs.
- **Location:** new Town Board UI card in main layout.

### 2) Farm Mood (Positive-Only)
- Mood points accumulate via positive events (plant, harvest, build, wish, etc.).
- Tiers: Calm → Cozy → Blooming → Radiant.
- Visuals: subtle overlay + accent color, updated on tier change only.

### 3) Farm Memory + Scrapbook
- Data-driven memory definitions with chapter mapping.
- Micro-memories trigger early (first 10 minutes), idempotent.
- Scrapbook UI: chapters list with progress; filter by chapter.

### 4) Farm Philosophy
- Player selects 1 philosophy: Nature First / Market Maven / Slow Living.
- Influences Story Dashboard suggestion text.

### 5) Wishing Well (Signature Mechanic)
- Once per in-game day, pay coins to “make a wish”.
- Grants a random cozy blessing until next day rollover.
- Blessings are positive-only and small in magnitude.

### 6) Save/Load
- Persist mood points/tier, philosophy, memories, active blessing, cooldown/day index.
- Derived data (chapter progress) computed from memory flags.

## File Targets (Implemented)
- `src/data/identity.js` (mood tiers, philosophies, memories, chapters, blessings)
- `src/components/game/StoryDashboard.jsx`
- `src/components/panels/ScrapbookPanel.jsx`
- `src/components/FarmGame.jsx` (identity state + event hooks)
- `src/index.css` (mood overlay + accent variables)
- `src/utils/save.mjs` (version acceptance for new fields)
