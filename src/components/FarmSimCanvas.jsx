import React, { useEffect, useState, useMemo, useRef } from "react";
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
 * Enhanced Farm Simulation Game - MINIMAL WORKING VERSION
 */

const MIN_SIZE = 3;

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
  scarecrow: { name: "Scarecrow", emoji: "👻", cost: 100, description: "Keeps birds away, +10% yield", unlockedLevel: 2 },
  windmill: { name: "Windmill", emoji: "🌪️", cost: 200, description: "Decorative windmill, generates 1 energy", unlockedLevel: 3 },
  garden_gnome: { name: "Garden Gnome", emoji: "👨‍🌾", cost: 150, description: "Lucky garden gnome, +5% luck", unlockedLevel: 4 },
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
  tavern: { name: "Tavern", emoji: "🏰", cost: 800, description: "Social hub and information", reputationRequired: 100 },
  bank: { name: "Bank", emoji: "🏦", cost: 1200, description: "Loans and savings", reputationRequired: 150 },
  clinic: { name: "Clinic", emoji: "🏥", cost: 1000, description: "Medical services", reputationRequired: 125 },
  school: { name: "School", emoji: "🏫", cost: 1500, description: "Education and research", reputationRequired: 200 },
  library: { name: "Library", emoji: "📚", cost: 900, description: "Knowledge and books", reputationRequired: 175 },
  market: { name: "Market Hall", emoji: "🏛️", cost: 2000, description: "Premium trading", reputationRequired: 250 },
  festival_grounds: { name: "Festival Grounds", emoji: "🎪", cost: 1800, description: "Event hosting", reputationRequired: 225 },
  town_hall: { name: "Town Hall", emoji: "🏛️", cost: 3000, description: "Government and permits", reputationRequired: 300 }
};

const TOWN_SERVICES = {
  clinic: { name: "Medical Clinic", description: "Reduces disease spread, +health bonuses", cost: 1000, reputationGain: 25 },
  school: { name: "School", description: "Accelerates research, +XP from harvests", cost: 1500, reputationGain: 30 },
  library: { name: "Library", description: "Unlocks advanced knowledge, +research efficiency", cost: 900, reputationGain: 20 },
  bank: { name: "Bank", description: "Enables loans and interest on savings", cost: 1200, reputationGain: 35 },
  market: { name: "Market Hall", description: "Premium market access, +selling prices", cost: 2000, reputationGain: 40 },
  festival_grounds: { name: "Festival Grounds", description: "Host town events, +reputation", cost: 1800, reputationGain: 45 }
};

const TOWN_EVENTS = [
  { id: "harvest_festival", name: "Harvest Festival", emoji: "🎃", description: "Celebrate the harvest season", duration: 180, effects: { reputation: 50, coins: 200 } },
  { id: "market_day", name: "Market Day", emoji: "🛒", description: "Increased market activity", duration: 120, effects: { market_multiplier: 1.3 } },
  { id: "town_meeting", name: "Town Meeting", emoji: "🏛️", description: "Discuss town improvements", duration: 90, effects: { reputation: 25 } },
  { id: "craft_fair", name: "Craft Fair", emoji: "🎨", description: "Showcase local crafts", duration: 150, effects: { reputation: 35, processing_bonus: 1.2 } },
  { id: "charity_drive", name: "Charity Drive", emoji: "❤️", description: "Help the community", duration: 100, effects: { reputation: 40 } }
];

// Social Features Constants
const COMPETITION_TYPES = {
  harvest_race: { name: "Harvest Race", emoji: "🏁", description: "Harvest as many crops as possible", duration: 300, reward: { coins: 500, reputation: 25 } },
  efficiency_challenge: { name: "Efficiency Challenge", emoji: "⚡", description: "Maximize value per plot", duration: 600, reward: { coins: 750, reputation: 35 } },
  quality_contest: { name: "Quality Contest", emoji: "⭐", description: "Grow the highest quality crops", duration: 450, reward: { coins: 600, reputation: 30 } },
  speed_farming: { name: "Speed Farming", emoji: "💨", description: "Fastest growth time", duration: 180, reward: { coins: 400, reputation: 20 } },
  diversity_competition: { name: "Diversity Competition", emoji: "🌈", description: "Grow the most crop types", duration: 900, reward: { coins: 1000, reputation: 50 } }
};

const GIFT_TYPES = {
  seeds: { name: "Seed Gift", emoji: "🌱", description: "Random crop seeds", cost: 25 },
  fertilizer: { name: "Fertilizer Gift", emoji: "🌿", description: "Boosts crop growth", cost: 50 },
  tools: { name: "Tool Gift", emoji: "🔧", description: "Farm improvement", cost: 75 },
  decoration: { name: "Decoration Gift", emoji: "🎁", description: "Random decoration", cost: 100 },
  premium: { name: "Premium Gift", emoji: "💎", description: "Rare item", cost: 200 }
};

const SOCIAL_EVENTS = [
  { id: "farmers_market", name: "Farmer's Market", emoji: "🏪", description: "Show off your best produce", duration: 120, effects: { market_multiplier: 1.5 } },
  { id: "community_gathering", name: "Community Gathering", emoji: "👥", description: "Meet other farmers", duration: 90, effects: { reputation: 20 } },
  { id: "cooperative_trade", name: "Cooperative Trade", emoji: "🤝", description: "Trade with neighbors", duration: 150, effects: { trade_bonus: 1.2 } },
  { id: "skill_sharing", name: "Skill Sharing", emoji: "📚", description: "Learn from experienced farmers", duration: 180, effects: { xp_multiplier: 1.3 } },
  { id: "friendship_festival", name: "Friendship Festival", emoji: "🎊", description: "Celebrate community bonds", duration: 240, effects: { reputation: 40, coins: 300 } }
];

// Deep Farming Mechanics Constants
const IRRIGATION_UPGRADES = {
  basic_system: { name: "Basic Irrigation", emoji: "💧", cost: 200, description: "Automated watering system", waterEfficiency: 1.1 },
  drip_irrigation: { name: "Drip Irrigation", emoji: "🌊", cost: 500, description: "Precise water delivery", waterEfficiency: 1.3 },
  smart_irrigation: { name: "Smart Irrigation", emoji: "🤖", cost: 1000, description: "AI-controlled watering", waterEfficiency: 1.5 },
  hydroponics: { name: "Hydroponics", emoji: "🌱", cost: 2000, description: "Waterless growing", waterEfficiency: 2.0 }
};

const GENETICS_PROJECTS = {
  drought_resistance: { name: "Drought Resistance", emoji: "🏜️", description: "Develop drought-resistant crops", cost: 100, duration: 300, trait: "drought_resistant" },
  fast_growth: { name: "Accelerated Growth", emoji: "⚡", description: "Create faster-growing varieties", cost: 150, duration: 450, trait: "fast_growth" },
  high_yield: { name: "High Yield Strains", emoji: "📈", description: "Develop higher-yield crops", cost: 200, duration: 600, trait: "high_yield" },
  disease_resistance: { name: "Disease Immunity", emoji: "🛡️", description: "Create disease-resistant crops", cost: 250, duration: 750, trait: "disease_resistant" },
  premium_quality: { name: "Premium Quality", emoji: "✨", description: "Develop premium quality crops", cost: 300, duration: 900, trait: "premium_quality" }
};

const CLIMATE_OPTIMALS = {
  carrot: { temperature: { min: 15, max: 25, optimal: 20 }, humidity: { min: 40, max: 70, optimal: 55 } },
  potato: { temperature: { min: 10, max: 20, optimal: 15 }, humidity: { min: 60, max: 80, optimal: 70 } },
  lettuce: { temperature: { min: 10, max: 20, optimal: 15 }, humidity: { min: 50, max: 70, optimal: 60 } },
  tomato: { temperature: { min: 20, max: 30, optimal: 25 }, humidity: { min: 40, max: 60, optimal: 50 } },
  corn: { temperature: { min: 20, max: 35, optimal: 28 }, humidity: { min: 50, max: 70, optimal: 60 } },
  strawberry: { temperature: { min: 15, max: 25, optimal: 20 }, humidity: { min: 60, max: 80, optimal: 70 } },
  sunflower: { temperature: { min: 20, max: 30, optimal: 25 }, humidity: { min: 40, max: 60, optimal: 50 } },
  pumpkin: { temperature: { min: 18, max: 28, optimal: 23 }, humidity: { min: 50, max: 70, optimal: 60 } },
  garlic: { temperature: { min: 12, max: 25, optimal: 18 }, humidity: { min: 50, max: 70, optimal: 60 } },
  bellPepper: { temperature: { min: 20, max: 30, optimal: 25 }, humidity: { min: 50, max: 70, optimal: 60 } }
};

// Seasonal Events Constants
const SEASONAL_FESTIVALS = {
  spring_blossom: {
    name: "Spring Blossom Festival",
    emoji: "🌸",
    season: "spring",
    duration: 180,
    specialCrops: ["cherry_blossom_tree", "spring_tulip"],
    bonuses: { growth: 1.5, value: 1.3 },
    challenges: ["plant_10_flowers", "harvest_5_special_crops"],
    rewards: { coins: 300, reputation: 50, decoration: "garden_gnome" }
  },
  summer_harvest: {
    name: "Great Summer Harvest",
    emoji: "🌞",
    season: "summer",
    duration: 240,
    specialCrops: ["golden_corn", "rainbow_tomato"],
    bonuses: { yield: 1.4, value: 1.5 },
    challenges: ["harvest_100_crops", "complete_5_deliveries"],
    rewards: { coins: 500, reputation: 75, decoration: "windmill" }
  },
  autumn_bounty: {
    name: "Autumn Bounty Fair",
    emoji: "🍂",
    season: "fall",
    duration: 300,
    specialCrops: ["candy_pumpkin", "harvest_moon_corn"],
    bonuses: { quality: 1.3, value: 1.4 },
    challenges: ["process_20_goods", "sell_1000_value"],
    rewards: { coins: 400, reputation: 60, decoration: "fountain" }
  },
  winter_solstice: {
    name: "Winter Solstice Celebration",
    emoji: "❄️",
    season: "winter",
    duration: 360,
    specialCrops: ["ice_lettuce", "frost_carrot"],
    bonuses: { rarity: 2.0, value: 1.8 },
    challenges: ["survive_cold_snap", "help_10_neighbors"],
    rewards: { coins: 600, reputation: 100, decoration: "lantern" }
  }
};

const HOLIDAY_EVENTS = [
  {
    id: "new_years",
    name: "New Year's Celebration",
    emoji: "🎊",
    date: { month: 0, day: 1 },
    duration: 120,
    specialCrops: ["champagne_grapes"],
    bonuses: { luck: 2.0 },
    rewards: { coins: 200, experience: 100 }
  },
  {
    id: "valentines",
    name: "Valentine's Day",
    emoji: "💝",
    date: { month: 1, day: 14 },
    duration: 180,
    specialCrops: ["heart_strawberry", "love_rose"],
    bonuses: { romance: 1.5 },
    rewards: { coins: 150, reputation: 25 }
  },
  {
    id: "easter",
    name: "Easter Egg Hunt",
    emoji: "🐰",
    date: { month: 3, day: 1 },
    duration: 240,
    specialCrops: ["chocolate_eggplant", "carrot_cake"],
    bonuses: { fun: 1.3 },
    rewards: { coins: 250, experience: 50 }
  },
  {
    id: "halloween",
    name: "Halloween Night",
    emoji: "👻",
    date: { month: 9, day: 31 },
    duration: 300,
    specialCrops: ["pumpkin_spice", "ghost_pepper"],
    bonuses: { spooky: 1.4 },
    rewards: { coins: 300, reputation: 40 }
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving Feast",
    emoji: "🦃",
    date: { month: 10, day: 25 },
    duration: 180,
    specialCrops: ["turkey_berry", "cranberry"],
    bonuses: { gratitude: 1.2 },
    rewards: { coins: 350, reputation: 45 }
  },
  {
    id: "christmas",
    name: "Christmas Miracle",
    emoji: "🎄",
    date: { month: 11, day: 25 },
    duration: 360,
    specialCrops: ["candy_cane", "gingerbread"],
    bonuses: { miracle: 2.0 },
    rewards: { coins: 500, reputation: 75, decoration: "christmas_tree" }
  }
];

const SPECIAL_CROPS = {
  cherry_blossom_tree: { stages: 5, secondsPerStage: 20, baseValue: 80, emoji: "🌸", seasonal: true, season: "spring" },
  spring_tulip: { stages: 3, secondsPerStage: 12, baseValue: 45, emoji: "🌷", seasonal: true, season: "spring" },
  golden_corn: { stages: 4, secondsPerStage: 15, baseValue: 60, emoji: "🌽", seasonal: true, season: "summer" },
  rainbow_tomato: { stages: 4, secondsPerStage: 18, baseValue: 75, emoji: "🍅", seasonal: true, season: "summer" },
  candy_pumpkin: { stages: 5, secondsPerStage: 22, baseValue: 90, emoji: "🎃", seasonal: true, season: "fall" },
  harvest_moon_corn: { stages: 4, secondsPerStage: 16, baseValue: 55, emoji: "🌕", seasonal: true, season: "fall" },
  ice_lettuce: { stages: 3, secondsPerStage: 10, baseValue: 35, emoji: "🧊", seasonal: true, season: "winter" },
  frost_carrot: { stages: 3, secondsPerStage: 14, baseValue: 40, emoji: "🥕", seasonal: true, season: "winter" },
  champagne_grapes: { stages: 5, secondsPerStage: 25, baseValue: 120, emoji: "🍾", holiday: true },
  heart_strawberry: { stages: 4, secondsPerStage: 16, baseValue: 65, emoji: "💝", holiday: true },
  love_rose: { stages: 3, secondsPerStage: 12, baseValue: 50, emoji: "🌹", holiday: true },
  chocolate_eggplant: { stages: 4, secondsPerStage: 20, baseValue: 70, emoji: "🍫", holiday: true },
  carrot_cake: { stages: 5, secondsPerStage: 30, baseValue: 150, emoji: "🎂", holiday: true },
  pumpkin_spice: { stages: 4, secondsPerStage: 18, baseValue: 55, emoji: "🎃", holiday: true },
  ghost_pepper: { stages: 4, secondsPerStage: 22, baseValue: 85, emoji: "👻", holiday: true },
  turkey_berry: { stages: 4, secondsPerStage: 20, baseValue: 60, emoji: "🦃", holiday: true },
  cranberry: { stages: 3, secondsPerStage: 15, baseValue: 40, emoji: "🫐", holiday: true },
  candy_cane: { stages: 4, secondsPerStage: 25, baseValue: 100, emoji: "🍭", holiday: true },
  gingerbread: { stages: 5, secondsPerStage: 35, baseValue: 180, emoji: "🍪", holiday: true },
  christmas_tree: { stages: 6, secondsPerStage: 40, baseValue: 200, emoji: "🎄", holiday: true }
};

// Achievement Expansion Constants
const EXPANDED_ACHIEVEMENTS = {
  // Farming Mastery
  farming_mastery: {
    id: "farming_mastery",
    name: "Farming Master",
    description: "Master the art of farming",
    category: "farming",
    tiers: [
      { threshold: 1, reward: { coins: 100, title: "Novice Farmer" } },
      { threshold: 10, reward: { coins: 250, title: "Apprentice Farmer" } },
      { threshold: 50, reward: { coins: 500, title: "Journeyman Farmer" } },
      { threshold: 100, reward: { coins: 1000, title: "Expert Farmer" } },
      { threshold: 500, reward: { coins: 2500, title: "Master Farmer" } },
      { threshold: 1000, reward: { coins: 5000, title: "Grand Master Farmer", decoration: "golden_scythe" } }
    ]
  },

  // Crop Collection
  crop_collector: {
    id: "crop_collector",
    name: "Crop Collector",
    description: "Collect all crop types",
    category: "collection",
    tiers: [
      { threshold: 5, reward: { coins: 200, title: "Seed Collector" } },
      { threshold: 10, reward: { coins: 500, title: "Crop Enthusiast" } },
      { threshold: 15, reward: { coins: 1000, title: "Botanical Expert" } },
      { threshold: 20, reward: { coins: 2000, title: "Master Botanist", decoration: "plantarium" } }
    ]
  },

  // Wealth Building
  wealth_builder: {
    id: "wealth_builder",
    name: "Wealth Builder",
    description: "Accumulate coins through various means",
    category: "wealth",
    tiers: [
      { threshold: 1000, reward: { reputation: 25, title: "Thrifty" } },
      { threshold: 10000, reward: { reputation: 50, title: "Wealthy" } },
      { threshold: 50000, reward: { reputation: 100, title: "Rich" } },
      { threshold: 100000, reward: { reputation: 200, title: "Millionaire", decoration: "gold_coin" } }
    ]
  },

  // Social Butterfly
  social_butterfly: {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Build relationships and compete",
    category: "social",
    tiers: [
      { threshold: 1, reward: { reputation: 10, title: "Friendly" } },
      { threshold: 5, reward: { reputation: 25, title: "Popular" } },
      { threshold: 10, reward: { reputation: 50, title: "Well-Liked" } },
      { threshold: 25, reward: { reputation: 100, title: "Community Leader", decoration: "community_badge" } }
    ]
  },

  // Event Champion
  event_champion: {
    id: "event_champion",
    name: "Event Champion",
    description: "Participate and succeed in events",
    category: "events",
    tiers: [
      { threshold: 1, reward: { experience: 50, title: "Event Goer" } },
      { threshold: 5, reward: { experience: 150, title: "Festival Regular" } },
      { threshold: 10, reward: { experience: 300, title: "Event Enthusiast" } },
      { threshold: 25, reward: { experience: 750, title: "Event Master", decoration: "trophy_case" } }
    ]
  },

  // Innovation Leader
  innovation_leader: {
    id: "innovation_leader",
    name: "Innovation Leader",
    description: "Advance farming technology",
    category: "technology",
    tiers: [
      { threshold: 1, reward: { researchPoints: 50, title: "Inventor" } },
      { threshold: 5, reward: { researchPoints: 150, title: "Researcher" } },
      { threshold: 10, reward: { researchPoints: 300, title: "Scientist" } },
      { threshold: 20, reward: { researchPoints: 600, title: "Innovation Pioneer", decoration: "lab_equipment" } }
    ]
  }
};

const MILESTONE_REWARDS = {
  first_harvest: { name: "First Harvest", reward: { coins: 50, experience: 10 }, unlocked: false },
  tenth_harvest: { name: "10th Harvest", reward: { coins: 100, experience: 25 }, unlocked: false },
  hundredth_harvest: { name: "100th Harvest", reward: { coins: 500, experience: 100 }, unlocked: false },
  first_festival: { name: "First Festival", reward: { reputation: 25, decoration: "festival_ribbon" }, unlocked: false },
  first_competition_win: { name: "First Competition Win", reward: { reputation: 50, decoration: "victory_medal" }, unlocked: false },
  town_level_5: { name: "Town Level 5", reward: { reputation: 100, theme: "modern" }, unlocked: false },
  all_basic_crops: { name: "Complete Crop Collection", reward: { coins: 1000, decoration: "seed_vault" }, unlocked: false },
  first_special_crop: { name: "First Special Crop", reward: { experience: 50, decoration: "rare_seed" }, unlocked: false },
  irrigation_master: { name: "Irrigation Master", reward: { reputation: 75, decoration: "water_tower" }, unlocked: false },
  genetics_pioneer: { name: "Genetics Pioneer", reward: { researchPoints: 200, decoration: "dna_helix" }, unlocked: false }
};

const PRESTIGE_REQUIREMENTS = {
  level: 50,
  totalHarvests: 500,
  coins: 100000,
  reputation: 500,
  allAchievements: true
};

// Mini-Games Constants
const HARVEST_RUSH_CONFIG = {
  timeLimit: 60, // seconds
  comboMultiplier: 1.5,
  perfectBonus: 2.0,
  readyCropsOnly: true,
  pointsPerHarvest: 10,
  comboTimeWindow: 3 // seconds
};

const MARKET_TRADER_CONFIG = {
  startingCash: 1000,
  timeLimit: 120,
  commodities: ["carrot", "potato", "tomato", "corn"],
  priceVolatility: 0.1,
  transactionFee: 0.05, // 5%
  winThreshold: 1.2 // 20% profit to win
};

const PUZZLE_FARMING_CONFIG = {
  gridSize: 5,
  matchLength: 3,
  timeLimit: 90,
  crops: ["carrot", "lettuce", "potato", "tomato"],
  specialMoves: {
    bomb: { radius: 2, cost: 100 },
    shuffle: { cost: 50 },
    hint: { cost: 25 }
  },
  scoring: {
    match3: 100,
    match4: 200,
    match5: 500,
    timeBonus: 10
  }
};

// Global Marketplace Constants
const MARKETPLACE_CONFIG = {
  tradeFee: 0.05, // 5% fee on trades
  auctionFee: 0.1, // 10% fee on auctions
  maxListings: 50,
  listingDuration: 7 * 24 * 3600, // 7 days in seconds
  reputationThresholds: {
    trusted: 150,
    merchant: 300,
    elite: 500
  },
  commodityVolatility: 0.15, // 15% price volatility
  priceUpdateInterval: 3600 // 1 hour in seconds
};

const TRADE_TYPES = {
  direct: { name: "Direct Trade", fee: 0.05, instant: true },
  auction: { name: "Auction", fee: 0.1, instant: false },
  commodity: { name: "Commodity Exchange", fee: 0.02, instant: true }
};

const RARE_ITEMS = {
  golden_carrot: { name: "Golden Carrot", basePrice: 500, rarity: "legendary" },
  rainbow_potato: { name: "Rainbow Potato", basePrice: 750, rarity: "legendary" },
  diamond_tomato: { name: "Diamond Tomato", basePrice: 1000, rarity: "mythic" },
  mystic_lettuce: { name: "Mystic Lettuce", basePrice: 600, rarity: "legendary" },
  enchanted_corn: { name: "Enchanted Corn", basePrice: 800, rarity: "legendary" }
};

// Weather Disaster Constants
const DISASTER_TYPES = {
  tornado: {
    name: "Tornado",
    emoji: "🌪️",
    duration: 30, // seconds
    damage: 0.8, // 80% chance to destroy crops
    preparation: "tornadoBunker",
    description: "Destructive wind storm that can destroy entire plots"
  },
  flood: {
    name: "Flood",
    emoji: "🌊",
    duration: 45,
    damage: 0.6,
    preparation: "floodBarriers",
    description: "Rising water levels that damage low-lying crops"
  },
  drought: {
    name: "Drought",
    emoji: "☀️",
    duration: 60,
    damage: 0.4,
    preparation: "droughtReservoir",
    description: "Extended dry period that withers crops over time"
  },
  storm: {
    name: "Thunderstorm",
    emoji: "⛈️",
    duration: 20,
    damage: 0.3,
    preparation: "stormShelter",
    description: "Heavy rain and wind that can damage crops"
  },
  hail: {
    name: "Hail Storm",
    emoji: "🌨️",
    duration: 15,
    damage: 0.5,
    preparation: "stormShelter",
    description: "Ice pellets that bruise and damage crops"
  }
};

const DISASTER_PREPARATION = {
  stormShelter: { name: "Storm Shelter", cost: 200, effectiveness: 0.7, description: "Protects against storms and hail" },
  floodBarriers: { name: "Flood Barriers", cost: 300, effectiveness: 0.8, description: "Prevents flood damage to crops" },
  droughtReservoir: { name: "Drought Reservoir", cost: 400, effectiveness: 0.6, description: "Stores water for drought periods" },
  tornadoBunker: { name: "Tornado Bunker", cost: 500, effectiveness: 0.9, description: "Ultimate protection against tornadoes" }
};

const INSURANCE_TYPES = {
  basic: { name: "Basic Coverage", cost: 50, coverage: 0.5, description: "50% reimbursement for crop losses" },
  standard: { name: "Standard Coverage", cost: 100, coverage: 0.75, description: "75% reimbursement for crop losses" },
  premium: { name: "Premium Coverage", cost: 200, coverage: 0.9, description: "90% reimbursement for crop losses" },
  comprehensive: { name: "Comprehensive", cost: 400, coverage: 1.0, description: "100% reimbursement for all losses" }
};

const DISASTER_RARITY = {
  common: { chance: 0.4, severity: 0.5 },
  uncommon: { chance: 0.3, severity: 0.7 },
  rare: { chance: 0.2, severity: 0.9 },
  epic: { chance: 0.1, severity: 1.2 }
};

// Sustainability System Constants
const RENEWABLE_ENERGY = {
  solarPanels: {
    name: "Solar Panel Array",
    cost: 500,
    energyOutput: 20,
    maintenanceCost: 10,
    description: "Generates clean energy from sunlight",
    requirements: { level: 5 }
  },
  windTurbines: {
    name: "Wind Turbine",
    cost: 750,
    energyOutput: 30,
    maintenanceCost: 15,
    description: "Harnesses wind power for sustainable energy",
    requirements: { level: 8 }
  },
  hydroelectric: {
    name: "Hydroelectric Generator",
    cost: 1000,
    energyOutput: 40,
    maintenanceCost: 20,
    description: "Uses water flow for consistent energy production",
    requirements: { level: 12 }
  },
  bioFuelGenerator: {
    name: "Biofuel Generator",
    cost: 600,
    energyOutput: 25,
    maintenanceCost: 12,
    description: "Converts organic waste into clean energy",
    requirements: { level: 6 }
  }
};

const ECO_CERTIFICATIONS = {
  organic_farmer: {
    name: "Certified Organic Farmer",
    requirements: { organicFarming: true, soilHealth: 90 },
    benefits: { premiumPrice: 0.25, reputationBonus: 50 },
    description: "Demonstrates commitment to organic farming practices"
  },
  green_energy: {
    name: "Green Energy Producer",
    requirements: { energyProduction: 50, renewableSources: 2 },
    benefits: { energySubsidy: 0.3, ecoBonus: 0.2 },
    description: "Leads in renewable energy production"
  },
  water_steward: {
    name: "Water Conservation Steward",
    requirements: { waterUsage: -50, waterConservation: true },
    benefits: { waterEfficiency: 0.3, droughtResistance: 0.4 },
    description: "Exemplary water conservation practices"
  },
  biodiversity_champion: {
    name: "Biodiversity Champion",
    requirements: { biodiversity: 80, naturalPestControl: true },
    benefits: { pestResistance: 0.5, yieldBonus: 0.15 },
    description: "Supports and enhances local biodiversity"
  },
  carbon_neutral: {
    name: "Carbon Neutral Certified",
    requirements: { carbonFootprint: -100, wasteRecycling: true },
    benefits: { carbonCredits: 0.2, taxIncentive: 0.1 },
    description: "Achieves carbon neutrality through sustainable practices"
  }
};

const SUSTAINABLE_PRACTICES = {
  organicFarming: {
    name: "Organic Farming",
    cost: 300,
    description: "Eliminate chemical pesticides and fertilizers",
    benefits: { healthBonus: 0.2, premiumPrice: 0.3 },
    environmentalImpact: { soilHealth: 15, waterUsage: -10 }
  },
  cropRotation: {
    name: "Advanced Crop Rotation",
    cost: 200,
    description: "Implement scientific crop rotation patterns",
    benefits: { soilHealthBonus: 0.25, pestResistance: 0.15 },
    environmentalImpact: { soilHealth: 20, biodiversity: 10 }
  },
  waterConservation: {
    name: "Water Conservation System",
    cost: 400,
    description: "Install drip irrigation and rainwater harvesting",
    benefits: { waterEfficiency: 0.4, droughtResistance: 0.3 },
    environmentalImpact: { waterUsage: -30, airQuality: 5 }
  },
  naturalPestControl: {
    name: "Natural Pest Control",
    cost: 250,
    description: "Use beneficial insects and companion planting",
    benefits: { pestResistance: 0.35, biodiversityBonus: 0.2 },
    environmentalImpact: { biodiversity: 25, airQuality: 10 }
  },
  wasteRecycling: {
    name: "Waste Recycling Program",
    cost: 350,
    description: "Convert farm waste into compost and energy",
    benefits: { fertilizerSavings: 0.3, energyBonus: 0.15 },
    environmentalImpact: { wasteProduction: -40, soilHealth: 10 }
  }
};

const ENVIRONMENTAL_IMPACT_BASELINES = {
  waterUsage: 100,      // Base water consumption per plot
  soilHealth: 100,      // Base soil quality
  biodiversity: 50,     // Base biodiversity index
  airQuality: 100,      // Base air quality
  wasteProduction: 20   // Base waste per plot
};

const SUSTAINABILITY_THRESHOLDS = {
  excellent: { score: 90, benefits: { reputationBonus: 100, premiumPrice: 0.2 } },
  good: { score: 75, benefits: { reputationBonus: 50, premiumPrice: 0.1 } },
  fair: { score: 60, benefits: { reputationBonus: 25, premiumPrice: 0.05 } },
  poor: { score: 45, benefits: { penalty: 0.1 } },
  critical: { score: 30, benefits: { penalty: 0.25, restrictions: true } }
};

// Advanced Research Constants
const RESEARCH_FIELDS = {
  nanotechnology: {
    name: "Nanotechnology",
    description: "Molecular-level farming innovations",
    unlockLevel: 20,
    baseCost: 1000,
    icon: "⚛️"
  },
  aiFarming: {
    name: "AI Farming",
    description: "Artificial intelligence for farm management",
    unlockLevel: 18,
    baseCost: 800,
    icon: "🤖"
  },
  verticalFarming: {
    name: "Vertical Farming",
    description: "Multi-level growing systems",
    unlockLevel: 16,
    baseCost: 600,
    icon: "🏢"
  },
  spaceAgriculture: {
    name: "Space Agriculture",
    description: "Farming in extreme environments",
    unlockLevel: 25,
    baseCost: 1500,
    icon: "🚀"
  }
};

const RESEARCH_PROJECTS = {
  // Nanotechnology Projects
  nano_fertilizers: {
    name: "Nano-Fertilizers",
    field: "nanotechnology",
    description: "Precision nutrient delivery at molecular level",
    duration: 180, // seconds
    cost: 2000,
    requirements: [],
    rewards: { yieldBonus: 0.3, efficiencyBonus: 0.25 },
    unlocks: ["precision_nutrients"]
  },
  smart_seeds: {
    name: "Smart Seeds",
    field: "nanotechnology",
    description: "Genetically programmed seeds with built-in sensors",
    duration: 240,
    cost: 3000,
    requirements: ["nano_fertilizers"],
    rewards: { growthSpeed: 0.4, healthBonus: 0.35 },
    unlocks: ["adaptive_crops"]
  },
  molecular_pest_control: {
    name: "Molecular Pest Control",
    field: "nanotechnology",
    description: "Targeted pest elimination at DNA level",
    duration: 300,
    cost: 4000,
    requirements: ["smart_seeds"],
    rewards: { pestResistance: 0.8, biodiversityBonus: 0.2 },
    unlocks: ["eco_nanotech"]
  },

  // AI Farming Projects
  predictive_analytics: {
    name: "Predictive Analytics",
    field: "aiFarming",
    description: "AI-powered yield and market predictions",
    duration: 150,
    cost: 1500,
    requirements: [],
    rewards: { marketAccuracy: 0.4, planningBonus: 0.3 },
    unlocks: ["ai_predictions"]
  },
  autonomous_harvesters: {
    name: "Autonomous Harvesters",
    field: "aiFarming",
    description: "Self-driving harvesting robots",
    duration: 200,
    cost: 2500,
    requirements: ["predictive_analytics"],
    rewards: { automationBonus: 0.5, efficiencyBonus: 0.4 },
    unlocks: ["robot_harvesting"]
  },
  climate_ai: {
    name: "Climate Adaptation AI",
    field: "aiFarming",
    description: "AI systems for climate change adaptation",
    duration: 280,
    cost: 3500,
    requirements: ["autonomous_harvesters"],
    rewards: { climateResistance: 0.6, sustainabilityBonus: 0.3 },
    unlocks: ["smart_climate"]
  },

  // Vertical Farming Projects
  hydroponic_systems: {
    name: "Advanced Hydroponics",
    field: "verticalFarming",
    description: "Water-efficient vertical growing systems",
    duration: 120,
    cost: 1000,
    requirements: [],
    rewards: { waterEfficiency: 0.6, spaceEfficiency: 0.5 },
    unlocks: ["hydroponics"]
  },
  led_optimization: {
    name: "LED Light Optimization",
    field: "verticalFarming",
    description: "Perfect light spectrum for maximum growth",
    duration: 180,
    cost: 2000,
    requirements: ["hydroponic_systems"],
    rewards: { growthSpeed: 0.5, energyEfficiency: 0.4 },
    unlocks: ["optimal_lighting"]
  },
  multi_level_automation: {
    name: "Multi-Level Automation",
    field: "verticalFarming",
    description: "Fully automated vertical farming",
    duration: 300,
    cost: 4000,
    requirements: ["led_optimization"],
    rewards: { automationBonus: 0.7, yieldBonus: 0.6 },
    unlocks: ["vertical_automation"]
  },

  // Space Agriculture Projects
  zero_gravity_crops: {
    name: "Zero-Gravity Crops",
    field: "spaceAgriculture",
    description: "Crops that grow in zero gravity",
    duration: 400,
    cost: 5000,
    requirements: [],
    rewards: { spaceYieldBonus: 1.0, radiationResistance: 0.8 },
    unlocks: ["space_crops"]
  },
  closed_loop_systems: {
    name: "Closed-Loop Life Support",
    field: "spaceAgriculture",
    description: "Self-sustaining agricultural systems",
    duration: 500,
    cost: 7000,
    requirements: ["zero_gravity_crops"],
    rewards: { resourceEfficiency: 0.9, sustainabilityBonus: 0.8 },
    unlocks: ["life_support"]
  },
  mars_terraforming: {
    name: "Mars Terraforming Tech",
    field: "spaceAgriculture",
    description: "Technology to make Mars habitable",
    duration: 600,
    cost: 10000,
    requirements: ["closed_loop_systems"],
    rewards: { terraformingBonus: 1.5, extremeEnvironmentBonus: 1.0 },
    unlocks: ["mars_terraforming"]
  }
};

const BREAKTHROUGHS = {
  quantum_harvesting: {
    name: "Quantum Harvesting",
    description: "Instant harvesting through quantum entanglement",
    requirements: { nanotechnology: 5, aiFarming: 3 },
    rewards: { instantHarvest: true, quantumYieldBonus: 0.5 },
    rarity: "legendary"
  },
  sentient_crops: {
    name: "Sentient Crop Networks",
    description: "Crops with collective intelligence",
    requirements: { aiFarming: 5, nanotechnology: 4 },
    rewards: { networkIntelligence: true, adaptiveGrowth: 0.8 },
    rarity: "mythic"
  },
  dimensional_farming: {
    name: "Dimensional Farming",
    description: "Farm across multiple dimensions",
    requirements: { spaceAgriculture: 3, verticalFarming: 5 },
    rewards: { dimensionalYield: 2.0, spaceTimeEfficiency: 0.9 },
    rarity: "transcendent"
  }
};

const RESEARCH_FACILITIES = {
  basic_lab: {
    name: "Basic Research Lab",
    cost: 5000,
    description: "Fundamental research capabilities",
    benefits: { researchBonus: 0.1, efficiency: 1.0 }
  },
  advanced_lab: {
    name: "Advanced Research Center",
    cost: 15000,
    description: "Enhanced research facilities",
    requirements: { level: 15 },
    benefits: { researchBonus: 0.25, efficiency: 1.5, parallelProjects: 2 }
  },
  quantum_lab: {
    name: "Quantum Research Lab",
    cost: 50000,
    description: "Cutting-edge quantum research",
    requirements: { level: 25, breakthroughs: 3 },
    benefits: { researchBonus: 0.5, efficiency: 2.0, parallelProjects: 5, quantumComputing: true }
  }
};

// Animal Husbandry Constants
const ANIMAL_TYPES = {
  cow: {
    name: "Cow",
    description: "Produces milk and beef",
    baseCost: 500,
    products: { milk: 10, meat: 50 },
    productionTime: 180, // seconds
    breedingTime: 3600, // seconds
    traits: ["milk_yield", "meat_quality", "health", "temperament"],
    facility: "barn"
  },
  chicken: {
    name: "Chicken",
    description: "Produces eggs and meat",
    baseCost: 50,
    products: { eggs: 5, meat: 5 },
    productionTime: 120,
    breedingTime: 1800,
    traits: ["egg_yield", "meat_quality", "disease_resistance", "foraging"],
    facility: "chickenCoop"
  },
  pig: {
    name: "Pig",
    description: "Produces meat and manure",
    baseCost: 200,
    products: { meat: 30, manure: 20 },
    productionTime: 300,
    breedingTime: 2700,
    traits: ["meat_quality", "growth_rate", "feed_efficiency", "temperament"],
    facility: "pigPen"
  },
  sheep: {
    name: "Sheep",
    description: "Produces wool and meat",
    baseCost: 300,
    products: { wool: 15, meat: 25 },
    productionTime: 240,
    breedingTime: 3200,
    traits: ["wool_quality", "meat_quality", "hardiness", "flocking"],
    facility: "sheepPasture"
  },
  horse: {
    name: "Horse",
    description: "Provides transportation and work",
    baseCost: 1000,
    products: { manure: 10 },
    productionTime: 0,
    breedingTime: 4200,
    traits: ["speed", "strength", "endurance", "intelligence"],
    facility: "stable"
  }
};

const ANIMAL_TRAITS = {
  // Production traits
  milk_yield: { name: "Milk Yield", description: "Increases milk production", rarity: "common", effect: { milkBonus: 0.1 } },
  egg_yield: { name: "Egg Yield", description: "Increases egg production", rarity: "common", effect: { eggBonus: 0.1 } },
  wool_quality: { name: "Wool Quality", description: "Improves wool value", rarity: "common", effect: { woolBonus: 0.15 } },

  // Quality traits
  meat_quality: { name: "Meat Quality", description: "Improves meat value", rarity: "common", effect: { meatBonus: 0.2 } },
  premium_quality: { name: "Premium Quality", description: "Increases all product values", rarity: "rare", effect: { premiumBonus: 0.25 } },

  // Health traits
  disease_resistance: { name: "Disease Resistance", description: "Reduces illness chance", rarity: "uncommon", effect: { healthBonus: 0.3 } },
  longevity: { name: "Longevity", description: "Increases lifespan", rarity: "uncommon", effect: { lifespanBonus: 0.2 } },
  hardiness: { name: "Hardiness", description: "Better weather resistance", rarity: "uncommon", effect: { weatherResistance: 0.25 } },

  // Behavioral traits
  temperament: { name: "Good Temperament", description: "Easier to handle", rarity: "common", effect: { handlingBonus: 0.15 } },
  intelligence: { name: "High Intelligence", description: "Learns faster", rarity: "rare", effect: { learningBonus: 0.2 } },
  foraging: { name: "Good Foraging", description: "Finds own food", rarity: "common", effect: { feedEfficiency: 0.3 } },
  flocking: { name: "Good Flocking", description: "Works well in groups", rarity: "uncommon", effect: { groupBonus: 0.2 } },

  // Performance traits
  speed: { name: "Speed", description: "Faster movement", rarity: "uncommon", effect: { speedBonus: 0.25 } },
  strength: { name: "Strength", description: "Better work capacity", rarity: "uncommon", effect: { strengthBonus: 0.3 } },
  endurance: { name: "Endurance", description: "Works longer", rarity: "rare", effect: { enduranceBonus: 0.4 } },
  growth_rate: { name: "Fast Growth", description: "Grows quicker", rarity: "uncommon", effect: { growthBonus: 0.35 } },
  feed_efficiency: { name: "Feed Efficiency", description: "Less food required", rarity: "common", effect: { feedEfficiency: 0.25 } }
};

const ANIMAL_SHOWS = {
  county_fair: {
    name: "County Fair",
    description: "Local animal showcase",
    entryFee: 50,
    duration: 300, // 5 minutes
    categories: ["dairy", "meat", "wool", "youth"],
    prizes: { 1: 500, 2: 300, 3: 150 },
    requirements: { level: 5 }
  },
  state_championship: {
    name: "State Championship",
    description: "State-level competition",
    entryFee: 200,
    duration: 600,
    categories: ["dairy", "meat", "wool", "performance"],
    prizes: { 1: 2000, 2: 1000, 3: 500 },
    requirements: { level: 12, showsWon: 3 }
  },
  national_expo: {
    name: "National Livestock Expo",
    description: "National championship",
    entryFee: 500,
    duration: 900,
    categories: ["dairy", "meat", "wool", "performance", "genetics"],
    prizes: { 1: 5000, 2: 2500, 3: 1000 },
    requirements: { level: 20, showsWon: 5 }
  },
  international_show: {
    name: "International Show",
    description: "World-class competition",
    entryFee: 1000,
    duration: 1200,
    categories: ["dairy", "meat", "wool", "performance", "genetics", "beauty"],
    prizes: { 1: 10000, 2: 5000, 3: 2500 },
    requirements: { level: 30, showsWon: 10, championshipsWon: 3 }
  }
};



const FACILITY_UPGRADES = {
  barn: {
    levels: [
      { capacity: 10, cost: 0 },
      { capacity: 20, cost: 2000 },
      { capacity: 30, cost: 5000 },
      { capacity: 50, cost: 10000 }
    ]
  },
  stable: {
    levels: [
      { capacity: 5, cost: 0 },
      { capacity: 10, cost: 3000 },
      { capacity: 15, cost: 6000 },
      { capacity: 25, cost: 12000 }
    ]
  },
  chickenCoop: {
    levels: [
      { capacity: 20, cost: 0 },
      { capacity: 40, cost: 1000 },
      { capacity: 60, cost: 2500 },
      { capacity: 100, cost: 5000 }
    ]
  },
  pigPen: {
    levels: [
      { capacity: 8, cost: 0 },
      { capacity: 16, cost: 1500 },
      { capacity: 24, cost: 3500 },
      { capacity: 40, cost: 7000 }
    ]
  },
  sheepPasture: {
    levels: [
      { capacity: 15, cost: 0 },
      { capacity: 30, cost: 1800 },
      { capacity: 45, cost: 4000 },
      { capacity: 75, cost: 8000 }
    ]
  }
};

// Education System Constants
const FARMING_SCHOOLS = {
  beginner: {
    name: "Beginner's Agricultural Academy",
    levelRequirement: 1,
    description: "Learn the basics of farming",
    courses: ["basic_crops", "soil_basics", "watering_101"]
  },
  intermediate: {
    name: "Intermediate Farming Institute",
    levelRequirement: 5,
    description: "Advanced farming techniques",
    courses: ["crop_rotation", "pest_management", "yield_optimization"]
  },
  advanced: {
    name: "Elite Agricultural University",
    levelRequirement: 10,
    description: "Master-level farming education",
    courses: ["genetic_engineering", "precision_agriculture", "sustainable_practices"]
  },
  specialized: {
    name: "Specialized Research Center",
    levelRequirement: 15,
    description: "Cutting-edge farming research",
    courses: ["ai_farming", "vertical_farming", "climate_adaptation"]
  }
};

const COURSE_CATALOG = {
  // Beginner Courses
  basic_crops: {
    name: "Basic Crop Cultivation",
    duration: 30, // seconds
    cost: 50,
    prerequisites: [],
    rewards: { experience: 100, skillPoints: 1 },
    description: "Learn to grow carrots, potatoes, lettuce, and tomatoes effectively"
  },
  soil_basics: {
    name: "Soil Science Fundamentals",
    duration: 45,
    cost: 75,
    prerequisites: [],
    rewards: { experience: 150, skillPoints: 1 },
    description: "Understand soil types, pH levels, and nutrient management"
  },
  watering_101: {
    name: "Irrigation Techniques",
    duration: 20,
    cost: 40,
    prerequisites: [],
    rewards: { experience: 80, skillPoints: 1 },
    description: "Master proper watering schedules and techniques"
  },

  // Intermediate Courses
  crop_rotation: {
    name: "Advanced Crop Rotation",
    duration: 60,
    cost: 150,
    prerequisites: ["basic_crops", "soil_basics"],
    rewards: { experience: 300, skillPoints: 2 },
    description: "Learn optimal crop rotation patterns for maximum yield"
  },
  pest_management: {
    name: "Integrated Pest Management",
    duration: 45,
    cost: 125,
    prerequisites: ["basic_crops"],
    rewards: { experience: 250, skillPoints: 2 },
    description: "Natural and chemical pest control methods"
  },
  yield_optimization: {
    name: "Yield Optimization Strategies",
    duration: 75,
    cost: 200,
    prerequisites: ["crop_rotation", "watering_101"],
    rewards: { experience: 400, skillPoints: 3 },
    description: "Maximize crop yields through scientific methods"
  },

  // Advanced Courses
  genetic_engineering: {
    name: "Genetic Engineering Basics",
    duration: 120,
    cost: 500,
    prerequisites: ["yield_optimization"],
    rewards: { experience: 800, skillPoints: 5 },
    description: "Introduction to crop genetic modification"
  },
  precision_agriculture: {
    name: "Precision Agriculture",
    duration: 90,
    cost: 400,
    prerequisites: ["yield_optimization", "pest_management"],
    rewards: { experience: 600, skillPoints: 4 },
    description: "Use technology for precise farming decisions"
  },
  sustainable_practices: {
    name: "Sustainable Farming Practices",
    duration: 100,
    cost: 450,
    prerequisites: ["crop_rotation", "soil_basics"],
    rewards: { experience: 700, skillPoints: 4 },
    description: "Environmentally friendly farming methods"
  },

  // Specialized Courses
  ai_farming: {
    name: "AI-Powered Farming",
    duration: 150,
    cost: 750,
    prerequisites: ["precision_agriculture", "genetic_engineering"],
    rewards: { experience: 1200, skillPoints: 7 },
    description: "Implement AI systems for farm automation"
  },
  vertical_farming: {
    name: "Vertical Farming Technology",
    duration: 180,
    cost: 1000,
    prerequisites: ["precision_agriculture", "sustainable_practices"],
    rewards: { experience: 1500, skillPoints: 8 },
    description: "Multi-level growing systems and hydroponics"
  },
  climate_adaptation: {
    name: "Climate Change Adaptation",
    duration: 135,
    cost: 800,
    prerequisites: ["sustainable_practices", "genetic_engineering"],
    rewards: { experience: 1100, skillPoints: 6 },
    description: "Adapt farming to changing climate conditions"
  }
};

const CERTIFICATIONS = {
  certified_farmer: {
    name: "Certified Farmer",
    requirements: ["basic_crops", "soil_basics", "watering_101"],
    rewards: { reputation: 50, title: "Certified Farmer" },
    description: "Basic farming certification"
  },
  master_grower: {
    name: "Master Grower",
    requirements: ["crop_rotation", "pest_management", "yield_optimization"],
    rewards: { reputation: 100, yieldBonus: 0.1, title: "Master Grower" },
    description: "Advanced crop cultivation mastery"
  },
  sustainability_expert: {
    name: "Sustainability Expert",
    requirements: ["sustainable_practices", "climate_adaptation"],
    rewards: { reputation: 150, ecoBonus: 0.15, title: "Sustainability Expert" },
    description: "Environmental farming leadership"
  },
  tech_innovator: {
    name: "Tech Farming Innovator",
    requirements: ["precision_agriculture", "ai_farming", "vertical_farming"],
    rewards: { reputation: 200, automationBonus: 0.2, title: "Tech Innovator" },
    description: "Technology-driven farming excellence"
  },
  research_pioneer: {
    name: "Research Pioneer",
    requirements: ["genetic_engineering", "ai_farming", "climate_adaptation"],
    rewards: { reputation: 250, researchBonus: 0.25, title: "Research Pioneer" },
    description: "Cutting-edge agricultural research"
  }
};

const SKILL_TREES = {
  farming: {
    name: "Farming Mastery",
    description: "Core farming skills and techniques",
    skills: {
      quick_growth: {
        name: "Quick Growth",
        description: "Reduce crop growth time by 10%",
        cost: 5,
        prerequisites: [],
        maxLevel: 5,
        effect: { growthSpeed: 0.1 }
      },
      yield_boost: {
        name: "Yield Boost",
        description: "Increase crop yields by 5%",
        cost: 8,
        prerequisites: ["quick_growth"],
        maxLevel: 10,
        effect: { yieldBonus: 0.05 }
      },
      quality_master: {
        name: "Quality Master",
        description: "Improve crop quality by 3%",
        cost: 6,
        prerequisites: ["yield_boost"],
        maxLevel: 8,
        effect: { qualityBonus: 0.03 }
      }
    }
  },
  business: {
    name: "Business Acumen",
    description: "Market and financial management skills",
    skills: {
      market_sense: {
        name: "Market Sense",
        description: "Better market price predictions",
        cost: 4,
        prerequisites: [],
        maxLevel: 3,
        effect: { marketAccuracy: 0.15 }
      },
      negotiation: {
        name: "Negotiation",
        description: "Better trade deals",
        cost: 6,
        prerequisites: ["market_sense"],
        maxLevel: 5,
        effect: { tradeBonus: 0.08 }
      },
      efficiency: {
        name: "Operational Efficiency",
        description: "Reduce operational costs",
        cost: 10,
        prerequisites: ["negotiation"],
        maxLevel: 5,
        effect: { costReduction: 0.1 }
      }
    }
  },
  technology: {
    name: "Technology Integration",
    description: "Advanced farming technology skills",
    skills: {
      automation: {
        name: "Basic Automation",
        description: "Unlock automated systems",
        cost: 12,
        prerequisites: [],
        maxLevel: 1,
        effect: { automationUnlock: true }
      },
      ai_optimization: {
        name: "AI Optimization",
        description: "Better AI farm management",
        cost: 15,
        prerequisites: ["automation"],
        maxLevel: 3,
        effect: { aiEfficiency: 0.2 }
      },
      data_analysis: {
        name: "Data Analysis",
        description: "Better farm analytics",
        cost: 8,
        prerequisites: ["automation"],
        maxLevel: 5,
        effect: { analyticsBonus: 0.15 }
      }
    }
  },
  sustainability: {
    name: "Environmental Stewardship",
    description: "Sustainable and eco-friendly farming",
    skills: {
      eco_farming: {
        name: "Eco-Friendly Farming",
        description: "Reduce environmental impact",
        cost: 7,
        prerequisites: [],
        maxLevel: 5,
        effect: { ecoBonus: 0.1 }
      },
      water_conservation: {
        name: "Water Conservation",
        description: "Reduce water usage by 15%",
        cost: 9,
        prerequisites: ["eco_farming"],
        maxLevel: 3,
        effect: { waterEfficiency: 0.15 }
      },
      biodiversity: {
        name: "Biodiversity Support",
        description: "Support local wildlife",
        cost: 11,
        prerequisites: ["water_conservation"],
        maxLevel: 4,
        effect: { biodiversityBonus: 0.12 }
      }
    }
  }
};

// Advanced Automation Constants
const AI_PERSONALITIES = {
  conservative: { riskTolerance: 0.2, efficiencyFocus: 0.8, innovation: 0.3 },
  balanced: { riskTolerance: 0.5, efficiencyFocus: 0.6, innovation: 0.5 },
  aggressive: { riskTolerance: 0.8, efficiencyFocus: 0.4, innovation: 0.7 },
  experimental: { riskTolerance: 0.9, efficiencyFocus: 0.3, innovation: 0.9 }
};

const OPTIMIZATION_STRATEGIES = {
  profit_maximization: { weight: 0.4, description: "Focus on highest profit margins" },
  risk_minimization: { weight: 0.3, description: "Minimize crop failure risks" },
  sustainability_focus: { weight: 0.2, description: "Balance profit with environmental impact" },
  innovation_driven: { weight: 0.1, description: "Experiment with new farming techniques" }
};

const SCHEDULING_PATTERNS = {
  intensive: { description: "Maximize plot utilization, higher risk", efficiency: 1.2, risk: 1.5 },
  balanced: { description: "Standard farming practices", efficiency: 1.0, risk: 1.0 },
  conservative: { description: "Safe, reliable methods", efficiency: 0.8, risk: 0.6 },
  dynamic: { description: "Adapt to market conditions", efficiency: 1.1, risk: 1.2 }
};

const DEFAULT_RULES = {
  seeds: {
    // Basic crops - easy to grow, reasonable rewards
    carrot: { stages: 3, secondsPerStage: 8, baseValue: 12, shopPrice: 4, emoji: "🥕", rarity: "common", season: "spring", family: "root", name: "Carrot" },
    potato: { stages: 3, secondsPerStage: 10, baseValue: 15, shopPrice: 5, emoji: "🥔", rarity: "common", season: "fall", family: "root", name: "Potato" },
    lettuce: { stages: 3, secondsPerStage: 6, baseValue: 8, shopPrice: 3, emoji: "🥬", rarity: "common", season: "spring", family: "leaf", name: "Lettuce" },
    garlic: { stages: 3, secondsPerStage: 12, baseValue: 18, shopPrice: 6, emoji: "🧄", rarity: "common", season: "fall", family: "bulb", name: "Garlic" },

    // Mid-tier crops - moderate difficulty and rewards
    corn: { stages: 4, secondsPerStage: 12, baseValue: 22, shopPrice: 8, emoji: "🌽", rarity: "uncommon", season: "summer", family: "grain", name: "Corn" },
    tomato: { stages: 4, secondsPerStage: 14, baseValue: 28, shopPrice: 10, emoji: "🍅", rarity: "uncommon", season: "summer", family: "fruit", name: "Tomato" },
    bellPepper: { stages: 4, secondsPerStage: 15, baseValue: 32, shopPrice: 12, emoji: "🫑", rarity: "uncommon", season: "summer", family: "fruit", name: "Bell Pepper" },

    // Advanced crops - higher difficulty, better rewards
    strawberry: { stages: 5, secondsPerStage: 16, baseValue: 35, shopPrice: 15, emoji: "🍓", rarity: "rare", season: "spring", family: "berry", name: "Strawberry" },
    sunflower: { stages: 5, secondsPerStage: 18, baseValue: 42, shopPrice: 18, emoji: "🌻", rarity: "rare", season: "summer", family: "flower", name: "Sunflower" },
    pumpkin: { stages: 6, secondsPerStage: 20, baseValue: 55, shopPrice: 25, emoji: "🎃", rarity: "epic", season: "fall", family: "gourd", name: "Pumpkin" },
  }
};

// Seasonal Festivals System
const FESTIVALS = [
  {
    id: "spring_bloom",
    name: "Spring Bloom Festival",
    emoji: "🌸",
    season: "spring",
    duration: 180, // 3 minutes
    bonuses: { growth: 1.5, value: 1.2 },
    requirements: { level: 1 },
    rewards: { coins: 100, experience: 50 },
    competitionType: "harvest_count"
  },
  {
    id: "summer_harvest",
    name: "Summer Harvest Fest",
    emoji: "☀️",
    season: "summer",
    duration: 240, // 4 minutes
    bonuses: { growth: 1.3, value: 1.4 },
    requirements: { level: 2 },
    rewards: { coins: 150, experience: 75 },
    competitionType: "total_value"
  },
  {
    id: "autumn_bounty",
    name: "Autumn Bounty Fair",
    emoji: "🍂",
    season: "fall",
    duration: 300, // 5 minutes
    bonuses: { growth: 1.2, value: 1.5 },
    requirements: { level: 3 },
    rewards: { coins: 200, experience: 100 },
    competitionType: "quality_harvest"
  }
];

const LIMITED_TIME_CROPS = {
  festival_pumpkin: { stages: 4, secondsPerStage: 10, baseValue: 45, shopPrice: 20, emoji: "🎃", rarity: "festival", season: "fall", family: "gourd", festivalOnly: true },
  festival_sunflower: { stages: 4, secondsPerStage: 12, baseValue: 40, shopPrice: 18, emoji: "🌻", rarity: "festival", season: "summer", family: "flower", festivalOnly: true },
  spring_tulip: { stages: 3, secondsPerStage: 8, baseValue: 30, shopPrice: 15, emoji: "🌷", rarity: "festival", season: "spring", family: "flower", festivalOnly: true }
};

// Crop Genetics & Breeding System
const CROP_GENETIC_TRAITS = {
  fast_growth: { name: "Fast Growth", emoji: "⚡", description: "Grows 25% faster", effect: { growth: 1.25 } },
  drought_resistant: { name: "Drought Resistant", emoji: "🏜️", description: "Survives without water longer", effect: { resilience: 1.3 } },
  high_yield: { name: "High Yield", emoji: "📈", description: "Produces 20% more value", effect: { value: 1.2 } },
  quality_boost: { name: "Premium Quality", emoji: "✨", description: "Higher quality harvests", effect: { quality: 1.4 } },
  premium_value: { name: "Premium Value", emoji: "💎", description: "50% more valuable", effect: { value: 1.5 } },
  disease_resistant: { name: "Disease Resistant", emoji: "🛡️", description: "Immune to diseases", effect: { disease_resist: 1.0 } },
  self_fertilizing: { name: "Self-Fertilizing", emoji: "🌱", description: "Doesn't need fertilizer", effect: { fertility: 1.2 } },
  golden_harvest: { name: "Golden Harvest", emoji: "🏆", description: "Rare chance for bonus coins", effect: { bonus_chance: 0.1 } }
};

const TRAIT_INHERITANCE_CHANCES = {
  both_parents: 0.8,  // Both parents have the trait
  one_parent: 0.4,    // Only one parent has the trait
  mutation: 0.05      // Random mutation chance
};

const ENHANCED_CROP_DATA = {
  carrot: { baseTraits: ["fast_growth"], possibleTraits: ["high_yield", "quality_boost"], breedingDifficulty: 1, hybridPotential: 0.7 },
  potato: { baseTraits: ["drought_resistant"], possibleTraits: ["high_yield", "disease_resistant"], breedingDifficulty: 1, hybridPotential: 0.8 },
  lettuce: { baseTraits: ["fast_growth"], possibleTraits: ["quality_boost", "premium_value"], breedingDifficulty: 1, hybridPotential: 0.6 },
  garlic: { baseTraits: ["disease_resistant"], possibleTraits: ["premium_value", "self_fertilizing"], breedingDifficulty: 2, hybridPotential: 0.9 },
  corn: { baseTraits: ["high_yield"], possibleTraits: ["drought_resistant", "golden_harvest"], breedingDifficulty: 2, hybridPotential: 0.8 },
  tomato: { baseTraits: ["quality_boost"], possibleTraits: ["disease_resistant", "premium_value"], breedingDifficulty: 2, hybridPotential: 0.9 },
  bellPepper: { baseTraits: ["premium_value"], possibleTraits: ["quality_boost", "self_fertilizing"], breedingDifficulty: 2, hybridPotential: 0.7 },
  strawberry: { baseTraits: ["quality_boost", "premium_value"], possibleTraits: ["golden_harvest", "self_fertilizing"], breedingDifficulty: 3, hybridPotential: 0.9 },
  sunflower: { baseTraits: ["drought_resistant", "high_yield"], possibleTraits: ["golden_harvest", "premium_value"], breedingDifficulty: 3, hybridPotential: 0.8 },
  pumpkin: { baseTraits: ["high_yield", "quality_boost"], possibleTraits: ["golden_harvest", "premium_value"], breedingDifficulty: 3, hybridPotential: 1.0 }
};

// Soil Management System
const SOIL_TYPES = {
  loamy: {
    name: "Loamy Soil",
    emoji: "🟫",
    description: "Balanced soil, good for most crops",
    properties: { waterRetention: 0.7, drainage: 0.8, fertility: 0.8, ph: 6.8 },
    bonuses: { growth: 1.0, value: 1.0 },
    cost: 0,
    unlockLevel: 1
  },
  clay: {
    name: "Clay Soil", 
    emoji: "🧱",
    description: "High water retention, slow drainage",
    properties: { waterRetention: 0.9, drainage: 0.4, fertility: 0.6, ph: 7.2 },
    bonuses: { growth: 0.9, value: 1.1 },
    cost: 50,
    unlockLevel: 2
  },
  sandy: {
    name: "Sandy Soil",
    emoji: "🏖️", 
    description: "Fast drainage, low water retention",
    properties: { waterRetention: 0.3, drainage: 0.9, fertility: 0.5, ph: 6.2 },
    bonuses: { growth: 1.2, value: 0.9 },
    cost: 75,
    unlockLevel: 2
  },
  silty: {
    name: "Silty Soil",
    emoji: "🌊",
    description: "Fine particles, good fertility",
    properties: { waterRetention: 0.8, drainage: 0.6, fertility: 0.9, ph: 6.9 },
    bonuses: { growth: 1.1, value: 1.1 },
    cost: 100,
    unlockLevel: 3
  },
  peaty: {
    name: "Peaty Soil",
    emoji: "🍂",
    description: "Organic-rich, acidic soil",
    properties: { waterRetention: 0.9, drainage: 0.7, fertility: 1.0, ph: 5.5 },
    bonuses: { growth: 1.3, value: 1.2 },
    cost: 150,
    unlockLevel: 4
  },
  chalky: {
    name: "Chalky Soil",
    emoji: "⚪",
    description: "Alkaline soil, good drainage",
    properties: { waterRetention: 0.5, drainage: 0.8, fertility: 0.7, ph: 8.1 },
    bonuses: { growth: 1.0, value: 1.3 },
    cost: 125,
    unlockLevel: 3
  }
};

const SOIL_IMPROVEMENTS = {
  compost: {
    name: "Compost",
    emoji: "🍃",
    description: "Increases fertility and water retention",
    cost: 25,
    effects: { fertility: 0.2, waterRetention: 0.1 },
    duration: 300 // 5 minutes
  },
  gypsum: {
    name: "Gypsum",
    emoji: "⚪",
    description: "Improves clay soil drainage",
    cost: 30,
    effects: { drainage: 0.3, ph: -0.2 },
    duration: 600 // 10 minutes
  },
  sand: {
    name: "Sand Amendment",
    emoji: "🏖️",
    description: "Improves drainage",
    cost: 20,
    effects: { drainage: 0.2, waterRetention: -0.1 },
    duration: 480 // 8 minutes
  },
  lime: {
    name: "Lime",
    emoji: "🟢",
    description: "Raises soil pH",
    cost: 35,
    effects: { ph: 0.5, fertility: 0.1 },
    duration: 900 // 15 minutes
  },
  sulfur: {
    name: "Sulfur",
    emoji: "🟡",
    description: "Lowers soil pH",
    cost: 35,
    effects: { ph: -0.5, fertility: 0.1 },
    duration: 900 // 15 minutes
  },
  wormCastings: {
    name: "Worm Castings",
    emoji: "🪱",
    description: "Rich organic matter boosts fertility",
    cost: 60,
    effects: { fertility: 0.4 },
    duration: 1200 // 20 minutes
  }
};

// Companion Planting System
const COMPANION_RELATIONSHIPS = {
  // Tomato relationships
  "tomato-carrot": { type: "friend", bonuses: { growth: 1.1, pest_resistance: 1.2 }, description: "Carrots help tomatoes grow faster" },
  "tomato-lettuce": { type: "friend", bonuses: { quality: 1.2, flavor: 1.1 }, description: "Lettuce provides ground cover for tomatoes" },
  "tomato-corn": { type: "enemy", bonuses: { growth: 0.8, disease_resistance: 0.7 }, description: "Corn competes with tomatoes for nutrients" },
  
  // Carrot relationships  
  "carrot-onion": { type: "friend", bonuses: { pest_resistance: 1.3, quality: 1.1 }, description: "Onions repel carrot fly" },
  "carrot-lettuce": { type: "friend", bonuses: { growth: 1.1, space_efficiency: 1.2 }, description: "Different root depths work well together" },
  "carrot-potato": { type: "enemy", bonuses: { growth: 0.9, quality: 0.8 }, description: "Root vegetables compete for space" },
  
  // Corn relationships
  "corn-pumpkin": { type: "friend", bonuses: { growth: 1.2, pest_resistance: 1.1 }, description: "Three Sisters companion planting" },
  "corn-strawberry": { type: "enemy", bonuses: { growth: 0.8, quality: 0.9 }, description: "Corn shades strawberries too much" },
  
  // Lettuce relationships
  "lettuce-garlic": { type: "friend", bonuses: { pest_resistance: 1.4, flavor: 1.2 }, description: "Garlic protects lettuce from pests" },
  "lettuce-sunflower": { type: "enemy", bonuses: { growth: 0.7, quality: 0.8 }, description: "Sunflowers overshadow lettuce" },
  
  // Potato relationships
  "potato-garlic": { type: "friend", bonuses: { disease_resistance: 1.3, quality: 1.1 }, description: "Garlic prevents potato diseases" },
  "potato-sunflower": { type: "enemy", bonuses: { growth: 0.8, value: 0.9 }, description: "Allelopathic interference" },
  
  // Strawberry relationships
  "strawberry-garlic": { type: "friend", bonuses: { flavor: 1.3, pest_resistance: 1.2 }, description: "Garlic enhances strawberry flavor" },
  "strawberry-bellPepper": { type: "friend", bonuses: { growth: 1.1, quality: 1.2 }, description: "Peppers provide beneficial shade" },
  
  // Sunflower relationships
  "sunflower-pumpkin": { type: "friend", bonuses: { growth: 1.1, pest_resistance: 1.1 }, description: "Sunflowers attract beneficial insects" },
  
  // Garlic relationships (universal friend)
  "garlic-pumpkin": { type: "friend", bonuses: { pest_resistance: 1.2, disease_resistance: 1.1 }, description: "Garlic repels many pests" },
  "garlic-bellPepper": { type: "friend", bonuses: { flavor: 1.2, pest_resistance: 1.1 }, description: "Garlic enhances pepper flavor" }
};

const COMPANION_RANGE = 1; // Adjacent plots only

// Weather & Seasons System
const WEATHER_TYPES = {
  sunny: { name: "Sunny", emoji: "☀️", effects: { growth: 1.2, water: 0.8 }, chance: 0.4 },
  cloudy: { name: "Cloudy", emoji: "☁️", effects: { growth: 1.0, water: 1.0 }, chance: 0.3 },
  rainy: { name: "Rainy", emoji: "🌧️", effects: { growth: 1.1, water: 1.5 }, chance: 0.2 },
  stormy: { name: "Stormy", emoji: "⛈️", effects: { growth: 0.8, water: 2.0, damage: 0.1 }, chance: 0.05 },
  drought: { name: "Drought", emoji: "🏜️", effects: { growth: 0.6, water: 0.3 }, chance: 0.05 }
};

const SEASONS = {
  spring: { name: "Spring", emoji: "🌸", duration: 300, effects: { growth: 1.1 }, crops: ["carrot", "lettuce", "strawberry"] },
  summer: { name: "Summer", emoji: "☀️", duration: 300, effects: { growth: 1.2 }, crops: ["corn", "tomato", "bellPepper", "sunflower"] },
  fall: { name: "Fall", emoji: "🍂", duration: 300, effects: { growth: 1.0 }, crops: ["potato", "garlic", "pumpkin"] },
  winter: { name: "Winter", emoji: "❄️", duration: 300, effects: { growth: 0.7 }, crops: [] }
};

const ACHIEVEMENTS = [
  { id: "first_harvest", name: "First Harvest", description: "Harvest your first crop", emoji: "🌾", reward: 50 },
  { id: "master_farmer", name: "Master Farmer", description: "Harvest 100 crops", emoji: "👨‍🌾", reward: 200, target: 100 },
  { id: "green_thumb", name: "Green Thumb", description: "Grow 10 different crop types", emoji: "👍", reward: 150, target: 10 },
  { id: "weather_master", name: "Weather Master", description: "Farm through all weather types", emoji: "🌦️", reward: 100 },
  { id: "festival_champion", name: "Festival Champion", description: "Win 3 festivals", emoji: "🏆", reward: 300, target: 3 },
  { id: "genetics_researcher", name: "Genetics Researcher", description: "Breed 5 hybrid crops", emoji: "🧬", reward: 250, target: 5 },
  { id: "companion_expert", name: "Companion Expert", description: "Discover 10 companion relationships", emoji: "🌸", reward: 200, target: 10 },
  { id: "millionaire", name: "Millionaire", description: "Earn 10,000 coins", emoji: "💰", reward: 500, target: 10000 }
];

// Buildings System
const BUILDINGS = {
  barn: { 
    name: "Barn", 
    emoji: "🏚️", 
    cost: 500, 
    description: "Houses livestock and stores feed", 
    capacity: 10,
    unlockLevel: 1
  },
  greenhouse: { 
    name: "Greenhouse", 
    emoji: "🏠", 
    cost: 1000, 
    description: "Protects crops from weather", 
    effect: { weatherProtection: true, growth: 1.1 },
    unlockLevel: 2
  },
  silo: { 
    name: "Silo", 
    emoji: "🗼", 
    cost: 300, 
    description: "Stores large amounts of crops", 
    capacity: 1000,
    unlockLevel: 1
  },
  processingPlant: { 
    name: "Processing Plant", 
    emoji: "🏭", 
    cost: 2000, 
    description: "Converts crops to processed goods", 
    unlockLevel: 3
  },
  greenhouse2: {
    name: "Greenhouse II",
    emoji: "🏗️",
    cost: 2500,
    description: "+weather immunity, winter growth +25%",
    effect: { weatherImmunity: true, winterGrowth: 1.25 },
    unlockLevel: 4
  },
  siloExpansion: {
    name: "Silo Expansion",
    emoji: "📦",
    cost: 1200,
    description: "+1,000 storage, spoilage −30%",
    capacity: 1000,
    spoilageReduction: 0.3,
    unlockLevel: 2
  },
  processingPlant2: {
    name: "Processing Plant II",
    emoji: "🏭",
    cost: 3500,
    description: "parallel queue +1, speed +20%",
    effect: { queuePlus: 1, speed: 1.2 },
    unlockLevel: 4
  },
  orchardHouse: {
    name: "Orchard House",
    emoji: "🍎",
    cost: 1800,
    description: "Fruit trees thrive; winter trickle growth",
    unlockLevel: 3
  },
  aquaponicsLab: {
    name: "Aquaponics Lab",
    emoji: "🐟",
    cost: 2200,
    description: "Fish+veggies loop; drought penalty reduced",
    unlockLevel: 3
  },
  marketStall: {
    name: "Market Stall",
    emoji: "🛍️",
    cost: 900,
    description: "+10% sell price; small daily foot traffic",
    unlockLevel: 2
  },
  railSiding: {
    name: "Rail Siding",
    emoji: "🚂",
    cost: 2600,
    description: "Bulk deliveries (×3 capacity), fixed fee",
    unlockLevel: 4
  }
};

// Livestock System
const LIVESTOCK_TYPES = {
  chicken: {
    name: "Chicken",
    emoji: "🐔",
    cost: 50,
    produces: "eggs",
    productEmoji: "🥚",
    productionTime: 180, // 3 minutes
    productValue: 15,
    feedConsumption: 1,
    unlockLevel: 1
  },
  cow: {
    name: "Cow",
    emoji: "🐄",
    cost: 200,
    produces: "milk",
    productEmoji: "🥛",
    productionTime: 300, // 5 minutes
    productValue: 35,
    feedConsumption: 3,
    unlockLevel: 2
  },
  sheep: {
    name: "Sheep",
    emoji: "🐑",
    cost: 150,
    produces: "wool",
    productEmoji: "🧶",
    productionTime: 600, // 10 minutes
    productValue: 50,
    feedConsumption: 2,
    unlockLevel: 2
  },
  pig: {
    name: "Pig",
    emoji: "🐷",
    cost: 100,
    produces: "truffles",
    productEmoji: "🍄",
    productionTime: 480, // 8 minutes
    productValue: 75,
    feedConsumption: 2,
    unlockLevel: 3
  }
};

// Pest and Disease System
const PESTS_AND_DISEASES = {
  aphids: {
    name: "Aphids",
    emoji: "🐛",
    type: "pest",
    affectedCrops: ["lettuce", "tomato", "bellPepper"],
    damageRate: 0.15,
    treatmentCost: 20,
    prevention: ["garlic", "companion_planting"]
  },
  fungalBlight: {
    name: "Fungal Blight",
    emoji: "🍄",
    type: "disease",
    affectedCrops: ["tomato", "potato", "strawberry"],
    damageRate: 0.25,
    treatmentCost: 30,
    prevention: ["good_drainage", "crop_rotation"]
  },
  rootRot: {
    name: "Root Rot",
    emoji: "🦠",
    type: "disease",
    affectedCrops: ["carrot", "potato", "garlic"],
    damageRate: 0.2,
    treatmentCost: 25,
    prevention: ["well_drained_soil", "avoid_overwatering"]
  },
  cutworms: {
    name: "Cutworms",
    emoji: "🐛",
    type: "pest",
    affectedCrops: ["corn", "lettuce", "carrot"],
    damageRate: 0.18,
    treatmentCost: 15,
    prevention: ["beneficial_insects", "clean_cultivation"]
  },
  powderyMildew: {
    name: "Powdery Mildew",
    emoji: "☁️",
    type: "disease",
    affectedCrops: ["pumpkin", "sunflower", "bellPepper"],
    damageRate: 0.12,
    treatmentCost: 20,
    prevention: ["air_circulation", "avoid_overhead_watering"]
  }
};

// Treatments and Prevention
const TREATMENTS = {
  organicSpray: { name: "Organic Spray", cost: 15, effectiveness: 0.7, emoji: "🌿" },
  pesticide: { name: "Pesticide", cost: 25, effectiveness: 0.9, emoji: "💊" },
  fungicide: { name: "Fungicide", cost: 30, effectiveness: 0.85, emoji: "🧪" },
  beneficialInsects: { name: "Beneficial Insects", cost: 40, effectiveness: 0.8, emoji: "🐞" }
};

// Market System
const MARKET_TOWNS = {
  greenville: {
    name: "Greenville",
    emoji: "🏘️",
    distance: 1,
    transportCost: 5,
    preferences: ["lettuce", "carrot", "potato"], // Higher prices for these
    description: "Small farming town that loves fresh vegetables"
  },
  riverside: {
    name: "Riverside",
    emoji: "🌊",
    distance: 2,
    transportCost: 12,
    preferences: ["strawberry", "corn", "sunflower"],
    description: "Riverside city with demand for premium crops"
  },
  mountainview: {
    name: "Mountain View",
    emoji: "⛰️",
    distance: 3,
    transportCost: 20,
    preferences: ["pumpkin", "garlic", "bellPepper"],
    description: "Mountain town that pays top prices for rare crops"
  },
  metropolis: {
    name: "Metropolis",
    emoji: "🏙️",
    distance: 4,
    transportCost: 35,
    preferences: ["tomato", "bellPepper", "strawberry"],
    description: "Big city with high demand and premium prices"
  }
};

// Processing System
const PROCESSING_RECIPES = {
  bread: {
    name: "Bread",
    emoji: "🍞",
    inputs: { wheat: 3 },
    outputs: { bread: 1 },
    baseValue: 45,
    processingTime: 300, // 5 minutes
    requiredBuilding: "processingPlant"
  },
  cheese: {
    name: "Cheese",
    emoji: "🧀",
    inputs: { milk: 2 },
    outputs: { cheese: 1 },
    baseValue: 80,
    processingTime: 600, // 10 minutes
    requiredBuilding: "processingPlant"
  },
  flour: {
    name: "Flour",
    emoji: "🌾",
    inputs: { wheat: 2 },
    outputs: { flour: 1 },
    baseValue: 25,
    processingTime: 180, // 3 minutes
    requiredBuilding: "processingPlant"
  },
  jam: {
    name: "Strawberry Jam",
    emoji: "🍓",
    inputs: { strawberry: 4 },
    outputs: { jam: 1 },
    baseValue: 120,
    processingTime: 480, // 8 minutes
    requiredBuilding: "processingPlant"
  }
};

// Research Tree
const RESEARCH_TREE = {
  irrigation: {
    name: "Irrigation Systems",
    emoji: "💧",
    cost: 500,
    researchTime: 1800, // 30 minutes
    prerequisites: [],
    unlocks: ["sprinkler"],
    description: "Unlock automatic watering systems"
  },
  mechanization: {
    name: "Farm Mechanization",
    emoji: "🚜",
    cost: 1000,
    researchTime: 3600, // 1 hour
    prerequisites: ["irrigation"],
    unlocks: ["autoHarvester"],
    description: "Unlock automated harvesting equipment"
  },
  greenEnergy: {
    name: "Green Energy",
    emoji: "🔋",
    cost: 750,
    researchTime: 2400, // 40 minutes
    prerequisites: [],
    unlocks: ["solarPanel", "windTurbine"],
    description: "Unlock renewable energy sources"
  },
  advancedGenetics: {
    name: "Advanced Genetics",
    emoji: "🧬",
    cost: 1500,
    researchTime: 4800, // 80 minutes
    prerequisites: ["mechanization"],
    unlocks: ["geneticModification"],
    description: "Unlock advanced crop modification"
  }
};

// Additional research branches
RESEARCH_TREE.soilBiology = {
  name: "Soil Biology",
  emoji: "🪱",
  cost: 900,
  researchTime: 2400,
  prerequisites: [],
  unlocks: ["wormCastings"],
  description: "Compost potency +50%, unlock worm castings"
};
RESEARCH_TREE.robotics = {
  name: "Robotics",
  emoji: "🤖",
  cost: 1200,
  researchTime: 3000,
  prerequisites: ["mechanization"],
  unlocks: ["roboticsOptimizations"],
  description: "Automation energy optimized"
};
RESEARCH_TREE.gridTie = {
  name: "Grid‑Tie",
  emoji: "🔌",
  cost: 800,
  researchTime: 1800,
  prerequisites: ["greenEnergy"],
  unlocks: ["energyCredits"],
  description: "Sell surplus energy for credits"
};

// NPCs and Rival Farms
const NPCS = [
  { id: "mara", name: "Mara the Miller", personality: "generous", priceMultiplier: 1.1 },
  { id: "tomas", name: "Tomas the Trader", personality: "opportunist", priceMultiplier: 0.9 },
  { id: "lina", name: "Lina the Chef", personality: "cautious", priceMultiplier: 1.0 }
];

const RIVAL_FARMS = [
  { id: "oakridge", name: "Oakridge Farm" },
  { id: "willowbend", name: "Willowbend Acres" }
];

// Vehicles and simple logistics
const VEHICLES = {
  handcart: { name: "Handcart", capacity: 20, speed: 1, fuelUse: 0, upkeep: 0, cost: 50 },
  tractor: { name: "Tractor", capacity: 60, speed: 1.5, fuelUse: 1, upkeep: 2, cost: 800 },
  truck: { name: "Truck", capacity: 150, speed: 2.2, fuelUse: 2, upkeep: 5, cost: 2000 },
  reeferTruck: { name: "Reefer Truck", capacity: 120, speed: 2.0, fuelUse: 3, upkeep: 8, cost: 3500, preserves: true }
};

// Logistics upgrades
const LOGISTICS_UPGRADES = {
  tractorTrailer: { name: "Tractor Trailer", cost: 1000, description: "Capacity +80, +1 fuel per trip" },
  routePlanner: { name: "Route Planner", cost: 600, description: "Auto-pick best town by net price" },
  refrigerationKit: { name: "Refrigeration Kit", cost: 900, description: "Deliveries preserve freshness" },
  dispatchCenter: { name: "Dispatch Center", cost: 800, description: "Queue more deliveries; ETA −10%" },
  fuelCoop: { name: "Fuel Co‑op", cost: 700, description: "Fuel use −25% per delivery" },
  gpsTracking: { name: "GPS Tracking", cost: 650, description: "Progress bars and dynamic reroute" }
};

// Disasters with simple growth modifiers
const DISASTERS = {
  storm: { name: "Storm", emoji: "⛈️", growth: 0.8, duration: 600 },
  drought: { name: "Drought", emoji: "🏜️", growth: 0.7, duration: 900 },
  pestBloom: { name: "Pest Bloom", emoji: "🐛", growth: 0.9, duration: 600 }
};

// Automation Equipment
const AUTOMATION_EQUIPMENT = {
  sprinkler: {
    name: "Sprinkler System",
    emoji: "💧",
    cost: 200,
    energyConsumption: 1,
    range: 1, // affects adjacent plots
    effect: { growth: 1.2 },
    requiredResearch: "irrigation",
    description: "Automatically waters nearby crops for faster growth"
  },
  autoHarvester: {
    name: "Auto Harvester",
    emoji: "🚜",
    cost: 500,
    energyConsumption: 2,
    range: 0, // affects single plot
    effect: { autoHarvest: true },
    requiredResearch: "mechanization",
    description: "Automatically harvests crops when ready"
  },
  fertilizer: {
    name: "Auto Fertilizer",
    emoji: "🌿",
    cost: 300,
    energyConsumption: 1,
    range: 0,
    effect: { value: 1.3 },
    requiredResearch: "advancedGenetics",
    description: "Automatically applies fertilizer for better yields"
  }
};

// Energy Systems
const ENERGY_SYSTEMS = {
  solarPanel: {
    name: "Solar Panel",
    emoji: "☀️",
    cost: 400,
    energyProduction: 2,
    requiredResearch: "greenEnergy",
    description: "Generates clean energy from sunlight"
  },
  windTurbine: {
    name: "Wind Turbine",
    emoji: "💨",
    cost: 600,
    energyProduction: 3,
    requiredResearch: "greenEnergy",
    description: "Generates energy from wind power"
  }
};

function newPlot(status = "empty") {
  return {
    status, seed: null, plantedAt: null, stage: 0,
    soilType: "loamy", soilQuality: 0.8, improvements: [],
    pests: [], diseases: [], health: 100, lastPestCheck: 0,
    automation: [] // Array of automation equipment on this plot
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

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function formatTimeRemaining(seconds) {
  if (seconds <= 0) return "Ready!";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Save schema versioning and migrations
const SAVE_VERSION = 2;
function migrateSave(raw) {
  if (!raw) return null;
  const v = raw.__v || 1;
  let data = { ...raw };
  if (v < 2) {
    data.vehiclesOwned = data.vehiclesOwned || { handcart: 1 };
    data.vehicleUpgrades = data.vehicleUpgrades || { tractorTrailer: false, routePlanner: false, refrigerationKit: false };
    data.marketPerks = data.marketPerks || { brandLicense: false, contractBureau: false, festivalBooth: false };
    data.lastSpoilage = data.lastSpoilage || Math.floor(Date.now() / 1000);
  }
  data.__v = SAVE_VERSION;
  return data;
}

function loadSave() {
  try {
    const saved = localStorage.getItem("farmgame_save");
    if (saved) {
      const data = migrateSave(JSON.parse(saved));
      // Ensure all required properties exist with defaults
      return {
        // Multiplayer data
        isMultiplayer: data.isMultiplayer || false,
        currentPlayerId: data.currentPlayerId || "player1",
        players: data.players || [
          { id: "player1", name: "Farmer", color: "#3B82F6", isHost: true, online: true }
        ],
        sessionId: data.sessionId || null,
        sessionName: data.sessionName || "My Farm",
        sharedResources: data.sharedResources || false,
        visitingFarm: data.visitingFarm || null,
        farmVisits: data.farmVisits || [],
        plotOwnership: data.plotOwnership || {},
        actionHistory: data.actionHistory || [],
        // Advanced economy data
        futuresContracts: data.futuresContracts || [],
        internationalMarkets: data.internationalMarkets || {
          domestic: { name: "Local Market", prices: {}, volatility: 0.1 },
          international: { name: "Global Market", prices: {}, volatility: 0.25 },
          luxury: { name: "Premium Market", prices: {}, volatility: 0.4 }
        },
        economicEvents: data.economicEvents || [],
        marketSpeculation: data.marketSpeculation || {},
        portfolio: data.portfolio || { cash: 1000, holdings: {} },
        // Farm customization data
        farmDecorations: data.farmDecorations || [],
        farmTheme: data.farmTheme || "classic",
        unlockedThemes: data.unlockedThemes || ["classic"],
        unlockedDecorations: data.unlockedDecorations || ["fence", "scarecrow"],
        // Town development data
        townLevel: data.townLevel || 1,
        townReputation: data.townReputation || 0,
        townBuildings: data.townBuildings || ["general_store"],
        townEvents: data.townEvents || [],
        townServices: data.townServices || {
          clinic: false,
          school: false,
          library: false,
          bank: false,
          market: false,
          festival_grounds: false
        },
        // Social features data
        competitions: data.competitions || [],
        leaderboards: data.leaderboards || {
          harvest: [],
          coins: [],
          reputation: [],
          level: []
        },
        gifts: data.gifts || [],
        neighbors: data.neighbors || [],
        socialEvents: data.socialEvents || [],
        playerStats: data.playerStats || {
          totalHarvests: 0,
          totalEarned: 0,
          bestHarvest: 0,
          competitionsWon: 0,
          friendsHelped: 0
        },
        // Deep farming mechanics data
        irrigationSystem: data.irrigationSystem || {
          enabled: false,
          waterLevel: 100,
          efficiency: 1.0,
          autoWater: false
        },
        geneticsLab: data.geneticsLab || {
          level: 0,
          researchPoints: 0,
          activeProjects: [],
          discoveredTraits: [],
          customHybrids: []
        },
        greenhouseClimate: data.greenhouseClimate || {
          temperature: 22,
          humidity: 60,
          co2Level: 400,
          lighting: "natural",
          climateControl: false
        },
        plotConditions: data.plotConditions || {},
        // Advanced automation data
        farmAI: data.farmAI || {
          enabled: false,
          learningMode: true,
          optimizationLevel: 1,
          predictions: {},
          recommendations: []
        },
        autoScheduler: data.autoScheduler || {
          enabled: false,
          schedule: {},
          efficiency: 0.8,
          adaptationRate: 0.1
        },
        smartOptimization: data.smartOptimization || {
          cropRotation: [],
          resourceAllocation: {},
          riskManagement: {},
          performanceMetrics: {}
        },
        // Seasonal events data
        seasonalEvents: data.seasonalEvents || [],
        holidayEvents: data.holidayEvents || [],
        specialCrops: data.specialCrops || {},
        eventProgress: data.eventProgress || {},
        seasonalShop: data.seasonalShop || {
          available: false,
          items: [],
          discount: 0
        },
        // Mini-games data
        miniGames: data.miniGames || {
          harvestRush: {
            unlocked: true,
            highScore: 0,
            gamesPlayed: 0,
            bestCombo: 0
          },
          marketTrader: {
            unlocked: false,
            level: 1,
            profit: 0,
            trades: 0,
            winRate: 0
          },
          puzzleFarming: {
            unlocked: false,
            level: 1,
            score: 0,
            puzzlesSolved: 0
          },
          currentGame: null,
          gameState: {}
        },
        // Global Marketplace data
        globalMarket: data.globalMarket || {
          playerId: null,
          marketEnabled: false,
          tradeRequests: [],
          activeTrades: [],
          auctionHouse: {
            items: [],
            bids: {}
          },
          commodityExchange: {
            prices: {},
            history: {},
            volume: {}
          },
          playerListings: [],
          marketStats: {
            totalTrades: 0,
            totalVolume: 0,
            reputation: 100
          }
        },
        // Weather Disasters data
        weatherDisasters: data.weatherDisasters || {
          activeDisaster: null,
          disasterHistory: [],
          disasterPreparation: {
            stormShelter: false,
            floodBarriers: false,
            droughtReservoir: false,
            tornadoBunker: false
          },
          insurance: {
            enabled: false,
            coverage: 0,
            premium: 0,
            claimsAvailable: 3
          },
          disasterForecast: {
            nextDisaster: null,
            timeUntilNext: 0,
            severity: 0
          },
          recoveryStatus: {
            damagedPlots: new Set(),
            repairCost: 0,
            insuranceClaim: 0
          }
        },
        // Education System data
        educationSystem: data.educationSystem || {
          currentSchool: null,
          enrolledCourses: new Set(),
          completedCourses: new Set(),
          certifications: new Set(),
          skillTrees: {
            farming: { level: 1, experience: 0, skills: {} },
            business: { level: 1, experience: 0, skills: {} },
            technology: { level: 1, experience: 0, skills: {} },
            sustainability: { level: 1, experience: 0, skills: {} }
          },
          knowledgeShared: [],
          teachingSessions: [],
          researchProjects: [],
          academicAchievements: []
        },
        // Sustainability System data
        sustainabilitySystem: data.sustainabilitySystem || {
          carbonFootprint: 0,
          renewableEnergy: {
            solarPanels: false,
            windTurbines: false,
            hydroelectric: false,
            bioFuelGenerator: false,
            energyStorage: 0,
            energyProduction: 0,
            energyConsumption: 0
          },
          ecoCertifications: new Set(),
          environmentalImpact: {
            waterUsage: 0,
            soilHealth: 100,
            biodiversity: 50,
            airQuality: 100,
            wasteProduction: 0
          },
          sustainablePractices: {
            organicFarming: false,
            cropRotation: false,
            waterConservation: false,
            naturalPestControl: false,
            wasteRecycling: false
          },
          greenInitiatives: [],
          sustainabilityScore: 0,
          monthlyReport: {}
        },
        // Advanced Research data
        advancedResearch: data.advancedResearch || {
          researchPoints: 0,
          activeProjects: new Set(),
          completedProjects: new Set(),
          breakthroughs: new Set(),
          nanotechnology: {
            unlocked: false,
            level: 0,
            projects: []
          },
          aiFarming: {
            unlocked: false,
            level: 0,
            projects: []
          },
          verticalFarming: {
            unlocked: false,
            level: 0,
            projects: []
          },
          spaceAgriculture: {
            unlocked: false,
            level: 0,
            projects: []
          },
          researchLab: {
            level: 0,
            efficiency: 1.0,
            automationLevel: 0
          },
          discoveries: [],
          publications: []
        },
        // Animal Husbandry data
        animalHusbandry: data.animalHusbandry || {
          animals: [],
          breedingPairs: [],
          animalShows: {
            activeShow: null,
            upcomingShows: [],
            completedShows: [],
            showResults: []
          },
          competitions: {
            activeCompetitions: [],
            completedCompetitions: [],
            competitionResults: [],
            leaderboards: {}
          },
          genetics: {
            traits: {},
            lineage: {},
            breedingRecords: []
          },
          facilities: {
            barn: { level: 0, capacity: 10 },
            stable: { level: 0, capacity: 5 },
            chickenCoop: { level: 0, capacity: 20 },
            pigPen: { level: 0, capacity: 8 },
            sheepPasture: { level: 0, capacity: 15 }
          },
          care: {
            feedingSchedule: {},
            healthRecords: {},
            vaccinations: {},
            grooming: {}
          },
          products: {
            milk: 0,
            eggs: 0,
            wool: 0,
            meat: 0,
            manure: 0
          }
        },
        // Basic data
        name: data.name || "Farmer",
        coins: data.coins || 100,
        score: data.score || 0,
        size: data.size || 3,
        plots: data.plots || makeGrid(3),
        inventory: data.inventory || { carrot: 5, potato: 3, lettuce: 8 },
        selectedSeed: data.selectedSeed || "carrot",
        level: data.level || 1,
        experience: data.experience || 0,
        totalHarvests: data.totalHarvests || 0,
        // Festival data
        activeFestival: data.activeFestival || null,
        festivalStartTime: data.festivalStartTime || 0,
        festivalEndTime: data.festivalEndTime || 0,
        festivalScore: data.festivalScore || 0,
        festivalTrophies: data.festivalTrophies || [],
        limitedTimeSeeds: data.limitedTimeSeeds || {},
        // Genetics data
        geneticLab: data.geneticLab || { level: 1, upgradePoints: 0 },
        cropGeneBank: data.cropGeneBank || {},
        activeBreedingProjects: data.activeBreedingProjects || [],
        discoveredHybrids: data.discoveredHybrids || [],
        geneticTraits: data.geneticTraits || {},
        // Soil data
        availableSoils: data.availableSoils || ["loamy"],
        soilInventory: data.soilInventory || {},
        // Companion data
        companionBonuses: data.companionBonuses || {},
        companionKnowledge: data.companionKnowledge || { level: 1, discoveredRelationships: [] },
        // Weather/Season data
        currentWeather: data.currentWeather || "sunny",
        weatherChangeTime: data.weatherChangeTime || 0,
        currentSeason: data.currentSeason || "spring",
        seasonStartTime: data.seasonStartTime || 0,
        weatherHistory: data.weatherHistory || ["sunny"],
        // Achievement data
        unlockedAchievements: data.unlockedAchievements || [],
        harvestedCropTypes: data.harvestedCropTypes ? new Set(data.harvestedCropTypes) : new Set(),
        totalEarned: data.totalEarned || 0,
        // Buildings & Livestock
        buildings: data.buildings || [],
        livestock: data.livestock || [],
        animalFeed: data.animalFeed || 100,
        animalProducts: data.animalProducts || { eggs: 0, milk: 0, wool: 0, truffles: 0 },
        // Pest & Disease
        pestOutbreaks: data.pestOutbreaks || [],
        treatmentInventory: data.treatmentInventory || { organicSpray: 0, pesticide: 0, fungicide: 0, beneficialInsects: 0 },
        // Grid expansion
        maxGridSize: data.maxGridSize || 3,
        unlockedGridSizes: data.unlockedGridSizes || [3]
      };
      // Extended systems
      saveData.reputation = reputation;
      saveData.activeContracts = activeContracts;
      saveData.availableContracts = availableContracts;
      saveData.rivalScores = rivalScores;
      saveData.vehiclesOwned = vehiclesOwned;
      saveData.vehicleUpgrades = vehicleUpgrades;
      saveData.fuel = fuel;
      saveData.deliveries = deliveries;
      saveData.forecast = forecast;
      saveData.activeDisaster = activeDisaster;
      saveData.insurance = insurance;
      saveData.lastSpoilage = lastSpoilage;
      saveData.marketPerks = marketPerks;
      saveData.lastContractReroll = lastContractReroll;
    }
  } catch (error) {
    console.error("Failed to load save:", error);
  }
  return null;
}

export default function FarmSimCanvas() {
  // Load saved data
  const saved = useMemo(() => {
    try {
      return loadSave();
    } catch (error) {
      console.error("Error loading save:", error);
      return null;
    }
  }, []);

  // Multiplayer state
  const [isMultiplayer, setIsMultiplayer] = useState(() => saved?.isMultiplayer || false);
  const [currentPlayerId, setCurrentPlayerId] = useState(() => saved?.currentPlayerId || "player1");
  const [players, setPlayers] = useState(() => saved?.players || [
    { id: "player1", name: "Farmer", color: "#3B82F6", isHost: true, online: true }
  ]);
  const [sessionId, setSessionId] = useState(() => saved?.sessionId || null);
  const [sessionName, setSessionName] = useState(() => saved?.sessionName || "My Farm");
  const [sharedResources, setSharedResources] = useState(() => saved?.sharedResources || false);

  // Farm visit system
  const [visitingFarm, setVisitingFarm] = useState(() => saved?.visitingFarm || null);
  const [farmVisits, setFarmVisits] = useState(() => saved?.farmVisits || []);

  // Collaborative actions tracking
  const [plotOwnership, setPlotOwnership] = useState(() => saved?.plotOwnership || {});
  const [actionHistory, setActionHistory] = useState(() => saved?.actionHistory || []);

  // Advanced economy system
  const [futuresContracts, setFuturesContracts] = useState(() => saved?.futuresContracts || []);
  const [internationalMarkets, setInternationalMarkets] = useState(() => saved?.internationalMarkets || {
    domestic: { name: "Local Market", prices: {}, volatility: 0.1 },
    international: { name: "Global Market", prices: {}, volatility: 0.25 },
    luxury: { name: "Premium Market", prices: {}, volatility: 0.4 }
  });
  const [economicEvents, setEconomicEvents] = useState(() => saved?.economicEvents || []);
  const [marketSpeculation, setMarketSpeculation] = useState(() => saved?.marketSpeculation || {});
  const [portfolio, setPortfolio] = useState(() => saved?.portfolio || { cash: 1000, holdings: {} });

  // Farm customization
  const [farmDecorations, setFarmDecorations] = useState(() => saved?.farmDecorations || []);
  const [farmTheme, setFarmTheme] = useState(() => saved?.farmTheme || "classic");
  const [unlockedThemes, setUnlockedThemes] = useState(() => saved?.unlockedThemes || ["classic"]);
  const [unlockedDecorations, setUnlockedDecorations] = useState(() => saved?.unlockedDecorations || ["fence", "scarecrow"]);
  const [layoutMode, setLayoutMode] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState(null);

  // Town development
  const [townLevel, setTownLevel] = useState(() => saved?.townLevel || 1);
  const [townReputation, setTownReputation] = useState(() => saved?.townReputation || 0);
  const [townBuildings, setTownBuildings] = useState(() => saved?.townBuildings || ["general_store"]);
  const [townEvents, setTownEvents] = useState(() => saved?.townEvents || []);
  const [townServices, setTownServices] = useState(() => saved?.townServices || {
    clinic: false,
    school: false,
    library: false,
    bank: false,
    market: false,
    festival_grounds: false
  });

  // Social features
  const [competitions, setCompetitions] = useState(() => saved?.competitions || []);
  const [leaderboards, setLeaderboards] = useState(() => saved?.leaderboards || {
    harvest: [],
    coins: [],
    reputation: [],
    level: []
  });
  const [gifts, setGifts] = useState(() => saved?.gifts || []);
  const [neighbors, setNeighbors] = useState(() => saved?.neighbors || []);
  const [socialEvents, setSocialEvents] = useState(() => saved?.socialEvents || []);
  const [playerStats, setPlayerStats] = useState(() => saved?.playerStats || {
    totalHarvests: 0,
    totalEarned: 0,
    bestHarvest: 0,
    competitionsWon: 0,
    friendsHelped: 0
  });

  // Deep farming mechanics
  const [irrigationSystem, setIrrigationSystem] = useState(() => saved?.irrigationSystem || {
    enabled: false,
    waterLevel: 100,
    efficiency: 1.0,
    autoWater: false
  });
  const [geneticsLab, setGeneticsLab] = useState(() => saved?.geneticsLab || {
    level: 0,
    researchPoints: 0,
    activeProjects: [],
    discoveredTraits: [],
    customHybrids: []
  });
  const [greenhouseClimate, setGreenhouseClimate] = useState(() => saved?.greenhouseClimate || {
    temperature: 22, // Celsius
    humidity: 60,    // Percentage
    co2Level: 400,   // ppm
    lighting: "natural",
    climateControl: false
  });
  const [plotConditions, setPlotConditions] = useState(() => saved?.plotConditions || {});

  // Seasonal events
  const [seasonalEvents, setSeasonalEvents] = useState(() => saved?.seasonalEvents || []);
  const [holidayEvents, setHolidayEvents] = useState(() => saved?.holidayEvents || []);
  const [specialCrops, setSpecialCrops] = useState(() => saved?.specialCrops || {});
  const [eventProgress, setEventProgress] = useState(() => saved?.eventProgress || {});
  const [seasonalShop, setSeasonalShop] = useState(() => saved?.seasonalShop || {
    available: false,
    items: [],
    discount: 0
  });

  // Mini-games
  const [miniGames, setMiniGames] = useState(() => saved?.miniGames || {
    harvestRush: {
      unlocked: true,
      highScore: 0,
      gamesPlayed: 0,
      bestCombo: 0
    },
    marketTrader: {
      unlocked: false,
      level: 1,
      profit: 0,
      trades: 0,
      winRate: 0
    },
    puzzleFarming: {
      unlocked: false,
      level: 1,
      score: 0,
      puzzlesSolved: 0
    },
    currentGame: null,
    gameState: {}
  });

  // Global Marketplace
  const [globalMarket, setGlobalMarket] = useState(() => saved?.globalMarket || {
    playerId: null,
    marketEnabled: false,
    tradeRequests: [],
    activeTrades: [],
    auctionHouse: {
      items: [],
      bids: {}
    },
    commodityExchange: {
      prices: {},
      history: {},
      volume: {}
    },
    playerListings: [],
    marketStats: {
      totalTrades: 0,
      totalVolume: 0,
      reputation: 100
    }
  });

  // Weather Disasters
  const [weatherDisasters, setWeatherDisasters] = useState(() => saved?.weatherDisasters || {
    activeDisaster: null,
    disasterHistory: [],
    disasterPreparation: {
      stormShelter: false,
      floodBarriers: false,
      droughtReservoir: false,
      tornadoBunker: false
    },
    insurance: {
      enabled: false,
      coverage: 0,
      premium: 0,
      claimsAvailable: 3
    },
    disasterForecast: {
      nextDisaster: null,
      timeUntilNext: 0,
      severity: 0
    },
    recoveryStatus: {
      damagedPlots: new Set(),
      repairCost: 0,
      insuranceClaim: 0
    }
  });

  // Education System
  const [educationSystem, setEducationSystem] = useState(() => saved?.educationSystem || {
    currentSchool: null,
    enrolledCourses: new Set(),
    completedCourses: new Set(),
    certifications: new Set(),
    skillTrees: {
      farming: { level: 1, experience: 0, skills: {} },
      business: { level: 1, experience: 0, skills: {} },
      technology: { level: 1, experience: 0, skills: {} },
      sustainability: { level: 1, experience: 0, skills: {} }
    },
    knowledgeShared: [],
    teachingSessions: [],
    researchProjects: [],
    academicAchievements: []
  });

  // Sustainability System
  const [sustainabilitySystem, setSustainabilitySystem] = useState(() => saved?.sustainabilitySystem || {
    carbonFootprint: 0,
    renewableEnergy: {
      solarPanels: false,
      windTurbines: false,
      hydroelectric: false,
      bioFuelGenerator: false,
      energyStorage: 0,
      energyProduction: 0,
      energyConsumption: 0
    },
    ecoCertifications: new Set(),
    environmentalImpact: {
      waterUsage: 0,
      soilHealth: 100,
      biodiversity: 50,
      airQuality: 100,
      wasteProduction: 0
    },
    sustainablePractices: {
      organicFarming: false,
      cropRotation: false,
      waterConservation: false,
      naturalPestControl: false,
      wasteRecycling: false
    },
    greenInitiatives: [],
    sustainabilityScore: 0,
    monthlyReport: {}
  });

  // Advanced Research System
  const [advancedResearch, setAdvancedResearch] = useState(() => saved?.advancedResearch || {
    researchPoints: 0,
    activeProjects: new Set(),
    completedProjects: new Set(),
    breakthroughs: new Set(),
    nanotechnology: {
      unlocked: false,
      level: 0,
      projects: []
    },
    aiFarming: {
      unlocked: false,
      level: 0,
      projects: []
    },
    verticalFarming: {
      unlocked: false,
      level: 0,
      projects: []
    },
    spaceAgriculture: {
      unlocked: false,
      level: 0,
      projects: []
    },
    researchLab: {
      level: 0,
      efficiency: 1.0,
      automationLevel: 0
    },
    discoveries: [],
    publications: []
  });

  // Animal Husbandry System
  const [animalHusbandry, setAnimalHusbandry] = useState(() => saved?.animalHusbandry || {
    animals: [], // Array of animal objects
    breedingPairs: [],
    animalShows: {
      activeShow: null,
      upcomingShows: [],
      completedShows: [],
      showResults: []
    },
    competitions: {
      activeCompetitions: [],
      completedCompetitions: [],
      competitionResults: [],
      leaderboards: {}
    },
    genetics: {
      traits: {},
      lineage: {},
      breedingRecords: []
    },
    facilities: {
      barn: { level: 0, capacity: 10 },
      stable: { level: 0, capacity: 5 },
      chickenCoop: { level: 0, capacity: 20 },
      pigPen: { level: 0, capacity: 8 },
      sheepPasture: { level: 0, capacity: 15 }
    },
    care: {
      feedingSchedule: {},
      healthRecords: {},
      vaccinations: {},
      grooming: {}
    },
    products: {
      milk: 0,
      eggs: 0,
      wool: 0,
      meat: 0,
      manure: 0
    }
  });

  // Achievement expansion
  const [achievementProgress, setAchievementProgress] = useState(() => saved?.achievementProgress || {});
  const [collections, setCollections] = useState(() => saved?.collections || {
    crops: new Set(),
    decorations: new Set(),
    themes: new Set(),
    specialCrops: new Set()
  });
  const [prestigeLevel, setPrestigeLevel] = useState(() => saved?.prestigeLevel || 0);
  const [prestigeBonuses, setPrestigeBonuses] = useState(() => saved?.prestigeBonuses || {
    coinMultiplier: 1.0,
    expMultiplier: 1.0,
    growthSpeed: 1.0
  });
  const [milestoneRewards, setMilestoneRewards] = useState(() => saved?.milestoneRewards || {
    unlocked: new Set(),
    available: new Set()
  });

  // Advanced automation
  const [farmAI, setFarmAI] = useState(() => saved?.farmAI || {
    enabled: false,
    learningMode: true,
    optimizationLevel: 1,
    predictions: {},
    recommendations: []
  });
  const [autoScheduler, setAutoScheduler] = useState(() => saved?.autoScheduler || {
    enabled: false,
    schedule: {},
    efficiency: 0.8,
    adaptationRate: 0.1
  });
  const [smartOptimization, setSmartOptimization] = useState(() => saved?.smartOptimization || {
    cropRotation: [],
    resourceAllocation: {},
    riskManagement: {},
    performanceMetrics: {}
  });

  // Basic state
  const [gridSize, setGridSize] = useState(() => saved?.size || MIN_SIZE);
  const [plots, setPlots] = useState(() => saved?.plots || makeGrid(MIN_SIZE));
  const [coins, setCoins] = useState(() => saved?.coins || 75);
  const [score, setScore] = useState(() => saved?.score || 0);
  const [name, setName] = useState(() => saved?.name || "Farmer");
  const [inventory, setInventory] = useState(() => saved?.inventory || {
    // Basic crops - good starting variety
    carrot: 8, lettuce: 5, potato: 4, garlic: 3,
    // Mid-tier crops
    corn: 2, tomato: 2, bellPepper: 1,
    // Advanced crops
    strawberry: 1, sunflower: 1, pumpkin: 0
  });
  const [selectedSeed, setSelectedSeed] = useState(() => saved?.selectedSeed || "carrot");
  const [currentTime, setCurrentTime] = useState(nowSec());
  const [size, setSize] = useState(() => saved?.size || MIN_SIZE);
  const [notifications, setNotifications] = useState([]);
  
  // Festival system state
  const [activeFestival, setActiveFestival] = useState(() => saved?.activeFestival || null);
  const [festivalStartTime, setFestivalStartTime] = useState(() => saved?.festivalStartTime || null);
  const [festivalEndTime, setFestivalEndTime] = useState(() => saved?.festivalEndTime || null);
  const [festivalScore, setFestivalScore] = useState(() => saved?.festivalScore || 0);
  const [festivalTrophies, setFestivalTrophies] = useState(() => saved?.festivalTrophies || []);
  const [limitedTimeSeeds, setLimitedTimeSeeds] = useState(() => saved?.limitedTimeSeeds || {});
  
  // Additional game state
  const [achievements, setAchievements] = useState([]);
  const [totalHarvests, setTotalHarvests] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  
  // Genetics & Breeding System State
  const [geneticLab, setGeneticLab] = useState({
    level: 1,
    experience: 0,
    unlockedTraits: ["fast_growth", "high_yield"],
    breedingSlots: 2,
    researchProjects: []
  });
  const [cropGeneBank, setCropGeneBank] = useState({});
  const [activeBreedingProjects, setActiveBreedingProjects] = useState([]);
  const [discoveredHybrids, setDiscoveredHybrids] = useState([]);
  const [geneticTraits, setGeneticTraits] = useState({});
  
  // Soil Management State
  const [availableSoils, setAvailableSoils] = useState(["loamy"]);
  const [soilInventory, setSoilInventory] = useState({
    compost: 10,
    gypsum: 5,
    sand: 8,
    lime: 6,
    sulfur: 4
  });
  
  // Companion Planting State
  const [companionBonuses, setCompanionBonuses] = useState({});
  const [companionKnowledge, setCompanionKnowledge] = useState({
    level: 1,
    discoveredRelationships: ["tomato-carrot", "carrot-lettuce"],
    totalSuccessfulCompanions: 0
  });
  
  // Weather & Seasons State
  const [currentWeather, setCurrentWeather] = useState("sunny");
  const [weatherChangeTime, setWeatherChangeTime] = useState(nowSec() + 120); // Change every 2 minutes
  const [currentSeason, setCurrentSeason] = useState("spring");
  const [seasonStartTime, setSeasonStartTime] = useState(nowSec());
  const [weatherHistory, setWeatherHistory] = useState(["sunny"]);
  
  // Achievements State
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [harvestedCropTypes, setHarvestedCropTypes] = useState(new Set());
  const [totalEarned, setTotalEarned] = useState(0);
  
  // Buildings & Livestock State
  const [buildings, setBuildings] = useState(() => saved?.buildings || []);
  const [livestock, setLivestock] = useState(() => saved?.livestock || []);
  const [animalFeed, setAnimalFeed] = useState(() => saved?.animalFeed || 100);
  const [animalProducts, setAnimalProducts] = useState(() => saved?.animalProducts || {
    eggs: 0,
    milk: 0,
    wool: 0,
    truffles: 0
  });
  
  // Pest & Disease State
  const [pestOutbreaks, setPestOutbreaks] = useState(() => saved?.pestOutbreaks || []);
  const [treatmentInventory, setTreatmentInventory] = useState(() => saved?.treatmentInventory || {
    organicSpray: 0,
    pesticide: 0,
    fungicide: 0,
    beneficialInsects: 0
  });
  
  // Grid Expansion State
  const [maxGridSize, setMaxGridSize] = useState(() => saved?.maxGridSize || 3);
  const [unlockedGridSizes, setUnlockedGridSizes] = useState(() => saved?.unlockedGridSizes || [3]);
  
  // Market System State
  const [marketPrices, setMarketPrices] = useState(() => saved?.marketPrices || {});
  const [selectedTown, setSelectedTown] = useState(() => saved?.selectedTown || "greenville");
  const [marketHistory, setMarketHistory] = useState(() => saved?.marketHistory || []);
  
  // Processing System State
  const [processingQueue, setProcessingQueue] = useState(() => saved?.processingQueue || []);
  const [processedGoods, setProcessedGoods] = useState(() => saved?.processedGoods || {
    bread: 0, cheese: 0, flour: 0, jam: 0
  });
  
  // Research System State
  const [researchPoints, setResearchPoints] = useState(() => saved?.researchPoints || 0);
  const [completedResearch, setCompletedResearch] = useState(() => saved?.completedResearch || []);
  const [activeResearch, setActiveResearch] = useState(() => saved?.activeResearch || null);
  const [researchStartTime, setResearchStartTime] = useState(() => saved?.researchStartTime || 0);
  
  // Automation State
  const [automationSystems, setAutomationSystems] = useState(() => saved?.automationSystems || {});
  const [energyProduction, setEnergyProduction] = useState(() => saved?.energyProduction || 0);
  const [energyConsumption, setEnergyConsumption] = useState(() => saved?.energyConsumption || 0);
  const [energySystems, setEnergySystems] = useState(() => saved?.energySystems || []);
  
  // Game Control State
  const [gameSpeed, setGameSpeed] = useState(() => saved?.gameSpeed || 1); // 0.5x, 1x, 2x, 4x
  const [gamePaused, setGamePaused] = useState(false); // Don't save pause state

  // Context menu for plots (right-click actions)
  const [plotMenu, setPlotMenu] = useState({ open: false, x: 0, y: 0, plotIndex: null });
  const touchTimerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("shop");

  // Contracts & NPCs
  const [reputation, setReputation] = useState(() => saved?.reputation || 0);
  const [activeContracts, setActiveContracts] = useState(() => saved?.activeContracts || []);
  const [availableContracts, setAvailableContracts] = useState(() => saved?.availableContracts || []);
  const [rivalScores, setRivalScores] = useState(() => saved?.rivalScores || { oakridge: 0, willowbend: 0 });

  // Logistics
  const [vehiclesOwned, setVehiclesOwned] = useState(() => saved?.vehiclesOwned || { handcart: 1 });
  const [vehicleUpgrades, setVehicleUpgrades] = useState(() => saved?.vehicleUpgrades || { tractorTrailer: false, routePlanner: false, refrigerationKit: false });
  const [fuel, setFuel] = useState(() => saved?.fuel || 20);
  const [deliveries, setDeliveries] = useState(() => saved?.deliveries || []);
  const [lastSpoilage, setLastSpoilage] = useState(() => saved?.lastSpoilage || nowSec());
  const [marketPerks, setMarketPerks] = useState(() => saved?.marketPerks || { brandLicense: false, contractBureau: false, festivalBooth: false });
  const [lastContractReroll, setLastContractReroll] = useState(() => saved?.lastContractReroll || 0);

  // Forecast & Disasters
  const [forecast, setForecast] = useState(() => saved?.forecast || []); // [{time, type}]
  const [activeDisaster, setActiveDisaster] = useState(() => saved?.activeDisaster || null);
  const [insurance, setInsurance] = useState(() => saved?.insurance || { level: 0, expiresAt: 0 });

  // Game tick with speed control and background throttling
  useEffect(() => {
    if (gamePaused) return;
    const hiddenMultiplier = document?.hidden ? 8 : 1;
    const tickRate = (1000 / gameSpeed) * hiddenMultiplier;
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + gameSpeed);
    }, tickRate);
    const onVis = () => {
      // Force restart of interval by updating state slightly
      setCurrentTime(prev => prev);
    };
    document?.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(interval);
      document?.removeEventListener('visibilitychange', onVis);
    };
  }, [gameSpeed, gamePaused]);

  // Helper functions
  const addNotification = (msg, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev.slice(-2), { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Contracts generation
  const generateContracts = () => {
    const pool = Object.keys(DEFAULT_RULES.seeds);
    const contracts = Array.from({ length: 3 }).map(() => {
      const crop = pool[Math.floor(Math.random() * pool.length)];
      const quantity = 5 + Math.floor(Math.random() * 15);
      const npc = NPCS[Math.floor(Math.random() * NPCS.length)];
      const base = DEFAULT_RULES.seeds[crop]?.baseValue || 5;
      let reward = Math.floor(base * quantity * npc.priceMultiplier * (1 + reputation * 0.02));
      // Contract Bureau: better deals
      if (marketPerks.contractBureau) reward = Math.floor(reward * 1.05);
      return {
        id: `contract_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        npcId: npc.id,
        crop,
        quantity,
        reward,
        expiresAt: nowSec() + 1800
      };
    });
    setAvailableContracts(contracts);
  };

  // Forecast generation
  const generateForecast = () => {
    const types = Object.keys(WEATHER_TYPES);
    const f = Array.from({ length: 5 }).map((_, i) => ({
      day: i + 1,
      type: types[Math.floor(Math.random() * types.length)]
    }));
    setForecast(f);
  };

  // Possibly trigger a disaster occasionally
  const maybeTriggerDisaster = () => {
    if (activeDisaster) return;
    if (Math.random() < 0.02) { // 2% per tick
      const keys = Object.keys(DISASTERS);
      const key = keys[Math.floor(Math.random() * keys.length)];
      const d = DISASTERS[key];
      setActiveDisaster({ key, endsAt: nowSec() + d.duration });
      addNotification(`${d.emoji} ${d.name} struck!`, "warning");
    }
  };

  // Deliveries processor
  const processDeliveries = () => {
    const now = nowSec();
    const completed = [];
    const remaining = [];
    deliveries.forEach(del => {
      if (del.arrivesAt <= now) completed.push(del); else remaining.push(del);
    });
    if (completed.length > 0) {
      completed.forEach(d => {
        setCoins(prev => prev + d.netProfit);
        setMarketHistory(prev => [...prev, { time: nowSec(), crop: d.crop, quantity: d.quantity, town: d.town, revenue: d.netProfit }]);
      });
      addNotification(`Completed ${completed.length} delivery(ies)!`, "success");
      setDeliveries(remaining);
    }
  };

  // Festival functions
  const startFestival = (festivalId) => {
    const festival = FESTIVALS.find(f => f.id === festivalId);
    if (!festival) return;

    const startTime = nowSec();
    const endTime = startTime + festival.duration;

    setActiveFestival(festival);
    setFestivalStartTime(startTime);
    setFestivalEndTime(endTime);
    setFestivalScore(0);

    // Add limited time seeds
    const newLimitedSeeds = { ...limitedTimeSeeds };
    Object.entries(LIMITED_TIME_CROPS).forEach(([seed, data]) => {
      if (data.season === festival.season) {
        newLimitedSeeds[seed] = 3; // Give 3 of each festival seed
      }
    });
    setLimitedTimeSeeds(newLimitedSeeds);

    addNotification(`🎉 ${festival.name} started! ${festival.duration/60} minutes remaining!`, "success");
  };

  const endFestival = () => {
    if (!activeFestival) return;

    const rewards = activeFestival.rewards;
    setCoins(prev => prev + rewards.coins);
    setExperience(prev => prev + rewards.experience);

    // Add trophy if score is high enough
    if (festivalScore >= 100) {
      setFestivalTrophies(prev => [...prev, {
        festival: activeFestival.id,
        score: festivalScore,
        date: new Date().toISOString()
      }]);
      addNotification(`🏆 Festival trophy earned! Score: ${festivalScore}`, "success");
    }

    addNotification(`Festival ended! Rewards: ${rewards.coins} coins, ${rewards.experience} XP`, "success");

    setActiveFestival(null);
    setFestivalStartTime(null);
    setFestivalEndTime(null);
    setFestivalScore(0);
    setLimitedTimeSeeds({});
  };

  const getFestivalBonus = (type) => {
    if (!activeFestival) return 1;
    return activeFestival.bonuses[type] || 1;
  };

  // Genetics functions
  const addCropToGeneBank = (seed, traits = []) => {
    const cropId = `${seed}_${Date.now()}`;
    setCropGeneBank(prev => ({
            ...prev,
      [cropId]: {
        seed,
        traits: traits.length > 0 ? traits : ENHANCED_CROP_DATA[seed]?.baseTraits || [],
        generation: 1,
        parentage: [],
        addedAt: nowSec()
      }
    }));
    addNotification(`Added ${seed} to gene bank!`, "success");
  };

  const startBreedingProject = (parent1Id, parent2Id) => {
    if (activeBreedingProjects.length >= geneticLab.breedingSlots) {
      addNotification("No breeding slots available!", "error");
      return;
    }

    const parent1 = cropGeneBank[parent1Id];
    const parent2 = cropGeneBank[parent2Id];
    
    if (!parent1 || !parent2) {
      addNotification("Invalid parent crops!", "error");
        return;
      }

    const projectId = `breeding_${Date.now()}`;
    const duration = 120; // 2 minutes
    
    setActiveBreedingProjects(prev => [...prev, {
      id: projectId,
      parent1: parent1Id,
      parent2: parent2Id,
      startTime: nowSec(),
      endTime: nowSec() + duration,
      completed: false
    }]);

    addNotification(`Started breeding project! ${duration/60} minutes remaining.`, "success");
  };

  const completeBreedingProject = (projectId) => {
    const project = activeBreedingProjects.find(p => p.id === projectId);
    if (!project) return;

    const parent1 = cropGeneBank[project.parent1];
    const parent2 = cropGeneBank[project.parent2];
    
    // Breed crops and create offspring
    const offspring = breedCrops(parent1, parent2);
    
    // Add to gene bank
    const offspringId = `${offspring.seed}_${Date.now()}`;
    setCropGeneBank(prev => ({
            ...prev,
      [offspringId]: offspring
    }));

    // Remove completed project
    setActiveBreedingProjects(prev => prev.filter(p => p.id !== projectId));
    
    // Add lab experience
    setGeneticLab(prev => ({ ...prev, experience: prev.experience + 25 }));

    addNotification(`Breeding complete! New ${offspring.seed} with ${offspring.traits.length} traits!`, "success");
  };

  const breedCrops = (parent1, parent2) => {
    // Determine offspring seed (random from parents)
    const seed = Math.random() < 0.5 ? parent1.seed : parent2.seed;
    
    // Inherit traits
    const allParentTraits = [...new Set([...parent1.traits, ...parent2.traits])];
    const inheritedTraits = [];
    
    allParentTraits.forEach(trait => {
      const parent1Has = parent1.traits.includes(trait);
      const parent2Has = parent2.traits.includes(trait);
      
      let inheritChance = 0;
      if (parent1Has && parent2Has) {
        inheritChance = TRAIT_INHERITANCE_CHANCES.both_parents;
      } else if (parent1Has || parent2Has) {
        inheritChance = TRAIT_INHERITANCE_CHANCES.one_parent;
      }
      
      if (Math.random() < inheritChance) {
        inheritedTraits.push(trait);
      }
    });

    // Mutation chance for new traits
    const possibleTraits = ENHANCED_CROP_DATA[seed]?.possibleTraits || [];
    possibleTraits.forEach(trait => {
      if (!inheritedTraits.includes(trait) && Math.random() < TRAIT_INHERITANCE_CHANCES.mutation) {
        inheritedTraits.push(trait);
        addNotification(`🧬 Mutation! ${seed} gained ${CROP_GENETIC_TRAITS[trait]?.name}!`, "success");
      }
    });

    return {
      seed,
      traits: inheritedTraits,
      generation: Math.max(parent1.generation, parent2.generation) + 1,
      parentage: [parent1.seed, parent2.seed],
      addedAt: nowSec()
    };
  };

  const upgradeGeneticLab = () => {
    const upgradeCost = geneticLab.level * 200;
    if (coins < upgradeCost) {
      addNotification("Not enough coins for lab upgrade!", "error");
      return;
    }

    setCoins(prev => prev - upgradeCost);
    setGeneticLab(prev => ({
      ...prev,
      level: prev.level + 1,
      breedingSlots: prev.breedingSlots + 1,
      experience: 0
    }));

    addNotification(`Lab upgraded to level ${geneticLab.level + 1}!`, "success");
  };

  // Soil management functions
  const changePlotSoil = (plotIndex, soilType) => {
    const soilData = SOIL_TYPES[soilType];
    if (!soilData || !availableSoils.includes(soilType)) {
      addNotification("Soil type not available!", "error");
      return;
    }

    if (coins < soilData.cost) {
      addNotification("Not enough coins!", "error");
        return;
      }

    setCoins(prev => prev - soilData.cost);
    
    const newPlots = [...plots];
    newPlots[plotIndex] = {
      ...newPlots[plotIndex],
      soilType,
      soilQuality: 0.8 // Reset quality
    };
    setPlots(newPlots);
    
    addNotification(`Changed to ${soilData.name}!`, "success");
  };

  const applySoilImprovement = (plotIndex, improvementType) => {
    const improvement = SOIL_IMPROVEMENTS[improvementType];
    if (!improvement || !soilInventory[improvementType] || soilInventory[improvementType] <= 0) {
      addNotification("Improvement not available!", "error");
      return;
    }

    setSoilInventory(prev => ({
      ...prev,
      [improvementType]: prev[improvementType] - 1
    }));

    const newPlots = [...plots];
    const plot = newPlots[plotIndex];
    
    // Add improvement with expiry time
    const newImprovement = {
      type: improvementType,
      appliedAt: nowSec(),
      expiresAt: nowSec() + improvement.duration
    };
    
    plot.improvements = [...(plot.improvements || []), newImprovement];
    setPlots(newPlots);
    
    addNotification(`Applied ${improvement.name}!`, "success");
  };

  // Water/Fertilize/Pesticide actions for context menu
  const waterPlot = (plotIndex) => {
    const newPlots = [...plots];
    const plot = newPlots[plotIndex];
    if (!plot || plot.status !== "growing") return;
    plot.health = Math.min(100, plot.health + 5);
    // Minor growth speed bump via a temporary improvement
    plot.improvements = [...(plot.improvements||[]), { type: "watering", appliedAt: nowSec(), expiresAt: nowSec() + 180 }];
    setPlots(newPlots);
    addNotification("💧 Watered plot", "success");
  };

  const fertilizePlot = (plotIndex) => {
    // Reuse soil improvement stock if available, else apply a lightweight buff
    if ((soilInventory.compost||0) > 0) {
      applySoilImprovement(plotIndex, "compost");
      return;
    }
    const newPlots = [...plots];
    const plot = newPlots[plotIndex];
    if (!plot) return;
    plot.improvements = [...(plot.improvements||[]), { type: "temp_fertilizer", appliedAt: nowSec(), expiresAt: nowSec() + 300 }];
    setPlots(newPlots);
    addNotification("🌱 Applied fertilizer", "success");
  };

  const pesticidePlot = (plotIndex) => {
    // Prefer using treatment inventory
    const type = Object.keys(TREATMENTS)[0];
    if (type && (treatmentInventory[type]||0) > 0) {
      treatPlot(plotIndex, type);
      return;
    }
    const newPlots = [...plots];
    const plot = newPlots[plotIndex];
    if (!plot) return;
    plot.pests = [];
    plot.diseases = [];
    plot.health = Math.min(100, plot.health + 10);
    setPlots(newPlots);
    addNotification("🧪 Applied pesticide", "success");
  };

  const buySoilImprovement = (type, amount) => {
    const improvement = SOIL_IMPROVEMENTS[type];
    const cost = improvement.cost * amount;
    
    if (coins < cost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - cost);
    setSoilInventory(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + amount
    }));
    
    addNotification(`Bought ${amount} ${improvement.name}!`, "success");
  };

  const unlockSoilType = (soilType) => {
    const soilData = SOIL_TYPES[soilType];
    if (!soilData || level < soilData.unlockLevel) {
      addNotification("Level requirement not met!", "error");
      return;
    }

    if (availableSoils.includes(soilType)) {
      addNotification("Already unlocked!", "error");
      return;
    }

    setAvailableSoils(prev => [...prev, soilType]);
    addNotification(`Unlocked ${soilData.name}!`, "success");
  };

  const getSoilBonus = (plotIndex) => {
    const plot = plots[plotIndex];
    if (!plot) return { growth: 1, value: 1 };

    const soilData = SOIL_TYPES[plot.soilType];
    let bonus = { ...soilData.bonuses };

    // Apply active improvements
    if (plot.improvements) {
      plot.improvements.forEach(imp => {
        if (nowSec() < imp.expiresAt) {
          const impData = SOIL_IMPROVEMENTS[imp.type];
          if (impData && impData.effects && impData.effects.fertility) {
            // Soil Biology boosts compost potency
            const potency = completedResearch.includes('soilBiology') ? 1.5 : 1;
            bonus.growth *= (1 + impData.effects.fertility * potency);
          }
          // Temporary buffs from context actions
          if (imp.type === 'watering') {
            bonus.growth *= 1.05;
          }
          if (imp.type === 'temp_fertilizer') {
            bonus.growth *= 1.10;
            bonus.value = (bonus.value || 1) * 1.05;
          }
        }
      });
    }

    return bonus;
  };

  // Companion planting functions
  const getAdjacentPlots = (plotIndex) => {
    const gridSize = Math.sqrt(plots.length);
    const row = Math.floor(plotIndex / gridSize);
    const col = plotIndex % gridSize;
    
    const adjacent = [];
    for (let dr = -COMPANION_RANGE; dr <= COMPANION_RANGE; dr++) {
      for (let dc = -COMPANION_RANGE; dc <= COMPANION_RANGE; dc++) {
        if (dr === 0 && dc === 0) continue; // Skip self
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          adjacent.push(newRow * gridSize + newCol);
        }
      }
    }
    return adjacent;
  };

  const calculateCompanionEffects = () => {
    const newBonuses = {};
    
    plots.forEach((plot, plotIndex) => {
      if (plot.status === "growing" || plot.status === "ready") {
        const adjacentPlots = getAdjacentPlots(plotIndex);
        let totalBonus = { growth: 1, value: 1, quality: 1 };
        
        adjacentPlots.forEach(adjIndex => {
          const adjPlot = plots[adjIndex];
          if (adjPlot && (adjPlot.status === "growing" || adjPlot.status === "ready") && adjPlot.seed) {
            const relationshipKey1 = `${plot.seed}-${adjPlot.seed}`;
            const relationshipKey2 = `${adjPlot.seed}-${plot.seed}`;
            
            const relationship = COMPANION_RELATIONSHIPS[relationshipKey1] || COMPANION_RELATIONSHIPS[relationshipKey2];
            
            if (relationship && companionKnowledge.discoveredRelationships.includes(relationshipKey1) || companionKnowledge.discoveredRelationships.includes(relationshipKey2)) {
              if (relationship.bonuses.growth) totalBonus.growth *= relationship.bonuses.growth;
              if (relationship.bonuses.quality) totalBonus.quality *= relationship.bonuses.quality;
              if (relationship.bonuses.pest_resistance) totalBonus.value *= relationship.bonuses.pest_resistance;
            }
          }
        });
        
        newBonuses[plotIndex] = totalBonus;
      }
    });
    
    setCompanionBonuses(newBonuses);
  };

  const getCompanionBonus = (plotIndex) => {
    return companionBonuses[plotIndex] || { growth: 1, value: 1, quality: 1 };
  };

  const discoverCompanionRelationship = (seed1, seed2) => {
    const relationshipKey1 = `${seed1}-${seed2}`;
    const relationshipKey2 = `${seed2}-${seed1}`;
    
    const relationship = COMPANION_RELATIONSHIPS[relationshipKey1] || COMPANION_RELATIONSHIPS[relationshipKey2];
    const key = COMPANION_RELATIONSHIPS[relationshipKey1] ? relationshipKey1 : relationshipKey2;
    
    if (relationship && !companionKnowledge.discoveredRelationships.includes(key)) {
      setCompanionKnowledge(prev => ({
        ...prev,
        discoveredRelationships: [...prev.discoveredRelationships, key],
        totalSuccessfulCompanions: prev.totalSuccessfulCompanions + 1
      }));
      
      addNotification(`🌸 Discovered: ${seed1} + ${seed2} are ${relationship.type}s!`, "success");
      return true;
    }
    return false;
  };

  // Weather functions
  const changeWeather = () => {
    const weatherTypes = Object.keys(WEATHER_TYPES);
    const random = Math.random();
    let cumulative = 0;
    
    for (const weatherType of weatherTypes) {
      cumulative += WEATHER_TYPES[weatherType].chance;
      if (random <= cumulative) {
        setCurrentWeather(weatherType);
        setWeatherChangeTime(nowSec() + 120); // Next change in 2 minutes
        setWeatherHistory(prev => [...prev.slice(-4), weatherType]); // Keep last 5
        addNotification(`Weather changed to ${WEATHER_TYPES[weatherType].name} ${WEATHER_TYPES[weatherType].emoji}`, "info");
        return;
      }
    }
  };

  const getWeatherBonus = () => {
    // Greenhouse II immunity
    const hasGH2 = buildings.some(b => b.type === 'greenhouse2');
    const base = hasGH2 ? { growth: 1, water: 1 } : (WEATHER_TYPES[currentWeather]?.effects || { growth: 1, water: 1 });
    // Aquaponics reduces drought/storm penalties
    if (buildings.some(b => b.type === 'aquaponicsLab')) {
      if (currentWeather === 'drought' || currentWeather === 'stormy') {
        base.growth = (base.growth || 1) * 1.15;
      }
    }
    if (activeDisaster) {
      const d = DISASTERS[activeDisaster.key];
      if (d) {
        return { ...base, growth: (base.growth || 1) * d.growth };
      }
    }
    return base;
  };

  const changeSeason = () => {
    const seasons = Object.keys(SEASONS);
    const currentIndex = seasons.indexOf(currentSeason);
    const nextSeason = seasons[(currentIndex + 1) % seasons.length];
    
    setCurrentSeason(nextSeason);
    setSeasonStartTime(nowSec());
    addNotification(`Season changed to ${SEASONS[nextSeason].name} ${SEASONS[nextSeason].emoji}`, "info");
  };

  const getSeasonBonus = () => {
    const base = SEASONS[currentSeason]?.effects || { growth: 1 };
    // Greenhouse II winter bonus
    if (currentSeason === 'winter' && buildings.some(b => b.type === 'greenhouse2')) {
      return { ...base, growth: (base.growth || 1) * 1.25 };
    }
    // Orchard House winter trickle growth
    if (currentSeason === 'winter' && buildings.some(b => b.type === 'orchardHouse')) {
      return { ...base, growth: (base.growth || 1) * 1.05 };
    }
    return base;
  };

  // Achievement functions
  const checkAchievements = () => {
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let unlocked = false;
      
      switch (achievement.id) {
        case "first_harvest":
          unlocked = totalHarvests >= 1;
          break;
        case "master_farmer":
          unlocked = totalHarvests >= achievement.target;
          break;
        case "green_thumb":
          unlocked = harvestedCropTypes.size >= achievement.target;
          break;
        case "weather_master":
          unlocked = new Set(weatherHistory).size >= 4; // Experienced 4 different weather types
          break;
        case "festival_champion":
          unlocked = festivalTrophies.length >= achievement.target;
          break;
        case "genetics_researcher":
          unlocked = discoveredHybrids.length >= achievement.target;
          break;
        case "companion_expert":
          unlocked = companionKnowledge.discoveredRelationships.length >= achievement.target;
          break;
        case "millionaire":
          unlocked = totalEarned >= achievement.target;
          break;
      }
      
      if (unlocked) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setCoins(prev => prev + achievement.reward);
        addNotification(`🏆 Achievement: ${achievement.name}! +${achievement.reward} coins`, "success");
      }
    });
  };

  // Buildings functions
  const buyBuilding = (buildingType) => {
    const building = BUILDINGS[buildingType];
    if (!building || level < building.unlockLevel) {
      addNotification("Building not available at your level!", "error");
      return;
    }
    
    if (coins < building.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(prev => prev - building.cost);
    setBuildings(prev => [...prev, {
      type: buildingType,
      id: `${buildingType}_${Date.now()}`,
      builtAt: nowSec(),
      level: 1
    }]);
    
    addNotification(`Built ${building.name}!`, "success");
  };

  const hasBuilding = (buildingType) => {
    return buildings.some(b => b.type === buildingType);
  };

  // Livestock functions
  const buyAnimal = (animalType) => {
    const animal = LIVESTOCK_TYPES[animalType];
    if (!animal || level < animal.unlockLevel) {
      addNotification("Animal not available at your level!", "error");
      return;
    }
    
    if (!hasBuilding("barn")) {
      addNotification("You need a barn to house animals!", "error");
      return;
    }
    
    const barnCapacity = buildings.filter(b => b.type === "barn").length * BUILDINGS.barn.capacity;
    if (livestock.length >= barnCapacity) {
      addNotification("Barn is full! Build more barns.", "error");
      return;
    }
    
    if (coins < animal.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(prev => prev - animal.cost);
    setLivestock(prev => [...prev, {
      type: animalType,
      id: `${animalType}_${Date.now()}`,
      boughtAt: nowSec(),
      lastProduced: nowSec(),
      happiness: 100
    }]);
    
    addNotification(`Bought ${animal.name}!`, "success");
  };

  const collectAnimalProducts = () => {
    let totalCollected = 0;
    let totalValue = 0;
    
    const newLivestock = livestock.map(animal => {
      const animalData = LIVESTOCK_TYPES[animal.type];
      const timeSinceProduction = currentTime - animal.lastProduced;
      
      if (timeSinceProduction >= animalData.productionTime) {
        const productionsReady = Math.floor(timeSinceProduction / animalData.productionTime);
        totalCollected += productionsReady;
        totalValue += productionsReady * animalData.productValue;
        
        setAnimalProducts(prev => ({
          ...prev,
          [animalData.produces]: prev[animalData.produces] + productionsReady
        }));

      return {
          ...animal,
          lastProduced: currentTime
        };
      }
      return animal;
    });
    
    if (totalCollected > 0) {
      setLivestock(newLivestock);
      setCoins(prev => prev + totalValue);
      addNotification(`Collected ${totalCollected} products for ${totalValue} coins!`, "success");
    }
  };

  const feedAnimals = () => {
    if (animalFeed <= 0) {
      addNotification("No feed available! Buy more feed.", "error");
      return;
    }
    
    const feedNeeded = livestock.reduce((total, animal) => {
      return total + LIVESTOCK_TYPES[animal.type].feedConsumption;
    }, 0);
    
    if (animalFeed < feedNeeded) {
      addNotification("Not enough feed for all animals!", "error");
      return;
    }
    
    setAnimalFeed(prev => prev - feedNeeded);
    setLivestock(prev => prev.map(animal => ({
      ...animal,
      happiness: Math.min(100, animal.happiness + 20)
    })));
    
    addNotification(`Fed ${livestock.length} animals!`, "success");
  };

  const buyFeed = (amount) => {
    const cost = amount * 2; // 2 coins per feed
    if (coins < cost) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(prev => prev - cost);
    setAnimalFeed(prev => prev + amount);
    addNotification(`Bought ${amount} feed!`, "success");
  };

  // Pest and Disease functions
  const checkForPestsAndDiseases = () => {
    const newPlots = [...plots];
    let outbreaksFound = 0;
    
    newPlots.forEach((plot, i) => {
      if (plot.status === "growing" && plot.seed) {
        const timeSinceCheck = currentTime - plot.lastPestCheck;
        
        // Check every 2 minutes for potential issues
        if (timeSinceCheck >= 120) {
          plot.lastPestCheck = currentTime;
          
          // Base chance of pest/disease (5% per check)
          let pestChance = 0.05;
          
          // Weather affects pest chance
          if (currentWeather === "rainy") pestChance += 0.03;
          if (currentWeather === "stormy") pestChance += 0.05;
          if (currentWeather === "drought") pestChance += 0.02;
          
          // Companion planting reduces pest chance
          if (companionBonuses[i]?.pestResistance > 1) {
            pestChance *= 0.5;
          }
          
          if (Math.random() < pestChance) {
            // Find applicable pests/diseases for this crop
            const possibleIssues = Object.entries(PESTS_AND_DISEASES).filter(
              ([_, issue]) => issue.affectedCrops.includes(plot.seed)
            );
            
            if (possibleIssues.length > 0) {
              const [issueId, issue] = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
              
              if (issue.type === "pest" && !plot.pests.includes(issueId)) {
                plot.pests.push(issueId);
                outbreaksFound++;
              } else if (issue.type === "disease" && !plot.diseases.includes(issueId)) {
                plot.diseases.push(issueId);
                outbreaksFound++;
              }
            }
          }
          
          // Calculate health damage
          let healthDamage = 0;
          plot.pests.forEach(pestId => {
            healthDamage += PESTS_AND_DISEASES[pestId].damageRate;
          });
          plot.diseases.forEach(diseaseId => {
            healthDamage += PESTS_AND_DISEASES[diseaseId].damageRate;
          });
          
          plot.health = Math.max(0, plot.health - healthDamage * 10);
        }
      }
    });
    
    if (outbreaksFound > 0) {
      setPlots(newPlots);
      addNotification(`⚠️ ${outbreaksFound} new pest/disease outbreak${outbreaksFound > 1 ? 's' : ''}!`, "warning");
    }
  };

  const treatPlot = (plotIndex, treatmentType) => {
    const treatment = TREATMENTS[treatmentType];
    if (!treatment) return;
    
    if (treatmentInventory[treatmentType] <= 0) {
      addNotification("No treatment available!", "error");
      return;
    }
    
    const newPlots = [...plots];
    const plot = newPlots[plotIndex];
    
    // Remove pests/diseases based on treatment effectiveness
    if (Math.random() < treatment.effectiveness) {
      plot.pests = [];
      plot.diseases = [];
      plot.health = Math.min(100, plot.health + 20);
      addNotification(`${treatment.emoji} Treatment successful!`, "success");
      } else {
      addNotification("Treatment partially effective...", "warning");
      plot.health = Math.min(100, plot.health + 10);
    }
    
    setPlots(newPlots);
    setTreatmentInventory(prev => ({
      ...prev,
      [treatmentType]: prev[treatmentType] - 1
    }));
  };

  const buyTreatment = (treatmentType, quantity = 1) => {
    const treatment = TREATMENTS[treatmentType];
    const cost = treatment.cost * quantity;
    
    if (coins < cost) {
      addNotification("Not enough coins!", "error");
      return;
    }
    
    setCoins(prev => prev - cost);
    setTreatmentInventory(prev => ({
      ...prev,
      [treatmentType]: prev[treatmentType] + quantity
    }));
    
    addNotification(`Bought ${quantity}x ${treatment.name}!`, "success");
  };

  // Market System functions
  const generateMarketPrices = () => {
    const newPrices = {};
    Object.keys(DEFAULT_RULES.seeds).forEach(crop => {
      const basePriceMultiplier = 1.0;
      let priceMultiplier = basePriceMultiplier;
      
      // Random market fluctuation (±20%)
      priceMultiplier *= (0.8 + Math.random() * 0.4);
      
      // Town preferences affect price
      const town = MARKET_TOWNS[selectedTown];
      if (town.preferences.includes(crop)) {
        priceMultiplier *= 1.3; // 30% bonus for preferred crops
      }
      
      // Season affects price
      const seedData = DEFAULT_RULES.seeds[crop];
      if (seedData.season === currentSeason) {
        priceMultiplier *= 0.9; // In-season crops are cheaper
      } else {
        priceMultiplier *= 1.1; // Out-of-season crops are more expensive
      }
      
      newPrices[crop] = Math.round(seedData.baseValue * priceMultiplier);
    });
    
    setMarketPrices(newPrices);
  };

  const sellToMarket = (crop, quantity) => {
    if (!inventory[crop] || inventory[crop] < quantity) {
      addNotification("Not enough crops to sell!", "error");
      return;
    }
    
    const town = MARKET_TOWNS[selectedTown];
    let pricePerUnit = marketPrices[crop] || DEFAULT_RULES.seeds[crop]?.baseValue || 0;
    if (marketPerks.brandLicense && (pricePerUnit >= 20)) {
      pricePerUnit = Math.floor(pricePerUnit * 1.1);
    }
    let totalRevenue = pricePerUnit * quantity;
    if (marketPerks.festivalBooth && activeFestival) {
      totalRevenue = Math.floor(totalRevenue * 1.2);
    }
    const transportCost = town.transportCost * quantity;
    const netProfit = totalRevenue - transportCost;
    
    if (netProfit <= 0) {
      addNotification("Transport costs too high for profit!", "error");
      return;
    }
    
    setInventory(prev => ({
      ...prev,
      [crop]: prev[crop] - quantity
    }));
    
    setCoins(prev => prev + netProfit);
    setTotalEarned(prev => prev + netProfit);
    
    // Add to market history
    setMarketHistory(prev => [...prev.slice(-9), {
      crop,
      quantity,
      pricePerUnit,
      transportCost,
      netProfit,
      town: selectedTown,
      timestamp: currentTime
    }]);
    
    addNotification(`Sold ${quantity}x ${crop} to ${town.name} for ${netProfit} coins!`, "success");
  };

  // Processing System functions
  const startProcessing = (recipeId) => {
    const recipe = PROCESSING_RECIPES[recipeId];
    if (!recipe) return;
    
    if (!hasBuilding(recipe.requiredBuilding)) {
      addNotification(`Need ${BUILDINGS[recipe.requiredBuilding].name} to process!`, "error");
      return;
    }
    
    // Check if we have enough inputs
    for (const [input, needed] of Object.entries(recipe.inputs)) {
      const available = inventory[input] || animalProducts[input] || 0;
      if (available < needed) {
        addNotification(`Need ${needed}x ${input}, have ${available}`, "error");
        return;
      }
    }
    
    // Consume inputs
    Object.entries(recipe.inputs).forEach(([input, needed]) => {
      if (inventory[input]) {
        setInventory(prev => ({ ...prev, [input]: prev[input] - needed }));
      } else if (animalProducts[input]) {
        setAnimalProducts(prev => ({ ...prev, [input]: prev[input] - needed }));
      }
    });
    
    // Add to processing queue
    const speedBonus = buildings.some(b => b.type === 'processingPlant2') ? 1.2 : 1;
    const processingItem = {
      id: `${recipeId}_${Date.now()}`,
      recipeId,
      startTime: currentTime,
      endTime: currentTime + Math.ceil(recipe.processingTime / speedBonus)
    };
    
    // Handle parallel queue +1 if upgraded
    setProcessingQueue(prev => {
      const queueLimit = 1 + (buildings.some(b => b.type === 'processingPlant2') ? 1 : 0);
      const activeForRecipe = prev.filter(p => p.recipeId === recipeId).length;
      if (activeForRecipe >= queueLimit) {
        addNotification("Queue full for this recipe!", "error");
        return prev;
      }
      return [...prev, processingItem];
    });
    addNotification(`Started processing ${recipe.name}!`, "success");
  };

  const completeProcessing = () => {
    const now = currentTime;
    const completed = processingQueue.filter(item => item.endTime <= now);
    
    completed.forEach(item => {
      const recipe = PROCESSING_RECIPES[item.recipeId];
      Object.entries(recipe.outputs).forEach(([output, quantity]) => {
        setProcessedGoods(prev => ({
          ...prev,
          [output]: (prev[output] || 0) + quantity
        }));
      });
      addNotification(`${recipe.name} processing complete!`, "success");
    });
    
    setProcessingQueue(prev => prev.filter(item => item.endTime > now));
  };

  // Research System functions
  const startResearch = (researchId) => {
    const research = RESEARCH_TREE[researchId];
    if (!research) return;
    
    if (activeResearch) {
      addNotification("Already researching something!", "error");
      return;
    }
    
    if (completedResearch.includes(researchId)) {
      addNotification("Already researched!", "error");
      return;
    }
    
    // Check prerequisites
    for (const prereq of research.prerequisites) {
      if (!completedResearch.includes(prereq)) {
        addNotification(`Need to research ${RESEARCH_TREE[prereq].name} first!`, "error");
        return;
      }
    }
    
    if (researchPoints < research.cost) {
      addNotification(`Need ${research.cost} research points, have ${researchPoints}`, "error");
      return;
    }
    
    setResearchPoints(prev => prev - research.cost);
    setActiveResearch(researchId);
    setResearchStartTime(currentTime);
    
    addNotification(`Started researching ${research.name}!`, "success");
  };

  const completeResearch = () => {
    if (!activeResearch) return;
    
    const research = RESEARCH_TREE[activeResearch];
    const researchEndTime = researchStartTime + research.researchTime;
    
    if (currentTime >= researchEndTime) {
      setCompletedResearch(prev => [...prev, activeResearch]);
      addNotification(`🧪 Completed research: ${research.name}!`, "success");
      setActiveResearch(null);
      setResearchStartTime(0);
    }
  };

  // Generate research points from harvesting
  const addResearchPoints = (amount) => {
    setResearchPoints(prev => prev + amount);
  };

  // Automation functions
  const installAutomation = (plotIndex, equipmentType) => {
    const equipment = AUTOMATION_EQUIPMENT[equipmentType];
    if (!equipment) return;
    
    if (!completedResearch.includes(equipment.requiredResearch)) {
      addNotification(`Need to research ${RESEARCH_TREE[equipment.requiredResearch].name}!`, "error");
      return;
    }
    
    if (coins < equipment.cost) {
      addNotification(`Need ${equipment.cost} coins!`, "error");
      return;
    }
    
    // Check if we have enough energy capacity
    const newConsumption = energyConsumption + equipment.energyConsumption;
    if (newConsumption > energyProduction) {
      addNotification("Not enough energy! Build more power sources.", "error");
      return;
    }
    
    const newPlots = [...plots];
    newPlots[plotIndex].automation.push({
      type: equipmentType,
      installedAt: currentTime,
      id: `${equipmentType}_${Date.now()}`
    });
    
    setPlots(newPlots);
    setCoins(prev => prev - equipment.cost);
    setEnergyConsumption(prev => prev + equipment.energyConsumption);
    
    addNotification(`Installed ${equipment.name}!`, "success");
  };

  const buildEnergySystem = (systemType) => {
    const system = ENERGY_SYSTEMS[systemType];
    if (!system) return;
    
    if (!completedResearch.includes(system.requiredResearch)) {
      addNotification(`Need to research ${RESEARCH_TREE[system.requiredResearch].name}!`, "error");
      return;
    }
    
    if (coins < system.cost) {
      addNotification(`Need ${system.cost} coins!`, "error");
      return;
    }
    
    setCoins(prev => prev - system.cost);
    setEnergySystems(prev => [...prev, {
      type: systemType,
      builtAt: currentTime,
      id: `${systemType}_${Date.now()}`
    }]);
    const creditBoost = completedResearch.includes('gridTie') ? 1.1 : 1.0;
    setEnergyProduction(prev => prev + Math.ceil(system.energyProduction * creditBoost));
    
    addNotification(`Built ${system.name}!`, "success");
  };

  // Calculate automation effects
  const getAutomationBonus = (plotIndex) => {
    const plot = plots[plotIndex];
    let bonus = { growth: 1, value: 1, autoHarvest: false };
    
    // Direct automation on this plot
    plot.automation.forEach(auto => {
      const equipment = AUTOMATION_EQUIPMENT[auto.type];
      if (equipment.effect.growth) bonus.growth *= equipment.effect.growth;
      if (equipment.effect.value) bonus.value *= equipment.effect.value;
      if (equipment.effect.autoHarvest) bonus.autoHarvest = true;
    });
    
    // Check for nearby automation (sprinklers)
    const gridSize = Math.sqrt(plots.length);
    const row = Math.floor(plotIndex / gridSize);
    const col = plotIndex % gridSize;
    
    for (let i = 0; i < plots.length; i++) {
      const otherRow = Math.floor(i / gridSize);
      const otherCol = i % gridSize;
      const distance = Math.abs(row - otherRow) + Math.abs(col - otherCol);
      
      plots[i].automation.forEach(auto => {
        const equipment = AUTOMATION_EQUIPMENT[auto.type];
        if (equipment.range >= distance && equipment.effect.growth) {
          bonus.growth *= equipment.effect.growth;
        }
      });
    }
    // Robotics research reduces automation energy and improves logic (placeholder growth edge)
    if (completedResearch.includes('robotics')) {
      bonus.growth *= 1.03;
    }
    return bonus;
  };

  // Auto-harvest crops when ready
  const processAutoHarvest = () => {
    plots.forEach((plot, i) => {
      if (plot.status === "ready") {
        const automationBonus = getAutomationBonus(i);
        if (automationBonus.autoHarvest) {
          harvest(i);
        }
      }
    });
  };

  // Speed control functions
  const togglePause = () => {
    setGamePaused(prev => !prev);
  };

  const changeSpeed = (newSpeed) => {
    setGameSpeed(newSpeed);
  };

  // Update market prices periodically
  useEffect(() => {
    generateMarketPrices();
    const interval = setInterval(generateMarketPrices, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [selectedTown, currentSeason]);

  // Process completed items and automation
  useEffect(() => {
    completeProcessing();
    completeResearch();
    processAutoHarvest();
    // Spoilage tick every in-game hour
    if (currentTime - lastSpoilage >= 3600) {
      const hasSiloExpansion = buildings.some(b => b.type === 'siloExpansion');
      const decayRate = hasSiloExpansion ? 0.7 : 1.0; // 30% reduction
      setInventory(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) {
            const decay = Math.floor(next[k] * 0.02 * decayRate); // 2% per hour baseline
            next[k] = Math.max(0, next[k] - decay);
          }
        });
        return next;
      });
      setLastSpoilage(currentTime);
    }
  }, [currentTime]);

  // Grid expansion functions
  const expandGrid = (newSize) => {
    const expansionCosts = {
      4: 1000,
      5: 2500,
      6: 5000,
      7: 10000,
      8: 20000
    };
    
    const cost = expansionCosts[newSize];
    if (!cost) {
      addNotification("Invalid grid size!", "error");
        return;
      }
    
    if (level < newSize) {
      addNotification(`Need level ${newSize} to expand to ${newSize}x${newSize}!`, "error");
        return;
      }

    if (coins < cost) {
      addNotification(`Need ${cost} coins to expand!`, "error");
      return;
    }
    
    setCoins(prev => prev - cost);
    setMaxGridSize(newSize);
    setUnlockedGridSizes(prev => [...prev, newSize]);
    setSize(newSize);
    setPlots(makeGrid(newSize));
    
    addNotification(`🎉 Farm expanded to ${newSize}x${newSize}!`, "success");
  };

  const canExpandTo = (newSize) => {
    const expansionCosts = {
      4: 1000,
      5: 2500,
      6: 5000,
      7: 10000,
      8: 20000
    };
    
    return level >= newSize && 
           coins >= expansionCosts[newSize] && 
           !unlockedGridSizes.includes(newSize) &&
           newSize <= 8;
  };

  // Save game function
  const saveGame = () => {
    try {
      const saveData = {
        // Multiplayer data
        isMultiplayer,
        currentPlayerId,
        players,
        sessionId,
        sessionName,
        sharedResources,
        visitingFarm,
        farmVisits,
        plotOwnership,
        actionHistory,
        // Advanced economy data
        futuresContracts,
        internationalMarkets,
        economicEvents,
        marketSpeculation,
        portfolio,
        // Farm customization data
        farmDecorations,
        farmTheme,
        unlockedThemes,
        unlockedDecorations,
        // Town development data
        townLevel,
        townReputation,
        townBuildings,
        townEvents,
        townServices,
        // Social features data
        competitions,
        leaderboards,
        gifts,
        neighbors,
        socialEvents,
        playerStats,
        // Deep farming mechanics data
        irrigationSystem,
        geneticsLab,
        greenhouseClimate,
        plotConditions,
        // Advanced automation data
        farmAI,
        autoScheduler,
        smartOptimization,
        // Seasonal events data
        seasonalEvents,
        holidayEvents,
        specialCrops,
        eventProgress,
        seasonalShop,
        // Mini-games data
        miniGames,
        // Global Marketplace data
        globalMarket,
        // Weather Disasters data
        weatherDisasters,
        // Education System data
        educationSystem,
        // Sustainability System data
        sustainabilitySystem,
        // Advanced Research data
        advancedResearch,
        // Animal Husbandry data
        animalHusbandry,
        // Basic data
        name,
        coins,
        score,
        size,
        plots,
        inventory,
        selectedSeed,
        level,
        experience,
        totalHarvests,
        // Festival data
        activeFestival,
        festivalStartTime,
        festivalEndTime,
        festivalScore,
        festivalTrophies,
        limitedTimeSeeds,
        // Genetics data
        geneticLab,
        cropGeneBank,
        activeBreedingProjects,
        discoveredHybrids,
        geneticTraits,
        // Soil data
        availableSoils,
        soilInventory,
        // Companion data
        companionBonuses,
        companionKnowledge,
        // Weather/Season data
        currentWeather,
        weatherChangeTime,
        currentSeason,
        seasonStartTime,
        weatherHistory,
        // Achievement data
        unlockedAchievements,
        harvestedCropTypes: Array.from(harvestedCropTypes),
        totalEarned,
        // Buildings & Livestock
        buildings,
        livestock,
        animalFeed,
        animalProducts,
        // Pest & Disease
        pestOutbreaks,
        treatmentInventory,
        // Grid expansion
        maxGridSize,
        unlockedGridSizes
      };
      
      localStorage.setItem("farmgame_save", JSON.stringify(saveData));
      addNotification("💾 Game saved!", "success");
    } catch (error) {
      console.error("Failed to save game:", error);
      addNotification("Failed to save game!", "error");
    }
  };

  // Multiplayer helper functions
  const createSession = () => {
    const newSessionId = "session_" + Date.now();
    setSessionId(newSessionId);
    setIsMultiplayer(true);
    addNotification("🎮 Multiplayer session created! Share the session ID with friends.", "success");
  };

  const joinSession = (sessionIdToJoin) => {
    setSessionId(sessionIdToJoin);
    setIsMultiplayer(true);
    addNotification("🎮 Joined multiplayer session!", "success");
  };

  const leaveSession = () => {
    setSessionId(null);
    setIsMultiplayer(false);
    setPlayers([{ id: "player1", name: "Farmer", color: "#3B82F6", isHost: true, online: true }]);
    addNotification("🎮 Left multiplayer session.", "info");
  };

  const addPlayer = (playerName) => {
    const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4"];
    const playerId = "player" + (players.length + 1);
    const newPlayer = {
      id: playerId,
      name: playerName,
      color: colors[players.length % colors.length],
      isHost: false,
      online: true
    };
    setPlayers(prev => [...prev, newPlayer]);
    addNotification(`👤 ${playerName} joined the session!`, "success");
  };

  const visitFarm = (playerId) => {
    setVisitingFarm(playerId);
    addNotification(`🏠 Visiting ${players.find(p => p.id === playerId)?.name}'s farm!`, "info");
  };

  const returnHome = () => {
    setVisitingFarm(null);
    addNotification("🏠 Welcome back to your farm!", "info");
  };

  // Track collaborative actions
  const trackAction = (action, plotIndex = null) => {
    if (!isMultiplayer) return;

    const actionEntry = {
      playerId: currentPlayerId,
      action,
      plotIndex,
      timestamp: Date.now()
    };

    setActionHistory(prev => [...prev.slice(-49), actionEntry]); // Keep last 50 actions
  };

  // Advanced economy helper functions

  const buyFuturesContract = (crop, type, amount, strikePrice) => {
    const contract = {
      id: Date.now(),
      crop,
      type,
      amount,
      strikePrice,
      purchasePrice: strikePrice,
      expiration: Date.now() + 3600000, // 1 hour
      status: "active"
    };

    setFuturesContracts(prev => [...prev, contract]);
    setPortfolio(prev => ({ ...prev, cash: prev.cash - (strikePrice * amount) }));
    addNotification(`Futures contract purchased for ${crop}!`, "success");
  };

  const settleFuturesContract = (contractId) => {
    const contract = futuresContracts.find(c => c.id === contractId);
    if (!contract || contract.status !== "active") return;

    const currentPrice = internationalMarkets.international.prices[contract.crop] || 0;
    const profit = contract.type === "buy"
      ? (currentPrice - contract.strikePrice) * contract.amount
      : (contract.strikePrice - currentPrice) * contract.amount;

    setPortfolio(prev => ({ ...prev, cash: prev.cash + profit }));
    setFuturesContracts(prev => prev.map(c =>
      c.id === contractId ? { ...c, status: "settled", profit } : c
    ));

    const message = profit > 0 ? `Profit: +${profit}💰` : `Loss: ${profit}💰`;
    addNotification(`Futures contract settled! ${message}`, profit > 0 ? "success" : "error");
  };

  const triggerEconomicEvent = () => {
    const event = ECONOMIC_EVENTS[Math.floor(Math.random() * ECONOMIC_EVENTS.length)];
    setEconomicEvents(prev => [...prev, {
      ...event,
      startTime: Date.now(),
      endTime: Date.now() + (event.duration * 1000)
    }]);
    addNotification(`Economic Event: ${event.name} - ${event.description}`, "info");
  };

  // Farm customization helper functions
  const unlockTheme = (themeId) => {
    if (!unlockedThemes.includes(themeId) && level >= FARM_THEMES[themeId].unlockedLevel) {
      setUnlockedThemes(prev => [...prev, themeId]);
      addNotification(`🎨 Unlocked ${FARM_THEMES[themeId].name} theme!`, "success");
    }
  };

  const unlockDecoration = (decorationId) => {
    if (!unlockedDecorations.includes(decorationId) && level >= DECORATION_ITEMS[decorationId].unlockedLevel) {
      setUnlockedDecorations(prev => [...prev, decorationId]);
      addNotification(`🛍️ Unlocked ${DECORATION_ITEMS[decorationId].name}!`, "success");
    }
  };

  const buyDecoration = (decorationId) => {
    const item = DECORATION_ITEMS[decorationId];
    if (coins >= item.cost) {
      setCoins(prev => prev - item.cost);
      setFarmDecorations(prev => [...prev, {
        id: Date.now(),
        type: decorationId,
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      }]);
      addNotification(`🛍️ Bought ${item.name}!`, "success");
    } else {
      addNotification("Not enough coins!", "error");
    }
  };

  const placeDecoration = (decorationId, x, y) => {
    if (selectedDecoration) {
      setFarmDecorations(prev => prev.map(dec =>
        dec.id === selectedDecoration.id
          ? { ...dec, x, y }
          : dec
      ));
      setSelectedDecoration(null);
      addNotification("🎯 Decoration placed!", "success");
    }
  };

  const removeDecoration = (decorationId) => {
    setFarmDecorations(prev => prev.filter(dec => dec.id !== decorationId));
    addNotification("🗑️ Decoration removed!", "info");
  };

  const applyTheme = (themeId) => {
    if (unlockedThemes.includes(themeId)) {
      setFarmTheme(themeId);
      addNotification(`🎨 Applied ${FARM_THEMES[themeId].name} theme!`, "success");
    } else {
      addNotification("Theme not unlocked yet!", "error");
    }
  };

  // Town development helper functions
  const buildTownBuilding = (buildingId) => {
    const building = TOWN_BUILDINGS[buildingId];
    if (coins >= building.cost && townReputation >= (building.reputationRequired || 0)) {
      setCoins(prev => prev - building.cost);
      setTownBuildings(prev => [...prev, buildingId]);
      setTownReputation(prev => prev + (building.reputationGain || 10));
      addNotification(`🏗️ Built ${building.name}!`, "success");
    } else {
      addNotification("Not enough coins or reputation!", "error");
    }
  };

  const unlockTownService = (serviceId) => {
    const service = TOWN_SERVICES[serviceId];
    if (coins >= service.cost && !townServices[serviceId]) {
      setCoins(prev => prev - service.cost);
      setTownServices(prev => ({ ...prev, [serviceId]: true }));
      setTownReputation(prev => prev + service.reputationGain);
      addNotification(`🏛️ Unlocked ${service.name}!`, "success");
    } else {
      addNotification("Not enough coins or already unlocked!", "error");
    }
  };

  const hostTownEvent = (eventId) => {
    if (!townServices.festival_grounds) {
      addNotification("Festival Grounds required to host events!", "error");
      return;
    }

    const event = TOWN_EVENTS.find(e => e.id === eventId);
    if (event && !townEvents.some(e => e.id === eventId && Date.now() < e.endTime)) {
      const townEvent = {
        ...event,
        startTime: Date.now(),
        endTime: Date.now() + (event.duration * 1000)
      };
      setTownEvents(prev => [...prev, townEvent]);
      addNotification(`🎉 Hosting ${event.name}!`, "success");

      // Apply immediate effects
      if (event.effects.coins) {
        setCoins(prev => prev + event.effects.coins);
      }
      if (event.effects.reputation) {
        setTownReputation(prev => prev + event.effects.reputation);
      }
    } else {
      addNotification("Event already active!", "error");
    }
  };

  const getTownLevel = () => {
    if (townReputation >= 500) return 5;
    if (townReputation >= 300) return 4;
    if (townReputation >= 150) return 3;
    if (townReputation >= 50) return 2;
    return 1;
  };

  // Social features helper functions
  const startCompetition = (competitionId) => {
    const competition = COMPETITION_TYPES[competitionId];
    const newCompetition = {
      id: Date.now(),
      type: competitionId,
      name: competition.name,
      startTime: Date.now(),
      endTime: Date.now() + (competition.duration * 1000),
      participants: [currentPlayerId],
      scores: { [currentPlayerId]: 0 },
      reward: competition.reward,
      status: "active"
    };
    setCompetitions(prev => [...prev, newCompetition]);
    addNotification(`🏁 Started ${competition.name}!`, "success");
  };

  const joinCompetition = (competitionId) => {
    setCompetitions(prev => prev.map(comp =>
      comp.id === competitionId && !comp.participants.includes(currentPlayerId)
        ? {
            ...comp,
            participants: [...comp.participants, currentPlayerId],
            scores: { ...comp.scores, [currentPlayerId]: 0 }
          }
        : comp
    ));
    addNotification("🎯 Joined competition!", "success");
  };

  const updateCompetitionScore = (competitionId, score) => {
    setCompetitions(prev => prev.map(comp =>
      comp.id === competitionId
        ? { ...comp, scores: { ...comp.scores, [currentPlayerId]: score } }
        : comp
    ));
  };

  const endCompetition = (competitionId) => {
    const competition = competitions.find(c => c.id === competitionId);
    if (!competition) return;

    const winner = Object.entries(competition.scores).reduce((a, b) => a[1] > b[1] ? a : b);
    const isWinner = winner[0] === currentPlayerId;

    if (isWinner) {
      setCoins(prev => prev + competition.reward.coins);
      setTownReputation(prev => prev + competition.reward.reputation);
      setPlayerStats(prev => ({ ...prev, competitionsWon: prev.competitionsWon + 1 }));
      addNotification(`🏆 You won ${competition.name}! +${competition.reward.coins}💰 +${competition.reward.reputation} Rep`, "success");
    } else {
      addNotification(`🏁 ${competition.name} ended. Winner: ${winner[0]}`, "info");
    }

    setCompetitions(prev => prev.map(comp =>
      comp.id === competitionId ? { ...comp, status: "ended", winner: winner[0] } : comp
    ));
  };

  const sendGift = (recipientId, giftType) => {
    const gift = GIFT_TYPES[giftType];
    if (coins >= gift.cost) {
      setCoins(prev => prev - gift.cost);
      setGifts(prev => [...prev, {
        id: Date.now(),
        from: currentPlayerId,
        to: recipientId,
        type: giftType,
        sentAt: Date.now(),
        claimed: false
      }]);
      addNotification(`🎁 Sent ${gift.name} to ${recipientId}!`, "success");
    } else {
      addNotification("Not enough coins!", "error");
    }
  };

  const claimGift = (giftId) => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift || gift.claimed) return;

    // Apply gift effects
    if (gift.type === "seeds") {
      const crops = Object.keys(DEFAULT_RULES.seeds);
      const randomCrop = crops[Math.floor(Math.random() * crops.length)];
      setInventory(prev => ({ ...prev, [randomCrop]: (prev[randomCrop] || 0) + 3 }));
      addNotification(`🌱 Received 3 ${randomCrop} seeds!`, "success");
    } else if (gift.type === "decoration") {
      const decorations = Object.keys(DECORATION_ITEMS);
      const randomDecoration = decorations[Math.floor(Math.random() * decorations.length)];
      setFarmDecorations(prev => [...prev, {
        id: Date.now(),
        type: randomDecoration,
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      }]);
      addNotification(`🎁 Received ${DECORATION_ITEMS[randomDecoration].name}!`, "success");
    }

    setGifts(prev => prev.map(g =>
      g.id === giftId ? { ...g, claimed: true, claimedAt: Date.now() } : g
    ));
  };

  const addNeighbor = (neighborId) => {
    if (!neighbors.includes(neighborId) && neighborId !== currentPlayerId) {
      setNeighbors(prev => [...prev, neighborId]);
      addNotification(`👥 Added ${neighborId} as a neighbor!`, "success");
    }
  };

  const hostSocialEvent = (eventId) => {
    const event = SOCIAL_EVENTS.find(e => e.id === eventId);
    if (event) {
      const socialEvent = {
        id: Date.now(),
        type: eventId,
        name: event.name,
        startTime: Date.now(),
        endTime: Date.now() + (event.duration * 1000),
        host: currentPlayerId,
        attendees: [currentPlayerId],
        effects: event.effects
      };
      setSocialEvents(prev => [...prev, socialEvent]);
      addNotification(`🎉 Hosting ${event.name}!`, "success");

      // Apply immediate effects
      if (event.effects.reputation) {
        setTownReputation(prev => prev + event.effects.reputation);
      }
      if (event.effects.coins) {
        setCoins(prev => prev + event.effects.coins);
      }
    }
  };

  const joinSocialEvent = (eventId) => {
    setSocialEvents(prev => prev.map(event =>
      event.id === eventId && !event.attendees.includes(currentPlayerId)
        ? { ...event, attendees: [...event.attendees, currentPlayerId] }
        : event
    ));
    addNotification("🎪 Joined social event!", "success");
  };

  const updateLeaderboard = (category, playerId, score) => {
    setLeaderboards(prev => ({
      ...prev,
      [category]: [...prev[category].filter(p => p.id !== playerId), { id: playerId, score }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Keep top 10
    }));
  };

  // Deep farming mechanics helper functions
  const upgradeIrrigation = (upgradeId) => {
    const upgrade = IRRIGATION_UPGRADES[upgradeId];
    if (coins >= upgrade.cost) {
      setCoins(prev => prev - upgrade.cost);
      setIrrigationSystem(prev => ({
        ...prev,
        enabled: true,
        efficiency: upgrade.waterEfficiency,
        waterLevel: 100
      }));
      addNotification(`💧 Upgraded to ${upgrade.name}!`, "success");
    } else {
      addNotification("Not enough coins!", "error");
    }
  };



  const startGeneticsProject = (projectId) => {
    const project = GENETICS_PROJECTS[projectId];
    if (geneticsLab.researchPoints >= project.cost && geneticsLab.level >= 1) {
      setGeneticsLab(prev => ({
        ...prev,
        researchPoints: prev.researchPoints - project.cost,
        activeProjects: [...prev.activeProjects, {
          id: projectId,
          startTime: Date.now(),
          endTime: Date.now() + (project.duration * 1000),
          trait: project.trait
        }]
      }));
      addNotification(`🧬 Started ${project.name} research!`, "success");
    } else {
      addNotification("Not enough research points or genetics lab level!", "error");
    }
  };

  const completeGeneticsProject = (projectId) => {
    const project = geneticsLab.activeProjects.find(p => p.id === projectId);
    if (!project) return;

    const trait = CROP_GENETIC_TRAITS[project.trait];
    setGeneticsLab(prev => ({
      ...prev,
      discoveredTraits: [...new Set([...prev.discoveredTraits, project.trait])],
      activeProjects: prev.activeProjects.filter(p => p.id !== projectId)
    }));

    addNotification(`🧬 Discovered ${trait.name} trait!`, "success");
  };

  const adjustClimate = (setting, value) => {
    if (!greenhouseClimate.climateControl) {
      addNotification("Climate control not enabled!", "error");
      return;
    }

    setGreenhouseClimate(prev => ({
      ...prev,
      [setting]: Math.max(0, Math.min(setting === 'temperature' ? 40 : setting === 'humidity' ? 100 : 2000, value))
    }));

    addNotification(`🌡️ Adjusted ${setting} to ${value}${setting === 'temperature' ? '°C' : setting === 'humidity' ? '%' : 'ppm'}`, "success");
  };

  const getClimateBonus = (plotIndex) => {
    const plot = plots[plotIndex];
    if (!plot.seed || !greenhouseClimate.climateControl) return 1;

    const optimal = CLIMATE_OPTIMALS[plot.seed];
    if (!optimal) return 1;

    const tempDiff = Math.abs(greenhouseClimate.temperature - optimal.temperature.optimal);
    const humidityDiff = Math.abs(greenhouseClimate.humidity - optimal.humidity.optimal);

    const tempBonus = Math.max(0.5, 1 - (tempDiff / 10));
    const humidityBonus = Math.max(0.5, 1 - (humidityDiff / 20));

    return (tempBonus + humidityBonus) / 2;
  };

  const getMoistureBonus = (plotIndex) => {
    const conditions = plotConditions[plotIndex];
    if (!conditions) return 1;

    const moisture = conditions.moisture || 50;
    const timeSinceWater = Date.now() - (conditions.lastWatered || 0);
    const hoursSinceWater = timeSinceWater / (1000 * 60 * 60);

    // Moisture decreases over time
    const currentMoisture = Math.max(0, moisture - (hoursSinceWater * 5));
    return Math.max(0.5, currentMoisture / 100);
  };

  // Seasonal events helper functions
  const startSeasonalFestival = (festivalId) => {
    const festival = SEASONAL_FESTIVALS[festivalId];
    if (festival.season !== currentSeason) {
      addNotification("This festival is not available in the current season!", "error");
      return;
    }

    const newFestival = {
      id: festivalId,
      name: festival.name,
      startTime: Date.now(),
      endTime: Date.now() + (festival.duration * 1000),
      bonuses: festival.bonuses,
      challenges: festival.challenges,
      rewards: festival.rewards,
      specialCrops: festival.specialCrops,
      progress: { [currentPlayerId]: { challenges: {}, score: 0 } }
    };

    setSeasonalEvents(prev => [...prev, newFestival]);
    setSpecialCrops(prev => ({
      ...prev,
      ...Object.fromEntries(festival.specialCrops.map(crop => [crop, SPECIAL_CROPS[crop]]))
    }));

    addNotification(`🎉 ${festival.name} has begun!`, "success");
  };

  const checkHolidayEvents = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    HOLIDAY_EVENTS.forEach(holiday => {
      if (holiday.date.month === currentMonth && holiday.date.day === currentDay) {
        // Check if holiday event is already active
        const isActive = holidayEvents.some(e => e.id === holiday.id && Date.now() < e.endTime);
        if (!isActive) {
          const holidayEvent = {
            ...holiday,
            startTime: Date.now(),
            endTime: Date.now() + (holiday.duration * 1000)
          };
          setHolidayEvents(prev => [...prev, holidayEvent]);
          setSpecialCrops(prev => ({
            ...prev,
            ...Object.fromEntries(holiday.specialCrops.map(crop => [crop, SPECIAL_CROPS[crop]]))
          }));

          addNotification(`🎊 ${holiday.name} has begun!`, "success");

          // Apply immediate rewards
          if (holiday.rewards.coins) {
            setCoins(prev => prev + holiday.rewards.coins);
          }
          if (holiday.rewards.reputation) {
            setTownReputation(prev => prev + holiday.rewards.reputation);
          }
        }
      }
    });
  };

  const completeFestivalChallenge = (festivalId, challengeId) => {
    setSeasonalEvents(prev => prev.map(event => {
      if (event.id === festivalId) {
        const newProgress = { ...event.progress };
        if (!newProgress[currentPlayerId]) {
          newProgress[currentPlayerId] = { challenges: {}, score: 0 };
        }
        newProgress[currentPlayerId].challenges[challengeId] = true;
        return { ...event, progress: newProgress };
      }
      return event;
    }));

    addNotification(`🏆 Challenge completed: ${challengeId}!`, "success");
  };

  const claimFestivalRewards = (festivalId) => {
    const festival = seasonalEvents.find(e => e.id === festivalId);
    if (!festival || Date.now() < festival.endTime) return;

    const playerProgress = festival.progress[currentPlayerId];
    if (!playerProgress) return;

    const completedChallenges = Object.values(playerProgress.challenges).filter(Boolean).length;
    const totalChallenges = festival.challenges.length;

    if (completedChallenges >= totalChallenges) {
      // Award full rewards
      setCoins(prev => prev + festival.rewards.coins);
      setTownReputation(prev => prev + festival.rewards.reputation);
      if (festival.rewards.decoration) {
        setFarmDecorations(prev => [...prev, {
          id: Date.now(),
          type: festival.rewards.decoration,
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        }]);
      }
      addNotification(`🎉 Festival rewards claimed! +${festival.rewards.coins}💰 +${festival.rewards.reputation} Rep`, "success");
    } else {
      // Award partial rewards
      const partialCoins = Math.floor(festival.rewards.coins * (completedChallenges / totalChallenges));
      const partialRep = Math.floor(festival.rewards.reputation * (completedChallenges / totalChallenges));
      setCoins(prev => prev + partialCoins);
      setTownReputation(prev => prev + partialRep);
      addNotification(`🎊 Partial rewards: +${partialCoins}💰 +${partialRep} Rep`, "info");
    }

    // Remove the festival
    setSeasonalEvents(prev => prev.filter(e => e.id !== festivalId));
  };

  const openSeasonalShop = (discount = 0) => {
    const seasonalItems = Object.keys(SPECIAL_CROPS).slice(0, 6).map(crop => ({
      id: crop,
      name: crop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      emoji: SPECIAL_CROPS[crop].emoji,
      price: Math.floor(SPECIAL_CROPS[crop].baseValue * (1 - discount))
    }));

    setSeasonalShop({
      available: true,
      items: seasonalItems,
      discount
    });
  };

  const buySeasonalItem = (itemId) => {
    const item = seasonalShop.items.find(i => i.id === itemId);
    if (!item) return;

    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      setInventory(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
      addNotification(`🌱 Bought ${item.name}!`, "success");
    } else {
      addNotification("Not enough coins!", "error");
    }
  };

  // Achievement expansion helper functions
  const checkAchievementProgress = (achievementId, value) => {
    const achievement = EXPANDED_ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    const currentProgress = achievementProgress[achievementId] || 0;
    const newProgress = Math.max(currentProgress, value);

    if (newProgress > currentProgress) {
      setAchievementProgress(prev => ({ ...prev, [achievementId]: newProgress }));

      // Check for tier unlocks
      achievement.tiers.forEach(tier => {
        if (newProgress >= tier.threshold && currentProgress < tier.threshold) {
          unlockAchievementTier(achievementId, tier);
        }
      });
    }
  };

  const unlockAchievementTier = (achievementId, tier) => {
    const achievement = EXPANDED_ACHIEVEMENTS[achievementId];

    // Apply rewards
    if (tier.reward.coins) setCoins(prev => prev + tier.reward.coins);
    if (tier.reward.reputation) setTownReputation(prev => prev + tier.reward.reputation);
    if (tier.reward.experience) setExperience(prev => prev + tier.reward.experience);
    if (tier.reward.researchPoints) setGeneticsLab(prev => ({ ...prev, researchPoints: prev.researchPoints + tier.reward.researchPoints }));

    // Unlock decorations
    if (tier.reward.decoration) {
      const decorationName = tier.reward.decoration;
      if (!unlockedDecorations.includes(decorationName)) {
        setUnlockedDecorations(prev => [...prev, decorationName]);
        setFarmDecorations(prev => [...prev, {
          id: Date.now(),
          type: decorationName,
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        }]);
      }
    }

    // Unlock themes
    if (tier.reward.theme) {
      const themeName = tier.reward.theme;
      if (!unlockedThemes.includes(themeName)) {
        setUnlockedThemes(prev => [...prev, themeName]);
      }
    }

    addNotification(`🏆 Achievement Unlocked: ${tier.reward.title}!`, "success");
  };

  const checkMilestone = (milestoneId) => {
    const milestone = MILESTONE_REWARDS[milestoneId];
    if (!milestone || milestoneRewards.unlocked.has(milestoneId)) return;

    // Check if milestone conditions are met
    let achieved = false;
    switch (milestoneId) {
      case "first_harvest":
        achieved = totalHarvests >= 1;
        break;
      case "tenth_harvest":
        achieved = totalHarvests >= 10;
        break;
      case "hundredth_harvest":
        achieved = totalHarvests >= 100;
        break;
      case "first_festival":
        achieved = Object.keys(eventProgress).length >= 1;
        break;
      case "first_competition_win":
        achieved = playerStats.competitionsWon >= 1;
        break;
      case "town_level_5":
        achieved = getTownLevel() >= 5;
        break;
      case "all_basic_crops":
        achieved = collections.crops.size >= 10;
        break;
      case "first_special_crop":
        achieved = collections.specialCrops.size >= 1;
        break;
      case "irrigation_master":
        achieved = irrigationSystem.enabled;
        break;
      case "genetics_pioneer":
        achieved = geneticsLab.level >= 1;
        break;
    }

    if (achieved) {
      // Apply milestone rewards
      if (milestone.reward.coins) setCoins(prev => prev + milestone.reward.coins);
      if (milestone.reward.experience) setExperience(prev => prev + milestone.reward.experience);
      if (milestone.reward.reputation) setTownReputation(prev => prev + milestone.reward.reputation);
      if (milestone.reward.researchPoints) setGeneticsLab(prev => ({ ...prev, researchPoints: prev.researchPoints + milestone.reward.researchPoints }));

      // Unlock decorations/themes
      if (milestone.reward.decoration) {
        const decorationName = milestone.reward.decoration;
        if (!unlockedDecorations.includes(decorationName)) {
          setUnlockedDecorations(prev => [...prev, decorationName]);
          setFarmDecorations(prev => [...prev, {
            id: Date.now(),
            type: decorationName,
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
          }]);
        }
      }

      if (milestone.reward.theme) {
        const themeName = milestone.reward.theme;
        if (!unlockedThemes.includes(themeName)) {
          setUnlockedThemes(prev => [...prev, themeName]);
        }
      }

      setMilestoneRewards(prev => ({
        ...prev,
        unlocked: new Set([...prev.unlocked, milestoneId])
      }));

      addNotification(`🎯 Milestone Achieved: ${milestone.name}!`, "success");
    }
  };

  const updateCollections = (collectionType, itemId) => {
    setCollections(prev => ({
      ...prev,
      [collectionType]: new Set([...prev[collectionType], itemId])
    }));
  };

  const checkPrestigeEligibility = () => {
    return level >= PRESTIGE_REQUIREMENTS.level &&
           totalHarvests >= PRESTIGE_REQUIREMENTS.totalHarvests &&
           coins >= PRESTIGE_REQUIREMENTS.coins &&
           townReputation >= PRESTIGE_REQUIREMENTS.reputation;
  };

  const prestigeReset = () => {
    if (!checkPrestigeEligibility()) {
      addNotification("Not eligible for prestige yet!", "error");
      return;
    }

    // Calculate prestige bonuses
    const newPrestigeLevel = prestigeLevel + 1;
    const bonusMultiplier = 1 + (newPrestigeLevel * 0.1); // 10% bonus per prestige level

    setPrestigeBonuses({
      coinMultiplier: bonusMultiplier,
      expMultiplier: bonusMultiplier,
      growthSpeed: 1 + (newPrestigeLevel * 0.05) // 5% faster growth per level
    });

    // Reset progress but keep some benefits
    setCoins(100 + (newPrestigeLevel * 25)); // Bonus starting coins
    setLevel(1);
    setExperience(0);
    setTotalHarvests(0);
    setScore(0);
    setPlots(makeGrid(MIN_SIZE));
    setSize(MIN_SIZE);
    setInventory({
      carrot: 10 + (newPrestigeLevel * 2),
      lettuce: 8 + (newPrestigeLevel * 2)
    });

    // Keep some progress
    setTownReputation(Math.floor(townReputation * 0.5)); // Keep half reputation
    setPlayerStats({
      totalHarvests: 0,
      totalEarned: 0,
      bestHarvest: 0,
      competitionsWon: 0,
      friendsHelped: playerStats.friendsHelped // Keep social stats
    });

    setPrestigeLevel(newPrestigeLevel);
    addNotification(`✨ Prestige Level ${newPrestigeLevel} Achieved! All stats increased by ${Math.round((bonusMultiplier - 1) * 100)}%`, "success");
  };

  // Advanced automation helper functions
  const generateAIPredictions = () => {
    if (!farmAI.enabled) return;

    const predictions = {};
    const recommendations = [];

    // Predict crop yields based on weather and conditions
    Object.keys(DEFAULT_RULES.seeds).forEach(crop => {
      const baseYield = DEFAULT_RULES.seeds[crop].baseValue;
      const weatherBonus = getWeatherBonus();
      const seasonBonus = getSeasonBonus();
      const climateBonus = greenhouseClimate.climateControl ? getClimateBonus(0) : 1; // Use first plot as reference

      const predictedYield = baseYield * weatherBonus * seasonBonus * climateBonus;
      predictions[crop] = {
        yield: Math.round(predictedYield),
        confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
        factors: { weather: weatherBonus, season: seasonBonus, climate: climateBonus }
      };
    });

    // Generate recommendations
    const profitableCrops = Object.entries(predictions)
      .sort(([,a], [,b]) => b.yield - a.yield)
      .slice(0, 3);

    recommendations.push(`🌾 Top crops this season: ${profitableCrops.map(([crop]) => crop).join(', ')}`);

    if (irrigationSystem.waterLevel < 30) {
      recommendations.push("💧 Water levels low - consider upgrading irrigation");
    }

    if (geneticsLab.researchPoints > 100) {
      recommendations.push("🧬 Research points available - consider genetic projects");
    }

    setFarmAI(prev => ({ ...prev, predictions, recommendations }));
  };

  const createSmartSchedule = () => {
    if (!autoScheduler.enabled) return;

    const schedule = {};
    const currentSeason = getCurrentSeason();

    // Schedule planting based on optimal conditions
    plots.forEach((plot, index) => {
      if (plot.status === "empty") {
        // Find best crop for this season and conditions
        let bestCrop = null;
        let bestScore = 0;

        Object.entries(DEFAULT_RULES.seeds).forEach(([crop, data]) => {
          if (data.season === currentSeason) {
            let score = data.baseValue;
            if (irrigationSystem.enabled) score *= irrigationSystem.efficiency;
            if (greenhouseClimate.climateControl) score *= getClimateBonus(index);
            if (farmAI.predictions[crop]) score *= farmAI.predictions[crop].yield / data.baseValue;

            if (score > bestScore) {
              bestCrop = crop;
              bestScore = score;
            }
          }
        });

        if (bestCrop) {
          schedule[index] = {
            action: "plant",
            crop: bestCrop,
            priority: Math.round(bestScore),
            reason: "Optimal for current conditions"
          };
        }
      } else if (plot.status === "ready") {
        schedule[index] = {
          action: "harvest",
          priority: 10,
          reason: "Crop ready for harvest"
        };
      }
    });

    setAutoScheduler(prev => ({ ...prev, schedule }));
  };

  const optimizeResourceAllocation = () => {
    if (!smartOptimization) return;

    const allocation = {};
    const totalPlots = plots.length;
    const availableWater = irrigationSystem.enabled ? irrigationSystem.waterLevel : 100;

    // Allocate water based on crop needs and profitability
    plots.forEach((plot, index) => {
      if (plot.seed && plot.status === "growing") {
        const cropData = DEFAULT_RULES.seeds[plot.seed];
        const profitability = cropData.baseValue;
        const waterNeed = plot.health < 80 ? 2 : 1; // More water for unhealthy crops

        allocation[index] = {
          water: Math.min(waterNeed, availableWater / totalPlots),
          priority: profitability,
          efficiency: irrigationSystem.efficiency || 1
        };
      }
    });

    setSmartOptimization(prev => ({ ...prev, resourceAllocation: allocation }));
  };

  const executeAutomation = () => {
    if (!farmAI.enabled && !autoScheduler.enabled) return;

    // Auto-water if enabled and needed
    if (irrigationSystem.enabled && irrigationSystem.autoWater) {
      plots.forEach((plot, index) => {
        if (plot.status === "growing" && plot.health < 70) {
          waterPlot(index);
        }
      });
    }

    // Execute scheduled actions
    if (autoScheduler.enabled && Object.keys(autoScheduler.schedule).length > 0) {
      Object.entries(autoScheduler.schedule).forEach(([plotIndex, action]) => {
        if (action.priority > 7) { // High priority actions
          const index = parseInt(plotIndex);
          if (action.action === "plant" && plots[index].status === "empty") {
            // Auto-plant logic would go here
            // For now, just recommend planting
          } else if (action.action === "harvest" && plots[index].status === "ready") {
            harvest(index);
          }
        }
      });
    }

    // Update AI predictions periodically
    if (farmAI.enabled && Math.random() < 0.1) { // 10% chance each tick
      generateAIPredictions();
    }
  };

  // Mini-games helper functions
  const startMiniGame = (gameType) => {
    if (!miniGames[gameType].unlocked) {
      addNotification("Game not unlocked yet!", "error");
      return;
    }

    let gameState = {};
    switch (gameType) {
      case "harvestRush":
        gameState = {
          timeLeft: HARVEST_RUSH_CONFIG.timeLimit,
          score: 0,
          combo: 0,
          lastHarvestTime: 0,
          harvested: new Set()
        };
        break;
      case "marketTrader":
        gameState = {
          timeLeft: MARKET_TRADER_CONFIG.timeLimit,
          cash: MARKET_TRADER_CONFIG.startingCash,
          portfolio: {},
          prices: {},
          history: []
        };
        // Initialize prices
        MARKET_TRADER_CONFIG.commodities.forEach(crop => {
          gameState.prices[crop] = DEFAULT_RULES.seeds[crop].baseValue;
        });
        break;
      case "puzzleFarming":
        gameState = {
          timeLeft: PUZZLE_FARMING_CONFIG.timeLimit,
          score: 0,
          grid: generatePuzzleGrid(),
          selected: null,
          moves: 0
        };
        break;
    }

    setMiniGames(prev => ({
      ...prev,
      currentGame: gameType,
      gameState
    }));

    addNotification(`🎮 Starting ${gameType} mini-game!`, "success");
  };

  const generatePuzzleGrid = () => {
    const grid = [];
    for (let i = 0; i < PUZZLE_FARMING_CONFIG.gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < PUZZLE_FARMING_CONFIG.gridSize; j++) {
        grid[i][j] = PUZZLE_FARMING_CONFIG.crops[Math.floor(Math.random() * PUZZLE_FARMING_CONFIG.crops.length)];
      }
    }
    return grid;
  };

  const updateMiniGame = (gameType, action, data = {}) => {
    if (miniGames.currentGame !== gameType) return;

    setMiniGames(prev => {
      const newState = { ...prev };
      const gameState = { ...newState.gameState };

      switch (gameType) {
        case "harvestRush":
          if (action === "harvest" && !gameState.harvested.has(data.plotIndex)) {
            const now = Date.now();
            const timeDiff = (now - gameState.lastHarvestTime) / 1000;
            const comboBonus = timeDiff <= HARVEST_RUSH_CONFIG.comboTimeWindow ? HARVEST_RUSH_CONFIG.comboMultiplier : 1;
            const newCombo = comboBonus > 1 ? gameState.combo + 1 : 0;

            gameState.score += Math.floor(HARVEST_RUSH_CONFIG.pointsPerHarvest * comboBonus);
            gameState.combo = newCombo;
            gameState.lastHarvestTime = now;
            gameState.harvested.add(data.plotIndex);

            // Check for high score
            if (gameState.score > newState.harvestRush.highScore) {
              newState.harvestRush.highScore = gameState.score;
            }
            if (newCombo > newState.harvestRush.bestCombo) {
              newState.harvestRush.bestCombo = newCombo;
            }
          }
          gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
          break;

        case "marketTrader":
          if (action === "buy") {
            const cost = gameState.prices[data.crop] * data.amount * (1 + MARKET_TRADER_CONFIG.transactionFee);
            if (gameState.cash >= cost) {
              gameState.cash -= cost;
              gameState.portfolio[data.crop] = (gameState.portfolio[data.crop] || 0) + data.amount;
            }
          } else if (action === "sell") {
            const revenue = gameState.prices[data.crop] * data.amount * (1 - MARKET_TRADER_CONFIG.transactionFee);
            if (gameState.portfolio[data.crop] >= data.amount) {
              gameState.cash += revenue;
              gameState.portfolio[data.crop] -= data.amount;
              newState.marketTrader.trades++;
            }
          }

          // Update prices with volatility
          MARKET_TRADER_CONFIG.commodities.forEach(crop => {
            const change = (Math.random() - 0.5) * MARKET_TRADER_CONFIG.priceVolatility;
            gameState.prices[crop] = Math.max(1, gameState.prices[crop] * (1 + change));
          });

          gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
          gameState.history.push({ ...gameState.prices });
          break;

        case "puzzleFarming":
          if (action === "swap" && data.from && data.to) {
            const { from, to } = data;
            const temp = gameState.grid[from.row][from.col];
            gameState.grid[from.row][from.col] = gameState.grid[to.row][to.col];
            gameState.grid[to.row][to.col] = temp;
            gameState.moves++;

            // Check for matches
            const matches = findMatches(gameState.grid);
            if (matches.length > 0) {
              let matchScore = 0;
              matches.forEach(match => {
                matchScore += PUZZLE_FARMING_CONFIG.scoring[`match${match.length}`] || 100;
              });
              gameState.score += matchScore;

              // Remove matched pieces
              matches.forEach(match => {
                match.forEach(pos => {
                  gameState.grid[pos.row][pos.col] = null;
                });
              });

              // Drop pieces down
              for (let col = 0; col < PUZZLE_FARMING_CONFIG.gridSize; col++) {
                const column = [];
                for (let row = PUZZLE_FARMING_CONFIG.gridSize - 1; row >= 0; row--) {
                  if (gameState.grid[row][col]) {
                    column.push(gameState.grid[row][col]);
                  }
                }
                while (column.length < PUZZLE_FARMING_CONFIG.gridSize) {
                  column.push(PUZZLE_FARMING_CONFIG.crops[Math.floor(Math.random() * PUZZLE_FARMING_CONFIG.crops.length)]);
                }
                for (let row = 0; row < PUZZLE_FARMING_CONFIG.gridSize; row++) {
                  gameState.grid[row][col] = column[PUZZLE_FARMING_CONFIG.gridSize - 1 - row];
                }
              }
            }
          }
          gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
          break;
      }

      // Check for game end
      if (gameState.timeLeft <= 0) {
        endMiniGame(gameType, gameState);
        newState.currentGame = null;
        newState.gameState = {};
      } else {
        newState.gameState = gameState;
      }

      return newState;
    });
  };

  const findMatches = (grid) => {
    const matches = [];

    // Check horizontal matches
    for (let row = 0; row < PUZZLE_FARMING_CONFIG.gridSize; row++) {
      let count = 1;
      let startCol = 0;
      for (let col = 1; col < PUZZLE_FARMING_CONFIG.gridSize; col++) {
        if (grid[row][col] === grid[row][col - 1]) {
          count++;
        } else {
          if (count >= PUZZLE_FARMING_CONFIG.matchLength) {
            matches.push(Array.from({ length: count }, (_, i) => ({ row, col: startCol + i })));
          }
          count = 1;
          startCol = col;
        }
      }
      if (count >= PUZZLE_FARMING_CONFIG.matchLength) {
        matches.push(Array.from({ length: count }, (_, i) => ({ row, col: startCol + i })));
      }
    }

    // Check vertical matches (similar logic)
    for (let col = 0; col < PUZZLE_FARMING_CONFIG.gridSize; col++) {
      let count = 1;
      let startRow = 0;
      for (let row = 1; row < PUZZLE_FARMING_CONFIG.gridSize; row++) {
        if (grid[row][col] === grid[row - 1][col]) {
          count++;
        } else {
          if (count >= PUZZLE_FARMING_CONFIG.matchLength) {
            matches.push(Array.from({ length: count }, (_, i) => ({ row: startRow + i, col })));
          }
          count = 1;
          startRow = row;
        }
      }
      if (count >= PUZZLE_FARMING_CONFIG.matchLength) {
        matches.push(Array.from({ length: count }, (_, i) => ({ row: startRow + i, col })));
      }
    }

    return matches;
  };

  const endMiniGame = (gameType, finalState) => {
    let reward = 0;
    let message = "";

    switch (gameType) {
      case "harvestRush":
        reward = Math.floor(finalState.score / 10);
        message = `Harvest Rush ended! Score: ${finalState.score}, Best Combo: ${miniGames.harvestRush.bestCombo}`;
        setMiniGames(prev => ({
          ...prev,
          harvestRush: { ...prev.harvestRush, gamesPlayed: prev.harvestRush.gamesPlayed + 1 }
        }));
        break;

      case "marketTrader":
        const profit = finalState.cash - MARKET_TRADER_CONFIG.startingCash;
        const winRate = profit > 0 ? 1 : 0;
        reward = Math.max(0, profit);
        message = `Market Trader ended! Profit: ${profit > 0 ? '+' : ''}${profit}💰`;
        setMiniGames(prev => ({
          ...prev,
          marketTrader: {
            ...prev.marketTrader,
            profit: prev.marketTrader.profit + profit,
            winRate: ((prev.marketTrader.winRate * prev.marketTrader.trades) + winRate) / (prev.marketTrader.trades + 1)
          }
        }));
        break;

      case "puzzleFarming":
        reward = Math.floor(finalState.score / 100);
        message = `Puzzle Farming ended! Score: ${finalState.score}, Puzzles Solved: ${miniGames.puzzleFarming.puzzlesSolved}`;
        setMiniGames(prev => ({
          ...prev,
          puzzleFarming: { ...prev.puzzleFarming, puzzlesSolved: prev.puzzleFarming.puzzlesSolved + 1 }
        }));
        break;
    }

    if (reward > 0) {
      setCoins(prev => prev + reward);
      addNotification(`${message} +${reward}💰`, "success");
    } else {
      addNotification(message, "info");
    }
  };

  const unlockMiniGame = (gameType) => {
    if (gameType === "marketTrader" && level >= 5) {
      setMiniGames(prev => ({ ...prev, marketTrader: { ...prev.marketTrader, unlocked: true } }));
      addNotification("🤑 Market Trader game unlocked!", "success");
    } else if (gameType === "puzzleFarming" && level >= 10) {
      setMiniGames(prev => ({ ...prev, puzzleFarming: { ...prev.puzzleFarming, unlocked: true } }));
      addNotification("🧩 Puzzle Farming game unlocked!", "success");
    }
  };

  // Global Marketplace helper functions
  const initializeMarketplace = () => {
    if (!globalMarket.playerId) {
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setGlobalMarket(prev => ({ ...prev, playerId, marketEnabled: true }));

      // Initialize commodity prices
      const initialPrices = {};
      Object.keys(DEFAULT_RULES.seeds).forEach(crop => {
        initialPrices[crop] = DEFAULT_RULES.seeds[crop].baseValue;
      });

      setGlobalMarket(prev => ({
        ...prev,
        commodityExchange: {
          ...prev.commodityExchange,
          prices: initialPrices
        }
      }));

      addNotification("🌍 Global Marketplace initialized!", "success");
    }
  };

  const createTradeListing = (itemType, itemName, quantity, price, tradeType = "direct") => {
    if (globalMarket.playerListings.length >= MARKETPLACE_CONFIG.maxListings) {
      addNotification("Maximum listings reached!", "error");
      return;
    }

    const listing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: globalMarket.playerId,
      itemType,
      itemName,
      quantity,
      price,
      tradeType,
      createdAt: Date.now(),
      expiresAt: Date.now() + MARKETPLACE_CONFIG.listingDuration,
      status: "active"
    };

    setGlobalMarket(prev => ({
      ...prev,
      playerListings: [...prev.playerListings, listing]
    }));

    addNotification(`📦 Listing created: ${quantity}x ${itemName}`, "success");
  };

  const createAuctionListing = (itemType, itemName, quantity, startingBid, buyoutPrice = null) => {
    const auction = {
      id: `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: globalMarket.playerId,
      itemType,
      itemName,
      quantity,
      startingBid,
      buyoutPrice,
      currentBid: startingBid,
      currentBidder: null,
      createdAt: Date.now(),
      expiresAt: Date.now() + MARKETPLACE_CONFIG.listingDuration,
      status: "active"
    };

    setGlobalMarket(prev => ({
      ...prev,
      auctionHouse: {
        ...prev.auctionHouse,
        items: [...prev.auctionHouse.items, auction]
      }
    }));

    addNotification(`🏛️ Auction created: ${itemName} starting at ${startingBid} coins`, "success");
  };

  const placeBid = (auctionId, bidAmount) => {
    setGlobalMarket(prev => {
      const updatedAuctions = prev.auctionHouse.items.map(auction => {
        if (auction.id === auctionId && bidAmount > auction.currentBid) {
          return {
            ...auction,
            currentBid: bidAmount,
            currentBidder: prev.playerId
          };
        }
        return auction;
      });

      return {
        ...prev,
        auctionHouse: {
          ...prev.auctionHouse,
          items: updatedAuctions
        }
      };
    });

    addNotification(`💰 Bid placed: ${bidAmount} coins`, "success");
  };

  const executeTrade = (listingId, buyerId = null) => {
    setGlobalMarket(prev => {
      const listing = prev.playerListings.find(l => l.id === listingId);
      if (!listing || listing.status !== "active") {
        addNotification("Listing not available!", "error");
        return prev;
      }

      const fee = listing.price * TRADE_TYPES[listing.tradeType].fee;
      const netPrice = listing.price - fee;

      // Update market stats
      const newStats = {
        totalTrades: prev.marketStats.totalTrades + 1,
        totalVolume: prev.marketStats.totalVolume + listing.price,
        reputation: Math.min(1000, prev.marketStats.reputation + 1)
      };

      // Remove the listing
      const updatedListings = prev.playerListings.filter(l => l.id !== listingId);

      addNotification(`✅ Trade completed! Earned ${netPrice} coins (${fee} fee)`, "success");

      return {
        ...prev,
        playerListings: updatedListings,
        marketStats: newStats
      };
    });
  };

  const updateCommodityPrices = () => {
    setGlobalMarket(prev => {
      const updatedPrices = { ...prev.commodityExchange.prices };
      const updatedHistory = { ...prev.commodityExchange.history };
      const updatedVolume = { ...prev.commodityExchange.volume };

      // Simulate market forces
      Object.keys(DEFAULT_RULES.seeds).forEach(crop => {
        const basePrice = DEFAULT_RULES.seeds[crop].baseValue;
        const volatility = MARKETPLACE_CONFIG.commodityVolatility;

        // Random walk with mean reversion
        const currentPrice = updatedPrices[crop] || basePrice;
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = Math.max(basePrice * 0.5, Math.min(basePrice * 2, currentPrice * (1 + change)));

        updatedPrices[crop] = Math.round(newPrice);
        updatedHistory[crop] = [...(updatedHistory[crop] || []), newPrice].slice(-24); // Keep last 24 hours
        updatedVolume[crop] = (updatedVolume[crop] || 0) + Math.floor(Math.random() * 100);
      });

      return {
        ...prev,
        commodityExchange: {
          prices: updatedPrices,
          history: updatedHistory,
          volume: updatedVolume
        }
      };
    });
  };

  const buyCommodity = (crop, quantity) => {
    setGlobalMarket(prev => {
      const currentPrice = prev.commodityExchange.prices[crop];
      const totalCost = currentPrice * quantity;
      const fee = totalCost * MARKETPLACE_CONFIG.tradeFee;

      if (coins < totalCost + fee) {
        addNotification("Not enough coins!", "error");
        return prev;
      }

      // Add to inventory
      setInventory(prevInv => ({
        ...prevInv,
        [crop]: (prevInv[crop] || 0) + quantity
      }));

      // Deduct coins
      setCoins(prevCoins => prevCoins - totalCost - fee);

      // Update market stats
      const newStats = {
        totalTrades: prev.marketStats.totalTrades + 1,
        totalVolume: prev.marketStats.totalVolume + totalCost,
        reputation: Math.min(1000, prev.marketStats.reputation + 0.5)
      };

      addNotification(`📈 Bought ${quantity}x ${crop} for ${totalCost + fee} coins`, "success");

      return {
        ...prev,
        marketStats: newStats
      };
    });
  };

  const sellCommodity = (crop, quantity) => {
    setInventory(prevInv => {
      if ((prevInv[crop] || 0) < quantity) {
        addNotification("Not enough crops to sell!", "error");
        return prevInv;
      }

      setGlobalMarket(prev => {
        const currentPrice = prev.commodityExchange.prices[crop];
        const totalRevenue = currentPrice * quantity;
        const fee = totalRevenue * MARKETPLACE_CONFIG.tradeFee;
        const netRevenue = totalRevenue - fee;

        // Add coins
        setCoins(prevCoins => prevCoins + netRevenue);

        // Update market stats
        const newStats = {
          totalTrades: prev.marketStats.totalTrades + 1,
          totalVolume: prev.marketStats.totalVolume + totalRevenue,
          reputation: Math.min(1000, prev.marketStats.reputation + 0.5)
        };

        addNotification(`📉 Sold ${quantity}x ${crop} for ${netRevenue} coins`, "success");

        return {
          ...prev,
          marketStats: newStats
        };
      });

      return {
        ...prevInv,
        [crop]: prevInv[crop] - quantity
      };
    });
  };

  // Weather Disaster helper functions
  const triggerDisaster = (disasterType, severity = 1) => {
    const disaster = DISASTER_TYPES[disasterType];
    if (!disaster) return;

    setWeatherDisasters(prev => ({
      ...prev,
      activeDisaster: {
        type: disasterType,
        severity,
        startTime: Date.now(),
        duration: disaster.duration * severity,
        affectedPlots: new Set()
      }
    }));

    addNotification(`🚨 ${disaster.name} Alert! ${disaster.description}`, "error");
  };

  const checkDisasterPreparation = (disasterType) => {
    const disaster = DISASTER_TYPES[disasterType];
    const preparation = weatherDisasters.disasterPreparation[disaster.preparation];
    return preparation ? preparation.effectiveness : 0;
  };

  const calculateDisasterDamage = (disasterType, plotIndex, severity = 1) => {
    const disaster = DISASTER_TYPES[disasterType];
    const baseDamage = disaster.damage * severity;
    const preparationBonus = checkDisasterPreparation(disasterType);
    const actualDamage = Math.max(0, baseDamage - preparationBonus);

    if (Math.random() < actualDamage) {
      return true; // Plot is damaged
    }
    return false; // Plot survives
  };

  const processDisasterEffects = () => {
    if (!weatherDisasters.activeDisaster) return;

    const disaster = weatherDisasters.activeDisaster;
    const disasterType = disaster.type;
    const elapsed = (Date.now() - disaster.startTime) / 1000;
    const progress = elapsed / disaster.duration;

    if (progress >= 1) {
      // Disaster is over
      endDisaster();
      return;
    }

    // Apply ongoing effects
    setPlots(prevPlots => {
      const newPlots = [...prevPlots];
      const affectedPlots = new Set(weatherDisasters.activeDisaster.affectedPlots);

      newPlots.forEach((plot, index) => {
        if (plot.status === "growing" && !affectedPlots.has(index)) {
          // Check if this plot gets damaged
          if (calculateDisasterDamage(disasterType, index, disaster.severity)) {
            affectedPlots.add(index);
            // Apply damage based on disaster type
            switch (disasterType) {
              case "tornado":
                newPlots[index] = newPlot("empty"); // Complete destruction
                break;
              case "flood":
                newPlots[index].health = Math.max(0, plot.health - 50);
                if (newPlots[index].health <= 0) {
                  newPlots[index] = newPlot("empty");
                }
                break;
              case "drought":
                newPlots[index].health = Math.max(0, plot.health - 10);
                if (newPlots[index].health <= 0) {
                  newPlots[index] = newPlot("empty");
                }
                break;
              case "storm":
              case "hail":
                newPlots[index].health = Math.max(0, plot.health - 30);
                if (newPlots[index].health <= 0) {
                  newPlots[index] = newPlot("empty");
                }
                break;
            }
          }
        }
      });

      setWeatherDisasters(prev => ({
        ...prev,
        activeDisaster: {
          ...prev.activeDisaster,
          affectedPlots
        },
        recoveryStatus: {
          ...prev.recoveryStatus,
          damagedPlots: affectedPlots
        }
      }));

      return newPlots;
    });
  };

  const endDisaster = () => {
    const disaster = weatherDisasters.activeDisaster;
    const disasterType = disaster.type;

    // Calculate total damage
    const damagedCount = disaster.affectedPlots.size;
    const totalPlots = plots.length;
    const damagePercentage = damagedCount / totalPlots;

    // Record in history
    const disasterRecord = {
      type: disasterType,
      severity: disaster.severity,
      damage: damagePercentage,
      timestamp: Date.now(),
      plotsAffected: damagedCount
    };

    setWeatherDisasters(prev => ({
      ...prev,
      activeDisaster: null,
      disasterHistory: [...prev.disasterHistory, disasterRecord]
    }));

    // Calculate insurance claim if applicable
    if (weatherDisasters.insurance.enabled && damagedCount > 0) {
      const cropValue = plots.reduce((sum, plot) => {
        if (plot.seed && disaster.affectedPlots.has(plots.indexOf(plot))) {
          return sum + DEFAULT_RULES.seeds[plot.seed].baseValue;
        }
        return sum;
      }, 0);

      const insurancePayout = Math.floor(cropValue * weatherDisasters.insurance.coverage);

      if (weatherDisasters.insurance.claimsAvailable > 0) {
        setCoins(prev => prev + insurancePayout);
        setWeatherDisasters(prev => ({
          ...prev,
          insurance: {
            ...prev.insurance,
            claimsAvailable: prev.insurance.claimsAvailable - 1
          },
          recoveryStatus: {
            ...prev.recoveryStatus,
            insuranceClaim: insurancePayout
          }
        }));

        addNotification(`💰 Insurance payout: +${insurancePayout} coins!`, "success");
      }
    }

    addNotification(`✅ ${DISASTER_TYPES[disasterType].name} has passed. ${damagedCount} plots affected.`, "info");
  };

  const purchaseDisasterPreparation = (preparationType) => {
    const preparation = DISASTER_PREPARATION[preparationType];
    if (!preparation) return;

    if (coins < preparation.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - preparation.cost);
    setWeatherDisasters(prev => ({
      ...prev,
      disasterPreparation: {
        ...prev.disasterPreparation,
        [preparationType]: true
      }
    }));

    addNotification(`🛡️ Purchased ${preparation.name}!`, "success");
  };

  const purchaseInsurance = (insuranceType) => {
    const insurance = INSURANCE_TYPES[insuranceType];
    if (!insurance) return;

    if (coins < insurance.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - insurance.cost);
    setWeatherDisasters(prev => ({
      ...prev,
      insurance: {
        enabled: true,
        coverage: insurance.coverage,
        premium: insurance.cost,
        claimsAvailable: 3
      }
    }));

    addNotification(`📋 Purchased ${insurance.name}!`, "success");
  };

  const repairDamagedPlots = () => {
    const damagedCount = weatherDisasters.recoveryStatus.damagedPlots.size;
    const repairCost = damagedCount * 25; // 25 coins per damaged plot

    if (coins < repairCost) {
      addNotification("Not enough coins for repairs!", "error");
      return;
    }

    setCoins(prev => prev - repairCost);
    setWeatherDisasters(prev => ({
      ...prev,
      recoveryStatus: {
        damagedPlots: new Set(),
        repairCost: 0,
        insuranceClaim: 0
      }
    }));

    addNotification(`🔧 Repaired ${damagedCount} plots for ${repairCost} coins!`, "success");
  };

  const generateDisasterForecast = () => {
    const disasterTypes = Object.keys(DISASTER_TYPES);
    const randomDisaster = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    const timeUntilNext = 300 + Math.random() * 600; // 5-15 minutes
    const severity = 0.5 + Math.random() * 0.5; // 0.5 to 1.0

    setWeatherDisasters(prev => ({
      ...prev,
      disasterForecast: {
        nextDisaster: randomDisaster,
        timeUntilNext,
        severity
      }
    }));

    addNotification(`🌦️ Weather forecast: ${DISASTER_TYPES[randomDisaster].name} in ${Math.floor(timeUntilNext / 60)} minutes`, "warning");
  };

  // Education System helper functions
  const enrollInSchool = (schoolType) => {
    const school = FARMING_SCHOOLS[schoolType];
    if (!school) return;

    if (level < school.levelRequirement) {
      addNotification(`Level ${school.levelRequirement} required to enroll!`, "error");
      return;
    }

    setEducationSystem(prev => ({
      ...prev,
      currentSchool: schoolType
    }));

    addNotification(`🎓 Enrolled in ${school.name}!`, "success");
  };

  const startCourse = (courseId) => {
    const course = COURSE_CATALOG[courseId];
    if (!course) return;

    // Check prerequisites
    const missingPrereqs = course.prerequisites.filter(prereq => !educationSystem.completedCourses.has(prereq));
    if (missingPrereqs.length > 0) {
      addNotification(`Prerequisites required: ${missingPrereqs.join(', ')}`, "error");
      return;
    }

    if (coins < course.cost) {
      addNotification("Not enough coins for tuition!", "error");
      return;
    }

    setCoins(prev => prev - course.cost);
    setEducationSystem(prev => ({
      ...prev,
      enrolledCourses: new Set([...prev.enrolledCourses, courseId])
    }));

    addNotification(`📚 Started ${course.name}! (${course.duration}s)`, "success");
  };

  const completeCourse = (courseId) => {
    const course = COURSE_CATALOG[courseId];
    if (!course) return;

    setEducationSystem(prev => {
      const newEnrolled = new Set(prev.enrolledCourses);
      const newCompleted = new Set(prev.completedCourses);

      newEnrolled.delete(courseId);
      newCompleted.add(courseId);

      // Award rewards
      if (course.rewards.experience) {
        setExperience(prevExp => prevExp + course.rewards.experience);
      }

      // Add skill points to relevant skill tree
      const skillTree = getSkillTreeForCourse(courseId);
      if (skillTree) {
        const updatedSkillTrees = { ...prev.skillTrees };
        updatedSkillTrees[skillTree].experience += course.rewards.skillPoints || 0;

        // Level up if enough experience
        const expNeeded = updatedSkillTrees[skillTree].level * 10;
        if (updatedSkillTrees[skillTree].experience >= expNeeded) {
          updatedSkillTrees[skillTree].level++;
          updatedSkillTrees[skillTree].experience = 0;
          addNotification(`🎯 ${SKILL_TREES[skillTree].name} leveled up to ${updatedSkillTrees[skillTree].level}!`, "success");
        }

        return {
          ...prev,
          enrolledCourses: newEnrolled,
          completedCourses: newCompleted,
          skillTrees: updatedSkillTrees
        };
      }

      return {
        ...prev,
        enrolledCourses: newEnrolled,
        completedCourses: newCompleted
      };
    });

    addNotification(`🎓 Completed ${course.name}! +${course.rewards.experience} XP`, "success");

    // Check for certifications
    checkCertifications();
  };

  const getSkillTreeForCourse = (courseId) => {
    // Map courses to skill trees
    const courseSkillMap = {
      // Farming skill tree
      basic_crops: "farming",
      soil_basics: "farming",
      watering_101: "farming",
      crop_rotation: "farming",
      pest_management: "farming",
      yield_optimization: "farming",

      // Technology skill tree
      precision_agriculture: "technology",
      ai_farming: "technology",
      vertical_farming: "technology",

      // Business skill tree
      genetic_engineering: "business",

      // Sustainability skill tree
      sustainable_practices: "sustainability",
      climate_adaptation: "sustainability"
    };

    return courseSkillMap[courseId];
  };

  const checkCertifications = () => {
    Object.entries(CERTIFICATIONS).forEach(([certId, cert]) => {
      if (!educationSystem.certifications.has(certId)) {
        const hasAllRequirements = cert.requirements.every(req => educationSystem.completedCourses.has(req));

        if (hasAllRequirements) {
          setEducationSystem(prev => ({
            ...prev,
            certifications: new Set([...prev.certifications, certId])
          }));

          // Apply certification rewards
          if (cert.rewards.reputation) {
            setTownReputation(prev => prev + cert.rewards.reputation);
          }

          addNotification(`🏆 Earned certification: ${cert.name}!`, "success");
        }
      }
    });
  };

  const upgradeSkill = (skillTree, skillId) => {
    const skill = SKILL_TREES[skillTree].skills[skillId];
    if (!skill) return;

    const currentSkill = educationSystem.skillTrees[skillTree].skills[skillId] || { level: 0 };
    if (currentSkill.level >= skill.maxLevel) {
      addNotification("Skill already at maximum level!", "error");
      return;
    }

    // Check prerequisites
    const missingPrereqs = skill.prerequisites.filter(prereq => {
      const prereqSkill = educationSystem.skillTrees[skillTree].skills[prereq];
      return !prereqSkill || prereqSkill.level === 0;
    });

    if (missingPrereqs.length > 0) {
      addNotification(`Prerequisites required: ${missingPrereqs.join(', ')}`, "error");
      return;
    }

    // Check if enough skill points
    if (educationSystem.skillTrees[skillTree].experience < skill.cost) {
      addNotification("Not enough skill points!", "error");
      return;
    }

    setEducationSystem(prev => {
      const updatedSkillTrees = { ...prev.skillTrees };
      const updatedSkills = { ...updatedSkillTrees[skillTree].skills };

      updatedSkills[skillId] = { level: currentSkill.level + 1 };
      updatedSkillTrees[skillTree].skills = updatedSkills;
      updatedSkillTrees[skillTree].experience -= skill.cost;

      return {
        ...prev,
        skillTrees: updatedSkillTrees
      };
    });

    addNotification(`⬆️ Upgraded ${skill.name} to level ${currentSkill.level + 1}!`, "success");
  };

  const shareKnowledge = (knowledgeType, recipient = null) => {
    const knowledge = {
      type: knowledgeType,
      sharedBy: globalMarket.playerId || "Anonymous",
      timestamp: Date.now(),
      value: educationSystem.skillTrees.farming.level * 10 + educationSystem.certifications.size * 50
    };

    setEducationSystem(prev => ({
      ...prev,
      knowledgeShared: [...prev.knowledgeShared, knowledge]
    }));

    // Award reputation and experience
    setTownReputation(prev => prev + 5);
    setExperience(prev => prev + 25);

    addNotification(`📚 Shared farming knowledge! +5 reputation, +25 XP`, "success");
  };

  const getSkillBonus = (skillTree, effectType) => {
    const skillTreeData = educationSystem.skillTrees[skillTree];
    let totalBonus = 0;

    Object.entries(skillTreeData.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[skillTree].skills[skillId];
      if (skill.effect[effectType] && skillData.level > 0) {
        totalBonus += skill.effect[effectType] * skillData.level;
      }
    });

    return totalBonus;
  };

  const getEducationBonus = (bonusType) => {
    switch (bonusType) {
      case "growthSpeed":
        return getSkillBonus("farming", "growthSpeed");
      case "yieldBonus":
        return getSkillBonus("farming", "yieldBonus");
      case "qualityBonus":
        return getSkillBonus("farming", "qualityBonus");
      case "ecoBonus":
        return getSkillBonus("sustainability", "ecoBonus");
      case "automationBonus":
        return getSkillBonus("technology", "automationBonus");
      case "tradeBonus":
        return getSkillBonus("business", "tradeBonus");
      default:
        return 0;
    }
  };

  // Sustainability System helper functions
  const calculateCarbonFootprint = () => {
    let footprint = 0;

    // Base carbon footprint from farming activities
    footprint += plots.filter(plot => plot.seed).length * 10; // 10 units per active plot

    // Energy consumption impact
    footprint += sustainabilitySystem.renewableEnergy.energyConsumption * 0.5;

    // Transportation and machinery
    footprint += (vehicles.handcart ? 5 : 0) + (vehicles.tractorTrailer ? 15 : 0);

    // Chemical usage impact
    if (!sustainabilitySystem.sustainablePractices.organicFarming) {
      footprint += plots.filter(plot => plot.seed).length * 8;
    }

    // Waste production impact
    footprint += sustainabilitySystem.environmentalImpact.wasteProduction * 2;

    return Math.max(0, footprint);
  };

  const updateEnergySystems = () => {
    let totalProduction = 0;
    let totalConsumption = 0;

    // Calculate renewable energy production
    if (sustainabilitySystem.renewableEnergy.solarPanels) {
      totalProduction += RENEWABLE_ENERGY.solarPanels.energyOutput;
    }
    if (sustainabilitySystem.renewableEnergy.windTurbines) {
      totalProduction += RENEWABLE_ENERGY.windTurbines.energyOutput;
    }
    if (sustainabilitySystem.renewableEnergy.hydroelectric) {
      totalProduction += RENEWABLE_ENERGY.hydroelectric.energyOutput;
    }
    if (sustainabilitySystem.renewableEnergy.bioFuelGenerator) {
      totalProduction += RENEWABLE_ENERGY.bioFuelGenerator.energyOutput;
    }

    // Calculate energy consumption
    totalConsumption = plots.filter(plot => plot.seed).length * 5; // 5 units per active plot
    totalConsumption += (buildings.greenhouseII ? 10 : 0);
    totalConsumption += (buildings.processingPlantII ? 15 : 0);
    totalConsumption += (irrigationSystem.enabled ? irrigationSystem.waterLevel * 0.1 : 0);

    // Apply energy efficiency from sustainable practices
    if (sustainabilitySystem.sustainablePractices.waterConservation) {
      totalConsumption *= 0.9; // 10% reduction
    }

    setSustainabilitySystem(prev => ({
      ...prev,
      renewableEnergy: {
        ...prev.renewableEnergy,
        energyProduction: totalProduction,
        energyConsumption: totalConsumption
      },
      carbonFootprint: calculateCarbonFootprint()
    }));
  };

  const calculateSustainabilityScore = () => {
    let score = 0;

    // Renewable energy contribution (30% weight)
    const energyRatio = sustainabilitySystem.renewableEnergy.energyProduction /
                       Math.max(1, sustainabilitySystem.renewableEnergy.energyConsumption);
    score += Math.min(30, energyRatio * 30);

    // Environmental impact (40% weight)
    const soilHealthScore = (sustainabilitySystem.environmentalImpact.soilHealth / 100) * 15;
    const biodiversityScore = (sustainabilitySystem.environmentalImpact.biodiversity / 100) * 10;
    const airQualityScore = (sustainabilitySystem.environmentalImpact.airQuality / 100) * 10;
    const wasteScore = Math.max(0, 5 - (sustainabilitySystem.environmentalImpact.wasteProduction / 20) * 5);
    score += soilHealthScore + biodiversityScore + airQualityScore + wasteScore;

    // Sustainable practices (20% weight)
    const practiceCount = Object.values(sustainabilitySystem.sustainablePractices).filter(Boolean).length;
    score += (practiceCount / 5) * 20;

    // Eco-certifications (10% weight)
    score += sustainabilitySystem.ecoCertifications.size * 2;

    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const updateEnvironmentalImpact = () => {
    const impact = { ...ENVIRONMENTAL_IMPACT_BASELINES };
    const activePlots = plots.filter(plot => plot.seed).length;

    // Base impact from active plots
    impact.waterUsage = activePlots * impact.waterUsage;
    impact.wasteProduction = activePlots * impact.wasteProduction;

    // Apply sustainable practice modifiers
    Object.entries(sustainabilitySystem.sustainablePractices).forEach(([practice, enabled]) => {
      if (enabled && SUSTAINABLE_PRACTICES[practice]) {
        const practiceImpact = SUSTAINABLE_PRACTICES[practice].environmentalImpact;
        Object.entries(practiceImpact).forEach(([metric, value]) => {
          if (impact[metric] !== undefined) {
            impact[metric] += value;
          }
        });
      }
    });

    // Renewable energy impact
    if (sustainabilitySystem.renewableEnergy.energyProduction > 0) {
      impact.airQuality += 10;
      impact.biodiversity += 5;
    }

    // Ensure values stay within reasonable bounds
    impact.waterUsage = Math.max(0, impact.waterUsage);
    impact.soilHealth = Math.min(100, Math.max(0, impact.soilHealth));
    impact.biodiversity = Math.min(100, Math.max(0, impact.biodiversity));
    impact.airQuality = Math.min(100, Math.max(0, impact.airQuality));
    impact.wasteProduction = Math.max(0, impact.wasteProduction);

    setSustainabilitySystem(prev => ({
      ...prev,
      environmentalImpact: impact,
      sustainabilityScore: calculateSustainabilityScore()
    }));
  };

  const purchaseRenewableEnergy = (energyType) => {
    const energy = RENEWABLE_ENERGY[energyType];
    if (!energy) return;

    if (level < energy.requirements.level) {
      addNotification(`Level ${energy.requirements.level} required!`, "error");
      return;
    }

    if (coins < energy.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - energy.cost);
    setSustainabilitySystem(prev => ({
      ...prev,
      renewableEnergy: {
        ...prev.renewableEnergy,
        [energyType]: true
      }
    }));

    addNotification(`🪫 Purchased ${energy.name}!`, "success");
    updateEnergySystems();
  };

  const implementSustainablePractice = (practiceType) => {
    const practice = SUSTAINABLE_PRACTICES[practiceType];
    if (!practice) return;

    if (coins < practice.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - practice.cost);
    setSustainabilitySystem(prev => ({
      ...prev,
      sustainablePractices: {
        ...prev.sustainablePractices,
        [practiceType]: true
      }
    }));

    addNotification(`🌱 Implemented ${practice.name}!`, "success");
    updateEnvironmentalImpact();
  };

  const checkEcoCertifications = () => {
    Object.entries(ECO_CERTIFICATIONS).forEach(([certId, cert]) => {
      if (!sustainabilitySystem.ecoCertifications.has(certId)) {
        let eligible = true;

        // Check requirements
        Object.entries(cert.requirements).forEach(([req, value]) => {
          switch (req) {
            case "organicFarming":
              if (sustainabilitySystem.sustainablePractices.organicFarming !== value) eligible = false;
              break;
            case "soilHealth":
              if (sustainabilitySystem.environmentalImpact.soilHealth < value) eligible = false;
              break;
            case "energyProduction":
              if (sustainabilitySystem.renewableEnergy.energyProduction < value) eligible = false;
              break;
            case "renewableSources":
              const sources = Object.values(sustainabilitySystem.renewableEnergy).filter(v => v === true).length;
              if (sources < value) eligible = false;
              break;
            case "waterUsage":
              if (sustainabilitySystem.environmentalImpact.waterUsage > -value) eligible = false;
              break;
            case "waterConservation":
              if (sustainabilitySystem.sustainablePractices.waterConservation !== value) eligible = false;
              break;
            case "biodiversity":
              if (sustainabilitySystem.environmentalImpact.biodiversity < value) eligible = false;
              break;
            case "naturalPestControl":
              if (sustainabilitySystem.sustainablePractices.naturalPestControl !== value) eligible = false;
              break;
            case "carbonFootprint":
              if (sustainabilitySystem.carbonFootprint > value) eligible = false;
              break;
            case "wasteRecycling":
              if (sustainabilitySystem.sustainablePractices.wasteRecycling !== value) eligible = false;
              break;
          }
        });

        if (eligible) {
          setSustainabilitySystem(prev => ({
            ...prev,
            ecoCertifications: new Set([...prev.ecoCertifications, certId])
          }));

          // Apply certification benefits
          if (cert.benefits.reputationBonus) {
            setTownReputation(prev => prev + cert.benefits.reputationBonus);
          }

          addNotification(`🌿 Earned ${cert.name} certification!`, "success");
        }
      }
    });
  };

  const getSustainabilityBonus = (bonusType) => {
    let totalBonus = 0;

    // Certification bonuses
    sustainabilitySystem.ecoCertifications.forEach(certId => {
      const cert = ECO_CERTIFICATIONS[certId];
      if (cert.benefits[bonusType]) {
        totalBonus += cert.benefits[bonusType];
      }
    });

    // Sustainable practice bonuses
    Object.entries(sustainabilitySystem.sustainablePractices).forEach(([practice, enabled]) => {
      if (enabled && SUSTAINABLE_PRACTICES[practice].benefits[bonusType]) {
        totalBonus += SUSTAINABLE_PRACTICES[practice].benefits[bonusType];
      }
    });

    // Threshold bonuses
    const score = sustainabilitySystem.sustainabilityScore;
    Object.entries(SUSTAINABILITY_THRESHOLDS).forEach(([level, data]) => {
      if (score >= data.score && data.benefits[bonusType]) {
        totalBonus += data.benefits[bonusType];
      }
    });

    return totalBonus;
  };

  const generateMonthlyReport = () => {
    const report = {
      timestamp: Date.now(),
      carbonFootprint: sustainabilitySystem.carbonFootprint,
      energyProduction: sustainabilitySystem.renewableEnergy.energyProduction,
      energyConsumption: sustainabilitySystem.renewableEnergy.energyConsumption,
      sustainabilityScore: sustainabilitySystem.sustainabilityScore,
      environmentalImpact: { ...sustainabilitySystem.environmentalImpact },
      certifications: Array.from(sustainabilitySystem.ecoCertifications),
      recommendations: []
    };

    // Generate recommendations
    if (sustainabilitySystem.carbonFootprint > 50) {
      report.recommendations.push("Consider adding renewable energy sources to reduce carbon footprint");
    }
    if (sustainabilitySystem.environmentalImpact.waterUsage > 100) {
      report.recommendations.push("Implement water conservation practices to reduce water usage");
    }
    if (sustainabilitySystem.environmentalImpact.biodiversity < 70) {
      report.recommendations.push("Add natural pest control to improve biodiversity");
    }

    setSustainabilitySystem(prev => ({
      ...prev,
      monthlyReport: report
    }));

    addNotification("📊 Monthly sustainability report generated!", "info");
  };

  // Advanced Research helper functions
  const unlockResearchField = (fieldType) => {
    const field = RESEARCH_FIELDS[fieldType];
    if (!field) return;

    if (level < field.unlockLevel) {
      addNotification(`Level ${field.unlockLevel} required to unlock ${field.name}!`, "error");
      return;
    }

    if (coins < field.baseCost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - field.baseCost);
    setAdvancedResearch(prev => ({
      ...prev,
      [fieldType]: {
        ...prev[fieldType],
        unlocked: true
      }
    }));

    addNotification(`🔬 ${field.name} research field unlocked!`, "success");
  };

  const startResearchProject = (projectId) => {
    const project = RESEARCH_PROJECTS[projectId];
    if (!project) return;

    // Check if field is unlocked
    if (!advancedResearch[project.field].unlocked) {
      addNotification(`${RESEARCH_FIELDS[project.field].name} field not unlocked!`, "error");
      return;
    }

    // Check prerequisites
    const missingPrereqs = project.requirements.filter(req => !advancedResearch.completedProjects.has(req));
    if (missingPrereqs.length > 0) {
      addNotification(`Prerequisites required: ${missingPrereqs.join(', ')}`, "error");
      return;
    }

    // Check if already active
    if (advancedResearch.activeProjects.has(projectId)) {
      addNotification("Project already in progress!", "error");
      return;
    }

    // Check research points
    if (advancedResearch.researchPoints < project.cost) {
      addNotification("Not enough research points!", "error");
      return;
    }

    // Check parallel project limit
    const maxParallel = advancedResearch.researchLab.level >= 2 ? (advancedResearch.researchLab.level >= 3 ? 5 : 2) : 1;
    if (advancedResearch.activeProjects.size >= maxParallel) {
      addNotification(`Maximum ${maxParallel} parallel projects reached!`, "error");
      return;
    }

    setAdvancedResearch(prev => ({
      ...prev,
      activeProjects: new Set([...prev.activeProjects, projectId]),
      researchPoints: prev.researchPoints - project.cost
    }));

    addNotification(`🧪 Started research: ${project.name}!`, "success");
  };

  const completeResearchProject = (projectId) => {
    const project = RESEARCH_PROJECTS[projectId];
    if (!project) return;

    setAdvancedResearch(prev => {
      const newActive = new Set(prev.activeProjects);
      const newCompleted = new Set(prev.completedProjects);

      newActive.delete(projectId);
      newCompleted.add(projectId);

      // Update field level
      const field = project.field;
      const updatedFields = { ...prev[field] };
      updatedFields.level = Math.min(10, updatedFields.level + 1);

      // Award research points
      const bonusPoints = Math.floor(project.cost * 0.1); // 10% of cost as bonus

      return {
        ...prev,
        activeProjects: newActive,
        completedProjects: newCompleted,
        [field]: updatedFields,
        researchPoints: prev.researchPoints + bonusPoints
      };
    });

    // Apply project rewards
    if (project.rewards) {
      // This would integrate with the game bonuses system
      addNotification(`✅ ${project.name} completed! +${Math.floor(project.cost * 0.1)} research points`, "success");
    }

    // Check for breakthroughs
    checkBreakthroughs();
  };

  const checkBreakthroughs = () => {
    Object.entries(BREAKTHROUGHS).forEach(([breakId, breakthrough]) => {
      if (!advancedResearch.breakthroughs.has(breakId)) {
        let eligible = true;

        Object.entries(breakthrough.requirements).forEach(([field, requiredLevel]) => {
          if (advancedResearch[field].level < requiredLevel) {
            eligible = false;
          }
        });

        if (eligible) {
          setAdvancedResearch(prev => ({
            ...prev,
            breakthroughs: new Set([...prev.breakthroughs, breakId])
          }));

          addNotification(`🌟 Major breakthrough: ${breakthrough.name}!`, "success");

          // Apply breakthrough rewards
          if (breakthrough.rewards) {
            // This would integrate with the game bonuses system
          }
        }
      }
    });
  };

  const upgradeResearchLab = (facilityType) => {
    const facility = RESEARCH_FACILITIES[facilityType];
    if (!facility) return;

    // Check requirements
    if (facility.requirements) {
      if (facility.requirements.level && level < facility.requirements.level) {
        addNotification(`Level ${facility.requirements.level} required!`, "error");
        return;
      }
      if (facility.requirements.breakthroughs && advancedResearch.breakthroughs.size < facility.requirements.breakthroughs) {
        addNotification(`${facility.requirements.breakthroughs} breakthroughs required!`, "error");
        return;
      }
    }

    if (coins < facility.cost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - facility.cost);
    setAdvancedResearch(prev => ({
      ...prev,
      researchLab: {
        ...prev.researchLab,
        level: Math.max(prev.researchLab.level, facility === RESEARCH_FACILITIES.basic_lab ? 1 :
                       facility === RESEARCH_FACILITIES.advanced_lab ? 2 : 3),
        efficiency: facility.benefits.efficiency,
        automationLevel: facility.benefits.researchBonus * 10
      }
    }));

    addNotification(`🏗️ Research facility upgraded to ${facility.name}!`, "success");
  };

  const generateResearchPoints = () => {
    // Generate research points based on various factors
    let pointsGenerated = 1; // Base points

    // Education bonus
    pointsGenerated += getEducationBonus("researchBonus") || 0;

    // Sustainability bonus
    pointsGenerated += getSustainabilityBonus("ecoBonus") * 0.5;

    // Research lab efficiency
    pointsGenerated *= advancedResearch.researchLab.efficiency;

    // Breakthrough bonuses
    pointsGenerated += advancedResearch.breakthroughs.size * 0.5;

    setAdvancedResearch(prev => ({
      ...prev,
      researchPoints: prev.researchPoints + Math.floor(pointsGenerated)
    }));
  };

  const publishResearch = (projectId) => {
    const project = RESEARCH_PROJECTS[projectId];
    if (!project) return;

    if (!advancedResearch.completedProjects.has(projectId)) {
      addNotification("Project not completed!", "error");
      return;
    }

    const publication = {
      id: `pub_${Date.now()}`,
      projectId,
      title: project.name,
      field: project.field,
      impact: Math.floor(project.cost / 100), // Impact score
      citations: 0,
      timestamp: Date.now()
    };

    setAdvancedResearch(prev => ({
      ...prev,
      publications: [...prev.publications, publication],
      researchPoints: prev.researchPoints + publication.impact * 10 // Bonus research points
    }));

    // Award reputation and experience
    setTownReputation(prev => prev + publication.impact);
    setExperience(prev => prev + publication.impact * 5);

    addNotification(`📄 Research published: ${project.name}! +${publication.impact * 10} research points`, "success");
  };

  const getResearchBonus = (bonusType) => {
    let totalBonus = 0;

    // Field level bonuses
    Object.entries(advancedResearch).forEach(([key, field]) => {
      if (field.level && RESEARCH_FIELDS[key]) {
        const fieldBonus = field.level * 0.05; // 5% per level
        totalBonus += fieldBonus;
      }
    });

    // Breakthrough bonuses
    advancedResearch.breakthroughs.forEach(breakId => {
      const breakthrough = BREAKTHROUGHS[breakId];
      if (breakthrough.rewards[bonusType]) {
        totalBonus += breakthrough.rewards[bonusType];
      }
    });

    // Active project bonuses (partial)
    advancedResearch.activeProjects.forEach(projectId => {
      const project = RESEARCH_PROJECTS[projectId];
      if (project.rewards[bonusType]) {
        totalBonus += project.rewards[bonusType] * 0.5; // 50% while in progress
      }
    });

    return totalBonus;
  };

  // Animal Husbandry helper functions
  const purchaseAnimal = (animalType, gender = null) => {
    const animal = ANIMAL_TYPES[animalType];
    if (!animal) return;

    if (coins < animal.baseCost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    // Check facility capacity
    const facility = animalHusbandry.facilities[animal.facility];
    const currentAnimals = animalHusbandry.animals.filter(a => a.type === animalType).length;
    if (currentAnimals >= facility.capacity) {
      addNotification(`Not enough space in ${animal.facility}!`, "error");
      return;
    }

    const newAnimal = {
      id: `animal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: animalType,
      name: generateAnimalName(animalType),
      gender: gender || (Math.random() > 0.5 ? 'male' : 'female'),
      age: 0,
      health: 100,
      happiness: 100,
      productionReady: false,
      breedingReady: false,
      traits: generateRandomTraits(animalType),
      parents: null,
      offspring: [],
      lastFed: Date.now(),
      lastProduced: Date.now(),
      lastBred: Date.now(),
      value: animal.baseCost
    };

    setCoins(prev => prev - animal.baseCost);
    setAnimalHusbandry(prev => ({
      ...prev,
      animals: [...prev.animals, newAnimal]
    }));

    addNotification(`🐄 Purchased a ${animal.name}!`, "success");
  };

  const generateAnimalName = (animalType) => {
    const namePrefixes = {
      cow: ["Bella", "Daisy", "Molly", "Rosie", "Maggie", "Lucy", "Coco", "Penny"],
      chicken: ["Clucky", "Feathers", "Sunny", "Goldie", "Speckles", "Fluffy", "Chickadee", "Nugget"],
      pig: ["Porky", "Bacon", "Oinky", "Snort", "Mudpie", "Trotter", "Hoggy", "Squeal"],
      sheep: ["Wooly", "Fluffy", "Curl", "Lamby", "Shear", "Fleece", "Baa", "Cotton"],
      horse: ["Spirit", "Blaze", "Thunder", "Lightning", "Comet", "Star", "Shadow", "Storm"]
    };

    const prefixes = namePrefixes[animalType] || ["Animal"];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  };

  const generateRandomTraits = (animalType) => {
    const animal = ANIMAL_TYPES[animalType];
    const traits = {};
    const numTraits = Math.floor(Math.random() * 3) + 1; // 1-3 traits

    for (let i = 0; i < numTraits; i++) {
      const availableTraits = animal.traits;
      const randomTrait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
      if (!traits[randomTrait]) {
        traits[randomTrait] = Math.floor(Math.random() * 5) + 1; // Level 1-5
      }
    }

    return traits;
  };

  const breedAnimals = (maleId, femaleId) => {
    const male = animalHusbandry.animals.find(a => a.id === maleId);
    const female = animalHusbandry.animals.find(a => a.id === femaleId);

    if (!male || !female) return;
    if (male.gender !== 'male' || female.gender !== 'female') {
      addNotification("Invalid breeding pair!", "error");
      return;
    }

    if (!male.breedingReady || !female.breedingReady) {
      addNotification("Animals not ready for breeding!", "error");
      return;
    }

    const breedingTime = ANIMAL_TYPES[male.type].breedingTime;
    const cost = Math.floor((male.value + female.value) * 0.1); // 10% of combined value

    if (coins < cost) {
      addNotification("Not enough coins for breeding!", "error");
      return;
    }

    setCoins(prev => prev - cost);

    // Create breeding pair record
    const breedingPair = {
      id: `breeding_${Date.now()}`,
      maleId,
      femaleId,
      startTime: Date.now(),
      duration: breedingTime,
      status: 'in_progress',
      expectedOffspring: Math.floor(Math.random() * 3) + 1 // 1-3 offspring
    };

    setAnimalHusbandry(prev => ({
      ...prev,
      breedingPairs: [...prev.breedingPairs, breedingPair],
      animals: prev.animals.map(a =>
        a.id === maleId || a.id === femaleId
          ? { ...a, breedingReady: false, lastBred: Date.now() }
          : a
      )
    }));

    addNotification(`💕 Started breeding ${male.name} and ${female.name}!`, "success");
  };

  const completeBreeding = (breedingId) => {
    const breeding = animalHusbandry.breedingPairs.find(b => b.id === breedingId);
    if (!breeding) return;

    const male = animalHusbandry.animals.find(a => a.id === breeding.maleId);
    const female = animalHusbandry.animals.find(a => a.id === breeding.femaleId);

    if (!male || !female) return;

    // Generate offspring
    const offspring = [];
    for (let i = 0; i < breeding.expectedOffspring; i++) {
      const offspringTraits = { ...male.traits };
      Object.keys(female.traits).forEach(trait => {
        if (offspringTraits[trait]) {
          // Blend traits
          offspringTraits[trait] = Math.max(1, Math.floor((offspringTraits[trait] + female.traits[trait]) / 2) + Math.floor(Math.random() * 2) - 1);
        } else {
          offspringTraits[trait] = female.traits[trait];
        }
      });

      const newOffspring = {
        id: `animal_${Date.now()}_${i}`,
        type: male.type,
        name: generateAnimalName(male.type),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        age: 0,
        health: 100,
        happiness: 100,
        productionReady: false,
        breedingReady: false,
        traits: offspringTraits,
        parents: { male: male.id, female: female.id },
        offspring: [],
        lastFed: Date.now(),
        lastProduced: Date.now(),
        lastBred: Date.now(),
        value: Math.floor((male.value + female.value) * 0.6) // 60% of parents' value
      };

      offspring.push(newOffspring);
    }

    // Update animal records
    setAnimalHusbandry(prev => ({
      ...prev,
      animals: [
        ...prev.animals.filter(a => a.id !== male.id && a.id !== female.id),
        ...prev.animals.map(a => {
          if (a.id === male.id || a.id === female.id) {
            return {
              ...a,
              offspring: [...(a.offspring || []), ...offspring.map(o => o.id)]
            };
          }
          return a;
        }),
        ...offspring
      ],
      breedingPairs: prev.breedingPairs.filter(b => b.id !== breedingId),
      genetics: {
        ...prev.genetics,
        breedingRecords: [
          ...prev.genetics.breedingRecords,
          {
            id: breedingId,
            maleId: breeding.maleId,
            femaleId: breeding.femaleId,
            offspring: offspring.map(o => o.id),
            timestamp: Date.now()
          }
        ]
      }
    }));

    addNotification(`🐣 Breeding complete! ${offspring.length} offspring born!`, "success");
  };

  const enterAnimalShow = (showType, animalIds) => {
    const show = ANIMAL_SHOWS[showType];
    if (!show) return;

    // Check requirements
    if (level < show.requirements.level) {
      addNotification(`Level ${show.requirements.level} required!`, "error");
      return;
    }

    const totalEntryFee = show.entryFee * animalIds.length;
    if (coins < totalEntryFee) {
      addNotification("Not enough coins for entry fees!", "error");
      return;
    }

    // Check if animals are eligible
    const animals = animalIds.map(id => animalHusbandry.animals.find(a => a.id === id)).filter(Boolean);
    if (animals.length !== animalIds.length) {
      addNotification("Some animals not found!", "error");
      return;
    }

    setCoins(prev => prev - totalEntryFee);

    const showEntry = {
      id: `show_${Date.now()}`,
      type: showType,
      animals: animalIds,
      startTime: Date.now(),
      duration: show.duration,
      status: 'in_progress',
      entryFee: totalEntryFee
    };

    setAnimalHusbandry(prev => ({
      ...prev,
      animalShows: {
        ...prev.animalShows,
        activeShow: showEntry
      }
    }));

    addNotification(`🎪 Entered ${animals.length} animals in ${show.name}!`, "success");
  };

  const completeAnimalShow = () => {
    const show = animalHusbandry.animalShows.activeShow;
    if (!show) return;

    const showInfo = ANIMAL_SHOWS[show.type];
    const animals = show.animals.map(id => animalHusbandry.animals.find(a => a.id === id)).filter(Boolean);

    // Calculate results (simplified scoring)
    const results = animals.map(animal => {
      let score = 50; // Base score

      // Health and happiness contribute
      score += (animal.health / 100) * 20;
      score += (animal.happiness / 100) * 15;

      // Traits contribute
      Object.values(animal.traits).forEach(traitLevel => {
        score += traitLevel * 2;
      });

      // Random factor
      score += Math.floor(Math.random() * 20) - 10;

      return {
        animalId: animal.id,
        animalName: animal.name,
        score: Math.max(0, Math.min(100, score))
      };
    }).sort((a, b) => b.score - a.score);

    // Determine placements and prizes
    const placements = {};
    results.forEach((result, index) => {
      if (index < 3) {
        const place = index + 1;
        placements[result.animalId] = {
          place,
          prize: showInfo.prizes[place] || 0
        };
      }
    });

    // Update animals and record results
    setAnimalHusbandry(prev => ({
      ...prev,
      animals: prev.animals.map(animal => {
        const placement = placements[animal.id];
        if (placement) {
          return {
            ...animal,
            happiness: Math.min(100, animal.happiness + 20), // Happy from winning
            value: animal.value + Math.floor(placement.prize * 0.1) // Value increases slightly
          };
        }
        return animal;
      }),
      animalShows: {
        ...prev.animalShows,
        activeShow: null,
        completedShows: [...prev.animalShows.completedShows, {
          ...show,
          completedAt: Date.now(),
          results,
          placements
        }],
        showResults: [...prev.animalShows.showResults, {
          showId: show.id,
          showType: show.type,
          results,
          placements,
          timestamp: Date.now()
        }]
      }
    }));

    // Award prizes
    const totalPrize = Object.values(placements).reduce((sum, p) => sum + p.prize, 0);
    setCoins(prev => prev + totalPrize);

    addNotification(`🏆 Show complete! Won ${totalPrize}💰 in prizes!`, "success");
  };

  const upgradeFacility = (facilityType) => {
    const facility = FACILITY_UPGRADES[facilityType];
    if (!facility) return;

    const currentLevel = animalHusbandry.facilities[facilityType].level;
    const nextLevel = currentLevel + 1;

    if (nextLevel >= facility.levels.length) {
      addNotification("Facility already at maximum level!", "error");
      return;
    }

    const upgradeCost = facility.levels[nextLevel].cost;
    if (coins < upgradeCost) {
      addNotification("Not enough coins!", "error");
      return;
    }

    setCoins(prev => prev - upgradeCost);
    setAnimalHusbandry(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facilityType]: {
          ...prev.facilities[facilityType],
          level: nextLevel,
          capacity: facility.levels[nextLevel].capacity
        }
      }
    }));

    addNotification(`🏗️ ${facilityType} upgraded to level ${nextLevel}!`, "success");
  };



  const collectProducts = () => {
    const productionReady = animalHusbandry.animals.filter(animal => {
      const animalType = ANIMAL_TYPES[animal.type];
      return Date.now() - animal.lastProduced > animalType.productionTime * 1000;
    });

    if (productionReady.length === 0) {
      addNotification("No animals ready for collection!", "info");
      return;
    }

    let totalProducts = { ...animalHusbandry.products };

    productionReady.forEach(animal => {
      const animalType = ANIMAL_TYPES[animal.type];
      Object.entries(animalType.products).forEach(([product, amount]) => {
        totalProducts[product] = (totalProducts[product] || 0) + amount;
      });
    });

    setAnimalHusbandry(prev => ({
      ...prev,
      products: totalProducts,
      animals: prev.animals.map(animal => {
        const animalType = ANIMAL_TYPES[animal.type];
        if (Date.now() - animal.lastProduced > animalType.productionTime * 1000) {
          return {
            ...animal,
            lastProduced: Date.now(),
            happiness: Math.max(0, animal.happiness - 5), // Slightly less happy after production
            productionReady: false
          };
        }
        return animal;
      })
    }));

    const productSummary = Object.entries(totalProducts)
      .filter(([_, amount]) => amount > 0)
      .map(([product, amount]) => `${amount} ${product}`)
      .join(', ');

    addNotification(`🥛 Collected products: ${productSummary}!`, "success");
  };

  const sellAnimal = (animalId) => {
    const animal = animalHusbandry.animals.find(a => a.id === animalId);
    if (!animal) return;

    const salePrice = Math.floor(animal.value * 0.8); // 80% of value
    setCoins(prev => prev + salePrice);

    setAnimalHusbandry(prev => ({
      ...prev,
      animals: prev.animals.filter(a => a.id !== animalId)
    }));

    addNotification(`💰 Sold ${animal.name} for ${salePrice}💰!`, "success");
  };

  const getAnimalBonus = (bonusType) => {
    let totalBonus = 0;

    animalHusbandry.animals.forEach(animal => {
      Object.entries(animal.traits).forEach(([traitId, level]) => {
        const trait = ANIMAL_TRAITS[traitId];
        if (trait && trait.effect[bonusType]) {
          totalBonus += trait.effect[bonusType] * level;
        }
      });
    });

    return totalBonus;
  };

  // Auto-save with jitter (20-40s) to avoid thundering herd & reduce contention
  useEffect(() => {
    let cancelled = false;
    let timerId;
    const schedule = () => {
      const jitter = 20000 + Math.floor(Math.random() * 20000);
      timerId = setTimeout(() => {
        if (!cancelled) saveGame();
        if (!cancelled) schedule();
      }, jitter);
    };
    schedule();
    return () => { cancelled = true; clearTimeout(timerId); };
  }, [name, coins, score, size, plots, inventory, selectedSeed, level, experience, totalHarvests,
      activeFestival, festivalStartTime, festivalEndTime, festivalScore, festivalTrophies, limitedTimeSeeds,
      geneticLab, cropGeneBank, activeBreedingProjects, discoveredHybrids, geneticTraits,
      availableSoils, soilInventory, companionBonuses, companionKnowledge,
      currentWeather, weatherChangeTime, currentSeason, seasonStartTime, weatherHistory,
      unlockedAchievements, harvestedCropTypes, totalEarned,
      buildings, livestock, animalFeed, animalProducts,
      pestOutbreaks, treatmentInventory, maxGridSize, unlockedGridSizes, marketPerks, vehicleUpgrades,
      // Multiplayer state
      isMultiplayer, currentPlayerId, players, sessionId, sessionName, sharedResources,
      visitingFarm, farmVisits, plotOwnership, actionHistory,
      // Advanced economy state
      futuresContracts, internationalMarkets, economicEvents, marketSpeculation, portfolio,
      // Farm customization state
      farmDecorations, farmTheme, unlockedThemes, unlockedDecorations,
      // Town development state
      townLevel, townReputation, townBuildings, townEvents, townServices,
      // Social features state
      competitions, leaderboards, gifts, neighbors, socialEvents, playerStats,
      // Deep farming mechanics state
      irrigationSystem, geneticsLab, greenhouseClimate, plotConditions,
      // Advanced automation state
      farmAI, autoScheduler, smartOptimization,
      // Seasonal events state
      seasonalEvents, holidayEvents, specialCrops, eventProgress, seasonalShop,
      // Mini-games state
      miniGames,
      // Global Marketplace state
      globalMarket,
      // Weather Disasters state
      weatherDisasters,
      // Education System state
      educationSystem,
      // Sustainability System state
      sustainabilitySystem,
      // Advanced Research state
      advancedResearch,
      // Animal Husbandry state
      animalHusbandry]);

  // Initialize market prices on load
  useEffect(() => {
    generateMarketPrices();
  }, []); // Run once on mount

  // Check for pests/diseases periodically
  useEffect(() => {
    const interval = setInterval(checkForPestsAndDiseases, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [plots, currentTime, currentWeather, companionBonuses]);

  // Mini-games timer
  useEffect(() => {
    if (miniGames.currentGame) {
      const interval = setInterval(() => {
        updateMiniGame(miniGames.currentGame, "tick");
      }, 1000); // Update every second
      return () => clearInterval(interval);
    }
  }, [miniGames.currentGame]);

  // Commodity price updates
  useEffect(() => {
    if (globalMarket.marketEnabled) {
      const interval = setInterval(updateCommodityPrices, MARKETPLACE_CONFIG.priceUpdateInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [globalMarket.marketEnabled]);

  // Weather disaster processing
  useEffect(() => {
    if (weatherDisasters.activeDisaster) {
      const interval = setInterval(processDisasterEffects, 1000); // Process every second
      return () => clearInterval(interval);
    }
  }, [weatherDisasters.activeDisaster]);

  // Disaster forecast generator
  useEffect(() => {
    if (level >= 3) { // Unlock disasters at level 3
      const interval = setInterval(() => {
        if (!weatherDisasters.activeDisaster && !weatherDisasters.disasterForecast.nextDisaster) {
          if (Math.random() < 0.1) { // 10% chance every 5 minutes
            generateDisasterForecast();
          }
        } else if (weatherDisasters.disasterForecast.timeUntilNext > 0) {
          setWeatherDisasters(prev => ({
            ...prev,
            disasterForecast: {
              ...prev.disasterForecast,
              timeUntilNext: Math.max(0, prev.disasterForecast.timeUntilNext - 5)
            }
          }));

          // Trigger disaster when timer reaches 0
          if (weatherDisasters.disasterForecast.timeUntilNext <= 5) {
            const disasterType = weatherDisasters.disasterForecast.nextDisaster;
            const severity = weatherDisasters.disasterForecast.severity;
            triggerDisaster(disasterType, severity);
            setWeatherDisasters(prev => ({
              ...prev,
              disasterForecast: {
                nextDisaster: null,
                timeUntilNext: 0,
                severity: 0
              }
            }));
          }
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [level, weatherDisasters.activeDisaster, weatherDisasters.disasterForecast]);

  // Course progression timer
  useEffect(() => {
    if (educationSystem.enrolledCourses.size > 0) {
      const interval = setInterval(() => {
        educationSystem.enrolledCourses.forEach(courseId => {
          const course = COURSE_CATALOG[courseId];
          if (course) {
            // For now, auto-complete courses after their duration
            // In a real implementation, you'd track progress over time
            setTimeout(() => {
              completeCourse(courseId);
            }, course.duration * 1000);
          }
        });
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [educationSystem.enrolledCourses]);

  // Sustainability system updates
  useEffect(() => {
    updateEnergySystems();
    updateEnvironmentalImpact();
    checkEcoCertifications();
  }, [plots, buildings, vehicles, irrigationSystem, level]);

  // Monthly sustainability report
  useEffect(() => {
    const interval = setInterval(() => {
      generateMonthlyReport();
    }, 300000); // Every 5 minutes (simulating monthly)

    return () => clearInterval(interval);
  }, []);

  // Research point generation and project progression
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate research points
      generateResearchPoints();

      // Progress active research projects
      advancedResearch.activeProjects.forEach(projectId => {
        const project = RESEARCH_PROJECTS[projectId];
        if (project) {
          // For now, auto-complete projects after their duration
          // In a real implementation, you'd track progress over time
          setTimeout(() => {
            completeResearchProject(projectId);
          }, project.duration * 1000);
        }
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [advancedResearch.activeProjects, advancedResearch.researchLab]);

  // Animal care and breeding timers
  useEffect(() => {
    const interval = setInterval(() => {
      // Update animal readiness
      setAnimalHusbandry(prev => ({
        ...prev,
        animals: prev.animals.map(animal => {
          const animalType = ANIMAL_TYPES[animal.type];
          const now = Date.now();

          // Update production readiness
          const productionReady = now - animal.lastProduced > animalType.productionTime * 1000;

          // Update breeding readiness
          const breedingReady = now - animal.lastBred > animalType.breedingTime * 1000;

          // Update age
          const newAge = animal.age + 1;

          // Health and happiness decay over time
          let newHealth = animal.health;
          let newHappiness = animal.happiness;

          if (now - animal.lastFed > 3600000 * 2) { // 2 hours without food
            newHealth = Math.max(0, newHealth - 5);
            newHappiness = Math.max(0, newHappiness - 10);
          }

          return {
            ...animal,
            age: newAge,
            health: newHealth,
            happiness: newHappiness,
            productionReady,
            breedingReady
          };
        })
      }));

      // Check for breeding completion
      animalHusbandry.breedingPairs.forEach(breeding => {
        if (Date.now() - breeding.startTime > breeding.duration * 1000) {
          completeBreeding(breeding.id);
        }
      });

      // Check for show completion
      if (animalHusbandry.animalShows.activeShow) {
        const show = animalHusbandry.animalShows.activeShow;
        if (Date.now() - show.startTime > show.duration * 1000) {
          completeAnimalShow();
        }
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [animalHusbandry.animals, animalHusbandry.breedingPairs, animalHusbandry.animalShows.activeShow]);

  // Plant function
  const plant = (i) => {
    // Handle decoration placement in layout mode
    if (layoutMode && selectedDecoration) {
      const plotIndex = i;
      const x = plotIndex % gridSize;
      const y = Math.floor(plotIndex / gridSize);
      placeDecoration(selectedDecoration.id, x, y);
      return;
    }

    if (!selectedSeed || !inventory[`${selectedSeed}_seed`] || inventory[`${selectedSeed}_seed`] <= 0) {
      addNotification("No seeds available!", "error");
      return;
    }

    const plot = plots[i];
    if (plot.status !== "empty") {
      addNotification("Plot not available!", "error");
      return;
    }

    const newPlots = [...plots];
    newPlots[i] = {
      ...plot,
      status: "growing",
      seed: selectedSeed,
      plantedAt: currentTime,
      stage: 0
    };
    setPlots(newPlots);

      setInventory(prev => ({
        ...prev,
      [`${selectedSeed}_seed`]: prev[`${selectedSeed}_seed`] - 1
    }));

    // Track multiplayer action and ownership
    if (isMultiplayer) {
      setPlotOwnership(prev => ({
        ...prev,
        [i]: currentPlayerId
      }));
      trackAction(`planted ${selectedSeed}`, i);
    }

    const seedData = DEFAULT_RULES.seeds[selectedSeed];
    addNotification(`🌱 Planted ${seedData.emoji} ${seedData.name} seeds!`, "success");

    // Check for companion relationships with adjacent plots
    const adjacentPlots = getAdjacentPlots(i);
    adjacentPlots.forEach(adjIndex => {
      const adjPlot = plots[adjIndex];
      if (adjPlot && adjPlot.seed && (adjPlot.status === "growing" || adjPlot.status === "ready")) {
        discoverCompanionRelationship(selectedSeed, adjPlot.seed);
      }
    });
    
    // Recalculate companion effects
    setTimeout(() => calculateCompanionEffects(), 100);
  };

  // Harvest function
  const harvest = (i) => {
    const plot = plots[i];
    if (plot.status !== "ready") {
      addNotification("Not ready to harvest!", "error");
      return;
    }

    // Get seed data from both regular and limited time crops
    const allSeeds = { ...DEFAULT_RULES.seeds, ...LIMITED_TIME_CROPS };
    const seedData = allSeeds[plot.seed];
    
    // Apply festival, soil, companion, automation, and health bonuses
    const festivalValueBonus = getFestivalBonus("value");
    const soilBonus = getSoilBonus(i);
    const companionBonus = getCompanionBonus(i);
    const automationBonus = getAutomationBonus(i);
    const healthBonus = plot.health / 100; // 0-1 multiplier based on health
    const totalValueBonus = festivalValueBonus * soilBonus.value * companionBonus.value * automationBonus.value * healthBonus;
    const value = Math.floor(seedData.baseValue * totalValueBonus);
    
    // Give harvested crops to inventory
    setInventory(prev => ({
      ...prev,
      [plot.seed]: (prev[plot.seed] || 0) + 1
    }));

    // Random chance to get 1 seed back on harvest (e.g., 35%)
    if (Math.random() < 0.35) {
      setInventory(prev => ({
        ...prev,
        [`${plot.seed}_seed`]: (prev[`${plot.seed}_seed`] || 0) + 1
      }));
      addNotification(`🌱 Got 1 ${seedData.emoji} ${seedData.name} seed back!`, "info");
    }
    
    setScore(prev => prev + value);
    setTotalHarvests(prev => prev + 1);
    setExperience(prev => prev + 5);
    setHarvestedCropTypes(prev => new Set([...prev, plot.seed]));
    
    // Add research points (1 per harvest)
    addResearchPoints(1);

    // Show harvest notification
    addNotification(`🌾 Harvested ${seedData.emoji} ${seedData.name} for ${value} coins!`, "success");

    // Festival scoring
        if (activeFestival) {
      let festivalPoints = 0;
      if (activeFestival.competitionType === "harvest_count") {
        festivalPoints = 10;
      } else if (activeFestival.competitionType === "total_value") {
        festivalPoints = value;
      } else if (activeFestival.competitionType === "quality_harvest") {
        festivalPoints = plot.quality * 15;
      }
      setFestivalScore(prev => prev + festivalPoints);
    }

    const newPlots = [...plots];
    newPlots[i] = newPlot("empty");
    setPlots(newPlots);

    // Add harvest particle effect
    const particleEffect = document.createElement('div');
    particleEffect.innerHTML = seedData.emoji;
    particleEffect.className = 'fixed text-2xl pointer-events-none z-50 animate-bounce';
    particleEffect.style.left = `${Math.random() * 100}vw`;
    particleEffect.style.top = `${Math.random() * 100}vh`;
    particleEffect.style.animation = 'bounce 1s ease-out';
    document.body.appendChild(particleEffect);
    setTimeout(() => document.body.removeChild(particleEffect), 1000);

    // Track multiplayer action
    if (isMultiplayer) {
      trackAction(`harvested ${plot.seed} for ${value} coins`, i);
    }

    // Update mini-game if Harvest Rush is active
    if (miniGames.currentGame === "harvestRush") {
      updateMiniGame("harvestRush", "harvest", { plotIndex: i });
    }

    const bonusText = totalValueBonus > 1 ? ` (${Math.round((totalValueBonus - 1) * 100)}% bonus!)` : "";
    addNotification(`+${value} coins!${bonusText}`, "success");
    
    // Check achievements after harvest
    setTimeout(() => checkAchievements(), 100);
  };

  // Simulate growth
  useEffect(() => {
    const newPlots = plots.map(plot => {
      if (plot.status === "growing" && plot.seed) {
        // Get seed data from both regular and limited time crops
        const allSeeds = { ...DEFAULT_RULES.seeds, ...LIMITED_TIME_CROPS };
        const seedData = allSeeds[plot.seed];
        
        const elapsed = currentTime - plot.plantedAt;
        // Apply all growth bonuses: festival, soil, companion, weather, season
        const plotIndex = plots.indexOf(plot);
        const festivalBonus = getFestivalBonus("growth");
        const soilBonus = getSoilBonus(plotIndex);
        const companionBonus = getCompanionBonus(plotIndex);
        const weatherBonus = getWeatherBonus();
        const seasonBonus = getSeasonBonus();
        const automationBonus = getAutomationBonus(plotIndex);
        const totalGrowthBonus = festivalBonus * soilBonus.growth * companionBonus.growth * weatherBonus.growth * seasonBonus.growth * automationBonus.growth;
        const stageTime = seedData.secondsPerStage / totalGrowthBonus;
        const targetStage = Math.floor(elapsed / stageTime);
        
        if (targetStage >= seedData.stages) {
          return { ...plot, status: "ready", stage: seedData.stages };
        } else if (targetStage > plot.stage) {
          return { ...plot, stage: targetStage };
        }
      }
      return plot;
    });

    if (JSON.stringify(newPlots) !== JSON.stringify(plots)) {
      setPlots(newPlots);
    }
  }, [currentTime, plots]);

  // Check festival end
  useEffect(() => {
    if (activeFestival && festivalEndTime && currentTime >= festivalEndTime) {
      endFestival();
    }
  }, [currentTime, activeFestival, festivalEndTime]);

  // Check breeding projects completion
  useEffect(() => {
    activeBreedingProjects.forEach(project => {
      if (currentTime >= project.endTime && !project.completed) {
        completeBreedingProject(project.id);
      }
    });
  }, [currentTime, activeBreedingProjects]);

  // Recalculate companion effects when plots change
  useEffect(() => {
    calculateCompanionEffects();
  }, [plots]);

  // Weather change system
  useEffect(() => {
    if (currentTime >= weatherChangeTime) {
      changeWeather();
    }
  }, [currentTime, weatherChangeTime]);

  // Disaster timer and deliveries processor
  useEffect(() => {
    maybeTriggerDisaster();
    if (activeDisaster && activeDisaster.endsAt <= nowSec()) {
      setActiveDisaster(null);
      addNotification("Disaster ended.", "info");
    }
    processDeliveries();
  }, [currentTime]);

  // Generate contracts and forecast periodically
  useEffect(() => {
    generateContracts();
    generateForecast();
    const interval = setInterval(() => {
      generateContracts();
      generateForecast();
    }, 300000); // every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Season change system
  useEffect(() => {
    const seasonDuration = SEASONS[currentSeason].duration;
    if (currentTime >= seasonStartTime + seasonDuration) {
      changeSeason();
    }
  }, [currentTime, currentSeason, seasonStartTime]);

  // Buy seeds (for planting)
  const buySeeds = (seed, amount) => {
    const allSeeds = { ...DEFAULT_RULES.seeds, ...LIMITED_TIME_CROPS };
    const seedData = allSeeds[seed];

    if (!seedData) {
      addNotification("Seed not available!", "error");
      return;
    }

    const cost = seedData.shopPrice * amount;
    if (coins < cost) {
      addNotification("Not enough coins!", "error");
        return;
      }

    setCoins(prev => prev - cost);

    // Add seeds to seed inventory (separate from crops)
    setInventory(prev => ({
      ...prev,
      [`${seed}_seed`]: (prev[`${seed}_seed`] || 0) + amount
    }));

    addNotification(`Bought ${amount} ${seedData.emoji} ${seedData.name} seeds for planting!`, "success");
  };

  // Plot rendering
  const PlotCard = ({ plot, index }) => {
    const allSeeds = { ...DEFAULT_RULES.seeds, ...LIMITED_TIME_CROPS };
    const seedData = plot.seed ? allSeeds[plot.seed] : null;

  return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          plot.status === "locked" ? "opacity-50" : ""
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          if (plot.status === 'locked') return;
          setPlotMenu({ open: true, x: e.clientX, y: e.clientY, plotIndex: index });
        }}
        onClick={() => {
          if (plot.status === "empty") plant(index);
          else if (plot.status === "ready") harvest(index);
        }}
        onTouchStart={(e) => {
          if (plot.status === 'locked') return;
          const touch = e.touches?.[0];
          const x = touch?.clientX || 0;
          const y = touch?.clientY || 0;
          touchTimerRef.current = setTimeout(() => {
            setPlotMenu({ open: true, x, y, plotIndex: index });
          }, 450);
        }}
        onTouchEnd={() => { if (touchTimerRef.current) { clearTimeout(touchTimerRef.current); } }}
      >
        <CardContent className={`p-2 text-center min-h-[100px] flex flex-col justify-center relative ${
          currentWeather === "rainy" ? "bg-blue-100" :
          currentWeather === "snowy" ? "bg-blue-50" :
          currentWeather === "cloudy" ? "bg-gray-100" :
          currentWeather === "sunny" ? "bg-yellow-50" : ""
        }`}>
          <div className="text-xl mb-1 transition-all duration-500 ease-in-out">
            {plot.status === "locked" && "🔒"}
            {plot.status === "empty" && "🟫"}
            {plot.status === "growing" && seedData && (
              <div className="animate-pulse">
                {plot.stage === 0 && "🌱"}
                {plot.stage === 1 && "🌿"}
                {plot.stage === 2 && "🌾"}
                {plot.stage === 3 && "🌻"}
                {plot.stage >= 4 && seedData.emoji}
              </div>
            )}
            {plot.status === "ready" && (
              <div className="animate-bounce">
                {seedData && seedData.emoji}
              </div>
            )}
            </div>
                    <div className="text-xs leading-tight">
            {plot.status === "empty" && "Click to plant"}
            {plot.status === "growing" && `Growing... (${plot.stage}/${seedData?.stages || 0})`}
            {plot.status === "ready" && "Ready! Click to harvest"}
            {plot.status === "locked" && "Locked"}
                        {plot.status !== "locked" && (
              <div className="mt-1 text-xs text-gray-500">
                {SOIL_TYPES[plot.soilType]?.emoji} {plot.soilType}
                {plot.improvements?.length > 0 && ` +${plot.improvements.length}`}

                {/* Multiplayer ownership indicator */}
                {isMultiplayer && plotOwnership[index] && (
                  <div className="mt-1">
                    <div
                      className="inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded bg-gray-100"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: players.find(p => p.id === plotOwnership[index])?.color || '#666'
                        }}
                      />
                      <span className="text-gray-600">
                        {players.find(p => p.id === plotOwnership[index])?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
                {plot.automation?.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {plot.automation.map(auto => (
                      <span key={auto.id} className="text-blue-600">
                        {AUTOMATION_EQUIPMENT[auto.type]?.emoji}
                      </span>
                    ))}
                  </div>
                )}
                                {plot.status === "growing" && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                    <span className={`${plot.health > 80 ? 'text-green-600' : plot.health > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      ❤️{Math.round(plot.health)}%
                    </span>
                    {plot.pests.length > 0 && (
                      <span className="text-red-600">🐛{plot.pests.length}</span>
                    )}
                    {plot.diseases.length > 0 && (
                      <span className="text-red-600">🦠{plot.diseases.length}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Weather particle effects */}
            {currentWeather === "rainy" && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 w-px h-full bg-blue-300 animate-pulse opacity-70" style={{ animationDuration: '0.5s' }}></div>
                <div className="absolute top-0 left-1/3 w-px h-full bg-blue-300 animate-pulse opacity-50" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }}></div>
                <div className="absolute top-0 right-1/3 w-px h-full bg-blue-300 animate-pulse opacity-60" style={{ animationDuration: '0.6s', animationDelay: '0.4s' }}></div>
              </div>
            )}

            {currentWeather === "snowy" && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 text-white animate-bounce opacity-80" style={{ animationDuration: '2s' }}>❄️</div>
                <div className="absolute top-0 right-1/4 text-white animate-bounce opacity-60" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>❄️</div>
                <div className="absolute top-0 left-1/2 text-white animate-bounce opacity-70" style={{ animationDuration: '1.8s', animationDelay: '1s' }}>❄️</div>
              </div>
            )}
                  </div>
                </CardContent>
              </Card>
    );
  };

    // Calculate time of day for day/night cycle
    const gameHour = (currentTime % 86400) / 3600; // 0-24 hours
    const isDayTime = gameHour >= 6 && gameHour <= 18;
    const timeOfDay = isDayTime ? "day" : "night";

    return (
    <div className={`p-4 max-w-7xl mx-auto min-h-screen transition-all duration-1000 ${
      timeOfDay === "day"
        ? "bg-gradient-to-b from-blue-200 via-yellow-100 to-green-100"
        : "bg-gradient-to-b from-indigo-900 via-purple-900 to-black"
    }`}>
      {/* Night time stars */}
      {!isDayTime && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-10 left-10 text-yellow-200 animate-pulse">✨</div>
          <div className="absolute top-20 right-20 text-yellow-200 animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
          <div className="absolute top-32 left-1/3 text-yellow-200 animate-pulse" style={{ animationDelay: '2s' }}>✨</div>
          <div className="absolute top-40 right-1/3 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute top-16 left-1/2 text-yellow-200 animate-pulse" style={{ animationDelay: '1.5s' }}>✨</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 relative z-10">

        {/* Farm Grid */}
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
              <CardTitle>🚜 {name}'s Farm</CardTitle>
              <div className="mt-2">
                <label className="text-xs text-gray-500 mr-2">Farmer Name:</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 24))}
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Enter name"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-sm mt-2">
                <span className="bg-yellow-50 px-2 py-1 rounded border">💰 {coins}</span>
                <span className="bg-green-50 px-2 py-1 rounded border">⭐ {score}</span>
                <span className="bg-blue-50 px-2 py-1 rounded border">📈 Lv.{level}</span>
                <span className="bg-purple-50 px-2 py-1 rounded border">🎯 {totalHarvests}</span>
                <span className="bg-cyan-50 px-2 py-1 rounded border">🧪 {researchPoints}RP</span>
                <span className="bg-orange-50 px-2 py-1 rounded border">⚡ {energyProduction - energyConsumption}/{energyProduction}</span>
                </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-2">
                <Badge variant="outline">
                  {isDayTime ? "☀️" : "🌙"} {Math.floor(gameHour)}:00 {isDayTime ? "Day" : "Night"}
                </Badge>
                <Badge variant="outline">
                  {WEATHER_TYPES[currentWeather].emoji} {WEATHER_TYPES[currentWeather].name}
                </Badge>
                <Badge variant="outline">
                  {SEASONS[currentSeason].emoji} {SEASONS[currentSeason].name}
                  </Badge>
                <Badge variant="outline">
                  🏆 {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                  </Badge>
                {activeFestival && (
                  <Badge variant="secondary">
                    {activeFestival.emoji} {activeFestival.name} - Score: {festivalScore}
                  </Badge>
                )}
                    </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Farm Grid */}
                <div
                  className="grid gap-2 mb-4 p-2"
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                  {plots.map((plot, i) => (
                    <PlotCard key={i} plot={plot} index={i} />
                  ))}
                </div>

                {/* Decoration Overlays */}
                <div
                  className="absolute inset-0 grid gap-2 p-2 pointer-events-none"
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                    const x = i % gridSize;
                    const y = Math.floor(i / gridSize);
                    const decoration = farmDecorations.find(dec => dec.x === x && dec.y === y);

                    if (!decoration) return <div key={i} />;

                    const item = DECORATION_ITEMS[decoration.type];
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-center text-2xl pointer-events-auto ${
                          selectedDecoration?.id === decoration.id ? 'animate-bounce bg-yellow-200 rounded' : ''
                        }`}
                        onClick={() => layoutMode && setSelectedDecoration(decoration)}
                      >
                        {item.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Context menu for plot actions */}
            {plotMenu.open && (
              <div
                className="fixed z-50 bg-white border rounded shadow-lg text-sm"
                style={{ left: plotMenu.x, top: plotMenu.y }}
                onMouseLeave={() => setPlotMenu({ open: false, x: 0, y: 0, plotIndex: null })}
              >
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { waterPlot(plotMenu.plotIndex); setPlotMenu({ open: false, x: 0, y: 0, plotIndex: null }); }}>💧 Water</button>
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { fertilizePlot(plotMenu.plotIndex); setPlotMenu({ open: false, x: 0, y: 0, plotIndex: null }); }}>🌱 Fertilizer</button>
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { pesticidePlot(plotMenu.plotIndex); setPlotMenu({ open: false, x: 0, y: 0, plotIndex: null }); }}>🧪 Pesticide</button>
              </div>
            )}

            {/* Farm Command Center */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">🎮 Farm Command Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Livestock Showcase */}
                  <div className="bg-amber-50 p-3 rounded-lg border">
                    <h3 className="font-bold text-sm mb-2 text-amber-800">🐄 Livestock Status</h3>
                    {livestock.length > 0 ? (
                      <div className="space-y-2">
                        {/* Animal Counts */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(
                            livestock.reduce((counts, animal) => {
                              counts[animal.type] = (counts[animal.type] || 0) + 1;
                              return counts;
                            }, {})
                          ).map(([type, count]) => {
                            const animalData = LIVESTOCK_TYPES[type];
                            return (
                              <span key={type} className="bg-white px-2 py-1 rounded text-xs border">
                                {animalData.emoji}×{count}
                              </span>
                            );
                          })}
                        </div>
                        
                        {/* Production Ready */}
                        <div>
                          <div className="text-xs text-amber-700 mb-1">Ready to Collect:</div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(animalProducts).map(([product, amount]) => 
                              amount > 0 ? (
                                <span key={product} className="bg-green-100 px-2 py-1 rounded text-xs">
                                  {Object.values(LIVESTOCK_TYPES).find(l => l.produces === product)?.productEmoji || '📦'}×{amount}
                                </span>
                              ) : null
                            )}
                            {Object.values(animalProducts).every(amount => amount === 0) && (
                              <span className="text-xs text-gray-500">None ready</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Feed Level */}
                        <div>
                          <div className="text-xs text-amber-700 mb-1">Feed Supply:</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  animalFeed > 20 ? 'bg-green-500' : 
                                  animalFeed > 10 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, (animalFeed / 50) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{animalFeed}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No livestock yet. Visit Livestock tab to buy animals!</div>
                    )}
                  </div>

                  {/* Dynamic Farm Dashboard */}
                  <div className="bg-blue-50 p-3 rounded-lg border">
                    <h3 className="font-bold text-sm mb-2 text-blue-800">📊 Farm Status</h3>
                    <div className="space-y-2">
                      {/* Weather */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-700">Weather:</span>
                        <span className="text-xs bg-white px-2 py-1 rounded">
                          {currentWeather === 'sunny' && '☀️ Sunny (+20%)'}
                          {currentWeather === 'cloudy' && '☁️ Cloudy'}
                          {currentWeather === 'rainy' && '🌧️ Rainy (+10%)'}
                          {currentWeather === 'stormy' && '⛈️ Stormy (-20%)'}
                          {currentWeather === 'drought' && '🏜️ Drought (-30%)'}
                        </span>
                      </div>
                      
                      {/* Season */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-700">Season:</span>
                        <span className="text-xs bg-white px-2 py-1 rounded">
                          {currentSeason === 'spring' && '🌸 Spring'}
                          {currentSeason === 'summer' && '☀️ Summer'}
                          {currentSeason === 'fall' && '🍂 Fall'}
                          {currentSeason === 'winter' && '❄️ Winter'}
                          <span className="ml-1 text-gray-500">
                            ({Math.floor((currentTime - seasonStartTime) / 86400)}/{SEASONS[currentSeason].duration})
                          </span>
                        </span>
                      </div>
                      
                      {/* Energy */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-blue-700">Energy:</span>
                          <span className="text-xs">{energyProduction - energyConsumption}/{energyProduction}</span>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              energyProduction >= energyConsumption ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              width: energyProduction > 0 ? 
                                `${Math.min(100, ((energyProduction - energyConsumption) / energyProduction) * 100)}%` : 
                                '0%' 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Active Festival */}
                      {activeFestival && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-700">Festival:</span>
                          <span className="text-xs bg-purple-100 px-2 py-1 rounded">
                            🎪 {activeFestival.name}
                            <div className="text-gray-500">
                              {formatTimeRemaining(activeFestival.endTime - nowSec())}
                            </div>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Research & Automation */}
                  <div className="bg-green-50 p-3 rounded-lg border">
                    <h3 className="font-bold text-sm mb-2 text-green-800">🔬 Research & Tech</h3>
                    <div className="space-y-2">
                      {/* Active Research */}
                      {activeResearch ? (
                        <div>
                          <div className="text-xs text-green-700 mb-1">Active Research:</div>
                          <div className="bg-white p-2 rounded text-xs">
                            <div className="font-medium">{RESEARCH_TREE[activeResearch].name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${Math.min(100, ((nowSec() - researchStartTime) / RESEARCH_TREE[activeResearch].researchTime) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {formatTimeRemaining((researchStartTime + RESEARCH_TREE[activeResearch].researchTime) - nowSec())}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">No active research</div>
                      )}
                      
                      {/* Automation Overview */}
                      <div>
                        <div className="text-xs text-green-700 mb-1">Automation:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(automationSystems).map(([type, count]) => 
                            count > 0 ? (
                              <span key={type} className="bg-white px-2 py-1 rounded text-xs border">
                                {AUTOMATION_EQUIPMENT[type].emoji}×{count}
                              </span>
                            ) : null
                          )}
                          {Object.values(automationSystems).every(count => count === 0) && (
                            <span className="text-xs text-gray-500">None installed</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Next Auto-Harvest */}
                      {automationSystems.autoHarvester > 0 && (
                        <div className="text-xs">
                          <span className="text-green-700">Next Auto-Harvest: </span>
                          <span className="text-gray-600">~30s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                  </div>

        {/* Shop & Controls */}
                    <div>
            <Card>
              <CardHeader>
              <CardTitle>🏪 Farm Management</CardTitle>
              </CardHeader>
            <CardContent>
              <div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full touch-lg">
                                <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 sm:static fm-tabs-bottom">
                  <TabsTrigger value="inventory" className="text-xs px-2 py-1 flex-shrink-0">📦 Inventory</TabsTrigger>
                  <TabsTrigger value="multiplayer" className="text-xs px-2 py-1 flex-shrink-0">🎮 Multiplayer</TabsTrigger>
                  <TabsTrigger value="economy" className="text-xs px-2 py-1 flex-shrink-0">📈 Economy</TabsTrigger>
                  <TabsTrigger value="customize" className="text-xs px-2 py-1 flex-shrink-0">🎨 Customize</TabsTrigger>
                  <TabsTrigger value="town" className="text-xs px-2 py-1 flex-shrink-0">🏛️ Town</TabsTrigger>
                  <TabsTrigger value="social" className="text-xs px-2 py-1 flex-shrink-0">👥 Social</TabsTrigger>
                  <TabsTrigger value="farming" className="text-xs px-2 py-1 flex-shrink-0">🌾 Farming</TabsTrigger>
                  <TabsTrigger value="automation" className="text-xs px-2 py-1 flex-shrink-0">🤖 Automation</TabsTrigger>
                  <TabsTrigger value="minigames" className="text-xs px-2 py-1 flex-shrink-0">🎮 Mini-Games</TabsTrigger>
                  <TabsTrigger value="marketplace" className="text-xs px-2 py-1 flex-shrink-0">🌍 Marketplace</TabsTrigger>
                  <TabsTrigger value="disasters" className="text-xs px-2 py-1 flex-shrink-0">🌪️ Disasters</TabsTrigger>
                  <TabsTrigger value="education" className="text-xs px-2 py-1 flex-shrink-0">🎓 Education</TabsTrigger>
                  <TabsTrigger value="sustainability" className="text-xs px-2 py-1 flex-shrink-0">🌱 Sustainability</TabsTrigger>
                  <TabsTrigger value="livestock" className="text-xs px-2 py-1 flex-shrink-0">🐄 Livestock</TabsTrigger>
                  <TabsTrigger value="events" className="text-xs px-2 py-1 flex-shrink-0">🎉 Events</TabsTrigger>
                  <TabsTrigger value="shop" className="text-xs px-2 py-1 flex-shrink-0">🛒 Shop</TabsTrigger>
                  <TabsTrigger value="market" className="text-xs px-2 py-1 flex-shrink-0">🏪 Market</TabsTrigger>
                  <TabsTrigger value="processing" className="text-xs px-2 py-1 flex-shrink-0">🏭 Processing</TabsTrigger>
                  <TabsTrigger value="contracts" className="text-xs px-2 py-1 flex-shrink-0">📜 Contracts</TabsTrigger>
                  <TabsTrigger value="logistics" className="text-xs px-2 py-1 flex-shrink-0">🚚 Logistics</TabsTrigger>
                  <TabsTrigger value="buildings" className="text-xs px-2 py-1 flex-shrink-0">🏗️ Buildings</TabsTrigger>
                  <TabsTrigger value="genetics" className="text-xs px-2 py-1 flex-shrink-0">🧬 Genetics</TabsTrigger>
                  <TabsTrigger value="soil" className="text-xs px-2 py-1 flex-shrink-0">🌱 Soil</TabsTrigger>
                  <TabsTrigger value="companion" className="text-xs px-2 py-1 flex-shrink-0">🌸 Companion</TabsTrigger>
                  <TabsTrigger value="livestock" className="text-xs px-2 py-1 flex-shrink-0">🐄 Livestock</TabsTrigger>
                  <TabsTrigger value="health" className="text-xs px-2 py-1 flex-shrink-0">🐛 Health</TabsTrigger>
                  <TabsTrigger value="expand" className="text-xs px-2 py-1 flex-shrink-0">📏 Expand</TabsTrigger>
                  <TabsTrigger value="statistics" className="text-xs px-2 py-1 flex-shrink-0">📊 Statistics</TabsTrigger>
                  <TabsTrigger value="achievements" className="text-xs px-2 py-1 flex-shrink-0">🏆 Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border">
                    <h3 className="font-medium">📦 Farm Inventory</h3>
                    <p className="text-sm text-gray-600">Manage all your crops, products, and supplies</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {(() => { const base=2; const reduced=buildings.some(b=>b.type==='siloExpansion'); return `Spoilage: ~${reduced? (base*0.7).toFixed(1):base}%/h${reduced?' (Silo Expansion)':''}`; })()}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🌱 Seeds in Inventory (For Planting):</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {Object.entries(inventory).filter(([item]) => item.endsWith('_seed')).map(([seedItem, quantity]) => {
                        const seedName = seedItem.replace('_seed', '');
                        const seedData = DEFAULT_RULES.seeds[seedName];
                        if (!seedData || quantity <= 0) return null;

                        return (
                          <div key={seedItem} className="text-xs bg-green-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="cursor-pointer" onClick={() => setSelectedSeed(seedName)} title="Click to select for planting">
                                {seedData.emoji} {seedData.name} Seeds
                              </span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Plant to grow crops</div>
                            {selectedSeed === seedName && (
                              <div className="text-[10px] text-green-700 mt-1">Selected</div>
                            )}
                          </div>
                        );
                      })}
                      {Object.keys(inventory).filter(item => item.endsWith('_seed') && inventory[item] > 0).length === 0 && (
                        <p className="text-sm text-gray-500 col-span-2">No seeds available. Buy some from the Shop!</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🌾 Harvested Vegetables (For Selling):</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {Object.entries(inventory).filter(([item]) => !item.endsWith('_seed')).map(([crop, quantity]) => {
                        const cropData = DEFAULT_RULES.seeds[crop];
                        if (!cropData || quantity <= 0) return null;

                        return (
                          <div key={crop} className="text-xs bg-yellow-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>{cropData.emoji} {cropData.name} (Vegetable)</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Sell on market for profit</div>
                          </div>
                        );
                      })}
                      {Object.keys(inventory).filter(item => !item.endsWith('_seed') && DEFAULT_RULES.seeds[item] && inventory[item] > 0).length === 0 && (
                        <p className="text-sm text-gray-500 col-span-2">No harvested crops. Plant and grow some!</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🏭 Processed Goods:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(processedGoods).map(([good, quantity]) => {
                        const recipe = PROCESSING_RECIPES[good];
                        if (!recipe || quantity <= 0) return null;
                        
                        return (
                          <div key={good} className="text-xs bg-yellow-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>{recipe.emoji} {recipe.name}</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Value: {recipe.baseValue}💰 each</div>
                          </div>
                        );
                      })}
                      {Object.values(processedGoods).every(v => v <= 0) && (
                        <p className="text-sm text-gray-500 col-span-2">No processed goods</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🐄 Animal Products:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(animalProducts).map(([product, quantity]) => {
                        if (quantity <= 0) return null;
                        
                        const productEmoji = {
                          eggs: "🥚",
                          milk: "🥛", 
                          wool: "🧶",
                          truffles: "🍄"
                        };
                        
                        const productValue = {
                          eggs: 15,
                          milk: 35,
                          wool: 50,
                          truffles: 75
                        };
                        
                        return (
                          <div key={product} className="text-xs bg-blue-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>{productEmoji[product]} {product.charAt(0).toUpperCase() + product.slice(1)}</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Value: {productValue[product]}💰 each</div>
                          </div>
                        );
                      })}
                      {Object.values(animalProducts).every(v => v <= 0) && (
                        <p className="text-sm text-gray-500 col-span-2">No animal products</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🧪 Supplies & Materials:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs bg-purple-50 p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span>🥗 Animal Feed</span>
                          <span className="font-medium">{animalFeed}</span>
                        </div>
                        <div className="text-gray-500">Cost: 2💰 each</div>
                      </div>
                      
                      {Object.entries(treatmentInventory).map(([treatment, quantity]) => {
                        const treatmentData = TREATMENTS[treatment];
                        if (quantity <= 0) return null;
                        
                        return (
                          <div key={treatment} className="text-xs bg-red-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>{treatmentData.emoji} {treatmentData.name}</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Cost: {treatmentData.cost}💰 each</div>
                          </div>
                        );
                      })}
                      
                      {Object.entries(soilInventory).map(([improvement, quantity]) => {
                        const improvementData = SOIL_IMPROVEMENTS[improvement];
                        if (!improvementData || quantity <= 0) return null;
                        
                        return (
                          <div key={improvement} className="text-xs bg-brown-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>🌱 {improvement.charAt(0).toUpperCase() + improvement.slice(1)}</span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Cost: {improvementData.cost}💰 each</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">📊 Inventory Summary:</h4>
                    <div className="bg-gray-100 p-2 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Total Crop Types: {Object.values(inventory).filter(v => v > 0).length}</div>
                        <div>Total Crops: {Object.values(inventory).reduce((sum, v) => sum + v, 0)}</div>
                        <div>Processed Goods: {Object.values(processedGoods).reduce((sum, v) => sum + v, 0)}</div>
                        <div>Animal Products: {Object.values(animalProducts).reduce((sum, v) => sum + v, 0)}</div>
                      </div>
                      <div className="mt-2 text-center font-medium">
                        Estimated Total Value: {
                          Object.entries(inventory).reduce((sum, [item, qty]) => {
                            const seedData = DEFAULT_RULES.seeds[item];
                            return sum + (seedData ? seedData.baseValue * qty : 0);
                          }, 0) +
                          Object.entries(processedGoods).reduce((sum, [good, qty]) => {
                            const recipe = PROCESSING_RECIPES[good];
                            return sum + (recipe ? recipe.baseValue * qty : 0);
                          }, 0) +
                          (animalProducts.eggs * 15) + (animalProducts.milk * 35) + 
                          (animalProducts.wool * 50) + (animalProducts.truffles * 75)
                        }💰
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Multiplayer */}
                <TabsContent value="multiplayer" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">🎮 Multiplayer Farming</h3>
                    <p className="text-sm text-gray-600">Collaborate with friends on shared farms</p>
                  </div>

                  {/* Session Management */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Session Management</h4>
                    {!isMultiplayer ? (
                      <div className="space-y-2">
                        <Button onClick={createSession} className="w-full">
                          🎮 Create New Session
                        </Button>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter session ID"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                joinSession(e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button variant="outline" onClick={() => {
                            const sessionId = document.querySelector('input[placeholder="Enter session ID"]').value;
                            if (sessionId) joinSession(sessionId);
                          }}>
                            Join
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-green-50 p-2 rounded text-sm">
                          <div className="font-medium">Active Session: {sessionName}</div>
                          <div className="text-xs text-gray-600">ID: {sessionId}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={sharedResources ? "default" : "secondary"}>
                              {sharedResources ? "Shared Resources" : "Individual Resources"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSharedResources(!sharedResources)}
                            >
                              {sharedResources ? "Make Individual" : "Share Resources"}
                            </Button>
                          </div>
                        </div>
                        <Button onClick={leaveSession} variant="destructive" className="w-full">
                          Leave Session
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Players */}
                  {isMultiplayer && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Players ({players.length})</h4>
                      <div className="space-y-2">
                        {players.map(player => (
                          <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: player.color }}
                              />
                              <span className="text-sm font-medium">{player.name}</span>
                              {player.isHost && <Badge variant="secondary">Host</Badge>}
                              {!player.online && <Badge variant="outline">Offline</Badge>}
                            </div>
                            <div className="flex gap-1">
                              {player.id !== currentPlayerId && (
                                <Button size="sm" variant="outline" onClick={() => visitFarm(player.id)}>
                                  🏠 Visit
                                </Button>
                              )}
                              {visitingFarm === player.id && (
                                <Button size="sm" onClick={returnHome}>
                                  🏡 Home
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Player */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Add friend"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              addPlayer(e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add friend"]');
                            if (input && input.value.trim()) {
                              addPlayer(input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  {isMultiplayer && actionHistory.length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Recent Activity</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {actionHistory.slice(-10).reverse().map((entry, index) => {
                          const player = players.find(p => p.id === entry.playerId);
                          return (
                            <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: player?.color || '#666' }}
                              />
                              <span>{player?.name || 'Unknown'}</span>
                              <span>{entry.action}</span>
                              <span className="text-gray-400 ml-auto">
                                {Math.floor((Date.now() - entry.timestamp) / 1000)}s ago
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Farm Visits */}
                  {isMultiplayer && farmVisits.length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Farm Visits</h4>
                      <div className="text-sm text-gray-600">
                        You've visited {farmVisits.length} farm{farmVisits.length !== 1 ? 's' : ''}!
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Advanced Economy */}
                <TabsContent value="economy" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">📈 Advanced Economy</h3>
                    <p className="text-sm text-gray-600">Trade futures, speculate on markets, and manage your portfolio</p>
                  </div>

                  {/* Portfolio Overview */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Investment Portfolio</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Available Cash</div>
                        <div className="text-lg font-bold text-green-600">{portfolio.cash}💰</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Active Contracts</div>
                        <div className="text-lg font-bold text-blue-600">
                          {futuresContracts.filter(c => c.status === "active").length}
                        </div>
                      </div>
                    </div>
                    <Button onClick={generateMarketPrices} className="mt-2 w-full" variant="outline">
                      🔄 Refresh Market Prices
                    </Button>
                  </div>

                  {/* Market Prices */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Market Prices</h4>
                    <div className="space-y-2">
                      {Object.entries(internationalMarkets).map(([marketKey, market]) => (
                        <div key={marketKey} className="border rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{MARKET_TYPES[marketKey].emoji}</span>
                            <span className="font-medium">{market.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Vol: {Math.round(market.volatility * 100)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            {Object.entries(market.prices).slice(0, 6).map(([crop, price]) => (
                              <div key={crop} className="flex items-center gap-1">
                                <span>{DEFAULT_RULES.seeds[crop]?.emoji}</span>
                                <span>{price}💰</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Futures Trading */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Futures Contracts</h4>
                    <div className="space-y-2">
                      {futuresContracts.filter(c => c.status === "active").map(contract => (
                        <div key={contract.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="text-sm">
                            <div className="font-medium">
                              {DEFAULT_RULES.seeds[contract.crop]?.emoji} {contract.crop}
                            </div>
                            <div className="text-xs text-gray-600">
                              {contract.type} • Strike: {contract.strikePrice}💰
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => settleFuturesContract(contract.id)}
                              disabled={Date.now() < contract.expiration}
                            >
                              Settle
                            </Button>
                            <div className="text-xs text-gray-500">
                              {Math.max(0, Math.floor((contract.expiration - Date.now()) / 1000))}s
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Buy Contract Form */}
                    <div className="mt-3 p-2 border rounded bg-gray-50">
                      <h5 className="font-medium text-sm mb-2">Buy Futures Contract</h5>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <select className="border rounded p-1" id="contract-crop">
                          {Object.keys(DEFAULT_RULES.seeds).map(crop => (
                            <option key={crop} value={crop}>
                              {DEFAULT_RULES.seeds[crop].emoji} {crop}
                            </option>
                          ))}
                        </select>
                        <select className="border rounded p-1" id="contract-type">
                          <option value="buy">📈 Buy</option>
                          <option value="sell">📉 Sell</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Amount"
                          className="border rounded p-1"
                          id="contract-amount"
                          defaultValue="1"
                          min="1"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const crop = document.getElementById('contract-crop').value;
                            const type = document.getElementById('contract-type').value;
                            const amount = parseInt(document.getElementById('contract-amount').value) || 1;
                            const strikePrice = internationalMarkets.international.prices[crop] || 10;
                            if (portfolio.cash >= strikePrice * amount) {
                              buyFuturesContract(crop, type, amount, strikePrice);
                            } else {
                              addNotification("Not enough cash for this contract!", "error");
                            }
                          }}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Economic Events */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Economic Events</h4>
                    <div className="space-y-2">
                      {economicEvents.filter(e => Date.now() < e.endTime).map(event => (
                        <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{event.emoji}</span>
                            <div>
                              <div className="font-medium text-sm">{event.name}</div>
                              <div className="text-xs text-gray-600">{event.description}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.max(0, Math.floor((event.endTime - Date.now()) / 1000))}s left
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={triggerEconomicEvent} className="mt-2 w-full" variant="outline">
                      🎲 Trigger Random Event
                    </Button>
                  </div>
                </TabsContent>

                {/* Farm Customization */}
                <TabsContent value="customize" className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded border">
                    <h3 className="font-medium">🎨 Farm Customization</h3>
                    <p className="text-sm text-gray-600">Personalize your farm with themes and decorations</p>
                  </div>

                  {/* Current Theme */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Current Theme: {FARM_THEMES[farmTheme]?.name}</h4>
                    <div className="text-lg mb-2">{FARM_THEMES[farmTheme]?.emoji}</div>
                    <p className="text-sm text-gray-600 mb-3">{FARM_THEMES[farmTheme]?.description}</p>

                    {/* Theme Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(FARM_THEMES).map(([themeId, theme]) => (
                        <div key={themeId} className={`p-2 border rounded ${
                          farmTheme === themeId ? 'border-blue-500 bg-blue-50' : ''
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{theme.emoji}</span>
                            <span className="text-sm font-medium">{theme.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{theme.description}</p>
                          <Button
                            size="sm"
                            onClick={() => applyTheme(themeId)}
                            disabled={farmTheme === themeId || !unlockedThemes.includes(themeId)}
                            className="w-full"
                          >
                            {farmTheme === themeId ? 'Active' :
                             unlockedThemes.includes(themeId) ? 'Apply' : `Unlock at Lv.${theme.unlockedLevel}`}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decorations */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Farm Decorations ({farmDecorations.length})</h4>

                    {/* Layout Mode Toggle */}
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={layoutMode ? "default" : "outline"}
                        onClick={() => setLayoutMode(!layoutMode)}
                      >
                        {layoutMode ? "✋ Exit Layout Mode" : "🎯 Enter Layout Mode"}
                      </Button>
                      {layoutMode && (
                        <span className="text-xs text-gray-600">
                          Click on farm plots to place decorations
                        </span>
                      )}
                    </div>

                    {/* Decoration Shop */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(DECORATION_ITEMS).map(([itemId, item]) => (
                        <div key={itemId} className="p-2 border rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{item.emoji}</span>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => buyDecoration(itemId)}
                              disabled={coins < item.cost || !unlockedDecorations.includes(itemId)}
                              className="flex-1"
                            >
                              {coins >= item.cost && unlockedDecorations.includes(itemId) ? `${item.cost}💰` :
                               !unlockedDecorations.includes(itemId) ? `Lv.${item.unlockedLevel}` : 'No 💰'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Placed Decorations */}
                    {farmDecorations.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Placed Decorations</h5>
                        <div className="space-y-2">
                          {farmDecorations.map(decoration => {
                            const item = DECORATION_ITEMS[decoration.type];
                            return (
                              <div key={decoration.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{item.emoji}</span>
                                  <div>
                                    <div className="text-sm font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-600">
                                      Position: ({decoration.x}, {decoration.y})
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDecoration(decoration)}
                                    disabled={!layoutMode}
                                  >
                                    Move
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeDecoration(decoration.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme Unlocks */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Theme Progress</h4>
                    <div className="space-y-1">
                      {Object.entries(FARM_THEMES).map(([themeId, theme]) => (
                        <div key={themeId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{theme.emoji}</span>
                            <span>{theme.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {unlockedThemes.includes(themeId) ? (
                              <Badge variant="secondary">Unlocked</Badge>
                            ) : (
                              <span className="text-gray-600">
                                Lv.{theme.unlockedLevel} {level >= theme.unlockedLevel && "(Ready!)"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Town Development */}
                <TabsContent value="town" className="space-y-3">
                  <div className="bg-indigo-50 p-3 rounded border">
                    <h3 className="font-medium">🏛️ Town Development</h3>
                    <p className="text-sm text-gray-600">Build and develop your community</p>
                  </div>

                  {/* Town Status */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Town Status</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Town Level</div>
                        <div className="text-lg font-bold text-blue-600">{getTownLevel()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Reputation</div>
                        <div className="text-lg font-bold text-green-600">{townReputation}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Buildings</div>
                        <div className="text-lg font-bold text-purple-600">{townBuildings.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Town Buildings */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Town Buildings ({townBuildings.length})</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(TOWN_BUILDINGS).map(([buildingId, building]) => {
                        const hasBuilding = townBuildings.includes(buildingId);
                        const canBuild = coins >= building.cost &&
                          townReputation >= (building.reputationRequired || 0) &&
                          !hasBuilding;

                        return (
                          <div key={buildingId} className="p-2 border rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{building.emoji}</span>
                              <span className="text-sm font-medium">{building.name}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{building.description}</p>
                            <div className="text-xs text-gray-500 mb-2">
                              Cost: {building.cost}💰 • Rep: {building.reputationRequired || 0}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => buildTownBuilding(buildingId)}
                              disabled={!canBuild}
                              className="w-full"
                            >
                              {hasBuilding ? "Built" : canBuild ? "Build" : "Can't Build"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Town Services */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Town Services</h4>
                    <div className="space-y-2">
                      {Object.entries(TOWN_SERVICES).map(([serviceId, service]) => (
                        <div key={serviceId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {serviceId === "clinic" ? "🏥" :
                               serviceId === "school" ? "🏫" :
                               serviceId === "library" ? "📚" :
                               serviceId === "bank" ? "🏦" :
                               serviceId === "market" ? "🏛️" : "🎪"}
                            </span>
                            <div>
                              <div className="text-sm font-medium">{service.name}</div>
                              <div className="text-xs text-gray-600">{service.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">
                              {townServices[serviceId] ? "✅ Active" : `${service.cost}💰`}
                            </div>
                            {!townServices[serviceId] && (
                              <Button
                                size="sm"
                                onClick={() => unlockTownService(serviceId)}
                                disabled={coins < service.cost}
                              >
                                Unlock
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Town Events */}
                  {townServices.festival_grounds && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Town Events</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {TOWN_EVENTS.map(event => (
                          <div key={event.id} className="p-2 border rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{event.emoji}</span>
                              <span className="text-sm font-medium">{event.name}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                            <div className="text-xs text-gray-500 mb-2">
                              Duration: {event.duration}s
                              {event.effects.coins && ` • +${event.effects.coins}💰`}
                              {event.effects.reputation && ` • +${event.effects.reputation} Rep`}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => hostTownEvent(event.id)}
                              disabled={townEvents.some(e => e.id === event.id && Date.now() < e.endTime)}
                              className="w-full"
                            >
                              {townEvents.some(e => e.id === event.id && Date.now() < e.endTime) ? "Active" : "Host Event"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Events */}
                  {townEvents.filter(e => Date.now() < e.endTime).length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Active Events</h4>
                      <div className="space-y-2">
                        {townEvents.filter(e => Date.now() < e.endTime).map(event => (
                          <div key={event.id} className="flex items-center justify-between p-2 border rounded bg-green-50">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{event.emoji}</span>
                              <div>
                                <div className="text-sm font-medium">{event.name}</div>
                                <div className="text-xs text-gray-600">{event.description}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.max(0, Math.floor((event.endTime - Date.now()) / 1000))}s left
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Town Statistics */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Town Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Next Level</div>
                        <div className="text-sm">
                          {getTownLevel() === 5 ? "Max Level" : `${50 * getTownLevel() * getTownLevel()} Rep`}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Services Unlocked</div>
                        <div className="text-sm">
                          {Object.values(townServices).filter(Boolean).length}/{Object.keys(townServices).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Social Features */}
                <TabsContent value="social" className="space-y-3">
                  <div className="bg-pink-50 p-3 rounded border">
                    <h3 className="font-medium">👥 Social Features</h3>
                    <p className="text-sm text-gray-600">Compete, collaborate, and connect with other farmers</p>
                  </div>

                  {/* Player Stats */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Your Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Total Harvests</div>
                        <div className="text-lg font-bold text-green-600">{playerStats.totalHarvests}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Competitions Won</div>
                        <div className="text-lg font-bold text-yellow-600">{playerStats.competitionsWon}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Best Harvest</div>
                        <div className="text-lg font-bold text-blue-600">{playerStats.bestHarvest}💰</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Friends Helped</div>
                        <div className="text-lg font-bold text-purple-600">{playerStats.friendsHelped}</div>
                      </div>
                    </div>
                  </div>

                  {/* Competitions */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Farm Competitions</h4>
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {Object.entries(COMPETITION_TYPES).map(([compId, competition]) => (
                        <div key={compId} className="p-2 border rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{competition.emoji}</span>
                            <span className="text-sm font-medium">{competition.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{competition.description}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            Duration: {competition.duration}s • Reward: {competition.reward.coins}💰 +{competition.reward.reputation} Rep
                          </div>
                          <Button
                            size="sm"
                            onClick={() => startCompetition(compId)}
                            className="w-full"
                          >
                            Start Competition
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Active Competitions */}
                    {competitions.filter(c => c.status === "active").length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Active Competitions</h5>
                        <div className="space-y-2">
                          {competitions.filter(c => c.status === "active").map(competition => (
                            <div key={competition.id} className="flex items-center justify-between p-2 border rounded bg-blue-50">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{COMPETITION_TYPES[competition.type].emoji}</span>
                                <div>
                                  <div className="text-sm font-medium">{competition.name}</div>
                                  <div className="text-xs text-gray-600">
                                    Participants: {competition.participants.length} • Your Score: {competition.scores[currentPlayerId] || 0}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.max(0, Math.floor((competition.endTime - Date.now()) / 1000))}s left
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Leaderboards */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Leaderboards</h4>
                    <Tabs defaultValue="harvest" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="harvest">🌾 Harvest</TabsTrigger>
                        <TabsTrigger value="coins">💰 Coins</TabsTrigger>
                        <TabsTrigger value="reputation">⭐ Rep</TabsTrigger>
                        <TabsTrigger value="level">📈 Level</TabsTrigger>
                      </TabsList>

                      <TabsContent value="harvest">
                        <div className="space-y-1 mt-2">
                          {leaderboards.harvest.slice(0, 5).map((entry, index) => (
                            <div key={entry.id} className={`flex justify-between p-2 rounded text-sm ${
                              entry.id === currentPlayerId ? 'bg-blue-100' : 'bg-gray-50'
                            }`}>
                              <span>#{index + 1} {entry.id}</span>
                              <span>{entry.score} harvests</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="coins">
                        <div className="space-y-1 mt-2">
                          {leaderboards.coins.slice(0, 5).map((entry, index) => (
                            <div key={entry.id} className={`flex justify-between p-2 rounded text-sm ${
                              entry.id === currentPlayerId ? 'bg-blue-100' : 'bg-gray-50'
                            }`}>
                              <span>#{index + 1} {entry.id}</span>
                              <span>{entry.score}💰</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="reputation">
                        <div className="space-y-1 mt-2">
                          {leaderboards.reputation.slice(0, 5).map((entry, index) => (
                            <div key={entry.id} className={`flex justify-between p-2 rounded text-sm ${
                              entry.id === currentPlayerId ? 'bg-blue-100' : 'bg-gray-50'
                            }`}>
                              <span>#{index + 1} {entry.id}</span>
                              <span>{entry.score} rep</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="level">
                        <div className="space-y-1 mt-2">
                          {leaderboards.level.slice(0, 5).map((entry, index) => (
                            <div key={entry.id} className={`flex justify-between p-2 rounded text-sm ${
                              entry.id === currentPlayerId ? 'bg-blue-100' : 'bg-gray-50'
                            }`}>
                              <span>#{index + 1} {entry.id}</span>
                              <span>Level {entry.score}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Gifting System */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Send Gifts</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(GIFT_TYPES).map(([giftId, gift]) => (
                        <div key={giftId} className="p-2 border rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{gift.emoji}</span>
                            <span className="text-sm font-medium">{gift.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{gift.description}</p>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (players.length > 1) {
                                const recipient = players.find(p => p.id !== currentPlayerId);
                                if (recipient) sendGift(recipient.id, giftId);
                              }
                            }}
                            disabled={coins < gift.cost || players.length <= 1}
                            className="w-full"
                          >
                            {coins >= gift.cost ? `${gift.cost}💰` : 'No 💰'}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Received Gifts */}
                    {gifts.filter(g => g.to === currentPlayerId && !g.claimed).length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Received Gifts</h5>
                        <div className="space-y-2">
                          {gifts.filter(g => g.to === currentPlayerId && !g.claimed).map(gift => (
                            <div key={gift.id} className="flex items-center justify-between p-2 border rounded bg-green-50">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{GIFT_TYPES[gift.type].emoji}</span>
                                <div>
                                  <div className="text-sm font-medium">{GIFT_TYPES[gift.type].name}</div>
                                  <div className="text-xs text-gray-600">From: {gift.from}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => claimGift(gift.id)}
                              >
                                Claim
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Neighbors */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Neighbors ({neighbors.length})</h4>
                    <div className="space-y-2">
                      {neighbors.map(neighborId => (
                        <div key={neighborId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium">{neighborId}</span>
                            <Badge variant="outline">Neighbor</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => visitFarm(neighborId)}>
                              🏠 Visit
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Add Neighbor */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Add neighbor ID"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              addNeighbor(e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add neighbor ID"]');
                            if (input && input.value.trim()) {
                              addNeighbor(input.value.trim());
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Social Events */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Social Events</h4>
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {SOCIAL_EVENTS.map(event => (
                        <div key={event.id} className="p-2 border rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{event.emoji}</span>
                            <span className="text-sm font-medium">{event.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            Duration: {event.duration}s
                            {event.effects.reputation && ` • +${event.effects.reputation} Rep`}
                            {event.effects.coins && ` • +${event.effects.coins}💰`}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => hostSocialEvent(event.id)}
                            className="w-full"
                          >
                            Host Event
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Active Social Events */}
                    {socialEvents.filter(e => Date.now() < e.endTime).length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Active Events</h5>
                        <div className="space-y-2">
                          {socialEvents.filter(e => Date.now() < e.endTime).map(event => (
                            <div key={event.id} className="flex items-center justify-between p-2 border rounded bg-purple-50">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{SOCIAL_EVENTS.find(e => e.id === event.type)?.emoji}</span>
                                <div>
                                  <div className="text-sm font-medium">{event.name}</div>
                                  <div className="text-xs text-gray-600">
                                    Host: {event.host} • Attendees: {event.attendees.length}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.max(0, Math.floor((event.endTime - Date.now()) / 1000))}s left
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Deep Farming Mechanics */}
                <TabsContent value="farming" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🌾 Advanced Farming</h3>
                    <p className="text-sm text-gray-600">Precision agriculture and genetic engineering</p>
                  </div>

                  {/* Irrigation System */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">💧 Irrigation System</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">Water Level</div>
                        <div className="text-lg font-bold text-blue-600">{Math.round(irrigationSystem.waterLevel)}%</div>
                        <Progress value={irrigationSystem.waterLevel} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-gray-600">Efficiency</div>
                        <div className="text-lg font-bold text-green-600">{Math.round(irrigationSystem.efficiency * 100)}%</div>
                        <div className="text-xs text-gray-500">Water usage efficiency</div>
                      </div>
                    </div>

                    {/* Irrigation Upgrades */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(IRRIGATION_UPGRADES).map(([upgradeId, upgrade]) => (
                        <div key={upgradeId} className="p-2 border rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{upgrade.emoji}</span>
                            <span className="text-sm font-medium">{upgrade.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{upgrade.description}</p>
                          <div className="text-xs text-gray-500 mb-2">
                            Efficiency: {Math.round(upgrade.waterEfficiency * 100)}%
                          </div>
                          <Button
                            size="sm"
                            onClick={() => upgradeIrrigation(upgradeId)}
                            disabled={coins < upgrade.cost || irrigationSystem.enabled}
                            className="w-full"
                          >
                            {coins >= upgrade.cost ? `${upgrade.cost}💰` : 'No 💰'}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Auto Water Toggle */}
                    {irrigationSystem.enabled && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={irrigationSystem.autoWater ? "default" : "outline"}
                          onClick={() => setIrrigationSystem(prev => ({ ...prev, autoWater: !prev.autoWater }))}
                        >
                          {irrigationSystem.autoWater ? "🚿 Auto Water: ON" : "🚿 Auto Water: OFF"}
                        </Button>
                        <span className="text-xs text-gray-600">
                          Automatically waters plots when moisture is low
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Genetics Lab */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">🧬 Genetics Lab</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">Lab Level</div>
                        <div className="text-lg font-bold text-purple-600">{geneticsLab.level}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Research Points</div>
                        <div className="text-lg font-bold text-blue-600">{geneticsLab.researchPoints}</div>
                        <Button
                          size="sm"
                          onClick={() => setGeneticsLab(prev => ({ ...prev, researchPoints: prev.researchPoints + 10 }))}
                          className="mt-1"
                        >
                          +10 RP (Test)
                        </Button>
                      </div>
                    </div>

                    {/* Active Projects */}
                    {geneticsLab.activeProjects.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Active Projects</h5>
                        <div className="space-y-2">
                          {geneticsLab.activeProjects.map(project => (
                            <div key={project.id} className="flex items-center justify-between p-2 border rounded bg-blue-50">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{GENETICS_PROJECTS[project.id].emoji}</span>
                                <div>
                                  <div className="text-sm font-medium">{GENETICS_PROJECTS[project.id].name}</div>
                                  <div className="text-xs text-gray-600">
                                    {CROP_GENETIC_TRAITS[project.trait].name}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.max(0, Math.floor((project.endTime - Date.now()) / 1000))}s left
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Projects */}
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(GENETICS_PROJECTS).map(([projectId, project]) => {
                        const isActive = geneticsLab.activeProjects.some(p => p.id === projectId);
                        const isDiscovered = geneticsLab.discoveredTraits.includes(project.trait);

                        return (
                          <div key={projectId} className="p-2 border rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{project.emoji}</span>
                              <span className="text-sm font-medium">{project.name}</span>
                              {isDiscovered && <Badge variant="secondary">Discovered</Badge>}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                            <div className="text-xs text-gray-500 mb-2">
                              Cost: {project.cost} RP • Duration: {project.duration}s
                            </div>
                            <Button
                              size="sm"
                              onClick={() => startGeneticsProject(projectId)}
                              disabled={geneticsLab.researchPoints < project.cost || geneticsLab.level < 1 || isActive}
                              className="w-full"
                            >
                              {isActive ? "In Progress" : geneticsLab.researchPoints >= project.cost ? "Start Research" : "Need RP"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Greenhouse Climate Control */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">🌡️ Greenhouse Climate Control</h4>

                    {/* Climate Status */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">Temperature</div>
                        <div className="text-lg font-bold text-red-600">{greenhouseClimate.temperature}°C</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Humidity</div>
                        <div className="text-lg font-bold text-blue-600">{greenhouseClimate.humidity}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">CO₂ Level</div>
                        <div className="text-lg font-bold text-green-600">{greenhouseClimate.co2Level}ppm</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Lighting</div>
                        <div className="text-lg font-bold text-yellow-600">{greenhouseClimate.lighting}</div>
                      </div>
                    </div>

                    {/* Climate Controls */}
                    {greenhouseClimate.climateControl ? (
                      <div className="space-y-3">
                        {/* Temperature Control */}
                        <div>
                          <label className="text-sm font-medium">Temperature (°C)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              onClick={() => adjustClimate('temperature', greenhouseClimate.temperature - 1)}
                            >
                              -
                            </Button>
                            <Input
                              type="range"
                              min="0"
                              max="40"
                              value={greenhouseClimate.temperature}
                              onChange={(e) => adjustClimate('temperature', parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => adjustClimate('temperature', greenhouseClimate.temperature + 1)}
                            >
                              +
                            </Button>
                            <span className="text-sm w-12">{greenhouseClimate.temperature}°C</span>
                          </div>
                        </div>

                        {/* Humidity Control */}
                        <div>
                          <label className="text-sm font-medium">Humidity (%)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              onClick={() => adjustClimate('humidity', greenhouseClimate.humidity - 5)}
                            >
                              -
                            </Button>
                            <Input
                              type="range"
                              min="0"
                              max="100"
                              value={greenhouseClimate.humidity}
                              onChange={(e) => adjustClimate('humidity', parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => adjustClimate('humidity', greenhouseClimate.humidity + 5)}
                            >
                              +
                            </Button>
                            <span className="text-sm w-12">{greenhouseClimate.humidity}%</span>
                          </div>
                        </div>

                        {/* Lighting Control */}
                        <div>
                          <label className="text-sm font-medium">Lighting</label>
                          <div className="flex gap-2 mt-1">
                            {["natural", "artificial", "supplemental"].map(option => (
                              <Button
                                key={option}
                                size="sm"
                                variant={greenhouseClimate.lighting === option ? "default" : "outline"}
                                onClick={() => setGreenhouseClimate(prev => ({ ...prev, lighting: option }))}
                              >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Climate control not enabled</p>
                        <Button
                          onClick={() => setGreenhouseClimate(prev => ({ ...prev, climateControl: true }))}
                        >
                          Enable Climate Control (500💰)
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Plot Conditions */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">🌱 Plot Conditions</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {plots.map((plot, i) => {
                        const conditions = plotConditions[i];
                        if (!plot.seed) return null;

                        return (
                          <div key={i} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{plot.seed ? DEFAULT_RULES.seeds[plot.seed].emoji : "🟫"}</span>
                              <div>
                                <div className="text-sm font-medium">Plot {i + 1}</div>
                                <div className="text-xs text-gray-600">{plot.seed ? DEFAULT_RULES.seeds[plot.seed].name : "Empty"}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <div>
                                <div className="text-gray-600">Moisture</div>
                                <div className="font-medium">{Math.round(conditions?.moisture || 50)}%</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Climate Bonus</div>
                                <div className="font-medium">{Math.round(getClimateBonus(i) * 100)}%</div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => waterPlot(i)}
                                disabled={!irrigationSystem.enabled}
                              >
                                💧 Water
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced Automation */}
                <TabsContent value="automation" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">🤖 Advanced Automation</h3>
                    <p className="text-sm text-gray-600">AI-powered farm management and smart scheduling</p>
                  </div>

                  {/* Farm AI */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">🧠 Farm AI Assistant</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">AI Status</div>
                        <div className="text-lg font-bold text-blue-600">
                          {farmAI.enabled ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Optimization Level</div>
                        <div className="text-lg font-bold text-green-600">{farmAI.optimizationLevel}</div>
                      </div>
                    </div>

                    {/* AI Controls */}
                    <div className="space-y-2 mb-4">
                      <Button
                        onClick={() => setFarmAI(prev => ({ ...prev, enabled: !prev.enabled }))}
                        variant={farmAI.enabled ? "default" : "outline"}
                        className="w-full"
                      >
                        {farmAI.enabled ? "🤖 AI Active" : "🤖 Enable AI Assistant"}
                      </Button>

                      {farmAI.enabled && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium">AI Personality</label>
                          <select
                            className="w-full border rounded p-2 text-sm"
                            onChange={(e) => {
                              const personality = AI_PERSONALITIES[e.target.value];
                              if (personality) {
                                setFarmAI(prev => ({
                                  ...prev,
                                  personality: e.target.value,
                                  riskTolerance: personality.riskTolerance,
                                  efficiencyFocus: personality.efficiencyFocus,
                                  innovation: personality.innovation
                                }));
                              }
                            }}
                          >
                            {Object.entries(AI_PERSONALITIES).map(([key, personality]) => (
                              <option key={key} value={key}>
                                {key.charAt(0).toUpperCase() + key.slice(1)} - Risk: {personality.riskTolerance}, Efficiency: {personality.efficiencyFocus}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* AI Recommendations */}
                    {farmAI.enabled && farmAI.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">AI Recommendations</h5>
                        <div className="space-y-1">
                          {farmAI.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auto Scheduler */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">📅 Auto Scheduler</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">Status</div>
                        <div className="text-lg font-bold text-purple-600">
                          {autoScheduler.enabled ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Efficiency</div>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(autoScheduler.efficiency * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Scheduler Controls */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => setAutoScheduler(prev => ({ ...prev, enabled: !prev.enabled }))}
                        variant={autoScheduler.enabled ? "default" : "outline"}
                        className="w-full"
                      >
                        {autoScheduler.enabled ? "📅 Scheduler Active" : "📅 Enable Auto Scheduler"}
                      </Button>

                      <Button
                        onClick={createSmartSchedule}
                        disabled={!autoScheduler.enabled}
                        variant="outline"
                        className="w-full"
                      >
                        🎯 Generate Smart Schedule
                      </Button>
                    </div>

                    {/* Schedule Display */}
                    {autoScheduler.enabled && Object.keys(autoScheduler.schedule).length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Current Schedule</h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(autoScheduler.schedule).map(([plotIndex, action]) => (
                            <div key={plotIndex} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                              <span>Plot {parseInt(plotIndex) + 1}</span>
                              <span>{action.action} {action.crop || ''}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                action.priority > 7 ? 'bg-green-100 text-green-800' :
                                action.priority > 4 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                Priority: {action.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Smart Optimization */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">🎯 Smart Optimization</h4>

                    {/* Optimization Strategies */}
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-medium">Optimization Strategy</label>
                      <select
                        className="w-full border rounded p-2 text-sm"
                        onChange={(e) => {
                          const strategy = OPTIMIZATION_STRATEGIES[e.target.value];
                          if (strategy) {
                            setSmartOptimization(prev => ({
                              ...prev,
                              currentStrategy: e.target.value,
                              strategyWeight: strategy.weight
                            }));
                          }
                        }}
                      >
                        {Object.entries(OPTIMIZATION_STRATEGIES).map(([key, strategy]) => (
                          <option key={key} value={key}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - {strategy.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Optimization Controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={optimizeResourceAllocation}
                        variant="outline"
                        size="sm"
                      >
                        💧 Optimize Resources
                      </Button>
                      <Button
                        onClick={generateAIPredictions}
                        variant="outline"
                        size="sm"
                      >
                        📊 Generate Predictions
                      </Button>
                    </div>

                    {/* Performance Metrics */}
                    {smartOptimization.performanceMetrics && Object.keys(smartOptimization.performanceMetrics).length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Performance Metrics</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(smartOptimization.performanceMetrics).map(([metric, value]) => (
                            <div key={metric} className="p-2 bg-gray-50 rounded">
                              <div className="text-gray-600">{metric.replace(/_/g, ' ')}</div>
                              <div className="font-bold">{typeof value === 'number' ? Math.round(value * 100) + '%' : value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Automation Summary */}
                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="font-medium mb-2">Automation Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Systems Active</div>
                        <div className="text-lg font-bold text-blue-600">
                          {[farmAI.enabled, autoScheduler.enabled, smartOptimization.currentStrategy].filter(Boolean).length}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Efficiency Bonus</div>
                        <div className="text-lg font-bold text-green-600">
                          +{Math.round(((farmAI.enabled ? 0.1 : 0) + (autoScheduler.enabled ? autoScheduler.efficiency - 0.8 : 0)) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Mini-Games */}
                <TabsContent value="minigames" className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded border">
                    <h3 className="font-medium">🎮 Mini-Games</h3>
                    <p className="text-sm text-gray-600">Fun arcade-style farming games and challenges</p>
                  </div>

                  {/* Active Game Display */}
                  {miniGames.currentGame && (
                    <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
                      <h4 className="font-medium mb-2">🎯 Active Game: {miniGames.currentGame}</h4>

                      {/* Harvest Rush Game */}
                      {miniGames.currentGame === "harvestRush" && miniGames.gameState && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Time Left</div>
                              <div className="text-2xl font-bold text-red-600">{miniGames.gameState.timeLeft}s</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Score</div>
                              <div className="text-2xl font-bold text-green-600">{miniGames.gameState.score}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Combo</div>
                              <div className="text-xl font-bold text-blue-600">x{miniGames.gameState.combo}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Harvested</div>
                              <div className="text-xl font-bold text-purple-600">{miniGames.gameState.harvested?.size || 0}</div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium mb-2">🌾 Click ready crops quickly for combo bonuses!</h5>
                            <p className="text-sm text-gray-600">
                              Harvest crops within {HARVEST_RUSH_CONFIG.comboTimeWindow} seconds of each other for {HARVEST_RUSH_CONFIG.comboMultiplier}x multiplier!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Market Trader Game */}
                      {miniGames.currentGame === "marketTrader" && miniGames.gameState && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Time Left</div>
                              <div className="text-2xl font-bold text-red-600">{miniGames.gameState.timeLeft}s</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Cash</div>
                              <div className="text-2xl font-bold text-green-600">${miniGames.gameState.cash}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Portfolio Value</div>
                              <div className="text-xl font-bold text-blue-600">
                                ${Object.entries(miniGames.gameState.portfolio || {}).reduce((sum, [crop, amount]) =>
                                  sum + (miniGames.gameState.prices?.[crop] || 0) * amount, 0).toFixed(0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Trades</div>
                              <div className="text-xl font-bold text-purple-600">{miniGames.marketTrader.trades}</div>
                            </div>
                          </div>

                          {/* Commodity Prices */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium mb-2">📈 Commodity Prices</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {MARKET_TRADER_CONFIG.commodities.map(crop => (
                                <div key={crop} className="flex justify-between p-2 bg-gray-50 rounded">
                                  <span className="capitalize">{crop}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold">${miniGames.gameState.prices?.[crop]?.toFixed(1) || 0}</span>
                                    <div className="flex space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateMiniGame("marketTrader", "buy", { crop, amount: 1 })}
                                        disabled={!miniGames.gameState.prices || miniGames.gameState.cash < miniGames.gameState.prices[crop] * (1 + MARKET_TRADER_CONFIG.transactionFee)}
                                      >
                                        Buy
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateMiniGame("marketTrader", "sell", { crop, amount: 1 })}
                                        disabled={!miniGames.gameState.portfolio || !miniGames.gameState.portfolio[crop]}
                                      >
                                        Sell
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Portfolio */}
                          {Object.keys(miniGames.gameState.portfolio || {}).length > 0 && (
                            <div className="bg-white p-3 rounded border">
                              <h5 className="font-medium mb-2">📊 Your Portfolio</h5>
                              <div className="space-y-1 text-sm">
                                {Object.entries(miniGames.gameState.portfolio).map(([crop, amount]) => (
                                  <div key={crop} className="flex justify-between">
                                    <span className="capitalize">{crop}</span>
                                    <span>{amount} units @ ${miniGames.gameState.prices[crop].toFixed(1)} = ${(amount * miniGames.gameState.prices[crop]).toFixed(0)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Puzzle Farming Game */}
                      {miniGames.currentGame === "puzzleFarming" && miniGames.gameState && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Time Left</div>
                              <div className="text-2xl font-bold text-red-600">{miniGames.gameState.timeLeft}s</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Score</div>
                              <div className="text-2xl font-bold text-green-600">{miniGames.gameState.score}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Moves</div>
                              <div className="text-xl font-bold text-blue-600">{miniGames.gameState.moves || 0}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Level</div>
                              <div className="text-xl font-bold text-purple-600">{miniGames.puzzleFarming.level}</div>
                            </div>
                          </div>

                          {/* Puzzle Grid */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium mb-2">🧩 Match 3 or more crops!</h5>
                            <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto">
                              {miniGames.gameState.grid?.map((row, rowIndex) =>
                                row.map((crop, colIndex) => (
                                  <Button
                                    key={`${rowIndex}-${colIndex}`}
                                    variant="outline"
                                    size="sm"
                                    className={`w-10 h-10 p-0 text-lg ${
                                      miniGames.gameState.selected?.row === rowIndex && miniGames.gameState.selected?.col === colIndex
                                        ? 'ring-2 ring-blue-500 bg-blue-100'
                                        : ''
                                    }`}
                                    onClick={() => {
                                      if (miniGames.gameState.selected) {
                                        // Swap pieces
                                        updateMiniGame("puzzleFarming", "swap", {
                                          from: miniGames.gameState.selected,
                                          to: { row: rowIndex, col: colIndex }
                                        });
                                        setMiniGames(prev => ({
                                          ...prev,
                                          gameState: { ...prev.gameState, selected: null }
                                        }));
                                      } else {
                                        // Select piece
                                        setMiniGames(prev => ({
                                          ...prev,
                                          gameState: { ...prev.gameState, selected: { row: rowIndex, col: colIndex } }
                                        }));
                                      }
                                    }}
                                    disabled={!crop}
                                  >
                                    {crop ? DEFAULT_RULES.seeds[crop]?.emoji || crop : ''}
                                  </Button>
                                ))
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center">
                              Click a crop to select, then click another to swap. Match 3+ in a row or column!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Button
                          onClick={() => {
                            setMiniGames(prev => ({ ...prev, currentGame: null, gameState: {} }));
                            addNotification("Game ended early", "info");
                          }}
                          variant="outline"
                        >
                          End Game Early
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Game Selection */}
                  {!miniGames.currentGame && (
                    <div className="space-y-4">
                      {/* Harvest Rush */}
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-lg">🌾 Harvest Rush</h4>
                            <p className="text-sm text-gray-600">Fast-paced harvesting with combo bonuses!</p>
                          </div>
                          <Button
                            onClick={() => startMiniGame("harvestRush")}
                            disabled={!miniGames.harvestRush.unlocked}
                          >
                            Play Now
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">High Score</div>
                            <div className="font-bold text-green-600">{miniGames.harvestRush.highScore}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Best Combo</div>
                            <div className="font-bold text-blue-600">x{miniGames.harvestRush.bestCombo}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Games Played</div>
                            <div className="font-bold text-purple-600">{miniGames.harvestRush.gamesPlayed}</div>
                          </div>
                        </div>
                      </div>

                      {/* Market Trader */}
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-lg">📈 Market Trader</h4>
                            <p className="text-sm text-gray-600">Stock market simulation with crop commodities</p>
                            {!miniGames.marketTrader.unlocked && (
                              <p className="text-xs text-orange-600 mt-1">🔒 Unlock at level 5</p>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              if (!miniGames.marketTrader.unlocked) {
                                unlockMiniGame("marketTrader");
                              } else {
                                startMiniGame("marketTrader");
                              }
                            }}
                          >
                            {!miniGames.marketTrader.unlocked ? "Unlock" : "Play Now"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Total Profit</div>
                            <div className="font-bold text-green-600">${miniGames.marketTrader.profit}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Win Rate</div>
                            <div className="font-bold text-blue-600">{(miniGames.marketTrader.winRate * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Trades</div>
                            <div className="font-bold text-purple-600">{miniGames.marketTrader.trades}</div>
                          </div>
                        </div>
                      </div>

                      {/* Puzzle Farming */}
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-lg">🧩 Puzzle Farming</h4>
                            <p className="text-sm text-gray-600">Match-3 puzzle game with crop swapping</p>
                            {!miniGames.puzzleFarming.unlocked && (
                              <p className="text-xs text-orange-600 mt-1">🔒 Unlock at level 10</p>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              if (!miniGames.puzzleFarming.unlocked) {
                                unlockMiniGame("puzzleFarming");
                              } else {
                                startMiniGame("puzzleFarming");
                              }
                            }}
                          >
                            {!miniGames.puzzleFarming.unlocked ? "Unlock" : "Play Now"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">High Score</div>
                            <div className="font-bold text-green-600">{miniGames.puzzleFarming.score}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Puzzles Solved</div>
                            <div className="font-bold text-blue-600">{miniGames.puzzleFarming.puzzlesSolved}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Level</div>
                            <div className="font-bold text-purple-600">{miniGames.puzzleFarming.level}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mini-Games Summary */}
                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="font-medium mb-2">📊 Mini-Games Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Games Unlocked</div>
                        <div className="text-lg font-bold text-blue-600">
                          {[miniGames.harvestRush.unlocked, miniGames.marketTrader.unlocked, miniGames.puzzleFarming.unlocked].filter(Boolean).length}/3
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Games Played</div>
                        <div className="text-lg font-bold text-green-600">
                          {miniGames.harvestRush.gamesPlayed + miniGames.marketTrader.trades + miniGames.puzzleFarming.puzzlesSolved}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Global Marketplace */}
                <TabsContent value="marketplace" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🌍 Global Marketplace</h3>
                    <p className="text-sm text-gray-600">Trade crops, items, and commodities with other players</p>
                  </div>

                  {/* Market Status */}
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Market Status</h4>
                      {!globalMarket.marketEnabled && (
                        <Button onClick={initializeMarketplace} variant="outline" size="sm">
                          🌍 Enable Marketplace
                        </Button>
                      )}
                    </div>

                    {globalMarket.marketEnabled && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Player ID</div>
                          <div className="text-blue-600 font-mono text-xs">{globalMarket.playerId}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Reputation</div>
                          <div className="text-lg font-bold text-green-600">{globalMarket.marketStats.reputation}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total Trades</div>
                          <div className="text-lg font-bold text-purple-600">{globalMarket.marketStats.totalTrades}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Trading Volume</div>
                          <div className="text-lg font-bold text-blue-600">${globalMarket.marketStats.totalVolume}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commodity Exchange */}
                  {globalMarket.marketEnabled && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">📈 Commodity Exchange</h4>

                      {/* Price Table */}
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                        {Object.entries(DEFAULT_RULES.seeds).map(([crop, data]) => {
                          const currentPrice = globalMarket.commodityExchange.prices[crop] || data.baseValue;
                          const volume = globalMarket.commodityExchange.volume[crop] || 0;
                          const inInventory = inventory[crop] || 0;

                          return (
                            <div key={crop} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{data.emoji}</span>
                                <div>
                                  <div className="font-medium capitalize">{crop}</div>
                                  <div className="text-xs text-gray-600">Vol: {volume}</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="font-bold text-green-600">${currentPrice}</div>
                                  <div className="text-xs text-gray-600">Inv: {inInventory}</div>
                                </div>

                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => buyCommodity(crop, 1)}
                                    disabled={coins < currentPrice * 1.05}
                                  >
                                    Buy 1
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sellCommodity(crop, 1)}
                                    disabled={inInventory < 1}
                                  >
                                    Sell 1
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <Button
                          onClick={() => {
                            Object.keys(DEFAULT_RULES.seeds).forEach(crop => {
                              const inInventory = inventory[crop] || 0;
                              if (inInventory > 0) sellCommodity(crop, inInventory);
                            });
                          }}
                          variant="outline"
                          size="sm"
                        >
                          📉 Sell All Crops
                        </Button>
                        <Button
                          onClick={updateCommodityPrices}
                          variant="outline"
                          size="sm"
                        >
                          🔄 Refresh Prices
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Player Listings */}
                  {globalMarket.marketEnabled && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">📦 Your Listings</h4>

                      {globalMarket.playerListings.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          No active listings
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {globalMarket.playerListings.map(listing => (
                            <div key={listing.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{listing.quantity}x {listing.itemName}</div>
                                <div className="text-sm text-gray-600">{listing.tradeType} - ${listing.price}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => executeTrade(listing.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Create Listing */}
                      <div className="border-t pt-3 mt-3">
                        <h5 className="font-medium mb-2">Create New Listing</h5>
                        <div className="grid grid-cols-3 gap-2">
                          <select className="border rounded p-2 text-sm">
                            {Object.keys(inventory).filter(item => (inventory[item] || 0) > 0).map(item => (
                              <option key={item} value={item}>{item} ({inventory[item]})</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Quantity"
                            className="border rounded p-2 text-sm"
                            min="1"
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            className="border rounded p-2 text-sm"
                            min="1"
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <Button
                            onClick={() => {
                              const select = document.querySelector('select');
                              const inputs = document.querySelectorAll('input[type="number"]');
                              if (select.value && inputs[0].value && inputs[1].value) {
                                createTradeListing('crop', select.value, parseInt(inputs[0].value), parseInt(inputs[1].value));
                                inputs[0].value = '';
                                inputs[1].value = '';
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            📦 List for Sale
                          </Button>
                          <Button
                            onClick={() => {
                              const select = document.querySelector('select');
                              const inputs = document.querySelectorAll('input[type="number"]');
                              if (select.value && inputs[0].value && inputs[1].value) {
                                createAuctionListing('crop', select.value, parseInt(inputs[0].value), parseInt(inputs[1].value));
                                inputs[0].value = '';
                                inputs[1].value = '';
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            🏛️ Create Auction
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auction House */}
                  {globalMarket.marketEnabled && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">🏛️ Auction House</h4>

                      {globalMarket.auctionHouse.items.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          No active auctions
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {globalMarket.auctionHouse.items.map(auction => (
                            <div key={auction.id} className="p-2 bg-gray-50 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium">{auction.quantity}x {auction.itemName}</div>
                                  <div className="text-sm text-gray-600">Seller: {auction.sellerId.slice(0, 8)}...</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-600">${auction.currentBid}</div>
                                  <div className="text-xs text-gray-600">Buyout: ${auction.buyoutPrice || 'None'}</div>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  placeholder="Your bid"
                                  className="flex-1 border rounded p-1 text-sm"
                                  min={auction.currentBid + 1}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const input = event.target.previousElementSibling;
                                    if (input.value) {
                                      placeBid(auction.id, parseInt(input.value));
                                      input.value = '';
                                    }
                                  }}
                                >
                                  💰 Bid
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Market Statistics */}
                  {globalMarket.marketEnabled && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">📊 Market Statistics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Active Listings</div>
                          <div className="text-lg font-bold text-blue-600">{globalMarket.playerListings.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Active Auctions</div>
                          <div className="text-lg font-bold text-purple-600">{globalMarket.auctionHouse.items.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Market Fee Rate</div>
                          <div className="text-lg font-bold text-red-600">{(MARKETPLACE_CONFIG.tradeFee * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Weather Disasters */}
                <TabsContent value="disasters" className="space-y-3">
                  <div className="bg-red-50 p-3 rounded border">
                    <h3 className="font-medium">🌪️ Weather Disasters</h3>
                    <p className="text-sm text-gray-600">Protect your farm from extreme weather events</p>
                  </div>

                  {/* Active Disaster Alert */}
                  {weatherDisasters.activeDisaster && (
                    <div className="bg-red-100 border border-red-300 p-4 rounded">
                      <h4 className="font-medium text-red-800 mb-2">
                        🚨 {DISASTER_TYPES[weatherDisasters.activeDisaster.type].name} Active!
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-600">Severity</div>
                          <div className="font-bold text-red-600">
                            {Math.round(weatherDisasters.activeDisaster.severity * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Time Remaining</div>
                          <div className="font-bold text-red-600">
                            {Math.max(0, Math.round(weatherDisasters.activeDisaster.duration - (Date.now() - weatherDisasters.activeDisaster.startTime) / 1000))}s
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Plots Affected</div>
                          <div className="font-bold text-red-600">
                            {weatherDisasters.activeDisaster.affectedPlots.size}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Protection</div>
                          <div className="font-bold text-green-600">
                            {Math.round(checkDisasterPreparation(weatherDisasters.activeDisaster.type) * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 bg-white p-2 rounded">
                        {DISASTER_TYPES[weatherDisasters.activeDisaster.type].description}
                      </div>
                    </div>
                  )}

                  {/* Disaster Forecast */}
                  {weatherDisasters.disasterForecast.nextDisaster && !weatherDisasters.activeDisaster && (
                    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded">
                      <h4 className="font-medium text-yellow-800 mb-2">🌦️ Weather Forecast</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Next Disaster</div>
                          <div className="font-bold text-yellow-600">
                            {DISASTER_TYPES[weatherDisasters.disasterForecast.nextDisaster].name}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Time Until</div>
                          <div className="font-bold text-yellow-600">
                            {Math.floor(weatherDisasters.disasterForecast.timeUntilNext / 60)}:{(weatherDisasters.disasterForecast.timeUntilNext % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Severity</div>
                          <div className="font-bold text-yellow-600">
                            {Math.round(weatherDisasters.disasterForecast.severity * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Preparation</div>
                          <div className="font-bold text-green-600">
                            {Math.round(checkDisasterPreparation(weatherDisasters.disasterForecast.nextDisaster) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disaster Preparation */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🛡️ Disaster Preparation</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(DISASTER_PREPARATION).map(([key, prep]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{prep.name}</div>
                            <div className="text-sm text-gray-600">{prep.description}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              <div className="text-gray-600">Cost: {prep.cost}💰</div>
                              <div className="text-green-600">+{Math.round(prep.effectiveness * 100)}% protection</div>
                            </div>
                            <Button
                              size="sm"
                              variant={weatherDisasters.disasterPreparation[key] ? "secondary" : "outline"}
                              onClick={() => purchaseDisasterPreparation(key)}
                              disabled={weatherDisasters.disasterPreparation[key] || coins < prep.cost}
                            >
                              {weatherDisasters.disasterPreparation[key] ? "✅ Owned" : "Buy"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">📋 Crop Insurance</h4>

                    {weatherDisasters.insurance.enabled ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Coverage</div>
                            <div className="font-bold text-green-600">{Math.round(weatherDisasters.insurance.coverage * 100)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Claims Available</div>
                            <div className="font-bold text-blue-600">{weatherDisasters.insurance.claimsAvailable}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Monthly Premium</div>
                            <div className="font-bold text-red-600">{weatherDisasters.insurance.premium}💰</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Status</div>
                            <div className="font-bold text-green-600">Active</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">Protect your crops from disaster damage with insurance coverage.</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(INSURANCE_TYPES).map(([key, insurance]) => (
                            <div key={key} className="p-2 bg-gray-50 rounded">
                              <div className="font-medium">{insurance.name}</div>
                              <div className="text-sm text-gray-600 mb-2">{insurance.description}</div>
                              <div className="text-sm">
                                <div className="text-gray-600">Cost: {insurance.cost}💰</div>
                                <div className="text-green-600">Coverage: {Math.round(insurance.coverage * 100)}%</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => purchaseInsurance(key)}
                                disabled={coins < insurance.cost}
                                className="w-full mt-2"
                              >
                                Purchase
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recovery & Repairs */}
                  {weatherDisasters.recoveryStatus.damagedPlots.size > 0 && (
                    <div className="bg-orange-50 border border-orange-300 p-4 rounded">
                      <h4 className="font-medium text-orange-800 mb-2">🔧 Recovery Required</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-600">Damaged Plots</div>
                          <div className="font-bold text-orange-600">{weatherDisasters.recoveryStatus.damagedPlots.size}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Repair Cost</div>
                          <div className="font-bold text-red-600">{weatherDisasters.recoveryStatus.damagedPlots.size * 25}💰</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Insurance Claim</div>
                          <div className="font-bold text-green-600">{weatherDisasters.recoveryStatus.insuranceClaim}💰</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Net Cost</div>
                          <div className="font-bold text-blue-600">
                            {Math.max(0, weatherDisasters.recoveryStatus.damagedPlots.size * 25 - weatherDisasters.recoveryStatus.insuranceClaim)}💰
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={repairDamagedPlots}
                          disabled={coins < weatherDisasters.recoveryStatus.damagedPlots.size * 25 - weatherDisasters.recoveryStatus.insuranceClaim}
                          className="flex-1"
                        >
                          🔧 Repair All ({weatherDisasters.recoveryStatus.damagedPlots.size * 25 - weatherDisasters.recoveryStatus.insuranceClaim}💰)
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Disaster History */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">📊 Disaster History</h4>

                    {weatherDisasters.disasterHistory.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No disasters recorded yet
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {weatherDisasters.disasterHistory.slice(-5).reverse().map((disaster, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{DISASTER_TYPES[disaster.type].emoji}</span>
                              <div>
                                <div className="font-medium">{DISASTER_TYPES[disaster.type].name}</div>
                                <div className="text-gray-600">{new Date(disaster.timestamp).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-600">{disaster.plotsAffected} plots</div>
                              <div className="text-gray-600">{Math.round(disaster.damage * 100)}% damage</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Disaster Statistics */}
                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="font-medium mb-2">📈 Disaster Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Total Disasters</div>
                        <div className="text-lg font-bold text-red-600">{weatherDisasters.disasterHistory.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Plots Lost</div>
                        <div className="text-lg font-bold text-orange-600">
                          {weatherDisasters.disasterHistory.reduce((sum, d) => sum + d.plotsAffected, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Insurance Claims</div>
                        <div className="text-lg font-bold text-green-600">
                          {weatherDisasters.disasterHistory.length - weatherDisasters.insurance.claimsAvailable}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Education System */}
                <TabsContent value="education" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">🎓 Education System</h3>
                    <p className="text-sm text-gray-600">Learn advanced farming skills and earn certifications</p>
                  </div>

                  {/* Education Status */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">Education Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Current School</div>
                        <div className="font-bold text-blue-600">
                          {educationSystem.currentSchool ? FARMING_SCHOOLS[educationSystem.currentSchool].name : "None"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Courses Completed</div>
                        <div className="font-bold text-green-600">{educationSystem.completedCourses.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Certifications</div>
                        <div className="font-bold text-purple-600">{educationSystem.certifications.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Knowledge Shared</div>
                        <div className="font-bold text-orange-600">{educationSystem.knowledgeShared.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* School Selection */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🏫 Choose Your School</h4>
                    <div className="space-y-3">
                      {Object.entries(FARMING_SCHOOLS).map(([schoolKey, school]) => (
                        <div key={schoolKey} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">{school.name}</h5>
                              <p className="text-sm text-gray-600">{school.description}</p>
                              <p className="text-xs text-orange-600 mt-1">
                                Requires level {school.levelRequirement}
                              </p>
                            </div>
                            <Button
                              onClick={() => enrollInSchool(schoolKey)}
                              disabled={level < school.levelRequirement || educationSystem.currentSchool === schoolKey}
                              variant={educationSystem.currentSchool === schoolKey ? "secondary" : "outline"}
                            >
                              {educationSystem.currentSchool === schoolKey ? "Enrolled" : "Enroll"}
                            </Button>
                          </div>
                          <div className="text-sm">
                            <div className="text-gray-600">Available Courses:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {school.courses.map(courseId => {
                                const course = COURSE_CATALOG[courseId];
                                const isCompleted = educationSystem.completedCourses.has(courseId);
                                const isEnrolled = educationSystem.enrolledCourses.has(courseId);

                                return (
                                  <span
                                    key={courseId}
                                    className={`px-2 py-1 rounded text-xs ${
                                      isCompleted
                                        ? 'bg-green-100 text-green-800'
                                        : isEnrolled
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {course.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Enrollment */}
                  {educationSystem.currentSchool && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">📚 Available Courses</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {FARMING_SCHOOLS[educationSystem.currentSchool].courses.map(courseId => {
                          const course = COURSE_CATALOG[courseId];
                          const isCompleted = educationSystem.completedCourses.has(courseId);
                          const isEnrolled = educationSystem.enrolledCourses.has(courseId);
                          const canEnroll = course.prerequisites.every(prereq => educationSystem.completedCourses.has(prereq));

                          return (
                            <div key={courseId} className="p-3 bg-gray-50 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium">{course.name}</h5>
                                  <p className="text-sm text-gray-600">{course.description}</p>
                                  <div className="flex items-center gap-4 mt-1 text-xs">
                                    <span className="text-gray-600">Duration: {course.duration}s</span>
                                    <span className="text-gray-600">Cost: {course.cost}💰</span>
                                    <span className="text-green-600">+{course.rewards.experience} XP</span>
                                    <span className="text-blue-600">+{course.rewards.skillPoints} SP</span>
                                  </div>
                                  {course.prerequisites.length > 0 && (
                                    <div className="mt-1">
                                      <div className="text-xs text-gray-600">Prerequisites:</div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {course.prerequisites.map(prereq => (
                                          <span
                                            key={prereq}
                                            className={`px-2 py-1 rounded text-xs ${
                                              educationSystem.completedCourses.has(prereq)
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                          >
                                            {COURSE_CATALOG[prereq].name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  onClick={() => startCourse(courseId)}
                                  disabled={isCompleted || isEnrolled || !canEnroll || coins < course.cost}
                                  variant={isCompleted ? "secondary" : isEnrolled ? "default" : "outline"}
                                  size="sm"
                                >
                                  {isCompleted ? "✅ Completed" : isEnrolled ? "In Progress" : "Enroll"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Skill Trees */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🌳 Skill Trees</h4>
                    <div className="space-y-4">
                      {Object.entries(SKILL_TREES).map(([treeKey, tree]) => {
                        const treeData = educationSystem.skillTrees[treeKey];

                        return (
                          <div key={treeKey} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h5 className="font-medium">{tree.name}</h5>
                                <p className="text-sm text-gray-600">{tree.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">Level {treeData.level}</div>
                                <div className="text-sm text-gray-600">{treeData.experience} SP available</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(tree.skills).map(([skillKey, skill]) => {
                                const skillData = treeData.skills[skillKey] || { level: 0 };
                                const canUpgrade = skillData.level < skill.maxLevel &&
                                                 treeData.experience >= skill.cost &&
                                                 skill.prerequisites.every(prereq => (treeData.skills[prereq]?.level || 0) > 0);

                                return (
                                  <div key={skillKey} className="flex justify-between items-center p-2 bg-white rounded">
                                    <div>
                                      <div className="font-medium">{skill.name}</div>
                                      <div className="text-sm text-gray-600">{skill.description}</div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Level {skillData.level}/{skill.maxLevel} • Cost: {skill.cost} SP
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => upgradeSkill(treeKey, skillKey)}
                                      disabled={!canUpgrade}
                                      variant="outline"
                                      size="sm"
                                    >
                                      {skillData.level >= skill.maxLevel ? "Max Level" : `Upgrade (${skill.cost} SP)`}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🏆 Certifications</h4>

                    {educationSystem.certifications.size === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No certifications earned yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {Array.from(educationSystem.certifications).map(certId => {
                          const cert = CERTIFICATIONS[certId];

                          return (
                            <div key={certId} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-yellow-800">{cert.name}</h5>
                                  <p className="text-sm text-yellow-700">{cert.description}</p>
                                  <div className="mt-2 space-y-1">
                                    {cert.rewards.reputation && (
                                      <div className="text-sm text-green-600">+{cert.rewards.reputation} Reputation</div>
                                    )}
                                    {cert.rewards.yieldBonus && (
                                      <div className="text-sm text-blue-600">+{Math.round(cert.rewards.yieldBonus * 100)}% Yield</div>
                                    )}
                                    {cert.rewards.title && (
                                      <div className="text-sm text-purple-600">Title: {cert.rewards.title}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-2xl">🏆</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Available Certifications */}
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Available Certifications</h5>
                      <div className="space-y-2">
                        {Object.entries(CERTIFICATIONS).filter(([certId]) => !educationSystem.certifications.has(certId)).map(([certId, cert]) => {
                          const hasAllRequirements = cert.requirements.every(req => educationSystem.completedCourses.has(req));

                          return (
                            <div key={certId} className={`p-2 rounded ${hasAllRequirements ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-medium">{cert.name}</h6>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Requirements: {cert.requirements.map(req => COURSE_CATALOG[req].name).join(', ')}
                                  </div>
                                </div>
                                <div className={`text-sm ${hasAllRequirements ? 'text-green-600' : 'text-gray-500'}`}>
                                  {hasAllRequirements ? 'Ready!' : 'In Progress'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Knowledge Sharing */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">📚 Knowledge Sharing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Share your farming knowledge with the community to earn reputation and experience.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => shareKnowledge("farming_tips")}
                        variant="outline"
                      >
                        🌾 Share Farming Tips
                      </Button>
                      <Button
                        onClick={() => shareKnowledge("best_practices")}
                        variant="outline"
                      >
                        📋 Share Best Practices
                      </Button>
                      <Button
                        onClick={() => shareKnowledge("research_findings")}
                        variant="outline"
                      >
                        🔬 Share Research
                      </Button>
                      <Button
                        onClick={() => shareKnowledge("success_stories")}
                        variant="outline"
                      >
                        📖 Share Success Stories
                      </Button>
                    </div>

                    {educationSystem.knowledgeShared.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Recent Shares</h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {educationSystem.knowledgeShared.slice(-3).reverse().map((share, index) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="font-medium capitalize">{share.type.replace('_', ' ')}</div>
                              <div className="text-gray-600">
                                {new Date(share.timestamp).toLocaleDateString()} • Value: {share.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Education Statistics */}
                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="font-medium mb-2">📊 Education Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Total Experience</div>
                        <div className="text-lg font-bold text-blue-600">
                          {Object.values(educationSystem.skillTrees).reduce((sum, tree) => sum + tree.experience, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Skill Trees</div>
                        <div className="text-lg font-bold text-green-600">
                          {Object.values(educationSystem.skillTrees).filter(tree => tree.level > 1).length}/4
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Research Projects</div>
                        <div className="text-lg font-bold text-purple-600">
                          {educationSystem.researchProjects.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Academic Achievements</div>
                        <div className="text-lg font-bold text-orange-600">
                          {educationSystem.academicAchievements.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Sustainability System */}
                <TabsContent value="sustainability" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🌱 Sustainability System</h3>
                    <p className="text-sm text-gray-600">Monitor and improve your farm's environmental impact</p>
                  </div>

                  {/* Sustainability Overview */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">Environmental Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Sustainability Score</div>
                        <div className={`text-2xl font-bold ${
                          sustainabilitySystem.sustainabilityScore >= 90 ? 'text-green-600' :
                          sustainabilitySystem.sustainabilityScore >= 75 ? 'text-blue-600' :
                          sustainabilitySystem.sustainabilityScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {sustainabilitySystem.sustainabilityScore}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Carbon Footprint</div>
                        <div className={`text-2xl font-bold ${
                          sustainabilitySystem.carbonFootprint <= 50 ? 'text-green-600' :
                          sustainabilitySystem.carbonFootprint <= 100 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {Math.round(sustainabilitySystem.carbonFootprint)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Eco-Certifications</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {sustainabilitySystem.ecoCertifications.size}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Sustainable Practices</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Object.values(sustainabilitySystem.sustainablePractices).filter(Boolean).length}/5
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Renewable Energy */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🪫 Renewable Energy</h4>

                    {/* Energy Status */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">Energy Production</div>
                        <div className="text-lg font-bold text-green-600">
                          {sustainabilitySystem.renewableEnergy.energyProduction} kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Energy Consumption</div>
                        <div className="text-lg font-bold text-red-600">
                          {Math.round(sustainabilitySystem.renewableEnergy.energyConsumption)} kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Energy Balance</div>
                        <div className={`text-lg font-bold ${
                          sustainabilitySystem.renewableEnergy.energyProduction >= sustainabilitySystem.renewableEnergy.energyConsumption
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sustainabilitySystem.renewableEnergy.energyProduction - Math.round(sustainabilitySystem.renewableEnergy.energyConsumption)} kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Renewable Sources</div>
                        <div className="text-lg font-bold text-blue-600">
                          {Object.values(sustainabilitySystem.renewableEnergy).filter(v => v === true).length - 3}/4
                        </div>
                      </div>
                    </div>

                    {/* Available Energy Sources */}
                    <div className="space-y-3">
                      {Object.entries(RENEWABLE_ENERGY).map(([key, energy]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{energy.name}</div>
                            <div className="text-sm text-gray-600">{energy.description}</div>
                            <div className="text-xs text-gray-500">Output: {energy.energyOutput} kWh • Maintenance: {energy.maintenanceCost}💰/month</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              <div className="text-gray-600">Cost: {energy.cost}💰</div>
                              <div className="text-green-600">+{energy.energyOutput} kWh</div>
                            </div>
                            <Button
                              size="sm"
                              variant={sustainabilitySystem.renewableEnergy[key] ? "secondary" : "outline"}
                              onClick={() => purchaseRenewableEnergy(key)}
                              disabled={sustainabilitySystem.renewableEnergy[key] || level < energy.requirements.level || coins < energy.cost}
                            >
                              {sustainabilitySystem.renewableEnergy[key] ? "✅ Owned" : "Buy"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sustainable Practices */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🌱 Sustainable Practices</h4>
                    <div className="space-y-3">
                      {Object.entries(SUSTAINABLE_PRACTICES).map(([key, practice]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">{practice.name}</h5>
                              <p className="text-sm text-gray-600">{practice.description}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                Environmental Impact: {Object.entries(practice.environmentalImpact)
                                  .map(([metric, value]) => `${metric.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value > 0 ? '+' : ''}${value}`)
                                  .join(', ')}
                              </div>
                            </div>
                            <Button
                              onClick={() => implementSustainablePractice(key)}
                              disabled={sustainabilitySystem.sustainablePractices[key] || coins < practice.cost}
                              variant={sustainabilitySystem.sustainablePractices[key] ? "secondary" : "outline"}
                            >
                              {sustainabilitySystem.sustainablePractices[key] ? "✅ Implemented" : `${practice.cost}💰 Implement`}
                            </Button>
                          </div>

                          {sustainabilitySystem.sustainablePractices[key] && (
                            <div className="mt-2 p-2 bg-green-50 rounded">
                              <div className="text-sm font-medium text-green-800">Benefits:</div>
                              <div className="text-sm text-green-700">
                                {Object.entries(practice.benefits)
                                  .map(([benefit, value]) => `${benefit.replace(/([A-Z])/g, ' $1').toLowerCase()}: +${Math.round(value * 100)}%`)
                                  .join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Environmental Impact */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🌍 Environmental Impact</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Soil Health</div>
                        <div className="text-lg font-bold text-green-600">
                          {sustainabilitySystem.environmentalImpact.soilHealth}/100
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${sustainabilitySystem.environmentalImpact.soilHealth}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Water Usage</div>
                        <div className={`text-lg font-bold ${
                          sustainabilitySystem.environmentalImpact.waterUsage <= 100 ? 'text-green-600' :
                          sustainabilitySystem.environmentalImpact.waterUsage <= 200 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {sustainabilitySystem.environmentalImpact.waterUsage}L
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              sustainabilitySystem.environmentalImpact.waterUsage <= 100 ? 'bg-green-600' :
                              sustainabilitySystem.environmentalImpact.waterUsage <= 200 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, sustainabilitySystem.environmentalImpact.waterUsage)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Biodiversity</div>
                        <div className="text-lg font-bold text-blue-600">
                          {sustainabilitySystem.environmentalImpact.biodiversity}/100
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${sustainabilitySystem.environmentalImpact.biodiversity}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Air Quality</div>
                        <div className="text-lg font-bold text-purple-600">
                          {sustainabilitySystem.environmentalImpact.airQuality}/100
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${sustainabilitySystem.environmentalImpact.airQuality}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Waste Production</div>
                        <div className={`text-lg font-bold ${
                          sustainabilitySystem.environmentalImpact.wasteProduction <= 20 ? 'text-green-600' :
                          sustainabilitySystem.environmentalImpact.wasteProduction <= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {sustainabilitySystem.environmentalImpact.wasteProduction}kg
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              sustainabilitySystem.environmentalImpact.wasteProduction <= 20 ? 'bg-green-600' :
                              sustainabilitySystem.environmentalImpact.wasteProduction <= 50 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, sustainabilitySystem.environmentalImpact.wasteProduction * 5)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Energy Efficiency</div>
                        <div className={`text-lg font-bold ${
                          sustainabilitySystem.renewableEnergy.energyProduction >= sustainabilitySystem.renewableEnergy.energyConsumption
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sustainabilitySystem.renewableEnergy.energyConsumption > 0
                            ? Math.round((sustainabilitySystem.renewableEnergy.energyProduction / sustainabilitySystem.renewableEnergy.energyConsumption) * 100)
                            : 0}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              sustainabilitySystem.renewableEnergy.energyProduction >= sustainabilitySystem.renewableEnergy.energyConsumption
                                ? 'bg-green-600' : 'bg-red-600'
                            }`}
                            style={{
                              width: `${Math.min(100, (sustainabilitySystem.renewableEnergy.energyConsumption > 0
                                ? (sustainabilitySystem.renewableEnergy.energyProduction / sustainabilitySystem.renewableEnergy.energyConsumption) * 100
                                : 0))}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Eco-Certifications */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🏆 Eco-Certifications</h4>

                    {sustainabilitySystem.ecoCertifications.size === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No eco-certifications earned yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {Array.from(sustainabilitySystem.ecoCertifications).map(certId => {
                          const cert = ECO_CERTIFICATIONS[certId];

                          return (
                            <div key={certId} className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-green-800">{cert.name}</h5>
                                  <p className="text-sm text-green-700">{cert.description}</p>
                                  <div className="mt-2 space-y-1">
                                    {cert.benefits.reputationBonus && (
                                      <div className="text-sm text-blue-600">+{cert.benefits.reputationBonus} Reputation</div>
                                    )}
                                    {cert.benefits.premiumPrice && (
                                      <div className="text-sm text-yellow-600">+{Math.round(cert.benefits.premiumPrice * 100)}% Premium Price</div>
                                    )}
                                    {cert.benefits.ecoBonus && (
                                      <div className="text-sm text-green-600">+{Math.round(cert.benefits.ecoBonus * 100)}% Eco Bonus</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-2xl">🌿</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Available Certifications */}
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Available Certifications</h5>
                      <div className="space-y-2">
                        {Object.entries(ECO_CERTIFICATIONS).filter(([certId]) => !sustainabilitySystem.ecoCertifications.has(certId)).map(([certId, cert]) => {
                          // Check if requirements are met
                          let eligible = true;
                          Object.entries(cert.requirements).forEach(([req, value]) => {
                            switch (req) {
                              case "organicFarming":
                                if (sustainabilitySystem.sustainablePractices.organicFarming !== value) eligible = false;
                                break;
                              case "soilHealth":
                                if (sustainabilitySystem.environmentalImpact.soilHealth < value) eligible = false;
                                break;
                              case "energyProduction":
                                if (sustainabilitySystem.renewableEnergy.energyProduction < value) eligible = false;
                                break;
                              case "renewableSources":
                                const sources = Object.values(sustainabilitySystem.renewableEnergy).filter(v => v === true).length;
                                if (sources < value) eligible = false;
                                break;
                              case "waterUsage":
                                if (sustainabilitySystem.environmentalImpact.waterUsage > -value) eligible = false;
                                break;
                              case "waterConservation":
                                if (sustainabilitySystem.sustainablePractices.waterConservation !== value) eligible = false;
                                break;
                              case "biodiversity":
                                if (sustainabilitySystem.environmentalImpact.biodiversity < value) eligible = false;
                                break;
                              case "naturalPestControl":
                                if (sustainabilitySystem.sustainablePractices.naturalPestControl !== value) eligible = false;
                                break;
                              case "carbonFootprint":
                                if (sustainabilitySystem.carbonFootprint > value) eligible = false;
                                break;
                              case "wasteRecycling":
                                if (sustainabilitySystem.sustainablePractices.wasteRecycling !== value) eligible = false;
                                break;
                            }
                          });

                          return (
                            <div key={certId} className={`p-2 rounded ${eligible ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-medium">{cert.name}</h6>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Requirements: {Object.entries(cert.requirements)
                                      .map(([req, value]) => `${req.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`)
                                      .join(', ')}
                                  </div>
                                </div>
                                <div className={`text-sm ${eligible ? 'text-green-600' : 'text-gray-500'}`}>
                                  {eligible ? 'Eligible!' : 'In Progress'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Report */}
                  {sustainabilitySystem.monthlyReport.timestamp && (
                    <div className="bg-blue-50 border border-blue-300 p-4 rounded">
                      <h4 className="font-medium text-blue-800 mb-2">📊 Monthly Sustainability Report</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-600">Carbon Footprint</div>
                          <div className="font-bold text-blue-600">{Math.round(sustainabilitySystem.monthlyReport.carbonFootprint)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Sustainability Score</div>
                          <div className="font-bold text-blue-600">{sustainabilitySystem.monthlyReport.sustainabilityScore}/100</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Energy Balance</div>
                          <div className="font-bold text-green-600">
                            {sustainabilitySystem.monthlyReport.energyProduction - Math.round(sustainabilitySystem.monthlyReport.energyConsumption)} kWh
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Certifications</div>
                          <div className="font-bold text-purple-600">{sustainabilitySystem.monthlyReport.certifications.length}</div>
                        </div>
                      </div>

                      {sustainabilitySystem.monthlyReport.recommendations.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-blue-800 mb-2">Recommendations:</div>
                          <ul className="text-sm text-blue-700 list-disc list-inside">
                            {sustainabilitySystem.monthlyReport.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Advanced Research System */}
                <TabsContent value="research" className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded border">
                    <h3 className="font-medium">🧪 Advanced Research</h3>
                    <p className="text-sm text-gray-600">Unlock cutting-edge farming technologies</p>
                  </div>

                  {/* Research Overview */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">Research Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Research Points</div>
                        <div className="text-2xl font-bold text-purple-600">{advancedResearch.researchPoints}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Active Projects</div>
                        <div className="text-2xl font-bold text-blue-600">{advancedResearch.activeProjects.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Completed Projects</div>
                        <div className="text-2xl font-bold text-green-600">{advancedResearch.completedProjects.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Breakthroughs</div>
                        <div className="text-2xl font-bold text-orange-600">{advancedResearch.breakthroughs.size}</div>
                      </div>
                    </div>
                  </div>

                  {/* Research Lab */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🏗️ Research Facilities</h4>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600">Current Lab Level</div>
                        <div className="text-lg font-bold text-purple-600">Level {advancedResearch.researchLab.level}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Efficiency</div>
                        <div className="text-lg font-bold text-green-600">{Math.round(advancedResearch.researchLab.efficiency * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Parallel Projects</div>
                        <div className="text-lg font-bold text-blue-600">
                          {advancedResearch.researchLab.level >= 2 ? (advancedResearch.researchLab.level >= 3 ? 5 : 2) : 1}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Publications</div>
                        <div className="text-lg font-bold text-orange-600">{advancedResearch.publications.length}</div>
                      </div>
                    </div>

                    {/* Available Facilities */}
                    <div className="space-y-3">
                      {Object.entries(RESEARCH_FACILITIES).map(([key, facility]) => {
                        const canUpgrade = !facility.requirements ||
                                          (facility.requirements.level ? level >= facility.requirements.level : true) &&
                                          (facility.requirements.breakthroughs ? advancedResearch.breakthroughs.size >= facility.requirements.breakthroughs : true);

                        return (
                          <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{facility.name}</div>
                              <div className="text-sm text-gray-600">{facility.description}</div>
                              <div className="text-xs text-gray-500">
                                Benefits: {Object.entries(facility.benefits)
                                  .map(([benefit, value]) => `${benefit}: ${typeof value === 'number' && value < 1 ? Math.round(value * 100) + '%' : value}`)
                                  .join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-600">Cost: {facility.cost}💰</div>
                              <Button
                                size="sm"
                                variant={advancedResearch.researchLab.level >= (key === 'basic_lab' ? 1 : key === 'advanced_lab' ? 2 : 3) ? "secondary" : "outline"}
                                onClick={() => upgradeResearchLab(key)}
                                disabled={!canUpgrade || coins < facility.cost || advancedResearch.researchLab.level >= (key === 'basic_lab' ? 1 : key === 'advanced_lab' ? 2 : 3)}
                              >
                                {advancedResearch.researchLab.level >= (key === 'basic_lab' ? 1 : key === 'advanced_lab' ? 2 : 3) ? "Owned" : "Upgrade"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Research Fields */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🔬 Research Fields</h4>
                    <div className="space-y-4">
                      {Object.entries(RESEARCH_FIELDS).map(([fieldKey, field]) => {
                        const fieldData = advancedResearch[fieldKey];
                        const canUnlock = level >= field.unlockLevel;

                        return (
                          <div key={fieldKey} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-medium flex items-center gap-2">
                                  <span className="text-lg">{field.icon}</span>
                                  {field.name}
                                </h5>
                                <p className="text-sm text-gray-600">{field.description}</p>
                                <div className="text-xs text-orange-600 mt-1">
                                  Requires level {field.unlockLevel}
                                </div>
                              </div>
                              <Button
                                onClick={() => unlockResearchField(fieldKey)}
                                disabled={!canUnlock || fieldData.unlocked || coins < field.baseCost}
                                variant={fieldData.unlocked ? "secondary" : "outline"}
                              >
                                {fieldData.unlocked ? "Unlocked" : `${field.baseCost}💰 Unlock`}
                              </Button>
                            </div>

                            {fieldData.unlocked && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center mb-3">
                                  <div className="text-sm">
                                    <div className="text-gray-600">Field Level</div>
                                    <div className="font-bold text-blue-600">{fieldData.level}/10</div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-gray-600">Projects Completed</div>
                                    <div className="font-bold text-green-600">
                                      {Object.values(RESEARCH_PROJECTS).filter(p => p.field === fieldKey && advancedResearch.completedProjects.has(p.name.toLowerCase().replace(/\s+/g, '_'))).length}
                                    </div>
                                  </div>
                                </div>

                                {/* Available Projects */}
                                <div className="space-y-2">
                                  {Object.entries(RESEARCH_PROJECTS).filter(([_, project]) => project.field === fieldKey).map(([projectKey, project]) => {
                                    const isCompleted = advancedResearch.completedProjects.has(projectKey);
                                    const isActive = advancedResearch.activeProjects.has(projectKey);
                                    const canStart = project.requirements.every(req => advancedResearch.completedProjects.has(req));

                                    return (
                                      <div key={projectKey} className="flex justify-between items-center p-2 bg-white rounded">
                                        <div>
                                          <div className="font-medium">{project.name}</div>
                                          <div className="text-sm text-gray-600">{project.description}</div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Duration: {project.duration}s • Cost: {project.cost} RP
                                            {project.rewards && (
                                              <span className="ml-2 text-green-600">
                                                Rewards: {Object.entries(project.rewards).map(([k, v]) => `${k}: +${Math.round(v * 100)}%`).join(', ')}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {isCompleted && (
                                            <Button size="sm" variant="secondary" onClick={() => publishResearch(projectKey)}>
                                              📄 Publish
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant={isCompleted ? "secondary" : isActive ? "default" : "outline"}
                                            onClick={() => startResearchProject(projectKey)}
                                            disabled={isCompleted || isActive || !canStart || advancedResearch.researchPoints < project.cost}
                                          >
                                            {isCompleted ? "✅ Complete" : isActive ? "In Progress" : "Start"}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Breakthroughs */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🌟 Major Breakthroughs</h4>

                    {advancedResearch.breakthroughs.size === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No major breakthroughs achieved yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {Array.from(advancedResearch.breakthroughs).map(breakId => {
                          const breakthrough = BREAKTHROUGHS[breakId];

                          return (
                            <div key={breakId} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-purple-800">{breakthrough.name}</h5>
                                  <p className="text-sm text-purple-700">{breakthrough.description}</p>
                                  <div className="mt-2">
                                    <div className="text-xs text-purple-600">Requirements:</div>
                                    <div className="text-xs text-purple-700">
                                      {Object.entries(breakthrough.requirements).map(([field, level]) => `${field}: ${level}`).join(', ')}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs text-green-600">Rewards:</div>
                                    <div className="text-xs text-green-700">
                                      {Object.entries(breakthrough.rewards).map(([reward, value]) => `${reward}: +${value}`).join(', ')}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-2xl">🌟</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Available Breakthroughs */}
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Potential Breakthroughs</h5>
                      <div className="space-y-2">
                        {Object.entries(BREAKTHROUGHS).filter(([breakId]) => !advancedResearch.breakthroughs.has(breakId)).map(([breakId, breakthrough]) => {
                          // Check if requirements are met
                          let eligible = true;
                          Object.entries(breakthrough.requirements).forEach(([field, requiredLevel]) => {
                            if (advancedResearch[field].level < requiredLevel) {
                              eligible = false;
                            }
                          });

                          return (
                            <div key={breakId} className={`p-2 rounded ${eligible ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-medium">{breakthrough.name}</h6>
                                  <div className="text-sm text-gray-600 mt-1">{breakthrough.description}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Requirements: {Object.entries(breakthrough.requirements).map(([field, level]) => `${field}: ${level}`).join(', ')}
                                  </div>
                                </div>
                                <div className={`text-sm ${eligible ? 'text-green-600' : 'text-gray-500'}`}>
                                  {eligible ? 'Ready!' : 'In Progress'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Research Publications */}
                  {advancedResearch.publications.length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">📄 Research Publications</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {advancedResearch.publications.slice(-5).reverse().map((pub, index) => (
                          <div key={pub.id} className="p-2 bg-gray-50 rounded">
                            <div className="font-medium text-sm">{pub.title}</div>
                            <div className="text-xs text-gray-600">
                              Field: {pub.field} • Impact: {pub.impact} • Citations: {pub.citations}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(pub.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Animal Husbandry System */}
                <TabsContent value="livestock" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🐄 Animal Husbandry</h3>
                    <p className="text-sm text-gray-600">Breed, show, and care for your livestock</p>
                  </div>

                  {/* Livestock Overview */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">Farm Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Total Animals</div>
                        <div className="text-2xl font-bold text-green-600">{animalHusbandry.animals.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Breeding Pairs</div>
                        <div className="text-2xl font-bold text-pink-600">{animalHusbandry.breedingPairs.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Active Show</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {animalHusbandry.animalShows.activeShow ? "Yes" : "None"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Products Ready</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {animalHusbandry.animals.filter(a => a.productionReady).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animal Purchase */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🐄 Purchase Animals</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(ANIMAL_TYPES).map(([animalKey, animal]) => {
                        const currentCount = animalHusbandry.animals.filter(a => a.type === animalKey).length;
                        const facility = animalHusbandry.facilities[animal.facility];
                        const hasSpace = currentCount < facility.capacity;

                        return (
                          <div key={animalKey} className="p-3 bg-gray-50 rounded">
                            <div className="font-medium">{animal.name}</div>
                            <div className="text-sm text-gray-600">{animal.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Products: {Object.entries(animal.products).map(([p, a]) => `${a} ${p}`).join(', ')}
                            </div>
                            <div className="text-xs text-gray-500">
                              Facility: {facility.capacity} capacity ({currentCount}/{facility.capacity})
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => purchaseAnimal(animalKey, 'male')}
                                disabled={!hasSpace || coins < animal.baseCost}
                              >
                                {animal.baseCost}💰 Male
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => purchaseAnimal(animalKey, 'female')}
                                disabled={!hasSpace || coins < animal.baseCost}
                              >
                                {animal.baseCost}💰 Female
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Facility Upgrades */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🏗️ Facility Upgrades</h4>
                    <div className="space-y-3">
                      {Object.entries(FACILITY_UPGRADES).map(([facilityKey, facility]) => {
                        const currentFacility = animalHusbandry.facilities[facilityKey];
                        const currentLevel = currentFacility.level;
                        const nextLevel = currentLevel + 1;
                        const canUpgrade = nextLevel < facility.levels.length;

                        return (
                          <div key={facilityKey} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium capitalize">{facilityKey.replace(/([A-Z])/g, ' $1')}</div>
                              <div className="text-sm text-gray-600">
                                Level {currentLevel} • Capacity: {currentFacility.capacity}
                                {canUpgrade && ` → Level ${nextLevel} • Capacity: ${facility.levels[nextLevel].capacity}`}
                              </div>
                            </div>
                            {canUpgrade && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => upgradeFacility(facilityKey)}
                                disabled={coins < facility.levels[nextLevel].cost}
                              >
                                {facility.levels[nextLevel].cost}💰 Upgrade
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Animal Management */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🐄 Your Animals</h4>

                    {animalHusbandry.animals.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No animals yet! Purchase some from the shop above.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {animalHusbandry.animals.map(animal => {
                          const animalType = ANIMAL_TYPES[animal.type];
                          const traitsList = Object.entries(animal.traits).map(([traitId, level]) => {
                            const trait = ANIMAL_TRAITS[traitId];
                            return `${trait.name} (${level})`;
                          }).join(', ');

                          return (
                            <div key={animal.id} className="p-3 bg-gray-50 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium">{animal.name} ({animal.gender})</h5>
                                  <div className="text-sm text-gray-600">{animalType.name} • Age: {animal.age}</div>
                                  <div className="text-xs text-gray-500">
                                    Health: {animal.health}/100 • Happiness: {animal.happiness}/100
                                  </div>
                                  {traitsList && (
                                    <div className="text-xs text-blue-600 mt-1">Traits: {traitsList}</div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {animal.productionReady && (
                                    <Badge variant="secondary" className="text-xs">Ready to Produce</Badge>
                                  )}
                                  {animal.breedingReady && (
                                    <Badge variant="secondary" className="text-xs">Ready to Breed</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => sellAnimal(animal.id)}>
                                  💰 Sell ({Math.floor(animal.value * 0.8)}💰)
                                </Button>
                                {animal.breedingReady && (
                                  <div className="flex gap-1">
                                    {animalHusbandry.animals
                                      .filter(a => a.type === animal.type && a.gender !== animal.gender && a.breedingReady)
                                      .slice(0, 2)
                                      .map(mate => (
                                        <Button
                                          key={mate.id}
                                          size="sm"
                                          variant="outline"
                                          onClick={() => breedAnimals(
                                            animal.gender === 'male' ? animal.id : mate.id,
                                            animal.gender === 'female' ? animal.id : mate.id
                                          )}
                                        >
                                          💕 {mate.name}
                                        </Button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Breeding Pairs */}
                  {animalHusbandry.breedingPairs.length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">💕 Active Breeding</h4>
                      <div className="space-y-2">
                        {animalHusbandry.breedingPairs.map(breeding => {
                          const male = animalHusbandry.animals.find(a => a.id === breeding.maleId);
                          const female = animalHusbandry.animals.find(a => a.id === breeding.femaleId);
                          const progress = Math.min(100, ((Date.now() - breeding.startTime) / (breeding.duration * 1000)) * 100);

                          return (
                            <div key={breeding.id} className="p-2 bg-pink-50 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-sm font-medium">
                                  {male?.name} + {female?.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {Math.round(progress)}% Complete
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-pink-600 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Animal Shows */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🎪 Animal Shows</h4>

                    {animalHusbandry.animalShows.activeShow ? (
                      <div className="p-3 bg-purple-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-medium">{ANIMAL_SHOWS[animalHusbandry.animalShows.activeShow.type].name}</div>
                            <div className="text-sm text-gray-600">
                              {animalHusbandry.animalShows.activeShow.animals.length} animals entered
                            </div>
                          </div>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.max(0, Math.round((animalHusbandry.animalShows.activeShow.duration * 1000 - (Date.now() - animalHusbandry.animalShows.activeShow.startTime)) / 1000))}s remaining
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(ANIMAL_SHOWS).map(([showKey, show]) => {
                          const eligibleAnimals = animalHusbandry.animals.filter(animal => {
                            // Simple eligibility check
                            return animal.health > 50 && animal.happiness > 50;
                          });

                          return (
                            <div key={showKey} className="p-3 bg-gray-50 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium">{show.name}</h5>
                                  <p className="text-sm text-gray-600">{show.description}</p>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Entry Fee: {show.entryFee}💰 per animal • Duration: {show.duration}s
                                  </div>
                                  <div className="text-xs text-orange-600">
                                    Requires level {show.requirements.level}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => enterAnimalShow(showKey, eligibleAnimals.slice(0, 3).map(a => a.id))}
                                  disabled={level < show.requirements.level || eligibleAnimals.length === 0 || coins < show.entryFee * 3}
                                  variant="outline"
                                >
                                  Enter ({Math.min(3, eligibleAnimals.length)} animals)
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Products & Care */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Products */}
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">🥛 Products</h4>
                      <div className="space-y-2">
                        {Object.entries(animalHusbandry.products).map(([product, amount]) => (
                          <div key={product} className="flex justify-between items-center">
                            <div className="text-sm capitalize">{product}</div>
                            <div className="text-sm font-bold">{amount}</div>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={collectProducts}
                        disabled={animalHusbandry.animals.filter(a => a.productionReady).length === 0}
                        variant="outline"
                        className="w-full mt-3"
                      >
                        Collect Products
                      </Button>
                    </div>

                    {/* Care Actions */}
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">🐾 Care Actions</h4>
                      <div className="space-y-2">
                        <Button
                          onClick={feedAnimals}
                          disabled={animalHusbandry.animals.filter(a => Date.now() - a.lastFed > 3600000).length === 0}
                          variant="outline"
                          className="w-full"
                        >
                          🍖 Feed Animals
                        </Button>
                        <div className="text-xs text-gray-600">
                          {animalHusbandry.animals.filter(a => Date.now() - a.lastFed > 3600000).length} animals hungry
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Show Results */}
                  {animalHusbandry.animalShows.showResults.length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-3">🏆 Recent Show Results</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {animalHusbandry.animalShows.showResults.slice(-3).reverse().map((result, index) => {
                          const show = ANIMAL_SHOWS[result.showType];

                          return (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <div className="font-medium text-sm">{show.name}</div>
                              <div className="text-xs text-gray-600">
                                {Object.keys(result.placements).length} placements • Total Prize: {
                                  Object.values(result.placements).reduce((sum, p) => sum + p.prize, 0)
                                }💰
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(result.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Seasonal Events */}
                <TabsContent value="events" className="space-y-3">
                  <div className="bg-orange-50 p-3 rounded border">
                    <h3 className="font-medium">🎉 Seasonal Events</h3>
                    <p className="text-sm text-gray-600">Festivals, holidays, and special challenges</p>
                  </div>

                  {/* Seasonal Festivals */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Seasonal Festivals</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(SEASONAL_FESTIVALS).map(([festivalId, festival]) => {
                        const isActive = seasonalEvents.some(e => e.id === festivalId && Date.now() < e.endTime);
                        const canStart = festival.season === currentSeason && !isActive;

                        return (
                          <div key={festivalId} className="p-3 border rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{festival.emoji}</span>
                              <span className="text-sm font-medium">{festival.name}</span>
                              <Badge variant={festival.season === currentSeason ? "default" : "secondary"}>
                                {SEASONS[festival.season].emoji} {SEASONS[festival.season].name}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{festival.description}</p>

                            <div className="text-xs text-gray-500 mb-2">
                              Duration: {festival.duration}s • Challenges: {festival.challenges.length}
                            </div>

                            <div className="text-xs text-gray-500 mb-2">
                              Bonuses: {Object.entries(festival.bonuses).map(([key, value]) =>
                                `${key} x${value}`
                              ).join(', ')}
                            </div>

                            <div className="text-xs text-gray-500 mb-3">
                              Rewards: {festival.rewards.coins}💰 +{festival.rewards.reputation} Rep
                              {festival.rewards.decoration && ` + ${DECORATION_ITEMS[festival.rewards.decoration].name}`}
                            </div>

                            <Button
                              size="sm"
                              onClick={() => startSeasonalFestival(festivalId)}
                              disabled={!canStart}
                              className="w-full"
                            >
                              {isActive ? "Active" : canStart ? "Start Festival" : "Not Available"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Festivals */}
                  {seasonalEvents.filter(e => Date.now() < e.endTime).length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Active Festivals</h4>
                      <div className="space-y-2">
                        {seasonalEvents.filter(e => Date.now() < e.endTime).map(event => {
                          const playerProgress = event.progress[currentPlayerId];
                          const completedChallenges = playerProgress ? Object.values(playerProgress.challenges).filter(Boolean).length : 0;

                          return (
                            <div key={event.id} className="p-3 border rounded bg-green-50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{SEASONAL_FESTIVALS[event.id].emoji}</span>
                                  <span className="text-sm font-medium">{event.name}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {Math.max(0, Math.floor((event.endTime - Date.now()) / 1000))}s left
                                </div>
                              </div>

                              <div className="text-xs text-gray-600 mb-2">
                                Challenges: {completedChallenges}/{event.challenges.length} completed
                              </div>

                              {/* Challenge List */}
                              <div className="space-y-1 mb-3">
                                {event.challenges.map(challenge => (
                                  <div key={challenge} className="flex items-center gap-2 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={playerProgress?.challenges[challenge] || false}
                                      onChange={() => {}}
                                      className="w-3 h-3"
                                    />
                                    <span className={playerProgress?.challenges[challenge] ? "text-green-600 line-through" : ""}>
                                      {challenge.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <Button
                                size="sm"
                                onClick={() => claimFestivalRewards(event.id)}
                                disabled={Date.now() < event.endTime}
                                className="w-full"
                              >
                                Claim Rewards
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Holiday Events */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Holiday Events</h4>
                    <div className="space-y-2">
                      {holidayEvents.filter(e => Date.now() < e.endTime).map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded bg-red-50">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{event.emoji}</span>
                            <div>
                              <div className="text-sm font-medium">{event.name}</div>
                              <div className="text-xs text-gray-600">{event.description}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.max(0, Math.floor((event.endTime - Date.now()) / 1000))}s left
                          </div>
                        </div>
                      ))}

                      {holidayEvents.filter(e => Date.now() < e.endTime).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <div className="text-2xl mb-2">🎄</div>
                          <div className="text-sm">No active holiday events</div>
                          <Button
                            size="sm"
                            onClick={checkHolidayEvents}
                            className="mt-2"
                          >
                            Check for Events
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Crops Shop */}
                  {(seasonalEvents.some(e => Date.now() < e.endTime) ||
                    holidayEvents.some(e => Date.now() < e.endTime) ||
                    seasonalShop.available) && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Special Crops Shop</h4>

                      {!seasonalShop.available ? (
                        <div className="text-center py-4">
                          <Button onClick={() => openSeasonalShop()}>
                            Open Seasonal Shop
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {seasonalShop.items.map(item => (
                            <div key={item.id} className="p-2 border rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{item.emoji}</span>
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                Special seasonal crop
                              </div>
                              <Button
                                size="sm"
                                onClick={() => buySeasonalItem(item.id)}
                                disabled={coins < item.price}
                                className="w-full"
                              >
                                {coins >= item.price ? `${item.price}💰` : 'No 💰'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Event Statistics */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Event Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Festivals Completed</div>
                        <div className="text-lg font-bold text-orange-600">
                          {Object.keys(eventProgress).length}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Special Crops Grown</div>
                        <div className="text-lg font-bold text-green-600">
                          {Object.keys(specialCrops).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Buildings (extracted for visibility) */}
                <TabsContent value="buildings" className="space-y-3">
                  <div className="bg-amber-50 p-3 rounded border">
                    <h3 className="font-medium">🏗️ Buildings</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(BUILDINGS).map(([type, building]) => {
                        const hasIt = hasBuilding(type);
                        const canBuy = level >= building.unlockLevel && coins >= building.cost;
                        return (
                          <div key={type} className="text-center p-2 border rounded">
                            <div className="text-lg">{building.emoji}</div>
                            <div className="text-xs font-medium">{building.name}</div>
                            <div className="text-[11px] text-gray-600 mt-1">{building.description}</div>
                            <div className="text-[11px]">Cost: {building.cost}💰</div>
                            <Button size="sm" className="text-xs mt-1" disabled={!canBuy || hasIt} onClick={() => buyBuilding(type)}>
                              {hasIt ? 'Owned' : 'Buy'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Contracts */}
                <TabsContent value="contracts" className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded border">
                    <h3 className="font-medium">📜 Contracts & Reputation</h3>
                    <div className="text-xs text-gray-700">Reputation: {reputation}</div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {availableContracts.map(c => {
                      const npc = NPCS.find(n => n.id === c.npcId);
                      return (
                        <div key={c.id} className="p-2 bg-white rounded border text-xs">
                          <div className="font-medium">{npc?.name}</div>
                          <div>Needs: {c.quantity}× {DEFAULT_RULES.seeds[c.crop]?.name || c.crop}</div>
                          <div>Reward: {c.reward}💰</div>
                          <div>Expires: {formatTimeRemaining(c.expiresAt - nowSec())}</div>
                          <Button size="sm" className="text-xs mt-2"
                            onClick={() => { setActiveContracts(prev => [...prev, c]); setAvailableContracts(prev => prev.filter(x => x.id !== c.id)); }}>
                            Accept
                          </Button>
                        </div>
                      );
                    })}
                    {availableContracts.length === 0 && <div className="text-xs text-gray-500">No contracts right now</div>}
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-sm">Active Contracts</h4>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {activeContracts.map(c => (
                        <div key={c.id} className="p-2 border rounded text-xs">
                          <div className="flex justify-between"><span>{c.crop} × {c.quantity}</span><span>{formatTimeRemaining(c.expiresAt - nowSec())}</span></div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="text-xs"
                              disabled={(inventory[c.crop]||0) < c.quantity}
                              onClick={() => {
                                setInventory(prev => ({...prev, [c.crop]: (prev[c.crop]||0) - c.quantity }));
                                setCoins(prev => prev + c.reward);
                                setReputation(prev => prev + 1);
                                setActiveContracts(prev => prev.filter(x => x.id !== c.id));
                                addNotification("Contract delivered!", "success");
                              }}>Deliver</Button>
                            <Button size="sm" variant="secondary" className="text-xs"
                              onClick={() => setActiveContracts(prev => prev.filter(x => x.id !== c.id))}>Decline</Button>
                          </div>
                        </div>
                      ))}
                      {activeContracts.length === 0 && <div className="text-xs text-gray-500">No active contracts</div>}
                    </div>
                  </div>
                </TabsContent>

                {/* Logistics */}
                <TabsContent value="logistics" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">🚚 Vehicles & Deliveries</h3>
                    <div className="text-xs">Fuel: {fuel}</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {Object.entries(VEHICLES).map(([id, v]) => (
                      <div key={id} className="p-2 bg-white rounded border text-xs">
                        <div className="flex justify-between"><span>{v.name}</span><span>Cap {v.capacity}</span></div>
                        <div>Speed: {v.speed}× {v.preserves ? ' (Preserves)' : ''}</div>
                        <Button size="sm" className="text-xs mt-2" disabled={coins < v.cost}
                          onClick={() => { setCoins(prev => prev - v.cost); setVehiclesOwned(prev => ({...prev, [id]: (prev[id]||0)+1 })); }}>
                          Buy ({v.cost}💰)
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-sm">Create Delivery</h4>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(inventory).map(([crop, qty]) => qty > 0 && (
                        <div key={crop} className="p-2 border rounded">
                          <div className="font-medium">{DEFAULT_RULES.seeds[crop]?.name || crop} × {qty}</div>
                          <Button size="sm" className="text-xs mt-1" onClick={() => {
                            const bestVehId = Object.keys(vehiclesOwned).reduce((best, id) => {
                              if ((vehiclesOwned[id]||0) <= 0) return best;
                              const baseCap = VEHICLES[id].capacity;
                              const cap = vehicleUpgrades.tractorTrailer ? baseCap + 80 : baseCap;
                              if (!best) return id;
                              const bestBase = VEHICLES[best].capacity;
                              const bestCap = vehicleUpgrades.tractorTrailer ? bestBase + 80 : bestBase;
                              return cap > bestCap ? id : best;
                            }, null) || 'handcart';
                            const vehicle = VEHICLES[bestVehId];
                            const vehicleCapacity = (vehicleUpgrades.tractorTrailer ? vehicle.capacity + 80 : vehicle.capacity);
                            const quantity = Math.min(qty, vehicleCapacity);
                            const candidateTowns = Object.keys(MARKET_TOWNS);
                            const town = vehicleUpgrades.routePlanner ? (candidateTowns.reduce((best, tid) => {
                              const ppu = marketPrices[crop] || DEFAULT_RULES.seeds[crop]?.baseValue || 0;
                              const net = (ppu * quantity) - (MARKET_TOWNS[tid].transportCost * quantity);
                              return (!best || net > best.net) ? { id: tid, net } : best;
                            }, null)?.id || selectedTown) : selectedTown;
                            const pricePerUnit = (marketPrices[crop] || DEFAULT_RULES.seeds[crop]?.baseValue || 0) * (buildings.some(b=>b.type==='marketStall')?1.10:1);
                            const distance = 10;
                            const travel = Math.ceil((distance / vehicle.speed) * 60 * (vehicleUpgrades.dispatchCenter?0.9:1));
                            const totalRevenue = pricePerUnit * quantity;
                            const transport = Math.floor(MARKET_TOWNS[town].transportCost * quantity * (vehicleUpgrades.fuelCoop?0.75:1)) + (buildings.some(b=>b.type==='railSiding')?30:0);
                            const netProfit = Math.max(0, totalRevenue - transport);
                            setInventory(prev => ({...prev, [crop]: prev[crop] - quantity }));
                            setDeliveries(prev => [...prev, { id: `del_${Date.now()}`, crop, quantity, town, arrivesAt: nowSec() + travel, netProfit, preserve: vehicleUpgrades.refrigerationKit }]);
                            addNotification(`Delivery dispatched: ${quantity} ${crop} → ${MARKET_TOWNS[town].name}`, 'info');
                          }}>Send</Button>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-medium text-sm mt-3">In Transit</h4>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs">
                      {deliveries.map(d => (
                        <div key={d.id} className="p-2 border rounded">
                          <div>{d.crop} × {d.quantity} → {d.town}</div>
                          <div>Arrives in {formatTimeRemaining(d.arrivesAt - nowSec())}</div>
                        </div>
                      ))}
                      {deliveries.length === 0 && <div className="text-xs text-gray-500">No deliveries</div>}
                    </div>
                  </div>
                </TabsContent>

                                <TabsContent value="shop" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🌱 Seed Shop</h3>
                    <p className="text-sm text-gray-600">Buy seeds to plant in your fields and grow crops for harvest!</p>
                  </div>

                  <div className="space-y-3">
                                                          <div className="bg-blue-50 p-3 rounded border mb-4">
                      <h4 className="font-medium text-sm mb-2">📦 Your Seed Inventory:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(inventory).filter(([item]) => item.endsWith('_seed') && inventory[item] > 0).map(([seedItem, count]) => {
                          const seedName = seedItem.replace('_seed', '');
                          const seedData = DEFAULT_RULES.seeds[seedName];

                          return (
                            <div key={seedItem} className="bg-white p-2 rounded border">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{seedData.emoji} {seedData.name} Seeds</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                🌱 Cannot be sold - must be planted first!
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {Object.keys(inventory).filter(item => item.endsWith('_seed') && inventory[item] > 0).length === 0 && (
                        <div className="text-center text-gray-500 py-2 text-sm">
                          No seeds yet. Buy some below! 🛒
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium">Your Harvested Crops (Ready to Sell):</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(inventory).filter(([item]) => !item.endsWith('_seed') && DEFAULT_RULES.seeds[item] && inventory[item] > 0).map(([crop, count]) => {
                          const cropData = DEFAULT_RULES.seeds[crop];
                          const marketPrice = marketPrices[crop] || cropData.baseValue;

                          return (
                            <div key={crop} className="bg-yellow-50 p-2 rounded border">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{cropData.emoji} {cropData.name} (Crop)</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Sell for: ~${Math.floor(marketPrice * 0.8)} each
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {Object.keys(inventory).filter(item => !item.endsWith('_seed') && DEFAULT_RULES.seeds[item] && inventory[item] > 0).length === 0 && (
                        <div className="text-center text-gray-500 py-4 text-sm">
                          No harvested crops yet. Buy seeds, plant them, wait for growth, then harvest! 🌱➡️🌾➡️💰
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 p-3 rounded border">
                      <h4 className="font-medium text-sm">💡 Farming Strategy:</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Buy seeds here, plant them in your fields, grow them to harvest, then sell the crops on the Market tab!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">🛒 Seeds for Sale:</h4>
                      {Object.entries(DEFAULT_RULES.seeds).map(([seed, data]) => {
                        const marketPrice = marketPrices[seed] || data.baseValue;
                        const harvestValue = Math.floor(marketPrice * 0.8); // 80% of market price
                        const profitPerHarvest = harvestValue - data.shopPrice;
                        const profitColor = profitPerHarvest > 0 ? 'text-green-600' : profitPerHarvest < -5 ? 'text-red-600' : 'text-yellow-600';

                        return (
                          <div key={seed} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{data.emoji} {data.name} Seeds</span>
                              <div className="text-right">
                                <div className="text-xs text-gray-600">Seed Cost: {data.shopPrice}💰</div>
                                <div className={`text-xs ${profitColor}`}>
                                  {data.name} Value: ~{harvestValue}💰
                                </div>
                                <div className={`text-xs ${profitColor}`}>
                                  Profit: ~{profitPerHarvest > 0 ? '+' : ''}{profitPerHarvest}💰
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => buySeeds(seed, 1)}
                                disabled={coins < data.shopPrice}
                                className="text-xs px-2 py-1 flex-1"
                                variant="outline"
                              >
                                Buy 1 ({data.shopPrice}💰)
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => buySeeds(seed, 5)}
                                disabled={coins < data.shopPrice * 5}
                                className="text-xs px-2 py-1 flex-1"
                              >
                                Buy 5 ({data.shopPrice * 5}💰)
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => buySeeds(seed, 10)}
                                disabled={coins < data.shopPrice * 10}
                                className="text-xs px-2 py-1 flex-1"
                              >
                                Buy 10 ({data.shopPrice * 10}💰)
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    
                    {Object.keys(limitedTimeSeeds).length > 0 && (
                      <>
                        <h4 className="font-medium text-purple-600">🎪 Festival Seeds:</h4>
                        {Object.entries(LIMITED_TIME_CROPS).map(([seed, data]) => (
                          limitedTimeSeeds[seed] > 0 && (
                            <div key={seed} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                              <span className="text-sm">{data.emoji} {seed}</span>
                              <Badge variant="secondary">Festival Only!</Badge>
                        </div>
                          )
                        ))}
                      </>
                    )}
                    </div>

                <TabsContent value="market" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🏪 Crop Market</h3>
                    <p className="text-sm text-gray-600">Sell your harvested crops to different towns for profit!</p>
                  </div>

                  <div>
                    <h4 className="font-medium">🚚 Select Town:</h4>
                    <select 
                      value={selectedTown}
                      onChange={(e) => setSelectedTown(e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    >
                      {Object.entries(MARKET_TOWNS).map(([townId, town]) => (
                        <option key={townId} value={townId}>
                          {town.emoji} {town.name} (${town.transportCost}/item)
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      {MARKET_TOWNS[selectedTown]?.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">💰 Current Prices:</h4>
                    <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                      {Object.entries(marketPrices).filter(([crop]) => (inventory[crop] || 0) > 0).map(([crop, price]) => {
                        const seedData = DEFAULT_RULES.seeds[crop];
                        const quantity = inventory[crop] || 0;
                        const town = MARKET_TOWNS[selectedTown];
                        const isPreferred = town.preferences.includes(crop);
                        
                        return (
                          <div key={crop} className={`text-xs p-2 border rounded ${isPreferred ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <span>{seedData?.emoji} {seedData?.name}</span>
                              <div className="text-right">
                                <div className="font-medium">${price}</div>
                                <div className="text-gray-500">Have: {quantity}</div>
                              </div>
                            </div>
                            {quantity > 0 && (
                              <div className="flex gap-1 mt-1">
                                <Button
                                  size="sm"
                                  onClick={() => sellToMarket(crop, 1)}
                                  disabled={quantity < 1}
                                  className="text-xs px-1 py-0 flex-1"
                                >
                                  Sell 1
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => sellToMarket(crop, Math.min(5, quantity))}
                                  disabled={quantity < 1}
                                  className="text-xs px-1 py-0 flex-1"
                                >
                                  Sell 5
                                </Button>
                              </div>
                            )}
                            {isPreferred && (
                              <div className="text-xs text-yellow-600 mt-1">⭐ Preferred (+30%)</div>
                            )}
                          </div>
                        );
                      })}
                      {Object.keys(inventory).filter(item => !item.endsWith('_seed') && (inventory[item] || 0) > 0).length === 0 && (
                        <div className="text-center text-gray-500 py-4 text-sm">
                          No harvested crops to sell. Plant seeds and harvest them first! 🌱➡️🌾
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">📊 Recent Sales:</h4>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {marketHistory.slice(-5).reverse().map((sale, i) => (
                        <div key={i} className="text-xs bg-blue-50 p-2 rounded border">
                          <div className="flex items-center justify-between">
                            <span>{sale.quantity}x {DEFAULT_RULES.seeds[sale.crop]?.emoji} {sale.crop}</span>
                            <span className="font-medium text-green-600">+${sale.netProfit}</span>
                          </div>
                          <div className="text-gray-500">to {MARKET_TOWNS[sale.town]?.name}</div>
                        </div>
                      ))}
                      {marketHistory.length === 0 && (
                        <p className="text-sm text-gray-500">No sales yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="processing" className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded border">
                    <h3 className="font-medium">🏭 Crop Processing</h3>
                    <p className="text-sm text-gray-600">Turn raw materials into valuable products!</p>
                  </div>

                  <div>
                    <h4 className="font-medium">📦 Processed Goods:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(processedGoods).map(([good, quantity]) => (
                        <div key={good} className="bg-yellow-50 px-2 py-1 rounded border text-center">
                          {PROCESSING_RECIPES[good]?.emoji} {PROCESSING_RECIPES[good]?.name}: {quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">⚙️ Processing Queue:</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {processingQueue.map(item => {
                        const recipe = PROCESSING_RECIPES[item.recipeId];
                        const remaining = Math.max(0, item.endTime - currentTime);
                        const progress = ((recipe.processingTime - remaining) / recipe.processingTime) * 100;
                        
                        return (
                          <div key={item.id} className="text-xs bg-orange-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>{recipe.emoji} {recipe.name}</span>
                              <span>{Math.ceil(remaining)}s</span>
                            </div>
                            <Progress value={progress} className="h-1 mt-1" />
                          </div>
                        );
                      })}
                      {processingQueue.length === 0 && (
                        <p className="text-sm text-gray-500">No items processing</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🍳 Available Recipes:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(PROCESSING_RECIPES).map(([recipeId, recipe]) => {
                        const canProcess = hasBuilding(recipe.requiredBuilding);
                        const hasInputs = Object.entries(recipe.inputs).every(([input, needed]) => {
                          const available = inventory[input] || animalProducts[input] || 0;
                          return available >= needed;
                        });
                        
                        return (
                          <div key={recipeId} className="text-xs p-2 border rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{recipe.emoji} {recipe.name}</span>
                              <Button
                                size="sm"
                                onClick={() => startProcessing(recipeId)}
                                disabled={!canProcess || !hasInputs}
                                className="text-xs px-2 py-1"
                              >
                                Process
                              </Button>
                            </div>
                            <div className="text-gray-600 mt-1">
                              Inputs: {Object.entries(recipe.inputs).map(([input, qty]) => `${qty}x ${input}`).join(", ")}
                            </div>
                            <div className="text-green-600">
                              Output: {Object.entries(recipe.outputs).map(([output, qty]) => `${qty}x ${output}`).join(", ")} (${recipe.baseValue} coins)
                            </div>
                            {!canProcess && (
                              <div className="text-red-600 mt-1">Need {BUILDINGS[recipe.requiredBuilding]?.name}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="automation" className="space-y-3">
                  <div className="bg-cyan-50 p-3 rounded border">
                    <h3 className="font-medium">🤖 Farm Automation</h3>
                    <p className="text-sm text-gray-600">
                      Energy: {energyProduction - energyConsumption}/{energyProduction} available
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">⚡ Energy Systems:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ENERGY_SYSTEMS).map(([systemType, system]) => {
                        const canBuild = completedResearch.includes(system.requiredResearch) && coins >= system.cost;
                        const hasSystem = energySystems.some(s => s.type === systemType);
                        
                        return (
                          <div key={systemType} className="text-xs p-2 border rounded text-center">
                            <div className="text-lg mb-1">{system.emoji}</div>
                            <div className="font-medium">{system.name}</div>
                            <div className="text-gray-600">+{system.energyProduction} Energy</div>
                            <div className="text-gray-500 text-xs mb-2">{system.description}</div>
                            {hasSystem ? (
                              <Badge variant="default" className="text-xs">Built</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => buildEnergySystem(systemType)}
                                disabled={!canBuild}
                                className="text-xs px-2 py-1"
                              >
                                Build ({system.cost}💰)
                              </Button>
                            )}
                            {!completedResearch.includes(system.requiredResearch) && (
                              <div className="text-red-600 text-xs mt-1">
                                Need: {RESEARCH_TREE[system.requiredResearch]?.name}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🔧 Automation Equipment:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(AUTOMATION_EQUIPMENT).map(([equipmentType, equipment]) => {
                        const canInstall = completedResearch.includes(equipment.requiredResearch) && 
                                         coins >= equipment.cost &&
                                         (energyProduction - energyConsumption) >= equipment.energyConsumption;
                        
                        return (
                          <div key={equipmentType} className="text-xs p-2 border rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{equipment.emoji} {equipment.name}</span>
                              <span className="text-gray-600">⚡{equipment.energyConsumption}</span>
                            </div>
                            <div className="text-gray-600 mt-1">{equipment.description}</div>
                            <div className="text-green-600">Cost: {equipment.cost}💰</div>
                            {!completedResearch.includes(equipment.requiredResearch) && (
                              <div className="text-red-600 mt-1">
                                Need: {RESEARCH_TREE[equipment.requiredResearch]?.name}
                              </div>
                            )}
                            {!canInstall && completedResearch.includes(equipment.requiredResearch) && (
                              <div className="text-yellow-600 mt-1">
                                {coins < equipment.cost ? "Need more coins" : "Need more energy"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">📊 Installed Systems:</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {energySystems.map(system => {
                        const systemData = ENERGY_SYSTEMS[system.type];
                        return (
                          <div key={system.id} className="text-xs bg-green-50 p-2 rounded border">
                            <span>{systemData.emoji} {systemData.name}</span>
                            <span className="text-green-600 ml-2">+{systemData.energyProduction} Energy</span>
                          </div>
                        );
                      })}
                      
                      {plots.map((plot, i) => 
                        plot.automation.map(auto => {
                          const equipment = AUTOMATION_EQUIPMENT[auto.type];
                          return (
                            <div key={auto.id} className="text-xs bg-blue-50 p-2 rounded border">
                              <span>Plot {i + 1}: {equipment.emoji} {equipment.name}</span>
                              <span className="text-red-600 ml-2">-{equipment.energyConsumption} Energy</span>
                            </div>
                          );
                        })
                      )}
                      
                      {energySystems.length === 0 && plots.every(p => p.automation.length === 0) && (
                        <p className="text-sm text-gray-500">No automation installed</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    <h5 className="font-medium">💡 Installation Tips:</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Click on plots to install automation equipment</li>
                      <li>Build energy systems first to power automation</li>
                      <li>Sprinklers affect adjacent plots automatically</li>
                      <li>Auto-harvesters collect crops when ready</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="research" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">🧪 Research Lab</h3>
                    <p className="text-sm text-gray-600">Research Points: {researchPoints} (Earn 1 per harvest)</p>
                  </div>

                  {activeResearch && (
                    <div className="bg-yellow-50 p-3 rounded border">
                      <h4 className="font-medium">🔬 Currently Researching:</h4>
                      <div className="text-sm">
                        {RESEARCH_TREE[activeResearch].emoji} {RESEARCH_TREE[activeResearch].name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {Math.ceil(Math.max(0, (researchStartTime + RESEARCH_TREE[activeResearch].researchTime) - currentTime))}s remaining
                      </div>
                      <Progress 
                        value={((currentTime - researchStartTime) / RESEARCH_TREE[activeResearch].researchTime) * 100} 
                        className="mt-2" 
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium">🔓 Available Research:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(RESEARCH_TREE).map(([researchId, research]) => {
                        const isCompleted = completedResearch.includes(researchId);
                        const canResearch = research.prerequisites.every(prereq => completedResearch.includes(prereq)) && 
                                          researchPoints >= research.cost && 
                                          !activeResearch &&
                                          !isCompleted;
                        
                        return (
                          <div key={researchId} className={`text-xs p-2 border rounded ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{research.emoji} {research.name}</span>
                              {isCompleted ? (
                                <Badge variant="default" className="text-xs">Complete</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => startResearch(researchId)}
                                  disabled={!canResearch}
                                  className="text-xs px-2 py-1"
                                >
                                  Research ({research.cost}RP)
                                </Button>
                              )}
                            </div>
                            <div className="text-gray-600 mt-1">{research.description}</div>
                            {research.prerequisites.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Requires: {research.prerequisites.map(p => RESEARCH_TREE[p].name).join(", ")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">✅ Completed Research:</h4>
                    <div className="flex flex-wrap gap-1">
                      {completedResearch.map(researchId => (
                        <Badge key={researchId} variant="outline" className="text-xs">
                          {RESEARCH_TREE[researchId].emoji} {RESEARCH_TREE[researchId].name}
                        </Badge>
                      ))}
                      {completedResearch.length === 0 && (
                        <p className="text-sm text-gray-500">No research completed yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="events" className="space-y-3">
                  {activeFestival ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded border">
                        <h3 className="font-medium">{activeFestival.emoji} {activeFestival.name}</h3>
                        <p className="text-sm text-gray-600">
                          Time remaining: {Math.max(0, festivalEndTime - currentTime)}s
                        </p>
                        <p className="text-sm">Score: {festivalScore}</p>
                        <div className="text-xs mt-2">
                          <p>Bonuses: Growth +{Math.round((activeFestival.bonuses.growth - 1) * 100)}%, Value +{Math.round((activeFestival.bonuses.value - 1) * 100)}%</p>
                    </div>
                          </div>
                        </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="font-medium">🎪 Available Festivals:</h4>
                      {FESTIVALS.filter(f => f.requirements.level <= level).map(festival => (
                        <div key={festival.id} className="border p-3 rounded">
                      <div className="flex items-center justify-between">
                          <div>
                              <h5 className="font-medium">{festival.emoji} {festival.name}</h5>
                              <p className="text-xs text-gray-600">
                                Duration: {festival.duration/60}min | Rewards: {festival.rewards.coins}💰
                              </p>
                          </div>
                          <Button
                            size="sm"
                              onClick={() => startFestival(festival.id)}
                          >
                              Start
                          </Button>
                        </div>
                      </div>
                    ))}
                      </div>
                    )}

                  {festivalTrophies.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium">🏆 Trophies:</h4>
                              <div className="space-y-1">
                        {festivalTrophies.slice(-3).map((trophy, i) => (
                          <div key={i} className="text-xs bg-yellow-50 p-2 rounded">
                            {FESTIVALS.find(f => f.id === trophy.festival)?.emoji} Score: {trophy.score}
                        </div>
                      ))}
                    </div>
                                      </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="p-3 rounded border bg-white">
                      <h4 className="font-medium text-sm">📅 5‑Day Forecast</h4>
                      <div className="flex gap-2 mt-2 text-xs">
                        {forecast.map(f => (
                          <div key={f.day} className="px-2 py-1 rounded border">
                            <div>Day {f.day}</div>
                            <div>{WEATHER_TYPES[f.type]?.emoji} {WEATHER_TYPES[f.type]?.name}</div>
                          </div>
                        ))}
                        {forecast.length === 0 && <div className="text-xs text-gray-500">No forecast yet</div>}
                      </div>
                    </div>

                    <div className="p-3 rounded border bg-white">
                      <h4 className="font-medium text-sm">⚠️ Disasters & Insurance</h4>
                      <div className="text-xs">Status: {activeDisaster ? `${DISASTERS[activeDisaster.key]?.emoji} ${DISASTERS[activeDisaster.key]?.name} (ends in ${formatTimeRemaining(activeDisaster.endsAt - nowSec())})` : 'None'}</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="text-xs" onClick={() => setInsurance({ level: 1, expiresAt: nowSec() + 3600 })}>
                          Buy Insurance (1h)
                        </Button>
                        {insurance.expiresAt > nowSec() && (
                          <span className="text-xs text-green-700">Active for {formatTimeRemaining(insurance.expiresAt - nowSec())}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Insurance mitigates disaster penalties.</p>
                    </div>
                  </div>
                 </TabsContent>

                <TabsContent value="genetics" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">🧪 Genetic Lab Level {geneticLab.level}</h3>
                    <p className="text-sm">Experience: {geneticLab.experience}/100</p>
                    <p className="text-sm">Breeding Slots: {geneticLab.breedingSlots}</p>
                        <Button
                          size="sm"
                      className="mt-2"
                      onClick={upgradeGeneticLab}
                      disabled={coins < geneticLab.level * 200}
                        >
                      Upgrade Lab ({geneticLab.level * 200}💰)
                        </Button>
                    </div>

                  <div>
                    <h4 className="font-medium">🏦 Gene Bank ({Object.keys(cropGeneBank).length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.entries(cropGeneBank).slice(-5).map(([id, crop]) => (
                        <div key={id} className="text-xs bg-green-50 p-2 rounded border">
                          <div className="flex items-center justify-between">
                            <span>{DEFAULT_RULES.seeds[crop.seed]?.emoji} {crop.seed} Gen{crop.generation}</span>
                            <Badge variant="outline" className="text-xs">
                              {crop.traits.length} traits
                            </Badge>
                              </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {crop.traits.map(trait => (
                              <span key={trait} className="text-xs bg-blue-100 px-1 rounded">
                                {CROP_GENETIC_TRAITS[trait]?.emoji}
                              </span>
                            ))}
                            </div>
                          </div>
                        ))}
                      {Object.keys(cropGeneBank).length === 0 && (
                        <p className="text-sm text-gray-500">No crops in gene bank. Harvest crops to add them!</p>
                      )}
                      </div>
                    </div>

                  <div>
                    <h4 className="font-medium">🔬 Active Projects ({activeBreedingProjects.length}/{geneticLab.breedingSlots})</h4>
                      <div className="space-y-2">
                      {activeBreedingProjects.map(project => {
                        const parent1 = cropGeneBank[project.parent1];
                        const parent2 = cropGeneBank[project.parent2];
                        const remaining = Math.max(0, project.endTime - currentTime);
                            return (
                          <div key={project.id} className="text-xs bg-yellow-50 p-2 rounded border">
                                <div className="flex items-center justify-between">
                              <span>{parent1?.seed} × {parent2?.seed}</span>
                              <span>{remaining}s</span>
                                      </div>
                            <Progress value={((120 - remaining) / 120) * 100} className="h-1 mt-1" />
                                    </div>
                        );
                      })}
                                  </div>
                  </div>

                  <div>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                        // Quick demo: add current selected seed to gene bank
                        if (selectedSeed && DEFAULT_RULES.seeds[selectedSeed]) {
                          addCropToGeneBank(selectedSeed);
                        }
                      }}
                      disabled={!selectedSeed || !DEFAULT_RULES.seeds[selectedSeed]}
                    >
                      Add {selectedSeed} to Gene Bank
                                    </Button>
                                  </div>
                </TabsContent>
                
                <TabsContent value="soil" className="space-y-3">
                  <div>
                    <h4 className="font-medium">🌱 Available Soil Types:</h4>
                    <div className="space-y-2">
                      {availableSoils.map(soilType => {
                        const soil = SOIL_TYPES[soilType];
                          return (
                          <div key={soilType} className="flex items-center justify-between bg-amber-50 p-2 rounded border">
                            <div>
                              <span className="text-sm">{soil.emoji} {soil.name}</span>
                              <p className="text-xs text-gray-600">{soil.description}</p>
                              </div>
                            <Badge variant="outline">
                              Growth: {Math.round(soil.bonuses.growth * 100)}%
                            </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  <div>
                    <h4 className="font-medium">🔓 Unlock New Soils:</h4>
                    <div className="space-y-2">
                      {Object.entries(SOIL_TYPES)
                        .filter(([type]) => !availableSoils.includes(type) && level >= SOIL_TYPES[type].unlockLevel)
                        .map(([type, soil]) => (
                          <div key={type} className="flex items-center justify-between border p-2 rounded">
                              <div>
                              <span className="text-sm">{soil.emoji} {soil.name}</span>
                              <p className="text-xs text-gray-600">Level {soil.unlockLevel} required</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => unlockSoilType(type)}
                            >
                              Unlock
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                          <div>
                    <h4 className="font-medium">🛠️ Soil Improvements:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(soilInventory).map(([type, count]) => (
                        <div key={type} className="bg-green-50 p-2 rounded border text-center">
                          <div>{SOIL_IMPROVEMENTS[type].emoji}</div>
                          <div>{type}: {count}</div>
                          </div>
                      ))}
                        </div>

                    <div className="space-y-2 mt-2">
                      <h5 className="text-sm font-medium">Buy Improvements:</h5>
                      {Object.entries(SOIL_IMPROVEMENTS).map(([type, improvement]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{improvement.emoji} {improvement.name}</span>
                          <Button
                            size="sm"
                            onClick={() => buySoilImprovement(type, 3)}
                            disabled={coins < improvement.cost * 3}
                          >
                            Buy 3 ({improvement.cost * 3}💰)
                            </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                  </TabsContent>

                <TabsContent value="companion" className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded border">
                    <h3 className="font-medium">🌸 Companion Knowledge Level {companionKnowledge.level}</h3>
                    <p className="text-sm">Discovered: {companionKnowledge.discoveredRelationships.length} relationships</p>
                    <p className="text-sm">Successful companions: {companionKnowledge.totalSuccessfulCompanions}</p>
                          </div>

                  <div>
                    <h4 className="font-medium">📊 Current Effects:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(companionBonuses).map(([plotIndex, bonus]) => {
                        const plot = plots[parseInt(plotIndex)];
                        if (!plot || !plot.seed) return null;
                        
                        return (
                          <div key={plotIndex} className="text-xs bg-green-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>Plot {parseInt(plotIndex) + 1}: {DEFAULT_RULES.seeds[plot.seed]?.emoji} {plot.seed}</span>
                              <div className="flex gap-1">
                                {bonus.growth !== 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    Growth: {Math.round(bonus.growth * 100)}%
                        </Badge>
                                )}
                                {bonus.value !== 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    Value: {Math.round(bonus.value * 100)}%
                              </Badge>
                                )}
                            </div>
                            </div>
                            </div>
                        );
                      })}
                      {Object.keys(companionBonuses).length === 0 && (
                        <p className="text-sm text-gray-500">No active companion effects. Plant crops adjacent to each other!</p>
                      )}
                      </div>
                    </div>

                                <div>
                    <h4 className="font-medium">📚 Discovered Relationships:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {companionKnowledge.discoveredRelationships.map(relationship => {
                        const [seed1, seed2] = relationship.split('-');
                        const relationshipData = COMPANION_RELATIONSHIPS[relationship];
                        
                        return (
                          <div key={relationship} className="text-xs bg-blue-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>
                                {DEFAULT_RULES.seeds[seed1]?.emoji} {seed1} + {DEFAULT_RULES.seeds[seed2]?.emoji} {seed2}
                              </span>
                              <Badge variant={relationshipData?.type === "friend" ? "default" : "destructive"} className="text-xs">
                                {relationshipData?.type === "friend" ? "🤝 Friend" : "⚔️ Enemy"}
                              </Badge>
                                </div>
                            <p className="text-xs text-gray-600 mt-1">{relationshipData?.description}</p>
                              </div>
                        );
                      })}
                      </div>
                    </div>

                  <div className="bg-yellow-50 p-3 rounded border">
                    <h4 className="font-medium">💡 Tips:</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Plant different crops next to each other to discover relationships</li>
                      <li>• Friends boost growth and value, enemies reduce them</li>
                      <li>• Garlic is friends with most crops - great companion!</li>
                      <li>• Root vegetables compete with each other for space</li>
                    </ul>
                                </div>
                </TabsContent>
                
                <TabsContent value="livestock" className="space-y-3">
                  <div className="bg-amber-50 p-3 rounded border">
                    <h3 className="font-medium">🏚️ Farm Buildings</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(BUILDINGS).map(([type, building]) => {
                        const hasIt = hasBuilding(type);
                        const canBuy = level >= building.unlockLevel && coins >= building.cost;
                        return (
                          <div key={type} className="text-center p-2 border rounded">
                            <div className="text-lg">{building.emoji}</div>
                            <div className="text-xs font-medium">{building.name}</div>
                            <div className="text-[11px] text-gray-600 mt-1">{building.description}</div>
                            <div className="text-[11px]">Cost: {building.cost}💰</div>
                            <Button
                              size="sm"
                              className="text-xs mt-1"
                              disabled={!canBuy || hasIt}
                              onClick={() => buyBuilding(type)}
                            >
                              {hasIt ? 'Owned' : 'Buy'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    </div>

                  <div>
                    <h4 className="font-medium">🐄 Livestock ({livestock.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {livestock.map(animal => {
                        const animalData = LIVESTOCK_TYPES[animal.type];
                        const timeSinceProduction = currentTime - animal.lastProduced;
                        const isReady = timeSinceProduction >= animalData.productionTime;
                        
                          return (
                          <div key={animal.id} className="text-xs bg-green-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>{animalData.emoji} {animalData.name}</span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  😊 {animal.happiness}%
                                </Badge>
                                {isReady && (
                                  <Badge variant="default" className="text-xs">
                                    {animalData.productEmoji} Ready!
                                  </Badge>
                                )}
                                </div>
                              </div>
                              </div>
                          );
                        })}
                      {livestock.length === 0 && (
                        <p className="text-sm text-gray-500">No animals yet. Buy a barn first!</p>
                      )}
                      </div>
                      </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                      <h5 className="font-medium">🥗 Feed: {animalFeed}</h5>
                                        <Button
                        size="sm"
                        onClick={() => buyFeed(20)}
                        disabled={coins < 40}
                        className="text-xs mt-1 w-full"
                      >
                        Buy Feed (40💰)
                    </Button>
                        </div>
                        <div>
                      <h5 className="font-medium">📦 Products:</h5>
                      <div className="text-xs">
                        {Object.entries(animalProducts).map(([product, count]) => (
                          count > 0 && (
                            <div key={product} className="flex items-center gap-1">
                              {product === "eggs" && "🥚"} 
                              {product === "milk" && "🥛"}
                              {product === "wool" && "🧶"}
                              {product === "truffles" && "🍄"} {count}
                        </div>
                          )
                        ))}
                      </div>
                          </div>
                        </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={collectAnimalProducts}
                        disabled={livestock.length === 0}
                        className="flex-1 text-xs"
                      >
                        Collect Products
                    </Button>
                          <Button
                        size="sm"
                        onClick={feedAnimals}
                        disabled={livestock.length === 0 || animalFeed <= 0}
                        className="flex-1 text-xs"
                      >
                        Feed Animals
                          </Button>
                                </div>
                    
                    <h5 className="text-sm font-medium">Buy Animals:</h5>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(LIVESTOCK_TYPES).map(([type, animal]) => (
                          <Button
                          key={type}
                          size="sm"
                          onClick={() => buyAnimal(type)}
                          disabled={level < animal.unlockLevel || coins < animal.cost || !hasBuilding("barn")}
                          className="text-xs p-1"
                        >
                          {animal.emoji} {animal.name}<br/>({animal.cost}💰)
                          </Button>
                                  ))}
                                </div>
                              </div>
                  </TabsContent>

                <TabsContent value="health" className="space-y-3">
                  <div className="bg-red-50 p-3 rounded border">
                    <h3 className="font-medium">🐛 Pest & Disease Management</h3>
                    <p className="text-sm text-gray-600">Keep your crops healthy!</p>
                          </div>

                  <div>
                    <h4 className="font-medium">🧪 Treatment Inventory</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(TREATMENTS).map(([type, treatment]) => (
                        <div key={type} className="flex items-center justify-between p-2 border rounded">
                          <span>{treatment.emoji} {treatment.name}</span>
                          <div className="flex items-center gap-1">
                            <span>x{treatmentInventory[type]}</span>
                        <Button
                              size="sm"
                              onClick={() => buyTreatment(type)}
                              disabled={coins < treatment.cost}
                              className="text-xs px-1 py-0"
                            >
                              Buy ({treatment.cost}💰)
                        </Button>
                        </div>
                        </div>
                      ))}
                      </div>
                    </div>

                  <div>
                    <h4 className="font-medium">⚠️ Active Issues</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {plots.map((plot, i) => {
                        const issues = [...plot.pests, ...plot.diseases];
                        if (issues.length === 0 || plot.status !== "growing") return null;
                        
                        return (
                          <div key={i} className="text-xs bg-red-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span>Plot {i + 1}: {issues.map(issue => PESTS_AND_DISEASES[issue]?.emoji).join("")}</span>
                              <div className="flex gap-1">
                                {Object.entries(TREATMENTS).map(([type, treatment]) => (
                        <Button
                                    key={type}
                          size="sm"
                                    onClick={() => treatPlot(i, type)}
                                    disabled={treatmentInventory[type] <= 0}
                                    className="text-xs px-1 py-0"
                                  >
                                    {treatment.emoji}
                        </Button>
                            ))}
                          </div>
                                </div>
                              </div>
                        );
                      })}
                      {plots.every(plot => plot.pests.length === 0 && plot.diseases.length === 0) && (
                        <p className="text-sm text-green-600">✅ All crops are healthy!</p>
                      )}
                              </div>
                          </div>
                  </TabsContent>
                
                <TabsContent value="expand" className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded border">
                    <h3 className="font-medium">📏 Farm Expansion</h3>
                    <p className="text-sm text-gray-600">Current: {size}x{size} grid ({size * size} plots)</p>
                </div>

                  <div>
                    <h4 className="font-medium">🔓 Available Expansions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[4, 5, 6, 7, 8].map(newSize => {
                        const expansionCosts = { 4: 1000, 5: 2500, 6: 5000, 7: 10000, 8: 20000 };
                        const cost = expansionCosts[newSize];
                        const canExpand = canExpandTo(newSize);
                        const isUnlocked = unlockedGridSizes.includes(newSize);
                        
                        return (
                          <div key={newSize} className="p-2 border rounded text-center">
                            <div className="font-medium">{newSize}x{newSize}</div>
                            <div className="text-xs text-gray-600">{newSize * newSize} plots</div>
                            <div className="text-xs">Level {newSize} required</div>
                            {isUnlocked ? (
                              <Badge variant="default" className="text-xs mt-1">Unlocked</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => expandGrid(newSize)}
                                disabled={!canExpand}
                                className="text-xs mt-1"
                              >
                                Expand ({cost}💰)
                      </Button>
                            )}
                  </div>
                        );
                      })}
                </div>
                </div>

                  <div className="text-xs text-gray-600">
                    <h5 className="font-medium">💡 Expansion Benefits:</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>More plots = more crops = more profit!</li>
                      <li>Larger farms unlock advanced strategies</li>
                      <li>Better companion planting opportunities</li>
                      <li>More space for specialized crop areas</li>
                    </ul>
                        </div>
                </TabsContent>
                
                <TabsContent value="statistics" className="space-y-3">
                  <div className="bg-indigo-50 p-3 rounded border">
                    <h3 className="font-medium">📊 Farm Statistics Dashboard</h3>
                    <p className="text-sm text-gray-600">Detailed analytics of your farming operation</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 p-2 rounded border">
                      <h5 className="font-medium text-sm">🌾 Production Stats</h5>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Total Harvests: {totalHarvests}</div>
                        <div>Unique Crops: {harvestedCropTypes.size}</div>
                        <div>Active Plots: {plots.filter(p => p.status === "growing").length}</div>
                        <div>Ready Plots: {plots.filter(p => p.status === "ready").length}</div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-2 rounded border">
                      <h5 className="font-medium text-sm">💰 Financial Stats</h5>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Current Coins: {coins}</div>
                        <div>Total Earned: {totalEarned}</div>
                        <div>Market Sales: {marketHistory.length}</div>
                        <div>Avg Sale: {marketHistory.length > 0 ? Math.round(marketHistory.reduce((sum, s) => sum + s.netProfit, 0) / marketHistory.length) : 0}💰</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-2 rounded border">
                      <h5 className="font-medium text-sm">🧪 Research Stats</h5>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Research Points: {researchPoints}</div>
                        <div>Completed: {completedResearch.length}/{Object.keys(RESEARCH_TREE).length}</div>
                        <div>Active Research: {activeResearch ? RESEARCH_TREE[activeResearch]?.name : "None"}</div>
                        <div>Progress: {activeResearch ? Math.round(((currentTime - researchStartTime) / RESEARCH_TREE[activeResearch].researchTime) * 100) : 0}%</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-2 rounded border">
                      <h5 className="font-medium text-sm">🏭 Processing Stats</h5>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Queue Items: {processingQueue.length}</div>
                        <div>Processed Goods: {Object.values(processedGoods).reduce((sum, v) => sum + v, 0)}</div>
                        <div>Buildings Built: {buildings.length}</div>
                        <div>Energy Available: {energyProduction - energyConsumption}</div>
                      </div>
                    </div>

                    <div className="bg-pink-50 p-2 rounded border">
                      <h5 className="font-medium text-sm">🐄 Livestock Stats</h5>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Total Animals: {livestock.length}</div>
                        <div>Animal Feed: {animalFeed}</div>
                        <div>Products Ready: {livestock.filter(a => {
                          const animalData = LIVESTOCK_TYPES[a.type];
                          return currentTime - a.lastProduced >= animalData.productionTime;
                        }).length}</div>
                        <div>Avg Happiness: {livestock.length > 0 ? Math.round(livestock.reduce((sum, a) => sum + a.happiness, 0) / livestock.length) : 0}%</div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-2 rounded border">
                      <h5 className="font-medium text-sm">🐛 Health Stats</h5>
                      <div className="text-xs space-y-1 mt-1">
                        <div>Healthy Plots: {plots.filter(p => p.health > 80).length}</div>
                        <div>Pest Issues: {plots.reduce((sum, p) => sum + p.pests.length, 0)}</div>
                        <div>Disease Issues: {plots.reduce((sum, p) => sum + p.diseases.length, 0)}</div>
                        <div>Treatments Used: {Object.values(treatmentInventory).reduce((sum, v) => sum + v, 0)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">📈 Performance Metrics:</h4>
                    <div className="bg-gray-100 p-2 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Coins per Harvest: {totalHarvests > 0 ? Math.round(totalEarned / totalHarvests) : 0}</div>
                        <div>Harvests per Day: {Math.round(totalHarvests / Math.max(1, (currentTime - 1) / 86400))}</div>
                        <div>Research Efficiency: {totalHarvests > 0 ? Math.round((researchPoints / totalHarvests) * 100) : 0}%</div>
                        <div>Automation Level: {Math.round((plots.reduce((sum, p) => sum + p.automation.length, 0) / plots.length) * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">🏆 Farm Rankings:</h4>
                    <div className="space-y-1">
                      <div className="text-xs bg-gold-50 p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span>Overall Farm Score</span>
                          <Badge variant="outline">{score} points</Badge>
                        </div>
                      </div>
                      <div className="text-xs bg-silver-50 p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span>Efficiency Rating</span>
                          <Badge variant="outline">
                            {score > 1000 ? "S" : score > 500 ? "A" : score > 200 ? "B" : score > 50 ? "C" : "D"} Rank
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs bg-bronze-50 p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span>Achievements Progress</span>
                          <Badge variant="outline">{Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded border">
                    <h3 className="font-medium">🏆 Achievement Progress</h3>
                    <p className="text-sm">Unlocked: {unlockedAchievements.length}/{ACHIEVEMENTS.length}</p>
                    <Progress value={(unlockedAchievements.length / ACHIEVEMENTS.length) * 100} className="mt-2" />
                            </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ACHIEVEMENTS.map(achievement => {
                      const isUnlocked = unlockedAchievements.includes(achievement.id);
                      let progress = 0;
                      let progressText = "";
                      
                      // Calculate progress for trackable achievements
                      switch (achievement.id) {
                        case "master_farmer":
                          progress = Math.min(totalHarvests, achievement.target);
                          progressText = `${progress}/${achievement.target}`;
                          break;
                        case "green_thumb":
                          progress = Math.min(harvestedCropTypes.size, achievement.target);
                          progressText = `${progress}/${achievement.target}`;
                          break;
                        case "festival_champion":
                          progress = Math.min(festivalTrophies.length, achievement.target);
                          progressText = `${progress}/${achievement.target}`;
                          break;
                        case "genetics_researcher":
                          progress = Math.min(discoveredHybrids.length, achievement.target);
                          progressText = `${progress}/${achievement.target}`;
                          break;
                        case "companion_expert":
                          progress = Math.min(companionKnowledge.discoveredRelationships.length, achievement.target);
                          progressText = `${progress}/${achievement.target}`;
                          break;
                        case "millionaire":
                          progress = Math.min(totalEarned, achievement.target);
                          progressText = `${progress.toLocaleString()}/${achievement.target.toLocaleString()}`;
                          break;
                        default:
                          progressText = isUnlocked ? "Complete!" : "In Progress";
                      }
                      
                      return (
                        <div key={achievement.id} className={`p-3 rounded border ${isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                              <span className="text-lg">{achievement.emoji}</span>
                              <div>
                                <h4 className="font-medium text-sm">{achievement.name}</h4>
                                <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
                            <div className="text-right">
                              {isUnlocked ? (
                                <Badge variant="default" className="text-xs">Unlocked!</Badge>
                              ) : (
                                <div className="text-xs text-gray-500">
                                  <div>{progressText}</div>
                                  <div className="text-yellow-600">+{achievement.reward} coins</div>
                </div>
                        )}
                      </div>
                    </div>
                          {achievement.target && !isUnlocked && (
                            <Progress value={(progress / achievement.target) * 100} className="mt-2 h-1" />
                          )}
                    </div>
                      );
                    })}
                </div>
                </TabsContent>

                  <div>
                    <h4 className="font-medium">🎖️ Market Perks:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mt-1">
                      <div className="p-2 border rounded">
                        <div className="font-medium">Brand License</div>
                        <div className="text-gray-600">Label bonus on premium goods</div>
                        <Button size="sm" className="text-xs mt-1" disabled={marketPerks.brandLicense || coins < 500}
                          onClick={() => { setCoins(prev=>prev-500); setMarketPerks(prev=>({...prev, brandLicense:true})); addNotification('Purchased Brand License','success'); }}> {marketPerks.brandLicense? 'Owned':'Buy (500💰)'} </Button>
                      </div>
                      <div className="p-2 border rounded">
                        <div className="font-medium">Contract Bureau</div>
                        <div className="text-gray-600">Reroll 1 contract/hour</div>
                        <Button size="sm" className="text-xs mt-1" disabled={marketPerks.contractBureau || coins < 400}
                          onClick={() => { setCoins(prev=>prev-400); setMarketPerks(prev=>({...prev, contractBureau:true})); addNotification('Purchased Contract Bureau','success'); }}> {marketPerks.contractBureau? 'Owned':'Buy (400💰)'} </Button>
                      </div>
                        <div className="p-2 border rounded">
                          <div className="font-medium">Festival Booth</div>
                          <div className="text-gray-600">Festival sales +20%</div>
                          <Button size="sm" className="text-xs mt-1" disabled={marketPerks.festivalBooth || coins < 300}
                            onClick={() => { setCoins(prev=>prev-300); setMarketPerks(prev=>({...prev, festivalBooth:true})); addNotification('Purchased Festival Booth','success'); }}> {marketPerks.festivalBooth? 'Owned':'Buy (300💰)'} </Button>
                        </div>
                      </div>
                </TabsContent>
              </div>
              </div>
              </Tabs>
              </CardContent>
            </Card>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="mt-4 space-y-2">
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-2 rounded text-sm ${
                    notif.type === "error" ? "bg-red-100 text-red-800" :
                    notif.type === "success" ? "bg-green-100 text-green-800" :
                    "bg-blue-100 text-blue-800"
                  }`}
                >
                  {notif.msg}
                </div>
              ))}
                  </div>
                )}

          {/* Info */}
          <Card className="mt-4">
                <CardHeader>
              <CardTitle className="text-sm">ℹ️ Instructions</CardTitle>
                </CardHeader>
              <CardContent>
              <div className="text-xs space-y-1">
                <p>🌱 Click empty plots to plant seeds</p>
                <p>🌾 Click ready crops to harvest</p>
                <p>💰 Earn coins to buy more seeds</p>
                <p>⏱️ Crops grow automatically over time</p>
                  </div>
                </CardContent>
              </Card>
        </div>
      </div>
    </div>
  );
}
