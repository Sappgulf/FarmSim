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
  CloudRain, CloudLightning, Flower, Calendar, Thermometer, Umbrella, Settings as SettingsIcon,
  Users, MessageSquare, UserPlus, ShoppingCart, MapPin, Award, TrendingUp, Search, 
  UserCheck, UserX, Mail, Eye, EyeOff, LogIn, LogOut, User
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

// PRESTIGE SYSTEM
const PRESTIGE_LEVELS = [
  { level: 0, name: "Beginner", emoji: "🌱", multiplier: 1.0, requirement: 0 },
  { level: 1, name: "Experienced", emoji: "🌿", multiplier: 1.1, requirement: 1000 },
  { level: 2, name: "Expert", emoji: "🍃", multiplier: 1.25, requirement: 5000 },
  { level: 3, name: "Master", emoji: "🌳", multiplier: 1.5, requirement: 15000 },
  { level: 4, name: "Grandmaster", emoji: "🏆", multiplier: 2.0, requirement: 50000 },
  { level: 5, name: "Legend", emoji: "👑", multiplier: 3.0, requirement: 150000 }
];

const PRESTIGE_BONUSES = {
  growth_speed: 0.05,      // 5% faster growth per prestige level
  coin_multiplier: 0.1,    // 10% more coins per prestige level
  quality_chance: 0.02,    // 2% better quality chance per level
  skill_points: 3          // Extra skill points per prestige
};

// SKILL TREE SYSTEM
const SKILL_TREES = {
  farming: {
    name: "🌾 Farming",
    icon: "🚜",
    description: "Core farming abilities",
    skills: {
      green_thumb: { name: "Green Thumb", maxLevel: 5, cost: [1,2,3,4,5], effect: "growth_speed", value: 0.1, description: "+10% growth speed per level" },
      quality_seeds: { name: "Quality Seeds", maxLevel: 3, cost: [2,4,6], effect: "quality_chance", value: 0.05, description: "+5% quality chance per level" },
      efficient_watering: { name: "Efficient Watering", maxLevel: 4, cost: [1,2,3,4], effect: "water_efficiency", value: 0.25, description: "+25% longer watering duration per level" },
      pest_resistance: { name: "Pest Resistance", maxLevel: 3, cost: [3,5,7], effect: "pest_immunity", value: 0.2, description: "+20% pest immunity per level" },
      crop_rotation_master: { name: "Rotation Master", maxLevel: 4, cost: [2,3,4,5], effect: "rotation_bonus", value: 0.1, description: "+10% rotation bonus per level" }
    }
  },
  business: {
    name: "💼 Business",
    icon: "📈",
    description: "Economic and trading abilities",
    skills: {
      market_insight: { name: "Market Insight", maxLevel: 5, cost: [2,3,4,5,6], effect: "price_prediction", value: 1, description: "See market price trends in advance" },
      negotiator: { name: "Negotiator", maxLevel: 4, cost: [1,3,5,7], effect: "trade_bonus", value: 0.15, description: "+15% better trade prices per level" },
      bulk_discount: { name: "Bulk Discount", maxLevel: 3, cost: [2,4,6], effect: "shop_discount", value: 0.1, description: "+10% shop discount per level" },
      investment_savvy: { name: "Investment Savvy", maxLevel: 5, cost: [3,4,5,6,7], effect: "futures_bonus", value: 0.2, description: "+20% futures contract profits per level" },
      export_license: { name: "Export License", maxLevel: 1, cost: [10], effect: "unlock_export", value: 1, description: "Unlock international markets" }
    }
  },
  technology: {
    name: "🔬 Technology",
    icon: "⚡",
    description: "Automation and advanced tools",
    skills: {
      automation: { name: "Automation", maxLevel: 5, cost: [3,4,5,6,7], effect: "auto_actions", value: 1, description: "Unlock automated farming actions" },
      research_lab: { name: "Research Lab", maxLevel: 3, cost: [5,8,12], effect: "research_speed", value: 0.5, description: "+50% research speed per level" },
      weather_station: { name: "Weather Station", maxLevel: 4, cost: [2,3,4,5], effect: "weather_forecast", value: 1, description: "Extended weather forecasting" },
      greenhouse_tech: { name: "Greenhouse Tech", maxLevel: 3, cost: [4,6,8], effect: "season_immunity", value: 0.33, description: "Reduce seasonal penalties" },
      drone_monitoring: { name: "Drone Monitoring", maxLevel: 2, cost: [8,15], effect: "instant_diagnosis", value: 1, description: "Instantly detect crop issues" }
    }
  },
  social: {
    name: "👥 Social",
    icon: "🤝",
    description: "Community and relationship building",
    skills: {
      charisma: { name: "Charisma", maxLevel: 5, cost: [1,2,3,4,5], effect: "social_bonus", value: 0.2, description: "+20% social reputation gains per level" },
      network_builder: { name: "Network Builder", maxLevel: 3, cost: [3,5,7], effect: "friend_limit", value: 10, description: "+10 friend slots per level" },
      market_connections: { name: "Market Connections", maxLevel: 4, cost: [2,4,6,8], effect: "listing_bonus", value: 0.15, description: "+15% market listing profits per level" },
      community_leader: { name: "Community Leader", maxLevel: 2, cost: [10,20], effect: "event_bonuses", value: 0.5, description: "+50% community event rewards per level" },
      gift_master: { name: "Gift Master", maxLevel: 3, cost: [2,3,4], effect: "daily_gifts", value: 2, description: "+2 daily gift limit per level" }
    }
  }
};

// RESEARCH SYSTEM
const RESEARCH_PROJECTS = {
  hybrid_crops: {
    name: "Hybrid Crops",
    emoji: "🧬",
    description: "Develop superior crop varieties",
    cost: 100,
    time: 300, // 5 minutes
    unlocks: ["premium_seeds"],
    prerequisites: []
  },
  irrigation_system: {
    name: "Advanced Irrigation",
    emoji: "💧",
    description: "Automated watering systems",
    cost: 150,
    time: 480,
    unlocks: ["auto_irrigation"],
    prerequisites: ["hybrid_crops"]
  },
  pest_genetics: {
    name: "Pest Genetics",
    emoji: "🧪",
    description: "Genetic pest resistance",
    cost: 200,
    time: 600,
    unlocks: ["resistant_crops"],
    prerequisites: ["hybrid_crops"]
  },
  market_analytics: {
    name: "Market Analytics",
    emoji: "📊",
    description: "Advanced market prediction AI",
    cost: 250,
    time: 720,
    unlocks: ["price_alerts", "trend_analysis"],
    prerequisites: []
  },
  climate_control: {
    name: "Climate Control",
    emoji: "🌡️",
    description: "Weather-independent farming",
    cost: 400,
    time: 900,
    unlocks: ["weather_immunity"],
    prerequisites: ["irrigation_system", "pest_genetics"]
  }
};

// ADVANCED WORKER SYSTEM
const WORKER_TYPES = {
  irrigator: {
    name: "Irrigator",
    emoji: "💧",
    description: "Automatically waters crops",
    cost: 200,
    upkeep: 10, // per day
    efficiency: 0.8, // 80% as effective as manual
    unlocks: "auto_watering"
  },
  harvester: {
    name: "Harvester",
    emoji: "🚜",
    description: "Automatically harvests ready crops",
    cost: 350,
    upkeep: 15,
    efficiency: 0.9,
    unlocks: "auto_harvesting"
  },
  pest_controller: {
    name: "Pest Controller",
    emoji: "🐛",
    description: "Automatically treats pest infestations",
    cost: 180,
    upkeep: 8,
    efficiency: 0.85,
    unlocks: "auto_pest_control"
  },
  quality_inspector: {
    name: "Quality Inspector",
    emoji: "🔍",
    description: "Improves crop quality through careful monitoring",
    cost: 300,
    upkeep: 12,
    efficiency: 0.75,
    unlocks: "quality_boost"
  },
  market_analyst: {
    name: "Market Analyst",
    emoji: "📈",
    description: "Provides market insights and trading recommendations",
    cost: 500,
    upkeep: 20,
    efficiency: 1.0,
    unlocks: "market_predictions"
  }
};

// SUPPLY CHAIN SYSTEM
const PROCESSING_FACILITIES = {
  flour_mill: {
    name: "Flour Mill",
    emoji: "🏭",
    description: "Process wheat into flour",
    cost: 500,
    input: "wheat",
    output: "flour",
    ratio: 2, // 2 wheat = 1 flour
    value_multiplier: 2.5,
    time: 60 // 1 minute processing time
  },
  juice_press: {
    name: "Juice Press",
    emoji: "🧃",
    description: "Process fruits into juice",
    cost: 400,
    input: "apple",
    output: "apple_juice",
    ratio: 3,
    value_multiplier: 2.2,
    time: 45
  },
  oil_press: {
    name: "Oil Press",
    emoji: "🫒",
    description: "Extract oil from seeds",
    cost: 600,
    input: "sunflower",
    output: "sunflower_oil",
    ratio: 4,
    value_multiplier: 3.0,
    time: 90
  },
  preservation_facility: {
    name: "Preservation Facility",
    emoji: "🥫",
    description: "Preserve crops for longer storage",
    cost: 800,
    input: "any", // accepts any crop
    output: "preserved",
    ratio: 1,
    value_multiplier: 1.8,
    time: 120,
    storage_bonus: 10 // days of extra storage
  }
};

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

// Town Development Constants
const TOWN_BUILDINGS = {
  general_store: { name: "General Store", emoji: "🏪", cost: 0, description: "Basic supplies and seeds", unlocked: true },
  blacksmith: { name: "Blacksmith", emoji: "⚒️", cost: 500, description: "Tools and farm equipment", reputationRequired: 50 },
  tavern: { name: "Tavern", emoji: "🍺", cost: 800, description: "Social hub and information", reputationRequired: 100 },
  bank: { name: "Bank", emoji: "🏦", cost: 1200, description: "Loans and savings", reputationRequired: 150 },
  clinic: { name: "Clinic", emoji: "🏥", cost: 1000, description: "Medical services", reputationRequired: 125 },
  school: { name: "School", emoji: "🏫", cost: 1500, description: "Education and research", reputationRequired: 200 },
  library: { name: "Library", emoji: "📚", cost: 900, description: "Knowledge and books", reputationRequired: 175 },
  market: { name: "Market Hall", emoji: "🏢", cost: 2000, description: "Premium trading", reputationRequired: 250 },
  festival_grounds: { name: "Festival Grounds", emoji: "🎪", cost: 1800, description: "Event hosting", reputationRequired: 225 },
  town_hall: { name: "Town Hall", emoji: "🏛️", cost: 3000, description: "Government and permits", reputationRequired: 300 }
};

const TOWN_EVENTS = [
  { id: "harvest_festival", name: "Harvest Festival", emoji: "🎉", description: "Celebrate the harvest season", duration: 180, effects: { reputation: 50, coins: 200 } },
  { id: "market_day", name: "Market Day", emoji: "🛒", description: "Increased market activity", duration: 120, effects: { market_multiplier: 1.3 } },
  { id: "town_meeting", name: "Town Meeting", emoji: "🏛️", description: "Discuss town improvements", duration: 90, effects: { reputation: 25 } },
  { id: "craft_fair", name: "Craft Fair", emoji: "🎨", description: "Showcase local crafts", duration: 150, effects: { reputation: 35, processing_bonus: 1.2 } },
  { id: "charity_drive", name: "Charity Drive", emoji: "❤️", description: "Help the community", duration: 100, effects: { reputation: 40 } }
];

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
  // NEW: Soil and workforce systems
  soil: {
    fertilityMin: 0.5,
    fertilityMax: 1.5,
    decayOnHarvest: 0.05,
    regenPerMinute: 0.02,
    compostPrice: 20,
    compostBoost: 0.2,
  },
  workforce: {
    farmhandPrice: 100,
    actionsPerHand: 2,
    actionIntervalSec: 5,
  },
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

// Social & Multiplayer System Constants
const SOCIAL_FEATURES = {
  FRIENDS: {
    MAX_FRIENDS: 50,
    DAILY_GIFT_LIMIT: 5,
    VISIT_REWARDS: { coins: 10, experience: 5 }
  },
  MARKET: {
    LISTING_FEE: 5,
    MAX_LISTINGS: 10,
    COMMISSION_RATE: 0.05
  },
  EVENTS: {
    DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
    MIN_PARTICIPANTS: 10,
    REWARD_MULTIPLIER: 1.5
  }
};

const COMMUNITY_EVENTS = {
  harvest_festival: {
    name: "🎃 Harvest Festival",
    description: "Community competition to harvest the most crops",
    requirement: "harvest_count",
    target: 1000, // Global target
    reward: { coins: 500, reputation: 100 },
    emoji: "🎃"
  },
  market_crash: {
    name: "📉 Market Recovery",
    description: "Help stabilize the market by trading",
    requirement: "trades_made",
    target: 500,
    reward: { coins: 300, reputation: 50 },
    emoji: "📈"
  },
  weather_disaster: {
    name: "🌪️ Storm Relief",
    description: "Donate crops to help storm victims",
    requirement: "donations",
    target: 2000,
    reward: { coins: 400, reputation: 150 },
    emoji: "❤️"
  }
};

const GIFT_TYPES = {
  seeds: {
    items: ["carrot", "potato", "corn", "tomato"],
    rarity: { common: 0.7, uncommon: 0.25, rare: 0.05 },
    amounts: { min: 1, max: 5 }
  },
  coins: {
    amounts: { min: 10, max: 50 }
  },
  tools: {
    items: ["fertilizer", "pesticide", "water"],
    amounts: { min: 1, max: 3 }
  },
  special: {
    items: ["golden_seed", "luck_charm", "growth_booster"],
    rarity: 0.01 // Very rare
  }
};

const PLAYER_RANKS = {
  novice: { name: "🌱 Novice Farmer", minReputation: 0, benefits: [] },
  apprentice: { name: "🚜 Apprentice", minReputation: 100, benefits: ["5% market bonus"] },
  expert: { name: "🏆 Expert Farmer", minReputation: 500, benefits: ["10% market bonus", "Exclusive seeds"] },
  master: { name: "👑 Master Farmer", minReputation: 1000, benefits: ["15% market bonus", "All benefits", "Special events"] },
  legendary: { name: "🌟 Legendary", minReputation: 2500, benefits: ["20% market bonus", "Legendary status", "Custom farm themes"] }
};

