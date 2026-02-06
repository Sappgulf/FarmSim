# Milestones Schema

Milestones are data-driven via `src/data/milestones.js`.

Schema:
- `id: string`
- `name: string`
- `description: string`
- `type: daysPlayed|totalHarvests|uniqueCropsGrown|decorSetsCompleted|rareMomentsSeen|minigamesPlayed|petsInteractedDays`
- `target: number`
- `reward: { titleId? memoryId? almanacId? }`

Manager API (`src/systems/milestones.js`):
- `registerMilestones(data)`
- `onEvent(eventType, payload, progress)`
- `evaluateUnlocks(progress, unlocked)`
