# Progression Notes

## Target Feel
- Levels 1–5: onboarding pace, steady progress without burst-leveling.
- Levels 6–10: requires intentional play sessions and mixed actions.
- Levels 11–20: variety-driven progression (harvest + minigame + challenges).
- Beyond 20: long-tail mastery, mostly cosmetic unlock cadence.

## Target Time (rough)
- Level 5: ~20–30 minutes.
- Level 10: ~1–2 hours.
- Level 20: multiple sessions.

## XP Source Map (event-driven)
- Harvest -> `FarmGrid/FarmingSystem` harvest events -> base XP from earnings, then daily diminishing by crop + first-of-day bonus.
- Minigame -> `FishingSystem` and weather prediction -> skill-influenced XP with per-minigame daily cap.
- Daily rewards/quests/events -> reward claim handlers -> low capped XP.
- Milestone/challenge/achievement -> claim/completion handlers -> one-time burst XP (no passive ticks).
- Pets -> no XP through tuning path (`source: pet` resolves to zero).

## Curve Strategy
- Centralized in `getXpForLevel(level)` (piecewise non-linear early/mid/late) + `getLevelFromXp(xp)`.
- Reducer computes level from total XP and never drops player level.
- Save migration keeps XP non-negative and level at least XP-derived level.
