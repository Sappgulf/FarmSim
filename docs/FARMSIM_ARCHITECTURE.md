# FarmSim Architecture

Status: implementation contract for the first playable vertical slice
Scope: React + Vite shell, three concept surfaces, deterministic local mock state
Inputs: `REHAUL_AUDIT.md` and `output/imagegen/farmsim-rehaul-triptych.png`

Implementation note: the first working slice uses lightweight hash navigation (`#overview`, `#planning`, `#barn`) instead of adding a router dependency. The state model and screen boundaries remain compatible with promoting those hashes to real routes when the app grows. The current state transitions live in `web/src/state.ts`, and the persisted save key is `farmsim-state-v2` with a read migration from `farmsim-state-v1`.

Current implementation map:

- `web/src/App.tsx` owns screen selection, persistence hydration, announcements, and event wiring.
- `web/src/data.ts` owns the deterministic seed, crop/inventory catalogs, production queue, and sell-order seed.
- `web/src/state.ts` owns the pure `farmReducer` and serializable action union for plot selection, planting, watering, day advancement, harvesting, production, shipping, and sell-order removal.
- `web/src/selectors.ts` owns derived plot views used by the overview and field-planning surfaces.
- `web/src/storage.ts` owns the v2 save envelope, v1 migration, queue normalization, and guarded localStorage access.
- `web/src/components/` contains the three screen surfaces and shared shell controls.

The more normalized reducer/catalog schema below remains the target architecture for the backend-ready phase. The working slice now keeps `selectedPlotIds` and a `plots: Record<number, PlotState>` map as the canonical field state; counts, crop summaries, progress, and the remaining wheat order are derived from canonical records and selectors. Shipping uses an explicit `SHIP_GOODS({ orderId, quantity })` action.

This document defines the smallest architecture that can reproduce the accepted concept direction and make the core loop playable:

> orient on the Farm Overview → decide in Field Planning → act by planting or producing → see the payoff in Barn + Market.

The workspace now contains the first implementation; the paths below describe the backend-ready target structure and migration direction rather than files that must already exist.

## 1. Product and surface boundaries

The concept image is a visual reference, not a runtime asset contract. Its shared visual language is:

- painterly 2.5D farm imagery behind crisp DOM controls;
- parchment cream surfaces with warm borders and restrained shadows;
- deep forest green for primary actions and selected navigation;
- sage, terracotta, sunflower gold, dark ink, and small sky-blue accents;
- display typography for FarmSim and section titles, with a highly readable body face for data;
- state conveyed by text, iconography, shape, and pattern in addition to color.

Use DOM for text, controls, status, and data-heavy panels. A farm illustration or map can be an image/CSS layer, but actionable plots must remain real semantic buttons above or beside it. The first screen should feel like a game surface rather than a generic dashboard: one persistent status bar, one contextual action area, and a compact navigation rail.

### The three surfaces

| URL | Surface | Primary question | Main components | Canonical state it reads/writes |
| --- | --- | --- | --- | --- |
| `/` | Farm Overview | “What should I do next?” | shared status bar, task rail, farm map, next-action callout, primary navigation | reads day/season/weather/cash, plots, animals, task selectors; navigation only |
| `/fields` | Field Planning | “Which plots should receive which crop?” | plot grid, crop picker, selection legend, planting summary, `Plant selected plots` CTA | reads plots and crop catalog; writes plot assignments and seed stock |
| `/barn?tab=barn` or `/barn?tab=market` | Barn + Market | “What is ready, what is being produced, and what can I ship?” | barn/market tabs, inventory, animal production, production queue, trends, sell orders, shipping CTA | reads inventory, animals, production jobs, market catalog; writes production jobs, inventory, cash, order status |

The Barn and Market tabs remain one concept surface and one route. The tab is URL-addressable so refresh, keyboard navigation, and back/forward behavior remain predictable without adding a fourth top-level screen.

### Shared shell contract

`AppShell` owns the visual frame shared by all three surfaces:

1. `GlobalStatusBar`: FarmSim mark, day, season, weather, and cash.
2. `ScreenOutlet`: the current route’s screen content.
3. `PrimaryNav`: Overview, Field Planning, and Barn/Market links.
4. `ToastRegion`: short action feedback announced through `aria-live`.

