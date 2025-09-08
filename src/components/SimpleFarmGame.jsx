import React, { useState, useEffect } from 'react';

// Simple crop data
const CROPS = {
  wheat: { name: 'Wheat', emoji: '🌾', cost: 10, value: 25, growTime: 30 },
  carrot: { name: 'Carrot', emoji: '🥕', cost: 15, value: 35, growTime: 45 },
  tomato: { name: 'Tomato', emoji: '🍅', cost: 20, value: 50, growTime: 60 },
  corn: { name: 'Corn', emoji: '🌽', cost: 25, value: 65, growTime: 75 }
};

// Weather types
const WEATHER = {
  sunny: { 
    name: 'Sunny', 
    emoji: '☀️', 
    growthMultiplier: 1.2, 
    description: 'Perfect farming weather',
    diseaseChance: 0.01,
    stormChance: 0.0
  },
  rainy: { 
    name: 'Rainy', 
    emoji: '🌧️', 
    growthMultiplier: 1.1, 
    description: 'Good for growth but increases disease risk',
    diseaseChance: 0.03,
    stormChance: 0.05
  },
  cloudy: { 
    name: 'Cloudy', 
    emoji: '☁️', 
    growthMultiplier: 1.0, 
    description: 'Mild conditions',
    diseaseChance: 0.015,
    stormChance: 0.0
  },
  drought: { 
    name: 'Drought', 
    emoji: '🌵', 
    growthMultiplier: 0.7, 
    description: 'Crops struggle without irrigation',
    diseaseChance: 0.02,
    stormChance: 0.0
  },
  stormy: { 
    name: 'Stormy', 
    emoji: '⛈️', 
    growthMultiplier: 0.8, 
    description: 'Dangerous weather - crops may be damaged',
    diseaseChance: 0.05,
    stormChance: 0.15
  }
};

// Genetic traits for crops
const GENETIC_TRAITS = {
  diseaseResistance: {
    name: 'Disease Resistance',
    emoji: '🛡️',
    description: 'Reduces disease susceptibility',
    levels: { bronze: 0.8, silver: 0.6, gold: 0.4, platinum: 0.2 }
  },
  fastGrowth: {
    name: 'Fast Growth',
    emoji: '⚡',
    description: 'Reduces growth time',
    levels: { bronze: 0.9, silver: 0.8, gold: 0.7, platinum: 0.6 }
  },
  highYield: {
    name: 'High Yield',
    emoji: '💰',
    description: 'Increases crop value',
    levels: { bronze: 1.2, silver: 1.4, gold: 1.6, platinum: 2.0 }
  },
  weatherResistance: {
    name: 'Weather Resistance',
    emoji: '🌪️',
    description: 'Reduces weather damage',
    levels: { bronze: 0.8, silver: 0.6, gold: 0.4, platinum: 0.2 }
  },
  droughtTolerance: {
    name: 'Drought Tolerance',
    emoji: '�️',
    description: 'Survives without irrigation',
    levels: { bronze: 0.9, silver: 1.0, gold: 1.1, platinum: 1.2 }
  }
};

// Seed quality levels
const SEED_QUALITIES = {
  bronze: { name: 'Bronze', emoji: '🥉', color: 'text-amber-600', multiplier: 1.0, traits: 1 },
  silver: { name: 'Silver', emoji: '🥈', color: 'text-gray-500', multiplier: 1.3, traits: 2 },
  gold: { name: 'Gold', emoji: '🥇', color: 'text-yellow-500', multiplier: 1.6, traits: 3 },
  platinum: { name: 'Platinum', emoji: '💎', color: 'text-purple-600', multiplier: 2.0, traits: 4 }
};

// Hybrid crop combinations
const HYBRID_COMBINATIONS = {
  'wheat+corn': { 
    result: 'wheatcorn', 
    name: 'Wheat-Corn Hybrid', 
    emoji: '🌾🌽', 
    baseValue: 80,
    growTime: 45,
    traits: ['fastGrowth', 'highYield']
  },
  'tomato+carrot': { 
    result: 'tomatocarrot', 
    name: 'Tomato-Carrot Hybrid', 
    emoji: '🍅🥕', 
    baseValue: 120,
    growTime: 50,
    traits: ['diseaseResistance', 'weatherResistance']
  },
  'corn+tomato': { 
    result: 'corntomato', 
    name: 'Corn-Tomato Hybrid', 
    emoji: '🌽🍅', 
    baseValue: 100,
    growTime: 40,
    traits: ['highYield', 'droughtTolerance']
  }
};

// Livestock data
const LIVESTOCK = {
  chicken: { name: 'Chicken', emoji: '🐔', cost: 150, income: 8, interval: 20, food: 'grain', housing: 'coop' },
  cow: { name: 'Cow', emoji: '🐄', cost: 500, income: 25, interval: 45, food: 'hay', housing: 'barn' },
  pig: { name: 'Pig', emoji: '🐷', cost: 300, income: 15, interval: 30, food: 'corn', housing: 'pen' },
  sheep: { name: 'Sheep', emoji: '🐑', cost: 400, income: 20, interval: 35, food: 'grass', housing: 'pasture' },
  goat: { name: 'Goat', emoji: '🐐', cost: 350, income: 18, interval: 25, food: 'hay', housing: 'pen' }
};

// Buildings data
const BUILDINGS = {
  coop: { name: 'Chicken Coop', emoji: '🏠', cost: 800, capacity: 6, animals: ['chicken'], description: 'Houses up to 6 chickens' },
  barn: { name: 'Cow Barn', emoji: '🏚️', cost: 2000, capacity: 4, animals: ['cow'], description: 'Houses up to 4 cows' },
  pen: { name: 'Animal Pen', emoji: '🏭', cost: 1200, capacity: 5, animals: ['pig', 'goat'], description: 'Houses pigs and goats' },
  pasture: { name: 'Sheep Pasture', emoji: '🌾', cost: 1500, capacity: 8, animals: ['sheep'], description: 'Large pasture for sheep' },
  silo: { name: 'Feed Silo', emoji: '🏗️', cost: 1000, capacity: 100, animals: [], description: 'Stores animal feed' },
  greenhouse: { name: 'Greenhouse', emoji: '🏡', cost: 3000, capacity: 0, animals: [], description: 'Protected crop growing' },
  // Advanced buildings
  advancedGreenhouse: {
    name: 'Advanced Greenhouse',
    emoji: '🏠',
    cost: 5000,
    capacity: 0,
    animals: [],
    description: 'Complete weather protection, +30% growth rate, disease immunity'
  },
  irrigationSystem: {
    name: 'Irrigation System',
    emoji: '💧',
    cost: 2500,
    capacity: 0,
    animals: [],
    description: 'Auto-watering, drought immunity, +15% growth in dry weather'
  },
  breedingLab: {
    name: 'Breeding Laboratory',
    emoji: '🧬',
    cost: 4000,
    capacity: 0,
    animals: [],
    description: 'Research hybrid crops and enhance seed genetics'
  },
  weatherStation: {
    name: 'Weather Station',
    emoji: '📡',
    cost: 1500,
    capacity: 0,
    animals: [],
    description: 'Weather forecast, storm alerts, +10% weather resistance'
  },
  seedProcessor: {
    name: 'Seed Processor',
    emoji: '⚙️',
    cost: 3500,
    capacity: 0,
    animals: [],
    description: 'Upgrade seed quality and modify genetic traits'
  }
};

// Crop diseases
const DISEASES = {
  blight: { name: 'Crop Blight', emoji: '🦠', treatment: 'fungicide', damage: 0.5, description: 'Reduces crop value by 50%' },
  pest: { name: 'Pest Infestation', emoji: '🐛', treatment: 'pesticide', damage: 0.3, description: 'Slows growth by 30%' },
  drought: { name: 'Crop Stress', emoji: '🌵', treatment: 'fertilizer', damage: 0.2, description: 'Stunts growth' }
};

// Seasonal events
const SEASONS = {
  spring: { name: 'Spring Festival', emoji: '🌸', bonus: 1.2, specialCrop: 'tulip', description: 'All crops 20% more valuable!' },
  summer: { name: 'Summer Heat', emoji: '☀️', bonus: 1.0, specialCrop: 'sunflower', description: 'Perfect growing weather' },
  autumn: { name: 'Harvest Festival', emoji: '🍂', bonus: 1.5, specialCrop: 'pumpkin', description: 'Harvest bonuses active!' },
  winter: { name: 'Winter Market', emoji: '❄️', bonus: 0.8, specialCrop: 'pine', description: 'Slower growth, special crops available' }
};

// Special crops for events
const SPECIAL_CROPS = {
  tulip: { name: 'Tulip', emoji: '🌷', cost: 30, value: 80, growTime: 40, seasonal: 'spring' },
  sunflower: { name: 'Sunflower', emoji: '🌻', cost: 35, value: 90, growTime: 50, seasonal: 'summer' },
  pumpkin: { name: 'Pumpkin', emoji: '🎃', cost: 40, value: 120, growTime: 90, seasonal: 'autumn' },
  pine: { name: 'Pine Tree', emoji: '🌲', cost: 50, value: 150, growTime: 120, seasonal: 'winter' }
};

// Contracts system
const CONTRACT_TEMPLATES = [
  { crop: 'wheat', quantity: 10, bonus: 1.5, time: 300, client: 'Local Bakery' },
  { crop: 'carrot', quantity: 8, bonus: 1.3, time: 240, client: 'Restaurant Chain' },
  { crop: 'tomato', quantity: 5, bonus: 1.4, time: 180, client: 'Farmer\'s Market' },
  { crop: 'corn', quantity: 12, bonus: 1.6, time: 360, client: 'Food Processing Co.' }
];

// Shop items
const SHOP_ITEMS = {
  tools: {
    wateringCan: { name: 'Watering Can', emoji: '🪣', cost: 200, description: 'Water crops for +0.3x quality boost' },
    fertilizer: { name: 'Premium Fertilizer', emoji: '🌿', cost: 350, description: 'Fertilize crops for +0.5x quality boost' },
    harvester: { name: 'Auto Harvester', emoji: '🤖', cost: 1500, description: 'Automatically harvests ready crops' },
    sprinkler: { name: 'Sprinkler System', emoji: '💦', cost: 1200, description: 'Auto-waters all crops' },
    fungicide: { name: 'Fungicide', emoji: '🧪', cost: 100, description: 'Treats crop blight' },
    pesticide: { name: 'Pesticide', emoji: '🦟', cost: 80, description: 'Eliminates pests' }
  },
  feed: {
    grain: { name: 'Grain Feed', emoji: '🌾', cost: 20, description: 'Feed for chickens (x10 portions)' },
    hay: { name: 'Hay Bales', emoji: '🟫', cost: 30, description: 'Feed for cows and goats (x10 portions)' },
    corn: { name: 'Corn Feed', emoji: '🌽', cost: 25, description: 'Feed for pigs (x10 portions)' },
    grass: { name: 'Grass Pellets', emoji: '🟢', cost: 15, description: 'Feed for sheep (x10 portions)' }
  },
  seeds: {
    wheatBulk: { name: 'Wheat Seeds (Bulk)', emoji: '🌾', cost: 80, description: 'Get 20 wheat seeds' },
    carrotBulk: { name: 'Carrot Seeds (Bulk)', emoji: '🥕', cost: 120, description: 'Get 20 carrot seeds' },
    tomatoBulk: { name: 'Tomato Seeds (Bulk)', emoji: '🍅', cost: 160, description: 'Get 20 tomato seeds' },
    cornBulk: { name: 'Corn Seeds (Bulk)', emoji: '🌽', cost: 200, description: 'Get 20 corn seeds' }
  }
};

