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
  { id: "lvl4", label: "Farm Expert", targetCoins: 500, minutes: 12, reward: 100, difficulty: "Expert" },
  { id: "lvl5", label: "Agricultural Master", targetCoins: 750, minutes: 15, reward: 150, difficulty: "Master" },
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

// 🎉 SEASONAL EVENTS & FESTIVALS
const SEASONAL_EVENTS = {
  spring: [
    { 
      id: "spring_festival", 
      name: "Spring Planting Festival", 
      emoji: "🌸", 
      description: "Celebrate new growth! Double XP for planting and 25% faster growth.", 
      duration: 300, // 5 minutes
      effects: { growth_speed: 1.25, planting_xp: 2.0 },
      rewards: { coins: 100, items: { "spring_seeds": 3 } },
      rarity: "common"
    },
    { 
      id: "flower_bloom", 
      name: "Flower Bloom Event", 
      emoji: "🌺", 
      description: "Flowers are in bloom! Decorative crops give bonus coins.", 
      duration: 240,
      effects: { flower_bonus: 1.5 },
      rewards: { coins: 75, items: { "decorative_seeds": 2 } },
      rarity: "uncommon"
    }
  ],
  summer: [
    { 
      id: "harvest_moon", 
      name: "Harvest Moon Festival", 
      emoji: "🌕", 
      description: "Under the harvest moon, all crops give 50% more coins!", 
      duration: 180,
      effects: { harvest_bonus: 1.5 },
      rewards: { coins: 200, items: { "moon_fertilizer": 1 } },
      rarity: "rare"
    },
    { 
      id: "summer_solstice", 
      name: "Summer Solstice", 
      emoji: "☀️", 
      description: "Longest day of the year! No watering needed and faster growth.", 
      duration: 360,
      effects: { no_watering: true, growth_speed: 1.3 },
      rewards: { coins: 150, items: { "solar_seeds": 2 } },
      rarity: "uncommon"
    }
  ],
  autumn: [
    { 
      id: "pumpkin_fest", 
      name: "Pumpkin Festival", 
      emoji: "🎃", 
      description: "Pumpkins and gourds sell for triple value!", 
      duration: 420,
      effects: { pumpkin_bonus: 3.0 },
      rewards: { coins: 300, items: { "giant_pumpkin_seeds": 1 } },
      rarity: "epic"
    },
    { 
      id: "thanksgiving", 
      name: "Thanksgiving Feast", 
      emoji: "🦃", 
      description: "Share the harvest! Bonus coins for every crop type in inventory.", 
      duration: 240,
      effects: { diversity_bonus: 50 },
      rewards: { coins: 250, items: { "feast_crops": 5 } },
      rarity: "rare"
    }
  ],
  winter: [
    { 
      id: "winter_wonder", 
      name: "Winter Wonderland", 
      emoji: "❄️", 
      description: "Greenhouse crops immune to frost and grow 2x faster!", 
      duration: 300,
      effects: { greenhouse_boost: 2.0, frost_immunity: true },
      rewards: { coins: 175, items: { "winter_seeds": 3 } },
      rarity: "uncommon"
    }
  ]
};

// 🎯 DAILY CHALLENGES SYSTEM
const DAILY_CHALLENGE_TYPES = [
  {
    id: "harvest_master",
    name: "Harvest Master",
    description: "Harvest {target} crops",
    emoji: "🌾",
    generateTarget: () => Math.floor(Math.random() * 15) + 10, // 10-25 crops
    checkProgress: (progress, target) => progress.harvests >= target,
    reward: { coins: 50, xp: 25, items: { "fertilizer": 2 } }
  },
  {
    id: "coin_collector",
    name: "Coin Collector", 
    description: "Earn {target} coins",
    emoji: "💰",
    generateTarget: () => Math.floor(Math.random() * 200) + 100, // 100-300 coins
    checkProgress: (progress, target) => progress.coinsEarned >= target,
    reward: { coins: 75, xp: 30, items: { "pesticide": 1 } }
  },
  {
    id: "speed_farmer",
    name: "Speed Farmer",
    description: "Plant {target} seeds in under 5 minutes",
    emoji: "⚡",
    generateTarget: () => Math.floor(Math.random() * 8) + 7, // 7-15 seeds
    checkProgress: (progress, target) => progress.planted >= target && progress.timeSpent <= 300,
    reward: { coins: 100, xp: 40, items: { "speed_fertilizer": 2 } }
  },
  {
    id: "pest_hunter",
    name: "Pest Hunter",
    description: "Eliminate {target} pests",
    emoji: "🐛",
    generateTarget: () => Math.floor(Math.random() * 5) + 3, // 3-8 pests
    checkProgress: (progress, target) => progress.pestsKilled >= target,
    reward: { coins: 60, xp: 35, items: { "super_pesticide": 1 } }
  },
  {
    id: "weather_warrior",
    name: "Weather Warrior",
    description: "Survive {target} weather events without crop loss",
    emoji: "🌪️",
    generateTarget: () => Math.floor(Math.random() * 3) + 2, // 2-5 events
    checkProgress: (progress, target) => progress.weatherSurvived >= target,
    reward: { coins: 125, xp: 50, items: { "weather_shield": 1 } }
  }
];

// 🧬 CROP BREEDING SYSTEM
const BREEDING_RECIPES = {
  // Basic hybrids
  super_carrot: {
    name: "Super Carrot",
    emoji: "🥕✨",
    parents: ["carrot", "carrot"],
    growthTime: 45,
    baseValue: 25,
    shopPrice: 40,
    quality: 1.5,
    description: "Enhanced carrot with faster growth and higher value",
    traits: ["fast_growth", "high_value"],
    unlockLevel: 2
  },
  rainbow_corn: {
    name: "Rainbow Corn", 
    emoji: "🌽🌈",
    parents: ["corn", "sunflower"],
    growthTime: 70,
    baseValue: 45,
    shopPrice: 65,
    quality: 2.0,
    description: "Colorful hybrid corn with premium market appeal",
    traits: ["premium_quality", "weather_resistant"],
    unlockLevel: 3
  },
  golden_tomato: {
    name: "Golden Tomato",
    emoji: "🍅✨", 
    parents: ["tomato", "sunflower"],
    growthTime: 55,
    baseValue: 35,
    shopPrice: 50,
    quality: 1.8,
    description: "Luxurious golden tomato with enhanced flavor",
    traits: ["luxury_appeal", "disease_resistant"],
    unlockLevel: 3
  },
  frost_potato: {
    name: "Frost Potato",
    emoji: "🥔❄️",
    parents: ["potato", "winter_seeds"],
    growthTime: 40,
    baseValue: 20,
    shopPrice: 35,
    quality: 1.3,
    description: "Cold-resistant potato that thrives in winter",
    traits: ["frost_resistant", "winter_bonus"],
    unlockLevel: 4
  },
  // Advanced hybrids
  dragon_pepper: {
    name: "Dragon Pepper",
    emoji: "🌶️🔥",
    parents: ["bellPepper", "super_carrot"],
    growthTime: 90,
    baseValue: 80,
    shopPrice: 120,
    quality: 3.0,
    description: "Legendary spicy pepper with incredible value",
    traits: ["legendary", "pest_repellent", "high_value"],
    unlockLevel: 5
  }
};

// 🌤️ WEATHER PREDICTION MINI-GAME
const WEATHER_PATTERNS = [
  { 
    pattern: ["sunny", "sunny", "cloudy"], 
    nextWeather: "rainy", 
    confidence: 0.8,
    hint: "Three day pattern suggests incoming rain"
  },
  { 
    pattern: ["rainy", "cloudy"], 
    nextWeather: "sunny", 
    confidence: 0.7,
    hint: "Rain clearing leads to sunshine"
  },
  { 
    pattern: ["windy", "windy"], 
    nextWeather: "stormy", 
    confidence: 0.9,
    hint: "Strong winds often bring storms"
  },
  { 
    pattern: ["sunny", "hot"], 
    nextWeather: "drought", 
    confidence: 0.6,
    hint: "Extended heat may cause drought"
  }
];

const WEATHER_PREDICTION_REWARDS = {
  perfect: { coins: 100, xp: 50, accuracy: 1.0 },
  good: { coins: 60, xp: 30, accuracy: 0.8 },
  okay: { coins: 30, xp: 15, accuracy: 0.6 },
  poor: { coins: 10, xp: 5, accuracy: 0.4 }
};

// 🐕 FARM PETS SYSTEM
const PET_TYPES = {
  dog: {
    name: "Farm Dog",
    emoji: "🐕",
    cost: 200,
    maxLevel: 5,
    traits: ["pest_detection", "security", "loyalty"],
    bonuses: {
      pest_prevention: 0.3, // 30% chance to prevent pests
      theft_protection: 0.5, // 50% protection from theft events
      happiness_boost: 0.1 // 10% faster growth from happiness
    },
    needs: {
      food: { type: "pet_food", consumption: 1, interval: 3600 }, // 1 food per hour
      play: { type: "attention", consumption: 1, interval: 7200 }, // Play every 2 hours
      health: { type: "vet_care", consumption: 1, interval: 86400 } // Vet care daily
    },
    levelBonuses: {
      1: { pest_prevention: 0.1 },
      2: { pest_prevention: 0.15, security: 0.1 },
      3: { pest_prevention: 0.2, security: 0.15, loyalty: 0.1 },
      4: { pest_prevention: 0.25, security: 0.2, loyalty: 0.15 },
      5: { pest_prevention: 0.3, security: 0.25, loyalty: 0.2 }
    }
  },
  cat: {
    name: "Farm Cat",
    emoji: "🐱", 
    cost: 150,
    maxLevel: 5,
    traits: ["pest_hunter", "independence", "curiosity"],
    bonuses: {
      pest_elimination: 0.4, // 40% chance to auto-eliminate pests
      crop_quality: 0.15, // 15% quality bonus from pest control
      luck_boost: 0.05 // 5% better random events
    },
    needs: {
      food: { type: "pet_food", consumption: 1, interval: 4800 }, // 1 food per 1.3 hours
      play: { type: "attention", consumption: 1, interval: 10800 }, // Play every 3 hours
      health: { type: "vet_care", consumption: 1, interval: 86400 }
    },
    levelBonuses: {
      1: { pest_elimination: 0.2 },
      2: { pest_elimination: 0.25, crop_quality: 0.05 },
      3: { pest_elimination: 0.3, crop_quality: 0.1, luck_boost: 0.02 },
      4: { pest_elimination: 0.35, crop_quality: 0.12, luck_boost: 0.03 },
      5: { pest_elimination: 0.4, crop_quality: 0.15, luck_boost: 0.05 }
    }
  },
  chicken: {
    name: "Farm Chicken",
    emoji: "🐔",
    cost: 100,
    maxLevel: 3,
    traits: ["egg_production", "pest_control", "fertilizer_production"],
    bonuses: {
      daily_eggs: 2, // 2 eggs per day
      pest_reduction: 0.2, // 20% fewer pests
      fertilizer_production: 1 // 1 fertilizer per day
    },
    needs: {
      food: { type: "grain", consumption: 2, interval: 3600 },
      shelter: { type: "coop", consumption: 0, interval: 0 }
    },
    levelBonuses: {
      1: { daily_eggs: 1 },
      2: { daily_eggs: 2, fertilizer_production: 0.5 },
      3: { daily_eggs: 3, fertilizer_production: 1, pest_reduction: 0.2 }
    }
  }
};

// PRESTIGE SYSTEM - REFINED BALANCE
const PRESTIGE_LEVELS = [
  { level: 0, name: "Beginner", emoji: "🌱", multiplier: 1.0, requirement: 0 },
  { level: 1, name: "Experienced", emoji: "🌿", multiplier: 1.15, requirement: 500 },
  { level: 2, name: "Expert", emoji: "🍃", multiplier: 1.35, requirement: 2000 },
  { level: 3, name: "Master", emoji: "🌳", multiplier: 1.6, requirement: 8000 },
  { level: 4, name: "Grandmaster", emoji: "🏆", multiplier: 2.0, requirement: 25000 },
  { level: 5, name: "Legend", emoji: "👑", multiplier: 2.5, requirement: 75000 }
];

