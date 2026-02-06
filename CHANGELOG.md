# CHANGELOG

All notable changes to this project will be documented here.

Guiding rules:
- Group changes by release.
- Prefer user-facing language for UI/gameplay items.
- Include a short “Engineering Notes” section when changes affect performance, saves, or architecture.
- Every entry should be auditable (what changed, where, why).

## [5.3.0] - 2026-02-06

### Planned (2026-02-06) — Sprint G8: Progression Flow Rework
- **Scope:** gameplay systems, progression UI, save migration, QA/docs
- **What:** rebalance XP curve and source grants to prevent runaway early leveling, add daily anti-spam caps/diminishing, and improve progression readability.
- **Why:** make leveling feel earned and layered while keeping cozy momentum.
- **Verification:** `npm run test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint G8: Progression Flow Rework
- **Scope:** gameplay systems, progression UI, save migration, QA/docs
- **What:** centralized level curve in progression system, routed XP grants through source-aware tuning (harvest diminishing + first-of-day bonus, minigame daily cap, low daily reward XP, no pet XP path), and added recent XP source UI + maturity pacing copy.
- **What:** added level-band cosmetic progression rewards (unlock notifications + cosmetic token currency) to keep non-power progression satisfying while leveling slows.
- **What:** added save migration defaults for progression tracker/recent events and tests for curve pacing, anti-spam behavior, minigame cap, and save migration safety.
- **Why:** reduce XP spam and preserve long-term progression cadence without rewrites.
- **Verification:** `npm run test -- --run` and `npm run build` (pass expected).

### Planned (2026-02-06) — Sprint I1-I3: Cozy Variety Expansion
- **Scope:** frontend systems, content data, save compatibility, docs, QA
- **What:** add cosmetic crop traits + rare moments, time-of-day/weather visual accents, and decor-set-driven farm titles using existing Almanac/Scrapbook/Farm Card systems.
- **Why:** deepen cozy expression and narrative variety without introducing new gameplay pressure or parallel loops.
- **Verification:** `npm run test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint I1-I3: Cozy Variety Expansion
- **Scope:** frontend systems, content data, save compatibility, docs, QA
- **What:** added passive cosmetic crop traits, three ultra-rare moments (Golden Crop, Shooting Star Night, Perfect Harvest Morning), data-driven decor set completion tracking, and cosmetic Farm Titles with a single active selection.
- **What:** extended Almanac/Scrapbook content for traits, rare moments, and decor sets; surfaced title selection in Almanac and Town Board/Farm Card display; and announced a weekly special day via Town Board copy only.
- **What:** added visual-only time-of-day tint accents and lightweight weather micro-overlays using existing WeatherEffects and root CSS filters, with save-safe cozyExpansion state + migration defaults.
- **Why:** deepen expression and narrative variety while preserving balance and existing core loops.
- **Verification:** `npm run test -- --run` and `npm run build` (both pass).

