# FarmSim overhaul implementation backlog

Source: [2026-10-02 audit](AUDIT.md). All items start unchecked; this audit did not implement game changes. Priorities refer to findings FS-001 through FS-029. Preserve existing user work and saves throughout.

Implementation update: see the [overhaul progress report](../../overhaul/2026-10-02/PROGRESS.md) for completed work, evidence, and remaining scope. This list preserves the original audit proposals.

## 1. Restore the baseline

- [ ] Fix record/array plot access in Overview and Fields (FS-001).
- [ ] Fix the incomplete native seed lookup expression and resolve subsequent app build diagnostics (FS-002).
- [ ] Add smoke coverage that mounts the real web App and a native app-target build gate (FS-011).

**Done when:** both original applications build; new/loaded web saves render Overview, Fields, and Barn; current native build boots on a selected test device. Existing core tests still pass.

## 2. Establish simulation integrity

- [ ] Replace duplicated display/payout prices with one authoritative integer-cent contract (FS-003).
- [ ] Validate finite integer quantities, known IDs, and atomic inventory/money transitions in domain actions (FS-006).
- [ ] Validate save envelopes/state; protect unsupported or corrupt saves; handle denied storage access and failed writes visibly (FS-007–008).
- [ ] Accrue and consume native livestock ready balances, persisting the collection transaction (FS-009).
- [ ] Write the common crop/water/time/season/content contract and platform acceptance vectors (FS-012, FS-018).

**Done when:** five wheat at $2.20 pays $11; fractional/NaN/negative quantities leave state unchanged; second collection grants no reward; unsupported saves remain recoverable; both platforms execute the selected rule vectors consistently.

**Product decision before implementation:** purposeful manual farm days, or a shared real-time idle clock. The audit recommends manual days for the first overhaul slice; this is a proposal, not a selected requirement.

## 3. Build a renewable economy and one meaningful goal

- [ ] Add seed purchasing/replenishment, an ordinary sale outlet, renewable contracts, and a recovery path (FS-004).
- [ ] Connect starter crops and processed outputs to real buyers/recipes; define wheat versus grain (FS-005).
- [ ] Add one visible improvement that consumes earnings and changes useful farm capability (FS-026).
- [ ] Create a deliberately simple new-game save and retain the stocked demo as a QA fixture (FS-026).
- [ ] Simulate at least 30 days of buying, planting, harvesting, production, selling, and reinvestment.

**Done when:** the player can buy the next planting, sell every starter output, replace completed/deleted contracts, and earn a visible farm improvement. No mandatory finite resource can strand the player permanently. At least two production choices have valid uses.

## 4. Rebuild the core interaction loop

- [ ] Permit staggered/mixed planting with per-plot and batch actions; derive mixed-field status truthfully (FS-016).
- [ ] Replace fixed task counters with eligible objectives, completion events/rewards, and renewal rules (FS-017).
- [ ] Derive crop advice/estimates from actual prices, buyers, seeds, rules, and duration; keep draft crop separate from growing-crop status (FS-015).
- [ ] Define facility slots, job duration, serialized progress, and cancel/refund policy (FS-019–020).
- [ ] Provide a day summary/pending-work interaction consistent with the chosen clock.
- [ ] Put screen/subtab context in URL state and restore sensible history, focus, and scroll (FS-027).

**Done when:** plant → care → grow → harvest → process → sell → reinvest works through the UI and after refresh. Objective completion remains true after harvesting. Labels and payouts match domain state. Invalid actions explain why they were rejected.

## 5. Rebuild the world and responsive visual hierarchy

- [ ] Create neutral scenery and render actual plots/buildings/animals as state-driven layers (FS-021).
- [ ] Specify shared perspective, lighting, palette, scale, stage/anchor metadata, and asset provenance before producing more art (FS-025).
- [ ] Replace native world/crop emoji with the selected authored asset set; preserve native symbols for controls (FS-025).
- [ ] Keep day, season, forecast, and cash readable on mobile (FS-022).
- [ ] Put the active farm/production/sales action ahead of comparison panels and decorative trends; collapse secondary content (FS-010, FS-023).
- [ ] Reserve space for fixed navigation/toasts and keep all actions reachable at short heights.
- [ ] Add optional action audio, harvest payoff, and upgrade reveals; respect reduced motion (FS-026).

**Done when:** empty, planted, watered, growing, ready, harvested, and upgraded farm states are visibly different and correspond to saves. Check at least 390×844 phone, a representative tablet, 1280×720 short desktop, and native small/large windows; capture matched before/after states. Primary actions remain reachable and the farm remains visible.

**Product decision before asset production:** confirm the retained painterly 2.5D direction or select another concrete visual target. Do not generate an entire catalog before validating a small set in actual slots.

## 6. Admit optional systems with complete transactions

- [ ] Fix native fishing encounter/reward identity, one-time settlement, and task cancellation (FS-013).
- [ ] Implement advertised research time/effects or redesign the UI as immediate upgrades (FS-014).
- [ ] Add selected livestock/pets/genetics/season features one at a time, with a clear contribution to the core loop.
- [ ] Audit cost/benefit stacking and unlock pacing before adding prestige, diseases/disasters, or social systems.

**Done when:** optional activities can be entered, completed, cancelled, and resumed without duplicate rewards, mismatched results, hidden work, or mandatory interruption of farming. Each unlock has an observable effect.

## 7. Release gates and migration

- [ ] Validate legacy/current saves, recovery/export, multi-tab behavior, and refresh at each transaction boundary (FS-007–008, FS-012).
- [ ] Implement/test tab keyboard behavior, visible Market heading, target separation, skip/focus flow, and native accessible tile actions (FS-024).
- [ ] Run keyboard/VoiceOver, zoom, contrast, reduced-motion, and safe-area checks.
- [ ] Test production PWA first install, offline warm/cold starts, cache updates, and recovery; refresh screenshots and metadata from the actual final UI.
- [ ] Profile actual entry/renderers and representative devices rather than relying on older-system performance tests (FS-029).
- [ ] Align supported dependency ranges, executable scripts, current README, parity inventory, and save contracts (FS-028–029).
- [ ] Account for migrated features/saves before retiring disconnected legacy code.

**Done when:** current build/test/flow gates pass, save recovery is verified, representative device captures and profiles exist, and the documented product matches the shipped entry points. Record unresolved limitations explicitly.

## Work that can begin without settling the wider design

Baseline compilation/render repairs, active-entry test wiring, numeric validation, save protection, livestock collection integrity, and fishing encounter identity are bounded correctness work. Avoid coupling these fixes to new art, a backend, or framework replacement.

The clock model, first platform milestone, and direct farm interaction style should be settled before implementation of the broad gameplay/visual overhaul. No dates or effort estimates are asserted by this audit.
