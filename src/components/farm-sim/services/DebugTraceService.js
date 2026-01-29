import { initializeDebugGlobals, isDebugEnabled } from './DebugService';

const MAX_LOG_LINES = 50;
const MAX_ACTIONS = 100;
const MAX_ERRORS = 20;

let tracingInitialized = false;
let consolePatched = false;

const listeners = new Set();

const getStore = () => {
  if (typeof window === 'undefined') return null;
  if (!window.__farmDebugTraceStore) {
    window.__farmDebugTraceStore = {
      logs: [],
      actions: [],
      errors: [],
      lastUpdated: Date.now(),
    };
  }
  return window.__farmDebugTraceStore;
};

const notify = () => {
  listeners.forEach(listener => listener());
};

const formatLogLine = (args) => {
  return args.map(arg => {
    if (typeof arg === 'string') return arg;
    try {
      return JSON.stringify(arg);
    } catch (error) {
      return String(arg);
    }
  }).join(' ');
};

const addLogLine = (level, args) => {
  const store = getStore();
  if (!store) return;
  store.logs.push({
    level,
    message: formatLogLine(args),
    timestamp: Date.now(),
  });
  if (store.logs.length > MAX_LOG_LINES) {
    store.logs.splice(0, store.logs.length - MAX_LOG_LINES);
  }
  store.lastUpdated = Date.now();
  notify();
};

const addAction = (entry) => {
  const store = getStore();
  if (!store) return;
  store.actions.push(entry);
  if (store.actions.length > MAX_ACTIONS) {
    store.actions.splice(0, store.actions.length - MAX_ACTIONS);
  }
  store.lastUpdated = Date.now();
  notify();
};

const addError = (entry) => {
  const store = getStore();
  if (!store) return;
  store.errors.push(entry);
  if (store.errors.length > MAX_ERRORS) {
    store.errors.splice(0, store.errors.length - MAX_ERRORS);
  }
  store.lastUpdated = Date.now();
  notify();
};

export const getDebugSnapshot = (state) => {
  if (!state) return null;
  const plots = Array.isArray(state.plots) ? state.plots : [];
  const notifications = Array.isArray(state.notifications) ? state.notifications : [];
  const inventory = state.inventory && typeof state.inventory === 'object'
    ? Object.keys(state.inventory).length
    : 0;
  return {
    coins: state.coins,
    level: state.level,
    plotsLength: plots.length,
    plotsActive: plots.filter(plot => plot?.state && plot.state !== 'empty').length,
    notificationsLength: notifications.length,
    animalsLength: state.livestock?.animals?.length || 0,
    processingQueueLength: state.processingQueue?.length || 0,
    inventorySlots: inventory,
    selectedCrop: state.selectedCrop,
  };
};

export const traceAction = (type, details = {}, state = null) => {
  if (!isDebugEnabled()) return;
  addAction({
    type,
    details,
    snapshot: getDebugSnapshot(state),
    timestamp: Date.now(),
  });
};

export const reportError = (error, context = {}) => {
  if (!isDebugEnabled()) return;
  addError({
    message: error?.message || String(error),
    stack: error?.stack || null,
    context,
    timestamp: Date.now(),
  });
};

export const reportDebugWarning = (message, context = {}) => {
  if (!isDebugEnabled()) return;
  addLogLine('warn', [`[debug-warning] ${message}`, context]);
};

