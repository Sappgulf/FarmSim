# iOS Integration Contract (FarmSim)

This document defines the single integration layer and the contracts all iOS tab agents must obey.

## Single Source Integration Layer
- State owner: `ios/App/Sources/GameStore.swift`
- Renderer snapshot model: `FarmRenderSnapshot` in `ios/App/Sources/AppModels.swift`
- Core simulation: `ios/GameCore/**`
- Runtime tick driver: `ios/App/Sources/GameLoopDriver.swift` (app-layer timer, not SpriteKit update loop)

## Architecture Rules
- UI never mutates simulation state directly.
- All mutations go through `GameStore` intent methods.
- Renderer (`FarmScene`) receives immutable snapshots and performs visual diffing.
- Content is loaded once through `ContentRepository` and cached in `GameStore`.

## Public Intent API (GameStore)
The following methods are the allowed mutation surface for tabs:
- Farm intents:
  - `stepAutoTime(now:)`
  - `setAppActive(_:now:)`
  - `setMenuPresented(_:)`
  - `advanceDay()` (debug/legacy compatibility)
  - `advanceDays(_:)` (debug/legacy compatibility)
  - `selectSeed(id:)`
  - `plantSelectedSeed(on:)`
  - `waterTile(index:)`
  - `clearTile(index:)`
  - `harvestTile(index:)`
  - `harvestAll()`
- Economy intents:
  - `buySeed(cropID:)`
  - `sellCrop(cropID:quantity:)`
  - `applyPendingGridUpgrade()`
  - `upgradeBuilding(_:)`
  - `purchaseExpansion()`
  - `completeResearch(_:)`
  - `discoverHybrid(_:)`
  - `buyLivestock(_:)`
  - `collectLivestockProducts()`
  - `adoptPet(_:)`
  - `trainPet(_:)`
  - `castFishingLine()`
  - `upgradePond()`
  - `claimChallenge(_:)`
- Settings/meta intents:
  - `setHapticsEnabled(_:)`
  - `setSoundEnabled(_:)`
  - `setReducedMotion(_:)`
  - `setVoiceOverHints(_:)`
  - `setFarmName(_:)`
  - `setPalette(_:)`
  - `setShowTileCoordinates(_:)`
  - `setParticleEffects(_:)`
  - `setTargetFPS(_:)`
  - `completeOnboarding()`
  - `resetSave()`
  - `persistNow()`

## Public Read Models
Tabs may read, but must not write, these properties:
- Save/snapshot:
  - `save`
  - `renderSnapshot`
- Content:
  - `cropDefs`
  - `cropDisplay`
  - `decorDefs`
  - `festivalDefs`
  - `minigameDefs`
  - `almanacEntries`
  - `strings`
- UX/system state:
  - `selectedSeedID`
  - `statusText`
  - `hudTimeText`
  - `hudClockSymbol`
  - `hudSeasonText`
  - `hudTimeProgress`
  - `dayRolloverToken`
  - `dayRolloverMessage`
  - `settings`
  - `onboardingRequired`
  - `buildingPlans`
  - `buildingSynergyPlans`
  - `researchPlans`
  - `geneticsRecipes`
  - `livestockPlans`
  - `petPlans`
  - `fishPlans`
  - `pondUpgrades`
  - `challengePlans`
  - `expansionPlan`

## Data Contracts
- Canonical content source: `shared/content/**`.
- Save contract source: `shared/schema/save-contract.md`.
- Deterministic vector source: `shared/vectors/sim_vectors.json`.

## Navigation Contract
- Tab enum: `GameTab` (`farm`, `inventory`, `market`, `almanac`, `settings`) in `ios/App/Sources/GameShell.swift`.
- App shell coordinator: `AppState` in `ios/App/Sources/AppState.swift`.
- Boot flow root: `BootView` in `ios/App/Sources/Menu/BootView.swift`.
- Menu/game shell transition:
  - menu overlay: `MainMenuView` in `ios/App/Sources/Menu/MainMenuView.swift`
  - gameplay shell wrapper: `GameShellView` in `ios/App/Sources/GameShellView.swift`

## Shared UI Contract
- Shared styles/components:
  - `DesignSystem.swift`
  - `Theme.swift`
  - `CardContainer`, `SectionHeader`, `StatPill`, button styles
- Accessibility:
  - Dynamic Type compatible typography
  - VoiceOver labels/hints on actionable controls

## Merge Protocol
1. Core/Data agent updates model/schema/interface first.
2. Integration owner updates `GameStore` if interface changes.
3. Tab agents rebase and implement against new interface.
4. Run quality gates before merge:
   - `npm run build`
   - `npm run test`
   - `npm run ios:test:core`
   - `npm run ios:build:small`
   - `npm run ios:build:large`

## Prohibited Patterns
- Direct state writes from views into `save` or `engine`.
- Per-tab duplicate content loaders.
- Renderer-side simulation decisions (renderer must be view-only).
