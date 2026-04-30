/** Slate-950 — matches Tailwind slate-950 for standalone status bar cohesion in dark UI */
export const DEFAULT_DARK_THEME_COLOR = '#020617';

/** Meadow default accent when theme not yet hydrated */
export const DEFAULT_LIGHT_THEME_COLOR = '#16a34a';

const THEME_META_NAME = 'theme-color';
const APPLE_STATUS_META = 'apple-mobile-web-app-status-bar-style';

/** @typedef {{ themeColor: string, appleStatusBarStyle: string }} ChromePreview */

export function subscribeFarmSimDarkMode(onStoreChange) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }
  const observer = new MutationObserver(() => {
    onStoreChange();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const onOtherTabDarkMode = (e) => {
    if (e.key === 'farmSim_darkMode') onStoreChange();
  };
  window.addEventListener('storage', onOtherTabDarkMode);

  return () => {
    observer.disconnect();
    window.removeEventListener('storage', onOtherTabDarkMode);
  };
}

export function getFarmSimDarkModeSnapshot() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Computes browser chrome hints from farm accent + Tailwind dark class.
 * @param {string | undefined | null} accentHex
 * @param {boolean} dark
 * @returns {ChromePreview}
 */
export function resolveFarmSimChrome(accentHex, dark) {
  const accent = accentHex && accentHex.startsWith('#') ? accentHex : DEFAULT_LIGHT_THEME_COLOR;
  const themeColor = dark ? DEFAULT_DARK_THEME_COLOR : accent;
  return {
    themeColor,
    appleStatusBarStyle: dark ? 'black-translucent' : 'default',
  };
}

/** @param {{ themeColor: string, appleStatusBarStyle: string }} opts */
export function applyFarmSimChromeMeta({ themeColor, appleStatusBarStyle }) {
  if (typeof document === 'undefined') return;

  let colorMeta = document.querySelector(`meta[name="${THEME_META_NAME}"]`);
  if (!colorMeta) {
    colorMeta = document.createElement('meta');
    colorMeta.setAttribute('name', THEME_META_NAME);
    document.head.appendChild(colorMeta);
  }
  colorMeta.setAttribute('content', themeColor);

  const barMeta = document.querySelector(`meta[name="${APPLE_STATUS_META}"]`);
  if (barMeta) {
    barMeta.setAttribute('content', appleStatusBarStyle);
  }
}

/**
 * Applies default chrome before React — avoids wrong bar color on cold load.
 * @param {boolean} dark
 */
export function applyInitialFarmSimChromeMeta(dark) {
  applyFarmSimChromeMeta(resolveFarmSimChrome(DEFAULT_LIGHT_THEME_COLOR, dark));
}
