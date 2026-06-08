/**
 * GamePersistence - Save/Load, Migration, and Initialization logic for FarmSim
 *
 * Canonical persistence for the enhanced `farm-sim` UI. The legacy `FarmGame` route
 * uses {@link ../../../utils/save.mjs} (`farmSim_save_v3`); see that module for the split.
 * Key index: {@link ../../../save/storageInventory.js}.
 */
import { isDevelopmentMode } from '../../../config/release';
import { ONBOARDING_STEP_COUNT } from '../../../constants/onboardingWalkthrough';
import { normalizeEntitlements } from '../entitlements/EntitlementManager';
import { getLevelFromXp, remapXpToCurrentCurve } from '../systems/progression';
import { createLogger } from '../../../utils/logger';

const log = createLogger('GamePersistence');

// Save schema version (separate from APP_VERSION in src/config/release.js).
export const SAVE_VERSION = 16;
export const SAVE_KEY = 'farm_sim_enhanced_v2';
export const BACKUP_SAVE_KEY = `${SAVE_KEY}_backup`;
export const QA_SAVE_KEY = `${SAVE_KEY}__qa__`;
export const QA_BACKUP_SAVE_KEY = `${QA_SAVE_KEY}_backup`;
const LEGACY_STORAGE_KEYS = ['farmSim_save_v3', 'farmSim_welcomed', 'farmLifeSave'];

const isFarmStorageKey = (key) =>
  typeof key === 'string' &&
  (key.startsWith('farm_sim_') || key.startsWith('farmSim_') || key.startsWith('farmLife'));

/**
 * Helper function to initialize plots
 * @param {number} gridSize - The size of the grid (gridSize x gridSize)
 * @returns {Array} Array of plot objects
 */
export const initializePlots = (gridSize) => {
  const totalPlots = gridSize * gridSize;
  return Array(totalPlots)
    .fill(null)
    .map((_, index) => ({
      id: index,
      state: 'empty',
      crop: null,
      decorationId: null,
      decorationPlacedAt: null,
      growthStage: 0,
      plantedAt: null,
      waterLevel: 100,
      fertilizer: 0,
      disease: null,
      soilFertility: 1.0,
      progress: 0,
      rotationHistory: [],
    }));
};

const clampNumber = (value, fallback, { min, max } = {}) => {
  if (value === null || value === undefined) return fallback;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  if (typeof min === 'number' && numberValue < min) return min;
  if (typeof max === 'number' && numberValue > max) return max;
  return numberValue;
};

const ensureBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

const ensureObject = (value, fallback = {}) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;

const normalizePlots = (plots, gridSize) => {
  const defaults = initializePlots(gridSize);
  if (!Array.isArray(plots)) return defaults;
  const allowedStates = new Set(['empty', 'planted', 'growing', 'ready', 'withered', 'decor']);
  return defaults.map((fallbackPlot, index) => {
    const plot = plots[index];
    if (!plot || typeof plot !== 'object') return fallbackPlot;
    const state = allowedStates.has(plot.state) ? plot.state : fallbackPlot.state;
    const decorationId = typeof plot.decorationId === 'string' ? plot.decorationId : null;
    return {
      ...fallbackPlot,
      ...plot,
      id: index,
      state,
      crop: plot.crop && typeof plot.crop === 'object' ? plot.crop : null,
      decorationId: state === 'decor' ? decorationId : null,
      decorationPlacedAt: clampNumber(plot.decorationPlacedAt, null, { min: 0 }),
      growthStage: clampNumber(plot.growthStage, fallbackPlot.growthStage, { min: 0 }),
      waterLevel: clampNumber(plot.waterLevel, fallbackPlot.waterLevel, { min: 0, max: 100 }),
      fertilizer: clampNumber(plot.fertilizer, fallbackPlot.fertilizer, { min: 0 }),
      soilFertility: clampNumber(plot.soilFertility, fallbackPlot.soilFertility, {
        min: 0,
        max: 2,
      }),
      progress: clampNumber(plot.progress, fallbackPlot.progress, { min: 0, max: 1 }),
      rotationHistory: Array.isArray(plot.rotationHistory) ? plot.rotationHistory.slice(-3) : [],
    };
  });
};

/**
 * Validates and migrates save data to current version
 * @param {Object} savedData - Raw save data from localStorage
 * @returns {Object|null} - Validated and migrated state, or null if invalid
 */