The status bar should preserve the concept image’s context parity across screens. It must not subscribe to the entire game object; it should receive the small scalar values it renders so unrelated changes do not re-render the whole shell.

## 2. Proposed React + Vite structure

The app should live under the existing `web/` directory once implementation begins:

```text
FarmSim/
├── REHAUL_AUDIT.md                     # existing audit
├── docs/
│   └── FARMSIM_ARCHITECTURE.md
└── web/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── navigation/
        │   ├── routes.tsx
        │   └── screenModel.ts
        ├── components/
        │   ├── shell/
        │   │   ├── AppShell.tsx
        │   │   ├── GlobalStatusBar.tsx
        │   │   ├── PrimaryNav.tsx
        │   │   └── ToastRegion.tsx
        │   ├── overview/
        │   │   ├── FarmOverviewScreen.tsx
        │   │   ├── FarmMap.tsx
        │   │   ├── TaskRail.tsx
        │   │   └── NextActionCallout.tsx
        │   ├── fields/
        │   │   ├── FieldPlanningScreen.tsx
        │   │   ├── PlotGrid.tsx
        │   │   ├── PlotCell.tsx
        │   │   ├── CropPicker.tsx
        │   │   ├── CropCard.tsx
        │   │   └── PlantingSummary.tsx
        │   ├── barn/
        │   │   ├── BarnMarketScreen.tsx
        │   │   ├── SurfaceTabs.tsx
        │   │   ├── InventoryGrid.tsx
        │   │   ├── AnimalProduction.tsx
        │   │   ├── ProductionQueue.tsx
        │   │   ├── MarketTrends.tsx
        │   │   ├── SellOrders.tsx
        │   │   └── ShipGoodsButton.tsx
        │   └── ui/
        │       ├── StatusBadge.tsx
        │       ├── ProgressBar.tsx
        │       ├── IconLabel.tsx
        │       └── VisuallyHidden.tsx
        ├── state/
        │   ├── types.ts
        │   ├── actions.ts
        │   ├── reducer.ts
        │   ├── selectors.ts
        │   ├── GameStore.tsx
        │   └── storage.ts
        ├── data/
        │   ├── mockGameState.ts
        │   ├── cropCatalog.ts
        │   ├── recipeCatalog.ts
        │   └── marketCatalog.ts
        ├── styles/
        │   ├── tokens.css
        │   ├── globals.css
        │   ├── shell.css
        │   ├── overview.css
        │   ├── fields.css
        │   └── barn.css
        ├── assets/
        │   ├── farm-overview.webp       # future generated/runtime art slot
        │   ├── crop-icons.svg           # future generated/runtime art slot
        │   └── item-icons.svg           # future generated/runtime art slot
        └── test/
            ├── fixtures.ts
            ├── reducer.test.ts
            ├── storage.test.ts
            ├── navigation.test.tsx
            └── vertical-slice.test.tsx
```

Keep components in feature folders and keep the state layer independent of visual components. Components should import directly from the module they need rather than through broad barrel files. This keeps dependency edges visible and avoids pulling unrelated feature code into the initial bundle.

Recommended ownership rules:

- `App.tsx` composes providers, the router, and the shell; it contains no gameplay rules.
- `navigation/` maps URLs to screens and query parameters to the Barn/Market tab.
- `components/` owns layout, interaction semantics, and visual presentation.
- `state/reducer.ts` is the only place that applies gameplay mutations.
- `state/selectors.ts` turns canonical state into view models such as task rows and progress values.
- `data/` contains static catalogs and the deterministic seed; catalog definitions are not duplicated in save data.
- `storage.ts` is the only module that knows the localStorage key and save envelope.
- `styles/tokens.css` contains the palette, spacing, radii, focus ring, typography, and motion variables used by all screens.

## 3. Typed local game state

Use TypeScript discriminated unions and integer currency values. Money is stored as cents, never floating-point dollars, so shipping calculations are deterministic.

