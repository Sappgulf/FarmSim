# iOS Integration Contract (FarmSim)

## Settings and Almanac presentation integration — 2026-10-02

Main-session integration across Settings rows and Almanac navigation: settings values use readable dark text on cream timber cards; the custom toggle receives an empty inner label because the outer SettingRow already displays the setting name; the Farm Name editor occupies its own full-width row. Almanac keeps its parchment design and uses a light toolbar tint for readable title and search controls. Settings continue mutating game preferences through the existing `GameStore` intents.

## Start menu integration — 2026-10-02

Main-session integration in the menu shell: the landscape geometry fills the complete screen, while title and controls remain inside the safe area. The removed “Cozy Living” subtitle has no remaining animation state. The version label stays directly over the illustration without a separate footer surface.

## Market redesign integration — 2026-10-02

Main-session integration across Market shell, all ten departments, asset production and store presentation (no concurrent agents):
- `MarketPanel`, `MarketActionStyle` and `MarketPalette` provide native cream/timber surfaces with explicit enabled/disabled states. Farm panels retain their existing design system.
- The pinned department selector exposes all ten existing destinations through a menu, plus four common shortcuts. Selection remains local UI state; purchase/reward mutations still use existing GameStore intents.
- `GameStore.orderedSeedChoices` places usable crops before locked crops and wheat first, then unlock level/name. Farm and Market consume the same order. The Seed Shop defaults to the player's level, with an explicit All Seeds filter.
- Buy/Sell cards keep unit quotes, quantity, total, stock and lock conditions visible; accessibility sizes stack actions. Sell All retains confirmation. This redesign changes no pricing or transaction rules.
- The unused duplicate Market layouts were removed; `MarketSectionContent` remains the single department router. `market_stall_v4` is new transparent decorative artwork with provenance in the native asset report.

## Artwork integration — 2026-10-02

Main-session integration across farm, inventory, Town, Almanac, menu, design system, and project configuration (no concurrent agents):
- `App/Resources/GameArtwork.json` maps 140 crop stages, 17 farm-object entries (including the chicken pet alias), 12 fish/float entries, and four terrain materials to measured pixel regions. Both new sheets and the retained three-crop sheet have uneven spacing; renderer code must use these bounds rather than assume equal cells.
- `GameArtworkCatalog` validates source bounds and supplies the single coordinate conversion for SpriteKit. `GameArtworkLibrary` provides lazy, bounded thumbnail caches for SwiftUI; images are decorative and surrounding native labels retain accessibility semantics.
- Every supported crop uses four stages. Render nodes preserve aspect ratio and a shared bottom anchor; seedling size grows by stage. Soil remains upright so child crops, progress bars, and water badges no longer rotate with the tile.
- Artwork changes do not mutate save state or simulation contracts. Existing wheat/tomato/corn art and original assets remain available. New menu art and `AppIconV4` are selected by native view/project configuration.
- Prompts, generated-source identifiers, measured bounds, and installed-file hashes are recorded under `docs/art-source/ios-v4`.

## Research effects integration — 2026-10-02

