# FarmSim

A cozy farming game with a React/Vite web application and a SwiftUI/SpriteKit iOS application. The current web release is **0.3.0**.

## Playable web loop

Start with $120, usable seeds, and an empty farm. Select plots, plant wheat/tomato/corn, water or let rain help, and end the day to grow crops. Harvest, sell goods at the farm stall or fill town orders, then buy seeds for the next planting. Earn XP to unlock land expansion at level 2.

- Mixed crops and staggered planting, individual care/harvest on the homestead, and batch actions in Fields.
- Four 28-day seasons; preferred-season crops yield an extra unit per plot.
- Seed purchases, ordinary sales, replenishing town orders, animal product collection, and two-day workshop batches.
- Live plot overlays and shared four-stage crop art, with layouts for phone and desktop.
- Validated versioned local saves, visible storage failure warnings, corrupt-save backups, and protection against overwriting newer saves.

The web uses manual farm days. Native iOS retains its existing real-time clock and larger shared-content catalog; cross-platform rules are not yet identical. Features in the disconnected legacy React modules are not all present in the current web entry point.

## Development and checks

```sh
npm run install:web
npm run dev
npm run qa:full
npm run test:ui
npm run smoke-test
```

`qa:full` runs all web tests, type checking, and a production build. `test:ui` exercises the mounted React App in jsdom; browser playtesting is a separate check. Root commands forward to `web/`.

```sh
npm run ios:gen
npm run ios:test:core
npm run ios:build
```

Native builds require Xcode and XcodeGen. See [iOS integration contracts](ios/INTEGRATION.md) and [native instructions](ios/AGENTS.md).

## Layout

- `web/src/App.tsx`: active web entry point; `state.ts` owns domain transactions, `storage.ts` owns save validation/migration.
- `ios/App/`: native UI, GameStore integration, and SpriteKit renderer.
- `ios/GameCore/`: core simulation and save migrations, currently native save version 17.
- `shared/content/`: native/shared content catalogs and packs.
- `shared/schema/`: documented content and native save contracts. The current web stores its separate schema version 3.

## Overhaul evidence

- [Initial audit and priorities](docs/audits/2026-10-02/AUDIT.md)
- [Implemented improvements, checks, and remaining work](docs/overhaul/2026-10-02/PROGRESS.md)
- [Generated art sources and runtime atlas contract](docs/overhaul/2026-10-02/ASSETS.md)

## Deploy

The repository is linked locally to the existing Vercel `farm-sim` project. Root `vercel.json` installs/builds `web/` and publishes `web/dist`. Vercel metadata and credentials remain untracked. Deployment requires an authenticated Vercel account and authorization to publish.
