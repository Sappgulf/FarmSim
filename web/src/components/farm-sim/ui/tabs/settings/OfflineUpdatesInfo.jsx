import React, { memo } from 'react';
import { Card } from '../../../../ui/card';

/**
 * Explains PWA/service-worker update behavior (pairs with {@link ../../SwUpdateBanner.jsx}).
 */
export const OfflineUpdatesInfo = memo(() => (
  <Card className="overflow-hidden border-teal-200/70 bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 p-4">
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
      Offline &amp; updates
    </div>
    <h4 className="mt-1 text-base font-semibold text-slate-900">
      Service worker &amp; fresh assets
    </h4>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">
      In production, FarmSim may prefetch files for offline play. When a new build is published, a
      banner can offer <strong className="font-medium text-slate-800">Reload</strong> so JS and
      cached HTML stay in sync. If anything looks stale, use a normal browser refresh or clear site
      data for this origin (your cloud save from{' '}
      <strong className="font-medium">Export Save File</strong> stays in the file you downloaded).
    </p>
  </Card>
));

OfflineUpdatesInfo.displayName = 'OfflineUpdatesInfo';
