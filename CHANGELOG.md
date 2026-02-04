# CHANGELOG

All notable changes to this project will be documented here.

Guiding rules:
- Group changes by release.
- Prefer user-facing language for UI/gameplay items.
- Include a short “Engineering Notes” section when changes affect performance, saves, or architecture.
- Every entry should be auditable (what changed, where, why).

## [Unreleased]
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
- (placeholder)

### Changed
- (placeholder)

### Fixed
- Allowed the Preservation Facility to accept any available crop input instead of staying disabled when inventory contains crops.

### Performance
- (placeholder)

### UI/UX
- (placeholder)

### Engineering Notes
- (placeholder: save migration, validation, cleanup changes, QA tooling changes)

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
