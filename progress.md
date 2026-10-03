# Original prompt: "ok lets go over everything, we need everything working and better than ever, use skills that are applicable"

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

## Current Web Pass
- [x] Used `develop-web-game` for browser-based inspection and screenshot capture.
- [x] Fetched latest web interface guidelines before review.
- [x] Refreshed the welcome screen with a stronger full-bleed intro and more stable motion.
- [x] Verified `npm run build`, `npm run test`, `npm run lint`, and `npm run ios:build` after the change.
- [x] Found and fixed a stale dev-server issue by launching Vite from `web/` on port `4173`.
- [ ] Continue auditing the in-game shell for any remaining accessibility or layout issues if the user wants a broader UI pass.
- [x] Tightened shared UI transitions to avoid generic `transition-all` usage in the core primitives and key CSS utilities.
- [x] Confirmed the live shell still renders in Playwright after the shared-primitive cleanup.
- [ ] One headed Playwright capture attempt timed out on screenshot; headless capture and build/test/lint stayed clean.
- [x] Added semantic button types and explicit transition properties to the main shell nav/sidebar controls.
- [x] Hid the decorative iOS title layers from accessibility and exposed a single header label for the main menu title.
- [x] Re-ran a direct Playwright smoke test against `http://localhost:4173` and verified tab switching still works with no console errors.
- [x] Investigated a Vercel build failure: root build was missing `vite` because the web app dependencies were not being installed in the Vercel build environment.
- [x] Added `vercel.json` to make Vercel install and build `web/` explicitly (`installCommand`, `buildCommand`, `outputDirectory`).
- [x] Mobile browser snapshot exposed launch clutter on fresh start: `Tutorial` and `WhatsNewModal` can stack on top of the first playable screen, which reads as crowded on phone-sized viewports. Gate the release-notes modal behind a real returning-player signal so it does not compete with onboarding. ✅ Fixed by introducing persisted `hasLaunchedBefore` session gate + browser validation.
- [ ] Web runtime has no real GLB/GLTF shipping surface in the current repo scan, so the 3D asset pipeline skill was not directly applicable to this pass.

## 2026-08-23 Web Production Rehaul
- [x] Audited the active TypeScript parity app, legacy React surface, shared content, PWA metadata, and iOS build/test paths.
- [x] Preserved the painterly overview asset and unified navigation around the three implemented destinations.
- [x] Added seed consumption, per-crop yield, deterministic rain growth, daily animal production, and one-time animal collection.
- [x] Added `render_game_to_text`, `advanceTime`, and fullscreen support for deterministic browser playtesting.
- [x] Reworked responsive visuals, weather treatments, safe-area navigation, and low-height Barn/Planning behavior.
- [x] Replaced placeholder manifest screenshots with real 1280x720 and 540x720 gameplay captures.
- [x] Repaired content globs/aliases and promoted all tracked web suites into the default Vitest gate (41 suites / 138 tests).
- [x] Verified the clean browser loop: plant -> water -> advance -> harvest -> collect -> produce -> ship, with zero console errors.
- [x] Verified web build/lint, iOS GameCore tests, and iOS simulator build.
- [ ] Image generation was unavailable because `OPENAI_API_KEY` was not set; existing local artwork was reused and re-integrated.
- [ ] `npm audit` reports the pre-existing `vite -> postcss -> nanoid@3.3.16` advisory (GHSA-2v37-7h3g-55p8); no affected custom nanoid generator is used by FarmSim.

## 2026-08-23 Imagegen Board + Asset Pass
- [x] Generated and integrated a new premium storybook homestead overview with UI-safe composition and a state-neutral workable plot.
- [x] Generated and integrated a field-planning background built around the real 30-plot interaction surface.
- [x] Generated a 12-state wheat/tomato/corn growth atlas and connected plot art directly to simulation growth state.
- [x] Rejected two item-sheet variants that failed genuine-alpha validation; retained the existing production inventory sheet.
- [x] Refreshed exact-size PWA screenshots and advanced the offline cache to Web 0.2.1.
- [x] Verified 41 suites / 138 tests, type-check, lint, production build, desktop/mobile composition, crop progression, and zero browser console errors.
