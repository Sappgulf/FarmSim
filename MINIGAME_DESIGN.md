# Festival Mini-Game v2 — Design Doc

**Date:** 2026-02-04

## Audit Summary (Existing Systems)
- **Mini-game engine (v1):** `src/components/farm-sim/minigames/PerfectHarvestEngine.js`
  - rAF loop, `init/start/end/cleanup`
  - One-shot round; no deterministic mode
- **Mini-game UI:** `src/components/farm-sim/ui/minigames/PerfectHarvestModal.jsx`
  - Single round, uses random sweet spot and speed
  - Rewards handled in `EventsTab.jsx`
- **Festival system:** `content/festivals.json` + `src/components/farm-sim/ui/tabs/EventsTab.jsx`
  - Events are season-filtered and manually triggered
  - Active event stored in `state.activeSeasonalEvents`
- **Town Board (Events tab):** `src/components/farm-sim/ui/tabs/EventsTab.jsx`
  - Town Board cards + Perfect Harvest entry
- **Content pipeline:** `src/content/ContentManager.js`
  - Base JSON + pack merging (`content/` and `content/packs/<pack>`)
- **QA harness:** `src/components/farm-sim/qa/qaTests.js`
  - Existing mini-game smoke is fishing

No parallel festival mini-game engine exists. We will **upgrade the existing PerfectHarvest engine** and reuse the modal.

---

## v2 Goals
- One flagship festival mini-game with **professional feel** and **replayable** rules.
- **Data-driven** variants via content (no hard-coded festival rules).
- **Festival + Town Board integration** with play limits and save-safe cooldowns.
- **Non-blocking + performant**: rAF only while open; cleanup guaranteed.
- **Deterministic mode** for QA harness.

---

## Engine API (v2)
Module: `src/components/farm-sim/minigames/PerfectHarvestEngine.js`

### createGame(config)
Returns a game instance for one round.

```js
const game = createGame({
  speed: 0.6,
  zoneWidth: 0.18,
  sweetSpot: 0.5,
  reducedMotion: false,
  deterministicSeed: 123, // optional
  onUpdate: (state) => {},
  onEnd: (result) => {},
});
```

### Methods
- `start()` — begins rAF loop
- `stop()` — stops and computes result
- `getResult()` — returns last result `{ accuracy, tier, position, zoneWidth, sweetSpot }`
- `destroy()` — cleanup (cancels rAF, clears state)

**Guarantee:** no global intervals; rAF only while active.

---

## Rule Set Config Schema (Data-Driven)
Stored in `content/minigames.json` (merged by ContentManager; packs optional).

```json
{
  "schemaVersion": 1,
  "items": [
    {
      "id": "festival_harvest_classic",
      "festivalIds": ["harvest_moon", "pumpkin_fest"],
      "title": "Festival Perfect Hit",
      "instructions": "Stop the marker in the sweet spot. Best of 3 rounds.",
      "rounds": 3,
      "speedCurve": [0.55, 0.7, 0.85],
      "targetWindows": { "gold": 0.08, "silver": 0.14, "bronze": 0.2 },
      "theme": { "icon": "🌾", "panel": "from-amber-50 to-orange-50" },
      "sfx": { "hit": "harvest", "reward": "money" },
      "rewards": {
        "gold": { "coins": 30, "reputation": 2, "decor": "festival_banner" },
        "silver": { "coins": 20, "reputation": 1 },
        "bronze": { "coins": 12, "reputation": 1 },
        "miss": { "coins": 6 }
      }
    }
  ]
}
```

### Required fields
- `id`, `title`, `instructions`, `rounds`
- `speedCurve` (array per round)
- `targetWindows` (gold/silver/bronze window sizes)
- `rewards` (gold/silver/bronze/miss)

### Optional fields
- `festivalIds` or `seasonTags`
- `theme` and `sfx`
- `qaSeed` (deterministic mode only)

---

## Reward Tiers
- **Gold / Silver / Bronze / Miss** based on average accuracy across rounds.
- Rewards are **capped and idempotent per festival/day**.
- Possible reward types:
  - `coins` (small)
  - `reputation` (tiny)
  - `decor` (cosmetic item id)
  - `almanacPageId` (optional, idempotent)

---

## Anti-Exploit Rules
- **Play limit:** one play per festival per day; one per day when no festival is active.
- Persisted in `state.minigames.festivalGame`:
  - `lastPlayedDayKey`
  - `lastFestivalId`
  - `lastRuleId`
  - `lastResult`
- No economy changes beyond small, capped rewards.

---

## Accessibility + UX Requirements
- 375px width support; large tap targets.
- “Tap to Stop” option for mobile.
- Reduced motion respects settings (`settings.reducedMotion`).
- Hit/miss feedback includes SFX + a quick bar highlight (no per-tick effects).
- Close button always visible, cleanup guaranteed.

---

## QA Requirements
- **Deterministic QA mode** uses `qaSeed`.
- New QA tests:
  - Mini-game smoke (open/play/close)
  - Festival integration (card appears, play limit enforced)
  - Leak test (open/close 10 times; no listener/timer growth)
