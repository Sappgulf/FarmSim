let debugInitialized = false;

const getDebugParamEnabled = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('debug')) return false;
  const value = params.get('debug');
  if (value === null || value === '') return true;
  return value === '1' || value.toLowerCase() === 'true';
};

/**
 * Determine if debug instrumentation is enabled.
 * Priority: explicit window.__DEV__ -> ?debug=1
 * @returns {boolean}
 */
export const isDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  if (typeof window.__DEV__ === 'boolean') {
    return window.__DEV__;
  }
  return getDebugParamEnabled();
};

/**
 * Ensure debug globals are initialized for instrumentation.
 */
export const initializeDebugGlobals = () => {
  if (debugInitialized || typeof window === 'undefined') return;
  debugInitialized = true;

  const enabled = isDebugEnabled();
  if (typeof window.__DEV__ !== 'boolean') {
    window.__DEV__ = enabled;
  }

  if (!enabled) return;

  window.__farmDebug = window.__farmDebug || {};
  window.__farmDebug.perf = true;

  if (!window.__perfMetrics) {
    window.__perfMetrics = {
      listenerCount: 0,
      lastUpdateTime: 0,
      lastRenderTime: 0,
      lastTickTime: 0,
    };
  }
};

export const getPerfMetrics = () => {
  if (typeof window === 'undefined') return null;
  return window.__perfMetrics || null;
};
