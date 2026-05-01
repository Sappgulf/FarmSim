/**
 * Lightweight runtime hints for first-load defaults (no persistence).
 * Keep pure enough for Vitest/jsdom (missing matchMedia → high quality).
 */

/**
 * Prefer Medium graphics on phones / coarse pointers with modest CPU cores so first-run stays smooth.
 * Saved games keep whatever `settings.graphicsQuality` was migrated to.
 * @returns {'high'|'medium'|'low'}
 */
export function inferDefaultGraphicsQuality() {
  if (typeof window === 'undefined') return 'high';
  try {
    const narrow = window.matchMedia?.('(max-width: 640px)')?.matches === true;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches === true;
    const cores =
      typeof navigator !== 'undefined' && Number.isFinite(navigator.hardwareConcurrency)
        ? navigator.hardwareConcurrency
        : 8;
    if (narrow || (coarse && cores <= 6)) return 'medium';
  } catch {
    /* matchMedia can throw in restrictive embeds */
  }
  return 'high';
}
