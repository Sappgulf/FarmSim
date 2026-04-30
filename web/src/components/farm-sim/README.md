# FarmSim frontend (`farm-sim/`)

Modular gameplay UI and systems layered on **`GameProvider`** (`context/GameContext.jsx`). The previous monolithic canvas surface has been replaced by **`FarmSim`** / **`FarmSimCore`** as the shell: header, **`FarmGrid`**, bottom **`NavBar`**, and lazy-loaded sidebar tabs (**`GameSidebar`** + **`ui/tabs/*`**).

## Layout

```
src/components/farm-sim/
├── core/           FarmSim.jsx, FarmSimCore.jsx — shell, loops, orchestration
├── context/       Game persistence, reducer, selectors
├── systems/       Farming, weather, livestock, achievements, …
├── ui/            Visible chrome: NavBar, GameSidebar, modals, toasts
│   └── tabs/      Lazy tab panels (shop, livestock, settings, …)
├── data/          Onboarding/tutorial copy and helpers
├── qa/            In-game QA helpers (manual / debug tooling)
└── constants/      Shared UI constants where applicable
```

## State and saves

- **Runtime state** lives in context; **persistence** is handled in `context/GamePersistence.js` with a versioned save shape (see `SAVE_VERSION` / `migrateSave` there).
- Do not mutate loaded save objects in place during play; migrate on load when the schema changes.

## Performance

- Game tick and canvas work stay off the React commit path where possible; use selectors and memoization for UI.
- Quality presets and adaptive particle trims live in **`src/performance.js`** (see Vitest `performanceUX.test.js`).
- **Tab panels**: `TabsContent` uses **`animate-tab-slide-in`** from `index.css`. The bottom nav sub-tab strip uses **`animate-navbar-subtabs-enter`** (same duration/easing, opposite vertical drift).

## Tests

From repo root:

- **Unit / component**: `npm test` (Vitest in `web/`).
- **Smoke E2E** (Chromium, built app): `npm --prefix web run test:e2e` — requires `npx playwright install chromium` once. The config starts **`vite preview`** on port **4173** (or reuses an existing server when not in CI).

## Service worker

`public/sw.js` registers in **production** only (`main.jsx` unregisters workers and clears caches in dev). Bump **`CACHE_NAME`** there when shell assets or caching rules change materially so clients drop stale entries on activate.

## Adding a feature

1. Prefer **system** logic in `systems/` or existing `utils/`, not inside tab JSX.
2. Add UI under `ui/` or `ui/tabs/`; wire through context actions/selectors.
3. Extend persistence with a **version bump + migration** if save shape changes.
4. Add or extend Vitest coverage; optional Playwright touch for flows that span start screen + navigation.