export const initializeDebugTracing = () => {
  if (tracingInitialized || typeof window === 'undefined') return;
  tracingInitialized = true;

  initializeDebugGlobals();
  const debugEnabled = isDebugEnabled();

  const originalOnError = window.onerror;
  const originalOnUnhandledRejection = window.onunhandledrejection;

  window.onerror = (message, source, lineno, colno, error) => {
    if (debugEnabled) {
      reportError(error || new Error(message), {
        source,
        lineno,
        colno,
      });
    } else {
      console.error('[farm] Unhandled error:', message);
    }

    if (typeof originalOnError === 'function') {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.onunhandledrejection = (event) => {
    const reason = event?.reason;
    if (debugEnabled) {
      reportError(reason instanceof Error ? reason : new Error(String(reason)), {
        source: 'unhandledrejection',
      });
    } else {
      console.error('[farm] Unhandled promise rejection:', reason);
    }

    if (typeof originalOnUnhandledRejection === 'function') {
      return originalOnUnhandledRejection(event);
    }
    return false;
  };

  if (debugEnabled && !consolePatched) {
    consolePatched = true;
    ['log', 'warn', 'error', 'debug'].forEach((level) => {
      const original = console[level];
      if (typeof original !== 'function') return;
      console[level] = (...args) => {
        try {
          addLogLine(level, args);
        } finally {
          original(...args);
        }
      };
    });
  }
};

export const subscribeDebugStore = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getDebugStoreSnapshot = () => {
  const store = getStore();
  return store || { logs: [], actions: [], errors: [], lastUpdated: 0 };
};

export const formatDebugReport = (store) => {
  const lines = [];
  lines.push('FarmSim Debug Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('Errors:');
  if (!store.errors.length) {
    lines.push('  (none)');
  } else {
    store.errors.forEach((error, index) => {
      lines.push(`  ${index + 1}. ${error.message}`);
      if (error.stack) {
        lines.push(`     ${error.stack}`);
      }
      if (error.context) {
        lines.push(`     context: ${JSON.stringify(error.context)}`);
      }
    });
  }
  lines.push('');
  lines.push('Recent Actions:');
  if (!store.actions.length) {
    lines.push('  (none)');
  } else {
    store.actions.forEach((action) => {
      lines.push(`  - ${new Date(action.timestamp).toISOString()} | ${action.type} | ${JSON.stringify(action.details)} | snapshot=${JSON.stringify(action.snapshot)}`);
    });
  }
  lines.push('');
  lines.push('Recent Logs:');
  if (!store.logs.length) {
    lines.push('  (none)');
  } else {
    store.logs.forEach((log) => {
      lines.push(`  - ${new Date(log.timestamp).toISOString()} [${log.level}] ${log.message}`);
    });
  }
  return lines.join('\n');
};

let lastInvariantCheck = 0;
export const runDebugInvariants = (state) => {
  if (!isDebugEnabled()) return;
  if (typeof document === 'undefined') return;

  const now = Date.now();
  if (now - lastInvariantCheck < 1000) return;
  lastInvariantCheck = now;

  const plots = Array.isArray(state.plots) ? state.plots : [];
  const plotNodes = document.querySelectorAll('[data-plot-index]');
  if (plotNodes.length && plotNodes.length !== plots.length) {
    reportDebugWarning('Plot DOM count mismatch', {
      plots: plots.length,
      dom: plotNodes.length,
    });
  }

  const plotIds = new Set();
  let duplicatePlotIds = 0;
  plots.forEach((plot) => {
    if (!plot || plot.id === undefined || plot.id === null) return;
    if (plotIds.has(plot.id)) duplicatePlotIds += 1;
    plotIds.add(plot.id);
  });
  if (duplicatePlotIds > 0) {
    reportDebugWarning('Duplicate plot ids detected', { duplicatePlotIds });
  }

  const notificationNodes = document.querySelectorAll('[data-notification-id]');
  const notifications = Array.isArray(state.notifications) ? state.notifications : [];
  if (notificationNodes.length && notificationNodes.length > notifications.length) {
    reportDebugWarning('Notification DOM count exceeds state', {
      notifications: notifications.length,
      dom: notificationNodes.length,
    });
  }

  if (!Number.isFinite(state.coins)) {
    reportDebugWarning('Coins is not a finite number', { coins: state.coins });
  }
  if (!Number.isFinite(state.xp)) {
    reportDebugWarning('XP is not a finite number', { xp: state.xp });
  }
};
