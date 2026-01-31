# FarmSim Roadmap

## Scope Summary
This roadmap focuses on the Path B "Cozy Sim" direction while preserving existing gameplay systems.

### Polished (Existing Systems)
- **Seasons (already implemented)**
  - Add day-in-season tracking, UI clarity, and configurable day length.
- **Weather (already implemented)**
  - Cozy weather layer with positive/neutral effects and clearer UI.
- **Town Reputation (partial)**
  - Tie rep gains to harvests + contracts, add tiered perks, and surface in UI.

### Newly Added
- **Collections / Encyclopedia**
  - Track crop discoveries + harvest milestones with a new Collections tab.

## Order of Operations (Stability-First)
1. **Audit & Docs**
   - Capture current systems, mark already-implemented features, and avoid duplication.
2. **Seasons → Weather**
   - Add day-in-season tracking and cozy weather UI layer.
3. **Town Reputation**
   - Connect rep gains and surface perks in the Social/Town UI.
4. **Collections**
   - New encyclopedia tab with milestones and lore.
5. **UI/Perf**
   - Apply consistency polish and reduce hot-path work.

## Risks & Mitigation
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Save migration errors | Lost progress | Versioned migrations + backup restore on load. |
| Rep bonus balance | Inflated economy | Keep bonuses small (≤8%) and gate by tiers. |
| UI clutter | Poor UX | Use light cards and concise sections; no new heavy panels. |
| Collection overhead | Performance | Update collections only on harvest actions. |

## Next Targets (Future Pass)
- **Upgrade depth**: expose building level upgrades in the Buildings tab UI.
- **Automation clarity**: add a dedicated Automation tab with placement/coverage visuals.
- **Quest variety**: data-driven rewards like temporary boosts or consumables.
- **Save import validation**: schema validation before accepting imported saves.