// Research tree
const RESEARCH = {
  irrigation: { name: 'Irrigation System', cost: 5, description: 'Crops grow 20% faster', unlocked: false },
  greenhouse: { name: 'Greenhouse', cost: 8, description: 'Weather has no effect', unlocked: false },
  automation: { name: 'Auto-Harvest', cost: 12, description: 'Crops auto-harvest when ready', unlocked: false },
  genetics: { name: 'Crop Genetics', cost: 15, description: 'All crops worth 50% more', unlocked: false }
};

// Achievements
const ACHIEVEMENTS = {
  firstHarvest: { name: 'First Harvest', description: 'Harvest your first crop', reward: 50, unlocked: false },
  bigSpender: { name: 'Big Spender', description: 'Spend $500 total', reward: 100, unlocked: false },
  levelFive: { name: 'Experienced Farmer', description: 'Reach level 5', reward: 200, unlocked: false },
  levelTen: { name: 'Master Farmer', description: 'Reach level 10', reward: 500, unlocked: false },
  hundredHarvests: { name: 'Master Harvester', description: 'Complete 100 harvests', reward: 500, unlocked: false },
  millionaire: { name: 'Millionaire', description: 'Earn $1000 total', reward: 1000, unlocked: false },
  animalLover: { name: 'Animal Lover', description: 'Own 5 animals', reward: 300, unlocked: false },
  rancher: { name: 'Rancher', description: 'Own 10 animals', reward: 600, unlocked: false },
  architect: { name: 'Architect', description: 'Build 3 different buildings', reward: 400, unlocked: false },
  researcher: { name: 'Researcher', description: 'Unlock all research', reward: 800, unlocked: false },
  tycoon: { name: 'Farm Tycoon', description: 'Have $5000 at once', reward: 2000, unlocked: false }
};

// Farm visitors/NPCs
const VISITORS = [
  { name: 'Merchant Tom', emoji: '👨‍💼', offer: 'buysCrops', bonus: 1.2, description: 'Buys crops at 20% premium' },
  { name: 'Seed Sally', emoji: '👩‍🌾', offer: 'sellsSeeds', bonus: 0.8, description: 'Sells seeds at 20% discount' },
  { name: 'Tool Trader', emoji: '🔧', offer: 'sellsTools', bonus: 0.9, description: 'Discounted tools and supplies' },
  { name: 'Quest Giver', emoji: '📜', offer: 'givesQuest', bonus: 2.0, description: 'Special delivery missions' }
];

