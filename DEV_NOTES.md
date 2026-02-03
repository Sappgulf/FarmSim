# Dev Notes (Identity Loop v1)

**Date:** 2026-02-03

## Audit Summary
- No existing Farm Mood, Farm Memory/Scrapbook, or Farm Philosophy systems found in codebase.
- No Town Board UI present; added as a compact Story Dashboard card.

## Implemented Additions (Identity Loop v1)
- **Story Dashboard (Town Board)**: new UI card with vibe, suggestion, memory teaser, and small pulse badge.
- **Mood**: positive-only points and tiers, cosmetic-only visual impact.
- **Memories + Scrapbook**: data-driven chapters + micro-memories; idempotent flags.
- **Philosophy**: simple selection; influences story suggestion copy.
- **Wishing Well**: once/day wish, random cozy blessing; persists and clears on day rollover.

## Integration Points (File References)
- `src/components/FarmGame.jsx`
  - Identity state (mood, philosophy, memories, blessings)
  - Event hooks (plant/harvest/buy/build/day rollover)
  - Save/load extensions
- `src/data/identity.js`
  - Data configuration for mood tiers, memories, chapters, philosophies, blessings
- `src/components/game/StoryDashboard.jsx`
  - Town Board UI
- `src/components/panels/ScrapbookPanel.jsx`
  - Scrapbook UI (chapters + filters)
- `src/index.css`
  - Mood overlay + accent color tokens
- `src/utils/save.mjs`
  - Version handling for new identity fields

## Performance Guardrails
- No per-tick identity logic.
- Event-driven updates only (plant/harvest/day rollover/wish/etc.).
- No whole-grid scans added beyond existing action handlers.