// Account System & Player Database (Mock)
const ACCOUNT_SYSTEM = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 4,
  SEARCH_RESULTS_LIMIT: 10
};

// Mock Player Database (In real app, this would be server-side)
const MOCK_PLAYERS = [
  { id: "player_001", username: "FarmMaster", displayName: "Farm Master", level: 15, reputation: 450, joinDate: Date.now() - 86400000 * 30, country: "USA", avatar: "🚜", isOnline: true },
  { id: "player_002", username: "CropQueen", displayName: "Crop Queen", level: 12, reputation: 320, joinDate: Date.now() - 86400000 * 20, country: "Canada", avatar: "👸", isOnline: false },
  { id: "player_003", username: "HarvestKing", displayName: "Harvest King", level: 18, reputation: 680, joinDate: Date.now() - 86400000 * 45, country: "UK", avatar: "👑", isOnline: true },
  { id: "player_004", username: "SeedSower", displayName: "Seed Sower", level: 8, reputation: 180, joinDate: Date.now() - 86400000 * 15, country: "Australia", avatar: "🌱", isOnline: false },
  { id: "player_005", username: "GreenThumb", displayName: "Green Thumb", level: 22, reputation: 890, joinDate: Date.now() - 86400000 * 60, country: "Germany", avatar: "🌿", isOnline: true },
  { id: "player_006", username: "TomatoTycoon", displayName: "Tomato Tycoon", level: 14, reputation: 380, joinDate: Date.now() - 86400000 * 25, country: "Italy", avatar: "🍅", isOnline: false },
  { id: "player_007", username: "CornerField", displayName: "Corner Field", level: 16, reputation: 520, joinDate: Date.now() - 86400000 * 35, country: "France", avatar: "🌽", isOnline: true },
  { id: "player_008", username: "FlowerPower", displayName: "Flower Power", level: 11, reputation: 290, joinDate: Date.now() - 86400000 * 18, country: "Netherlands", avatar: "🌸", isOnline: false }
];

let mockPlayerDatabase = [...MOCK_PLAYERS]; // Copy for modifications

