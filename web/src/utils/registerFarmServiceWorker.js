/** Dispatched when a new worker is installed while an older one still controls the page. */
export const FARM_SW_UPDATE_EVENT = 'farm-sw-update-available';

const HOUR_MS = 3600000;

/**
 * Register the FarmSim service worker (production callers only).
 * Returns `dispose()` to detach visibility listener and hourly update ping.
 *
 * @param {string} [scriptUrl='./sw.js']
 * @returns {Promise<{ dispose: () => void }>}
 */
export async function registerFarmServiceWorker(scriptUrl = './sw.js') {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { dispose: () => {} };
  }

  /** @type {ReturnType<typeof setInterval> | null} */
  let intervalId = null;

  const registration = await navigator.serviceWorker.register(scriptUrl);

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      registration.update().catch(() => {});
    }
  };

  const attachInstallingHandlers = () => {
    const nw = registration.installing;
    if (!nw) return;
    const onStateChange = () => {
      if (nw.state === 'installed' && navigator.serviceWorker.controller) {
        window.dispatchEvent(new CustomEvent(FARM_SW_UPDATE_EVENT));
      }
    };
    nw.addEventListener('statechange', onStateChange);
  };

  const onUpdateFound = () => {
    attachInstallingHandlers();
  };

  registration.addEventListener('updatefound', onUpdateFound);
  attachInstallingHandlers();

  document.addEventListener('visibilitychange', onVisibilityChange);
  intervalId = setInterval(() => registration.update().catch(() => {}), HOUR_MS);

  return {
    dispose: () => {
      registration.removeEventListener('updatefound', onUpdateFound);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
