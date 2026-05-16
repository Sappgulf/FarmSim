import { GAME_ACTIONS } from './GameActions';
import { SAVE_VERSION, initializePlots } from './GamePersistence';
import { getLevelBandRewards, getLevelFromXp } from '../systems/progression';

const STARTER_INVENTORY = Object.freeze({
  lettuce: 4,
  carrot: 3,
  fertilizer: 2,
  pesticide: 2,
  starter_flag: 1,
});
const MAX_ACTIVE_NOTIFICATIONS = 8;

// Initial game state
export const initialState = {
  // Save metadata
  saveVersion: SAVE_VERSION,

  // Core game state
  coins: 140,
  xp: 0,
  level: 1,
  gridSize: 3,
  progressionXpTracker: {
    dayKey: null,
    harvestCounts: {},
    minigameDailyXp: {},
    milestoneDailyXp: 0,
    challengeDailyXp: 0,
    rareMomentDailyXp: 0,
  },
  recentXpEvents: [],
  cosmeticTokens: 0,

  // Game objects
  plots: initializePlots(3),
  inventory: { ...STARTER_INVENTORY },
  buildings: {},
  livestock: {
    animals: [],
    capacity: 10,
    totalProduced: 0,
  },
  fishing: {
    pond: {
      level: 1,
      population: 100,
      maxPopulation: 100,
    },
    stats: {
      totalCaught: 0,
      totalValue: 0,
      largestFish: 0,
      byType: {},
    },
  },

  // Weather system
  weather: 'sunny',
  weatherForecast: [],

  // Season system
  season: {
    current: 'spring',
    lastChangeTime: Date.now(),
    config: null,
  },

  // Progression systems
  achievements: [],
  memoryFlags: {},
  memoryCounters: {
    decorationsPlaced: 0,
    festivalsAttended: 0,
  },
  philosophy: null,
  farmName: 'Willowbrook Farm',
  farmTheme: 'meadow',
  spotlight: {
    mode: 'latest',
    type: 'memory',
    id: null,
  },
  lastUnlockedMemoryId: null,
  lastUnlockedAlmanacId: null,
  cozyExpansion: {
    cropTraits: { discoveredByCrop: {}, totalDiscovered: 0, lastDiscovered: null },
    rareMoments: { unlocked: {}, dayKeys: {} },
    decorSets: { completed: {}, progress: {} },
    farmTitles: { unlocked: { home_grower: true }, activeId: 'home_grower' },
    visualState: { weather: 'sunny', lastPeriodKey: null, lastWeeklySpecialDayKey: null },
    contextHints: { dismissed: {} },
  },
  almanac: {
    unlocked: {},
    dates: {},
    counters: {
      weatherSeen: {},
      cropSeasonMask: {},
      seasonsSeen: {},
      dayCount: 0,
    },
    lastDayKey: null,
  },
  cozyGoals: {
    lastGeneratedGoals: null,
    completedGoalIds: [],
  },
  whatsNew: {
    dismissed: {},
    lastSeenVersion: null,
  },
  seasonalEvents: [],
  activeSeasonalEvents: [],
  dailyChallenges: [],
  dailyChallengeProgress: {},
  lastChallengeReset: Date.now(),
  challengeStreak: 0,
  dailyQuests: null,
  minigames: {
    perfectHarvest: {
      lastPlayedDayKey: null,
      lastFestivalId: null,
      lastResult: null,
      lastPlayedAt: null,
    },
    festivalGame: {
      lastPlayedDayKey: null,
      lastFestivalId: null,
      lastRuleId: null,
      lastResult: null,
      lastPlayedAt: null,
    },
  },
  disasterProtections: {},
  prestige: {
    tier: 0,
    totalRebirths: 0,
    legacyPoints: 0,
    legacyBonuses: {},
    heirloomSeeds: [],
  },
  research: {},
  genetics: {},

  // Social features
  social: {
    friends: [],
    reputation: 0,
    marketListings: [],
  },
  seedProvenance: null,
  ghostVisit: {
    active: false,
    snapshot: null,
  },
  milestones: {
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
  },

  // Pets system
  pets: [],

  // Processing system
  processingFacilities: [],
  processingQueue: [],
  processedInventory: {},

  // UI state
  notifications: [],
  notificationHistory: [],
  selectedCrop: 'lettuce',
  selectedDecoration: null,
  decorateMode: false,
  onboardingSeen: false,
  onboardingStep: 0,
  onboardingSkipped: false,
  settings: {
    autoSave: true,
    soundEnabled: true,
    musicEnabled: true,
    animationsEnabled: true,
    showAlmanacHints: true,
    showWelcomeBackSummary: true,
    showTooltips: true,
    keyboardShortcuts: true,
  },
  entitlements: {
    mode: 'free',
    packs: [],
    lockedCosmetics: {
      decor: {},
      farmTheme: null,
    },
  },
  premiumLockPrompt: null,

  // Retention
  retention: {
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
  },

  // Performance state
  gameLoop: {
    lastUpdate: Date.now(),
    fps: 60,
    paused: false,
    lastSaveTime: null,
  },
};

const sanitizeNonNegativeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
};

const mergeIfChanged = (current, patch) => {
  if (!patch || typeof patch !== 'object') return current;
  let changed = false;
  const merged = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (!Object.is(current?.[key], value)) {
      merged[key] = value;
      changed = true;
    }
  }
  return changed ? merged : current;
};

/**
 * Game reducer function
 * @param {Object} state - Current game state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New game state
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.SET_COINS:
      const resolvedCoins =
        typeof action.payload === 'function' ? action.payload(state.coins) : action.payload;
      const newCoins = sanitizeNonNegativeNumber(resolvedCoins, state.coins);
      if (newCoins === state.coins) return state;
      return { ...state, coins: newCoins };

    case GAME_ACTIONS.SET_XP:
      const resolvedXp =
        typeof action.payload === 'function' ? action.payload(state.xp) : action.payload;
      const newXp = sanitizeNonNegativeNumber(resolvedXp, state.xp);
      const computedLevel = getLevelFromXp(newXp);
      const newLevel = Math.max(state.level, computedLevel);
      const didLevelUp = newLevel > state.level;

      if (!didLevelUp && newXp === state.xp) {
        return state;
      }

      if (didLevelUp && typeof window !== 'undefined') {
        setTimeout(() => {
          const runtimeWindow = typeof globalThis !== 'undefined' ? globalThis.window : undefined;
          if (!runtimeWindow || typeof runtimeWindow.triggerParticleEffect !== 'function') {
            return;
          }
          const centerX = runtimeWindow.innerWidth / 2;
          const centerY = runtimeWindow.innerHeight / 3;
          runtimeWindow.triggerParticleEffect(centerX, centerY, 'levelup', {
            text: `🎉 Level ${newLevel}!`,
            shake: true,
          });
        }, 100);
      }

      const levelUps = didLevelUp
        ? Array.from({ length: newLevel - state.level }, (_, idx) => state.level + idx + 1)
        : [];
      let tokenGain = 0;
      const rewardNotifications = [];
      levelUps.forEach((lvl) => {
        const reward = getLevelBandRewards(lvl);
        if (!reward) return;
        tokenGain += reward.cosmeticTokens || 0;
        rewardNotifications.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: `✨ ${reward.unlock} unlocked (+${reward.cosmeticTokens || 0} cosmetic tokens).`,
          type: 'info',
        });
      });

      return {
        ...state,
        xp: newXp,
        level: newLevel,
        cosmeticTokens: Math.max(0, Math.floor(state.cosmeticTokens || 0) + tokenGain),
        ...(didLevelUp && {
          notifications: [
            ...state.notifications,
            {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              message: `🎉 Level ${newLevel} Reached!`,
              type: 'success',
            },
            ...rewardNotifications,
          ],
        }),
      };

    case GAME_ACTIONS.UPDATE_PLOT:
      if (!action.payload || typeof action.payload.index !== 'number') return state;
      if (action.payload.index < 0 || action.payload.index >= state.plots.length) return state;
      if (state.plots[action.payload.index] === action.payload.plot) return state;
      return {
        ...state,
        plots: state.plots.map((plot, index) =>
          index === action.payload.index ? action.payload.plot : plot
        ),
      };

    case GAME_ACTIONS.UPDATE_PLOTS:
      const plotsPayload =
        typeof action.payload === 'function' ? action.payload(state) : action.payload;
      if (plotsPayload === state.plots) return state;
      return { ...state, plots: plotsPayload };

    case GAME_ACTIONS.SET_GRID_SIZE:
      const newGridSize = action.payload;
      const newTotalPlots = newGridSize * newGridSize;
      const existingPlots = state.plots;

      const updatedPlots =
        existingPlots.length < newTotalPlots
          ? [
              ...existingPlots,
              ...Array(newTotalPlots - existingPlots.length)
                .fill(null)
                .map((_, index) => ({
                  id: existingPlots.length + index,
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
                })),
            ]
          : existingPlots.slice(0, newTotalPlots);

      return { ...state, gridSize: newGridSize, plots: updatedPlots };

    case GAME_ACTIONS.UPDATE_INVENTORY:
      const newInventory =
        typeof action.payload === 'function' ? action.payload(state.inventory) : action.payload;
      if (newInventory === state.inventory) return state;
      return { ...state, inventory: newInventory };

    case GAME_ACTIONS.SET_WEATHER:
      return { ...state, weather: action.payload };

    case GAME_ACTIONS.UPDATE_WEATHER_FORECAST:
      return { ...state, weatherForecast: action.payload };

    case GAME_ACTIONS.UPDATE_BUILDINGS:
      return { ...state, buildings: action.payload };

    case GAME_ACTIONS.UPDATE_LIVESTOCK:
      return { ...state, livestock: action.payload };

    case GAME_ACTIONS.UPDATE_FISHING:
      return { ...state, fishing: action.payload };

    case GAME_ACTIONS.UPDATE_ACHIEVEMENTS:
      return { ...state, achievements: action.payload };

    case GAME_ACTIONS.UPDATE_MEMORY_FLAGS:
      const updatedMemoryFlags =
        typeof action.payload === 'function' ? action.payload(state.memoryFlags) : action.payload;
      return { ...state, memoryFlags: updatedMemoryFlags };

    case GAME_ACTIONS.UPDATE_MEMORY_COUNTERS:
      const updatedMemoryCounters =
        typeof action.payload === 'function'
          ? action.payload(state.memoryCounters)
          : action.payload;
      return { ...state, memoryCounters: updatedMemoryCounters };

    case GAME_ACTIONS.UPDATE_ALMANAC:
      return { ...state, almanac: action.payload };

    case GAME_ACTIONS.SET_PHILOSOPHY:
      return { ...state, philosophy: action.payload };

    case GAME_ACTIONS.SET_FARM_NAME:
      return { ...state, farmName: action.payload };

    case GAME_ACTIONS.SET_FARM_THEME:
      return { ...state, farmTheme: action.payload };

    case GAME_ACTIONS.SET_SPOTLIGHT:
      return { ...state, spotlight: action.payload };

    case GAME_ACTIONS.SET_LAST_UNLOCKED_MEMORY:
      return { ...state, lastUnlockedMemoryId: action.payload };

    case GAME_ACTIONS.SET_LAST_UNLOCKED_ALMANAC:
      return { ...state, lastUnlockedAlmanacId: action.payload };

    case GAME_ACTIONS.UPDATE_COZY_EXPANSION:
      return { ...state, cozyExpansion: action.payload };

    case GAME_ACTIONS.SET_ACTIVE_FARM_TITLE:
      return {
        ...state,
        cozyExpansion: {
          ...(state.cozyExpansion || {}),
          farmTitles: {
            ...(state.cozyExpansion?.farmTitles || {
              unlocked: { home_grower: true },
              activeId: 'home_grower',
            }),
            activeId: action.payload || 'home_grower',
          },
        },
      };

    case GAME_ACTIONS.UPDATE_COZY_GOALS:
      return { ...state, cozyGoals: action.payload };

    case GAME_ACTIONS.UPDATE_WHATS_NEW:
      return { ...state, whatsNew: action.payload };

    case GAME_ACTIONS.SET_SEASONAL_EVENTS:
      return { ...state, seasonalEvents: action.payload };

    case GAME_ACTIONS.UPDATE_ACTIVE_EVENTS:
      return { ...state, activeSeasonalEvents: action.payload };

    case GAME_ACTIONS.SET_DAILY_CHALLENGES:
      return { ...state, dailyChallenges: action.payload };

    case GAME_ACTIONS.UPDATE_CHALLENGE_PROGRESS:
      return { ...state, dailyChallengeProgress: action.payload };

    case GAME_ACTIONS.UPDATE_CHALLENGE_STREAK:
      return { ...state, challengeStreak: action.payload };

    case GAME_ACTIONS.UPDATE_LAST_CHALLENGE_RESET:
      return { ...state, lastChallengeReset: action.payload };

    case GAME_ACTIONS.UPDATE_PROGRESSION_XP_TRACKER:
      return { ...state, progressionXpTracker: action.payload };

    case GAME_ACTIONS.SET_RECENT_XP_EVENTS:
      return { ...state, recentXpEvents: Array.isArray(action.payload) ? action.payload : [] };

    case GAME_ACTIONS.UPDATE_DAILY_QUESTS:
      return { ...state, dailyQuests: action.payload };

    case GAME_ACTIONS.UPDATE_DISASTER_PROTECTIONS:
      return { ...state, disasterProtections: action.payload };

    case GAME_ACTIONS.UPDATE_MINIGAMES:
      return { ...state, minigames: action.payload };

    case GAME_ACTIONS.UPDATE_PRESTIGE:
      return { ...state, prestige: action.payload };

    case GAME_ACTIONS.PRESTIGE_RESET:
      return {
        ...initialState,
        prestige: action.payload || initialState.prestige,
      };

    case GAME_ACTIONS.UPDATE_RESEARCH:
      return { ...state, research: action.payload };

    case GAME_ACTIONS.UPDATE_GENETICS:
      return { ...state, genetics: action.payload };

    case GAME_ACTIONS.UPDATE_SOCIAL:
      return { ...state, social: action.payload };

    case GAME_ACTIONS.UPDATE_MILESTONES:
      return { ...state, milestones: action.payload };

    case GAME_ACTIONS.UPDATE_GHOST_VISIT:
      return { ...state, ghostVisit: action.payload };

    case GAME_ACTIONS.SET_SEED_PROVENANCE:
      return { ...state, seedProvenance: action.payload };

    case GAME_ACTIONS.ADD_NOTIFICATION:
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      const nextNotification = {
        id: uniqueId,
        ...action.payload,
        type: action.payload?.type || 'info',
        timestamp,
      };
      const nextHistory = [
        ...(Array.isArray(state.notificationHistory) ? state.notificationHistory : []),
        {
          id: uniqueId,
          message: nextNotification.message || '',
          type: nextNotification.type,
          details: nextNotification.details || null,
          timestamp,
        },
      ].slice(-120);
      return {
        ...state,
        notifications: [...state.notifications, nextNotification].slice(-MAX_ACTIVE_NOTIFICATIONS),
        notificationHistory: nextHistory,
      };

    case GAME_ACTIONS.CLEAR_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case GAME_ACTIONS.CLEAR_NOTIFICATION_HISTORY:
      return {
        ...state,
        notificationHistory: [],
      };

    case GAME_ACTIONS.UPDATE_SEASON:
      return { ...state, season: action.payload };

    case GAME_ACTIONS.SET_SELECTED_CROP:
      return { ...state, selectedCrop: action.payload };

    case GAME_ACTIONS.SET_SELECTED_DECORATION:
      return { ...state, selectedDecoration: action.payload };

    case GAME_ACTIONS.SET_DECORATION_MODE:
      return { ...state, decorateMode: action.payload };

    case GAME_ACTIONS.UPDATE_ENTITLEMENTS:
      return { ...state, entitlements: action.payload };

    case GAME_ACTIONS.SET_PREMIUM_LOCK_PROMPT:
      return { ...state, premiumLockPrompt: action.payload };

    case GAME_ACTIONS.UPDATE_SETTINGS:
      const nextSettings = mergeIfChanged(state.settings, action.payload);
      if (nextSettings === state.settings) return state;
      return { ...state, settings: nextSettings };

    case GAME_ACTIONS.UPDATE_RETENTION:
      const nextRetention = mergeIfChanged(state.retention, action.payload);
      if (nextRetention === state.retention) return state;
      return { ...state, retention: nextRetention };

    case GAME_ACTIONS.UPDATE_GAME_LOOP:
      const nextGameLoop = mergeIfChanged(state.gameLoop, action.payload);
      if (nextGameLoop === state.gameLoop) return state;
      return { ...state, gameLoop: nextGameLoop };

    case GAME_ACTIONS.UPDATE_ONBOARDING:
      return {
        ...state,
        onboardingSeen: action.payload?.onboardingSeen ?? state.onboardingSeen,
        onboardingStep: action.payload?.onboardingStep ?? state.onboardingStep,
        onboardingSkipped: action.payload?.onboardingSkipped ?? state.onboardingSkipped,
      };

    case GAME_ACTIONS.UPDATE_PETS:
      return { ...state, pets: action.payload };

    case GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES:
      const nextProcessingFacilities =
        typeof action.payload === 'function'
          ? action.payload(state.processingFacilities)
          : action.payload;
      if (nextProcessingFacilities === state.processingFacilities) return state;
      return { ...state, processingFacilities: nextProcessingFacilities };

    case GAME_ACTIONS.UPDATE_PROCESSING_QUEUE:
      const nextProcessingQueue =
        typeof action.payload === 'function'
          ? action.payload(state.processingQueue)
          : action.payload;
      if (nextProcessingQueue === state.processingQueue) return state;
      return { ...state, processingQueue: nextProcessingQueue };

    case GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY:
      const nextProcessedInventory =
        typeof action.payload === 'function'
          ? action.payload(state.processedInventory)
          : action.payload;
      if (nextProcessedInventory === state.processedInventory) return state;
      return { ...state, processedInventory: nextProcessedInventory };

    case GAME_ACTIONS.LOAD_GAME:
      return {
        ...action.payload,
        gameLoop: {
          ...state.gameLoop,
          ...action.payload.gameLoop,
          lastUpdate: Date.now(),
          lastSaveTime:
            action.payload.gameLoop?.lastSaveTime ?? state.gameLoop.lastSaveTime ?? Date.now(),
        },
        notifications: [],
        notificationHistory: Array.isArray(action.payload?.notificationHistory)
          ? action.payload.notificationHistory
          : [],
      };

    default:
      return state;
  }
}
