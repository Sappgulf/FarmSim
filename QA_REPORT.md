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

## Progression Deep Balance QA (v5.5)
### Automated
- `src/test/progression.test.js` still validates:
  - non-linear XP growth by level band
  - harvest diminishing returns
  - minigame daily hard cap
  - save migration keeps level valid + tracker defaults

### Manual / simulation checklist
- Verify repeated harvest spam yields less XP after per-crop daily thresholds.
- Verify planting and pet interactions do not grant XP.
- Verify challenge/milestone chain-claiming is bounded by daily caps.
- Verify old save migration (v14→v15) does not reduce level and keeps XP bar progress coherent.
- Verify unlock cadence: buildings/genetics appear later and in mastery bands.


## Balance + Performance QA (v5.6)
### Automated
- `npm run smoke-test`
- `npm run test -- --run`
- `npm run build`

### Manual / simulation checklist
- 30–45 min optimal play simulation: verify level pacing follows onboarding → early intent → mid depth targets.
- Economy inflation check: verify coin growth slows by band and optional sinks remain affordable.
- Difficulty sanity: verify growth/minigame challenge tightens gently with no failure penalties.
- Stress: rapid tab switching, notification spam, plot fill/harvest cycles, festival minigame open/close.
- Save/load heavy state: no level/currency loss, no console errors.
