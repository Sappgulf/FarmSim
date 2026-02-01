import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { CROP_DATA } from '../constants/cropData';
import { isDebugEnabled } from '../services/DebugService';
import { traceAction } from '../services/DebugTraceService';

const TABS_TO_STRESS = ['farming', 'inventory', 'shop', 'livestock', 'fishing', 'social', 'analytics', 'buildings', 'settings'];

/**
 * Helper to create a filled plot state for stress testing
 */
const createFilledPlot = (plot, index, selectedCrop, options = {}) => ({
  ...plot,
  id: plot?.id ?? index,
  state: options.ready ? 'ready' : 'growing',
  crop: selectedCrop?.id || 'carrot',
  plantedAt: Date.now() - (options.ready ? 100000 : 0),
  growthStage: options.ready ? 3 : 1,
  progress: options.ready ? 100 : 25,
  waterLevel: 100,
  fertilizer: 0,
});

const DevStressPanel = () => {
  const { state, actions } = useGame();
  const debugEnabled = isDebugEnabled();
  const [stressRunning, setStressRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const plots = Array.isArray(state.plots) ? state.plots : [];
  const selectedCrop = useMemo(
    () => CROP_DATA[state.selectedCrop] || CROP_DATA.carrot,
    [state.selectedCrop]
  );

  // Helper to update status briefly
  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const updatePlotsSafely = useCallback((updater, label) => {
    if (!plots.length) return;
    const updatedPlots = updater(plots);
    actions.updatePlots(updatedPlots);
    traceAction(label, { plots: updatedPlots.length }, state);
  }, [actions, plots, state]);

  const fillAllPlots = useCallback((options = {}) => {
    updatePlotsSafely((currentPlots) => (
      currentPlots.map((plot, index) => createFilledPlot(plot, index, selectedCrop, options))
    ), options.ready ? 'stress_fill_all_ready' : 'stress_fill_all');
  }, [selectedCrop, updatePlotsSafely]);

  const fillLastPlot = useCallback(() => {
    if (!plots.length) return;
    const lastIndex = plots.length - 1;
    updatePlotsSafely((currentPlots) => (
      currentPlots.map((plot, index) => (
        index === lastIndex ? createFilledPlot(plot, index, selectedCrop, { ready: false }) : plot
      ))
    ), 'stress_fill_last_plot');
  }, [plots.length, selectedCrop, updatePlotsSafely]);

  const harvestAllPlots = useCallback(() => {
    if (!plots.length) return;
    updatePlotsSafely((currentPlots) => (
      currentPlots.map((plot, index) => ({
        ...plot,
        id: plot?.id ?? index,
        state: 'empty',
        crop: null,
        plantedAt: null,
        growthStage: 0,
        progress: 0,
      }))
    ), 'stress_harvest_all');
  }, [plots.length, updatePlotsSafely]);

  const spawnNotifications = useCallback((count) => {
    for (let i = 0; i < count; i += 1) {
      actions.addNotification({
        message: `Stress notification #${i + 1}`,
        type: i % 3 === 0 ? 'warning' : 'info',
      });
    }
    traceAction('stress_spawn_notifications', { count }, state);
  }, [actions, state]);

  const closeNotificationsRapidly = useCallback(() => {
    const notifications = Array.isArray(state.notifications) ? state.notifications : [];
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        actions.clearNotification(notification.id);
      }, index * 10);
    });
    traceAction('stress_close_notifications', { count: notifications.length }, state);
  }, [actions, state]);

  // STRESS TEST: Rapid Tab Switching
  const runRapidTabSwitch = useCallback(() => {
    if (typeof window.switchToTab !== 'function') {
      showStatus('❌ switchToTab not available');
      return;
    }
    let count = 0;
    const maxSwitches = 20;
    const interval = setInterval(() => {
      if (count >= maxSwitches) {
        clearInterval(interval);
        window.switchToTab('farming'); // Reset home
        showStatus('✅ Tab stress complete');
        return;
      }
      const randomTab = TABS_TO_STRESS[Math.floor(Math.random() * TABS_TO_STRESS.length)];
      window.switchToTab(randomTab);
      count++;
    }, 150); // Fast switch every 150ms
    traceAction('stress_rapid_tabs', { switches: maxSwitches }, state);
  }, [state]);

  // STRESS TEST: Advance 30 Days
  const runAdvance30Days = useCallback(async () => {
    showStatus('⏳ Advancing 30 days...');
    const startDay = state.season?.dayInSeason || 1;
    let currentDay = startDay;
    let dayCount = state.season?.dayCount || 1;

    // We can't really await React updates easily without being inside the loop
    // So we'll use a recursive timeout pattern or just a loop with delays
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 50)); // Wait 50ms between days

      currentDay++;
      dayCount++;

      // Mock day info
      const dayInfo = {
        dayCount,
        dayInSeason: currentDay,
        season: state.season?.current || 'spring',
        daysElapsed: 1
      };

      // Trigger the heavy lifters
      actions.onDayAdvance(dayInfo);

      // Force update season state so UI reflects it (partially)
      actions.updateSeason({
        ...state.season,
        dayInSeason: currentDay,
        dayCount,
      });
    }
    showStatus('✅ 30 days advanced');
    traceAction('stress_advance_30_days', { startDay, endDay: currentDay }, state);
  }, [actions, state.season]);

  const stopStressTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStressRunning(false);
    traceAction('stress_test_stop', {}, state);
  }, [state]);

  const startStressTest = useCallback(() => {
    if (stressRunning) return;
    setStressRunning(true);
    traceAction('stress_test_start', { durationMs: 60000 }, state);

    let cycle = 0;
    intervalRef.current = setInterval(() => {
      cycle += 1;
      // Mixed Chaos Loop
      if (cycle % 5 === 0) runRapidTabSwitch();
      if (cycle % 3 === 0) fillAllPlots({ ready: cycle % 2 === 0 });
      if (cycle % 4 === 0) spawnNotifications(5);

      setTimeout(() => {
        if (cycle % 3 === 0) harvestAllPlots();
        if (cycle % 4 === 0) closeNotificationsRapidly();
      }, 500);
    }, 4000); // Slower loop to allow sub-tests to run

    timeoutRef.current = setTimeout(() => {
      stopStressTest();
    }, 60000);
  }, [closeNotificationsRapidly, fillAllPlots, harvestAllPlots, runRapidTabSwitch, spawnNotifications, state, stopStressTest, stressRunning]);

  if (!debugEnabled) return null;

  return (
    <div className="fixed bottom-20 left-4 z-[200] w-72 rounded-xl border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur px-3 py-3 space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-slate-800">🧪 Stress Panel</div>
        {statusMessage && <div className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded animate-pulse">{statusMessage}</div>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => fillAllPlots()} className="rounded bg-emerald-500/90 text-white px-2 py-1">Fill Plots</button>
        <button type="button" onClick={harvestAllPlots} className="rounded bg-amber-500/90 text-white px-2 py-1">Harvest All</button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => spawnNotifications(20)} className="rounded bg-sky-500/90 text-white px-2 py-1">Notify (20)</button>
        <button type="button" onClick={closeNotificationsRapidly} className="rounded bg-rose-500/90 text-white px-2 py-1">Clear Notifs</button>
      </div>

      <div className="border-t border-slate-200 my-1"></div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={runRapidTabSwitch} className="rounded bg-indigo-500/90 text-white px-2 py-1">Rapid Tabs</button>
        <button type="button" onClick={runAdvance30Days} className="rounded bg-indigo-500/90 text-white px-2 py-1">Advance 30d</button>
      </div>

      <button type="button" onClick={stressRunning ? stopStressTest : startStressTest} className={`w-full rounded font-bold px-2 py-1.5 ${stressRunning ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'}`}>
        {stressRunning ? '⏹ STOP CHAOS MODE' : '▶ RUN 60s CHAOS MODE'}
      </button>
    </div>
  );
};

export default DevStressPanel;