export function migrateSaveData(savedData) {
  try {
    // Basic validation
    if (!savedData || typeof savedData !== 'object') {
      log.warn('Invalid save data format');
      return null;
    }

    // Get save version (defaults to 0 for old saves)
    const saveVersion = savedData.saveVersion || 0;
    let migratedData = { ...savedData };

    // Version 0 → 1: Add save version and any new fields
    if (saveVersion < 1) {
      if (isDevelopmentMode()) {
        log.debug('Migrating save from version 0 to 1');
      }
      migratedData.saveVersion = 1;

      migratedData.settings = migratedData.settings || {
        autoSave: true,
        soundEnabled: true,
        animationsEnabled: true,
      };

      migratedData.gameLoop = migratedData.gameLoop || {
        lastUpdate: Date.now(),
        fps: 60,
        paused: false,
      };
      if (typeof migratedData.gameLoop.lastSaveTime !== 'number') {
        migratedData.gameLoop.lastSaveTime = Date.now();
      }
    }

    // Version 1 → 2: Almanac + philosophy support
    if (saveVersion < 2) {
      migratedData.philosophy =
        typeof migratedData.philosophy === 'string' ? migratedData.philosophy : null;
      migratedData.almanac = migratedData.almanac || {
        unlocked: {},
        dates: {},
        counters: {
          weatherSeen: {},
          cropSeasonMask: {},
          seasonsSeen: {},
          dayCount: 0,
        },
        lastDayKey: null,
      };
    }

    // Version 2 → 3: Mini-games state
    if (saveVersion < 3) {
      migratedData.minigames = migratedData.minigames || {
        perfectHarvest: {
          lastPlayedDayKey: null,
          lastFestivalId: null,
          lastResult: null,
          lastPlayedAt: null,
        },
      };
    }

    // Version 3 → 4: Onboarding state
    if (saveVersion < 4) {
      migratedData.onboardingSeen = true;
      migratedData.onboardingStep = ONBOARDING_STEP_COUNT;
      migratedData.onboardingSkipped = true;
    }

    // Version 4 → 5: Festival mini-game state
    if (saveVersion < 5) {
      const legacy = migratedData.minigames?.perfectHarvest || {};
      migratedData.minigames = migratedData.minigames || {};
      migratedData.minigames.festivalGame = {
        lastPlayedDayKey: legacy.lastPlayedDayKey || null,
        lastFestivalId: legacy.lastFestivalId || null,
        lastRuleId: legacy.lastRuleId || null,
        lastResult: legacy.lastResult || null,
        lastPlayedAt: legacy.lastPlayedAt || null,
      };
    }

    // Version 5 → 6: Cozy goals + What's New tracking
    if (saveVersion < 6) {
      migratedData.cozyGoals = {
        lastGeneratedGoals: null,
        completedGoalIds: [],
      };
      migratedData.whatsNew = {
        dismissed: {},
      };
    }

    // Version 6 → 7: Farm identity (name, theme, spotlight)
    if (saveVersion < 7) {
      migratedData.farmName =
        typeof migratedData.farmName === 'string' ? migratedData.farmName : 'Willowbrook Farm';
      migratedData.farmTheme =
        typeof migratedData.farmTheme === 'string' ? migratedData.farmTheme : 'meadow';
      migratedData.spotlight = migratedData.spotlight || {
        mode: 'latest',
        type: 'memory',
        id: null,
      };
      migratedData.lastUnlockedMemoryId =
        typeof migratedData.lastUnlockedMemoryId === 'string'
          ? migratedData.lastUnlockedMemoryId
          : null;
      migratedData.lastUnlockedAlmanacId =
        typeof migratedData.lastUnlockedAlmanacId === 'string'
          ? migratedData.lastUnlockedAlmanacId
          : null;
    }

    // Version 7 → 8: What's New version tracking
    if (saveVersion < 8) {
      migratedData.whatsNew = migratedData.whatsNew || {};
      migratedData.whatsNew.lastSeenVersion = null;
    }

    // Version 8 → 9: Retention (welcome back + daily/weekly visits)
    if (saveVersion < 9) {
      migratedData.retention = {
        lastSessionAt: null,
        lastSeenDayKey: null,
        lastSeenGameDay: 0,
        lastSeenSeason: 'spring',
        lastWelcomeBackShownAt: null,
        lastWelcomeBackDayKey: null,
        lastDailyDelightClaimDate: null,
        dailyDelightClaimCount: 0,
        weeklyVisits: {
          weekKey: null,
          days: [],
          claimedTiers: [],
        },
      };
    }

    // Version 9 → 10: Entitlements (cosmetics-only)
    if (saveVersion < 10) {
      migratedData.entitlements = {
        mode: 'free',
        packs: [],
        lockedCosmetics: {
          decor: {},
          farmTheme: null,
        },
      };
    }

    // Version 10 → 11: Notification history support
    if (saveVersion < 11) {
      migratedData.notificationHistory = [];
    }

    // Version 11 → 12: Cozy expansion cosmetics
    if (saveVersion < 12) {
      migratedData.cozyExpansion = {
        cropTraits: { discoveredByCrop: {}, totalDiscovered: 0, lastDiscovered: null },
        rareMoments: { unlocked: {}, dayKeys: {} },
        decorSets: { completed: {}, progress: {} },
        farmTitles: { unlocked: { home_grower: true }, activeId: 'home_grower' },
        visualState: { weather: 'sunny', lastPeriodKey: null, lastWeeklySpecialDayKey: null },
      };
    }

    // Version 12 → 13: Seed provenance, ghost visit, milestones
    if (saveVersion < 13) {
      migratedData.seedProvenance = null;
      migratedData.ghostVisit = { active: false, snapshot: null };
      migratedData.milestones = {
        progress: {
          daysPlayed: 0,
          totalHarvests: 0,
          uniqueCropsGrown: 0,
          decorSetsCompleted: 0,
          rareMomentsSeen: 0,
          minigamesPlayed: 0,
          petsInteractedDays: 0,
        },
        unlocked: {},
        recent: [],
      };
    }

    // Version 13 → 14: Progression XP tracker + recent XP feed
    if (saveVersion < 14) {
      migratedData.progressionXpTracker = {
        dayKey: null,
        harvestCounts: {},
        minigameDailyXp: {},
        milestoneDailyXp: 0,
        challengeDailyXp: 0,
        rareMomentDailyXp: 0,
      };
      migratedData.recentXpEvents = [];
    }

    // Version 14 → 15: XP curve remap preserving level and within-level progress
    if (saveVersion < 15) {
      const priorXp = clampNumber(migratedData.xp, 0, { min: 0 });
      const priorLevel = clampNumber(migratedData.level, 1, { min: 1 });
      migratedData.xp = remapXpToCurrentCurve(priorXp, priorLevel);
      migratedData.level = Math.max(priorLevel, getLevelFromXp(migratedData.xp));
    }

    // Version 15 → 16: Crop rotation history + keyboard shortcuts setting
    if (saveVersion < 16) {
      // rotationHistory added to plots via normalizePlots fallback
      // Add keyboard shortcuts setting
      if (migratedData.settings) {
        migratedData.settings.keyboardShortcuts = true;
      }
    }

    // Validate critical fields
    migratedData.coins = clampNumber(migratedData.coins, 100, { min: 0 });
    migratedData.xp = clampNumber(migratedData.xp, 0, { min: 0 });
    migratedData.level = Math.max(
      clampNumber(migratedData.level, 1, { min: 1 }),
      getLevelFromXp(migratedData.xp)
    );
    migratedData.gridSize = Math.round(clampNumber(migratedData.gridSize, 3, { min: 3, max: 5 }));
    migratedData.cosmeticTokens = clampNumber(migratedData.cosmeticTokens, 0, { min: 0 });

    migratedData.plots = normalizePlots(migratedData.plots, migratedData.gridSize);

    // Ensure livestock structure exists
    if (!migratedData.livestock || typeof migratedData.livestock !== 'object') {
      migratedData.livestock = { animals: [], capacity: 10, totalProduced: 0 };
    }

    // Ensure fishing structure exists
    if (!migratedData.fishing || typeof migratedData.fishing !== 'object') {
      migratedData.fishing = {
        pond: { level: 1, population: 100, maxPopulation: 100 },
        stats: { totalCaught: 0, totalValue: 0, largestFish: 0, byType: {} },
      };
    }

    migratedData.inventory = ensureObject(migratedData.inventory, {});
    migratedData.buildings = ensureObject(migratedData.buildings, {});
    migratedData.achievements = Array.isArray(migratedData.achievements)
      ? migratedData.achievements
      : [];
    migratedData.memoryFlags = ensureObject(migratedData.memoryFlags, {});
    migratedData.memoryCounters = ensureObject(migratedData.memoryCounters, {
      decorationsPlaced: 0,
      festivalsAttended: 0,
    });
    migratedData.farmName =
      typeof migratedData.farmName === 'string' ? migratedData.farmName : 'Willowbrook Farm';
    migratedData.farmTheme =
      typeof migratedData.farmTheme === 'string' ? migratedData.farmTheme : 'meadow';
    migratedData.spotlight = ensureObject(migratedData.spotlight, {
      mode: 'latest',
      type: 'memory',
      id: null,
    });
    migratedData.lastUnlockedMemoryId =
      typeof migratedData.lastUnlockedMemoryId === 'string'
        ? migratedData.lastUnlockedMemoryId
        : null;
    migratedData.lastUnlockedAlmanacId =
      typeof migratedData.lastUnlockedAlmanacId === 'string'
        ? migratedData.lastUnlockedAlmanacId
        : null;
    migratedData.cozyExpansion = ensureObject(migratedData.cozyExpansion, {});
    migratedData.cozyExpansion.cropTraits = ensureObject(migratedData.cozyExpansion.cropTraits, {
      discoveredByCrop: {},
      totalDiscovered: 0,
      lastDiscovered: null,
    });
    migratedData.cozyExpansion.cropTraits.discoveredByCrop = ensureObject(
      migratedData.cozyExpansion.cropTraits.discoveredByCrop,
      {}
    );
    migratedData.cozyExpansion.cropTraits.totalDiscovered = clampNumber(
      migratedData.cozyExpansion.cropTraits.totalDiscovered,
      0,
      { min: 0 }
    );
    migratedData.cozyExpansion.cropTraits.lastDiscovered =
      migratedData.cozyExpansion.cropTraits.lastDiscovered &&
      typeof migratedData.cozyExpansion.cropTraits.lastDiscovered === 'object'
        ? migratedData.cozyExpansion.cropTraits.lastDiscovered
        : null;
    migratedData.cozyExpansion.rareMoments = ensureObject(migratedData.cozyExpansion.rareMoments, {
      unlocked: {},
      dayKeys: {},
    });
    migratedData.cozyExpansion.rareMoments.unlocked = ensureObject(
      migratedData.cozyExpansion.rareMoments.unlocked,
      {}
    );
    migratedData.cozyExpansion.rareMoments.dayKeys = ensureObject(
      migratedData.cozyExpansion.rareMoments.dayKeys,
      {}
    );
    migratedData.cozyExpansion.decorSets = ensureObject(migratedData.cozyExpansion.decorSets, {
      completed: {},
      progress: {},
    });
    migratedData.cozyExpansion.decorSets.completed = ensureObject(
      migratedData.cozyExpansion.decorSets.completed,
      {}
    );
    migratedData.cozyExpansion.decorSets.progress = ensureObject(
      migratedData.cozyExpansion.decorSets.progress,
      {}
    );
    migratedData.cozyExpansion.farmTitles = ensureObject(migratedData.cozyExpansion.farmTitles, {
      unlocked: { home_grower: true },
      activeId: 'home_grower',
    });
    migratedData.cozyExpansion.farmTitles.unlocked = ensureObject(
      migratedData.cozyExpansion.farmTitles.unlocked,
      { home_grower: true }
    );
    migratedData.cozyExpansion.farmTitles.unlocked.home_grower = true;
    migratedData.cozyExpansion.farmTitles.activeId =
      typeof migratedData.cozyExpansion.farmTitles.activeId === 'string'
        ? migratedData.cozyExpansion.farmTitles.activeId
        : 'home_grower';
    migratedData.cozyExpansion.visualState = ensureObject(migratedData.cozyExpansion.visualState, {
      weather: 'sunny',
      lastPeriodKey: null,
      lastWeeklySpecialDayKey: null,
    });
    migratedData.cozyExpansion.contextHints = ensureObject(
      migratedData.cozyExpansion.contextHints,
      { dismissed: {} }
    );
    migratedData.cozyExpansion.contextHints.dismissed = ensureObject(
      migratedData.cozyExpansion.contextHints.dismissed,
      {}
    );
    migratedData.cozyExpansion.visualState.weather =
      typeof migratedData.cozyExpansion.visualState.weather === 'string'
        ? migratedData.cozyExpansion.visualState.weather
        : 'sunny';
    migratedData.cozyExpansion.visualState.lastPeriodKey =
      typeof migratedData.cozyExpansion.visualState.lastPeriodKey === 'string'
        ? migratedData.cozyExpansion.visualState.lastPeriodKey
        : null;
    migratedData.cozyExpansion.visualState.lastWeeklySpecialDayKey =
      typeof migratedData.cozyExpansion.visualState.lastWeeklySpecialDayKey === 'string'
        ? migratedData.cozyExpansion.visualState.lastWeeklySpecialDayKey
        : null;
    if (!['latest', 'favorite'].includes(migratedData.spotlight.mode)) {
      migratedData.spotlight.mode = 'latest';
    }
    if (!['memory', 'almanac'].includes(migratedData.spotlight.type)) {
      migratedData.spotlight.type = 'memory';
    }
    if (migratedData.spotlight.id !== null && typeof migratedData.spotlight.id !== 'string') {
      migratedData.spotlight.id = null;
    }
    migratedData.philosophy =
      typeof migratedData.philosophy === 'string' ? migratedData.philosophy : null;
    migratedData.almanac = ensureObject(migratedData.almanac, {
      unlocked: {},
      dates: {},
      counters: {
        weatherSeen: {},
        cropSeasonMask: {},
        seasonsSeen: {},
        dayCount: 0,
      },
      lastDayKey: null,
    });
    migratedData.almanac.unlocked = ensureObject(migratedData.almanac.unlocked, {});
    migratedData.almanac.dates = ensureObject(migratedData.almanac.dates, {});
    migratedData.almanac.counters = ensureObject(migratedData.almanac.counters, {
      weatherSeen: {},
      cropSeasonMask: {},
      seasonsSeen: {},
      dayCount: 0,
    });
    migratedData.almanac.counters.weatherSeen = ensureObject(
      migratedData.almanac.counters.weatherSeen,
      {}
    );
    migratedData.almanac.counters.cropSeasonMask = ensureObject(
      migratedData.almanac.counters.cropSeasonMask,
      {}
    );
    migratedData.almanac.counters.seasonsSeen = ensureObject(
      migratedData.almanac.counters.seasonsSeen,
      {}
    );
    migratedData.almanac.counters.dayCount = clampNumber(
      migratedData.almanac.counters.dayCount,
      0,
      { min: 0 }
    );
    migratedData.almanac.lastDayKey =
      typeof migratedData.almanac.lastDayKey === 'string' ? migratedData.almanac.lastDayKey : null;
    migratedData.cozyGoals = ensureObject(migratedData.cozyGoals, {
      lastGeneratedGoals: null,
      completedGoalIds: [],
    });
    if (
      migratedData.cozyGoals.lastGeneratedGoals &&
      typeof migratedData.cozyGoals.lastGeneratedGoals === 'object'
    ) {
      const lastGenerated = migratedData.cozyGoals.lastGeneratedGoals;
      migratedData.cozyGoals.lastGeneratedGoals = {
        dayKey: typeof lastGenerated.dayKey === 'string' ? lastGenerated.dayKey : null,
        goals: Array.isArray(lastGenerated.goals) ? lastGenerated.goals : [],
      };
    } else {
      migratedData.cozyGoals.lastGeneratedGoals = null;
    }
    migratedData.cozyGoals.completedGoalIds = Array.isArray(migratedData.cozyGoals.completedGoalIds)
      ? migratedData.cozyGoals.completedGoalIds
      : [];
    migratedData.whatsNew = ensureObject(migratedData.whatsNew, { dismissed: {} });
    migratedData.whatsNew.dismissed = ensureObject(migratedData.whatsNew.dismissed, {});
    migratedData.whatsNew.lastSeenVersion =
      typeof migratedData.whatsNew.lastSeenVersion === 'string'
        ? migratedData.whatsNew.lastSeenVersion
        : null;
    migratedData.seasonalEvents = Array.isArray(migratedData.seasonalEvents)
      ? migratedData.seasonalEvents
      : [];
    migratedData.activeSeasonalEvents = Array.isArray(migratedData.activeSeasonalEvents)
      ? migratedData.activeSeasonalEvents
      : [];
    migratedData.dailyChallenges = Array.isArray(migratedData.dailyChallenges)
      ? migratedData.dailyChallenges
      : [];
    migratedData.dailyChallengeProgress = ensureObject(migratedData.dailyChallengeProgress, {});
    migratedData.notifications = Array.isArray(migratedData.notifications)
      ? migratedData.notifications
      : [];
    migratedData.notificationHistory = Array.isArray(migratedData.notificationHistory)
      ? migratedData.notificationHistory
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => ({
            id:
              typeof entry.id === 'string'
                ? entry.id
                : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            message: typeof entry.message === 'string' ? entry.message : '',
            type: typeof entry.type === 'string' ? entry.type : 'info',
            details: typeof entry.details === 'string' ? entry.details : null,
            timestamp: clampNumber(entry.timestamp, Date.now(), { min: 0 }),
          }))
          .slice(-120)
      : [];
    migratedData.minigames = ensureObject(migratedData.minigames, {
      perfectHarvest: {
        lastPlayedDayKey: null,
        lastFestivalId: null,
        lastResult: null,
        lastPlayedAt: null,
      },
    });
    migratedData.minigames.perfectHarvest = ensureObject(migratedData.minigames.perfectHarvest, {
      lastPlayedDayKey: null,
      lastFestivalId: null,
      lastResult: null,
      lastPlayedAt: null,
    });
    migratedData.minigames.festivalGame = ensureObject(migratedData.minigames.festivalGame, {
      lastPlayedDayKey: null,
      lastFestivalId: null,
      lastRuleId: null,
      lastResult: null,
      lastPlayedAt: null,
    });
    migratedData.minigames.perfectHarvest.lastPlayedDayKey =
      typeof migratedData.minigames.perfectHarvest.lastPlayedDayKey === 'string'
        ? migratedData.minigames.perfectHarvest.lastPlayedDayKey
        : null;
    migratedData.minigames.perfectHarvest.lastFestivalId =
      typeof migratedData.minigames.perfectHarvest.lastFestivalId === 'string'
        ? migratedData.minigames.perfectHarvest.lastFestivalId
        : null;
    migratedData.minigames.perfectHarvest.lastResult =
      typeof migratedData.minigames.perfectHarvest.lastResult === 'string'
        ? migratedData.minigames.perfectHarvest.lastResult
        : null;
    migratedData.minigames.perfectHarvest.lastPlayedAt = clampNumber(
      migratedData.minigames.perfectHarvest.lastPlayedAt,
      null,
      { min: 0 }
    );
    migratedData.minigames.festivalGame.lastPlayedDayKey =
      typeof migratedData.minigames.festivalGame.lastPlayedDayKey === 'string'
        ? migratedData.minigames.festivalGame.lastPlayedDayKey
        : null;
    migratedData.minigames.festivalGame.lastFestivalId =
      typeof migratedData.minigames.festivalGame.lastFestivalId === 'string'
        ? migratedData.minigames.festivalGame.lastFestivalId
        : null;
    migratedData.minigames.festivalGame.lastRuleId =
      typeof migratedData.minigames.festivalGame.lastRuleId === 'string'
        ? migratedData.minigames.festivalGame.lastRuleId
        : null;
    migratedData.minigames.festivalGame.lastResult =
      typeof migratedData.minigames.festivalGame.lastResult === 'string'
        ? migratedData.minigames.festivalGame.lastResult
        : null;
    migratedData.minigames.festivalGame.lastPlayedAt = clampNumber(
      migratedData.minigames.festivalGame.lastPlayedAt,
      null,
      { min: 0 }
    );
    migratedData.weather =
      typeof migratedData.weather === 'string' ? migratedData.weather : 'sunny';
    migratedData.weatherForecast = Array.isArray(migratedData.weatherForecast)
      ? migratedData.weatherForecast
      : [];
    migratedData.processingFacilities = Array.isArray(migratedData.processingFacilities)
      ? migratedData.processingFacilities
      : [];
    migratedData.processingQueue = Array.isArray(migratedData.processingQueue)
      ? migratedData.processingQueue
      : [];
    migratedData.processedInventory = ensureObject(migratedData.processedInventory, {});
    migratedData.pets = Array.isArray(migratedData.pets) ? migratedData.pets : [];
    migratedData.social = ensureObject(migratedData.social, {
      friends: [],
      reputation: 0,
      marketListings: [],
    });
    migratedData.genetics = ensureObject(migratedData.genetics, {});
    migratedData.research = ensureObject(migratedData.research, {});
    migratedData.prestige = ensureObject(migratedData.prestige, {
      tier: 0,
      totalRebirths: 0,
      legacyPoints: 0,
      legacyBonuses: {},
      heirloomSeeds: [],
    });

    migratedData.settings = {
      autoSave: ensureBoolean(migratedData.settings?.autoSave, true),
      soundEnabled: ensureBoolean(migratedData.settings?.soundEnabled, true),
      musicEnabled: ensureBoolean(migratedData.settings?.musicEnabled, true),
      animationsEnabled: ensureBoolean(migratedData.settings?.animationsEnabled, true),
      showFPS: ensureBoolean(migratedData.settings?.showFPS, false),
      showAlmanacHints: ensureBoolean(migratedData.settings?.showAlmanacHints, true),
      showWelcomeBackSummary: ensureBoolean(migratedData.settings?.showWelcomeBackSummary, true),
      showTooltips: ensureBoolean(migratedData.settings?.showTooltips, true),
      keyboardShortcuts: ensureBoolean(migratedData.settings?.keyboardShortcuts, true),
    };

    migratedData.selectedDecoration =
      typeof migratedData.selectedDecoration === 'string' ? migratedData.selectedDecoration : null;
    migratedData.decorateMode = ensureBoolean(migratedData.decorateMode, false);
    migratedData.onboardingSeen = ensureBoolean(
      migratedData.onboardingSeen,
      saveVersion < 4 ? true : false
    );
    migratedData.onboardingStep = clampNumber(
      migratedData.onboardingStep,
      saveVersion < 4 ? ONBOARDING_STEP_COUNT : 0,
      { min: 0, max: ONBOARDING_STEP_COUNT }
    );
    migratedData.onboardingSkipped = ensureBoolean(
      migratedData.onboardingSkipped,
      saveVersion < 4 ? true : false
    );

    migratedData.gameLoop = {
      lastUpdate: clampNumber(migratedData.gameLoop?.lastUpdate, Date.now(), { min: 0 }),
      fps: clampNumber(migratedData.gameLoop?.fps, 60, { min: 0 }),
      paused: ensureBoolean(migratedData.gameLoop?.paused, false),
      lastSaveTime: clampNumber(migratedData.gameLoop?.lastSaveTime, Date.now(), { min: 0 }),
      pauseReason:
        typeof migratedData.gameLoop?.pauseReason === 'string'
          ? migratedData.gameLoop.pauseReason
          : null,
      pausedAt: clampNumber(migratedData.gameLoop?.pausedAt, null, { min: 0 }),
    };

    migratedData.season = ensureObject(migratedData.season, {
      current: 'spring',
      lastChangeTime: Date.now(),
      config: null,
    });
    if (typeof migratedData.season.current !== 'string') {
      migratedData.season.current = 'spring';
    }
    if (!Number.isFinite(migratedData.season.lastChangeTime)) {
      migratedData.season.lastChangeTime = Date.now();
    }

    if (typeof migratedData.lastChallengeReset !== 'number') {
      migratedData.lastChallengeReset = Date.now();
    }
    if (typeof migratedData.challengeStreak !== 'number') {
      migratedData.challengeStreak = 0;
    }

    migratedData.retention = ensureObject(migratedData.retention, {
      lastSessionAt: null,
      lastSeenDayKey: null,
      lastSeenGameDay: 0,
      lastSeenSeason: 'spring',
      lastWelcomeBackShownAt: null,
      lastWelcomeBackDayKey: null,
      lastDailyDelightClaimDate: null,
      dailyDelightClaimCount: 0,
      weeklyVisits: {
        weekKey: null,
        days: [],
        claimedTiers: [],
      },
    });
    migratedData.retention.lastSessionAt = clampNumber(migratedData.retention.lastSessionAt, null, {
      min: 0,
    });
    migratedData.retention.lastSeenDayKey =
      typeof migratedData.retention.lastSeenDayKey === 'string'
        ? migratedData.retention.lastSeenDayKey
        : null;
    migratedData.retention.lastSeenGameDay = clampNumber(
      migratedData.retention.lastSeenGameDay,
      0,
      { min: 0 }
    );
    migratedData.retention.lastSeenSeason =
      typeof migratedData.retention.lastSeenSeason === 'string'
        ? migratedData.retention.lastSeenSeason
        : 'spring';
    migratedData.retention.lastWelcomeBackShownAt = clampNumber(
      migratedData.retention.lastWelcomeBackShownAt,
      null,
      { min: 0 }
    );
    migratedData.retention.lastWelcomeBackDayKey =
      typeof migratedData.retention.lastWelcomeBackDayKey === 'string'
        ? migratedData.retention.lastWelcomeBackDayKey
        : null;
    migratedData.retention.lastDailyDelightClaimDate =
      typeof migratedData.retention.lastDailyDelightClaimDate === 'string'
        ? migratedData.retention.lastDailyDelightClaimDate
        : null;
    migratedData.retention.dailyDelightClaimCount = clampNumber(
      migratedData.retention.dailyDelightClaimCount,
      0,
      { min: 0 }
    );
    migratedData.retention.weeklyVisits = ensureObject(migratedData.retention.weeklyVisits, {
      weekKey: null,
      days: [],
      claimedTiers: [],
    });
    migratedData.retention.weeklyVisits.weekKey =
      typeof migratedData.retention.weeklyVisits.weekKey === 'string'
        ? migratedData.retention.weeklyVisits.weekKey
        : null;
    migratedData.retention.weeklyVisits.days = Array.isArray(
      migratedData.retention.weeklyVisits.days
    )
      ? migratedData.retention.weeklyVisits.days.filter((day) => typeof day === 'string')
      : [];
    migratedData.retention.weeklyVisits.claimedTiers = Array.isArray(
      migratedData.retention.weeklyVisits.claimedTiers
    )
      ? migratedData.retention.weeklyVisits.claimedTiers.filter((tier) => Number.isFinite(tier))
      : [];

    migratedData.seedProvenance = ensureObject(migratedData.seedProvenance, null);
    migratedData.ghostVisit = ensureObject(migratedData.ghostVisit, {
      active: false,
      snapshot: null,
    });
    migratedData.ghostVisit.active = false;
    migratedData.ghostVisit.snapshot = null;
    const milestoneDefaults = {
      daysPlayed: 0,
      totalHarvests: 0,
      uniqueCropsGrown: 0,
      decorSetsCompleted: 0,
      rareMomentsSeen: 0,
      minigamesPlayed: 0,
      petsInteractedDays: 0,
    };
    migratedData.milestones = ensureObject(migratedData.milestones, {
      progress: milestoneDefaults,
      unlocked: {},
      recent: [],
    });
    migratedData.milestones.progress = {
      ...milestoneDefaults,
      ...ensureObject(migratedData.milestones.progress, {}),
    };
    Object.keys(migratedData.milestones.progress).forEach((key) => {
      migratedData.milestones.progress[key] = clampNumber(
        migratedData.milestones.progress[key],
        0,
        { min: 0 }
      );
    });
    migratedData.milestones.unlocked = ensureObject(migratedData.milestones.unlocked, {});
    migratedData.milestones.recent = Array.isArray(migratedData.milestones.recent)
      ? migratedData.milestones.recent.filter((id) => typeof id === 'string').slice(-3)
      : [];

    migratedData.progressionXpTracker = ensureObject(migratedData.progressionXpTracker, {
      dayKey: null,
      harvestCounts: {},
      minigameDailyXp: {},
      milestoneDailyXp: 0,
      challengeDailyXp: 0,
      rareMomentDailyXp: 0,
    });
    migratedData.progressionXpTracker.dayKey =
      typeof migratedData.progressionXpTracker.dayKey === 'string'
        ? migratedData.progressionXpTracker.dayKey
        : null;
    migratedData.progressionXpTracker.harvestCounts = ensureObject(
      migratedData.progressionXpTracker.harvestCounts,
      {}
    );
    migratedData.progressionXpTracker.minigameDailyXp = ensureObject(
      migratedData.progressionXpTracker.minigameDailyXp,
      {}
    );
    migratedData.progressionXpTracker.milestoneDailyXp = clampNumber(
      migratedData.progressionXpTracker.milestoneDailyXp,
      0,
      { min: 0 }
    );
    migratedData.progressionXpTracker.challengeDailyXp = clampNumber(
      migratedData.progressionXpTracker.challengeDailyXp,
      0,
      { min: 0 }
    );
    migratedData.progressionXpTracker.rareMomentDailyXp = clampNumber(
      migratedData.progressionXpTracker.rareMomentDailyXp,
      0,
      { min: 0 }
    );
    migratedData.recentXpEvents = Array.isArray(migratedData.recentXpEvents)
      ? migratedData.recentXpEvents.slice(-3)
      : [];

    migratedData.entitlements = normalizeEntitlements(migratedData.entitlements);

    migratedData.saveVersion = SAVE_VERSION;
    return migratedData;
  } catch (error) {
    console.error('[farm]', 'Error migrating save data', error);
    return null;
  }
}

