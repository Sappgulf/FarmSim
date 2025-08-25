import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  AlertTriangle, CloudDrizzle, Sun, Bug, Sprout, Droplets, Zap, Timer, Store, Hammer, 
  Coins, Trophy, Target, Leaf, Snowflake, Wind, Heart, Star, Gift, ArrowUp, Moon,
  CloudRain, CloudLightning, Flower, Calendar, Thermometer, Umbrella
} from "lucide-react";

/**
 * Enhanced Farm Simulation Game
 * Features: Advanced weather system, achievements, better visuals, sound effects, and more!
 * NEW: Visual enhancements, crop diseases, bee pollination, crop rotation, weather forecasting
 */

const LEVELS = [
  { id: "lvl1", label: "Novice Farmer", targetCoins: 100, minutes: 6, reward: 25, difficulty: "Easy" },
  { id: "lvl2", label: "Growing Skills", targetCoins: 200, minutes: 8, reward: 40, difficulty: "Medium" },
  { id: "lvl3", label: "Master Gardener", targetCoins: 350, minutes: 10, reward: 70, difficulty: "Hard" },
  { id: "endless", label: "Endless Farm", targetCoins: 999999, minutes: 9999, reward: 0, difficulty: "∞" },
];

// Advanced Economy Constants
const FUTURES_CONTRACT_TYPES = {
  buy: "Buy Contract (Bet on price increase)",
  sell: "Sell Contract (Bet on price decrease)"
};

const MARKET_TYPES = {
  domestic: { name: "Local Market", emoji: "🏪", volatility: 0.1, basePremium: 0 },
  international: { name: "Global Market", emoji: "🌍", volatility: 0.25, basePremium: 0.2 },
  luxury: { name: "Premium Market", emoji: "💎", volatility: 0.4, basePremium: 0.5 }
};

const ECONOMIC_EVENTS = [
  { id: "drought", name: "Drought Season", emoji: "🏜️", description: "Water scarcity increases crop prices", duration: 180, effects: { crop_price: 1.5 } },
  { id: "boom", name: "Economic Boom", emoji: "📈", description: "High demand boosts all crop values", duration: 120, effects: { crop_price: 1.3 } },
  { id: "recession", name: "Market Recession", emoji: "📉", description: "Economic slowdown reduces crop prices", duration: 240, effects: { crop_price: 0.7 } },
  { id: "export_ban", name: "Export Restrictions", emoji: "🚫", description: "International market temporarily closed", duration: 90, effects: { international_closed: true } },
  { id: "luxury_trend", name: "Luxury Food Trend", emoji: "🍾", description: "Premium market prices soar", duration: 150, effects: { luxury_premium: 2.0 } }
];

// Competition & Social Features
const COMPETITION_TYPES = {
  harvest_race: { name: "Harvest Race", emoji: "🏁", description: "Harvest as many crops as possible", duration: 300, reward: { coins: 500, reputation: 25 } },
  efficiency_challenge: { name: "Efficiency Challenge", emoji: "⚡", description: "Maximize value per plot", duration: 600, reward: { coins: 750, reputation: 35 } },
  quality_contest: { name: "Quality Contest", emoji: "🏆", description: "Grow the highest quality crops", duration: 450, reward: { coins: 600, reputation: 30 } },
  speed_farming: { name: "Speed Farming", emoji: "💨", description: "Fastest growth time", duration: 180, reward: { coins: 400, reputation: 20 } },
  diversity_competition: { name: "Diversity Competition", emoji: "🌈", description: "Grow the most crop types", duration: 900, reward: { coins: 1000, reputation: 50 } }
};

// Farm Customization Constants
const FARM_THEMES = {
  classic: { name: "Classic Farm", emoji: "🚜", description: "Traditional farming style", unlockedLevel: 1 },
  modern: { name: "Modern Tech", emoji: "🤖", description: "Futuristic farming technology", unlockedLevel: 5 },
  magical: { name: "Enchanted Garden", emoji: "✨", description: "Magical and mystical atmosphere", unlockedLevel: 10 },
  rustic: { name: "Country Rustic", emoji: "🌳", description: "Cozy countryside charm", unlockedLevel: 3 },
  tropical: { name: "Tropical Paradise", emoji: "🌺", description: "Island paradise theme", unlockedLevel: 8 }
};

const DECORATION_ITEMS = {
  fence: { name: "Wooden Fence", emoji: "🚧", cost: 50, description: "Decorative fence around plots", unlockedLevel: 1 },
  scarecrow: { name: "Scarecrow", emoji: "🪴", cost: 100, description: "Keeps birds away, +10% yield", unlockedLevel: 2 },
  windmill: { name: "Windmill", emoji: "🌪️", cost: 200, description: "Decorative windmill, generates 1 energy", unlockedLevel: 3 },
  garden_gnome: { name: "Garden Gnome", emoji: "🧙‍♂️", cost: 150, description: "Lucky garden gnome, +5% luck", unlockedLevel: 4 },
  fountain: { name: "Garden Fountain", emoji: "⛲", cost: 300, description: "Beautiful fountain, +water efficiency", unlockedLevel: 5 },
  birdhouse: { name: "Birdhouse", emoji: "🏠", cost: 75, description: "Attracts friendly birds", unlockedLevel: 2 },
  statue: { name: "Farm Statue", emoji: "🗿", cost: 400, description: "Impressive statue, +reputation", unlockedLevel: 6 },
  lantern: { name: "Garden Lantern", emoji: "🏮", cost: 125, description: "Lights up at night", unlockedLevel: 3 },
  bench: { name: "Garden Bench", emoji: "🪑", cost: 200, description: "Peaceful resting spot", unlockedLevel: 4 },
  arbor: { name: "Garden Arbor", emoji: "🌿", cost: 350, description: "Romantic garden feature", unlockedLevel: 7 }
};

const DEFAULT_RULES = {
  seeds: {
    carrot: { stages: 3, secondsPerStage: 8, baseValue: 12, shopPrice: 5, emoji: "🥕", rarity: "common", season: "spring", family: "root" },
    potato: { stages: 3, secondsPerStage: 10, baseValue: 15, shopPrice: 7, emoji: "🥔", rarity: "common", season: "fall", family: "root" },
    corn: { stages: 4, secondsPerStage: 12, baseValue: 22, shopPrice: 10, emoji: "🌽", rarity: "uncommon", season: "summer", family: "grain" },
    tomato: { stages: 4, secondsPerStage: 14, baseValue: 28, shopPrice: 14, emoji: "🍅", rarity: "uncommon", season: "summer", family: "fruit" },
    strawberry: { stages: 5, secondsPerStage: 16, baseValue: 35, shopPrice: 20, emoji: "🍓", rarity: "rare", season: "spring", family: "berry" },
    pumpkin: { stages: 6, secondsPerStage: 20, baseValue: 55, shopPrice: 30, emoji: "🎃", rarity: "epic", season: "fall", family: "gourd" },
    sunflower: { stages: 5, secondsPerStage: 18, baseValue: 42, shopPrice: 25, emoji: "🌻", rarity: "rare", season: "summer", family: "flower" },
    // NEW: More diverse crops for rotation system
    lettuce: { stages: 3, secondsPerStage: 6, baseValue: 8, shopPrice: 3, emoji: "🥬", rarity: "common", season: "spring", family: "leaf" },
    bellPepper: { stages: 4, secondsPerStage: 15, baseValue: 32, shopPrice: 18, emoji: "🫑", rarity: "uncommon", season: "summer", family: "fruit" },
    garlic: { stages: 3, secondsPerStage: 12, baseValue: 18, shopPrice: 8, emoji: "🧄", rarity: "common", season: "fall", family: "bulb" },
  },
  buildings: {
    barn: { price: 200, emoji: "🏚️", name: "Barn", description: "Stores crops and provides +20% harvest value", effect: "storage", bonus: 0.2 },
    greenhouse: { price: 350, emoji: "🏡", name: "Greenhouse", description: "All crops grow 50% faster regardless of weather", effect: "growth", bonus: 0.5 },
    silo: { price: 150, emoji: "🗼", name: "Silo", description: "Automatically sells crops when storage is full", effect: "auto_sell", bonus: 1 },
    workshop: { price: 500, emoji: "🏭", name: "Workshop", description: "Enables crop processing into valuable products", effect: "processing", bonus: 1 },
    windmill: { price: 400, emoji: "🌪️", name: "Windmill", description: "Generates +5 coins per minute passively", effect: "income", bonus: 5 },
    // NEW: Beehive for pollination system
    beehive: { price: 250, emoji: "🐝", name: "Beehive", description: "Bees pollinate crops for +25% yield and produce honey", effect: "pollination", bonus: 0.25 },
  },
  livestock: {
    chicken: { price: 80, emoji: "🐔", name: "Chicken", description: "Produces eggs every 2 minutes", product: "egg", interval: 120, value: 8 },
    cow: { price: 200, emoji: "🐄", name: "Cow", description: "Produces milk every 5 minutes", product: "milk", interval: 300, value: 25 },
    pig: { price: 150, emoji: "🐷", name: "Pig", description: "Finds truffles every 10 minutes", product: "truffle", interval: 600, value: 45 },
    sheep: { price: 120, emoji: "🐑", name: "Sheep", description: "Produces wool every 8 minutes", product: "wool", interval: 480, value: 35 },
  },
  processing: {
    "carrot": { output: "carrot_juice", emoji: "🥤", multiplier: 2.5, name: "Carrot Juice" },
    "corn": { output: "popcorn", emoji: "🍿", multiplier: 3.0, name: "Popcorn" },
    "tomato": { output: "tomato_sauce", emoji: "🍅", multiplier: 2.8, name: "Tomato Sauce" },
    "strawberry": { output: "jam", emoji: "🍓", multiplier: 4.0, name: "Strawberry Jam" },
    "pumpkin": { output: "pumpkin_pie", emoji: "🥧", multiplier: 4.5, name: "Pumpkin Pie" },
    // NEW: Honey processing from beehive
    "honey": { output: "honey_jar", emoji: "🍯", multiplier: 2.0, name: "Honey Jar" },
  },
  fertilizer: { shopPrice: 8, speedBonusPerStack: 0.5, maxStacks: 3 },
  pesticide: { shopPrice: 6 },
  wateringCan: { shopPrice: 40, efficiency: 1.4 },
  sprinkler: { shopPrice: 120, radius: 1 },
  scarecrow: { shopPrice: 80, protection: 2 },
  // NEW: Disease control and bee management
  fungicide: { shopPrice: 12, description: "Treats crop diseases" },
  beeFeed: { shopPrice: 15, description: "Increases bee happiness and pollination" },
  dryWitherSeconds: 80,
  tools: {
    fertilizer: { shopPrice: 8, description: "Speeds up crop growth" },
    pesticide: { shopPrice: 6, description: "Eliminates pest infestations" },
    wateringCan: { shopPrice: 40, description: "Enhanced watering efficiency" },
    sprinkler: { shopPrice: 120, description: "Automatic watering system" },
    scarecrow: { shopPrice: 80, description: "Protects crops from pests" },
    fungicide: { shopPrice: 12, description: "Treats crop diseases" },
    beeFeed: { shopPrice: 15, description: "Increases bee happiness and pollination" },
  },
};

// NEW: Crop disease system
const CROP_DISEASES = {
  blight: { name: "Blight", emoji: "🦠", effect: "Reduces yield by 40%", spreadChance: 0.15, cureItem: "fungicide" },
  rust: { name: "Rust", emoji: "🟫", effect: "Slows growth by 30%", spreadChance: 0.12, cureItem: "fungicide" },
  wilt: { name: "Wilt", emoji: "🥀", effect: "Increases water needs", spreadChance: 0.10, cureItem: "fungicide" },
  mosaic: { name: "Mosaic", emoji: "🎭", effect: "Random growth issues", spreadChance: 0.08, cureItem: "fungicide" },
};

// NEW: Crop rotation bonuses
const CROP_ROTATION = {
  root: { next: ["leaf", "flower"], bonus: 0.2, description: "Root crops enrich soil for leafy plants" },
  leaf: { next: ["fruit", "grain"], bonus: 0.15, description: "Leafy crops prepare soil for fruits" },
  fruit: { next: ["root", "bulb"], bonus: 0.25, description: "Fruits provide nutrients for root crops" },
  grain: { next: ["root", "leaf"], bonus: 0.18, description: "Grains improve soil structure" },
  flower: { next: ["fruit", "berry"], bonus: 0.22, description: "Flowers attract pollinators for fruits" },
  berry: { next: ["root", "grain"], bonus: 0.20, description: "Berries add organic matter to soil" },
  bulb: { next: ["leaf", "flower"], bonus: 0.16, description: "Bulbs condition soil for other crops" },
  gourd: { next: ["root", "grain"], bonus: 0.19, description: "Gourds improve soil drainage" },
};

