# FarmSim Rehaul Audit

Date: 2026-08-01
Mode: Audit + product/design direction
Environment: local workspace

Implementation follow-up: the first parity slice is now implemented under `web/`; this file records the blank-slate baseline that preceded it.

## Result

FarmSim began as a blank implementation workspace rather than an existing app that could be behaviorally audited. The original baseline contained only an empty `web/` directory; there was no package manifest, source code, runtime entry point, data layer, test suite, design system, asset set, or Git history to preserve.

The first rehaul artifact is a high-fidelity UI concept board:

- `output/imagegen/farmsim-rehaul-triptych.png`

It presents three connected surfaces: Farm Overview, Field Planning, and Barn + Market.

## Baseline findings

### AP-001 — No runnable application baseline (historical)

- Priority: P0 for implementation readiness
- Confidence: confirmed
- Category: functionality / upgrade
- Surface: `/Users/austinbeatty/Downloads/FarmSim`
- Evidence: workspace inspection found only `web/`; no `package.json`, HTML entry point, source files, or Git metadata.
- Impact: no primary journey, responsive behavior, runtime errors, persistence, or accessibility behavior can be verified yet.
- Recommended action: establish the web app shell and a deterministic local start command before feature work.
- Status: fixed by the React/Vite parity slice; runtime and build checks now pass.

### AP-002 — No gameplay state contract to design against (historical)

- Priority: P1
- Confidence: confirmed
- Category: upgrade
- Evidence: no data models, API boundary, fixtures, seed data, or persistence code exists in the workspace.
- Impact: UI decisions cannot yet be tied to authoritative values such as crop growth, soil state, production queues, inventory, or market prices.
- Recommended action: define the smallest playable state model before building the dashboard screens.
- Status: partially fixed; the first local state contract exists, while backend persistence and time simulation remain follow-up work.

### AP-003 — No existing visual language or asset constraints (historical)

- Priority: P2
- Confidence: confirmed
- Category: visual / asset
- Evidence: no stylesheets, components, tokens, fonts, icons, or image assets exist.
- Impact: the rehaul has freedom, but there is no current brand language to preserve or compare against.
- Recommended action: adopt the visual system below as the first design baseline and encode it as reusable tokens.
- Status: fixed by the shared visual system and generated asset pipeline.

## Rehaul direction

### Product loop

Make the daily loop explicit:

1. **Orient** — see the farm state, urgent tasks, weather, and available resources.
2. **Decide** — choose the highest-value next action with enough context to understand the tradeoff.
3. **Act** — complete the action with a short, focused interaction.
4. **See payoff** — surface progress, production, earnings, or risk immediately.

### Core surfaces

1. **Farm Overview**
   - Persistent day, season, weather, and cash context.
   - Task rail that turns the next best action into a visible choice.
   - Farm map that highlights actionable plots, buildings, and production states.

2. **Field Planning**
   - Selectable plot grid with soil and availability state.
   - Crop cards that compare season fit, growth time, water need, and projected return.
   - One explicit commit action such as `Plant 12 plots`.

3. **Barn + Market**
   - Inventory, animal production, processing queue, sell orders, and market trends in one view.
   - Clear distinction between raw goods, queued goods, and shippable goods.
   - A single high-confidence action such as `Ship goods`.

### Visual system

- Palette: parchment cream, deep forest green, muted sage, terracotta, sunflower gold, dark ink, small sky-blue accents.
- Surfaces: warm paper grain, lightly rounded panels, thin warm borders, restrained shadows.
- Illustration: painterly 2.5D farm scenes with crisp UI controls layered above them.
- Typography: high-contrast display face for FarmSim and section titles; readable humanist sans or serif body text for data.
- Interaction: selected, available, unavailable, queued, ready, warning, and completed states must be visible without relying on color alone.

## Implementation sequence once source exists

1. Create the web shell, routing, responsive layout, tokens, icon approach, and mock data.
2. Build the Farm Overview flow with seeded state and task completion feedback.
3. Add Field Planning with crop calculations and a persisted planting action.
4. Add Barn + Market with inventory and production queue state.
5. Test keyboard navigation, narrow layouts, empty/loading/error states, refresh persistence, and reduced motion.
6. Replace mock data with the real persistence/API boundary only after the interaction model is stable.

## Acceptance criteria for the first playable vertical slice

- A new player can tell what to do next within the first viewport.
- The player can select plots, choose a crop, confirm planting, and see the farm state update.
- A production item has an explicit status: queued, in progress, ready, or shipped.
- Currency and inventory changes are visible immediately and survive refresh in the chosen persistence layer.
- The same top-level context is available across overview, planning, and production screens.
- The core flow works at desktop and mobile widths with keyboard-visible focus.

## Current verification boundary

The parity slice has now been verified locally with typecheck, five state tests, a production build, and in-app browser flows at desktop and narrow widths. There is still no backend/API boundary, deterministic day advancement, or real production timer. The generated board remains a design direction; the current runtime assets are the WebP files under `web/public/assets/`, with source PNGs preserved under `output/imagegen/`.
