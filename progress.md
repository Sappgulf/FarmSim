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

## 2026-07-30 1-6 Upgrade Tranche
- [x] Fix tutorial input handling and restore quality gates.
- [x] Add authored farm art and a stable asset registry.
- [x] Rebuild the farm board and mobile tool surface around primary play.
- [x] Add deterministic time stepping and richer render state for QA.
- [x] Add the first weather/disease preparation decision loop.
- [x] Run full browser, test, lint, and build verification.

Notes:
- Weather preparation plans are modeled as simulation state (`observe`, `tend`, `water`, `scout`, `protect`) so the renderer stays separate from gameplay rules.
- Image generation is unavailable in this environment, so the first asset pass will use reusable code-native vector art with stable semantic keys.
- The browser regression covered tutorial skip, weather planning, planting, deterministic growth, mobile tool drawer behavior, no horizontal overflow, and all 23 major tabs.
- Final verification: `39` test files / `112` tests passed; lint passed with `0` errors and `41` existing warnings; production build passed; browser page and console error lists were empty on desktop and mobile.
- The in-app browser tab remained open, but its control bridge was unavailable to this task, so the same live app URL was verified with a temporary native Playwright harness and the harness was removed afterward.

## 2026-07-30 1-5 Follow-up Tranche
- [x] Add generated-art-ready crop state slots with a safe vector fallback.
- [x] Add crop growth motion and harvest feedback.
- [x] Make forecast beats queueable with carried weather-plan consequences.
- [x] Add expansion paths, landmarks, and authored decor layers.
- [x] Strengthen onboarding around planting, watering, forecasting, harvesting, and the Town Board.
- [x] Run full browser, test, lint, and build verification.

Notes:
- The image API key is still unavailable, so generated sprite sources remain opt-in manifest slots; no broken image requests are introduced.
- Farm sprites expose semantic crop/state keys and animated vector fallbacks, with harvest flash/bloom feedback and decorative terrain layers for expansion landmarks.
- Forecast planning can target the next visible weather beat, carries through the transition, and records landed plans for the decision streak.
- Browser QA covered the five onboarding gates, deterministic growth and harvest, Town Board navigation, expansion to 4x4 with the well landmark, mobile tools, all 23 major tabs, and no horizontal overflow.
- Final verification: `41` test files / `117` tests passed; lint passed with `0` errors and `41` warnings; production build passed; `git diff --check` passed.
- The in-app browser tab remained open, but its control bridge was unavailable to this task, so the same live app URL was verified with a temporary native Playwright harness; the harness was removed afterward.

## 2026-07-30 Atmosphere + Release Tranche
- [x] Generate and inspect a non-API Meadowlight farm atmosphere asset.
- [x] Ship the generated art as an optimized WebP through the semantic farm asset registry.
- [x] Make the atmosphere respond to season and weather without coupling raster art to simulation state.
- [x] Align Vitest filesystem access with the production Vite boundary.
- [x] Run release QA, commit, push, and Vercel deployment preflight.

Notes:
- The generated 1536×1024 scene was converted from 3.0 MB PNG to a 328 KB WebP and placed at `web/public/assets/farm/meadowlight-atmosphere.webp`.
- Native browser QA verified the asset loads, season/weather data hooks render, all 23 tabs switch cleanly, mobile tools open, and 390px mobile has no horizontal overflow.
- Final pre-release verification: `npm run qa:full` passed with `41` test files / `117` tests, lint `0` errors / `41` warnings, and production build passed.
