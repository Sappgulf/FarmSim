import { TAB_IDS } from '../ui/GameSidebar';
import { getDayKey } from '../../../systems/almanac';
import { revalidateContent } from '../../../content/ContentManager';
import { buildFarmCardData, renderFarmCard } from '../../../utils/farmCard';
import { MEMORIES } from '../../../data/identity';
import {
  QA_SAVE_KEY,
  QA_BACKUP_SAVE_KEY,
  loadSavedStateFromKey,
  saveStateToStorage,
} from '../context/GamePersistence';

const DAY_MS = 24 * 60 * 60 * 1000;

const isFiniteNumber = (value) => Number.isFinite(value);

const validateSaveState = (state) => {
  const errors = [];
  if (!state) {
    errors.push('Save state is null/undefined.');
    return errors;
  }
  if (!isFiniteNumber(state.coins)) errors.push('coins is not a finite number.');
  if (!isFiniteNumber(state.xp)) errors.push('xp is not a finite number.');
  if (!isFiniteNumber(state.level)) errors.push('level is not a finite number.');
  if (!isFiniteNumber(state.gridSize)) errors.push('gridSize is not a finite number.');
  if (!Array.isArray(state.plots)) errors.push('plots is not an array.');
  if (Array.isArray(state.plots)) {
    const expected = state.gridSize * state.gridSize;
    if (state.plots.length !== expected) {
      errors.push(`plots length ${state.plots.length} !== gridSize^2 (${expected}).`);
    }
  }
  if (!state.settings || typeof state.settings !== 'object') errors.push('settings missing or invalid.');
  if (!state.season || typeof state.season !== 'object') errors.push('season missing or invalid.');
  return errors;
};

const validatePlotState = (plot) => {
  const allowed = new Set(['empty', 'planted', 'growing', 'ready', 'withered', 'decor']);
  if (!plot || typeof plot !== 'object') return 'plot missing';
  if (!allowed.has(plot.state)) return `invalid state ${plot.state}`;
  if (!Number.isFinite(plot.waterLevel ?? 0)) return 'waterLevel not finite';
  if (!Number.isFinite(plot.soilFertility ?? 0)) return 'soilFertility not finite';
  return null;
};

