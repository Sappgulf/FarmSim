Original prompt: use codex skills that make sense and can improve our repo

# FarmSim Native iOS v1 Progress

## Phase 0 — Read + Plan
- [x] Reviewed repo layout, web build/test setup, shared content, web save logic, and existing iOS app/GameCore.
- [x] Identified shared truth:
  - Canonical content: `shared/content/*.json`
  - Save schema/version source: `ios/GameCore/Sources/GameCore/Persistence.swift` (`SaveCodec.currentVersion`)
  - Deterministic vectors: `shared/vectors/sim_vectors.json`
- [x] Minimal implementation plan:
  1. Keep web commands stable from repo root.
  2. Finish iOS-native architecture (AppState + 5 tabs + SpriteKit farm + accessibility patterns).
  3. Harden shared contracts/vectors paths and keep cross-platform tests green.
  4. Verify web + GameCore + iOS simulator builds on small/large/latest devices.

## Delivery Checklist
- [x] Monorepo structure (`web`, `ios`, `shared/content`, `shared/schema`, `shared/vectors`)
- [x] Shared content wired in web via aliases
- [x] iOS UX + architecture completion
- [x] Save/load and migration surface checks
- [x] Validation runs (web + iOS)
- [x] README + CHANGELOG updates

## 2026-05-08 Codex Skills Improvement Pass
- [x] Audit active web shell and QA status.
- [x] Pick one high-confidence player-facing improvement.
- [x] Verify with tests/build and rendered playtest evidence.

Notes:
- Restored the web lint gate from failing errors to warning-only success.
- Added coverage for navigation semantics and refreshed the smoke test to assert accessible roles instead of duplicate visible labels.
- Rendered preview passed desktop and 390px mobile in the in-app Browser. The standalone web-game Playwright client was attempted but blocked by a missing local Playwright Chromium binary.

## 2026-05-08 Better Everything Follow-Up
- [x] Made the active Farming shell playfield-first on mobile.
- [x] Kept multi-tab bottom sections compact until the player explicitly opens the active section drawer.
- [x] Added regression coverage for the mobile priority contract and compact drawer behavior.
- [x] Re-ran lint, full tests, production build, and desktop/mobile rendered QA.

Notes:
- The playfield and tools regions now expose explicit mobile priority data so tests can protect the gameplay-first shell order.
- Fresh cache-busted browser checks passed with no new console warnings or errors; two earlier dynamic-import errors were stale entries from a cached old tab.

## 2026-05-08 1-12 Web Shell Polish Tranche
- [x] Collapsed duplicate starter-flow chrome to the bottom navigation signal.
- [x] Unified farm quick actions into the Farming panel instead of duplicating them in the sidebar.
- [x] Converted crop choices into real buttons with selected/recommended state and accessible labels.
- [x] Reduced mobile header bulk by hiding the level chip on narrow viewports.
- [x] Strengthened empty-farm next action copy around the recommended crop.
- [x] Added contextual plot hints for selected crops/decor.
- [x] Replaced static farming tips with state-derived field advice.
- [x] Tightened active-section drawer copy.
- [x] Moved settings diagnostics/release info behind an Advanced drawer.
- [x] Cleaned the active gameplay lint warning slice; lint is now 134 warnings, 0 errors.
- [x] Saved fresh desktop/mobile proof screenshots in `screenshots/`.
- [x] Removed extra selector work from `GameSidebar` by dropping the duplicated visual quick-action block.

Notes:
- Verification passed: `npm run lint`, `npm run test`, `npm run build`, and in-app Browser QA at desktop plus 390px mobile.
- New screenshot proof: `farmsim-desktop-farm-polish.png`, `farmsim-mobile-first-run-farm-polish.png`, and `farmsim-mobile-items-drawer-polish.png`.

## 2026-05-16 Repo Truth Pass
- [x] Rechecked branch alignment (`main` matched `origin/main`) and current web/iOS gates.
- [x] Fixed stale save-contract truth: GameCore and web are both on save version `16`, while the docs still presented the GameCore contract as `v5`.
- [x] Added a current `shared/schema/save-example.v16.json`.
- [x] Refreshed roadmap/parity notes so completed iOS Daily Quests, Events/Festival, and save-version parity are not ranked as open work.

Notes:
- Verification passed after the full quality pass: `npm run install:web`, `npm run lint` (132 warnings, 0 errors), `npm run test`, `npm run smoke-test`, `npm run build`, `npm run test:e2e`, `npm run ios:test:core`, `npm run ios:build`, `npm run ios:build:small`, and `npm run ios:build:large`.
- Preview proof saved in `screenshots/farmsim-quality-upgrade-preview.png` and `screenshots/farmsim-quality-upgrade-mobile.png`.
