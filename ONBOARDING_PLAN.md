# Sprint D2 — Onboarding Plan (Soft Tutorial + First 10 Minutes)

**Date:** 2026-02-04

## Audit Summary (No Duplicates)
Existing onboarding/help surfaces discovered in the repo:
- **Soft tutorial overlay (blocking)**: `src/components/farm-sim/ui/Tutorial.jsx` (localStorage-based, 4-step, full-screen).
- **Settings reset button**: `src/components/farm-sim/ui/tabs/SettingsTab.jsx` (calls `resetTutorial`).
- **Dynamic goal hint**: `src/components/farm-sim/ui/GameHeader.jsx` (inline “Next Goal” text).
- **Farm grid hints**: `src/components/farm-sim/ui/FarmGrid.jsx` (inline hints + keyboard shortcuts).
- **Town Board panel**: `src/components/farm-sim/ui/tabs/EventsTab.jsx` (“Town Board Insight” + Perfect Harvest).
- **Memories & Almanac**:
  - Memory data: `src/data/identity.js`
  - Almanac pages: `content/almanac.json` + `src/systems/almanac.js`
  - Unlock logic: `src/components/farm-sim/context/GameContext.jsx`
- **Legacy tutorial system (not active in current app)**:
  - `src/hooks/useTutorial.js`, `src/components/game/Tutorial.jsx` (used by legacy `FarmGame.jsx`).

**Plan:** Reuse and extend the existing **FarmSim Tutorial** component, integrate with save-state, and reuse the existing **goal hint logic** for the Town Board “Today’s Plan.” No parallel onboarding systems.

---

## First-Session Flow (Current)
- **Starting resources:** `coins: 100` (no seed inventory; seeds cost coins per plant). `selectedCrop: 'carrot'`. (`src/components/farm-sim/context/GameReducer.js`)
- **First crop growth timing:** Base crop growth time ranges **48–80s** for level 1 crops in `content/crops.json`. Effective growth is faster in **Spring** and **Sunny** weather (multiplicative bonuses in `SeasonSystem` + `FarmingSystem`).
- **Day length defaults:** Day rollover uses real-world dates (`src/systems/almanac.js`). Seasons cycle every **2 minutes** (`SeasonSystem`).
- **Town Board content day 1:** Events tab currently shows **Town Board Insight** (Almanac), **Perfect Harvest mini-game**, and **Pack Highlights** (if any). (`src/components/farm-sim/ui/tabs/EventsTab.jsx`)

---

## Soft Tutorial Overlay (3 Steps, Event-Driven)
**Component:** `src/components/farm-sim/ui/Tutorial.jsx` (repurpose existing).

**State (save-persisted):**
- `onboardingSeen: boolean`
- `onboardingStep: 0–3`
- `onboardingSkipped: boolean`

**Steps + Completion Rules (idempotent):**
1. **Plant something** → complete on `onPlant` event.
2. **Harvest it** → complete on `onHarvest` event.
3. **Visit the Town Board** → complete on `onOpenBoard` event.

**Rules:**
- Non-blocking: small overlay card; no full-screen dim.
- Skippable at any time.
- Mobile-first (375px) with safe placement and optional drag.
- Overlay auto-hides when completed or skipped.

**Triggers (event-driven only):**
- `FarmGrid` plant action → `recordOnboardingEvent('plant')`.
- `FarmGrid` harvest action → `recordOnboardingEvent('harvest')`.
- `FarmSim` tab change to `events` → `recordOnboardingEvent('board_open')`.

---

## Town Board “First Session” Polish
**Location:** `src/components/farm-sim/ui/tabs/EventsTab.jsx`

Add compact, mobile-friendly blocks at the top:
- **Today’s Plan**: 1–2 suggestions derived from existing state (reuse `getNextGoal` logic from `GameHeader`).
- **You’re close to…**: teaser for next memory or Almanac page (use existing hints; no new systems).
- **Shop Today**: short line pointing to Shop tab (no new pricing logic).
- **Vibe line**: one-sentence mood/season flavor (if no mood tier available, use season description).

Updates only on open/state changes (no per-tick refresh).

---

## Guaranteed Early Wins (≤10 Minutes)
**Targets:** 1 memory, 1 almanac page, 1 small reward.

**Memory unlocks (idempotent):**
- `first_seed` (on first plant)
- `first_harvest` (on first harvest)
- `first_board_visit` (new memory; on Town Board open)

**Almanac page (idempotent):**
- New early page unlocked on **first harvest OR first Town Board visit**.

**Small reward (idempotent):**
- “First Harvest Bonus” (small coins + tiny reputation).
- One-time only (gated by memory/unlock flag).
- Clean toast notification.

---

## Starter Pack Defaults (Content/Config Only)
- **Starter currency**: small increase to reduce friction.
- **Starter seeds quantity**: interpreted as starter **planting capacity via coins** + set default crop selection.
- **Starter decor bundle**: grant 1–2 existing decor items in inventory (if decor exists).
- **Starter pack content**: add a minimal `starter-pack` using content pipeline (data-only).

---

## Early Pacing Tune (First Session Only)
- Add a **one-time learning boost** to the **first planted crop** (growth speed only).
- No long-term buffs and no per-tick checks.

---

## File Touch List (Planned)
- `src/components/farm-sim/ui/Tutorial.jsx`
- `src/components/farm-sim/context/GameActions.js`
- `src/components/farm-sim/context/GameReducer.js`
- `src/components/farm-sim/context/GameContext.jsx`
- `src/components/farm-sim/context/GamePersistence.js`
- `src/components/farm-sim/ui/FarmGrid.jsx`
- `src/components/farm-sim/core/FarmSim.jsx`
- `src/components/farm-sim/ui/tabs/EventsTab.jsx`
- `src/components/farm-sim/ui/GameHeader.jsx`
- `src/utils/goalHints.js` (new shared helper)
- `content/almanac.json` (early page + memoryLinks)
- `content/packs/starter-pack-v1/*` (data-only)
- `CHANGELOG.md`, `DEV_NOTES.md`, `GAME_GUIDE.md`, `QA_REPORT.md`

---

## Extension Notes
- Add new onboarding steps by extending `ONBOARDING_STEPS` + `recordOnboardingEvent` mapping.
- New early wins should be **idempotent** and tied to existing unlock systems (`unlockMemory`, `unlockAlmanacPage`).
- Keep onboarding logic **event-driven** (avoid per-tick updates).

