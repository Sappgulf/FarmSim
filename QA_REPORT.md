# QA Report — QA Harness

**Date:** 2026-02-04

## Sprint G1 — Release Discipline & Versioning (2026-02-04)

### Automated Checks
- ✅ `npm run smoke-test -- --run` (passes; ReactDOMTestUtils act deprecation warning + npm http-proxy warning)

### Release Gates (Dev-only)
- [ ] QA harness suite passes (run via QA Mode panel).
- [ ] Content validation errors = 0 (warnings logged).
- [ ] Console errors = 0 during normal play.
- [ ] Latest save loads without migration errors.
- [ ] APP_VERSION format validated.

### Manual Sanity Checklist (Recommended)
- [ ] “What’s New” modal shows once per version and dismisses cleanly.
- [ ] Debug/QA panels hidden in release mode builds.
- [ ] Settings shows APP_VERSION + release mode label.

## Sprint F2 — Shareability + Identity Lock (2026-02-04)

### Automated Checks
- [ ] `qa: farm_card_export_smoke`
- [ ] `qa: farm_card_export_repeat`
- [ ] `qa: farm_card_theme_swap`
- [ ] `qa: farm_card_identity_persist`
- [ ] `qa: save_load_integrity`

### Manual Sanity Checklist (Recommended)
- [ ] Farm Card export on mobile (iOS Safari safe).
- [ ] Theme switch updates Farm Card palette.
- [ ] Spotlight selection persists after save/reload.
- [ ] Share Farm button available on Town Board and Almanac tab.

## Sprint F1 — Season Pack + Cozy Goals (2026-02-04)

### Automated Checks
- ✅ `npm run smoke-test` (passes; ReactDOMTestUtils act deprecation warning emitted by test harness)

### Manual Sanity Checklist (Recommended)
- [ ] Load Season Pack v1 content; confirm crops/decor/festival appear.
- [ ] Town Board shows Cozy Goals and “What’s New” card once per pack version.
- [ ] Complete a Cozy Goal → reward granted once, no duplicates.
- [ ] Unlock Almanac pages for pack crops, decor placements, pet care, and festival attendance.
- [ ] Trigger pack festival; complete minigame; verify save/reload of play limits.

## Sprint D1 — QA Harness Runs (Template)

**Environment:**  
- Build: dev (`npm run dev`)  
- Debug: `?debug=1`  

### Run 1 Summary
- Suite status: ⬜ PASS / ⬜ FAIL  
- Tests passed: __  
- Tests failed: __  
- Tests skipped: __  
- Console errors: __  
- Content validation errors: __  
- Content validation warnings: __  

### Run 2 Summary
- Suite status: ⬜ PASS / ⬜ FAIL  
- Tests passed: __  
- Tests failed: __  
- Tests skipped: __  
- Console errors: __  
- Content validation errors: __  
- Content validation warnings: __  

### QA Suite Report (Paste from **Copy Report**)
```text
<paste QA report here>
```

## Sprint D2 — Onboarding + First 10 Minutes (2026-02-04)

### Manual Checklist
- [ ] New game: overlay appears and is non-blocking.
- [ ] Step 1 completes on plant (onPlant event).
- [ ] Step 2 completes on harvest (onHarvest event).
- [ ] Step 3 completes on Town Board open (onOpenBoard event).
- [ ] Skip tutorial persists and does not reappear.
- [ ] Save/reload preserves onboardingSeen/onboardingStep/onboardingSkipped.
- [ ] Early wins: first memory, first almanac page, first harvest bonus trigger once.
- [ ] Mobile 375px: overlay readable, draggable, no overflow.
- [ ] Town Board cards fit on 375px with no horizontal scroll.
- [ ] No console errors during onboarding flow.

### Automated Checks
- [ ] `npm run test -- --run` (fails in this env: `vitest: command not found`)
- [ ] `npm run build` (fails in this env: `vite: command not found`)

## Sprint D3 — Festival Mini-Game v2 (2026-02-04)

### Manual Checklist
- [ ] Town Board shows Festival Game Live card when festival active.
- [ ] Play button opens mini-game modal; close button exits cleanly.
- [ ] Rounds complete and reward summary appears.
- [ ] Play limit enforces: 1 per festival day / daily when no festival.
- [ ] Save/reload preserves play limits and last result.
- [ ] Mobile 375px: modal fits, buttons accessible, no overflow.
- [ ] Reduced motion simplifies pacing when enabled.

### Automated Checks
- [ ] `qa: festival_game_smoke`
- [ ] `qa: festival_game_integration`
- [ ] `qa: festival_game_leak`
- [ ] `npm run test -- --run` (fails in this env: `vitest: command not found`)
- [ ] `npm run build` (fails in this env: `vite: command not found`)

