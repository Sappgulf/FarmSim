# Changelog

## [5.5.5] - 2026-05-16
### Gameplay & UX
- Added a farm-rhythm panel that summarizes ready crops, dry or diseased plots, claimable rewards, animal care, season/weather implications, farm title, specialization, next unlock, and one next-best action.
- Renamed the overflow navigation section to `Town`, moved board/reward flows to the front, and corrected the livestock badge so hungry, unhealthy, unhappy, or product-ready animals are counted honestly.
- Reworked the weather challenge into a forecast drill backed by the live 3-day forecast instead of a random pattern table.

### Architecture & Stability
- Extracted navigation persistence, audio lifecycle, season transition effects, visual weather rotation, and time-of-day visual state out of `FarmSim.jsx`.
- Capped active notification toasts while preserving the larger notification history.
- Fixed analytics progress math so empty or malformed plot/building data cannot emit invalid percentages.

### Documentation
- Synced save-contract docs with the actual GameCore/web bridge version (`16`) and added `shared/schema/save-example.v16.json`.
- Refreshed roadmap/parity notes so completed iOS Daily Quests, Events/Festival, and save-version parity are not listed as open work.
- Updated README dependency badges and quick-start notes to match the current web toolchain and Node `22` runtime.

## [5.5.4] - 2026-05-03
### UI/UX
- What's New waits until the **farm tour is finished or skipped** (`onboardingStep` reaches the final step), not merely when the tour first appears—fixing Skip and avoiding release notes over the walkthrough.
- Single source of truth for walkthrough steps: `src/constants/onboardingWalkthrough.js` (used by Tutorial, notifications, What's New, Events, GameContext, saves).
- Toast notifications (info/success) pause during the onboarding tutorial so they do not compete with the coach marks; errors and warnings still show.
- Cleaner dev experience: removed the always-on FPS chip; use **Settings → Show FPS** or **Alt+Shift+P** (Perf HUD) when you need frame metrics.
- Autosave line in the header uses clearer wording before the first write (instead of "Saved waiting for first save…").
- What's New historic notes for mobile releases are rewritten in plain language (no internal code names).

### PWA
- Manifest: `lang`, `dir`, and splash-friendly `background_color` aligned with the emerald UI.
- Page meta: `application-name` and `color-scheme` for install/browser chrome.
- Service worker: more reliable offline **navigation** fallback to cached `index.html`.
- Settings → Install: detects standalone mode (desktop + iOS), disables the button when already installed, and explains iPhone **Add to Home Screen** vs Chromium install prompts.

### Fixed
- PWA metadata: added `mobile-web-app-capable` alongside the Apple tag to clear the deprecation warning in Chromium-based browsers.

## [4.2.1] - 2026-02-13
### Added
- New **premium app icon**: "Friendly Barn" (clean, text-free look).
- **Barn-themed panels** across town market, almanac, and barn inventory—wood-style frames and a cozier layout (mobile app).
- **Paper-style item labels** on cards and subtle rotation on inventory icons for a hand-crafted feel (mobile app).

### Changed
- Clearer **market board** for browsing buys, sells, and upgrades (mobile app).
- Warmer **shadows and gradients** for readability (mobile app).
- Under the hood: improved asset catalog setup for native builds.

## [4.2.0] - 2026-02-13

- **Implemented**
  - **Scope:** iOS cozy animated homestead main menu + boot navigation flow
  - **What:** Replaced the previous menu entry with a dedicated Boot/Menu/GameShell flow and SpriteKit homestead menu scene:
    - Added lazy boot flow and quick save-presence probing:
      - `ios/App/Sources/Menu/BootView.swift`
      - `ios/App/Sources/FarmSimApp.swift`
      - `ios/App/Sources/GameShellView.swift`
    - Added cozy animated menu scene (sky gradient, hills, barn silhouette, fence, grass, clouds, ambient motes/fireflies, warm window glow) with reduced-motion handling:
      - `ios/App/Sources/Menu/HomesteadMenuScene.swift`
    - Added new menu overlay UI and button module:
      - `ios/App/Sources/Menu/MainMenuView.swift`
      - `ios/App/Sources/Menu/MenuButtonsView.swift`
    - Added credits sheet and wired menu actions:
      - `Continue`, `Start Game`, `New Game` (with confirmation), `Settings`, `Credits`, and disabled `Load Slot (Soon)` stub.
    - Added menu title/tagline keys to shared content:
      - `shared/content/strings.json` (`ui.appTitle`, `ui.menuTagline`)
    - Added stable menu source anchors:
      - `ios/FarmSimApp/Menu/MainMenuView.swift`
      - `ios/FarmSimApp/Menu/MenuButtonsView.swift`
      - `ios/FarmSimApp/Menu/HomesteadMenuScene.swift`
  - **Why:** Delivers a cleaner entry UX with native animation, fast launch-state detection, and smoother transition into gameplay while preserving iOS-native architecture.

- **Implemented**
  - **Scope:** iOS polish + expand master pass
  - **What:** Added cohesive gameplay/UI polish and feature depth while preserving web behavior:
    - Market flow expanded with segmented `Buy / Sell / Upgrades`, quantity steppers, sell-all confirmations, and deterministic daily seed specials:
      - `ios/App/Sources/TownMarketView.swift`
      - `ios/App/Sources/GameStore.swift`
    - Added daily task board with deterministic day-based objectives and claim rewards:
      - `ios/App/Sources/AppModels.swift`
      - `ios/App/Sources/GameStore.swift`
      - `ios/App/Sources/TownMarketView.swift`
    - Barn inventory now supports persisted favorites (save-backed), sorting (`Name/Qty/Value`), and existing search/chip filters:
      - `ios/App/Sources/Inventory/Barn/BarnInventoryView.swift`
      - `ios/App/Sources/GameStore.swift`
      - `ios/GameCore/Sources/GameCore/Models.swift`
    - Farm visuals upgraded with day/night lighting overlay, ready-to-harvest badge animation, and double-tap camera focus:
      - `ios/App/Sources/FarmScene.swift`
      - `ios/App/Sources/FarmView.swift`
    - Almanac expanded with festival detail sheets and clearer crop sourcing hints:
      - `ios/App/Sources/AlmanacView.swift`
    - Design system expanded with typography/components and documented anchor path:
      - `ios/App/Sources/DesignSystem/Typography.swift`
      - `ios/App/Sources/DesignSystem/Components.swift`
      - `ios/FarmSimApp/DesignSystem/*`
    - Save contract/version updated to v5 (`favoriteItems`) with migration coverage:
      - `ios/GameCore/Sources/GameCore/Persistence.swift`
      - `ios/GameCore/Tests/GameCoreTests/GameCoreTests.swift`
      - `shared/schema/save-contract.md`
      - `shared/schema/save-example.v5.json`
    - Expanded deterministic vectors and planning docs:
      - `shared/vectors/sim_vectors.json`
      - `shared/ROADMAP_NEXT.md`
      - `shared/PARITY_CHECKLIST.md`
      - `shared/schema/content-contract.md`
      - `README.md`
  - **Why:** Improves iOS UX cohesion and loop depth without web regressions, while keeping state/content contracts deterministic and documented.

- **Implemented**
  - **Scope:** iOS cozy barn inventory + shop integration
  - **What:** Replaced the basic inventory list with a barn-themed inventory module and wired a diegetic shop counter entry point while keeping Market tab flow intact.
    - Added new inventory barn module:
      - `ios/App/Sources/Inventory/Barn/BarnInventoryView.swift`
      - `ios/App/Sources/Inventory/Barn/BarnBackgroundView.swift`
      - `ios/App/Sources/Inventory/Barn/ShelfSectionView.swift`
      - `ios/App/Sources/Inventory/Barn/ItemCardView.swift`
      - `ios/App/Sources/Inventory/Barn/BarnHeaderHUD.swift`
      - `ios/App/Sources/Inventory/Barn/BarnInventoryModels.swift`
    - `InventoryView` now hosts barn module and routes to Farm/Market through `AppState`:
      - `ios/App/Sources/InventoryView.swift`
      - `ios/App/Sources/GameShell.swift`
    - Added barn art/asset plan:
      - `ios/FarmSimApp/Inventory/Barn/BARN_ART.md`
    - Centralized buy/sell item APIs in GameCore and switched store calls to those APIs:
      - `ios/GameCore/Sources/GameCore/GameCoreEngine.swift`
      - `ios/GameCore/Sources/GameCore/EconomySystem.swift`
      - `ios/App/Sources/GameStore.swift`
      - `ios/GameCore/Tests/GameCoreTests/GameCoreTests.swift`
    - Added barn tokens in design system:
      - `ios/App/Sources/DesignSystem.swift`
    - Updated parity tracking entries:
      - `shared/PARITY_CHECKLIST.md`
  - **Why:** Delivers a warmer inventory UX with in-barn shop access and keeps economy logic centralized in GameCore for consistency and testing.

- **Implemented**
  - **Scope:** iOS automatic time progression + warm farm UI pass
  - **What:** Replaced production manual day progression with an app-driven automatic clock and day rollover pipeline:
    - Added web time-model audit doc: `shared/schema/time-model.md`.
    - Added GameCore `TimeEngine` and persisted time meta state:
      - `ios/GameCore/Sources/GameCore/TimeEngine.swift`
      - `ios/GameCore/Sources/GameCore/Models.swift` (`meta.time`)
      - `ios/GameCore/Sources/GameCore/Persistence.swift` (`v4` migration path).
      - Extended tests for tick/day rollover/offline catch-up and `v3 -> v4` migration:
        - `ios/GameCore/Tests/GameCoreTests/GameCoreTests.swift`
    - Added iOS app-level loop driver and lifecycle integration:
      - `ios/App/Sources/GameLoopDriver.swift`
      - `ios/App/Sources/FarmSimApp.swift`
      - `ios/App/Sources/GameStore.swift` (`stepAutoTime`, offline catch-up, throttled HUD updates).
    - Removed production day-skip UI and added debug-only fast-forward:
      - `ios/App/Sources/FarmView.swift`
      - `ios/App/Sources/SettingsView.swift`
    - Added day-rollover transition overlay and warm HUD clock/season indicators.
    - Added optional crops-ready local notification plumbing and widget snapshot stub:
      - `ios/App/Sources/FarmNotifications.swift`
      - `ios/App/Sources/AppModels.swift`
    - Warmed iOS visual language and scene ambience:
      - `ios/App/Sources/DesignSystem.swift`
      - `ios/App/Sources/Theme.swift`
      - `ios/App/Sources/FarmScene.swift`
    - Updated parity/integration/save docs:
      - `shared/PARITY_CHECKLIST.md`
      - `ios/INTEGRATION.md`
      - `ios/AGENTS.md`
      - `shared/schema/save-contract.md`
      - `shared/schema/save-example.v4.json`
  - **Why:** Aligns iOS with continuous web-style time flow while preserving day-based GameCore crop logic and save compatibility.

- **Implemented**
  - **Scope:** iOS parity slice (Buildings + Expand + Research + Genetics)
  - **What:** Completed the next Town-tab parity slice by wiring web-equivalent building/research/genetics/expansion catalogs into `GameStore`, adding sell/yield/seed-cost modifiers, and exposing intent-driven flows in `TownMarketView`.
    - Added save `meta` usage in iOS app logic and documented save contract `v2`.
    - Added save migration coverage and meta round-trip coverage in `GameCoreTests`.
    - Updated parity/integration docs:
      - `ios/AGENTS.md`
      - `ios/INTEGRATION.md`
      - `shared/PARITY_CHECKLIST.md`
      - `shared/schema/save-contract.md`
      - `shared/schema/save-example.v2.json`
  - **Why:** Moves iOS toward full web feature parity while preserving strict GameStore intent boundaries and migration-safe persistence.
  - **Verification performed:** `npm run ios:test:core` (pass), `npm run test -- --run` (pass), `npm run build` (pass), `npm run ios:build:small` (pass), `npm run ios:build:large` (pass), `make -C ios ios-run` (pass), `xcrun simctl launch ... com.austinbeatty.farmsim` (pass).

- **Implemented**
  - **Scope:** canonical content migration + parity slice (Livestock + Pets + Fishing + Challenges)
  - **What:** Added canonical shared datasets and moved web/iOS consumers to them:
    - Added: `shared/content/buildings.json`, `shared/content/research.json`, `shared/content/genetics.json`, `shared/content/livestock.json`, `shared/content/pets.json`, `shared/content/fishing.json`, `shared/content/challenges.json`.
    - Web now reads buildings/research/genetics through `web/src/content/ContentManager.js` and updated tabs:
      - `web/src/components/farm-sim/ui/tabs/BuildingsTab.jsx`
      - `web/src/components/farm-sim/ui/tabs/ResearchTab.jsx`
      - `web/src/components/farm-sim/ui/tabs/GeneticsTab.jsx`
      - legacy `web/src/components/farm-sim/constants/buildingData.js` now hydrates from content manager.
    - iOS now decodes those datasets in `ios/App/Sources/ContentRepository.swift` and surfaces new Town gameplay flows in:
      - `ios/App/Sources/GameStore.swift`
      - `ios/App/Sources/TownMarketView.swift`
    - Save schema advanced to v3 with migration + docs/tests updates:
      - `ios/GameCore/Sources/GameCore/Models.swift`
      - `ios/GameCore/Sources/GameCore/Persistence.swift`
      - `ios/GameCore/Tests/GameCoreTests/GameCoreTests.swift`
      - `shared/schema/save-contract.md`
      - `shared/schema/save-example.v3.json`
  - **Why:** Establishes shared content as source of truth and extends iOS parity for the next feature group while keeping migration safety.
  - **Verification performed:** `npm run ios:test:core` (pass), `npm run test -- --run` (pass), `npm run build` (pass), `npm run ios:build:small` (pass), `npm run ios:build:large` (pass).

## 2026-02-12

- **Implemented**
  - **Scope:** monorepo/platform
  - **What:** Restructured repository into `/web`, `/shared`, and `/ios`; moved canonical runtime content to `shared/content`; added root command forwarding to keep web workflows runnable from repo root.
  - **Why:** Establishes a single source of truth for content and enables parallel native iOS + web development.
  - **Verification performed:** `npm run test` (pass), `npm run build` (pass).

- **Implemented**
  - **Scope:** cross-platform contracts
  - **What:** Added shared schema/docs and deterministic vectors:
    - `shared/schema/content-contract.md`
    - `shared/schema/save-contract.md`
    - `shared/schema/save-example.v1.json`
    - `shared/vectors/sim_vectors.json`
    - web mirror test `web/src/test/sharedVectors.test.js`
  - **Why:** Keeps web and native logic aligned on save/content structure and deterministic sim expectations.
  - **Verification performed:** `npm run test` (pass, includes new vector test).

- **Implemented**
  - **Scope:** native iOS MVP
  - **What:** Added native SwiftUI + SpriteKit app scaffold in `ios/` with XcodeGen, plus a pure Swift `GameCore` package and tests.
    - Includes minimal loop: tap to plant, advance day, harvest when ready, autosave/load.
    - Includes content load from bundled `shared/content/crops.json`.
  - **Why:** Delivers a first fully native iOS path while preserving existing web gameplay.
  - **Verification performed:** `swift test --package-path ios/GameCore` (pass), `xcodegen generate --spec ios/project.yml` (pass), `xcodebuild -project ios/FarmSim.xcodeproj -scheme FarmSim -destination 'platform=iOS Simulator,name=iPhone 17' build` (pass).

- **Implemented**
  - **Scope:** native iOS v1 completion
  - **What:** Upgraded iOS app to a 5-tab native shell (`Farm`, `Inventory`, `Town`, `Almanac`, `Settings`) with AppState/GameStore separation, onboarding pager, tile action sheet, dynamic-type-first SwiftUI components, and incremental SpriteKit tile updates with pinch/pan camera.
  - **Why:** Meets modern iPhone simulator support expectations with responsive native UI and reduced render churn.
  - **Verification performed:** `make -C ios ios-gen` (pass), `make -C ios ios-build` (pass), `make -C ios ios-build-small` (pass), `make -C ios ios-build-large` (pass).

- **Implemented**
  - **Scope:** planning/integration contracts
  - **What:** Added sub-agent ownership and merge contracts plus parity inventory:
    - `ios/AGENTS.md`
    - `ios/INTEGRATION.md`
    - `shared/PARITY_CHECKLIST.md`
  - **Why:** Enables concurrent tab-focused implementation without file ownership collisions and tracks explicit web->iOS parity gaps with source references.
  - **Verification performed:** docs reviewed against current source tree and tab/system inventories.

- **Implemented**
  - **Scope:** cross-platform performance instrumentation
  - **What:** Added web dev perf HUD with localStorage toggles, removed per-plot growth timers in farm grid, added iOS perf signposts + debug overlay + save-write coalescing, and introduced perf budget tests + benchmark notes.
    - `web/src/components/farm-sim/ui/PerfHud.jsx`
    - `web/src/components/farm-sim/ui/FarmGrid.jsx`
    - `web/src/components/farm-sim/core/FarmSim.jsx`
    - `ios/App/Sources/PerfTelemetry.swift`
    - `ios/App/Sources/GameStore.swift`
    - `ios/App/Sources/FarmScene.swift`
    - `ios/App/Sources/FarmView.swift`
    - `web/src/test/perfBudget.test.js`
    - `ios/GameCore/Tests/GameCoreTests/GameCoreTests.swift`
    - `shared/perf/bench.md`
  - **Why:** Reduces timer/node churn, adds measurable perf visibility, and enforces sim-tick perf budgets.
  - **Verification performed:** `npm --prefix web run test -- --run src/test/perfBudget.test.js` (pass), `swift test --package-path ios/GameCore --filter testSimTickPerformance20x20` (pass).

## 2026-02-10

- **Planned**
  - **Scope:** frontend/performance
  - **What:** Continue performance cleanup by removing expensive milestone progress diffing in the game action path.
  - **Why:** Milestone events run during normal gameplay; repeated deep serialization checks can add avoidable CPU overhead.
  - **Baseline verification:** `npm run test` (pass), `npm run build` (pass).

- **Implemented**
  - **Scope:** frontend/performance
  - **What:** Refactored milestone progress updates to return the existing progress object when no values change, and switched milestone event handling to use reference equality instead of `JSON.stringify` deep compares.
  - **Why:** Removes repeated serialization in a hot action path while preserving milestone unlock behavior.
  - **Verification performed:** `npm run test` (pass, includes new milestone regression tests), `npm run build` (pass).

## 5.5.4

### UI/UX
- Sidebar mounts only active tab content for better performance.
- Notification Center now keeps a saved history.
- Inventory quick-sell actions for crops.

### Added
- Weekly Operations milestone rewards.
- Streak-based challenge reward boosts.
- Daily Market Focus bonus crop loop.

### Changed
- Reworked Daily Operations board with reroll.


## 2026-02-10 (session 2)

- **Planned**
  - **Scope:** frontend/performance
  - **What:** Polish reducer performance by preventing no-op state writes in frequently-dispatched actions.
  - **Why:** Returning fresh state objects for unchanged values causes unnecessary store notifications and component selector checks.
  - **Baseline verification:** `npm run test -- --run` (pass), `npm run build` (pass).

- **Implemented**
  - **Scope:** frontend/performance
  - **What:** Added no-op guards in reducer hot paths (`SET_COINS`, `SET_XP`, `UPDATE_SETTINGS`, `UPDATE_RETENTION`, `UPDATE_GAME_LOOP`) plus a shared `mergeIfChanged` helper to preserve references when payload values do not change.
  - **Why:** Avoids unnecessary state object churn and downstream selector notifications for high-frequency updates.
  - **Verification performed:** `npm run test -- --run` (pass), `npm run build` (pass).
