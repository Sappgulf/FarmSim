import React, { useMemo, useSyncExternalStore } from 'react';
import { isDebugEnabled } from '../services/DebugService';
import {
  formatDebugReport,
  getDebugStoreSnapshot,
  subscribeDebugStore,
} from '../services/DebugTraceService';

const DevErrorOverlay = () => {
  const debugEnabled = isDebugEnabled();
  const store = useSyncExternalStore(subscribeDebugStore, getDebugStoreSnapshot, getDebugStoreSnapshot);

  const reportText = useMemo(() => formatDebugReport(store), [store]);

  if (!debugEnabled || store.errors.length === 0) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
    } catch (error) {
      console.error('[farm] Failed to copy debug report', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/60 p-4 overflow-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-950 text-slate-100 shadow-2xl border border-slate-700/60">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">⚠️ Debug Error Overlay</h2>
            <p className="text-sm text-slate-400">Captured runtime errors and recent actions/logs.</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-emerald-500/90 text-emerald-950 font-semibold hover:bg-emerald-400 transition"
          >
            Copy Debug Report
          </button>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <section>
            <h3 className="text-sm font-semibold text-emerald-300 mb-2">Errors</h3>
            <div className="space-y-3">
              {store.errors.map((error, index) => (
                <div key={`${error.timestamp}-${index}`} className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
                  <div className="font-semibold text-red-300">{error.message}</div>
                  {error.stack && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-300">{error.stack}</pre>
                  )}
                  {error.context && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-400">{JSON.stringify(error.context, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-sky-300 mb-2">Recent Actions</h3>
            <div className="max-h-64 overflow-auto rounded-lg bg-slate-900/70 border border-slate-800 p-3 space-y-2">
              {store.actions.length === 0 && <div className="text-slate-400">No actions recorded.</div>}
              {store.actions.map((action, index) => (
                <div key={`${action.timestamp}-${index}`} className="text-xs text-slate-200">
                  <span className="text-slate-400">{new Date(action.timestamp).toLocaleTimeString()} · </span>
                  <span className="font-semibold text-slate-100">{action.type}</span>
                  <span className="text-slate-400"> — {JSON.stringify(action.details)}</span>
                  {action.snapshot && (
                    <div className="text-[11px] text-slate-500">state: {JSON.stringify(action.snapshot)}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-violet-300 mb-2">Recent Logs</h3>
            <div className="max-h-48 overflow-auto rounded-lg bg-slate-900/70 border border-slate-800 p-3 space-y-2">
              {store.logs.length === 0 && <div className="text-slate-400">No logs recorded.</div>}
              {store.logs.map((log, index) => (
                <div key={`${log.timestamp}-${index}`} className="text-xs text-slate-200">
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()} [{log.level}]</span> {log.message}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DevErrorOverlay;