## Expansion + Polish Pass (2026-02-03)
- **Static inspection:** Pets tab layout/copy, notification auto-dismiss logic, and snake_case formatter applied across tabs reviewed in code.
- **Automated check:** `npm run build` (passes; npm http-proxy warning + browserslist data warning).
- **Manual runtime checks:** Attempted Playwright debug run (tab stress, +50 notifications, pets actions, save/reload), but Chromium crashed (SIGSEGV) in this environment.

## UI + Tabs + Mini-Games v1 Pass (2026-02-03)
- **Static inspection:** Perfect Harvest mini-game UI + engine wiring (Events tab), save/load fields, and icon standardization reviewed.
- **Automated check:** `npm run test -- --run` (passes with ReactDOMTestUtils act deprecation warning).
- **Manual runtime checks:** Not executed in this environment.

## Season Pack Pipeline v1 Verification (2026-02-03)
- **Static inspection:** ContentManager load/merge paths, pack metadata, and validation logic reviewed.
- **Events tab:** Seasonal events now sourced from content pipeline; ensured timers are cleared on unmount and after event completion.
- **Farm grid:** Safe fallback for missing crop selection to prevent crashes when content IDs change.
- **Debug tooling:** Added dev-only content validation + report buttons (disabled outside `?debug=1`).
- **Automated check:** `npm run smoke-test -- --run` (passes with ReactDOMTestUtils act deprecation warning).

**Manual runtime checks:** Not executed in this environment.

## Method
- Static/code inspection of all FarmSim tabs and core screens.
- Debug-only tooling audited (`?debug=1`) for crash capture and stress actions.
- Cozy Expansion Pack v1 checks: decor placement/undo wiring, scrapbook panel rendering, and festival additions reviewed in code.
- No browser runtime validation executed in this environment.

## Tab-by-Tab Sweep
**Navigation + Core**
- Farm HUD + grid (`GameHeader`, `FarmGrid`): **PASS** (logic reviewed; no new errors found).
- Sidebar tabs (`GameSidebar`): **PASS** (all tabs wired; lazy loads in Suspense).
- Bottom Nav (`NavBar`): **PASS** (sections + tabs hooked in `FarmSim`).

**Tabs**
- Farming: **PASS (fixed)** — quick action handlers now wired to actual actions and should no longer throw missing-action errors.
- Inventory: **PASS** (UI reads state inventory).
- Shop: **PASS** (coins/inventory updates via actions).
- Buildings: **PASS** (updates buildings + XP/notifications).
- Research: **PASS** (research updates via actions).
- Genetics: **PASS** (inventory/XP updates wired).
- Weather: **PASS** (forecast + reward actions wired).
- Pets: **PASS** (pets + inventory updates wired).
- Livestock: **PASS** (notifications + particles).
- Fishing: **PASS** (notifications + particles).
- Challenges: **PASS (fixed)** — daily reset timestamp + streak now update correctly.
- Events: **PASS (updated)** — active events update wired; Perfect Harvest timing mini-game available once per event/day; rewards and save gating reviewed.
- Processing: **PASS** (queues/facilities/inventory updates wired).
- Achievements: **PASS** (achievement updates wired).
- Almanac: **PASS** (sections render, philosophy picker, locked/unlocked states).
- Social: **PASS** (actions wired; notifications).
- Analytics: **PASS** (read-only analytics UI).
- Mystery Shop: **PASS** (inventory updates wired).
- Daily Quests: **PASS (fixed)** — reset actions now traced; no missing-action errors.
- Diseases: **PASS** (disease cures + updates wired).
- Expand: **PASS** (grid + coins update wired).
- Settings: **PASS** (save/load and settings updates wired).

**Debug-Only Panels**
- Performance/Crash Overlay: **PASS** (action trace + copyable debug report; debug-only toggle). (`src/components/farm-sim/ui/PerformanceOverlay.jsx`)
- Stress Panel: **PASS** (buttons wired for plot fill/harvest, notification stress, tab cycling, building toggles, day advance). (`src/components/farm-sim/ui/DebugStressPanel.jsx`)

## Fixes Applied During QA
- Added debug-only stress panel with scripted stress actions.
- Expanded crash capture overlay to include copyable debug reports and up to 100 recent actions.
- Hardened save/load normalization and added plot index guards to prevent off-by-one crashes.

## Manual/Automated Tests
- ✅ `npm run smoke-test -- --run` (passes with ReactDOMTestUtils act deprecation warning)
- Manual follow-up recommended in browser:
  - Almanac unlocks: season start, rainy harvest, winter harvest, and festival attendance.
  - Almanac hints toggle in Settings.
  - Town Board insight rotation.
