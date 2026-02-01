let debugInitialized = false;
let timersPatched = false;

const PROFILE_WINDOW_MS = 5000;

const pruneSamples = (samples, cutoff) => {
  if (!Array.isArray(samples)) return;
  let keepIndex = 0;
  while (keepIndex < samples.length && samples[keepIndex].t < cutoff) {
    keepIndex += 1;
  }
  if (keepIndex > 0) {
    samples.splice(0, keepIndex);
  }
};

let debugParamCached = null;

const getDebugParamEnabled = () => {
  if (typeof window === 'undefined') return false;
  if (debugParamCached !== null) return debugParamCached;

  const params = new URLSearchParams(window.location.search);
  if (!params.has('debug')) {
    debugParamCached = false;
    return false;
  }
  const value = params.get('debug');
  if (value === null || value === '') {
    debugParamCached = true;
    return true;
  }
  debugParamCached = value === '1' || value.toLowerCase() === 'true';
  return debugParamCached;
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
      activeTimers: 0,
      frameTimes: [],
      profileSamples: {},
      profileStarts: {},
    };
  }

  if (enabled && !timersPatched) {
    timersPatched = true;
    const metrics = window.__perfMetrics;
    const timeoutIds = new Map();
    const intervalIds = new Map();

    const updateTimerCount = () => {
      metrics.activeTimers = timeoutIds.size + intervalIds.size;
    };

    const originalSetTimeout = window.setTimeout;
    const originalClearTimeout = window.clearTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;

    window.setTimeout = (handler, timeout, ...args) => {
      const id = originalSetTimeout(() => {
        if (timeoutIds.has(id)) {
          timeoutIds.delete(id);
          updateTimerCount();
        }
        if (typeof handler === 'function') {
          handler(...args);
        } else if (handler != null) {
          // eslint-disable-next-line no-new-func
          const fn = new Function(handler);
          fn();
        }
      }, timeout);
      timeoutIds.set(id, true);
      updateTimerCount();
      return id;
    };

    window.clearTimeout = (id) => {
      if (timeoutIds.has(id)) {
        timeoutIds.delete(id);
        updateTimerCount();
      }
      return originalClearTimeout(id);
    };

    window.setInterval = (handler, timeout, ...args) => {
      const id = originalSetInterval(() => {
        if (typeof handler === 'function') {
          handler(...args);
        } else if (handler != null) {
          // eslint-disable-next-line no-new-func
          const fn = new Function(handler);
          fn();
        }
      }, timeout);
      intervalIds.set(id, true);
      updateTimerCount();
      return id;
    };

    window.clearInterval = (id) => {
      if (intervalIds.has(id)) {
        intervalIds.delete(id);
        updateTimerCount();
      }
      return originalClearInterval(id);
    };
  }
};

export const getPerfMetrics = () => {
  if (typeof window === 'undefined') return null;
  return window.__perfMetrics || null;
};

export const recordFrameTime = (deltaMs) => {
  const metrics = getPerfMetrics();
  if (!metrics) return;
  const now = Date.now();
  if (!Array.isArray(metrics.frameTimes)) {
    metrics.frameTimes = [];
  }
  metrics.frameTimes.push({ t: now, dt: deltaMs });
  pruneSamples(metrics.frameTimes, now - PROFILE_WINDOW_MS);
};

export const profileStart = (name) => {
  if (!isDebugEnabled()) return;
  const metrics = getPerfMetrics();
  if (!metrics) return;
  if (!metrics.profileStarts) {
    metrics.profileStarts = {};
  }
  if (!metrics.profileStarts[name]) {
    metrics.profileStarts[name] = [];
  }
  metrics.profileStarts[name].push(performance.now());
};

export const profileEnd = (name) => {
  if (!isDebugEnabled()) return;
  const metrics = getPerfMetrics();
  if (!metrics || !metrics.profileStarts?.[name]?.length) return;
  const start = metrics.profileStarts[name].pop();
  const duration = performance.now() - start;
  const now = Date.now();

  if (!metrics.profileSamples) {
    metrics.profileSamples = {};
  }
  if (!metrics.profileSamples[name]) {
    metrics.profileSamples[name] = [];
  }
  const samples = metrics.profileSamples[name];
  samples.push({ t: now, d: duration });
  pruneSamples(samples, now - PROFILE_WINDOW_MS);
};

export const getProfilerStats = (windowMs = PROFILE_WINDOW_MS) => {
  const metrics = getPerfMetrics();
  if (!metrics?.profileSamples) return [];
  const cutoff = Date.now() - windowMs;
  const entries = [];

  Object.entries(metrics.profileSamples).forEach(([name, samples]) => {
    pruneSamples(samples, cutoff);
    if (!samples.length) return;
    let total = 0;
    let max = 0;
    samples.forEach(sample => {
      total += sample.d;
      if (sample.d > max) max = sample.d;
    });
    entries.push({
      name,
      avg: total / samples.length,
      max,
      count: samples.length,
    });
  });

  entries.sort((a, b) => b.avg - a.avg);
  return entries;
};
