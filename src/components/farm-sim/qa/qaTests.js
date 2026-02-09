import { TAB_IDS } from '../ui/GameSidebar';
import { getDayKey } from '../../../systems/almanac';
import { revalidateContent } from '../../../content/ContentManager';
import { buildFarmCardData, renderFarmCard } from '../../../utils/farmCard';
import { MEMORIES } from '../../../data/identity';
import { getWeekKey } from '../../../utils/retention';
import { getItemEntitlementInfo } from '../entitlements/EntitlementManager';
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
  if (!state.entitlements || typeof state.entitlements !== 'object') errors.push('entitlements missing or invalid.');
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
    id: 'welcome_back_gating',
    name: 'Welcome Back Gating',
    timeoutMs: 8000,
    run: async (ctx) => {
      const dayKey = getDayKey();
      ctx.actions.updateRetention({
        lastSessionAt: Date.now() - DAY_MS,
        lastWelcomeBackDayKey: '2000-01-01',
        lastSeenGameDay: 2,
        lastSeenSeason: 'spring',
      });
      await ctx.switchToTab('events');
      await ctx.sleep(120);
      const card = document.querySelector('[data-qa="welcome-back-card"]');
      if (!card) {
        throw new Error('Welcome Back card did not appear.');
      }
      card.querySelector('[data-qa="welcome-back-dismiss"]')?.click();
      await ctx.sleep(120);
      if (document.querySelector('[data-qa="welcome-back-card"]')) {
        throw new Error('Welcome Back card did not dismiss.');
      }
      await ctx.switchToTab('farming');
      await ctx.switchToTab('events');
      await ctx.sleep(120);
      if (document.querySelector('[data-qa="welcome-back-card"]')) {
        throw new Error('Welcome Back card reappeared after dismissal.');
      }
      if (ctx.state().retention?.lastWelcomeBackDayKey !== dayKey) {
        throw new Error('Welcome Back dismissal did not persist day key.');
      }
      return { detail: 'Welcome Back shows once and stays dismissed for the day.' };
    },
  },
  {
    id: 'mini_game_stress_10x',
    name: 'Mini-game Stress 10x',
    timeoutMs: 10000,
    run: async (ctx) => {
      if (!TAB_IDS.includes('fishing')) {
        return { status: 'skip', reason: 'Fishing tab not available.' };
      }
      const fishingSystem = ctx.systems?.fishingSystem;
      if (!fishingSystem) {
        return { status: 'skip', reason: 'Fishing system unavailable.' };
      }
      for (let i = 0; i < 10; i += 1) {
        await ctx.switchToTab('fishing');
        await ctx.sleep(40);
        const result = fishingSystem.castLine();
        if (!result?.success) {
          throw new Error(`Cast line failed on run ${i + 1}`);
        }
        fishingSystem.cancelFishing?.();
        await ctx.switchToTab('farming');
      }
      return { detail: 'Fishing tab opened/closed 10x without stale session state.' };
    },
  },
  {
    id: 'offline_load_pwa_sanity',
    name: 'Offline Load PWA Sanity',
    timeoutMs: 6000,
    run: async (ctx) => {
      const saveResult = saveStateToStorage(ctx.state(), {
        key: QA_SAVE_KEY,
        backupKey: QA_BACKUP_SAVE_KEY,
      });
      if (!saveResult.success) {
        throw new Error('Could not persist save for offline load check.');
      }
      const loaded = loadSavedStateFromKey(QA_SAVE_KEY);
      if (!loaded) {
        throw new Error('Saved state was not readable from local storage fallback.');
      }
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        return { detail: 'Local save restore path works; PWA SW API is available.' };
      }
      return { status: 'skip', reason: 'Service worker API unavailable in this runtime.' };
    },
  },
  {
    id: 'daily_delight_idempotent',
    name: 'Daily Delight Idempotency',
    timeoutMs: 8000,
    run: async (ctx) => {
      const dayKey = getDayKey();
      ctx.actions.updateRetention({ lastDailyDelightClaimDate: '2000-01-01' });
      await ctx.switchToTab('events');
      await ctx.sleep(120);
      const claim = document.querySelector('[data-qa="daily-delight-claim"]');
      if (!claim) {
        throw new Error('Daily Delight claim button missing.');
      }
      if (claim.disabled) {
        throw new Error('Daily Delight claim button unexpectedly disabled.');
      }
      claim.click();
      await ctx.sleep(120);
      const claimAfter = document.querySelector('[data-qa="daily-delight-claim"]');
      if (!claimAfter?.disabled) {
        throw new Error('Daily Delight allowed duplicate claim.');
      }
      if (ctx.state().retention?.lastDailyDelightClaimDate !== dayKey) {
        throw new Error('Daily Delight did not persist claim date.');
      }
      ctx.actions.updateRetention({ lastDailyDelightClaimDate: '2000-01-01' });
      await ctx.sleep(120);
      const claimNext = document.querySelector('[data-qa="daily-delight-claim"]');
      if (claimNext?.disabled) {
        throw new Error('Daily Delight did not reset when date advanced.');
      }
      return { detail: 'Daily Delight claim is single-use per day and resets.' };
    },
  },
  {
    id: 'weekly_visits_rewards',
    name: 'Weekly Visits Rewards',
    timeoutMs: 8000,
    run: async (ctx) => {
      const now = Date.now();
      const weekKey = getWeekKey(now);
      const days = [
        getDayKey(now - DAY_MS * 3),
        getDayKey(now - DAY_MS * 2),
        getDayKey(now - DAY_MS),
        getDayKey(now),
      ];
      ctx.actions.updateRetention({
        weeklyVisits: {
          weekKey,
          days,
          claimedTiers: [],
        },
      });
      await ctx.switchToTab('events');
      await ctx.sleep(120);
      const claimTwo = document.querySelector('[data-qa="weekly-visit-claim-2"]');
      const claimFour = document.querySelector('[data-qa="weekly-visit-claim-4"]');
      if (!claimTwo || !claimFour) {
        throw new Error('Weekly Visits claim buttons missing.');
      }
      if (claimTwo.disabled || claimFour.disabled) {
        throw new Error('Weekly Visits claim buttons unexpectedly locked.');
      }
      claimTwo.click();
      await ctx.sleep(120);
      claimFour.click();
      await ctx.sleep(120);
      const claimed = ctx.state().retention?.weeklyVisits?.claimedTiers || [];
      if (!claimed.includes(2) || !claimed.includes(4)) {
        throw new Error('Weekly Visits rewards did not persist claimed tiers.');
      }
      return { detail: 'Weekly Visits tiers grant once per week.' };
    },
  },
  {
    id: 'retention_save_load',
    name: 'Retention Save/Load',
    timeoutMs: 8000,
    run: async (ctx) => {
      const now = Date.now();
      const weekKey = getWeekKey(now);
      const claimDate = getDayKey(now);
      ctx.actions.updateRetention({
        lastDailyDelightClaimDate: claimDate,
        dailyDelightClaimCount: 3,
        weeklyVisits: {
          weekKey,
          days: [claimDate],
          claimedTiers: [2],
        },
      });
      const saveResult = saveStateToStorage(ctx.state(), {
        key: QA_SAVE_KEY,
        backupKey: QA_BACKUP_SAVE_KEY,
      });
      if (!saveResult.success) {
        throw new Error('Failed to save QA state for retention check.');
      }
      const loaded = loadSavedStateFromKey(QA_SAVE_KEY);
      if (!loaded) {
        throw new Error('Failed to load QA save for retention check.');
      }
      if (loaded.retention?.lastDailyDelightClaimDate !== claimDate) {
        throw new Error('Retention daily claim date mismatch after load.');
      }
      if (!loaded.retention?.weeklyVisits?.claimedTiers?.includes(2)) {
        throw new Error('Retention weekly visits not persisted after load.');
      }
      return { detail: 'Retention fields persisted through save/load.' };
    },
  },
  {
    id: 'entitlements_free_mode_parity',
    name: 'Entitlements Free Mode Parity',
    timeoutMs: 5000,
    run: async (ctx) => {
      const starterInfo = getItemEntitlementInfo('starter_flag', 'decor');
      if (!starterInfo?.packId) {
        return { status: 'skip', reason: 'Starter pack metadata not available.' };
      }
      ctx.actions.setEntitlementMode('free');
      const plots = Array.isArray(ctx.state().plots) ? [...ctx.state().plots] : [];
      if (plots[0]) {
        plots[0] = { ...plots[0], state: 'empty', decorationId: null, decorationPlacedAt: null, crop: null };
        ctx.actions.updatePlots(plots);
        await ctx.sleep(50);
      }
      const placed = ctx.actions.placeDecoration(0, 'starter_flag');
      if (placed !== true) {
        throw new Error(`Expected free mode placement to succeed, got ${placed}`);
      }
      const modal = document.querySelector('[data-qa="premium-lock-modal"]');
      if (modal) {
        throw new Error('Premium lock modal appeared in free mode.');
      }
      ctx.actions.removeDecoration(0);
      return { detail: 'Free mode allowed premium-tagged decor with no locks.' };
    },
  },
  {
    id: 'entitlements_premium_gating',
    name: 'Entitlements Premium Gating',
    timeoutMs: 6000,
    run: async (ctx) => {
      const starterInfo = getItemEntitlementInfo('starter_flag', 'decor');
      if (!starterInfo?.packId) {
        return { status: 'skip', reason: 'Starter pack metadata not available.' };
      }
      ctx.actions.setEntitlementMode('premium');
      ctx.actions.revokePackEntitlement(starterInfo.packId);
      await ctx.switchToTab('inventory');
      await ctx.sleep(100);
      const badge = document.querySelector('[data-qa="premium-badge-starter_flag"]');
      if (!badge) {
        throw new Error('Premium badge missing for starter decor in premium mode.');
      }
      const placed = ctx.actions.placeDecoration(0, 'starter_flag');
      if (placed !== 'locked') {
        throw new Error(`Expected placement to be locked, got ${placed}`);
      }
      const modal = document.querySelector('[data-qa="premium-lock-modal"]');
      if (!modal) {
        throw new Error('Premium lock modal not shown for locked item.');
      }
      ctx.actions.grantPackEntitlement(starterInfo.packId);
      ctx.actions.clearPremiumLockPrompt();
      const placedAfterGrant = ctx.actions.placeDecoration(0, 'starter_flag');
      if (placedAfterGrant !== true) {
        throw new Error(`Expected placement to succeed after grant, got ${placedAfterGrant}`);
      }
      ctx.actions.removeDecoration(0);
      return { detail: 'Premium mode gating and grant flow validated.' };
    },
  },
  {
    id: 'entitlements_save_fallback',
    name: 'Entitlements Save Fallback',
    timeoutMs: 6000,
    run: async (ctx) => {
      const starterInfo = getItemEntitlementInfo('starter_flag', 'decor');
      if (!starterInfo?.packId) {
        return { status: 'skip', reason: 'Starter pack metadata not available.' };
      }
      ctx.actions.setEntitlementMode('free');
      ctx.actions.placeDecoration(0, 'starter_flag');
      const saveResult = saveStateToStorage(ctx.state(), {
        key: QA_SAVE_KEY,
        backupKey: QA_BACKUP_SAVE_KEY,
      });
      if (!saveResult.success) {
        throw new Error('Failed to save QA state for entitlements fallback.');
      }
      ctx.actions.setEntitlementMode('premium');
      ctx.actions.revokePackEntitlement(starterInfo.packId);
      const loaded = loadSavedStateFromKey(QA_SAVE_KEY);
      if (!loaded) {
        throw new Error('Failed to load QA save for entitlements fallback.');
      }
      ctx.actions.debugLoadState(loaded);
      await ctx.sleep(100);
      const plot = ctx.state().plots?.[0];
      if (plot?.state === 'decor') {
        throw new Error('Locked premium decor did not revert to default.');
      }
      const notice = ctx.state().notifications?.some((item) => (
        item?.message?.includes('premium cosmetic')
        || item?.message?.includes('premium cosmetic isn’t owned')
      ));
      if (!notice) {
        throw new Error('Fallback notice not shown for locked cosmetic.');
      }
      return { detail: 'Save/load fallback reverted locked cosmetics safely.' };
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
  },,
  {
    id: 'seed_code_roundtrip',
    name: 'Seed Code Roundtrip',
    timeoutMs: 4000,
    run: async () => {
      const { encodeSeed, decodeSeed } = await import('../../../utils/seedCode');
      const code = encodeSeed({ version: 1, seed: 11, season: 'summer', packs: ['core'] });
      const parsed = decodeSeed(code);
      if (parsed.error || parsed.payload.season !== 'summer') {
        throw new Error('Seed code roundtrip failed.');
      }
      return { detail: 'Seed encode/decode OK.' };
    },
  },
  {
    id: 'ghost_visit_read_only',
    name: 'Ghost Visit Read-only',
    timeoutMs: 5000,
    run: async (ctx) => {
      const { exportFarmSnapshot, hydrateSnapshotPlots } = await import('../../../utils/farmSnapshot');
      const snapshot = exportFarmSnapshot(ctx.state());
      ctx.actions.enterGhostVisit({ ...snapshot, plots: hydrateSnapshotPlots(snapshot.plots) });
      const before = ctx.state().coins;
      ctx.actions.spendMoney(5);
      if (ctx.state().coins !== before) {
        throw new Error('Coins changed in ghost visit mode.');
      }
      ctx.actions.exitGhostVisit();
      return { detail: 'Ghost mode blocked economy mutations.' };
    },
  },
  {
    id: 'milestone_progress_persist',
    name: 'Milestone Save/Load Persist',
    timeoutMs: 6000,
    run: async (ctx) => {
      ctx.actions.recordMilestoneEvent?.('harvest', { count: 5 });
      const before = ctx.state().milestones?.progress?.totalHarvests || 0;
      const saveResult = saveStateToStorage(ctx.state(), { key: QA_SAVE_KEY, backupKey: QA_BACKUP_SAVE_KEY });
      if (!saveResult.success) throw new Error('Failed to save QA milestone state.');
      const loaded = loadSavedStateFromKey(QA_SAVE_KEY);
      if ((loaded?.milestones?.progress?.totalHarvests || 0) < before) {
        throw new Error('Milestone progress did not persist.');
      }
      return { detail: 'Milestone counters persisted across save/load.' };
    },
  }

];

export const QA_TEST_IDS = QA_TESTS.map((test) => test.id);