// NEW: Weather forecasting system
const WEATHER_FORECAST = {
  sunny: { probability: 0.4, duration: "25-35s", effects: "Normal growth, moderate water needs" },
  rain: { probability: 0.25, duration: "30-40s", effects: "Fast growth, automatic watering, +20% yield" },
  drought: { probability: 0.15, duration: "20-30s", effects: "Slow growth, increased withering, -30% yield" },
  pests: { probability: 0.12, duration: "25-35s", effects: "Pest infestations, growth halted until treated" },
  storm: { probability: 0.05, duration: "15-25s", effects: "Growth slowed, no withering, wind effects" },
  frost: { probability: 0.03, duration: "20-30s", effects: "Growth stopped, frost damage possible" },
};

const ACHIEVEMENTS = [
  { id: "first_harvest", name: "First Harvest", desc: "Harvest your first crop", reward: 15, icon: "🌱" },
  { id: "weathered", name: "Weather Expert", desc: "Survive 3 weather events", reward: 25, icon: "⛈️" },
  { id: "coin_collector", name: "Coin Collector", desc: "Earn 300 coins total", reward: 40, icon: "💰" },
  { id: "speed_farmer", name: "Speed Farmer", desc: "Complete Level 1 in under 4 minutes", reward: 30, icon: "⚡" },
  { id: "field_master", name: "Field Master", desc: "Unlock the maximum field size", reward: 100, icon: "🏆" },
  { id: "season_expert", name: "Season Expert", desc: "Plant 5 crops in their optimal season", reward: 35, icon: "🍂" },
  { id: "mass_producer", name: "Mass Producer", desc: "Harvest 25 crops total", reward: 60, icon: "🚜" },
  { id: "quality_farmer", name: "Quality Farmer", desc: "Harvest 5 high-quality crops", reward: 45, icon: "⭐" },
  { id: "pest_controller", name: "Pest Controller", desc: "Eliminate 10 pest infestations", reward: 30, icon: "🧽" },
  { id: "millionaire", name: "Farm Millionaire", desc: "Earn 800 coins total", reward: 150, icon: "💎" },
  // NEW: Disease and pollination achievements
  { id: "disease_fighter", name: "Disease Fighter", desc: "Cure 15 crop diseases", reward: 50, icon: "🦠" },
  { id: "bee_keeper", name: "Bee Keeper", desc: "Harvest 10 honey products", reward: 40, icon: "🐝" },
  { id: "rotation_master", name: "Rotation Master", desc: "Use crop rotation 20 times", reward: 60, icon: "🔄" },
  { id: "weather_forecaster", name: "Weather Forecaster", desc: "Successfully predict 5 weather changes", reward: 35, icon: "🌤️" },
];

const SEASONS = ["spring", "summer", "fall", "winter"];
const SEASON_EFFECTS = {
  spring: { growthBonus: 1.2, name: "🌸 Spring", color: "text-green-500" },
  summer: { growthBonus: 1.1, name: "☀️ Summer", color: "text-yellow-500" },
  fall: { growthBonus: 1.0, name: "🍂 Fall", color: "text-orange-500" },
  winter: { growthBonus: 0.8, name: "❄️ Winter", color: "text-blue-500" },
};

// Market system for dynamic pricing
const MARKET_TRENDS = {
  high: { multiplier: 1.5, name: "📈 High Demand", color: "text-emerald-600" },
  normal: { multiplier: 1.0, name: "📊 Normal", color: "text-slate-600" },
  low: { multiplier: 0.7, name: "📉 Low Demand", color: "text-red-600" },
};

const MAX_SIZE = 5;
const MIN_SIZE = 3;

const EXPANSION_COSTS = {
  4: 60,
  5: 180,
};

