import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { FARM_SW_UPDATE_EVENT } from '../../../utils/registerFarmServiceWorker';

/**
 * Shown when a new service worker is installed alongside an active controller.
 * Prompts a reload so hashed assets stay in sync (production builds only).
 */
const SwUpdateBanner = memo(() => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) return undefined;
    const show = () => setVisible(true);
    window.addEventListener(FARM_SW_UPDATE_EVENT, show);
    return () => window.removeEventListener(FARM_SW_UPDATE_EVENT, show);
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-[5.25rem] left-1/2 z-[90] flex w-[min(100%,22rem)] -translate-x-1/2 animate-overlay-card flex-col gap-2 rounded-2xl border border-emerald-200/80 bg-white/95 px-3 py-2.5 text-sm shadow-xl backdrop-blur-md sm:bottom-4 sm:w-auto sm:min-w-[280px]"
      role="status"
      aria-live="polite"
    >
      <div className="font-semibold text-slate-900">Update ready</div>
      <p className="text-xs leading-snug text-slate-600">
        A new version finished downloading. Reload to avoid mismatched bundles.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[38px]"
          onClick={handleDismiss}
        >
          Later
        </Button>
        <Button
          type="button"
          size="sm"
          className="min-h-[38px]"
          onClick={handleReload}
          aria-label="Reload page to apply update"
        >
          Reload
        </Button>
      </div>
    </div>
  );
});

SwUpdateBanner.displayName = 'SwUpdateBanner';

export default SwUpdateBanner;
