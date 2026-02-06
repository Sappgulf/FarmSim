# QA Report — Sprint I4

## Automated
- Added `src/test/socialLite.test.js` for seed/snapshot/milestones.
- Added QA harness tests in `src/components/farm-sim/qa/qaTests.js`:
  - Seed Code Roundtrip
  - Ghost Visit Read-only
  - Milestone Save/Load Persist

## Manual checklist
- Seed code share/import from Social tab.
- Snapshot export/import and exit ghost visit.
- Milestones panel shows next 3 + recent 3.


## Progression Rebalance QA (v5.4)
### Automated
- Added `src/test/progression.test.js`:
  - non-linear XP curve checks
  - harvest spam diminishing return check
  - minigame daily XP cap check
  - save migration defaults + level-from-xp check

### Manual/simulation checklist
- 30-minute optimal loop simulation via XP model confirmed early levels no longer spike.
- Header XP bar shows current level progress + maturity pacing copy.
- Recent XP source list shows last 3 grant events.
