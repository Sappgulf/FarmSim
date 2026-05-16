# FarmSim Roadmap Next (Ranked)

Generated: 2026-05-16

Ranking rubric:
- `Value`: player impact + retention
- `Cost`: implementation/test complexity
- `Risk`: regression potential

## Priority Queue

1. `P1` Weather gameplay effects parity for iOS (`WeatherSystem` effects + forecast UI)
2. `P1` Processing facilities loop (queue, upgrades, processed inventory)
3. `P1` Achievement/quest progression parity (unlock/claim flow + progression hooks)
4. `P1` Disease/disaster management systems parity in GameCore + iOS UI
5. `P2` Social/trade-lite systems parity for market and request loops
6. `P2` Mystery seed shop parity using shared mystery tables
7. `P2` Dedicated Market analytics panel (price trends + recommendations)
8. `P2` iOS widgets/live activities backed by `WidgetFarmSnapshot`
9. `P2` Web localStorage payload <-> iOS GameCore save-shape convergence plan
10. `P3` Expanded accessibility pass (VoiceOver custom rotor + large content viewer)
11. `P3` Cosmetic polish pack: optional vector background packs for iOS tabs
12. `P3` Content authoring validator CLI for `shared/content/*.json`
13. `P3` Perf automation: CI budget checks for iOS frame/tick metrics

## Notes

- Keep `shared/content` as canonical source for both web and iOS.
- Add migration notes in `shared/schema/save-contract.md` for every save shape change.
- Completed since the previous roadmap: Daily Quests and Events/Festival board are integrated into the iOS Town flow; web and iOS save versions are both `16`, though their payload shapes remain separate.
- Any new gameplay system should include:
  - GameCore unit tests
  - parity checklist update
  - changelog entry
