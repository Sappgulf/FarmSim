/** Dispatched when a new worker is installed while an older one still controls the page. */
export const FARM_SW_UPDATE_EVENT = 'farm-sw-update-available';

const HOUR_MS = 3600000;
const hasDocument = typeof document !== 'undefined';
const hasWindow = typeof window !== 'undefined';
let hasDispatchedUpdateEvent = false;

function notifyUpdateAvailable() {
  if (!hasWindow || hasDispatchedUpdateEvent) return;
  hasDispatchedUpdateEvent = true;
  window.dispatchEvent(new CustomEvent(FARM_SW_UPDATE_EVENT));
}

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
  hasDispatchedUpdateEvent = false;

  const onVisibilityChange = () => {
    if (!hasDocument || document.visibilityState !== 'visible') return;
    if (!('update' in registration)) return;

    registration.update().catch(() => {});
  };

  const onStateChange = (nw) => {
    const handler = () => {
      if (nw.state === 'installed' && navigator.serviceWorker.controller) {
        notifyUpdateAvailable();
        nw.removeEventListener('statechange', handler);
      } else if (nw.state === 'activated' || nw.state === 'redundant') {
        nw.removeEventListener('statechange', handler);
      }
    };

    handler();
    nw.addEventListener('statechange', handler);
  };

  const onUpdateFound = () => {
    const nw = registration.installing;
    if (!nw) return;

    onStateChange(nw);
  };

  registration.addEventListener('updatefound', onUpdateFound);

  if (registration.installing) {
    onStateChange(registration.installing);
  }

  if (hasDocument) {
    document.addEventListener('visibilitychange', onVisibilityChange, { passive: true });
    intervalId = setInterval(() => registration.update().catch(() => {}), HOUR_MS);
  }

  return {
    dispose: () => {
      registration.removeEventListener('updatefound', onUpdateFound);
      if (hasDocument) {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
