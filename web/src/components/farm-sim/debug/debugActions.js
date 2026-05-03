import { CROP_DATA } from '../constants/cropData';
import { BUILDINGS } from '../constants/buildingData';
import { logDebugAction } from '../../../utils/debugTools';

const DAY_MS = 24 * 60 * 60 * 1000;

export const fillAllPlots = (state, actions, status = 'planted') => {
  const crop = CROP_DATA.carrot;
  if (!crop || !Array.isArray(state.plots)) return 0;
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
  return updatedPlots.length;
};

export const spawnNotifications = (actions, count = 50) => {
  const max = Math.max(0, count);
  for (let i = 0; i < max; i += 1) {
    actions.addNotification({
      message: `Stress notification ${i + 1}`,
      type: i % 3 === 0 ? 'warning' : 'info',
    });
  }
  logDebugAction('stress_spawn_notifications', { count: max });
  return max;
};

export const clearNotifications = (state, actions) => {
  const notifications = Array.isArray(state.notifications) ? state.notifications : [];
  notifications.forEach((notification) => actions.clearNotification(notification.id));
  logDebugAction('stress_clear_notifications', { count: notifications.length });
  return notifications.length;
};

export const placeBuildings = (actions) => {
  const nextBuildings = {};
  Object.keys(BUILDINGS).forEach((buildingId) => {
    nextBuildings[buildingId] = { built: true, level: 1 };
  });
  actions.updateBuildings(nextBuildings);
  logDebugAction('stress_place_buildings', { count: Object.keys(nextBuildings).length });
  return nextBuildings;
};

export const clearBuildings = (actions) => {
  actions.updateBuildings({});
  logDebugAction('stress_clear_buildings');
};

export const advanceChallengeDays = (state, actions, days = 30) => {
  const safeDays = Math.max(0, Number(days) || 0);
  actions.updateLastChallengeReset(Date.now() - safeDays * DAY_MS);
  actions.updateChallengeStreak((state.challengeStreak || 0) + safeDays);
  actions.setDailyChallenges([]);
  actions.updateDailyQuests(null);
  logDebugAction('stress_advance_days', { days: safeDays });
  return safeDays;
};
