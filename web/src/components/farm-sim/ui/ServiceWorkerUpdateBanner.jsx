import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';

/**
 * Non-blocking prompt after the controlling service worker changes so users load fresh hashed bundles.
 * Skips first-ever activation (no prior controller).
 */
function ServiceWorkerUpdateBannerComponent() {
  const [visible, setVisible] = useState(false);
  const hadControllerRef = useRef(
    typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller,
  );

  useEffect(() => {
    if (import.meta.env.DEV) return undefined;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return undefined;

    const onFocus = () => {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update()).catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus();
    };

    const onControllerChange = () => {
      if (hadControllerRef.current) {
        setVisible(true);
      }
      hadControllerRef.current = !!navigator.serviceWorker.controller;
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed left-[max(0.5rem,env(safe-area-inset-left,0px))] right-[max(0.5rem,env(safe-area-inset-right,0px))] z-[46] max-w-lg mx-auto animate-fade-in"
      style={{ bottom: 'calc(6.25rem + env(safe-area-inset-bottom, 0px))' }}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-white p-3 shadow-xl backdrop-blur-md dark:border-sky-800/60 dark:from-sky-950/90 dark:to-slate-900/95">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <RefreshCw className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-50">Update ready</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Reload once to pick up the latest FarmSim build (your save stays local).
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setVisible(false)}>
              Later
            </Button>
            <Button type="button" size="sm" onClick={reload} className="gap-1">
              <RefreshCw className="h-4 w-4" aria-hidden />
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ServiceWorkerUpdateBannerComponent);