### Planned (2026-02-06) — Sprint G7: Weekly Depth + Warning Cleanup
- **Scope:** replay systems, performance, tooling, docs
- **What:** remove remaining test/build warnings, add deeper weekly challenge incentives, and optimize frequent farm tab computations.
- **Why:** keep momentum on depth while improving CI/dev signal quality and runtime efficiency.
- **Verification:** `npm run test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint G7: Weekly Depth + Warning Cleanup
- **Scope:** replay systems, performance, tooling, docs
- **What:** upgraded Testing Library stack and refreshed Browserslist data (warnings cleared), added weekly challenge milestones and streak-based challenge reward boosts, and memoized farming stat calculations to avoid repeated per-render scans.
- **Why:** improve replay value through weekly goals, stabilize quality gates, and reduce UI compute overhead.
- **Verification:** `npm run test -- --run` and `npm run build` (both pass).

### Implemented (2026-02-06) — Sprint G7b: Weather Debug + Season Transition Polish
- **Scope:** gameplay correctness, UI polish, accessibility, tests
- **What:** unified weather key handling (`snow`/`snowy`) with shared weather metadata, fixed Weather Prediction patterns/options so rounds are always winnable, upgraded seasonal forecast generation to follow season weights, and rebuilt season transition overlays with valid gradients + strict cleanup + reduced-motion handling.
- **Why:** remove weather presentation/logic drift and raise moment-to-moment presentation quality without adding parallel systems.
- **Verification:** `npm run test -- --run` and `npm run build` (both pass).

### Implemented (2026-02-06) — Sprint G8: Mobile Layout Polish + Stress Gates
- **Scope:** mobile UX, stability, test coverage
- **What:** made farm plots responsive for dense grids (5×5) with smaller mobile-safe minimums, reflowed header controls for small screens, widened mobile notification layout to avoid clipping, and increased tiny sidebar stat text for readability.
- **What:** added stress regression tests for rapid tab switching, notification flood + duplicate closes, and repeated save/load cycles.
- **Why:** tighten 375px usability and lock in failure-path stability as systems grow.
- **Verification:** `npm run test -- --run` and `npm run build` (both pass).

### Planned (2026-02-06) — Sprint G9: Fishing Depth + Economy Integrity
- **Scope:** gameplay depth, economy correctness, mobile controls, stability tests
- **What:** rebuild the fishing mini-game with deeper mechanics, ensure notifications always auto-expire, and enforce reward/cost integrity for coins/XP.
- **Why:** improve core loop depth while eliminating reward-path inconsistencies and stale-notification clutter.
- **Verification:** `npm run test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint G9: Fishing Depth + Economy Integrity
- **Scope:** gameplay depth, economy correctness, mobile controls, stability tests
- **What:** redesigned fishing with continuous fish movement, tension management, catch quality tiers, streak/escape stats, and touch hold-to-reel controls tuned for mobile.
- **What:** added guaranteed notification expiry sweep, introduced `actions.addToInventory`, and replaced raw economy writes across systems/tabs with `earnMoney` / `spendMoney` / `addXP`.
- **What:** hardened reducer coin/XP writes with non-negative finite clamping and added new regression tests for fishing rewards, reducer guards, and notification auto-dismiss.
- **Why:** deliver a more skillful fishing loop, remove reward exploits/inconsistencies, and keep gameplay feedback clean without manual cleanup.
- **Verification:** `npm run test -- --run` and `npm run build` (both pass).

## [5.2.0] - 2026-02-06
### Planned (2026-02-06) — Sprint G6: Replay Loop + Performance Pass
- **Scope:** gameplay loops, UI polish, performance, tests, docs
- **What:** deepen daily replay systems, surface a daily economy focus loop in farm/inventory UI, and reduce tab rendering overhead in sidebar navigation.
- **Why:** increase return-to-play motivation while keeping frame/render cost low on large sessions.
- **Verification:** `npm run test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint G6: Replay Loop + Performance Pass
- **Scope:** gameplay loops, UI polish, performance, tests, docs
- **What:** added deterministic Daily Market Focus bonus sales loop (+25% featured crop), rebuilt Daily Operations challenge board with state-driven progress + one paid reroll per day, and optimized sidebar to mount only the active tab panel.
- **Why:** deliver clearer daily goals, better economic variety, and less unnecessary UI rendering work.
- **Verification:** `npm run test -- --run` and `npm run build` (pass; existing ReactDOMTestUtils act warning + Browserslist data warning remain).

## [5.1.1] - 2026-02-06
### Planned (2026-02-06) — Sprint G5: Stability Sweep + UI Polish
- **Scope:** frontend, systems, docs, tests
- **What:** fix reported tab recursion and Mystery Shop runtime errors, run code-wide bug checks, and apply focused UX polish to navigation/notifications/settings metadata.
- **Why:** remove production console crashes and improve day-to-day usability before adding more content.
- **Verification:** `npm run test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint G5: Stability Sweep + UI Polish
- **Scope:** frontend, systems, docs, tests
- **What:** removed recursive tab switching path in `FarmSim`, fixed Mystery Shop rarity resolution + safeguards, added regression tests for mystery seed rolling, synced section state when tabs change, enabled live notification history timestamps, and centralized displayed app version in Settings.
- **Why:** ensure stable navigation/reward flows and cleaner in-game metadata presentation.
- **Verification:** `npm run test -- --run` and `npm run build` (both pass; existing ReactDOMTestUtils act warning + Browserslist data warning remain).

## [5.0.4] - 2026-02-06
### Planned (2026-02-06) — Sprint G4: Inventory + Notifications QoL
- **Scope:** frontend, save schema, docs
- **What:** add a notification center history tab, add crop quick-sell actions in inventory, and route header manual save through the canonical save API.
- **Why:** improve daily usability while keeping existing systems and save stability intact.
- **Verification:** `npm run smoke-test -- --run` and `npm run build`.

