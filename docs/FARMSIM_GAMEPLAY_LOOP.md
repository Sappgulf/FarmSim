# FarmSim Gameplay Loop

Status: implemented local gameplay milestone and backend seam contract
Scope: deterministic local loop for the existing React/Vite shell and visual direction
Related: `docs/FARMSIM_ARCHITECTURE.md`, `docs/FARMSIM_VISUAL_SPEC.md`

## Milestone outcome

The player can complete one reliable farm day:

```text
select fields -> plant -> water -> advance day -> grow -> harvest
-> start production -> collect -> ship goods
```

The same initial save and the same ordered actions must always produce the same final state. No reducer action may read the wall clock, use random values, or depend on network response order.

## Deterministic loop contract

| Stage | Action | State transition | User-visible feedback |
| --- | --- | --- | --- |
| Field selection | `SELECT_PLOTS` | Update `ui.fieldDraft.selectedPlotIds`; exclude unavailable, planted, or harvested-in-progress plots. | Selected count, sage plot fill, gold outline, and a live summary such as `12 plots selected`. |
| Planting | `PLANT_SELECTED_PLOTS` | Assign one `cropId` to each selected plot, set `plantedAtTick`, reset `growthDays` to `0`, set `watered` false, consume seed stock, then clear the draft selection. | `12 plots planted with wheat.` The task rail changes from the planting task to watering. |
| Watering | `WATER_PLOTS` | Mark eligible planted plots as watered for the current day. The action is idempotent and cannot water unavailable, empty, mature, or already-watered plots. | Water icon/progress updates; `12 crops watered.` or a precise validation message. |
| Advance day | `ADVANCE_DAY` | Increment `day` and `tick`; resolve crop growth and production progress; assign the next deterministic weather value; reset daily watering flags after resolution. This is the only action that advances time. | Header moves to the next day and announces the result, for example `Day 13 - Spring. 12 crops grew.` |
| Growth | `RESOLVE_GROWTH` | For each planted plot, add one `growthDays` only when the plot was watered. Set `readyToHarvest` when `growthDays >= crop.growthDays`. Unwatered plots remain planted and do not gain growth for that day. | Plot art/status changes from planted to ready; task rail shows harvest work when applicable. |
| Harvest | `HARVEST_PLOTS` | Accept ready plots only, add the catalog yield to inventory, clear the crop assignment, and return the plot to available state. A harvested plot cannot yield twice. | `12 wheat harvested - +12 wheat added to inventory.` Ready plots clear from the field and inventory totals update in Barn. |
| Production queue | `START_PRODUCTION` | Validate recipe inputs and queue capacity, subtract inputs immediately, and append a job with `startedAtTick`, `readyAtTick`, quantity, and output metadata by ID. | Queue row appears with a progress bar and a clear shortage message when inputs are missing. |
| Collect | `COLLECT_PRODUCTION` | Accept ready jobs only, add completed output to inventory, then remove or mark the job collected. Collection is one-time and cannot duplicate output. | `Collected 3 cheese.` Queue row becomes empty or advances to the next job. |
| Shipping | `SHIP_GOODS({ orderId, quantity })` | Validate an open sell order, remaining order quantity, and available inventory; subtract inventory, add the order's local-slice `payoutPerUnit × quantity` to cash, and decrement/remove the order atomically. | `Shipment sent - +$110 added to the farm ledger.` Cash, inventory, task progress, and remaining order quantity update together. |

The current Ship goods button dispatches the default wheat order with an explicit order ID and quantity. The UI can add per-order controls without another state migration; the backend-ready currency normalization can replace `payoutPerUnit` with integer cents later.

## Canonical state

`FarmState` is authoritative gameplay state. `UiState` is transient screen state. Labels, progress percentages, formatted money, task rows, and market display copy are derived values, not saved fields.

