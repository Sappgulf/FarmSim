# Save Contract (v1)

Canonical iOS/GameCore save payload.

## Versioning

- Required top-level integer: `version`.
- Current version: `1`.
- Required deterministic RNG state seed: `daySeed` (uint64 encoded as JSON number).
- Readers may load older versions through explicit migrations.

## Shape

- `version`: integer
- `daySeed`: integer (>= 1)
- `player`: object
- `world`: object

### `player`

- `coins`: integer (>= 0)
- `xp`: integer (>= 0)
- `inventory`: object
- `inventory.seeds`: map of `cropId -> integer`
- `inventory.crops`: map of `cropId -> integer`

### `world`

- `day`: integer (>= 0)
- `gridWidth`: integer (> 0)
- `gridHeight`: integer (> 0)
- `tiles`: array length `gridWidth * gridHeight`

### `world.tiles[]`

- `index`: integer
- `state`: object
- `state.tilled`: boolean
- `state.watered`: boolean
- `planted`: object or `null`
- `planted.cropID`: string (if planted)
- `planted.plantedDay`: integer (if planted)

## Migration Stub

`ios/GameCore/Sources/GameCore/Persistence.swift` contains the migration entrypoint (`SaveCodec.migrate`). Add per-version transforms there before changing `currentVersion`.
