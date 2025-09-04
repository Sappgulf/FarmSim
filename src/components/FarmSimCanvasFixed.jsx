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

// Research System
// Daily Challenges
const DAILY_CHALLENGES = {
  harvest_10: {
    id: "harvest_10",
    name: "Harvest Master",
    description: "Harvest 10 crops",
    emoji: "🌾",
    target: 10,
    reward: { coins: 100, xp: 50 },
    type: "harvest",
    difficulty: "easy"
  },
  
  plant_15: {
    id: "plant_15",
    name: "Green Thumb",
    description: "Plant 15 seeds",
    emoji: "🌱",
    target: 15,
    reward: { coins: 75, xp: 40 },
    type: "plant",
    difficulty: "easy"
  },
  
  earn_500: {
    id: "earn_500",
    name: "Coin Collector",
    description: "Earn 500 coins",
    emoji: "🪙",
    target: 500,
    reward: { coins: 150, xp: 60 },
    type: "coins",
    difficulty: "medium"
  },
  
  process_5: {
    id: "process_5",
    name: "Factory Worker",
    description: "Process 5 items",
    emoji: "🏭",
    target: 5,
    reward: { coins: 200, xp: 80 },
    type: "process",
    difficulty: "medium"
  },
  
  research_complete: {
    id: "research_complete",
    name: "Scientist",
    description: "Complete a research project",
    emoji: "🔬",
    target: 1,
    reward: { coins: 300, researchPoints: 20 },
    type: "research",
    difficulty: "hard"
  },
  
  combo_5: {
    id: "combo_5",
    name: "Combo King",
    description: "Achieve a 5x combo",
    emoji: "⚡",
    target: 5,
    reward: { coins: 250, xp: 100 },
    type: "combo",
    difficulty: "hard"
  },
  
  no_wither: {
    id: "no_wither",
    name: "Perfect Farmer",
    description: "No crops wither today",
    emoji: "✨",
    target: 0,
    reward: { coins: 400, xp: 150 },
    type: "no_wither",
    difficulty: "hard"
  }
};

// Quest System
const QUESTS = {
  // Tutorial Quests
  first_harvest: {
    id: "first_harvest",
    name: "First Harvest",
    description: "Plant and harvest your first crop",
    emoji: "🌱",
    type: "tutorial",
    requirements: { harvests: 1 },
    rewards: { coins: 50, xp: 20 },
    unlocks: ["water_master"],
    story: "Welcome to your farm! Let's start with the basics."
  },
  
  water_master: {
    id: "water_master",
    name: "Water Master",
    description: "Water 5 crops",
    emoji: "💧",
    type: "tutorial",
    requirements: { watered: 5 },
    rewards: { coins: 75, tool: "wateringCan" },
    unlocks: ["tool_collector"],
    story: "Great! Now let's learn about keeping crops healthy."
  },
  
  tool_collector: {
    id: "tool_collector",
    name: "Tool Collector",
    description: "Buy 3 different tools",
    emoji: "🛠️",
    type: "tutorial",
    requirements: { toolsOwned: 3 },
    rewards: { coins: 100, xp: 50 },
    unlocks: ["expansion_time"],
    story: "Tools make farming easier. Collect them all!"
  },
  
  // Main Story Quests
  expansion_time: {
    id: "expansion_time",
    name: "Expansion Time",
    description: "Expand your farm to 5x5",
    emoji: "📏",
    type: "main",
    requirements: { gridSize: 5 },
    rewards: { coins: 200, seeds: { corn: 5 } },
    unlocks: ["building_basics"],
    story: "Your farm is growing! Time to expand."
  },
  
  building_basics: {
    id: "building_basics",
    name: "Building Basics",
    description: "Build your first building",
    emoji: "🏗️",
    type: "main",
    requirements: { buildings: 1 },
    rewards: { coins: 300, xp: 100 },
    unlocks: ["livestock_lover"],
    story: "Buildings provide bonuses and new opportunities."
  },
  
  livestock_lover: {
    id: "livestock_lover",
    name: "Livestock Lover",
    description: "Own 3 animals",
    emoji: "🐄",
    type: "main",
    requirements: { animals: 3 },
    rewards: { coins: 500, building: "barn" },
    unlocks: ["master_farmer"],
    story: "Animals are a farmer's best friend!"
  },
  
  // Side Quests
  combo_master: {
    id: "combo_master",
    name: "Combo Master",
    description: "Achieve a 10x harvest combo",
    emoji: "⚡",
    type: "side",
    requirements: { combo: 10 },
    rewards: { coins: 400, skillPoints: 1 },
    repeatable: false,
    story: "Chain harvests for maximum profit!"
  },
  
  breed_hybrid: {
    id: "breed_hybrid",
    name: "Genetic Pioneer",
    description: "Breed your first hybrid crop",
    emoji: "🧬",
    type: "side",
    requirements: { hybridsCreated: 1 },
    rewards: { coins: 600, researchPoints: 30 },
    repeatable: false,
    story: "Discover the secrets of crop genetics."
  },
  
  pet_paradise: {
    id: "pet_paradise",
    name: "Pet Paradise",
    description: "Adopt 2 pets and keep them happy",
    emoji: "🐾",
    type: "side",
    requirements: { pets: 2, petHappiness: 80 },
    rewards: { coins: 700, petFood: 20 },
    repeatable: false,
    story: "Pets bring joy and bonuses to your farm."
  },
  
  // Repeatable Quests
  daily_grind: {
    id: "daily_grind",
    name: "Daily Grind",
    description: "Harvest 20 crops",
    emoji: "🌾",
    type: "daily",
    requirements: { harvests: 20 },
    rewards: { coins: 150, xp: 75 },
    repeatable: true,
    cooldown: 86400,
    story: "Keep the harvest going!"
  },
  
  market_trader: {
    id: "market_trader",
    name: "Market Trader",
    description: "Sell 10 processed goods",
    emoji: "📦",
    type: "daily",
    requirements: { processedSold: 10 },
    rewards: { coins: 250, processingTime: -10 },
    repeatable: true,
    cooldown: 86400,
    story: "The market loves your processed goods!"
  }
};

// Quest System
const QUEST_CHAINS = {
  tutorial: {
    id: "tutorial",
    name: "Getting Started",
    description: "Learn the basics of farming",
    quests: [
      {
        id: "first_plant",
        title: "Your First Crop",
        description: "Plant your first seed",
        objective: { type: "plant", target: 1 },
        reward: { coins: 50, xp: 20 },
        dialogue: "Welcome to your farm! Let's start by planting a seed."
      },
      {
        id: "first_water",
        title: "Water Works",
        description: "Water a planted crop",
        objective: { type: "water", target: 1 },
        reward: { coins: 30, item: { wateringCan: 1 } },
        dialogue: "Great! Now water your crop to help it grow."
      },
      {
        id: "first_harvest",
        title: "Harvest Time",
        description: "Harvest your first crop",
        objective: { type: "harvest", target: 1 },
        reward: { coins: 100, xp: 50 },
        dialogue: "Perfect! You've completed your first harvest!"
      }
    ]
  },
  
  expansion: {
    id: "expansion",
    name: "Growing Business",
    description: "Expand your farming operation",
    quests: [
      {
        id: "expand_grid",
        title: "More Land",
        description: "Expand your farm grid",
        objective: { type: "expand", target: 1 },
        reward: { coins: 200, seeds: { corn: 5 } },
        dialogue: "Your farm is growing! Time to expand."
      },
      {
        id: "build_first",
        title: "Construction Time",
        description: "Build your first building",
        objective: { type: "build", target: 1 },
        reward: { coins: 300, xp: 100 },
        dialogue: "Buildings will help boost your farm's productivity!"
      },
      {
        id: "hire_worker",
        title: "Help Wanted",
        description: "Hire your first worker",
        objective: { type: "hire", target: 1 },
        reward: { coins: 500, skillPoints: 1 },
        dialogue: "Workers can automate tasks for you!"
      }
    ]
  },
  
  mastery: {
    id: "mastery",
    name: "Master Farmer",
    description: "Become a farming expert",
    quests: [
      {
        id: "breed_hybrid",
        title: "Genetic Genius",
        description: "Breed your first hybrid crop",
        objective: { type: "breed", target: 1 },
        reward: { coins: 1000, researchPoints: 50 },
        dialogue: "Time to experiment with crop genetics!"
      },
      {
        id: "adopt_pet",
        title: "Animal Friend",
        description: "Adopt a pet companion",
        objective: { type: "adopt_pet", target: 1 },
        reward: { coins: 750, xp: 200 },
        dialogue: "Pets provide valuable bonuses to your farm!"
      },
      {
        id: "complete_research",
        title: "Scientific Breakthrough",
        description: "Complete a research project",
        objective: { type: "research", target: 1 },
        reward: { coins: 1500, skillPoints: 2 },
        dialogue: "Research unlocks powerful new abilities!"
      }
    ]
  },
  
  seasonal: {
    id: "seasonal",
    name: "Seasonal Stories",
    description: "Special seasonal quests",
    quests: [
      {
        id: "spring_bloom",
        title: "Spring Bloom",
        description: "Plant 20 crops in spring",
        objective: { type: "plant_season", target: 20, season: "spring" },
        reward: { coins: 600, seeds: { strawberry: 10 } },
        dialogue: "Spring is the perfect time for planting!"
      },
      {
        id: "summer_harvest",
        title: "Summer Bounty",
        description: "Harvest 30 crops in summer",
        objective: { type: "harvest_season", target: 30, season: "summer" },
        reward: { coins: 800, xp: 300 },
        dialogue: "Summer crops are ready for harvest!"
      },
      {
        id: "autumn_process",
        title: "Autumn Processing",
        description: "Process 15 items in autumn",
        objective: { type: "process_season", target: 15, season: "autumn" },
        reward: { coins: 1000, item: { fertilizer: 10 } },
        dialogue: "Autumn is perfect for processing your harvest!"
      }
    ]
  }
};

// Inventory System
const INVENTORY_CATEGORIES = {
  seeds: {
    name: "Seeds",
    emoji: "🌱",
    items: ["carrot", "potato", "corn", "tomato", "wheat", "strawberry", "pumpkin", "sunflower"],
    stackSize: 99,
    description: "Plant these to grow crops"
  },
  crops: {
    name: "Harvested Crops",
    emoji: "🌾",
    items: ["harvested_carrot", "harvested_potato", "harvested_corn", "harvested_tomato", 
             "harvested_wheat", "harvested_strawberry", "harvested_pumpkin", "harvested_sunflower"],
    stackSize: 99,
    description: "Raw crops ready for sale or processing"
  },
  processed: {
    name: "Processed Goods",
    emoji: "🥫",
    items: ["carrot_juice", "potato_chips", "corn_oil", "tomato_sauce", 
             "wheat_flour", "strawberry_jam", "pumpkin_pie", "sunflower_oil"],
    stackSize: 50,
    description: "Processed items worth more"
  },
  tools: {
    name: "Tools",
    emoji: "🔧",
    items: ["wateringCan", "fertilizer", "pesticide", "harvester", "sprinkler"],
    stackSize: 10,
    description: "Tools to help your farming"
  },
  special: {
    name: "Special Items",
    emoji: "⭐",
    items: ["golden_seed", "magic_fertilizer", "time_crystal", "weather_charm"],
    stackSize: 5,
    description: "Rare and powerful items"
  },
  hybrid: {
    name: "Hybrid Seeds",
    emoji: "🧬",
    items: Object.keys(HYBRID_CROPS),
    stackSize: 20,
    description: "Genetically modified seeds"
  }
};

const STORAGE_UPGRADES = [
  { level: 1, capacity: 100, cost: 0, name: "Basic Shed" },
  { level: 2, capacity: 200, cost: 500, name: "Storage Barn" },
  { level: 3, capacity: 350, cost: 1500, name: "Warehouse" },
  { level: 4, capacity: 500, cost: 3000, name: "Grand Silo" },
  { level: 5, capacity: 1000, cost: 10000, name: "Mega Storage" }
];

// Pets System
const PET_TYPES = {
  dog: {
    id: "dog",
    name: "Dog",
    emoji: "🐕",
    price: 500,
    happiness: 100,
    energy: 100,
    abilities: ["guard", "fetch"],
    description: "Protects crops from pests, finds items",
    feedCost: 5,
    bonuses: { pestProtection: 0.5, itemFind: 0.1 }
  },
  
  cat: {
    id: "cat",
    name: "Cat",
    emoji: "🐈",
    price: 400,
    happiness: 100,
    energy: 100,
    abilities: ["hunt", "luck"],
    description: "Catches pests, brings good luck",
    feedCost: 4,
    bonuses: { pestControl: 0.3, luckBonus: 0.15 }
  },
  
  rabbit: {
    id: "rabbit",
    name: "Rabbit",
    emoji: "🐰",
    price: 300,
    happiness: 100,
    energy: 100,
    abilities: ["fertilize", "speed"],
    description: "Fertilizes nearby plots, speeds growth",
    feedCost: 3,
    bonuses: { fertilizer: 0.2, growthSpeed: 0.1 }
  },
  
  bird: {
    id: "bird",
    name: "Bird",
    emoji: "🦜",
    price: 350,
    happiness: 100,
    energy: 100,
    abilities: ["scout", "sing"],
    description: "Finds rare seeds, boosts happiness",
    feedCost: 2,
    bonuses: { seedFind: 0.15, happiness: 0.2 }
  },
  
  turtle: {
    id: "turtle",
    name: "Turtle",
    emoji: "🐢",
    price: 600,
    happiness: 100,
    energy: 100,
    abilities: ["patience", "wisdom"],
    description: "Increases quality, reduces water needs",
    feedCost: 3,
    bonuses: { quality: 0.25, waterEfficiency: 0.3 }
  },
  
  hamster: {
    id: "hamster",
    name: "Hamster",
    emoji: "🐹",
    price: 250,
    happiness: 100,
    energy: 100,
    abilities: ["store", "multiply"],
    description: "Stores extra seeds, breeds quickly",
    feedCost: 2,
    bonuses: { storage: 0.3, breeding: 0.2 }
  }
};

const PET_ACTIVITIES = {
  play: { energy: -10, happiness: +20, time: 5, emoji: "🎾" },
  feed: { energy: +30, happiness: +10, time: 3, emoji: "🍖" },
  pet: { energy: 0, happiness: +15, time: 2, emoji: "💝" },
  train: { energy: -20, happiness: +5, time: 10, emoji: "🎯" },
  sleep: { energy: +50, happiness: +5, time: 30, emoji: "😴" }
};

