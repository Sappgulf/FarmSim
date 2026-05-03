import React, { memo, useEffect, useRef, useState } from 'react';
import { useGameActions, useGameSelector, useGameStore } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { isDebugMode, logDebugAction } from '../../../utils/debugTools';
import {
  getContentManager,
  printContentReport,
  revalidateContent,
} from '../../../content/ContentManager';
import { TAB_IDS } from './GameSidebar';
import { ENTITLEMENT_MODES, isPremiumModeEnabled } from '../entitlements/EntitlementManager';
import {
  advanceChallengeDays,
  clearBuildings,
  clearNotifications,
  fillAllPlots,
  placeBuildings,
  spawnNotifications,
} from '../debug/debugActions';

const DebugStressPanel = memo(() => {
  const actions = useGameActions();
  const store = useGameStore();
  const entitlementMode = useGameSelector(
    (state) => state.entitlements?.mode || ENTITLEMENT_MODES.FREE_MODE
  );
  const entitlementPacks = useGameSelector((state) =>
    Array.isArray(state.entitlements?.packs) ? state.entitlements.packs : []
  );
  const debugEnabled = isDebugMode();
  const [tabStressRunning, setTabStressRunning] = useState(false);
  const tabStressRef = useRef(null);
  const content = getContentManager();
  const premiumModeEnabled = isPremiumModeEnabled({
    entitlements: { mode: entitlementMode, packs: entitlementPacks },
  });
  const packs = content?.packs || [];

  useEffect(() => {
    return () => {
      if (tabStressRef.current) {
        clearInterval(tabStressRef.current);
        tabStressRef.current = null;
      }
    };
  }, []);

  if (!debugEnabled) return null;

  const startTabStress = () => {
    if (tabStressRef.current) return;
    let index = 0;
    let cycles = 0;
    setTabStressRunning(true);
    tabStressRef.current = setInterval(() => {
      const tabId = TAB_IDS[index % TAB_IDS.length];
      if (typeof window.switchToTab === 'function') {
        window.switchToTab(tabId);
      }
      index += 1;
      cycles += 1;
      if (cycles >= 30) {
        stopTabStress();
      }
    }, 150);
    logDebugAction('stress_tabs_start');
  };

  const stopTabStress = () => {
    if (tabStressRef.current) {
      clearInterval(tabStressRef.current);
      tabStressRef.current = null;
    }
    setTabStressRunning(false);
    logDebugAction('stress_tabs_stop');
  };

  const revalidateContentNow = () => {
    revalidateContent();
    actions.addNotification({
      message: '✅ Content revalidated. Check debug logs for details.',
      type: 'success',
    });
    logDebugAction('content_revalidate');
  };

  const reportContentNow = () => {
    printContentReport();
    actions.addNotification({
      message: '🧾 Content report printed to console.',
      type: 'info',
    });
    logDebugAction('content_report');
  };

  return (
    <div className="fixed bottom-24 left-2 right-2 sm:right-auto sm:w-80 z-[9998]">
      <Card className="bg-black/85 text-white border border-gray-700 shadow-xl p-3 space-y-2">
        <div className="text-xs font-semibold tracking-wide text-gray-200">
          🧪 Debug Stress Panel
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            className="h-10"
            onClick={() => fillAllPlots(store.getState(), actions, 'planted')}
          >
            Fill Plots
          </Button>
          <Button
            size="sm"
            className="h-10"
            onClick={() => fillAllPlots(store.getState(), actions, 'ready')}
          >
            Ready Plots
          </Button>
          <Button size="sm" className="h-10" onClick={actions.harvestAllReadyCrops}>
            Harvest All
          </Button>
          <Button size="sm" className="h-10" onClick={() => spawnNotifications(actions, 50)}>
            +50 Notifs
          </Button>
          <Button
            size="sm"
            className="h-10"
            onClick={() => clearNotifications(store.getState(), actions)}
          >
            Clear Notifs
          </Button>
          <Button
            size="sm"
            className="h-10"
            onClick={tabStressRunning ? stopTabStress : startTabStress}
          >
            {tabStressRunning ? 'Stop Tabs' : 'Stress Tabs'}
          </Button>
          <Button size="sm" className="h-10" onClick={() => placeBuildings(actions)}>
            Place Builds
          </Button>
          <Button size="sm" className="h-10" onClick={() => clearBuildings(actions)}>
            Clear Builds
          </Button>
          <Button
            size="sm"
            className="h-10 col-span-2"
            onClick={() => advanceChallengeDays(store.getState(), actions, 30)}
          >
            Advance 30 Days
          </Button>
          <Button size="sm" className="h-10" onClick={revalidateContentNow}>
            Re-validate
          </Button>
          <Button size="sm" className="h-10" onClick={reportContentNow}>
            Content Report
          </Button>
        </div>
        <div className="border-t border-white/10 pt-2 space-y-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-300">Entitlements</div>
          <div className="flex items-center justify-between text-[11px] text-gray-200">
            <span>Mode: {premiumModeEnabled ? 'PREMIUM' : 'FREE'}</span>
            <Button
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={() =>
                actions.setEntitlementMode(
                  premiumModeEnabled ? ENTITLEMENT_MODES.FREE_MODE : ENTITLEMENT_MODES.PREMIUM_MODE
                )
              }
            >
              {premiumModeEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          <div className="space-y-1 text-[11px] text-gray-300">
            {packs.map((pack) => {
              const isPremium = pack.access === 'premium';
              const isUnlocked = entitlementPacks.includes(pack.id);
              return (
                <div key={pack.id} className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span>{pack.name || pack.id}</span>
                    <span className="text-[10px] text-gray-400">
                      {pack.access} {pack.skuId ? `• ${pack.skuId}` : ''}
                    </span>
                  </div>
                  {isPremium ? (
                    <Button
                      size="sm"
                      className="h-7 px-2 text-[10px]"
                      onClick={() =>
                        isUnlocked
                          ? actions.revokePackEntitlement(pack.id)
                          : actions.grantPackEntitlement(pack.id)
                      }
                    >
                      {isUnlocked ? 'Revoke' : 'Grant'}
                    </Button>
                  ) : (
                    <span className="text-[10px] text-gray-500">Free</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-[10px] text-gray-400">
          Debug only. Runs stress actions without saving extra data.
        </div>
      </Card>
    </div>
  );
});

DebugStressPanel.displayName = 'DebugStressPanel';

export default DebugStressPanel;