export default function SimpleFarmGame() {
  // Core game state
  const [money, setMoney] = useState(100);
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [gameTime, setGameTime] = useState(0);
  const [totalHarvests, setTotalHarvests] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [researchPoints, setResearchPoints] = useState(0);
  
  // Weather and notifications
  const [currentWeather, setCurrentWeather] = useState('sunny');
  const [notifications, setNotifications] = useState([]);
  
  // Farm features
  const [farmSize, setFarmSize] = useState(3);
  const [hasWateringCan, setHasWateringCan] = useState(false);
  const [hasFertilizer, setHasFertilizer] = useState(false);
  
  // New feature states
  const [livestock, setLivestock] = useState({});
  const [buildings, setBuildings] = useState({});
  const [feed, setFeed] = useState({ grain: 0, hay: 0, corn: 0, grass: 0 });
  const [tools, setTools] = useState({ 
    wateringCan: false, 
    fertilizer: false, 
    harvester: false, 
    sprinkler: false
  });
  const [research, setResearch] = useState(RESEARCH);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [activeTab, setActiveTab] = useState('farm');
  const [shopCategory, setShopCategory] = useState('tools');
  
  // Enhanced features
  const [currentSeason, setCurrentSeason] = useState('spring');
  const [seasonTimeLeft, setSeasonTimeLeft] = useState(300); // 5 minutes per season
  const [marketPrices, setMarketPrices] = useState({
    wheat: 1.0, carrot: 1.0, tomato: 1.0, corn: 1.0
  });
  const [activeContracts, setActiveContracts] = useState([]);
  const [completedContracts, setCompletedContracts] = useState([]);
  const [currentVisitor, setCurrentVisitor] = useState(null);
  const [visitorTimeLeft, setVisitorTimeLeft] = useState(0);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState({});
  const [specialSeeds, setSpecialSeeds] = useState({
    tulip: 0, sunflower: 0, pumpkin: 0, pine: 0
  });
  
  // Advanced breeding system
  const [seedQualities, setSeedQualities] = useState({
    wheat: 'bronze', carrot: 'bronze', tomato: 'bronze', corn: 'bronze'
  });
  const [hybridSeeds, setHybridSeeds] = useState({});
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [stormDamage, setStormDamage] = useState({});
  const [protectedPlots, setProtectedPlots] = useState(new Set());
  const [irrigatedPlots, setIrrigatedPlots] = useState(new Set());
  
  // Consumable items inventory
  const [inventory, setInventory] = useState({
    fungicide: 0,
    pesticide: 0
  });
  
  // Seed inventory
  const [seeds, setSeeds] = useState({
    wheat: 5, carrot: 2, tomato: 1, corn: 0
  });

  // Farm plots
  const [plots, setPlots] = useState(() => {
    const initial = {};
    for (let i = 0; i < 9; i++) {
      initial[i] = {
        state: 'empty',
        crop: null,
        plantedAt: 0,
        progress: 0,
        watered: false,
        fertilized: false,
        quality: 1.0,
        seedQuality: 'bronze',
        traits: [],
        weatherDamage: 0,
        diseaseResistance: 1.0
      };
    }
    return initial;
  });

  // Save/Load System
  const saveGame = () => {
    const gameState = {
      money, selectedCrop, gameTime, totalHarvests, totalEarned, totalSpent,
      experience, level, researchPoints, currentWeather, farmSize,
      hasWateringCan, hasFertilizer, livestock, buildings, feed, tools,
      research, achievements, seeds, plots, currentSeason, seasonTimeLeft,
      marketPrices, activeContracts, completedContracts, diseaseOutbreaks, specialSeeds,
      seedQualities, hybridSeeds, weatherForecast, stormDamage, protectedPlots: Array.from(protectedPlots), 
      irrigatedPlots: Array.from(irrigatedPlots), inventory
    };
    
    try {
      localStorage.setItem('farmGameSave', JSON.stringify(gameState));
      addNotification('💾 Game saved successfully!', 'success');
    } catch (error) {
      addNotification('❌ Failed to save game', 'error');
    }
  };

  const loadGame = () => {
    try {
      const savedGame = localStorage.getItem('farmGameSave');
      if (savedGame) {
        const gameState = JSON.parse(savedGame);
        
        // Load all state
        setMoney(gameState.money || 100);
        setSelectedCrop(gameState.selectedCrop || 'wheat');
        setGameTime(gameState.gameTime || 0);
        setTotalHarvests(gameState.totalHarvests || 0);
        setTotalEarned(gameState.totalEarned || 0);
        setTotalSpent(gameState.totalSpent || 0);
        setExperience(gameState.experience || 0);
        setLevel(gameState.level || 1);
        setResearchPoints(gameState.researchPoints || 0);
        setCurrentWeather(gameState.currentWeather || 'sunny');
        setFarmSize(gameState.farmSize || 3);
        setHasWateringCan(gameState.hasWateringCan || false);
        setHasFertilizer(gameState.hasFertilizer || false);
        setLivestock(gameState.livestock || {});
        setBuildings(gameState.buildings || {});
        setFeed(gameState.feed || { grain: 0, hay: 0, corn: 0, grass: 0 });
        setTools(gameState.tools || { wateringCan: false, fertilizer: false, harvester: false, sprinkler: false });
        setResearch(gameState.research || RESEARCH);
        setAchievements(gameState.achievements || ACHIEVEMENTS);
        setSeeds(gameState.seeds || { wheat: 5, carrot: 2, tomato: 1, corn: 0 });
        setPlots(gameState.plots || (() => {
          const initial = {};
          for (let i = 0; i < 9; i++) {
            initial[i] = { state: 'empty', crop: null, plantedAt: 0, progress: 0, watered: false, fertilized: false, quality: 1.0 };
          }
          return initial;
        })());
        setCurrentSeason(gameState.currentSeason || 'spring');
        setSeasonTimeLeft(gameState.seasonTimeLeft || 300);
        setMarketPrices(gameState.marketPrices || { wheat: 1.0, carrot: 1.0, tomato: 1.0, corn: 1.0 });
        setActiveContracts(gameState.activeContracts || []);
        setCompletedContracts(gameState.completedContracts || []);
        setDiseaseOutbreaks(gameState.diseaseOutbreaks || {});
        setSpecialSeeds(gameState.specialSeeds || { tulip: 0, sunflower: 0, pumpkin: 0, pine: 0 });
        setSeedQualities(gameState.seedQualities || { wheat: 'bronze', carrot: 'bronze', tomato: 'bronze', corn: 'bronze' });
        setHybridSeeds(gameState.hybridSeeds || {});
        setWeatherForecast(gameState.weatherForecast || []);
        setStormDamage(gameState.stormDamage || {});
        setProtectedPlots(new Set(gameState.protectedPlots || []));
        setIrrigatedPlots(new Set(gameState.irrigatedPlots || []));
        setInventory(gameState.inventory || { fungicide: 0, pesticide: 0 });
        
        addNotification('📁 Game loaded successfully!', 'success');
        return true;
      }
    } catch (error) {
      addNotification('❌ Failed to load game', 'error');
    }
    return false;
  };

  // Load game on component mount
  useEffect(() => {
    loadGame();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      saveGame();
    }, 30000);
    return () => clearInterval(autoSave);
  }, [money, level, totalHarvests, livestock, buildings]);
  const addNotification = (message, type = 'info') => {
    const notif = { id: Date.now(), message, type };
    setNotifications(prev => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 3000);
  };

  // Enhanced game timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(time => {
        const newTime = time + 1;
        
        // Change weather every 60 seconds
        if (newTime % 60 === 0) {
          const weatherTypes = Object.keys(WEATHER);
          const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
          setCurrentWeather(randomWeather);
        }
        
        // Season progression (5 minutes per season)
        setSeasonTimeLeft(prev => {
          if (prev <= 1) {
            const seasons = Object.keys(SEASONS);
            const currentIndex = seasons.indexOf(currentSeason);
            const nextSeason = seasons[(currentIndex + 1) % seasons.length];
            setCurrentSeason(nextSeason);
            addNotification(`🗓️ ${SEASONS[nextSeason].name} has begun!`, 'season');
            return 300; // Reset to 5 minutes
          }
          return prev - 1;
        });
        
        // Market price fluctuations every 2 minutes
        if (newTime % 120 === 0) {
          setMarketPrices(prev => {
            const newPrices = {};
            Object.keys(prev).forEach(crop => {
              // Prices fluctuate between 0.7x and 1.3x
              const change = (Math.random() - 0.5) * 0.2; // ±10% change
              newPrices[crop] = Math.max(0.7, Math.min(1.3, prev[crop] + change));
            });
            return newPrices;
          });
        }
        
        // Visitor system (every 3-5 minutes)
        if (!currentVisitor && Math.random() < 0.003) { // 0.3% chance per second
          const visitor = VISITORS[Math.floor(Math.random() * VISITORS.length)];
          setCurrentVisitor(visitor);
          setVisitorTimeLeft(120); // 2 minutes to interact
          addNotification(`${visitor.emoji} ${visitor.name} is visiting!`, 'visitor');
        }
        
        // Countdown visitor time
        if (currentVisitor && visitorTimeLeft > 0) {
          setVisitorTimeLeft(prev => {
            if (prev <= 1) {
              setCurrentVisitor(null);
              addNotification('👋 Visitor has left', 'info');
              return 0;
            }
            return prev - 1;
          });
        }
        
        // Random disease outbreaks (rare)
        if (Math.random() < 0.001) { // 0.1% chance per second
          const diseaseTypes = Object.keys(DISEASES);
          const disease = diseaseTypes[Math.floor(Math.random() * diseaseTypes.length)];
          const plotsWithCrops = Object.keys(plots).filter(id => plots[id].state === 'planted');
          
          if (plotsWithCrops.length > 0) {
            const affectedPlot = plotsWithCrops[Math.floor(Math.random() * plotsWithCrops.length)];
            setDiseaseOutbreaks(prev => ({
              ...prev,
              [affectedPlot]: disease
            }));
            addNotification(`${DISEASES[disease].emoji} ${DISEASES[disease].name} outbreak in plot ${parseInt(affectedPlot) + 1}!`, 'error');
          }
        }
        
        // Contract expiration
        setActiveContracts(prev => 
          prev.filter(contract => {
            if (newTime >= contract.deadline) {
              addNotification(`⏰ Contract with ${contract.client} expired!`, 'error');
              return false;
            }
            return true;
          })
        );
        
        // Livestock income generation with enhanced system
        setLivestock(currentLivestock => {
          const updated = { ...currentLivestock };
          let hasIncome = false;
          
          Object.keys(updated).forEach(animalId => {
            const animal = updated[animalId];
            if (newTime - animal.lastFed < LIVESTOCK[animal.type].interval * 2) {
              if (newTime - animal.lastProduced >= LIVESTOCK[animal.type].interval) {
                updated[animalId] = { ...animal, lastProduced: newTime };
                const income = LIVESTOCK[animal.type].income;
                setMoney(prev => prev + income);
                hasIncome = true;
              }
            }
          });
          
          if (hasIncome) {
            addNotification('🐄 Animals produced income!', 'success');
          }
          
          return updated;
        });
        
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSeason, currentVisitor, visitorTimeLeft, plots]);

  // Update crop growth
  useEffect(() => {
    setPlots(currentPlots => {
      const updated = { ...currentPlots };
      let hasChanges = false;
      let autoHarvested = 0;

      Object.keys(updated).forEach(plotId => {
        const plot = updated[plotId];
        if (plot.state === 'planted' && plot.crop) {
          const cropData = CROPS[plot.crop] || SPECIAL_CROPS[plot.crop] || 
            Object.values(HYBRID_COMBINATIONS).find(h => h.result === plot.crop);
          
          // Weather effects with building protection
          let weather = WEATHER[currentWeather];
          if (buildings.advancedGreenhouse || (buildings.greenhouse && research.greenhouse.unlocked)) {
            weather = WEATHER.sunny; // Perfect conditions
          }
          
          const timeGrown = gameTime - plot.plantedAt;
          
          // Base growth multiplier
          let growthMultiplier = weather.growthMultiplier;
          
          // Building bonuses
          if (buildings.advancedGreenhouse) growthMultiplier += 0.3;
          else if (buildings.greenhouse) growthMultiplier += 0.2;
          if (buildings.irrigationSystem || research.irrigation.unlocked) growthMultiplier += 0.2;
          
          // Trait bonuses
          if (plot.traits.includes('fastGrowth')) {
            const bonus = GENETIC_TRAITS.fastGrowth.levels[plot.seedQuality];
            growthMultiplier *= bonus;
          }
          if (plot.traits.includes('droughtTolerance') && currentWeather === 'drought') {
            const bonus = GENETIC_TRAITS.droughtTolerance.levels[plot.seedQuality];
            growthMultiplier *= bonus;
          }
          
          // Standard bonuses
          if (plot.watered) growthMultiplier += 0.2;
          if (plot.fertilized) growthMultiplier += 0.3;
          if (irrigatedPlots.has(parseInt(plotId))) growthMultiplier += 0.15;
          
          // Auto-watering from sprinkler system or irrigation
          if ((tools.sprinkler || buildings.irrigationSystem) && !plot.watered) {
            updated[plotId] = { ...plot, watered: true, quality: Math.min(2.0, plot.quality + 0.3) };
            hasChanges = true;
          }
          
          // Storm damage effects
          if (stormDamage[plotId]) {
            growthMultiplier *= (1 - stormDamage[plotId]);
          }
          
          const adjustedGrowTime = cropData.growTime / growthMultiplier;
          const progress = Math.min(100, (timeGrown / adjustedGrowTime) * 100);
          
          if (progress !== plot.progress) {
            const newState = progress >= 100 ? 'ready' : 'planted';
            updated[plotId] = { ...updated[plotId], progress: progress, state: newState };
            hasChanges = true;
            
            // Auto-harvest if research unlocked OR auto harvester tool
            if (newState === 'ready' && (research.automation.unlocked || tools.harvester)) {
              let earnings = cropData.value * plot.quality;
              
              // Apply trait bonuses
              if (plot.traits.includes('highYield')) {
                const bonus = GENETIC_TRAITS.highYield.levels[plot.seedQuality];
                earnings *= bonus;
              }
              
              earnings = Math.floor(earnings * (research.genetics.unlocked ? 1.5 : 1));
              const xpGain = cropData.value / 5;
              
              setMoney(prev => prev + earnings);
              setTotalEarned(prev => prev + earnings);
              setTotalHarvests(prev => prev + 1);
              setExperience(prev => prev + xpGain);
              setResearchPoints(prev => prev + 1);
              
              updated[plotId] = {
                state: 'empty',
                crop: null,
                plantedAt: 0,
                progress: 0,
                watered: false,
                fertilized: false,
                quality: 1.0,
                seedQuality: 'bronze',
                traits: [],
                weatherDamage: 0,
                diseaseResistance: 1.0
              };
              autoHarvested++;
            }
          }
          
          // Disease check with trait resistance
          if (!diseaseOutbreaks[plotId] && Math.random() < weather.diseaseChance * plot.diseaseResistance) {
            const diseases = Object.keys(DISEASES);
            const disease = diseases[Math.floor(Math.random() * diseases.length)];
            setDiseaseOutbreaks(prev => ({ ...prev, [plotId]: disease }));
            addNotification(`${DISEASES[disease].emoji} ${DISEASES[disease].name} outbreak in plot ${parseInt(plotId) + 1}!`, 'error');
          }
        }
      });

      if (autoHarvested > 0) {
        addNotification(`🤖 Auto-harvested ${autoHarvested} crops!`, 'success');
      }

      return hasChanges ? updated : currentPlots;
    });
  }, [gameTime, currentWeather, research, tools]);

  // Plant crop with genetics
  const plantCrop = (plotId) => {
    const isHybrid = hybridSeeds[selectedCrop] > 0;
    const hasSeeds = isHybrid ? hybridSeeds[selectedCrop] > 0 : seeds[selectedCrop] > 0;
    
    if (hasSeeds && plots[plotId].state === 'empty') {
      // Deduct seeds
      if (isHybrid) {
        setHybridSeeds(prev => ({ ...prev, [selectedCrop]: prev[selectedCrop] - 1 }));
      } else {
        setSeeds(prev => ({ ...prev, [selectedCrop]: prev[selectedCrop] - 1 }));
      }
      
      // Generate traits based on seed quality
      const quality = isHybrid ? 'gold' : seedQualities[selectedCrop] || 'bronze';
      const maxTraits = SEED_QUALITIES[quality].traits;
      const availableTraits = Object.keys(GENETIC_TRAITS);
      const traits = [];
      
      // Add hybrid traits if applicable
      if (isHybrid) {
        const hybridData = Object.values(HYBRID_COMBINATIONS).find(h => h.result === selectedCrop);
        if (hybridData) {
          traits.push(...hybridData.traits);
        }
      } else {
        // Random traits based on quality
        for (let i = 0; i < maxTraits && i < availableTraits.length; i++) {
          if (Math.random() < 0.7) { // 70% chance per trait slot
            const trait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
            if (!traits.includes(trait)) {
              traits.push(trait);
            }
          }
        }
      }
      
      setPlots({
        ...plots,
        [plotId]: {
          state: 'planted',
          crop: selectedCrop,
          plantedAt: gameTime,
          progress: 0,
          watered: false,
          fertilized: false,
          quality: 1.0,
          seedQuality: quality,
          traits: traits,
          weatherDamage: 0,
          diseaseResistance: traits.includes('diseaseResistance') ? 
            GENETIC_TRAITS.diseaseResistance.levels[quality] : 1.0
        }
      });
      
      if (traits.length > 0) {
        addNotification(`🧬 Planted ${selectedCrop} with traits: ${traits.map(t => GENETIC_TRAITS[t].emoji).join('')}`, 'success');
      }
    }
  };

  // Enhanced harvest crop
  const harvestCrop = (plotId) => {
    const plot = plots[plotId];
    if (plot.state === 'ready' && plot.crop) {
      const cropData = CROPS[plot.crop] || SPECIAL_CROPS[plot.crop];
      const baseValue = cropData.value * plot.quality;
      const marketMultiplier = marketPrices[plot.crop] || 1.0;
      const seasonBonus = SEASONS[currentSeason].bonus;
      const diseaseReduction = diseaseOutbreaks[plotId] ? (1 - DISEASES[diseaseOutbreaks[plotId]].damage) : 1.0;
      
      const earnings = Math.floor(baseValue * marketMultiplier * seasonBonus * diseaseReduction * (research.genetics.unlocked ? 1.5 : 1));
      const xpGain = cropData.value / 5;
      
      // Check for contract completion
      const completedContracts = activeContracts.filter(contract => 
        contract.crop === plot.crop && contract.delivered < contract.quantity
      );
      
      if (completedContracts.length > 0) {
        const contract = completedContracts[0];
        contract.delivered = (contract.delivered || 0) + 1;
        
        if (contract.delivered >= contract.quantity) {
          const contractBonus = Math.floor(earnings * contract.bonus);
          setMoney(prev => prev + contractBonus);
          addNotification(`📋 Contract completed! Bonus: $${contractBonus}`, 'success');
          setActiveContracts(prev => prev.filter(c => c.id !== contract.id));
        }
      }
      
      setMoney(money + earnings);
      setTotalEarned(totalEarned + earnings);
      setTotalHarvests(totalHarvests + 1);
      setExperience(prev => prev + xpGain);
      setResearchPoints(prev => prev + 1);
      
      // Level up check
      const newLevel = Math.floor((experience + xpGain) / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setMoney(prev => prev + newLevel * 10);
        addNotification(`🎉 Level Up! You are now level ${newLevel}!`, 'levelup');
      }
      
      if (plot.quality > 1.5) {
        addNotification(`🌟 High quality ${cropData.name} for $${earnings}!`, 'success');
      }
      
      // Clear disease
      if (diseaseOutbreaks[plotId]) {
        setDiseaseOutbreaks(prev => {
          const updated = { ...prev };
          delete updated[plotId];
          return updated;
        });
      }
      
      setPlots({
        ...plots,
        [plotId]: {
          state: 'empty',
          crop: null,
          plantedAt: 0,
          progress: 0,
          watered: false,
          fertilized: false,
          quality: 1.0
        }
      });
      
      checkAchievements();
    }
  };

  // Buy seeds
  const buySeeds = (cropType, quantity = 5) => {
    const cropData = CROPS[cropType];
    const cost = cropData.cost * quantity;
    if (money >= cost) {
      setMoney(money - cost);
      setTotalSpent(prev => prev + cost);
      setSeeds(prev => ({ ...prev, [cropType]: prev[cropType] + quantity }));
      checkAchievements();
    }
  };

  // Expand farm
  const expandFarm = () => {
    const cost = farmSize * 100;
    if (money >= cost && farmSize < 6) {
      setMoney(money - cost);
      const newSize = farmSize + 1;
      setFarmSize(newSize);
      
      setPlots(prev => {
        const newPlots = { ...prev };
        const totalPlots = newSize * newSize;
        for (let i = Object.keys(prev).length; i < totalPlots; i++) {
          newPlots[i] = {
            state: 'empty',
            crop: null,
            plantedAt: 0,
            progress: 0,
            watered: false,
            fertilized: false,
            quality: 1.0
          };
        }
        return newPlots;
      });
      
      addNotification(`🏗️ Farm expanded to ${newSize}x${newSize}!`, 'expansion');
    }
  };

  // Water plot
  const waterPlot = (plotId) => {
    if (!hasWateringCan) return;
    
    const plot = plots[plotId];
    if (plot && plot.state === 'planted' && !plot.watered) {
      setPlots(prev => ({
        ...prev,
        [plotId]: {
          ...prev[plotId],
          watered: true,
          quality: Math.min(2.0, prev[plotId].quality + 0.3)
        }
      }));
      addNotification('💧 Crop watered!', 'info');
    }
  };

  // Fertilize plot
  const fertilizePlot = (plotId) => {
    if (!hasFertilizer) return;
    
    const plot = plots[plotId];
    if (plot && plot.state === 'planted' && !plot.fertilized) {
      setPlots(prev => ({
        ...prev,
        [plotId]: {
          ...prev[plotId],
          fertilized: true,
          quality: Math.min(2.0, prev[plotId].quality + 0.5)
        }
      }));
      addNotification('🌿 Crop fertilized!', 'info');
    }
  };

  // Buy tools
  const buyTool = (tool) => {
    const costs = { wateringCan: 200, fertilizer: 350 };
    
    if (money >= costs[tool]) {
      setMoney(money - costs[tool]);
      setTotalSpent(prev => prev + costs[tool]);
      if (tool === 'wateringCan') {
        setHasWateringCan(true);
        addNotification('🪣 Watering Can purchased!', 'purchase');
      } else if (tool === 'fertilizer') {
        setHasFertilizer(true);
        addNotification('🌿 Fertilizer purchased!', 'purchase');
      }
      checkAchievements();
    }
  };

  // Livestock functions
  const buyAnimal = (animalType) => {
    const animalData = LIVESTOCK[animalType];
    const requiredHousing = animalData.housing;
    
    // Check if player has required building
    if (!buildings[requiredHousing]) {
      addNotification(`Need ${BUILDINGS[requiredHousing].name} first!`, 'error');
      return;
    }
    
    // Check building capacity
    const animalsInBuilding = Object.values(livestock).filter(
      animal => LIVESTOCK[animal.type].housing === requiredHousing
    ).length;
    
    if (animalsInBuilding >= BUILDINGS[requiredHousing].capacity) {
      addNotification(`${BUILDINGS[requiredHousing].name} is full!`, 'error');
      return;
    }
    
    if (money >= animalData.cost) {
      setMoney(money - animalData.cost);
      setTotalSpent(prev => prev + animalData.cost);
      
      const animalId = Date.now().toString();
      setLivestock(prev => ({
        ...prev,
        [animalId]: {
          type: animalType,
          lastFed: gameTime,
          lastProduced: gameTime,
          happiness: 100,
          building: requiredHousing
        }
      }));
      
      addNotification(`${animalData.emoji} ${animalData.name} purchased!`, 'purchase');
      checkAchievements();
    }
  };

  const feedAnimal = (animalId) => {
    const animal = livestock[animalId];
    const animalData = LIVESTOCK[animal.type];
    const feedType = animalData.food;
    
    if (animal && feed[feedType] > 0 && gameTime - animal.lastFed >= 30) {
      setFeed(prev => ({ ...prev, [feedType]: prev[feedType] - 1 }));
      setLivestock(prev => ({
        ...prev,
        [animalId]: {
          ...prev[animalId],
          lastFed: gameTime,
          happiness: Math.min(100, prev[animalId].happiness + 20)
        }
      }));
      addNotification(`🌾 ${animalData.name} fed!`, 'info');
    } else if (feed[feedType] === 0) {
      addNotification(`No ${feedType} left! Buy more from shop.`, 'error');
    }
  };

  // Building functions
  const buyBuilding = (buildingType) => {
    const buildingData = BUILDINGS[buildingType];
    if (money >= buildingData.cost && !buildings[buildingType]) {
      setMoney(money - buildingData.cost);
      setTotalSpent(prev => prev + buildingData.cost);
      setBuildings(prev => ({
        ...prev,
        [buildingType]: {
          built: true,
          level: 1,
          builtAt: gameTime
        }
      }));
      addNotification(`�️ ${buildingData.name} built!`, 'purchase');
      checkAchievements();
    }
  };

  // Enhanced shop function to handle disease treatments
  const buyShopItem = (category, itemId) => {
    const item = SHOP_ITEMS[category][itemId];
    
    if (money >= item.cost) {
      setMoney(money - item.cost);
      setTotalSpent(prev => prev + item.cost);
      
      if (category === 'tools') {
        // Handle consumable items (fungicide, pesticide)
        if (itemId === 'fungicide' || itemId === 'pesticide') {
          setInventory(prev => ({
            ...prev,
            [itemId]: prev[itemId] + 3 // Add 3 uses per purchase
          }));
        } else {
          // Handle permanent tools (watering can, harvester, etc.)
          setTools(prev => ({ ...prev, [itemId]: true }));
          if (itemId === 'wateringCan') setHasWateringCan(true);
          if (itemId === 'fertilizer') setHasFertilizer(true);
        }
      } else if (category === 'feed') {
        const feedType = itemId.replace('Feed', '').replace('Bales', '').replace('Pellets', '').toLowerCase();
        setFeed(prev => ({ ...prev, [feedType]: prev[feedType] + 10 }));
      } else if (category === 'seeds') {
        const seedType = itemId.replace('Bulk', '').toLowerCase();
        setSeeds(prev => ({ ...prev, [seedType]: prev[seedType] + 20 }));
      }
      
      const purchaseMsg = (itemId === 'fungicide' || itemId === 'pesticide') 
        ? `${item.emoji} ${item.name} purchased! (+3 uses)`
        : `${item.emoji} ${item.name} purchased!`;
      addNotification(purchaseMsg, 'purchase');
      checkAchievements();
    }
  };

  // Treat disease function
  const treatDisease = (plotId) => {
    const disease = diseaseOutbreaks[plotId];
    const treatment = DISEASES[disease].treatment;
    
    // Check if it's a consumable item (fungicide, pesticide)
    if (treatment === 'fungicide' || treatment === 'pesticide') {
      if (inventory[treatment] > 0) {
        // Consume one use of the treatment
        setInventory(prev => ({
          ...prev,
          [treatment]: prev[treatment] - 1
        }));
        setDiseaseOutbreaks(prev => {
          const updated = { ...prev };
          delete updated[plotId];
          return updated;
        });
        addNotification(`💊 ${DISEASES[disease].name} treated successfully! (${inventory[treatment] - 1} ${treatment} remaining)`, 'success');
      } else {
        addNotification(`❌ Need ${treatment} to treat this disease! Buy from shop.`, 'error');
      }
    } else if (tools[treatment]) {
      // Handle permanent tools (like fertilizer for drought)
      setDiseaseOutbreaks(prev => {
        const updated = { ...prev };
        delete updated[plotId];
        return updated;
      });
      addNotification(`💊 ${DISEASES[disease].name} treated successfully!`, 'success');
    } else {
      addNotification(`❌ Need ${treatment} to treat this disease!`, 'error');
    }
  };

  // Visitor interaction
  const interactWithVisitor = () => {
    if (!currentVisitor) return;
    
    const visitor = currentVisitor;
    
    if (visitor.offer === 'buysCrops') {
      // Sell all ready crops at premium
      let totalSold = 0;
      Object.entries(plots).forEach(([plotId, plot]) => {
        if (plot.state === 'ready') {
          const cropData = CROPS[plot.crop] || SPECIAL_CROPS[plot.crop];
          const earnings = Math.floor(cropData.value * plot.quality * visitor.bonus);
          setMoney(prev => prev + earnings);
          totalSold += earnings;
          
          setPlots(prev => ({
            ...prev,
            [plotId]: {
              state: 'empty', crop: null, plantedAt: 0, progress: 0,
              watered: false, fertilized: false, quality: 1.0
            }
          }));
        }
      });
      
      if (totalSold > 0) {
        addNotification(`${visitor.emoji} Sold crops for $${totalSold}!`, 'success');
      } else {
        addNotification('❌ No crops ready to sell!', 'error');
      }
    } else if (visitor.offer === 'sellsSeeds') {
      // Get discount on next seed purchase
      addNotification(`${visitor.emoji} Seed discount active for 60 seconds!`, 'success');
    } else if (visitor.offer === 'givesQuest') {
      // Generate a new contract
      generateContract();
    }
    
    setCurrentVisitor(null);
    setVisitorTimeLeft(0);
  };

  // Generate new contract
  const generateContract = () => {
    const template = CONTRACT_TEMPLATES[Math.floor(Math.random() * CONTRACT_TEMPLATES.length)];
    const contract = {
      id: Date.now(),
      ...template,
      deadline: gameTime + template.time,
      delivered: 0
    };
    
    setActiveContracts(prev => [...prev, contract]);
    addNotification(`📋 New contract: Deliver ${contract.quantity} ${contract.crop} to ${contract.client}!`, 'contract');
  };

  // Advanced breeding system functions
  const breedCrops = (crop1, crop2) => {
    if (!buildings.breedingLab) {
      addNotification('❌ Need Breeding Laboratory to crossbreed crops!', 'error');
      return;
    }

    const combination = `${crop1}+${crop2}`;
    const reverseCombo = `${crop2}+${crop1}`;
    const hybrid = HYBRID_COMBINATIONS[combination] || HYBRID_COMBINATIONS[reverseCombo];
    
    if (hybrid && seeds[crop1] >= 5 && seeds[crop2] >= 5) {
      setSeeds(prev => ({
        ...prev,
        [crop1]: prev[crop1] - 5,
        [crop2]: prev[crop2] - 5
      }));
      
      setHybridSeeds(prev => ({
        ...prev,
        [hybrid.result]: (prev[hybrid.result] || 0) + 3
      }));
      
      addNotification(`🧬 Created ${hybrid.name} hybrid seeds!`, 'success');
      addExperience(50);
    } else {
      addNotification('❌ Need 5 seeds of each type or invalid combination!', 'error');
    }
  };

  // Upgrade seed quality
  const upgradeSeedQuality = (crop) => {
    if (!buildings.seedProcessor) {
      addNotification('❌ Need Seed Processor to upgrade seed quality!', 'error');
      return;
    }

    const currentQuality = seedQualities[crop];
    const qualityLevels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = qualityLevels.indexOf(currentQuality);
    
    if (currentIndex < qualityLevels.length - 1) {
      const nextQuality = qualityLevels[currentIndex + 1];
      const cost = (currentIndex + 2) * 500; // 1000, 1500, 2000
      
      if (money >= cost && seeds[crop] >= 10) {
        setMoney(prev => prev - cost);
        setSeeds(prev => ({ ...prev, [crop]: prev[crop] - 10 }));
        setSeedQualities(prev => ({ ...prev, [crop]: nextQuality }));
        
        addNotification(`⭐ Upgraded ${crop} seeds to ${nextQuality} quality!`, 'success');
      } else {
        addNotification(`❌ Need $${cost} and 10 ${crop} seeds!`, 'error');
      }
    } else {
      addNotification('✨ Seeds already at maximum quality!', 'info');
    }
  };

  // Weather forecast (if weather station built)
  const generateWeatherForecast = () => {
    if (!buildings.weatherStation) return [];
    
    const forecast = [];
    const weatherTypes = Object.keys(WEATHER);
    
    for (let i = 0; i < 5; i++) {
      forecast.push({
        day: i + 1,
        weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
        severity: Math.random()
      });
    }
    
    return forecast;
  };

  // Storm damage calculation
  const applyStormDamage = () => {
    const weather = WEATHER[currentWeather];
    if (weather.stormChance > 0 && Math.random() < weather.stormChance) {
      const newStormDamage = {};
      
      Object.entries(plots).forEach(([plotId, plot]) => {
        if (plot.state === 'planted' && !protectedPlots.has(parseInt(plotId))) {
          // Check weather resistance trait
          const hasWeatherResistance = plot.traits.includes('weatherResistance');
          const resistance = hasWeatherResistance ? 
            GENETIC_TRAITS.weatherResistance.levels[plot.seedQuality] : 1.0;
          
          if (Math.random() < weather.stormChance * resistance) {
            const damage = 0.2 + Math.random() * 0.3; // 20-50% damage
            newStormDamage[plotId] = damage;
          }
        }
      });
      
      if (Object.keys(newStormDamage).length > 0) {
        setStormDamage(prev => ({ ...prev, ...newStormDamage }));
        addNotification(`⛈️ Storm damaged ${Object.keys(newStormDamage).length} crops!`, 'error');
        
        if (buildings.weatherStation) {
          addNotification('📡 Weather station detected the storm!', 'info');
        }
      }
    }
  };

  // Building effect functions
  const buyAdvancedBuilding = (buildingId) => {
    const building = BUILDINGS[buildingId];
    if (money >= building.cost && !buildings[buildingId]) {
      setMoney(money - building.cost);
      setBuildings(prev => ({ ...prev, [buildingId]: true }));
      
      // Apply immediate effects
      if (buildingId === 'advancedGreenhouse' || buildingId === 'greenhouse') {
        // Protect all plots
        const allPlots = new Set(Object.keys(plots).map(id => parseInt(id)));
        setProtectedPlots(allPlots);
        addNotification('🏠 All crops now protected from weather!', 'success');
      }
      
      if (buildingId === 'irrigationSystem') {
        // Auto-irrigate all plots
        const allPlots = new Set(Object.keys(plots).map(id => parseInt(id)));
        setIrrigatedPlots(allPlots);
        addNotification('💧 Irrigation system covering all plots!', 'success');
      }
      
      if (buildingId === 'weatherStation') {
        const forecast = generateWeatherForecast();
        setWeatherForecast(forecast);
        addNotification('📡 Weather station providing 5-day forecast!', 'success');
      }
      
      addNotification(`${building.emoji} ${building.name} constructed!`, 'purchase');
      checkAchievements();
    }
  };

  // Check if player has ready crops of specific type
  const hasReadyCrops = (cropType) => {
    return Object.values(plots).some(plot => 
      plot.state === 'ready' && plot.crop === cropType
    );
  };

  // Deliver crops to contract
  const deliverToContract = (contractId) => {
    const contract = activeContracts.find(c => c.id === contractId);
    if (!contract) return;

    let delivered = 0;
    const updatedPlots = { ...plots };
    
    // Find and harvest matching crops
    Object.entries(plots).forEach(([plotId, plot]) => {
      if (plot.state === 'ready' && plot.crop === contract.crop && delivered < (contract.quantity - contract.delivered)) {
        delivered++;
        updatedPlots[plotId] = {
          state: 'empty', crop: null, plantedAt: 0, progress: 0,
          watered: false, fertilized: false, quality: 1.0
        };
      }
    });

    if (delivered > 0) {
      setPlots(updatedPlots);
      
      const updatedContract = {
        ...contract,
        delivered: contract.delivered + delivered
      };

      if (updatedContract.delivered >= updatedContract.quantity) {
        // Contract completed
        setActiveContracts(prev => prev.filter(c => c.id !== contractId));
        setCompletedContracts(prev => [...prev, updatedContract]);
        setMoney(prev => prev + updatedContract.reward);
        addNotification(`✅ Contract completed! Earned $${updatedContract.reward}`, 'success');
      } else {
        // Update progress
        setActiveContracts(prev => prev.map(c => 
          c.id === contractId ? updatedContract : c
        ));
        addNotification(`📦 Delivered ${delivered} ${contract.crop}`, 'success');
      }
    } else {
      addNotification(`❌ No ready ${contract.crop} crops to deliver!`, 'error');
    }
  };

  // Cancel contract
  const cancelContract = (contractId) => {
    setActiveContracts(prev => prev.filter(c => c.id !== contractId));
    addNotification('❌ Contract cancelled', 'error');
  };

  // Research functions
  const buyResearch = (researchId) => {
    const researchData = research[researchId];
    if (researchPoints >= researchData.cost && !researchData.unlocked) {
      setResearchPoints(prev => prev - researchData.cost);
      setResearch(prev => ({
        ...prev,
        [researchId]: { ...prev[researchId], unlocked: true }
      }));
      addNotification(`🔬 ${researchData.name} unlocked!`, 'research');
    }
  };

  // Achievement checking
  const checkAchievements = () => {
    const updates = {};
    let newAchievements = false;

    // Check each achievement
    if (!achievements.firstHarvest.unlocked && totalHarvests >= 1) {
      updates.firstHarvest = { ...achievements.firstHarvest, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.bigSpender.unlocked && totalSpent >= 500) {
      updates.bigSpender = { ...achievements.bigSpender, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.levelFive.unlocked && level >= 5) {
      updates.levelFive = { ...achievements.levelFive, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.levelTen.unlocked && level >= 10) {
      updates.levelTen = { ...achievements.levelTen, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.hundredHarvests.unlocked && totalHarvests >= 100) {
      updates.hundredHarvests = { ...achievements.hundredHarvests, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.millionaire.unlocked && totalEarned >= 1000) {
      updates.millionaire = { ...achievements.millionaire, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.animalLover.unlocked && Object.keys(livestock).length >= 5) {
      updates.animalLover = { ...achievements.animalLover, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.rancher.unlocked && Object.keys(livestock).length >= 10) {
      updates.rancher = { ...achievements.rancher, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.architect.unlocked && Object.keys(buildings).length >= 3) {
      updates.architect = { ...achievements.architect, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.researcher.unlocked && Object.values(research).every(r => r.unlocked)) {
      updates.researcher = { ...achievements.researcher, unlocked: true };
      newAchievements = true;
    }
    
    if (!achievements.tycoon.unlocked && money >= 5000) {
      updates.tycoon = { ...achievements.tycoon, unlocked: true };
      newAchievements = true;
    }

    if (newAchievements) {
      setAchievements(prev => ({ ...prev, ...updates }));
      
      // Award money for achievements
      Object.values(updates).forEach(achievement => {
        setMoney(prev => prev + achievement.reward);
        addNotification(`🏆 Achievement: ${achievement.name}! +$${achievement.reward}`, 'achievement');
      });
    }
  };

  // Run achievement checks periodically
  useEffect(() => {
    checkAchievements();
  }, [money, level, totalHarvests, totalEarned, totalSpent, livestock, buildings, research]);

  // Display helpers
  const getPlotDisplay = (plot) => {
    if (plot.state === 'empty') return '🟫';
    if (plot.state === 'planted') {
      if (plot.progress < 33) return '🌱';
      if (plot.progress < 66) return '🌿';
      return '🌾';
    }
    if (plot.state === 'ready') return CROPS[plot.crop].emoji;
  };

  const getQualityColor = (quality) => {
    if (quality >= 1.8) return 'border-purple-400 bg-purple-50';
    if (quality >= 1.5) return 'border-yellow-400 bg-yellow-50';
    if (quality >= 1.2) return 'border-green-400 bg-green-50';
    return 'border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`px-4 py-2 rounded-lg shadow-lg max-w-sm animate-bounce ${
                notif.type === 'levelup' ? 'bg-purple-100 border-2 border-purple-400 text-purple-800' :
                notif.type === 'achievement' ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-800' :
                notif.type === 'research' ? 'bg-blue-100 border-2 border-blue-400 text-blue-800' :
                notif.type === 'success' ? 'bg-green-100 border-2 border-green-400 text-green-800' :
                notif.type === 'error' ? 'bg-red-100 border-2 border-red-400 text-red-800' :
                'bg-blue-100 border-2 border-blue-400 text-blue-800'
              }`}
            >
              {notif.message}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-green-800">🚜 Enhanced Farm Game</h1>
              <div className="flex gap-2">
                <button
                  onClick={saveGame}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 touch-manipulation"
                >
                  � Save
                </button>
                <button
                  onClick={loadGame}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 touch-manipulation"
                >
                  📂 Load
                </button>
              </div>
            </div>
            
            {/* Weather Display */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 md:px-4 py-2 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">{WEATHER[currentWeather].emoji}</span>
                <div>
                  <div className="font-semibold text-blue-800 text-sm md:text-base">{WEATHER[currentWeather].name}</div>
                  <div className="text-xs text-blue-600 hidden md:block">{WEATHER[currentWeather].description}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 text-sm md:text-base">
            <div className="bg-yellow-100 px-2 md:px-4 py-2 rounded-lg text-center">
              <div className="text-base md:text-lg font-bold">${money}</div>
              <div className="text-xs md:text-sm text-gray-600">Money</div>
            </div>
            <div className="bg-blue-100 px-2 md:px-4 py-2 rounded-lg text-center">
              <div className="text-base md:text-lg font-bold">Lv.{level}</div>
              <div className="text-xs md:text-sm text-gray-600">Level</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${((experience % 100) / 100) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-purple-100 px-2 md:px-4 py-2 rounded-lg text-center">
              <div className="text-base md:text-lg font-bold">{Math.floor(experience)}</div>
              <div className="text-xs md:text-sm text-gray-600">XP</div>
            </div>
            <div className="bg-cyan-100 px-2 md:px-4 py-2 rounded-lg text-center">
              <div className="text-base md:text-lg font-bold">{researchPoints}</div>
              <div className="text-xs md:text-sm text-gray-600">Research</div>
            </div>
            <div className="bg-green-100 px-2 md:px-4 py-2 rounded-lg text-center">
              <div className="text-lg font-bold">{totalHarvests}</div>
              <div className="text-sm text-gray-600">Harvests</div>
            </div>
            <div className="bg-orange-100 px-4 py-2 rounded-lg text-center">
              <div className="text-lg font-bold">{Object.keys(livestock).length}</div>
              <div className="text-sm text-gray-600">Animals</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex overflow-x-auto border-b">
            {[
              { id: 'farm', name: '🚜 Farm', icon: '🌱' },
              { id: 'shop', name: '🏪 Shop', icon: '🛒' },
              { id: 'livestock', name: '🐄 Livestock', icon: '🐔' },
              { id: 'buildings', name: '🏗️ Buildings', icon: '🏠' },
              { id: 'contracts', name: '📋 Contracts', icon: '📄' },
              { id: 'breeding', name: '🧬 Genetics', icon: '🔬' },
              { id: 'research', name: '🔬 Research', icon: '⚗️' },
              { id: 'achievements', name: '🏆 Achievements', icon: '🎯' },
              { id: 'stats', name: '📊 Stats', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 md:px-4 py-3 text-center font-medium transition-colors touch-manipulation ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <span className="text-lg md:text-xl block md:mr-2">{tab.icon}</span>
                <span className="text-xs md:text-sm">{tab.name.split(' ')[1] || tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Farm Tab */}
        {activeTab === 'farm' && (
          <>
            {/* Current Visitor */}
            {currentVisitor && (
              <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 mb-6">
                <h3 className="font-bold text-lg mb-2">{currentVisitor.emoji} {currentVisitor.name} is visiting!</h3>
                <p className="text-sm mb-3">{currentVisitor.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Leaves in {Math.ceil(visitorTimeLeft / 1000)}s
                  </span>
                  <button
                    onClick={interactWithVisitor}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Interact
                  </button>
                </div>
              </div>
            )}

            {/* Disease Alert */}
            {Object.keys(diseaseOutbreaks).length > 0 && (
              <div className="bg-red-100 p-4 rounded-lg border border-red-300 mb-6">
                <h3 className="font-bold text-lg mb-2">🦠 Disease Outbreak!</h3>
                <div className="space-y-2">
                  {Object.entries(diseaseOutbreaks).map(([plotId, disease]) => (
                    <div key={plotId} className="flex justify-between items-center">
                      <span>Plot {plotId}: {DISEASES[disease].name}</span>
                      <button
                        onClick={() => treatDisease(plotId)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Treat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crop Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">Select Crop to Plant</h2>
              
              {/* Regular Crops */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
                {Object.entries(CROPS).map(([key, crop]) => {
                  const marketMultiplier = marketPrices[key] || 1.0;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCrop(key)}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all touch-manipulation ${
                        selectedCrop === key
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      } ${seeds[key] === 0 ? 'opacity-50' : ''}`}
                    >
                      <div className="text-2xl md:text-3xl mb-2">{crop.emoji}</div>
                      <div className="font-semibold text-sm md:text-base">{crop.name}</div>
                      <div className="text-xs md:text-sm text-gray-600">Seeds: {seeds[key]}</div>
                      <div className={`text-xs md:text-sm ${marketMultiplier > 1.0 ? 'text-green-600' : marketMultiplier < 1.0 ? 'text-red-600' : 'text-gray-600'}`}>
                        Sell: ${Math.floor((research.genetics.unlocked ? crop.value * 1.5 : crop.value) * marketMultiplier)}
                        {marketMultiplier !== 1.0 && (
                          <span className="ml-1">({marketMultiplier > 1.0 ? '+' : ''}{Math.round((marketMultiplier - 1) * 100)}%)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{crop.growTime}s to grow</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          buySeeds(key);
                        }}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 touch-manipulation"
                        disabled={money < crop.cost * 5}
                      >
                        Buy 5 (${crop.cost * 5})
                      </button>
                    </button>
                  );
                })}
              </div>

              {/* Seasonal Special Crops */}
              {currentSeason && currentSeason.specialCrops && currentSeason.specialCrops.length > 0 && (
                <div>
                  <h3 className="text-md font-bold mb-2 text-purple-700">🌟 {currentSeason.name} Special Crops</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    {currentSeason.specialCrops.map(cropKey => {
                      const crop = SPECIAL_CROPS[cropKey];
                      if (!crop) return null;
                      return (
                        <button
                          key={cropKey}
                          onClick={() => setSelectedCrop(cropKey)}
                          className={`p-3 md:p-4 rounded-lg border-2 transition-all border-purple-300 bg-purple-50 touch-manipulation ${
                            selectedCrop === cropKey ? 'border-purple-500 bg-purple-100' : 'hover:border-purple-400'
                          } ${seeds[cropKey] === 0 ? 'opacity-50' : ''}`}
                        >
                          <div className="text-2xl md:text-3xl mb-2">{crop.emoji}</div>
                          <div className="font-semibold text-sm md:text-base text-purple-800">{crop.name}</div>
                          <div className="text-xs md:text-sm text-purple-600">Seeds: {seeds[cropKey] || 0}</div>
                          <div className="text-xs md:text-sm text-purple-700">Sell: ${crop.value}</div>
                          <div className="text-xs text-purple-500">{crop.growTime}s to grow</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              buySeeds(cropKey);
                            }}
                            className="mt-2 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 touch-manipulation"
                            disabled={money < crop.cost * 5}
                          >
                            Buy 5 (${crop.cost * 5})
                          </button>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Farm Grid */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Farm ({farmSize}x{farmSize})</h2>
                {farmSize < 6 && (
                  <button
                    onClick={expandFarm}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    disabled={money < farmSize * 100}
                  >
                    🏗️ Expand (${farmSize * 100})
                  </button>
                )}
              </div>
              <div className="grid gap-1 md:gap-2 max-w-3xl mx-auto" style={{ gridTemplateColumns: `repeat(${farmSize}, 1fr)` }}>
                {Object.entries(plots).map(([plotId, plot]) => {
                  const isDisease = diseaseOutbreaks[plotId];
                  const marketMultiplier = marketPrices[plot.crop] || 1.0;
                  const isProtected = protectedPlots.has(parseInt(plotId));
                  const isIrrigated = irrigatedPlots.has(parseInt(plotId));
                  const hasStormDamage = stormDamage[plotId] > 0;
                  
                  return (
                    <button
                      key={plotId}
                      onClick={() => {
                        if (isDisease) {
                          treatDisease(plotId);
                        } else if (plot.state === 'empty') {
                          plantCrop(Number(plotId));
                        } else if (plot.state === 'ready') {
                          harvestCrop(Number(plotId));
                        } else if (plot.state === 'planted') {
                          if (hasWateringCan && !plot.watered) waterPlot(Number(plotId));
                          else if (hasFertilizer && !plot.fertilized) fertilizePlot(Number(plotId));
                        }
                      }}
                      className={`w-12 h-12 md:w-16 md:h-16 border-2 rounded-lg flex flex-col items-center justify-center text-sm md:text-xl hover:border-green-400 transition-colors relative touch-manipulation ${
                        isDisease ? 'border-red-500 bg-red-50 animate-pulse' :
                        hasStormDamage ? 'border-orange-500 bg-orange-50' :
                        isProtected ? 'border-blue-300 bg-blue-50' :
                        plot.seedQuality === 'platinum' ? 'border-purple-400 bg-purple-50' :
                        plot.seedQuality === 'gold' ? 'border-yellow-400 bg-yellow-50' :
                        plot.seedQuality === 'silver' ? 'border-gray-400 bg-gray-50' :
                        getQualityColor(plot.quality)
                      }`}
                    >
                      {isDisease ? '🦠' : getPlotDisplay(plot)}
                      
                      {/* Genetic trait indicators */}
                      {!isDisease && plot.traits && plot.traits.length > 0 && plot.state !== 'empty' && (
                        <div className="absolute top-0 left-0 flex text-xs">
                          {plot.traits.slice(0, 2).map((trait, index) => (
                            <span key={trait} className="text-xs" style={{ marginLeft: `${index * 8}px` }}>
                              {GENETIC_TRAITS[trait]?.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Seed quality indicator */}
                      {!isDisease && plot.seedQuality && plot.seedQuality !== 'bronze' && plot.state !== 'empty' && (
                        <div className="absolute top-0 right-0 text-xs">
                          {SEED_QUALITIES[plot.seedQuality]?.emoji}
                        </div>
                      )}
                      
                      {/* Building effects */}
                      {isProtected && <div className="absolute top-0 left-0 text-xs">🛡️</div>}
                      {isIrrigated && <div className="absolute top-0 left-0 text-xs">💧</div>}
                      
                      {!isDisease && plot.watered && !isIrrigated && <div className="absolute top-0 left-0 text-xs">💧</div>}
                      {!isDisease && plot.fertilized && <div className="absolute bottom-0 left-0 text-xs">🌿</div>}
                      {!isDisease && tools.sprinkler && plot.state === 'planted' && (
                        <div className="absolute top-0 left-1 text-xs">💦</div>
                      )}
                      
                      {/* Quality and value indicators */}
                      {!isDisease && plot.quality > 1.0 && plot.state === 'ready' && (
                        <div className="absolute bottom-0 right-0 text-xs bg-yellow-200 px-1 rounded">
                          {plot.quality.toFixed(1)}x
                        </div>
                      )}
                      
                      {!isDisease && plot.state === 'ready' && marketMultiplier !== 1.0 && (
                        <div className={`absolute top-0 left-0 right-0 text-xs px-1 ${marketMultiplier > 1.0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                          {marketMultiplier > 1.0 ? '📈' : '📉'}
                        </div>
                      )}
                      
                      {/* Storm damage indicator */}
                      {hasStormDamage && (
                        <div className="absolute top-0 right-0 text-xs bg-orange-200 text-orange-800 px-1 rounded">
                          ⛈️
                        </div>
                      )}
                      
                      {/* Growth progress */}
                      {!isDisease && plot.state === 'planted' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b">
                          <div 
                            className="h-full bg-green-500 rounded-b transition-all duration-1000"
                            style={{ width: `${plot.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {isDisease && (
                        <div className="absolute bottom-0 left-0 right-0 text-xs bg-red-200 text-red-800 px-1 rounded-b">
                          {DISEASES[isDisease].name.substring(0, 8)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 md:mt-6 text-center text-gray-600 text-sm">
                <p>💡 Click empty plots to plant • Click ready crops to harvest • Click diseased plots to treat</p>
                {(hasWateringCan || hasFertilizer) && !tools.sprinkler && (
                  <p className="text-xs md:text-sm mt-1">🔧 Click planted crops to use tools</p>
                )}
                {tools.sprinkler && (
                  <p className="text-xs md:text-sm mt-1 text-blue-600">💦 Sprinkler system auto-watering crops!</p>
                )}
                {(tools.harvester || research.automation.unlocked) && (
                  <p className="text-xs md:text-sm mt-1 text-green-600">🤖 Auto-harvest enabled!</p>
                )}
                <p className="text-xs md:text-sm mt-2">
                  Selected: {(CROPS[selectedCrop] || SPECIAL_CROPS[selectedCrop])?.emoji} {(CROPS[selectedCrop] || SPECIAL_CROPS[selectedCrop])?.name} (Seeds: {seeds[selectedCrop] || 0})
                </p>
                {Object.keys(diseaseOutbreaks).length > 0 && (
                  <p className="text-xs md:text-sm mt-1 text-red-600">🦠 {Object.keys(diseaseOutbreaks).length} active disease(s) - Click diseased plots to treat</p>
                )}
                {currentSeason && (
                  <p className="text-xs md:text-sm mt-1 text-purple-600">
                    📅 {currentSeason.name}: {currentSeason.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tools Shop */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🛠️ Tools & Upgrades</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!hasWateringCan && (
                  <div className="p-4 border-2 border-blue-200 rounded-lg">
                    <div className="text-2xl mb-2">🪣</div>
                    <div className="font-semibold">Watering Can</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Water crops to boost quality (+0.3x) and growth speed
                    </div>
                    <button
                      onClick={() => buyTool('wateringCan')}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={money < 200}
                    >
                      Buy for $200
                    </button>
                  </div>
                )}
                
                {!hasFertilizer && (
                  <div className="p-4 border-2 border-green-200 rounded-lg">
                    <div className="text-2xl mb-2">🌿</div>
                    <div className="font-semibold">Premium Fertilizer</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Fertilize crops for major quality boost (+0.5x)
                    </div>
                    <button
                      onClick={() => buyTool('fertilizer')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      disabled={money < 350}
                    >
                      Buy for $350
                    </button>
                  </div>
                )}
                
                {hasWateringCan && hasFertilizer && (
                  <div className="col-span-full text-center p-8 bg-green-50 rounded-lg">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="font-semibold text-green-800">All tools unlocked!</div>
                    <div className="text-sm text-green-600">You're now a master farmer!</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏪 General Store</h2>
            
            {/* Shop Categories */}
            <div className="flex mb-6 border-b">
              {[
                { id: 'tools', name: '🛠️ Tools', count: Object.keys(SHOP_ITEMS.tools).length },
                { id: 'feed', name: '🌾 Feed', count: Object.keys(SHOP_ITEMS.feed).length },
                { id: 'seeds', name: '🌱 Seeds', count: Object.keys(SHOP_ITEMS.seeds).length }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setShopCategory(cat.id)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    shopCategory === cat.id
                      ? 'text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Current Feed Inventory */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">📦 Your Inventory</h3>
              <div className="flex gap-4 text-sm">
                <div>🌾 Grain: {feed.grain}</div>
                <div>🟫 Hay: {feed.hay}</div>
                <div>🌽 Corn: {feed.corn}</div>
                <div>🟢 Grass: {feed.grass}</div>
                <div>🧪 Fungicide: {inventory.fungicide}</div>
                <div>🦟 Pesticide: {inventory.pesticide}</div>
              </div>
            </div>

            {/* Shop Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(SHOP_ITEMS[shopCategory]).map(([itemId, item]) => {
                // Handle different ownership logic for consumables vs permanent tools
                const isConsumable = itemId === 'fungicide' || itemId === 'pesticide';
                const owned = shopCategory === 'tools' && !isConsumable && tools[itemId];
                
                return (
                  <div key={itemId} className={`p-4 border-2 rounded-lg ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-2xl mb-1">{item.emoji}</div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                        {isConsumable && (
                          <div className="text-xs text-blue-600 mt-1">
                            In stock: {inventory[itemId]} uses
                          </div>
                        )}
                      </div>
                      {owned && <div className="text-green-500 text-xl">✅</div>}
                    </div>
                    <div className="mt-3">
                      <div className="text-lg font-bold text-green-600 mb-2">
                        ${item.cost}
                        {isConsumable && <span className="text-sm text-gray-500"> (+3 uses)</span>}
                      </div>
                      {!owned ? (
                        <button
                          onClick={() => buyShopItem(shopCategory, itemId)}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          disabled={money < item.cost}
                        >
                          {isConsumable ? 'Buy More' : 'Buy Now'}
                        </button>
                      ) : (
                        <div className="w-full px-4 py-2 bg-green-500 text-white rounded text-center">
                          Owned
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buildings Tab */}
        {activeTab === 'buildings' && (
          <div className="space-y-6">
            {/* Basic Buildings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏗️ Basic Farm Buildings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(BUILDINGS).filter(([id]) => 
                  !['advancedGreenhouse', 'irrigationSystem', 'breedingLab', 'weatherStation', 'seedProcessor'].includes(id)
                ).map(([buildingId, building]) => {
                  const owned = buildings[buildingId];
                  const animalsCount = Object.values(livestock).filter(
                    animal => LIVESTOCK[animal.type].housing === buildingId
                  ).length;
                  
                  return (
                    <div key={buildingId} className={`p-4 border-2 rounded-lg ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-3xl mb-2">{building.emoji}</div>
                          <div className="font-semibold">{building.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{building.description}</div>
                          {building.capacity > 0 && (
                            <div className="text-sm text-blue-600">
                              Capacity: {building.capacity} animals
                            </div>
                          )}
                        </div>
                        {owned && <div className="text-green-500 text-xl">✅</div>}
                      </div>
                      
                      {owned && building.capacity > 0 && (
                        <div className="mb-3 p-2 bg-blue-50 rounded">
                          <div className="text-sm font-medium">
                            Occupancy: {animalsCount}/{building.capacity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(animalsCount / building.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <div className="text-lg font-bold text-green-600 mb-2">${building.cost}</div>
                        {!owned ? (
                          <button
                            onClick={() => buyBuilding(buildingId)}
                            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                            disabled={money < building.cost}
                          >
                            Build Now
                          </button>
                        ) : (
                          <div className="w-full px-4 py-2 bg-green-500 text-white rounded text-center">
                            Built
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Buildings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏭 Advanced Agricultural Technology</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(BUILDINGS).filter(([id]) => 
                  ['advancedGreenhouse', 'irrigationSystem', 'breedingLab', 'weatherStation', 'seedProcessor'].includes(id)
                ).map(([buildingId, building]) => {
                  const owned = buildings[buildingId];
                  
                  return (
                    <div key={buildingId} className={`p-4 border-2 rounded-lg ${owned ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-3xl mb-2">{building.emoji}</div>
                          <div className="font-semibold">{building.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{building.description}</div>
                        </div>
                        {owned && <div className="text-purple-500 text-xl">✅</div>}
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-lg font-bold text-purple-600 mb-2">${building.cost}</div>
                        {!owned ? (
                          <button
                            onClick={() => buyAdvancedBuilding(buildingId)}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                            disabled={money < building.cost}
                          >
                            Build Advanced
                          </button>
                        ) : (
                          <div className="w-full px-4 py-2 bg-purple-500 text-white rounded text-center">
                            Advanced Tech Active
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Active Contracts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">📋 Active Contracts</h2>
                <button
                  onClick={generateContract}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Find New Contract
                </button>
              </div>
              
              {activeContracts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No active contracts. Generate new contracts to earn bonus rewards!
                </p>
              ) : (
                <div className="space-y-4">
                  {activeContracts.map(contract => (
                    <div key={contract.id} className="border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{contract.client}</h3>
                          <p className="text-sm text-gray-600">{contract.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">${contract.reward}</div>
                          <div className="text-xs text-gray-500">
                            Deadline: {Math.max(0, Math.ceil((contract.deadline - gameTime) / 1000))}s
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          Progress: {contract.delivered}/{contract.quantity} {contract.crop}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deliverToContract(contract.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            disabled={!hasReadyCrops(contract.crop)}
                          >
                            Deliver Crop
                          </button>
                          <button
                            onClick={() => cancelContract(contract.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(contract.delivered / contract.quantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Contracts */}
            {completedContracts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">✅ Completed Contracts</h2>
                <div className="space-y-2">
                  {completedContracts.slice(-5).map(contract => (
                    <div key={contract.id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">{contract.client} - {contract.quantity} {contract.crop}</span>
                      <span className="text-sm font-bold text-green-600">+${contract.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Livestock Tab */}
        {activeTab === 'livestock' && (
          <div className="space-y-6">
            {/* Buy Animals */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🐄 Buy Livestock</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(LIVESTOCK).map(([key, animal]) => (
                  <div key={key} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="text-3xl mb-2">{animal.emoji}</div>
                    <div className="font-semibold">{animal.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Produces ${animal.income} every {animal.interval}s
                    </div>
                    <button
                      onClick={() => buyAnimal(key)}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      disabled={money < animal.cost}
                    >
                      Buy for ${animal.cost}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Animals */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏠 Your Animals ({Object.keys(livestock).length})</h2>
              {Object.keys(livestock).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🐑</div>
                  <p>No animals yet. Buy some livestock to start earning passive income!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(livestock).map(([animalId, animal]) => {
                    const animalData = LIVESTOCK[animal.type];
                    const timeSinceFed = gameTime - animal.lastFed;
                    const canFeed = timeSinceFed >= 30;
                    const isHungry = timeSinceFed > animalData.interval;
                    
                    return (
                      <div key={animalId} className={`p-4 border-2 rounded-lg ${isHungry ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                        <div className="text-2xl mb-1">{animalData.emoji}</div>
                        <div className="text-sm font-semibold">{animalData.name}</div>
                        <div className="text-xs text-gray-600 mb-2">
                          Fed: {Math.max(0, 30 - timeSinceFed)}s ago
                        </div>
                        <button
                          onClick={() => feedAnimal(animalId)}
                          className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 disabled:opacity-50"
                          disabled={!canFeed}
                        >
                          🌾 Feed {canFeed ? '' : `(${30 - timeSinceFed}s)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breeding/Genetics Tab */}
        {activeTab === 'breeding' && (
          <div className="space-y-6">
            {/* Weather Forecast */}
            {buildings.weatherStation && weatherForecast.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">📡 5-Day Weather Forecast</h2>
                <div className="grid grid-cols-5 gap-2">
                  {weatherForecast.map(day => (
                    <div key={day.day} className="text-center p-2 border rounded">
                      <div className="text-lg">{WEATHER[day.weather].emoji}</div>
                      <div className="text-xs">Day {day.day}</div>
                      <div className="text-xs">{WEATHER[day.weather].name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seed Quality Upgrade */}
            {buildings.seedProcessor && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">⚙️ Seed Quality Enhancement</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(CROPS).map(([cropKey, crop]) => {
                    const currentQuality = seedQualities[cropKey];
                    const qualityData = SEED_QUALITIES[currentQuality];
                    const qualityLevels = ['bronze', 'silver', 'gold', 'platinum'];
                    const currentIndex = qualityLevels.indexOf(currentQuality);
                    const canUpgrade = currentIndex < qualityLevels.length - 1;
                    const cost = canUpgrade ? (currentIndex + 2) * 500 : 0;
                    
                    return (
                      <div key={cropKey} className="border-2 border-gray-200 rounded-lg p-4">
                        <div className="text-2xl mb-2">{crop.emoji}</div>
                        <div className="font-semibold">{crop.name}</div>
                        <div className={`text-sm ${qualityData.color}`}>
                          {qualityData.emoji} {qualityData.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">Seeds: {seeds[cropKey]}</div>
                        {canUpgrade ? (
                          <button
                            onClick={() => upgradeSeedQuality(cropKey)}
                            className="w-full px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                            disabled={money < cost || seeds[cropKey] < 10}
                          >
                            Upgrade (${cost})
                          </button>
                        ) : (
                          <div className="w-full px-3 py-1 bg-gold text-white rounded text-sm text-center">
                            Max Quality
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hybrid Breeding */}
            {buildings.breedingLab && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">🧬 Crop Breeding Laboratory</h2>
                
                {/* Hybrid Seeds Inventory */}
                {Object.keys(hybridSeeds).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">🌟 Hybrid Seeds</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(hybridSeeds).map(([hybridKey, quantity]) => {
                        const hybridData = Object.values(HYBRID_COMBINATIONS).find(h => h.result === hybridKey);
                        return hybridData && quantity > 0 ? (
                          <div key={hybridKey} className="border-2 border-purple-300 bg-purple-50 rounded-lg p-3">
                            <div className="text-2xl mb-1">{hybridData.emoji}</div>
                            <div className="font-semibold text-sm">{hybridData.name}</div>
                            <div className="text-xs text-purple-600">Quantity: {quantity}</div>
                            <div className="text-xs text-gray-500">
                              Traits: {hybridData.traits.map(t => GENETIC_TRAITS[t].emoji).join('')}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Breeding Interface */}
                <h3 className="text-lg font-bold mb-2">🔬 Create Hybrid Crops</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(HYBRID_COMBINATIONS).map(([combo, hybrid]) => {
                    const [crop1, crop2] = combo.split('+');
                    const canBreed = seeds[crop1] >= 5 && seeds[crop2] >= 5;
                    
                    return (
                      <div key={combo} className="border-2 border-blue-200 rounded-lg p-4">
                        <div className="text-center mb-3">
                          <div className="text-lg">{CROPS[crop1].emoji} + {CROPS[crop2].emoji}</div>
                          <div className="text-xs text-gray-600">{CROPS[crop1].name} + {CROPS[crop2].name}</div>
                        </div>
                        <div className="text-center mb-3">
                          <div className="text-2xl">🧬</div>
                          <div className="text-lg font-bold">{hybrid.emoji}</div>
                          <div className="font-semibold text-sm">{hybrid.name}</div>
                        </div>
                        <div className="text-xs text-gray-600 mb-3">
                          <div>Value: ${hybrid.baseValue}</div>
                          <div>Growth: {hybrid.growTime}s</div>
                          <div>Traits: {hybrid.traits.map(t => GENETIC_TRAITS[t].emoji).join('')}</div>
                        </div>
                        <button
                          onClick={() => breedCrops(crop1, crop2)}
                          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          disabled={!canBreed}
                        >
                          Breed (5+5 seeds)
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Genetics Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🧬 Genetic Traits Reference</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(GENETIC_TRAITS).map(([traitKey, trait]) => (
                  <div key={traitKey} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{trait.emoji}</span>
                      <span className="font-semibold">{trait.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{trait.description}</div>
                    <div className="text-xs">
                      <div className="grid grid-cols-4 gap-1">
                        {Object.entries(trait.levels).map(([quality, value]) => (
                          <div key={quality} className="text-center">
                            <div className={SEED_QUALITIES[quality].color}>
                              {SEED_QUALITIES[quality].emoji}
                            </div>
                            <div>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Building Requirements */}
            {(!buildings.breedingLab || !buildings.seedProcessor) && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">🏗️ Required Buildings</h3>
                <div className="text-sm text-yellow-700">
                  {!buildings.breedingLab && <div>• Build a Breeding Laboratory to create hybrid crops</div>}
                  {!buildings.seedProcessor && <div>• Build a Seed Processor to upgrade seed quality</div>}
                  {!buildings.weatherStation && <div>• Build a Weather Station for weather forecasts</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🔬 Research Tree</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800">Research Points: {researchPoints}</div>
              <div className="text-sm text-blue-600">Earn 1 point per harvest</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(research).map(([key, item]) => (
                <div key={key} className={`p-4 border-2 rounded-lg ${item.unlocked ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                    {item.unlocked && <div className="text-green-500 text-xl">✅</div>}
                  </div>
                  {!item.unlocked && (
                    <button
                      onClick={() => buyResearch(key)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={researchPoints < item.cost}
                    >
                      Research ({item.cost} points)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏆 Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(achievements).map(([key, achievement]) => (
                <div key={key} className={`p-4 border-2 rounded-lg ${achievement.unlocked ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{achievement.name}</div>
                        {achievement.unlocked && <div className="text-yellow-500 text-xl">🏆</div>}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                      <div className="text-sm font-medium text-green-600">Reward: ${achievement.reward}</div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="mt-2 text-xs bg-yellow-200 px-2 py-1 rounded text-yellow-800">
                      ✨ Completed!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">📊 Farm Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Financial Stats */}
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-3">💰 Financial</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Money:</span>
                    <span className="font-bold">${money}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earned:</span>
                    <span className="text-green-600">${totalEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="text-red-600">${totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit:</span>
                    <span className={`font-bold ${totalEarned - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${totalEarned - totalSpent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farm Stats */}
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">🌱 Farm Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="font-bold">{level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{Math.floor(experience)} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Harvests:</span>
                    <span>{totalHarvests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Farm Size:</span>
                    <span>{farmSize}x{farmSize} ({farmSize * farmSize} plots)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Research Points:</span>
                    <span>{researchPoints}</span>
                  </div>
                </div>
              </div>

              {/* Livestock Stats */}
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3">🐄 Livestock</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Animals:</span>
                    <span className="font-bold">{Object.keys(livestock).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buildings Built:</span>
                    <span>{Object.keys(buildings).length}</span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(LIVESTOCK).map(([type, data]) => {
                      const count = Object.values(livestock).filter(animal => animal.type === type).length;
                      return count > 0 ? (
                        <div key={type} className="flex justify-between">
                          <span>{data.emoji} {data.name}s:</span>
                          <span>{count}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Tools & Research */}
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">🔧 Tools & Research</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tools Owned:</span>
                    <span className="font-bold">{Object.values(tools).filter(Boolean).length}/4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Research Unlocked:</span>
                    <span>{Object.values(research).filter(r => r.unlocked).length}/4</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Active Tools:</div>
                    {Object.entries(tools).map(([tool, owned]) => 
                      owned ? (
                        <div key={tool} className="text-xs text-green-600">
                          ✓ {tool.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-3">🏆 Achievements</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-bold">
                      {Object.values(achievements).filter(a => a.unlocked).length}/{Object.keys(achievements).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievement Rewards:</span>
                    <span className="text-green-600">
                      ${Object.values(achievements).filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ 
                        width: `${(Object.values(achievements).filter(a => a.unlocked).length / Object.keys(achievements).length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                <h3 className="font-semibold text-cyan-800 mb-3">📦 Inventory</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-gray-600 mb-1">Seeds:</div>
                  {Object.entries(seeds).map(([crop, count]) => (
                    <div key={crop} className="flex justify-between">
                      <span>{CROPS[crop].emoji} {CROPS[crop].name}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-600 mb-1 mt-3">Feed:</div>
                  {Object.entries(feed).map(([feedType, count]) => (
                    <div key={feedType} className="flex justify-between">
                      <span>{feedType}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Game Time */}
            <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-700">
                ⏱️ Playing Time: {Math.floor(gameTime / 60)}m {gameTime % 60}s
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Weather changes every 60 seconds • Current: {WEATHER[currentWeather].emoji} {WEATHER[currentWeather].name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