export const createSavePayload = (state, saveTimestamp = Date.now()) => ({
  ...state,
  saveVersion: SAVE_VERSION,
  notifications: [],
  gameLoop: { ...state.gameLoop, lastSaveTime: saveTimestamp },
});

export const saveStateToStorage = (state, { key = SAVE_KEY, backupKey = BACKUP_SAVE_KEY } = {}) => {
  try {
    const saveTimestamp = Date.now();
    const payload = createSavePayload(state, saveTimestamp);
    const existing = localStorage.getItem(key);
    if (existing && backupKey) {
      localStorage.setItem(backupKey, existing);
    }
    localStorage.setItem(key, JSON.stringify(payload));
    return { success: true, timestamp: saveTimestamp };
  } catch (error) {
    console.error('[farm]', 'Failed to save state', error);
    return { success: false, error };
  }
};

export const importSaveDataToStorage = (
  rawSaveData,
  { key = SAVE_KEY, backupKey = BACKUP_SAVE_KEY } = {}
) => {
  try {
    const migratedData = migrateSaveData(rawSaveData);
    if (!migratedData) {
      return {
        success: false,
        error: new Error('Invalid save file format'),
      };
    }
    return saveStateToStorage(migratedData, { key, backupKey });
  } catch (error) {
    console.error('[farm]', 'Failed to import save data', error);
    return { success: false, error };
  }
};