// Crop Breeding System
const HYBRID_CROPS = {
  super_carrot: {
    id: "super_carrot",
    name: "Super Carrot",
    emoji: "🥕✨",
    parents: ["carrot", "carrot"],
    price: 30,
    time: 8,
    stages: 3,
    secondsPerStage: 3,
    processable: true,
    traits: { yield: 2, growthSpeed: 1.2, value: 1.5 }
  },
  
  golden_potato: {
    id: "golden_potato",
    name: "Golden Potato",
    emoji: "🥔💛",
    parents: ["potato", "potato"],
    price: 35,
    time: 10,
    stages: 3,
    secondsPerStage: 4,
    processable: true,
    traits: { yield: 1.5, value: 2 }
  },
  
  rainbow_corn: {
    id: "rainbow_corn",
    name: "Rainbow Corn",
    emoji: "🌽🌈",
    parents: ["corn", "tomato"],
    price: 45,
    time: 12,
    stages: 4,
    secondsPerStage: 3,
    processable: true,
    traits: { yield: 3, value: 1.8 }
  },
  
  giant_tomato: {
    id: "giant_tomato",
    name: "Giant Tomato",
    emoji: "🍅🔴",
    parents: ["tomato", "tomato"],
    price: 40,
    time: 11,
    stages: 3,
    secondsPerStage: 4,
    processable: true,
    traits: { yield: 2.5, size: 2 }
  },
  
  crystal_wheat: {
    id: "crystal_wheat",
    name: "Crystal Wheat",
    emoji: "🌾💎",
    parents: ["wheat", "wheat"],
    price: 50,
    time: 14,
    stages: 4,
    secondsPerStage: 4,
    processable: true,
    traits: { value: 3, quality: 2 }
  },
  
  fire_pepper: {
    id: "fire_pepper",
    name: "Fire Pepper",
    emoji: "🌶️🔥",
    parents: ["pepper", "pepper"],
    price: 55,
    time: 13,
    stages: 3,
    secondsPerStage: 5,
    processable: false,
    traits: { value: 2.5, spicy: 3 }
  },
  
  frost_melon: {
    id: "frost_melon",
    name: "Frost Melon",
    emoji: "🍉❄️",
    parents: ["watermelon", "watermelon"],
    price: 60,
    time: 15,
    stages: 4,
    secondsPerStage: 4,
    processable: false,
    traits: { value: 2.2, cold_resist: 2 }
  },
  
  mystic_berry: {
    id: "mystic_berry",
    name: "Mystic Berry",
    emoji: "🫐✨",
    parents: ["blueberry", "strawberry"],
    price: 65,
    time: 16,
    stages: 3,
    secondsPerStage: 6,
    processable: true,
    traits: { value: 3.5, magic: 1 }
  }
};

const BREEDING_COMBINATIONS = {
  "carrot+carrot": "super_carrot",
  "potato+potato": "golden_potato",
  "corn+tomato": "rainbow_corn",
  "tomato+corn": "rainbow_corn",
  "tomato+tomato": "giant_tomato",
  "wheat+wheat": "crystal_wheat",
  "pepper+pepper": "fire_pepper",
  "watermelon+watermelon": "frost_melon",
  "blueberry+strawberry": "mystic_berry",
  "strawberry+blueberry": "mystic_berry"
};

// Weekly Challenges
const WEEKLY_CHALLENGES = {
  harvest_100: {
    id: "harvest_100",
    name: "Harvest Legend",
    description: "Harvest 100 crops",
    emoji: "🏆",
    target: 100,
    reward: { coins: 1000, xp: 500, skillPoints: 2 },
    type: "harvest",
    difficulty: "epic"
  },
  
  earn_5000: {
    id: "earn_5000",
    name: "Rich Farmer",
    description: "Earn 5000 coins",
    emoji: "💰",
    target: 5000,
    reward: { coins: 1500, xp: 750, researchPoints: 50 },
    type: "coins",
    difficulty: "epic"
  },
  
  complete_all_daily: {
    id: "complete_all_daily",
    name: "Daily Champion",
    description: "Complete all daily challenges for 7 days",
    emoji: "🎯",
    target: 7,
    reward: { coins: 2000, xp: 1000, skillPoints: 3 },
    type: "daily_streak",
    difficulty: "epic"
  },
  
  hire_5_workers: {
    id: "hire_5_workers",
    name: "Boss Mode",
    description: "Have 5 workers at once",
    emoji: "👷",
    target: 5,
    reward: { coins: 2500, xp: 800 },
    type: "workers",
    difficulty: "epic"
  },
  
  max_grid: {
    id: "max_grid",
    name: "Land Baron",
    description: "Expand to maximum grid size",
    emoji: "🗺️",
    target: 6,
    reward: { coins: 3000, xp: 1500, researchPoints: 100 },
    type: "grid",
    difficulty: "legendary"
  }
};

// Random Events
const RANDOM_EVENTS = {
  // Positive events
  rain_blessing: {
    id: "rain_blessing",
    name: "Blessed Rain",
    emoji: "🌧️",
    description: "A gentle rain waters all your crops!",
    type: "positive",
    effect: () => ({ action: "water_all" }),
    chance: 0.05,
    message: "The blessed rain has watered all your crops!"
  },
  
  bumper_harvest: {
    id: "bumper_harvest",
    name: "Bumper Harvest",
    emoji: "🌾",
    description: "Your next harvest yields double!",
    type: "positive",
    effect: () => ({ action: "double_harvest", duration: 1 }),
    chance: 0.03,
    message: "Bumper harvest! Your next harvest will yield double!"
  },
  
  market_boom: {
    id: "market_boom",
    name: "Market Boom",
    emoji: "📈",
    description: "Crop prices increase by 50% temporarily!",
    type: "positive",
    effect: () => ({ action: "price_boost", multiplier: 1.5, duration: 60 }),
    chance: 0.04,
    message: "Market boom! Prices are up 50% for the next minute!"
  },
  
  treasure_find: {
    id: "treasure_find",
    name: "Found Treasure",
    emoji: "💎",
    description: "You found buried treasure!",
    type: "positive",
    effect: () => ({ action: "add_coins", amount: Math.floor(50 + Math.random() * 150) }),
    chance: 0.02,
    message: "You found buried treasure!"
  },
  
  fairy_visit: {
    id: "fairy_visit",
    name: "Fairy Visit",
    emoji: "🧚",
    description: "A fairy instantly grows one of your crops!",
    type: "positive",
    effect: () => ({ action: "instant_grow" }),
    chance: 0.03,
    message: "A fairy blessed one of your crops with instant growth!"
  },
  
  // Negative events
  pest_invasion: {
    id: "pest_invasion",
    name: "Pest Invasion",
    emoji: "🐛",
    description: "Pests damage some of your crops!",
    type: "negative",
    effect: () => ({ action: "damage_crops", count: 2 }),
    chance: 0.04,
    message: "Pest invasion! Some crops were damaged!"
  },
  
  drought: {
    id: "drought",
    name: "Drought",
    emoji: "☀️",
    description: "All crops dry out faster!",
    type: "negative",
    effect: () => ({ action: "drought", duration: 120 }),
    chance: 0.03,
    message: "Drought conditions! Crops need more water!"
  },
  
  market_crash: {
    id: "market_crash",
    name: "Market Crash",
    emoji: "📉",
    description: "Crop prices drop by 30%!",
    type: "negative",
    effect: () => ({ action: "price_drop", multiplier: 0.7, duration: 60 }),
    chance: 0.03,
    message: "Market crash! Prices down 30% for the next minute!"
  },
  
  storm: {
    id: "storm",
    name: "Storm",
    emoji: "⛈️",
    description: "A storm destroys some grown crops!",
    type: "negative",
    effect: () => ({ action: "destroy_grown", count: 1 }),
    chance: 0.02,
    message: "A storm destroyed some of your crops!"
  },
  
  // Neutral events
  merchant_visit: {
    id: "merchant_visit",
    name: "Traveling Merchant",
    emoji: "🧳",
    description: "A merchant offers special deals!",
    type: "neutral",
    effect: () => ({ action: "merchant_offer" }),
    chance: 0.05,
    message: "A traveling merchant has arrived with special offers!"
  },
  
  mystery_seeds: {
    id: "mystery_seeds",
    name: "Mystery Seeds",
    emoji: "❓",
    description: "You found mysterious seeds!",
    type: "neutral",
    effect: () => ({ action: "add_random_seeds", amount: 3 }),
    chance: 0.04,
    message: "You found some mystery seeds!"
  }
};

const RESEARCH_PROJECTS = {
  crop_genetics: {
    name: "Crop Genetics",
    emoji: "🧬",
    description: "Unlock hybrid seeds",
    cost: 100,
    time: 120, // seconds
    requires: [],
    unlocks: ["hybrid_seeds"],
  },
  automation_basics: {
    name: "Automation Basics",
    emoji: "⚙️",
    description: "Improve worker efficiency",
    cost: 150,
    time: 180,
    requires: [],
    unlocks: ["worker_efficiency"],
  },
  advanced_fertilizer: {
    name: "Advanced Fertilizer",
    emoji: "🧪",
    description: "Develop super fertilizer",
    cost: 200,
    time: 240,
    requires: ["crop_genetics"],
    unlocks: ["super_fertilizer"],
  },
  weather_control: {
    name: "Weather Control",
    emoji: "🌤️",
    description: "Influence weather patterns",
    cost: 300,
    time: 300,
    requires: ["automation_basics"],
    unlocks: ["weather_machine"],
  },
  quantum_farming: {
    name: "Quantum Farming",
    emoji: "⚛️",
    description: "Instant growth technology",
    cost: 500,
    time: 600,
    requires: ["advanced_fertilizer", "weather_control"],
    unlocks: ["instant_grow"],
  },
};

// Workers System
const WORKER_TYPES = {
  planter: {
    name: "Planter",
    emoji: "👨‍🌾",
    cost: 100,
    upkeep: 5, // Cost per minute
    description: "Automatically plants seeds",
    action: "plant",
    interval: 10, // seconds
  },
  waterer: {
    name: "Waterer",
    emoji: "💧",
    cost: 150,
    upkeep: 7,
    description: "Automatically waters crops",
    action: "water",
    interval: 8,
  },
  harvester: {
    name: "Harvester",
    emoji: "🌾",
    cost: 200,
    upkeep: 10,
    description: "Automatically harvests ready crops",
    action: "harvest",
    interval: 5,
  },
  processor: {
    name: "Processor",
    emoji: "🏭",
    cost: 300,
    upkeep: 15,
    description: "Automatically processes items",
    action: "process",
    interval: 20,
  },
  trader: {
    name: "Trader",
    emoji: "💼",
    cost: 500,
    upkeep: 20,
    description: "Automatically sells at best prices",
    action: "trade",
    interval: 30,
  },
};

// Market System
const MARKET_TRENDS = {
  high_demand: { multiplier: 1.5, name: "📈 High Demand", color: "text-green-600" },
  normal: { multiplier: 1.0, name: "📊 Normal", color: "text-gray-600" },
  low_demand: { multiplier: 0.7, name: "📉 Low Demand", color: "text-red-600" },
};

const MARKET_EVENTS = [
  { id: "drought", name: "Drought", emoji: "🏜️", description: "Water crops in high demand", duration: 60, affects: ["watermelon", "tomato"], multiplier: 2.0 },
  { id: "festival", name: "Harvest Festival", emoji: "🎉", description: "All crops sell for more", duration: 45, affects: "all", multiplier: 1.3 },
  { id: "shortage", name: "Food Shortage", emoji: "🚨", description: "Basic crops in demand", duration: 50, affects: ["carrot", "potato", "corn"], multiplier: 1.8 },
  { id: "luxury", name: "Luxury Trend", emoji: "💎", description: "Rare crops worth more", duration: 40, affects: ["golden_corn", "diamond_berry"], multiplier: 2.5 },
  { id: "recession", name: "Recession", emoji: "💸", description: "All prices down", duration: 60, affects: "all", multiplier: 0.6 },
];

// Skills System
const SKILL_TREES = {
  farming: {
    name: "Farming",
    icon: "🌾",
    skills: {
      harvest_master: {
        name: "Harvest Master",
        description: "+10% harvest value",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5],
        effect: "harvest_bonus",
        value: 0.1
      },
      growth_boost: {
        name: "Growth Boost", 
        description: "+5% growth speed",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5],
        effect: "growth_speed",
        value: 0.05
      },
      green_thumb: {
        name: "Green Thumb",
        description: "Double harvest chance",
        maxLevel: 3,
        cost: [3, 5, 8],
        effect: "double_harvest",
        value: 0.1
      }
    }
  },
  business: {
    name: "Business",
    icon: "💼",
    skills: {
      merchant: {
        name: "Merchant",
        description: "+5% sell price",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5],
        effect: "sell_bonus",
        value: 0.05
      },
      negotiator: {
        name: "Negotiator",
        description: "-5% shop prices",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5],
        effect: "buy_discount",
        value: 0.05
      },
      investor: {
        name: "Investor",
        description: "+2 coins/minute",
        maxLevel: 3,
        cost: [3, 5, 8],
        effect: "passive_income",
        value: 2
      }
    }
  },
  technology: {
    name: "Technology",
    icon: "🔬",
    skills: {
      automation: {
        name: "Automation",
        description: "Auto-water chance",
        maxLevel: 3,
        cost: [2, 4, 6],
        effect: "auto_water",
        value: 0.1
      },
      efficiency: {
        name: "Efficiency",
        description: "+10% tool effect",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5],
        effect: "tool_bonus",
        value: 0.1
      },
      innovation: {
        name: "Innovation",
        description: "+20% process speed",
        maxLevel: 3,
        cost: [3, 5, 8],
        effect: "process_speed",
        value: 0.2
      }
    }
  }
};

