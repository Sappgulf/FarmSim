# Content Pipeline — Season Pack Pipeline v1

**Date:** 2026-02-04

## Goals
- Establish a single, data-driven source of truth for FarmSim content (crops, decor, festivals, minigames, almanac, strings).
- Support drop-in Season Packs with deterministic merging and defensive validation.
- Keep save/load stable by preserving IDs and handling missing content safely.
- Avoid per-tick content scanning; load and validate at boot or on demand only.

## Directory Layout
```
content/
  crops.json
  decor.json
  festivals.json
  minigames.json
  almanac.json
  strings.json
  packs/
    <pack_id>/
      pack.json
      crops.json (optional)
      decor.json (optional)
      festivals.json (optional)
      minigames.json (optional)
      almanac.json (optional)
      strings.json (optional)
```

## Base Schema Summary
### Crops (`content/crops.json`)
Required fields per item:
- `id` (string, stable)
- `name` (string)
- `seasonTags` (string[])
- `growthTime` (number, seconds)
- `stages` (number)
- `baseValue` (number)
- `cost` (number)
- `icon` (string)

Additional fields used by the game:
- `emoji`, `description`, `category`, `season`, `level`

### Decor (`content/decor.json`)
Required fields per item:
- `id`, `name`, `category`, `cost`, `icon`
- `placementRules` (object; `gridSnap: true`)

Additional fields used by the game:
- `emoji`, `description`, `tags`, `rarity`, `season`, `seasonTags`

### Festivals (`content/festivals.json`)
Required fields per item:
- `id`, `name`, `cadence`, `description`, `seasonTags`
- `durationSeconds` (number)
- `effects` (object)
- `rewards` (object)

Additional fields used by the game:
- `icon`, `season`, `rarity`

### Minigames (`content/minigames.json`)
Required fields per item:
- `id`, `title`, `instructions`
- `rounds` (number)
- `speedCurve` (number[])
- `targetWindows` (object)
- `rewards` (object)

Additional fields used by the game:
- `festivalIds`, `seasonTags`, `playLimit`, `theme`, `sfx`, `qaSeed`

### Almanac (`content/almanac.json`)
- `sections[]`: `{ id, title, description, icon }`
- `pages[]`: `{ id, section, title, icon, hint, unlock, text }`
- `seasons[]`, `weatherTypes[]`
- `memoryLinks` (optional map: memory id → almanac page id)

### Strings (`content/strings.json`)
- `philosophies[]`: `{ id, name, description }`
- `ui` copy blocks (e.g., Town Board “What’s New” title)

## Pack Format (`content/packs/<pack_id>/pack.json`)
Required metadata fields:
- `id`, `name`, `version`, `description`, `createdAt`

Optional metadata fields:
- `author`, `contentCounts`, `highlights[]`
- `access`: `"free"` | `"premium"` (default `"free"`)
- `skuId`: string placeholder for future storefront mapping
- `badgeLabel`: optional label for UI badges (defaults to `"Premium"` when access is premium)

### Merge Rules
- Packs merge into base content at load in deterministic order (pack id sorting).
- ID conflicts are detected and skipped (never crash).
- Validation warnings/errors are visible only in debug mode.

## Validation Rules
- Missing required fields reported as warnings/errors.
- Numeric fields are clamped to non-negative values.
- ID conflicts are logged and skipped deterministically.
- Almanac pages must reference valid section IDs.
- Pack metadata validation:
  - `access` must be `"free"` or `"premium"`.
  - `skuId` (if present) must be alphanumeric/._-.
  - Pack IDs must be unique.

## Extension Guide
1. Create a new folder under `content/packs/<your_pack_id>/`.
2. Add a `pack.json` with metadata and highlights.
3. Add any of the optional content files you need.
4. Use stable string IDs — avoid renaming existing IDs.
5. Launch with `?debug=1` and use **Re-validate** / **Content Report** from the Debug Stress Panel to verify.

## Debug-Only Commands
- **Re-validate content**: rebuilds merged data + validation report.
- **Content report**: prints loaded packs, errors, and warnings to console.