// Account System Functions (Mock Implementation)
const AccountAPI = {
  currentSession: null,
  
  async createAccount(username, password, displayName) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if username exists
    if (mockPlayerDatabase.find(p => p.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already taken");
    }
    
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      displayName: displayName || username,
      level: 1,
      reputation: 0,
      joinDate: Date.now(),
      country: "Unknown",
      avatar: "🚜",
      isOnline: true
    };
    
    mockPlayerDatabase.push(newPlayer);
    this.currentSession = newPlayer;
    localStorage.setItem('farmgame_session', JSON.stringify(newPlayer));
    return newPlayer;
  },
  
  async login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const player = mockPlayerDatabase.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (!player) {
      throw new Error("Player not found");
    }
    
    // Mark as online
    player.isOnline = true;
    this.currentSession = player;
    localStorage.setItem('farmgame_session', JSON.stringify(player));
    return player;
  },
  
  logout() {
    if (this.currentSession) {
      const player = mockPlayerDatabase.find(p => p.id === this.currentSession.id);
      if (player) player.isOnline = false;
    }
    this.currentSession = null;
    localStorage.removeItem('farmgame_session');
  },
  
  async searchPlayers(query) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const results = mockPlayerDatabase.filter(p => 
      p.username.toLowerCase().includes(query.toLowerCase()) || 
      p.displayName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, ACCOUNT_SYSTEM.SEARCH_RESULTS_LIMIT);
    
    return results;
  },
  
  getSession() {
    if (this.currentSession) return this.currentSession;
    
    try {
      const saved = localStorage.getItem('farmgame_session');
      if (saved) {
        this.currentSession = JSON.parse(saved);
        return this.currentSession;
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
    return null;
  }
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
    planting: false,
    soilFertility: 1.0, lastSoilUpdate: nowSec(),
  };
  return {
    state, seed: null, growth: 0, watered: false,
    plantedAt: null, lastWateredAt: null, fertilized: 0, infested: false,
    boosted: false, quality: 1, disease: null, lastCropFamily: null, rotationBonus: 0,
    beePollinated: false, lastHarvested: null,
    planting: false,
    soilFertility: 1.0, lastSoilUpdate: nowSec(),
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
const SAVE_KEY = "farm_sim_enhanced_v2";
function loadSave() {
  try { 
    const s = localStorage.getItem(SAVE_KEY); 
    if (s) {
      const parsed = JSON.parse(s);
      // Only return if it's v2 format, otherwise start fresh
      if (parsed?.version === 2) return parsed;
    }
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

  const [rules, setRules] = useState(() => {
    const base = DEFAULT_RULES;
    const fromSave = saved?.rules || {};
    return {
      ...base,
      ...fromSave,
      soil: { ...(base.soil || {}), ...(fromSave.soil || {}) },
      workforce: { ...(base.workforce || {}), ...(fromSave.workforce || {}) },
      seeds: { ...(base.seeds || {}), ...(fromSave.seeds || {}) },
      buildings: { ...(base.buildings || {}), ...(fromSave.buildings || {}) },
      livestock: { ...(base.livestock || {}), ...(fromSave.livestock || {}) },
      tools: { ...(base.tools || {}), ...(fromSave.tools || {}) },
      processing: { ...(base.processing || {}), ...(fromSave.processing || {}) },
    };
  });
  const [gridSize, setGridSize] = useState(saved?.gridSize || MIN_SIZE);
  const [plots, setPlots] = useState(() => {
    if (Array.isArray(saved?.plots)) {
      const now = nowSec();
      return saved.plots.map(p => ({
        ...p,
        soilFertility: p?.soilFertility ?? 1.0,
        lastSoilUpdate: p?.lastSoilUpdate ?? now,
        planting: p?.planting ?? false,
      }));
    }
    return makeGrid(saved?.gridSize || MIN_SIZE);
  });
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
  
  // PRESTIGE SYSTEM STATE
  const [prestigeLevel, setPrestigeLevel] = useState(saved?.prestigeLevel || 0);
  const [prestigePoints, setPrestigePoints] = useState(saved?.prestigePoints || 0);
  const [totalLifetimeCoins, setTotalLifetimeCoins] = useState(saved?.totalLifetimeCoins || 0);
  
  // SKILL TREE STATE
  const [skillPoints, setSkillPoints] = useState(saved?.skillPoints || 5); // Start with some skill points
  const [skillLevels, setSkillLevels] = useState(saved?.skillLevels || {
    // Farming skills
    green_thumb: 0, quality_seeds: 0, efficient_watering: 0, pest_resistance: 0, crop_rotation_master: 0,
    // Business skills  
    market_insight: 0, negotiator: 0, bulk_discount: 0, investment_savvy: 0, export_license: 0,
    // Technology skills
    automation: 0, research_lab: 0, weather_station: 0, greenhouse_tech: 0, drone_monitoring: 0,
    // Social skills
    charisma: 0, network_builder: 0, market_connections: 0, community_leader: 0, gift_master: 0
  });
  
  // RESEARCH SYSTEM STATE
  const [researchPoints, setResearchPoints] = useState(saved?.researchPoints || 0);
  const [activeResearch, setActiveResearch] = useState(saved?.activeResearch || null);
  const [completedResearch, setCompletedResearch] = useState(saved?.completedResearch || []);
  const [researchStartedAt, setResearchStartedAt] = useState(saved?.researchStartedAt || null);
  
  // ADVANCED WORKER SYSTEM STATE
  const [workers, setWorkers] = useState(saved?.workers || []);
  const [workerUpkeep, setWorkerUpkeep] = useState(saved?.workerUpkeep || 0);
  const [lastWorkerPayment, setLastWorkerPayment] = useState(saved?.lastWorkerPayment || nowSec());
  
  // SUPPLY CHAIN STATE
  const [processingFacilities, setProcessingFacilities] = useState(saved?.processingFacilities || []);
  const [processingQueue, setProcessingQueue] = useState(saved?.processingQueue || []);
  const [processedInventory, setProcessedInventory] = useState(saved?.processedInventory || {});
  const [competitionsActive, setCompetitionsActive] = useState(saved?.competitionsActive || []);
  const [actionHistory, setActionHistory] = useState(saved?.actionHistory || []);
  
  // Farm Customization State
  const [farmTheme, setFarmTheme] = useState(saved?.farmTheme || "classic");
  const [decorations, setDecorations] = useState(saved?.decorations || []);
  const [farmLevel, setFarmLevel] = useState(saved?.farmLevel || 1);
  
  // Town Development State
  const [townBuildings, setTownBuildings] = useState(saved?.townBuildings || {});
  const [townEvents, setTownEvents] = useState(saved?.townEvents || []);
  const [townReputation, setTownReputation] = useState(saved?.townReputation || 0);
  
  // Visual & Animation State
  const [combo, setCombo] = useState(saved?.combo || 0);
  const [comboTimer, setComboTimer] = useState(saved?.comboTimer || 0);
  const [particles, setParticles] = useState(saved?.particles || []);
  const [soundEnabled, setSoundEnabled] = useState(saved?.soundEnabled ?? true);
  const [sfxVolume, setSfxVolume] = useState(saved?.sfxVolume ?? 1);
  const [animationsEnabled, setAnimationsEnabled] = useState(saved?.animationsEnabled ?? true);
  const [performanceMode, setPerformanceMode] = useState(saved?.performanceMode ?? false);
  const [autoTimeOfDay, setAutoTimeOfDay] = useState(saved?.autoTimeOfDay ?? true);
  const [paused, setPaused] = useState(saved?.paused ?? false);
  const [simSpeed, setSimSpeed] = useState(saved?.simSpeed ?? 1);

  // Account System State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', displayName: '', mode: 'login' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Friend System State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [sentRequests, setSentRequests] = useState(saved?.sentRequests || []);
  const [receivedRequests, setReceivedRequests] = useState(saved?.receivedRequests || []);

  // Social & Multiplayer State
  const [playerId] = useState(saved?.playerId || `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [playerProfile, setPlayerProfile] = useState(saved?.playerProfile || {
    displayName: saved?.name || "Farmer",
    bio: "A passionate farmer growing the future!",
    avatar: "🚜",
    joinDate: Date.now(),
    publicFarm: true,
    country: "Unknown"
  });
  
  // Friends & Social Network
  const [friends, setFriends] = useState(saved?.friends || []);
  const [friendRequests, setFriendRequests] = useState(saved?.friendRequests || []);
  const [socialReputation, setSocialReputation] = useState(saved?.socialReputation || 0);
  const [dailyGiftsReceived, setDailyGiftsReceived] = useState(saved?.dailyGiftsReceived || []);
  const [dailyGiftsSent, setDailyGiftsSent] = useState(saved?.dailyGiftsSent || []);
  const [lastGiftReset, setLastGiftReset] = useState(saved?.lastGiftReset || nowSec());
  
  // Community & Events
  const [activeEvents, setActiveEvents] = useState(saved?.activeEvents || []);
  const [eventContributions, setEventContributions] = useState(saved?.eventContributions || {});
  const [globalStats, setGlobalStats] = useState(saved?.globalStats || {
    totalPlayers: 1247,
    activePlayers: 389,
    cropsHarvested: 95432,
    tradesCompleted: 3241
  });
  
  // Farmers Market & Trading
  const [marketListings, setMarketListings] = useState(saved?.marketListings || []);
  const [myListings, setMyListings] = useState(saved?.myListings || []);
  const [tradeHistory, setTradeHistory] = useState(saved?.tradeHistory || []);
  const [marketReputation, setMarketReputation] = useState(saved?.marketReputation || 100);
  
  // Farm Visits & Ratings
  const [farmVisits, setFarmVisits] = useState(saved?.farmVisits || []);
  const [farmRating, setFarmRating] = useState(saved?.farmRating || { average: 5.0, totalRatings: 0 });
  const [visitHistory, setVisitHistory] = useState(saved?.visitHistory || []);

  const [levelId, setLevelId] = useState(saved?.levelId || LEVELS[0].id);
  const level = useMemo(() => LEVELS.find(l => l.id === levelId), [levelId]);
  const [levelEndsAt, setLevelEndsAt] = useState(saved?.levelEndsAt || nowSec() + (LEVELS[0]?.minutes || 5) * 60);
  const [levelStatus, setLevelStatus] = useState(saved?.levelStatus || "playing");
  const [levelStartedAt, setLevelStartedAt] = useState(saved?.levelStartedAt || nowSec());

  const [weather, setWeather] = useState(saved?.weather || { type: "Sunny", endsAt: nowSec() + 30 });
  const [log, setLog] = useState(saved?.log || ["🌱 Welcome to your farm! Plant seeds and watch them grow.", "💡 Tip: Right-click plots to fertilize or spray pesticide."]);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(nowSec());
  const [buying, setBuying] = useState(false);
  const [farmhands, setFarmhands] = useState(saved?.farmhands || 0);
  const [lastFarmhandAction, setLastFarmhandAction] = useState(saved?.lastFarmhandAction || nowSec());
  const [skills, setSkills] = useState(saved?.skills || { growthBoost: 0, valueBoost: 0 });
  const [shopTab, setShopTab] = useState('seeds');

  // Simple growth timer system
  const [gameTime, setGameTime] = useState(saved?.gameTime || 0);
  const [lastGrowthTick, setLastGrowthTick] = useState(saved?.lastGrowthTick || nowSec());

  // persist enhanced state (debounced to avoid excessive writes)
  const _saveTimeout = useRef(null);
  const _lastAutosaveToastAt = useRef(0);
  // WebAudio context for SFX
  const audioCtxRef = useRef(null);
  const plantingLocks = useRef(new Set());
  const lastPlantClickAt = useRef({});
  const buyingRef = useRef(false);

  // --- Sound effects via WebAudio (tiny tones, no assets) ---
  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    return audioCtxRef.current;
  };

  const playTone = (freq, durationMs, type = 'sine', volMul = 0.15) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = Math.max(0, Math.min(1, sfxVolume)) * volMul;
    osc.connect(gain).connect(ctx.destination);
    const t0 = ctx.currentTime;
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000);
  };

  const playSfx = (name) => {
    if (!soundEnabled) return;
    switch (name) {
      case 'plant': // digging/planting
        playTone(420, 50, 'sine', 0.10);
        setTimeout(() => playTone(500, 60, 'sine', 0.10), 60);
        break;
      case 'water': // watering
        playTone(260, 120, 'sawtooth', 0.06);
        break;
      default:
        // no other sounds
        return;
    }
  };
  useEffect(() => {
    // debounce saves but avoid infinite loops
    if (typeof window === "undefined") return;
    if (_saveTimeout.current) clearTimeout(_saveTimeout.current);
    _saveTimeout.current = setTimeout(() => {
      try {
        const snapshot = {
          version: 2, // Updated version for new features
          savedAt: Date.now(),
          rules, gridSize, plots: plots.slice(0, 25), // limit plot size
          coins, score, totalEarned, name, inventory, selectedSeed,
          levelId, levelEndsAt, levelStatus, levelStartedAt,
          achievements, weather, currentSeason,
          // Advanced Economy
          futuresContracts, economicEvents, marketPrices, reputation,
          competitionsActive, actionHistory,
          // Farm Customization
          farmTheme, decorations, farmLevel,
          // Town Development
          townBuildings, townEvents, townReputation,
          // Social & Multiplayer
          playerId, playerProfile, friends, friendRequests, socialReputation,
          dailyGiftsReceived, dailyGiftsSent, lastGiftReset, sentRequests, receivedRequests,
          activeEvents, eventContributions, globalStats,
          marketListings, myListings, tradeHistory, marketReputation,
          farmVisits, farmRating, visitHistory,
          // Visual & Animation
          combo, comboTimer, particles, soundEnabled,
          sfxVolume, animationsEnabled, performanceMode, autoTimeOfDay,
          paused, simSpeed,
          // Enhanced Systems
          buildings, livestock, processedGoods, npcs, events, automation,
          marketTrends, sprinklers, scarecrows,
          // Enhanced Visual/Gameplay
          currentTimeOfDay, weatherForecast, beeHappiness,
          diseasesCured, rotationUses, weatherPredictions, honeyProduced,
          seasonEndsAt, log, gameTime, lastGrowthTick,
          // New systems
          farmhands, lastFarmhandAction, skills,
          // PRESTIGE SYSTEM
          prestigeLevel, prestigePoints, totalLifetimeCoins,
          // SKILL TREE SYSTEM
          skillPoints, skillLevels,
          // RESEARCH SYSTEM
          researchPoints, activeResearch, completedResearch, researchStartedAt,
          // ADVANCED WORKER SYSTEM
          workers, workerUpkeep, lastWorkerPayment,
          // SUPPLY CHAIN SYSTEM
          processingFacilities, processingQueue, processedInventory
        };
        saveState(snapshot);
        // Autosave toast (throttled) to indicate saves without spamming
        const now = Date.now();
        if (now - _lastAutosaveToastAt.current > 15000) {
          try { addNotification('Autosaved', 'info'); } catch {}
          _lastAutosaveToastAt.current = now;
        }
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
    setNotifications(n => {
      const next = [...n, { id, msg, type }];
      // cap to 3 visible notifications
      return next.slice(-3);
    });
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

  // PRESTIGE SYSTEM FUNCTIONS
  const checkPrestigeEligibility = () => {
    const nextPrestige = PRESTIGE_LEVELS.find(p => p.level === prestigeLevel + 1);
    return nextPrestige && totalLifetimeCoins >= nextPrestige.requirement;
  };

  const performPrestige = () => {
    if (!checkPrestigeEligibility()) return false;
    
    const nextPrestige = PRESTIGE_LEVELS.find(p => p.level === prestigeLevel + 1);
    const prestigeBonus = prestigeLevel * PRESTIGE_BONUSES.skill_points;
    
    // Reset core progress but keep some things
    setCoins(50);
    setScore(0);
    setTotalEarned(0);
    setPlots(makeGrid(MIN_SIZE));
    setGridSize(MIN_SIZE);
    setInventory({ 
      carrot: 5, potato: 3, corn: 2, tomato: 1, strawberry: 1, pumpkin: 0, sunflower: 0,
      lettuce: 3, bellPepper: 1, garlic: 2,
      fertilizer: 3, pesticide: 2, wateringCan: 0, sprinkler: 0, scarecrow: 0,
      fungicide: 2, beeFeed: 1, honey: 0
    });
    setAchievements([]);
    setBuildings({});
    
    // Increase prestige level and give skill points
    setPrestigeLevel(prestigeLevel + 1);
    setSkillPoints(prev => prev + PRESTIGE_BONUSES.skill_points + prestigeBonus);
    setPrestigePoints(prev => prev + 1);
    
    addLog(`🌟 PRESTIGE! You are now ${nextPrestige.name} with ${nextPrestige.multiplier}x bonuses!`);
    addNotification(`Prestige unlocked! +${PRESTIGE_BONUSES.skill_points + prestigeBonus} skill points`, "success");
    return true;
  };

  const getPrestigeMultiplier = (type) => {
    const baseMultiplier = PRESTIGE_LEVELS.find(p => p.level === prestigeLevel)?.multiplier || 1.0;
    switch (type) {
      case 'coins':
        return baseMultiplier + (prestigeLevel * PRESTIGE_BONUSES.coin_multiplier);
      case 'growth':
        return 1 + (prestigeLevel * PRESTIGE_BONUSES.growth_speed);
      case 'quality':
        return prestigeLevel * PRESTIGE_BONUSES.quality_chance;
      default:
        return baseMultiplier;
    }
  };

  // SKILL TREE FUNCTIONS
  const canUpgradeSkill = (skillCategory, skillName) => {
    const skill = SKILL_TREES[skillCategory]?.skills[skillName];
    if (!skill) return false;
    
    const currentLevel = skillLevels[skillName] || 0;
    if (currentLevel >= skill.maxLevel) return false;
    
    const cost = skill.cost[currentLevel];
    return skillPoints >= cost;
  };

  const upgradeSkill = (skillCategory, skillName) => {
    if (!canUpgradeSkill(skillCategory, skillName)) return false;
    
    const skill = SKILL_TREES[skillCategory].skills[skillName];
    const currentLevel = skillLevels[skillName] || 0;
    const cost = skill.cost[currentLevel];
    
    setSkillPoints(prev => prev - cost);
    setSkillLevels(prev => ({ ...prev, [skillName]: currentLevel + 1 }));
    
    addLog(`📚 Upgraded ${skill.name} to level ${currentLevel + 1}!`);
    addNotification(`Skill upgraded: ${skill.name}`, "success");
    return true;
  };

  const getSkillEffect = (skillName) => {
    const level = skillLevels[skillName] || 0;
    if (level === 0) return 0;
    
    // Find the skill in all trees
    for (const tree of Object.values(SKILL_TREES)) {
      const skill = tree.skills[skillName];
      if (skill) {
        return skill.value * level;
      }
    }
    return 0;
  };

  // RESEARCH SYSTEM FUNCTIONS
  const canStartResearch = (projectId) => {
    const project = RESEARCH_PROJECTS[projectId];
    if (!project) return false;
    if (activeResearch) return false;
    if (completedResearch.includes(projectId)) return false;
    if (researchPoints < project.cost) return false;
    
    // Check prerequisites
    return project.prerequisites.every(prereq => completedResearch.includes(prereq));
  };

  const startResearch = (projectId) => {
    if (!canStartResearch(projectId)) return false;
    
    const project = RESEARCH_PROJECTS[projectId];
    setResearchPoints(prev => prev - project.cost);
    setActiveResearch(projectId);
    setResearchStartedAt(nowSec());
    
    addLog(`🔬 Started research: ${project.name}`);
    addNotification(`Research started: ${project.name}`, "success");
    return true;
  };

  const completeResearch = () => {
    if (!activeResearch) return;
    
    const project = RESEARCH_PROJECTS[activeResearch];
    setCompletedResearch(prev => [...prev, activeResearch]);
    setActiveResearch(null);
    setResearchStartedAt(null);
    
    // Apply research unlocks
    project.unlocks.forEach(unlock => {
      addLog(`🎉 Unlocked: ${unlock}`);
    });
    
    addNotification(`Research complete: ${project.name}!`, "success");
  };

  // WORKER SYSTEM FUNCTIONS
  const canHireWorker = (workerType) => {
    const worker = WORKER_TYPES[workerType];
    if (!worker) return false;
    if (coins < worker.cost) return false;
    if (workers.some(w => w.type === workerType)) return false; // One of each type
    return true;
  };

  const hireWorker = (workerType) => {
    if (!canHireWorker(workerType)) return false;
    
    const worker = WORKER_TYPES[workerType];
    setCoins(prev => prev - worker.cost);
    setWorkers(prev => [...prev, {
      id: `${workerType}_${Date.now()}`,
      type: workerType,
      hiredAt: nowSec(),
      efficiency: worker.efficiency,
      lastAction: nowSec()
    }]);
    setWorkerUpkeep(prev => prev + worker.upkeep);
    
    addLog(`👷 Hired ${worker.name}!`);
    addNotification(`Worker hired: ${worker.name}`, "success");
    return true;
  };

  const payWorkerUpkeep = () => {
    if (workerUpkeep === 0) return;
    if (coins < workerUpkeep) {
      // Fire all workers if can't pay
      setWorkers([]);
      setWorkerUpkeep(0);
      addNotification("Couldn't pay workers - all workers left!", "error");
      return;
    }
    
    setCoins(prev => prev - workerUpkeep);
    setLastWorkerPayment(nowSec());
    addLog(`💰 Paid worker upkeep: ${workerUpkeep}🪙`);
  };

  // SUPPLY CHAIN FUNCTIONS
  const canBuildFacility = (facilityType) => {
    const facility = PROCESSING_FACILITIES[facilityType];
    if (!facility) return false;
    if (coins < facility.cost) return false;
    if (processingFacilities.some(f => f.type === facilityType)) return false;
    return true;
  };

  const buildFacility = (facilityType) => {
    if (!canBuildFacility(facilityType)) return false;
    
    const facility = PROCESSING_FACILITIES[facilityType];
    setCoins(prev => prev - facility.cost);
    setProcessingFacilities(prev => [...prev, {
      id: `${facilityType}_${Date.now()}`,
      type: facilityType,
      builtAt: nowSec(),
      processing: null
    }]);
    
    addLog(`🏭 Built ${facility.name}!`);
    addNotification(`Facility built: ${facility.name}`, "success");
    return true;
  };

  const startProcessing = (facilityId, inputType, quantity) => {
    const facilityIndex = processingFacilities.findIndex(f => f.id === facilityId);
    if (facilityIndex === -1) return false;
    
    const facility = processingFacilities[facilityIndex];
    const facilityConfig = PROCESSING_FACILITIES[facility.type];
    
    if (facility.processing) return false; // Already processing
    if (facilityConfig.input !== "any" && facilityConfig.input !== inputType) return false;
    if ((inventory[inputType] || 0) < quantity * facilityConfig.ratio) return false;
    
    // Deduct input materials
    setInventory(prev => ({
      ...prev,
      [inputType]: (prev[inputType] || 0) - (quantity * facilityConfig.ratio)
    }));
    
    // Start processing
    const updatedFacilities = [...processingFacilities];
    updatedFacilities[facilityIndex] = {
      ...facility,
      processing: {
        inputType,
        outputType: facilityConfig.output === "preserved" ? `preserved_${inputType}` : facilityConfig.output,
        quantity,
        startedAt: nowSec(),
        completesAt: nowSec() + facilityConfig.time
      }
    };
    setProcessingFacilities(updatedFacilities);
    
    addLog(`🔄 Started processing ${quantity}x ${inputType}`);
    return true;
  };

  const completeProcessing = (facilityId) => {
    const facilityIndex = processingFacilities.findIndex(f => f.id === facilityId);
    if (facilityIndex === -1) return false;
    
    const facility = processingFacilities[facilityIndex];
    if (!facility.processing) return false;
    
    const processing = facility.processing;
    const facilityConfig = PROCESSING_FACILITIES[facility.type];
    
    // Add processed goods to inventory
    setProcessedInventory(prev => ({
      ...prev,
      [processing.outputType]: (prev[processing.outputType] || 0) + processing.quantity
    }));
    
    // Clear processing
    const updatedFacilities = [...processingFacilities];
    updatedFacilities[facilityIndex] = { ...facility, processing: null };
    setProcessingFacilities(updatedFacilities);
    
    const value = Math.round(rules.seeds[processing.inputType]?.baseValue * facilityConfig.value_multiplier * processing.quantity);
    addLog(`✅ Processing complete! Gained ${processing.quantity}x ${processing.outputType} (${value}🪙 value)`);
    addNotification(`Processing complete: ${processing.outputType}`, "success");
    return true;
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

  const settleFuturesContract = (contract) => {
    const currentPrice = marketPrices[contract.seedType] || rules.seeds[contract.seedType].baseValue;
    const priceDifference = currentPrice - contract.entryPrice;
    
    let profit = 0;
    if (contract.contractType === "buy" && priceDifference > 0) {
      profit = priceDifference * contract.amount;
    } else if (contract.contractType === "sell" && priceDifference < 0) {
      profit = Math.abs(priceDifference) * contract.amount;
    }

    setCoins(prev => prev + Math.round(profit));
    setFuturesContracts(prev => prev.filter(c => c.id !== contract.id));
    
    const message = profit > 0 ? `Profit: +${Math.round(profit)}💰` : `Loss: Contract expired`;
    addNotification(`Futures contract settled! ${message}`, profit > 0 ? "success" : "error");
    logAction("futures_settlement", { profit, seedType: contract.seedType });
  };

  const triggerEconomicEvent = () => {
    const event = ECONOMIC_EVENTS[Math.floor(Math.random() * ECONOMIC_EVENTS.length)];
    const newEvent = {
      ...event,
      startTime: nowSec(),
      endTime: nowSec() + event.duration
    };
    
    setEconomicEvents(prev => [...prev, newEvent]);
    addNotification(`Economic Event: ${event.name}`, "info");
    logAction("economic_event", { eventId: event.id });
  };

  const startCompetition = (competitionId) => {
    const competition = COMPETITION_TYPES[competitionId];
    if (!competition) return;

    const newCompetition = {
      id: Date.now(),
      type: competitionId,
      startTime: nowSec(),
      endTime: nowSec() + competition.duration,
      participants: [{ name, score: 0 }],
      isActive: true
    };

    setCompetitionsActive(prev => [...prev, newCompetition]);
    addNotification(`Competition started: ${competition.name}`, "success");
    logAction("competition_start", { type: competitionId });
  };

  const updateCompetitionScore = (competitionId, points) => {
    setCompetitionsActive(prev => prev.map(comp => {
      if (comp.id === competitionId) {
        return {
          ...comp,
          participants: comp.participants.map(p => 
            p.name === name ? { ...p, score: p.score + points } : p
          )
        };
      }
      return comp;
    }));
  };

  // Town Development Functions
  const buildTownBuilding = (buildingId) => {
    const building = TOWN_BUILDINGS[buildingId];
    if (!building) return;

    if (coins < building.cost) {
      addNotification("Not enough coins for town building!", "error");
      return;
    }

    if (building.reputationRequired && reputation < building.reputationRequired) {
      addNotification(`Need ${building.reputationRequired} reputation for ${building.name}!`, "error");
      return;
    }

    setCoins(prev => prev - building.cost);
    setTownBuildings(prev => ({ ...prev, [buildingId]: true }));
    setTownReputation(prev => prev + 10);
    addNotification(`${building.name} built! Town reputation +10`, "success");
    logAction("town_building", { buildingId, cost: building.cost });
  };

  const triggerTownEvent = () => {
    const availableEvents = TOWN_EVENTS.filter(event => 
      !townEvents.some(active => active.id === event.id)
    );
    
    if (availableEvents.length === 0) return;

    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    const newEvent = {
      ...event,
      startTime: nowSec(),
      endTime: nowSec() + event.duration,
      isActive: true
    };

    setTownEvents(prev => [...prev, newEvent]);
    addNotification(`Town Event: ${event.name}`, "info");
    
    // Apply immediate effects
    if (event.effects.reputation) {
      setReputation(prev => prev + event.effects.reputation);
    }
    if (event.effects.coins) {
      setCoins(prev => prev + event.effects.coins);
    }
    
    logAction("town_event", { eventId: event.id });
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

  // === ACCOUNT SYSTEM FUNCTIONS ===
  
  // Initialize account session on component mount
  useEffect(() => {
    const session = AccountAPI.getSession();
    if (session) {
      setCurrentUser(session);
      setIsLoggedIn(true);
      setPlayerProfile(prev => ({
        ...prev,
        displayName: session.displayName,
        avatar: session.avatar,
        country: session.country
      }));
    }
  }, []);
  
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    
    try {
      let user;
      if (loginForm.mode === 'register') {
        if (loginForm.username.length < ACCOUNT_SYSTEM.MIN_USERNAME_LENGTH) {
          throw new Error(`Username must be at least ${ACCOUNT_SYSTEM.MIN_USERNAME_LENGTH} characters`);
        }
        if (loginForm.password.length < ACCOUNT_SYSTEM.MIN_PASSWORD_LENGTH) {
          throw new Error(`Password must be at least ${ACCOUNT_SYSTEM.MIN_PASSWORD_LENGTH} characters`);
        }
        user = await AccountAPI.createAccount(loginForm.username, loginForm.password, loginForm.displayName);
        addNotification(`Welcome to Farm Game, ${user.displayName}!`, "success");
      } else {
        user = await AccountAPI.login(loginForm.username, loginForm.password);
        addNotification(`Welcome back, ${user.displayName}!`, "success");
      }
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '', displayName: '' });
      
      // Update player profile with account data
      setPlayerProfile(prev => ({
        ...prev,
        displayName: user.displayName,
        avatar: user.avatar,
        country: user.country
      }));
      
    } catch (error) {
      setLoginError(error.message);
      addNotification(error.message, "error");
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleLogout = () => {
    AccountAPI.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    addNotification("Logged out successfully", "info");
  };
  
  const searchPlayers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await AccountAPI.searchPlayers(query);
      setSearchResults(results.filter(p => p.id !== currentUser?.id)); // Exclude self
    } catch (error) {
      addNotification("Search failed", "error");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Enhanced friend request system
  const sendFriendRequestToPlayer = async (targetPlayer) => {
    if (!isLoggedIn) {
      addNotification("Please log in to send friend requests", "error");
      return;
    }
    
    // Check if already friends
    if (friends.find(f => f.id === targetPlayer.id)) {
      addNotification("Already friends with this player!", "warning");
      return;
    }
    
    // Check if request already sent
    if (sentRequests.find(r => r.toUserId === targetPlayer.id)) {
      addNotification("Friend request already sent!", "warning");
      return;
    }
    
    // Add to sent requests (in real app, this would send to server)
    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: currentUser?.id,
      toUserId: targetPlayer.id,
      toUsername: targetPlayer.username,
      toDisplayName: targetPlayer.displayName,
      sentAt: nowSec(),
      status: 'pending'
    };
    
    setSentRequests(prev => [...prev, newRequest]);
    addNotification(`Friend request sent to ${targetPlayer.displayName}!`, "success");
    logAction("friend_request_sent", { targetId: targetPlayer.id, targetName: targetPlayer.displayName });
    setShowFriendSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Accept friend request
  const acceptFriendRequestFromPlayer = (request) => {
    // Add to friends list - handle both sent and received request formats
    const newFriend = {
      id: request.fromUserId || request.toUserId,
      name: request.fromDisplayName || request.toDisplayName || 'Unknown',
      username: request.fromUsername || request.toUsername || 'unknown',
      addedAt: nowSec(),
      lastOnline: nowSec(),
      farmLevel: 1, // Default level, in real app would fetch from server
      reputation: 0
    };
    
    setFriends(prev => [...prev, newFriend]);
    setReceivedRequests(prev => prev.filter(r => r.id !== request.id));
    addNotification(`You are now friends with ${newFriend.name}!`, "success");
  };

  // Reject friend request
  const rejectFriendRequestFromPlayer = (request) => {
    const displayName = request.fromDisplayName || request.toDisplayName || 'Unknown';
    setReceivedRequests(prev => prev.filter(r => r.id !== request.id));
    addNotification(`Friend request from ${displayName} declined`, "info");
  };

  // === SOCIAL & MULTIPLAYER FUNCTIONS ===
  
  // Friends & Social Network Functions
  const sendFriendRequest = (targetPlayerId) => {
    // In a real app, this would send to server
    addNotification(`Friend request sent!`, "success");
    logAction("friend_request_sent", { targetPlayerId });
  };
  
  const acceptFriendRequest = (friendId, requestData) => {
    setFriends(prev => [...prev, { 
      id: friendId, 
      name: requestData.name, 
      addedAt: nowSec(),
      lastOnline: nowSec(),
      farmLevel: requestData.farmLevel || 1
    }]);
    setFriendRequests(prev => prev.filter(req => req.id !== friendId));
    addNotification(`You're now friends with ${requestData.name}!`, "success");
    logAction("friend_added", { friendId, friendName: requestData.name });
  };
  
  const sendGiftToFriend = (friendId, giftType, giftItem, amount = 1) => {
    const today = Math.floor(nowSec() / 86400); // Day number
    const giftsToday = dailyGiftsSent.filter(g => Math.floor(g.timestamp / 86400) === today);
    
    if (giftsToday.length >= SOCIAL_FEATURES.FRIENDS.DAILY_GIFT_LIMIT) {
      addNotification("Daily gift limit reached!", "error");
      return;
    }
    
    const gift = {
      id: `gift_${Date.now()}`,
      to: friendId,
      type: giftType,
      item: giftItem,
      amount,
      timestamp: nowSec()
    };
    
    setDailyGiftsSent(prev => [...prev, gift]);
    addNotification(`Gift sent! 🎁`, "success");
    logAction("gift_sent", { friendId, giftType, giftItem, amount });
  };
  
  const receiveGift = (gift) => {
    // Add items to inventory based on gift type
    if (gift.type === 'seeds') {
      setInventory(prev => ({
        ...prev,
        [gift.item]: (prev[gift.item] || 0) + gift.amount
      }));
    } else if (gift.type === 'coins') {
      setCoins(prev => prev + gift.amount);
    }
    
    setDailyGiftsReceived(prev => [...prev, { ...gift, receivedAt: nowSec() }]);
    addNotification(`Received ${gift.amount} ${gift.item} from friend! 🎁`, "success");
    logAction("gift_received", gift);
  };
  
  // Farmers Market Functions
  const createMarketListing = (itemType, itemName, quantity, pricePerUnit) => {
    const totalFee = SOCIAL_FEATURES.MARKET.LISTING_FEE;
    if (coins < totalFee) {
      addNotification("Not enough coins for listing fee!", "error");
      return false;
    }
    
    if (myListings.length >= SOCIAL_FEATURES.MARKET.MAX_LISTINGS) {
      addNotification("Maximum listings reached!", "error");
      return false;
    }
    
    const listing = {
      id: `listing_${Date.now()}`,
      sellerId: playerId,
      sellerName: playerProfile.displayName,
      itemType,
      itemName,
      quantity,
      pricePerUnit,
      totalPrice: quantity * pricePerUnit,
      createdAt: nowSec(),
      expiresAt: nowSec() + (7 * 24 * 60 * 60), // 7 days
      status: "active"
    };
    
    // Remove items from inventory
    if (itemType === 'seeds') {
      setInventory(prev => ({
        ...prev,
        [itemName]: Math.max(0, (prev[itemName] || 0) - quantity)
      }));
    }
    
    setCoins(prev => prev - totalFee);
    setMyListings(prev => [...prev, listing]);
    addNotification(`Listed ${quantity} ${itemName} for ${pricePerUnit}💰 each!`, "success");
    logAction("market_listing_created", listing);
    return true;
  };
  
  const purchaseFromMarket = (listing) => {
    const totalCost = listing.totalPrice;
    if (coins < totalCost) {
      addNotification("Not enough coins!", "error");
      return false;
    }
    
    // Add items to buyer inventory
    if (listing.itemType === 'seeds') {
      setInventory(prev => ({
        ...prev,
        [listing.itemName]: (prev[listing.itemName] || 0) + listing.quantity
      }));
    }
    
    setCoins(prev => prev - totalCost);
    
    // Record trade
    const trade = {
      id: `trade_${Date.now()}`,
      buyerId: playerId,
      sellerId: listing.sellerId,
      itemType: listing.itemType,
      itemName: listing.itemName,
      quantity: listing.quantity,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: totalCost,
      timestamp: nowSec()
    };
    
    setTradeHistory(prev => [...prev, trade]);
    setMarketReputation(prev => Math.min(1000, prev + 1));
    addNotification(`Purchased ${listing.quantity} ${listing.itemName}!`, "success");
    logAction("market_purchase", trade);
    return true;
  };
  
  // Farm Visit Functions
  const visitFriend = (friendId) => {
    const visit = {
      id: `visit_${Date.now()}`,
      visitedId: friendId,
      timestamp: nowSec(),
      rewards: SOCIAL_FEATURES.FRIENDS.VISIT_REWARDS
    };
    
    // Give rewards for visiting
    setCoins(prev => prev + visit.rewards.coins);
    setSocialReputation(prev => prev + visit.rewards.experience);
    
    setVisitHistory(prev => [...prev.slice(-19), visit]); // Keep last 20 visits
    addNotification(`Farm visit! +${visit.rewards.coins}💰 +${visit.rewards.experience}⭐`, "success");
    logAction("farm_visit", visit);
  };
  
  const rateFarm = (farmOwnerId, rating, comment = "") => {
    const ratingData = {
      raterId: playerId,
      raterName: playerProfile.displayName,
      rating,
      comment,
      timestamp: nowSec()
    };
    
    addNotification(`Farm rated ${rating}⭐!`, "success");
    logAction("farm_rated", ratingData);
  };
  
  // Community Events Functions
  const contributeToEvent = (eventType, amount) => {
    const event = activeEvents.find(e => e.type === eventType);
    if (!event) return false;
    
    const contribution = {
      playerId,
      playerName: playerProfile.displayName,
      amount,
      timestamp: nowSec()
    };
    
    setEventContributions(prev => ({
      ...prev,
      [eventType]: [...(prev[eventType] || []), contribution]
    }));
    
    setSocialReputation(prev => prev + Math.floor(amount / 10));
    addNotification(`Contributed ${amount} to ${event.name}!`, "success");
    logAction("event_contribution", { eventType, amount });
    return true;
  };
  
  // Player Rank System
  const getPlayerRank = (reputation) => {
    const ranks = Object.entries(PLAYER_RANKS).reverse();
    for (const [key, rank] of ranks) {
      if (reputation >= rank.minReputation) {
        return { key, ...rank };
      }
    }
    return { key: 'novice', ...PLAYER_RANKS.novice };
  };
  
  const currentPlayerRank = useMemo(() => getPlayerRank(socialReputation), [socialReputation]);
  
  // Reset daily gifts at midnight
  useEffect(() => {
    const now = nowSec();
    const daysSinceReset = Math.floor((now - lastGiftReset) / 86400);
    if (daysSinceReset >= 1) {
      setDailyGiftsReceived([]);
      setDailyGiftsSent([]);
      setLastGiftReset(now);
    }
  }, [currentTime, lastGiftReset]);

  // Growth accelerator for testing: backdate plantedAt so stages progress naturally
  const simulateGrowth = (seconds = 20) => {
    setPlots(prev => prev.map(p => {
      if (p.state === 'planted' || p.state === 'growing') {
        const planted = p.plantedAt || nowSec();
        return { ...p, plantedAt: planted - seconds };
      }
      return p;
    }));
    addNotification(`Growth accelerated by ${seconds}s`, 'success');
  };

  // Update current time every second for real-time countdown
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(nowSec());
      
      // NEW: Update time of day for visual effects
      if (autoTimeOfDay) {
        const newTimeOfDay = getTimeOfDay();
        if (newTimeOfDay !== currentTimeOfDay) {
          setCurrentTimeOfDay(newTimeOfDay);
        }
      }
      
      // NEW: Generate weather forecast every 30 seconds
      if (currentTime % 30 === 0) {
        setWeatherForecast(generateWeatherForecast());
      }
      
      // NEW: Bee pollination system (simplified to avoid infinite loops)
      if (buildings.beehive && beeHappiness >= 50) {
        // Note: Using setPlots functional update to avoid dependency issues
        setPlots(prevPlots => prevPlots.map((plot, index) => {
          if ((plot.state === "planted" || plot.state === "growing") && 
              !plot.beePollinated && Math.random() < 0.02) { // Reduced rate to 2%
            // Produce honey occasionally
            if (Math.random() < 0.1) {
              setInventory(prev => ({ ...prev, honey: (prev.honey || 0) + 1 }));
              setHoneyProduced(prev => prev + 1);
            }
            return { ...plot, beePollinated: true };
          }
          return plot;
        }));
      }
      
      // NEW: Disease spreading system (simplified)
      setPlots(prevPlots => prevPlots.map((plot, index) => {
        if (plot.disease && Math.random() < 0.01) { // Very low spread rate
          // Spread to adjacent plots with low probability
          const adjacent = [index - 1, index + 1].filter(i => 
            i >= 0 && i < prevPlots.length && !prevPlots[i].disease
          );
          if (adjacent.length > 0 && Math.random() < 0.1) {
            // Mark one adjacent plot for disease (very rare)
            return plot;
          }
        }
        return plot;
      }));
      
      // NEW: Bee happiness decay
      if (buildings.beehive && beeHappiness > 0) {
        setBeeHappiness(prev => Math.max(0, prev - 0.1));
      }
      
    }, 1000);
    return () => clearInterval(id);
  }, [currentTime, currentTimeOfDay, buildings.beehive, beeHappiness, autoTimeOfDay]);

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

  // PRESTIGE & ADVANCED SYSTEMS useEffects
  useEffect(() => {
    // Track lifetime coins for prestige system
    setTotalLifetimeCoins(prev => Math.max(prev, totalEarned));
  }, [totalEarned]);

  useEffect(() => {
    // Generate research points over time
    const interval = setInterval(() => {
      const baseRate = 1;
      const labBonus = getSkillEffect('research_lab');
      const rate = baseRate + labBonus;
      setResearchPoints(prev => prev + rate);
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, [skillLevels]);

  useEffect(() => {
    // Check for completed research
    if (activeResearch && researchStartedAt) {
      const project = RESEARCH_PROJECTS[activeResearch];
      if (project && nowSec() >= researchStartedAt + project.time) {
        completeResearch();
      }
    }
  }, [currentTime, activeResearch, researchStartedAt]);

  useEffect(() => {
    // Worker upkeep payment (daily)
    const daysPassed = Math.floor((nowSec() - lastWorkerPayment) / 86400);
    if (daysPassed >= 1) {
      payWorkerUpkeep();
    }
  }, [currentTime, lastWorkerPayment, workerUpkeep]);

  useEffect(() => {
    // Worker automation
    workers.forEach(worker => {
      const workerType = WORKER_TYPES[worker.type];
      if (!workerType) return;
      
      const timeSinceLastAction = nowSec() - worker.lastAction;
      if (timeSinceLastAction < 30) return; // Workers act every 30 seconds
      
      // Update last action time
      setWorkers(prev => prev.map(w => 
        w.id === worker.id ? { ...w, lastAction: nowSec() } : w
      ));
      
      // Perform worker actions based on type
      switch (worker.type) {
        case 'irrigator':
          // Auto-water crops
          const needsWater = plots.filter((p, i) => 
            (p.state === "planted" || p.state === "growing") && 
            (!p.watered || nowSec() - p.lastWateredAt > 120)
          );
          if (needsWater.length > 0) {
            const randomPlot = needsWater[Math.floor(Math.random() * needsWater.length)];
            const plotIndex = plots.indexOf(randomPlot);
            if (plotIndex !== -1) {
              waterPlot(plotIndex, true); // true = automated
            }
          }
          break;
        case 'harvester':
          // Auto-harvest ready crops
          const readyToHarvest = plots.filter((p, i) => p.state === "grown");
          if (readyToHarvest.length > 0) {
            const randomPlot = readyToHarvest[Math.floor(Math.random() * readyToHarvest.length)];
            const plotIndex = plots.indexOf(randomPlot);
            if (plotIndex !== -1) {
              harvest(plotIndex);
            }
          }
          break;
        case 'pest_controller':
          // Auto-treat pest infestations
          const infestedPlots = plots.filter((p, i) => p.infested);
          if (infestedPlots.length > 0 && (inventory.pesticide || 0) > 0) {
            const randomPlot = infestedPlots[Math.floor(Math.random() * infestedPlots.length)];
            const plotIndex = plots.indexOf(randomPlot);
            if (plotIndex !== -1) {
              usePesticide(plotIndex);
            }
          }
          break;
      }
    });
  }, [currentTime, workers, plots, inventory]);

  useEffect(() => {
    // Processing facility automation
    processingFacilities.forEach(facility => {
      if (facility.processing && facility.processing.completesAt <= nowSec()) {
        completeProcessing(facility.id);
      }
    });
  }, [currentTime, processingFacilities]);

  // Town Development useEffects
  useEffect(() => {
    // Trigger random town events
    const townEventInterval = setInterval(() => {
      if (Math.random() < 0.05 && townReputation > 25) { // 5% chance every 5 minutes, need some reputation
        triggerTownEvent();
      }
    }, 300000);
    return () => clearInterval(townEventInterval);
  }, [townReputation]);

  useEffect(() => {
    // Remove expired town events
    setTownEvents(prev => prev.filter(event => event.endTime > nowSec()));
  }, [currentTime]);

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
    if (!animationsEnabled || performanceMode) return;
    if (weather.type === "Rain") {
      for (let i = 0; i < 12; i++) {
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
      for (let i = 0; i < 8; i++) {
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
      for (let i = 0; i < 14; i++) {
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
      playSfx("combo");
    }
  };

  // Simple time system
  const getGameTimeString = () => {
    return "Game Running"; // Static for now
  };

  // Keyboard shortcuts: [, ] to cycle seeds; M to mute; P to pause; 1/2/3 speed; S to save
  useEffect(() => {
    const seedKeys = Object.keys(rules.seeds);
    function onKey(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.key === '[' || e.key === '{') {
        e.preventDefault();
        const idx = seedKeys.indexOf(selectedSeed);
        const next = (idx - 1 + seedKeys.length) % seedKeys.length;
        setSelectedSeed(seedKeys[next]);
      } else if (e.key === ']' || e.key === '}') {
        e.preventDefault();
        const idx = seedKeys.indexOf(selectedSeed);
        const next = (idx + 1) % seedKeys.length;
        setSelectedSeed(seedKeys[next]);
      } else if (e.key.toLowerCase() === 'm') {
        setSoundEnabled(v => !v);
        addNotification(`Sound ${!soundEnabled ? 'on' : 'muted'}`, 'info');
      } else if (e.key.toLowerCase() === 'p') {
        setPaused(v => !v);
        addNotification(`Simulation ${!paused ? 'paused' : 'resumed'}`, 'info');
      } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        const sp = parseInt(e.key, 10);
        setSimSpeed(sp);
        addNotification(`Speed set to ${sp}x`, 'info');
      } else if (e.key.toLowerCase() === 's') {
        try {
          const snapshot = loadSave() || {};
          saveState({ ...snapshot, savedAt: Date.now() });
          addNotification('Manual save complete', 'success');
        } catch {}
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rules.seeds, selectedSeed, soundEnabled, paused]);

  // Market price calculation with seasonal and trend modifiers
  const getMarketPrice = (seedType) => {
    const base = rules.seeds[seedType].baseValue;
    const trend = marketTrends[seedType] || "normal";
    const trendMultiplier = MARKET_TRENDS[trend].multiplier;
    const seasonBonus = rules.seeds[seedType].season === currentSeason ? 1.3 : 1.0;
    const skillBonus = 1 + (skills.valueBoost || 0);
    return Math.round(base * trendMultiplier * seasonBonus * skillBonus);
  };

  const checkAchievement = (id) => {
    if (achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    
    setAchievements(prev => [...prev, id]);
    setCoins(c => c + achievement.reward);
    addNotification(`🏆 Achievement: ${achievement.name} (+${achievement.reward}🪙)`, "success");
    addLog(`🏆 Unlocked: ${achievement.name} - ${achievement.desc}`);
    playSfx("achievement");
    
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
    const soilMult = Math.max(rules.soil.fertilityMin, Math.min(rules.soil.fertilityMax, p.soilFertility || 1));
    const skillMult = 1 + (skills.growthBoost || 0);
    return base / (fertSpeed * weatherSpeed * boostSpeed * soilMult * skillMult);
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
    const nowMs = Date.now();
    const last = lastPlantClickAt.current[i] || 0;
    if (nowMs - last < 800) return; // stronger debounce
    lastPlantClickAt.current[i] = nowMs;
    if (plantingLocks.current.has(i)) return;
    plantingLocks.current.add(i);
    let didPlant = false;
    replacePlot(i, (p) => {
      if (p.state !== "empty") return p;
      if (!rules.seeds[seed]) { addNotification('Invalid seed selected', 'error'); return p; }
      
      const seedCount = inventory[seed] || 0;
      console.log(`🌱 Attempting to plant ${seed}: current count = ${seedCount}`);
      
      if (seedCount <= 0) {
        addNotification(`No ${seed} seeds available! Current: ${seedCount}`, "warning");
        console.log(`❌ Cannot plant ${seed}: insufficient seeds (${seedCount})`);
        return p;
      }
      
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
      
      // NEW: Calculate quality with skill bonuses
      let qualityChance = 0.2; // Base 20% chance
      qualityChance += getSkillEffect('quality_seeds'); // Skill bonus
      qualityChance += getPrestigeMultiplier('quality'); // Prestige bonus
      
      const quality = Math.random() < qualityChance ? 1.2 : 1;
      playSfx("plant");
      didPlant = true;
      return { 
        ...p, state: "planted", seed, growth: 0, watered: false, 
        plantedAt: nowSec(), lastWateredAt: null, fertilized: 0, 
        infested: false, boosted: false, quality, rotationBonus,
        lastCropFamily: p.lastCropFamily, // Keep for next rotation check
        disease: null, beePollinated: false
      };
    });
    if (didPlant) {
      setInventory(inv => {
        const have = inv[seed] || 0;
        if (have <= 0) return inv;
        const next = { ...inv, [seed]: have - 1 };
        try { console.log(`[inventory] plant ${seed}: ${have} -> ${next[seed]}`); } catch {}
        return next;
      });
    }
    setTimeout(() => {
      plantingLocks.current.delete(i);
    }, 800);
  }

  function water(i) {
    playSfx('water');
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
      playSfx("spray");
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
      // Soil fertility lightly affects value
      const soilMult = Math.max(rules.soil.fertilityMin, Math.min(rules.soil.fertilityMax, p.soilFertility || 1));
      val = Math.round(val * (0.9 + 0.1 * soilMult));
      
      // Building bonuses
      if (buildings.barn) {
        val = Math.round(val * (1 + rules.buildings.barn.bonus)); // +20% harvest value
      }
      
      // NEW: Apply prestige multipliers
      val = Math.round(val * getPrestigeMultiplier('coins'));
      
      // NEW: Apply skill bonuses
      const negotiatorBonus = getSkillEffect('negotiator');
      if (negotiatorBonus > 0) {
        val = Math.round(val * (1 + negotiatorBonus));
      }
      
      setCoins(c => c + val);
      setScore(s => s + val);
      setTotalEarned(t => t + val);
      setTotalHarvests(h => h + 1);
      
      // NEW: Grant research points and skill points
      const baseResearchPoints = Math.max(1, Math.floor(val / 50)); // 1 RP per 50 coins
      const baseSkillPoints = p.quality > 1 ? 0.1 : 0.05; // More for quality crops
      setResearchPoints(prev => prev + baseResearchPoints);
      
      // Chance to gain skill point
      if (Math.random() < baseSkillPoints) {
        setSkillPoints(prev => prev + 1);
        addNotification("+1 Skill Point!", "success");
      }
      
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
      playSfx("harvest");
      addParticle(i % gridSize * 120 + 60, Math.floor(i / gridSize) * 120 + 60, "coins", `+${val}`);
      
      // NEW: Gain social reputation from farming activities
      const reputationGain = Math.max(1, Math.floor(val / 20)); // 1 rep per 20 coins earned
      setSocialReputation(prev => prev + reputationGain);
      setTownReputation(prev => prev + Math.floor(reputationGain / 2)); // Town rep is half of social rep
      
      // Check achievements
      checkAllAchievements();
      
      // Log farming activity for social system
      logAction("harvest", { 
        crop: p.seed, 
        value: val, 
        quality: p.quality,
        reputationGained: reputationGain
      });
      
      const newFert = Math.max(rules.soil.fertilityMin, (p.soilFertility || 1) - (rules.soil.decayOnHarvest || 0.05));
      return { ...newPlot("empty"), lastCropFamily, lastHarvested: nowSec(), soilFertility: newFert };
    });
  }

function buy(item, qty = 1) {
    if (qty < 1) qty = 1;
    if (buyingRef.current) return;
    buyingRef.current = true; setBuying(true);
    const release = () => { buyingRef.current = false; setBuying(false); };
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
        release();
        return;
      }
      price = rules.buildings[item].price;
      if (coins < price) { release(); return; }
      
      setCoins(c => c - price);
      setBuildings(prev => ({ ...prev, [item]: true }));
      addLog(`🏗️ Built ${rules.buildings[item].emoji} ${rules.buildings[item].name}!`);
      addNotification(`${rules.buildings[item].name} constructed!`, "success");
      playSfx('buy');
      release();
      return;
    } else if (item in rules.livestock) {
      price = rules.livestock[item].price;
      if (coins < price) { release(); return; }
      
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
      playSfx('buy');
      release();
      return;
    } else if (item === "fungicide") {
      price = rules.fungicide.shopPrice * qty;
    } else if (item === "beeFeed") {
      price = rules.beeFeed.shopPrice * qty;
    } else if (item === "expand") {
      const next = clamp(gridSize + 1, MIN_SIZE, MAX_SIZE);
      price = EXPANSION_COSTS[next] || 0;
      if (next === gridSize) { release(); return; } // already max
      if (coins < price) { release(); return; }
      
      setCoins(c => c - price);
      const newSize = next;
      const old = [...plots];
      const oldSize = gridSize;
      const total = newSize * newSize;
      const extended = new Array(total);
      // Map old grid by row/col; generate new cells for the new ring and interior
      for (let r = 0; r < newSize; r++) {
        for (let c = 0; c < newSize; c++) {
          const idx = r * newSize + c;
          if (r < oldSize && c < oldSize) {
            // copy from old grid preserving state
            extended[idx] = old[r * oldSize + c];
          } else {
            const isRing = (r === 0 || c === 0 || r === newSize - 1 || c === newSize - 1);
            extended[idx] = newPlot(isRing ? "empty" : "locked");
          }
        }
      }
      
      setGridSize(newSize);
      setPlots(extended);
      addLog(`🏗️ Field expanded to ${newSize}×${newSize} for ${price}🪙`);
      addNotification(`Field expanded to ${newSize}×${newSize}!`, "success");
      
      if (newSize === MAX_SIZE) checkAchievement("field_master");
      playSfx('buy');
      release();
      return;
    }
    
    if (price <= 0 || coins < price) { release(); return; }
    
    setCoins(c => c - price);
    setInventory(inv => {
      const before = inv[item] || 0;
      const next = { ...inv, [item]: before + qty };
      try { console.log(`[inventory] buy ${item}: ${before} -> ${next[item]}`); } catch {}
      return next;
    });
    playSfx('buy');
    
    const emoji = rules.seeds[item]?.emoji || "📦";
    addLog(`🛒 Bought ${qty}x ${emoji} ${item} for ${price}🪙`);
    addNotification(`Bought ${qty}x ${item}`, "info");
    
    // NEW: Gain small reputation for market activity
    if (item in rules.seeds && qty >= 5) {
      setSocialReputation(prev => prev + 1);
      logAction("bulk_purchase", { item, quantity: qty, price });
    }
    
    release();
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
      if (paused) return;
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
            playSfx("weather");
            
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
        // Soil regeneration for empty plots
        const now = nowSec();
        arr = arr.map(pl => {
          if (pl.state === 'empty') {
            const dtMin = Math.max(0, (now - (pl.lastSoilUpdate || now)) / 60);
            const regen = dtMin * (rules.soil.regenPerMinute || 0.02);
            const nf = Math.min(rules.soil.fertilityMax, (pl.soilFertility || 1) + regen);
            return { ...pl, soilFertility: nf, lastSoilUpdate: now };
          }
          return pl;
        });
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

      // Farmhand automation: every workforce.actionIntervalSec do limited actions
      if (farmhands > 0 && nowSec() - lastFarmhandAction >= (rules.workforce.actionIntervalSec || 5)) {
        let actions = farmhands * (rules.workforce.actionsPerHand || 2);
        // harvest grown first
        for (let idx = 0; idx < plots.length && actions > 0; idx++) {
          const pl = plots[idx];
          if (pl.state === 'grown') { harvest(idx); actions--; }
        }
        // then water planted/growing not watered
        for (let idx = 0; idx < plots.length && actions > 0; idx++) {
          const pl = plots[idx];
          if ((pl.state === 'planted' || pl.state === 'growing') && !pl.watered) { water(idx); actions--; }
        }
        setLastFarmhandAction(nowSec());
      }

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
  }, [weather.type, rules, levelId, levelEndsAt, levelStatus, coins, level, levelStartedAt, weatherEvents, achievements, paused, farmhands, lastFarmhandAction, plots]);

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
    const soilMult = Math.max(rules.soil?.fertilityMin || 0.5, Math.min(rules.soil?.fertilityMax || 1.5, p.soilFertility || 1));
    const etaInfo = (() => {
      if (!spec || !p.plantedAt || p.state === 'grown' || p.state === 'withered') return null;
      const sps = secondsPerStage(p);
      if (!sps || !isFinite(sps) || sps <= 0) return null;
      const elapsed = Math.max(0, currentTime - (p.plantedAt || currentTime));
      const stage = Math.floor(elapsed / sps);
      const next = Math.min(spec.stages, stage + 1);
      const nextIn = Math.max(0, Math.ceil(next * sps - elapsed));
      return { next, nextIn };
    })();
    
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

    function leftPointerDown(e) {
      try { e?.preventDefault?.(); e?.stopPropagation?.(); } catch {}
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
        onPointerDown={leftPointerDown}
        onContextMenu={rightClick}
        className={`group relative rounded-2xl border-2 ${borderClass} ${bgClass} backdrop-blur-sm cursor-pointer select-none hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-4`}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Soil fertility ring */}
        <div className={`pointer-events-none absolute inset-0 rounded-2xl border-2 ${soilMult >= 1.2 ? 'border-emerald-400' : (soilMult >= 0.9 ? 'border-amber-300' : 'border-rose-300')} opacity-50`}></div>
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
                  {p.growth}/{spec.stages} • {etaInfo ? `ETA ${formatTime(etaInfo.nextIn)}` : 'ETA --:--'} • Soil {soilMult.toFixed(2)}x
                </Badge>
              )}
              {etaInfo && (
                <Badge variant="outline" className="text-xs">
                  <Timer size={10} className="mr-1"/>ETA {formatTime(etaInfo.nextIn)} → {etaInfo.next}/{spec?.stages}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                <Leaf size={10} className="mr-1"/>Soil {soilMult.toFixed(2)}x
              </Badge>
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
              <div className="text-xs text-center mt-1 opacity-70">{pct}%{etaInfo ? ` • ${formatTime(etaInfo.nextIn)} to next` : ''}</div>
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
      {/* Weather tint overlay */}
      <div className={`pointer-events-none absolute inset-0 transition-colors duration-700 ${
        weather.type === 'Rain' ? 'bg-blue-200/20' :
        weather.type === 'Drought' ? 'bg-orange-200/20' :
        weather.type === 'Storm' ? 'bg-purple-200/10' :
        weather.type === 'Frost' ? 'bg-cyan-100/20' :
        weather.type === 'Pests' ? 'bg-green-100/10' : ''
      }`}></div>
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
      <div className="fixed top-4 right-4 z-50 space-y-2 max-h-[40vh] overflow-hidden flex flex-col-reverse">
        {notifications.slice(-3).map(n => (
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
              <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-xs opacity-60 hover:opacity-100" aria-label="Dismiss">✕</button>
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
                {prestigeLevel > 0 && (
                  <span className="text-xs text-yellow-600 font-normal">
                    {PRESTIGE_LEVELS.find(p => p.level === prestigeLevel)?.emoji}P{prestigeLevel}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/50">
              <div className="flex items-center gap-2 text-lg font-bold text-purple-700">
                <Trophy size={20}/>
                {score}
              </div>
            </div>
            
            {/* NEW: Skills and Research Points */}
            {(skillPoints > 0 || researchPoints > 0) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/50">
                <div className="flex items-center gap-2 text-sm">
                  {skillPoints > 0 && (
                    <span className="text-blue-600 font-bold">📚 {skillPoints}</span>
                  )}
                  {researchPoints > 0 && (
                    <span className="text-green-600 font-bold">🔬 {researchPoints}</span>
                  )}
                </div>
              </div>
            )}
            
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

            {/* Social Quick Access Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Users size={16} className="text-blue-600"/>
                  <span className="font-semibold text-blue-700">{friends.length}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={16} className="text-yellow-600"/>
                  <span className="font-semibold text-yellow-700">{socialReputation}</span>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {currentPlayerRank.name.split(' ')[1] || 'Novice'}
                </Badge>
              </div>
            </div>

            {/* Account Button */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2">
                    <div className="text-sm font-semibold text-slate-800">{currentUser?.displayName}</div>
                    <div className="text-xs text-slate-600">@{currentUser?.username}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLogout}
                    className="h-auto p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                  className="m-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <LogIn size={16} className="mr-1" />
                  Login
                </Button>
              )}
            </div>

            {/* Quick Settings Button moved to shop tabs; header button removed per request */}
          </div>
        </div>

        {animationsEnabled && !performanceMode && <ParticleSystem/>}
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

            {/* Friends & Social Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-blue-600" size={20}/>
                  Social Hub
                  <Badge variant="outline" className="ml-auto">
                    {currentPlayerRank.name.split(' ').slice(-1)[0]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-bold text-blue-600">{friends.length}</div>
                    <div className="text-xs">Friends</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-600">{socialReputation}</div>
                    <div className="text-xs">Social Rep</div>
                  </div>
                </div>
                
                {/* Quick Friends List */}
                <div>
                  <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                    👫 Friends
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowFriendSearch(true)}
                      className="text-xs h-6 px-2"
                    >
                      <Search size={12} className="mr-1"/>
                      Find
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {friends.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-2">
                        No friends yet. Add some to start socializing!
                      </div>
                    ) : (
                      friends.slice(0, 3).map(friend => (
                        <div key={friend.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                          <div>
                            <div className="font-semibold">{friend.name}</div>
                            <div className="text-gray-500">Lv {friend.farmLevel}</div>
                          </div>
                          <div className="space-x-1">
                            <Button 
                              onClick={() => visitFriend(friend.id)}
                              size="sm" 
                              className="text-xs h-6 px-2"
                            >
                              🏠
                            </Button>
                            <Button 
                              onClick={() => sendGiftToFriend(friend.id, 'seeds', 'carrot', 1)}
                              size="sm" 
                              className="text-xs h-6 px-2"
                              disabled={dailyGiftsSent.filter(g => 
                                Math.floor(g.timestamp / 86400) === Math.floor(nowSec() / 86400)
                              ).length >= SOCIAL_FEATURES.FRIENDS.DAILY_GIFT_LIMIT}
                            >
                              🎁
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Friend Requests */}
                {receivedRequests.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2 flex items-center">
                      <Mail size={16} className="mr-1 text-blue-600"/>
                      Friend Requests ({receivedRequests.length})
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {receivedRequests.map(request => {
                        const player = mockPlayerDatabase.find(p => p.id === request.fromUserId) || {};
                        return (
                          <div key={request.id} className="flex justify-between items-center p-2 bg-blue-50 rounded text-xs">
                            <div>
                              <div className="font-semibold">{player.displayName || request.fromDisplayName || 'Unknown'}</div>
                              <div className="text-gray-500">@{player.username || request.fromUsername || 'unknown'}</div>
                            </div>
                            <div className="space-x-1">
                              <Button 
                                onClick={() => acceptFriendRequestFromPlayer(request)}
                                size="sm" 
                                className="text-xs h-6 px-2 bg-green-500 hover:bg-green-600"
                              >
                                <UserCheck size={10} />
                              </Button>
                              <Button 
                                onClick={() => rejectFriendRequestFromPlayer(request)}
                                size="sm" 
                                variant="outline"
                                className="text-xs h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserX size={10} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Account Status */}
                {!isLoggedIn && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2">
                    <div className="text-sm font-semibold text-orange-800 mb-1">🔒 Account Required</div>
                    <div className="text-xs text-orange-700 mb-2">
                      Create an account to save your progress and add friends!
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setShowLoginModal(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs"
                    >
                      <LogIn size={12} className="mr-1" />
                      Get Started
                    </Button>
                  </div>
                )}

                {/* Market Quick Stats */}
                <div>
                  <div className="text-sm font-semibold mb-2">🛒 Market Activity</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-1 bg-green-50 rounded">
                      <div className="font-bold">{myListings.length}</div>
                      <div>My Listings</div>
                    </div>
                    <div className="text-center p-1 bg-purple-50 rounded">
                      <div className="font-bold">{tradeHistory.length}</div>
                      <div>Trades Made</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {(tradeHistory.length > 0 || visitHistory.length > 0) && (
                  <div>
                    <div className="text-sm font-semibold mb-2">📈 Recent Activity</div>
                    <div className="space-y-1 max-h-16 overflow-y-auto text-xs">
                      {[...tradeHistory.slice(-2), ...visitHistory.slice(-2)].map((activity, idx) => (
                        <div key={idx} className="text-gray-600">
                          {activity.buyerId ? `🛒 Bought ${activity.itemName}` : `🏠 Visited friend`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <Tabs value={shopTab} onValueChange={setShopTab}>
                  <TabsList className="flex flex-wrap gap-2 w-full overflow-x-auto">
                    <TabsTrigger className="shrink-0" value="seeds">🌱 Seeds</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="tools">🛠️ Tools</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="buildings">🏗️ Buildings</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="skills">📚 Skills</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="research">🔬 Research</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="workers">👷 Workers</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="processing">🏭 Processing</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="market">📈 Market</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="town">🏛️ Town</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="social">👥 Social</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="community">🌍 Community</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="expand">📏 Expand</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="test">🧪 Test</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="settings">⚙️ Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="seeds" className="space-y-2">
                    {Object.entries(rules.seeds).map(([seed, data]) => (
                      <Button 
                        key={seed} 
                        onClick={() => buy(seed, 1)} 
                        variant="outline" 
                        className="w-full justify-between h-auto p-3"
                        title={(function(){try{var totalTime=(data.secondsPerStage||0)*(data.stages||1);var value=getMarketPrice(seed);var roi=value-(data.shopPrice||0);return 'Time ~ '+totalTime+'s | Value '+value+' | ROI '+roi;}catch(e){return ''}})()}
                        disabled={buying || coins < data.shopPrice}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{data.emoji}</span>
                    <div className="text-left">
                      <div className="font-semibold capitalize">{seed} Seed</div>
                      <div className="text-xs opacity-70">{data.stages} stages • +{data.baseValue}🪙</div>
                      <div className="text-[11px] opacity-70">
                        {(() => { try {
                          const avgSoil = (plots && plots.length) ? (plots.reduce((a,p)=>a+(p.soilFertility||1),0)/plots.length) : 1;
                          const skill = 1 + (skills.growthBoost||0);
                          const weatherSpeed = weather.type === 'Rain' ? 1.2 : (weather.type === 'Drought' ? 0.8 : 1);
                          const greenhouseSpeed = buildings.greenhouse ? (1 + (rules.buildings.greenhouse.bonus||0)) : 1;
                          const sps = (data.secondsPerStage||0) / (weatherSpeed*avgSoil*skill*greenhouseSpeed);
                          const total = Math.max(0, Math.round(sps * (data.stages||1)));
                          return `ETA ~ ${Math.floor(total/60)}m${(total%60).toString().padStart(2,'0')}s`;
                        } catch(e) { return '' } })()}
                      </div>
                    </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{data.shopPrice}🪙</div>
                          <div className="text-xs opacity-70">Own: {inventory[seed] || 0}</div>
                          <div className="text-xs opacity-70">{data.rarity}</div>
                        </div>
                      </Button>
                    ))}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-3">
                    <div className="p-3 bg-white/80 border rounded-xl shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Animations</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">Enabled</label>
                          <input type="checkbox" checked={animationsEnabled} onChange={e => setAnimationsEnabled(e.target.checked)} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Performance Mode</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">Reduce effects</label>
                          <input type="checkbox" checked={performanceMode} onChange={e => setPerformanceMode(e.target.checked)} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Sound</div>
                        <div className="flex items-center gap-3">
                          <button className="px-2 py-1 border rounded text-xs" onClick={() => setSoundEnabled(v => !v)}>{soundEnabled ? 'Mute' : 'Unmute'}</button>
                          <input type="range" min="0" max="1" step="0.1" value={sfxVolume} onChange={e => setSfxVolume(parseFloat(e.target.value))} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Time of Day</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">Auto</label>
                          <input type="checkbox" checked={autoTimeOfDay} onChange={e => setAutoTimeOfDay(e.target.checked)} />
                          {!autoTimeOfDay && (
                            <select className="text-xs border rounded px-2 py-1" value={currentTimeOfDay} onChange={e => setCurrentTimeOfDay(e.target.value)}>
                              {Object.keys(DAY_NIGHT_CYCLE).map(k => (
                                <option key={k} value={k}>{DAY_NIGHT_CYCLE[k].name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Simulation</div>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 border rounded text-xs" onClick={() => setPaused(v => !v)}>{paused ? 'Resume' : 'Pause'}</button>
                          <label className="text-xs text-slate-600">Speed</label>
                          <select className="text-xs border rounded px-2 py-1" value={simSpeed} onChange={e => setSimSpeed(parseInt(e.target.value, 10))}>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                          </select>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500">Shortcuts: [ / ] switch seed, M mute, P pause, 1-3 speed, S save</div>
                    </div>
                    {/* Skills */}
                    <div className="p-3 bg-white/80 border rounded-xl shadow-sm space-y-2">
                      <div className="font-semibold text-slate-700">Skills</div>
                      <div className="text-xs text-slate-600">Spend coins to unlock small permanent boosts.</div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          className="text-xs"
                          disabled={skills.growthBoost >= 0.2 || coins < 80}
                          onClick={() => { if (coins >= 80 && (skills.growthBoost||0) < 0.2) { setCoins(c=>c-80); setSkills(s=>({ ...s, growthBoost: (s.growthBoost||0)+0.1 })); addNotification('Growth boost +10%', 'success'); }} }
                        >
                          🌿 Growth +10% (80🪙)
                        </Button>
                        <Button
                          variant="outline"
                          className="text-xs"
                          disabled={skills.valueBoost >= 0.2 || coins < 100}
                          onClick={() => { if (coins >= 100 && (skills.valueBoost||0) < 0.2) { setCoins(c=>c-100); setSkills(s=>({ ...s, valueBoost: (s.valueBoost||0)+0.1 })); addNotification('Sale value +10%', 'success'); }} }
                        >
                          💰 Value +10% (100🪙)
                        </Button>
                      </div>
                      <div className="text-xs text-slate-600">Current: Growth +{Math.round((skills.growthBoost||0)*100)}%, Value +{Math.round((skills.valueBoost||0)*100)}%</div>
                    </div>
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

                    {/* Compost Empty Plots */}
                    <Button 
                      onClick={() => {
                        const price = rules.soil.compostPrice || 20;
                        if (coins < price) return;
                        setCoins(c => c - price);
                        setPlots(prev => prev.map(pl => {
                          if (pl.state === 'empty') {
                            const nf = Math.min(rules.soil.fertilityMax, (pl.soilFertility||1) + (rules.soil.compostBoost||0.2));
                            return { ...pl, soilFertility: nf, lastSoilUpdate: nowSec() };
                          }
                          return pl;
                        }));
                        addNotification('Composted empty plots (+fertility)', 'success');
                        playSfx('buy');
                      }} 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < (rules.soil.compostPrice || 20)}
                    >
                      <div className="text-left">
                        <div className="font-semibold">Compost Empty Plots</div>
                        <div className="text-xs opacity-70">Boost soil fertility for empty plots</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{rules.soil.compostPrice || 20}dY�T</div>
                      </div>
                    </Button>

                    {/* Hire Farmhand */}
                    <Button 
                      onClick={() => {
                        const price = rules.workforce.farmhandPrice || 100;
                        if (coins < price) return;
                        setCoins(c => c - price);
                        setFarmhands(n => n + 1);
                        addNotification('Hired a farmhand!', 'success');
                        playSfx('buy');
                      }} 
                      variant="outline" 
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < (rules.workforce.farmhandPrice || 100)}
                    >
                      <div className="text-left">
                        <div className="font-semibold">Hire Farmhand</div>
                        <div className="text-xs opacity-70">Automates watering and harvesting</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{rules.workforce.farmhandPrice || 100}dY�T</div>
                        <div className="text-xs opacity-70">Hired: {farmhands}</div>
                      </div>
                    </Button>
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
                  
                  {/* SKILLS TAB */}
                  <TabsContent value="skills" className="space-y-2">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">📚 Skill Trees</h3>
                        <Badge>{skillPoints} Skill Points</Badge>
                      </div>
                      {prestigeLevel > 0 && (
                        <div className="p-2 bg-yellow-50 rounded border text-xs">
                          {PRESTIGE_LEVELS.find(p => p.level === prestigeLevel)?.emoji} Prestige Level {prestigeLevel}: {(getPrestigeMultiplier('coins') * 100).toFixed(0)}% bonus
                        </div>
                      )}
                    </div>
                    
                    <Tabs defaultValue="farming">
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="farming">🌾</TabsTrigger>
                        <TabsTrigger value="business">💼</TabsTrigger>
                        <TabsTrigger value="technology">🔬</TabsTrigger>
                        <TabsTrigger value="social">👥</TabsTrigger>
                      </TabsList>
                      
                      {Object.entries(SKILL_TREES).map(([treeId, tree]) => (
                        <TabsContent key={treeId} value={treeId} className="space-y-2">
                          <div className="text-sm font-medium text-center mb-2">
                            {tree.icon} {tree.name}
                          </div>
                          {Object.entries(tree.skills).map(([skillId, skill]) => {
                            const currentLevel = skillLevels[skillId] || 0;
                            const canUpgrade = canUpgradeSkill(treeId, skillId);
                            const isMaxed = currentLevel >= skill.maxLevel;
                            const cost = isMaxed ? 0 : skill.cost[currentLevel];
                            
                            return (
                              <Button
                                key={skillId}
                                onClick={() => upgradeSkill(treeId, skillId)}
                                variant="outline"
                                className="w-full justify-between h-auto p-3"
                                disabled={!canUpgrade || isMaxed}
                              >
                                <div className="text-left">
                                  <div className="font-semibold">{skill.name}</div>
                                  <div className="text-xs opacity-70">{skill.description}</div>
                                  <div className="text-xs mt-1">
                                    Level {currentLevel}/{skill.maxLevel}
                                    {currentLevel > 0 && (
                                      <span className="text-green-600 ml-2">
                                        +{(skill.value * currentLevel * 100).toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {isMaxed ? (
                                    <Badge variant="default">MAX</Badge>
                                  ) : (
                                    <div className="font-bold">{cost} SP</div>
                                  )}
                                </div>
                              </Button>
                            );
                          })}
                        </TabsContent>
                      ))}
                    </Tabs>
                    
                    {/* Prestige Section */}
                    {totalLifetimeCoins > 500 && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded border">
                        <div className="text-sm font-semibold mb-2">🌟 Prestige System</div>
                        <div className="text-xs space-y-1">
                          <div>Lifetime Coins: {totalLifetimeCoins.toLocaleString()}🪙</div>
                          <div>Current Level: {PRESTIGE_LEVELS.find(p => p.level === prestigeLevel)?.name || "Beginner"}</div>
                          {checkPrestigeEligibility() && (
                            <Button 
                              onClick={performPrestige}
                              size="sm" 
                              className="w-full mt-2"
                              variant="secondary"
                            >
                              🌟 Prestige Now! (+{PRESTIGE_BONUSES.skill_points} SP)
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* RESEARCH TAB */}
                  <TabsContent value="research" className="space-y-2">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">🔬 Research Lab</h3>
                        <Badge>{researchPoints} Research Points</Badge>
                      </div>
                      {activeResearch && (
                        <div className="p-2 bg-blue-50 rounded border text-xs">
                          🔬 Researching: {RESEARCH_PROJECTS[activeResearch]?.name}
                          <Progress 
                            value={Math.min(100, ((nowSec() - researchStartedAt) / RESEARCH_PROJECTS[activeResearch]?.time) * 100)} 
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                    
                    {Object.entries(RESEARCH_PROJECTS).map(([projectId, project]) => {
                      const isCompleted = completedResearch.includes(projectId);
                      const canStart = canStartResearch(projectId);
                      const isActive = activeResearch === projectId;
                      
                      return (
                        <Button
                          key={projectId}
                          onClick={() => startResearch(projectId)}
                          variant="outline"
                          className="w-full justify-between h-auto p-3"
                          disabled={!canStart || isCompleted || isActive}
                        >
                          <div className="text-left">
                            <div className="font-semibold flex items-center gap-2">
                              {project.emoji} {project.name}
                              {isCompleted && <Badge variant="default">✅</Badge>}
                              {isActive && <Badge variant="secondary">🔬</Badge>}
                            </div>
                            <div className="text-xs opacity-70">{project.description}</div>
                            <div className="text-xs mt-1">
                              Time: {Math.floor(project.time / 60)}min | Unlocks: {project.unlocks.join(", ")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{project.cost} RP</div>
                          </div>
                        </Button>
                      );
                    })}
                  </TabsContent>
                  
                  {/* WORKERS TAB */}
                  <TabsContent value="workers" className="space-y-2">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">👷 Workers</h3>
                        <Badge>Daily Upkeep: {workerUpkeep}🪙</Badge>
                      </div>
                      {workers.length > 0 && (
                        <div className="p-2 bg-green-50 rounded border text-xs">
                          Active Workers: {workers.map(w => WORKER_TYPES[w.type]?.emoji).join("")}
                        </div>
                      )}
                    </div>
                    
                    {Object.entries(WORKER_TYPES).map(([workerType, worker]) => {
                      const isHired = workers.some(w => w.type === workerType);
                      const canHire = canHireWorker(workerType);
                      
                      return (
                        <Button
                          key={workerType}
                          onClick={() => hireWorker(workerType)}
                          variant="outline"
                          className="w-full justify-between h-auto p-3"
                          disabled={!canHire || isHired}
                        >
                          <div className="text-left">
                            <div className="font-semibold flex items-center gap-2">
                              {worker.emoji} {worker.name}
                              {isHired && <Badge variant="default">✅ Hired</Badge>}
                            </div>
                            <div className="text-xs opacity-70">{worker.description}</div>
                            <div className="text-xs mt-1">
                              Efficiency: {(worker.efficiency * 100).toFixed(0)}% | Upkeep: {worker.upkeep}🪙/day
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{worker.cost}🪙</div>
                          </div>
                        </Button>
                      );
                    })}
                  </TabsContent>
                  
                  {/* PROCESSING TAB */}
                  <TabsContent value="processing" className="space-y-2">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">🏭 Processing Facilities</h3>
                        <Badge>{processingFacilities.length} Built</Badge>
                      </div>
                      
                      {/* Processed Goods Inventory */}
                      {Object.keys(processedInventory).length > 0 && (
                        <div className="p-2 bg-purple-50 rounded border">
                          <div className="text-xs font-medium mb-1">Processed Goods:</div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            {Object.entries(processedInventory).map(([item, qty]) => (
                              <div key={item}>{item}: {qty}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Active Processing */}
                      {processingFacilities.some(f => f.processing) && (
                        <div className="p-2 bg-blue-50 rounded border">
                          <div className="text-xs font-medium mb-1">🔄 Processing:</div>
                          {processingFacilities.filter(f => f.processing).map(facility => (
                            <div key={facility.id} className="text-xs">
                              {PROCESSING_FACILITIES[facility.type]?.emoji} {facility.processing.quantity}x {facility.processing.outputType}
                              <Progress 
                                value={Math.min(100, ((nowSec() - facility.processing.startedAt) / (facility.processing.completesAt - facility.processing.startedAt)) * 100)} 
                                className="mt-1 h-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Build Facilities */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Build Facilities:</div>
                      {Object.entries(PROCESSING_FACILITIES).map(([facilityType, facility]) => {
                        const isBuilt = processingFacilities.some(f => f.type === facilityType);
                        const canBuild = canBuildFacility(facilityType);
                        
                        return (
                          <Button
                            key={facilityType}
                            onClick={() => buildFacility(facilityType)}
                            variant="outline"
                            className="w-full justify-between h-auto p-3"
                            disabled={!canBuild || isBuilt}
                          >
                            <div className="text-left">
                              <div className="font-semibold flex items-center gap-2">
                                {facility.emoji} {facility.name}
                                {isBuilt && <Badge variant="default">✅ Built</Badge>}
                              </div>
                              <div className="text-xs opacity-70">{facility.description}</div>
                              <div className="text-xs mt-1">
                                {facility.ratio}x {facility.input} → 1x {facility.output} | {facility.value_multiplier}x value
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{facility.cost}🪙</div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Process Items */}
                    {processingFacilities.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <div className="text-sm font-medium">Start Processing:</div>
                        {processingFacilities.map(facility => {
                          const facilityConfig = PROCESSING_FACILITIES[facility.type];
                          const isProcessing = facility.processing !== null;
                          
                          return (
                            <div key={facility.id} className="p-2 border rounded">
                              <div className="text-xs font-medium mb-2">
                                {facilityConfig.emoji} {facilityConfig.name}
                                {isProcessing && <span className="ml-2 text-blue-600">🔄 Processing</span>}
                              </div>
                              {!isProcessing && (
                                <div className="grid grid-cols-2 gap-2">
                                  {facilityConfig.input === "any" ? (
                                    // Show all available crops
                                    Object.entries(inventory).filter(([item, qty]) => 
                                      item in rules.seeds && qty >= facilityConfig.ratio
                                    ).map(([item, qty]) => (
                                      <Button
                                        key={item}
                                        onClick={() => startProcessing(facility.id, item, 1)}
                                        size="sm"
                                        className="text-xs"
                                      >
                                        Process {item} ({qty})
                                      </Button>
                                    ))
                                  ) : (
                                    // Show specific input type
                                    <Button
                                      onClick={() => startProcessing(facility.id, facilityConfig.input, 1)}
                                      size="sm"
                                      className="text-xs"
                                      disabled={(inventory[facilityConfig.input] || 0) < facilityConfig.ratio}
                                    >
                                      Process {facilityConfig.input} ({inventory[facilityConfig.input] || 0})
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                  
                  <TabsContent value="town" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🏛️ Town Development</div>
                    
                    {/* Town & Social Status */}
                    <div className="bg-purple-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🏆 Your Standing</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Town Rep:</span>
                          <span className="font-semibold">{townReputation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Social Rep:</span>
                          <span className="font-semibold">{socialReputation}⭐</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Player Rank:</span>
                          <Badge variant="outline" className="text-xs">{currentPlayerRank.name.split(' ').slice(-1)[0]}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Friends:</span>
                          <span className="font-semibold">{friends.length}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        💡 Gain reputation by harvesting, trading, and helping friends!
                      </div>
                    </div>

                    {/* Town Buildings */}
                    <div className="bg-blue-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🏗️ Town Buildings</h4>
                      <div className="space-y-2">
                        {Object.entries(TOWN_BUILDINGS).slice(0, 6).map(([buildingId, building]) => (
                          <Button
                            key={buildingId}
                            onClick={() => buildTownBuilding(buildingId)}
                            className="w-full justify-between h-auto p-3"
                            variant={townBuildings[buildingId]?.built ? "secondary" : "outline"}
                            disabled={
                              townBuildings[buildingId]?.built ||
                              coins < building.cost ||
                              (building.reputationRequired && townReputation < building.reputationRequired)
                            }
                          >
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span>{building.emoji}</span>
                                <span className="font-bold">{building.name}</span>
                                {townBuildings[buildingId]?.built && <span className="text-green-600">✓</span>}
                              </div>
                              <div className="text-xs opacity-75">{building.description}</div>
                              {building.reputationRequired && townReputation < building.reputationRequired && (
                                <div className="text-xs text-orange-600">
                                  Need {building.reputationRequired - townReputation} more town reputation
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{building.cost}💰</div>
                              {building.reputationRequired && (
                                <div className="text-xs opacity-70">Rep: {building.reputationRequired}</div>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Social Integration */}
                    <div className="bg-green-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🤝 Community Involvement</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Market Reputation:</span>
                          <span className="font-semibold">{marketReputation}/1000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed Trades:</span>
                          <span className="font-semibold">{tradeHistory.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Farm Visits:</span>
                          <span className="font-semibold">{visitHistory.length}</span>
                        </div>
                        <div className="mt-2 space-x-1">
                          <Button 
                            onClick={() => {
                              setSocialReputation(prev => prev + 5);
                              setTownReputation(prev => prev + 2);
                              addNotification("Volunteered in town! +5⭐ +2🏛️", "success");
                            }}
                            size="sm" 
                            className="text-xs"
                          >
                            �️ Volunteer (+5⭐)
                          </Button>
                          <Button 
                            onClick={() => {
                              if (coins >= 100) {
                                setCoins(prev => prev - 100);
                                setTownReputation(prev => prev + 10);
                                addNotification("Donated to town! +10🏛️", "success");
                              } else {
                                addNotification("Need 100💰 to donate!", "error");
                              }
                            }}
                            size="sm" 
                            className="text-xs"
                            disabled={coins < 100}
                          >
                            💰 Donate (100💰 → +10🏛️)
                          </Button>
                        </div>
                      </div>
                    </div>
                      
                    {/* Active Town Events */}
                    <div className="bg-yellow-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🎪 Town Events</h4>
                      {townEvents.length > 0 ? (
                        <div className="space-y-2">
                          {townEvents.map((event, idx) => (
                            <div key={idx} className="p-2 border rounded bg-white">
                              <div className="text-xs font-semibold">{event.emoji} {event.name}</div>
                              <div className="text-xs text-gray-600">{event.description}</div>
                              <div className="text-xs">Ends in: {Math.max(0, event.endTime - nowSec())}s</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 text-center py-2">
                          No active town events. Check back later!
                        </div>
                      )}
                      <div className="mt-2">
                        <Button 
                          onClick={triggerTownEvent} 
                          size="sm" 
                          variant="outline"
                          className="w-full text-xs"
                        >
                          🎲 Trigger Random Event
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">👥 Social Hub</div>
                    
                    {/* Player Profile & Stats */}
                    <div className="bg-purple-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">👤 Your Profile</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>{playerProfile.avatar} {playerProfile.displayName}</span>
                          <Badge variant="outline">{currentPlayerRank.name}</Badge>
                        </div>
                        <div className="text-xs text-gray-600">{playerProfile.bio}</div>
                        <div className="flex justify-between">
                          <span>Social Rep:</span>
                          <span className="font-semibold">{socialReputation}⭐</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Friends:</span>
                          <span className="font-semibold">{friends.length}/{SOCIAL_FEATURES.FRIENDS.MAX_FRIENDS}</span>
                        </div>
                      </div>
                    </div>

                    {/* Friends List */}
                    <div className="bg-blue-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">👫 Friends ({friends.length})</h4>
                      <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                        {friends.length === 0 ? (
                          <div className="text-gray-500 text-center py-2">
                            No friends yet. Add some to share gifts and visit farms!
                          </div>
                        ) : (
                          friends.slice(0, 5).map(friend => (
                            <div key={friend.id} className="flex justify-between items-center p-2 bg-white rounded border">
                              <div>
                                <div className="font-semibold">{friend.name}</div>
                                <div className="text-xs text-gray-500">Level {friend.farmLevel}</div>
                              </div>
                              <div className="space-x-1">
                                <Button 
                                  onClick={() => visitFriend(friend.id)}
                                  size="sm" 
                                  className="text-xs"
                                >
                                  🏠 Visit
                                </Button>
                                <Button 
                                  onClick={() => sendGiftToFriend(friend.id, 'seeds', 'carrot', 2)}
                                  size="sm" 
                                  className="text-xs"
                                  disabled={dailyGiftsSent.filter(g => 
                                    Math.floor(g.timestamp / 86400) === Math.floor(nowSec() / 86400)
                                  ).length >= SOCIAL_FEATURES.FRIENDS.DAILY_GIFT_LIMIT}
                                >
                                  🎁 Gift
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 flex space-x-1">
                        <Button 
                          onClick={() => sendFriendRequest("demo_player_123")}
                          size="sm" 
                          className="text-xs"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Add Friend
                        </Button>
                      </div>
                    </div>

                    {/* Farmers Market */}
                    <div className="bg-green-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🛒 Farmers Market</h4>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between">
                          <span>Market Rep:</span>
                          <span className="font-semibold">{marketReputation}/1000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>My Listings:</span>
                          <span className="font-semibold">{myListings.length}/{SOCIAL_FEATURES.MARKET.MAX_LISTINGS}</span>
                        </div>
                        <div className="space-x-1">
                          <Button 
                            onClick={() => createMarketListing('seeds', 'carrot', 5, 15)}
                            size="sm" 
                            className="text-xs"
                            disabled={(inventory.carrot || 0) < 5 || myListings.length >= SOCIAL_FEATURES.MARKET.MAX_LISTINGS}
                          >
                            📦 Sell Carrots (5 for 15💰)
                          </Button>
                          <Button 
                            onClick={() => createMarketListing('seeds', 'corn', 3, 25)}
                            size="sm" 
                            className="text-xs"
                            disabled={(inventory.corn || 0) < 3 || myListings.length >= SOCIAL_FEATURES.MARKET.MAX_LISTINGS}
                          >
                            📦 Sell Corn (3 for 25💰)
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600">
                          Listing fee: {SOCIAL_FEATURES.MARKET.LISTING_FEE}💰 • Commission: {SOCIAL_FEATURES.MARKET.COMMISSION_RATE * 100}%
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-yellow-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">📊 Recent Activity</h4>
                      <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                        {tradeHistory.slice(-3).reverse().map(trade => (
                          <div key={trade.id} className="text-xs">
                            🛒 Bought {trade.quantity} {trade.itemName} for {trade.totalPrice}💰
                          </div>
                        ))}
                        {visitHistory.slice(-2).reverse().map(visit => (
                          <div key={visit.id} className="text-xs">
                            🏠 Visited friend's farm (+{visit.rewards.coins}💰)
                          </div>
                        ))}
                        {dailyGiftsReceived.slice(-2).reverse().map(gift => (
                          <div key={gift.id} className="text-xs">
                            🎁 Received {gift.amount} {gift.item} from friend
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="community" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🌍 Community Hub</div>
                    
                    {/* Global Stats */}
                    <div className="bg-blue-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🌐 Global Statistics</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-blue-600">{globalStats.totalPlayers.toLocaleString()}</div>
                          <div className="text-xs">Total Players</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-green-600">{globalStats.activePlayers.toLocaleString()}</div>
                          <div className="text-xs">Online Now</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-orange-600">{globalStats.cropsHarvested.toLocaleString()}</div>
                          <div className="text-xs">Crops Harvested</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="font-bold text-purple-600">{globalStats.tradesCompleted.toLocaleString()}</div>
                          <div className="text-xs">Trades Made</div>
                        </div>
                      </div>
                    </div>

                    {/* Active Community Events */}
                    <div className="bg-green-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🎉 Community Events</h4>
                      <div className="space-y-2 text-xs">
                        {Object.entries(COMMUNITY_EVENTS).slice(0, 2).map(([eventId, event]) => (
                          <div key={eventId} className="p-2 border rounded bg-white">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-semibold">{event.emoji} {event.name}</div>
                              <Badge variant="outline" className="text-xs">7d left</Badge>
                            </div>
                            <div className="text-xs text-gray-600 mb-2">{event.description}</div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs">
                                Progress: {Math.floor(event.target * 0.65)}/{event.target}
                              </div>
                              <Button 
                                onClick={() => contributeToEvent(eventId, 10)}
                                size="sm" 
                                className="text-xs"
                              >
                                Contribute
                              </Button>
                            </div>
                            <Progress value={(event.target * 0.65 / event.target) * 100} className="mt-1 h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Leaderboards */}
                    <div className="bg-yellow-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🏆 Leaderboards</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-white rounded border">
                          <div className="font-semibold mb-1">Top Farmers (Reputation)</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>🥇 CropMaster2024</span>
                              <span>2,847⭐</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🥈 FarmQueen</span>
                              <span>2,234⭐</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🥉 HarvestKing</span>
                              <span>1,892⭐</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                              <span>#{Math.floor(Math.random() * 200) + 50} {playerProfile.displayName}</span>
                              <span>{socialReputation}⭐</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Your Contributions */}
                    <div className="bg-purple-50 p-3 rounded border">
                      <h4 className="text-sm font-semibold mb-2">🎯 Your Contributions</h4>
                      <div className="text-xs space-y-1">
                        {Object.entries(eventContributions).length === 0 ? (
                          <div className="text-gray-500 text-center py-2">
                            No contributions yet. Join community events above!
                          </div>
                        ) : (
                          Object.entries(eventContributions).map(([eventType, contributions]) => (
                            <div key={eventType} className="flex justify-between">
                              <span>{COMMUNITY_EVENTS[eventType]?.name || eventType}:</span>
                              <span className="font-semibold">
                                {contributions.reduce((sum, c) => sum + c.amount, 0)} contributed
                              </span>
                            </div>
                          ))
                        )}
                      </div>
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

        {/* Mobile Floating Settings FAB */}
        <div className="fixed bottom-5 right-5 z-50 lg:hidden">
          <Button
            size="lg"
            className="rounded-full shadow-xl bg-white text-slate-800 hover:bg-slate-50 border-2 border-white/70 backdrop-blur"
            variant="outline"
            onClick={() => setShopTab('settings')}
            aria-label="Open Settings"
            title="Open Settings"
          >
            <SettingsIcon size={18} className="mr-2"/>
            Settings
          </Button>
        </div>

        {/* Login/Register Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-96 max-w-[90vw] bg-white/95 backdrop-blur border-2 border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🌾 {loginForm.mode === 'login' ? 'Welcome Back' : 'Create Account'}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowLoginModal(false)}
                    className="h-auto p-1"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loginError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                    {loginError}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter password"
                    />
                  </div>
                  
                  {loginForm.mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={loginForm.displayName}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter display name"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleLogin}
                    className="flex-1"
                    disabled={!loginForm.username || !loginForm.password || (loginForm.mode === 'register' && !loginForm.displayName)}
                  >
                    {loginForm.mode === 'login' ? '🚪 Login' : '✨ Create Account'}
                  </Button>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setLoginForm(prev => ({ 
                      ...prev, 
                      mode: prev.mode === 'login' ? 'register' : 'login',
                      username: '',
                      password: '',
                      displayName: ''
                    }))}
                    className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                  >
                    {loginForm.mode === 'login' ? 
                      "Don't have an account? Create one" : 
                      "Already have an account? Login"
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Friend Search Modal */}
        {showFriendSearch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-96 max-w-[90vw] bg-white/95 backdrop-blur border-2 border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>🔍 Find Friends</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowFriendSearch(false)}
                    className="h-auto p-1"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Search Players
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter username or display name"
                    />
                    <Button onClick={searchPlayers} size="sm">
                      <Search size={16} />
                    </Button>
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">Search Results:</div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {searchResults.map(player => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                          <div>
                            <div className="font-medium">{player.displayName}</div>
                            <div className="text-xs text-slate-500">@{player.username}</div>
                            <div className="text-xs text-slate-500">Level {player.level} • Rep: {player.reputation}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => sendFriendRequestToPlayer(player)}
                            disabled={
                              friends.some(f => f.id === player.id) ||
                              sentRequests.some(r => r.toUserId === player.id) ||
                              receivedRequests.some(r => r.fromUserId === player.id)
                            }
                          >
                            {friends.some(f => f.id === player.id) ? (
                              <>
                                <UserCheck size={12} className="mr-1" />
                                Friends
                              </>
                            ) : sentRequests.some(r => r.toUserId === player.id) ? (
                              <>
                                <Mail size={12} className="mr-1" />
                                Sent
                              </>
                            ) : receivedRequests.some(r => r.fromUserId === player.id) ? (
                              'Accept?'
                            ) : (
                              <>
                                <UserPlus size={12} className="mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center text-slate-500 py-4">
                    No players found matching "{searchQuery}"
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

