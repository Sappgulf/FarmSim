# Sprint I4 Social Lite

## Seed Codes
- Format: `FS1.<base64url-json>`.
- Payload: `{ version, seed, season, packs[], theme }`.
- Validation rejects malformed version/season/packs.

## Ghost Visits
- Snapshot format includes: farmName, farmTheme, season, dayCount, activeFarmTitle, spotlight, and compact plots.
- Imported snapshots render through `ghostVisit.snapshot.plots` and set `ghostVisit.active=true`.
- Ghost mode is read-only; mutating actions return early.

## Compatibility
- Save schema bumped to v13 with optional defaults: `seedProvenance`, `ghostVisit`, and `milestones`.
