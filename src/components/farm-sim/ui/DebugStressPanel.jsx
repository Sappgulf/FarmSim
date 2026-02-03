import React, { memo, useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { CROP_DATA } from '../constants/cropData';
import { BUILDINGS } from '../constants/buildingData';
import { isDebugMode, logDebugAction } from '../../../utils/debugTools';
import { printContentReport, revalidateContent } from '../../../content/ContentManager';
import { TAB_IDS } from './GameSidebar';

const DAY_MS = 24 * 60 * 60 * 1000;

const DebugStressPanel = memo(() => {
  const { state, actions } = useGame();
  const debugEnabled = isDebugMode();
  const [tabStressRunning, setTabStressRunning] = useState(false);
  const tabStressRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tabStressRef.current) {
        clearInterval(tabStressRef.current);
        tabStressRef.current = null;
      }
    };
  }, []);

  if (!debugEnabled) return null;

  const fillAllPlots = (status = 'planted') => {
    const crop = CROP_DATA.carrot;
    if (!crop || !Array.isArray(state.plots)) return;
    const now = Date.now();
    const updatedPlots = state.plots.map((plot, index) => ({
      ...plot,
      id: index,
      state: status,
      crop,
      plantedAt: now,
      growthStage: status === 'ready' ? crop.stages : 1,
      progress: status === 'ready' ? 1 : 0,
      readyAt: status === 'ready' ? now : plot.readyAt,
      waterLevel: 100,
      fertilizer: plot.fertilizer || 0,
      soilFertility: plot.soilFertility || 1.0,
    }));
    actions.updatePlots(updatedPlots);
    logDebugAction('stress_fill_plots', { status, count: updatedPlots.length });
  };

  const spawnNotifications = (count = 50) => {
    const max = Math.max(0, count);
    for (let i = 0; i < max; i++) {
      actions.addNotification({
        message: `⚙️ Stress notification ${i + 1}`,
        type: i % 3 === 0 ? 'warning' : 'info',
      });
    }
    logDebugAction('stress_spawn_notifications', { count: max });
  };

  const clearNotifications = () => {
    const notifications = Array.isArray(state.notifications) ? state.notifications : [];
    notifications.forEach((notification) => actions.clearNotification(notification.id));
    logDebugAction('stress_clear_notifications', { count: notifications.length });
  };

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

  const placeBuildings = () => {
    const nextBuildings = {};
    Object.keys(BUILDINGS).forEach((buildingId) => {
      nextBuildings[buildingId] = { built: true, level: 1 };
    });
    actions.updateBuildings(nextBuildings);
    logDebugAction('stress_place_buildings', { count: Object.keys(nextBuildings).length });
  };

  const clearBuildings = () => {
    actions.updateBuildings({});
    logDebugAction('stress_clear_buildings');
  };

  const advanceThirtyDays = () => {
    actions.updateLastChallengeReset(Date.now() - (30 * DAY_MS));
    actions.updateChallengeStreak((state.challengeStreak || 0) + 30);
    actions.setDailyChallenges([]);
    actions.updateDailyQuests(null);
    logDebugAction('stress_advance_days', { days: 30 });
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
        <div className="text-xs font-semibold tracking-wide text-gray-200">🧪 Debug Stress Panel</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button size="sm" className="h-10" onClick={() => fillAllPlots('planted')}>
            Fill Plots
          </Button>
          <Button size="sm" className="h-10" onClick={() => fillAllPlots('ready')}>
            Ready Plots
          </Button>
          <Button size="sm" className="h-10" onClick={actions.harvestAllReadyCrops}>
            Harvest All
          </Button>
          <Button size="sm" className="h-10" onClick={() => spawnNotifications(50)}>
            +50 Notifs
          </Button>
          <Button size="sm" className="h-10" onClick={clearNotifications}>
            Clear Notifs
          </Button>
          <Button size="sm" className="h-10" onClick={tabStressRunning ? stopTabStress : startTabStress}>
            {tabStressRunning ? 'Stop Tabs' : 'Stress Tabs'}
          </Button>
          <Button size="sm" className="h-10" onClick={placeBuildings}>
            Place Builds
          </Button>
          <Button size="sm" className="h-10" onClick={clearBuildings}>
            Clear Builds
          </Button>
          <Button size="sm" className="h-10 col-span-2" onClick={advanceThirtyDays}>
            Advance 30 Days
          </Button>
          <Button size="sm" className="h-10" onClick={revalidateContentNow}>
            Re-validate
          </Button>
          <Button size="sm" className="h-10" onClick={reportContentNow}>
            Content Report
          </Button>
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
