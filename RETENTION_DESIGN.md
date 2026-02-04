# Sprint G2 Retention Design

## Goals
- Provide a lightweight, positive-only return experience that feels rewarding without changing core gameplay loops.
- Surface a clear “Welcome Back” summary on return, plus tiny daily and weekly visit rewards.
- Keep all logic event-driven and idempotent (no per-tick checks, no reload exploits).
- Preserve save/load stability with schema-safe defaults and migration paths.

## Non-Goals
- No new meta progression systems, currencies, or hard streak punishments.
- No heavy calendars or server-side scheduling.
- No duplicate “What’s New” systems or overlapping Town Board surfaces.

## Audit (Existing Systems to Reuse)
- **What’s New**: Modal sourced from `CHANGELOG.md` and a Town Board card in `EventsTab.jsx`, both gated by `whatsNew` save state. (`src/components/farm-sim/ui/WhatsNewModal.jsx`, `src/components/farm-sim/ui/tabs/EventsTab.jsx`).【F:src/components/farm-sim/ui/WhatsNewModal.jsx†L1-L66】【F:src/components/farm-sim/ui/tabs/EventsTab.jsx†L193-L474】
- **Town Board home cards**: Town Board overview in `StoryDashboard.jsx`, plus onboarding/Town Board cards in the Events tab. (`src/components/game/StoryDashboard.jsx`, `src/components/farm-sim/ui/tabs/EventsTab.jsx`).【F:src/components/game/StoryDashboard.jsx†L1-L156】【F:src/components/farm-sim/ui/tabs/EventsTab.jsx†L260-L474】
- **Day rollover / calendar**: Day key (`YYYY-MM-DD`) via `getDayKey`, with day rollover tracked in `GameContext` and Almanac counters. (`src/systems/almanac.js`, `src/components/farm-sim/context/GameContext.jsx`).【F:src/systems/almanac.js†L1-L47】【F:src/components/farm-sim/context/GameContext.jsx†L167-L214】
- **Save/load schema + versioning**: Centralized in `GamePersistence.js` with `SAVE_VERSION` and migration rules. (`src/components/farm-sim/context/GamePersistence.js`).【F:src/components/farm-sim/context/GamePersistence.js†L1-L457】
- **Daily reward / streak systems**: Existing daily mini-game limit and daily challenge fields, but no login/daily reward mechanics. (`src/components/farm-sim/ui/tabs/EventsTab.jsx`, `src/components/farm-sim/context/GameReducer.js`).【F:src/components/farm-sim/ui/tabs/EventsTab.jsx†L191-L438】【F:src/components/farm-sim/context/GameReducer.js†L62-L113】
- **QA harness + debug gating**: QA tests live in `qaTests.js`, gated behind debug mode in `QAModePanel`. (`src/components/farm-sim/qa/qaTests.js`, `src/components/farm-sim/ui/QAModePanel.jsx`).【F:src/components/farm-sim/qa/qaTests.js†L1-L412】【F:src/components/farm-sim/ui/QAModePanel.jsx†L1-L214】

## UX Surfaces (Town Board Order)
1. **What’s New** (existing card; unchanged visual priority)
2. **Welcome Back** (conditional, one-time per day/session)
3. **Daily Delight** (tiny daily claim)
4. **Weekly Visits** (compact progress + cosmetic tiers)

## Persistence Fields (Save Keys)
Stored under `retention` in save state:
- `lastSessionAt` (timestamp)
- `lastSeenDayKey` (YYYY-MM-DD)
- `lastSeenGameDay` (Almanac day count)
- `lastSeenSeason` (season string)
- `lastWelcomeBackShownAt` (timestamp)
- `lastWelcomeBackDayKey` (YYYY-MM-DD)
- `lastDailyDelightClaimDate` (YYYY-MM-DD)
- `dailyDelightClaimCount` (number)
- `weeklyVisits`: `{ weekKey, days: string[], claimedTiers: number[] }`

## Anti-Exploit Rules
- **Daily Delight**: Claimable once per real-world day; tracked by `lastDailyDelightClaimDate`. No stacking or backfill.
- **Weekly Visits**: Unique day keys within the active week window; reward tiers are one-time per week via `claimedTiers`.
- **Welcome Back**: Shown only when gap threshold is met and only once per real-world day.

## Integration Points
- **Town Board**: Insert new cards in `EventsTab.jsx` (aligned with existing card styling).
- **What’s New**: Reuse existing gating; do not add parallel panels.
- **Onboarding**: No changes to onboarding steps; retention cards sit alongside existing Town Board cards.
- **Save/Load**: Extend `GamePersistence` migration + defaults for the new retention object.

