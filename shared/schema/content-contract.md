# Content Contract (v1)

Canonical game content lives in `shared/content`.

## Required Base Files

- `shared/content/crops.json`
- `shared/content/decor.json`
- `shared/content/festivals.json`
- `shared/content/almanac.json`
- `shared/content/minigames.json`
- `shared/content/strings.json`

## crops.json Requirements

- Top-level `schemaVersion` (integer)
- Top-level `items` (array)
- Each crop item requires:
  - `id` (string, unique)
  - `name` (string)
  - `cost` (number >= 0)
  - `baseValue` (number >= 0)
  - `growthTime` (number > 0)
  - `stages` (number > 0)

## Pack Content

Optional packs are discovered from `shared/content/packs/**`:
- `pack.json`
- Optional `crops.json`, `decor.json`, `festivals.json`, `almanac.json`, `minigames.json`, `strings.json`

## Versioning Rules

- Increment the file `schemaVersion` when changing field semantics.
- Additive fields are preferred over renames/removals.
- Breaking changes require migration notes in `shared/schema/save-contract.md` and changelog updates.
