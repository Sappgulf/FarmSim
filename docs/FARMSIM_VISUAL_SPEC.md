# FarmSim Visual Spec

Status: implementation handoff
Reference: /Users/austinbeatty/Downloads/FarmSim/output/imagegen/farmsim-rehaul-triptych.png
Reference size: 1,823 × 863 px
Audit source: /Users/austinbeatty/Downloads/FarmSim/REHAUL_AUDIT.md

## Scope and reading of the reference

The accepted image is a three-state concept board, not a single in-game triptych. It shows three connected product surfaces:

1. Farm Overview
2. Field Planning
3. Barn + Market

The audit found no existing application source, package manifest, design system, or established asset library. This document is therefore the visual implementation contract for the first build, not a comparison against a pre-existing UI.

The runtime workspace contains optimized WebP assets under `web/public/assets/`; source PNGs and the concept board are preserved under `output/imagegen/`:

- farm-overview.webp — optimized painterly farm scene used by the Overview background.
- field-planning.webp — optimized dedicated fenced field canvas used by Field Planning.
- farm-assets-sheet-alpha.webp — optimized alpha-cleaned item/animal/product sheet used by the sprite component.
- `output/imagegen/farmsim-assets-sheet-source.png` — source RGB sheet retained for provenance; do not use it directly because its checkerboard is baked into the pixels.
- `output/imagegen/farmsim-rehaul-triptych.png` — concept board reference; do not ship it as application UI.

The visual language is a painterly 2.5D farm scene beneath crisp, warm-paper UI chrome. The shared daily loop is visible in the order of the screens: orient from the overview, decide in field planning, then act and see the payoff through inventory, production, and shipping.

## Shared shell and container model

Each surface uses the same shell:

- A rounded screen frame with a thin warm-gold outline.
- A parchment status header at the top.
- A state-specific content area below the header.
- A bottom navigation rail inside the frame.
- Warm paper panels layered over the scene or content canvas.

The concept board places three frames side by side with generous outer parchment around them. The product should implement each state as a responsive app surface; do not render the board as one production screen.

### Global shell anatomy

| Area | Reference treatment | Implementation rule |
| --- | --- | --- |
| Screen frame | Warm parchment edge, 1 px ochre border, 16–18 px radius | Clip the entire surface, including map art, to the frame radius |
| Status header | Approximately 62–66 px tall, flat paper surface | Keep brand, day, season, cash, and weather in the same order on every screen |
| Content canvas | Full-width below the header | Overview uses a full-bleed scene; the other screens use structured paper panels |
| Bottom navigation | Approximately 80–92 px tall, floating/inset paper rail | Keep it inside the app frame and visible as a persistent orientation anchor |
| Outer board gutter | Approximately 16 px between frames and 30 px at the board edge | Use 16 px as the desktop inter-screen rhythm when showing multiple states |

The status header order is:

FARMSIM logo → Day 12 → Spring → $2,430 → sun/weather icon.

## Color tokens

The source image has visible paper grain and painterly variation, so these are implementation approximations rather than single sampled pixels. Preserve the relationships: warm parchment background, dark brown ink, forest-green action states, sage selection, sunflower gold emphasis, and small terracotta/sky accents.

| Token | Approx. hex | Role |
| --- | --- | --- |
| Canvas parchment | #FEFAEC | Board/background around the frames |
| Paper surface | #FBF0D8 | Header, nav rail, primary cards |
| Raised paper | #FEF8E8 | Inner cards and data panels |
| Paper highlight | #FFF9EB | Active/inset card interiors and light text areas |
| Warm border | #D6B978 | Frame, card, chip, divider, and legend borders |
| Border shadow | #A78852 | Low-contrast edge definition around raised paper |
| Primary ink | #332C1D | Headings, labels, values, and icon strokes |
| Muted ink | #756449 | Secondary copy, metadata, and dividers |
| Forest action | #3C582E | Primary buttons, selected tab, selected nav item |
| Deep forest | #294523 | Button text contrast and darkest green accents |
| Sage selection | #8FA45E | Selected plot fill, progress fill, positive status accents |
| Sage pale | #E4EBC7 | Selected/available background tint |
| Sunflower gold | #F1C65B | Active task, selected plot outline, sun icon |
| Gold highlight | #FCE8B4 | Tooltip/callout fill and selected task background |
| Soil brown | #77512F | Available soil tile and earth accents |
| Terracotta | #B85C38 | Tomato, warning/negative trend, warm illustration accents |
| Sky accent | #4D7C9E | Water indicators and small environmental accents |
| Unavailable gray-brown | #716C5B | Unavailable soil tile and disabled state |
| Ready green | #5D7E3C | Ready/progress/positive state when distinct from primary green |

