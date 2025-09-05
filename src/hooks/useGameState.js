import { useState, useRef } from 'react';

/**
 * Central game state management hook
 * Consolidates all game state and provides state management utilities
 */
export function useGameState() {
  // Utility function to get current timestamp with validation
  const nowSec = () => {
    const timestamp = Date.now();
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      console.error('Invalid timestamp detected:', timestamp);
      return Math.floor(new Date('2024-01-01').getTime() / 1000); // Fallback
    }
    return Math.floor(timestamp / 1000);
  };
  
  // References for internal tracking
  const _saveTimeout = useRef(null);
  const _lastAutosaveToastAt = useRef(0);

  // State validation function
  const validateGameState = (state) => {
    if (!state || typeof state !== 'object') return false;
    
    // Validate coins (must be non-negative finite number)
    if (typeof state.coins !== 'number' || !isFinite(state.coins) || state.coins < 0) {
      state.coins = 100; // Reset to default
    }
    
    // Validate score
    if (typeof state.score !== 'number' || !isFinite(state.score) || state.score < 0) {
      state.score = 0;
    }
    
    // Validate plots array
    if (!Array.isArray(state.plots) || state.plots.length === 0) {
      state.plots = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        state: "empty",
        seed: null,
        progress: 0,
        wateredAt: 0,
        fertilizedAt: 0,
        pesticideAt: 0,
        plantedAt: 0,
        quality: 1.0,
        health: 1.0
      }));
    }
    
    return true;
  };

  // CORE GAME STATE
  const [coins, setCoins] = useState(100);
  const [score, setScore] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalLifetimeCoins, setTotalLifetimeCoins] = useState(0);
  const [name, setName] = useState("Farmer Austin");
  
  // FARM STATE
  const [gridSize, setGridSize] = useState(9);
  const [plots, setPlots] = useState(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      state: "empty",
      seed: null,
      progress: 0,
      wateredAt: 0,
      fertilizedAt: 0,
      pesticideAt: 0,
      plantedAt: 0,
      disease: null
    }))
  );
  
  // INVENTORY STATE
  const [inventory, setInventory] = useState({
    fertilizer: 5,
    pesticide: 5
  });
  const [feedInventory, setFeedInventory] = useState({});
  const [livestockProducts, setLivestockProducts] = useState({});
  
  // GAME MECHANICS STATE
  const [selectedSeed, setSelectedSeed] = useState("carrot");
  const [weather, setWeather] = useState({ 
    type: "Sunny", 
    endsAt: nowSec() + 30 
  });
  const [currentTime, setCurrentTime] = useState(nowSec());
  const [gameTime, setGameTime] = useState(0);
  const [lastGrowthTick, setLastGrowthTick] = useState(nowSec());
  
  // PROGRESSION STATE
  const [levelId, setLevelId] = useState("lvl1");
  const [levelEndsAt, setLevelEndsAt] = useState(nowSec() + 360);
  const [levelStatus, setLevelStatus] = useState("playing");
  const [levelStartedAt, setLevelStartedAt] = useState(nowSec());
  const [achievements, setAchievements] = useState([]);
  
  // ADVANCED FEATURES STATE
  const [buildings, setBuildings] = useState({});
  const [livestock, setLivestock] = useState({});
  const [equipment, setEquipment] = useState([]);
  const [processors, setProcessors] = useState([]);
  
  // PRESTIGE SYSTEM
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [skillPoints, setSkillPoints] = useState(0);
  const [skillLevels, setSkillLevels] = useState({});
  
  // RESEARCH & AUTOMATION
  const [researchProjects, setResearchProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  
  // ECONOMY STATE
  const [marketPrices, setMarketPrices] = useState({});
  const [futuresContracts, setFuturesContracts] = useState([]);
  const [economicEvents, setEconomicEvents] = useState([]);
  const [reputation, setReputation] = useState(0);
  
  // UI STATE
  const [notifications, setNotifications] = useState([]);
  const [log, setLog] = useState([
    "🌱 Welcome to your farm! Plant seeds and watch them grow.",
    "💡 Tip: Right-click plots to fertilize or spray pesticide."
  ]);
  const [buying, setBuying] = useState(false);
  const [shopTab, setShopTab] = useState('seeds');
  
  // SETTINGS STATE
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(1);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);

  // STATE UTILITIES
  const addNotification = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setNotifications(prev => {
      const newNotifications = [...prev, { id, message, type, timestamp: nowSec() }];
      // Limit to 5 notifications
      return newNotifications.slice(-5);
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const addLog = (message) => {
    setLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 50));
  };

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
    setTotalEarned(prev => prev + amount);
    setTotalLifetimeCoins(prev => prev + amount);
  };

  const spendCoins = (amount) => {
    if (coins < amount) return false;
    setCoins(prev => prev - amount);
    return true;
  };

  return {
    // Core state
    coins, setCoins,
    score, setScore,
    totalEarned, setTotalEarned,
    totalLifetimeCoins, setTotalLifetimeCoins,
    name, setName,
    
    // Farm state
    gridSize, setGridSize,
    plots, setPlots,
    
    // Inventory
    inventory, setInventory,
    feedInventory, setFeedInventory,
    livestockProducts, setLivestockProducts,
    
    // Game mechanics
    selectedSeed, setSelectedSeed,
    weather, setWeather,
    currentTime, setCurrentTime,
    gameTime, setGameTime,
    lastGrowthTick, setLastGrowthTick,
    
    // Progression
    levelId, setLevelId,
    levelEndsAt, setLevelEndsAt,
    levelStatus, setLevelStatus,
    levelStartedAt, setLevelStartedAt,
    achievements, setAchievements,
    
    // Advanced features
    buildings, setBuildings,
    livestock, setLivestock,
    equipment, setEquipment,
    processors, setProcessors,
    
    // Prestige
    prestigeLevel, setPrestigeLevel,
    skillPoints, setSkillPoints,
    skillLevels, setSkillLevels,
    
    // Research
    researchProjects, setResearchProjects,
    workers, setWorkers,
    facilities, setFacilities,
    
    // Economy
    marketPrices, setMarketPrices,
    futuresContracts, setFuturesContracts,
    economicEvents, setEconomicEvents,
    reputation, setReputation,
    
    // UI
    notifications, setNotifications,
    log, setLog,
    buying, setBuying,
    shopTab, setShopTab,
    
    // Settings
    soundEnabled, setSoundEnabled,
    sfxVolume, setSfxVolume,
    animationsEnabled, setAnimationsEnabled,
    performanceMode, setPerformanceMode,
    paused, setPaused,
    simSpeed, setSimSpeed,
    
    // Utilities
    addNotification: (notification) => {
      setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
    },
    addLog: (message) => {
      setLog(prev => [...prev, { message, timestamp: nowSec() }]);
    },
    addCoins: (amount) => {
      setCoins(prev => prev + amount);
      setTotalEarned(prev => prev + amount);
      setTotalLifetimeCoins(prev => prev + amount);
    },
    spendCoins: (amount) => {
      if (coins >= amount) {
        setCoins(prev => prev - amount);
        return true;
      }
      return false;
    },
    saveGame: () => {
      try {
        const saveData = {
          version: 2,
          coins,
          score,
          totalEarned,
          totalLifetimeCoins,
          name,
          gridSize,
          plots,
          savedAt: nowSec()
        };
        
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('farm_sim_enhanced_v2', JSON.stringify(saveData));
          console.debug('[useGameState] Game saved successfully');
          return true;
        } else {
          console.warn('[useGameState] localStorage unavailable');
          return false;
        }
      } catch (error) {
        console.error('[useGameState] Failed to save game:', error.message);
        return false;
      }
    },
    loadGame: () => {
      try {
        if (typeof window === 'undefined' || !window.localStorage) {
          return false;
        }
        
        const saveData = localStorage.getItem('farm_sim_enhanced_v2');
        if (!saveData) return false;

        const parsed = JSON.parse(saveData);
        
        if (validateGameState(parsed)) {
          setCoins(parsed.coins || 100);
          setScore(parsed.score || 0);
          setTotalEarned(parsed.totalEarned || 0);
          setTotalLifetimeCoins(parsed.totalLifetimeCoins || 0);
          setName(parsed.name || "Farmer Austin");
          setGridSize(parsed.gridSize || 9);
          setPlots(parsed.plots || []);
          
          console.debug('[useGameState] Game loaded successfully');
          return true;
        }
        return false;
      } catch (error) {
        console.error('[useGameState] Failed to load game:', error.message);
        return false;
      }
    },
    nowSec,
    
    // Internal refs
    _saveTimeout,
    _lastAutosaveToastAt
  };
}
