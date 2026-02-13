# iOS Sub-Agent Ownership (FarmSim)

This file defines strict ownership boundaries for concurrent sub-agent work in iOS.

## Rules
- Each agent edits only owned files/directories.
- Shared interface changes must be documented in `ios/INTEGRATION.md` before merge.
- Cross-agent edits in a single diff are not allowed unless explicitly marked as `integration`.
- UI agents must call `GameStore` intents; no direct simulation/persistence mutation.

## Agent 1: Core/Data Contract
- Scope: shared content/schema/vector contract + simulation core.
- Owns:
  - `shared/content/**`
  - `shared/schema/**`
  - `shared/vectors/**`
  - `ios/GameCore/**`
  - `ios/App/Sources/ContentRepository.swift`
  - `ios/App/Sources/AppModels.swift` (content-facing models only)
- Interfaces exported:
  - `GameCoreEngine`
  - `SaveCodec` / `SaveFileStore`
  - `ContentLoader`
  - game model structs (`CropDef`, `DecorDef`, `FestivalDef`, `MinigameDef`, `SaveGame`)
- Responsibilities:
  - Ensure shared JSON is decodable in Swift.
  - Maintain save versioning and migrations.
  - Maintain deterministic vectors/hash compatibility.

## Agent 2: Farm Tab + SpriteKit Renderer
- Scope: farm interaction and visual renderer.
- Owns:
  - `ios/App/Sources/FarmView.swift`
  - `ios/App/Sources/FarmScene.swift`
- Interfaces consumed:
  - `GameStore.renderSnapshot`
  - `GameStore` farm intents (`stepAutoTime`, `setAppActive`, `setMenuPresented`, `plantSelectedSeed`, `harvestTile`, `advanceDays`, `waterTile`, `clearTile`, `harvestAll`)
- Responsibilities:
  - Tile interactions and camera controls.
  - Dirty-tile renderer updates.
  - Farm debug overlay metrics in Debug builds.

## Agent 3: Inventory Tab
- Scope: inventory browsing/actions.
- Owns:
  - `ios/App/Sources/InventoryView.swift`
- Interfaces consumed:
  - `GameStore.seedCount`, `GameStore.cropCount`, `GameStore.cropDefs`, `GameStore.emoji`
- Responsibilities:
  - Category/search/filter/sort UX.
  - Item metadata and quantity display parity.

## Agent 4: Market/Town Tab
- Scope: buy/sell market, upgrades, seasonal board.
- Owns:
  - `ios/App/Sources/TownMarketView.swift`
- Interfaces consumed:
  - `GameStore.buySeed`, `GameStore.sellCrop`, `GameStore.canAfford`, `GameStore.applyPendingGridUpgrade`
  - `GameStore.upgradeBuilding`, `GameStore.purchaseExpansion`, `GameStore.completeResearch`, `GameStore.discoverHybrid`
  - `GameStore.buyLivestock`, `GameStore.collectLivestockProducts`, `GameStore.adoptPet`, `GameStore.trainPet`
  - `GameStore.castFishingLine`, `GameStore.upgradePond`, `GameStore.claimChallenge`
  - `GameStore.buildingPlans`, `GameStore.researchPlans`, `GameStore.geneticsRecipes`, `GameStore.expansionPlan`
  - `GameStore.livestockPlans`, `GameStore.petPlans`, `GameStore.fishPlans`, `GameStore.challengePlans`
  - `GameStore.festivalDefs`, `GameStore.minigameDefs`
- Responsibilities:
  - Shop and sell flows.
  - Buildings/expansion/research/genetics feature parity.
  - Upgrade confirmation and status messaging.

## Agent 5: Almanac/Info Tab
- Scope: knowledge/info content.
- Owns:
  - `ios/App/Sources/AlmanacView.swift`
- Interfaces consumed:
  - `GameStore.almanacEntries`, `GameStore.festivalDefs`, `GameStore.strings`
- Responsibilities:
  - Crop/festival/strings-backed info surfaces.

## Agent 6: Settings + Meta
- Scope: settings, accessibility, reset/debug controls, shell/menu.
- Owns:
  - `ios/App/Sources/SettingsView.swift`
  - `ios/App/Sources/GameShell.swift`
  - `ios/App/Sources/GameShellView.swift`
  - `ios/App/Sources/Menu/BootView.swift`
  - `ios/App/Sources/Menu/MainMenuView.swift`
  - `ios/App/Sources/Menu/MenuButtonsView.swift`
  - `ios/App/Sources/Menu/HomesteadMenuScene.swift`
  - `ios/App/Sources/AppState.swift`
  - `ios/App/Sources/FarmSimApp.swift`
- Interfaces consumed:
  - `GameStore` settings mutators and save reset intent.
- Responsibilities:
  - Settings persistence UX.
  - App shell navigation and onboarding surfaces.

## Integration-Only Files
These files may be edited only in integration diffs:
- `ios/App/Sources/GameStore.swift`
- `ios/App/Sources/DesignSystem.swift`
- `ios/App/Sources/Theme.swift`
- `ios/project.yml`
- `ios/Makefile`

## Ownership Conflict Resolution
- If a change touches two owned scopes, split into:
  1. interface diff (integration owner)
  2. per-agent implementation diffs
- Conflicts are resolved in favor of documented interfaces in `ios/INTEGRATION.md`.
