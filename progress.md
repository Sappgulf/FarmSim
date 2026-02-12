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
