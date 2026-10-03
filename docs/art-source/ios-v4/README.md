# Native artwork upgrade — 2026-10-02

Built-in ImageGen produced ten new assets for the SwiftUI/SpriteKit app. Existing artwork remains in the asset catalog. Prompts and ordering are in [asset-spec.json](asset-spec.json); installed-file dimensions, byte counts, SHA-256 hashes, and generation filenames are in [manifest.json](manifest.json).

## Coverage and integration

- Four transparent crop sheets add 128 growth sprites for 32 crops. The existing approved wheat, tomato, and corn sheet supplies another 12: all 35 bundled crops have four stages.
- The farm-object sheet contains six buildings, five livestock animals, four additional pet objects (dog, cat, rabbit, hive), and the pond. The chicken pet shares the chicken illustration.
- The fishing sheet covers all eleven fish types plus the float/hook. Art appears in the pond header, cast state, moving fish/hook, catch result, and catch log.
- The portrait menu background is 971 × 1619, replacing the 640-pixel square background. It fills the start screen through the home-indicator edge; the removed subtitle and separate footer no longer cover it. The selected app icon is an opaque 1024 × 1024 PNG, resized with Apple's standard encoder from the generated original.
- Grass, soil, stone, and wood are measured regions of a 1254 × 1254 material sheet. The individual textures are approximately 627 pixels square; this is a style upgrade, not a resolution increase over the old 640-pixel surfaces. Grass and soil render in FarmScene; stone appears subtly beneath Town, and wood grain appears in farm panels and the new cream Market cards.
- A transparent striped-awning market stall illustrates the Town header; all ten departments share the new paper/timber card language.
- Crop thumbnails appear in both seed pickers, shop/market cards, Barn cards/detail sheets, Almanac, and Genetics. Buildings, animals, and pets appear on their existing purchase/status cards. Research retains semantic SF Symbols where the subject is abstract, with hive/pond artwork for the matching subjects.

## Technical choices

Generated subjects do not follow a perfectly uniform grid. Source alpha was measured to find clear row/column separators, then tight subject bounds were recorded in `ios/App/Resources/GameArtwork.json`. The source sheets were copied intact; measuring regions does not repaint or composite them. SpriteKit flips the shared top-origin pixel rectangles into bottom-origin normalized texture coordinates. Crop sprites preserve aspect ratio and use a fixed bottom anchor with deliberate stage sizes.

SwiftUI thumbnails render into buffers no larger than 192 pixels per side. Atlas and thumbnail caches have explicit memory budgets and load on demand. Decorative images do not replace native button labels or accessibility descriptions.

This pass adds no simulated ownership, new purchase rules, or save migration. Animals and buildings have illustrations in the existing interfaces; they are not new state-driven residents of the farm scene. Unused decor content and future unknown items retain their existing fallback representation. Texture edge continuity and physical-device memory/energy performance require further measurement.

## Verification

The native app tests check each bundled content ID against a loadable illustration, all 140 crop stages, region bounds and source dimensions, transparency, thumbnail size, icon selection, invalid bounds, stage boundaries, and the actual FarmScene renderer. Runtime screenshots and final test results are recorded in [gameplay QA](../../audits/2026-10-02/GAMEPLAY-QA.md).
