# FarmSim v3 art production

Produced on 2026-10-02 with the built-in ImageGen tool, using the project's existing v2 art as visual reference. These are generated derivatives, not externally downloaded stock assets.

## World scenery

- Reference: `web/public/assets/farm-overview-v2.webp`.
- Production brief: retain the warm painterly farm, barn, pond, fences, and windmill; remove baked crop growth so runtime plots can depict the saved farm truthfully; no text/UI.
- Source: `docs/art-source/farm-world-v3.png`.
- Runtime: `web/public/assets/farm-world-v3.webp`, 1672 × 941, approximately 543 KiB.
- Generation ID: `exec-f5068a73-4e82-4eaa-ad1a-37f85695ba95`.
- Landscape scenery is static. The 30 plot buttons, growth, watering, readiness, selection, and unlocked land are runtime overlays. Buildings and animals are not yet complete state-driven world layers.

## Transparent crop atlas

- Reference: `web/public/assets/crop-stages-v2.webp`.
- Production brief: preserve painterly perspective/lighting, transparent background, exactly four growth stages in columns and wheat/tomato/corn in rows, with consistent scale and clear silhouettes.
- Source/native asset: `ios/App/Assets.xcassets/crop_stages_v3.imageset/crop_stages_v3.png`.
- Web runtime: `web/public/assets/crop-stages-v3.webp`, 1254 × 1254, approximately 552 KiB.
- Generation ID: `exec-5ac593fe-f842-4874-a862-217fd5bb6b47`.
- Grid: 4 columns × 3 rows; row order wheat, tomato, corn; column order seedling, young, growing, harvest-ready.
- Web uses normalized background positions. SpriteKit uses cached SKTexture regions and flips the row origin for texture coordinates. The ready flag selects the final frame; other frames derive from growth progress.
- Native crops outside these three retain their existing representation. The atlas is an initial validated subset, not a complete native art catalog.

PNG sources were inspected before integration. Runtime copies were converted with standard image encoders; transparency is preserved. Actual web and native screenshots are in `screenshots/`.
