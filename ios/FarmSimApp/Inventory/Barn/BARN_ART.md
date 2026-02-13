# Barn Inventory Art Plan

## Target Look
- Warm wood interior with subtle plank texture and dark beams.
- Soft overhead loft light to make cards feel cozy and readable.
- Gentle vignette to keep focus on shelf content.
- Farm-friendly iconography: sprout, crate, tools, decor, and specials.

## Constraints
- Preserve item readability above all visual decoration.
- Support both light and dark mode using semantic tokens.
- Scale cleanly across small and large iPhone screens.
- Avoid heavy textures and full-screen raster assets where possible.
- Keep runtime cheap: gradients + shape layers over large image stacks.

## Asset Plan
- `BarnBackground`: implemented as layered SwiftUI gradients and lightweight geometric plank/beam overlays.
- `Shelf panels`: implemented as reusable rounded material cards with semantic strokes and shadows.
- `Category icons`: SF Symbols first (`leaf.fill`, `shippingbox.fill`, `hammer.fill`, `paintpalette.fill`, `star.fill`).
- Optional future art drop:
  - `BarnBackground.pdf` vector background for richer framing.
  - `BarnShelfFrame.pdf` resizable vector shelf trim.
  - Keep any fallback PNGs compressed and under practical texture budgets.
