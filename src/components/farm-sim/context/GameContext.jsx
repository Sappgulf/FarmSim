import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { GAME_ACTIONS } from './GameActions';
import { SAVE_VERSION, SAVE_KEY, BACKUP_SAVE_KEY, loadSavedState } from './GamePersistence';
import { initialState, gameReducer } from './GameReducer';
import { initDebugTools, logDebugAction } from '../../../utils/debugTools';

/**
 * GameContext - Centralized state management for FarmSim
 * Optimized for performance by decoupling actions, reducer, and persistence logic.
 */
const GameContext = createContext(null);

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
        if (import.meta.env.MODE === 'development') {
          console.debug('[farm]', 'Loaded saved game successfully');
        }
        return savedState;
      }
      return initial;
    }
  );

  // Use refs to access latest state without causing re-renders in callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatchRef = useRef(dispatch);
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  // Debounced auto-save management
  const autoSaveTimeoutRef = useRef(null);
  const lastSaveStateRef = useRef('');

  useEffect(() => {
    initDebugTools();
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

    const stateString = JSON.stringify({
      coins: stateToSave.coins,
      xp: stateToSave.xp,
      level: stateToSave.level,
      plotsCount: stateToSave.plots?.length || 0,
      gridSize: stateToSave.gridSize
    });

    if (stateString === lastSaveStateRef.current) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const saveTimestamp = Date.now();
        const saveData = {
          ...stateToSave,
          saveVersion: SAVE_VERSION,
          notifications: [],
          gameLoop: { ...stateToSave.gameLoop, lastSaveTime: saveTimestamp },
        };
        const serialized = JSON.stringify(saveData);

        const saveToStorage = () => {
          try {
            const existing = localStorage.getItem(SAVE_KEY);
            if (existing) {
              localStorage.setItem(BACKUP_SAVE_KEY, existing);
            }
            localStorage.setItem(SAVE_KEY, serialized);
            lastSaveStateRef.current = stateString;
            if (dispatchRef.current) {
              dispatchRef.current({
                type: GAME_ACTIONS.UPDATE_GAME_LOOP,
                payload: { lastSaveTime: saveTimestamp },
              });
            }
          } catch (error) {
            console.error('[farm] Auto-save failed:', error);
          }
        };

        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(saveToStorage, { timeout: 1000 });
        } else {
          setTimeout(saveToStorage, 0);
        }
      } catch (error) {
        console.error('[farm] Auto-save serialization failed:', error);
      }
    }, 2000);
  }, []);

  // Performance loops: FPS monitoring and Auto-save trigger
  const fpsRef = useRef(60);
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
        frameCount = 0;
        lastFPSUpdate = currentTime;
      }

      const now = Date.now();
      if (currentState.settings.autoSave && (now - lastAutoSaveCheck >= 30000)) {
        debouncedAutoSave(currentState);
        lastAutoSaveCheck = now;
      }

      animationFrameId = requestAnimationFrame(masterGameLoop);
    };

    animationFrameId = requestAnimationFrame(masterGameLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [state.gameLoop.paused, state.settings.autoSave, debouncedAutoSave]);

  // System management (bridging React state with external game systems)
  const [systems, setSystemsState] = useState({});
  const systemsRef = useRef(systems);
  useEffect(() => {
    systemsRef.current = systems;
  }, [systems]);

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
    updatePrestige: (prestige) => dispatch({ type: GAME_ACTIONS.UPDATE_PRESTIGE, payload: prestige }),
    prestigeReset: () => dispatch({ type: GAME_ACTIONS.PRESTIGE_RESET }),
    updateResearch: (research) => dispatch({ type: GAME_ACTIONS.UPDATE_RESEARCH, payload: research }),
    updateGenetics: (genetics) => dispatch({ type: GAME_ACTIONS.UPDATE_GENETICS, payload: genetics }),
    updateSocial: (social) => dispatch({ type: GAME_ACTIONS.UPDATE_SOCIAL, payload: social }),
    updatePets: (pets) => dispatch({ type: GAME_ACTIONS.UPDATE_PETS, payload: pets }),
    updateProcessingFacilities: (facilities) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_FACILITIES, payload: facilities }),
    updateProcessingQueue: (queue) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSING_QUEUE, payload: queue }),
    updateProcessedInventory: (inventory) => dispatch({ type: GAME_ACTIONS.UPDATE_PROCESSED_INVENTORY, payload: inventory }),
    updateChallengeStreak: (streak) => dispatch({ type: GAME_ACTIONS.UPDATE_CHALLENGE_STREAK, payload: streak }),
    updateLastChallengeReset: (timestamp) => dispatch({ type: GAME_ACTIONS.UPDATE_LAST_CHALLENGE_RESET, payload: timestamp }),

    // UI & Settings
    addNotification: (notification) => dispatch({ type: GAME_ACTIONS.ADD_NOTIFICATION, payload: notification }),
    clearNotification: (id) => dispatch({ type: GAME_ACTIONS.CLEAR_NOTIFICATION, payload: id }),
    setSelectedCrop: (cropId) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_CROP, payload: cropId }),
    updateSettings: (settings) => dispatch({ type: GAME_ACTIONS.UPDATE_SETTINGS, payload: settings }),
    updateGameLoop: (data) => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: data }),
    pauseGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: true } }),
    resumeGame: () => dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { paused: false } }),

    // Systems Bridge
    setSystems: (newSystems) => setSystemsState(newSystems),

    // Manual Save/Load
    loadGame: () => {
      const savedState = loadSavedState();
      if (savedState) {
        dispatch({ type: GAME_ACTIONS.LOAD_GAME, payload: savedState });
        logDebugAction('load_game', { saveVersion: savedState.saveVersion });
        return true;
      }
      return false;
    },
    saveGame: () => {
      try {
        const saveTimestamp = Date.now();
        const stateToSave = {
          ...stateRef.current,
          saveVersion: SAVE_VERSION,
          notifications: [],
          gameLoop: { ...stateRef.current.gameLoop, lastSaveTime: saveTimestamp },
        };
        const existing = localStorage.getItem(SAVE_KEY);
        if (existing) {
          localStorage.setItem(BACKUP_SAVE_KEY, existing);
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { lastSaveTime: saveTimestamp } });
        logDebugAction('save_game', { saveVersion: SAVE_VERSION });
        return true;
      } catch (error) {
        console.error('[farm] Manual save failed', error);
        return false;
      }
    },

    // Complex Game Logic (Delegated to Systems)
    plantCrop: (plotIndex, cropType, cropData) => {
      const currentSystems = systemsRef.current;
      if (currentSystems.farmingSystem?.plantCrop) {
        currentSystems.farmingSystem.update(stateRef.current);
        const planted = currentSystems.farmingSystem.plantCrop(plotIndex, cropData);
        if (planted) {
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
      logDebugAction('plant_crop', { plotIndex, cropId: cropData?.id, cropName: cropData?.name });
      return true;
    },

    harvestCrop: (plotIndex) => {
      const plots = [...stateRef.current.plots];
      const plot = plots[plotIndex];
      logDebugAction('harvest_crop', { plotIndex, cropId: plot?.crop?.id, cropName: plot?.crop?.name });
      plots[plotIndex] = {
        ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, waterLevel: 50, progress: 0,
        soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - 0.1)
      };
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots });
    },

    earnMoney: (amount) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (c) => c + amount }),
    spendMoney: (amount) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (c) => Math.max(0, c - amount) }),
    addXP: (amount) => dispatch({ type: GAME_ACTIONS.SET_XP, payload: (x) => x + amount }),

    // Bulk actions
    harvestAllReadyCrops: () => {
      const currentState = stateRef.current;
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
          const earnings = Math.floor((plot.crop.baseValue || 10) * (plot.soilFertility || 1.0));
          totalEarnings += earnings;
          totalXp += Math.floor(earnings * 0.15);
          inventoryUpdates[plot.crop.id] = (inventoryUpdates[plot.crop.id] || 0) + 1;

          return { ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, progress: 0, waterLevel: 50 };
        }
        return plot;
      });

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      setTimeout(() => {
        dispatch({ type: GAME_ACTIONS.SET_COINS, payload: currentState.coins + totalEarnings });
        dispatch({ type: GAME_ACTIONS.SET_XP, payload: currentState.xp + totalXp });
        dispatch({
          type: GAME_ACTIONS.UPDATE_INVENTORY, payload: (inv) => {
            const newInv = { ...inv };
            Object.entries(inventoryUpdates).forEach(([id, amt]) => newInv[id] = (newInv[id] || 0) + amt);
            return newInv;
          }
        });
      }, 0);
    },

    waterAllPlots: () => {
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
      const plots = stateRef.current.plots || [];
      const costPerPlot = 15;
      const maxFertilizations = Math.min(plots.length, Math.floor(stateRef.current.coins / costPerPlot));
      if (maxFertilizations <= 0) return;

      const updatedPlots = plots.map((plot, index) => {
        if (index >= maxFertilizations) return plot;
        return {
          ...plot,
          soilFertility: Math.min(1.5, (plot.soilFertility || 1.0) + 0.3),
          waterLevel: Math.min(100, (plot.waterLevel || 0) + 10),
          fertilizer: (plot.fertilizer || 0) + 1,
        };
      });

      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: stateRef.current.coins - maxFertilizations * costPerPlot });
      logDebugAction('fertilize_all', { count: maxFertilizations });
    },

    treatAllDiseases: () => {
      const plots = stateRef.current.plots || [];
      const diseasedIndexes = plots
        .map((plot, index) => (plot?.disease ? index : -1))
        .filter((index) => index !== -1);
      const costPerPlot = 20;
      const maxTreatments = Math.min(diseasedIndexes.length, Math.floor(stateRef.current.coins / costPerPlot));
      if (maxTreatments <= 0) return;

      const treatSet = new Set(diseasedIndexes.slice(0, maxTreatments));
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
      dispatch({ type: GAME_ACTIONS.SET_COINS, payload: stateRef.current.coins - maxTreatments * costPerPlot });
      logDebugAction('treat_all_diseases', { count: maxTreatments });
    },
  }), []); // dispatch is stable

  return (
    <GameContext.Provider value={{ state, actions, systems }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}

export { GAME_ACTIONS };
export default GameContext;