export const QA_TESTS = [
  {
    id: 'tabs_smoke',
    name: 'Tabs Smoke Test',
    timeoutMs: 12000,
    run: async (ctx) => {
      if (typeof ctx.switchToTab !== 'function') {
        throw new Error('switchToTab hook unavailable.');
      }
      for (const tabId of TAB_IDS) {
        ctx.log(`Switching to ${tabId}`);
        await ctx.switchToTab(tabId);
        const panel = document.getElementById(`panel-${tabId}`);
        if (!panel) {
          throw new Error(`Tab panel not found for ${tabId}`);
        }
        if (panel.textContent?.includes('Tab Error')) {
          throw new Error(`Tab Error rendered for ${tabId}`);
        }
      }
      await ctx.switchToTab('farming');
      return { detail: `Opened ${TAB_IDS.length} tabs.` };
    },
  },
  {
    id: 'plot_stress',
    name: 'Plot Stress',
    timeoutMs: 8000,
    run: async (ctx) => {
      for (let i = 0; i < 3; i += 1) {
        ctx.log(`Cycle ${i + 1}: fill ready plots`);
        ctx.helpers.fillAllPlots('ready');
        await ctx.sleep(50);
        ctx.log('Harvest all ready crops');
        ctx.actions.harvestAllReadyCrops();
        await ctx.sleep(100);
        const plots = ctx.state().plots || [];
        const remainingReady = plots.filter((plot) => plot?.state === 'ready').length;
        if (remainingReady > 0) {
          throw new Error(`Harvest cycle ${i + 1} left ${remainingReady} ready plots`);
        }
        const invalid = plots.map(validatePlotState).find(Boolean);
        if (invalid) {
          throw new Error(`Plot validation failed: ${invalid}`);
        }
      }
      return { detail: '3 harvest cycles completed.' };
    },
  },
  {
    id: 'notifications_stress',
    name: 'Notifications Stress',
    timeoutMs: 6000,
    run: async (ctx) => {
      const baselineTimers = ctx.getDebugMetrics().timerCount;
      ctx.log('Spawn 50 notifications');
      ctx.helpers.spawnNotifications(50);
      await ctx.sleep(100);
      const count = ctx.state().notifications?.length || 0;
      if (count < 40) {
        throw new Error(`Expected notifications >= 40, got ${count}`);
      }
      ctx.log('Clear notifications');
      ctx.helpers.clearNotifications();
      await ctx.sleep(500);
      const remaining = ctx.state().notifications?.length || 0;
      if (remaining !== 0) {
        throw new Error(`Notifications not cleared: ${remaining} remaining`);
      }
      const timerAfter = ctx.getDebugMetrics().timerCount;
      if (timerAfter > baselineTimers + 10) {
        throw new Error(`Timer count grew unexpectedly (${baselineTimers} → ${timerAfter})`);
      }
      return { detail: 'Spawned and cleared notifications without leaks.' };
    },
  },
  {
    id: 'mini_game_smoke',
    name: 'Mini-game Smoke',
    timeoutMs: 8000,
    run: async (ctx) => {
      if (!TAB_IDS.includes('fishing')) {
        return { status: 'skip', reason: 'Fishing tab not available.' };
      }
      const fishingSystem = ctx.systems?.fishingSystem;
      if (!fishingSystem) {
        return { status: 'skip', reason: 'Fishing system not available.' };
      }
      await ctx.switchToTab('fishing');
      fishingSystem.cancelFishing?.();
      const fishingState = ctx.state().fishing || {};
      ctx.actions.updateFishing({
        ...fishingState,
        pond: {
          ...(fishingState.pond || {}),
          population: 100,
          maxPopulation: 100,
        },
      });
      const result = fishingSystem.castLine();
      if (!result?.success) {
        throw new Error(`Cast line failed: ${result?.message || 'unknown error'}`);
      }
      fishingSystem.cancelFishing?.();
      if (fishingSystem.getActiveCatch?.()) {
        throw new Error('Fishing mini-game did not clean up active catch.');
      }
      return { detail: 'Fishing mini-game started and exited cleanly.' };
    },
  },
  {
    id: 'festival_game_smoke',
    name: 'Festival Game Smoke',
    timeoutMs: 8000,
    run: async (ctx) => {
      await ctx.switchToTab('events');
      const playButton = document.querySelector('[data-qa="festival-game-play"]');
      if (!playButton) {
        throw new Error('Festival game play button not found.');
      }
      playButton.click();
      await ctx.sleep(150);
      const modal = document.querySelector('[data-qa="festival-game-modal"]');
      if (!modal) {
        throw new Error('Festival game modal did not open.');
      }
      const auto = modal.querySelector('[data-qa="festival-game-auto"]');
      const start = modal.querySelector('[data-qa="festival-game-start"]');
      const stop = modal.querySelector('[data-qa="festival-game-stop"]');
      if (auto) {
        auto.click();
      } else if (start && stop) {
        start.click();
        await ctx.sleep(120);
        stop.click();
      }
      await ctx.sleep(120);
      const close = modal.querySelector('[data-qa="festival-game-close"]');
      close?.click();
      await ctx.sleep(120);
      if (document.querySelector('[data-qa="festival-game-modal"]')) {
        throw new Error('Festival game modal did not close.');
      }
      return { detail: 'Festival game opened, played, and closed.' };
    },
  },
  {
    id: 'festival_game_integration',
    name: 'Festival Game Integration',
    timeoutMs: 8000,
    run: async (ctx) => {
      const content = revalidateContent();
      const festival = content?.festivals?.[0];
      if (!festival) {
        return { status: 'skip', reason: 'No festival data found.' };
      }
      ctx.actions.updateActiveEvents([{
        ...festival,
        startedAt: Date.now(),
        endsAt: Date.now() + 60000,
        season: festival.season || 'spring',
      }]);
      await ctx.switchToTab('events');
      const card = document.querySelector('[data-qa="festival-game-card"]');
      if (!card) {
        throw new Error('Festival game card missing.');
      }
      if (!card.textContent?.includes(festival.name)) {
        throw new Error('Festival game card did not reflect active festival.');
      }
      const playButton = document.querySelector('[data-qa="festival-game-play"]');
      if (!playButton) {
        throw new Error('Festival game play button not found.');
      }
      if (playButton.disabled) {
        throw new Error('Play button unexpectedly disabled before play.');
      }
      playButton.click();
      await ctx.sleep(120);
      const modal = document.querySelector('[data-qa="festival-game-modal"]');
      const auto = modal?.querySelector('[data-qa="festival-game-auto"]');
      const start = modal?.querySelector('[data-qa="festival-game-start"]');
      const stop = modal?.querySelector('[data-qa="festival-game-stop"]');
      if (auto) {
        auto.click();
      } else if (start && stop) {
        start.click();
        await ctx.sleep(120);
        stop.click();
      }
      await ctx.sleep(120);
      modal?.querySelector('[data-qa="festival-game-close"]')?.click();
      await ctx.sleep(150);
      const playButtonAfter = document.querySelector('[data-qa="festival-game-play"]');
      if (playButtonAfter && !playButtonAfter.disabled) {
        throw new Error('Play limit did not lock after festival play.');
      }
      ctx.actions.updateActiveEvents([]);
      return { detail: 'Festival game card + play limit verified.' };
    },
  },
  {
    id: 'festival_game_leak',
    name: 'Festival Game Leak Test',
    timeoutMs: 8000,
    run: async (ctx) => {
      await ctx.switchToTab('events');
      const playButton = document.querySelector('[data-qa="festival-game-play"]');
      if (!playButton) {
        throw new Error('Festival game play button not found.');
      }
      const startMetrics = ctx.getDebugMetrics();
      for (let i = 0; i < 10; i += 1) {
        playButton.click();
        await ctx.sleep(80);
        const modal = document.querySelector('[data-qa="festival-game-modal"]');
        if (!modal) {
          throw new Error(`Modal failed to open on iteration ${i + 1}`);
        }
        modal.querySelector('[data-qa="festival-game-close"]')?.click();
        await ctx.sleep(80);
      }
      const endMetrics = ctx.getDebugMetrics();
      if (endMetrics.listenerCount > startMetrics.listenerCount + 2) {
        throw new Error(`Listener count leak: ${startMetrics.listenerCount} → ${endMetrics.listenerCount}`);
      }
      if (endMetrics.timerCount > startMetrics.timerCount + 2) {
        throw new Error(`Timer count leak: ${startMetrics.timerCount} → ${endMetrics.timerCount}`);
      }
      return { detail: 'No listener/timer leak after 10 open/close cycles.' };
    },
  },
  {
    id: 'save_load_integrity',
    name: 'Save/Load Integrity',
    timeoutMs: 8000,
    run: async (ctx) => {
      const saveResult = saveStateToStorage(ctx.state(), {
        key: QA_SAVE_KEY,
        backupKey: QA_BACKUP_SAVE_KEY,
      });
      if (!saveResult.success) {
        throw new Error('Failed to save QA state.');
      }
      const loaded = loadSavedStateFromKey(QA_SAVE_KEY);
      if (!loaded) {
        throw new Error('Failed to load QA save.');
      }
      const errors = validateSaveState(loaded);
      if (errors.length) {
        throw new Error(`Save validation failed: ${errors.join(' ')}`);
      }
      const applied = ctx.actions.debugLoadState?.(loaded);
      if (!applied) {
        throw new Error('debugLoadState rejected loaded save.');
      }
      await ctx.sleep(50);
      const restoredErrors = validateSaveState(ctx.state());
      if (restoredErrors.length) {
        throw new Error(`Loaded state invalid: ${restoredErrors.join(' ')}`);
      }
      return { detail: 'QA save loaded and validated.' };
    },
  },
  {
    id: 'farm_card_export_smoke',
    name: 'Farm Card Export Smoke',
    timeoutMs: 6000,
    run: async (ctx) => {
      const data = buildFarmCardData(ctx.state());
      const { blob } = await renderFarmCard(data);
      if (!blob || blob.size <= 0) {
        throw new Error('Farm Card render returned an empty blob.');
      }
      return { detail: `Farm Card rendered (${Math.round(blob.size / 1024)} KB).` };
    },
  },
  {
    id: 'farm_card_export_repeat',
    name: 'Farm Card Export Repeat x5',
    timeoutMs: 8000,
    run: async (ctx) => {
      for (let i = 0; i < 5; i += 1) {
        const data = buildFarmCardData(ctx.state());
        const { blob } = await renderFarmCard(data);
        if (!blob || blob.size <= 0) {
          throw new Error(`Farm Card render failed on iteration ${i + 1}.`);
        }
      }
      return { detail: 'Rendered 5 Farm Cards without failures.' };
    },
  },
  {
    id: 'farm_card_theme_swap',
    name: 'Farm Card Theme Swap',
    timeoutMs: 8000,
    run: async (ctx) => {
      const initialTheme = ctx.state().farmTheme;
      ctx.actions.setFarmTheme('meadow');
      const first = await renderFarmCard(buildFarmCardData(ctx.state()), { returnCanvas: true });
      if (!first.canvas) throw new Error('Missing canvas for meadow render.');
      const firstPixel = first.canvas.getContext('2d')?.getImageData(40, 40, 1, 1)?.data?.join(',');
      ctx.actions.setFarmTheme('dusk');
      const second = await renderFarmCard(buildFarmCardData(ctx.state()), { returnCanvas: true });
      if (!second.canvas) throw new Error('Missing canvas for dusk render.');
      const secondPixel = second.canvas.getContext('2d')?.getImageData(40, 40, 1, 1)?.data?.join(',');
      if (firstPixel === secondPixel) {
        throw new Error('Theme swap did not change Farm Card colors.');
      }
      ctx.actions.setFarmTheme(initialTheme || 'meadow');
      return { detail: 'Theme swap updated Farm Card colors.' };
    },
  },
  {
    id: 'farm_card_identity_persist',
    name: 'Farm Card Identity Persist',
    timeoutMs: 8000,
    run: async (ctx) => {
      const memoryId = MEMORIES[0]?.id || null;
      ctx.actions.setFarmName('Cedar Glade Farm');
      ctx.actions.setFarmTheme('harvest');
      if (memoryId) {
        ctx.actions.setSpotlight({ mode: 'favorite', type: 'memory', id: memoryId });
      }
      const saveResult = saveStateToStorage(ctx.state(), {
        key: QA_SAVE_KEY,
        backupKey: QA_BACKUP_SAVE_KEY,
      });
      if (!saveResult.success) {
        throw new Error('Failed to save QA state for identity check.');
      }
      const loaded = loadSavedStateFromKey(QA_SAVE_KEY);
      if (!loaded) {
        throw new Error('Failed to load QA save for identity check.');
      }
      if (loaded.farmTheme !== 'harvest') {
        throw new Error(`Theme mismatch after load (${loaded.farmTheme}).`);
      }
      if (loaded.farmName !== 'Cedar Glade Farm') {
        throw new Error(`Farm name mismatch after load (${loaded.farmName}).`);
      }
      if (memoryId && loaded.spotlight?.id !== memoryId) {
        throw new Error('Spotlight selection did not persist.');
      }
      return { detail: 'Theme, name, and spotlight persisted through save/load.' };
    },
  },
  {
    id: 'content_validation',
    name: 'Content Validation',
    timeoutMs: 5000,
    run: async (ctx) => {
      const content = revalidateContent();
      const report = content?.report;
      const errorCount = report?.errors?.length || 0;
      const warningCount = report?.warnings?.length || 0;
      if (errorCount > 0) {
        throw new Error(`Content validation errors: ${errorCount}`);
      }
      ctx.log(`Content warnings: ${warningCount}`);
      return {
        detail: `Content validated: ${warningCount} warning(s).`,
        warnings: report?.warnings || [],
      };
    },
  },
  {
    id: 'thirty_day_sim',
    name: '30-Day Simulation',
    timeoutMs: 8000,
    run: async (ctx) => {
      const beforeDays = ctx.state().almanac?.counters?.dayCount || 0;
      const base = Date.UTC(2025, 0, 1);
      for (let i = 0; i < 30; i += 1) {
        const dayKey = getDayKey(base + (i * DAY_MS));
        ctx.actions.recordAlmanacEvent('day_rollover', { dayKey });
      }
      ctx.helpers.advanceChallengeDays(30);
      await ctx.switchToTab('challenges');
      await ctx.sleep(150);
      const afterDays = ctx.state().almanac?.counters?.dayCount || 0;
      if (afterDays - beforeDays !== 30) {
        throw new Error(`Day counter mismatch: ${beforeDays} → ${afterDays}`);
      }
      const lastDayKey = ctx.state().almanac?.lastDayKey;
      const expectedLast = getDayKey(base + (29 * DAY_MS));
      if (lastDayKey !== expectedLast) {
        throw new Error(`Last day key mismatch: ${lastDayKey} (expected ${expectedLast})`);
      }
      const season = ctx.state().season?.current;
      if (!season) {
        throw new Error('Season state missing after simulation.');
      }
      const dailyChallenges = ctx.state().dailyChallenges || [];
      if (dailyChallenges.length === 0) {
        throw new Error('Daily challenges not generated after simulation.');
      }
      const numbers = [ctx.state().coins, ctx.state().xp, ctx.state().level];
      if (numbers.some((value) => !isFiniteNumber(value))) {
        throw new Error('Detected non-finite core values after simulation.');
      }
      return { detail: '30 day rollover complete with stable counters.' };
    },
  },
];

export const QA_TEST_IDS = QA_TESTS.map((test) => test.id);
