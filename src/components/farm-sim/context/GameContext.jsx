import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { GAME_ACTIONS } from './GameActions';
import { SAVE_VERSION, SAVE_KEY, loadSavedState } from './GamePersistence';
import { initialState, gameReducer } from './GameReducer';
import { calculateHarvestValue } from '../constants/cropData';

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

  const buildXpMeta = useCallback((source) => {
    if (import.meta.env.MODE !== 'development') return undefined;
    if (typeof window === 'undefined' || !window.__farmDebug?.xp) return undefined;
    const stack = new Error().stack;
    const stackLines = stack ? stack.split('\n').map(line => line.trim()) : [];
    const inferredSource = source
      || stackLines.find(line => line.includes('/src/') && !line.includes('GameContext.jsx'))
      || 'unknown';
    return {
      source: inferredSource,
      stack,
      timestamp: Date.now(),
    };
  }, []);

  // Memoized action creators
  const actions = useMemo(() => ({
    // Core property setters
    setCoins: (coins) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: coins }),
    setXp: (xp, source) => dispatch({
      type: GAME_ACTIONS.SET_XP,
      payload: xp,
      meta: buildXpMeta(source),
    }),

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
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        dispatch({ type: GAME_ACTIONS.UPDATE_GAME_LOOP, payload: { lastSaveTime: saveTimestamp } });
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
        return currentSystems.farmingSystem.plantCrop(plotIndex, cropData);
      }
      // Fallback
      const updatedPlots = [...stateRef.current.plots];
      updatedPlots[plotIndex] = {
        id: plotIndex, state: 'planted', crop: cropData, plantedAt: Date.now(), growthStage: 1, waterLevel: 85, progress: 0
      };
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: updatedPlots });
      return true;
    },

    harvestCrop: (plotIndex) => {
      const plots = [...stateRef.current.plots];
      const plot = plots[plotIndex];
      plots[plotIndex] = {
        ...plot, state: 'empty', crop: null, plantedAt: null, growthStage: 0, waterLevel: 50, progress: 0,
        soilFertility: Math.max(0.5, (plot?.soilFertility || 1.0) - 0.1)
      };
      dispatch({ type: GAME_ACTIONS.UPDATE_PLOTS, payload: plots });
    },

    earnMoney: (amount) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (c) => c + amount }),
    spendMoney: (amount) => dispatch({ type: GAME_ACTIONS.SET_COINS, payload: (c) => Math.max(0, c - amount) }),
    addXP: (amount, source) => dispatch({
      type: GAME_ACTIONS.SET_XP,
      payload: (x) => x + amount,
      meta: buildXpMeta(source),
    }),

    // Bulk actions
    harvestAllReadyCrops: () => {
      const currentState = stateRef.current;
      const readyPlotsIndexes = currentState.plots
        .map((p, i) => p.state === 'ready' && p.crop ? i : -1)
        .filter(i => i !== -1);

      if (readyPlotsIndexes.length === 0) return;

      let totalEarnings = 0;
      let totalXp = 0;
      const inventoryUpdates = {};

      const updatedPlots = currentState.plots.map(plot => {
        if (plot.state === 'ready' && plot.crop) {
          const earnings = calculateHarvestValue(plot, currentState.season?.config);
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
  }), [buildXpMeta]); // dispatch is stable

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
