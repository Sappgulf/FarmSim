/**
 * Game Constants and Configuration
 * Centralized configuration for all game mechanics
 */

// LEVEL PROGRESSION
export const LEVELS = [
  { id: "lvl1", label: "Novice Farmer", targetCoins: 100, minutes: 6, reward: 25, difficulty: "Easy" },
  { id: "lvl2", label: "Growing Skills", targetCoins: 200, minutes: 8, reward: 40, difficulty: "Medium" },
  { id: "lvl3", label: "Master Gardener", targetCoins: 350, minutes: 10, reward: 70, difficulty: "Hard" },
  { id: "endless", label: "Endless Farm", targetCoins: 999999, minutes: 9999, reward: 0, difficulty: "∞" },
];

// CROP DEFINITIONS
export const SEED_TYPES = {
  carrot: {
    name: "Carrot",
    emoji: "🥕",
    price: 8,
    baseValue: 15,
    growthTime: 45,
    season: "spring",
    description: "Fast-growing root vegetable"
  },
  wheat: {
    name: "Wheat",
    emoji: "🌾",
    price: 12,
    baseValue: 25,
    growthTime: 60,
    season: "summer",
    description: "Staple grain crop"
  },
  corn: {
    name: "Corn",
    emoji: "🌽",
    price: 18,
    baseValue: 35,
    growthTime: 75,
    season: "summer",
    description: "Sweet summer corn"
  },
  tomato: {
    name: "Tomato",
    emoji: "🍅",
    price: 15,
    baseValue: 30,
    growthTime: 55,
    season: "summer",
    description: "Juicy red tomatoes"
  },
  potato: {
    name: "Potato",
    emoji: "🥔",
    price: 10,
    baseValue: 20,
    growthTime: 50,
    season: "fall",
    description: "Versatile tuber crop"
  },
  pumpkin: {
    name: "Pumpkin",
    emoji: "🎃",
    price: 25,
    baseValue: 50,
    growthTime: 90,
    season: "fall",
    description: "Large orange gourds"
  }
};

// WEATHER SYSTEM
export const WEATHER_TYPES = {
  sunny: {
    name: "Sunny",
    emoji: "☀️",
    description: "Perfect growing conditions",
    growthMultiplier: 1.0,
    probability: 0.4
  },
  rainy: {
    name: "Rainy",
    emoji: "🌧️",
    description: "Automatic watering, faster growth",
    growthMultiplier: 1.3,
    probability: 0.25
  },
  cloudy: {
    name: "Cloudy",
    emoji: "☁️",
    description: "Cooler, slower growth",
    growthMultiplier: 0.8,
    probability: 0.2
  },
  stormy: {
    name: "Stormy",
    emoji: "⛈️",
    description: "Harsh conditions, slow growth",
    growthMultiplier: 0.6,
    probability: 0.1
  },
  drought: {
    name: "Drought",
    emoji: "🌵",
    description: "Hot and dry, needs extra water",
    growthMultiplier: 0.5,
    probability: 0.05
  }
};

// BUILDING TYPES
export const BUILDING_TYPES = {
  greenhouse: {
    name: "Greenhouse",
    emoji: "🏠",
    price: 200,
    description: "Protects crops from weather, +50% growth speed",
    effect: "weather_protection",
    bonus: 1.5
  },
  sprinkler: {
    name: "Sprinkler System",
    emoji: "💧",
    price: 150,
    description: "Automatically waters crops",
    effect: "auto_water",
    bonus: 1
  },
  scarecrow: {
    name: "Scarecrow",
    emoji: "🪴",
    price: 100,
    description: "Prevents pest damage, +10% yield",
    effect: "pest_protection",
    bonus: 0.1
  },
  silo: {
    name: "Silo",
    emoji: "🗼",
    price: 150,
    description: "Automatically sells crops when storage is full",
    effect: "auto_sell",
    bonus: 1
  },
  windmill: {
    name: "Windmill",
    emoji: "🌪️",
    price: 400,
    description: "Generates +5 coins per minute passively",
    effect: "income",
    bonus: 5
  },
  beehive: {
    name: "Beehive",
    emoji: "🐝",
    price: 250,
    description: "Bees pollinate crops for +25% yield and produce honey",
    effect: "pollination",
    bonus: 0.25
  }
};

// LIVESTOCK TYPES
export const LIVESTOCK_TYPES = {
  chicken: {
    name: "Chicken",
    emoji: "🐔",
    price: 75,
    description: "Produces eggs regularly",
    product: "eggs",
    productionTime: 120,
    food: { type: "grain", consumption: 2 },
    maxCount: 20
  },
  cow: {
    name: "Cow",
    emoji: "🐄",
    price: 300,
    description: "Produces milk and cheese",
    product: "milk",
    productionTime: 180,
    food: { type: "hay", consumption: 5 },
    maxCount: 10
  },
  pig: {
    name: "Pig",
    emoji: "🐷",
    price: 150,
    description: "Produces meat and truffles",
    product: "meat",
    productionTime: 240,
    food: { type: "slop", consumption: 3 },
    maxCount: 15
  },
  sheep: {
    name: "Sheep",
    emoji: "🐑",
    price: 200,
    description: "Produces wool and meat",
    product: "wool",
    productionTime: 300,
    food: { type: "grass", consumption: 4 },
    maxCount: 12
  }
};