### Implemented (2026-02-06) — Sprint G4: Inventory + Notifications QoL
- **Scope:** frontend, save schema, docs
- **What:** added a Notification Center tab with filterable history + clear actions, added per-crop and bulk crop quick-sell in Inventory, and updated header save to use `actions.saveGame()`.
- **Why:** make routine actions faster (selling, reviewing alerts, saving) without adding parallel systems.
- **Verification:** `npm run smoke-test -- --run` and `npm run build`.

## [5.0.3] - 2026-02-06
### Planned (2026-02-06) — Sprint G3: Monetization-Ready Cosmetics (Disabled by Default)
- **Scope:** frontend, content, docs, QA
- **What:** audit content pipeline + cosmetics surfaces, add entitlement foundation, extend pack metadata, add optional premium UI, and update QA harness coverage.
- **Why:** support premium cosmetics later without changing default free experience.
- **Verification:** `npm run smoke-test -- --run` (passes with ReactDOMTestUtils act deprecation warning + npm http-proxy warning).

### Implemented (2026-02-06) — Sprint G3: Monetization-Ready Cosmetics (Disabled by Default)
- **Scope:** frontend, content, docs, QA
- **What:** added entitlement manager + persistence, premium pack metadata validation, premium UI badges/lock modal (debug-only), save fallback for locked cosmetics, and QA harness coverage for free/premium gating.
- **Why:** establish a monetization-ready cosmetic layer without introducing payments or altering free-mode gameplay.
- **Verification:** `npm run qa:full` (passes; ReactDOMTestUtils act deprecation warning + npm http-proxy warning + Browserslist data warning).

## [5.0.2] - 2026-02-05

### Planned (2026-02-06) — Sprint I4: Seed Codes + Ghost Visits + Milestones
- **Scope:** frontend, content, docs, QA
- **What:** add shareable seed codes, read-only ghost farm visits via snapshot import/export, and event-driven cosmetic milestones.
- **Why:** deliver lightweight social + long-term progression with no networking.
- **Verification:** `npm run test -- --run`, `npm run build`.

### Implemented (2026-02-06) — Sprint I4: Seed Codes + Ghost Visits + Milestones
- **Scope:** frontend, content, docs, QA
- **What:** added Seed Code encode/decode + import UI, snapshot export/import with Ghost Visit read-only mode, milestone manager/data/UI, save migration v13, and QA coverage.
- **Why:** satisfy social-lite goals with deterministic offline sharing and cosmetic-only progression.
- **Verification:** `npm run test -- --run`, `npm run build`.

### Planned (2026-02-05) — Sprint G2: Day 2–7 Retention
- **Scope:** frontend, docs, QA
- **What:** audit existing Town Board/What’s New/save systems, add Welcome Back summary, Daily Delight, Weekly Visits, and QA harness coverage.
- **Why:** deliver lightweight, positive-only retention cues without new core systems.
- **Verification:** `npm run smoke-test` (passes with ReactDOMTestUtils act deprecation warning + npm http-proxy warning).

### Implemented (2026-02-05) — Sprint G2: Day 2–7 Retention
- **Scope:** frontend, docs, QA
- **What:** added Welcome Back summary, Daily Delight claim, and Weekly Visits tiers to the Town Board, plus retention save fields and QA harness coverage.
- **Why:** encourage gentle return loops with positive-only, capped rewards and clear context.
- **Verification:** `npm run test -- --run` (passes with ReactDOMTestUtils act deprecation warning + npm http-proxy warning).

## [5.0.1] - 2026-02-04
### Planned (2026-02-04) — Sprint G1: Release Discipline & Versioning
- **Scope:** frontend, docs, QA
- **What:** add a single APP_VERSION source, release mode flag, release gates, and “What’s New” changelog modal with version gating.
- **Why:** formalize shipping discipline so releases are deterministic and auditable.
- **Verification:** `npm run smoke-test` (passes with ReactDOMTestUtils act deprecation warning + npm http-proxy warning).

