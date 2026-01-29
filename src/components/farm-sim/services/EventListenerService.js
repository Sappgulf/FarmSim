import { getPerfMetrics, isDebugEnabled } from './DebugService';

/**
 * Adds an event listener and tracks listener count when debug is enabled.
 * Returns a cleanup function that removes the listener and updates metrics.
 */
export const addTrackedEventListener = (target, type, listener, options) => {
  if (!target?.addEventListener) {
    return () => {};
  }

  const shouldTrack = isDebugEnabled();
  const metrics = shouldTrack ? getPerfMetrics() : null;
  let active = true;

  const decrement = () => {
    if (!shouldTrack || !metrics || !active) return;
    metrics.listenerCount = Math.max(0, (metrics.listenerCount || 0) - 1);
    active = false;
  };

  const wrappedListener = options?.once
    ? (...args) => {
        try {
          listener(...args);
        } finally {
          decrement();
        }
      }
    : listener;

  target.addEventListener(type, wrappedListener, options);

  if (shouldTrack && metrics) {
    metrics.listenerCount = (metrics.listenerCount || 0) + 1;
  }

  return () => {
    target.removeEventListener(type, wrappedListener, options);
    decrement();
  };
};
