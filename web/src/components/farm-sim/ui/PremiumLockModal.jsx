import React, { memo, useMemo } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { isDebugMode } from '../../../utils/debugTools';
import { getPackMeta } from '../entitlements/EntitlementManager';

const PremiumLockModal = memo(() => {
  const actions = useGameActions();
  const lock = useGameSelector((state) => state.premiumLockPrompt || null);
  const debugEnabled = isDebugMode();

  const packMeta = useMemo(() => (lock?.packId ? getPackMeta(lock.packId) : null), [lock?.packId]);

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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6 animate-overlay-backdrop"
      data-qa="premium-lock-modal"
    >
      <Card className="w-full max-w-sm bg-white shadow-xl animate-overlay-card">
        <div className="border-b border-amber-100 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-amber-600">
            <Badge variant="warning" className="text-[10px]">
              {badgeLabel}
            </Badge>
            {packName && <span>{packName}</span>}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-amber-900">Premium Item</h2>
        </div>
        <div className="p-4 text-sm text-gray-700">This cosmetic isn’t owned on this device.</div>
        <div className="flex items-center justify-end gap-2 border-t border-amber-100 p-4">
          {debugEnabled && lock.packId && (
            <Button size="sm" variant="outline" onClick={handleGrant} data-qa="premium-lock-grant">
              Grant Access
            </Button>
          )}
          <Button size="sm" onClick={handleClose} data-qa="premium-lock-ok">
            OK
          </Button>
        </div>
      </Card>
    </div>
  );
});

PremiumLockModal.displayName = 'PremiumLockModal';

export default PremiumLockModal;
