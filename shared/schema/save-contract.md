# Save Contract (v5)

Canonical iOS/GameCore save payload.

## Versioning

- Required top-level integer: `version`.
- Current version: `5`.
- Required deterministic RNG state seed: `daySeed` (uint64 encoded as JSON number).
- Readers may load older versions through explicit migrations.

## Shape

- `version`: integer
- `daySeed`: integer (>= 1)
- `player`: object
- `world`: object
- `meta`: object

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

### `meta`

- `buildingLevels`: map of `buildingId -> integer` (level)
- `completedResearch`: map of `researchId -> boolean`
- `discoveredHybrids`: map of `recipeId -> boolean`
- `expansionPurchases`: integer (>= 0)
- `livestockCounts`: map of `livestockId -> integer`
- `petLevels`: map of `petId -> integer`
- `fishCaughtCounts`: map of `fishId -> integer`
- `fishingPondLevel`: integer (>= 1)
- `challengeClaims`: map of `challengeId -> integer` (last claimed day)
- `challengeStreak`: integer (>= 0)
- `favoriteItems`: map of `itemId -> boolean` (only `true` entries should be stored)
- `time`: object
  - `currentTimeSeconds`: number (>= 0, seconds elapsed in current in-game day)
  - `dayIndex`: integer (>= 0, canonical day counter for time engine)
  - `lastRealWorldTimestamp`: number (>= 0, unix timestamp seconds for offline catch-up)

## Migration

`ios/GameCore/Sources/GameCore/Persistence.swift` contains the migration entrypoint (`SaveCodec.migrate`).

- `v1 -> v2`: introduces `meta` and defaults missing fields.
- `v2 -> v3`: adds livestock/pet/fishing/challenge meta fields.
- `v3 -> v4`: adds persisted `meta.time` state for automatic time progression + offline catch-up.
- `v4 -> v5`: adds persisted `meta.favoriteItems` for Barn favorites.
- Add per-version transforms there before changing `currentVersion`.
