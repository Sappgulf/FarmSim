# Changelog

## 2026-02-10

- **Planned**
  - **Scope:** frontend/performance
  - **What:** Continue performance cleanup by removing expensive milestone progress diffing in the game action path.
  - **Why:** Milestone events run during normal gameplay; repeated deep serialization checks can add avoidable CPU overhead.
  - **Baseline verification:** `npm run test` (pass), `npm run build` (pass).

- **Implemented**
  - **Scope:** frontend/performance
  - **What:** Refactored milestone progress updates to return the existing progress object when no values change, and switched milestone event handling to use reference equality instead of `JSON.stringify` deep compares.
  - **Why:** Removes repeated serialization in a hot action path while preserving milestone unlock behavior.
  - **Verification performed:** `npm run test` (pass, includes new milestone regression tests), `npm run build` (pass).

## 5.5.4

### UI/UX
- Sidebar mounts only active tab content for better performance.
- Notification Center now keeps a saved history.
- Inventory quick-sell actions for crops.

### Added
- Weekly Operations milestone rewards.
- Streak-based challenge reward boosts.
- Daily Market Focus bonus crop loop.

### Changed
- Reworked Daily Operations board with reroll.


## 2026-02-10 (session 2)

- **Planned**
  - **Scope:** frontend/performance
  - **What:** Polish reducer performance by preventing no-op state writes in frequently-dispatched actions.
  - **Why:** Returning fresh state objects for unchanged values causes unnecessary store notifications and component selector checks.
  - **Baseline verification:** `npm run test -- --run` (pass), `npm run build` (pass).

- **Implemented**
  - **Scope:** frontend/performance
  - **What:** Added no-op guards in reducer hot paths (`SET_COINS`, `SET_XP`, `UPDATE_SETTINGS`, `UPDATE_RETENTION`, `UPDATE_GAME_LOOP`) plus a shared `mergeIfChanged` helper to preserve references when payload values do not change.
  - **Why:** Avoids unnecessary state object churn and downstream selector notifications for high-frequency updates.
  - **Verification performed:** `npm run test -- --run` (pass), `npm run build` (pass).