Avoid a cool white reset, gray SaaS surfaces, neon green, or a full-screen green overlay. The accepted background is warm cream/parchment, not true white and not a dark theme.

## Typography

The concept uses a high-contrast, old-style display face for the brand and headings, with readable serif or humanist text for data. The exact raster font is not guaranteed; match its silhouette and contrast rather than introducing a generic browser default.

Recommended stack:

- Display/brand: Fraunces, then Georgia, then Times New Roman, serif.
- Dense UI/data: Nunito Sans or Source Sans 3, then system-ui, sans-serif.
- Single-family fallback when font loading is unavailable: Georgia, serif, with deliberate size and line-height adjustments.

| Role | Size / line-height | Weight and treatment |
| --- | --- | --- |
| FARMSIM wordmark | 34–38 px / 0.95 | Bold high-contrast serif, all caps, slightly condensed; leaf mark sits to the right |
| Screen title | 25–28 px / 1.05 | Semibold display serif; Field Planning is the reference |
| Section title | 17–20 px / 1.1 | Semibold display serif; Tasks, Inventory, Market Trends |
| Card title | 15–18 px / 1.1 | Semibold display serif; Wheat, Tomato, Corn, Eggs |
| Body and row label | 12–14 px / 1.3 | Regular readable serif or humanist sans |
| Metric/value | 15–18 px / 1.1 | Semibold; forest green for projected return/positive values |
| Header chip | 12–14 px / 1.0 | Medium/semibold; keep icon and label optically centered |
| Caption/meta | 10–12 px / 1.2 | Regular; muted ink, never below 10 px at the reference width |
| Button label | 14–16 px / 1.0 | Semibold display serif or matching control face |

Use normal sentence case everywhere except the FARMSIM wordmark. Do not add eyebrow labels, marketing copy, or new badges. The only visible badge-like element in the reference is Best fit on the Wheat card.

## Spacing, radii, and elevation

Use a 4 px base unit with the following working scale:

- 4 px: icon-to-label micro gap, divider inset.
- 8 px: chip padding, row gap, small card padding.
- 12 px: standard card gap and inner panel padding.
- 16 px: screen gutter, column gap, nav item padding.
- 20 px: major panel inset and title-to-content spacing.
- 24 px: section separation.
- 32 px: board edge or major scene breathing room.

Geometry:

- Screen frame radius: 16–18 px.
- Large panel/card radius: 10–12 px.
- Chips and small controls: 7–9 px.
- Primary buttons: 10–12 px.
- Circular icon containers: 50% radius.
- Standard border: 1 px warm border; use 2 px only for selected plot/task emphasis.
- Selected plot outline: 2–3 px sunflower gold with a soft outer glow.

Elevation is restrained:

- Raised paper panel: 0 2px 7px rgba(87, 65, 28, 0.12).
- Primary CTA/tooltip: 0 3px 10px rgba(87, 65, 28, 0.16).
- Selected plot: warm-gold outline and subtle glow, not a dark drop shadow.
- Avoid floating glass, blur, or high-contrast black shadows.

## Screen anatomy

### 1. Farm Overview

**Purpose:** orient the player and make the next action obvious.

**Composition**

- Header spans the frame above the scene.
- Painterly farm map fills the content canvas edge to edge.
- A Tasks panel sits in the upper-left over the map, with four stacked task rows.
- The active plot is outlined in gold near the lower center-right of the map.
- A cream callout is anchored to that plot and points to the next action.
- The bottom rail overlays the lower scene without hiding the primary map landmarks.

**Task panel**

- Title: Tasks.
- Four rows use a left-side illustrated glyph, a task label, and a progress value.
- Completed state is communicated by the green check on Collect eggs.
- Active state is a pale gold row with a gold edge and a right-pointing action marker.
- View all tasks is a separate lower row with a right chevron.

**Map content**