```ts
type ScreenId = 'overview' | 'field-planning' | 'barn-market';
type BarnTab = 'barn' | 'market';
type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type Weather = 'sunny' | 'cloudy' | 'rainy';
type MoneyCents = number;

type CropId = 'wheat' | 'tomato' | 'corn';
type ItemId =
  | 'egg'
  | 'milk'
  | 'grain'
  | 'wool'
  | 'wheat'
  | 'cheese'
  | 'bread'
  | 'butter';
type PlotId = `plot-${number}`;
type RecipeId = 'cheese' | 'bread' | 'butter';

type PlotAvailability = 'available' | 'unavailable';

interface PlotState {
  id: PlotId;
  row: number;
  column: number;
  availability: PlotAvailability;
  cropId?: CropId;
  plantedDay?: number;
  watered: boolean;
}

interface AnimalGroup {
  id: 'chickens' | 'cows';
  count: number;
  capacity: number;
  productId: 'egg' | 'milk';
  nextReadyAtTick: number;
}

type ProductionStatus = 'queued' | 'in-progress' | 'ready';

interface ProductionJob {
  id: string;
  recipeId: RecipeId;
  status: ProductionStatus;
  quantity: number;
  completedQuantity: number;
  startedAtTick?: number;
  readyAtTick?: number;
}

interface SellOrder {
  id: string;
  itemId: ItemId;
  quantity: number;
  unitPriceCents: MoneyCents;
  status: 'open' | 'shipped';
}

interface FarmState {
  day: number;
  season: Season;
  weather: Weather;
  tick: number;
  cashCents: MoneyCents;
  seedStock: Record<CropId, number>;
  plots: Record<PlotId, PlotState>;
  animals: Record<AnimalGroup['id'], AnimalGroup>;
  inventory: Partial<Record<ItemId, number>>;
  productionQueue: ProductionJob[];
  sellOrders: Record<string, SellOrder>;
}

interface UiState {
  fieldDraft: {
    selectedPlotIds: PlotId[];
    cropId: CropId;
  };
  barnTab: BarnTab;
  announcement: string | null;
}

interface GameState {
  farm: FarmState;
  ui: UiState;
}
```

`FarmState` is the canonical gameplay state. `UiState` is transient interaction state: a field selection draft, the active Barn/Market tab, and the latest screen-reader announcement. Do not store task rows, progress percentages, market trend labels, crop display names, or formatted currency in the reducer. Those are derived from state and static catalogs.

### Deterministic seed

`data/mockGameState.ts` should export one `createInitialGameState()` function with no random values and no wall-clock reads. The seed should visually match the concept board while remaining small:

| Data | Seed |
| --- | --- |
| Context | day 12, Spring, sunny, `$2,430` (`243000` cents) |
| Field grid | 25 plots: 8 already planted, 12 available, 5 unavailable; the 12 available plots are preselected in the field draft |
| Existing crops | a small mix of wheat and tomato; 8 planted crops are watered so the overview can show `Water 12 crops · 8/12` |
| Seeds | wheat 12, tomato 8, corn 8 |
| Animals | chickens 6/12, cows 3/6 |
| Inventory | eggs 36, milk 18, grain 120, wool 15, wheat 60; processed goods start at zero |
| Production queue | cheese in progress at 2/3, bread in progress at 1/2, butter queued |
| Sell orders | wheat 60 at `$2.20` each, eggs 24 at `$4.50` each, milk 12 at `$6.20` each |
| Market trends | wheat +12%, eggs +8%, milk -5%, corn +15% |

The `data/` catalogs should hold display metadata and formulas:

- crop: display name, icon key, season fit, growth days, water need, base return, seed item/quantity;
- recipe: input item stacks, output item, duration in ticks, machine label;
- market: trend direction, percentage change, display price, and whether an order is currently open.

The catalog is static and can later be replaced by an API response without changing screen component contracts. Save files should retain IDs and quantities, not copied catalog objects.

## 4. Navigation model

Use `react-router-dom` with three top-level routes. URL state is the source of truth for the current surface; do not duplicate the route in `GameState`.

```tsx
<Routes>
  <Route path="/" element={<FarmOverviewScreen />} />
  <Route path="/fields" element={<FieldPlanningScreen />} />
  <Route path="/barn" element={<BarnMarketScreen />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

`BarnMarketScreen` reads `?tab=barn|market` and defaults to `barn` when the parameter is absent or invalid. `PrimaryNav` uses links, not click handlers that mutate a local `activeScreen` boolean. The result is deep-linkable, refresh-safe, and keyboard-friendly.

The route screen should select the minimum view model it needs:

```text
location.pathname
  ├── /             → selectOverviewViewModel(farm)
  ├── /fields       → selectFieldPlanningViewModel(farm, ui.fieldDraft)
  └── /barn         → selectBarnMarketViewModel(farm, tab)
