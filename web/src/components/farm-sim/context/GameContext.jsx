import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { GAME_ACTIONS } from './GameActions';
import {
  SAVE_VERSION,
  SAVE_KEY,
  BACKUP_SAVE_KEY,
  loadSavedState,
  saveStateToStorage,
} from './GamePersistence';
import { initialState, gameReducer } from './GameReducer';
import { initDebugTools, isDebugMode, logDebugAction } from '../../../utils/debugTools';
import { attachReleaseTools, detachReleaseTools } from '../../../utils/releaseTools';
import { isDevelopmentMode } from '../../../config/release';
import {
  DECORATION_DATA,
  isLightingDecoration,
  isPathOrFenceDecoration,
  isSeasonalDecoration,
} from '../constants/decorData';
import { MEMORIES } from '../../../data/identity';
import { ALMANAC_PAGES, ALMANAC_WEATHER_TYPES } from '../../../data/almanac';
import {
  countBits,
  getAlmanacPage,
  getDayKey,
  getSeasonBit,
  isKnownWeatherType,
} from '../../../systems/almanac';
import { ensureWeeklyVisits, getWeekKey } from '../../../utils/retention';
import { calculateHarvestValue } from '../../../utils/farmUpgrades';
import { getDailyCropFocus } from '../../../utils/dailyFocus';
import { getContentManager } from '../../../content/ContentManager';
import { CROP_DATA } from '../constants/cropData';
import { MILESTONE_DEFINITIONS } from '../../../data/milestones';
import { createMilestoneManager } from '../../../systems/milestones';
import { ONBOARDING_TUTORIAL_MAX_STEP_FROM_EVENTS } from '../data/onboardingTutorialSteps';
import { CROP_TRAITS, CROP_TRAIT_IDS, DECOR_SETS, FARM_TITLES, RARE_MOMENTS, VISUAL_WEATHER_ROTATION, WEEKLY_SPECIAL_DAY } from '../../../data/cozyExpansion';
import {
  applyXpTuning,
  getDifficultyModifier,
  getEconomyRewardModifier,
  getEconomySinkModifier,
  getLevelFromXp,
  getXpProgress,
} from '../systems/progression';
import {
  applyCosmeticFallbacks,
  getItemEntitlementInfo,
  grantEntitlement,
  isItemUnlocked,
  normalizeEntitlements,
  revokeEntitlement,
  setEntitlementMode as buildEntitlementMode,
} from '../entitlements/EntitlementManager';
import {
  buildCozyGoals,
  getCozyGoalRewardLabel,
  isCozyGoalSatisfied,
} from '../../../utils/cozyGoals';
import { SUPPLY_UNIT_COSTS, planSupplyUsage } from '../../../utils/supplies';
import { updateQuestProgress } from '../systems/QuestSystem';
import { applyDistrictHarvestBonus, getDistrictIdForPlot } from '../../../utils/farmDistricts';
import { upsertJournalEntry } from '../../../utils/farmJournal';
import { getSpecializationModifiers } from '../../../utils/farmSpecializations';
import { notifyGameFrame } from '../../../utils/gameFrameScheduler';
import { handleAdaptiveQuality } from '../../../performance.js';

const rollChance = (chance = 0) => Math.random() < chance;

const getRandomTraitId = () => CROP_TRAIT_IDS[Math.floor(Math.random() * CROP_TRAIT_IDS.length)] || null;

const getDayOfWeekIndex = (dayKey) => {
  const date = dayKey ? new Date(`${dayKey}T00:00:00`) : new Date();
  const idx = date.getDay();
  return Number.isFinite(idx) ? idx : 0;
};

// PERF: Use a store + useSyncExternalStore so components can subscribe to stable slices
// (e.g. inventory/settings) and avoid re-rendering on unrelated updates (e.g. plot progress).
const GameStoreContext = createContext(null);
const GameActionsContext = createContext(null);
const GameSystemsContext = createContext(null);

/**
 * GameProvider Component
 */
