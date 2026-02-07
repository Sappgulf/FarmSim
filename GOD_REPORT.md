Meta:
- Date: 2026-02-07
- Change summary: Expanded decor catalog from 8 to 32 items across 7 categories; added 5 new DECOR_SETS with farm titles (total 8 sets, 13 titles); deepened BuildingsTab with 3-tier upgrades and 4 synergy combos; deepened ExpandTab with plot usage stats, specialization zones, and milestones; overhauled ShopTab with category filter browser and performance memoization.
- TaskType: Content expansion + systems deepening + performance polish
- Risk: Low-Medium (content additions, no core state shape changes, no save migration needed)

Intake:
- SuccessCriteria: Triple decor catalog, fix flower_box data integrity, deepen buildings/expand, improve shop browsing, pass tests/build.
- RequiredContext used: `AGENT.md`, GOD_REPORT.md, `CHANGELOG.md`, `FEATURE_INVENTORY.md`, `decor.json`, `cozyExpansion.js`, `decorData.js`, `ContentManager.js`.

Checks:
- K1: PASS — `npm run test -- --run` passes (17 files / 47 tests).
- K2: PASS — decor.json expanded to 32 items; flower_box added (fixes hearth_garden set).
- K3: PASS — 8 DECOR_SETS total (3 original + 5 new), 13 FARM_TITLES.
- K4: PASS — BuildingsTab: 6 buildings with 3-tier upgrades, 4 synergy combos with progress tracking.
- K5: PASS — ExpandTab: plot usage stats, 4 specialization zones, 4 expansion milestones.
- K6: PASS — ShopTab: full catalog browser with 7 category filter chips, scrollable, memoized.
- K7: PASS — All economy actions use `earnMoney`/`spendMoney`/`addXP` — no raw coin writes.
- K8: PASS — `npm run build` succeeds.
- K9: PASS — `CHANGELOG.md` updated with Sprint G11 planned + implemented entries.

Scores:
- Correctness: 5
- Maintainability: 5
- Performance: 5
- Security/Safety: 4
- UX: 5
