# Signature Feature v1 — The Farm Almanac

## Goals & Tone
- **Cozy, personal, discoverable**: the Almanac feels like a journal filled by the farm itself.
- **Knowledge over milestones**: the Almanac records what the farm has learned (not a checklist).
- **Lightweight + stable**: event-driven updates only, no per-tick scans.

## Feature Inventory (Audit-First)
**Core systems reused**
- **Seasons**: `src/components/farm-sim/systems/SeasonSystem.js`
- **Weather**: `src/components/farm-sim/systems/WeatherSystem.js`
- **Crop harvest events**: `src/components/farm-sim/ui/FarmGrid.jsx`
- **Festivals**: `src/components/farm-sim/ui/tabs/EventsTab.jsx`
- **Scrapbook/Memories**: `src/components/panels/ScrapbookPanel.jsx`, `src/components/farm-sim/context/GameContext.jsx`, `src/data/identity.js`
- **Settings**: `src/components/farm-sim/ui/tabs/settings/GameplaySettings.jsx`
- **Save/Load**: `src/components/farm-sim/context/GamePersistence.js`

**Overlapping systems identified**
- **Scrapbook/Memories** (moments) — used for cross-links and shared counters.
- **Town Board hints** — integrated via Events tab header card.
- **Stats/collections** — no duplicate trackers added; Almanac uses existing events.

## How Almanac Differs from Scrapbook
- **Scrapbook = moments** (specific memories and chapters).
- **Almanac = knowledge** (observations/records/seasonal meaning).
- **No parallel tracking**: Almanac leverages existing events (harvest, season, weather, festivals).

## Section Breakdown (Config-Driven)
Data source: `src/data/almanac.js`

1) **Seasons**
   - Seasonal meaning and cycle completion.
2) **Weather**
   - Weather observations + sky literacy.
3) **Crops**
   - Harvest patterns across seasons.
4) **Festivals**
   - Town gatherings and repeat attendance.
5) **Farm Notes**
   - Philosophy-flavored guidance.

## Page Unlock Rules (Event-Driven Only)
Events are dispatched from existing systems (no per-tick Almanac logic):
- **onSeasonStart / onSeasonEnd** → Season pages and cycle completion.
- **onWeatherObserved** → Weather pages + “Reading the Sky.”
- **onCropHarvested** → Rainy harvest, winter harvest, multi-season crop.
- **onFestivalStart / attended** → Festival pages.
- **onDayRollover** → Farm Notes pages.
- **onPhilosophySelected** → Philosophy Compass page.

Unlocks are **idempotent** and **O(1)** (counters/flags only).

## Data Schema (Save-Safe)
Stored in `state.almanac` (GameReducer + GamePersistence):
```json
{
  "almanac": {
    "unlocked": { "pageId": true },
    "dates": { "pageId": 1730000000000 },
    "counters": {
      "weatherSeen": { "sunny": true },
      "cropSeasonMask": { "carrot": 5 },
      "seasonsSeen": { "spring": true },
      "dayCount": 3
    },
    "lastDayKey": "2026-02-03"
  },
  "philosophy": "nature"
}
```

### Page Entry Schema (Config)
Each page entry in `src/data/almanac.js` includes:
```json
{
  "id": "string",
  "section": "seasons | weather | crops | festivals | farm_notes",
  "title": "string",
  "icon": "optional emoji",
  "hint": "locked hint",
  "unlock": { "type": "event_key", "details": "event data" },
  "text": {
    "default": "cozy copy",
    "nature": "Nature First variant",
    "market": "Market Maven variant",
    "slow": "Slow Living variant"
  }
}
```

## Philosophy Flavor
Same unlocks; different copy:
- **Nature First** → observational, weather-focused.
- **Market Maven** → pragmatic, trend-aware.
- **Slow Living** → reflective, emotional.

Copy variants are stored in `src/data/almanac.js` under each page’s `text`.

## UI Guidelines
- **Mobile-first**: single-column, collapsible sections.
- **Locked state**: silhouette + hint (toggle via Settings).
- **Unlocked state**: title + cozy text + date first unlocked.
- **Transitions**: transform/opacity only; respects reduced motion.

## Integration Notes
- **Town Board**: “Almanac Insight of the Day” card in Events tab.
- **Scrapbook**: related Almanac links shown inside memory pages.
- **Settings**: “Almanac Hints” toggle.