// EQUIPMENT TYPES
export const EQUIPMENT_TYPES = {
  tractor: {
    name: "Tractor",
    emoji: "🚜",
    price: 500,
    description: "Plant and harvest faster",
    effect: "speed",
    bonus: 2
  },
  irrigation: {
    name: "Irrigation System",
    emoji: "💧",
    price: 300,
    description: "Automatic watering for all crops",
    effect: "auto_water",
    bonus: 1
  },
  fertilizer_spreader: {
    name: "Fertilizer Spreader",
    emoji: "🌱",
    price: 250,
    description: "More efficient fertilizer use",
    effect: "fertilizer_efficiency",
    bonus: 2
  },
  harvester: {
    name: "Harvester",
    emoji: "⚡",
    price: 750,
    description: "Automatic harvesting when crops are ready",
    effect: "auto_harvest",
    bonus: 1
  }
};

// PROCESSING RECIPES
export const PROCESSING_RECIPES = {
  flour: {
    input: "wheat",
    output: "flour",
    ratio: 3,
    time: 60,
    value: 80,
    description: "Mill wheat into flour"
  },
  bread: {
    input: "flour",
    output: "bread",
    ratio: 2,
    time: 90,
    value: 120,
    description: "Bake flour into bread"
  },
  juice: {
    input: "tomato",
    output: "tomato_juice",
    ratio: 4,
    time: 45,
    value: 100,
    description: "Press tomatoes into juice"
  },
  chips: {
    input: "potato",
    output: "potato_chips",
    ratio: 5,
    time: 75,
    value: 150,
    description: "Fry potatoes into chips"
  }
};

// ACHIEVEMENTS
export const ACHIEVEMENTS = [
  { 
    id: "first_harvest", 
    name: "First Harvest", 
    desc: "Harvest your first crop", 
    reward: 15, 
    icon: "🌱" 
  },
  { 
    id: "green_thumb", 
    name: "Green Thumb", 
    desc: "Harvest 10 crops", 
    reward: 25, 
    icon: "👍" 
  },
  { 
    id: "weathered", 
    name: "Weather Expert", 
    desc: "Survive 3 weather events", 
    reward: 25, 
    icon: "⛈️" 
  },
  { 
    id: "coin_collector", 
    name: "Coin Collector", 
    desc: "Earn 300 coins total", 
    reward: 40, 
    icon: "💰" 
  },
  { 
    id: "speed_farmer", 
    name: "Speed Farmer", 
    desc: "Complete Level 1 in under 4 minutes", 
    reward: 30, 
    icon: "⚡" 
  },
  { 
    id: "field_master", 
    name: "Field Master", 
    desc: "Unlock the maximum field size", 
    reward: 100, 
    icon: "🏆" 
  }
];

// PRESTIGE SYSTEM
export const PRESTIGE_LEVELS = [
  { level: 1, name: "Apprentice Farmer", emoji: "🌱", requirement: 1000, multiplier: 1.1 },
  { level: 2, name: "Skilled Farmer", emoji: "🌿", requirement: 2500, multiplier: 1.25 },
  { level: 3, name: "Expert Farmer", emoji: "🌾", requirement: 5000, multiplier: 1.5 },
  { level: 4, name: "Master Farmer", emoji: "🏆", requirement: 10000, multiplier: 2.0 },
  { level: 5, name: "Legendary Farmer", emoji: "👑", requirement: 20000, multiplier: 3.0 }
];

export const PRESTIGE_BONUSES = {
  skill_points: 5,
  coin_multiplier: 0.1,
  growth_speed: 0.05,
  quality_chance: 0.02
};

// SKILL TREES
export const SKILL_TREES = {
  farming: {
    name: "Farming",
    emoji: "🌾",
    skills: {
      fast_growth: {
        name: "Fast Growth",
        description: "Crops grow 10% faster per level",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5]
      },
      high_yield: {
        name: "High Yield",
        description: "Crops give 15% more value per level",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5]
      },
      weather_resistance: {
        name: "Weather Resistance",
        description: "Reduces negative weather effects",
        maxLevel: 3,
        cost: [2, 4, 6]
      }
    }
  },
  business: {
    name: "Business",
    emoji: "💼",
    skills: {
      market_savvy: {
        name: "Market Savvy",
        description: "Better market prices",
        maxLevel: 5,
        cost: [1, 2, 3, 4, 5]
      },
      bulk_buying: {
        name: "Bulk Buying",
        description: "Cheaper seed prices",
        maxLevel: 3,
        cost: [2, 4, 6]
      },
      efficient_processing: {
        name: "Efficient Processing",
        description: "Faster processing times",
        maxLevel: 4,
        cost: [2, 3, 4, 5]
      }
    }
  }
};

// INSURANCE TYPES
export const INSURANCE_TYPES = {
  crop: {
    name: "Crop Insurance",
    emoji: "🛡️",
    price: 50,
    description: "Protects against crop loss from weather",
    coverage: "weather_damage",
    duration: 300
  },
  equipment: {
    name: "Equipment Insurance",
    emoji: "🔧",
    price: 100,
    description: "Protects expensive equipment from breakdown",
    coverage: "equipment_damage",
    duration: 600
  },
  livestock: {
    name: "Livestock Insurance",
    emoji: "🐄",
    price: 75,
    description: "Protects animals from disease and accidents",
    coverage: "livestock_damage",
    duration: 450
  }
};

// SAVE/LOAD CONFIGURATION
export const SAVE_KEY = "farm_sim_enhanced_v2";
export const SAVE_VERSION = 2;

// GAME SETTINGS
export const GAME_CONFIG = {
  maxPlots: 25,
  maxNotifications: 10,
  maxLogEntries: 50,
  autosaveInterval: 1000,
  notificationDuration: 4000,
  defaultGrowthInterval: 5,
  weatherChangeDuration: 30
};
