# MEMORY.md — Project Continuity + Guardrails (Farm Sim)

## What This Repo Is
A cozy Farm Sim built in HTML/JS with:
- A grid-based farm with plots
- Multiple tabs/panels (Farm, Board, Shop, Pets, Journal, Games, More, etc.)
- Systems that may include: day/calendar, seasons/weather/festivals, collections/scrapbook, mood/philosophy, almanac, minigames, notifications/toasts, save/load
- Mobile-first requirements and “AAA polish” expectations

## Current Product Goals (North Star)
- **Professional feel:** clean UI, consistent text, great icons, cohesive navigation.
- **Flawless gameplay:** deterministic systems, stable state transitions, reliable minigames.
- **Unbeatable performance:** no leaks, minimal work per frame/tick, smooth animations.
- **Mobile excellence:** 375px fully functional; future-ready for PWA.

## Active Priorities
1) **Tabs & Information Architecture**
   - Reduce clutter, categorize features correctly.
   - “More” tab should be Settings first + utilities, not a junk drawer.
2) **Minigames Quality**
   - Fishing must be stable and polished (strict lifecycle, no leaks).
   - Minigames should be deterministic/testable (QA harness friendly).
3) **Notifications UX**
   - Auto-dismiss (~3–4s), visible close “×”, spam-safe, idempotent close.
4) **Mobile + PWA Track**
   - Improve responsive layout and touch UX.
   - Implement PWA safely (manifest, SW cache, update flow) without breaking web.

## Non-Duplication Rules
- Before implementing anything:
  - Search for existing implementation.
  - Check docs and inventories.
  - If it exists: extend/polish; do not re-implement.
- If duplicates are found: consolidate safely (no save break).

## Quality Gates (Must Hold)
- Zero console errors in normal play
- No crashes under stress:
  - rapid tab switching
  - spam notifications + close
  - full plots + harvest cycles
  - save → reload under heavy state
- No progressive slowdown (repeat stress tests)
- 375px mobile fit: no clipping / horizontal scroll
- Cleanup guarantees:
  - no stacked timers/listeners/rAF after closing tabs/minigames

## Technical Assumptions to Preserve
- Event-driven updates preferred over per-tick scanning
- Data-driven content is preferred (packs/schema), with validation
- Save/load includes schema validation and (if present) version migration
- Debug/QA tooling must be OFF by default

## Known Recurring Issues to Watch
- Text display leaking snake_case (underscores) into UI
- Notifications close logic causing crashes or leaks
- Fishing minigame: lifecycle leaks, inconsistent input timing across devices
- “More” tab hiding important features / navigation confusion

## Change Discipline
- Targeted diffs only
- Measure before/after when touching performance
- Always update CHANGELOG.md with user-facing changes and fixes