const DEFAULT_RULES = {
  seeds: {
    // Common crops
    carrot: { stages: 3, secondsPerStage: 8, baseValue: 12, shopPrice: 5, emoji: "🥕", rarity: "common", season: "spring", processable: true },
    potato: { stages: 3, secondsPerStage: 10, baseValue: 15, shopPrice: 7, emoji: "🥔", rarity: "common", season: "fall", processable: true },
    corn: { stages: 4, secondsPerStage: 12, baseValue: 22, shopPrice: 10, emoji: "🌽", rarity: "uncommon", season: "summer", processable: true },
    tomato: { stages: 4, secondsPerStage: 14, baseValue: 28, shopPrice: 14, emoji: "🍅", rarity: "uncommon", season: "summer", processable: true },
    // Uncommon crops
    strawberry: { stages: 3, secondsPerStage: 16, baseValue: 35, shopPrice: 18, emoji: "🍓", rarity: "uncommon", season: "spring", processable: true },
    pumpkin: { stages: 5, secondsPerStage: 18, baseValue: 45, shopPrice: 22, emoji: "🎃", rarity: "uncommon", season: "fall", processable: true },
    sunflower: { stages: 4, secondsPerStage: 20, baseValue: 40, shopPrice: 20, emoji: "🌻", rarity: "uncommon", season: "summer", processable: true },
    // Rare crops
    watermelon: { stages: 5, secondsPerStage: 22, baseValue: 60, shopPrice: 30, emoji: "🍉", rarity: "rare", season: "summer", processable: true },
    blueberry: { stages: 3, secondsPerStage: 18, baseValue: 50, shopPrice: 25, emoji: "🫐", rarity: "rare", season: "summer", processable: true },
    pepper: { stages: 4, secondsPerStage: 16, baseValue: 48, shopPrice: 28, emoji: "🌶️", rarity: "rare", season: "summer", processable: true },
    // Epic crops
    grapes: { stages: 6, secondsPerStage: 25, baseValue: 80, shopPrice: 45, emoji: "🍇", rarity: "epic", season: "fall", processable: true },
    avocado: { stages: 7, secondsPerStage: 30, baseValue: 100, shopPrice: 60, emoji: "🥑", rarity: "epic", season: "spring", processable: true },
    // Legendary crops
    golden_corn: { stages: 5, secondsPerStage: 35, baseValue: 150, shopPrice: 100, emoji: "🌟", rarity: "legendary", season: "summer", processable: true },
    diamond_berry: { stages: 4, secondsPerStage: 40, baseValue: 200, shopPrice: 150, emoji: "💎", rarity: "legendary", season: "winter", processable: true },
  },
  processing: {
    // Crop processing
    carrot: { output: "carrot_juice", emoji: "🥤", name: "Carrot Juice", multiplier: 2.5, time: 30, requiredAmount: 3 },
    potato: { output: "french_fries", emoji: "🍟", name: "French Fries", multiplier: 3.0, time: 45, requiredAmount: 2 },
    corn: { output: "popcorn", emoji: "🍿", name: "Popcorn", multiplier: 2.8, time: 20, requiredAmount: 2 },
    tomato: { output: "sauce", emoji: "🍝", name: "Tomato Sauce", multiplier: 2.5, time: 40, requiredAmount: 4 },
    strawberry: { output: "jam", emoji: "🍯", name: "Strawberry Jam", multiplier: 3.5, time: 60, requiredAmount: 3 },
    pumpkin: { output: "pie", emoji: "🥧", name: "Pumpkin Pie", multiplier: 4.0, time: 90, requiredAmount: 1 },
    sunflower: { output: "oil", emoji: "🛢️", name: "Sunflower Oil", multiplier: 3.0, time: 50, requiredAmount: 5 },
    watermelon: { output: "juice", emoji: "🧃", name: "Watermelon Juice", multiplier: 2.2, time: 25, requiredAmount: 1 },
    blueberry: { output: "muffin", emoji: "🧁", name: "Blueberry Muffin", multiplier: 3.8, time: 70, requiredAmount: 4 },
    pepper: { output: "hot_sauce", emoji: "🌶️", name: "Hot Sauce", multiplier: 4.5, time: 80, requiredAmount: 3 },
    grapes: { output: "wine", emoji: "🍷", name: "Wine", multiplier: 5.0, time: 120, requiredAmount: 5 },
    avocado: { output: "guacamole", emoji: "🥑", name: "Guacamole", multiplier: 3.5, time: 30, requiredAmount: 2 },
    golden_corn: { output: "golden_popcorn", emoji: "✨", name: "Golden Popcorn", multiplier: 4.0, time: 60, requiredAmount: 1 },
    diamond_berry: { output: "crystal_jam", emoji: "💎", name: "Crystal Jam", multiplier: 5.0, time: 150, requiredAmount: 2 },
    // Animal product processing
    eggs: { output: "cake", emoji: "🍰", name: "Cake", multiplier: 3.5, time: 60, requiredAmount: 3 },
    milk: { output: "cheese", emoji: "🧀", name: "Cheese", multiplier: 2.8, time: 90, requiredAmount: 2 },
    wool: { output: "sweater", emoji: "🧥", name: "Sweater", multiplier: 3.0, time: 100, requiredAmount: 4 },
    bacon: { output: "sandwich", emoji: "🥪", name: "BLT Sandwich", multiplier: 3.2, time: 40, requiredAmount: 2 },
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
    lab: { price: 1000, name: "Breeding Lab", emoji: "🧪", bonus: 0, description: "Breed hybrid crops" },
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
      let parsed = JSON.parse(s);
      
      // Migrate old saves or accept new version
      if (parsed?.version === 2 || parsed?.version === 3) {
        // Ensure critical fields exist
        if (!parsed.settings) {
          parsed.settings = {
            autoSave: true,
            autoSaveInterval: 30,
            notifications: true,
            particleEffects: true,
            weatherEffects: true,
            animations: true,
            soundEnabled: false,
            musicVolume: 50,
            sfxVolume: 50,
            performanceMode: false,
            reducedMotion: false,
            colorblindMode: false,
            gridSize: 4,
            theme: "light"
          };
        }
        return parsed;
      }
    }
  } catch (e) {
    console.debug('[farm] loadSave error:', e);
    // Clear corrupted save
    localStorage.removeItem(SAVE_KEY);
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
  const [plots, setPlots] = useState(() => {
    // Ensure plots match gridSize
    const size = saved?.gridSize || MIN_SIZE;
    if (saved?.plots && saved?.plots.length === size * size) {
      return saved.plots;
    }
    return makeGrid(size);
  });
  const [selectedSeed, setSelectedSeed] = useState("carrot");
  const [inventory, setInventory] = useState(saved?.inventory || {
    carrot: 5, potato: 3, corn: 2, tomato: 1,
    fertilizer: 2, pesticide: 2, wateringCan: 0
  });
  const [buildings, setBuildings] = useState(saved?.buildings || {});
  const [shopTab, setShopTab] = useState("seeds");
  const [showSettings, setShowSettings] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [inventoryCategory, setInventoryCategory] = useState("seeds");
  const [storageLevel, setStorageLevel] = useState(saved?.storageLevel || 1);
  const [inventorySort, setInventorySort] = useState("name");
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
  
  // Processing system
  const [processingQueue, setProcessingQueue] = useState(saved?.processingQueue || []);
  const [processedGoods, setProcessedGoods] = useState(saved?.processedGoods || {});
  
  // Skills system
  const [skillPoints, setSkillPoints] = useState(saved?.skillPoints || 3);
  const [skillLevels, setSkillLevels] = useState(saved?.skillLevels || {});
  const [experience, setExperience] = useState(saved?.experience || 0);
  const [playerLevel, setPlayerLevel] = useState(saved?.playerLevel || 1);
  
  // Market system
  const [marketPrices, setMarketPrices] = useState(saved?.marketPrices || {});
  const [marketTrends, setMarketTrends] = useState(saved?.marketTrends || {});
  const [currentMarketEvent, setCurrentMarketEvent] = useState(saved?.currentMarketEvent || null);
  const [marketEventEndsAt, setMarketEventEndsAt] = useState(saved?.marketEventEndsAt || 0);
  const [priceHistory, setPriceHistory] = useState(saved?.priceHistory || {});
  
  // Workers system
  const [workers, setWorkers] = useState(saved?.workers || {});
  const [workerActions, setWorkerActions] = useState(saved?.workerActions || {});
  
  // Research system
  const [researchPoints, setResearchPoints] = useState(saved?.researchPoints || 0);
  const [activeResearch, setActiveResearch] = useState(saved?.activeResearch || null);
  const [researchStartedAt, setResearchStartedAt] = useState(saved?.researchStartedAt || 0);
  const [completedResearch, setCompletedResearch] = useState(saved?.completedResearch || []);
  const [researchBonuses, setResearchBonuses] = useState(saved?.researchBonuses || {});
  
  // Events system
  const [activeEvents, setActiveEvents] = useState(saved?.activeEvents || []);
  const [eventHistory, setEventHistory] = useState(saved?.eventHistory || []);
  const [nextHarvestBonus, setNextHarvestBonus] = useState(saved?.nextHarvestBonus || 1);
  const [eventPriceMultiplier, setEventPriceMultiplier] = useState(saved?.eventPriceMultiplier || 1);
  const [merchantOffer, setMerchantOffer] = useState(saved?.merchantOffer || null);
  const [droughtActive, setDroughtActive] = useState(saved?.droughtActive || false);
  
  // Challenges system
  const [dailyChallenges, setDailyChallenges] = useState(saved?.dailyChallenges || []);
  const [weeklyChallenges, setWeeklyChallenges] = useState(saved?.weeklyChallenges || []);
  const [challengeProgress, setChallengeProgress] = useState(saved?.challengeProgress || {});
  const [completedDailies, setCompletedDailies] = useState(saved?.completedDailies || []);
  const [completedWeeklies, setCompletedWeeklies] = useState(saved?.completedWeeklies || []);
  const [notifiedChallenges, setNotifiedChallenges] = useState(saved?.notifiedChallenges || []); // Track which challenges already showed notification
  const [dailyStreak, setDailyStreak] = useState(saved?.dailyStreak || 0);
  const [lastDailyReset, setLastDailyReset] = useState(saved?.lastDailyReset || 0);
  const [lastWeeklyReset, setLastWeeklyReset] = useState(saved?.lastWeeklyReset || 0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(saved?.totalCoinsEarned || 0);
  const [cropsWithered, setCropsWithered] = useState(saved?.cropsWithered || 0);
  
  // Breeding system
  const [breedingPairs, setBreedingPairs] = useState(saved?.breedingPairs || []);
  const [breedingProgress, setBreedingProgress] = useState(saved?.breedingProgress || {});
  const [unlockedHybrids, setUnlockedHybrids] = useState(saved?.unlockedHybrids || []);
  const [hybridSeeds, setHybridSeeds] = useState(saved?.hybridSeeds || {});
  
  // Pets system
  const [pets, setPets] = useState(saved?.pets || []);
  const [selectedPet, setSelectedPet] = useState(saved?.selectedPet || null);
  const [petActivities, setPetActivities] = useState(saved?.petActivities || {});
  const [petBonusActive, setPetBonusActive] = useState(saved?.petBonusActive || {});
  
  // Settings
  const [settings, setSettings] = useState(saved?.settings || {
    autoSave: true,
    autoSaveInterval: 30,
    notifications: true,
    particleEffects: true,
    weatherEffects: true,
    animations: true,
    soundEnabled: false,
    musicVolume: 50,
    sfxVolume: 50,
    performanceMode: false,
    reducedMotion: false,
    colorblindMode: false,
    gridSize: 4,
    theme: "light"
  });
  
  // Quest system
  // Quest system
  const [activeQuests, setActiveQuests] = useState(saved?.activeQuests || []);
  const [completedQuests, setCompletedQuests] = useState(saved?.completedQuests || []);
  const [questProgress, setQuestProgress] = useState(saved?.questProgress || {});
  const [currentQuestChain, setCurrentQuestChain] = useState(saved?.currentQuestChain || "tutorial");
  const [questDialogue, setQuestDialogue] = useState(null);
  
  // Analytics tracking
  const [analytics, setAnalytics] = useState(saved?.analytics || {
    totalEarnings: 0,
    totalSpent: 0,
    cropsPlanted: 0,
    cropsHarvested: 0,
    cropsWithered: 0,
    waterUsed: 0,
    fertilizerUsed: 0,
    pesticideUsed: 0,
    processedItems: 0,
    researchCompleted: 0,
    challengesCompleted: 0,
    hybridsCreated: 0,
    petsAdopted: 0,
    workersHired: 0,
    buildingsBuilt: 0,
    toolsPurchased: 0,
    highestCombo: 0,
    playTime: 0,
    sessionStart: nowSec(),
    dailyStats: {},
    cropStats: {},
    profitByDay: []
  });
  
  // Settings functions
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Apply setting immediately
    if (key === "performanceMode") {
      addNotification(value ? "Performance mode enabled" : "Performance mode disabled", "info");
    }
  };
  
  const resetSettings = () => {
    setSettings({
      autoSave: true,
      autoSaveInterval: 30,
      notifications: true,
      particleEffects: true,
      weatherEffects: true,
      animations: true,
      soundEnabled: false,
      musicVolume: 50,
      sfxVolume: 50,
      performanceMode: false,
      reducedMotion: false,
      colorblindMode: false,
      gridSize: 4,
      theme: "light"
    });
    addNotification("Settings reset to defaults", "info");
  };
  
  // Add notification with deduplication
  const addNotification = (msg, type = "info") => {
    if (!settings.notifications) return; // Check if notifications are enabled
    
    // Prevent duplicate notifications
    setNotifications(prev => {
      // Check if same message exists in last 3 notifications
      const recentMsgs = prev.slice(-3).map(n => n.msg);
      if (recentMsgs.includes(msg)) {
        return prev; // Don't add duplicate
      }
      
      const id = Date.now();
      const newNotification = { id, msg, type };
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setNotifications(current => current.filter(n => n.id !== id));
      }, 3000);
      
      // Keep only last 5 notifications
      return [...prev.slice(-4), newNotification];
    });
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
    
    // Validate plot index
    if (plotIndex < 0 || plotIndex >= plots.length) {
      addNotification("Invalid plot!", "error");
      return;
    }
    
    const plot = plots[plotIndex];
    if (!plot) {
      addNotification("Plot doesn't exist!", "error");
      return;
    }
    
    if (plot.state !== "empty") {
      addNotification("Plot is not empty!", "error");
      return;
    }
    
    // Update plot state
    const newPlots = [...plots];
    newPlots[plotIndex] = {
      ...plot,
      state: "planted",
      seed: seed,
      growth: 0,
      plantedAt: nowSec(),
      watered: false,
      infested: false,
      fertilized: 0,
      soilQuality: plot.soilQuality || 1
    };
    
    setPlots(newPlots);
    setInventory(inv => ({...inv, [seed]: (inv[seed] || 0) - 1}));
    
    // Update challenge progress
    updateChallengeProgress("plant", 1);
    
    // Track analytics
    updateAnalytics("cropsPlanted", 1);
    trackCropStat(seed, "planted", 1);
    
    // Update quest progress
    updateQuestProgress("plant", 1);
    if (currentSeason) {
      updateQuestProgress("plant_season", 1);
    }
    
    addNotification(`Planted ${seed}!`, "success");
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
    const isHybrid = plot.isHybrid;
    
    // Use market price instead of base value
    let value = getMarketPrice(seed);
    
    // Apply skill bonuses
    const harvestBonus = getSkillBonus("harvest_bonus");
    value = Math.round(value * (1 + harvestBonus));
    
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
    
    // Apply sell bonus from skills
    const sellBonus = getSkillBonus("sell_bonus");
    value = Math.round(value * (1 + sellBonus));
    
    // Apply event bonuses
    value = Math.round(value * eventPriceMultiplier);
    
    setCoins(c => c + value);
    setScore(s => s + value);
    setTotalHarvests(h => h + 1);
    setTotalCoinsEarned(prev => prev + value);
    
    // Update challenge progress
    updateChallengeProgress("harvest", 1);
    updateChallengeProgress("coins", value);
    
    // Update quest progress
    updateQuestProgress("harvests", 1);
    if (combo >= 10) updateQuestProgress("combo", combo);
    
    // Track analytics
    updateAnalytics("cropsHarvested", 1);
    updateAnalytics("totalEarnings", value);
    trackCropStat(seed, "harvested", 1);
    trackCropStat(seed, "earnings", value);
    if (combo > analytics.highestCombo) {
      updateAnalytics("highestCombo", combo - analytics.highestCombo);
    }
    
    // Update quest progress
    updateQuestProgress("harvest", 1);
    if (currentSeason) {
      updateQuestProgress("harvest_season", 1);
    }
    
    // Add experience
    addExperience(10);
    
    // Add to inventory for processing
    let harvestAmount = 1;
    
    // Apply hybrid traits
    if (isHybrid && plot.traits) {
      if (plot.traits.yield) {
        harvestAmount = Math.floor(harvestAmount * plot.traits.yield);
      }
      if (plot.traits.value) {
        value = Math.round(value * plot.traits.value);
      }
    }
    
    // Apply event harvest bonus
    if (nextHarvestBonus > 1) {
      harvestAmount = harvestAmount * nextHarvestBonus;
      setNextHarvestBonus(1); // Reset after use
      addNotification("Event bonus: Double harvest!", "success");
    }
    
    // Double harvest chance from skills
    const doubleChance = getSkillBonus("double_harvest");
    if (Math.random() < doubleChance) {
      harvestAmount = harvestAmount * 2;
      addNotification("Skill bonus: Double harvest!", "success");
    }
    
    // Add to appropriate inventory
    if (isHybrid) {
      // Hybrids give seeds back
      if (!addToInventory(seed, harvestAmount)) {
        addNotification("Storage full! Some items lost.", "warning");
      }
    } else {
      // Regular crops give harvested version
      if (!addToInventory(`harvested_${seed}`, harvestAmount)) {
        addNotification("Storage full! Crop sold directly.", "warning");
      }
    }
    
    // Update combo
    setCombo(c => c + 1);
    setComboTimer(nowSec() + 10); // 10 seconds to maintain combo
    
    // Update challenge progress for combo
    updateChallengeProgress("combo", combo + 1);
    
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
    const cost = 100 * (gridSize - MIN_SIZE + 2); // First expansion costs 200
    if (coins < cost) {
      addNotification("Not enough coins to expand!", "error");
      return;
    }
    
    if (gridSize >= MAX_SIZE) {
      addNotification("Maximum grid size reached!", "error");
      return;
    }
    
    const newSize = gridSize + 1;
    const newPlots = makeGrid(newSize);
    
    // Copy data from old plots to new grid positions
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const oldIndex = r * gridSize + c;
        const newIndex = r * newSize + c;
        if (oldIndex < plots.length && newIndex < newPlots.length) {
          newPlots[newIndex] = plots[oldIndex];
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
  
  // Challenge functions
  const generateDailyChallenges = () => {
    const challenges = Object.values(DAILY_CHALLENGES);
    const selected = [];
    const difficulties = { easy: 1, medium: 1, hard: 1 };
    
    for (const diff of Object.keys(difficulties)) {
      const available = challenges.filter(c => 
        c.difficulty === diff && !completedDailies.includes(c.id)
      );
      if (available.length > 0) {
        selected.push(available[Math.floor(Math.random() * available.length)]);
      }
    }
    
    setDailyChallenges(selected);
    setChallengeProgress(prev => {
      const newProgress = {...prev};
      selected.forEach(c => {
        if (!newProgress[c.id]) {
          newProgress[c.id] = 0;
        }
      });
      return newProgress;
    });
  };
  
  const generateWeeklyChallenges = () => {
    const challenges = Object.values(WEEKLY_CHALLENGES);
    const selected = [];
    
    // Pick 2 random weekly challenges
    const available = challenges.filter(c => !completedWeeklies.includes(c.id));
    for (let i = 0; i < Math.min(2, available.length); i++) {
      const idx = Math.floor(Math.random() * available.length);
      selected.push(available.splice(idx, 1)[0]);
    }
    
    setWeeklyChallenges(selected);
    setChallengeProgress(prev => {
      const newProgress = {...prev};
      selected.forEach(c => {
        if (!newProgress[c.id]) {
          newProgress[c.id] = 0;
        }
      });
      return newProgress;
    });
  };
  
  const updateChallengeProgress = (type, amount = 1) => {
    setChallengeProgress(prev => {
      const newProgress = {...prev};
      
      // Update daily challenges
      dailyChallenges.forEach(challenge => {
        if (challenge.type === type && !completedDailies.includes(challenge.id)) {
          const oldProgress = newProgress[challenge.id] || 0;
          let newValue;
          
          if (type === "no_wither") {
            // Special handling for no_wither challenge
            newValue = amount; // amount is cropsWithered count
          } else {
            newValue = oldProgress + amount;
          }
          
          newProgress[challenge.id] = newValue;
          
          // Check if this specific challenge just completed
          const isComplete = type === "no_wither" 
            ? newValue === 0 
            : newValue >= challenge.target;
            
          if (isComplete && oldProgress < challenge.target) {
            // Schedule completion check to avoid state update conflicts
            setTimeout(() => completeChallenge(challenge, "daily"), 100);
          }
        }
      });
      
      // Update weekly challenges
      weeklyChallenges.forEach(challenge => {
        if (challenge.type === type && !completedWeeklies.includes(challenge.id)) {
          const oldProgress = newProgress[challenge.id] || 0;
          const newValue = oldProgress + amount;
          newProgress[challenge.id] = newValue;
          
          // Check if this specific challenge just completed
          if (newValue >= challenge.target && oldProgress < challenge.target) {
            // Schedule completion check to avoid state update conflicts
            setTimeout(() => completeChallenge(challenge, "weekly"), 100);
          }
        }
      });
      
      return newProgress;
    });
  };
  

  
  const completeChallenge = (challenge, type) => {
    // Check if already completed to prevent duplicates
    if (type === "daily" && completedDailies.includes(challenge.id)) return;
    if (type === "weekly" && completedWeeklies.includes(challenge.id)) return;
    
    // Check if we already notified about this challenge
    const shouldNotify = !notifiedChallenges.includes(challenge.id);
    
    // Award rewards
    const reward = challenge.reward;
    if (reward.coins) {
      setCoins(c => c + reward.coins);
    }
    if (reward.xp) {
      addExperience(reward.xp);
    }
    if (reward.skillPoints) {
      setSkillPoints(sp => sp + reward.skillPoints);
    }
    if (reward.researchPoints) {
      setResearchPoints(rp => rp + reward.researchPoints);
    }
    
    // Mark as completed
    if (type === "daily") {
      setCompletedDailies(prev => {
        if (prev.includes(challenge.id)) return prev; // Already completed
        return [...prev, challenge.id];
      });
      
      // Check if all dailies are complete (only notify once)
      setTimeout(() => {
        if (dailyChallenges.every(c => 
          completedDailies.includes(c.id) || c.id === challenge.id
        )) {
          const streakKey = `streak_${dailyStreak + 1}`;
          if (!notifiedChallenges.includes(streakKey)) {
            setDailyStreak(prev => prev + 1);
            updateChallengeProgress("daily_streak", 1);
            addNotification("All daily challenges complete! Streak: " + (dailyStreak + 1), "success");
            setNotifiedChallenges(prev => [...prev, streakKey]);
          }
        }
      }, 500);
    } else {
      setCompletedWeeklies(prev => {
        if (prev.includes(challenge.id)) return prev; // Already completed
        return [...prev, challenge.id];
      });
    }
    
    // Only show notification if we haven't already
    if (shouldNotify) {
      addNotification(`Challenge complete: ${challenge.name}! ${challenge.emoji}`, "success");
      setNotifiedChallenges(prev => [...prev, challenge.id]);
    }
  };
  
  const resetDailyChallenges = () => {
    const now = nowSec();
    const dayInSeconds = 86400; // 24 hours
    
    if (now - lastDailyReset >= dayInSeconds) {
      setCompletedDailies([]);
      setCropsWithered(0); // Reset wither counter for new day
      // Clear daily challenge notifications
      setNotifiedChallenges(prev => prev.filter(id => !id.startsWith('daily_') && !dailyChallenges.some(c => c.id === id)));
      generateDailyChallenges();
      setLastDailyReset(now);
      addNotification("Daily challenges reset! New challenges available!", "info");
    }
  };
  
  const resetWeeklyChallenges = () => {
    const now = nowSec();
    const weekInSeconds = 604800; // 7 days
    
    if (now - lastWeeklyReset >= weekInSeconds) {
      setCompletedWeeklies([]);
      setDailyStreak(0);
      // Clear weekly challenge notifications and streak notifications
      setNotifiedChallenges(prev => prev.filter(id => !id.startsWith('weekly_') && !id.startsWith('streak_') && !weeklyChallenges.some(c => c.id === id)));
      generateWeeklyChallenges();
      setLastWeeklyReset(now);
      addNotification("Weekly challenges reset! New challenges available!", "info");
    }
  };
  

  
  // Quest functions
  const startQuest = (questId) => {
    const chain = Object.values(QUEST_CHAINS).find(c => 
      c.quests.some(q => q.id === questId)
    );
    
    if (!chain) return;
    
    const quest = chain.quests.find(q => q.id === questId);
    if (!quest) return;
    
    if (activeQuests.includes(questId) || completedQuests.includes(questId)) return;
    
    setActiveQuests(prev => [...prev, questId]);
    setQuestProgress(prev => ({
      ...prev,
      [questId]: 0
    }));
    
    // Show dialogue
    setQuestDialogue({
      title: quest.title,
      text: quest.dialogue,
      questId: questId
    });
    
    addNotification(`New Quest: ${quest.title}!`, "info");
  };
  
  const updateQuestProgress = (type, amount = 1, metadata = {}) => {
    activeQuests.forEach(questId => {
      const chain = Object.values(QUEST_CHAINS).find(c => 
        c.quests.some(q => q.id === questId)
      );
      
      if (!chain) return;
      
      const quest = chain.quests.find(q => q.id === questId);
      if (!quest) return;
      
      // Check if quest objective matches
      if (quest.objective.type === type) {
        // Check for seasonal requirements
        if (quest.objective.season && quest.objective.season !== currentSeason) return;
        
        setQuestProgress(prev => {
          const newProgress = Math.min(
            (prev[questId] || 0) + amount,
            quest.objective.target
          );
          
          // Check for completion
          if (newProgress >= quest.objective.target) {
            completeQuest(questId);
          }
          
          return {
            ...prev,
            [questId]: newProgress
          };
        });
      }
    });
  };
  
  const completeQuest = (questId) => {
    const chain = Object.values(QUEST_CHAINS).find(c => 
      c.quests.some(q => q.id === questId)
    );
    
    if (!chain) return;
    
    const quest = chain.quests.find(q => q.id === questId);
    if (!quest) return;
    
    // Award rewards
    const reward = quest.reward;
    if (reward.coins) {
      setCoins(c => c + reward.coins);
      updateAnalytics("totalEarnings", reward.coins);
    }
    if (reward.xp) {
      addExperience(reward.xp);
    }
    if (reward.skillPoints) {
      setSkillPoints(sp => sp + reward.skillPoints);
    }
    if (reward.researchPoints) {
      setResearchPoints(rp => rp + reward.researchPoints);
    }
    if (reward.seeds) {
      Object.entries(reward.seeds).forEach(([seed, amount]) => {
        setInventory(prev => ({
          ...prev,
          [seed]: (prev[seed] || 0) + amount
        }));
      });
    }
    if (reward.item) {
      Object.entries(reward.item).forEach(([item, amount]) => {
        setInventory(prev => ({
          ...prev,
          [item]: (prev[item] || 0) + amount
        }));
      });
    }
    
    // Mark as completed
    setCompletedQuests(prev => [...prev, questId]);
    setActiveQuests(prev => prev.filter(id => id !== questId));
    
    addNotification(`Quest Complete: ${quest.title}! 🎉`, "success");
    
    // Start next quest in chain
    const questIndex = chain.quests.findIndex(q => q.id === questId);
    if (questIndex < chain.quests.length - 1) {
      setTimeout(() => {
        startQuest(chain.quests[questIndex + 1].id);
      }, 1000);
    } else {
      // Chain complete, move to next chain
      const chains = Object.keys(QUEST_CHAINS);
      const currentIndex = chains.indexOf(chain.id);
      if (currentIndex < chains.length - 1) {
        const nextChain = QUEST_CHAINS[chains[currentIndex + 1]];
        if (nextChain && nextChain.quests.length > 0) {
          setTimeout(() => {
            setCurrentQuestChain(nextChain.id);
            startQuest(nextChain.quests[0].id);
          }, 2000);
        }
      }
    }
  };
  
  // Inventory management functions
  const getInventoryCount = () => {
    return Object.values(inventory).reduce((sum, count) => sum + (count || 0), 0);
  };
  
  const getStorageCapacity = () => {
    return STORAGE_UPGRADES[storageLevel - 1].capacity;
  };
  
  const canAddToInventory = (amount = 1) => {
    return getInventoryCount() + amount <= getStorageCapacity();
  };
  
  const addToInventory = (item, amount = 1) => {
    if (!canAddToInventory(amount)) {
      addNotification("Storage full! Upgrade your storage to hold more items.", "error");
      return false;
    }
    
    setInventory(prev => ({
      ...prev,
      [item]: (prev[item] || 0) + amount
    }));
    return true;
  };
  
  const removeFromInventory = (item, amount = 1) => {
    setInventory(prev => {
      const current = prev[item] || 0;
      if (current < amount) return prev;
      
      const newAmount = current - amount;
      if (newAmount === 0) {
        const newInv = { ...prev };
        delete newInv[item];
        return newInv;
      }
      
      return {
        ...prev,
        [item]: newAmount
      };
    });
  };
  
  const upgradeStorage = () => {
    if (storageLevel >= STORAGE_UPGRADES.length) {
      addNotification("Storage already at maximum level!", "error");
      return;
    }
    
    const nextUpgrade = STORAGE_UPGRADES[storageLevel];
    if (coins < nextUpgrade.cost) {
      addNotification(`Need ${nextUpgrade.cost} coins to upgrade storage!`, "error");
      return;
    }
    
    setCoins(c => c - nextUpgrade.cost);
    setStorageLevel(level => level + 1);
    updateAnalytics("totalSpent", nextUpgrade.cost);
    addNotification(`Storage upgraded to ${nextUpgrade.name}! Capacity: ${nextUpgrade.capacity}`, "success");
  };
  
  const getItemCategory = (item) => {
    for (const [category, data] of Object.entries(INVENTORY_CATEGORIES)) {
      if (data.items.includes(item)) {
        return category;
      }
    }
    // Check if it's a hybrid seed
    if (HYBRID_CROPS[item]) {
      return "hybrid";
    }
    // Check if it's a harvested crop
    if (item.startsWith("harvested_")) {
      return "crops";
    }
    // Default to tools
    return "tools";
  };
  
  const sortInventory = (items) => {
    const sorted = [...items];
    
    switch (inventorySort) {
      case "name":
        sorted.sort((a, b) => a.localeCompare(b));
        break;
      case "quantity":
        sorted.sort((a, b) => (inventory[b] || 0) - (inventory[a] || 0));
        break;
      case "value":
        // Sort by market value if available
        sorted.sort((a, b) => {
          const priceA = marketPrices[a] || DEFAULT_RULES.crops[a]?.price || 0;
          const priceB = marketPrices[b] || DEFAULT_RULES.crops[b]?.price || 0;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }
    
    return sorted;
  };
  
  // Analytics functions
  const updateAnalytics = (key, value = 1) => {
    setAnalytics(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + value
    }));
  };
  
  const trackCropStat = (crop, stat, value = 1) => {
    setAnalytics(prev => ({
      ...prev,
      cropStats: {
        ...prev.cropStats,
        [crop]: {
          ...prev.cropStats[crop],
          [stat]: ((prev.cropStats[crop] || {})[stat] || 0) + value
        }
      }
    }));
  };
  
  const calculateStats = () => {
    const totalPlayTime = analytics.playTime + (nowSec() - analytics.sessionStart);
    const profit = analytics.totalEarnings - analytics.totalSpent;
    const harvestRate = analytics.cropsHarvested / Math.max(1, analytics.cropsPlanted) * 100;
    const witherRate = analytics.cropsWithered / Math.max(1, analytics.cropsPlanted) * 100;
    const avgEarningsPerHarvest = analytics.totalEarnings / Math.max(1, analytics.cropsHarvested);
    const earningsPerMinute = analytics.totalEarnings / Math.max(1, totalPlayTime / 60);
    
    return {
      totalPlayTime,
      profit,
      harvestRate,
      witherRate,
      avgEarningsPerHarvest,
      earningsPerMinute,
      totalActivities: analytics.cropsPlanted + analytics.cropsHarvested + 
                      analytics.processedItems + analytics.researchCompleted
    };
  };
  
  const getTopCrops = () => {
    const crops = Object.entries(analytics.cropStats || {})
      .map(([crop, stats]) => ({
        crop,
        planted: stats.planted || 0,
        harvested: stats.harvested || 0,
        earnings: stats.earnings || 0,
        efficiency: ((stats.harvested || 0) / Math.max(1, stats.planted || 0)) * 100
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    return crops;
  };
  
  // Pet functions
  const adoptPet = (petType) => {
    const pet = PET_TYPES[petType];
    if (!pet) return;
    
    if (coins < pet.price) {
      addNotification("Not enough coins to adopt pet!", "error");
      return;
    }
    
    if (pets.length >= 3) {
      addNotification("Maximum 3 pets allowed!", "error");
      return;
    }
    
    const newPet = {
      id: Date.now(),
      type: petType,
      name: pet.name,
      happiness: 100,
      energy: 100,
      experience: 0,
      level: 1,
      lastFed: nowSec(),
      lastPlayed: nowSec()
    };
    
    setPets(prev => [...prev, newPet]);
    setCoins(c => c - pet.price);
    addNotification(`Adopted a ${pet.name}! ${pet.emoji}`, "success");
  };
  
  const interactWithPet = (petId, activity) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    const activityData = PET_ACTIVITIES[activity];
    if (!activityData) return;
    
    // Check if pet has enough energy
    if (pet.energy + activityData.energy < 0) {
      addNotification(`${pet.name} is too tired!`, "error");
      return;
    }
    
    // Update pet stats
    setPets(prev => prev.map(p => {
      if (p.id !== petId) return p;
      
      const newEnergy = Math.max(0, Math.min(100, p.energy + activityData.energy));
      const newHappiness = Math.max(0, Math.min(100, p.happiness + activityData.happiness));
      const newExp = p.experience + 5;
      const newLevel = Math.floor(newExp / 100) + 1;
      
      return {
        ...p,
        energy: newEnergy,
        happiness: newHappiness,
        experience: newExp,
        level: newLevel,
        [`last${activity.charAt(0).toUpperCase() + activity.slice(1)}`]: nowSec()
      };
    }));
    
    addNotification(`${activityData.emoji} ${activity} with ${pet.name}!`, "success");
  };
  
  const feedPet = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    const petType = PET_TYPES[pet.type];
    if (coins < petType.feedCost) {
      addNotification("Not enough coins to feed pet!", "error");
      return;
    }
    
    setCoins(c => c - petType.feedCost);
    interactWithPet(petId, "feed");
  };
  
  const getPetBonus = (bonusType) => {
    let totalBonus = 0;
    pets.forEach(pet => {
      const petType = PET_TYPES[pet.type];
      if (petType.bonuses[bonusType] && pet.happiness > 50) {
        // Bonus scales with happiness and level
        const happinessMultiplier = pet.happiness / 100;
        const levelMultiplier = 1 + (pet.level - 1) * 0.1;
        totalBonus += petType.bonuses[bonusType] * happinessMultiplier * levelMultiplier;
      }
    });
    return totalBonus;
  };
  
  const updatePetStats = () => {
    setPets(prev => prev.map(pet => {
      const timeSinceLastFed = nowSec() - pet.lastFed;
      const timeSinceLastPlayed = nowSec() - pet.lastPlayed;
      
      // Decrease happiness and energy over time
      let newHappiness = pet.happiness;
      let newEnergy = pet.energy;
      
      if (timeSinceLastFed > 300) { // 5 minutes
        newEnergy = Math.max(0, newEnergy - 1);
      }
      
      if (timeSinceLastPlayed > 600) { // 10 minutes
        newHappiness = Math.max(0, newHappiness - 1);
      }
      
      return { ...pet, happiness: newHappiness, energy: newEnergy };
    }));
  };
  
  // Breeding functions
  const startBreeding = (crop1, crop2) => {
    // Check if player has the crops
    if ((inventory[crop1] || 0) < 1 || (inventory[crop2] || 0) < 1) {
      addNotification("Not enough crops for breeding!", "error");
      return;
    }
    
    // Check if breeding lab is built
    if (!buildings.lab) {
      addNotification("You need a Breeding Lab to breed crops!", "error");
      return;
    }
    
    // Check for valid combination
    const combo1 = `${crop1}+${crop2}`;
    const combo2 = `${crop2}+${crop1}`;
    const hybridId = BREEDING_COMBINATIONS[combo1] || BREEDING_COMBINATIONS[combo2];
    
    if (!hybridId) {
      addNotification("These crops cannot be bred together!", "error");
      return;
    }
    
    // Check if already breeding
    if (breedingPairs.length >= 3) {
      addNotification("Breeding lab is full! (Max 3 pairs)", "error");
      return;
    }
    
    // Start breeding
    const breedingId = Date.now();
    setBreedingPairs(prev => [...prev, {
      id: breedingId,
      crop1,
      crop2,
      hybridId,
      startedAt: nowSec()
    }]);
    
    // Remove crops from inventory
    setInventory(prev => ({
      ...prev,
      [crop1]: prev[crop1] - 1,
      [crop2]: prev[crop2] - 1
    }));
    
    addNotification(`Started breeding ${crop1} + ${crop2}!`, "success");
  };
  
  const collectHybrid = (breedingId) => {
    const pair = breedingPairs.find(p => p.id === breedingId);
    if (!pair) return;
    
    const hybrid = HYBRID_CROPS[pair.hybridId];
    const breedTime = 30; // 30 seconds to breed
    const elapsed = nowSec() - pair.startedAt;
    
    if (elapsed < breedTime) {
      addNotification(`Breeding needs ${breedTime - elapsed} more seconds!`, "info");
      return;
    }
    
    // Add hybrid to unlocked list
    if (!unlockedHybrids.includes(pair.hybridId)) {
      setUnlockedHybrids(prev => [...prev, pair.hybridId]);
      addNotification(`New hybrid unlocked: ${hybrid.name}! ${hybrid.emoji}`, "success");
    }
    
    // Add hybrid seeds to inventory
    setHybridSeeds(prev => ({
      ...prev,
      [pair.hybridId]: (prev[pair.hybridId] || 0) + 3 // Get 3 seeds per breeding
    }));
    
    // Remove from breeding pairs
    setBreedingPairs(prev => prev.filter(p => p.id !== breedingId));
    
    addNotification(`Collected 3x ${hybrid.name} seeds!`, "success");
  };
  
  const plantHybrid = (plotIndex, hybridId) => {
    const hybrid = HYBRID_CROPS[hybridId];
    if (!hybrid) return;
    
    if ((hybridSeeds[hybridId] || 0) <= 0) {
      addNotification(`No ${hybrid.name} seeds!`, "error");
      return;
    }
    
    const plot = plots[plotIndex];
    if (plot.state !== "empty") {
      addNotification("Plot is not empty!", "error");
      return;
    }
    
    // Plant hybrid
    setPlots(prev => {
      const newPlots = [...prev];
      newPlots[plotIndex] = {
        ...plot,
        state: "planted",
        seed: hybridId,
        isHybrid: true,
        growth: 0,
        plantedAt: nowSec(),
        watered: false,
        traits: hybrid.traits
      };
      return newPlots;
    });
    
    setHybridSeeds(prev => ({
      ...prev,
      [hybridId]: prev[hybridId] - 1
    }));
    
    // Update challenge progress
    updateChallengeProgress("plant", 1);
    
    addNotification(`Planted ${hybrid.name}!`, "success");
  };
  
  // Event functions
  const triggerRandomEvent = () => {
    // Don't trigger events too frequently
    if (Math.random() > 0.02) return; // 2% chance per game tick
    
    // Choose a random event based on chances
    const events = Object.values(RANDOM_EVENTS);
    const totalChance = events.reduce((sum, e) => sum + e.chance, 0);
    let random = Math.random() * totalChance;
    
    for (const event of events) {
      random -= event.chance;
      if (random <= 0) {
        executeEvent(event);
        break;
      }
    }
  };
  
  const executeEvent = (event) => {
    const effect = event.effect();
    
    // Add to history
    setEventHistory(prev => [...prev.slice(-9), { 
      event: event.id, 
      time: nowSec(),
      type: event.type 
    }]);
    
    // Execute effect based on action
    switch (effect.action) {
      case "water_all":
        setPlots(prev => prev.map(plot => 
          plot.state === "growing" ? {...plot, water: 3} : plot
        ));
        break;
        
      case "double_harvest":
        setNextHarvestBonus(2);
        setTimeout(() => setNextHarvestBonus(1), 60000); // Reset after 1 minute
        break;
        
      case "price_boost":
      case "price_drop":
        setEventPriceMultiplier(effect.multiplier);
        setTimeout(() => setEventPriceMultiplier(1), effect.duration * 1000);
        break;
        
      case "add_coins":
        setCoins(c => c + effect.amount);
        break;
        
      case "instant_grow":
        setPlots(prev => {
          const growing = prev.map((p, i) => p.state === "growing" ? i : -1).filter(i => i >= 0);
          if (growing.length > 0) {
            const idx = growing[Math.floor(Math.random() * growing.length)];
            const newPlots = [...prev];
            newPlots[idx] = {...newPlots[idx], state: "grown"};
            return newPlots;
          }
          return prev;
        });
        break;
        
      case "damage_crops":
        setPlots(prev => {
          const growing = prev.map((p, i) => p.state === "growing" ? i : -1).filter(i => i >= 0);
          const newPlots = [...prev];
          for (let i = 0; i < Math.min(effect.count, growing.length); i++) {
            const idx = growing[Math.floor(Math.random() * growing.length)];
            newPlots[idx] = {...newPlots[idx], state: "withered"};
          }
          return newPlots;
        });
        break;
        
      case "drought":
        setDroughtActive(true);
        setTimeout(() => setDroughtActive(false), effect.duration * 1000);
        break;
        
      case "destroy_grown":
        setPlots(prev => {
          const grown = prev.map((p, i) => p.state === "grown" ? i : -1).filter(i => i >= 0);
          const newPlots = [...prev];
          for (let i = 0; i < Math.min(effect.count, grown.length); i++) {
            const idx = grown[Math.floor(Math.random() * grown.length)];
            newPlots[idx] = {state: "empty"};
          }
          return newPlots;
        });
        break;
        
      case "merchant_offer":
        // Generate special offer
        const seeds = Object.keys(DEFAULT_RULES.seeds);
        const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
        setMerchantOffer({
          seed: randomSeed,
          price: Math.floor(DEFAULT_RULES.seeds[randomSeed].price * 0.5), // 50% off
          amount: 10,
          expiresAt: nowSec() + 120 // 2 minutes
        });
        break;
        
      case "add_random_seeds":
        const allSeeds = Object.keys(DEFAULT_RULES.seeds);
        const randSeed = allSeeds[Math.floor(Math.random() * allSeeds.length)];
        setInventory(prev => ({
          ...prev,
          [randSeed]: (prev[randSeed] || 0) + effect.amount
        }));
        break;
    }
    
    // Add notification
    addNotification(`${event.emoji} ${event.message}`, event.type);
    
    // Add to active events for display
    setActiveEvents(prev => [...prev, {
      id: event.id,
      name: event.name,
      emoji: event.emoji,
      type: event.type,
      startedAt: nowSec(),
      duration: effect.duration || 0
    }]);
    
    // Clean up expired events periodically
    setTimeout(() => {
      setActiveEvents(prev => prev.filter(e => 
        e.duration === 0 || nowSec() - e.startedAt < e.duration
      ));
    }, 5000);
  };
  
  // Research functions
  const startResearch = (projectId) => {
    const project = RESEARCH_PROJECTS[projectId];
    if (!project) return;
    
    if (activeResearch) {
      addNotification("Research already in progress!", "error");
      return;
    }
    
    if (coins < project.cost) {
      addNotification("Not enough coins for research!", "error");
      return;
    }
    
    // Check requirements
    for (const req of project.requires) {
      if (!completedResearch.includes(req)) {
        addNotification(`Requires ${RESEARCH_PROJECTS[req]?.name} first!`, "error");
        return;
      }
    }
    
    setCoins(c => c - project.cost);
    setActiveResearch(projectId);
    setResearchStartedAt(nowSec());
    addNotification(`Started researching ${project.name}!`, "success");
  };
  
  const completeResearch = () => {
    if (!activeResearch) return;
    
    const project = RESEARCH_PROJECTS[activeResearch];
    const timeElapsed = nowSec() - researchStartedAt;
    
    if (timeElapsed < project.time) {
      const remaining = project.time - timeElapsed;
      addNotification(`Research needs ${remaining} more seconds!`, "info");
      return;
    }
    
    setCompletedResearch(prev => [...prev, activeResearch]);
    setResearchPoints(rp => rp + 10);
    
    // Apply research bonuses
    project.unlocks.forEach(unlock => {
      setResearchBonuses(prev => ({...prev, [unlock]: true}));
    });
    
    addNotification(`Research complete: ${project.name}! +10 RP`, "success");
    setActiveResearch(null);
    setResearchStartedAt(0);
  };
  
  const getResearchBonus = (bonusType) => {
    return researchBonuses[bonusType] || false;
  };
  
  // Worker functions
  const hireWorker = (workerType) => {
    const worker = WORKER_TYPES[workerType];
    if (!worker) return;
    
    if (coins < worker.cost) {
      addNotification("Not enough coins to hire worker!", "error");
      return;
    }
    
    if (workers[workerType]) {
      addNotification("Already hired this worker!", "error");
      return;
    }
    
    setCoins(c => c - worker.cost);
    setWorkers(prev => ({
      ...prev,
      [workerType]: {
        hired: true,
        lastAction: nowSec(),
        totalActions: 0,
      }
    }));
    
    addNotification(`Hired ${worker.name}!`, "success");
  };
  
  const fireWorker = (workerType) => {
    setWorkers(prev => {
      const newWorkers = {...prev};
      delete newWorkers[workerType];
      return newWorkers;
    });
    addNotification(`Fired ${WORKER_TYPES[workerType].name}`, "info");
  };
  
  const performWorkerActions = () => {
    Object.entries(workers).forEach(([workerType, workerData]) => {
      if (!workerData.hired) return;
      
      const worker = WORKER_TYPES[workerType];
      const timeSinceAction = nowSec() - (workerData.lastAction || 0);
      
      if (timeSinceAction >= worker.interval) {
        // Perform action based on worker type
        switch (worker.action) {
          case "plant":
            // Find empty plot and plant random seed
            const emptyPlots = plots.map((p, i) => p.state === "empty" ? i : -1).filter(i => i >= 0);
            if (emptyPlots.length > 0 && Object.keys(inventory).length > 0) {
              const plotIdx = emptyPlots[Math.floor(Math.random() * emptyPlots.length)];
              const availableSeeds = Object.entries(inventory).filter(([k, v]) => DEFAULT_RULES.seeds[k] && v > 0);
              if (availableSeeds.length > 0) {
                const [seedType] = availableSeeds[0];
                plant(plotIdx, seedType);
                setWorkerActions(prev => ({
                  ...prev,
                  [workerType]: (prev[workerType] || 0) + 1
                }));
              }
            }
            break;
            
          case "water":
            // Find planted plots and water them
            const plantedPlots = plots.map((p, i) => p.state === "planted" ? i : -1).filter(i => i >= 0);
            if (plantedPlots.length > 0) {
              const plotIdx = plantedPlots[Math.floor(Math.random() * plantedPlots.length)];
              water(plotIdx);
              setWorkerActions(prev => ({
                ...prev,
                [workerType]: (prev[workerType] || 0) + 1
              }));
            }
            break;
            
          case "harvest":
            // Find grown plots and harvest them
            const grownPlots = plots.map((p, i) => p.state === "grown" ? i : -1).filter(i => i >= 0);
            if (grownPlots.length > 0) {
              const plotIdx = grownPlots[Math.floor(Math.random() * grownPlots.length)];
              harvest(plotIdx);
              setWorkerActions(prev => ({
                ...prev,
                [workerType]: (prev[workerType] || 0) + 1
              }));
            }
            break;
            
          case "process":
            // Auto-process items if workshop exists
            if (buildings.workshop && processingQueue.length < 3) {
              const processable = Object.entries(inventory).find(([item, amount]) => {
                const recipe = DEFAULT_RULES.processing[item];
                return recipe && amount >= recipe.requiredAmount;
              });
              if (processable) {
                startProcessing(processable[0]);
                setWorkerActions(prev => ({
                  ...prev,
                  [workerType]: (prev[workerType] || 0) + 1
                }));
              }
            }
            break;
            
          case "trade":
            // Sell processed goods at optimal prices
            if (Object.keys(processedGoods).length > 0) {
              const [goodType] = Object.keys(processedGoods);
              sellProcessedGood(goodType, 1);
              setWorkerActions(prev => ({
                ...prev,
                [workerType]: (prev[workerType] || 0) + 1
              }));
            }
            break;
        }
        
        // Update last action time
        setWorkers(prev => ({
          ...prev,
          [workerType]: {
            ...prev[workerType],
            lastAction: nowSec(),
            totalActions: (prev[workerType].totalActions || 0) + 1
          }
        }));
      }
    });
  };
  
  // Calculate total worker upkeep
  const getWorkerUpkeep = () => {
    return Object.keys(workers).reduce((total, workerType) => {
      return total + (WORKER_TYPES[workerType]?.upkeep || 0);
    }, 0);
  };
  
  // Market functions
  const updateMarketPrices = () => {
    const newPrices = {};
    const newTrends = {};
    
    // Update prices for all crops
    Object.keys(DEFAULT_RULES.seeds).forEach(crop => {
      const basePrice = DEFAULT_RULES.seeds[crop].baseValue;
      
      // Random trend for each crop
      const trendRoll = Math.random();
      let trend;
      if (trendRoll < 0.2) trend = "high_demand";
      else if (trendRoll < 0.8) trend = "normal";
      else trend = "low_demand";
      
      newTrends[crop] = trend;
      
      // Calculate price with trend
      let price = basePrice * MARKET_TRENDS[trend].multiplier;
      
      // Apply market event if active
      if (currentMarketEvent) {
        const event = MARKET_EVENTS.find(e => e.id === currentMarketEvent);
        if (event) {
          if (event.affects === "all" || (Array.isArray(event.affects) && event.affects.includes(crop))) {
            price *= event.multiplier;
          }
        }
      }
      
      // Add some random variation (±10%)
      price *= (0.9 + Math.random() * 0.2);
      
      newPrices[crop] = Math.round(price);
    });
    
    setMarketPrices(newPrices);
    setMarketTrends(newTrends);
    
    // Track price history
    setPriceHistory(prev => {
      const history = {...prev};
      Object.keys(newPrices).forEach(crop => {
        if (!history[crop]) history[crop] = [];
        history[crop].push(newPrices[crop]);
        if (history[crop].length > 10) history[crop].shift(); // Keep last 10 prices
      });
      return history;
    });
  };
  
  const triggerMarketEvent = () => {
    if (currentMarketEvent && nowSec() < marketEventEndsAt) return; // Event still active
    
    // Random chance for market event
    if (Math.random() < 0.1) { // 10% chance
      const event = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
      setCurrentMarketEvent(event.id);
      setMarketEventEndsAt(nowSec() + event.duration);
      addNotification(`📰 Market Event: ${event.name} - ${event.description}`, "info");
      updateMarketPrices(); // Immediately update prices
    }
  };
  
  const getMarketPrice = (crop) => {
    return marketPrices[crop] || DEFAULT_RULES.seeds[crop]?.baseValue || 10;
  };
  
  // Skills functions
  const getSkillBonus = (effectType) => {
    let bonus = 0;
    for (const [treeId, tree] of Object.entries(SKILL_TREES)) {
      for (const [skillId, skill] of Object.entries(tree.skills)) {
        if (skill.effect === effectType) {
          const level = skillLevels[`${treeId}_${skillId}`] || 0;
          bonus += skill.value * level;
        }
      }
    }
    return bonus;
  };
  
  const upgradeSkill = (treeId, skillId) => {
    const skill = SKILL_TREES[treeId]?.skills[skillId];
    if (!skill) return;
    
    const fullSkillId = `${treeId}_${skillId}`;
    const currentLevel = skillLevels[fullSkillId] || 0;
    
    if (currentLevel >= skill.maxLevel) {
      addNotification("Skill already maxed!", "error");
      return;
    }
    
    const cost = skill.cost[currentLevel];
    if (skillPoints < cost) {
      addNotification("Not enough skill points!", "error");
      return;
    }
    
    setSkillPoints(sp => sp - cost);
    setSkillLevels(prev => ({
      ...prev,
      [fullSkillId]: currentLevel + 1
    }));
    
    addNotification(`Upgraded ${skill.name} to level ${currentLevel + 1}!`, "success");
  };
  
  const addExperience = (amount) => {
    setExperience(prev => {
      const newExp = prev + amount;
      const expNeeded = playerLevel * 100;
      
      if (newExp >= expNeeded) {
        setPlayerLevel(l => l + 1);
        setSkillPoints(sp => sp + 2);
        addNotification(`Level up! You are now level ${playerLevel + 1}! +2 skill points`, "success");
        return newExp - expNeeded;
      }
      
      return newExp;
    });
  };
  
  // Process items
  const startProcessing = (itemType) => {
    const recipe = DEFAULT_RULES.processing[itemType];
    if (!recipe) {
      addNotification("Cannot process this item!", "error");
      return;
    }
    
    if (!buildings.workshop) {
      addNotification("Workshop required for processing!", "error");
      return;
    }
    
    const currentAmount = inventory[itemType] || 0;
    if (currentAmount < recipe.requiredAmount) {
      addNotification(`Need ${recipe.requiredAmount} ${itemType} to process!`, "error");
      return;
    }
    
    // Remove items from inventory
    setInventory(prev => ({
      ...prev,
      [itemType]: prev[itemType] - recipe.requiredAmount
    }));
    
    // Add to processing queue
    const processItem = {
      id: Date.now(),
      input: itemType,
      output: recipe.output,
      emoji: recipe.emoji,
      name: recipe.name,
      multiplier: recipe.multiplier,
      startedAt: nowSec(),
      completesAt: nowSec() + recipe.time,
      value: DEFAULT_RULES.seeds[itemType]?.baseValue || 10
    };
    
    setProcessingQueue(prev => [...prev, processItem]);
    addNotification(`Started processing ${recipe.name}!`, "success");
  };
  
  // Collect processed items
  const collectProcessed = (processId) => {
    const item = processingQueue.find(p => p.id === processId);
    if (!item) return;
    
    if (nowSec() < item.completesAt) {
      addNotification("Still processing...", "info");
      return;
    }
    
    const value = Math.floor(item.value * item.multiplier);
    
    // Add to processed goods inventory
    setProcessedGoods(prev => ({
      ...prev,
      [item.output]: (prev[item.output] || 0) + 1
    }));
    
    // Remove from queue
    setProcessingQueue(prev => prev.filter(p => p.id !== processId));
    
    addNotification(`Collected ${item.name}! Worth ${value}🪙`, "success");
    setScore(s => s + Math.floor(value / 10));
  };
  
  // Sell processed goods
  const sellProcessedGood = (goodType, amount = 1) => {
    const currentAmount = processedGoods[goodType] || 0;
    if (currentAmount < amount) {
      addNotification("Not enough goods to sell!", "error");
      return;
    }
    
    // Find the recipe to get value
    let baseValue = 50;
    for (const [input, recipe] of Object.entries(DEFAULT_RULES.processing)) {
      if (recipe.output === goodType) {
        const inputData = DEFAULT_RULES.seeds[input];
        if (inputData) {
          baseValue = Math.floor(inputData.baseValue * recipe.multiplier);
        }
        break;
      }
    }
    
    const totalValue = baseValue * amount;
    setCoins(c => c + totalValue);
    setProcessedGoods(prev => ({
      ...prev,
      [goodType]: prev[goodType] - amount
    }));
    
    addNotification(`Sold ${amount}x for ${totalValue}🪙!`, "success");
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
  
  // Initialize market prices on load
  useEffect(() => {
    if (Object.keys(marketPrices).length === 0) {
      updateMarketPrices();
    }
    
    // Initialize challenges if empty
    if (dailyChallenges.length === 0) {
      generateDailyChallenges();
      setLastDailyReset(nowSec());
    }
    if (weeklyChallenges.length === 0) {
      generateWeeklyChallenges();
      setLastWeeklyReset(nowSec());
    }
    
    // Start first quest if no quests active
    if (activeQuests.length === 0 && completedQuests.length === 0) {
      const firstChain = QUEST_CHAINS.tutorial;
      if (firstChain && firstChain.quests.length > 0) {
        setTimeout(() => startQuest(firstChain.quests[0].id), 1000);
      }
    }
  }, []);
  
  // Enhanced growth and game system
  useEffect(() => {
    if (paused) return;
    
    const interval = setInterval(() => {
      // Update combo
      if (comboTimer > 0 && nowSec() >= comboTimer) {
        setCombo(0);
        setComboTimer(0);
      }
      
      // Update market event
      if (currentMarketEvent && nowSec() >= marketEventEndsAt) {
        setCurrentMarketEvent(null);
        addNotification("Market event ended", "info");
        updateMarketPrices();
      }
      
      // Trigger new market events and update prices periodically
      if (Math.floor(nowSec()) % 30 === 0) {
        triggerMarketEvent();
        updateMarketPrices();
      }
      
      // Worker actions
      performWorkerActions();
      
      // Trigger random events
      triggerRandomEvent();
      
      // Check for challenge resets (only every 10 seconds)
      if (Math.floor(nowSec()) % 10 === 0) {
        resetDailyChallenges();
        resetWeeklyChallenges();
      }
      
      // Update pet stats (every 30 seconds)
      if (Math.floor(nowSec()) % 30 === 0) {
        updatePetStats();
      }
      
      // Worker upkeep (every 60 seconds = 1 minute)
      if (Math.floor(nowSec()) % 60 === 0 && Object.keys(workers).length > 0) {
        const upkeep = getWorkerUpkeep();
        if (coins >= upkeep) {
          setCoins(c => c - upkeep);
        } else {
          // Fire all workers if can't pay
          setWorkers({});
          addNotification("Can't pay workers! All fired!", "error");
        }
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
    if (!settings?.autoSave) return;
    
    const timer = setTimeout(() => {
      const snapshot = {
        version: 3,
        savedAt: Date.now(),
        // Core
        coins, score, gridSize, plots, inventory, buildings,
        // Systems
        level: level.level,
        experience,
        skillPoints,
        skills,
        tools,
        researchPoints,
        unlockedResearch,
        workers,
        marketPrices,
        // Features
        dailyChallenges,
        weeklyChallenges,
        challengeProgress,
        completedDailies,
        completedWeeklies,
        notifiedChallenges,
        dailyStreak,
        lastDailyReset,
        lastWeeklyReset,
        // Breeding & Pets
        breedingPairs,
        breedingProgress,
        unlockedHybrids,
        hybridSeeds,
        pets,
        selectedPet,
        petActivities,
        // Quest & Inventory
        activeQuests,
        completedQuests,
        questProgress,
        currentQuestChain,
        storageLevel,
        // Settings & Analytics
        settings,
        analytics
      };
      saveState(snapshot);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [coins, score, gridSize, plots, inventory, buildings, level, experience, 
      skillPoints, skills, tools, researchPoints, unlockedResearch, workers,
      marketPrices, dailyChallenges, weeklyChallenges, challengeProgress,
      completedDailies, completedWeeklies, notifiedChallenges, dailyStreak,
      lastDailyReset, lastWeeklyReset, breedingPairs, breedingProgress,
      unlockedHybrids, hybridSeeds, pets, selectedPet, petActivities,
      activeQuests, completedQuests, questProgress, currentQuestChain,
      storageLevel, settings, analytics]);
  
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
      if (plot.state === "grown") {
        return harvest(index);
      }
      if (plot.state === "withered") {
        return clearPlot(index);
      }
      if (plot.state === "empty") {
        return plant(index, selectedSeed);
      }
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-2">
                <span className="text-sm font-medium">Coins</span>
                <span className="text-lg font-bold">🪙 {coins}</span>
              </div>
              <div className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                <span className="text-sm font-medium">Level</span>
                <span className="text-lg font-bold">📊 {playerLevel}</span>
              </div>
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
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
                  onClick={() => setShowInventory(!showInventory)} 
                  size="sm"
                  variant={showInventory ? "default" : "outline"}
                >
                  📦
                </Button>
                <Button 
                  onClick={() => setShowQuests(!showQuests)} 
                  size="sm"
                  variant={showQuests ? "default" : "outline"}
                >
                  📜
                </Button>
                <Button 
                  onClick={() => setShowSettings(!showSettings)} 
                  size="sm"
                  variant={showSettings ? "default" : "outline"}
                >
                  ⚙️
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
        
              {/* Active Events Display */}
      {activeEvents.length > 0 && (
        <Card className="mb-2 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">Active Events:</span>
              {activeEvents.map(event => (
                <Badge 
                  key={event.id} 
                  variant={event.type === "positive" ? "default" : event.type === "negative" ? "destructive" : "secondary"}
                  className="animate-pulse"
                >
                  {event.emoji} {event.name}
                  {event.duration > 0 && (
                    <span className="ml-1 text-xs">
                      ({Math.max(0, event.duration - (nowSec() - event.startedAt))}s)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Merchant Offer */}
      {merchantOffer && nowSec() < merchantOffer.expiresAt && (
        <Card className="mb-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-300">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧳</span>
                <span className="font-semibold">Special Offer:</span>
                <Badge variant="default">
                  {DEFAULT_RULES.seeds[merchantOffer.seed]?.emoji} {merchantOffer.seed} x{merchantOffer.amount}
                </Badge>
                <span className="text-sm">for only {merchantOffer.price}🪙!</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Expires in {merchantOffer.expiresAt - nowSec()}s
                </span>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => {
                    if (coins >= merchantOffer.price) {
                      setCoins(c => c - merchantOffer.price);
                      setInventory(prev => ({
                        ...prev,
                        [merchantOffer.seed]: (prev[merchantOffer.seed] || 0) + merchantOffer.amount
                      }));
                      setMerchantOffer(null);
                      addNotification(`Bought ${merchantOffer.amount} ${merchantOffer.seed} seeds!`, "success");
                    } else {
                      addNotification("Not enough coins!", "error");
                    }
                  }}
                  disabled={coins < merchantOffer.price}
                >
                  Buy Now!
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
      
      {/* Inventory Panel */}
      {showInventory && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle>📦 Inventory</CardTitle>
                <Badge variant="outline">
                  {getInventoryCount()}/{getStorageCapacity()}
                </Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowInventory(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Storage Upgrade */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-semibold text-sm">
                    {STORAGE_UPGRADES[storageLevel - 1].name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Storage Level {storageLevel}/{STORAGE_UPGRADES.length}
                  </p>
                </div>
                {storageLevel < STORAGE_UPGRADES.length && (
                  <Button 
                    size="sm" 
                    onClick={upgradeStorage}
                    disabled={coins < STORAGE_UPGRADES[storageLevel].cost}
                  >
                    Upgrade ({STORAGE_UPGRADES[storageLevel].cost}🪙)
                  </Button>
                )}
              </div>
              <Progress 
                value={(getInventoryCount() / getStorageCapacity()) * 100} 
                className="h-2"
              />
            </div>
            
            {/* Category Tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {Object.entries(INVENTORY_CATEGORIES).map(([key, category]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={inventoryCategory === key ? "default" : "outline"}
                  onClick={() => setInventoryCategory(key)}
                  className="text-xs"
                >
                  {category.emoji} {category.name}
                </Button>
              ))}
            </div>
            
            {/* Sort Options */}
            <div className="flex gap-2 mb-3">
              <span className="text-xs text-gray-600">Sort by:</span>
              <div className="flex gap-1">
                {["name", "quantity", "value"].map(sort => (
                  <Button
                    key={sort}
                    size="sm"
                    variant={inventorySort === sort ? "default" : "ghost"}
                    onClick={() => setInventorySort(sort)}
                    className="text-xs h-6 px-2"
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Items Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {(() => {
                const category = INVENTORY_CATEGORIES[inventoryCategory];
                if (!category) return null;
                
                // Get all items in this category that exist in inventory
                const categoryItems = Object.keys(inventory).filter(item => {
                  const itemCategory = getItemCategory(item);
                  return itemCategory === inventoryCategory;
                });
                
                const sortedItems = sortInventory(categoryItems);
                
                if (sortedItems.length === 0) {
                  return (
                    <div className="col-span-4 text-center py-8 text-gray-500">
                      <div className="text-2xl mb-2">{category.emoji}</div>
                      <p className="text-sm">No {category.name.toLowerCase()} in inventory</p>
                      <p className="text-xs mt-1">{category.description}</p>
                    </div>
                  );
                }
                
                return sortedItems.map(item => {
                  const count = inventory[item] || 0;
                  const crop = DEFAULT_RULES.crops[item];
                  const value = marketPrices[item] || crop?.price || 0;
                  
                  return (
                    <div 
                      key={item} 
                      className="p-2 border rounded bg-white hover:bg-gray-50 cursor-pointer"
                      title={`${item}: ${count} units`}
                    >
                      <div className="text-center">
                        <div className="text-2xl">
                          {crop?.emoji || HYBRID_CROPS[item]?.emoji || "📦"}
                        </div>
                        <div className="text-xs font-medium truncate">
                          {item.replace(/_/g, " ").replace("harvested ", "")}
                        </div>
                        <div className="text-xs text-gray-600">
                          x{count}
                        </div>
                        {value > 0 && (
                          <div className="text-xs text-green-600">
                            {value}🪙
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Category Info */}
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
              <strong>{INVENTORY_CATEGORIES[inventoryCategory]?.name}:</strong>{" "}
              {INVENTORY_CATEGORIES[inventoryCategory]?.description}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quest Panel */}
      {showQuests && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>📜 Quests</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowQuests(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Active Quests */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Active Quests</h4>
              {activeQuests.length === 0 ? (
                <p className="text-sm text-gray-500">No active quests</p>
              ) : (
                <div className="space-y-2">
                  {activeQuests.map(questId => {
                    const chain = Object.values(QUEST_CHAINS).find(c => 
                      c.quests.some(q => q.id === questId)
                    );
                    const quest = chain?.quests.find(q => q.id === questId);
                    if (!quest) return null;
                    
                    const progress = questProgress[questId] || 0;
                    const percentage = (progress / quest.objective.target) * 100;
                    
                    return (
                      <div key={questId} className="p-3 border rounded-lg bg-blue-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{quest.title}</h5>
                            <p className="text-xs text-gray-600">{quest.description}</p>
                          </div>
                          <Badge variant="outline">{chain.name}</Badge>
                        </div>
                        <Progress value={percentage} className="mb-1" />
                        <div className="flex justify-between text-xs">
                          <span>{progress}/{quest.objective.target}</span>
                          <span className="text-gray-500">
                            Reward: {quest.reward.coins}🪙 
                            {quest.reward.xp && ` +${quest.reward.xp}XP`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Quest Chains */}
            <div>
              <h4 className="font-semibold mb-2">Quest Chains</h4>
              <div className="space-y-2">
                {Object.values(QUEST_CHAINS).map(chain => {
                  const completedCount = chain.quests.filter(q => 
                    completedQuests.includes(q.id)
                  ).length;
                  const totalCount = chain.quests.length;
                  const percentage = (completedCount / totalCount) * 100;
                  
                  return (
                    <div key={chain.id} className="p-2 border rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{chain.name}</span>
                        <Badge variant={percentage === 100 ? "default" : "outline"}>
                          {completedCount}/{totalCount}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{chain.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>⚙️ Settings</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* General Settings */}
              <div>
                <h4 className="font-semibold mb-2">General</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto-save</span>
                    <input 
                      type="checkbox" 
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting("autoSave", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Notifications</span>
                    <input 
                      type="checkbox" 
                      checked={settings.notifications}
                      onChange={(e) => updateSetting("notifications", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weather Effects</span>
                    <input 
                      type="checkbox" 
                      checked={settings.weatherEffects}
                      onChange={(e) => updateSetting("weatherEffects", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Animations</span>
                    <input 
                      type="checkbox" 
                      checked={settings.animations}
                      onChange={(e) => updateSetting("animations", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
              
              {/* Performance Settings */}
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance Mode</span>
                    <input 
                      type="checkbox" 
                      checked={settings.performanceMode}
                      onChange={(e) => updateSetting("performanceMode", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reduced Motion</span>
                    <input 
                      type="checkbox" 
                      checked={settings.reducedMotion}
                      onChange={(e) => updateSetting("reducedMotion", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Particle Effects</span>
                    <input 
                      type="checkbox" 
                      checked={settings.particleEffects}
                      onChange={(e) => updateSetting("particleEffects", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={resetSettings}>
                Reset to Defaults
              </Button>
              <Button size="sm" onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Farm Grid */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <CardTitle>🌾 Your Farm</CardTitle>
                {gridSize < MAX_SIZE && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => expandGrid()}
                  >
                    📏 Expand ({100 * (gridSize - MIN_SIZE + 2)}🪙)
                  </Button>
                )}
              </div>
              
              {/* Seed Selector */}
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-sm font-medium">Select Seed:</span>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(DEFAULT_RULES.seeds).slice(0, 8).map(([seed, data]) => {
                    const hasSeeds = (inventory[seed] || 0) > 0;
                    return (
                      <Button
                        key={seed}
                        size="sm"
                        variant={selectedSeed === seed ? "default" : "outline"}
                        onClick={() => setSelectedSeed(seed)}
                        disabled={!hasSeeds}
                        className="p-1 h-auto"
                      >
                        <span className="text-lg">{data.emoji}</span>
                        {hasSeeds && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {inventory[seed]}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
                {selectedSeed && (
                  <Badge variant="default" className="ml-2">
                    Selected: {DEFAULT_RULES.seeds[selectedSeed]?.emoji} {selectedSeed}
                  </Badge>
                )}
              </div>
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
              <TabsList className="grid grid-cols-4 md:grid-cols-14 mb-4 text-xs">
                <TabsTrigger value="seeds">🌱</TabsTrigger>
                <TabsTrigger value="tools">🛠️</TabsTrigger>
                <TabsTrigger value="buildings">🏗️</TabsTrigger>
                <TabsTrigger value="livestock">🐄</TabsTrigger>
                <TabsTrigger value="processing">🏭</TabsTrigger>
                <TabsTrigger value="skills">📚</TabsTrigger>
                <TabsTrigger value="market">📈</TabsTrigger>
                <TabsTrigger value="workers">👷</TabsTrigger>
                <TabsTrigger value="research">🔬</TabsTrigger>
                <TabsTrigger value="challenges">🏆</TabsTrigger>
                <TabsTrigger value="breeding">🧬</TabsTrigger>
                <TabsTrigger value="pets">🐾</TabsTrigger>
                <TabsTrigger value="stats">📊</TabsTrigger>
                <TabsTrigger value="quests">📜</TabsTrigger>
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
              
              <TabsContent value="processing" className="space-y-2">
                {!buildings.workshop ? (
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <p className="text-sm mb-2">🔨 Workshop Required!</p>
                    <Button 
                      onClick={() => buy("workshop")}
                      disabled={coins < DEFAULT_RULES.buildings.workshop.price}
                    >
                      Build Workshop ({DEFAULT_RULES.buildings.workshop.price}🪙)
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Processing Queue */}
                    {processingQueue.length > 0 && (
                      <div className="mb-4 p-2 bg-blue-50 rounded">
                        <h4 className="font-semibold mb-2">⏳ Processing:</h4>
                        {processingQueue.map(item => {
                          const timeLeft = Math.max(0, item.completesAt - nowSec());
                          const isReady = timeLeft === 0;
                          
                          return (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded mb-1">
                              <div className="flex items-center gap-2">
                                <span>{item.emoji}</span>
                                <span className="text-sm">{item.name}</span>
                              </div>
                              {isReady ? (
                                <Button size="sm" onClick={() => collectProcessed(item.id)}>
                                  Collect!
                                </Button>
                              ) : (
                                <Badge variant="secondary">{timeLeft}s</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Processed Goods Inventory */}
                    {Object.keys(processedGoods).length > 0 && (
                      <div className="mb-4 p-2 bg-green-50 rounded">
                        <h4 className="font-semibold mb-2">📦 Processed Goods:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(processedGoods).map(([good, amount]) => {
                            // Find the emoji for this good
                            let emoji = "📦";
                            for (const recipe of Object.values(DEFAULT_RULES.processing)) {
                              if (recipe.output === good) {
                                emoji = recipe.emoji;
                                break;
                              }
                            }
                            
                            return (
                              <Button
                                key={good}
                                size="sm"
                                variant="outline"
                                onClick={() => sellProcessedGood(good, amount)}
                                className="justify-between"
                              >
                                <span>{emoji} {amount}x</span>
                                <span className="text-xs">Sell</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Available to Process */}
                    <h4 className="font-semibold">🔄 Process Items:</h4>
                    {Object.entries(inventory).map(([item, amount]) => {
                      const recipe = DEFAULT_RULES.processing[item];
                      if (!recipe || amount < recipe.requiredAmount) return null;
                      
                      return (
                        <Button
                          key={item}
                          onClick={() => startProcessing(item)}
                          variant="outline"
                          className="w-full justify-between h-auto py-2"
                          disabled={processingQueue.length >= 3}
                        >
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span>{DEFAULT_RULES.seeds[item]?.emoji || "📦"}</span>
                              <span>→</span>
                              <span>{recipe.emoji}</span>
                              <span className="font-medium">{recipe.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Requires {recipe.requiredAmount}x ({amount} available) • {recipe.time}s
                            </span>
                          </div>
                          <Badge variant="secondary">x{recipe.multiplier}</Badge>
                        </Button>
                      );
                    })}
                    
                    {processingQueue.length >= 3 && (
                      <p className="text-xs text-center text-gray-500">Max 3 items processing at once</p>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="skills" className="space-y-2">
                <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold">Level {playerLevel}</span>
                      <Progress value={(experience / (playerLevel * 100)) * 100} className="w-32 h-2 mt-1" />
                    </div>
                    <Badge variant="default">
                      {skillPoints} Skill Points
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {experience}/{playerLevel * 100} XP to next level
                  </p>
                </div>
                
                <Tabs defaultValue="farming">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="farming">🌾</TabsTrigger>
                    <TabsTrigger value="business">💼</TabsTrigger>
                    <TabsTrigger value="technology">🔬</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(SKILL_TREES).map(([treeId, tree]) => (
                    <TabsContent key={treeId} value={treeId} className="space-y-2">
                      <div className="text-center mb-2">
                        <span className="text-lg">{tree.icon}</span>
                        <span className="ml-2 font-semibold">{tree.name}</span>
                      </div>
                      
                      {Object.entries(tree.skills).map(([skillId, skill]) => {
                        const fullSkillId = `${treeId}_${skillId}`;
                        const currentLevel = skillLevels[fullSkillId] || 0;
                        const isMaxed = currentLevel >= skill.maxLevel;
                        const cost = isMaxed ? 0 : skill.cost[currentLevel];
                        const canUpgrade = skillPoints >= cost && !isMaxed;
                        
                        return (
                          <Button
                            key={skillId}
                            onClick={() => upgradeSkill(treeId, skillId)}
                            variant="outline"
                            className="w-full justify-between h-auto py-2"
                            disabled={!canUpgrade}
                          >
                            <div className="flex flex-col items-start">
                              <div className="font-medium">{skill.name}</div>
                              <div className="text-xs text-gray-500">{skill.description}</div>
                              <div className="flex gap-1 mt-1">
                                {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded ${
                                      i < currentLevel ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              {isMaxed ? (
                                <Badge variant="default">MAX</Badge>
                              ) : (
                                <div>
                                  <div className="text-sm font-bold">{cost} SP</div>
                                  {currentLevel > 0 && (
                                    <div className="text-xs text-green-600">
                                      +{(skill.value * currentLevel * 100).toFixed(0)}%
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
              
              <TabsContent value="market" className="space-y-2">
                {/* Market Event Banner */}
                {currentMarketEvent && (
                  <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-orange-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold">
                          {MARKET_EVENTS.find(e => e.id === currentMarketEvent)?.emoji} 
                          {' '}
                          {MARKET_EVENTS.find(e => e.id === currentMarketEvent)?.name}
                        </span>
                        <p className="text-sm text-gray-700">
                          {MARKET_EVENTS.find(e => e.id === currentMarketEvent)?.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {Math.max(0, marketEventEndsAt - nowSec())}s
                      </Badge>
                    </div>
                  </div>
                )}
                
                {/* Market Prices */}
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold sticky top-0 bg-white p-1">📊 Current Prices:</h4>
                  {Object.entries(DEFAULT_RULES.seeds).map(([crop, data]) => {
                    const currentPrice = marketPrices[crop] || data.baseValue;
                    const basePrice = data.baseValue;
                    const trend = marketTrends[crop] || "normal";
                    const trendData = MARKET_TRENDS[trend];
                    const priceChange = ((currentPrice - basePrice) / basePrice * 100).toFixed(0);
                    const isUp = currentPrice > basePrice;
                    
                    // Get price history for sparkline
                    const history = priceHistory[crop] || [];
                    const maxPrice = Math.max(...history, currentPrice);
                    const minPrice = Math.min(...history, currentPrice);
                    
                    return (
                      <div key={crop} className="p-2 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{data.emoji}</span>
                            <div>
                              <div className="font-medium text-sm">{crop}</div>
                              <Badge variant="outline" className={`text-xs ${trendData.color}`}>
                                {trendData.name}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {currentPrice}🪙
                            </div>
                            <div className={`text-xs ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                              {isUp ? '↑' : '↓'} {priceChange}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Mini price chart */}
                        {history.length > 0 && (
                          <div className="flex gap-px mt-2 h-8 items-end">
                            {history.slice(-10).map((price, i) => {
                              const height = maxPrice > minPrice 
                                ? ((price - minPrice) / (maxPrice - minPrice)) * 100 
                                : 50;
                              return (
                                <div 
                                  key={i} 
                                  className="flex-1 bg-blue-400 rounded-t"
                                  style={{ height: `${height}%` }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <Button 
                  onClick={updateMarketPrices} 
                  variant="outline" 
                  className="w-full"
                >
                  🔄 Refresh Prices (Free)
                </Button>
              </TabsContent>
              
              <TabsContent value="workers" className="space-y-2">
                {/* Worker upkeep display */}
                {Object.keys(workers).length > 0 && (
                  <div className="p-2 bg-yellow-50 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Upkeep:</span>
                      <Badge variant="destructive">{getWorkerUpkeep()}🪙/min</Badge>
                    </div>
                  </div>
                )}
                
                {/* Available workers */}
                <h4 className="font-semibold">👷 Hire Workers:</h4>
                {Object.entries(WORKER_TYPES).map(([workerType, worker]) => {
                  const isHired = workers[workerType]?.hired;
                  const actions = workerActions[workerType] || 0;
                  
                  return (
                    <div key={workerType} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{worker.emoji}</span>
                            <span className="font-medium">{worker.name}</span>
                            {isHired && <Badge variant="default">Hired</Badge>}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{worker.description}</p>
                          <div className="text-xs">
                            <span className="text-gray-500">Every {worker.interval}s</span>
                            {isHired && (
                              <span className="ml-2 text-green-600">
                                Actions: {actions}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {isHired ? (
                            <div>
                              <Badge variant="secondary" className="mb-1">
                                {worker.upkeep}🪙/min
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => fireWorker(workerType)}
                              >
                                Fire
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => hireWorker(workerType)}
                              disabled={coins < worker.cost}
                            >
                              Hire ({worker.cost}🪙)
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="research" className="space-y-2">
                {/* Active Research */}
                {activeResearch && (
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold">
                          {RESEARCH_PROJECTS[activeResearch]?.emoji} Researching: {RESEARCH_PROJECTS[activeResearch]?.name}
                        </span>
                        <Progress 
                          value={Math.min(100, ((nowSec() - researchStartedAt) / RESEARCH_PROJECTS[activeResearch]?.time) * 100)} 
                          className="mt-2"
                        />
                      </div>
                      {nowSec() - researchStartedAt >= RESEARCH_PROJECTS[activeResearch]?.time && (
                        <Button size="sm" onClick={completeResearch}>
                          Complete!
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Research Points */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Research Points:</span>
                  <Badge variant="default">{researchPoints} RP</Badge>
                </div>
                
                {/* Available Research */}
                <h4 className="font-semibold">🔬 Research Projects:</h4>
                {Object.entries(RESEARCH_PROJECTS).map(([projectId, project]) => {
                  const isCompleted = completedResearch.includes(projectId);
                  const canStart = !activeResearch && !isCompleted && 
                    project.requires.every(req => completedResearch.includes(req));
                  
                  return (
                    <div key={projectId} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{project.emoji}</span>
                            <span className="font-medium">{project.name}</span>
                            {isCompleted && <Badge variant="default">✅</Badge>}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{project.description}</p>
                          <div className="text-xs">
                            <span className="text-gray-500">Time: {project.time}s</span>
                            {project.requires.length > 0 && (
                              <span className="ml-2 text-orange-600">
                                Requires: {project.requires.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {isCompleted ? (
                            <Badge variant="secondary">Completed</Badge>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => startResearch(projectId)}
                              disabled={!canStart || coins < project.cost}
                            >
                              Research ({project.cost}🪙)
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="challenges" className="space-y-4">
                {/* Daily Streak */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <span className="font-semibold">Daily Streak:</span>
                  <Badge variant="default" className="text-lg">
                    🔥 {dailyStreak} days
                  </Badge>
                </div>
                
                {/* Daily Challenges */}
                <div>
                  <h4 className="font-semibold mb-2">📅 Daily Challenges:</h4>
                  {dailyChallenges.map(challenge => {
                    const progress = challengeProgress[challenge.id] || 0;
                    const isComplete = completedDailies.includes(challenge.id);
                    const progressPercent = challenge.type === "no_wither" 
                      ? (cropsWithered === 0 ? 100 : 0)
                      : Math.min(100, (progress / challenge.target) * 100);
                    
                    return (
                      <div key={challenge.id} className="p-3 border rounded-lg mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{challenge.emoji}</span>
                              <span className="font-medium">{challenge.name}</span>
                              <Badge variant={
                                challenge.difficulty === "easy" ? "secondary" :
                                challenge.difficulty === "medium" ? "default" :
                                "destructive"
                              }>
                                {challenge.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          {isComplete && <Badge variant="default">✅ Complete</Badge>}
                        </div>
                        <Progress value={progressPercent} className="mb-1" />
                        <div className="flex justify-between text-xs">
                          <span>
                            {challenge.type === "no_wither" 
                              ? `${cropsWithered} withered` 
                              : `${progress}/${challenge.target}`}
                          </span>
                          <span className="text-gray-500">
                            Reward: {challenge.reward.coins}🪙 
                            {challenge.reward.xp && ` +${challenge.reward.xp}XP`}
                            {challenge.reward.researchPoints && ` +${challenge.reward.researchPoints}RP`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Weekly Challenges */}
                <div>
                  <h4 className="font-semibold mb-2">📆 Weekly Challenges:</h4>
                  {weeklyChallenges.map(challenge => {
                    const progress = challengeProgress[challenge.id] || 0;
                    const isComplete = completedWeeklies.includes(challenge.id);
                    const progressPercent = Math.min(100, (progress / challenge.target) * 100);
                    
                    return (
                      <div key={challenge.id} className="p-3 border-2 border-purple-300 rounded-lg mb-2 bg-purple-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{challenge.emoji}</span>
                              <span className="font-medium">{challenge.name}</span>
                              <Badge variant="destructive">
                                {challenge.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          {isComplete && <Badge variant="default">✅ Complete</Badge>}
                        </div>
                        <Progress value={progressPercent} className="mb-1" />
                        <div className="flex justify-between text-xs">
                          <span>{progress}/{challenge.target}</span>
                          <span className="text-gray-500">
                            Reward: {challenge.reward.coins}🪙
                            {challenge.reward.xp && ` +${challenge.reward.xp}XP`}
                            {challenge.reward.skillPoints && ` +${challenge.reward.skillPoints}SP`}
                            {challenge.reward.researchPoints && ` +${challenge.reward.researchPoints}RP`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Time until reset */}
                <div className="text-xs text-gray-500 text-center">
                  Daily reset in: {Math.floor((86400 - (nowSec() - lastDailyReset)) / 3600)}h
                  {' | '}
                  Weekly reset in: {Math.floor((604800 - (nowSec() - lastWeeklyReset)) / 86400)}d
                </div>
              </TabsContent>
              
              <TabsContent value="breeding" className="space-y-4">
                {/* Breeding Lab Required */}
                {!buildings.lab && (
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <span className="font-semibold">🧪 Breeding Lab Required!</span>
                    <p className="text-sm mt-1">Build a Breeding Lab to start breeding hybrid crops.</p>
                  </div>
                )}
                
                {/* Active Breeding */}
                {buildings.lab && breedingPairs.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">🧬 Active Breeding:</h4>
                    {breedingPairs.map(pair => {
                      const hybrid = HYBRID_CROPS[pair.hybridId];
                      const elapsed = nowSec() - pair.startedAt;
                      const breedTime = 30;
                      const progress = Math.min(100, (elapsed / breedTime) * 100);
                      
                      return (
                        <div key={pair.id} className="p-3 border rounded-lg mb-2 bg-purple-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
                              {pair.crop1} + {pair.crop2} → {hybrid.emoji} {hybrid.name}
                            </span>
                            {progress >= 100 && (
                              <Button size="sm" onClick={() => collectHybrid(pair.id)}>
                                Collect!
                              </Button>
                            )}
                          </div>
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs text-gray-500">
                            {progress < 100 ? `${Math.floor(breedTime - elapsed)}s remaining` : "Ready!"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Hybrid Seeds Inventory */}
                {Object.keys(hybridSeeds).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">🌟 Hybrid Seeds:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(hybridSeeds).map(([hybridId, count]) => {
                        const hybrid = HYBRID_CROPS[hybridId];
                        if (!hybrid || count <= 0) return null;
                        return (
                          <div key={hybridId} className="p-2 border rounded bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {hybrid.emoji} {hybrid.name}
                              </span>
                              <Badge variant="default">{count}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Breeding Combinations */}
                {buildings.lab && (
                  <div>
                    <h4 className="font-semibold mb-2">🔬 Breeding Recipes:</h4>
                    <div className="space-y-2">
                      {Object.entries(HYBRID_CROPS).map(([hybridId, hybrid]) => {
                        const [parent1, parent2] = hybrid.parents;
                        const hasParent1 = (inventory[parent1] || 0) > 0;
                        const hasParent2 = (inventory[parent2] || 0) > 0;
                        const canBreed = hasParent1 && hasParent2 && breedingPairs.length < 3;
                        const isUnlocked = unlockedHybrids.includes(hybridId);
                        
                        return (
                          <div key={hybridId} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{hybrid.emoji}</span>
                                  <span className="font-medium">{hybrid.name}</span>
                                  {isUnlocked && <Badge variant="default">✅ Unlocked</Badge>}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {parent1} + {parent2}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Traits: 
                                  {hybrid.traits.yield && ` Yield x${hybrid.traits.yield}`}
                                  {hybrid.traits.value && ` Value x${hybrid.traits.value}`}
                                  {hybrid.traits.growthSpeed && ` Speed x${hybrid.traits.growthSpeed}`}
                                </p>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => startBreeding(parent1, parent2)}
                                disabled={!canBreed}
                              >
                                Breed
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pets" className="space-y-4">
                {/* Current Pets */}
                {pets.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">🐾 Your Pets:</h4>
                    {pets.map(pet => {
                      const petType = PET_TYPES[pet.type];
                      return (
                        <div key={pet.id} className="p-3 border rounded-lg mb-2 bg-gradient-to-r from-green-50 to-blue-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{petType.emoji}</span>
                                <span className="font-medium">{pet.name} (Lv.{pet.level})</span>
                              </div>
                              <div className="flex gap-4 mt-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Happiness:</span>
                                  <Progress value={pet.happiness} className="w-20 h-2 mt-1" />
                                </div>
                                <div>
                                  <span className="text-gray-600">Energy:</span>
                                  <Progress value={pet.energy} className="w-20 h-2 mt-1" />
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => interactWithPet(pet.id, "play")}>
                                🎾
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => feedPet(pet.id)}>
                                🍖 ({petType.feedCost}🪙)
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => interactWithPet(pet.id, "pet")}>
                                💝
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {petType.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Pet Shop */}
                <div>
                  <h4 className="font-semibold mb-2">🏪 Adopt a Pet:</h4>
                  <div className="space-y-2">
                    {Object.entries(PET_TYPES).map(([petId, pet]) => (
                      <div key={petId} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{pet.emoji}</span>
                              <span className="font-medium">{pet.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">{pet.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Abilities: {pet.abilities.join(", ")} | Feed cost: {pet.feedCost}🪙/day
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => adoptPet(petId)}
                            disabled={coins < pet.price || pets.length >= 3}
                          >
                            Adopt ({pet.price}🪙)
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pet Bonuses */}
                {pets.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">Active Pet Bonuses:</h4>
                    <div className="text-xs space-y-1">
                      {getPetBonus("pestProtection") > 0 && (
                        <div>🛡️ Pest Protection: +{Math.round(getPetBonus("pestProtection") * 100)}%</div>
                      )}
                      {getPetBonus("growthSpeed") > 0 && (
                        <div>🌱 Growth Speed: +{Math.round(getPetBonus("growthSpeed") * 100)}%</div>
                      )}
                      {getPetBonus("luckBonus") > 0 && (
                        <div>🍀 Luck Bonus: +{Math.round(getPetBonus("luckBonus") * 100)}%</div>
                      )}
                      {getPetBonus("quality") > 0 && (
                        <div>⭐ Quality Bonus: +{Math.round(getPetBonus("quality") * 100)}%</div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                {(() => {
                  const stats = calculateStats();
                  const topCrops = getTopCrops();
                  
                  return (
                    <>
                      {/* Overview Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                          <div className="text-xs text-gray-600">Total Earnings</div>
                          <div className="text-lg font-bold">{analytics.totalEarnings}🪙</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                          <div className="text-xs text-gray-600">Net Profit</div>
                          <div className="text-lg font-bold">{stats.profit}🪙</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                          <div className="text-xs text-gray-600">Harvest Rate</div>
                          <div className="text-lg font-bold">{stats.harvestRate.toFixed(1)}%</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="text-xs text-gray-600">Play Time</div>
                          <div className="text-lg font-bold">{Math.floor(stats.totalPlayTime / 60)}m</div>
                        </div>
                      </div>
                      
                      {/* Activity Stats */}
                      <div>
                        <h4 className="font-semibold mb-2">📈 Activity Statistics:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Crops Planted:</span>
                            <Badge variant="outline">{analytics.cropsPlanted}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Crops Harvested:</span>
                            <Badge variant="outline">{analytics.cropsHarvested}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Crops Withered:</span>
                            <Badge variant="outline">{analytics.cropsWithered}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Items Processed:</span>
                            <Badge variant="outline">{analytics.processedItems}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Research Completed:</span>
                            <Badge variant="outline">{analytics.researchCompleted}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Highest Combo:</span>
                            <Badge variant="outline">{analytics.highestCombo}x</Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Top Crops */}
                      {topCrops.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">🌾 Top Performing Crops:</h4>
                          <div className="space-y-1">
                            {topCrops.map((crop, idx) => (
                              <div key={crop.crop} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                <span className="font-medium">
                                  #{idx + 1} {crop.crop}
                                </span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{crop.harvested}/{crop.planted}</Badge>
                                  <Badge variant="default">{crop.earnings}🪙</Badge>
                                  <Badge variant="outline">{crop.efficiency.toFixed(0)}%</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Efficiency Metrics */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">⚡ Efficiency Metrics:</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Earnings per Harvest:</span>
                            <span className="font-medium">{stats.avgEarningsPerHarvest.toFixed(1)}🪙</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Earnings per Minute:</span>
                            <span className="font-medium">{stats.earningsPerMinute.toFixed(1)}🪙</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wither Rate:</span>
                            <span className="font-medium">{stats.witherRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="quests" className="space-y-4">
                {/* Active Quests */}
                {activeQuests.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">📜 Active Quests:</h4>
                    {activeQuests.map(questId => {
                      const quest = QUESTS[questId];
                      if (!quest) return null;
                      const progress = questProgress[questId] || {};
                      
                      return (
                        <div key={questId} className="p-3 border-2 border-yellow-300 rounded-lg mb-2 bg-yellow-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{quest.emoji}</span>
                                <span className="font-medium">{quest.name}</span>
                                <Badge variant={
                                  quest.type === "tutorial" ? "default" :
                                  quest.type === "main" ? "secondary" :
                                  "outline"
                                }>
                                  {quest.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
                              <p className="text-xs text-gray-500 italic mt-1">"{quest.story}"</p>
                            </div>
                          </div>
                          
                          {/* Progress bars */}
                          {Object.entries(quest.requirements).map(([req, target]) => {
                            const current = progress[req] || 0;
                            const percent = Math.min(100, (current / target) * 100);
                            return (
                              <div key={req} className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="capitalize">{req.replace(/_/g, ' ')}</span>
                                  <span>{current}/{target}</span>
                                </div>
                                <Progress value={percent} className="h-2" />
                              </div>
                            );
                          })}
                          
                          {/* Rewards */}
                          <div className="text-xs text-gray-600 mt-2">
                            Rewards: 
                            {quest.rewards.coins && ` ${quest.rewards.coins}🪙`}
                            {quest.rewards.xp && ` +${quest.rewards.xp}XP`}
                            {quest.rewards.skillPoints && ` +${quest.rewards.skillPoints}SP`}
                            {quest.rewards.researchPoints && ` +${quest.rewards.researchPoints}RP`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Available Side Quests */}
                <div>
                  <h4 className="font-semibold mb-2">⭐ Available Side Quests:</h4>
                  {Object.values(QUESTS)
                    .filter(q => q.type === "side" && !completedQuests.includes(q.id) && !activeQuests.includes(q.id))
                    .map(quest => (
                      <div key={quest.id} className="p-3 border rounded-lg mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{quest.emoji}</span>
                              <span className="font-medium">{quest.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">{quest.description}</p>
                          </div>
                          <Button size="sm" onClick={() => acceptQuest(quest.id)}>
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* Completed Quests Count */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quests Completed:</span>
                    <Badge variant="default">{completedQuests.length}</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-1 max-w-sm z-50 pointer-events-none">
        {notifications.map((n, index) => (
          <div
            key={n.id}
            className={`p-2 px-3 rounded-lg shadow-lg text-sm transition-all duration-300 ${
              n.type === "error" ? "bg-red-100 text-red-800 border border-red-200" :
              n.type === "success" ? "bg-green-100 text-green-800 border border-green-200" :
              "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
            style={{
              animation: 'slideIn 0.3s ease-out',
              opacity: 1 - (index * 0.15), // Fade older notifications
              transform: `translateY(${index * -5}px)` // Stack effect
            }}
          >
            {n.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmSimCanvasFixed;