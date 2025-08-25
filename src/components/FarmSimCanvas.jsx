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
  const [actionHistory, setActionHistory] = useState(() => saved?.actionHistory || []);

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
      pestOutbreaks, treatmentInventory, maxGridSize, unlockedGridSizes, marketPerks, vehicleUpgrades]);

  // Check for pests/diseases periodically
  useEffect(() => {
    const interval = setInterval(checkForPestsAndDiseases, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [plots, currentTime, currentWeather, companionBonuses]);

  // Plant function
  const plant = (i) => {
    if (!selectedSeed || !inventory[selectedSeed] || inventory[selectedSeed] <= 0) {
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
      [selectedSeed]: prev[selectedSeed] - 1
    }));

    addNotification(`Planted ${selectedSeed}!`, "success");
    
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
    
    // Random chance to get 1 seed back on harvest (e.g., 35%)
    setInventory(prev => {
      const next = { ...prev };
      if (Math.random() < 0.35) {
        next[plot.seed] = (next[plot.seed] || 0) + 1;
      }
      return next;
    });
    
    setScore(prev => prev + value);
    setTotalHarvests(prev => prev + 1);
    setExperience(prev => prev + 5);
    setHarvestedCropTypes(prev => new Set([...prev, plot.seed]));
    
    // Add research points (1 per harvest)
    addResearchPoints(1);

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

  // Buy seeds
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
      setInventory(prev => ({
        ...prev,
      [seed]: (prev[seed] || 0) + amount
    }));
    
    addNotification(`Bought ${amount} ${seed} seeds!`, "success");
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
        <CardContent className="p-2 text-center min-h-[100px] flex flex-col justify-center">
          <div className="text-xl mb-1">
            {plot.status === "locked" && "🔒"}
            {plot.status === "empty" && "🟫"}
            {plot.status === "growing" && seedData && 
              (plot.stage === 0 ? "🌱" : plot.stage === 1 ? "🌿" : "🌾")
            }
            {plot.status === "ready" && seedData && seedData.emoji}
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
                  </div>
                </CardContent>
              </Card>
    );
  };

    return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
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
              <div 
                className="grid gap-2 mb-4 p-2"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {plots.map((plot, i) => (
                  <PlotCard key={i} plot={plot} index={i} />
                ))}
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full touch-lg">
                                <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 sm:static fm-tabs-bottom">
                  <TabsTrigger value="inventory" className="text-xs px-2 py-1 flex-shrink-0">📦 Inventory</TabsTrigger>
                  <TabsTrigger value="shop" className="text-xs px-2 py-1 flex-shrink-0">🛒 Shop</TabsTrigger>
                  <TabsTrigger value="market" className="text-xs px-2 py-1 flex-shrink-0">🏪 Market</TabsTrigger>
                  <TabsTrigger value="processing" className="text-xs px-2 py-1 flex-shrink-0">🏭 Processing</TabsTrigger>
                  <TabsTrigger value="automation" className="text-xs px-2 py-1 flex-shrink-0">🤖 Automation</TabsTrigger>
                  <TabsTrigger value="research" className="text-xs px-2 py-1 flex-shrink-0">🧪 Research</TabsTrigger>
                  <TabsTrigger value="contracts" className="text-xs px-2 py-1 flex-shrink-0">📜 Contracts</TabsTrigger>
                  <TabsTrigger value="logistics" className="text-xs px-2 py-1 flex-shrink-0">🚚 Logistics</TabsTrigger>
                  <TabsTrigger value="buildings" className="text-xs px-2 py-1 flex-shrink-0">🏗️ Buildings</TabsTrigger>
                  <TabsTrigger value="events" className="text-xs px-2 py-1 flex-shrink-0">🎉 Events</TabsTrigger>
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
                    <h4 className="font-medium">🌾 Seeds & Crops:</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {Object.entries(inventory).map(([item, quantity]) => {
                        const seedData = DEFAULT_RULES.seeds[item];
                        if (!seedData || quantity <= 0) return null;
                        
                        return (
                          <div key={item} className="text-xs bg-green-50 p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="cursor-pointer" onClick={() => setSelectedSeed(item)} title="Click to select seed">
                                {seedData.emoji} {seedData.name}
                              </span>
                              <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="text-gray-500">Value: {seedData.baseValue}💰 each</div>
                            {selectedSeed === item && (
                              <div className="text-[10px] text-green-700 mt-1">Selected</div>
                            )}
                          </div>
                        );
                      })}
                      {Object.values(inventory).every(v => v <= 0) && (
                        <p className="text-sm text-gray-500 col-span-2">No crops in inventory</p>
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
                  <div>
                    <label className="text-sm font-medium">Selected Seed:</label>
                    <select 
                      value={selectedSeed}
                      onChange={(e) => setSelectedSeed(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {Object.entries({ ...DEFAULT_RULES.seeds, ...limitedTimeSeeds }).map(([seed, count]) => (
                        <option key={seed} value={seed}>
                          {(DEFAULT_RULES.seeds[seed] || LIMITED_TIME_CROPS[seed])?.emoji} {(DEFAULT_RULES.seeds[seed] || LIMITED_TIME_CROPS[seed])?.name || seed} ({inventory[seed] || 0})
                        </option>
                      ))}
                    </select>
                    </div>

                    <div className="space-y-2">
                    <h4 className="font-medium">Buy Seeds:</h4>
                                        {Object.entries(DEFAULT_RULES.seeds).map(([seed, data]) => (
                      <div key={seed} className="flex items-center justify-between gap-2">
                        <span className="text-sm flex-1">{data.emoji} {data.name}</span>
                        <Button
                          size="sm"
                          onClick={() => buySeeds(seed, 5)}
                          disabled={coins < data.shopPrice * 5}
                          className="text-xs px-2 py-1"
                        >
                          Buy 5 ({data.shopPrice * 5}💰)
                        </Button>
                    </div>
                    ))}
                    
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
                                  </TabsContent>
                
                <TabsContent value="market" className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border">
                    <h3 className="font-medium">🏪 Market Trading</h3>
                    <p className="text-sm text-gray-600">Sell crops to different towns for profit!</p>
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
                      {Object.entries(marketPrices).map(([crop, price]) => {
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
