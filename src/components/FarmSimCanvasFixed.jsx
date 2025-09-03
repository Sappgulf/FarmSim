import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";

// Constants
const MIN_SIZE = 4;
const MAX_SIZE = 6;
const SAVE_KEY = "farm_sim_enhanced_v2";

const LEVELS = [
  { id: "lvl1", label: "Novice Farmer", targetCoins: 100, minutes: 6, reward: 25, difficulty: "Easy" },
  { id: "lvl2", label: "Growing Skills", targetCoins: 200, minutes: 8, reward: 40, difficulty: "Medium" },
  { id: "lvl3", label: "Master Gardener", targetCoins: 350, minutes: 10, reward: 70, difficulty: "Hard" },
  { id: "endless", label: "Endless Farm", targetCoins: 999999, minutes: 9999, reward: 0, difficulty: "∞" },
];

const WEATHER_TYPES = ["Sunny", "Rain", "Drought", "Storm", "Frost", "Pests"];
const SEASONS = ["spring", "summer", "fall", "winter"];
const SEASON_EFFECTS = {
  spring: { growthBonus: 1.2, name: "🌸 Spring", color: "text-green-500" },
  summer: { growthBonus: 1.0, name: "☀️ Summer", color: "text-yellow-500" },
  fall: { growthBonus: 0.9, name: "🍂 Fall", color: "text-orange-500" },
  winter: { growthBonus: 0.7, name: "❄️ Winter", color: "text-blue-500" },
};

const ACHIEVEMENTS = {
  first_harvest: { name: "First Harvest", description: "Harvest your first crop", emoji: "🌾", reward: 10 },
  green_thumb: { name: "Green Thumb", description: "Harvest 10 crops", emoji: "🌱", reward: 25 },
  farmer: { name: "Farmer", description: "Harvest 50 crops", emoji: "👨‍🌾", reward: 50 },
  rich_farmer: { name: "Rich Farmer", description: "Earn 1000 coins", emoji: "💰", reward: 100 },
  builder: { name: "Builder", description: "Build 3 buildings", emoji: "🏗️", reward: 75 },
  rancher: { name: "Rancher", description: "Own 5 animals", emoji: "🐮", reward: 60 },
};