Keep the scene readable and painterly: red barn, silo, windmill, orchard/trees, fenced crop plots, dirt paths, pond with dock/bridge, mailbox, rocks, flowers, and small farm props. The selected plot and callout are UI overlays; they must remain crisp above the scene.

**Callout**

- Small heading: Next Up.
- Action line: Plant 12 Wheat.
- Warm gold/cream fill, dark ink text, wheat glyph, rounded corners, pointed speech-tail toward the selected plot.

**Bottom navigation**

Six equal items: Build, Crops, Animals, Inventory, Map, Journal.

### 2. Field Planning

**Purpose:** let the player select plots, compare crop tradeoffs, and commit one planting action.

**Composition**

- Header remains identical to the Overview shell.
- A back-arrow control and title row sit below the header.
- Subtitle sits directly under the title.
- Main content is a two-column layout: plot canvas on the left, crop chooser on the right.
- The plot canvas uses a fenced farm patch and a clear grid of soil squares.
- Crop cards stack vertically in the right column.
- The Plant 12 plots CTA is the final element in the crop chooser.
- A four-item utility rail sits at the bottom.

**Plot canvas**

- Selected plots use pale sage fill and a green/sage sprout marker.
- Available plots use brown soil tile treatment.
- Unavailable plots use gray-brown tile treatment.
- The legend sits below the canvas: Selected (12), Available, Unavailable.
- The grid must be selectable by keyboard and pointer; selection state cannot rely on color alone.

**Crop chooser**

- Heading: Choose a crop.
- Order is Wheat, Tomato, Corn.
- Wheat is selected and has the Best fit badge plus a green outline/check state.
- Each card includes a crop illustration, crop name, and four comparison rows.
- Comparison rows pair a label with a compact semantic icon and value.
- The CTA is a full-width forest-green button with a small leaf icon.

**Bottom navigation**

Four equal items: Overview, Field Planning, Soil Info, Crop Guide.

### 3. Barn + Market

**Purpose:** combine production awareness with inventory, market context, and shipping.

**Composition**

- Header remains identical to the other screens.
- A two-tab switcher sits below the header: Barn selected in forest green, Market unselected on paper.
- Main content is two columns: a wide left stack and a narrow right rail.
- Left stack order: Inventory, Animal Production, Production Queue.
- Right rail order: Market Trends, Sell Orders.
- Ship goods is a strong forest-green CTA anchored above the bottom rail toward the lower-right.
- A five-item bottom rail remains visible.

**Inventory**

- Heading: Inventory.
- Four compact item cards in one row at the reference width: Eggs, Milk, Grain, Wool.
- Each card has a large illustrated item, item name, quantity, and unit price.
- Preserve the paper-card geometry and small vertical rhythm; do not convert this into a generic statistic grid with charts.

**Animal Production**

- Heading: Animal Production.
- Rows: Chickens and Cows.
- Each row contains animal illustration, capacity value, sage progress bar, and next-production time.

**Production Queue**

- Heading: Production Queue.
- Rows: Cheese, Bread, Butter.
- Each row contains product illustration/name, count, progress bar, state/time, and a compact cancel X.
- Butter is Queued; Cheese and Bread show ready-in timing.

**Market Trends**

- Heading: Market Trends.
- Small green line chart with circular points.
- Four rows: Wheat, Eggs, Milk, Corn.
- Each row has an item glyph, a market descriptor, and an up/down percentage signal.

**Sell Orders**

- Heading: Sell Orders.
- Rows: Wheat, Eggs, Milk.
- Each row has item glyph, quantity, price per unit, and a small trash/delete action.

**Bottom navigation**

Five equal items: Overview, Animals, Production, Storage, Market. Market uses the selected forest-green treatment in the reference.

## Exact visible copy ledger

Preserve spelling, capitalization, spacing, and punctuation from this list. Icons such as checks, arrows, chevrons, and X controls are not copy and should be implemented as icons.

### Shared header

- FARMSIM
- Day 12
- Spring
- $2,430

### Farm Overview

- Tasks
- Water 12 crops
- 8 / 12
- Collect eggs
- 6 / 6
- Plant 12 Wheat
- 0 / 12
- Ship 5 goods
- 0 / 5
- View all tasks
- Next Up
- Plant 12 Wheat
- Build
- Crops
- Animals
- Inventory
- Map
- Journal

### Field Planning

