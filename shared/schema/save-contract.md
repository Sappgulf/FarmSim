# Save Contract (v1)

Canonical save payload for cross-platform FarmSim saves.

## Versioning

- Every save MUST include a top-level integer `version`.
- Current canonical version: `1`.
- Backward compatibility rule: readers may load older versions via migration.
- Forward compatibility rule: unknown fields must be ignored.

## Shape

- `version`: integer
- `day`: integer (>= 0)
- `coins`: integer (>= 0)
- `player`: object
- `world`: object

### `player`

- `inventory`: object
- `inventory.seeds`: map of `cropId -> integer`
- `inventory.crops`: map of `cropId -> integer`

### `world`

- `gridWidth`: integer (> 0)
- `gridHeight`: integer (> 0)
- `tiles`: array length `gridWidth * gridHeight`

### `world.tiles[]`

- `index`: integer
- `plantedCropId`: string or `null`
- `plantedDay`: integer or `null`

## Migration Placeholder

When a new version ships, add explicit migration steps in code (e.g. `v1 -> v2`) before normal decode/validation.