const PRESTIGE_BONUSES = {
  growth_speed: 0.08,      // 8% faster growth per prestige level
  coin_multiplier: 0.12,   // 12% more coins per prestige level
  quality_chance: 0.03,    // 3% better quality chance per level
  skill_points: 5          // More skill points per prestige
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

// ADVANCED WORKER SYSTEM - REFINED BALANCE
const WORKER_TYPES = {
  irrigator: {
    name: "Irrigator",
    emoji: "💧",
    description: "Automatically waters crops",
    cost: 150,      // Reduced from 200
    upkeep: 8,      // Reduced from 10
    efficiency: 0.85, // Increased from 0.8
    unlocks: "auto_watering"
  },
  harvester: {
    name: "Harvester",
    emoji: "🚜",
    description: "Automatically harvests ready crops",
    cost: 300,      // Reduced from 350
    upkeep: 12,     // Reduced from 15
    efficiency: 0.95, // Increased from 0.9
    unlocks: "auto_harvesting"
  },
  pest_controller: {
    name: "Pest Controller",
    emoji: "🐛",
    description: "Automatically treats pest infestations",
    cost: 150,      // Reduced from 180
    upkeep: 6,      // Reduced from 8
    efficiency: 0.9, // Increased from 0.85
    unlocks: "auto_pest_control"
  },
  quality_inspector: {
    name: "Quality Inspector",
    emoji: "🔍",
    description: "Improves crop quality through careful monitoring",
    cost: 250,      // Reduced from 300
    upkeep: 10,     // Reduced from 12
    efficiency: 0.8, // Increased from 0.75
    unlocks: "quality_boost"
  },
  market_analyst: {
    name: "Market Analyst",
    emoji: "📈",
    description: "Provides market insights and trading recommendations",
    cost: 400,      // Reduced from 500
    upkeep: 15,     // Reduced from 20
    efficiency: 1.0,
    unlocks: "market_predictions"
  }
};

// SUPPLY CHAIN SYSTEM - REFINED BALANCE
const PROCESSING_FACILITIES = {
  flour_mill: {
    name: "Flour Mill",
    emoji: "🏭",
    description: "Process wheat into flour",
    cost: 400,        // Reduced from 500
    input: "wheat",
    output: "flour",
    ratio: 2,         // 2 wheat = 1 flour
    value_multiplier: 2.8, // Increased from 2.5
    time: 45          // Reduced from 60
  },
  juice_press: {
    name: "Juice Press",
    emoji: "🧃",
    description: "Process fruits into juice",
    cost: 300,        // Reduced from 400
    input: "apple",
    output: "apple_juice",
    ratio: 3,
    value_multiplier: 2.5, // Increased from 2.2
    time: 35          // Reduced from 45
  },
  oil_press: {
    name: "Oil Press",
    emoji: "🫒",
    description: "Extract oil from seeds",
    cost: 500,        // Reduced from 600
    input: "sunflower",
    output: "sunflower_oil",
    ratio: 3,         // Reduced from 4
    value_multiplier: 3.2, // Increased from 3.0
    time: 75          // Reduced from 90
  },
  preservation_facility: {
    name: "Preservation Facility",
    emoji: "🥫",
    description: "Preserve crops for longer storage",
    cost: 600,        // Reduced from 800
    input: "any",     // accepts any crop
    output: "preserved",
    ratio: 1,
    value_multiplier: 2.0, // Increased from 1.8
    time: 90,         // Reduced from 120
    storage_bonus: 15 // Increased from 10 days
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
    // 🧬 HYBRID SEEDS (dynamically added from breeding)
    super_carrot: { stages: 3, secondsPerStage: 6, baseValue: 25, shopPrice: 40, emoji: "🥕✨", rarity: "hybrid", season: "spring", family: "root" },
    rainbow_corn: { stages: 4, secondsPerStage: 10, baseValue: 45, shopPrice: 65, emoji: "🌽🌈", rarity: "hybrid", season: "summer", family: "grain" },
    golden_tomato: { stages: 4, secondsPerStage: 11, baseValue: 35, shopPrice: 50, emoji: "🍅✨", rarity: "hybrid", season: "summer", family: "fruit" },
    frost_potato: { stages: 3, secondsPerStage: 7, baseValue: 20, shopPrice: 35, emoji: "🥔❄️", rarity: "hybrid", season: "winter", family: "root" },
    dragon_pepper: { stages: 5, secondsPerStage: 15, baseValue: 80, shopPrice: 120, emoji: "🌶️🔥", rarity: "legendary", season: "summer", family: "fruit" },
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
  // FARMING BASICS
  { id: "first_harvest", name: "First Harvest", desc: "Harvest your first crop", reward: 15, icon: "🌱", category: "farming" },
  { id: "mass_producer", name: "Mass Producer", desc: "Harvest 25 crops total", reward: 60, icon: "🚜", category: "farming" },
  { id: "quality_farmer", name: "Quality Farmer", desc: "Harvest 5 high-quality crops", reward: 45, icon: "⭐", category: "farming" },
  { id: "field_master", name: "Field Master", desc: "Unlock the maximum field size", reward: 100, icon: "🏆", category: "farming" },
  
  // ECONOMIC MASTERY
  { id: "coin_collector", name: "Coin Collector", desc: "Earn 300 coins total", reward: 40, icon: "💰", category: "economy" },
  { id: "millionaire", name: "Farm Millionaire", desc: "Earn 800 coins total", reward: 150, icon: "💎", category: "economy" },
  { id: "market_master", name: "Market Master", desc: "Make 10 profitable trades", reward: 80, icon: "📈", category: "economy" },
  { id: "futures_trader", name: "Futures Trader", desc: "Complete 5 futures contracts", reward: 70, icon: "📊", category: "economy" },
  
  // SKILL & PROGRESSION
  { id: "skill_enthusiast", name: "Skill Enthusiast", desc: "Unlock 5 different skills", reward: 75, icon: "📚", category: "progression" },
  { id: "prestige_pioneer", name: "Prestige Pioneer", desc: "Achieve your first prestige level", reward: 200, icon: "🌟", category: "progression" },
  { id: "research_scientist", name: "Research Scientist", desc: "Complete 3 research projects", reward: 120, icon: "🔬", category: "progression" },
  { id: "automation_expert", name: "Automation Expert", desc: "Hire 3 different worker types", reward: 100, icon: "🤖", category: "progression" },
  
  // ENVIRONMENTAL & SEASONS
  { id: "weathered", name: "Weather Expert", desc: "Survive 3 weather events", reward: 25, icon: "⛈️", category: "environment" },
  { id: "season_expert", name: "Season Expert", desc: "Plant 5 crops in their optimal season", reward: 35, icon: "🍂", category: "environment" },
  { id: "rotation_master", name: "Rotation Master", desc: "Use crop rotation 20 times", reward: 60, icon: "�", category: "environment" },
  { id: "companion_gardener", name: "Companion Gardener", desc: "Achieve 10 companion planting bonuses", reward: 50, icon: "🌿", category: "environment" },
  
  // CHALLENGES & SPECIAL
  { id: "speed_farmer", name: "Speed Farmer", desc: "Complete Level 1 in under 4 minutes", reward: 30, icon: "⚡", category: "challenge" },
  { id: "pest_controller", name: "Pest Controller", desc: "Eliminate 10 pest infestations", reward: 30, icon: "🧽", category: "challenge" },
  { id: "disease_fighter", name: "Disease Fighter", desc: "Cure 15 crop diseases", reward: 50, icon: "🦠", category: "challenge" },
  { id: "efficiency_master", name: "Efficiency Master", desc: "Achieve 95% farm efficiency rating", reward: 90, icon: "⚙️", category: "challenge" },
  
  // SOCIAL & COMMUNITY
  { id: "social_butterfly", name: "Social Butterfly", desc: "Add 5 friends", reward: 40, icon: "👥", category: "social" },
  { id: "gift_giver", name: "Gift Giver", desc: "Send 20 gifts to friends", reward: 60, icon: "🎁", category: "social" },
  { id: "competition_winner", name: "Competition Winner", desc: "Win a farming competition", reward: 100, icon: "🏅", category: "social" },
  { id: "town_builder", name: "Town Builder", desc: "Build 3 town structures", reward: 85, icon: "🏛️", category: "social" },
  
  // SPECIALIZED & ADVANCED
  { id: "bee_keeper", name: "Bee Keeper", desc: "Harvest 10 honey products", reward: 40, icon: "🐝", category: "specialized" },
  { id: "processing_tycoon", name: "Processing Tycoon", desc: "Process 50 raw materials", reward: 70, icon: "🏭", category: "specialized" },
  { id: "weather_forecaster", name: "Weather Forecaster", desc: "Successfully predict 5 weather changes", reward: 35, icon: "🌤️", category: "specialized" },
  { id: "innovation_leader", name: "Innovation Leader", desc: "Be first to unlock new technology", reward: 150, icon: "💡", category: "specialized" },
  
  // MILESTONE ACHIEVEMENTS
  { id: "centurion", name: "Centurion", desc: "Harvest 100 crops total", reward: 200, icon: "💯", category: "milestone" },
  { id: "land_baron", name: "Land Baron", desc: "Expand to maximum farm size in all directions", reward: 250, icon: "🗺️", category: "milestone" },
  { id: "master_farmer", name: "Master Farmer", desc: "Reach prestige level 3", reward: 500, icon: "👑", category: "milestone" },
  { id: "farm_legend", name: "Farm Legend", desc: "Complete all other achievements", reward: 1000, icon: "🏆", category: "milestone" }
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
  Sunny: { icon: null, emoji: "☀️", color: "text-yellow-500", bg: "bg-yellow-50" },
  Rain: { icon: null, emoji: "🌧️", color: "text-blue-500", bg: "bg-blue-50" },
  Drought: { icon: null, emoji: "🏜️", color: "text-orange-500", bg: "bg-orange-50" },
  Storm: { icon: null, emoji: "⛈️", color: "text-purple-500", bg: "bg-purple-50" },
  Frost: { icon: null, emoji: "❄️", color: "text-cyan-500", bg: "bg-cyan-50" },
  Pests: { icon: null, emoji: "🐛", color: "text-red-500", bg: "bg-red-50" },
};

// ADVANCED CROP ROTATION SYSTEM
const CROP_FAMILIES = {
  legumes: { crops: ['soybean'], benefit: 'nitrogen_fixation', emoji: '🫘' },
  roots: { crops: ['carrot', 'potato'], benefit: 'soil_aeration', emoji: '🥕' },
  brassicas: { crops: ['cabbage'], benefit: 'pest_control', emoji: '🥬' },
  fruits: { crops: ['tomato', 'strawberry', 'apple'], benefit: 'diverse_nutrients', emoji: '🍅' },
  grains: { crops: ['corn', 'wheat'], benefit: 'soil_structure', emoji: '🌾' },
  herbs: { crops: ['basil'], benefit: 'companion_planting', emoji: '🌿' }
};

const ROTATION_BENEFITS = {
  nitrogen_fixation: { bonus: 1.3, description: 'Enriches soil nitrogen for next crop', duration: 2 },
  soil_aeration: { bonus: 1.2, description: 'Improves soil structure', duration: 1 },
  pest_control: { bonus: 1.25, description: 'Natural pest deterrent', duration: 2 },
  diverse_nutrients: { bonus: 1.15, description: 'Balanced nutrient cycling', duration: 1 },
  soil_structure: { bonus: 1.2, description: 'Prevents soil compaction', duration: 1 },
  companion_planting: { bonus: 1.35, description: 'Symbiotic growth boost', duration: 3 }
};

// COMPANION PLANTING MATRIX
const COMPANION_PLANTS = {
  tomato: { good: ['basil'], bad: ['corn'], neutral: ['carrot', 'potato'] },
  corn: { good: ['soybean'], bad: ['tomato'], neutral: ['carrot'] },
  carrot: { good: ['tomato', 'corn'], bad: [], neutral: ['potato'] },
  potato: { good: [], bad: ['tomato'], neutral: ['carrot', 'corn'] },
  basil: { good: ['tomato'], bad: [], neutral: ['corn', 'carrot'] },
  soybean: { good: ['corn'], bad: [], neutral: ['tomato', 'carrot'] }
};

// ===== NEW LIVESTOCK SYSTEM =====
const LIVESTOCK_TYPES = {
  chicken: {
    name: "Chickens", emoji: "🐔", 
    cost: 25, maxCount: 20, space: 1,
    products: { eggs: { rate: 180, sellPrice: 8, name: "Eggs" } },
    food: { type: "grain", consumption: 2, cost: 1 },
    breeding: { time: 300, cost: 15, offspring: 2 },
    lifespan: 1800, diseaseRate: 0.15
  },
  cow: {
    name: "Cows", emoji: "🐄", 
    cost: 150, maxCount: 8, space: 4,
    products: { milk: { rate: 360, sellPrice: 15, name: "Milk" } },
    food: { type: "hay", consumption: 8, cost: 3 },
    breeding: { time: 600, cost: 75, offspring: 1 },
    lifespan: 3600, diseaseRate: 0.08
  },
  sheep: {
    name: "Sheep", emoji: "🐑", 
    cost: 80, maxCount: 12, space: 2,
    products: { wool: { rate: 480, sellPrice: 12, name: "Wool" } },
    food: { type: "grass", consumption: 4, cost: 2 },
    breeding: { time: 450, cost: 40, offspring: 1 },
    lifespan: 2700, diseaseRate: 0.12
  }
};

// ===== GREENHOUSE SYSTEM =====
const GREENHOUSE_TYPES = {
  basic: {
    name: "Basic Greenhouse", emoji: "🏠", cost: 200, capacity: 9,
    benefits: { growthRate: 1.5, diseaseResistance: 0.3, weatherProtection: 1.0 },
    upkeep: 5, description: "Climate-controlled growing environment"
  },
  advanced: {
    name: "Advanced Greenhouse", emoji: "🌿", cost: 500, capacity: 16,
    benefits: { growthRate: 2.0, diseaseResistance: 0.5, weatherProtection: 1.0 },
    upkeep: 12, description: "High-tech automated growing system"
  },
  hydroponic: {
    name: "Hydroponic Facility", emoji: "💧", cost: 800, capacity: 25,
    benefits: { growthRate: 2.5, diseaseResistance: 0.7, weatherProtection: 1.0 },
    upkeep: 20, description: "Soilless growing with optimal nutrients"
  }
};

// ===== IRRIGATION SYSTEM =====
const IRRIGATION_TYPES = {
  sprinkler: {
    name: "Sprinkler System", emoji: "💦", cost: 100, coverage: 9,
    efficiency: 0.8, autoWater: true, upkeep: 3,
    description: "Automated watering for small areas"
  },
  drip: {
    name: "Drip Irrigation", emoji: "💧", cost: 200, coverage: 16,
    efficiency: 0.95, autoWater: true, upkeep: 5,
    description: "Water-efficient precision irrigation"
  },
  pivot: {
    name: "Center Pivot", emoji: "🌊", cost: 500, coverage: 36,
    efficiency: 0.85, autoWater: true, upkeep: 15,
    description: "Large-scale circular irrigation system"
  }
};

// ===== PROCESSING FACILITIES =====
const PROCESSING_TYPES = {
  mill: {
    name: "Flour Mill", emoji: "🏭", cost: 300,
    recipes: {
      flour: { input: "wheat", ratio: 1, output: "flour", sellPrice: 25, time: 120 }
    },
    upkeep: 8, description: "Process wheat into flour"
  },
  dairy: {
    name: "Dairy Plant", emoji: "🥛", cost: 400,
    recipes: {
      cheese: { input: "milk", ratio: 2, output: "cheese", sellPrice: 35, time: 180 },
      butter: { input: "milk", ratio: 3, output: "butter", sellPrice: 40, time: 150 }
    },
    upkeep: 12, description: "Process milk into dairy products"
  },
  cannery: {
    name: "Cannery", emoji: "🥫", cost: 350,
    recipes: {
      sauce: { input: "tomato", ratio: 3, output: "tomato_sauce", sellPrice: 30, time: 90 },
      jam: { input: "strawberry", ratio: 4, output: "strawberry_jam", sellPrice: 45, time: 120 }
    },
    upkeep: 10, description: "Preserve fruits and vegetables"
  }
};

// ===== FARM EQUIPMENT =====
const EQUIPMENT_TYPES = {
  tractor: {
    name: "Tractor", emoji: "🚜", cost: 800,
    benefits: { plantSpeed: 0.5, harvestSpeed: 0.4, fuelCost: 5 },
    description: "Speeds up planting and harvesting"
  },
  plow: {
    name: "Auto Plow", emoji: "🔧", cost: 300,
    benefits: { soilPrep: 1.2, plantBonus: 0.15, fuelCost: 2 },
    description: "Improves soil preparation and plant growth"
  },
  harvester: {
    name: "Combine Harvester", emoji: "⚙️", cost: 1200,
    benefits: { harvestSpeed: 0.3, yieldBonus: 0.1, fuelCost: 8 },
    description: "Ultra-fast harvesting with yield bonus"
  },
  seeder: {
    name: "Precision Seeder", emoji: "🌱", cost: 600,
    benefits: { plantSpeed: 0.4, seedEfficiency: 0.9, fuelCost: 3 },
    description: "Efficient planting with reduced seed waste"
  }
};

// ===== ENHANCED PEST SYSTEM =====
const ENHANCED_PEST_TYPES = {
  aphids: {
    name: "Aphids", emoji: "🐛", severity: "low",
    effects: { growthRate: 0.8, yield: 0.9 },
    treatments: ["insecticide", "ladybugs"], spreadRate: 0.2,
    description: "Small insects that suck plant juices"
  },
  caterpillars: {
    name: "Caterpillars", emoji: "🐛", severity: "medium",
    effects: { growthRate: 0.6, yield: 0.7 },
    treatments: ["pesticide", "bt_spray"], spreadRate: 0.15,
    description: "Leaf-eating larvae that damage crops"
  },
  beetles: {
    name: "Beetles", emoji: "🪲", severity: "high",
    effects: { growthRate: 0.4, yield: 0.5 },
    treatments: ["strong_pesticide", "pheromone_traps"], spreadRate: 0.1,
    description: "Destructive insects that eat roots and leaves"
  },
  locusts: {
    name: "Locust Swarm", emoji: "🦗", severity: "extreme",
    effects: { growthRate: 0.1, yield: 0.2 },
    treatments: ["emergency_spray", "professional_service"], spreadRate: 0.3,
    description: "Devastating swarms that can destroy entire fields"
  }
};

const ENHANCED_PEST_TREATMENTS = {
  insecticide: { name: "Basic Insecticide", cost: 15, effectiveness: { aphids: 0.9, caterpillars: 0.6 } },
  pesticide: { name: "Broad Pesticide", cost: 25, effectiveness: { caterpillars: 0.9, beetles: 0.7 } },
  strong_pesticide: { name: "Strong Pesticide", cost: 40, effectiveness: { beetles: 0.95, locusts: 0.6 } },
  ladybugs: { name: "Beneficial Ladybugs", cost: 20, effectiveness: { aphids: 0.95 }, organic: true },
  bt_spray: { name: "BT Bacterial Spray", cost: 30, effectiveness: { caterpillars: 0.95 }, organic: true },
  pheromone_traps: { name: "Pheromone Traps", cost: 35, effectiveness: { beetles: 0.8 } },
  emergency_spray: { name: "Emergency Treatment", cost: 80, effectiveness: { locusts: 0.9 } },
  professional_service: { name: "Professional Service", cost: 150, effectiveness: { locusts: 0.99 } }
};

// ===== ECONOMIC EXPANSION =====
const SUPPLY_CONTRACT_TYPES = {
  supply: {
    name: "Supply Contract", description: "Guaranteed buyers for your crops",
    duration: 1800, crops: ["wheat", "corn", "tomato"],
    priceMultiplier: 1.2, penalty: 0.5, minQuantity: 10
  },
  premium: {
    name: "Premium Contract", description: "High-value specialty crop contracts",
    duration: 2400, crops: ["berry", "flower"],
    priceMultiplier: 1.5, penalty: 0.3, minQuantity: 5
  }
};

const INSURANCE_TYPES = {
  basic: {
    name: "Basic Coverage", cost: 50, coverage: 0.6, 
    events: ["drought", "storm"], description: "Covers 60% of losses from weather"
  },
  comprehensive: {
    name: "Full Coverage", cost: 120, coverage: 0.8,
    events: ["drought", "storm", "pest", "disease"], description: "Covers 80% of all losses"
  },
  premium: {
    name: "Premium Insurance", cost: 200, coverage: 0.95,
    events: ["drought", "storm", "pest", "disease", "fire"], description: "Covers 95% of all disasters"
  }
};

const LOAN_TYPES = {
  personal: {
    name: "Personal Loan", amount: 500, interest: 0.05, term: 1800,
    description: "Small loan for equipment and supplies"
  },
  business: {
    name: "Business Loan", amount: 2000, interest: 0.08, term: 3600,
    description: "Large loan for major farm expansions"
  },
  equipment: {
    name: "Equipment Finance", amount: 1500, interest: 0.06, term: 2400,
    description: "Specialized financing for farm equipment"
  }
};

const COOP_BENEFITS = {
  buying: {
    name: "Bulk Purchasing", description: "15% discount on seeds and supplies",
    discount: 0.15, membershipCost: 100
  },
  selling: {
    name: "Collective Marketing", description: "20% bonus on crop sales",
    bonus: 1.2, membershipCost: 150
  },
  sharing: {
    name: "Equipment Sharing", description: "Free access to shared equipment",
    equipmentAccess: true, membershipCost: 200
  }
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

// 🔧 LOOKUP UTILITIES - Consolidates repeated array lookups
const findPrestigeLevel = (level) => PRESTIGE_LEVELS.find(p => p.level === level);
const findLevelById = (id) => LEVELS.find(l => l.id === id);
const findLevelIndex = (id) => LEVELS.findIndex(l => l.id === id);

// 📢 NOTIFICATION HELPERS - Consolidates common notification patterns
// Notification helpers will be defined inside the component where addNotification is available

// Local save helpers with compression
const SAVE_KEY = "farm_sim_enhanced_v2";
function loadSave() {
  try { 
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const s = localStorage.getItem(SAVE_KEY); 
    if (s) {
      const parsed = JSON.parse(s);
      // Only return if it's v2 format, otherwise start fresh
      if (parsed?.version === 2) return parsed;
    } 
  } catch (e) {
    console.debug('[farm] loadSave error:', e);
  }
  return null;
}

// ===== NEW SYSTEMS FUNCTIONS =====
// These functions will be defined inside the component where state setters are available

function saveState(s) { 
  try { 
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    }
  } catch (e) {
    console.debug('[farm] saveState error:', e);
  } 
}

function FarmSimCanvas() {
  console.log('[FarmSim] Component initializing...');
  
  // --- Initial loading state ---
  const [isInitializing, setIsInitializing] = useState(true);
  
  // --- config ---
  const [useApi, setUseApi] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:5000");

  // --- game state ---
  // Load save data synchronously to avoid initialization issues
  const saved = useMemo(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return loadSave();
    } catch (e) {
      console.debug('[farm] Error loading save:', e);
      return null;
    }
  }, []);

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
  const [livestock, setLivestock] = useState(saved?.livestock || {});
  const [livestockProducts, setLivestockProducts] = useState(saved?.livestockProducts || {});
  const [processedGoods, setProcessedGoods] = useState(saved?.processedGoods || {});
  const [npcs, setNpcs] = useState(saved?.npcs || []);
  const [events, setEvents] = useState(saved?.events || []);
  const [automation, setAutomation] = useState(saved?.automation || {});
  
  // 🎉 NEW GAMEPLAY FEATURES STATE
  // Seasonal Events & Festivals
  const [activeSeasonalEvents, setActiveSeasonalEvents] = useState(saved?.activeSeasonalEvents || []);
  const [seasonalEventHistory, setSeasonalEventHistory] = useState(saved?.seasonalEventHistory || []);
  const [lastSeasonalCheck, setLastSeasonalCheck] = useState(saved?.lastSeasonalCheck || nowSec());
  
  // Daily Challenges
  const [dailyChallenges, setDailyChallenges] = useState(saved?.dailyChallenges || []);
  const [dailyChallengeProgress, setDailyChallengeProgress] = useState(saved?.dailyChallengeProgress || {});
  const [lastChallengeReset, setLastChallengeReset] = useState(saved?.lastChallengeReset || nowSec());
  const [challengeStreak, setChallengeStreak] = useState(saved?.challengeStreak || 0);
  
  // Crop Breeding System
  const [hybridSeeds, setHybridSeeds] = useState(saved?.hybridSeeds || {});
  const [breedingQueue, setBreedingQueue] = useState(saved?.breedingQueue || []);
  const [breedingLab, setBreedingLab] = useState(saved?.breedingLab || { level: 1, capacity: 2 });
  const [discoveredHybrids, setDiscoveredHybrids] = useState(saved?.discoveredHybrids || []);
  
  // Weather Prediction Mini-Game
  const [weatherPredictionGame, setWeatherPredictionGame] = useState(saved?.weatherPredictionGame || {
    active: false,
    currentPattern: [],
    accuracy: 0,
    streak: 0,
    totalPredictions: 0,
    correctPredictions: 0
  });
  const [weatherPredictionRewards, setWeatherPredictionRewards] = useState(saved?.weatherPredictionRewards || 0);
  
  // Farm Pets System
  const [farmPets, setFarmPets] = useState(saved?.farmPets || []);
  const [petSupplies, setPetSupplies] = useState(saved?.petSupplies || { 
    pet_food: 5, 
    attention: 100, 
    vet_care: 2 
  });
  const [petHappiness, setPetHappiness] = useState(saved?.petHappiness || {});
  const [lastPetCare, setLastPetCare] = useState(saved?.lastPetCare || {});
  
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
  
  // ENHANCEMENT STATES - Mobile detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false; // Default to desktop during SSR
  });
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
  
  // ADVANCED STATISTICS & ANALYTICS
  const [farmStatistics, setFarmStatistics] = useState(saved?.farmStatistics || {
    totalTimePlayedMinutes: 0,
    plotsPlanted: 0,
    plotsHarvested: 0,
    plotsWithered: 0,
    totalFertilizerUsed: 0,
    totalPesticideUsed: 0,
    diseasesEncountered: 0,
    weatherEventsExperienced: 0,
    bestComboStreak: 0,
    highestValueHarvest: 0,
    favoriteCrop: "carrot",
    mostProfitableDay: 0,
    efficacyRating: 100, // 0-100 based on performance
    lastPlaySession: nowSec()
  });
  
  // QUALITY OF LIFE FEATURES
  const [autoActions, setAutoActions] = useState(saved?.autoActions || {
    autoHarvest: false,
    autoWater: false,
    autoPlant: false,
    autoFertilize: false,
    notifyLowResources: true,
    showDetailedTooltips: true
  });

  // 🔄 ENHANCED AUTO-ACTIONS SYSTEM
  const [autoActionSettings, setAutoActionSettings] = useState(saved?.autoActionSettings || {
    enabled: false,    // Master toggle
    harvest: true,     // Auto harvest when ready
    plant: true,       // Auto plant on empty plots
    water: true,       // Auto water when needed
    fertilize: true,   // Auto fertilize when needed
    smartPriority: true, // Use smart priority system
    priorities: {
      harvest: 1,        // Highest priority
      water: 2,         // Second priority  
      fertilize: 3,     // Third priority
      plant: 4,         // Fourth priority
      pestControl: 5    // Fifth priority
    },
    conditions: {
      minCoinsForPlanting: 50,
      preferredCrops: ['carrot', 'potato', 'corn'],
      maxPlotsToAutoPlant: 10,
      waterWhenBelowPercent: 0.3,
      fertilizeWhenBelowPercent: 0.5,
      autoPestControlEnabled: true,
      smartCropRotation: true
    },
    scheduling: {
      actionInterval: 5000,     // 5 seconds between auto actions
      maxActionsPerInterval: 3,  // Max 3 actions per interval
      enableDuringLevels: true,
      pauseWhenLowCoins: true
    }
  });
  const [lastAutoActionTime, setLastAutoActionTime] = useState(0);
  const [autoActionQueue, setAutoActionQueue] = useState([]);

  // 📊 ENHANCED ANALYTICS SYSTEM
  const [analyticsData, setAnalyticsData] = useState(saved?.analyticsData || {
    profitHistory: [],
    cropPerformance: {},
    dailyStats: [],
    efficiency: {
      waterUsage: 0,
      fertilizerUsage: 0,
      seedSuccess: 0,
      timeToHarvest: 0
    },
    trends: {
      coinsPerMinute: [],
      harvestsPerMinute: [],
      plotUtilization: []
    }
  });
  const [lastAnalyticsUpdate, setLastAnalyticsUpdate] = useState(nowSec());
  
  // 📱 MOBILE UI STATE
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // SMART FARM ASSISTANT
  const [assistantRecommendations, setAssistantRecommendations] = useState([]);
  const [assistantEnabled, setAssistantEnabled] = useState(saved?.assistantEnabled ?? true);
  const [lastRecommendationUpdate, setLastRecommendationUpdate] = useState(0);
  const [farmInsights, setFarmInsights] = useState(saved?.farmInsights || {
    profitTrends: [],
    cropPerformance: {},
    seasonalAdvice: {},
    marketOpportunities: []
  });

  // ADVANCED CROP ROTATION SYSTEM
  const [plotHistory, setPlotHistory] = useState(saved?.plotHistory || {}); // Track what was planted on each plot
  const [rotationBenefits, setRotationBenefits] = useState(saved?.rotationBenefits || {}); // Active benefits per plot
  const [companionBonuses, setCompanionBonuses] = useState(saved?.companionBonuses || {}); // Companion plant bonuses

  // ===== NEW INFRASTRUCTURE & ECONOMIC SYSTEMS =====
  const [feedInventory, setFeedInventory] = useState(saved?.feedInventory || { grain: 0, hay: 0, grass: 0 });
  const [greenhouses, setGreenhouses] = useState(saved?.greenhouses || []);
  const [irrigation, setIrrigation] = useState(saved?.irrigation || []);
  const [processing, setProcessing] = useState(saved?.processing || []);
  const [equipment, setEquipment] = useState(saved?.equipment || []);
  const [contracts, setContracts] = useState(saved?.contracts || []);
  const [insurance, setInsurance] = useState(saved?.insurance || null);
  const [loans, setLoans] = useState(saved?.loans || []);
  const [coopMembership, setCoopMembership] = useState(saved?.coopMembership || []);
  const [fuelLevel, setFuelLevel] = useState(saved?.fuelLevel || 100);
  const [enhancedPests, setEnhancedPests] = useState(saved?.enhancedPests || {});
  
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
  const [simSpeed, setSimSpeed] = useState(saved?.simSpeed || 1);

  // TUTORIAL & ONBOARDING SYSTEM
  const [tutorialActive, setTutorialActive] = useState(saved?.tutorialActive ?? true);
  const [tutorialStep, setTutorialStep] = useState(saved?.tutorialStep ?? 0);
  const [tutorialCompleted, setTutorialCompleted] = useState(saved?.tutorialCompleted ?? false);
  const [tutorialProgress, setTutorialProgress] = useState(saved?.tutorialProgress || {});
  const [hintsEnabled, setHintsEnabled] = useState(saved?.hintsEnabled ?? true);
  const [lastHintShown, setLastHintShown] = useState(saved?.lastHintShown || 0);

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
  const level = useMemo(() => findLevelById(levelId) || LEVELS[0], [levelId]);
  const [levelEndsAt, setLevelEndsAt] = useState(saved?.levelEndsAt || nowSec() + (LEVELS[0]?.minutes || 5) * 60);
  const [levelStatus, setLevelStatus] = useState(saved?.levelStatus || "playing");
  const [levelStartedAt, setLevelStartedAt] = useState(saved?.levelStartedAt || nowSec());

  const [weather, setWeather] = useState(saved?.weather || { type: "Sunny", endsAt: nowSec() + 30 });
  const [log, setLog] = useState(saved?.log || ["🌱 Welcome to your farm! Plant seeds and watch them grow.", "💡 Tip: Right-click plots to fertilize or spray pesticide."]);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(nowSec());
  const [buying, setBuying] = useState(false);
  const [activeTab, setActiveTab] = useState("main"); // Add missing activeTab state
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
          // NEW GAMEPLAY FEATURES
          activeSeasonalEvents, seasonalEventHistory, lastSeasonalCheck,
          dailyChallenges, dailyChallengeProgress, lastChallengeReset, challengeStreak,
          hybridSeeds, breedingQueue, breedingLab, discoveredHybrids,
          weatherPredictionGame, weatherPredictionRewards,
          farmPets, petSupplies, petHappiness, lastPetCare,
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
          processingFacilities, processingQueue, processedInventory,
          // ADVANCED STATISTICS & ANALYTICS
          farmStatistics, autoActions, autoActionSettings, analyticsData,
          // SMART FARM ASSISTANT
          assistantEnabled, farmInsights,
          // CROP ROTATION SYSTEM
          plotHistory, rotationBenefits, companionBonuses,
          // TUTORIAL SYSTEM
          tutorialActive, tutorialStep, tutorialCompleted, tutorialProgress, hintsEnabled,
          // NEW ADVANCED SYSTEMS (v2.1)
          feedInventory, greenhouses, irrigation, processing, equipment,
          contracts, insurance, loans, coopMembership, fuelLevel, enhancedPests
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

  // Mobile detection resize listener
  // Initialize app after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-enable performance mode on mobile
  useEffect(() => {
    if (isMobile && !performanceMode && !isInitializing) {
      setPerformanceMode(true);
      setAnimationsEnabled(false);
      // Don't show notification during initialization to avoid errors
    }
  }, [isMobile, performanceMode, isInitializing]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  
  const addNotification = (msg, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = { 
      id, 
      msg, 
      type, 
      timestamp: Date.now(),
      priority: type === "error" ? 3 : type === "warning" ? 2 : 1
    };
    
    setNotifications(n => {
      const next = [...n, notification];
      // Sort by priority and keep max 5 notifications
      return next
        .sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp)
        .slice(-5);
    });
    
    // Auto-remove with longer duration for important messages
    const autoRemoveDuration = type === "error" ? duration * 2 : duration;
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== id));
    }, autoRemoveDuration);
  };

  // 📢 NOTIFICATION HELPERS - Consolidates common notification patterns
  const notifyInsufficientCoins = (entity) => addNotification(`Not enough coins for ${entity.name}!`, "error");
  const notifyPurchaseSuccess = (entity, emoji) => addNotification(`Bought ${entity.name}! ${emoji || entity.emoji || ''}`, "success");
  const notifyMaxLimit = (entity) => addNotification(`Maximum ${entity.name} limit reached!`, "error");
  const notifyAlreadyOwn = (entity) => addNotification(`You already own ${entity.name}!`, "error");
  const notifyInsufficientResource = (resource, action) => addNotification(`Not enough ${resource} to ${action}!`, "error");
  const notifyActionSuccess = (action, emoji) => addNotification(`${action}! ${emoji || ''}`, "success");
  const notifyEntityAction = (action, entity, emoji) => addNotification(`${action} ${entity.name}! ${emoji || ''}`, "success");

  // Unified purchase handler
  const createPurchaseHandler = (entityTypes, updateState, additionalValidation = null, successEmoji = '') => {
    return (type) => {
      const entity = entityTypes[type];
      if (!entity) return;
      
      if (coins < entity.cost) {
        addNotification(`Not enough coins for ${entity.name}!`, "error");
        return;
      }
      
      if (additionalValidation && !additionalValidation(type, entity)) {
        return;
      }
      
      setCoins(prev => prev - entity.cost);
      updateState(type, entity);
      addNotification(`Bought ${entity.name}! ${successEmoji || entity.emoji || ''}`, "success");
    };
  };

  // Livestock Management Functions
  const buyLivestock = createPurchaseHandler(
    LIVESTOCK_TYPES,
    (type, animal) => setLivestock(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 })),
    (type, animal) => {
      const currentCount = livestock[type] || 0;
      if (currentCount >= animal.maxCount) {
        addNotification(`Maximum ${animal.name} limit reached!`, "error");
        return false;
      }
      return true;
    },
    '🐾'
  );

  const feedLivestock = (type) => {
    const animal = LIVESTOCK_TYPES[type];
    const count = livestock[type] || 0;
    if (count === 0) return;
    
    const feedNeeded = animal.food.consumption * count;
    const feedType = animal.food.type;
    
    if ((feedInventory[feedType] || 0) < feedNeeded) {
      notifyInsufficientResource(feedType, `feed ${animal.name}`);
      return;
    }
    
    setFeedInventory(prev => ({
      ...prev,
      [feedType]: (prev[feedType] || 0) - feedNeeded
    }));
    
    notifyActionSuccess(`Fed ${count} ${animal.name}`, '🌾');
  };

  const collectProducts = (type) => {
    const animal = LIVESTOCK_TYPES[type];
    const count = livestock[type] || 0;
    if (count === 0) return;
    
    Object.entries(animal.products).forEach(([productType, productInfo]) => {
      const amount = count;
      setLivestockProducts(prev => ({
        ...prev,
        [productType]: (prev[productType] || 0) + amount
      }));
    });
    
    notifyEntityAction("Collected products from", animal, '🥚');
  };

  const sellProducts = (productType) => {
    const amount = livestockProducts[productType] || 0;
    if (amount === 0) return;
    
    // Find product info from livestock types
    let productValue = 10; // Default value
    for (const [animalType, animalInfo] of Object.entries(LIVESTOCK_TYPES)) {
      if (animalInfo.products[productType]) {
        productValue = animalInfo.products[productType].value;
        break;
      }
    }
    
    const earnings = amount * productValue;
    setCoins(prev => prev + earnings);
    setLivestockProducts(prev => ({
      ...prev,
      [productType]: 0
    }));
    
    addNotification(`Sold ${amount} ${productType} for ${earnings} coins! 💰`, "success");
  };
  // NEW: Enhanced visual and gameplay helpers
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "day";
    if (hour >= 12 && hour < 18) return "dusk";
    if (hour >= 18 || hour < 6) return "night";
    return "dawn";
  };

  // 🚀 PERFORMANCE OPTIMIZATIONS - Memoized expensive calculations
  const seedEntries = useMemo(() => seedEntries, [rules.seeds]);
  const buildingEntries = useMemo(() => buildingEntries, [rules.buildings]);
  const skillTreeEntries = useMemo(() => skillTreeEntries, []);
  const researchEntries = useMemo(() => Object.entries(RESEARCH_PROJECTS), []);
  const workerEntries = useMemo(() => Object.entries(WORKER_TYPES), []);

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

  // Debug functions for testing all features (production version)
  const testAllFeatures = () => {
    // Give resources for testing
    setCoins(5000);
    setInventory(prev => ({ ...prev, fertilizer: 50, pesticide: 50 }));
    
    // Give seeds for testing
    const allSeeds = Object.keys(rules.seeds);
    const newInventory = {};
    allSeeds.forEach(seed => {
      newInventory[seed] = 20;
    });
    setInventory(prev => ({ ...prev, ...newInventory }));
    
    addNotification("Debug mode: All resources unlocked!", "success");
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
      if (parsed.livestock) setLivestock(parsed.livestock || {});
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

  // ===== NEW SYSTEMS FUNCTIONS =====

  // Greenhouse Functions
  const buildGreenhouse = createPurchaseHandler(
    GREENHOUSE_TYPES,
    (type, greenhouse) => setGreenhouses(prev => [...prev, {
      id: Date.now(),
      type,
      plots: Array(greenhouse.capacity).fill(null)
    }]),
    null,
    '🏠'
  );

  // Equipment Functions
  const buyEquipment = createPurchaseHandler(
    EQUIPMENT_TYPES,
    (type) => setEquipment(prev => [...prev, type]),
    (type, eq) => {
      if (equipment.includes(type)) {
        notifyAlreadyOwn(eq);
        return false;
      }
      return true;
    }
  );

  // Processing Functions
  const buildProcessor = createPurchaseHandler(
    PROCESSING_TYPES,
    (type) => setProcessing(prev => [...prev, {
      id: Date.now(),
      type,
      isProcessing: false,
      finishTime: 0
    }]),
    null,
    '🏭'
  );

  const startProcessing = (processorId, recipeId) => {
    const processor = processing.find(p => p.id === processorId);
    const processorType = PROCESSING_TYPES[processor?.type];
    const recipe = processorType?.recipes[recipeId];
    
    if (!processor || !recipe) return;
    
    if (processor.isProcessing) {
      addNotification("Processor is already working!", "error");
      return;
    }
    
    // Check if we have enough input materials
    const inputCount = inventory[recipe.input] || 0;
    if (inputCount < recipe.ratio) {
      notifyInsufficientResource(`${recipe.ratio} ${recipe.input}`, "process");
      return;
    }
    
    // Consume input materials
    setInventory(prev => ({
      ...prev,
      [recipe.input]: prev[recipe.input] - recipe.ratio
    }));
    
    // Start processing
    setProcessing(prev => prev.map(p => 
      p.id === processorId ? {
        ...p,
        isProcessing: true,
        finishTime: nowSec() + recipe.time,
        currentRecipe: recipeId
      } : p
    ));
    
    notifyActionSuccess(`Started processing ${recipe.output}`, '⚙️');
  };

  // Economic Functions
  const buyInsurance = createPurchaseHandler(
    INSURANCE_TYPES,
    (type) => setInsurance({ type, expiresAt: nowSec() + 3600 }), // 1 hour coverage
    null,
    '🛡️'
  );

  const takeLoan = (type) => {
    const loan = LOAN_TYPES[type];
    if (!loan) return;
    
    setCoins(prev => prev + loan.amount);
    setLoans(prev => [...prev, {
      id: Date.now(),
      type,
      amount: loan.amount,
      interest: loan.interest,
      startTime: nowSec(),
      dueTime: nowSec() + loan.term
    }]);
    
    addNotification(`Loan approved! Received $${loan.amount} 💳`, "success");
  };

  const joinCoop = (type) => {
    const coop = COOP_BENEFITS[type];
    if (!coop) return;
    
    if (coins < coop.membershipCost) {
      addNotification(`Not enough coins for ${coop.name}!`, "error");
      return;
    }
    
    if (coopMembership.includes(type)) {
      addNotification(`Already a member of ${coop.name}!`, "error");
      return;
    }
    
    setCoins(prev => prev - coop.membershipCost);
    setCoopMembership(prev => [...prev, type]);
    addNotification(`Joined ${coop.name}! 🤝`, "success");
  };

  // 🎉 SEASONAL EVENTS & FESTIVALS FUNCTIONS
  const checkSeasonalEvents = () => {
    try {
      const now = nowSec();
      const currentEvents = SEASONAL_EVENTS[currentSeason] || [];
    
    // Check if we should trigger a new event (10% chance every 5 minutes)
    if (now - lastSeasonalCheck >= 300 && Math.random() < 0.1) {
      const availableEvents = currentEvents.filter(event => 
        !activeSeasonalEvents.some(active => active.id === event.id)
      );
      
      if (availableEvents.length > 0) {
        const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        const eventInstance = {
          ...selectedEvent,
          startedAt: now,
          endsAt: now + selectedEvent.duration,
          id: `${selectedEvent.id}_${now}`
        };
        
        setActiveSeasonalEvents(prev => [...prev, eventInstance]);
        addNotification(`🎉 ${selectedEvent.name} has begun! ${selectedEvent.description}`, "success");
        addLog(`🎉 Seasonal Event: ${selectedEvent.name} started!`);
      }
      
      setLastSeasonalCheck(now);
    }
    
    // Remove expired events and give rewards
    setActiveSeasonalEvents(prev => prev.filter(event => {
      if (now >= event.endsAt) {
        // Give completion rewards
        setCoins(c => c + event.rewards.coins);
        if (event.rewards.items) {
          Object.entries(event.rewards.items).forEach(([item, qty]) => {
            setInventory(inv => ({ ...inv, [item]: (inv[item] || 0) + qty }));
          });
        }
        
        // Track in history
        setSeasonalEventHistory(hist => [...hist, { 
          ...event, 
          completedAt: now,
          rewardsGiven: true 
        }].slice(-20)); // Keep last 20 events
        
        addNotification(`🏆 ${event.name} completed! Rewards claimed!`, "success");
        return false;
      }
      return true;
    }));
    } catch (error) {
      console.error('[farm] Seasonal events error:', error);
      addNotification('Seasonal events temporarily unavailable', 'warning');
    }
  };

  // 🎯 DAILY CHALLENGES FUNCTIONS
  const generateDailyChallenge = () => {
    const challengeType = DAILY_CHALLENGE_TYPES[Math.floor(Math.random() * DAILY_CHALLENGE_TYPES.length)];
    const target = challengeType.generateTarget();
    
    return {
      id: `${challengeType.id}_${Date.now()}`,
      type: challengeType.id,
      name: challengeType.name,
      description: challengeType.description.replace('{target}', target),
      emoji: challengeType.emoji,
      target,
      progress: 0,
      completed: false,
      reward: challengeType.reward,
      createdAt: nowSec(),
      expiresAt: nowSec() + 86400 // 24 hours
    };
  };

  const checkDailyChallenges = () => {
    try {
      const now = nowSec();
      const daysSinceReset = Math.floor((now - lastChallengeReset) / 86400);
    
    // Reset challenges daily
    if (daysSinceReset >= 1) {
      const newChallenges = Array(3).fill().map(() => generateDailyChallenge());
      setDailyChallenges(newChallenges);
      setDailyChallengeProgress({});
      setLastChallengeReset(now);
      addNotification("🎯 New daily challenges available!", "info");
    }
    
    // Check challenge completion
    dailyChallenges.forEach(challenge => {
      if (!challenge.completed) {
        const challengeType = DAILY_CHALLENGE_TYPES.find(t => t.id === challenge.type);
        const progress = dailyChallengeProgress[challenge.id] || {};
        
        if (challengeType?.checkProgress(progress, challenge.target)) {
          // Complete challenge
          setDailyChallenges(prev => prev.map(c => 
            c.id === challenge.id ? { ...c, completed: true } : c
          ));
          
          // Give rewards
          setCoins(c => c + challenge.reward.coins);
          if (challenge.reward.items) {
            Object.entries(challenge.reward.items).forEach(([item, qty]) => {
              setInventory(inv => ({ ...inv, [item]: (inv[item] || 0) + qty }));
            });
          }
          
          setChallengeStreak(prev => prev + 1);
          addNotification(`🏆 Challenge completed: ${challenge.name}!`, "success");
        }
      }
    });
    } catch (error) {
      console.error('[farm] Daily challenges error:', error);
      addNotification('Daily challenges temporarily unavailable', 'warning');
    }
  };

  const updateChallengeProgress = (type, data) => {
    const activeChallenge = dailyChallenges.find(c => c.type === type && !c.completed);
    if (!activeChallenge) return;
    
    setDailyChallengeProgress(prev => ({
      ...prev,
      [activeChallenge.id]: {
        ...prev[activeChallenge.id],
        ...data
      }
    }));
  };

  // 🧬 CROP BREEDING FUNCTIONS
  const startBreeding = (parent1, parent2) => {
    if (breedingQueue.length >= breedingLab.capacity) {
      addNotification("Breeding lab is at capacity!", "error");
      return;
    }
    
    // Check if we have the parent seeds
    if ((inventory[parent1] || 0) < 1 || (inventory[parent2] || 0) < 1) {
      addNotification("Need both parent seeds to breed!", "error");
      return;
    }
    
    // Find possible hybrid
    const possibleHybrid = Object.entries(BREEDING_RECIPES).find(([hybridId, recipe]) => {
      return (recipe.parents.includes(parent1) && recipe.parents.includes(parent2)) ||
             (recipe.parents[0] === parent1 && recipe.parents[1] === parent2) ||
             (recipe.parents[0] === parent2 && recipe.parents[1] === parent1);
    });
    
    if (!possibleHybrid) {
      addNotification("These seeds cannot be bred together!", "error");
      return;
    }
    
    const [hybridId, recipe] = possibleHybrid;
    
    // Consume parent seeds
    setInventory(prev => ({
      ...prev,
      [parent1]: prev[parent1] - 1,
      [parent2]: prev[parent2] - 1
    }));
    
    // Add to breeding queue
    const breedingProcess = {
      id: Date.now(),
      hybridId,
      parent1,
      parent2,
      startedAt: nowSec(),
      completesAt: nowSec() + 1800, // 30 minutes
      success: Math.random() < 0.7 // 70% success rate
    };
    
    setBreedingQueue(prev => [...prev, breedingProcess]);
    addNotification(`🧬 Started breeding ${recipe.name}!`, "info");
  };

  const checkBreedingCompletion = () => {
    const now = nowSec();
    
    setBreedingQueue(prev => prev.filter(process => {
      if (now >= process.completesAt) {
        const recipe = BREEDING_RECIPES[process.hybridId];
        
        if (process.success) {
          // Successful breeding
          setHybridSeeds(prev => ({
            ...prev,
            [process.hybridId]: (prev[process.hybridId] || 0) + 1
          }));
          
          // Add to discovered hybrids if new
          if (!discoveredHybrids.includes(process.hybridId)) {
            setDiscoveredHybrids(prev => [...prev, process.hybridId]);
            addNotification(`🎉 New hybrid discovered: ${recipe.name}!`, "success");
          } else {
            addNotification(`🧬 Breeding successful: ${recipe.name}!`, "success");
          }
        } else {
          // Failed breeding
          addNotification(`💔 Breeding failed. Better luck next time!`, "error");
        }
        
        return false; // Remove from queue
      }
      return true; // Keep in queue
    }));
  };

  // 🌤️ WEATHER PREDICTION MINI-GAME FUNCTIONS
  const startWeatherPredictionGame = () => {
    const recentWeather = (weatherForecast || []).slice(-3).map(w => w?.type?.toLowerCase() || 'unknown');
    const pattern = [...recentWeather, weather?.type?.toLowerCase() || 'unknown'];
    
    setWeatherPredictionGame({
      active: true,
      currentPattern: pattern,
      accuracy: 0,
      streak: weatherPredictionGame.streak,
      totalPredictions: weatherPredictionGame.totalPredictions,
      correctPredictions: weatherPredictionGame.correctPredictions,
      startedAt: nowSec()
    });
  };

  const makePrediction = (predictedWeather) => {
    if (!weatherPredictionGame.active) return;
    
    // Find matching pattern
    const matchingPattern = WEATHER_PATTERNS.find(p => 
      p.pattern.every((weather, index) => 
        index < weatherPredictionGame.currentPattern.length && 
        weatherPredictionGame.currentPattern[index] === weather
      )
    );
    
    const isCorrect = matchingPattern && matchingPattern.nextWeather === predictedWeather;
    const accuracy = isCorrect ? 1.0 : 0.0;
    
    // Update game state
    setWeatherPredictionGame(prev => ({
      ...prev,
      active: false,
      accuracy,
      streak: isCorrect ? prev.streak + 1 : 0,
      totalPredictions: prev.totalPredictions + 1,
      correctPredictions: prev.correctPredictions + (isCorrect ? 1 : 0)
    }));
    
    // Give rewards based on accuracy and streak
    let rewardLevel = "poor";
    if (accuracy >= 1.0) rewardLevel = "perfect";
    else if (accuracy >= 0.8) rewardLevel = "good";
    else if (accuracy >= 0.6) rewardLevel = "okay";
    
    const reward = WEATHER_PREDICTION_REWARDS[rewardLevel];
    const streakBonus = Math.floor(weatherPredictionGame.streak / 3) * 10; // Bonus every 3 streak
    
    setCoins(c => c + reward.coins + streakBonus);
    setWeatherPredictionRewards(prev => prev + reward.coins + streakBonus);
    
    const message = isCorrect 
      ? `🎯 Correct prediction! +${reward.coins + streakBonus}🪙 (Streak: ${weatherPredictionGame.streak + 1})`
      : `❌ Wrong prediction. Streak reset.`;
    
    addNotification(message, isCorrect ? "success" : "error");
    
    // Update challenge progress
    if (isCorrect) {
      updateChallengeProgress("weather_warrior", { weatherSurvived: 1 });
    }
  };

  // 🐕 FARM PETS FUNCTIONS
  const adoptPet = (petType) => {
    const pet = PET_TYPES[petType];
    if (!pet) return;
    
    if (coins < pet.cost) {
      addNotification(`Need ${pet.cost}🪙 to adopt a ${pet.name}!`, "error");
      return;
    }
    
    // Check if already have this pet type
    if (farmPets.some(p => p.type === petType)) {
      addNotification(`You already have a ${pet.name}!`, "error");
      return;
    }
    
    setCoins(prev => prev - pet.cost);
    
    const newPet = {
      id: Date.now(),
      type: petType,
      name: `${pet.name}`,
      level: 1,
      happiness: 100,
      hunger: 0,
      playfulness: 100,
      health: 100,
      adoptedAt: nowSec(),
      lastFed: nowSec(),
      lastPlayed: nowSec(),
      lastVetVisit: nowSec()
    };
    
    setFarmPets(prev => [...prev, newPet]);
    setPetHappiness(prev => ({ ...prev, [newPet.id]: 100 }));
    setLastPetCare(prev => ({ ...prev, [newPet.id]: nowSec() }));
    
    addNotification(`🎉 Welcome your new ${pet.name}! ${pet.emoji}`, "success");
    addLog(`🐾 Adopted a ${pet.name}!`);
  };

  const carePet = (petId, careType) => {
    const pet = farmPets.find(p => p.id === petId);
    const petType = PET_TYPES[pet?.type];
    if (!pet || !petType) return;
    
    const need = petType.needs[careType];
    if (!need) return;
    
    // Check if we have supplies
    if ((petSupplies[need.type] || 0) < need.consumption) {
      addNotification(`Need ${need.consumption} ${need.type} to care for ${pet.name}!`, "error");
      return;
    }
    
    // Consume supplies
    setPetSupplies(prev => ({
      ...prev,
      [need.type]: prev[need.type] - need.consumption
    }));
    
    // Update pet status
    setFarmPets(prev => prev.map(p => {
      if (p.id === petId) {
        const updated = { ...p };
        if (careType === 'food') {
          updated.hunger = Math.max(0, updated.hunger - 50);
          updated.lastFed = nowSec();
        } else if (careType === 'play') {
          updated.playfulness = Math.min(100, updated.playfulness + 30);
          updated.lastPlayed = nowSec();
        } else if (careType === 'health') {
          updated.health = Math.min(100, updated.health + 25);
          updated.lastVetVisit = nowSec();
        }
        updated.happiness = Math.min(100, (updated.health + updated.playfulness + (100 - updated.hunger)) / 3);
        return updated;
      }
      return p;
    }));
    
    setPetHappiness(prev => ({ ...prev, [petId]: pet.happiness }));
    addNotification(`${pet.name} feels better! ${petType.emoji}`, "success");
  };

  const updatePetNeeds = () => {
    const now = nowSec();
    
    setFarmPets(prev => prev.map(pet => {
      const petType = PET_TYPES[pet.type];
      if (!petType) return pet;
      
      const updated = { ...pet };
      
      // Update hunger
      const timeSinceFood = now - pet.lastFed;
      const foodInterval = petType.needs.food.interval;
      if (timeSinceFood >= foodInterval) {
        updated.hunger = Math.min(100, updated.hunger + 20);
      }
      
      // Update playfulness
      const timeSincePlay = now - pet.lastPlayed;
      const playInterval = petType.needs.play.interval;
      if (timeSincePlay >= playInterval) {
        updated.playfulness = Math.max(0, updated.playfulness - 15);
      }
      
      // Update health (slow decay)
      const timeSinceVet = now - pet.lastVetVisit;
      if (timeSinceVet >= 86400) { // Daily health decay
        updated.health = Math.max(0, updated.health - 5);
      }
      
      // Calculate overall happiness
      updated.happiness = Math.min(100, (updated.health + updated.playfulness + (100 - updated.hunger)) / 3);
      
      return updated;
    }));
  };

  // PRESTIGE SYSTEM FUNCTIONS
  const checkPrestigeEligibility = () => {
    const nextPrestige = findPrestigeLevel(prestigeLevel + 1);
    return nextPrestige && totalLifetimeCoins >= nextPrestige.requirement;
  };

  const performPrestige = () => {
    if (!checkPrestigeEligibility()) return false;
    
    const nextPrestige = findPrestigeLevel(prestigeLevel + 1);
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
    const baseMultiplier = findPrestigeLevel(prestigeLevel)?.multiplier || 1.0;
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
    notifyEntityAction("Skill upgraded:", skill, "");
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

  const startFacilityProcessing = (facilityId, inputType, quantity) => {
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

  // 🔄 ENHANCED AUTO-ACTIONS SYSTEM
  const executeAutoActions = () => {
    if (!autoActionSettings.enabled || (!autoActionSettings.harvest && !autoActionSettings.water && !autoActionSettings.plant && !autoActionSettings.fertilize)) {
      return; // Auto actions disabled or no actions enabled
    }

    const now = nowSec();
    if (now - lastAutoActionTime < autoActionSettings.scheduling.actionInterval / 1000) {
      return; // Too soon for next action
    }

    if (autoActionSettings.scheduling.pauseWhenLowCoins && coins < autoActionSettings.conditions.minCoinsForPlanting) {
      return; // Paused due to low coins
    }

    const actions = [];
    
    // Priority 1: Auto Harvest (highest priority)
    if (autoActionSettings.harvest) {
      plots.forEach((plot, index) => {
        if (plot.state === "grown") {
          actions.push({ type: "harvest", plotIndex: index, priority: 1 });
        }
      });
    }

    // Priority 2: Auto Water
    if (autoActionSettings.water) {
      plots.forEach((plot, index) => {
        if ((plot.state === "planted" || plot.state === "growing") && 
            (!plot.watered || (now - (plot.lastWateredAt || 0)) > 120)) {
          actions.push({ type: "water", plotIndex: index, priority: 2 });
        }
      });
    }

    // Priority 3: Auto Fertilize
    if (autoActionSettings.fertilize && (inventory.fertilizer || 0) > 0) {
      plots.forEach((plot, index) => {
        if ((plot.state === "planted" || plot.state === "growing") && 
            plot.fertilized === 0) {
          actions.push({ type: "fertilize", plotIndex: index, priority: 3 });
        }
      });
    }

    // Priority 4: Auto Plant
    if (autoActionSettings.plant) {
      const availablePlots = plots.filter(p => p.state === "empty").length;
      const autoPlantLimit = Math.min(availablePlots, autoActionSettings.conditions.maxPlotsToAutoPlant);
      let planted = 0;

      plots.forEach((plot, index) => {
        if (plot.state === "empty" && planted < autoPlantLimit) {
          // Smart crop selection based on preferences and rotation
          const preferredCrop = getSmartCropChoice(plot, index);
          if (preferredCrop && (inventory[preferredCrop] || 0) > 0) {
            actions.push({ type: "plant", plotIndex: index, priority: 4, crop: preferredCrop });
            planted++;
          }
        }
      });
    }

    // Priority 5: Auto Pest Control
    if (autoActionSettings.conditions.autoPestControlEnabled && (inventory.pesticide || 0) > 0) {
      plots.forEach((plot, index) => {
        if (plot.infested) {
          actions.push({ type: "pesticide", plotIndex: index, priority: 5 });
        }
      });
    }

    // Sort by priority and execute limited actions
    actions.sort((a, b) => a.priority - b.priority);
    const actionsToExecute = actions.slice(0, autoActionSettings.scheduling.maxActionsPerInterval);

    actionsToExecute.forEach(action => {
      switch (action.type) {
        case "harvest":
          harvest(action.plotIndex);
          break;
        case "water":
          water(action.plotIndex);
          break;
        case "fertilize":
          fertilize(action.plotIndex);
          break;
        case "plant":
          plant(action.plotIndex, action.crop);
          break;
        case "pesticide":
          pesticide(action.plotIndex);
          break;
      }
    });

    if (actionsToExecute.length > 0) {
      setLastAutoActionTime(now);
      updateAnalytics("autoActions", actionsToExecute.length);
    }
  };

  const getSmartCropChoice = (plot, plotIndex) => {
    const { preferredCrops } = autoActionSettings.conditions;
    
    // Smart crop rotation logic
    if (autoActionSettings.conditions.smartCropRotation && plot.lastCropFamily) {
      const rotationBonus = CROP_ROTATION[plot.lastCropFamily];
      if (rotationBonus) {
        // Find a crop from the beneficial families
        for (const family of rotationBonus.next) {
          const cropInFamily = preferredCrops.find(crop => 
            rules.seeds[crop] && rules.seeds[crop].family === family && (inventory[crop] || 0) > 0
          );
          if (cropInFamily) return cropInFamily;
        }
      }
    }

    // Default to preferred crops that are available
    return preferredCrops.find(crop => (inventory[crop] || 0) > 0) || preferredCrops[0];
  };

  // 📊 ENHANCED ANALYTICS SYSTEM
  const updateAnalytics = (action, value = 1) => {
    const now = nowSec();
    setAnalyticsData(prev => {
      const newData = { ...prev };
      
      // Update efficiency metrics
      switch (action) {
        case "water":
          newData.efficiency.waterUsage += value;
          break;
        case "fertilize":
          newData.efficiency.fertilizerUsage += value;
          break;
        case "plant":
          newData.efficiency.seedSuccess += value;
          break;
        case "harvest":
          const timeToHarvest = value; // passed as time value
          newData.efficiency.timeToHarvest = 
            (newData.efficiency.timeToHarvest * 0.9) + (timeToHarvest * 0.1); // Moving average
          break;
      }

      // Update performance tracking
      if (!newData.cropPerformance[action]) {
        newData.cropPerformance[action] = { count: 0, total: 0 };
      }
      newData.cropPerformance[action].count += 1;
      newData.cropPerformance[action].total += value;

      // Update trends (keep last 100 data points)
      const minute = Math.floor(now / 60);
      if (action === "coinsEarned") {
        newData.trends.coinsPerMinute.push({ time: minute, value });
        if (newData.trends.coinsPerMinute.length > 100) {
          newData.trends.coinsPerMinute.shift();
        }
      }
      
      if (action === "harvest") {
        newData.trends.harvestsPerMinute.push({ time: minute, value });
        if (newData.trends.harvestsPerMinute.length > 100) {
          newData.trends.harvestsPerMinute.shift();
        }
      }

      return newData;
    });
  };

  const generateAnalyticsReport = () => {
    const { efficiency, trends, cropPerformance } = analyticsData;
    const plantedPlots = plots.filter(p => p.state !== "empty").length;
    const totalPlots = plots.length;
    const utilization = totalPlots > 0 ? (plantedPlots / totalPlots) * 100 : 0;

    const coinsPerMinute = trends.coinsPerMinute.length > 0 
      ? trends.coinsPerMinute.slice(-10).reduce((sum, p) => sum + p.value, 0) / Math.min(10, trends.coinsPerMinute.length)
      : 0;

    const harvestsPerMinute = trends.harvestsPerMinute.length > 0
      ? trends.harvestsPerMinute.slice(-10).reduce((sum, p) => sum + p.value, 0) / Math.min(10, trends.harvestsPerMinute.length)
      : 0;

    return {
      utilization: Math.round(utilization * 100) / 100,
      coinsPerMinute: Math.round(coinsPerMinute * 100) / 100,
      harvestsPerMinute: Math.round(harvestsPerMinute * 100) / 100,
      efficiency: {
        waterEfficiency: efficiency.waterUsage > 0 ? Math.round((efficiency.seedSuccess / efficiency.waterUsage) * 100) / 100 : 0,
        fertilizerEfficiency: efficiency.fertilizerUsage > 0 ? Math.round((efficiency.seedSuccess / efficiency.fertilizerUsage) * 100) / 100 : 0,
        avgTimeToHarvest: Math.round(efficiency.timeToHarvest * 100) / 100
      },
      topPerformers: Object.entries(cropPerformance)
        .sort(([,a], [,b]) => (b.total / b.count) - (a.total / a.count))
        .slice(0, 3)
        .map(([crop, data]) => ({
          crop,
          avgValue: Math.round((data.total / data.count) * 100) / 100,
          count: data.count
        }))
    };
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

  // SMART FARM ASSISTANT FUNCTIONS
  const generateSmartRecommendations = () => {
    const recommendations = [];
    const now = nowSec();
    
    // Market opportunity analysis
    const bestMarketCrop = Object.entries(marketPrices || {})
      .sort(([,a], [,b]) => b - a)[0];
    if (bestMarketCrop && bestMarketCrop[1] > (rules.seeds[bestMarketCrop[0]]?.baseValue || 0) * 1.2) {
      recommendations.push({
        id: 'market_opportunity',
        type: 'profit',
        title: `Market Opportunity: ${bestMarketCrop[0]}`,
        description: `${bestMarketCrop[0]} prices are 20%+ above normal. Consider planting more!`,
        action: () => setSelectedSeed(bestMarketCrop[0]),
        priority: 'high',
        icon: '📈'
      });
    }

    // Resource management
    if ((inventory.fertilizer || 0) < 2) {
      recommendations.push({
        id: 'low_fertilizer',
        type: 'resource',
        title: 'Low Fertilizer Stock',
        description: 'Buy fertilizer to boost crop growth speed by 50%',
        action: () => buy('fertilizer', 3),
        priority: 'medium',
        icon: '⚡'
      });
    }

    // Worker suggestions
    if (!workers.find(w => w.type === 'harvester') && plots.filter(p => p.state === 'grown').length > 3) {
      recommendations.push({
        id: 'hire_harvester',
        type: 'automation',
        title: 'Consider Hiring Harvester',
        description: 'You have many ready crops. A harvester can auto-harvest for you!',
        action: () => hireWorker('harvester'),
        priority: 'high',
        icon: '🚜'
      });
    }

    // Skill upgrade suggestions
    if (skillPoints >= 5 && !skillLevels.green_thumb) {
      recommendations.push({
        id: 'upgrade_green_thumb',
        type: 'progression',
        title: 'Upgrade Green Thumb Skill',
        description: 'Increase crop growth speed permanently',
        action: () => upgradeSkill('farming', 'green_thumb'),
        priority: 'medium',
        icon: '📚'
      });
    }

    // Weather-based advice
    if (weather.type === 'Drought' && (inventory.wateringCan || 0) < 3) {
      recommendations.push({
        id: 'drought_preparation',
        type: 'weather',
        title: 'Drought Warning',
        description: 'Stock up on watering cans during drought season',
        action: () => buy('wateringCan', 5),
        priority: 'high',
        icon: '🏜️'
      });
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  };

  const updateFarmInsights = () => {
    const insights = {
      profitTrends: [],
      cropPerformance: {},
      seasonalAdvice: {},
      marketOpportunities: []
    };

    // Calculate crop performance
    Object.keys(rules.seeds).forEach(cropType => {
      const plantedCount = plots.filter(p => p.seedType === cropType).length;
      const harvestedCount = farmStatistics.plotsHarvested || 0;
      const avgValue = marketPrices[cropType] || rules.seeds[cropType].baseValue;
      
      insights.cropPerformance[cropType] = {
        popularity: plantedCount,
        profitability: avgValue,
        efficiency: harvestedCount > 0 ? (avgValue / harvestedCount) : 0
      };
    });

    // Seasonal advice
    const seasonBonus = SEASON_EFFECTS[currentSeason] || {};
    insights.seasonalAdvice[currentSeason] = {
      recommendedCrops: Object.entries(seasonBonus).filter(([, bonus]) => bonus > 1).map(([crop]) => crop),
      warning: seasonBonus.growth_penalty ? 'Growth is slower this season' : null
    };

    setFarmInsights(insights);
  };

  // ADVANCED CROP ROTATION FUNCTIONS
  const getCropFamily = (cropType) => {
    for (const [family, data] of Object.entries(CROP_FAMILIES)) {
      if (data.crops.includes(cropType)) return family;
    }
    return null;
  };

  const calculateRotationBonus = (plotIndex, newCropType) => {
    const plotId = `plot_${plotIndex}`;
    const history = plotHistory[plotId] || [];
    const newFamily = getCropFamily(newCropType);
    
    if (!newFamily || history.length === 0) return 1.0;

    // Check last crop for rotation benefit
    const lastCrop = history[history.length - 1];
    const lastFamily = getCropFamily(lastCrop.cropType);
    
    if (lastFamily && lastFamily !== newFamily) {
      const benefit = CROP_FAMILIES[lastFamily].benefit;
      const bonus = ROTATION_BENEFITS[benefit];
      if (bonus) {
        return bonus.bonus;
      }
    }
    
    return 1.0;
  };

  const calculateCompanionBonus = (plotIndex, cropType) => {
    const adjacentPlots = getAdjacentPlots(plotIndex);
    let totalBonus = 1.0;
    
    adjacentPlots.forEach(adjIndex => {
      const adjPlot = plots[adjIndex];
      if (adjPlot && (adjPlot.state === 'planted' || adjPlot.state === 'growing') && adjPlot.seedType) {
        const companions = COMPANION_PLANTS[cropType];
        if (companions) {
          if (companions.good.includes(adjPlot.seedType)) {
            totalBonus += 0.15; // 15% bonus per good companion
          } else if (companions.bad.includes(adjPlot.seedType)) {
            totalBonus -= 0.10; // 10% penalty per bad companion
          }
        }
      }
    });
    
    return Math.max(0.5, totalBonus); // Minimum 50% growth
  };

  const getAdjacentPlots = (plotIndex) => {
    const size = gridSize;
    const row = Math.floor(plotIndex / size);
    const col = plotIndex % size;
    const adjacent = [];
    
    // Check all 4 directions
    if (row > 0) adjacent.push((row - 1) * size + col); // Up
    if (row < size - 1) adjacent.push((row + 1) * size + col); // Down
    if (col > 0) adjacent.push(row * size + (col - 1)); // Left
    if (col < size - 1) adjacent.push(row * size + (col + 1)); // Right
    
    return adjacent.filter(i => i >= 0 && i < plots.length);
  };

  const updatePlotHistory = (plotIndex, cropType, action) => {
    const plotId = `plot_${plotIndex}`;
    const entry = {
      cropType,
      action, // 'planted', 'harvested', 'withered'
      timestamp: nowSec(),
      season: currentSeason
    };
    
    setPlotHistory(prev => ({
      ...prev,
      [plotId]: [...(prev[plotId] || []), entry].slice(-5) // Keep last 5 entries
    }));
  };

  const getRotationAdvice = (plotIndex) => {
    const plotId = `plot_${plotIndex}`;
    const history = plotHistory[plotId] || [];
    
    if (history.length === 0) {
      return "🌱 Fresh soil! Any crop will thrive here.";
    }
    
    const lastCrop = history[history.length - 1];
    const lastFamily = getCropFamily(lastCrop.cropType);
    
    if (!lastFamily) return "🌱 Plant any crop you like!";
    
    // Suggest different family for rotation
    const recommendedFamilies = Object.keys(CROP_FAMILIES).filter(f => f !== lastFamily);
    const suggestion = recommendedFamilies[0];
    const benefit = CROP_FAMILIES[lastFamily].benefit;
    const bonus = ROTATION_BENEFITS[benefit];
    
    return `🔄 Last: ${CROP_FAMILIES[lastFamily].emoji} ${lastFamily}. Try ${CROP_FAMILIES[suggestion].emoji} ${suggestion} for ${bonus ? `+${Math.round((bonus.bonus - 1) * 100)}%` : 'rotation'} bonus!`;
  };

  // TUTORIAL & ONBOARDING SYSTEM
  const TUTORIAL_STEPS = [
    {
      id: 'welcome',
      title: '🌱 Welcome to Farm Simulator!',
      content: 'Welcome to your new farm! This enhanced farming game has visual animations, mobile support, auto-actions, and detailed analytics. Let\'s start with the basics.',
      highlight: null,
      action: null
    },
    {
      id: 'plant_first_seed',
      title: '🌰 Plant Your First Seed',
      content: 'You start with some carrot seeds! Click on any empty plot (brown squares) to plant a carrot. Watch for the smooth planting animation!',
      highlight: 'plot',
      action: 'plant'
    },
    {
      id: 'observe_growth',
      title: '⏱️ Watch Plants Grow',
      content: 'Perfect! Notice the subtle growing animation and visual effects. Your plants will grow automatically over time with beautiful transitions.',
      highlight: 'growing-plot',
      action: 'observe_growth'
    },
    {
      id: 'water_plants',
      title: '💧 Water Your Plants',
      content: 'Right-click your growing plant to water it. You\'ll see a water splash animation!',
      highlight: 'growing-plot',
      action: 'water'
    },
    {
      id: 'harvest_crop',
      title: '🥕 Harvest Time!',
      content: 'Wait for your carrot to finish growing, then click it to harvest! Watch for the satisfying harvest pop animation and coin bounce. If it\'s not ready yet, be patient - good farming takes time!',
      highlight: 'grown-plot',
      action: 'harvest'
    },
    {
      id: 'explore_shop',
      title: '🛒 Explore the Enhanced Shop',
      content: 'Great harvest! Now use your coins to buy something from the shop. Try buying more seeds or tools to expand your farm.',
      highlight: 'shop',
      action: 'buy'
    },
    {
      id: 'discover_analytics',
      title: '📊 Farm Analytics',
      content: 'Click the "Analytics" tab to see your detailed farm performance metrics, efficiency tracking, and smart recommendations!',
      highlight: 'analytics-tab',
      action: 'viewAnalytics'
    },
    {
      id: 'auto_actions_intro',
      title: '🔄 Auto-Actions System',
      content: 'Now click the "Settings" tab and enable "Auto-Actions"! This powerful system can automatically harvest, plant, water, and fertilize for you.',
      highlight: 'settings-tab',
      action: 'enableAutoActions'
    },
    {
      id: 'animation_controls',
      title: '🎨 Animation Controls',
      content: 'In Settings, you can control animations. Toggle them off if you prefer a static experience, or enjoy the visual polish!',
      highlight: 'animation-settings',
      action: null
    },
    {
      id: 'mobile_features',
      title: '� Mobile-Friendly',
      content: 'This farm works great on mobile! Resize your window to see responsive design and touch-friendly controls.',
      highlight: null,
      action: null
    },
    {
      id: 'advanced_features',
      title: '🚀 Master Farmer',
      content: 'You\'ve learned the enhanced features! Explore Skills, Workers, Research, and use the Analytics dashboard to optimize your farm.',
      highlight: 'tabs',
      action: null
    },
    {
      id: 'tutorial_complete',
      title: '🎉 Tutorial Complete!',
      content: 'Congratulations! You\'re now ready to build the most efficient farm with all the quality-of-life improvements. Happy farming!',
      highlight: null,
      action: null
    }
  ];

  const getCurrentTutorialStep = () => {
    if (!tutorialActive || tutorialCompleted) return null;
    return TUTORIAL_STEPS[tutorialStep] || null;
  };

  const advanceTutorial = () => {
    if (!tutorialActive || tutorialCompleted) return;
    
    const nextStep = tutorialStep + 1;
    if (nextStep >= TUTORIAL_STEPS.length) {
      setTutorialCompleted(true);
      setTutorialActive(false);
      addNotification('🎉 Tutorial completed! You\'re ready to farm independently!', 'success');
      // Bonus for completing tutorial
      setCoins(prev => prev + 50);
      setSkillPoints(prev => prev + 3);
    } else {
      setTutorialStep(nextStep);
    }
  };

  const skipTutorial = () => {
    setTutorialCompleted(true);
    setTutorialActive(false);
    addNotification('Tutorial skipped. You can replay it in Settings.', 'info');
  };

  const restartTutorial = () => {
    setTutorialStep(0);
    setTutorialCompleted(false);
    setTutorialActive(true);
    setTutorialProgress({});
    addNotification('Tutorial restarted!', 'info');
  };

  const checkTutorialProgress = (action, data = {}) => {
    if (!tutorialActive || tutorialCompleted) return;
    
    const currentStep = getCurrentTutorialStep();
    if (!currentStep || currentStep.action !== action) return;
    
    // Record progress and advance if conditions met
    switch (action) {
      case 'plant':
        if (plots.some(p => p.state === 'planted' || p.state === 'growing')) {
          advanceTutorial();
        }
        break;
      case 'observe_growth':
        // Auto-advance after player plants and we can show growth
        if (plots.some(p => p.state === 'planted' || p.state === 'growing')) {
          setTimeout(() => {
            if (tutorialActive && getCurrentTutorialStep()?.action === 'observe_growth') {
              advanceTutorial();
            }
          }, 4000); // Give time to observe the growth animation
        }
        break;
      case 'water':
        if (plots.some(p => p.watered)) {
          advanceTutorial();
        }
        break;
      case 'harvest':
        if (totalHarvests > 0) {
          advanceTutorial();
        }
        break;
      case 'buy':
        if (data.item) {
          advanceTutorial();
        }
        break;
      case 'viewAnalytics':
        if (data.tab === 'analytics') {
          advanceTutorial();
        }
        break;
      case 'enableAutoActions':
        if (autoActionSettings.enabled || data.setting === 'enabled') {
          advanceTutorial();
        }
        break;
      case 'accessSettings':
        if (data.tab === 'settings') {
          advanceTutorial();
        }
        break;
      case 'wait':
        // Auto-advance wait steps after a short delay
        setTimeout(() => {
          if (tutorialActive && getCurrentTutorialStep()?.action === 'wait') {
            advanceTutorial();
          }
        }, 3000);
        break;
    }
  };

  const showContextualHint = (context) => {
    if (!hintsEnabled || nowSec() - lastHintShown < 30) return; // Rate limit hints
    
    const hints = {
      low_coins: "💡 Tip: Harvest your crops to earn more coins!",
      many_grown: "💡 Tip: You have many ready crops. Consider hiring a Harvester worker to auto-harvest!",
      weather_drought: "💡 Tip: During drought, your crops need extra watering to grow properly.",
      pest_infestation: "💡 Tip: Use pesticide to eliminate pest infestations quickly.",
      skill_points: "💡 Tip: You have skill points! Visit the Skills tab to unlock permanent bonuses.",
      research_available: "💡 Tip: You can start a research project to unlock new features!",
      prestige_ready: "💡 Tip: You're eligible for prestige! This will reset your farm but give permanent bonuses."
    };
    
    if (hints[context]) {
      addNotification(hints[context], 'info');
      setLastHintShown(nowSec());
    }
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

      // 🔄 EXECUTE AUTO-ACTIONS
      executeAutoActions();

      // 📊 UPDATE ANALYTICS (every 10 seconds)
      if (currentTime % 10 === 0) {
        const plotsUsed = plots.filter(p => p.state !== "empty").length;
        updateAnalytics("plotUtilization", plotsUsed / Math.max(1, plots.length));
        setLastAnalyticsUpdate(nowSec());
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

  // Economic events now handled in master game loop

  // 🎉 OPTIMIZED GAME LOOP - Consolidated all intervals into one efficient loop
  useEffect(() => {
    let lastSeasonalCheck = 0;
    let lastChallengeCheck = 0;
    let lastBreedingCheck = 0;
    let lastPetCheck = 0;
    let lastEconomicCheck = 0;
    
    // Initialize daily challenges if empty
    if (dailyChallenges.length === 0) {
      const newChallenges = Array(3).fill().map(() => generateDailyChallenge());
      setDailyChallenges(newChallenges);
    }
    
    // 🚀 OPTIMIZED MASTER GAME LOOP - Adaptive frequency based on performance mode
    const loopInterval = performanceMode ? 10000 : 5000; // Slower on performance mode
    const masterGameLoop = setInterval(() => {
      const now = Date.now();
      
      // Seasonal Events (every 30 seconds)
      if (now - lastSeasonalCheck >= 30000) {
        checkSeasonalEvents();
        lastSeasonalCheck = now;
      }
      
      // Daily Challenges (every 60 seconds)
      if (now - lastChallengeCheck >= 60000) {
        checkDailyChallenges();
        lastChallengeCheck = now;
      }
      
      // Breeding Completion (every 10 seconds)
      if (now - lastBreedingCheck >= 10000) {
        checkBreedingCompletion();
        lastBreedingCheck = now;
      }
      
      // Pet Care (every 30 seconds)
      if (now - lastPetCheck >= 30000) {
        updatePetNeeds();
        lastPetCheck = now;
      }
      
      // Economic Events (every 5 minutes)
      if (now - lastEconomicCheck >= 300000) {
        if (Math.random() < 0.1) {
          triggerEconomicEvent();
        }
        lastEconomicCheck = now;
      }
      
    }, loopInterval); // Adaptive interval based on performance mode
    
    return () => clearInterval(masterGameLoop);
  }, []); // Only run once

  // Pet bonuses application
  useEffect(() => {
    farmPets.forEach(pet => {
      const petType = PET_TYPES[pet.type];
      if (!petType || pet.happiness < 50) return; // Only happy pets give bonuses
      
      // Apply pet bonuses to crops
      if (petType.bonuses.pest_prevention && Math.random() < petType.bonuses.pest_prevention) {
        // Prevent pests on random plots
        const pestPlots = plots.filter(p => p.pest);
        if (pestPlots.length > 0) {
          const randomPlot = pestPlots[Math.floor(Math.random() * pestPlots.length)];
          setPlots(prev => prev.map(p => 
            p.id === randomPlot.id ? { ...p, pest: false } : p
          ));
          addNotification(`${pet.name} scared away pests! ${petType.emoji}`, "success");
        }
      }
    });
  }, [farmPets, plots]);

  // 📱 MOBILE OPTIMIZATION - Enhanced mobile detection and performance
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let resizeTimeout;
    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
          
          // Auto-enable performance mode on mobile
          if (newIsMobile && !performanceMode) {
            setPerformanceMode(true);
            addNotification('📱 Performance mode enabled for mobile', 'info');
          }
        }
      }, 100);
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile, performanceMode]);

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

  // SMART ASSISTANT useEffects
  useEffect(() => {
    if (!assistantEnabled) return;
    
    // Update recommendations every 2 minutes
    const interval = setInterval(() => {
      const recommendations = generateSmartRecommendations();
      setAssistantRecommendations(recommendations);
      updateFarmInsights();
      setLastRecommendationUpdate(nowSec());
    }, 120000);
    
    // Initial recommendations
    if (nowSec() - lastRecommendationUpdate > 120) {
      const recommendations = generateSmartRecommendations();
      setAssistantRecommendations(recommendations);
      updateFarmInsights();
    }
    
    return () => clearInterval(interval);
  }, [assistantEnabled, coins, inventory, plots, workers, skillPoints, weather]);

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
  const addParticle = (x, y, type, text = "", options = {}) => {
    if (!animationsEnabled || performanceMode) return;
    
    // 🚀 PERFORMANCE: Limit particle count to prevent memory issues
    setParticles(currentParticles => {
      if (currentParticles.length >= 50) return currentParticles; // Max 50 particles
      
      const id = Date.now() + Math.random();
      const particle = { 
        id, x, y, type, text, 
        life: options.life || 2000,
        maxLife: options.life || 2000,
        vx: options.vx || (Math.random() - 0.5) * 100,
        vy: options.vy || (-50 - Math.random() * 50),
        color: options.color || '#22c55e',
        size: options.size || 1,
        rotation: options.rotation || 0,
        rotationSpeed: options.rotationSpeed || 0
      };
      
      // Auto-cleanup with timeout
      setTimeout(() => {
        setParticles(p => p.filter(pt => pt.id !== id));
      }, particle.life);
      
      return [...currentParticles, particle];
    });
  };

  // Harvest sparkle particles
  const addHarvestSparkles = (x, y) => {
    if (!animationsEnabled) return;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      addParticle(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        "sparkle",
        "✨",
        {
          life: 800,
          vx: Math.cos(angle) * 20,
          vy: Math.sin(angle) * 20 - 30,
          color: '#fbbf24',
          rotationSpeed: 5
        }
      );
    }
  };

  // Watering droplet particles
  const addWateringDroplets = (x, y) => {
    if (!animationsEnabled) return;
    for (let i = 0; i < 5; i++) {
      addParticle(
        x + (Math.random() - 0.5) * 40,
        y - 10,
        "droplet",
        "💧",
        {
          life: 600,
          vx: (Math.random() - 0.5) * 20,
          vy: 20 + Math.random() * 30,
          color: '#3b82f6'
        }
      );
    }
  };

  // Fertilizer dust particles
  const addFertilizerDust = (x, y) => {
    if (!animationsEnabled) return;
    for (let i = 0; i < 6; i++) {
      addParticle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        "dust",
        "✨",
        {
          life: 1000,
          vx: (Math.random() - 0.5) * 40,
          vy: -20 - Math.random() * 20,
          color: '#65a30d',
          size: 0.8
        }
      );
    }
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

  // Determine plot visual status for color coding
  const getPlotStatus = (plot) => {
    if (plot.state === "empty" || plot.state === "locked") return "neutral";
    
    // Problem states (red)
    if (plot.infested || plot.disease || plot.growth >= 1 && !plot.watered) {
      return "problem";
    }
    
    // Ready to harvest (green pulsing)
    if (plot.growth >= 1) {
      return "ready";
    }
    
    // Needs attention (yellow)
    if (plot.growth > 0.7 || (plot.growth > 0 && !plot.watered)) {
      return "attention";
    }
    
    // Healthy (green)
    return "healthy";
  };

  // Progress bar for crop growth
  const getGrowthProgress = (plot) => {
    if (plot.state === "empty" || plot.state === "locked") return 0;
    return Math.min(100, plot.growth * 100);
  };

  // Sound effects (placeholder - would use actual audio in production)
  const playSound = (type) => {
    if (!soundEnabled) return;
    // Placeholder for sound effects
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

  // Enhanced keyboard shortcuts with more features
  useEffect(() => {
    const seedKeys = Object.keys(rules.seeds);
    function onKey(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.key === '[' || e.key === '{') {
        e.preventDefault();
        const idx = seedKeys.indexOf(selectedSeed);
        const next = (idx - 1 + seedKeys.length) % seedKeys.length;
        setSelectedSeed(seedKeys[next]);
        addNotification(`Selected: ${seedKeys[next]} 🌱`, 'info', 2000);
      } else if (e.key === ']' || e.key === '}') {
        e.preventDefault();
        const idx = seedKeys.indexOf(selectedSeed);
        const next = (idx + 1) % seedKeys.length;
        setSelectedSeed(seedKeys[next]);
        addNotification(`Selected: ${seedKeys[next]} 🌱`, 'info', 2000);
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
      } else if (e.key.toLowerCase() === 'h') {
        // Harvest all ready crops
        const readyPlots = plots.map((plot, index) => ({ plot, index }))
          .filter(({plot}) => plot.state === "grown");
        if (readyPlots.length > 0) {
          readyPlots.forEach(({index}) => harvest(index));
          addNotification(`🌾 Harvested ${readyPlots.length} crops`, 'success');
        } else {
          addNotification('No crops ready to harvest', 'info', 2000);
        }
      } else if (e.key.toLowerCase() === 'w') {
        // Water all crops that need watering
        const needsWater = plots.map((plot, index) => ({ plot, index }))
          .filter(({plot}) => (plot.state === "planted" || plot.state === "growing") && 
                              (!plot.watered || nowSec() - (plot.lastWateredAt || 0) > 120));
        if (needsWater.length > 0) {
          needsWater.forEach(({index}) => {
            replacePlot(index, (p) => ({
              ...p,
              watered: true,
              lastWateredAt: nowSec(),
              state: p.state === "planted" ? "growing" : p.state
            }));
          });
          addNotification(`💧 Watered ${needsWater.length} crops`, 'success');
        } else {
          addNotification('All crops are watered', 'info', 2000);
        }
      } else if (e.key === '?') {
        // Show help
        addNotification('🎮 Shortcuts: [/] seeds, H harvest all, W water all, S save, P pause, M mute, 1-3 speed', 'info', 8000);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rules.seeds, selectedSeed, soundEnabled, paused, plots, inventory]);

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
      
      if (seedCount <= 0) {
        addNotification(`No ${seed} seeds available! Current: ${seedCount}`, "warning");
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
        return next;
      });
      
      // Tutorial progress tracking
      checkTutorialProgress('plant', { seed, plotIndex: i });
      
      // 🎯 UPDATE CHALLENGE PROGRESS
      const speedChallenge = dailyChallenges.find(c => c.type === "speed_farmer" && !c.completed);
      if (speedChallenge) {
        updateChallengeProgress("speed_farmer", { 
          planted: ((dailyChallengeProgress[speedChallenge.id]?.planted || 0) + 1),
          timeSpent: nowSec() - (lastChallengeReset || nowSec())
        });
      }
      
      // Trigger observe growth tutorial step after a delay
      setTimeout(() => {
        checkTutorialProgress('observe_growth', { seed, plotIndex: i });
      }, 2000);
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
    
    // Tutorial progress tracking
    checkTutorialProgress('water', { plotIndex: i });
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
      
      // 🎯 UPDATE CHALLENGE PROGRESS
      const pestChallenge = dailyChallenges.find(c => c.type === "pest_hunter" && !c.completed);
      if (pestChallenge) {
        updateChallengeProgress("pest_hunter", { 
          pestsKilled: ((dailyChallengeProgress[pestChallenge.id]?.pestsKilled || 0) + 1)
        });
      }
      
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

      // 🎯 UPDATE CHALLENGE PROGRESS
      const harvestChallenge = dailyChallenges.find(c => c.type === "harvest_master" && !c.completed);
      if (harvestChallenge) {
        updateChallengeProgress("harvest_master", { harvests: ((dailyChallengeProgress[harvestChallenge.id]?.harvests || 0) + 1) });
      }
      
      const coinChallenge = dailyChallenges.find(c => c.type === "coin_collector" && !c.completed);
      if (coinChallenge) {
        updateChallengeProgress("coin_collector", { coinsEarned: ((dailyChallengeProgress[coinChallenge.id]?.coinsEarned || 0) + val) });
      }

      // 📊 ANALYTICS: Track harvest performance
      updateAnalytics("coinsEarned", val);
      updateAnalytics("harvest", 1);
      updateAnalytics("timeToHarvest", nowSec() - (p.plantedAt || nowSec()));
      
      // Track crop performance
      if (!analyticsData.cropPerformance[p.seed]) {
        setAnalyticsData(prev => ({
          ...prev,
          cropPerformance: {
            ...prev.cropPerformance,
            [p.seed]: { totalValue: val, count: 1, avgValue: val }
          }
        }));
      } else {
        setAnalyticsData(prev => {
          const existing = prev.cropPerformance[p.seed];
          const newCount = existing.count + 1;
          const newTotal = existing.totalValue + val;
          return {
            ...prev,
            cropPerformance: {
              ...prev.cropPerformance,
              [p.seed]: { 
                totalValue: newTotal, 
                count: newCount, 
                avgValue: Math.round((newTotal / newCount) * 100) / 100 
              }
            }
          };
        });
      }
      
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
    
    // Tutorial progress tracking
    checkTutorialProgress('harvest', { plotIndex: i });
  }

  // Tutorial-aware tab switching
  function handleShopTabChange(newTab) {
    setShopTab(newTab);
    
    // Track important tab visits for tutorial
    if (newTab === 'analytics') {
      checkTutorialProgress('viewAnalytics', { tab: newTab });
    } else if (newTab === 'settings') {
      checkTutorialProgress('accessSettings', { tab: newTab });
    }
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
      setLivestock(prev => ({
        ...prev,
        [item]: (prev[item] || 0) + 1
      }));
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
    
    // Tutorial progress tracking
    checkTutorialProgress('buy', { item, quantity: qty, price });
    
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
    // Note: This function is currently not used since livestock products 
    // are handled through the new livestock system functions (buyLivestock, feedLivestock, collectProducts)
    // If needed, it should be updated to work with the object-based livestock state
    return;
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
      try {
        if (paused) return;
      // Update particles (skip on mobile in performance mode)
      if (!performanceMode || !isMobile) {
        setParticles(prev => prev.filter(p => p.life > 0).map(p => ({
          ...p,
          life: p.life - 100,
          y: p.y - 2
        })));
      }
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

              // Enhanced level timer with achievement checks and auto-progression
        if (levelId !== "endless" && levelStatus === "playing" && level) {
          setLevelStatus(st => {
            if (coins >= level.targetCoins) {
              const timeUsed = nowSec() - levelStartedAt;
              if (levelId === "lvl1" && timeUsed < 240 && !achievements.includes("speed_farmer")) { // 4 minutes
                checkAchievement("speed_farmer");
              }
              
              // Auto-progress to next level or complete the progression
              const currentLevelIndex = findLevelIndex(levelId);
              const nextLevel = LEVELS[currentLevelIndex + 1];
              
              if (nextLevel && nextLevel.id !== "endless") {
                // Auto-progress to next level
                addNotification(`🎉 Level Complete! Advancing to ${nextLevel.label}...`, "success");
                setTimeout(() => {
                  setCoins(c => c + level.reward);
                  setLevelId(nextLevel.id);
                  setLevelEndsAt(nowSec() + nextLevel.minutes * 60);
                  setLevelStartedAt(nowSec());
                  setLevelStatus("playing");
                  addLog(`🚀 Advanced to ${nextLevel.label}!`);
                }, 1500); // 1.5 second delay for notification
                return "won";
              } else {
                // Completed all levels - offer endless mode
                addNotification(`🎊 All levels complete! You're now a Master Farmer! Switch to Endless Mode to continue.`, "success");
                return "won";
              }
            }
            if (nowSec() >= levelEndsAt) {
              if (coins >= level.targetCoins) {
                // Same auto-progression logic for time-based completion
                const currentLevelIndex = findLevelIndex(levelId);
                const nextLevel = LEVELS[currentLevelIndex + 1];
                
                if (nextLevel && nextLevel.id !== "endless") {
                  addNotification(`🎉 Level Complete! Advancing to ${nextLevel.label}...`, "success");
                  setTimeout(() => {
                    setCoins(c => c + level.reward);
                    setLevelId(nextLevel.id);
                    setLevelEndsAt(nowSec() + nextLevel.minutes * 60);
                    setLevelStartedAt(nowSec());
                    setLevelStatus("playing");
                    addLog(`🚀 Advanced to ${nextLevel.label}!`);
                  }, 1500);
                  return "won";
                } else {
                  addNotification(`🎊 All levels complete! You're now a Master Farmer!`, "success");
                  return "won";
                }
              } else {
                addNotification(`⏰ Time's up! You needed ${level.targetCoins}🪙 but only earned ${coins}🪙`, "warning");
                return "lost";
              }
            }
            return st;
          });
        }
      } catch (error) {
        console.error('[FarmSim] Growth tick error:', error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]); // Only depend on paused to prevent constant re-renders

  // --- Enhanced UI helpers ---
  function WeatherBadge() {
    const weatherEmoji = WEATHER_EFFECTS[weather.type]?.emoji || "☀️";
    const colorClass = WEATHER_EFFECTS[weather.type]?.color || "text-yellow-500";
    const bgClass = WEATHER_EFFECTS[weather.type]?.bg || "bg-yellow-50";
    
    return (
      <div className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full ${bgClass} border-2 border-white/50 backdrop-blur-sm shadow-lg`}>
        <span className="text-lg">{weatherEmoji}</span>
        <span className={`font-semibold ${colorClass}`}>{weather.type}</span>
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
          {seedEntries.slice(0, 4).map(([seed, data]) => {
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

  // 🚀 OPTIMIZED PlotCard with React.memo for performance
  const PlotCard = React.memo(({ p, i }) => {
    // Memoize expensive calculations
    const spec = useMemo(() => p.seed ? rules.seeds[p.seed] : null, [p.seed, rules.seeds]);
    const pct = useMemo(() => spec ? Math.round((p.growth / spec.stages) * 100) : 0, [spec, p.growth]);
    const emoji = spec?.emoji || "🌱";
    const title = p.state === "locked" ? "🔒 Locked" : p.state === "empty" ? "📍 Empty Plot" : p.state === "withered" ? "💀 Withered" : p.seed ? `${emoji} ${p.seed}` : "Plot";
    
    // Memoize visual status calculations
    const status = useMemo(() => getPlotStatus(p), [p]);
    const progress = useMemo(() => getGrowthProgress(p), [p]);
    
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
    
    // 🎨 ENHANCED VISUAL POLISH - Enhanced with new visual effects
    let plotEnhancedClass = "plot-enhanced";
    
    // Status-based classes for visual hierarchy
    const statusClasses = {
      healthy: "status-healthy",
      attention: "status-attention", 
      problem: "status-problem",
      ready: "status-healthy plot-ready",
      neutral: ""
    };
    
    // Only add animation classes if animations are enabled
    const useAnimations = animationsEnabled && !performanceMode;
    
    if (p.state === "locked") {
      bgClass = "bg-slate-100/70";
      borderClass = "border-slate-300";
      textClass = "text-slate-500";
    } else if (p.state === "empty") {
      bgClass = "bg-gradient-to-br from-green-50/70 to-emerald-50/70";
      borderClass = "border-emerald-200";
    } else if (p.state === "planted") {
      bgClass = "bg-green-50/80";
      borderClass = "border-green-200";
      textClass = "text-green-800";
      if (useAnimations) plotEnhancedClass += " planted";
    } else if (p.state === "growing") {
      bgClass = "bg-blue-50/80";
      borderClass = "border-blue-200";
      textClass = "text-blue-800";
      if (useAnimations) plotEnhancedClass += " growing";
    } else if (p.state === "grown") {
      bgClass = "bg-gradient-to-br from-emerald-100/80 to-green-100/80";
      borderClass = "border-emerald-300";
      textClass = "text-emerald-800";
      if (useAnimations) plotEnhancedClass += " ready";
    } else if (p.state === "withered") {
      bgClass = "bg-red-50/80";
      borderClass = "border-red-300";
      textClass = "text-red-800";
    }
    
    // Add state-based classes for enhanced animations (only if animations enabled)
    if (useAnimations) {
      if (p.disease) plotEnhancedClass += " diseased";
      if (p.infested) plotEnhancedClass += " infested";
      if (p.watered && p.state !== "grown") plotEnhancedClass += " watered";
      if (p.fertilized > 0) plotEnhancedClass += " fertilized";
      if (p.beePollinated) plotEnhancedClass += " bee-pollinated";
    }

    // Enhanced click handlers with particle effects and mobile support
    function leftPointerDown(e) {
      try { 
        e?.preventDefault?.(); 
        e?.stopPropagation?.(); 
        // Prevent double-tap zoom on mobile
        if (e?.touches?.length > 1) return;
      } catch {}
      
      // Calculate plot position for particles
      const plotX = (i % gridSize) * 80 + 40;
      const plotY = Math.floor(i / gridSize) * 80 + 40;
      
      if (p.state === "locked") return;
      
      if (p.state === "grown") {
        // Add harvest sparkles before harvesting
        if (useAnimations) addHarvestSparkles(plotX, plotY);
        return harvest(i);
      }
      
      if (p.state === "withered") return clearPlot(i);
      
      if (p.state === "empty") return plant(i, selectedSeed);
      
      // Water action with droplet particles
      if (!p.watered && useAnimations) {
        addWateringDroplets(plotX, plotY);
      }
      return water(i);
    }
    
    function rightClick(e) {
      e.preventDefault();
      
      // Calculate plot position for particles
      const plotX = (i % gridSize) * 80 + 40;
      const plotY = Math.floor(i / gridSize) * 80 + 40;
      
      if (p.state === "locked") return;
      
      if (p.infested) return spray(i);
      if (p.disease) return cureDisease(i);
      
      // Fertilize with dust particles
      if (useAnimations) addFertilizerDust(plotX, plotY);
      return fertilize(i);
    }

    return (
      <div
        onPointerDown={leftPointerDown}
        onContextMenu={rightClick}
        className={`${plotEnhancedClass} ${statusClasses[status] || ""} group relative rounded-2xl border-2 ${borderClass} ${bgClass} backdrop-blur-sm cursor-pointer select-none hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-4 mobile-friendly-button`}
        style={{ 
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent', // Remove mobile tap highlight
          userSelect: 'none' // Prevent text selection on mobile
        }}
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
        
        {/* Disease indicator */}
        {p.disease && (
          <div className="absolute -top-2 left-6 bg-red-400 border-2 border-red-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-xs text-white">{CROP_DISEASES[p.disease].emoji}</span>
          </div>
        )}
        
        {/* Bee pollination indicator */}
        {p.beePollinated && (
          <div className="absolute -bottom-2 -left-2 bg-yellow-400 border-2 border-yellow-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <Bug size={12} className="text-yellow-800"/>
          </div>
        )}
        
        {/* Crop rotation indicator */}
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

          {/* Enhanced progress bar for growing crops */}
          {spec && p.state !== "grown" && p.state !== "withered" && (
            <div className="w-full">
              <div className="relative">
                <Progress value={pct} className="h-3" />
                {/* Animated progress indicator for ready crops */}
                {pct >= 95 && useAnimations && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent rounded animate-shimmer"></div>
                )}
              </div>
              <div className="text-xs text-center mt-1 opacity-70">{pct}%{etaInfo ? ` • ${formatTime(etaInfo.nextIn)} to next` : ''}</div>
            </div>
          )}

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
              {p.disease && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <span className="mr-1">{CROP_DISEASES[p.disease].emoji}</span>
                  {CROP_DISEASES[p.disease].name}
                </Badge>
              )}
              {p.beePollinated && (
                <Badge variant="warning" className="text-xs">
                  <Bug size={10} className="mr-1"/>pollinated
                </Badge>
              )}
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

        {/* Enhanced hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-200/0 via-emerald-200/20 to-emerald-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Special sparkle effect for ready crops */}
        {p.state === "grown" && useAnimations && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 right-1 text-yellow-400 animate-bounce">✨</div>
            <div className="absolute bottom-1 left-1 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }}>💫</div>
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison for memo - only re-render if plot actually changed
    return JSON.stringify(prevProps.p) === JSON.stringify(nextProps.p) && prevProps.i === nextProps.i;
  });

  // 📊 ANALYTICS DASHBOARD COMPONENT - Memoized for performance
  const AnalyticsDashboard = React.memo(() => {
    const report = useMemo(() => generateAnalyticsReport(), [farmStatistics, analyticsData]);
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                📊 Farm Analytics Dashboard
              </h2>
              <Button 
                onClick={() => setShowAnalyticsDashboard(false)}
                variant="outline"
                size="sm"
              >
                ✕ Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Key Metrics */}
              <div className="analytics-card">
                <h3 className="text-lg font-semibold mb-3">⚡ Performance</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm opacity-80">Coins/Minute</div>
                    <div className="stat-number">{report.coinsPerMinute}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Harvests/Minute</div>
                    <div className="stat-number">{report.harvestsPerMinute}</div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3 className="text-lg font-semibold mb-3">🎯 Efficiency</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm opacity-80">Plot Utilization</div>
                    <div className="stat-number">{report.utilization}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Water Efficiency</div>
                    <div className="stat-number">{report.efficiency.waterEfficiency}</div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3 className="text-lg font-semibold mb-3">🏆 Top Crops</h3>
                <div className="space-y-2">
                  {report.topPerformers.slice(0, 3).map((crop, i) => (
                    <div key={crop.crop} className="flex justify-between text-sm">
                      <span>#{i+1} {rules.seeds[crop.crop]?.emoji} {crop.crop}</span>
                      <span>{crop.avgValue}🪙</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trends Chart Placeholder */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border">
              <h3 className="text-lg font-semibold mb-4">📈 Revenue Trends</h3>
              <div className="h-32 bg-white rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="text-2xl mb-2">📈</div>
                  <div>Chart visualization coming soon!</div>
                  <div className="text-sm">Track your farm's performance over time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // 🔄 AUTO-ACTIONS CONTROL PANEL
  const AutoActionsPanel = () => (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 Smart Automation
          <div className={`auto-action-indicator ${Object.values(autoActions).some(x => x) ? '' : 'hidden'}`}></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(autoActions).filter(([key]) => key.startsWith('auto')).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium capitalize">
                {key.replace('auto', '').replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <Button
                size="sm"
                variant={enabled ? "default" : "outline"}
                onClick={() => setAutoActions(prev => ({ ...prev, [key]: !prev[key] }))}
                className="min-w-16"
              >
                {enabled ? "ON" : "OFF"}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Quick Settings</div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Action Interval:</span>
              <span>{autoActionSettings.scheduling.actionInterval / 1000}s</span>
            </div>
            <div className="flex justify-between">
              <span>Max Actions/Cycle:</span>
              <span>{autoActionSettings.scheduling.maxActionsPerInterval}</span>
            </div>
            <div className="flex justify-between">
              <span>Min Coins for Planting:</span>
              <span>{autoActionSettings.conditions.minCoinsForPlanting}🪙</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAnalyticsDashboard(true)}
          variant="outline" 
          className="w-full"
        >
          📊 View Analytics Dashboard
        </Button>
      </CardContent>
    </Card>
  );

  // 📱 MOBILE NAVIGATION BAR
  const MobileNavBar = ({ currentTab, setCurrentTab, coins, level }) => (
    <div className="mobile-tabs md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-40">
      <div className="flex justify-around py-2">
        {[
          { id: "seeds", icon: "🌱", label: "Seeds" },
          { id: "analytics", icon: "📊", label: "Stats" },
          { id: "settings", icon: "⚙️", label: "Settings" },
          { id: "tools", icon: "🛠️", label: "Tools" }
        ].map(tab => (
          <button
            key={tab.id}
            className={`mobile-tab flex flex-col items-center p-2 rounded-lg transition-all ${
              currentTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600'
            }`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // --- Enhanced Layout ---
  
  // Skip loading screen for now to debug
  // if (isInitializing) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="text-6xl mb-4 animate-bounce">🌱</div>
  //         <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Farm...</h1>
  //         <p className="text-gray-600">Preparing the fields</p>
  //         <div className="mt-4 flex justify-center gap-1">
  //           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
  //           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
  //           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  
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
            if (typeof window !== 'undefined' && window.localStorage) {
              const save = loadSave();
              return save ? `💾 Save present (${new Date(save.savedAt || Date.now()).toLocaleString()})` : '💾 No save present';
            }
            return '💾 Loading...';
          } catch (e) {
            console.debug('[farm] Save status error:', e);
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
                    {findPrestigeLevel(prestigeLevel)?.emoji}P{prestigeLevel}
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

            {/* Smart Farm Assistant */}
            {assistantEnabled && assistantRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={20}/>
                    Smart Farm Assistant
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setAssistantEnabled(!assistantEnabled)}
                      className="ml-auto text-xs h-6 px-2"
                    >
                      {assistantEnabled ? <EyeOff size={12}/> : <Eye size={12}/>}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-600 mb-2">
                    🤖 AI-powered recommendations to optimize your farm
                  </div>
                  {assistantRecommendations.map(rec => (
                    <div 
                      key={rec.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className="text-lg">{rec.icon}</span>
                            {rec.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {rec.description}
                          </div>
                        </div>
                        {rec.action && (
                          <Button 
                            size="sm" 
                            onClick={rec.action}
                            className="ml-2 text-xs h-7 px-3"
                            variant={rec.priority === 'high' ? 'default' : 'outline'}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Quick Farm Insights */}
                  <div className="mt-4 pt-3 border-t">
                    <div className="text-xs font-semibold mb-2">📊 Quick Insights</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-100 rounded">
                        <div className="font-bold">{plots.filter(p => p.state === 'grown').length}</div>
                        <div>Ready to Harvest</div>
                      </div>
                      <div className="text-center p-2 bg-blue-100 rounded">
                        <div className="font-bold">{skillPoints}</div>
                        <div>Skill Points</div>
                      </div>
                      <div className="text-center p-2 bg-purple-100 rounded">
                        <div className="font-bold">{workers.length}</div>
                        <div>Active Workers</div>
                      </div>
                      <div className="text-center p-2 bg-orange-100 rounded">
                        <div className="font-bold">{processingFacilities.length}</div>
                        <div>Facilities</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Shop */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="text-emerald-600" size={20}/>
                  Farm Shop
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={shopTab} onValueChange={handleShopTabChange}>
                  <TabsList className="flex flex-wrap gap-2 w-full overflow-x-auto">
                    <TabsTrigger className="shrink-0" value="seeds">🌱 Seeds</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="tools">🛠️ Tools</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="buildings">🏗️ Buildings</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="skills">📚 Skills</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="research">🔬 Research</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="workers">👷 Workers</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="processing">🏭 Processing</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="market">📈 Market</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="events">🎉 Events</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="challenges">🎯 Challenges</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="breeding">🧬 Breeding</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="weather">🌤️ Weather</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="pets">🐕 Pets</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="town">🏛️ Town</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="social">👥 Social</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="community">🌍 Community</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="analytics">📊 Analytics</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="livestock">🐄 Livestock</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="infrastructure">🏗️ Infrastructure</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="economy">💼 Economy</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="expand">📏 Expand</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="test">🧪 Test</TabsTrigger>
                    <TabsTrigger className="shrink-0" value="settings">⚙️ Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="seeds" className="space-y-2">
                    {seedEntries.map(([seed, data]) => (
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

                  {/* ENHANCED ANALYTICS TAB */}
                  <TabsContent value="analytics" className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold">📊 Farm Analytics</div>
                      <Button 
                        onClick={() => setShowAnalyticsDashboard(true)}
                        variant="outline"
                        size="sm"
                        className="mobile-friendly-button"
                      >
                        📈 Full Dashboard
                      </Button>
                    </div>

                    {/* Enhanced Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="analytics-card mobile-card">
                        <h3 className="text-lg font-semibold mb-3">⚡ Real-Time Performance</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm opacity-80">Plot Utilization</div>
                            <div className="stat-number">{Math.round((plots.filter(p => p.state !== 'empty').length / plots.length) * 100)}%</div>
                            <div className="progress-bar-animated w-full h-2 rounded-full mt-1" 
                                 style={{width: `${(plots.filter(p => p.state !== 'empty').length / plots.length) * 100}%`}}></div>
                          </div>
                          <div>
                            <div className="text-sm opacity-80">Automation Level</div>
                            <div className="stat-number">{Math.round((workers.length / 5) * 100)}%</div>
                            <div className="progress-bar-animated w-full h-2 rounded-full mt-1" 
                                 style={{width: `${(workers.length / 5) * 100}%`}}></div>
                          </div>
                        </div>
                      </div>

                      <div className="analytics-card mobile-card">
                        <h3 className="text-lg font-semibold mb-3">🎯 Efficiency Metrics</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Ready to Harvest:</span>
                            <span className="font-bold">{plots.filter(p => p.state === 'grown').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Workers:</span>
                            <span className="font-bold">{workers.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Skill Points:</span>
                            <span className="font-bold">{skillPoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Achievements:</span>
                            <span className="font-bold">{achievements.length}/{ACHIEVEMENTS.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button 
                        onClick={() => {
                          const readyPlots = plots.filter((p, i) => p.state === "grown");
                          readyPlots.forEach((p, i) => {
                            const plotIndex = plots.indexOf(p);
                            if (plotIndex !== -1) harvest(plotIndex);
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="mobile-friendly-button"
                        disabled={plots.filter(p => p.state === 'grown').length === 0}
                      >
                        🌾 Harvest All ({plots.filter(p => p.state === 'grown').length})
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          const needsWater = plots.filter((p, i) => 
                            (p.state === "planted" || p.state === "growing") && 
                            (!p.watered || nowSec() - (p.lastWateredAt || 0) > 120)
                          );
                          needsWater.forEach((p) => {
                            const plotIndex = plots.indexOf(p);
                            if (plotIndex !== -1) water(plotIndex);
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="mobile-friendly-button"
                      >
                        💧 Water All
                      </Button>

                      <Button 
                        onClick={() => setShowAnalyticsDashboard(true)}
                        variant="outline"
                        size="sm"
                        className="mobile-friendly-button"
                      >
                        📊 Charts
                      </Button>

                      <Button 
                        onClick={() => {
                          // Quick plant on empty plots
                          const emptyPlots = plots.filter(p => p.state === 'empty').slice(0, 5);
                          emptyPlots.forEach(p => {
                            const plotIndex = plots.indexOf(p);
                            if (plotIndex !== -1 && (inventory[selectedSeed] || 0) > 0) {
                              plant(plotIndex, selectedSeed);
                            }
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="mobile-friendly-button"
                        disabled={(inventory[selectedSeed] || 0) === 0}
                      >
                        🌱 Quick Plant
                      </Button>
                    </div>

                    {/* Legacy analytics content (condensed) */}
                    <div className="p-3 bg-white/80 border rounded-xl shadow-sm">
                      <div className="text-sm font-semibold mb-3">📈 Farm Statistics</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Total Harvests: <span className="font-bold">{farmStatistics.plotsHarvested || 0}</span></div>
                        <div>Total Earned: <span className="font-bold">{Math.round(totalEarned)}</span></div>
                        <div>Fertilizer Used: <span className="font-bold">{farmStatistics.totalFertilizerUsed || 0}</span></div>
                        <div>Weather Events: <span className="font-bold">{farmStatistics.weatherEventsExperienced || 0}</span></div>
                        <div>Prestige Level: <span className="font-bold">{prestigeLevel}</span></div>
                        <div>Efficiency: <span className="font-bold">{Math.round(farmStatistics.efficacyRating)}%</span></div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-3">
                    {/* AUTO-ACTIONS PANEL */}
                    <div className="p-3 bg-gradient-to-br from-green-50 to-blue-50 border rounded-xl shadow-sm">
                      <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        🔄 Auto-Actions Settings
                        <Badge variant={autoActionSettings.enabled ? "success" : "outline"} className="text-xs">
                          {autoActionSettings.enabled ? "ON" : "OFF"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Master Toggle */}
                        <div className="flex items-center justify-between p-2 bg-white/70 rounded-lg">
                          <div className="text-sm font-medium">Enable Auto-Actions</div>
                          <input 
                            type="checkbox" 
                            checked={autoActionSettings.enabled}
                            onChange={e => {
                              setAutoActionSettings(prev => ({...prev, enabled: e.target.checked}));
                              if (e.target.checked) {
                                checkTutorialProgress('enableAutoActions', { setting: 'enabled' });
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </div>

                        {autoActionSettings.enabled && (
                          <>
                            {/* Action Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                                <span className="text-xs">🌾 Auto Harvest</span>
                                <input 
                                  type="checkbox"
                                  checked={autoActionSettings.harvest}
                                  onChange={e => setAutoActionSettings(prev => ({...prev, harvest: e.target.checked}))}
                                  className="w-3 h-3"
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                                <span className="text-xs">🌱 Auto Plant</span>
                                <input 
                                  type="checkbox"
                                  checked={autoActionSettings.plant}
                                  onChange={e => setAutoActionSettings(prev => ({...prev, plant: e.target.checked}))}
                                  className="w-3 h-3"
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                                <span className="text-xs">💧 Auto Water</span>
                                <input 
                                  type="checkbox"
                                  checked={autoActionSettings.water}
                                  onChange={e => setAutoActionSettings(prev => ({...prev, water: e.target.checked}))}
                                  className="w-3 h-3"
                                />
                              </div>
                              <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                                <span className="text-xs">⚡ Auto Fertilize</span>
                                <input 
                                  type="checkbox"
                                  checked={autoActionSettings.fertilize}
                                  onChange={e => setAutoActionSettings(prev => ({...prev, fertilize: e.target.checked}))}
                                  className="w-3 h-3"
                                />
                              </div>
                            </div>

                            {/* Priority Settings */}
                            <div className="p-2 bg-white/50 rounded-lg">
                              <div className="text-xs font-medium mb-2">🎯 Smart Priority</div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Prioritize high-value crops</span>
                                <input 
                                  type="checkbox"
                                  checked={autoActionSettings.smartPriority}
                                  onChange={e => setAutoActionSettings(prev => ({...prev, smartPriority: e.target.checked}))}
                                  className="w-3 h-3"
                                />
                              </div>
                            </div>

                            {/* Status Display */}
                            <div className="text-xs text-slate-600 p-2 bg-white/30 rounded">
                              <div className="font-medium mb-1">⏱️ Auto-Actions Status:</div>
                              <div>Actions executed this session: <span className="font-bold">{analyticsData.autoActionsExecuted}</span></div>
                              <div>Efficiency gain: <span className="font-bold">+{Math.round(analyticsData.efficiencyGain)}%</span></div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* EXISTING SETTINGS */}
                    <div className="p-3 bg-white/80 border rounded-xl shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Animations</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">All effects & plot animations</label>
                          <input type="checkbox" checked={animationsEnabled} onChange={e => setAnimationsEnabled(e.target.checked)} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Performance Mode</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">Disable animations & effects</label>
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

                    {/* TUTORIAL CONTROL */}
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border rounded-xl shadow-sm">
                      <div className="font-semibold text-slate-700 mb-2">📚 Tutorial System</div>
                      <div className="text-xs text-slate-600 mb-3">
                        Need help learning the enhanced farm features? Restart the tutorial to get guided instructions.
                      </div>
                      <Button
                        variant="outline"
                        className="text-xs w-full"
                        onClick={restartTutorial}
                      >
                        🔄 Restart Tutorial
                      </Button>
                      <div className="text-xs text-slate-500 mt-2">
                        Progress: {tutorialCompleted ? 12 : tutorialStep + 1}/12 steps completed
                      </div>
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
                    {buildingEntries.map(([buildingType, data]) => (
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
                          {findPrestigeLevel(prestigeLevel)?.emoji} Prestige Level {prestigeLevel}: {(getPrestigeMultiplier('coins') * 100).toFixed(0)}% bonus
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
                      
                      {skillTreeEntries.map(([treeId, tree]) => (
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
                          <div>Current Level: {findPrestigeLevel(prestigeLevel)?.name || "Beginner"}</div>
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
                                        onClick={() => startFacilityProcessing(facility.id, item, 1)}
                                        size="sm"
                                        className="text-xs"
                                      >
                                        Process {item} ({qty})
                                      </Button>
                                    ))
                                  ) : (
                                    // Show specific input type
                                    <Button
                                      onClick={() => startFacilityProcessing(facility.id, facilityConfig.input, 1)}
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

                  {/* 🎉 SEASONAL EVENTS TAB */}
                  <TabsContent value="events" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🎉 Seasonal Events & Festivals</div>
                    
                    {/* Active Events */}
                    {activeSeasonalEvents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">🎪 Active Events</h4>
                        {activeSeasonalEvents.map(event => {
                          const timeLeft = Math.max(0, event.endsAt - nowSec());
                          const minutes = Math.floor(timeLeft / 60);
                          const seconds = timeLeft % 60;
                          
                          return (
                            <Card key={event.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">{event.emoji} {event.name}</div>
                                  <div className="text-xs text-gray-600">{event.description}</div>
                                  <div className="text-xs font-mono">⏰ {minutes}m {seconds}s remaining</div>
                                </div>
                                <Badge variant="outline" className={`
                                  ${event.rarity === 'epic' ? 'border-purple-500 text-purple-700' : ''}
                                  ${event.rarity === 'rare' ? 'border-blue-500 text-blue-700' : ''}
                                  ${event.rarity === 'uncommon' ? 'border-green-500 text-green-700' : ''}
                                `}>
                                  {event.rarity}
                                </Badge>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Event History */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">📜 Recent Events</h4>
                      {seasonalEventHistory.slice(-5).map(event => (
                        <div key={event.id} className="p-2 border rounded bg-gray-50 text-xs">
                          <span>{event.emoji} {event.name}</span>
                          <span className="float-right text-green-600">+{event.rewards.coins}🪙</span>
                        </div>
                      ))}
                      {seasonalEventHistory.length === 0 && (
                        <div className="text-xs text-gray-500 text-center py-4">
                          No events completed yet. Wait for seasonal events to appear!
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* 🎯 DAILY CHALLENGES TAB */}
                  <TabsContent value="challenges" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🎯 Daily Challenges</div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xs">
                        Streak: <span className="font-bold text-orange-600">{challengeStreak}</span>
                      </div>
                      <div className="text-xs">
                        Resets in: {Math.max(0, Math.floor((lastChallengeReset + 86400 - nowSec()) / 3600))}h
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {dailyChallenges.map(challenge => {
                        const progress = dailyChallengeProgress[challenge.id] || {};
                        const progressValue = Object.values(progress)[0] || 0;
                        const progressPercent = Math.min(100, Math.max(0, (progressValue / (challenge.target || 1)) * 100));
                        
                        return (
                          <Card key={challenge.id} className={`p-3 ${challenge.completed ? 'bg-green-50 border-green-200' : ''}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{challenge.emoji}</span>
                                <div>
                                  <div className="font-semibold text-sm">{challenge.name}</div>
                                  <div className="text-xs text-gray-600">{challenge.description}</div>
                                </div>
                              </div>
                              {challenge.completed && <Badge className="bg-green-500">✓ Done</Badge>}
                            </div>
                            
                            <Progress value={progressPercent} className="mb-2" />
                            
                            <div className="flex justify-between text-xs">
                              <span>Progress: {progressValue}/{challenge.target}</span>
                              <span className="text-green-600">
                                Reward: {challenge.reward.coins}🪙 + items
                              </span>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {dailyChallenges.length === 0 && (
                      <div className="text-center py-6">
                        <div className="text-gray-500 mb-2">No challenges available</div>
                        <Button onClick={() => {
                          const newChallenges = Array(3).fill().map(() => generateDailyChallenge());
                          setDailyChallenges(newChallenges);
                        }}>
                          🎯 Generate Challenges
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* 🧬 CROP BREEDING TAB */}
                  <TabsContent value="breeding" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🧬 Crop Breeding Laboratory</div>
                    
                    {/* Breeding Lab Status */}
                    <Card className="p-3 bg-blue-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">🔬 Lab Level {breedingLab.level}</div>
                          <div className="text-xs">Capacity: {breedingQueue.length}/{breedingLab.capacity}</div>
                        </div>
                        <Button size="sm" disabled>
                          Upgrade Lab
                        </Button>
                      </div>
                    </Card>
                    
                    {/* Active Breeding */}
                    {breedingQueue.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">⏳ Breeding in Progress</h4>
                        {breedingQueue.map(process => {
                          const recipe = BREEDING_RECIPES[process.hybridId];
                          const timeLeft = Math.max(0, process.completesAt - nowSec());
                          const minutes = Math.floor(timeLeft / 60);
                          const seconds = timeLeft % 60;
                          
                          return (
                            <Card key={process.id} className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold">{recipe.emoji} {recipe.name}</div>
                                  <div className="text-xs">
                                    {process.parent1} + {process.parent2}
                                  </div>
                                </div>
                                <div className="text-xs font-mono">
                                  {minutes}m {seconds}s
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Breeding Interface */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">🧪 Start New Breeding</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {Object.entries(inventory).filter(([seed, qty]) => 
                          seed in rules.seeds && qty >= 2
                        ).map(([seed, qty]) => (
                          <Button
                            key={seed}
                            onClick={() => startBreeding(seed, seed)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            disabled={breedingQueue.length >= breedingLab.capacity}
                          >
                            {rules.seeds[seed].emoji} Breed {seed} ({qty})
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Discovered Hybrids */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">🏆 Discovered Hybrids</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {discoveredHybrids.map(hybridId => {
                          const recipe = BREEDING_RECIPES[hybridId];
                          const quantity = hybridSeeds[hybridId] || 0;
                          
                          return (
                            <Card key={hybridId} className="p-2">
                              <div className="text-center">
                                <div className="text-lg">{recipe.emoji}</div>
                                <div className="text-xs font-semibold">{recipe.name}</div>
                                <div className="text-xs">Owned: {quantity}</div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                      {discoveredHybrids.length === 0 && (
                        <div className="text-xs text-gray-500 text-center py-4">
                          No hybrids discovered yet. Try breeding different seeds!
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* 🌤️ WEATHER PREDICTION TAB */}
                  <TabsContent value="weather" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🌤️ Weather Prediction Center</div>
                    
                    {/* Current Weather Game */}
                    {weatherPredictionGame.active ? (
                      <Card className="p-4 bg-blue-50">
                        <div className="text-center">
                          <h4 className="font-semibold mb-3">🔮 Predict Next Weather</h4>
                          <div className="mb-3">
                            <div className="text-xs mb-2">Recent Pattern:</div>
                            <div className="flex justify-center gap-1 mb-3">
                              {weatherPredictionGame.currentPattern.map((w, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {w}
                                </Badge>
                              ))}
                              <span className="mx-2">→</span>
                              <Badge variant="outline" className="text-xs">?</Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {["sunny", "rainy", "stormy", "windy"].map(weather => (
                              <Button
                                key={weather}
                                onClick={() => makePrediction(weather)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                🌤️ {weather}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="text-center">
                        <Button 
                          onClick={startWeatherPredictionGame}
                          className="mb-3"
                          disabled={weatherForecast.length < 3}
                        >
                          🎮 Start Prediction Game
                        </Button>
                        {weatherForecast.length < 3 && (
                          <div className="text-xs text-gray-500">
                            Need 3+ weather history entries to play
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Weather Stats */}
                    <Card className="p-3">
                      <div className="text-sm font-semibold mb-2">📊 Prediction Stats</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-semibold">
                            {weatherPredictionGame.totalPredictions > 0 
                              ? Math.round((weatherPredictionGame.correctPredictions / weatherPredictionGame.totalPredictions) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Streak:</span>
                          <span className="font-semibold">{weatherPredictionGame.streak}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Rewards:</span>
                          <span className="font-semibold text-green-600">{weatherPredictionRewards}🪙</span>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* 🐕 FARM PETS TAB */}
                  <TabsContent value="pets" className="space-y-2">
                    <div className="text-sm font-semibold mb-2">🐕 Farm Pets</div>
                    
                    {/* Pet Adoption */}
                    {farmPets.length === 0 && (
                      <div className="text-center py-4">
                        <div className="text-gray-500 mb-3">No pets yet. Adopt your first companion!</div>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(PET_TYPES).map(([petType, pet]) => (
                            <Button
                              key={petType}
                              onClick={() => adoptPet(petType)}
                              variant="outline"
                              className="justify-between"
                              disabled={coins < pet.cost}
                            >
                              <span>{pet.emoji} Adopt {pet.name}</span>
                              <span>{pet.cost}🪙</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Active Pets */}
                    {farmPets.length > 0 && (
                      <div className="space-y-3">
                        {farmPets.map(pet => {
                          const petType = PET_TYPES[pet.type];
                          
                          return (
                            <Card key={pet.id} className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-semibold">{petType.emoji} {pet.name}</div>
                                  <div className="text-xs">Level {pet.level} • Happiness: {Math.round(pet.happiness)}%</div>
                                </div>
                                <Badge variant="outline">
                                  {pet.happiness >= 80 ? '😊 Happy' : pet.happiness >= 50 ? '😐 Okay' : '😢 Sad'}
                                </Badge>
                              </div>
                              
                              {/* Pet Stats */}
                              <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                                <div>
                                  <div>Health: {pet.health}%</div>
                                  <Progress value={pet.health} className="h-1" />
                                </div>
                                <div>
                                  <div>Hunger: {pet.hunger}%</div>
                                  <Progress value={100 - pet.hunger} className="h-1" />
                                </div>
                                <div>
                                  <div>Play: {pet.playfulness}%</div>
                                  <Progress value={pet.playfulness} className="h-1" />
                                </div>
                              </div>
                              
                              {/* Pet Care Actions */}
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => carePet(pet.id, 'food')}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs flex-1"
                                  disabled={(petSupplies.pet_food || 0) < 1}
                                >
                                  🍖 Feed
                                </Button>
                                <Button
                                  onClick={() => carePet(pet.id, 'play')}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs flex-1"
                                  disabled={(petSupplies.attention || 0) < 1}
                                >
                                  🎾 Play
                                </Button>
                                <Button
                                  onClick={() => carePet(pet.id, 'health')}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs flex-1"
                                  disabled={(petSupplies.vet_care || 0) < 1}
                                >
                                  🏥 Vet
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                        
                        {/* Pet Supplies */}
                        <Card className="p-3 bg-yellow-50">
                          <div className="text-sm font-semibold mb-2">🛍️ Pet Supplies</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div>🍖 Pet Food</div>
                              <div className="font-semibold">{petSupplies.pet_food || 0}</div>
                            </div>
                            <div className="text-center">
                              <div>❤️ Attention</div>
                              <div className="font-semibold">{petSupplies.attention || 0}</div>
                            </div>
                            <div className="text-center">
                              <div>🏥 Vet Care</div>
                              <div className="font-semibold">{petSupplies.vet_care || 0}</div>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex gap-1">
                            <Button
                              onClick={() => {
                                if (coins >= 20) {
                                  setCoins(c => c - 20);
                                  setPetSupplies(prev => ({ ...prev, pet_food: (prev.pet_food || 0) + 5 }));
                                  addNotification("Bought pet food! 🍖", "success");
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="text-xs flex-1"
                              disabled={coins < 20}
                            >
                              Buy Food (20🪙)
                            </Button>
                            <Button
                              onClick={() => {
                                if (coins >= 30) {
                                  setCoins(c => c - 30);
                                  setPetSupplies(prev => ({ ...prev, vet_care: (prev.vet_care || 0) + 1 }));
                                  addNotification("Scheduled vet visit! 🏥", "success");
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="text-xs flex-1"
                              disabled={coins < 30}
                            >
                              Vet Care (30🪙)
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}
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
                              addNotification('Game saved successfully', 'success');
                            } catch (e) { console.error(e); addNotification('Save failed', 'error'); }
                          }}
                          className="w-full text-xs bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700"
                        >
                          💾 Save Game
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
                    {seedEntries.map(([seed, data]) => (
                      <option key={seed} value={seed}>
                        {data.emoji} {seed} ({data.stages} stages, +{data.baseValue}🪙)
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Farm Goals - Seamless Progression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-blue-600" size={20}/>
                  Current Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {levelId === "endless" ? (
                  // Endless Mode Display
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-200">
                    <div className="text-center space-y-2">
                      <div className="text-2xl">♾️</div>
                      <div className="font-bold text-lg text-purple-800">Endless Farm Mode</div>
                      <div className="text-sm text-purple-600">
                        No time limits • No coin targets • Pure farming fun!
                      </div>
                      <div className="text-xs text-purple-500 mt-2">
                        Current Progress: {coins}🪙 earned
                      </div>
                    </div>
                  </div>
                ) : level ? (
                  // Current Level Progress
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-lg text-blue-800">{level?.label || 'Unknown Level'}</div>
                          <div className="text-sm text-blue-600">Level {levelId.replace('lvl', '')}</div>
                        </div>
                        <div className="text-xs bg-blue-100 px-2 py-1 rounded">
                          {level?.difficulty || 'Unknown'}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {coins}/{level?.targetCoins || 0}🪙</span>
                          <span>{Math.round((coins / (level?.targetCoins || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((coins / (level?.targetCoins || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Time Remaining */}
                      {levelStatus === "playing" && levelEndsAt > nowSec() && (
                        <div className="mt-3 text-center">
                          <div className="text-sm text-gray-600">Time Remaining:</div>
                          <div className={`font-bold text-lg ${
                            levelEndsAt - nowSec() < 60 ? 'text-red-600' : 
                            levelEndsAt - nowSec() < 120 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {formatTimeRemaining(levelEndsAt, nowSec())}
                          </div>
                        </div>
                      )}

                      {/* Reward Info */}
                      {(level?.reward || 0) > 0 && (
                        <div className="mt-3 text-center text-sm text-green-600">
                          🎁 Completion Reward: {level?.reward || 0}🪙
                        </div>
                      )}
                    </div>

                    {/* Level Completion Status */}
                    {levelStatus === 'won' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-green-800 font-bold mb-2">
                          🎉 Level Complete!
                        </div>
                        <div className="text-sm text-green-600 mb-3">
                          {(() => {
                            const currentLevelIndex = findLevelIndex(levelId);
                            const nextLevel = LEVELS[currentLevelIndex + 1];
                            
                            if (nextLevel && nextLevel.id !== "endless") {
                              return `Advancing to ${nextLevel.label}...`;
                            } else {
                              return "All levels completed! You're now a Master Farmer!";
                            }
                          })()}
                        </div>
                        
                        {/* Show endless mode option if all levels are complete */}
                        {(() => {
                          const currentLevelIndex = findLevelIndex(levelId);
                          const nextLevel = LEVELS[currentLevelIndex + 1];
                          
                          if (!nextLevel || nextLevel.id === "endless") {
                            return (
                              <Button 
                                onClick={() => {
                                  setLevelId("endless");
                                  setLevelStatus("playing");
                                  setLevelEndsAt(0);
                                  addLog("♾️ Switched to Endless Farm Mode!");
                                  addNotification("Welcome to Endless Mode! Farm at your own pace.", "success");
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                ♾️ Switch to Endless Mode
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {levelStatus === 'lost' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-red-800 font-bold mb-2">
                          ⏰ Time's Up!
                        </div>
                        <div className="text-sm text-red-600 mb-3">
                          You earned {coins}🪙 out of {level?.targetCoins || 0}🪙 needed.
                        </div>
                        <div className="space-x-2">
                          <Button 
                            onClick={() => {
                              setLevelEndsAt(nowSec() + (level?.minutes || 10) * 60);
                              setLevelStartedAt(nowSec());
                              setLevelStatus("playing");
                              addLog(`🔄 Restarting ${level?.label || 'Level'}`);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            🔄 Try Again
                          </Button>
                          <Button 
                            onClick={() => {
                              setLevelId("endless");
                              setLevelStatus("playing");
                              setLevelEndsAt(0);
                              addLog("♾️ Switched to Endless Farm Mode!");
                            }}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            ♾️ Endless Mode
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No active goal
                  </div>
                )}

                {/* Quick Level Navigation (only show if not in endless mode and user wants to go back) */}
                {levelId !== "endless" && levelStatus !== "playing" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs text-gray-500 mb-2">Quick Options:</div>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.filter(l => l.id !== "endless").map(L => (
                        <Button
                          key={L.id}
                          onClick={() => {
                            setLevelId(L.id);
                            setLevelEndsAt(nowSec() + L.minutes * 60);
                            setLevelStartedAt(nowSec());
                            setLevelStatus("playing");
                            addLog(`🎯 Started ${L.label}`);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {L.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Livestock Tab - Hidden but functional */}
            <Card style={{display: activeTab === 'livestock' ? 'block' : 'none'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-orange-600">🐄</span>
                  Livestock Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="chickens">Chickens</TabsTrigger>
                    <TabsTrigger value="cows">Cows</TabsTrigger>
                    <TabsTrigger value="sheep">Sheep</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(LIVESTOCK_TYPES).map(([type, animal]) => (
                          <Card key={type} className="p-4">
                            <div className="text-center space-y-2">
                              <div className="text-3xl">{animal.emoji}</div>
                              <h3 className="font-bold">{animal.name}</h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Cost: ${animal.cost}</div>
                                <div>Max: {animal.maxCount}</div>
                                <div>Owned: {livestock[type] || 0}</div>
                              </div>
                              <Button
                                onClick={() => buyLivestock(type)}
                                disabled={coins < animal.cost || (livestock[type] || 0) >= animal.maxCount}
                                className="w-full"
                              >
                                Buy {animal.name}
                              </Button>
                              {(livestock[type] || 0) > 0 && (
                                <div className="space-y-2 mt-2">
                                  <Button onClick={() => feedLivestock(type)} size="sm" className="w-full">
                                    Feed (${animal.food.cost * animal.food.consumption * (livestock[type] || 0)})
                                  </Button>
                                  <Button onClick={() => collectProducts(type)} size="sm" className="w-full">
                                    Collect Products
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Products Section */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-2">Animal Products</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(livestockProducts).map(([product, amount]) => (
                            <div key={product} className="bg-gray-100 p-2 rounded flex justify-between">
                              <span>{product}: {amount}</span>
                              <Button onClick={() => sellProducts(product)} size="sm">Sell</Button>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* NEW INFRASTRUCTURE TAB */}
                  <TabsContent value="infrastructure" className="mt-0">
                    <div className="space-y-6">
                      {/* Greenhouses */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          🏠 Greenhouses ({greenhouses.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {Object.entries(GREENHOUSE_TYPES).map(([type, greenhouse]) => (
                            <Card key={type} className="p-3">
                              <div className="text-center space-y-2">
                                <div className="text-2xl">{greenhouse.emoji}</div>
                                <h4 className="font-semibold">{greenhouse.name}</h4>
                                <div className="text-sm text-gray-600">
                                  <div>Cost: ${greenhouse.cost}</div>
                                  <div>Capacity: {greenhouse.capacity} plots</div>
                                  <div>Upkeep: ${greenhouse.upkeep}/day</div>
                                </div>
                                <Button
                                  onClick={() => buildGreenhouse(type)}
                                  disabled={coins < greenhouse.cost}
                                  size="sm"
                                >
                                  Build
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>

                      {/* Equipment */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          🚜 Farm Equipment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(EQUIPMENT_TYPES).map(([type, eq]) => (
                            <Card key={type} className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold">{eq.emoji} {eq.name}</div>
                                  <div className="text-sm text-gray-600">{eq.description}</div>
                                  <div className="text-sm font-bold">Cost: ${eq.cost}</div>
                                </div>
                                <Button
                                  onClick={() => buyEquipment(type)}
                                  disabled={coins < eq.cost || equipment.includes(type)}
                                  size="sm"
                                >
                                  {equipment.includes(type) ? "Owned" : "Buy"}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>

                      {/* Processing Facilities */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          🏭 Processing Facilities ({processing.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(PROCESSING_TYPES).map(([type, processor]) => (
                            <Card key={type} className="p-3">
                              <div className="text-center space-y-2">
                                <div className="text-2xl">{processor.emoji}</div>
                                <h4 className="font-semibold">{processor.name}</h4>
                                <div className="text-sm text-gray-600">
                                  <div>Cost: ${processor.cost}</div>
                                  <div>Upkeep: ${processor.upkeep}/day</div>
                                </div>
                                <Button
                                  onClick={() => buildProcessor(type)}
                                  disabled={coins < processor.cost}
                                  size="sm"
                                >
                                  Build
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* NEW ECONOMY TAB */}
                  <TabsContent value="economy" className="mt-0">
                    <div className="space-y-6">
                      {/* Insurance */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          🛡️ Farm Insurance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(INSURANCE_TYPES).map(([type, ins]) => (
                            <Card key={type} className="p-3">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{ins.name}</h4>
                                <div className="text-sm text-gray-600">{ins.description}</div>
                                <div className="text-sm font-bold">Cost: ${ins.cost}/hour</div>
                                <Button
                                  onClick={() => buyInsurance(type)}
                                  disabled={coins < ins.cost}
                                  size="sm"
                                >
                                  Buy Coverage
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>

                      {/* Loans */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          💳 Farm Loans
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(LOAN_TYPES).map(([type, loan]) => (
                            <Card key={type} className="p-3">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{loan.name}</h4>
                                <div className="text-sm text-gray-600">{loan.description}</div>
                                <div className="text-sm space-y-1">
                                  <div>Amount: ${loan.amount}</div>
                                  <div>Interest: {(loan.interest * 100).toFixed(1)}%</div>
                                  <div>Term: {Math.round(loan.term / 60)} minutes</div>
                                </div>
                                <Button
                                  onClick={() => takeLoan(type)}
                                  size="sm"
                                >
                                  Apply for Loan
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>

                      {/* Cooperatives */}
                      <Card className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          🤝 Farm Cooperatives
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(COOP_BENEFITS).map(([type, coop]) => (
                            <Card key={type} className="p-3">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{coop.name}</h4>
                                <div className="text-sm text-gray-600">{coop.description}</div>
                                <div className="text-sm font-bold">Membership: ${coop.membershipCost}</div>
                                <Button
                                  onClick={() => joinCoop(type)}
                                  disabled={coins < coop.membershipCost || coopMembership.includes(type)}
                                  size="sm"
                                >
                                  {coopMembership.includes(type) ? "Member" : "Join"}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
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
                  className="farm-grid grid gap-2 md:gap-4 p-2 transition-all duration-300" 
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
                        const L = findLevelById(levelId);
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
                          const nextLevel = findLevelById(`lvl${parseInt(levelId.slice(3)) + 1}`);
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

        {/* Smart Recommendations & Tips */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
          <div className="text-sm text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              🧠 Smart Farm Assistant
            </div>
            
            {/* Dynamic Recommendations */}
            <div className="space-y-3">
              {/* Season Optimization */}
              <div className="p-2 bg-emerald-50 rounded border-emerald-200 border">
                <div className="font-medium text-emerald-800">🌍 Seasonal Strategy</div>
                <div className="text-xs text-emerald-700 mt-1">
                  Current: {SEASON_EFFECTS[currentSeason].name} • 
                  Optimal crops: {seedEntries
                    .filter(([,data]) => data.season === currentSeason)
                    .map(([seed,data]) => `${data.emoji}${seed}`)
                    .join(", ") || "None specific"}
                </div>
              </div>

              {/* Market Intelligence */}
              {Object.keys(marketTrends).length > 0 && (
                <div className="p-2 bg-blue-50 rounded border-blue-200 border">
                  <div className="font-medium text-blue-800">📈 Market Intelligence</div>
                  <div className="text-xs text-blue-700 mt-1 grid grid-cols-2 gap-1">
                    {Object.entries(marketTrends).slice(0, 4).map(([crop, trend]) => (
                      <div key={crop} className="flex items-center gap-1">
                        {rules.seeds[crop]?.emoji} {crop}: {
                          trend === "high" ? "📈 High" : 
                          trend === "low" ? "📉 Low" : "📊 Normal"
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              <div className="p-2 bg-purple-50 rounded border-purple-200 border">
                <div className="font-medium text-purple-800">⚡ Performance Insights</div>
                <div className="text-xs text-purple-700 mt-1">
                  {prestigeLevel > 0 && (
                    <div>🌟 Prestige Level {prestigeLevel} (+{(getPrestigeMultiplier('coins') * 100 - 100).toFixed(0)}% coins)</div>
                  )}
                  {skillPoints > 0 && (
                    <div>📚 {skillPoints} skill points available - invest in skills!</div>
                  )}
                  {researchPoints >= 100 && !activeResearch && (
                    <div>🔬 {researchPoints} research points - start a research project!</div>
                  )}
                  {workers.length === 0 && coins > 200 && (
                    <div>👷 Consider hiring workers for automation (Workers tab)</div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2 bg-yellow-50 rounded border-yellow-200 border">
                <div className="font-medium text-yellow-800">🎮 Quick Actions</div>
                <div className="text-xs text-yellow-700 mt-1">
                  <div>Press <kbd className="px-1 bg-yellow-200 rounded text-xs">H</kbd> to harvest all ready crops</div>
                  <div>Press <kbd className="px-1 bg-yellow-200 rounded text-xs">W</kbd> to water all crops</div>
                  <div>Press <kbd className="px-1 bg-yellow-200 rounded text-xs">?</kbd> for all shortcuts</div>
                </div>
              </div>

              {/* Achievement Progress */}
              {achievements.length < ACHIEVEMENTS.length && (
                <div className="p-2 bg-orange-50 rounded border-orange-200 border">
                  <div className="font-medium text-orange-800">🏆 Achievement Progress</div>
                  <div className="text-xs text-orange-700 mt-1">
                    {ACHIEVEMENTS.slice(0, 3).filter(a => !achievements.includes(a.id)).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-1">
                        {achievement.icon} {achievement.name} (+{achievement.reward}🪙)
                      </div>
                    )).slice(0, 2)}
                  </div>
                </div>
              )}
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

      {/* Tutorial Overlay */}
      {tutorialActive && !tutorialCompleted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">Tutorial</div>
                <Badge variant="outline" className="text-xs">
                  Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                </Badge>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={skipTutorial}
                className="text-xs h-6 px-2"
              >
                Skip
              </Button>
            </div>
            
            {getCurrentTutorialStep() && (
              <div className="space-y-4">
                <div className="text-lg font-bold">
                  {getCurrentTutorialStep().title}
                </div>
                <div className="text-sm text-gray-600">
                  {getCurrentTutorialStep().content}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${((tutorialStep + 1) / TUTORIAL_STEPS.length) * 100}%`}}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {getCurrentTutorialStep().action ? 
                      `Action needed: ${getCurrentTutorialStep().action}` : 
                      'Click to continue'}
                  </div>
                  {!getCurrentTutorialStep().action && (
                    <Button 
                      onClick={advanceTutorial}
                      className="text-sm"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ENHANCED ANALYTICS DASHBOARD MODAL */}
      {showAnalyticsDashboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAnalyticsDashboard(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">📊 Farm Analytics Dashboard</h2>
                <Button variant="outline" onClick={() => setShowAnalyticsDashboard(false)}>✕</Button>
              </div>

              <AnalyticsDashboard />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAVIGATION */}
      {isMobile && (
        <MobileNavBar 
          currentTab={shopTab} 
          setCurrentTab={setShopTab}
          coins={coins}
          level={level}
        />
      )}
    </div>
  );
}

export default FarmSimCanvas;