- Field Planning
- Select plots and choose a crop to plant.
- Choose a crop
- Wheat
- Best fit
- Season Fit
- Great
- Growth Time
- 4 days
- Water Need
- Low
- Projected Return
- $480
- Tomato
- Good
- 6 days
- Medium
- $720
- Corn
- Okay
- 5 days
- High
- $660
- Selected (12)
- Available
- Unavailable
- Plant 12 plots
- Overview
- Field Planning
- Soil Info
- Crop Guide

### Barn + Market

- Barn
- Market
- Inventory
- Eggs
- 36
- $4 each
- Milk
- 18
- $6 each
- Grain
- 120
- $2 each
- Wool
- 15
- $5 each
- Animal Production
- Chickens
- 6 / 12
- Next: 2h 15m
- Cows
- 3 / 6
- Next: 4h 30m
- Production Queue
- Cheese
- 2 / 3
- Ready in 1h 20m
- Bread
- 1 / 2
- Ready in 2h 50m
- Butter
- 0 / 2
- Queued
- Market Trends
- Wheat
- High demand
- +12%
- Eggs
- Steady
- +8%
- Milk
- Low supply
- -5%
- Corn
- High demand
- +15%
- Sell Orders
- Wheat
- 60
- $2.20 ea
- Eggs
- 24
- $4.50 ea
- Milk
- 12
- $6.20 ea
- Ship goods
- Overview
- Animals
- Production
- Storage
- Market

## Icon and asset inventory

### Shared UI icons

| Asset | Meaning | Treatment |
| --- | --- | --- |
| FARMSIM leaf/branch mark | Brand lockup | Small dark-green botanical mark, paired with the display wordmark; transparent standalone asset |
| Calendar | Day chip | Filled or two-tone brown icon, approximately 16–18 px |
| Leaf/sprout | Spring chip, crops, CTA | Small filled botanical icon; sage/forest depending on state |
| Coin | Cash and projected return | Gold coin with dark outline; use beside values, not as a decorative badge |
| Sun | Weather | Sunflower-gold filled sun with short rays, approximately 28–34 px |
| Back arrow | Field Planning navigation | Simple dark-ink left arrow in a rounded paper control |
| Check | Completed/selected | Forest-green compact check; never substitute a text character |
| Chevron | View all tasks | Small dark-ink right chevron |
| X/cancel | Queue and order removal | Compact dark-ink X in a small outlined control |

### Farm Overview illustration assets

- Full-bleed painterly farm scene: barn, silo, windmill, paths, fenced plots, orchard/trees, rocks, flowers, pond, dock/bridge, mailbox, and small farm props. The runtime asset is `web/public/assets/farm-overview.webp`; crop it responsively without adding a color wash.
- Crop plot treatments: planted/green, ripe/golden wheat, tilled brown soil, and selected plot overlay.
- Task glyphs: leafy crop, chicken, wheat sheaf, shipping crate.
- Callout wheat glyph and gold selected-plot outline.
- Bottom nav icons: hammer/build, sprout/crops, chicken/animals, crate/inventory, folded map/map, journal/book.

The scene should be a separable background asset with no UI text, no buttons, and no baked-in task callout. UI overlays remain code-native.

### Field Planning illustration assets

- Fenced soil patch/background scene with the same painterly lighting as Overview.
- Reusable square soil tiles for selected, available, and unavailable states; implement state overlay in code so selection is accessible.
- Crop illustrations: wheat sheaf, two tomatoes, and corn stalk.
- Comparison icons: leaf/season fit, clock/growth time, water drops/water need, coin/projected return.
- Legend swatches for Selected (12), Available, and Unavailable.
- Bottom nav icons: location pin/overview, sprout/field planning, soil/leaf/soil info, open guide/crop guide.

### Barn + Market illustration assets

- Inventory item art: egg basket, milk can, grain sack, wool ball. These are sprite regions in `web/public/assets/farm-assets-sheet-alpha.webp`.
- Animal art: chicken and cow. These are sprite regions in `web/public/assets/farm-assets-sheet-alpha.webp`.
- Production art: cheese wedge, bread loaf, butter pat. These are sprite regions in `web/public/assets/farm-assets-sheet-alpha.webp`.
- Trend/order glyphs: wheat, eggs, milk can, corn; small green up-right and terracotta down-right trend arrows.
- Sell/delete icon: small trash can.
- Ship goods icon: small farm truck.
- Bottom nav icons: home/overview, chicken/animals, barn/production, storage box, market storefront.

