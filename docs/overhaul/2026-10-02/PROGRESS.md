# FarmSim overhaul — 2026-10-02

This implementation follows the [baseline audit](../../audits/2026-10-02/AUDIT.md). The audit remains a historical record; its unchecked backlog is superseded by this status report where work overlaps.

## Implemented

- Restored active web Overview/Fields rendering and native compilation/startup. Native launches had both invalid pack envelopes and a main-thread notification-daemon wait; pack metadata and notification execution were repaired.
- Added a renewable web economy: seed purchases, sale outlet for every inventory item, renewable orders, wheat-backed bread, level/XP progression, and paid land expansion.
- Fixed wheat shipping/display price consistency ($2.20), finite integer quantities, and cent rounding. Money remains a dollar-number field, not a unified integer-cent cross-platform schema.
- Added mixed/staggered planting, individual homestead watering/harvest, batch field actions, live per-crop progress, real advice, seasonal yields, and honest two-day production/cancellation rules.
- Replaced baked crop scenery with neutral ImageGen art and state-driven plot overlays. Added a transparent three-species/four-stage atlas shared with native SpriteKit.
- Rebuilt phone/desktop hierarchy, kept day/cash/weather readable, enlarged actions, placed the primary field action above the farm, made Barn/Market tabs functional and keyboard navigable, and preserved subtab URL/history state.
- Added web save schema v3 validation/migration, recovery backups, storage failure messaging, and newer-schema overwrite protection.
- Added native save v17 daily livestock claims and one-time store-owned fishing settlement/cancellation. Native starter seeds are usable; untouched stranded starter saves get a narrow additive repair.
- Wired active React App tests into the suite, added economy/save regressions and a 120-day simulation, and added native bundled-content/livestock migration tests. Removed root scripts that delegated to nonexistent commands; documented the actual entry points.

## Verification

- Web: 157 tests passed across 43 suites; production type checking and build passed. Includes five mounted App workflows and a 120-day renewable-economy simulation. The new rain-feedback and corrupt-save replacement tests reproduced their original failures before repair. Disk exhaustion interrupted an earlier release run; only this task's disposable Xcode derived data was removed before the passing run.
- Native GameCore: 112 tests passed with zero failures.
- Native app target: Build iOS Apps plugin built, installed, and launched successfully on an isolated iPhone 18 Pro / iOS 27 simulator. Onboarding and the farm opened; the stranded-save recovery and planting wheat through the plot sheet were observed. Shared wheat artwork rendered.
- Browser: active UI exercised through planting, watering, rain growth, mixed crops, harvesting, market sales/restocking, paid land expansion, reload, and Barn/Market route restoration. Captures cover 390 × 844 phone and a 1280 × 720 desktop viewport (full-page capture 1280 × 982). PWA screenshot metadata now points to captures of the actual v3 UI.
- Existing unrelated workspace files remain excluded from the release. Existing farm-coaching edits are integrated and verified with the complete native build.
- Production: published to [farm-sim-seven.vercel.app](https://farm-sim-seven.vercel.app). Observed the new UI with an existing save, the Market URL restored on reload, and a warm offline reload passed. No browser console errors were captured in these hosted checks.
- Dependency follow-up: updated the lockfile to patched nanoid/undici and Vitest 5.0.3, repaired the getter-only localStorage test mock, and reran all 157 tests plus the production build successfully. `npm audit` reports zero known vulnerabilities.

Screenshots show a diagnostic farm preserved from the audit, including its historical cash balance; they are not the new-game starting state. New-game behavior is tested separately.

## Remaining priorities

1. Choose and implement shared web/native clock/content/rule parity. Web manual days and native real-time days currently differ.
2. Complete native artwork beyond wheat/tomato/corn, and add world layers for owned buildings, animals, and upgrades.
3. Add complete research timing/effects, livestock ready balances, recurring objectives, and stronger harvest/upgrade feedback where those systems are still incomplete.
4. Finish native VoiceOver tile actions, dynamic-type/safe-area/device coverage, and a full fishing gameplay/cancellation playtest. Fishing correctness was built and reviewed, not played end to end here.
5. Validate first install, offline cold starts and service-worker updates beyond the verified warm reload, cross-tab saving/recovery export, and profile actual renderers on representative physical devices.
6. Playtest pacing/economy with people. The 120-day deterministic test proves continuity/invariants, not that the pacing is enjoyable or balanced.

This is a substantial playable overhaul, not completion of every item in the original audit.