const DEFAULT_RULES = {
  seeds: {
    // Common crops
    carrot: { stages: 3, secondsPerStage: 8, baseValue: 12, shopPrice: 5, emoji: "🥕", rarity: "common", season: "spring" },
    potato: { stages: 3, secondsPerStage: 10, baseValue: 15, shopPrice: 7, emoji: "🥔", rarity: "common", season: "fall" },
    corn: { stages: 4, secondsPerStage: 12, baseValue: 22, shopPrice: 10, emoji: "🌽", rarity: "uncommon", season: "summer" },
    tomato: { stages: 4, secondsPerStage: 14, baseValue: 28, shopPrice: 14, emoji: "🍅", rarity: "uncommon", season: "summer" },
    // Uncommon crops
    strawberry: { stages: 3, secondsPerStage: 16, baseValue: 35, shopPrice: 18, emoji: "🍓", rarity: "uncommon", season: "spring" },
    pumpkin: { stages: 5, secondsPerStage: 18, baseValue: 45, shopPrice: 22, emoji: "🎃", rarity: "uncommon", season: "fall" },
    sunflower: { stages: 4, secondsPerStage: 20, baseValue: 40, shopPrice: 20, emoji: "🌻", rarity: "uncommon", season: "summer" },
    // Rare crops
    watermelon: { stages: 5, secondsPerStage: 22, baseValue: 60, shopPrice: 30, emoji: "🍉", rarity: "rare", season: "summer" },
    blueberry: { stages: 3, secondsPerStage: 18, baseValue: 50, shopPrice: 25, emoji: "🫐", rarity: "rare", season: "summer" },
    pepper: { stages: 4, secondsPerStage: 16, baseValue: 48, shopPrice: 28, emoji: "🌶️", rarity: "rare", season: "summer" },
    // Epic crops
    grapes: { stages: 6, secondsPerStage: 25, baseValue: 80, shopPrice: 45, emoji: "🍇", rarity: "epic", season: "fall" },
    avocado: { stages: 7, secondsPerStage: 30, baseValue: 100, shopPrice: 60, emoji: "🥑", rarity: "epic", season: "spring" },
    // Legendary crops
    golden_corn: { stages: 5, secondsPerStage: 35, baseValue: 150, shopPrice: 100, emoji: "🌟", rarity: "legendary", season: "summer" },
    diamond_berry: { stages: 4, secondsPerStage: 40, baseValue: 200, shopPrice: 150, emoji: "💎", rarity: "legendary", season: "winter" },
  },
  tools: {
    wateringCan: { price: 25, name: "Watering Can", emoji: "🚿", description: "Waters 3x3 area", owned: false, type: "tool" },
    fertilizer: { price: 8, name: "Fertilizer", emoji: "💩", description: "Speed +50% (stackable x3)", owned: 0, type: "consumable", maxStacks: 3 },
    pesticide: { price: 10, name: "Pesticide", emoji: "🧪", description: "Removes pests", owned: 0, type: "consumable" },
    fungicide: { price: 12, name: "Fungicide", emoji: "💊", description: "Cures diseases", owned: 0, type: "consumable" },
    sprinkler: { price: 100, name: "Sprinkler", emoji: "💦", description: "Auto-waters 3x3 area", owned: false, type: "permanent" },
    scarecrow: { price: 50, name: "Scarecrow", emoji: "👺", description: "Prevents pests", owned: false, type: "permanent" },
    harvester: { price: 200, name: "Harvester", emoji: "🚜", description: "Auto-harvests ready crops", owned: false, type: "tool" },
    compost: { price: 15, name: "Compost", emoji: "🍂", description: "Improves soil +20%", owned: 0, type: "consumable" },
  },
  buildings: {
    greenhouse: { price: 500, name: "Greenhouse", emoji: "🏡", bonus: 0.2, description: "Crops grow 20% faster" },
    barn: { price: 1000, name: "Barn", emoji: "🏚️", bonus: 0, description: "Store animals" },
    silo: { price: 750, name: "Silo", emoji: "🏭", bonus: 0, description: "Store more crops" },
    workshop: { price: 1500, name: "Workshop", emoji: "🔨", bonus: 0, description: "Process crops" },
    market: { price: 2000, name: "Market Stall", emoji: "🏪", bonus: 0.1, description: "Sell for 10% more" },
    well: { price: 300, name: "Well", emoji: "🪣", bonus: 0, description: "Free water source" },
    beehive: { price: 600, name: "Beehive", emoji: "🐝", bonus: 0.15, description: "Pollination bonus" },
    windmill: { price: 2500, name: "Windmill", emoji: "🌬️", bonus: 0, description: "Process grains faster" },
  },
  livestock: {
    chicken: { price: 100, name: "Chicken", emoji: "🐔", product: "eggs", productEmoji: "🥚", productValue: 5, feedCost: 2 },
    cow: { price: 500, name: "Cow", emoji: "🐄", product: "milk", productEmoji: "🥛", productValue: 15, feedCost: 5 },
    sheep: { price: 300, name: "Sheep", emoji: "🐑", product: "wool", productEmoji: "🧶", productValue: 10, feedCost: 3 },
    pig: { price: 400, name: "Pig", emoji: "🐷", product: "bacon", productEmoji: "🥓", productValue: 20, feedCost: 4 },
  }
};

// Helper functions
function nowSec() { 
  return Math.floor(Date.now() / 1000); 
}

function loadSave() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const s = localStorage.getItem(SAVE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed?.version === 2) return parsed;
    }
  } catch (e) {
    console.debug('[farm] loadSave error:', e);
  }
  return null;
}

function saveState(s) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    }
  } catch (e) {
    console.debug('[farm] saveState error:', e);
  }
}

function newPlot(state = "empty") {
  if (state === "locked") return {
    state: "locked",
    seed: null,
    growth: 0,
    watered: false,
    fertilized: 0,
    infested: false,
    plantedAt: null
  };
  return {
    state,
    seed: null,
    growth: 0,
    watered: false,
    fertilized: 0,
    infested: false,
    plantedAt: null,
    lastWateredAt: null,
    boosted: false,
    soilFertility: 1
  };
}

function makeGrid(size) {
  const arr = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // All plots are unlocked and useable
      arr.push(newPlot("empty"));
    }
  }
  return arr;
}