Use one coherent hand-painted/inked illustration treatment for all item art. UI icons should be production-quality SVG or an existing icon family with matching filled/outlined weight; do not use emoji or generic neighboring metaphors.

## Responsive rules

The reference does not show a mobile state, so these are conservative adaptations of the shown screens rather than new information architecture.

### All screens

- Keep the shell order and visible copy unchanged at every width.
- Keep the header context available: FARMSIM, Day 12, Spring, $2,430, and weather.
- At narrow widths, allow the status chips to scroll horizontally or compress their padding; do not hide cash or replace labels with invented abbreviations.
- Preserve the bottom rail inside the app frame and keep labels visible. Use equal-width items at the reference count for the active screen.
- Maintain minimum 44 × 44 px pointer targets for chips, nav items, plot tiles, tabs, cancel actions, and CTAs.
- Reduce decoration before reducing task/status information. Keep selected, available, unavailable, queued, ready, and completed states explicit.

### Desktop, approximately 1,200 px and wider

- Preserve the two-column layouts shown in Field Planning and Barn + Market.
- Field Planning keeps the plot canvas dominant on the left and the crop chooser on the right.
- Barn + Market keeps the wide operational stack on the left and the narrower trend/order rail on the right.
- Overview keeps Tasks as a left overlay and the map as the dominant visual surface.

### Tablet, approximately 768–1,199 px

- Keep the shared header and bottom rail.
- Reduce horizontal padding and card gaps before changing the information order.
- In Field Planning, keep the map first and place the crop chooser immediately below it if the two columns become too narrow for readable crop cards; preserve Wheat → Tomato → Corn and the CTA after the list.
- In Barn + Market, keep Inventory, Animal Production, and Production Queue first; place Market Trends and Sell Orders below them in the same order.
- Keep Ship goods immediately above the bottom rail and make it full-width within the content gutter when necessary.

### Mobile, below approximately 768 px

- Use one content column per screen with 12–16 px gutters.
- Keep Overview map-first, with Tasks as a horizontally scrollable or compact top panel that does not cover the selected plot.
- Keep Field Planning map-first, then the crop chooser cards, legend, and Plant 12 plots.
- Keep Barn + Market tab-first, then Inventory, Animal Production, Production Queue, Market Trends, Sell Orders, and Ship goods.
- Preserve the paper surfaces, gold selection emphasis, and painterly scene crop; do not introduce a new dark mobile theme or an unshown mobile navigation model.
- Keep headings at least 20 px, body copy at least 12 px, and prevent values such as $2,430, +12%, and Ready in 1h 20m from wrapping into ambiguous fragments.

## Fidelity checklist

- [ ] Each state uses the shared parchment header with FARMSIM, Day 12, Spring, $2,430, and sun icon in the same order.
- [ ] Background is warm parchment, not white, gray, or dark.
- [ ] Overview uses painterly farm art as the dominant surface with no color wash or generic gradient overlay.
- [ ] Overview Tasks, selected plot, Next Up callout, and six-item bottom rail match the reference copy and hierarchy.
- [ ] Field Planning preserves the back/title row, subtitle, plot grid, Wheat/Tomato/Corn order, comparison rows, legend, CTA, and four-item rail.
- [ ] Barn + Market preserves Barn/Market tabs, left-stack/right-rail anatomy, inventory cards, production rows, trend chart, sell orders, Ship goods, and five-item rail.
- [ ] Typography uses a high-contrast display serif for brand/headings and deliberate readable control/data text; no browser-default controls.
- [ ] Paper panels use thin warm borders, small radii, and restrained shadows; no glassmorphism or heavy black elevation.
- [ ] Selected, available, unavailable, queued, ready, completed, and trend states are communicated through iconography/text as well as color.
- [ ] Icons use the shown metaphors and a consistent filled/inked weight; no emoji substitutions.
- [ ] Central farm, crop, animal, and inventory illustrations are separable assets with matching painterly treatment.
- [ ] Responsive layouts preserve the same information order and visible copy without adding screens or marketing content.
- [ ] The core visual contract is checked at the reference frame ratio and at a narrow mobile width before implementation sign-off.
