# FarmSim Roadmap

## Scope Summary
This roadmap focuses on retention loops and stability without duplicating existing systems.

### Upgraded (Existing Systems)
- **Daily Quests → Daily + Weekly Contracts**
  - Added weekly cadence alongside existing daily quests.
- **Save System → Hardened Persistence**
  - Added backup save slot, stricter validation, and migration to version 3.
- **Automation → Earned Auto-Watering**
  - Sprinkler tool and well upgrades now enable auto-watering.

### Newly Added
- **Data-driven weekly contract templates** (`constants/questData.js`).

## Order of Operations (Stability-First)
1. **Audit & Docs**
   - Capture current systems and avoid duplication.
2. **Contracts/Quests**
   - Add weekly cadence + UI panel.
3. **Automation**
   - Implement auto-watering tied to earned tools/buildings.
4. **Data-driven Content**
   - Centralize quest templates in config.
5. **Save Hardening**
   - Add backup slot and validation logic.

## Risks & Mitigation
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Save migration errors | Lost progress | Versioned migrations + backup restore on load. |
| Balance swing from automation | Faster growth | Limit interval + cap number of auto-watered plots. |
| Quest fatigue | Reduced retention | Weekly contracts provide longer-term goals. |
| UI clutter | Poor UX | Keep weekly contracts in existing tab with clear separation. |

## Next Targets (Future Pass)
- **Upgrade depth**: expose building level upgrades in the Buildings tab UI.
- **Automation clarity**: add a dedicated Automation tab with placement/coverage visuals.
- **Quest variety**: data-driven rewards like temporary boosts or consumables.
- **Save import validation**: schema validation before accepting imported saves.