function FarmSimCanvasFixed() {
  // Load saved data
  const saved = useMemo(() => loadSave(), []);
  
  // Core state
  const [coins, setCoins] = useState(saved?.coins || 50);
  const [score, setScore] = useState(saved?.score || 0);
  const [gridSize, setGridSize] = useState(saved?.gridSize || MIN_SIZE);
  const [plots, setPlots] = useState(() => saved?.plots || makeGrid(MIN_SIZE));
  const [selectedSeed, setSelectedSeed] = useState("carrot");
  const [inventory, setInventory] = useState(saved?.inventory || {
    carrot: 5, potato: 3, corn: 2, tomato: 1,
    fertilizer: 2, pesticide: 2, wateringCan: 0
  });
  const [buildings, setBuildings] = useState(saved?.buildings || {});
  const [shopTab, setShopTab] = useState("seeds");
  const [notifications, setNotifications] = useState([]);
  const [weather, setWeather] = useState({ type: "Sunny", endsAt: nowSec() + 60 });
  const [currentSeason, setCurrentSeason] = useState("spring");
  const [seasonEndsAt, setSeasonEndsAt] = useState(nowSec() + 120);
  const [level, setLevel] = useState(LEVELS[0]);
  const [paused, setPaused] = useState(false);
  const [totalHarvests, setTotalHarvests] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [livestock, setLivestock] = useState({});
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  
  // Tools system
  const [tools, setTools] = useState(saved?.tools || {
    wateringCan: false,
    fertilizer: 0,
    pesticide: 0,
    fungicide: 0,
    sprinkler: false,
    scarecrow: false,
    harvester: false,
    compost: 0,
  });
  const [selectedTool, setSelectedTool] = useState(null);
  const [sprinklerPositions, setSprinklerPositions] = useState(saved?.sprinklerPositions || []);
  const [scarecrowPositions, setScarecrowPositions] = useState(saved?.scarecrowPositions || []);
  const [plotDiseases, setPlotDiseases] = useState(saved?.plotDiseases || {});
  
  // Add notification
  const addNotification = (msg, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Plant seed
  const plant = (plotIndex, seed) => {
    if (!DEFAULT_RULES.seeds[seed]) {
      addNotification("Invalid seed!", "error");
      return;
    }
    
    if ((inventory[seed] || 0) <= 0) {
      addNotification(`No ${seed} seeds!`, "error");
      return;
    }
    
    setPlots(prev => {
      const newPlots = [...prev];
      const plot = newPlots[plotIndex];
      if (plot.state !== "empty") return prev;
      
      newPlots[plotIndex] = {
        ...plot,
        state: "planted",
        seed: seed,
        growth: 0,
        plantedAt: nowSec()
      };
      
      setInventory(inv => ({...inv, [seed]: (inv[seed] || 0) - 1}));
      addNotification(`Planted ${seed}!`, "success");
      return newPlots;
    });
  };
  
  // Water plot
  const water = (plotIndex) => {
    setPlots(prev => {
      const newPlots = [...prev];
      const plot = newPlots[plotIndex];
      if (plot.state !== "planted" && plot.state !== "growing") return prev;
      
      newPlots[plotIndex] = {
        ...plot,
        state: "growing",
        watered: true,
        lastWateredAt: nowSec()
      };
      
      addNotification("Watered plot!", "success");
      return newPlots;
    });
  };
  
  // Harvest crop
  const harvest = (plotIndex) => {
    const plot = plots[plotIndex];
    if (plot.state !== "grown") return;
    
    const seed = plot.seed;
    let value = DEFAULT_RULES.seeds[seed]?.baseValue || 10;
    
    // Apply combo bonus
    if (combo > 0) {
      value = Math.round(value * (1 + combo * 0.1));
    }
    
    // Apply season bonus
    const seasonBonus = SEASON_EFFECTS[currentSeason]?.growthBonus || 1;
    value = Math.round(value * seasonBonus);
    
    // Apply building bonuses
    if (buildings.market) value = Math.round(value * 1.1);
    if (buildings.beehive) value = Math.round(value * 1.15);
    
    setCoins(c => c + value);
    setScore(s => s + value);
    setTotalHarvests(h => h + 1);
    
    // Update combo
    setCombo(c => c + 1);
    setComboTimer(nowSec() + 10); // 10 seconds to maintain combo
    
    setPlots(prev => {
      const newPlots = [...prev];
      newPlots[plotIndex] = newPlot("empty");
      return newPlots;
    });
    
    // Check achievements
    checkAchievements();
    
    const comboText = combo > 0 ? ` (Combo x${combo + 1}!)` : "";
    addNotification(`Harvested ${seed} for ${value} coins!${comboText}`, "success");
  };
  
  // Check achievements
  const checkAchievements = () => {
    if (totalHarvests === 1 && !achievements.includes("first_harvest")) {
      unlockAchievement("first_harvest");
    }
    if (totalHarvests === 10 && !achievements.includes("green_thumb")) {
      unlockAchievement("green_thumb");
    }
    if (totalHarvests === 50 && !achievements.includes("farmer")) {
      unlockAchievement("farmer");
    }
    if (coins >= 1000 && !achievements.includes("rich_farmer")) {
      unlockAchievement("rich_farmer");
    }
  };
  
  const unlockAchievement = (id) => {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return;
    
    setAchievements(prev => [...prev, id]);
    setCoins(c => c + achievement.reward);
    addNotification(`🏆 Achievement Unlocked: ${achievement.name}! +${achievement.reward} coins`, "success");
  };
  
  // Buy livestock
  const buyLivestock = (animal) => {
    const data = DEFAULT_RULES.livestock[animal];
    if (!data || coins < data.price) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(c => c - data.price);
    setLivestock(prev => ({
      ...prev,
      [animal]: (prev[animal] || 0) + 1
    }));
    
    addNotification(`Bought a ${data.name}! ${data.emoji}`, "success");
    
    // Check rancher achievement
    const totalAnimals = Object.values(livestock).reduce((sum, count) => sum + count, 0) + 1;
    if (totalAnimals === 5 && !achievements.includes("rancher")) {
      unlockAchievement("rancher");
    }
  };
  
  // Collect from livestock
  const collectFromLivestock = (animal) => {
    const data = DEFAULT_RULES.livestock[animal];
    const count = livestock[animal] || 0;
    
    if (count === 0) return;
    
    const value = data.productValue * count;
    setCoins(c => c + value);
    
    addNotification(`Collected ${count}x ${data.productEmoji} for ${value} coins!`, "success");
  };
  
  // Clear withered plot
  const clearPlot = (plotIndex) => {
    setPlots(prev => {
      const newPlots = [...prev];
      if (newPlots[plotIndex].state !== "withered") return prev;
      newPlots[plotIndex] = newPlot("empty");
      addNotification("Cleared withered plot", "info");
      return newPlots;
    });
  };
  
  // Expand grid
  const expandGrid = () => {
    const cost = 100 * (gridSize - MIN_SIZE + 1);
    if (coins < cost) {
      addNotification("Not enough coins to expand!", "error");
      return;
    }
    
    if (gridSize >= MAX_SIZE) {
      addNotification("Maximum grid size reached!", "error");
      return;
    }
    
    const newSize = gridSize + 1;
    const oldPlots = [...plots];
    const newPlots = [];
    
    // Copy existing plots and add new ones
    for (let r = 0; r < newSize; r++) {
      for (let c = 0; c < newSize; c++) {
        const oldIndex = r * gridSize + c;
        if (r < gridSize && c < gridSize && oldIndex < oldPlots.length) {
          newPlots.push(oldPlots[oldIndex]);
        } else {
          newPlots.push(newPlot("empty"));
        }
      }
    }
    
    setCoins(c => c - cost);
    setGridSize(newSize);
    setPlots(newPlots);
    addNotification(`Farm expanded to ${newSize}x${newSize}!`, "success");
  };
  
  // Buy tool
  const buyTool = (toolId) => {
    const tool = DEFAULT_RULES.tools[toolId];
    if (!tool) return;
    
    if (coins < tool.price) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(c => c - tool.price);
    
    if (tool.type === "consumable") {
      setTools(t => ({ ...t, [toolId]: (t[toolId] || 0) + 1 }));
      addNotification(`Bought ${tool.name}! (${(tools[toolId] || 0) + 1} owned)`, "success");
    } else {
      setTools(t => ({ ...t, [toolId]: true }));
      addNotification(`Bought ${tool.name}!`, "success");
    }
  };
  
  // Use tool on plot
  const useTool = (plotIndex, toolId) => {
    const tool = DEFAULT_RULES.tools[toolId];
    if (!tool) return;
    
    if (tool.type === "consumable" && (tools[toolId] || 0) <= 0) {
      addNotification(`No ${tool.name} available!`, "error");
      return;
    }
    
    if (tool.type === "tool" && !tools[toolId]) {
      addNotification(`You don't own a ${tool.name}!`, "error");
      return;
    }
    
    setPlots(prev => {
      const newPlots = [...prev];
      const plot = newPlots[plotIndex];
      
      switch(toolId) {
        case "fertilizer":
          if (plot.state === "growing" || plot.state === "planted") {
            plot.fertilized = (plot.fertilized || 0) + 1;
            plot.growthBoost = 1 + (plot.fertilized * 0.5);
            addNotification(`Applied fertilizer! Growth +${plot.fertilized * 50}%`, "success");
            setTools(t => ({ ...t, fertilizer: t.fertilizer - 1 }));
          }
          break;
          
        case "pesticide":
          if (plot.infested) {
            plot.infested = false;
            addNotification("Pests eliminated!", "success");
            setTools(t => ({ ...t, pesticide: t.pesticide - 1 }));
          }
          break;
          
        case "fungicide":
          if (plotDiseases[plotIndex]) {
            setPlotDiseases(d => { const nd = {...d}; delete nd[plotIndex]; return nd; });
            addNotification("Disease cured!", "success");
            setTools(t => ({ ...t, fungicide: t.fungicide - 1 }));
          }
          break;
          
        case "compost":
          plot.soilQuality = (plot.soilQuality || 1) + 0.2;
          addNotification(`Soil improved! Quality: ${((plot.soilQuality || 1) * 100).toFixed(0)}%`, "success");
          setTools(t => ({ ...t, compost: t.compost - 1 }));
          break;
          
        case "wateringCan":
          // Water 3x3 area
          const row = Math.floor(plotIndex / gridSize);
          const col = plotIndex % gridSize;
          for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
              const idx = r * gridSize + c;
              if (newPlots[idx].state === "planted") {
                newPlots[idx].state = "growing";
                newPlots[idx].watered = true;
              }
            }
          }
          addNotification("Watered 3x3 area!", "success");
          break;
      }
      
      return newPlots;
    });
  };
  
  // Buy item
  const buy = (item, qty = 1) => {
    let price = 0;
    
    if (item in DEFAULT_RULES.seeds) {
      price = DEFAULT_RULES.seeds[item].shopPrice * qty;
    } else if (item === "fertilizer") {
      price = DEFAULT_RULES.fertilizer.shopPrice * qty;
    } else if (item === "pesticide") {
      price = DEFAULT_RULES.pesticide.shopPrice * qty;
    } else if (item === "wateringCan") {
      if (inventory.wateringCan > 0) {
        addNotification("Already have watering can!", "error");
        return;
      }
      price = DEFAULT_RULES.wateringCan.shopPrice;
    } else if (item in DEFAULT_RULES.buildings) {
      if (buildings[item]) {
        addNotification(`Already have ${item}!`, "error");
        return;
      }
      price = DEFAULT_RULES.buildings[item].price;
      
      if (coins < price) {
        addNotification("Not enough coins!", "error");
        return;
      }
      
      setCoins(c => c - price);
      setBuildings(prev => ({...prev, [item]: true}));
      addNotification(`Built ${DEFAULT_RULES.buildings[item].name}!`, "success");
      return;
    }
    
    if (coins < price) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(c => c - price);
    setInventory(prev => ({
      ...prev,
      [item]: (prev[item] || 0) + qty
    }));
    
    addNotification(`Bought ${qty}x ${item}!`, "success");
  };
  
  // Enhanced growth and game system
  useEffect(() => {
    if (paused) return;
    
    const interval = setInterval(() => {
      // Update combo
      if (comboTimer > 0 && nowSec() >= comboTimer) {
        setCombo(0);
        setComboTimer(0);
      }
      
      // Update weather
      setWeather(prev => {
        if (nowSec() >= prev.endsAt) {
          const newType = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
          addNotification(`Weather changed to ${newType}!`, "info");
          
          // Apply instant weather effects
          if (newType === "Rain") {
            setPlots(p => p.map(plot => 
              plot.state === "planted" || plot.state === "growing" 
                ? {...plot, watered: true} 
                : plot
            ));
          }
          
          return { type: newType, endsAt: nowSec() + 60 + Math.random() * 60 };
        }
        return prev;
      });
      
      // Update season
      if (nowSec() >= seasonEndsAt) {
        setCurrentSeason(prev => {
          const idx = SEASONS.indexOf(prev);
          const next = SEASONS[(idx + 1) % SEASONS.length];
          addNotification(`Season changed to ${SEASON_EFFECTS[next].name}!`, "info");
          return next;
        });
        setSeasonEndsAt(nowSec() + 120); // 2 minutes per season
      }
      
      // Update plots
      setPlots(prev => prev.map(plot => {
        if (plot.state === "growing" && plot.seed) {
          const seed = DEFAULT_RULES.seeds[plot.seed];
          if (!seed) return plot;
          
          // Calculate growth speed with bonuses
          let growthMultiplier = 1;
          
          // Weather effects
          if (weather.type === "Rain") growthMultiplier *= 1.2;
          if (weather.type === "Drought") growthMultiplier *= 0.8;
          if (weather.type === "Frost") growthMultiplier *= 0.5;
          
          // Season effects
          const seasonBonus = SEASON_EFFECTS[currentSeason]?.growthBonus || 1;
          growthMultiplier *= seasonBonus;
          
          // Building effects
          if (buildings.greenhouse) growthMultiplier *= 1.2;
          
          const elapsed = nowSec() - (plot.plantedAt || nowSec());
          const adjustedTime = seed.stages * seed.secondsPerStage / growthMultiplier;
          
          if (elapsed >= adjustedTime) {
            return {...plot, state: "grown", growth: seed.stages};
          }
          
          const newGrowth = Math.floor(elapsed / (seed.secondsPerStage / growthMultiplier));
          return {...plot, growth: Math.min(newGrowth, seed.stages - 1)};
        }
        
        // Pests
        if (weather.type === "Pests" && plot.state === "growing" && Math.random() < 0.01) {
          if (!plot.infested) {
            return {...plot, infested: true};
          }
        }
        
        // Wither if not watered (faster in drought)
        if (plot.state === "planted") {
          const elapsed = nowSec() - (plot.plantedAt || nowSec());
          const witherTime = weather.type === "Drought" ? 20 : 30;
          if (elapsed > witherTime) {
            return {...plot, state: "withered"};
          }
        }
        
        return plot;
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [paused, weather.type, currentSeason, buildings, comboTimer]);
  
  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      const snapshot = {
        version: 2,
        savedAt: Date.now(),
        coins, score, gridSize, plots, inventory, buildings
      };
      saveState(snapshot);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [coins, score, gridSize, plots, inventory, buildings]);
  
  // Plot Card Component
  const PlotCard = ({ plot, index }) => {
    const seed = plot.seed ? DEFAULT_RULES.seeds[plot.seed] : null;
    const emoji = seed?.emoji || "🌱";
    
    let bgClass = "bg-gradient-to-br from-amber-100 to-yellow-50";
    let borderClass = "border-amber-300";
    let shadowClass = "";
    
    if (plot.state === "withered") {
      bgClass = "bg-gradient-to-br from-red-100 to-red-50";
      borderClass = "border-red-300";
    } else if (plot.state === "grown") {
      bgClass = "bg-gradient-to-br from-green-100 to-emerald-50";
      borderClass = "border-green-400";
      shadowClass = "shadow-lg shadow-green-200/50 animate-pulse";
    } else if (plot.state === "growing") {
      bgClass = "bg-gradient-to-br from-yellow-100 to-green-50";
      borderClass = "border-yellow-400";
    } else if (plot.state === "planted") {
      bgClass = "bg-gradient-to-br from-amber-50 to-yellow-50";
      borderClass = "border-yellow-300";
    }
    
    // Add effects
    if (plot.infested) borderClass = "border-red-500 border-4";
    if (plot.watered && plot.state !== "grown") shadowClass = "shadow-blue-200/50";
    
    const handleClick = () => {
      // If a tool is selected, use it
      if (selectedTool) {
        useTool(index, selectedTool);
        setSelectedTool(null);
        return;
      }
      
      // Normal interactions
      if (plot.state === "grown") return harvest(index);
      if (plot.state === "withered") return clearPlot(index);
      if (plot.state === "empty") return plant(index, selectedSeed);
      if (plot.state === "planted") {
        // Use watering can if owned
        if (tools.wateringCan) {
          useTool(index, "wateringCan");
        } else {
          water(index);
        }
      }
    };
    
    const progress = seed && plot.growth ? (plot.growth / seed.stages) * 100 : 0;
    
    return (
      <div
        onClick={handleClick}
        className={`${bgClass} border-2 ${borderClass} ${shadowClass} rounded-xl p-2 md:p-3 cursor-pointer hover:scale-105 transition-all text-center relative overflow-hidden`}
      >
        {/* Progress bar background */}
        {plot.state === "growing" && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-green-400/30 transition-all"
            style={{ height: `${progress}%` }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {plot.state === "empty" && (
            <div className="text-gray-400">
              <div className="text-lg md:text-xl">🌱</div>
              <div className="text-[10px] md:text-xs opacity-60">Plant</div>
            </div>
          )}
          {plot.state === "withered" && (
            <div>
              <div className="text-lg md:text-xl">💀</div>
              <div className="text-[10px] md:text-xs text-red-600">Clear</div>
            </div>
          )}
          {(plot.state === "planted" || plot.state === "growing" || plot.state === "grown") && (
            <div>
              <div className="text-xl md:text-2xl">{emoji}</div>
              <div className="text-[10px] md:text-xs font-medium">
                {plot.state === "grown" ? (
                  <span className="text-green-600 font-bold">Ready!</span>
                ) : plot.state === "planted" ? (
                  <span className="text-blue-500">Water me!</span>
                ) : (
                  <span>{plot.growth}/{seed?.stages || 0}</span>
                )}
              </div>
              {plot.infested && <span className="text-[10px] text-red-500">🐛 Infested!</span>}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-2 md:p-4">
      {/* Header - Cleaner Design */}
      <div className="mb-4 space-y-2">
        {/* Main Stats Bar */}
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-2">
                <span className="text-sm font-medium">Coins</span>
                <span className="text-lg font-bold">🪙 {coins}</span>
              </div>
              <div className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                <span className="text-sm font-medium">Score</span>
                <span className="text-lg font-bold">⭐ {score}</span>
              </div>
              <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                <span className="text-sm font-medium">Harvests</span>
                <span className="text-lg font-bold">🌾 {totalHarvests}</span>
              </div>
              <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                <span className="text-sm font-medium">Grid</span>
                <span className="text-lg font-bold">📏 {gridSize}x{gridSize}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Environment & Controls Bar */}
        <div className="flex gap-2 flex-wrap">
          <Card className="flex-1 min-w-[200px]">
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  {SEASON_EFFECTS[currentSeason].name}
                </Badge>
                <Badge variant="secondary">
                  {weather.type === "Sunny" ? "☀️" : 
                   weather.type === "Rain" ? "🌧️" :
                   weather.type === "Drought" ? "🏜️" :
                   weather.type === "Storm" ? "⛈️" :
                   weather.type === "Frost" ? "❄️" :
                   weather.type === "Pests" ? "🐛" : ""} {weather.type}
                </Badge>
                {combo > 0 && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                    🔥 Combo x{combo}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  onClick={() => setPaused(!paused)} 
                  size="sm"
                  variant={paused ? "default" : "outline"}
                >
                  {paused ? "▶️" : "⏸️"}
                </Button>
                <Button 
                  onClick={() => {
                    if (confirm("Reset all progress and start over?")) {
                      localStorage.removeItem(SAVE_KEY);
                      window.location.reload();
                    }
                  }} 
                  size="sm" 
                  variant="ghost"
                >
                  🔄
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Achievements Progress */}
        {achievements.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {Object.entries(ACHIEVEMENTS).map(([id, ach]) => (
              <Badge 
                key={id} 
                variant={achievements.includes(id) ? "default" : "outline"}
                className="shrink-0"
              >
                {ach.emoji}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Tools Toolbar */}
      {Object.values(tools).some(t => t) && (
        <Card className="mb-4">
          <CardContent className="p-2">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium">Tools:</span>
              {Object.entries(DEFAULT_RULES.tools).map(([toolId, tool]) => {
                const owned = tools[toolId];
                if (!owned || owned === 0) return null;
                
                const isSelected = selectedTool === toolId;
                const count = tool.type === "consumable" ? owned : null;
                
                return (
                  <Button
                    key={toolId}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedTool(isSelected ? null : toolId)}
                    className="gap-1"
                  >
                    <span>{tool.emoji}</span>
                    <span className="hidden md:inline">{tool.name}</span>
                    {count && <Badge variant="secondary">{count}</Badge>}
                  </Button>
                );
              })}
              {selectedTool && (
                <Badge variant="destructive" className="ml-auto">
                  Click plot to use {DEFAULT_RULES.tools[selectedTool].name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Farm Grid */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>🌾 Your Farm</CardTitle>
              {gridSize < MAX_SIZE && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => expandGrid()}
                >
                  📏 Expand ({100 * (gridSize - MIN_SIZE + 1)}🪙)
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="grid gap-1 md:gap-2"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {plots.map((plot, i) => (
                <PlotCard key={i} plot={plot} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Shop */}
        <Card>
          <CardHeader>
            <CardTitle>🏪 Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={shopTab} onValueChange={setShopTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                <TabsTrigger value="seeds">🌱 Seeds</TabsTrigger>
                <TabsTrigger value="tools">🛠️ Tools</TabsTrigger>
                <TabsTrigger value="buildings">🏗️ Buildings</TabsTrigger>
                <TabsTrigger value="livestock">🐄 Animals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="seeds" className="space-y-2">
                {Object.entries(DEFAULT_RULES.seeds).map(([seed, data]) => (
                  <Button
                    key={seed}
                    onClick={() => buy(seed, 1)}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={coins < data.shopPrice}
                  >
                    <span>{data.emoji} {seed} ({inventory[seed] || 0})</span>
                    <span>{data.shopPrice} 🪙</span>
                  </Button>
                ))}
              </TabsContent>
              
              <TabsContent value="tools" className="space-y-2">
                {Object.entries(DEFAULT_RULES.tools).map(([toolId, tool]) => {
                  const owned = tools[toolId] || 0;
                  const isOwned = tool.type === "consumable" ? owned : owned === true;
                  const canBuy = tool.type === "consumable" || !isOwned;
                  
                  return (
                    <Button
                      key={toolId}
                      onClick={() => buyTool(toolId)}
                      variant="outline"
                      className="w-full justify-between h-auto py-2"
                      disabled={coins < tool.price || !canBuy}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tool.emoji}</span>
                          <span className="font-medium">{tool.name}</span>
                          {tool.type === "consumable" && (
                            <Badge variant="secondary">{owned}</Badge>
                          )}
                          {isOwned && tool.type !== "consumable" && (
                            <Badge variant="default">✓</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{tool.description}</span>
                      </div>
                      <span className="font-bold">
                        {!canBuy ? "Owned" : `${tool.price} 🪙`}
                      </span>
                    </Button>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="buildings" className="space-y-2">
                {Object.entries(DEFAULT_RULES.buildings).map(([building, data]) => (
                  <Button
                    key={building}
                    onClick={() => buy(building, 1)}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={coins < data.price || buildings[building]}
                  >
                    <span>{data.emoji} {data.name}</span>
                    <span>{buildings[building] ? "Owned" : `${data.price} 🪙`}</span>
                  </Button>
                ))}
              </TabsContent>
              
              <TabsContent value="livestock" className="space-y-2">
                {Object.entries(DEFAULT_RULES.livestock).map(([animal, data]) => (
                  <Button
                    key={animal}
                    onClick={() => buyLivestock(animal)}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={coins < data.price}
                  >
                    <span>{data.emoji} {data.name} ({livestock[animal] || 0})</span>
                    <div className="text-right">
                      <div>{data.price} 🪙</div>
                      <div className="text-xs">Produces {data.productEmoji}</div>
                    </div>
                  </Button>
                ))}
                
                {Object.keys(livestock).length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded">
                    <div className="font-semibold mb-2">🐮 Your Animals:</div>
                    {Object.entries(livestock).map(([animal, count]) => {
                      const data = DEFAULT_RULES.livestock[animal];
                      return count > 0 && (
                        <div key={animal} className="flex justify-between text-sm">
                          <span>{data.emoji} {count}x {data.name}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => collectFromLivestock(animal)}
                          >
                            Collect {data.productEmoji}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-sm">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-3 rounded-lg shadow-lg animate-pulse ${
              n.type === "error" ? "bg-red-100 text-red-800" :
              n.type === "success" ? "bg-green-100 text-green-800" :
              "bg-blue-100 text-blue-800"
            }`}
          >
            {n.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmSimCanvasFixed;