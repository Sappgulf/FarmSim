# Progression Notes

## Target Feel
- **Levels 1–3 (onboarding):** quick wins while learning plant → harvest → sell.
- **Levels 4–7 (early intent):** gains slow down enough that choices matter.
- **Levels 8–12 (mid-game variety):** best progress comes from mixing harvests, minigames, and goals.
- **Levels 13–20 (mastery pacing):** unlock chase and consistency over raw spam.
- **20+:** cosmetic prestige cadence, no power spikes.

## Target Session Timing (guidelines)
- Level 3 ≈ 15–20 minutes
- Level 5 ≈ 30–45 minutes
- Level 10 ≈ 2–3 hours
- Level 15 ≈ multiple sessions
- Level 20 ≈ long-term

## XP Source Map (event-driven only)
- **Harvest** (`FarmGrid`, `FarmingSystem`): reduced base conversion, per-crop daily diminishing returns, first-of-day crop bonus, tiny variety bonus.
- **Minigames** (`FishingSystem`, weather prediction): skill-weighted reward with per-minigame daily hard cap.
- **Milestones / challenges**: one-time burst XP, daily burst caps to prevent chain-claim spikes.
- **Daily rewards/events**: low capped XP (secondary to coin/cosmetic feel).
- **Pets / planting**: no XP grant.
- **Rare moments**: optional tiny XP via `rare_moment` source only, daily capped.

## Unlock Banding
- **1–3:** base farming loop, first core tab familiarity.
- **4–7:** entry genetics and utility unlocks.
- **8–12:** production/decor/festival variety unlocks.
- **13–20:** advanced systems and title/almanac depth.
- **20+:** cosmetic/title collection progression.

## XP Curve Strategy
- Single source of truth: `getXpRequiredForLevel(level)` in `progression.js`.
- Piecewise non-linear curve (early/mid/late) with steeper mid/late deltas.
- All level math uses `getLevelFromXp` + `getXpProgress`.
- Save migration remaps legacy XP onto the new curve while:
  - never reducing stored level,
  - preserving within-level progress proportion,
  - clamping XP to non-negative integers.


## Unified progression bands (v5.6)
- Canonical bands now live in `progression.js` (`PROGRESSION_BANDS`) and are used by XP/economy/difficulty tuning.
- Difficulty is soft-only via `getDifficultyModifier(levelBand)` with gentle growth-time, cost, rarity patience, and minigame window modifiers.
- Economy now references band-aware modifiers for sources (`getEconomyRewardModifier`) and optional sinks (`getEconomySinkModifier`).
