# Economy Notes (v5.6)

## Goals
- Keep early-game forgiving while preventing mid/late inflation.
- Ensure money remains meaningful through optional sinks, not progression walls.

## Band-driven tuning
- Economy reward scaling is now level-band aware via `getEconomyRewardModifier(level, source)`.
- Optional sinks use `getEconomySinkModifier(level)` to scale cosmetics/convenience gently in mid/late bands.

## Source changes
- Harvest/minigame/daily payouts now call `earnMoney(amount, source)` so source-based tuning is centralized.
- Passive-style payouts are tuned lower in later bands.

## Sink changes
- Festival challenge entry now has a small optional coin sink by progression band (waived for onboarding and when low on coins).
- Sink is optional and never blocks core progression.
