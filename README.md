# FarmSim

A cozy farming game with a React/Vite web app and a native SwiftUI/SpriteKit iOS app.

**[Play the web game](https://farm-sim-seven.vercel.app)** · [Report an issue](https://github.com/Sappgulf/FarmSim/issues)

## Grow a small farm

Start the web game with $120, usable seeds, and an empty farm. Plant crops, water them or let rain help, and end the day to advance growth. Harvest, sell produce or fill town orders, then buy seeds for the next planting.

- Wheat, tomatoes, and corn with individual and batch plot actions.
- Four 28-day seasons and preferred-season harvest bonuses.
- Farm-stall sales, town orders, animals, and workshop batches.
- XP progression with land expansion at level 2.
- Local saves with validation, restore previews, downloadable backups, and storage warnings.
- Phone and desktop layouts, plus offline support after the game has been cached.

The current web app is version **0.3.1**.

## Web and iOS

The web game advances through manual farm days. Native iOS uses its existing real-time clock and a larger content catalog. Their rules and save formats are not yet identical.

The native app includes crops, buildings, livestock, pets, fish, and research benefits. See the [native artwork catalog](docs/art-source/ios-v4/README.md), [iOS integration contracts](ios/INTEGRATION.md), and [gameplay QA report](docs/audits/2026-10-02/GAMEPLAY-QA.md) for implementation details and remaining coverage gaps.

## Run the web app locally

```sh
git clone https://github.com/Sappgulf/FarmSim.git
cd FarmSim
npm run install:web
npm run dev
```

Open the local URL printed by Vite. Root web commands forward to `web/`.

## Web checks

```sh
npm run qa:full
npm run test:ui
npm run smoke-test
```

`qa:full` runs the web test suite, type checking, and a production build. The UI and smoke commands use Vitest/jsdom; real-browser playtesting is a separate activity.

## Native development

Xcode and XcodeGen are required.

```sh
npm run ios:gen
npm run ios:test:core
IOS_DEVICE="YOUR_INSTALLED_SIMULATOR" npm run ios:test:app
npm run ios:build
```

Set `IOS_DEVICE` to an installed simulator for app tests and builds.

## Repository layout

- `web/src/App.tsx`: active web entry point.
- `web/src/state.ts`: web domain transactions.
- `web/src/storage.ts`: web save validation and migration.
- `ios/App/`: native UI, GameStore integration, and SpriteKit rendering.
- `ios/GameCore/`: native simulation and save migration.
- `shared/content/`: content catalogs and packs.
- `shared/schema/`: content and native save contracts.

The active web app has its own save schema. Features in disconnected legacy React modules are not necessarily available in the current web entry point.

## Project notes

- [Gameplay QA and remaining coverage gaps](docs/audits/2026-10-02/GAMEPLAY-QA.md)
- [Market redesign evidence](docs/audits/2026-10-02/market-redesign/README.md)
- [Settings and Almanac updates](docs/audits/2026-10-02/native-tabs-polish/README.md)
- [Overhaul progress](docs/overhaul/2026-10-02/PROGRESS.md)
- [Asset sources and runtime atlas contract](docs/overhaul/2026-10-02/ASSETS.md)

## Deployment

The existing Vercel project is `farm-sim`. Root `vercel.json` installs and builds the web app and publishes `web/dist`.

## Detailed reference

See the [project guide](PROJECT_GUIDE.md) for native research rules, development workflows, repository contracts, and overhaul evidence. Release history is recorded in the [changelog](CHANGELOG.md).