Main-session integration across core, store, and Research UI (no concurrent agents):
- `ResearchBenefits` owns the ten supported catalog IDs, numeric effects, and player-facing summaries. Existing completed flags require no migration; unsupported catalog entries cannot charge coins.
- `GameCoreEngine.completeResearch(_:cost:prerequisites:)` validates and applies the purchase atomically. Research growth/yield are applied in core; callers pass building/progression/pet multipliers without research to prevent double application.
- Irrigation waters planted tiles when acquired, after planting, and at each day boundary. Beekeeping grants 5 coins per world day and +10% average yield; composting reduces seed costs by 10%; aquaponics adds 10% growth and fish value. Existing research rates remain intact.
- Core fishing rewards apply sale/aquaponics bonuses. GameStore still consumes encounter identity exactly once and passes only non-research sale multipliers.
- Research cards display implemented benefits from the same policy used by the simulation, with unavailable entries disabled.
- Startup catch-up aligns the initial clock before advancing days, then applies the final clock. Applying the future day first would advance the world twice.
- `GameStore` accepts an optional save-file URL and startup timestamp for isolated integration tests; normal callers retain the production defaults. `FarmSimAppTests` runs the real store inside the app using temporary files and separate defaults suites.
- Bulk harvest passes the silo's absolute capacity to the single-plot transaction. Used inventory is counted once; a corrected 99/101 regression now fills the two remaining spaces.
- Silo auto-sales settle inside each daily step, so active days, fast-forward, and cold catch-up sell identical quantities. Level milestone rewards and any further milestones reached by their XP settle before publishing `save`, caches, and the render snapshot; progression unlocks use the engine's final XP.
- The farm HUD measures horizontal layout candidates at their natural width and can move weather to its own row. Weather name and time-window subtitle stack vertically, keeping condition names intact on phone widths.
- `SoundManager` retains UI settings/haptics on MainActor; `SynthesizedSoundPlayback` owns audio session, engine, buffers, and player nodes on its own actor. Completion callbacks transfer UUIDs rather than AVFoundation objects. Muting cancels pending playback, and startup applies saved preferences. The protocol seam tests mute/failure/cancellation without blocking hardware; a real synthesizer test verifies preparation off the main thread.

## Gameplay quality integration — 2026-10-02

Main-session integration changes (no concurrent agents):
- `GameStore` builds returning-player reward summaries from actual before/after ledger changes. Offline elapsed time does not itself grant the previously advertised XP, and login bonuses are not included in this summary.
- `MilestoneManager` describes streak continuity without confusing a coin bonus with a day count or advertising coins/XP that the ledger never grants.
- `FarmView` orders unlocked seed choices first, with wheat at the front, while preserving store-owned selection and planting intents.
- `MarketResearchSection` describes the existing immediate research purchase accurately; catalog duration metadata remains available for a future timed research contract.
- The Swift package excludes the Xcode test bundle's Info.plist from SwiftPM source discovery.

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
  - `beginFishingEncounter()`
  - `completeFishingEncounter(_:caught:)`
  - `cancelFishingEncounter(_:)`
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

## 2026-10-02 overhaul integration

Main-session integration changes (no concurrent subagents):
- GameCore v17 persists `lastLivestockCollectionDay`; `collectLivestockIncome(_:)` atomically grants one payout per world day. Old saves default the claim to -1.
- `GameStore.livestockProductsReady` controls native market readiness; collection remains a GameStore intent.
- Fishing now uses `beginFishingEncounter()`, `completeFishingEncounter(_:caught:)`, and `cancelFishingEncounter(_:)`. A UUID identifies one store-owned fish and can be consumed only once. `FishingSection` cancels sessions on disappearance/background and measures elapsed time using system uptime.
- Repaired the action-hint seed fallback's unmatched parenthesis.
- SpriteKit now shares the v3 transparent atlas for wheat, tomato, and corn, using cached normalized texture regions. Other native crop IDs retain their existing fallback; no simulation decisions moved into the renderer.
- Fixed missing schemaVersion in the season pack's crops/decor/festivals, which crashed Debug launches. BundledContentTests exercises base and pack catalogs through the runtime loader.
- FarmNotifications.clearCropsReadyReminder now runs its blocking notification-daemon calls in an explicitly concurrent task. A sampled native startup showed MainActor waiting inside that service call; no UI state crosses the task boundary.
- New/reset farms receive only level-one usable seeds (including wheat when present). Initial selection prefers stocked unlocked seeds, so existing farms no longer open on a locked alphabetical crop; existing seed inventories are preserved.
- Untouched legacy starter saves with zero XP, zero coins, no planted/harvested crops, and no stocked usable seed receive four usable seeds. This additive repair prevents the old alphabetical seed grant from stranding a farm.
