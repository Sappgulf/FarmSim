# FarmSim Roadmap Next (Ranked)

Generated: 2026-02-13

Ranking rubric:
- `Value`: player impact + retention
- `Cost`: implementation/test complexity
- `Risk`: regression potential

## Priority Queue

1. `P1` Weather gameplay parity for iOS (`WeatherSystem` effects + forecast UI)
2. `P1` iOS Events/Festival board parity with claimable rewards and timers
3. `P1` Daily Quests tab parity (content-driven objectives, streak tuning)
4. `P1` Processing facilities loop (queue, upgrades, processed inventory)
5. `P1` Achievement system parity (unlock/claim flow + progression hooks)
6. `P2` Disease/disaster management systems parity in GameCore + iOS UI
7. `P2` Social/trade-lite systems parity for market and request loops
8. `P2` Mystery seed shop parity using shared mystery tables
9. `P2` Dedicated Market analytics panel (price trends + recommendations)
10. `P2` iOS widgets/live activities backed by `WidgetFarmSnapshot`
11. `P2` Save schema convergence plan: web v16 <-> iOS codec roadmap
12. `P3` Expanded accessibility pass (VoiceOver custom rotor + large content viewer)
13. `P3` Cosmetic polish pack: optional vector background packs for iOS tabs
14. `P3` Content authoring validator CLI for `shared/content/*.json`
15. `P3` Perf automation: CI budget checks for iOS frame/tick metrics

## Notes

- Keep `shared/content` as canonical source for both web and iOS.
- Add migration notes in `shared/schema/save-contract.md` for every save shape change.
- Any new gameplay system should include:
  - GameCore unit tests
  - parity checklist update
  - changelog entry
