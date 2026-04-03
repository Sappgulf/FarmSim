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
