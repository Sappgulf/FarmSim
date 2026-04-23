import React, { memo, useMemo } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { isDebugMode } from '../../../utils/debugTools';
import { getPackMeta } from '../entitlements/EntitlementManager';
import { Lock, Sparkles } from 'lucide-react';

const PremiumLockModal = memo(() => {
  const actions = useGameActions();
  const lock = useGameSelector((state) => state.premiumLockPrompt || null);
  const debugEnabled = isDebugMode();

  const packMeta = useMemo(() => (
    lock?.packId ? getPackMeta(lock.packId) : null
  ), [lock?.packId]);

  if (!lock) return null;

  const badgeLabel = lock.badgeLabel || packMeta?.badgeLabel || 'Premium';
  const packName = packMeta?.name || null;

  const handleClose = () => {
    actions.clearPremiumLockPrompt();
  };

  const handleGrant = () => {
    if (lock.packId) {
      actions.grantPackEntitlement(lock.packId);
    }
    actions.clearPremiumLockPrompt();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6"
      data-qa="premium-lock-modal"
    >
      {/* Decorative background sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Sparkles className="absolute top-[15%] left-[10%] h-5 w-5 text-amber-300/40 animate-pulse" />
        <Sparkles className="absolute top-[25%] right-[15%] h-4 w-4 text-yellow-300/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-[20%] left-[20%] h-6 w-6 text-amber-200/30 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <Sparkles className="absolute bottom-[30%] right-[10%] h-3 w-3 text-yellow-200/40 animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Gradient border wrapper */}
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 opacity-80" />
        <Card className="relative w-full border-amber-200/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-[0_24px_60px_-16px_rgba(146,64,14,0.35)]">
          {/* Header */}
          <div className="relative overflow-hidden border-b border-amber-200/60 p-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
              <Badge variant="warning" className="text-[10px]">
                {badgeLabel}
              </Badge>
              {packName && <span className="text-amber-600">{packName}</span>}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-300/40">
                <Lock className="h-6 w-6 text-amber-900 animate-[shake_2s_ease-in-out_infinite]" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-amber-950">
                  Premium Content Locked
                </h2>
                <p className="mt-0.5 text-xs font-medium text-amber-700/80">
                  Unlock this exclusive item to enhance your farm
                </p>
              </div>
            </div>

            {/* Gold shine sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[32px]">
              <div className="absolute inset-0 animate-[shine-sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 text-sm text-amber-900/80">
            <p>This cosmetic isn&apos;t owned on this device. Purchase the pack or unlock it to use this item on your farm.</p>

            <div className="mt-4 rounded-2xl border border-amber-200/50 bg-amber-100/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                What you get
              </div>
              <ul className="mt-2 space-y-1 text-xs text-amber-700/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
                  Exclusive cosmetics & themes
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
                  Bonus cosmetic tokens
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-amber-400" />
                  Early access to new content
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-amber-200/60 p-5">
            {debugEnabled && lock.packId && (
              <Button
                size="sm"
                variant="outline"
                className="text-[10px] text-slate-500 border-slate-200 hover:bg-slate-50 mr-auto"
                onClick={handleGrant}
                data-qa="premium-lock-grant"
              >
                Grant Access
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="text-amber-800 hover:bg-amber-200/40 hover:text-amber-900"
            >
              Maybe later
            </Button>
            <Button
              size="sm"
              variant="gold"
              shine
              elevated
              onClick={handleClose}
              data-qa="premium-lock-ok"
            >
              Unlock
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

PremiumLockModal.displayName = 'PremiumLockModal';

export default PremiumLockModal;
