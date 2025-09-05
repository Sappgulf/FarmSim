import { useState, useRef } from 'react';

/**
 * Central game state management hook
 * Consolidates all game state and provides state management utilities
 */
export function useGameState() {
  // Utility function to get current timestamp
  const nowSec = () => Math.floor(Date.now() / 1000);
  
  // References for internal tracking
  const _saveTimeout = useRef(null);
  const _lastAutosaveToastAt = useRef(0);

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
    addNotification,
    addLog,
    addCoins,
    spendCoins,
    nowSec,
    
    // Internal refs
    _saveTimeout,
    _lastAutosaveToastAt
  };
}