const WEATHER_EFFECTS = {
  Sunny: { icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50" },
  Rain: { icon: CloudDrizzle, color: "text-blue-500", bg: "bg-blue-50" },
  Drought: { icon: Sun, color: "text-orange-500", bg: "bg-orange-50" },
  Storm: { icon: Wind, color: "text-purple-500", bg: "bg-purple-50" },
  Frost: { icon: Snowflake, color: "text-cyan-500", bg: "bg-cyan-50" },
  Pests: { icon: Bug, color: "text-red-500", bg: "bg-red-50" },
};

// NEW: Day/night cycle and visual effects
const DAY_NIGHT_CYCLE = {
  day: { name: "☀️ Day", bg: "from-emerald-50 via-blue-50 to-purple-50", text: "text-slate-800" },
  dusk: { name: "🌅 Dusk", bg: "from-orange-50 via-pink-50 to-purple-50", text: "text-orange-800" },
  night: { name: "🌙 Night", bg: "from-slate-900 via-blue-900 to-purple-900", text: "text-slate-200" },
  dawn: { name: "🌄 Dawn", bg: "from-yellow-50 via-orange-50 to-emerald-50", text: "text-yellow-800" },
};

function nowSec() { return Math.floor(Date.now() / 1000); }

function newPlot(state = "empty") {
  if (state === "locked") return {
    state: "locked", seed: null, growth: 0, watered: false,
    plantedAt: null, lastWateredAt: null, fertilized: 0, infested: false,
    boosted: false, quality: 1, disease: null, lastCropFamily: null, rotationBonus: 0,
    beePollinated: false, lastHarvested: null,
  };
  return {
    state, seed: null, growth: 0, watered: false,
    plantedAt: null, lastWateredAt: null, fertilized: 0, infested: false,
    boosted: false, quality: 1, disease: null, lastCropFamily: null, rotationBonus: 0,
    beePollinated: false, lastHarvested: null,
  };
}

function makeGrid(size) {
  const total = size * size;
  const arr = [];
  for (let i = 0; i < total; i++) {
    arr.push(newPlot(i < MIN_SIZE * MIN_SIZE ? "empty" : "locked"));
  }
  return arr;
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimeRemaining(endTime, currentTime) {
  const remaining = Math.max(0, endTime - currentTime);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Local save helpers with compression
const SAVE_KEY = "farm_sim_enhanced_v1";
function loadSave() {
  try { 
    const s = localStorage.getItem(SAVE_KEY); 
    if (s) return JSON.parse(s); 
  } catch {}
  return null;
}
function saveState(s) { 
  try { 
    localStorage.setItem(SAVE_KEY, JSON.stringify(s)); 
  } catch {} 
}

export default function FarmSimCanvas() {
  // --- config ---
  const [useApi, setUseApi] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:5000");

  // --- game state ---
  const saved = useMemo(() => loadSave(), []);

  const [rules, setRules] = useState(saved?.rules || DEFAULT_RULES);
  const [gridSize, setGridSize] = useState(saved?.gridSize || MIN_SIZE);
  const [plots, setPlots] = useState(saved?.plots || makeGrid(saved?.gridSize || MIN_SIZE));
  const [coins, setCoins] = useState(saved?.coins || 50);
  const [score, setScore] = useState(saved?.score || 0);
  const [totalEarned, setTotalEarned] = useState(saved?.totalEarned || 0);
  const [name, setName] = useState(saved?.name || "Farmer");
  const [inventory, setInventory] = useState(saved?.inventory || { 
    carrot: 5, potato: 3, corn: 2, tomato: 1, strawberry: 1, pumpkin: 0, sunflower: 0,
    lettuce: 3, bellPepper: 1, garlic: 2,
    fertilizer: 3, pesticide: 2, wateringCan: 0, sprinkler: 0, scarecrow: 0,
    fungicide: 2, beeFeed: 1, honey: 0
  });
  const [selectedSeed, setSelectedSeed] = useState(saved?.selectedSeed || "carrot");
  const [achievements, setAchievements] = useState(saved?.achievements || []);
  const [weatherEvents, setWeatherEvents] = useState(saved?.weatherEvents || 0);
  const [totalHarvests, setTotalHarvests] = useState(saved?.totalHarvests || 0);
  const [qualityHarvests, setQualityHarvests] = useState(saved?.qualityHarvests || 0);
  const [pestEliminations, setPestEliminations] = useState(saved?.pestEliminations || 0);
  const [seasonalPlants, setSeasonalPlants] = useState(saved?.seasonalPlants || 0);
  
  // New systems state
  const [buildings, setBuildings] = useState(saved?.buildings || {});
  const [livestock, setLivestock] = useState(saved?.livestock || []);
  const [processedGoods, setProcessedGoods] = useState(saved?.processedGoods || {});
  const [npcs, setNpcs] = useState(saved?.npcs || []);
  const [events, setEvents] = useState(saved?.events || []);
  const [automation, setAutomation] = useState(saved?.automation || {});
  
  // NEW: Enhanced visual and gameplay state
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState(saved?.currentTimeOfDay || "day");
  const [weatherForecast, setWeatherForecast] = useState(saved?.weatherForecast || []);
  const [beeHappiness, setBeeHappiness] = useState(saved?.beeHappiness || 100);
  const [diseasesCured, setDiseasesCured] = useState(saved?.diseasesCured || 0);
  const [rotationUses, setRotationUses] = useState(saved?.rotationUses || 0);
  const [weatherPredictions, setWeatherPredictions] = useState(saved?.weatherPredictions || 0);
  const [honeyProduced, setHoneyProduced] = useState(saved?.honeyProduced || 0);
  
  // New advanced features
  const [currentSeason, setCurrentSeason] = useState(saved?.currentSeason || "spring");
  const [seasonEndsAt, setSeasonEndsAt] = useState(saved?.seasonEndsAt || nowSec() + 120);
  const [marketTrends, setMarketTrends] = useState(saved?.marketTrends || {});
  const [sprinklers, setSprinklers] = useState(saved?.sprinklers || []);
  const [scarecrows, setScarecrows] = useState(saved?.scarecrows || []);
  
  // Advanced Economy State
  const [futuresContracts, setFuturesContracts] = useState(saved?.futuresContracts || []);
  const [economicEvents, setEconomicEvents] = useState(saved?.economicEvents || []);
  const [marketPrices, setMarketPrices] = useState(saved?.marketPrices || {});
  const [reputation, setReputation] = useState(saved?.reputation || 0);
  const [competitionsActive, setCompetitionsActive] = useState(saved?.competitionsActive || []);
  const [actionHistory, setActionHistory] = useState(saved?.actionHistory || []);
  
  // Farm Customization State
  const [farmTheme, setFarmTheme] = useState(saved?.farmTheme || "classic");
  const [decorations, setDecorations] = useState(saved?.decorations || []);
  const [farmLevel, setFarmLevel] = useState(saved?.farmLevel || 1);
  const [combo, setCombo] = useState(saved?.combo || 0);
  const [comboTimer, setComboTimer] = useState(saved?.comboTimer || 0);
  const [particles, setParticles] = useState(saved?.particles || []);
  const [soundEnabled, setSoundEnabled] = useState(saved?.soundEnabled ?? true);

  const [levelId, setLevelId] = useState(saved?.levelId || LEVELS[0].id);
  const level = useMemo(() => LEVELS.find(l => l.id === levelId), [levelId]);
  const [levelEndsAt, setLevelEndsAt] = useState(saved?.levelEndsAt || nowSec() + (LEVELS[0]?.minutes || 5) * 60);
  const [levelStatus, setLevelStatus] = useState(saved?.levelStatus || "playing");
  const [levelStartedAt, setLevelStartedAt] = useState(saved?.levelStartedAt || nowSec());

  const [weather, setWeather] = useState(saved?.weather || { type: "Sunny", endsAt: nowSec() + 30 });
  const [log, setLog] = useState(saved?.log || ["🌱 Welcome to your farm! Plant seeds and watch them grow.", "💡 Tip: Right-click plots to fertilize or spray pesticide."]);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(nowSec());

  // Simple growth timer system
  const [gameTime, setGameTime] = useState(saved?.gameTime || 0);
  const [lastGrowthTick, setLastGrowthTick] = useState(saved?.lastGrowthTick || nowSec());

  // persist enhanced state (debounced to avoid excessive writes)
  const _saveTimeout = useRef(null);
  useEffect(() => {
    // debounce saves but avoid infinite loops
    if (typeof window === "undefined") return;
    if (_saveTimeout.current) clearTimeout(_saveTimeout.current);
    _saveTimeout.current = setTimeout(() => {
      try {
        const snapshot = {
          version: 1,
          savedAt: Date.now(),
          rules, gridSize, plots: plots.slice(0, 25), // limit plot size
          coins, score, totalEarned, name, inventory, selectedSeed,
          levelId, levelEndsAt, levelStatus, levelStartedAt,
          achievements, weather, currentSeason
        };
        saveState(snapshot);
      } catch (e) {
        console.error("Save failed:", e);
      }
    }, 1000); // longer debounce

    return () => {
      if (_saveTimeout.current) {
        clearTimeout(_saveTimeout.current);
        _saveTimeout.current = null;
      }
    };
  }, [coins, score, levelStatus]); // minimal dependencies

  // Simple growth timer system - TEMPORARILY DISABLED FOR DEBUGGING
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000; // Use direct time instead of nowSec()
      setCurrentTime(now);
      
      // Simple game time counter
      setGameTime(prev => prev + 1);
      
      // Process plant growth every 5 seconds
      if (now - lastGrowthTick >= 5) {
        setLastGrowthTick(now);
        
        // Inline growth processing
        setPlots(prev => prev.map(p => {
          if (p.state !== "planted" && p.state !== "growing") return p;
          
          // Simple growth amount
          let growthAmount = 10;
          
          // Building bonuses
          if (buildings?.greenhouse) {
            growthAmount = Math.round(growthAmount * 1.5);
          }
          
          // Weather effects
          if (weather?.type === "Rainy") {
            growthAmount = Math.round(growthAmount * 1.3);
          } else if (weather?.type === "Drought") {
            growthAmount = Math.round(growthAmount * 0.7);
          }
          
          const newGrowth = Math.min(100, p.growth + growthAmount);
          const newState = newGrowth >= 100 ? "grown" : "growing";
          
          return {
            ...p,
            growth: newGrowth,
            state: newState
          };
        }));
      }
      
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastGrowthTick, buildings?.greenhouse, weather?.type]);
  */

  // --- enhanced helpers ---
  const addLog = (msg) => setLog(l => [`${new Date().toLocaleTimeString()} ${msg}`, ...l].slice(0, 100));
  
  const addNotification = (msg, type = "info") => {
    const id = Date.now() + Math.random(); // Ensure unique IDs
    setNotifications(n => [...n, { id, msg, type }]);
    // Use a more reliable timeout mechanism
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== id));
    }, 4000); // Increased to 4 seconds for better visibility
  };

  // NEW: Enhanced visual and gameplay helpers
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "day";
    if (hour >= 12 && hour < 18) return "dusk";
    if (hour >= 18 || hour < 6) return "night";
    return "dawn";
  };

  const generateWeatherForecast = () => {
    const forecast = [];
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      let weatherType = "sunny";
      if (roll < 0.4) weatherType = "sunny";
      else if (roll < 0.65) weatherType = "rain";
      else if (roll < 0.80) weatherType = "drought";
      else if (roll < 0.92) weatherType = "pests";
      else if (roll < 0.97) weatherType = "storm";
      else weatherType = "frost";
      
      forecast.push({
        type: weatherType,
        probability: WEATHER_FORECAST[weatherType].probability,
        effects: WEATHER_FORECAST[weatherType].effects,
        time: i + 1
      });
    }
    return forecast;
  };

  const checkCropRotation = (plotIndex, newCropFamily) => {
    const plot = plots[plotIndex];
    if (!plot.lastCropFamily || !CROP_ROTATION[plot.lastCropFamily]) return 0;
    
    const rotation = CROP_ROTATION[plot.lastCropFamily];
    if (rotation.next.includes(newCropFamily)) {
      setRotationUses(prev => prev + 1);
      addLog(`🔄 Crop rotation bonus! ${plot.lastCropFamily} → ${newCropFamily} (+${Math.round(rotation.bonus * 100)}%)`);
      return rotation.bonus;
    }
    return 0;
  };

  const spreadDisease = (infectedPlotIndex) => {
    const plot = plots[infectedPlotIndex];
    if (!plot.disease) return;
    
    const disease = CROP_DISEASES[plot.disease];
    const adjacentPlots = [];
    const gridSize = Math.sqrt(plots.length);
    
    // Find adjacent plots
    for (let i = 0; i < plots.length; i++) {
      if (i === infectedPlotIndex) continue;
      const row1 = Math.floor(infectedPlotIndex / gridSize);
      const col1 = infectedPlotIndex % gridSize;
      const row2 = Math.floor(i / gridSize);
      const col2 = i % gridSize;
      
      if (Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1) {
        adjacentPlots.push(i);
      }
    }
    
    // Try to spread disease to adjacent plots
    adjacentPlots.forEach(plotIndex => {
      const targetPlot = plots[plotIndex];
      if (targetPlot.state === "planted" || targetPlot.state === "growing") {
        if (Math.random() < disease.spreadChance && !targetPlot.disease) {
          setPlots(prev => prev.map((p, idx) => 
            idx === plotIndex ? { ...p, disease: plot.disease } : p
          ));
          addLog(`🦠 Disease spread to plot ${plotIndex + 1}!`);
          addNotification(`Disease spread to plot ${plotIndex + 1}!`, "warning");
        }
      }
    });
  };

  const cureDisease = (plotIndex) => {
    const plot = plots[plotIndex];
    if (!plot.disease || (inventory.fungicide || 0) <= 0) return false;
    
    setInventory(prev => ({ ...prev, fungicide: prev.fungicide - 1 }));
    setPlots(prev => prev.map((p, idx) => 
      idx === plotIndex ? { ...p, disease: null } : p
    ));
    setDiseasesCured(prev => prev + 1);
    
    const disease = CROP_DISEASES[plot.disease];
    addLog(`💊 Cured ${disease.name} on plot ${plotIndex + 1}`);
    addNotification(`Disease cured!`, "success");
    addParticle(plotIndex % gridSize * 120 + 60, Math.floor(plotIndex / gridSize) * 120 + 60, "cure", "💊");
    
    checkAllAchievements();
    return true;
  };

  const pollinateCrop = (plotIndex) => {
    if (!buildings.beehive || beeHappiness < 50) return false;
    
    const plot = plots[plotIndex];
    if (plot.state !== "planted" && plot.state !== "growing") return false;
    
    if (Math.random() < 0.3) { // 30% chance per tick
      setPlots(prev => prev.map((p, idx) => 
        idx === plotIndex ? { ...p, beePollinated: true } : p
      ));
      
      // Produce honey
      if (Math.random() < 0.1) { // 10% chance for honey
        setInventory(prev => ({ ...prev, honey: (prev.honey || 0) + 1 }));
        setHoneyProduced(prev => prev + 1);
        addLog(`🍯 Bees produced honey! (+1 honey)`);
      }
      
      addParticle(plotIndex % gridSize * 120 + 60, Math.floor(plotIndex / gridSize) * 120 + 60, "bee", "🐝");
      return true;
    }
    return false;
  };

  const feedBees = () => {
    if ((inventory.beeFeed || 0) <= 0) return false;
    
    setInventory(prev => ({ ...prev, beeFeed: prev.beeFeed - 1 }));
    setBeeHappiness(prev => Math.min(100, prev + 25));
    addLog(`🍯 Fed the bees! Happiness: ${Math.min(100, beeHappiness + 25)}%`);
    addNotification(`Bees are happier! 🐝`, "success");
    return true;
  };

  // Debug functions for testing all features
  const testAllFeatures = () => {
    console.log("🧪 Starting comprehensive feature test...");
    
    // Test 1: Verify all seeds can be planted
    const allSeeds = Object.keys(rules.seeds);
    console.log(`✅ Available seeds: ${allSeeds.join(", ")}`);
    
    // Debug current inventory
    console.log("🎒 Current inventory:", inventory);
    
    // Test 2: Give resources for testing
    setCoins(5000); // More coins for buildings
    setInventory(prev => ({ ...prev, fertilizer: 50, pesticide: 50 }));
    
    // Give some seeds to test planting
    const newInventory = {};
    allSeeds.forEach(seed => {
      newInventory[seed] = 20;
    });
    setInventory(prev => ({ ...prev, ...newInventory }));
    
    // Test 3: Verify tools
    console.log("🔧 Testing tools...");
    Object.keys(rules.tools || {}).forEach(tool => {
      console.log(`  ${tool}: ${rules.tools[tool].price}🪙 - ${rules.tools[tool].description}`);
    });
    
    // Test 4: Buildings
    console.log("� Available buildings:");
    Object.entries(rules.buildings).forEach(([key, building]) => {
      console.log(`  ${building.emoji} ${building.name}: ${building.price}🪙 - ${building.description}`);
    });
    
    // Test 5: Livestock
    console.log("🐄 Available livestock:");
    Object.entries(rules.livestock).forEach(([key, animal]) => {
      console.log(`  ${animal.emoji} ${animal.name}: ${animal.price}🪙 - ${animal.description}`);
    });
    
    // Test 6: Processing
    console.log("🏭 Processing options:");
    Object.entries(rules.processing).forEach(([crop, process]) => {
      console.log(`  ${crop} → ${process.emoji} ${process.name} (${process.multiplier}x value)`);
    });
    
    console.log("🧪 Test setup complete! All features ready for testing!");
    addNotification("Full feature test activated! Check console for details.", "success");
  };

  // --- Import save helper ---
  const validateSaveSnapshot = (snap) => {
    if (!snap || typeof snap !== 'object') return false;
    if (!('version' in snap)) return false;
    if (!('savedAt' in snap)) return false;
    // basic shape checks (allow partial restores)
    if (!('plots' in snap) || !Array.isArray(snap.plots)) return false;
    if (!('coins' in snap) || typeof snap.coins !== 'number') return false;
    return true;
  };

  const importSaveFromFile = async (file) => {
    if (!file) return addNotification('No file selected', 'error');
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt);
      if (!validateSaveSnapshot(parsed)) {
        addNotification('Invalid save file format', 'error');
        return;
      }

      // Apply safe subset of fields to current state
      if (parsed.rules) setRules(parsed.rules);
      if (typeof parsed.gridSize === 'number') setGridSize(parsed.gridSize);
      if (Array.isArray(parsed.plots)) setPlots(parsed.plots);
      if (typeof parsed.coins === 'number') setCoins(parsed.coins);
      if (typeof parsed.score === 'number') setScore(parsed.score);
      if (typeof parsed.totalEarned === 'number') setTotalEarned(parsed.totalEarned);
      if (parsed.name) setName(parsed.name);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.selectedSeed) setSelectedSeed(parsed.selectedSeed);
  if (parsed.achievements) setAchievements(parsed.achievements);
  if (parsed.levelId) setLevelId(parsed.levelId);
  if (parsed.levelEndsAt) setLevelEndsAt(parsed.levelEndsAt);
  if (parsed.levelStatus) setLevelStatus(parsed.levelStatus);
  if (parsed.levelStartedAt) setLevelStartedAt(parsed.levelStartedAt);
  if (typeof parsed.weatherEvents === 'number') setWeatherEvents(parsed.weatherEvents);
  if (typeof parsed.totalHarvests === 'number') setTotalHarvests(parsed.totalHarvests);
  if (typeof parsed.qualityHarvests === 'number') setQualityHarvests(parsed.qualityHarvests);
  if (typeof parsed.pestEliminations === 'number') setPestEliminations(parsed.pestEliminations);
  if (typeof parsed.seasonalPlants === 'number') setSeasonalPlants(parsed.seasonalPlants);
      if (parsed.weather) setWeather(parsed.weather);
      if (parsed.buildings) setBuildings(parsed.buildings);
      if (parsed.livestock) setLivestock(parsed.livestock || []);
      if (parsed.processedGoods) setProcessedGoods(parsed.processedGoods || {});
      if (parsed.npcs) setNpcs(parsed.npcs || []);
      if (parsed.events) setEvents(parsed.events || []);
      if (parsed.automation) setAutomation(parsed.automation || {});
  if (parsed.currentSeason) setCurrentSeason(parsed.currentSeason);
  if (parsed.seasonEndsAt) setSeasonEndsAt(parsed.seasonEndsAt);
  if (parsed.marketTrends) setMarketTrends(parsed.marketTrends || {});
  if (parsed.sprinklers) setSprinklers(parsed.sprinklers || []);
  if (parsed.scarecrows) setScarecrows(parsed.scarecrows || []);
  if (typeof parsed.combo === 'number') setCombo(parsed.combo);
  if (typeof parsed.comboTimer === 'number') setComboTimer(parsed.comboTimer);
  if (parsed.particles) setParticles(parsed.particles || []);
  if (typeof parsed.soundEnabled === 'boolean') setSoundEnabled(parsed.soundEnabled);
      if (parsed.log) setLog(Array.isArray(parsed.log) ? parsed.log.slice(0,100) : []);
      if (parsed.gameTime) setGameTime(parsed.gameTime);
      if (parsed.lastGrowthTick) setLastGrowthTick(parsed.lastGrowthTick);

  // persist to localStorage immediately with a fresh timestamp
  parsed.version = parsed.version ?? 1;
  parsed.savedAt = Date.now();
  saveState(parsed);
      addNotification('Save imported successfully', 'success');
    } catch (e) {
      console.error(e);
      addNotification('Failed to import save: ' + (e?.message || ''), 'error');
    }
  };

  const clearSaveData = () => {
    if (confirm("This will reset all game data. Are you sure?")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  };

  // Advanced Economy Functions
  const generateMarketPrices = () => {
    const newPrices = {};
    Object.keys(rules.seeds).forEach(seedType => {
      const baseValue = rules.seeds[seedType].baseValue;
      const volatility = 0.2; // Base volatility
      const trend = marketTrends[seedType] || 0;
      const randomChange = (Math.random() - 0.5) * volatility;
      const newPrice = Math.max(1, baseValue + (baseValue * (trend + randomChange)));
      newPrices[seedType] = Math.round(newPrice * 100) / 100;
    });
    setMarketPrices(newPrices);
  };

  const buyFuturesContract = (seedType, contractType, amount) => {
    const cost = amount * 10; // Base cost per contract
    if (coins < cost) {
      addNotification("Not enough coins for futures contract!", "error");
      return;
    }

    const contract = {
      id: Date.now(),
      seedType,
      contractType,
      amount,
      entryPrice: marketPrices[seedType] || rules.seeds[seedType].baseValue,
      purchaseTime: nowSec(),
      expiresAt: nowSec() + 300 // 5 minutes
    };

    setFuturesContracts(prev => [...prev, contract]);
    setCoins(prev => prev - cost);
    addNotification(`Futures contract purchased: ${contractType} ${seedType}`, "success");
    logAction("futures_purchase", { seedType, contractType, amount, cost });
  };

  const logAction = (actionType, details = {}) => {
    const actionEntry = {
      timestamp: nowSec(),
      type: actionType,
      details,
      farmLevel,
      reputation
    };
    setActionHistory(prev => [...prev.slice(-49), actionEntry]); // Keep last 50 actions
  };

  const simulateGrowth = () => {
    setPlots(prev => prev.map(p => {
      if (p.state !== "growing" && p.state !== "planted") return p;
      
      let growthAmount = 25;
      
      // Greenhouse bonus: +50% growth speed
      if (buildings.greenhouse) {
        growthAmount = Math.round(growthAmount * (1 + rules.buildings.greenhouse.bonus));
      }
      
      return {
        ...p,
        growth: Math.min(100, p.growth + growthAmount)
      };
    }));
    const greenhouseText = buildings.greenhouse ? " (Greenhouse +50%)" : "";
    addNotification(`Growth accelerated!${greenhouseText}`, "success");
  };

  // Safe automatic growth: call simulateGrowth every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      try { 
        simulateGrowth(); 
      } catch (e) { 
        console.error("Growth error:", e);
      }
    }, 5000);
    return () => clearInterval(id);
  }, []); // run once on mount

  // Update current time every second for real-time countdown
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(nowSec());
      
      // NEW: Update time of day for visual effects
      const newTimeOfDay = getTimeOfDay();
      if (newTimeOfDay !== currentTimeOfDay) {
        setCurrentTimeOfDay(newTimeOfDay);
      }
      
      // NEW: Generate weather forecast every 30 seconds
      if (currentTime % 30 === 0) {
        setWeatherForecast(generateWeatherForecast());
      }
      
      // NEW: Bee pollination system
      if (buildings.beehive && beeHappiness >= 50) {
        plots.forEach((plot, index) => {
          if (plot.state === "planted" || plot.state === "growing") {
            pollinateCrop(index);
          }
        });
      }
      
      // NEW: Disease spreading system
      plots.forEach((plot, index) => {
        if (plot.disease) {
          spreadDisease(index);
        }
      });
      
      // NEW: Bee happiness decay
      if (buildings.beehive && beeHappiness > 0) {
        setBeeHappiness(prev => Math.max(0, prev - 0.1));
      }
      
    }, 1000);
    return () => clearInterval(id);
  }, [currentTime, currentTimeOfDay, plots, buildings.beehive, beeHappiness]);

  // Advanced Economy useEffects
  useEffect(() => {
    // Generate initial market prices
    generateMarketPrices();
    
    // Update market prices every 5 minutes
    const interval = setInterval(generateMarketPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for expired futures contracts
    const expired = futuresContracts.filter(contract => contract.expiresAt <= nowSec());
    expired.forEach(settleFuturesContract);
  }, [currentTime, futuresContracts]);

  useEffect(() => {
    // Trigger random economic events
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 minutes
        triggerEconomicEvent();
      }
    }, 300000);
    return () => clearInterval(eventInterval);
  }, []);

  // Manual season advancement
  const advanceSeason = () => {
    const currentIndex = SEASONS.indexOf(currentSeason);
    const nextSeason = SEASONS[(currentIndex + 1) % SEASONS.length];
    setCurrentSeason(nextSeason);
    addLog(`🌍 Season changed to ${SEASON_EFFECTS[nextSeason].name}`);
    addNotification(`${SEASON_EFFECTS[nextSeason].name} begins!`, "success");
    
    // Update market trends when season changes
    const newTrends = {};
    Object.keys(rules.seeds).forEach(seed => {
      const roll = Math.random();
      if (roll < 0.2) newTrends[seed] = "high";
      else if (roll < 0.4) newTrends[seed] = "low";
      else newTrends[seed] = "normal";
    });
    setMarketTrends(newTrends);
    
    // Reset seasonal achievement tracking
    setSeasonalPlants(0);
  };

  // Change weather manually
  const changeWeather = () => {
    const types = ["Sunny", "Rain", "Drought", "Pests", "Storm", "Frost"];
    const currentIndex = types.indexOf(weather.type);
    const nextWeather = types[(currentIndex + 1) % types.length];
    
    const messages = {
      Rain: "🌧️ Rain showers - all crops are watered and grow faster!",
      Drought: "☀️ Drought conditions - crops wither faster!",
      Pests: "🐛 Pest swarm incoming - keep pesticide ready!",
      Storm: "⛈️ Storm brewing - growth slowed!",
      Frost: "❄️ Frost warning - growth halted temporarily!",
      Sunny: "☀️ Beautiful sunny weather returns!"
    };
    
    setWeather({ type: nextWeather, endsAt: 0 });
    addLog(messages[nextWeather] || "Weather changed.");
    addNotification(messages[nextWeather], nextWeather === "Sunny" ? "success" : "warning");
    
    // NEW: Add weather particles
    addWeatherParticles();
  };

  // Enhanced particle system for visual effects
  const addParticle = (x, y, type, text = "") => {
    const id = Date.now() + Math.random();
    const particle = { 
      id, x, y, type, text, 
      life: 2000, 
      vx: (Math.random() - 0.5) * 100,
      vy: -50 - Math.random() * 50 
    };
    setParticles(p => [...p, particle]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 2000);
  };

  // NEW: Weather particle effects
  const addWeatherParticles = () => {
    if (weather.type === "Rain") {
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * window.innerWidth;
        const y = -20;
        const particle = {
          id: Date.now() + Math.random(),
          x, y, type: "rain",
          life: 3000,
          vx: (Math.random() - 0.5) * 50,
          vy: 100 + Math.random() * 50
        };
        setParticles(p => [...p, particle]);
        setTimeout(() => setParticles(p => p.filter(pt => pt.id !== particle.id)), 3000);
      }
    } else if (weather.type === "Storm") {
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * window.innerWidth;
        const y = -20;
        const particle = {
          id: Date.now() + Math.random(),
          x, y, type: "wind",
          life: 2000,
          vx: 100 + Math.random() * 100,
          vy: (Math.random() - 0.5) * 30
        };
        setParticles(p => [...p, particle]);
        setTimeout(() => setParticles(p => p.filter(pt => pt.id !== particle.id)), 2000);
      }
    } else if (weather.type === "Frost") {
      for (let i = 0; i < 25; i++) {
        const x = Math.random() * window.innerWidth;
        const y = -20;
        const particle = {
          id: Date.now() + Math.random(),
          x, y, type: "snow",
          life: 4000,
          vx: (Math.random() - 0.5) * 30,
          vy: 50 + Math.random() * 30
        };
        setParticles(p => [...p, particle]);
        setTimeout(() => setParticles(p => p.filter(pt => pt.id !== particle.id)), 4000);
      }
    }
  };

  // Sound effects (placeholder - would use actual audio in production)
  const playSound = (type) => {
    if (!soundEnabled) return;
    // Placeholder for sound effects
    console.log(`🔊 Sound: ${type}`);
  };

  // Combo system for consecutive harvests
  const triggerCombo = () => {
    setCombo(c => c + 1);
    setComboTimer(nowSec() + 5); // 5 second combo window
    if (combo >= 3) {
      const bonus = Math.floor(combo * 2);
      setCoins(c => c + bonus);
      addNotification(`🔥 ${combo}x Combo! +${bonus}🪙`, "success");
      playSound("combo");
    }
  };

  // Simple time system
  const getGameTimeString = () => {
    return "Game Running"; // Static for now
  };

  // Market price calculation with seasonal and trend modifiers
  const getMarketPrice = (seedType) => {
    const base = rules.seeds[seedType].baseValue;
    const trend = marketTrends[seedType] || "normal";
    const trendMultiplier = MARKET_TRENDS[trend].multiplier;
    const seasonBonus = rules.seeds[seedType].season === currentSeason ? 1.3 : 1.0;
    return Math.round(base * trendMultiplier * seasonBonus);
  };

  const checkAchievement = (id) => {
    if (achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    
    setAchievements(prev => [...prev, id]);
    setCoins(c => c + achievement.reward);
    addNotification(`🏆 Achievement: ${achievement.name} (+${achievement.reward}🪙)`, "success");
    addLog(`🏆 Unlocked: ${achievement.name} - ${achievement.desc}`);
    playSound("achievement");
    
    // Particle effect for achievement
    addParticle(300, 200, "achievement", achievement.icon);
  };

  // Enhanced achievement checking
  const checkAllAchievements = () => {
    if (totalHarvests >= 1 && !achievements.includes("first_harvest")) checkAchievement("first_harvest");
    if (weatherEvents >= 3 && !achievements.includes("weathered")) checkAchievement("weathered");
    if (totalEarned >= 300 && !achievements.includes("coin_collector")) checkAchievement("coin_collector");
    if (totalEarned >= 800 && !achievements.includes("millionaire")) checkAchievement("millionaire");
    if (totalHarvests >= 25 && !achievements.includes("mass_producer")) checkAchievement("mass_producer");
    if (qualityHarvests >= 5 && !achievements.includes("quality_farmer")) checkAchievement("quality_farmer");
    if (pestEliminations >= 10 && !achievements.includes("pest_controller")) checkAchievement("pest_controller");
    if (seasonalPlants >= 5 && !achievements.includes("season_expert")) checkAchievement("season_expert");
    // NEW: Disease and pollination achievements
    if (diseasesCured >= 15 && !achievements.includes("disease_fighter")) checkAchievement("disease_fighter");
    if (honeyProduced >= 10 && !achievements.includes("bee_keeper")) checkAchievement("bee_keeper");
    if (rotationUses >= 20 && !achievements.includes("rotation_master")) checkAchievement("rotation_master");
    if (weatherPredictions >= 5 && !achievements.includes("weather_forecaster")) checkAchievement("weather_forecaster");
  };

  function replacePlot(i, updater) {
    setPlots(prev => prev.map((p, idx) => idx === i ? updater({ ...p }) : p));
  }

  function harvestValue(p) {
    if (!p.seed) return 0;
    const base = rules.seeds[p.seed].baseValue;
    const fertBonus = 0.3 * (p.fertilized || 0);
    const qualityBonus = (p.quality - 1) * 0.2;
    const pestPenalty = p.infested ? 0.4 : 0;
    const boostBonus = p.boosted ? 0.5 : 0;
    return Math.max(1, Math.round(base * (1 + fertBonus + qualityBonus + boostBonus - pestPenalty)));
  }

  function secondsPerStage(p) {
    if (!p.seed) return 999999;
    const base = rules.seeds[p.seed].secondsPerStage;
    const fertSpeed = 1 + Math.min(p.fertilized, rules.fertilizer.maxStacks) * rules.fertilizer.speedBonusPerStack;
    const weatherSpeed = weather.type === "Rain" ? 1.2 : weather.type === "Drought" ? 0.8 : 1;
    const boostSpeed = p.boosted ? 1.3 : 1;
    return base / (fertSpeed * weatherSpeed * boostSpeed);
  }

  function witherLimit(p) {
    let base = rules.dryWitherSeconds;
    if (weather.type === "Drought") base = Math.floor(base * 0.5);
    if (weather.type === "Rain") base = Math.floor(base * 1.6);
    if (weather.type === "Frost") base = Math.floor(base * 0.7);
    return base;
  }

  // --- enhanced actions ---
  function plant(i, seed) {
    replacePlot(i, (p) => {
      if (p.state !== "empty") return p;
      
      const seedCount = inventory[seed] || 0;
      console.log(`🌱 Attempting to plant ${seed}: current count = ${seedCount}`);
      
      if (seedCount <= 0) {
        addNotification(`No ${seed} seeds available! Current: ${seedCount}`, "warning");
        console.log(`❌ Cannot plant ${seed}: insufficient seeds (${seedCount})`);
        return p;
      }
      
      setInventory(inv => ({ ...inv, [seed]: (inv[seed] || 0) - 1 }));
      
      // NEW: Check crop rotation bonus
      const newCropFamily = rules.seeds[seed].family;
      const rotationBonus = checkCropRotation(i, newCropFamily);
      
      // Check if planting in optimal season
      const isOptimalSeason = rules.seeds[seed].season === currentSeason;
      if (isOptimalSeason) {
        setSeasonalPlants(prev => prev + 1);
      }
      
      // Building bonuses
      const greenhouseBonus = buildings.greenhouse ? " 🏠" : "";
      const rotationText = rotationBonus > 0 ? ` 🔄+${Math.round(rotationBonus * 100)}%` : "";
      
      addLog(`🌱 Planted ${rules.seeds[seed].emoji} ${seed} in plot ${i + 1}${isOptimalSeason ? " 🌟" : ""}${greenhouseBonus}${rotationText}`);
      const quality = Math.random() > 0.8 ? 1.2 : 1; // 20% chance for higher quality
      playSound("plant");
      
      return { 
        ...p, state: "planted", seed, growth: 0, watered: false, 
        plantedAt: nowSec(), lastWateredAt: null, fertilized: 0, 
        infested: false, boosted: false, quality, rotationBonus,
        lastCropFamily: p.lastCropFamily, // Keep for next rotation check
        disease: null, beePollinated: false
      };
    });
  }

  function water(i) {
    replacePlot(i, (p) => {
      if (p.state !== "planted" && p.state !== "growing") return p;
      const efficiency = inventory.wateringCan > 0 ? rules.wateringCan.efficiency : 1;
      addLog(`💧 Watered plot ${i + 1}${efficiency > 1 ? " (enhanced)" : ""}`);
      return { 
        ...p, watered: true, lastWateredAt: nowSec(), state: "growing",
        boosted: efficiency > 1 ? true : p.boosted
      };
    });
  }

  function fertilize(i) {
    replacePlot(i, (p) => {
      if (!(p.state === "planted" || p.state === "growing")) return p;
      if ((inventory["fertilizer"] || 0) <= 0) return p;
      if (p.fertilized >= rules.fertilizer.maxStacks) return p;
      setInventory(inv => ({ ...inv, fertilizer: (inv.fertilizer || 0) - 1 }));
      addLog(`🧪 Fertilized plot ${i + 1} (${p.fertilized + 1}/${rules.fertilizer.maxStacks})`);
      return { ...p, fertilized: (p.fertilized || 0) + 1 };
    });
  }

  function spray(i) {
    replacePlot(i, (p) => {
      if (!p.infested) return p;
      if ((inventory["pesticide"] || 0) <= 0) return p;
      setInventory(inv => ({ ...inv, pesticide: (inv.pesticide || 0) - 1 }));
      setPestEliminations(prev => prev + 1);
      addLog(`🧽 Sprayed plot ${i + 1}. Pests eliminated!`);
      playSound("spray");
      addParticle(i % gridSize * 120 + 60, Math.floor(i / gridSize) * 120 + 60, "spray", "💨");
      checkAllAchievements();
      return { ...p, infested: false };
    });
  }

  function clearPlot(i) {
    replacePlot(i, (p) => {
      if (p.state !== "withered") return p;
      addLog(`🗑️ Cleared withered plot ${i + 1}`);
      return newPlot("empty");
    });
  }

  function harvest(i) {
    replacePlot(i, (p) => {
      if (p.state !== "grown") return p;
      
      const marketPrice = getMarketPrice(p.seed);
      let val = Math.round(harvestValue(p) * (marketPrice / rules.seeds[p.seed].baseValue));
      
      // NEW: Apply rotation bonus
      if (p.rotationBonus > 0) {
        val = Math.round(val * (1 + p.rotationBonus));
      }
      
      // NEW: Apply bee pollination bonus
      if (p.beePollinated && buildings.beehive) {
        val = Math.round(val * (1 + rules.buildings.beehive.bonus));
      }
      
      // Building bonuses
      if (buildings.barn) {
        val = Math.round(val * (1 + rules.buildings.barn.bonus)); // +20% harvest value
      }
      
      setCoins(c => c + val);
      setScore(s => s + val);
      setTotalEarned(t => t + val);
      setTotalHarvests(h => h + 1);
      
      if (p.quality > 1) {
        setQualityHarvests(q => q + 1);
      }
      
      // Check for seasonal bonus
      const isOptimalSeason = rules.seeds[p.seed].season === currentSeason;
      
      const emoji = rules.seeds[p.seed].emoji;
      const qualityText = p.quality > 1 ? " ⭐" : "";
      const seasonText = isOptimalSeason ? " 🌟" : "";
      const trendText = marketTrends[p.seed] === "high" ? " 📈" : marketTrends[p.seed] === "low" ? " 📉" : "";
      const buildingText = buildings.barn ? " 🏚️" : "";
      const rotationText = p.rotationBonus > 0 ? ` 🔄+${Math.round(p.rotationBonus * 100)}%` : "";
      const beeText = p.beePollinated ? " 🐝+25%" : "";
      
      addLog(`🎉 Harvested ${emoji} ${p.seed} (+${val}🪙)${qualityText}${seasonText}${trendText}${buildingText}${rotationText}${beeText}`);
      addNotification(`+${val}🪙 ${emoji}${qualityText}`, "success");
      
      // NEW: Update last crop family for rotation system
      const lastCropFamily = rules.seeds[p.seed].family;
      
      // Trigger combo and effects
      triggerCombo();
      playSound("harvest");
      addParticle(i % gridSize * 120 + 60, Math.floor(i / gridSize) * 120 + 60, "coins", `+${val}`);
      
      // Check achievements
      checkAllAchievements();
      
      return { ...newPlot("empty"), lastCropFamily, lastHarvested: nowSec() };
    });
  }

  function buy(item, qty = 1) {
    if (qty < 1) qty = 1;
    let price = 0;
    
    if (item in rules.seeds) {
      price = rules.seeds[item].shopPrice * qty;
    } else if (item === "fertilizer") {
      price = rules.fertilizer.shopPrice * qty;
    } else if (item === "pesticide") {
      price = rules.pesticide.shopPrice * qty;
    } else if (item === "wateringCan") {
      if (inventory.wateringCan > 0) return; // Already have one
      price = rules.wateringCan.shopPrice;
    } else if (item in rules.buildings) {
      if (buildings[item]) {
        addNotification(`You already have a ${rules.buildings[item].name}!`, "warning");
        return;
      }
      price = rules.buildings[item].price;
      if (coins < price) return;
      
      setCoins(c => c - price);
      setBuildings(prev => ({ ...prev, [item]: true }));
      addLog(`🏗️ Built ${rules.buildings[item].emoji} ${rules.buildings[item].name}!`);
      addNotification(`${rules.buildings[item].name} constructed!`, "success");
      return;
    } else if (item in rules.livestock) {
      price = rules.livestock[item].price;
      if (coins < price) return;
      
      setCoins(c => c - price);
      const newAnimal = {
        id: Date.now(),
        type: item,
        lastProduced: nowSec(),
        happiness: 100
      };
      setLivestock(prev => [...prev, newAnimal]);
      addLog(`🐾 Bought ${rules.livestock[item].emoji} ${rules.livestock[item].name}!`);
      addNotification(`New ${rules.livestock[item].name} added to farm!`, "success");
      return;
    } else if (item === "fungicide") {
      price = rules.fungicide.shopPrice * qty;
    } else if (item === "beeFeed") {
      price = rules.beeFeed.shopPrice * qty;
    } else if (item === "expand") {
      const next = clamp(gridSize + 1, MIN_SIZE, MAX_SIZE);
      price = EXPANSION_COSTS[next] || 0;
      if (next === gridSize) return; // already max
      if (coins < price) return;
      
      setCoins(c => c - price);
      const newSize = next;
      const old = [...plots];
      const total = newSize * newSize;
      const extended = [];
      
      for (let i = 0; i < total; i++) {
        extended[i] = old[i] ? old[i] : newPlot(i < MIN_SIZE * MIN_SIZE ? "empty" : "locked");
      }
      
      // unlock the new ring
      for (let r = 0; r < newSize; r++) {
        for (let c = 0; c < newSize; c++) {
          const idx = r * newSize + c;
          if (r === 0 || c === 0 || r === newSize - 1 || c === newSize - 1) {
            if (extended[idx].state === "locked") extended[idx] = newPlot("empty");
          }
        }
      }
      
      setGridSize(newSize);
      setPlots(extended);
      addLog(`🏗️ Field expanded to ${newSize}×${newSize} for ${price}🪙`);
      addNotification(`Field expanded to ${newSize}×${newSize}!`, "success");
      
      if (newSize === MAX_SIZE) checkAchievement("field_master");
      return;
    }
    
    if (price <= 0 || coins < price) return;
    
    setCoins(c => c - price);
    setInventory(inv => ({ ...inv, [item]: (inv[item] || 0) + qty }));
    
    const emoji = rules.seeds[item]?.emoji || "📦";
    addLog(`🛒 Bought ${qty}x ${emoji} ${item} for ${price}🪙`);
    addNotification(`Bought ${qty}x ${item}`, "info");
  }

  // Process crops into higher-value products
  function processCrop(crop, qty = 1) {
    if (!buildings.workshop) {
      addNotification("Need a Workshop to process crops!", "warning");
      return;
    }
    
    const processing = rules.processing[crop];
    if (!processing) {
      addNotification(`Cannot process ${crop}!`, "warning");
      return;
    }
    
    if ((inventory[crop] || 0) < qty) {
      addNotification(`Not enough ${crop} to process!`, "warning");
      return;
    }
    
    setInventory(prev => ({
      ...prev,
      [crop]: (prev[crop] || 0) - qty,
      [processing.output]: (prev[processing.output] || 0) + qty
    }));
    
    const value = Math.round(rules.seeds[crop].baseValue * processing.multiplier * qty);
    addLog(`🏭 Processed ${qty}x ${crop} into ${processing.emoji} ${processing.name} (+${value}🪙 value)`);
    addNotification(`Processed ${qty}x ${processing.name}!`, "success");
  }

  // Collect livestock products
  function collectLivestock() {
    const now = nowSec();
    let collected = 0;
    
    setLivestock(prev => prev.map(animal => {
      const data = rules.livestock[animal.type];
      if (now - animal.lastProduced >= data.interval) {
        const product = data.product;
        setInventory(inv => ({ ...inv, [product]: (inv[product] || 0) + 1 }));
        setCoins(c => c + data.value);
        collected++;
        return { ...animal, lastProduced: now };
      }
      return animal;
    }));
    
    if (collected > 0) {
      addNotification(`Collected from ${collected} animals!`, "success");
    }
  }

  function resetSave() {
    setRules(DEFAULT_RULES);
    setGridSize(MIN_SIZE);
    setPlots(makeGrid(MIN_SIZE));
    setCoins(30);
    setScore(0);
    setTotalEarned(0);
    setName("Farmer");
    setInventory({ 
      carrot: 3, potato: 1, corn: 0, tomato: 0, strawberry: 0, pumpkin: 0, sunflower: 0,
      fertilizer: 1, pesticide: 1, wateringCan: 0, sprinkler: 0, scarecrow: 0 
    });
    setSelectedSeed("carrot");
    setLevelId(LEVELS[0].id);
    setLevelEndsAt(nowSec() + LEVELS[0].minutes * 60);
    setLevelStartedAt(nowSec());
    setLevelStatus("playing");
    setWeather({ type: "Sunny", endsAt: nowSec() + 30 });
    setLog(["🌱 Welcome to your farm! Plant seeds and watch them grow.", "💡 Tip: Right-click plots to fertilize or spray pesticide."]);
    setAchievements([]);
    setWeatherEvents(0);
    setTotalHarvests(0);
    setQualityHarvests(0);
    setPestEliminations(0);
    setCurrentSeason("spring");
    setSeasonEndsAt(nowSec() + 120);
    setMarketTrends({});
    setSprinklers([]);
    setScarecrows([]);
    setNotifications([]);
    setCombo(0);
    setComboTimer(0);
    setParticles([]);
  }

  // --- Simplified growth tick (no timers) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Update particles
      setParticles(prev => prev.filter(p => p.life > 0).map(p => ({
        ...p,
        life: p.life - 100,
        y: p.y - 2
      })));
      if (comboTimer > 0 && nowSec() >= comboTimer) {
        setCombo(0);
        setComboTimer(0);
      }
      
      // Season changes
      if (nowSec() >= seasonEndsAt) {
        const currentIndex = SEASONS.indexOf(currentSeason);
        const nextSeason = SEASONS[(currentIndex + 1) % SEASONS.length];
        setCurrentSeason(nextSeason);
        setSeasonEndsAt(nowSec() + 120); // 2 minutes per season
        addLog(`🌍 Season changed to ${SEASON_EFFECTS[nextSeason].name}`);
        addNotification(`${SEASON_EFFECTS[nextSeason].name} begins!`, "info");
        
        // Update market trends when season changes
        const newTrends = {};
        Object.keys(rules.seeds).forEach(seed => {
          const roll = Math.random();
          if (roll < 0.2) newTrends[seed] = "high";
          else if (roll < 0.4) newTrends[seed] = "low";
          else newTrends[seed] = "normal";
        });
        setMarketTrends(newTrends);
      }
      
      // Enhanced weather evolution
      setWeather(w => {
                  if (w.endsAt <= nowSec()) {
            setWeatherEvents(prev => prev + 1);
            checkAllAchievements();
            
            // Enhanced weather system with seasonal variations
            const roll = Math.random();
            let next = "Sunny";
            
            // Season affects weather probability
            if (currentSeason === "winter") {
              if (roll < 0.3) next = "Frost";
              else if (roll < 0.4) next = "Storm";
              else if (roll < 0.5) next = "Rain";
              else next = "Sunny";
            } else if (currentSeason === "summer") {
              if (roll < 0.3) next = "Drought";
              else if (roll < 0.4) next = "Pests";
              else if (roll < 0.5) next = "Storm";
              else next = "Sunny";
            } else {
              if (roll < 0.15) next = "Rain";
              else if (roll < 0.25) next = "Drought";
              else if (roll < 0.35) next = "Pests";
              else if (roll < 0.45) next = "Storm";
              else if (roll < 0.55) next = "Frost";
              else next = "Sunny";
            }
            
            const dur = 25 + Math.floor(Math.random() * 35);
            
            const messages = {
              Rain: "🌧️ Rain showers - all crops are watered and grow faster!",
              Drought: "☀️ Drought conditions - crops wither faster, water more often!",
              Pests: "🐛 Pest swarm incoming - keep pesticide ready!",
              Storm: "⛈️ Storm brewing - growth slowed but no withering!",
              Frost: "❄️ Frost warning - growth halted temporarily!",
              Sunny: "☀️ Beautiful sunny weather returns!"
            };
            
            addLog(messages[next] || "Weather changed.");
            addNotification(messages[next], next === "Sunny" ? "success" : "warning");
            playSound("weather");
            
            // NEW: Add weather particles
            setTimeout(() => addWeatherParticles(), 100);
            
            // Apply instant rain effect
            if (next === "Rain") {
              setPlots(prev => prev.map(p => {
                if (p.state === "planted" || p.state === "growing") {
                  return { ...p, watered: true, lastWateredAt: nowSec(), state: "growing" };
                }
                return p;
              }));
            }
            
            return { type: next, endsAt: nowSec() + dur };
          }
        return w;
      });

      // Enhanced pest mechanics
      setPlots(prev => {
        let arr = [...prev];
        if (weather.type === "Pests") {
          const candidates = arr
            .map((p, i) => ({ p, i }))
            .filter(x => (x.p.state === "planted" || x.p.state === "growing") && !x.p.infested);
          if (candidates.length && Math.random() < 0.12) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)].i;
            arr[pick] = { ...arr[pick], infested: true };
            addLog(`🐛 Plot ${pick + 1} infested by pests!`);
            addNotification(`Plot ${pick + 1} infested!`, "warning");
          }
        }
        return arr;
      });

              // Enhanced growth & wither system
        setPlots(prev => prev.map(p => {
          if (!(p.state === "planted" || p.state === "growing" || p.state === "grown")) return p;
          if (!p.seed || !p.plantedAt) return p;
          
          // Enhanced wither logic
          if (p.state !== "grown" && p.lastWateredAt !== null) {
            const dry = nowSec() - (p.lastWateredAt || 0);
            if (dry > witherLimit(p) && weather.type !== "Storm") {
              addLog(`💀 Plot ${prev.indexOf(p) + 1} withered from drought`);
              return { ...p, state: "withered" };
            }
          }
          
          // Growth mechanics with weather effects
          if (p.infested || weather.type === "Frost") return p; // Growth halted
          
          const sps = secondsPerStage(p);
          const spec = rules.seeds[p.seed];
          const elapsed = nowSec() - p.plantedAt;
          const stg = clamp(Math.floor(elapsed / sps), 0, spec.stages);
          
          let nextState = p.state;
          if (stg >= spec.stages) nextState = "grown";
          else if (stg > 0) nextState = "growing";
          
          if (stg !== p.growth || nextState !== p.state) {
            if (nextState === "grown") {
              addNotification(`${spec.emoji} Ready to harvest!`, "success");
            }
            return { ...p, growth: stg, state: nextState };
          }
          return p;
        }));

              // Enhanced level timer with achievement checks
        if (levelId !== "endless" && levelStatus === "playing" && level) {
          setLevelStatus(st => {
            if (coins >= level.targetCoins) {
              const timeUsed = nowSec() - levelStartedAt;
              if (levelId === "lvl1" && timeUsed < 240 && !achievements.includes("speed_farmer")) { // 4 minutes
                checkAchievement("speed_farmer");
              }
              addNotification(`🎉 Level Complete! You earned ${level.reward}🪙 bonus!`, "success");
              return "won";
            }
            if (nowSec() >= levelEndsAt) {
              if (coins >= level.targetCoins) {
                addNotification(`🎉 Level Complete! You earned ${level.reward}🪙 bonus!`, "success");
                return "won";
              } else {
                addNotification(`⏰ Time's up! You needed ${level.targetCoins}🪙 but only earned ${coins}🪙`, "warning");
                return "lost";
              }
            }
            return st;
          });
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [weather.type, rules, levelId, levelEndsAt, levelStatus, coins, level, levelStartedAt, weatherEvents, achievements]);

  // --- Enhanced UI helpers ---
  function WeatherBadge() {
    const WeatherIcon = WEATHER_EFFECTS[weather.type]?.icon || Sun;
    const colorClass = WEATHER_EFFECTS[weather.type]?.color || "text-yellow-500";
    const bgClass = WEATHER_EFFECTS[weather.type]?.bg || "bg-yellow-50";
    
    return (
      <div className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full ${bgClass} border-2 border-white/50 backdrop-blur-sm shadow-lg`}>
        <WeatherIcon size={18} className={colorClass}/>
        <span className="font-semibold">{weather.type}</span>
      </div>
    );
  }

  function SeasonBadge() {
    const seasonData = SEASON_EFFECTS[currentSeason];
    
    return (
      <div className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-white/80 border-2 border-white/50 backdrop-blur-sm shadow-lg">
        <span className={`font-semibold ${seasonData.color}`}>{seasonData.name}</span>
      </div>
    );
  }

  function MarketDisplay() {
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2">
          📊 Market Trends
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(rules.seeds).slice(0, 4).map(([seed, data]) => {
            const trend = marketTrends[seed] || "normal";
            const trendData = MARKET_TRENDS[trend];
            const price = getMarketPrice(seed);
            return (
              <div key={seed} className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    {data.emoji} {price}🪙
                  </span>
                  <span className={`text-xs ${trendData.color}`}>
                    {trend === "high" ? "📈" : trend === "low" ? "📉" : "📊"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // NEW: Weather Forecast Display
  function WeatherForecastDisplay() {
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2">
          🌤️ Weather Forecast
        </div>
        <div className="space-y-2">
          {weatherForecast.map((forecast, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">In {forecast.time} cycle</span>
                <span className="text-xs opacity-70">{Math.round(forecast.probability * 100)}%</span>
              </div>
              <div className="text-xs opacity-80">{forecast.effects}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // NEW: Bee Management Display
  function BeeManagementDisplay() {
    if (!buildings.beehive) return null;
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2">
          🐝 Bee Management
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs">Happiness</span>
            <span className="text-xs font-semibold">{Math.round(beeHappiness)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                beeHappiness >= 80 ? 'bg-green-500' : 
                beeHappiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${beeHappiness}%` }}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={feedBees}
              disabled={(inventory.beeFeed || 0) <= 0}
              className="text-xs flex-1"
            >
              🍯 Feed Bees
            </Button>
            <Badge variant="secondary" className="text-xs">
              {inventory.beeFeed || 0} feed
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  function ComboDisplay() {
    if (combo === 0) return null;
    
    return (
      <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
        <div className="flex items-center gap-2 font-bold">
          <Zap size={20}/>
          {combo}x COMBO!
        </div>
      </div>
    );
  }

  // Enhanced particle system component
  function ParticleSystem() {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {particles.map(p => {
          let className = "absolute text-lg font-bold";
          let content = p.text;
          
          // NEW: Enhanced particle styling based on type
          if (p.type === "coins") {
            className += " text-yellow-500 animate-bounce";
          } else if (p.type === "achievement") {
            className += " text-purple-500 animate-bounce";
          } else if (p.type === "rain") {
            className += " text-blue-400 animate-rain-drop";
            content = "💧";
          } else if (p.type === "snow") {
            className += " text-cyan-300 animate-snow-fall";
            content = "❄️";
          } else if (p.type === "wind") {
            className += " text-slate-400 animate-wind-gust";
            content = "💨";
          } else if (p.type === "cure") {
            className += " text-green-500 animate-bounce";
          } else if (p.type === "bee") {
            className += " text-yellow-500 animate-bee-buzz";
          } else {
            className += " text-blue-500 animate-bounce";
          }
          
          return (
            <div
              key={p.id}
              className={className}
              style={{
                left: p.x,
                top: p.y,
                transform: `translate(${p.vx}px, ${p.vy}px)`,
                animation: p.type === "coins" || p.type === "achievement" ? "float 2s ease-out forwards" : "none",
              }}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  }

  function timerText() {
    return "🎮 Farm Mode";
  }

  function PlotCard({ p, i }) {
    const spec = p.seed ? rules.seeds[p.seed] : null;
    const pct = spec ? Math.round((p.growth / spec.stages) * 100) : 0;
    const emoji = spec?.emoji || "🌱";
    const title = p.state === "locked" ? "🔒 Locked" : p.state === "empty" ? "📍 Empty Plot" : p.state === "withered" ? "💀 Withered" : p.seed ? `${emoji} ${p.seed}` : "Plot";
    
    // Dynamic styling based on state
    let bgClass = "bg-white/70";
    let borderClass = "border-slate-200";
    let textClass = "text-slate-700";
    
    if (p.state === "locked") {
      bgClass = "bg-slate-100/70";
      borderClass = "border-slate-300";
      textClass = "text-slate-500";
    } else if (p.state === "empty") {
      bgClass = "bg-gradient-to-br from-green-50/70 to-emerald-50/70";
      borderClass = "border-emerald-200";
    } else if (p.state === "grown") {
      bgClass = "bg-gradient-to-br from-emerald-100/80 to-green-100/80";
      borderClass = "border-emerald-400";
      textClass = "text-emerald-800";
    } else if (p.state === "withered") {
      bgClass = "bg-gradient-to-br from-red-50/70 to-rose-50/70";
      borderClass = "border-red-300";
      textClass = "text-red-700";
    } else {
      bgClass = "bg-gradient-to-br from-amber-50/70 to-yellow-50/70";
      borderClass = "border-amber-300";
      textClass = "text-amber-800";
    }

    function leftClick() {
      if (p.state === "locked") return;
      if (p.state === "grown") return harvest(i);
      if (p.state === "withered") return clearPlot(i);
      if (p.state === "empty") return plant(i, selectedSeed);
      return water(i);
    }
    
    function rightClick(e) {
      e.preventDefault();
      if (p.state === "locked") return;
      if (p.infested) return spray(i);
      if (p.disease) return cureDisease(i);
      return fertilize(i);
    }

    return (
      <div
        onClick={leftClick}
        onContextMenu={rightClick}
        className={`group relative rounded-2xl border-2 ${borderClass} ${bgClass} backdrop-blur-sm cursor-pointer select-none hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-4`}
      >
        {/* Plot number badge */}
        <div className="absolute -top-2 -right-2 bg-white border-2 border-slate-300 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-600 shadow-lg">
          {i + 1}
        </div>
        
        {/* Quality indicator */}
        {p.quality > 1 && p.state !== "empty" && p.state !== "locked" && (
          <div className="absolute -top-2 -left-2 bg-yellow-400 border-2 border-yellow-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <Star size={12} className="text-yellow-800" fill="currentColor"/>
          </div>
        )}
        
        {/* NEW: Disease indicator */}
        {p.disease && (
          <div className="absolute -top-2 left-6 bg-red-400 border-2 border-red-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-xs text-white">{CROP_DISEASES[p.disease].emoji}</span>
          </div>
        )}
        
        {/* NEW: Bee pollination indicator */}
        {p.beePollinated && (
          <div className="absolute -bottom-2 -left-2 bg-yellow-400 border-2 border-yellow-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <Bug size={12} className="text-yellow-800"/>
          </div>
        )}
        
        {/* NEW: Crop rotation indicator */}
        {p.rotationBonus > 0 && (
          <div className="absolute -bottom-2 -right-2 bg-green-400 border-2 border-green-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <span className="text-xs text-white font-bold">🔄</span>
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-3">
          {/* Main title with icon */}
          <div className={`font-bold text-center ${textClass} text-lg flex items-center gap-2`}>
            {p.state === "locked" && <Hammer size={20}/>}
            {p.state === "empty" && <Sprout size={20}/>}
            {p.state === "withered" && <AlertTriangle size={20}/>}
            {(p.state === "planted" || p.state === "growing" || p.state === "grown") && <div className="text-2xl">{emoji}</div>}
            <div className="capitalize">{title}</div>
          </div>

          {/* Status badges */}
          {p.state !== "empty" && p.state !== "locked" && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {p.state !== "grown" && spec && (
                <Badge variant="outline" className="text-xs">
                  {p.growth}/{spec.stages} stages
                </Badge>
              )}
              {p.watered && p.state !== "grown" && (
                <Badge variant="info" className="text-xs">
                  <Droplets size={10} className="mr-1"/>watered
                </Badge>
              )}
              {p.fertilized > 0 && (
                <Badge variant="success" className="text-xs">
                  <Zap size={10} className="mr-1"/>+{p.fertilized}
                </Badge>
              )}
              {p.boosted && (
                <Badge variant="warning" className="text-xs">
                  <ArrowUp size={10} className="mr-1"/>boosted
                </Badge>
              )}
              {p.infested && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <Bug size={10} className="mr-1"/>infested
                </Badge>
              )}
              {/* NEW: Disease status */}
              {p.disease && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <span className="mr-1">{CROP_DISEASES[p.disease].emoji}</span>
                  {CROP_DISEASES[p.disease].name}
                </Badge>
              )}
              {/* NEW: Bee pollination status */}
              {p.beePollinated && (
                <Badge variant="warning" className="text-xs">
                  <Bug size={10} className="mr-1"/>pollinated
                </Badge>
              )}
              {/* NEW: Crop rotation status */}
              {p.rotationBonus > 0 && (
                <Badge variant="success" className="text-xs">
                  <span className="mr-1">🔄</span>+{Math.round(p.rotationBonus * 100)}%
                </Badge>
              )}
              {p.state === "grown" && (
                <Badge variant="success" className="text-xs animate-bounce">
                  <Gift size={10} className="mr-1"/>ready!
                </Badge>
              )}
            </div>
          )}

          {/* Progress bar for growing crops */}
          {spec && p.state !== "grown" && p.state !== "withered" && (
            <div className="w-full">
              <Progress value={pct} className="h-3" />
              <div className="text-xs text-center mt-1 opacity-70">{pct}%</div>
            </div>
          )}

          {/* Action info */}
          <div className="text-xs text-center opacity-80 min-h-[2rem] flex items-center justify-center">
            {p.state === "grown" && (
              <div className="text-emerald-700 font-semibold flex items-center gap-1">
                <Coins size={14}/>
                Harvest: {harvestValue(p)}🪙
              </div>
            )}
            {p.state === "withered" && (
              <div className="text-red-600 flex items-center gap-1">
                <AlertTriangle size={14}/> Click to clear
              </div>
            )}
            {p.state === "empty" && (
              <div className="text-slate-600">
                Click: Plant {rules.seeds[selectedSeed]?.emoji} {selectedSeed}
              </div>
            )}
            {(p.state === "planted" || p.state === "growing") && (
              <div className="text-amber-700">
                Click: Water • Right-click: {p.infested ? "Spray" : p.disease ? "Cure" : "Fertilize"}
              </div>
            )}
            {p.state === "locked" && (
              <div className="text-slate-500">
                Unlock with field expansion
              </div>
            )}
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-200/0 via-emerald-200/20 to-emerald-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    );
  }

  // --- Enhanced Layout ---
  return (
    <div className={`min-h-screen bg-gradient-to-br ${DAY_NIGHT_CYCLE[currentTimeOfDay].bg} relative overflow-hidden transition-all duration-1000`}>
      {/* Save status indicator */}
      <div className="fixed top-4 left-4 p-2 bg-white/80 border rounded-lg text-xs z-50">
        {(() => {
          try {
            const save = loadSave();
            return save ? `💾 Save present (${new Date(save.savedAt || Date.now()).toLocaleString()})` : '💾 No save present';
          } catch {
            return '💾 Save status unknown';
          }
        })()}
      </div>
      {/* Floating notification system */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border-2 animate-slide-down font-medium text-sm max-w-sm ${
              n.type === "success" ? "bg-emerald-100/95 border-emerald-400 text-emerald-900 shadow-emerald-200/50" :
              n.type === "warning" ? "bg-amber-100/95 border-amber-400 text-amber-900 shadow-amber-200/50" :
              "bg-blue-100/95 border-blue-400 text-blue-900 shadow-blue-200/50"
            }`}
            style={{
              animation: "slide-down 0.4s ease-out forwards",
              transform: "translateX(0)",
              opacity: 1
            }}
          >
            <div className="flex items-center gap-2">
              {n.type === "success" && <span className="animate-pulse">✅</span>}
              {n.type === "warning" && <span className="animate-pulse">⚠️</span>}
              {n.type === "info" && "ℹ️"}
              <span className="flex-1">{n.msg}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-3 shadow-lg">
              <Sprout className="text-white" size={24}/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">🌾 {name}'s Farm</h1>
              <p className="text-sm text-slate-600">{level?.label || "Farm Simulation"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/50">
              <div className="flex items-center gap-2 text-lg font-bold text-emerald-700">
                <Coins size={20}/>
                {coins}🪙
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/50">
              <div className="flex items-center gap-2 text-lg font-bold text-purple-700">
                <Trophy size={20}/>
                {score}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/50">
              <div className="flex items-center gap-2 text-lg font-bold text-blue-700">
                <Timer size={20}/>
                {levelId !== "endless" && level ? (
                  <div className="text-center">
                    <div className="text-sm">{level.label}</div>
                    <div className="text-xs opacity-75">{coins}/{level.targetCoins}🪙</div>
                  </div>
                ) : (
                  timerText()
                )}
              </div>
            </div>
            
            <SeasonBadge/>
            <WeatherBadge/>
            
            {/* NEW: Time of Day Badge */}
            <div className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-white/80 border-2 border-white/50 backdrop-blur-sm shadow-lg">
              <span className="font-semibold text-slate-700">{DAY_NIGHT_CYCLE[currentTimeOfDay].name}</span>
            </div>
          </div>
        </div>

        <ParticleSystem/>
        <ComboDisplay/>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Enhanced Left Panel */}
          <div className="space-y-4">
            {/* Farmer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="text-red-500" size={20}/>
                  Farmer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    placeholder="Enter your name"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={()=>addLog(`👋 Hello, ${name}!`)}>
                    Save
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Badge variant="outline" className="justify-center py-2">
                    🌱 Field: {gridSize}×{gridSize}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    🎯 Level: {level?.difficulty}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    🏆 Harvests: {totalHarvests}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    💰 Total: {totalEarned}🪙
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    ⭐ Quality: {qualityHarvests}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    🧽 Pests: {pestEliminations}
                  </Badge>
                  {/* NEW: Enhanced stats */}
                  <Badge variant="outline" className="justify-center py-2">
                    🦠 Diseases: {diseasesCured}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    🐝 Honey: {honeyProduced}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    🔄 Rotation: {rotationUses}
                  </Badge>
                  <Badge variant="outline" className="justify-center py-2">
                    🌤️ Forecast: {weatherPredictions}
                  </Badge>
                </div>

                {combo > 0 && (
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-2 border border-orange-300">
                    <div className="text-center font-bold text-orange-700">
                      🔥 {combo}x Harvest Combo!
                    </div>
                  </div>
                )}

                                <MarketDisplay/>
                <WeatherForecastDisplay/>
                <BeeManagementDisplay/>

                {achievements.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">🏆 Achievements ({achievements.length}/{ACHIEVEMENTS.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {ACHIEVEMENTS.filter(a => achievements.includes(a.id)).map(a => (
                        <span key={a.id} title={a.desc} className="text-lg cursor-help">
                          {a.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={resetSave} className="flex-1">
                    🔄 Reset Farm
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={soundEnabled ? "bg-green-100" : "bg-red-100"}
                  >
                    {soundEnabled ? "🔊" : "🔇"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Shop */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="text-emerald-600" size={20}/>
                  Farm Shop
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="seeds">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="seeds">🌱 Seeds</TabsTrigger>
                    <TabsTrigger value="tools">🛠️ Tools</TabsTrigger>
                    <TabsTrigger value="buildings">🏗️ Buildings</TabsTrigger>
                    <TabsTrigger value="market">📈 Market</TabsTrigger>
                    <TabsTrigger value="expand">📏 Expand</TabsTrigger>
                    <TabsTrigger value="test">🧪 Test</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="seeds" className="space-y-2">
                    {Object.entries(rules.seeds).map(([seed, data]) => (
                      <Button 
                        key={seed} 
                        onClick={() => buy(seed, 1)} 
                        variant="outline" 
                        className="w-full justify-between h-auto p-3"
                        disabled={coins < data.shopPrice}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{data.emoji}</span>
                          <div className="text-left">
                            <div className="font-semibold capitalize">{seed} Seed</div>
                            <div className="text-xs opacity-70">{data.stages} stages • +{data.baseValue}🪙</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{data.shopPrice}🪙</div>
                          <div className="text-xs opacity-70">{data.rarity}</div>
                        </div>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="tools" className="space-y-2">
                    <Button 
                      onClick={() => buy("fertilizer", 1)} 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.fertilizer.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="text-green-500" size={20}/>
                        <div>
                          <div className="font-semibold">Fertilizer</div>
                          <div className="text-xs opacity-70">+{rules.fertilizer.speedBonusPerStack * 100}% speed</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.fertilizer.shopPrice}🪙</div>
                    </Button>
                    
                                        <Button 
                      onClick={() => buy("pesticide", 1)} 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.pesticide.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <Bug className="text-red-500" size={20}/> 
                        <div>
                          <div className="font-semibold">Pesticide</div>
                          <div className="text-xs opacity-70">Removes pests</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.pesticide.shopPrice}🪙</div>
                    </Button>
                    
                    {/* NEW: Disease control tools */}
                    <Button 
                      onClick={() => buy("fungicide", 1)} 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.fungicide.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🦠</span>
                        <div>
                          <div className="font-semibold">Fungicide</div>
                          <div className="text-xs opacity-70">Cures crop diseases</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.fungicide.shopPrice}🪙</div>
                    </Button>
                    
                    <Button 
                      onClick={() => buy("beeFeed", 1)} 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.beeFeed.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <Bug className="text-yellow-500" size={20}/> 
                        <div>
                          <div className="font-semibold">Bee Feed</div>
                          <div className="text-xs opacity-70">Increases bee happiness</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.beeFeed.shopPrice}🪙</div>
                    </Button>
                    
                    {inventory.wateringCan === 0 && (
                      <Button 
                        onClick={() => buy("wateringCan", 1)} 
                        variant="outline" 
                        className="w-full justify-between h-auto p-3"
                        disabled={coins < rules.wateringCan.shopPrice}
                      >
                        <div className="flex items-center gap-2">
                          <Droplets className="text-blue-500" size={20}/>
                          <div>
                            <div className="font-semibold">Watering Can</div>
                            <div className="text-xs opacity-70">Enhanced watering</div>
                          </div>
                        </div>
                        <div className="font-bold">{rules.wateringCan.shopPrice}🪙</div>
                      </Button>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="buildings" className="space-y-2">
                    {Object.entries(rules.buildings).map(([buildingType, data]) => (
                      <Button 
                        key={buildingType} 
                        onClick={() => buy(buildingType, 1)} 
                        variant="outline" 
                        className="w-full justify-between h-auto p-3"
                        disabled={coins < data.price || buildings[buildingType]}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{data.emoji}</span>
                          <div className="text-left">
                            <div className="font-semibold">{data.name}</div>
                            <div className="text-xs opacity-70">{data.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{data.price}🪙</div>
                          <div className="text-xs opacity-70">
                            {buildings[buildingType] ? "✅ Owned" : "Available"}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="market" className="space-y-2">
                    <div className="space-y-3">
                      <div className="text-sm font-semibold">💰 Market Prices</div>
                      {Object.entries(marketPrices).length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(marketPrices).map(([seedType, price]) => (
                            <div key={seedType} className="p-2 border rounded bg-gray-50">
                              <div className="text-xs">{rules.seeds[seedType]?.emoji} {seedType}</div>
                              <div className="text-sm font-bold">{price}💰</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Button onClick={generateMarketPrices} className="w-full">
                          Generate Market Prices
                        </Button>
                      )}
                      
                      <div className="text-sm font-semibold">📊 Futures Contracts</div>
                      {futuresContracts.length > 0 ? (
                        <div className="space-y-2">
                          {futuresContracts.map(contract => (
                            <div key={contract.id} className="p-2 border rounded bg-blue-50">
                              <div className="text-xs">{contract.contractType} {contract.seedType}</div>
                              <div className="text-xs">Entry: {contract.entryPrice}💰</div>
                              <div className="text-xs">Expires: {Math.max(0, contract.expiresAt - nowSec())}s</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No active contracts</div>
                      )}
                      
                      <div className="text-sm font-semibold">🏆 Reputation: {reputation}</div>
                      
                      {economicEvents.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">📰 Economic Events</div>
                          {economicEvents.map((event, idx) => (
                            <div key={idx} className="p-2 border rounded bg-yellow-50">
                              <div className="text-xs">{event.emoji} {event.name}</div>
                              <div className="text-xs">{event.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="expand" className="space-y-2">
                    {gridSize < MAX_SIZE && (
                      <Button 
                        onClick={() => buy("expand", 1)} 
                        className="w-full justify-between h-auto p-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        disabled={coins < (EXPANSION_COSTS[gridSize + 1] || 0)}
                      >
                        <div className="flex items-center gap-2">
                          <ArrowUp className="text-white" size={20}/>
                          <div className="text-white">
                            <div className="font-semibold">Expand Field</div>
                            <div className="text-xs opacity-90">{gridSize}×{gridSize} → {gridSize + 1}×{gridSize + 1}</div>
                          </div>
                        </div>
                        <div className="font-bold text-white">{EXPANSION_COSTS[gridSize + 1]}🪙</div>
                      </Button>
                    )}
                    {gridSize >= MAX_SIZE && (
                      <div className="text-center text-green-600 font-semibold py-4">
                        🏆 Maximum field size reached!
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="test" className="space-y-2">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-700 mb-2">🧪 Development & Game Controls</p>
                      <div className="space-y-2">
                        <Button 
                          onClick={testAllFeatures}
                          className="w-full text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          🧪 Test All Features
                        </Button>
                        <div className="flex items-center gap-2">
                          <input
                            id="import-save-input"
                            type="file"
                            accept="application/json"
                            onChange={(e) => {
                              const f = e.target.files && e.target.files[0];
                              if (f) importSaveFromFile(f);
                              // clear input
                              e.target.value = null;
                            }}
                            className="text-xs"
                          />
                          <label htmlFor="import-save-input" className="text-xs text-slate-600">Import Save (JSON)</label>
                        </div>
                        <Button 
                          onClick={simulateGrowth}
                          className="w-full text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                          ⚡ Speed Up Growth
                        </Button>
                        <Button 
                          onClick={advanceSeason}
                          className="w-full text-xs bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        >
                          🌍 Change Season
                        </Button>
                        <Button 
                          onClick={changeWeather}
                          className="w-full text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        >
                          🌤️ Change Weather
                        </Button>
                        
                        {/* NEW: Enhanced feature test buttons */}
                        <Button 
                          onClick={() => {
                            // Test disease system
                            const randomPlot = Math.floor(Math.random() * plots.length);
                            if (plots[randomPlot].state === "planted" || plots[randomPlot].state === "growing") {
                              const diseases = Object.keys(CROP_DISEASES);
                              const disease = diseases[Math.floor(Math.random() * diseases.length)];
                              setPlots(prev => prev.map((p, idx) => 
                                idx === randomPlot ? { ...p, disease } : p
                              ));
                              addNotification(`Disease test: ${CROP_DISEASES[disease].name} on plot ${randomPlot + 1}`, "warning");
                            }
                          }}
                          className="w-full text-xs bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                        >
                          🦠 Test Disease
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            // Test bee pollination
                            if (buildings.beehive) {
                              setBeeHappiness(100);
                              addNotification("Bees are now fully happy! 🐝", "success");
                            } else {
                              addNotification("Build a beehive first! 🏗️", "warning");
                            }
                          }}
                          className="w-full text-xs bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                        >
                          🐝 Test Bees
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            // Test crop rotation
                            setRotationUses(prev => prev + 5);
                            addNotification("Crop rotation bonus increased! 🔄", "success");
                          }}
                          className="w-full text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                          🔄 Test Rotation
                        </Button>
                        <Button 
                          onClick={() => {
                            setLastGrowthTick(0); // Force immediate growth
                            addNotification("⚡ Growth boosted!", "success");
                          }}
                          className="w-full text-xs bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                        >
                          ⚡ Force Growth Tick
                        </Button>
                        <Button 
                          onClick={clearSaveData}
                          className="w-full text-xs bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                        >
                          🗑️ Reset Game Data
                        </Button>
                        <Button
                          onClick={() => {
                            try {
                              const snapshot = { rules, gridSize, plots, coins };
                              saveState(snapshot);
                              console.log('Saved snapshot', snapshot);
                              const raw = localStorage.getItem('farm_sim_enhanced_v1');
                              console.log('LocalStorage value:', raw);
                              addNotification('Save triggered (check console)', 'success');
                            } catch (e) { console.error(e); addNotification('Save failed', 'error'); }
                          }}
                          className="w-full text-xs bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700"
                        >
                          💾 Save Now (debug)
                        </Button>
                        <Button
                          onClick={() => {
                            try {
                              const snapshot = loadSave() || {
                                version: 1,
                                savedAt: Date.now(),
                                rules, gridSize, plots, coins, score, totalEarned, name, inventory, selectedSeed,
                                levelId, levelEndsAt, levelStatus, levelStartedAt, achievements, weather, weatherEvents,
                                totalHarvests, qualityHarvests, pestEliminations, seasonalPlants,
                                buildings, livestock, processedGoods, npcs, events, automation,
                                currentSeason, seasonEndsAt, marketTrends, sprinklers, scarecrows, combo, comboTimer, particles,
                                soundEnabled, log, gameTime, lastGrowthTick
                              };
                              const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `farm_save_${new Date().toISOString()}.json`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                              addNotification('Export started (download should begin)', 'success');
                            } catch (e) { console.error(e); addNotification('Export failed', 'error'); }
                          }}
                          className="w-full text-xs bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        >
                          📤 Export Save
                        </Button>
                        <div className="text-xs text-gray-600">
                          Control seasons, weather, growth speed, and test all game features
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Inventory */}
                <div>
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Gift size={16}/>
                    Inventory
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(inventory).filter(([,v]) => v > 0).map(([k,v]) => (
                      <div key={k} className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between border">
                        <span className="capitalize flex items-center gap-1">
                          {rules.seeds[k]?.emoji || "📦"} {k}
                        </span>
                        <Badge variant="secondary">{v}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Planting Selection */}
                <div>
                  <div className="text-sm font-semibold mb-2">🌱 Selected Seed</div>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm" 
                    value={selectedSeed} 
                    onChange={(e) => setSelectedSeed(e.target.value)}
                  >
                    {Object.entries(rules.seeds).map(([seed, data]) => (
                      <option key={seed} value={seed}>
                        {data.emoji} {seed} ({data.stages} stages, +{data.baseValue}🪙)
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Level Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-blue-600" size={20}/>
                  Farm Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={levelId} onValueChange={(v) => {
                  setLevelId(v);
                  const L = LEVELS.find(l => l.id === v);
                  if (L) {
                    setLevelEndsAt(nowSec() + L.minutes * 60);
                    setLevelStartedAt(nowSec());
                    setLevelStatus("playing");
                    addLog(`🎯 New goal: ${L.label}`);
                  }
                }}>
                  <TabsList className="grid grid-cols-2 w-full">
                    {LEVELS.slice(0, 2).map(L => (
                      <TabsTrigger key={L.id} value={L.id} className="text-xs">
                        {L.id.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsList className="grid grid-cols-2 w-full mt-2">
                    {LEVELS.slice(2).map(L => (
                      <TabsTrigger key={L.id} value={L.id} className="text-xs">
                        {L.id === "endless" ? "ENDLESS" : L.id.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {LEVELS.map(L => (
                    <TabsContent key={L.id} value={L.id} className="text-sm space-y-2">
                      <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-3 border">
                        <div className="font-semibold">{L.label}</div>
                        <div className="text-xs opacity-70 mt-1">
                          Target: <span className="font-bold text-emerald-600">{L.targetCoins}🪙</span> • 
                          Time: <span className="font-bold text-blue-600">{L.minutes === 9999 ? "∞" : `${L.minutes}min`}</span>
                          {L.reward > 0 && (
                            <> • Reward: <span className="font-bold text-purple-600">{L.reward}🪙</span></>
                          )}
                        </div>
                        <div className="text-xs opacity-60 mt-1">Difficulty: {L.difficulty}</div>
                        
                        {/* Progress bar for current level */}
                        {L.id === levelId && L.id !== "endless" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress: {coins}/{L.targetCoins}🪙</span>
                              <span>{Math.round((coins / L.targetCoins) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (coins / L.targetCoins) * 100)}%` }}
                              />
                            </div>
                            
                            {/* Time remaining */}
                            <div className="mt-2 text-xs text-center">
                              <span className="font-semibold">Time Remaining: </span>
                              <span className={`font-bold ${
                                levelEndsAt - currentTime < 60 ? 'text-red-600' : 
                                levelEndsAt - currentTime < 120 ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {formatTimeRemaining(levelEndsAt, currentTime)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Event Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20}/>
                  Farm Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs max-h-[300px] overflow-auto pr-2">
                  {log.map((line, idx) => (
                    <div key={idx} className="text-slate-700 bg-slate-50/50 rounded px-2 py-1">
                      {line}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Field */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="text-green-600" size={20}/>
                  Farm Field ({gridSize}×{gridSize})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="grid gap-4 p-2" 
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                  {plots.map((p, i) => <PlotCard key={i} p={p} i={i} />)}
                </div>
              </CardContent>
            </Card>

            {/* Level Status */}
            {levelStatus !== "playing" && level && (
              <Card className={`border-4 ${levelStatus === 'won' ? 'border-emerald-400 bg-emerald-50/50' : 'border-red-400 bg-red-50/50'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${levelStatus === 'won' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {levelStatus === 'won' ? <Trophy size={24}/> : <AlertTriangle size={24}/>}
                    {levelStatus === 'won' ? '🎉 Goal Complete!' : '⏰ Time\'s Up!'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {levelStatus === 'won' ? (
                    <div className="text-emerald-700">
                      🎊 Congratulations! You reached {level.targetCoins}🪙 and earned {level.reward}🪙 bonus!
                      Your farming skills are improving!
                    </div>
                  ) : (
                    <div className="text-red-700">
                      ⏱️ Time expired! You earned {coins}🪙 out of {level.targetCoins}🪙 needed.
                      Keep practicing your farming techniques!
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        const L = LEVELS.find(l => l.id === levelId);
                        if (L) {
                          setLevelEndsAt(nowSec() + L.minutes * 60);
                          setLevelStartedAt(nowSec());
                          setLevelStatus("playing");
                          addLog("🔄 Timer restarted!");
                        }
                      }}
                      className="flex-1"
                    >
                      🔄 Try Again
                    </Button>
                    {levelStatus === 'won' && levelId !== 'endless' && (
                      <Button 
                        onClick={() => {
                          const nextLevel = LEVELS.find(l => l.id === `lvl${parseInt(levelId.slice(3)) + 1}`);
                          if (nextLevel) {
                            setCoins(c => c + level.reward);
                            setLevelId(nextLevel.id);
                            setLevelEndsAt(nowSec() + nextLevel.minutes * 60);
                            setLevelStartedAt(nowSec());
                            setLevelStatus("playing");
                            addLog(`🚀 Advanced to ${nextLevel.label}!`);
                          }
                        }}
                        variant="secondary"
                        className="flex-1"
                      >
                        🚀 Next Level
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Enhanced Tips */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
          <div className="text-sm text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 mb-2">🌟 Advanced Farming Guide:</div>
            <div>� <strong>Seasons:</strong> Each season lasts 2 minutes. Plant crops in their optimal season for +30% bonus!</div>
            <div>📊 <strong>Market:</strong> Crop prices fluctuate - watch for high demand (📈) to maximize profits</div>
            <div>🔥 <strong>Combos:</strong> Harvest crops quickly for combo multipliers and bonus coins</div>
            <div>⭐ <strong>Quality:</strong> 20% chance for high-quality crops worth extra coins</div>
            <div>🌧️ <strong>Weather:</strong> Rain boosts growth, drought increases withering, frost stops growth</div>
            <div>🧪 <strong>Fertilizer:</strong> Stacks up to {rules.fertilizer.maxStacks}x for maximum growth speed</div>
            <div>💧 <strong>Watering Can:</strong> Provides enhanced watering with growth bonuses</div>
            <div>🏆 <strong>Achievements:</strong> Complete farming milestones for coin rewards and bragging rights</div>
            <div className="mt-2 p-2 bg-emerald-50 rounded border-emerald-200 border">
              <strong>🎯 Current Season:</strong> {SEASON_EFFECTS[currentSeason].name} • 
              <strong> Optimal Crops:</strong> {Object.entries(rules.seeds).filter(([,data]) => data.season === currentSeason).map(([seed,data]) => data.emoji).join(" ")}
            </div>
            <div className="mt-2 p-2 bg-yellow-50 rounded border-yellow-200 border">
              <strong>⏰ Growth:</strong> Use "Speed Up Growth" button to grow plants • 
              <span className="text-xs opacity-75">Manual growth system active</span>
            </div>
            <div className="mt-2 p-2 bg-blue-50 rounded border-blue-200 border">
              <strong>🧪 Pro Tip:</strong> Use the Test tab to get free seeds, change seasons/weather, and speed up growth for experimentation!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
