import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { isDebugEnabled } from '../services/DebugService';
import { traceAction } from '../services/DebugTraceService';
import { CROP_DATA } from '../constants/cropData';

const createFilledPlot = (plot, index, cropData, options = {}) => {
  const now = Date.now();
  const plantedAt = options.ready ? now - (cropData?.growthTime || 10) * 1000 : now;
  return {
    ...plot,
    id: plot?.id ?? index,
    state: options.ready ? 'ready' : 'planted',
    crop: cropData,
    plantedAt,
    growthStage: options.ready ? (cropData?.stages || 3) : 1,
    waterLevel: plot?.waterLevel ?? 85,
    progress: options.ready ? 1 : 0,
    readyAt: options.ready ? now : plot?.readyAt,
  };
};

const DevStressPanel = () => {
  const { state, actions } = useGame();
  const debugEnabled = isDebugEnabled();
  const [stressRunning, setStressRunning] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const plots = Array.isArray(state.plots) ? state.plots : [];
  const selectedCrop = useMemo(
    () => CROP_DATA[state.selectedCrop] || CROP_DATA.carrot,
    [state.selectedCrop]
  );

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
      fillAllPlots({ ready: cycle % 2 === 0 });
      spawnNotifications(10);
      setTimeout(() => {
        harvestAllPlots();
        closeNotificationsRapidly();
      }, 500);
    }, 2000);

    timeoutRef.current = setTimeout(() => {
      stopStressTest();
    }, 60000);
  }, [closeNotificationsRapidly, fillAllPlots, harvestAllPlots, spawnNotifications, state, stopStressTest, stressRunning]);

  if (!debugEnabled) return null;

  return (
    <div className="fixed bottom-20 left-4 z-[200] w-72 rounded-xl border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur px-3 py-3 space-y-2 text-xs">
      <div className="font-semibold text-slate-800">🧪 Stress Panel</div>
      <button type="button" onClick={() => fillAllPlots()} className="w-full rounded bg-emerald-500/90 text-white px-2 py-1">Fill all plots</button>
      <button type="button" onClick={fillLastPlot} className="w-full rounded bg-emerald-500/90 text-white px-2 py-1">Fill last plot only</button>
      <button type="button" onClick={harvestAllPlots} className="w-full rounded bg-amber-500/90 text-white px-2 py-1">Harvest all plots</button>
      <button type="button" onClick={() => spawnNotifications(20)} className="w-full rounded bg-sky-500/90 text-white px-2 py-1">Spawn 20 notifications</button>
      <button type="button" onClick={() => spawnNotifications(50)} className="w-full rounded bg-sky-500/90 text-white px-2 py-1">Spawn 50 notifications</button>
      <button type="button" onClick={closeNotificationsRapidly} className="w-full rounded bg-rose-500/90 text-white px-2 py-1">Close notifications rapidly</button>
      <button type="button" onClick={stressRunning ? stopStressTest : startStressTest} className="w-full rounded bg-purple-600/90 text-white px-2 py-1">
        {stressRunning ? 'Stop 60s stress test' : 'Run 60s stress test'}
      </button>
    </div>
  );
};

export default DevStressPanel;
