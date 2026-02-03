# UI Guide — FarmSim Design System

**Date:** 2026-02-03  
**Scope:** FarmSim UI (mobile-first, 375px baseline)

## Design Tokens (CSS Variables)
Defined in `src/index.css` under `:root`.

### Spacing
- `--space-xs`: 0.25rem
- `--space-sm`: 0.5rem
- `--space-md`: 1rem
- `--space-lg`: 1.5rem
- `--space-xl`: 2rem
- `--space-2xl`: 3rem

### Typography
- Font family: `--font-sans`
- Sizes: `--font-size-xs` → `--font-size-2xl`
- Line heights: `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

### Radii & Borders
- Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
- Borders: `--border-thin`, `--border-thick`
- Border color: `--border-color-soft`, `--border-color-strong`

### Colors
- Primary: `--color-primary-50` → `--color-primary-900`
- Accent: `--color-accent-50` → `--color-accent-700`
- Semantic: `--color-success`, `--color-warning`, `--color-error`, `--color-info`

### Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow`

## Buttons
All buttons are built on `src/components/ui/button.jsx`.

### Variants
- **Primary**: `variant="default"` — gradient green primary.
- **Secondary**: `variant="secondary"` — neutral gradient for secondary actions.
- **Ghost**: `variant="ghost"` — transparent background, minimal affordance.
- **Outline**: `variant="outline"` — white background + border for neutral actions.
- **Destructive**: `variant="destructive"` — red gradient for irreversible actions.

### States
- **Active/Pressed**: scale down (`active:scale-95`).
- **Disabled**: `disabled:opacity-50` + `disabled:pointer-events-none`.
- **Focus**: `focus-visible:ring-2` for keyboard access.

## Panels & Cards
- **Base card**: `Card` component (`src/components/ui/card.jsx`).
- **Glass card**: `.glass-card` utility for soft blur + premium feel.
- **Panel headers**: title + helper text when needed; keep header padding consistent with body.

## Icons
### Standard Sizes
- Small: `.icon-16` (16px)
- Medium: `.icon-20` (20px)
- Large: `.icon-24` (24px)

### Rules
- Use lucide-react icons for UI controls, tabs, and navigation.
- Emoji is acceptable for content items (crops, decor) and as fallback.
- If an icon is missing, fallback to a neutral placeholder; do not block render.
- Debug preflight (via ContentManager) warns on missing content icons when `?debug=1`.

## Typography Rules
- **Titles**: use `text-lg` or `text-xl` with `font-semibold`.
- **Subtitles**: `text-sm`/`text-base` with muted color.
- **Body**: `text-sm`/`text-base`, `leading-normal`.
- **Helper text**: `text-xs`/`text-sm`, `text-gray-500`.

## Motion & Accessibility
- Prefer transform/opacity transitions.
- Respect `prefers-reduced-motion` and in-game `animationsEnabled` setting.
- Avoid per-tick UI updates; only update on open/data change.