export const loadSavedStateFromKey = (key) => {
  try {
    const savedDataString = localStorage.getItem(key);
    if (!savedDataString) return null;
    const savedData = JSON.parse(savedDataString);
    const migratedData = migrateSaveData(savedData);
    if (!migratedData) return null;
    migratedData.notifications = [];
    return migratedData;
  } catch (error) {
    console.error('[farm]', 'Failed to load saved game', error);
    return null;
  }
};

export const clearSaveKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[farm]', 'Failed to clear save key', error);
  }
};

export const clearFarmCache = ({ preserveKeys = [SAVE_KEY] } = {}) => {
  try {
    const preserved = new Set(
      Array.isArray(preserveKeys)
        ? preserveKeys.filter((key) => typeof key === 'string' && key.length > 0)
        : [SAVE_KEY]
    );
    const candidates = new Set([
      SAVE_KEY,
      BACKUP_SAVE_KEY,
      QA_SAVE_KEY,
      QA_BACKUP_SAVE_KEY,
      ...LEGACY_STORAGE_KEYS,
    ]);

    if (typeof localStorage?.length === 'number' && typeof localStorage?.key === 'function') {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (typeof key === 'string') {
          candidates.add(key);
        }
      }
    }

    const removedKeys = [];
    for (const key of candidates) {
      if (!isFarmStorageKey(key) || preserved.has(key)) continue;
      if (localStorage.getItem(key) === null) continue;
      localStorage.removeItem(key);
      removedKeys.push(key);
    }

    return { success: true, removedKeys };
  } catch (error) {
    console.error('[farm]', 'Failed to clear farm cache', error);
    return { success: false, error, removedKeys: [] };
  }
};

/**
 * Loads and validates saved game state from localStorage
 * @returns {Object|null} - Loaded state or null if no valid save exists
 */
export function loadSavedState() {
  try {
    const primary = loadSavedStateFromKey(SAVE_KEY);
    if (primary) return primary;

    return loadSavedStateFromKey(BACKUP_SAVE_KEY);
  } catch (error) {
    console.error('[farm]', 'Failed to load saved game', error);
    return null;
  }
}
