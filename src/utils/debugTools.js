const DEBUG_PARAM = 'debug';
const ACTION_TRACE_LIMIT = 100;

export const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(DEBUG_PARAM) === '1';
};

const createDebugState = () => ({
  enabled: false,
  actionTrace: [],
  lastError: null,
  timers: {
    timeouts: new Set(),
    intervals: new Set(),
  },
  listeners: {
    count: 0,
    registry: new WeakMap(),
  },
});

const getDebugState = () => {
  if (typeof window === 'undefined') return null;
  if (!window.__farmDebug) {
    window.__farmDebug = createDebugState();
  }
  return window.__farmDebug;
};

const storeError = (error, source = 'error') => {
  const debugState = getDebugState();
  if (!debugState) return;
  const normalized = error instanceof Error ? error : new Error(String(error));
  debugState.lastError = {
    message: normalized.message,
    stack: normalized.stack || '',
    source,
    time: new Date().toISOString(),
    trace: debugState.actionTrace.slice(),
  };
  window.dispatchEvent(new CustomEvent('farm-debug-error', { detail: debugState.lastError }));
};

const recordListener = (target, type, listener) => {
  const debugState = getDebugState();
  if (!debugState || !listener) return;
  const { registry } = debugState.listeners;
  let targetMap = registry.get(target);
  if (!targetMap) {
    targetMap = new Map();
    registry.set(target, targetMap);
  }
  let typeMap = targetMap.get(type);
  if (!typeMap) {
    typeMap = new Map();
    targetMap.set(type, typeMap);
  }
  const currentCount = typeMap.get(listener) || 0;
  typeMap.set(listener, currentCount + 1);
  debugState.listeners.count += 1;
};

const removeListenerRecord = (target, type, listener) => {
  const debugState = getDebugState();
  if (!debugState || !listener) return;
  const { registry } = debugState.listeners;
  const targetMap = registry.get(target);
  const typeMap = targetMap?.get(type);
  if (!typeMap) return;
  const currentCount = typeMap.get(listener);
  if (!currentCount) return;
  if (currentCount <= 1) {
    typeMap.delete(listener);
  } else {
    typeMap.set(listener, currentCount - 1);
  }
  debugState.listeners.count = Math.max(0, debugState.listeners.count - 1);
};

export const initDebugTools = () => {
  if (typeof window === 'undefined' || !isDebugMode()) return;
  if (window.__farmDebugInitialized) return;

  window.__farmDebugInitialized = true;
  const debugState = getDebugState();
  if (!debugState) return;
  debugState.enabled = true;

  if (!window.__farmDebugOriginals) {
    window.__farmDebugOriginals = {
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      setInterval: window.setInterval,
      clearInterval: window.clearInterval,
      addEventListener: EventTarget.prototype.addEventListener,
      removeEventListener: EventTarget.prototype.removeEventListener,
    };

    window.setTimeout = (...args) => {
      const id = window.__farmDebugOriginals.setTimeout(...args);
      debugState.timers.timeouts.add(id);
      return id;
    };

    window.clearTimeout = (id) => {
      debugState.timers.timeouts.delete(id);
      return window.__farmDebugOriginals.clearTimeout(id);
    };

    window.setInterval = (...args) => {
      const id = window.__farmDebugOriginals.setInterval(...args);
      debugState.timers.intervals.add(id);
      return id;
    };

    window.clearInterval = (id) => {
      debugState.timers.intervals.delete(id);
      return window.__farmDebugOriginals.clearInterval(id);
    };

    EventTarget.prototype.addEventListener = function addEventListener(...args) {
      recordListener(this, args[0], args[1]);
      return window.__farmDebugOriginals.addEventListener.apply(this, args);
    };

    EventTarget.prototype.removeEventListener = function removeEventListener(...args) {
      removeListenerRecord(this, args[0], args[1]);
      return window.__farmDebugOriginals.removeEventListener.apply(this, args);
    };
  }

  window.addEventListener('error', (event) => {
    storeError(event?.error || event?.message || 'Unknown error', 'window.onerror');
  });

  window.addEventListener('unhandledrejection', (event) => {
    storeError(event?.reason || 'Unhandled promise rejection', 'unhandledrejection');
  });
};

export const logDebugAction = (type, details = {}) => {
  const debugState = getDebugState();
  if (!debugState?.enabled) return;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toISOString(),
    type,
    details,
  };
  debugState.actionTrace.push(entry);
  if (debugState.actionTrace.length > ACTION_TRACE_LIMIT) {
    debugState.actionTrace.splice(0, debugState.actionTrace.length - ACTION_TRACE_LIMIT);
  }
  window.dispatchEvent(new CustomEvent('farm-debug-action', { detail: entry }));
};

export const getDebugMetrics = () => {
  const debugState = getDebugState();
  if (!debugState) return null;
  return {
    actionTrace: debugState.actionTrace.slice(),
    lastError: debugState.lastError,
    timerCount: debugState.timers.timeouts.size + debugState.timers.intervals.size,
    timeoutCount: debugState.timers.timeouts.size,
    intervalCount: debugState.timers.intervals.size,
    listenerCount: debugState.listeners.count,
  };
};

export const clearDebugError = () => {
  const debugState = getDebugState();
  if (!debugState) return;
  debugState.lastError = null;
  window.dispatchEvent(new CustomEvent('farm-debug-error', { detail: null }));
};
