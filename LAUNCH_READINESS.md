# FarmSim Launch Readiness

Updated: 2026-05-16

## Current App Shape

- Web is the primary FarmLife client: React 18, Vite, Tailwind, selector-based game state, central system scheduler, PWA build.
- iOS is a native SwiftUI + SpriteKit app backed by `ios/GameCore` and shared JSON content where practical.
- `shared/content` remains the canonical authoring surface for crops, buildings, livestock, pets, fish, festivals, minigames, strings, and config.
- Save truth is split by runtime shape: web localStorage uses `saveVersion=16`; iOS/GameCore uses the documented `version=16` payload in `shared/schema/save-contract.md`.

## Verified Scripts

- `npm run install:web`: pass, dependencies up to date, 0 vulnerabilities.
- `npm run lint`: pass, 132 warnings, 0 errors.
- `npm run test`: pass, 37 files, 104 tests.
- `npm run smoke-test`: pass, 1 smoke test.
- `npm run build`: pass, Vite production build completed.
- `npm run test:e2e`: pass, 1 Playwright smoke test.
- `npm run ios:test:core`: pass, 21 GameCore tests.
- `npm run ios:build`: pass with `generic/platform=iOS Simulator`.
- `npm run ios:build:small`: pass with `generic/platform=iOS Simulator`.
- `npm run ios:build:large`: pass with `generic/platform=iOS Simulator`.

Rendered proof:

- Preview server: `http://127.0.0.1:4173/`.
- Screenshot: `screenshots/farmsim-quality-upgrade-preview.png`.
- Mobile screenshot: `screenshots/farmsim-quality-upgrade-mobile.png`.

## Known Parity Gaps

- Web and iOS now report save version `16`, but they still do not share one exact persisted payload shape.
- iOS has weather forecast surfacing and weather growth modifiers, but it does not yet match the full web weather/disease/disaster surface.
- iOS has Town flows for quests/events and market context, but processing queues, achievements, social/trade-lite, mystery shop, and disease management remain partial.
- Shared content is canonical, but iOS still keeps fallback hardcoded catalogs for resilience when bundled content is unavailable.

## Current Quality Risks

- Web lint is warning-only clean; the warning backlog is still large enough to hide future regressions if left unmanaged.
- `FarmGrid.jsx`, `GameContext.jsx`, `GameStore.swift`, `TownMarketView.swift`, and `FarmView.swift` remain large files with higher review risk.
- The iOS small/large build lanes now build portably, but they no longer prove named small/large device layouts unless `SMALL_DESTINATION` and `LARGE_DESTINATION` are overridden on a machine with those simulators.
- The web farm shell is more guided, but first-run onboarding still overlaps with the farm-rhythm layer and should be audited on real mobile devices.

## Next 3 Implementation Slices

1. iOS progression visibility: add a native Today/Next Best Move strip on the Farm tab using existing `GameStore` state, with no save shape change.
2. Save convergence plan: document and prototype a bridge from web `saveVersion=16` localStorage export into the GameCore `version=16` payload.
3. Town system parity: choose one missing iOS Town loop, preferably processing queue or achievement claim flow, and implement it with GameCore tests plus shared docs.
