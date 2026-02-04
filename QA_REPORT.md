# QA Report — AAA Polish Pass

**Date:** 2026-02-03

---

## Triple-A Polish Pass (2026-02-03) — IN PROGRESS

**Scope:** UI/UX polish, copy cleanup, icon standardization, notification upgrade, light content expansion, stability hardening, performance sanity.

### Pre-Flight Checks
- [x] Baseline test: `npm run test -- --run` (expected: pass with act warnings)
- [ ] Baseline build: `npm run build` (expected: pass)
- [x] Documentation audit: POLISH_MAP.md, UX_CHECKLIST.md created
- [x] Content inventory: 22 tabs, notification system, 8 UI primitives documented

### Phase 1: Audit + Documents ✅ COMPLETE
- [x] Read all docs (README, GAME_GUIDE, PROJECT_STRUCTURE, FEATURE_INVENTORY, UI_GUIDE, PERF_NOTES, QA_REPORT, CONTENT_PIPELINE, CHANGELOG)
- [x] Create POLISH_MAP.md (tab inventory, UI components, icons, copy issues, performance notes)
- [x] Create UX_CHECKLIST.md (mobile-first requirements, 375px baseline)
- [x] Update QA_REPORT.md with test skeleton

### Phase 2: Copy + Text Cleanup
- [ ] Implement display formatter (snake_case → Title Case)
- [ ] Apply formatter to all UI display strings (preserve IDs)
- [ ] Copy pass: consistent capitalization
- [ ] Add helper text where needed
- [ ] Improve empty states for all tabs
- [ ] Test: Manual review of all tab copy

### Phase 3: Icons + Visual Consistency
- [ ] Establish icon standard (lucide preferred, emoji fallback)
- [ ] Fix missing/broken icons in tabs
- [ ] Standardize icon sizes (16/20/24px)
- [ ] Update GameSidebar icon rendering
- [ ] Update NavBar icon rendering
- [ ] Standardize button variants usage
- [ ] Card/panel padding consistency audit
- [ ] Update UI_GUIDE.md with icon rules
- [ ] Test: Visual review of all tabs

### Phase 4: Tab-by-Tab Polish (HIGH Priority First)
#### HIGH Priority Tabs
- [ ] **Farming Tab:** Layout, quick actions, mobile fit (375px)
- [ ] **Shop Tab:** Owned states, pricing, list performance
- [ ] **Pets Tab:** Card layout, stat bars, action buttons, empty state
- [ ] **Events Tab (Town Board):** Section organization, Perfect Harvest visibility, Story Dashboard mobile fit
- [ ] **Almanac Tab:** Page cards readability, section navigation, philosophy picker
- [ ] **Notification System:** Auto-dismiss (5s→3.5s), close button (28px→44px), pause on hover, timer cleanup

#### MEDIUM Priority Tabs
- [ ] **Settings Tab:** Toggle sizing (≥44px), section organization, descriptions
- [ ] **Achievements Tab:** Category filters, progress bars, Scrapbook navigation
- [ ] **Inventory Tab:** List performance, categorization, empty states
- [ ] **Daily Quests Tab:** Quest cards, progress, streak display
- [ ] **Livestock Tab:** Animal cards, production timers, barn capacity
- [ ] **Fishing Tab:** Mini-game UI, collection visualization
- [ ] **Processing Tab:** Queue visualization, facility status
- [ ] **Research Tab:** Tech tree layout, locked/unlocked states
- [ ] **Genetics Tab:** Parent selection, trait display
- [ ] **Buildings Tab:** Benefit clarity, built states

#### LOW Priority Tabs
- [ ] **Expand Tab:** Simple polish
- [ ] **Weather Tab:** Forecast layout
- [ ] **Challenges Tab:** Card layout
- [ ] **Social Tab:** Placeholder content check
- [ ] **Analytics Tab:** Stat formatting
- [ ] **Mystery Shop Tab:** Rarity distinction
- [ ] **Disease Management Tab:** Indicator clarity

#### Cross-Tab Checks
- [ ] All tabs fit at 375px width
- [ ] All touch targets ≥ 44px
- [ ] Consistent spacing and alignment
- [ ] Reduced motion support verified
- [ ] Empty states present and helpful

### Phase 5: Notification Professional Upgrade
- [ ] Change auto-dismiss duration: `5000` → `3500` (line 48 NotificationSystem.jsx)
- [ ] Increase close button size: `h-7 w-7` → `h-11 w-11` (≥44px)
- [ ] Implement pause on hover/press (add state + timer management)
- [ ] Verify close is idempotent (test rapid close)
- [ ] Verify timer clearing on close (prevent leaks)
- [ ] Mobile positioning with safe area (top-right, avoid status bar)
- [ ] Animation uses transform/opacity only (verify no layout thrash)
- [ ] Test: Spawn 50 notifications, close rapidly, check for crashes

### Phase 6: Light Content Expansion (Data-Driven Only)
- [ ] Add 2-3 new crops (data-only, validate IDs/icons/prices)
- [ ] Add 3-5 new decor items (data-only)
- [ ] Add 1-2 new festivals (data-only)
- [ ] Add 5-10 new almanac pages (data-only)
- [ ] Validate via debug tools (`?debug=1`)
- [ ] Test save/load compatibility
- [ ] Test: Load content, verify display, save/reload

### Phase 7: Bug Check + Stability Hardening (REQUIRED)
- [ ] Rapid tab switching: 30+ times, no crashes
- [ ] Notification stress: Spawn 50, close rapidly, no errors
- [ ] Pets tab: Spam actions (feed, pet) if applicable
- [ ] Farm grid: Fill all plots, harvest repeatedly
- [ ] Shop/Almanac: Open/close 20+ times
- [ ] Save → reload under heavy state (full inventory, many animals, active events)
- [ ] Verify close/destroy is idempotent (modals, timers)
- [ ] Check array mutation (no forward iteration + splice)
- [ ] Verify timer/listener cleanup on unmount
- [ ] Zero console errors target (normal play)
- [ ] Test: All above scenarios, document results

### Phase 8: Performance Sanity (NO REGRESSION)
- [ ] Confirm no new per-tick work introduced
- [ ] Confirm lists render only on open/data change
- [ ] Cache DOM refs where appropriate
- [ ] Batch writes with rAF where needed
- [ ] Verify no progressive slowdown (run stress tests twice)
- [ ] Update PERF_NOTES.md with findings
- [ ] Test: FPS monitoring during heavy use, compare before/after

### Deliverables
- [ ] Update CHANGELOG.md (Polish + Expansion + Fixes)
- [ ] Update POLISH_MAP.md (what was improved and where)
- [ ] Update UX_CHECKLIST.md (mark completed items)
- [ ] Update QA_REPORT.md (tests run and results)
- [ ] Update UI_GUIDE.md (tokens, components, icon rules)
- [ ] Update PERF_NOTES.md (confirm no regressions)
- [ ] Update GAME_GUIDE.md if user-facing behavior changed

---

## Previous QA Passes

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