```ts
type FarmState = {
  day: number
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  weather: 'sunny' | 'cloudy' | 'rainy'
  tick: number
  cashCents: number
  seedStock: Record<CropId, number>
  plots: Record<PlotId, PlotState>
  inventory: Partial<Record<ItemId, number>>
  productionQueue: ProductionJob[]
  sellOrders: Record<string, SellOrder>
}

type PlotState = {
  id: PlotId
  row: number
  column: number
  availability: 'available' | 'unavailable'
  cropId: CropId | null
  plantedAtTick: number | null
  growthDays: number
  watered: boolean
  readyToHarvest: boolean
}

type ProductionJob = {
  id: string
  recipeId: RecipeId
  status: 'queued' | 'in-progress' | 'ready'
  quantity: number
  completedQuantity: number
  startedAtTick: number | null
  readyAtTick: number | null
}

type SellOrder = {
  id: string
  itemId: ItemId
  quantity: number
  unitPriceCents: number
  status: 'open' | 'shipped'
}

type UiState = {
  fieldDraft: { selectedPlotIds: PlotId[]; cropId: CropId }
  barnTab: 'barn' | 'market'
  announcement: string | null
}
```

Current-slice mappings:

- `selectedPlotIds` -> the current field selection draft
- `plots: Record<number, PlotState>` -> canonical per-plot crop, watering, growth, and ready state
- `plantedPlotIds`, `wateredPlotIds`, `readyPlotIds`, and `plantedCrop` -> selectors over `plots`
- `money` -> the current local slice's numeric ledger value; cents conversion remains a backend-ready follow-up
- `ProductionItem.recipe/phase/progress/status/remaining` -> the current deterministic production queue model
- `shipWheat(state, quantity)` -> `SHIP_GOODS({ sellOrderId, quantity })`
- `localStorage` key `farmsim-state-v2` -> reads and migrates legacy `farmsim-state-v1` records

## Action invariants

- All quantities are non-negative integers. Inventory, seeds, and cash may never become negative.
- A plot can have at most one crop assignment. Planting and harvesting are not repeatable on the same state.
- A crop grows at most once per `ADVANCE_DAY`; watering does not stack.
- `ADVANCE_DAY` is deterministic from `tick`, catalogs, and saved state. Weather must come from a fixed sequence or seeded rule, never `Math.random()`.
- Production inputs are reserved when a job starts. Outputs enter inventory only on `COLLECT_PRODUCTION`.
- A ready production job can be collected once. A shipped order cannot be shipped again.
- Rejected actions return the unchanged game state plus a user-facing reason through the existing `aria-live` toast region.
- Reducer transitions remain pure; persistence, navigation hashes, and visual components stay outside the gameplay rules.

## Visual and feedback contract

Keep the accepted FarmSim direction while adding mechanics:

- Use DOM buttons and text for every action, status, quantity, and validation message; painterly art remains presentation only.
- Preserve the parchment shell, forest-green primary actions, sage progress/selection, sunflower-gold emphasis, and terracotta warning/negative states.
- Keep the Overview task rail as the daily summary and route task clicks to Field Planning or Barn + Market.
- Use the existing `role="status"` / `aria-live="polite"` toast region for action results; do not communicate state through color alone.
- Show the same state in multiple surfaces: planted/growing/ready plots in Field Planning, inventory and queue output in Barn, and cash/order results in Market.

## Backend-ready migration seams

1. **Reducer boundary:** keep extending the discriminated `FarmAction` union toward the backend-ready `GameAction` contract.
2. **Save envelope:** replace the current flat v2 farm payload with `{ version, farm, ui? }`; migrate dollars to cents and array-based order data to ID-keyed records.
3. **Catalog boundary:** keep crop, recipe, item, and market metadata outside save data. Save IDs and quantities so catalogs can later come from an API.
4. **Tick resolver:** isolate `resolveGrowth`, `resolveProduction`, and deterministic weather selection behind a tick function that can run locally now and server-side later.
5. **Command transport:** keep UI actions serializable (`action`, IDs, quantities, client command ID). The current `SHIP_GOODS` action is the first order-aware command a backend can validate and replay without changing screen contracts.
6. **Selectors:** derive task rows, progress, formatted money, queue labels, and market totals in selectors so server state can replace local state without changing the visual components.
7. **Idempotency and conflict handling:** use action IDs and server-authoritative ticks before enabling multi-device saves, offline replay, or concurrent shipping.

## Acceptance checks for the milestone

- A seeded farm can complete the loop from plot selection through shipping without manual state edits.
- Replaying the same action list from the same seed produces identical serialized `FarmState`.
- Refreshing after each stage preserves the canonical state and does not duplicate planting, harvest, production output, or cash.
- Invalid actions leave state unchanged and produce a concise visible announcement.
- The existing Overview, Field Planning, and Barn + Market surfaces remain visually coherent at desktop and mobile widths.