```

The three surfaces share the status bar and primary navigation but do not share a giant page-level data object. This keeps re-render scope local and makes each screen testable with a focused fixture.

## 5. State transitions

Actions are plain discriminated unions. Reducer actions must be synchronous, pure, and atomic: validation happens before any part of the state is changed. A rejected action returns the same `farm` reference and sets a short user-facing announcement in `ui`.

### Field planning and planting

1. `TOGGLE_PLOT_SELECTION({ plotId })`
   - Accept only an available, unplanted plot.
   - Add/remove the ID from `ui.fieldDraft.selectedPlotIds`.
   - Keep selection order stable so the summary and tests are deterministic.
   - Do not mutate `farm.plots` yet; selection is a reversible planning draft.

2. `SELECT_CROP({ cropId })`
   - Accept only a crop in the static catalog.
   - Replace the draft crop without changing canonical farm data.

3. `PLANT_SELECTED_PLOTS`
   - Guard: at least one plot selected; all selected plots are still available; the crop has enough seed stock.
   - Transaction: assign `cropId`, `plantedDay: farm.day`, and `watered: false` to every selected plot; subtract one seed per plot; clear the draft selection.
   - Announcement: `Planted 12 wheat plots.`
   - The overview task selector then derives the new plant progress from the plots and seed action; no separate task counter is needed.

4. `WATER_PLOT({ plotId })` can be included as the smallest follow-up interaction for the overview task. It only flips `watered` from false to true for an already planted plot and is idempotent.

### Production

1. `START_PRODUCTION({ recipeId })`
   - Guard: recipe exists, required inputs are in inventory, and the small mock machine capacity is available.
   - Transaction: subtract input items and append a `queued` or `in-progress` job with a deterministic `readyAtTick`.
   - The queue displays `queued`, `in-progress`, or `ready` as text plus a progress bar.

2. `ADVANCE_TIME({ ticks })`
   - The first slice uses an explicit deterministic action rather than real-time timers.
   - Increment `farm.tick`; move jobs whose `readyAtTick` has been reached to `ready`; update animal readiness using the same tick value.
   - This makes reducer tests repeatable and leaves a clean seam for a later clock/service.

3. `COLLECT_PRODUCTION({ jobId })`
   - Guard: the job is `ready`.
   - Add the recipe output quantity to inventory and remove the completed job (or mark it collected if the UI needs a history row).
   - A second collect on the same ID must be a no-op with no duplicate goods.

### Shipping

1. `SHIP_ORDER({ orderId })`
   - Guard: order is `open` and inventory contains the requested quantity.
   - Transaction: subtract ordered goods, add `quantity × unitPriceCents` to `cashCents`, and mark the order `shipped`.
   - Announcement: `Shipped 60 wheat for $132.00.`

2. The concept’s single `Ship goods` CTA may dispatch `SHIP_READY_ORDERS`, which evaluates open orders in stable catalog order and applies them as one atomic transaction. Per-order controls should still use `SHIP_ORDER` so a player can make a smaller decision.

Derived overview tasks should include at least:

- water 12 crops: `watered planted plots / 12`;
- plant 12 wheat: wheat plots planted by the current daily objective / 12;
- collect eggs: ready egg output / target;
- ship 5 goods: goods shipped during the current objective / 5.

The task selector must cap display progress at the target and mark completion from canonical state. It should not become another mutable source of truth.

### State invariants

- `cashCents` and all inventory/seed quantities are never negative.
- An unavailable plot cannot be selected or planted.
- A planted plot cannot be planted again in the first slice.
- A shipped order cannot ship twice.
- A production job moves forward only: queued → in-progress → ready → collected/removed.
- Every reducer action either commits a complete valid transition or leaves `farm` unchanged.
- Currency arithmetic uses integer cents.
- Catalog IDs in state must be known to the corresponding static catalog.

## 6. localStorage persistence

Use a versioned, minimal save envelope. The React localStorage guidance is especially relevant here: version the schema, cache the storage read during initialization, and keep derived/UI-only values out of the serialized payload.

```ts
const STORAGE_KEY = 'farmsim.save.v2';

