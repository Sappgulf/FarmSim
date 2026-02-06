Meta:
- Date: 2026-02-06
- Change summary: Rebuilt the fishing mini-game with continuous fish behavior, tension/quality mechanics, and mobile hold controls; enforced economy integrity with helper reward/cost actions + reducer clamps; and hardened notifications with guaranteed auto-expiry.
- TaskType: Gameplay deepening + debug + polish
- Risk: Medium (core gameplay systems and economy pathways updated)

Intake:
- SuccessCriteria: Ensure notifications auto-dismiss, make fishing deeper and reliable, tighten reward integrity (no unearned XP/coins), run debug/validation, and ship with tests/build green.
- RequiredContext used: `AGENTS.md`, GOD core docs (`START.md`, `CORE.md`, `RUN.md`, `CHECKS.md`), `CHANGELOG.md`, `README.md`.

Checks:
- K1: PASS — `npm run test -- --run` passes (14 files / 36 tests).
- K2: PASS — notifications now have per-item timers plus a fallback expiry sweep in `NotificationSystem`.
- K3: PASS — fishing loop now simulates fish movement/tension continuously with clear win/escape conditions and mobile hold-to-reel controls.
- K4: PASS — reward/cost pathways across tabs/systems were normalized to `earnMoney` / `spendMoney` / `addXP`; reducer now clamps coin/XP writes.
- K5: PASS — inventory grant path added via `actions.addToInventory`, fixing runtime gaps in fishing/livestock reward flows.
- K6: PASS — `npm run build` succeeds.
- K7: PASS — `CHANGELOG.md` updated with Sprint G9 planned + implemented entries.

Scores:
- Correctness: 5
- Maintainability: 4
- Performance: 4
- Security/Safety: 4
- UX: 5
