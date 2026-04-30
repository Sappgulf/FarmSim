/**
 * Single shared game frame tick (driven by GameProvider's RAF).
 * Consolidates subsystem updates that must run alongside the FPS/autosave loop.
 */

import { isDevelopmentMode } from '../config/release.js';

/** @type {Set<(time: DOMHighResTimeStamp) => void>} */
const subscribers = new Set();

const FRAME_MARK_START = 'farm-frame-subscribers-start';
const FRAME_MEASURE_NAME = 'farm-frame-subscribers';

/**
 * @param {(time: DOMHighResTimeStamp) => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribeGameFrame(fn) {
  if (typeof fn !== 'function') return () => {};
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** @param {DOMHighResTimeStamp} time */
export function notifyGameFrame(time) {
  const profiling = isDevelopmentMode()
    && typeof performance.mark === 'function'
    && typeof performance.measure === 'function';

  if (profiling) {
    performance.mark(FRAME_MARK_START);
  }

  subscribers.forEach((fn) => {
    try {
      fn(time);
    } catch (e) {
      console.error('[farm] gameFrame subscriber error', e);
    }
  });

  if (profiling) {
    try {
      performance.measure(FRAME_MEASURE_NAME, FRAME_MARK_START);
      performance.clearMarks(FRAME_MARK_START);
      performance.clearMeasures(FRAME_MEASURE_NAME);
    } catch {
      /* ignore profiler errors */
    }
  }
}
