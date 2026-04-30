import { useEffect, useSyncExternalStore } from 'react';
import {
  resolveFarmSimChrome,
  subscribeFarmSimDarkMode,
  getFarmSimDarkModeSnapshot,
  applyFarmSimChromeMeta,
} from '../utils/documentThemeMeta';

/**
 * Keeps `<meta name="theme-color">` and iOS standalone status-bar style aligned
 * with farm theme accent + Tailwind `.dark`.
 * @param {string | undefined} themeAccentHex
 */
export function useFarmSimDocumentMeta(themeAccentHex) {
  const dark = useSyncExternalStore(
    subscribeFarmSimDarkMode,
    getFarmSimDarkModeSnapshot,
    () => false
  );

  useEffect(() => {
    applyFarmSimChromeMeta(resolveFarmSimChrome(themeAccentHex, dark));
  }, [dark, themeAccentHex]);
}