### Implemented (2026-02-04) — Sprint G1: Release Discipline & Versioning
- **Scope:** frontend, docs, QA
- **What:** added APP_VERSION config + release mode flag, release gate summary tooling, changelog → “What’s New” modal, and updated release docs/checklists.
- **Why:** provide a repeatable release process with clear gates and in-game release notes.
- **Verification:** `npm run smoke-test -- --run` (passes with ReactDOMTestUtils act deprecation warning + npm http-proxy warning).
### Planned (2026-02-04) — Genetics UI Polish + Breeding Reliability
- **Scope:** frontend
- **What:** remove underscore-heavy labels in Genetics UI, polish genetics sub-tabs, and ensure breeding inventory checks consume the correct parents.
- **Why:** deliver a more AAA presentation while keeping breeding mechanics reliable.
- **Verification:** `npm run build` (passes with Browserslist data out-of-date warning).

### Implemented (2026-02-04) — Genetics UI Polish + Breeding Reliability
- **Scope:** frontend
- **What:** formatted Genetics crop labels for display, polished breeding selection and preview copy, and fixed breeding inventory consumption for two-parent recipes.
- **Why:** keep genetics gameplay readable and consistent without breaking breeding rules.
- **Verification:** `npm run build` (passes with Browserslist data out-of-date warning).

### Planned (2026-02-04) — Sprint F2: Shareability + Identity Lock
- **Scope:** frontend, docs
- **What:** audit identity/almanac/town board systems, add Farm Card export, add Farm Theme selector + spotlight selection, and extend QA harness for shareability coverage.
- **Why:** deliver Sprint F2’s shareability and identity lock without new core systems or servers.
- **Verification:** Not run (baseline checks pending).

### Implemented (2026-02-04) — Sprint F2: Shareability + Identity Lock
- **Scope:** frontend, docs, QA
- **What:** added Farm Card canvas export with Town Board + Almanac entry points, added Farm Theme + farm name selection, and added spotlight selection for Almanac/Scrapbook with QA harness coverage.
- **Why:** enable shareable farm snapshots and cosmetic identity lock using existing Almanac/Scrapbook systems.
- **Verification:** Not run (QA harness and build checks not executed in this environment).

### Planned (2026-02-04) — Sprint F1: Season Pack + Cozy Goals
- **Scope:** frontend, content, docs
- **What:** expand Season Pack v1 content, add Cozy Goals prompts on the Town Board, extend Almanac/Scrapbook ties, and add a “What’s New” card with pack highlights.
- **Why:** deliver Sprint F1’s content expansion and optional guidance layer without new systems.
- **Verification:** `npm run smoke-test` (passes with ReactDOMTestUtils act deprecation warning).

### Implemented (2026-02-04) — Sprint F1: Season Pack + Cozy Goals
- **Scope:** frontend, content, docs
- **What:** expanded Season Pack v1 crops/decor/festival/almanac content, added Cozy Goals with event-driven completion + rewards, and surfaced “What’s New” pack highlights with dismissal tracking.
- **Why:** provide content expansion and gentle direction while staying data-driven and event-based.
- **Verification:** `npm run smoke-test` (passes with ReactDOMTestUtils act deprecation warning).

### Added
- Farm Card export (1080×1080 PNG) with Town Board + Almanac entry points.
- Farm Theme selector, farm name field, and spotlight selection for shareable identity.
- QA harness tests for Farm Card export, theme swap, and identity persistence.
- Release config module with APP_VERSION, release mode flag, and QA-facing release gate summary.
- Changelog-driven “What’s New” modal with per-version dismissal.

### Changed
- FarmSim save schema now persists farm theme, name, and spotlight selection.
- Save schema bumped to v8 with “What’s New” lastSeenVersion tracking.
- Debug/QA tooling now hides in release mode and Settings shows app version + release mode.

### Fixed
- Allowed the Preservation Facility to accept any available crop input instead of staying disabled when inventory contains crops.

### Performance
- (placeholder)

### UI/UX
- Added a “What’s New” release notes modal sourced from CHANGELOG.md.

### Engineering Notes
- Save version bumped to include farm theme/name/spotlight fields; defaults applied for older saves.
- Save version bumped to v8 to persist “What’s New” lastSeenVersion.

---

## [0.1.0] - YYYY-MM-DD
### Added
- Initial playable Farm Sim loop (farm grid + plots).
- Core tabs/panels and baseline UI.
- Save/load foundation.

### Changed
- (placeholder)

### Fixed
- (placeholder)

### Performance
- (placeholder)

### UI/UX
- (placeholder)

### Engineering Notes
- (placeholder)