export function GameProvider({ children }) {
  // Initialize state with loaded save data if available
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState,
    (initial) => {
      const savedState = loadSavedState();
      if (savedState) {
        if (isDevelopmentMode()) {
          console.debug('[farm]', 'Loaded saved game successfully');
        }
        const { nextState, fallbackCount } = applyCosmeticFallbacks(savedState);
        if (fallbackCount > 0) {
          const notifications = Array.isArray(nextState.notifications) ? nextState.notifications : [];
          return {
            ...nextState,
            notifications: [
              ...notifications,
              {
                id: `premium-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                message: 'A premium cosmetic isn’t owned; reverted to default.',
                type: 'info',
              },
            ],
          };
        }
        return nextState;
      }
      return initial;
    }
  );

  // External store wrapper for selector-based subscriptions.
  const storeRef = useRef(null);
  if (!storeRef.current) {
    const listeners = new Set();
    storeRef.current = {
      state,
      getState: () => storeRef.current.state,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      _listeners: listeners,
    };
  }
  storeRef.current.state = state;
  useLayoutEffect(() => {
    const listeners = storeRef.current?._listeners;
    if (!listeners || listeners.size === 0) return;
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        // Avoid breaking the store if a subscriber throws.
        console.error('[farm] Store subscriber error', error);
      }
    });
  }, [state]);

  // Use refs to access latest state without causing re-renders in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatchRef = useRef(dispatch);
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);
  const actionsRef = useRef(null);

  const createPremiumFallbackNotification = () => ({
    id: `premium-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: 'A premium cosmetic isn’t owned; reverted to default.',
    type: 'info',
  });

  const applyFallbacksWithNotification = (stateToCheck) => (
    applyCosmeticFallbacks(stateToCheck)
  );

  // Debounced auto-save management
  const autoSaveTimeoutRef = useRef(null);
  const deferredAutoSaveRef = useRef(null);
  const idleAutoSaveRef = useRef(null);
  const lastSaveStateRef = useRef('');

  const buildAutoSaveSignature = useCallback((stateToSave) => {
    if (!stateToSave || typeof stateToSave !== 'object') return '';
    const { gameLoop, ...rest } = stateToSave;
    return JSON.stringify({
      ...rest,
      // Notifications are intentionally excluded from persisted payloads.
      notifications: [],
      gameLoop: {
        paused: Boolean(gameLoop?.paused),
        pauseReason: typeof gameLoop?.pauseReason === 'string' ? gameLoop.pauseReason : null,
      },
    });
  }, []);

  useEffect(() => {
    initDebugTools();
  }, []);

  useEffect(() => {
    if (!isDebugMode()) return undefined;
    attachReleaseTools({ getState: () => stateRef.current });
    return () => detachReleaseTools();
  }, []);

  useEffect(() => {
    const wasPausedRef = { current: false };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPausedRef.current = stateRef.current.gameLoop?.paused || false;
        if (!stateRef.current.gameLoop?.paused) {
          dispatchRef.current({
            type: GAME_ACTIONS.UPDATE_GAME_LOOP,
            payload: { paused: true, pausedAt: Date.now(), pauseReason: 'hidden' },
          });
        }
      } else if (!wasPausedRef.current) {
        dispatchRef.current({
          type: GAME_ACTIONS.UPDATE_GAME_LOOP,
          payload: { paused: false, pauseReason: null },
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const debouncedAutoSave = useCallback((stateToSave) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (deferredAutoSaveRef.current) {
      clearTimeout(deferredAutoSaveRef.current);
      deferredAutoSaveRef.current = null;
    }
    if (idleAutoSaveRef.current && typeof cancelIdleCallback !== 'undefined') {
      cancelIdleCallback(idleAutoSaveRef.current);
      idleAutoSaveRef.current = null;
    }

    const stateSignature = buildAutoSaveSignature(stateToSave);

    if (stateSignature === lastSaveStateRef.current) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const saveToStorage = () => {
          idleAutoSaveRef.current = null;
          deferredAutoSaveRef.current = null;

          try {
            const latestState = stateRef.current;
            if (!latestState?.settings?.autoSave) return;

            const latestSignature = buildAutoSaveSignature(latestState);
            if (latestSignature === lastSaveStateRef.current) return;

            const saveResult = saveStateToStorage(latestState, { key: SAVE_KEY, backupKey: BACKUP_SAVE_KEY });
            if (saveResult.success) {
              lastSaveStateRef.current = latestSignature;
              if (dispatchRef.current) {
                dispatchRef.current({
                  type: GAME_ACTIONS.UPDATE_GAME_LOOP,
                  payload: { lastSaveTime: saveResult.timestamp },
                });
              }
            }
          } catch (error) {
            console.error('[farm] Auto-save failed:', error);
          }
        };

        if (typeof requestIdleCallback !== 'undefined') {
          idleAutoSaveRef.current = requestIdleCallback(saveToStorage, { timeout: 1000 });
        } else {
          deferredAutoSaveRef.current = setTimeout(saveToStorage, 0);
        }
      } catch (error) {
        console.error('[farm] Auto-save serialization failed:', error);
      }
    }, 2000);
  }, [buildAutoSaveSignature]);

  // Performance loops: FPS monitoring, Auto-save trigger, shared frame subscribers (systems)
  const fpsRef = useRef(60);
  const lastDispatchedFpsRef = useRef(-1);
  const lastAdaptiveQualityAtRef = useRef(0);

  useEffect(() => {
    if (state.gameLoop.paused) return;

    let frameCount = 0;
    let lastFPSUpdate = performance.now();
    let lastAutoSaveCheck = Date.now();
    let animationFrameId = null;

    const masterGameLoop = (currentTime) => {
      const currentState = stateRef.current;
      if (currentState.gameLoop.paused) return;

      frameCount++;
      if (currentTime - lastFPSUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFPSUpdate));
        fpsRef.current = fps;
        window.__currentFPS = fps;
        if (fps !== lastDispatchedFpsRef.current) {
          lastDispatchedFpsRef.current = fps;
          dispatchRef.current?.({
            type: GAME_ACTIONS.UPDATE_GAME_LOOP,
            payload: { fps },
          });
        }

        const nowPerf = Date.now();
        if (fps > 2 && nowPerf - lastAdaptiveQualityAtRef.current >= 8000) {
          lastAdaptiveQualityAtRef.current = nowPerf;
          handleAdaptiveQuality(fps);
        }

        frameCount = 0;
        lastFPSUpdate = currentTime;
      }

      const now = Date.now();
      if (currentState.settings.autoSave && (now - lastAutoSaveCheck >= 30000)) {
        const dayKey = getDayKey();
        if (dayKey !== currentState.almanac?.lastDayKey) {
          actionsRef.current?.recordAlmanacEvent('day_rollover', { dayKey });
          actionsRef.current?.recordCozyExpansionEvent('day_rollover', { dayKey });
          actionsRef.current?.recordJournalEntry('day_rollover', { dayKey });
          actionsRef.current?.recordRetentionVisit(dayKey, now);
          actionsRef.current?.recordMilestoneEvent('day_advance', { dayKey });
        }
        debouncedAutoSave(currentState);
        lastAutoSaveCheck = now;
      }

      notifyGameFrame(currentTime);

      animationFrameId = requestAnimationFrame(masterGameLoop);
    };

    animationFrameId = requestAnimationFrame(masterGameLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      if (deferredAutoSaveRef.current) clearTimeout(deferredAutoSaveRef.current);
      if (idleAutoSaveRef.current && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleAutoSaveRef.current);
      }
    };
  }, [state.gameLoop.paused, state.settings.autoSave, debouncedAutoSave]);

  // System management (bridging React state with external game systems)
  const [systems, setSystemsState] = useState({});
  const systemsRef = useRef(systems);
  useEffect(() => {
    systemsRef.current = systems;
  }, [systems]);

  const milestoneManager = useMemo(() => createMilestoneManager(MILESTONE_DEFINITIONS), []);

  const normalizePositiveAmount = useCallback((amount) => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.floor(numeric));
  }, []);

  const updateDailyQuestProgress = useCallback((actionType, actionData = {}) => {
    const currentDailyQuests = stateRef.current?.dailyQuests;
    const currentQuests = currentDailyQuests?.quests;
    if (!Array.isArray(currentQuests) || currentQuests.length === 0) return;

    const nextQuests = updateQuestProgress(currentQuests, actionType, actionData);
    const changed = nextQuests.some((quest, index) => quest !== currentQuests[index]);
    if (!changed) return;

    dispatchRef.current({
      type: GAME_ACTIONS.UPDATE_DAILY_QUESTS,
      payload: {
        ...currentDailyQuests,
        quests: nextQuests,
      },
    });
  }, []);

  // Memoized action creators
  const actions = useMemo(() => ({
    // Core property setters
    setCoins: (coins) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: coins }),
    setXp: (xp) => dispatch({ type: GAME_ACTIONS.SET_XP, payload: xp }),

    // Plot & Inventory
    updatePlot: (index, plot) => dispatch({ type: GAME_ACTIONS.UPDATE_PLOT, payload: { index, plot } }),
    updatePlots: (plots) => dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots }),
    setGridSize: (size) => dispatch({ type: GAME_ACTIONS.SET_GRID_SIZE, payload: size }),
    updateInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_INVENTORY, payload: inventory }),
    addToInventory: (itemId, amount = 1) => {
      if (typeof itemId !== 'string' || !itemId.trim()) return false;
      const safeAmount = normalizePositiveAmount(amount);
      if (safeAmount <= 0) return false;
      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY,
        payload: (inventory) => ({
          ...inventory,
          [itemId]: Math.max(0, Math.floor(Number(inventory?.[itemId] || 0))) + safeAmount,
        }),
      });
      return true;
    },

    // Systems & Metadata
    setWeather: (weather) => dispatch({ type: GAME_ACTIONS.SET_WEATHER, payload: weather }),
    updateWeatherForecast: (forecast) => dispatch({ type: GAME_ACTIONS.UPDATE_WEATHER_FORECAST, payload: forecast }),
    updateBuildings: (buildings) => dispatch({ type: GAME_ACTIONS.UPDATE_BUILDINGS, payload: buildings }),
    updateLivestock: (livestock) => dispatch({ type: GAME_ACTIONS.UPDATE_LIVESTOCK, payload: livestock }),
    updateFishing: (fishing) => dispatch({ type: GAME_ACTIONS.UPDATE_FISHING, payload: fishing }),
    updateAchievements: (achievements) => dispatch({ type: GAME_ACTIONS.UPDATE_ACHIEVEMENTS, payload: achievements }),
    updateSeason: (season) => dispatch({ type: GAME_ACTIONS.UPDATE_SEASON, payload: season }),
    setSeasonalEvents: (events) => dispatch({ type: GAME_ACTIONS.SET_SEASONAL_EVENTS, payload: events }),
    updateActiveEvents: (events) => dispatch({ type: GAME_ACTIONS.UPDATE_ACTIVE_EVENTS, payload: events }),
    setDailyChallenges: (challenges) => dispatch({ type: GAME_ACTIONS.SET_DAILY_CHALLENGES, payload: challenges }),
    updateChallengeProgress: (progress) => dispatch({ type: GAME_ACTIONS.UPDATE_CHALLENGE_PROGRESS, payload: progress }),
    updateDailyQuests: (quests) => dispatch({ type: GAME_ACTIONS.UPDATE_DAILY_QUESTS, payload: quests }),
    updateDisasterProtections: (protections) => dispatch({ type: GAME_ACTIONS.UPDATE_DISASTER_PROTECTIONS, payload: protections }),
    updateMinigames: (minigames) => dispatch({ type: GAME_ACTIONS.UPDATE_MINIGAMES, payload: minigames }),
    updatePrestige: (prestige) => dispatch({ type: GAME_ACTIONS.UPDATE_PRESTIGE, payload: prestige }),
    prestigeReset: () => dispatch({ type: GAME_ACTIONS.PRESTIGE_RESET }),
    updateResearch: (research) => dispatch({ type: GAME_ACTIONS.UPDATE_RESEARCH, payload: research }),
    updateGenetics: (genetics) => dispatch({ type: GAME_ACTIONS.UPDATE_GENETICS, payload: genetics }),
    updateSocial: (social) => dispatch({ type: GAME_ACTIONS.UPDATE_SOCIAL, payload: social }),
    updateMilestones: (milestones) => dispatch({ type: GAME_ACTIONS.UPDATE_MILESTONES, payload: milestones }),
    updateGhostVisit: (ghostVisit) => dispatch({ type: GAME_ACTIONS.UPDATE_GHOST_VISIT, payload: ghostVisit }),
    setSeedProvenance: (seedProvenance) => dispatch({ type: GAME_ACTIONS.SET_SEED_PROVENANCE, payload: seedProvenance }),
    updatePets: (pets) => dispatch({ type: GAME_ACTIONS.UPDATE_PETS, payload: pets }),
    updateProcessingFacilities: (facilities) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES, payload: facilities }),
    updateProcessingQueue: (queue) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_QUEUE, payload: queue }),
    updateProcessedInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY, payload: inventory }),
    updateChallengeStreak: (streak) => dispatch({ type: GAME_ACTIONS.UPDATE_CHALLENGE_STREAK, payload: streak }),
    updateLastChallengeReset: (timestamp) => dispatch({ type: GAME_ACTIONS.UPDATE_LAST_CHALLENGE_RESET, payload: timestamp }),

    // UI & Settings
    addNotification: (notification) => dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: notification }),
    clearNotification: (id) => dispatch({ type: GAME_ACTIONS.CLEAR_NOTIFICATION, payload: id }),
    clearNotificationHistory: () => dispatch({ type: GAME_ACTIONS.CLEAR_NOTIFICATION_HISTORY }),
    setSelectedCrop: (cropId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_CROP, payload: cropId }),
    setSelectedDecoration: (decorId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_DECORATION, payload: decorId }),
    setDecorationMode: (enabled) => dispatch({ type: GAME_ACTIONS.SET_DECORATION_MODE, payload: enabled }),
    updateEntitlements: (entitlements) => dispatch({
      type: GAME_ACTIONS.UPDATE_ENTITLEMENTS,
      payload: normalizeEntitlements(entitlements),
    }),
    showPremiumLockPrompt: (payload) => dispatch({
      type: GAME_ACTIONS.SET_PREMIUM_LOCK_PROMPT,
      payload,
    }),
    clearPremiumLockPrompt: () => dispatch({
      type: GAME_ACTIONS.SET_PREMIUM_LOCK_PROMPT,
      payload: null,
    }),
    updateMemoryFlags: (memoryFlags) => dispatch({ type: GAME_ACTIONS.UPDATE_MEMORY_FLAGS, payload: memoryFlags }),
    updateMemoryCounters: (memoryCounters) => dispatch({ type: GAME_ACTIONS.UPDATE_MEMORY_COUNTERS, payload: memoryCounters }),
    updateAlmanac: (almanac) => dispatch({ type: GAME_ACTIONS.UPDATE_ALMANAC, payload: almanac }),
    updateCozyGoals: (cozyGoals) => dispatch({ type: GAME_ACTIONS.UPDATE_COZY_GOALS, payload: cozyGoals }),
    updateJournal: (journal) => dispatch({ type: GAME_ACTIONS.UPDATE_JOURNAL, payload: journal }),
    updateWhatsNew: (whatsNew) => dispatch({ type: GAME_ACTIONS.UPDATE_WHATS_NEW, payload: whatsNew }),
    updateOnboarding: (onboarding) => dispatch({ type: GAME_ACTIONS.UPDATE_ONBOARDING, payload: onboarding }),
    updateRetention: (retention) => dispatch({ type: GAME_ACTIONS.UPDATE_RETENTION, payload: retention }),
    resetOnboarding: () => dispatch({
      type: GAME_ACTIONS.UPDATE_ONBOARDING,
      payload: { onboardingSeen: false, onboardingStep: 0, onboardingSkipped: false },
    }),
    setPhilosophy: (philosophyId) => {
      const current = stateRef.current.philosophy;
      if (current === philosophyId) return;
      dispatch({ type: GAME_ACTIONS.SET_PHILOSOPHY, payload: philosophyId });
      actionsRef.current?.recordJournalEntry('philosophy_selected', {
        dayKey: getDayKey(),
        flags: { philosophyTouched: true },
        stateOverride: { philosophy: philosophyId },
      });
      logDebugAction('philosophy_selected', { philosophyId });
    },
    setFarmName: (farmName) => dispatch({ type: GAME_ACTIONS.SET_FARM_NAME, payload: farmName }),
    setFarmTheme: (themeId) => dispatch({ type: GAME_ACTIONS.SET_FARM_THEME, payload: themeId }),
    setSpotlight: (spotlight) => {
      dispatch({ type: GAME_ACTIONS.SET_SPOTLIGHT, payload: spotlight });
      actionsRef.current?.recordJournalEntry('spotlight_set', {
        dayKey: getDayKey(),
        flags: { spotlightTouched: true },
        stateOverride: { spotlight },
      });
    },
    setActiveFarmTitle: (titleId) => dispatch({ type: GAME_ACTIONS.SET_ACTIVE_FARM_TITLE, payload: titleId }),
    updateSettings: (settings) => dispatch({ type: GAME_ACTIONS.UPDATE_SETTINGS, payload: settings }),
    setEntitlementMode: (mode) => {
      const currentState = stateRef.current;
      const nextEntitlements = buildEntitlementMode(currentState.entitlements, mode);
      const { nextState, fallbackCount } = applyFallbacksWithNotification({
        ...currentState,
        entitlements: nextEntitlements,
      });
      dispatch({
        type: GAME_ACTIONS.UPDATE_ENTITLEMENTS,
        payload: nextState.entitlements,
      });
      if (nextState.plots !== currentState.plots) {
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: nextState.plots });
      }
      if (nextState.farmTheme !== currentState.farmTheme) {
        dispatch({ type: GAME_ACTIONS.SET_FARM_THEME, payload: nextState.farmTheme });
      }
      if (fallbackCount > 0) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: createPremiumFallbackNotification(),
        });
      }
    },
    grantPackEntitlement: (packId) => {
      const currentState = stateRef.current;
      const nextEntitlements = grantEntitlement(currentState.entitlements, packId);
      dispatch({
        type: GAME_ACTIONS.UPDATE_ENTITLEMENTS,
        payload: nextEntitlements,
      });
    },
    revokePackEntitlement: (packId) => {
      const currentState = stateRef.current;
      const nextEntitlements = revokeEntitlement(currentState.entitlements, packId);
      const { nextState, fallbackCount } = applyFallbacksWithNotification({
        ...currentState,
        entitlements: nextEntitlements,
      });
      dispatch({
        type: GAME_ACTIONS.UPDATE_ENTITLEMENTS,
        payload: nextState.entitlements,
      });
      if (nextState.plots !== currentState.plots) {
        dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: nextState.plots });
      }
      if (nextState.farmTheme !== currentState.farmTheme) {
        dispatch({ type: GAME_ACTIONS.SET_FARM_THEME, payload: nextState.farmTheme });
      }
      if (fallbackCount > 0) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: createPremiumFallbackNotification(),
        });
      }
    },
    updateGameLoop: (data) => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: data }),
    pauseGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: true } }),
    resumeGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: false } }),
    debugLoadState: (nextState) => {
      if (!isDebugMode()) return false;
      if (!nextState || typeof nextState !== 'object') return false;
      const { nextState: hydrated, fallbackCount } = applyFallbacksWithNotification(nextState);
      dispatch({ type: GAME_ACTIONS.LOAD_GAME, payload: hydrated });
      if (fallbackCount > 0) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: createPremiumFallbackNotification(),
        });
      }
      logDebugAction('debug_load_state');
      return true;
    },
    recordRetentionVisit: (dayKey = getDayKey(), timestamp = Date.now()) => {
      const current = stateRef.current.retention || {};
      const weekKey = getWeekKey(timestamp);
      const nextWeekly = ensureWeeklyVisits(current.weeklyVisits, dayKey, weekKey);
      dispatch({
        type: GAME_ACTIONS.UPDATE_RETENTION,
        payload: {
          lastSessionAt: timestamp,
          lastSeenDayKey: dayKey,
          lastSeenGameDay: stateRef.current.almanac?.counters?.dayCount || 0,
          lastSeenSeason: stateRef.current.season?.current || 'spring',
          weeklyVisits: nextWeekly,
        },
      });
    },

    // Systems Bridge
    setSystems: (newSystems) => setSystemsState(newSystems),

    // Manual Save/Load
    loadGame: () => {
      const savedState = loadSavedState();
      if (savedState) {
        const { nextState: hydrated, fallbackCount } = applyFallbacksWithNotification(savedState);
        dispatch({ type: GAME_ACTIONS.LOAD_GAME, payload: hydrated });
        if (fallbackCount > 0) {
          dispatch({
            type: GAME_ACTIONS.ADD_NOTIFICATION,
            payload: createPremiumFallbackNotification(),
          });
        }
        logDebugAction('load_game', { saveVersion: savedState.saveVersion });
        return true;
      }
      return false;
    },
    saveGame: () => {
      try {
        const saveResult = saveStateToStorage(stateRef.current, { key: SAVE_KEY, backupKey: BACKUP_SAVE_KEY });
        if (saveResult.success) {
          dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { lastSaveTime: saveResult.timestamp } });
          logDebugAction('save_game', { saveVersion: SAVE_VERSION });
          return true;
        }
        return false;
      } catch (error) {
        console.error('[farm] Manual save failed', error);
        return false;
      }
    },

    unlockMemory: (memoryId) => {
      const currentFlags = stateRef.current.memoryFlags || {};
      if (currentFlags[memoryId]) return false;

      const memory = MEMORIES.find((entry) => entry.id === memoryId);
      dispatch({
        type: GAME_ACTIONS.UPDATE_MEMORY_FLAGS,
        payload: {
          ...currentFlags,
          [memoryId]: true,
        },
      });
      dispatch({ type: GAME_ACTIONS.SET_LAST_UNLOCKED_MEMORY, payload: memoryId });

      if (memory) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: {
            message: `📖 Memory saved: ${memory.title}`,
            type: 'info',
          },
        });
      }

      logDebugAction('memory_unlocked', { memoryId });
      return true;
    },

    unlockAlmanacPage: (pageId) => {
      const currentAlmanac = stateRef.current.almanac || {};
      const unlocked = currentAlmanac.unlocked || {};
      if (unlocked[pageId]) return false;

      const page = getAlmanacPage(pageId) || ALMANAC_PAGES.find((entry) => entry.id === pageId);
      const timestamp = Date.now();
      const nextAlmanac = {
        ...currentAlmanac,
        unlocked: {
          ...unlocked,
          [pageId]: true,
        },
        dates: {
          ...(currentAlmanac.dates || {}),
          [pageId]: timestamp,
        },
      };

      dispatch({ type: GAME_ACTIONS.UPDATE_ALMANAC, payload: nextAlmanac });
      dispatch({ type: GAME_ACTIONS.SET_LAST_UNLOCKED_ALMANAC, payload: pageId });

      if (page) {
        dispatch({
          type: GAME_ACTIONS.ADD_NOTIFICATION,
          payload: {
            message: `📖 New Almanac Page: ${page.title}`,
            type: 'info',
          },
        });
      }

      logDebugAction('almanac_unlocked', { pageId });
      return true;
    },

    generateCozyGoals: (dayKey = getDayKey()) => {
      const currentGoals = stateRef.current.cozyGoals?.lastGeneratedGoals;
      if (currentGoals?.dayKey === dayKey && Array.isArray(currentGoals.goals) && currentGoals.goals.length) {
        return currentGoals.goals;
      }

      const content = getContentManager();
      const specialization = getSpecializationModifiers(stateRef.current);
      const goals = buildCozyGoals(stateRef.current, content, dayKey, {
        maxGoals: specialization.cozyGoalSlots || 3,
      });
      dispatch({
        type: GAME_ACTIONS.UPDATE_COZY_GOALS,
        payload: {
          lastGeneratedGoals: { dayKey, goals },
          completedGoalIds: [],
        },
      });
      return goals;
    },

    recordJournalEntry: (reason = 'reflection', { dayKey = getDayKey(), flags = {}, stateOverride = null } = {}) => {
      const sourceState = stateOverride
        ? { ...stateRef.current, ...stateOverride }
        : stateRef.current;
      const nextJournal = upsertJournalEntry(sourceState.journal, sourceState, {
        reason,
        dayKey,
        flags,
      });
      dispatch({
        type: GAME_ACTIONS.UPDATE_JOURNAL,
        payload: nextJournal,
      });
      return nextJournal;
    },

    recordMilestoneEvent: (eventType, payload = {}) => {
      const current = stateRef.current;
      const milestones = current.milestones || { progress: {}, unlocked: {}, recent: [] };
      const nextProgress = milestoneManager.onEvent(eventType, payload, milestones.progress || {});
      const unlockedNow = milestoneManager.evaluateUnlocks(nextProgress, milestones.unlocked || {});
      if (!unlockedNow.length && nextProgress === (milestones.progress || {})) {
        return;
      }
      const nextUnlocked = { ...(milestones.unlocked || {}) };
      const recent = [...(milestones.recent || [])];
      unlockedNow.forEach((milestone) => {
        nextUnlocked[milestone.id] = true;
        recent.push(milestone.id);
        if (milestone.reward?.memoryId) actionsRef.current?.unlockMemory(milestone.reward.memoryId);
        if (milestone.reward?.almanacId) actionsRef.current?.unlockAlmanacPage(milestone.reward.almanacId);
        if (milestone.reward?.titleId) {
          actionsRef.current?.setActiveFarmTitle(milestone.reward.titleId);
        }
        actionsRef.current?.addNotification({
          message: `🏁 Milestone unlocked: ${milestone.name}`,
          type: 'success',
        });
      });
      dispatch({
        type: GAME_ACTIONS.UPDATE_MILESTONES,
        payload: {
          progress: nextProgress,
          unlocked: nextUnlocked,
          recent: recent.slice(-3),
        },
      });
    },

    recordCozyGoalEvent: (eventType, eventData = {}) => {
      const dayKey = getDayKey();
      const content = getContentManager();
      const specialization = getSpecializationModifiers(stateRef.current);
      let cozyState = stateRef.current.cozyGoals || { lastGeneratedGoals: null, completedGoalIds: [] };
      const lastGenerated = cozyState.lastGeneratedGoals;
      let shouldRefresh = false;

      if (lastGenerated?.dayKey !== dayKey || !Array.isArray(lastGenerated?.goals)) {
        const goals = buildCozyGoals(stateRef.current, content, dayKey, {
          maxGoals: specialization.cozyGoalSlots || 3,
        });
        cozyState = {
          lastGeneratedGoals: { dayKey, goals },
          completedGoalIds: [],
        };
        shouldRefresh = true;
      }

      const goals = cozyState.lastGeneratedGoals?.goals || [];
      if (!goals.length) return;

      const completedSet = new Set(cozyState.completedGoalIds || []);
      let didUpdate = false;

      goals.forEach((goal) => {
        if (completedSet.has(goal.id)) return;
        if (!isCozyGoalSatisfied(goal, eventType, eventData, content, stateRef.current)) return;

        completedSet.add(goal.id);
        didUpdate = true;

        const reward = goal.reward || {};
        if (reward.type === 'reputation') {
          const currentSocial = stateRef.current.social || { friends: [], reputation: 0, marketListings: [] };
          const reputationGain = Math.max(
            1,
            Math.ceil((reward.amount || 0) * (specialization.cozyRewardMultiplier || 1))
          );
          actionsRef.current?.updateSocial({
            ...currentSocial,
            reputation: (currentSocial.reputation || 0) + reputationGain,
          });
        }
        if (reward.type === 'decor') {
          actionsRef.current?.updateInventory((inventory) => ({
            ...inventory,
            [reward.id]: (inventory?.[reward.id] || 0) + 1,
          }));
        }
        if (reward.type === 'memory' && reward.id) {
          actionsRef.current?.unlockMemory(reward.id);
        }
        if (reward.type === 'almanac' && reward.id) {
          actionsRef.current?.unlockAlmanacPage(reward.id);
        }

        actionsRef.current?.addNotification({
          message: `🧺 Cozy Goal complete: ${goal.text} · ${getCozyGoalRewardLabel(goal, content)}`,
          type: 'success',
        });
        if (specialization.cozyGoalXpBonus > 0) {
          actionsRef.current?.addXP(specialization.cozyGoalXpBonus, {
            source: 'cozy_goal',
            label: 'Cozy Goal',
          });
        }
      });

      if (didUpdate || shouldRefresh) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_COZY_GOALS,
          payload: {
            ...cozyState,
            completedGoalIds: Array.from(completedSet),
          },
        });
      }
    },

    dismissWhatsNew: (packs = []) => {
      const current = stateRef.current.whatsNew || { dismissed: {} };
      const dismissed = { ...(current.dismissed || {}) };
      packs.forEach((pack) => {
        if (pack?.id) dismissed[pack.id] = pack.version;
      });
      dispatch({
        type: GAME_ACTIONS.UPDATE_WHATS_NEW,
        payload: { ...current, dismissed },
      });
    },

    recordOnboardingEvent: (eventType) => {
      const currentState = stateRef.current;
      if (!currentState) return false;

      const onboardingStepMap = {
        plant: 0,
        harvest: 1,
        board_open: 2,
      };

      const eventStep = onboardingStepMap[eventType];

      const hasFirstSeed = !!currentState.memoryFlags?.first_seed;
      const hasFirstHarvest = !!currentState.memoryFlags?.first_harvest;
      const hasBoardVisit = !!currentState.memoryFlags?.first_board_visit;

      if (eventType === 'plant' && !hasFirstSeed) {
        actionsRef.current?.unlockMemory('first_seed');
      }

      if ((eventType === 'harvest' || eventType === 'board_open') && !currentState.almanac?.unlocked?.first_steps) {
        actionsRef.current?.unlockAlmanacPage('first_steps');
      }

      if (eventType === 'board_open' && !hasBoardVisit) {
        actionsRef.current?.unlockMemory('first_board_visit');
      }

      if (eventType === 'harvest' && !hasFirstHarvest) {
        actionsRef.current?.unlockMemory('first_harvest');

        const bonusCoins = 20;
        const bonusRep = 1;
        const currentSocial = currentState.social || { friends: [], reputation: 0, marketListings: [] };

        actionsRef.current?.earnMoney(bonusCoins);
        actionsRef.current?.updateSocial({
          ...currentSocial,
          reputation: (currentSocial.reputation || 0) + bonusRep,
        });

        actionsRef.current?.addNotification({
          message: `🎉 First Harvest Bonus: +${bonusCoins}🪙 +${bonusRep} rep`,
          type: 'success',
        });
      }

      if (!currentState.onboardingSeen) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_ONBOARDING,
          payload: { onboardingSeen: true },
        });
      }

      if (currentState.onboardingSkipped) return false;
      if (typeof eventStep !== 'number') return false;
      if (currentState.onboardingStep !== eventStep) return false;

      const nextStep = Math.min(ONBOARDING_TUTORIAL_MAX_STEP_FROM_EVENTS, eventStep + 1);
      dispatch({
        type: GAME_ACTIONS.UPDATE_ONBOARDING,
        payload: { onboardingStep: nextStep, onboardingSeen: true },
      });
      return true;
    },

    recordMemoryEvent: (eventType, eventData = {}) => {
      const currentState = stateRef.current;
      const counters = currentState.memoryCounters || {};
      if (!actionsRef.current) return;

      if (eventType === 'decoration_placed') {
        const nextCount = (counters.decorationsPlaced || 0) + 1;
        dispatch({
          type: GAME_ACTIONS.UPDATE_MEMORY_COUNTERS,
          payload: { ...counters, decorationsPlaced: nextCount },
        });

        if (nextCount >= 3) {
          actionsRef.current.unlockMemory('cozy_cornerstone');
        }

        const decoration = DECORATION_DATA[eventData.decorationId];
        if (decoration) {
          if (isLightingDecoration(decoration)) {
            actionsRef.current.unlockMemory('lantern_glow');
          }
          if (isPathOrFenceDecoration(decoration)) {
            actionsRef.current.unlockMemory('garden_path');
          }
          if (isSeasonalDecoration(decoration)) {
            actionsRef.current.unlockMemory('seasonal_welcome');
          }
          if (decoration?.tags?.includes('season_pack_v1')) {
            actionsRef.current.unlockMemory('winter_showcase');
          }
        }
      }

      if (eventType === 'festival_attended') {
        const nextCount = (counters.festivalsAttended || 0) + 1;
        dispatch({
          type: GAME_ACTIONS.UPDATE_MEMORY_COUNTERS,
          payload: { ...counters, festivalsAttended: nextCount },
        });

        if (nextCount >= 1) {
          actionsRef.current.unlockMemory('festival_first');
        }
        if (nextCount >= 3) {
          actionsRef.current.unlockMemory('festival_regular');
        }
        if (eventData.eventId === 'winter_hearth_market') {
          actionsRef.current.unlockMemory('winter_market');
        }
      }

      if (eventType === 'shop_decor_purchase') {
        actionsRef.current.unlockMemory('market_trinket');
      }

      if (eventType === 'scrapbook_opened') {
        actionsRef.current.unlockMemory('quiet_pages');
        actionsRef.current?.recordJournalEntry('scrapbook_opened', {
          dayKey: getDayKey(),
          flags: { scrapbookOpened: true },
        });
      }

      if (eventType === 'crop_harvested') {
        if (eventData.cropId === 'parsnip') {
          actionsRef.current.unlockMemory('parsnip_patch');
        }
        if (eventData.cropId === 'cranberry') {
          actionsRef.current.unlockMemory('cranberry_crate');
        }
        if (eventData.cropId === 'snowdrop') {
          actionsRef.current.unlockMemory('snowdrop_harvest');
        }
        if (eventData.cropId === 'turnip') {
          actionsRef.current.unlockMemory('turnip_treat');
        }
        if (eventData.cropId === 'ginger_root') {
          actionsRef.current.unlockMemory('ginger_harvest');
        }
      }
    },

    recordCozyExpansionEvent: (eventType, eventData = {}) => {
      const currentState = stateRef.current;
      const current = currentState.cozyExpansion || {};
      const cropTraits = current.cropTraits || { discoveredByCrop: {}, totalDiscovered: 0, lastDiscovered: null };
      const rareMoments = current.rareMoments || { unlocked: {}, dayKeys: {} };
      const decorSets = current.decorSets || { completed: {}, progress: {} };
      const farmTitles = current.farmTitles || { unlocked: { home_grower: true }, activeId: 'home_grower' };
      const visualState = current.visualState || { weather: 'sunny', lastPeriodKey: null, lastWeeklySpecialDayKey: null };
      const dayKey = eventData.dayKey || getDayKey();

      let next = {
        cropTraits: { ...cropTraits, discoveredByCrop: { ...(cropTraits.discoveredByCrop || {}) } },
        rareMoments: { ...rareMoments, unlocked: { ...(rareMoments.unlocked || {}) }, dayKeys: { ...(rareMoments.dayKeys || {}) } },
        decorSets: { ...decorSets, completed: { ...(decorSets.completed || {}) }, progress: { ...(decorSets.progress || {}) } },
        farmTitles: { ...farmTitles, unlocked: { ...(farmTitles.unlocked || {}), home_grower: true }, activeId: farmTitles.activeId || 'home_grower' },
        visualState: { ...visualState },
      };
      let changed = false;

      const unlockTitle = (titleId) => {
        if (!titleId || !FARM_TITLES[titleId] || next.farmTitles.unlocked[titleId]) return;
        next.farmTitles.unlocked[titleId] = true;
        changed = true;
        dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: { message: `🏷️ New Farm Title: ${FARM_TITLES[titleId].name}`, type: 'info' } });
      };

      const triggerRareMoment = (momentId) => {
        const moment = RARE_MOMENTS[momentId];
        if (!moment) return;
        if (next.rareMoments.dayKeys[momentId] === dayKey) return;
        if (!rollChance(moment.chance)) return;
        next.rareMoments.unlocked[momentId] = true;
        next.rareMoments.dayKeys[momentId] = dayKey;
        changed = true;
        if (moment.memoryId) actionsRef.current?.unlockMemory(moment.memoryId);
        if (moment.almanacPageId) actionsRef.current?.unlockAlmanacPage(moment.almanacPageId);
        unlockTitle(moment.titleId);
        dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: { message: `${moment.icon} Rare Moment: ${moment.name}`, type: 'success' } });
      };

      if (eventType === 'crop_harvested' && eventData.cropId) {
        if (!next.cropTraits.discoveredByCrop[eventData.cropId] && rollChance(0.09)) {
          const traitId = getRandomTraitId();
          if (traitId) {
            next.cropTraits.discoveredByCrop[eventData.cropId] = traitId;
            next.cropTraits.totalDiscovered = Math.max(0, Number(next.cropTraits.totalDiscovered || 0)) + 1;
            next.cropTraits.lastDiscovered = { cropId: eventData.cropId, traitId, dayKey, at: Date.now() };
            changed = true;
            actionsRef.current?.unlockAlmanacPage('crop_traits_field_notes');
            dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: { message: `${CROP_TRAITS[traitId]?.icon || '🌿'} Trait discovered: ${CROP_TRAITS[traitId]?.name || traitId}`, type: 'info' } });
          }
        }
        triggerRareMoment('golden_crop');
      }

      if (eventType === 'nightfall') {
        triggerRareMoment('shooting_star_night');
      }

      if (eventType === 'day_rollover') {
        triggerRareMoment('perfect_harvest_morning');
        if (getDayOfWeekIndex(dayKey) === WEEKLY_SPECIAL_DAY.dayIndex && next.visualState.lastWeeklySpecialDayKey !== dayKey) {
          next.visualState.lastWeeklySpecialDayKey = dayKey;
          changed = true;
          dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: { message: `📌 ${WEEKLY_SPECIAL_DAY.boardCopy}`, type: 'info' } });
        }
      }

      if (eventType === 'weather_changed' && eventData.weather) {
        next.visualState.weather = eventData.weather;
        changed = true;
      }

      if (eventType === 'context_hint_seen' && eventData.id) {
        const contextHints = next.contextHints || { dismissed: {} };
        const dismissed = { ...(contextHints.dismissed || {}) };
        if (!dismissed[eventData.id]) {
          dismissed[eventData.id] = Date.now();
          next.contextHints = { ...contextHints, dismissed };
          changed = true;
        }
      }

      if (eventType === 'decor_layout_changed') {
        const plots = Array.isArray(currentState.plots) ? currentState.plots : [];
        const placedIds = plots.filter((plot) => plot?.state === 'decor' && plot?.decorationId).map((plot) => plot.decorationId);
        DECOR_SETS.forEach((setDef) => {
          const placedCount = setDef.itemIds.filter((id) => placedIds.includes(id)).length;
          next.decorSets.progress[setDef.id] = placedCount;
          if (placedCount >= setDef.itemIds.length && !next.decorSets.completed[setDef.id]) {
            next.decorSets.completed[setDef.id] = true;
            changed = true;
            if (setDef.memoryId) actionsRef.current?.unlockMemory(setDef.memoryId);
            if (setDef.almanacPageId) actionsRef.current?.unlockAlmanacPage(setDef.almanacPageId);
            unlockTitle(setDef.titleId);
            dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: { message: `🪴 Decor Set complete: ${setDef.name}`, type: 'success' } });
          }
        });
      }

      const unlockedPages = Object.values(currentState.almanac?.unlocked || {}).filter(Boolean).length;
      if (unlockedPages >= 12) {
        unlockTitle('almanac_whisperer');
      }

      if (changed) {
        dispatch({ type: GAME_ACTIONS.UPDATE_COZY_EXPANSION, payload: next });
      }
    },

    recordAlmanacEvent: (eventType, eventData = {}) => {
      const currentState = stateRef.current;
      const currentAlmanac = currentState.almanac || {};
      const counters = currentAlmanac.counters || {};
      let nextCounters = { ...counters };
      let hasCounterUpdate = false;
      let nextDayKey = currentAlmanac.lastDayKey;

      const updateCounters = (patch) => {
        nextCounters = { ...nextCounters, ...patch };
        hasCounterUpdate = true;
      };

      const unlockPage = (pageId) => actionsRef.current?.unlockAlmanacPage(pageId);

      if (eventType === 'season_start') {
        const season = eventData.season;
        const seasonPages = {
          spring: 'spring_turning',
          summer: 'summer_glow',
          fall: 'autumn_gold',
          winter: 'winter_quiet',
        };
        if (seasonPages[season]) {
          unlockPage(seasonPages[season]);
        }

        if (season) {
          const seasonsSeen = { ...(counters.seasonsSeen || {}) };
          if (!seasonsSeen[season]) {
            seasonsSeen[season] = true;
            updateCounters({ seasonsSeen });
          }
          if (Object.keys(seasonsSeen).length >= 4) {
            unlockPage('full_circle');
          }
        }
      }

      if (eventType === 'weather_observed') {
        const weather = eventData.weather;
        if (isKnownWeatherType(weather)) {
          const weatherSeen = { ...(counters.weatherSeen || {}) };
          if (!weatherSeen[weather]) {
            weatherSeen[weather] = true;
            updateCounters({ weatherSeen });
          }
          if (Object.keys(weatherSeen).length >= ALMANAC_WEATHER_TYPES.length) {
            unlockPage('reading_the_sky');
          }
          if (weather === 'stormy') {
            unlockPage('stormwatch');
          }
        }
      }

      if (eventType === 'crop_harvested') {
        const cropId = eventData.cropId;
        const season = eventData.season || currentState.season?.current;
        const weather = eventData.weather || currentState.weather;

        if (weather === 'rainy') {
          unlockPage('rainsoft_fields');
        }
        if (season === 'winter') {
          unlockPage('cold_roots');
        }

        if (cropId && season) {
          const cropSeasonMask = { ...(counters.cropSeasonMask || {}) };
          const prevMask = cropSeasonMask[cropId] || 0;
          const seasonBit = getSeasonBit(season);
          const nextMask = prevMask | seasonBit;
          if (nextMask !== prevMask) {
            cropSeasonMask[cropId] = nextMask;
            updateCounters({ cropSeasonMask });
          }
          if (countBits(nextMask) >= 3) {
            unlockPage('reliable_favorite');
          }
        }

        if (cropId === 'snowdrop') {
          unlockPage('snowdrop_bloom');
        }
        if (cropId === 'turnip') {
          unlockPage('turnip_treasures');
        }
        if (cropId === 'ginger_root') {
          unlockPage('ginger_warmth');
        }
      }

      if (eventType === 'festival_attended') {
        const festivalCount = (currentState.memoryCounters?.festivalsAttended || 0) + 1;
        if (festivalCount >= 1) {
          unlockPage('gathering_light');
        }
        if (festivalCount >= 3) {
          unlockPage('festival_regular');
        }
        if (eventData.eventId === 'winter_hearth_market') {
          unlockPage('hearth_market');
        }
      }

      if (eventType === 'festival_game') {
        unlockPage('festival_rhythm');
      }

      if (eventType === 'decoration_placed') {
        const decoration = DECORATION_DATA[eventData.decorationId];
        if (isSeasonalDecoration(decoration)) {
          unlockPage('seasonal_trimmings');
        }
      }

      if (eventType === 'pet_cared') {
        unlockPage('pet_companions');
      }

      if (eventType === 'day_rollover') {
        const dayCount = (counters.dayCount || 0) + 1;
        updateCounters({ dayCount });
        nextDayKey = eventData.dayKey || getDayKey();
        if (dayCount >= 1) {
          unlockPage('morning_notes');
        }
        if (dayCount >= 3) {
          unlockPage('steadied_habits');
        }
      }

      if (eventType === 'philosophy_selected') {
        unlockPage('philosophy_compass');
      }

      if (hasCounterUpdate || nextDayKey !== currentAlmanac.lastDayKey) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_ALMANAC,
          payload: {
            ...currentAlmanac,
            counters: nextCounters,
            lastDayKey: nextDayKey,
          },
        });
      }
    },

    enterGhostVisit: (snapshot) => {
      dispatch({ type: GAME_ACTIONS.UPDATE_GHOST_VISIT, payload: { active: true, snapshot } });
    },
    exitGhostVisit: () => {
      dispatch({ type: GAME_ACTIONS.UPDATE_GHOST_VISIT, payload: { active: false, snapshot: null } });
    },

    placeDecoration: (plotIndex, decorationId) => {
      if (stateRef.current.ghostVisit?.active) return false;
      const currentState = stateRef.current;
      const plots = Array.isArray(currentState.plots) ? currentState.plots : [];
      const plot = plots[plotIndex];
      const decoration = DECORATION_DATA[decorationId];
      if (!plot || !decoration || plot.state !== 'empty') return false;

      if (!isItemUnlocked(currentState, decorationId, 'decor')) {
        const entitlementInfo = getItemEntitlementInfo(decorationId, 'decor');
        dispatch({
          type: GAME_ACTIONS.SET_PREMIUM_LOCK_PROMPT,
          payload: {
            itemId: decorationId,
            packId: entitlementInfo?.packId || null,
            badgeLabel: entitlementInfo?.badgeLabel || null,
          },
        });
        logDebugAction('premium_locked_cosmetic', { decorationId, packId: entitlementInfo?.packId });
        return 'locked';
      }

      const inventoryCount = currentState.inventory?.[decorationId] || 0;
      if (inventoryCount <= 0) return false;

      const updatedPlots = [...plots];
      updatedPlots[plotIndex] = {
        ...plot,
        state: 'decor',
        crop: null,
        decorationId,
        decorationPlacedAt: Date.now(),
        plantedAt: null,
        growthStage: 0,
        progress: 0,
      };

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY,
        payload: (inventory) => ({
          ...inventory,
          [decorationId]: Math.max(0, (inventory?.[decorationId] || 0) - 1),
        }),
      });

      actionsRef.current.recordMemoryEvent('decoration_placed', { decorationId });
      actionsRef.current.recordAlmanacEvent('decoration_placed', { decorationId });
      actionsRef.current.recordCozyGoalEvent('decoration_placed', { decorationId });
      actionsRef.current.recordCozyExpansionEvent('decor_layout_changed', { decorationId });
      actionsRef.current.recordMilestoneEvent('decor_set', { count: Object.keys(stateRef.current.cozyExpansion?.decorSets?.completed || {}).length });
      logDebugAction('decoration_place', { plotIndex, decorationId });
      return true;
    },

    removeDecoration: (plotIndex) => {
      if (stateRef.current.ghostVisit?.active) return false;
      const currentState = stateRef.current;
      const plots = Array.isArray(currentState.plots) ? currentState.plots : [];
      const plot = plots[plotIndex];
      if (!plot || plot.state !== 'decor' || !plot.decorationId) return false;

      const decorationId = plot.decorationId;
      const updatedPlots = [...plots];
      updatedPlots[plotIndex] = {
        ...plot,
        state: 'empty',
        decorationId: null,
        decorationPlacedAt: null,
        crop: null,
        plantedAt: null,
        growthStage: 0,
        progress: 0,
      };

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY,
        payload: (inventory) => ({
          ...inventory,
          [decorationId]: (inventory?.[decorationId] || 0) + 1,
        }),
      });

      actionsRef.current.recordCozyExpansionEvent('decor_layout_changed', { decorationId, removed: true });
      logDebugAction('decoration_remove', { plotIndex, decorationId });
      return true;
    },

    // Complex Game Logic (Delegated to Systems)
    plantCrop: (plotIndex, cropType, cropData) => {
      if (stateRef.current.ghostVisit?.active) return false;
      const plots = stateRef.current.plots || [];
      if (typeof plotIndex !== 'number' || plotIndex < 0 || plotIndex >= plots.length) {
        logDebugAction('plant_crop_invalid', { plotIndex, cropId: cropData?.id });
        return false;
      }
      const currentSystems = systemsRef.current;
      const uniqueCrops = new Set(
        plots
          .map((plot) => plot?.crop?.id)
          .filter((id) => typeof id === 'string')
      );
      if (cropData?.id) uniqueCrops.add(cropData.id);
      const plantQuestData = {
        uniqueCrops: uniqueCrops.size,
        allPlotsFilled: plots.every((plot, index) => (
          index === plotIndex ? true : plot?.state && plot.state !== 'empty'
        )),
      };

      if (currentSystems.farmingSystem?.plantCrop) {
        currentSystems.farmingSystem.update(stateRef.current);
        const planted = currentSystems.farmingSystem.plantCrop(plotIndex, cropData);
        if (planted) {
          updateDailyQuestProgress('plant', plantQuestData);
          logDebugAction('plant_crop', { plotIndex, cropId: cropData?.id, cropName: cropData?.name });
        }
        return planted;
      }
      // Fallback
      const updatedPlots = [...stateRef.current.plots];
      updatedPlots[plotIndex] = {
        id: plotIndex, state: 'planted', crop: cropData, plantedAt: Date.now(), growthStage: 1, waterLevel: 85, progress: 0
      };
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      updateDailyQuestProgress('plant', plantQuestData);
      logDebugAction('plant_crop', { plotIndex, cropId: cropData?.id, cropName: cropData?.name });
      return true;
    },

    harvestCrop: (plotIndex) => {
      if (stateRef.current.ghostVisit?.active) return false;
      const plots = [...(stateRef.current.plots || [])];
      if (typeof plotIndex !== 'number' || plotIndex < 0 || plotIndex >= plots.length) {
        logDebugAction('harvest_crop_invalid', { plotIndex });
        return;
      }
      const plot = plots[plotIndex];
      logDebugAction('harvest_crop', { plotIndex, cropId: plot?.crop?.id, cropName: plot?.crop?.name });
      plots[plotIndex] = {
        ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, waterLevel: 50, progress: 0,
        soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - 0.1)
      };
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots });
      updateDailyQuestProgress('harvest', {
        cropId: plot?.crop?.id,
        weather: stateRef.current.weather,
      });
    },

    earnMoney: (amount, source = 'generic') => {
      if (stateRef.current.ghostVisit?.active) return false;
      const safeAmount = normalizePositiveAmount(amount);
      if (safeAmount <= 0) return false;
      const level = stateRef.current.level || 1;
      const modifier = getEconomyRewardModifier(level, source);
      const tunedAmount = Math.max(1, Math.floor(safeAmount * modifier));
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (coins) => coins + tunedAmount });
      updateDailyQuestProgress('earn_coins', { amount: tunedAmount, source });
      return true;
    },
    spendMoney: (amount, { optional = false } = {}) => {
      if (stateRef.current.ghostVisit?.active) return false;
      const safeAmount = normalizePositiveAmount(amount);
      if (safeAmount <= 0) return false;
      const level = stateRef.current.level || 1;
      const sinkModifier = optional ? getEconomySinkModifier(level) : 1;
      const tunedCost = Math.max(1, Math.floor(safeAmount * sinkModifier));
      if (!optional && (stateRef.current.coins || 0) < tunedCost) return false;
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (coins) => Math.max(0, coins - tunedCost) });
      updateDailyQuestProgress('spend_coins', { amount: tunedCost, optional });
      return true;
    },
    addXP: (amount, sourceMeta = {}) => {
      if (stateRef.current.ghostVisit?.active) return false;
      const safeAmount = normalizePositiveAmount(amount);
      if (safeAmount <= 0) return false;
      const currentState = stateRef.current;
      const dayKey = getDayKey();
      const tuned = applyXpTuning(
        safeAmount,
        sourceMeta,
        currentState.progressionXpTracker || {},
        dayKey,
      );
      if (tuned.grantedXp <= 0) return false;
      dispatch({ type: GAME_ACTIONS.UPDATE_PROGRESSION_XP_TRACKER, payload: tuned.tracker });
      dispatch({ type: GAME_ACTIONS.SET_XP, payload: (xp) => xp + tuned.grantedXp });
      updateDailyQuestProgress('gain_xp', { amount: tuned.grantedXp });
      const predictedLevel = getLevelFromXp((currentState.xp || 0) + tuned.grantedXp);
      if (predictedLevel > (currentState.level || 1)) {
        updateDailyQuestProgress('level_up', { level: predictedLevel });
      }
      const recentXp = [
        ...(Array.isArray(currentState.recentXpEvents) ? currentState.recentXpEvents : []),
        {
          id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          source: sourceMeta?.label || sourceMeta?.source || 'activity',
          amount: tuned.grantedXp,
          timestamp: Date.now(),
        },
      ].slice(-3);
      dispatch({ type: GAME_ACTIONS.SET_RECENT_XP_EVENTS, payload: recentXp });
      return true;
    },

    sellInventoryCrop: (cropId, requestedQuantity = 1) => {
      const currentState = stateRef.current;
      const crop = CROP_DATA[cropId];
      if (!crop) {
        return { success: false, reason: 'invalid_crop' };
      }

      const availableQuantity = Math.max(
        0,
        Math.floor(Number(currentState.inventory?.[cropId] || 0))
      );
      if (availableQuantity <= 0) {
        return { success: false, reason: 'none_available' };
      }

      const quantity = Math.min(
        availableQuantity,
        Math.max(1, Math.floor(Number(requestedQuantity) || 1))
      );
      const marketPrice = Number(currentState.inventory?.[`${cropId}_price`]);
      const unitPrice = Number.isFinite(marketPrice) && marketPrice > 0
        ? Math.floor(marketPrice)
        : Math.max(1, Math.floor(Number(crop.baseValue) || 10));
      const dailyFocus = getDailyCropFocus(currentState, getDayKey());
      const isDailyFocus = dailyFocus?.cropId === cropId;
      const bonusMultiplier = isDailyFocus ? Number(dailyFocus.bonusMultiplier || 1) : 1;
      const earnings = Math.floor(unitPrice * quantity * bonusMultiplier);

      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY,
        payload: (inventory) => ({
          ...inventory,
          [cropId]: Math.max(0, Math.floor(Number(inventory?.[cropId] || 0)) - quantity),
        }),
      });
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (coins) => coins + earnings });

      logDebugAction('sell_inventory_crop', {
        cropId,
        quantity,
        unitPrice,
        bonusMultiplier,
        isDailyFocus,
        earnings,
      });

      return {
        success: true,
        cropId,
        quantity,
        unitPrice,
        bonusMultiplier,
        isDailyFocus,
        earnings,
      };
    },

    sellAllInventoryCrops: () => {
      const currentState = stateRef.current;
      const entries = Object.entries(currentState.inventory || {}).filter(([itemId, quantity]) => (
        CROP_DATA[itemId] && Number(quantity) > 0
      ));

      if (entries.length === 0) {
        return { success: false, reason: 'none_available' };
      }

      let totalEarnings = 0;
      let totalQuantity = 0;
      const breakdown = [];
      const dailyFocus = getDailyCropFocus(currentState, getDayKey());

      entries.forEach(([cropId, rawQuantity]) => {
        const quantity = Math.max(0, Math.floor(Number(rawQuantity) || 0));
        if (quantity <= 0) return;

        const crop = CROP_DATA[cropId];
        const marketPrice = Number(currentState.inventory?.[`${cropId}_price`]);
        const unitPrice = Number.isFinite(marketPrice) && marketPrice > 0
          ? Math.floor(marketPrice)
          : Math.max(1, Math.floor(Number(crop?.baseValue) || 10));
        const isDailyFocus = dailyFocus?.cropId === cropId;
        const bonusMultiplier = isDailyFocus ? Number(dailyFocus.bonusMultiplier || 1) : 1;
        const earnings = Math.floor(unitPrice * quantity * bonusMultiplier);

        totalEarnings += earnings;
        totalQuantity += quantity;
        breakdown.push({
          cropId,
          quantity,
          unitPrice,
          bonusMultiplier,
          isDailyFocus,
          earnings,
        });
      });

      if (totalQuantity <= 0) {
        return { success: false, reason: 'none_available' };
      }

      dispatch({
        type: GAME_ACTIONS.UPDATE_INVENTORY,
        payload: (inventory) => {
          const nextInventory = { ...inventory };
          breakdown.forEach(({ cropId }) => {
            nextInventory[cropId] = 0;
          });
          return nextInventory;
        },
      });
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (coins) => coins + totalEarnings });

      logDebugAction('sell_all_inventory_crops', {
        cropCount: breakdown.length,
        totalQuantity,
        totalEarnings,
      });

      return {
        success: true,
        cropCount: breakdown.length,
        totalQuantity,
        totalEarnings,
        breakdown,
      };
    },

    // Bulk actions
    harvestAllReadyCrops: () => {
      if (stateRef.current.ghostVisit?.active) return false;
      const currentState = stateRef.current;
      const specialization = getSpecializationModifiers(currentState);
      if (!Array.isArray(currentState.plots)) {
        return;
      }
      const readyPlotsIndexes = currentState.plots
        .map((p, i) => p.state === 'ready' && p.crop ? i : -1)
        .filter(i => i !== -1);

      if (readyPlotsIndexes.length === 0) return;
      logDebugAction('harvest_all_ready', { count: readyPlotsIndexes.length });

      let totalEarnings = 0;
      let totalXp = 0;
      const inventoryUpdates = {};

      const updatedPlots = currentState.plots.map(plot => {
        if (plot.state === 'ready' && plot.crop) {
          const earnings = applyDistrictHarvestBonus(
            Math.floor(
              calculateHarvestValue(
                plot.crop.baseValue || 10,
                plot.soilFertility || 1.0,
                currentState.inventory
              ) * (specialization.cropHarvestMultiplier || 1)
            ),
            getDistrictIdForPlot(currentState.gridSize || 3, currentState.plots.indexOf(plot))
          );
          totalEarnings += earnings;
          totalXp += Math.floor(earnings * 0.15 * (specialization.harvestXpMultiplier || 1));
          inventoryUpdates[plot.crop.id] = (inventoryUpdates[plot.crop.id] || 0) + 1;

          return { ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, progress: 0, waterLevel: 50 };
        }
        return plot;
      });

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      setTimeout(() => {
        dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (coins) => coins + totalEarnings });
        actionsRef.current?.addXP(totalXp, { source: 'harvest', label: 'Bulk Harvest' });
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY, payload: (inv) => {
            const newInv = { ...inv };
            Object.entries(inventoryUpdates).forEach(([id, amt]) => newInv[id] = (newInv[id] || 0) + amt);
            return newInv;
          }
        });
        if (inventoryUpdates.parsnip) {
          actionsRef.current?.recordMemoryEvent('crop_harvested', { cropId: 'parsnip' });
        }
        if (inventoryUpdates.cranberry) {
          actionsRef.current?.recordMemoryEvent('crop_harvested', { cropId: 'cranberry' });
        }
        actionsRef.current?.recordMilestoneEvent('harvest', { count: readyPlotsIndexes.length });
      }, 0);
    },

    waterAllPlots: () => {
      if (stateRef.current.ghostVisit?.active) return false;
      const currentSystems = systemsRef.current;
      if (currentSystems.farmingSystem?.waterAll) {
        currentSystems.farmingSystem.update(stateRef.current);
        currentSystems.farmingSystem.waterAll();
        logDebugAction('water_all');
        return;
      }
      const updatedPlots = stateRef.current.plots.map((plot) => ({
        ...plot,
        waterLevel: Math.min(100, (plot.waterLevel || 0) + 25),
      }));
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      logDebugAction('water_all');
    },

    fertilizeAllPlots: () => {
      if (stateRef.current.ghostVisit?.active) return false;
      const currentState = stateRef.current;
      const plots = Array.isArray(currentState.plots) ? currentState.plots : [];
      const requestedUnits = plots.length;
      const unitCost = SUPPLY_UNIT_COSTS.fertilizer;
      const planned = planSupplyUsage({
        inventoryCount: currentState.inventory?.fertilizer || 0,
        coins: currentState.coins || 0,
        unitCost,
        requestedUnits,
      });
      if (planned.appliedUnits <= 0) return { applied: 0, reason: 'insufficient' };

      const updatedPlots = plots.map((plot, index) => {
        if (index >= planned.appliedUnits) return plot;
        return {
          ...plot,
          soilFertility: Math.min(1.5, (plot.soilFertility || 1.0) + 0.3),
          waterLevel: Math.min(100, (plot.waterLevel || 0) + 10),
          fertilizer: (plot.fertilizer || 0) + 1,
        };
      });

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      if (planned.coinCost > 0) {
        actionsRef.current?.spendMoney(planned.coinCost);
      }
      if (planned.usedFromInventory > 0) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY,
          payload: (inventory) => ({
            ...(inventory || {}),
            fertilizer: Math.max(0, Math.floor(Number(inventory?.fertilizer || 0)) - planned.usedFromInventory),
          }),
        });
      }
      logDebugAction('fertilize_all', {
        count: planned.appliedUnits,
        usedFromInventory: planned.usedFromInventory,
        boughtUnits: planned.boughtUnits,
        coinCost: planned.coinCost,
      });
      return {
        applied: planned.appliedUnits,
        usedFromInventory: planned.usedFromInventory,
        boughtUnits: planned.boughtUnits,
        coinCost: planned.coinCost,
      };
    },

    treatAllDiseases: () => {
      if (stateRef.current.ghostVisit?.active) return false;
      const currentState = stateRef.current;
      const plots = Array.isArray(currentState.plots) ? currentState.plots : [];
      const diseasedIndexes = plots
        .map((plot, index) => (plot?.disease ? index : -1))
        .filter((index) => index !== -1);
      const requestedUnits = diseasedIndexes.length;
      const unitCost = SUPPLY_UNIT_COSTS.pesticide;
      const planned = planSupplyUsage({
        inventoryCount: currentState.inventory?.pesticide || 0,
        coins: currentState.coins || 0,
        unitCost,
        requestedUnits,
      });
      if (planned.appliedUnits <= 0) return { applied: 0, reason: 'insufficient' };

      const treatSet = new Set(diseasedIndexes.slice(0, planned.appliedUnits));
      const updatedPlots = plots.map((plot, index) => {
        if (!treatSet.has(index)) return plot;
        return {
          ...plot,
          disease: null,
          diseasedAt: null,
          curedAt: Date.now(),
        };
      });

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      if (planned.coinCost > 0) {
        actionsRef.current?.spendMoney(planned.coinCost);
      }
      if (planned.usedFromInventory > 0) {
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY,
          payload: (inventory) => ({
            ...(inventory || {}),
            pesticide: Math.max(0, Math.floor(Number(inventory?.pesticide || 0)) - planned.usedFromInventory),
          }),
        });
      }
      logDebugAction('treat_all_diseases', {
        count: planned.appliedUnits,
        usedFromInventory: planned.usedFromInventory,
        boughtUnits: planned.boughtUnits,
        coinCost: planned.coinCost,
      });
      return {
        applied: planned.appliedUnits,
        usedFromInventory: planned.usedFromInventory,
        boughtUnits: planned.boughtUnits,
        coinCost: planned.coinCost,
      };
    },
  }), []); // dispatch is stable

  actionsRef.current = actions;

  useEffect(() => {
    actionsRef.current?.recordRetentionVisit(getDayKey(), Date.now());
  }, []);

  return (
    <GameStoreContext.Provider value={storeRef.current}>
      <GameActionsContext.Provider value={actions}>
        <GameSystemsContext.Provider value={systems}>
          {children}
        </GameSystemsContext.Provider>
      </GameActionsContext.Provider>
    </GameStoreContext.Provider>
  );
}

export function useGameSelector(selector) {
  const store = useContext(GameStoreContext);
  if (!store) throw new Error('useGameSelector must be used within a GameProvider');
  const select = typeof selector === 'function' ? selector : (s) => s;
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.getState()),
    () => select(store.getState())
  );
}

export function useGameStore() {
  const store = useContext(GameStoreContext);
  if (!store) throw new Error('useGameStore must be used within a GameProvider');
  return store;
}

export function useGameState() {
  return useGameSelector((s) => s);
}

export function useGameActions() {
  const actions = useContext(GameActionsContext);
  if (!actions) throw new Error('useGameActions must be used within a GameProvider');
  return actions;
}

export function useGameSystems() {
  const systems = useContext(GameSystemsContext);
  if (!systems) throw new Error('useGameSystems must be used within a GameProvider');
  return systems;
}

export function useGame() {
  return {
    state: useGameState(),
    actions: useGameActions(),
    systems: useGameSystems(),
  };
}

export { GAME_ACTIONS };
export default GameStoreContext;