interface PersistedEnvelopeV2 {
  schemaVersion: 2;
  farm: FarmState;
}
```

Rules:

1. `web/src/storage.ts` is the only module that calls `localStorage`.
2. `GameStore` uses a lazy initializer: read once, parse once, validate once, and fall back to `createInitialGameState()` when storage is absent, malformed, or from an unsupported version.
3. Persist only `farm` plus the envelope metadata. Do not persist `ui.fieldDraft`, toasts, formatted strings, task arrays, or catalog data. A refresh should restore the farm, then start on the current route with a clean draft.
4. After a successful farm-state reducer change, serialize the new envelope in one effect. The state is small enough for synchronous localStorage; no network or worker is needed in the first slice.
5. Save writes should be guarded for private-mode/storage failures. Keep the in-memory state working and announce `Progress could not be saved on this device.` without crashing the app.
6. Add `migrateSave(raw)` as a pure function even while only version 1 exists. Future migrations can transform old envelopes before validation.
7. Tests should inject a `Storage` implementation or mock `window.localStorage`, reset it between cases, and verify that malformed saves fall back safely.

Do not use a wall-clock interval for gameplay state. `ADVANCE_TIME` is explicit and deterministic; `savedAt` is metadata only and must never change crop growth or production outcomes.

## 7. Accessibility and responsive behavior

### Accessibility contract

- Use `<header>`, `<nav aria-label="Primary">`, `<main>`, `<section>`, and real headings for the shell and all three screens.
- Add a skip link to the main content and keep a visible `:focus-visible` ring in sunflower gold or forest green with sufficient contrast.
- Render every plot as a `<button>` with a stable accessible name such as `Plot 7, available, selected for wheat`. Use `aria-pressed` for selection and `aria-disabled` for unavailable plots; never rely on green/brown alone.
- Treat the crop picker as a radio group. Crop cards expose season fit, growth time, water need, and projected return as readable text, not icon-only hints.
- Announce planting, production, collection, shipping, validation failures, and save failures in a polite `aria-live="polite"` region. Keep announcements short and do not move focus for routine actions.
- Use visible labels for money, quantities, progress, and statuses. A progress bar must have a text equivalent such as `2 of 3 units ready`.
- The Barn/Market tabs use `role="tablist"`, `role="tab"`, and `aria-selected`, or native buttons with equivalent semantics. The active tab must be apparent without color.
- Keep interaction reachable with keyboard alone: route links, plot cells, crop cards, production controls, order buttons, and primary CTAs all participate in normal tab order.
- Respect `prefers-reduced-motion: reduce`: remove decorative map drift, button bounce, and panel transitions while preserving instant state-change feedback.

### Responsive contract

The concept image is a dense desktop triptych, but the implementation should reflow instead of scaling the entire board down.

| Viewport | Layout behavior |
| --- | --- |
| desktop | status bar across the top; screen-specific two/three-column content; task rail or secondary panels stay compact; primary nav is a bottom/edge rail as in the concept |
| tablet | collapse secondary columns below the main map/grid; keep the next action and primary CTA visible without opening drawers |
| mobile | wrap the status bar into compact chips; stack content; expose tasks and market trends as collapsible sections; use a safe-area-aware bottom nav; keep the field grid tappable without making each cell too small |

Surface-specific rules:

- Overview: map and next action remain first; the task rail can become a disclosure panel on narrow screens.
- Field Planning: plot grid remains the first focus target; crop cards move below it; the plant CTA becomes sticky only after the user has selected a crop and at least one plot.
- Barn + Market: inventory cards become a two-column or horizontal-scroll list; animal production and queue stack; trends and sell orders move below the primary barn content; the ship CTA remains reachable after the order list.

Use CSS variables for palette, spacing, borders, radii, type scale, focus ring, and motion duration. Keep the playfield/map visible and avoid covering the center with a permanent modal or oversized panel. Use `content-visibility` only for genuinely long future lists; the seeded slice is small and should favor simple rendering.

## 8. First playable vertical-slice test matrix

The test suite should be layered: pure reducer/catalog tests for rules, React Testing Library tests for semantics and view wiring, and one browser-level flow for refresh and responsive behavior.

| ID | Area | Test type | Setup/action | Expected result |
| --- | --- | --- | --- | --- |
| VS-01 | Seed | reducer/unit | create initial state | day 12, Spring, sunny, 243000 cents, 25 plots, seeded queue/orders, and 12 preselected available plots are stable |
| VS-02 | Shared shell | component | render `/` | status bar shows day/season/weather/cash; Overview is selected; main heading and next action are present |
| VS-03 | Navigation | integration | activate Field Planning, then Barn and Market links | URL changes to `/fields` and `/barn?tab=market`; shared status context remains visible; browser back returns to the previous surface |
| VS-04 | Plot semantics | component/a11y | tab to plot grid; activate an available plot; attempt unavailable plot | available plot toggles `aria-pressed` and selected count; unavailable plot cannot be selected and exposes its disabled reason |
| VS-05 | Crop choice | component | choose Wheat, then Tomato | crop radio selection changes; crop card metrics and planting summary update; only one crop is selected |
| VS-06 | Planting success | reducer/integration | select 12 available plots, choose Wheat, dispatch `PLANT_SELECTED_PLOTS` | 12 plots become planted wheat, wheat seed stock decreases by 12, draft selection clears, and an announcement is emitted |
| VS-07 | Planting guards | reducer | dispatch with no plots, insufficient seeds, or a blocked/planted plot | no partial mutation; CTA is disabled or an inline error is announced |
| VS-08 | Overview payoff | integration | complete VS-06 and navigate to `/` | the next task/task rail reflects planting progress and the farm map shows the new planted state |
| VS-09 | Production | reducer/integration | start a valid recipe; advance deterministic time; collect ready output | ingredients are consumed once, job progresses queued → in-progress → ready, collection adds output, and a second collection does nothing |
| VS-10 | Shipping | reducer/integration | ship an open wheat order | wheat inventory decreases by order quantity, cash increases by exact cents, order becomes shipped, and the same order cannot ship twice |
| VS-11 | Shipping guards | reducer | ship with insufficient inventory or an already shipped order | no cash/inventory/order mutation; user gets a readable failure message |
| VS-12 | Persistence | browser/integration | plant or ship, reload the page | canonical farm changes survive refresh; transient field selection/toast does not; route remains deep-linkable |
| VS-13 | Corrupt save | storage/unit | seed malformed JSON or unsupported schema version | app falls back to deterministic initial state without throwing; save failure is contained |
| VS-14 | Keyboard flow | component/manual a11y | complete overview → fields → select plot/crop → plant → barn → ship using keyboard only | focus is visible, controls are reachable in logical order, action feedback is announced, and no pointer-only step is required |
| VS-15 | Responsive layout | Playwright/manual | run at desktop, tablet, and narrow mobile widths | no horizontal page overflow; map/grid and primary CTA remain usable; panels stack according to the responsive contract |
| VS-16 | Reduced motion | browser/manual | enable `prefers-reduced-motion` | decorative transitions are disabled while status and state changes remain understandable |

The first implementation is ready for broader content only when VS-01 through VS-12 pass. VS-13 through VS-16 are release gates for a usable vertical slice, not optional polish: the audit explicitly calls out refresh persistence, narrow layouts, keyboard-visible focus, and the absence of runtime/accessibility verification in the current blank workspace.

## 9. Implementation order

1. Scaffold the Vite + React + TypeScript shell in `web/`, add tokens, and mount the router/store.
2. Add catalogs and the deterministic seed; write reducer and storage tests before building visual detail.
3. Build `AppShell`, status bar, and navigation so all three surfaces have context parity.
4. Implement Overview with derived tasks and a farm-map placeholder/asset slot.
5. Implement Field Planning and the planting transaction, then wire the overview payoff.
6. Implement Barn + Market, production actions, sell orders, and shipping.
7. Add keyboard, responsive, reduced-motion, persistence, and browser-flow coverage from the matrix.
8. Only after behavior is stable, replace asset slots with generated art/icons and tune painterly surface styling against the accepted concept image.

This ordering keeps the architecture compatible with future art generation while ensuring that assets never become the source of gameplay truth.
