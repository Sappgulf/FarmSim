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
  { id: "lvl1", label: "Novice Farmer", targetCoins: 80, minutes: 5, reward: 20, difficulty: "Easy" },
  { id: "lvl2", label: "Growing Skills", targetCoins: 150, minutes: 7, reward: 35, difficulty: "Medium" },
  { id: "lvl3", label: "Master Gardener", targetCoins: 250, minutes: 10, reward: 60, difficulty: "Hard" },
  { id: "endless", label: "Endless Farm", targetCoins: 999999, minutes: 9999, reward: 0, difficulty: "∞" },
];

const DEFAULT_RULES = {
  seeds: {
    // Basic crops - easy to grow, reasonable rewards
    carrot: { stages: 3, secondsPerStage: 8, baseValue: 12, shopPrice: 4, emoji: "🥕", rarity: "common", season: "spring", family: "root" },
    potato: { stages: 3, secondsPerStage: 10, baseValue: 15, shopPrice: 5, emoji: "🥔", rarity: "common", season: "fall", family: "root" },
    lettuce: { stages: 3, secondsPerStage: 6, baseValue: 8, shopPrice: 3, emoji: "🥬", rarity: "common", season: "spring", family: "leaf" },
    garlic: { stages: 3, secondsPerStage: 12, baseValue: 18, shopPrice: 6, emoji: "🧄", rarity: "common", season: "fall", family: "bulb" },

    // Mid-tier crops - moderate difficulty and rewards
    corn: { stages: 4, secondsPerStage: 12, baseValue: 22, shopPrice: 8, emoji: "🌽", rarity: "uncommon", season: "summer", family: "grain" },
    tomato: { stages: 4, secondsPerStage: 14, baseValue: 28, shopPrice: 10, emoji: "🍅", rarity: "uncommon", season: "summer", family: "fruit" },
    bellPepper: { stages: 4, secondsPerStage: 15, baseValue: 32, shopPrice: 12, emoji: "🫑", rarity: "uncommon", season: "summer", family: "fruit" },

    // Advanced crops - higher difficulty, better rewards
    strawberry: { stages: 5, secondsPerStage: 16, baseValue: 35, shopPrice: 15, emoji: "🍓", rarity: "rare", season: "spring", family: "berry" },
    sunflower: { stages: 5, secondsPerStage: 18, baseValue: 42, shopPrice: 18, emoji: "🌻", rarity: "rare", season: "summer", family: "flower" },
    pumpkin: { stages: 6, secondsPerStage: 20, baseValue: 55, shopPrice: 25, emoji: "🎃", rarity: "epic", season: "fall", family: "gourd" },
    // Special night crop
    moonflower: { stages: 4, secondsPerStage: 15, baseValue: 30, shopPrice: 14, emoji: "🌙", rarity: "rare", season: "summer", family: "flower" },

    // Perennial trees (orchards)
    apple_tree: { stages: 6, secondsPerStage: 30, baseValue: 90, shopPrice: 40, emoji: "🍎", rarity: "rare", season: "fall", family: "tree", perennial: true },
    orange_tree: { stages: 6, secondsPerStage: 28, baseValue: 85, shopPrice: 38, emoji: "🍊", rarity: "rare", season: "summer", family: "tree", perennial: true },

    // Processing ingredients - specialized crops
    wheat: { stages: 4, secondsPerStage: 10, baseValue: 12, shopPrice: 5, emoji: "🌾", rarity: "common", season: "summer", family: "grain" },
    grapes: { stages: 5, secondsPerStage: 18, baseValue: 28, shopPrice: 12, emoji: "🍇", rarity: "uncommon", season: "fall", family: "fruit" },
    cocoa_beans: { stages: 6, secondsPerStage: 25, baseValue: 45, shopPrice: 20, emoji: "🌰", rarity: "rare", season: "summer", family: "seed" },
  },
  buildings: {
    // Early game buildings - affordable and useful
    silo: { price: 120, emoji: "🗼", name: "Silo", description: "Reduces withering time by 50%", effect: "storage", bonus: 0.5 },
    barn: { price: 180, emoji: "🏚️", name: "Barn", description: "Stores crops and provides +15% harvest value", effect: "storage", bonus: 0.15 },

    // Mid-game buildings - moderate cost
    beehive: { price: 250, emoji: "🐝", name: "Beehive", description: "Bees pollinate crops for +20% yield and produce honey", effect: "pollination", bonus: 0.2 },
    windmill: { price: 300, emoji: "🌪️", name: "Windmill", description: "Generates +3 coins per minute passively", effect: "income", bonus: 3 },
    greenhouse: { price: 400, emoji: "🏡", name: "Greenhouse", description: "All crops grow 30% faster regardless of weather", effect: "growth", bonus: 0.3 },
    solar: { price: 300, emoji: "🔆", name: "Solar Panels", description: "Generates energy; prevents growth slowdown during outages", effect: "energy", bonus: 1 },
    wind_turbine: { price: 350, emoji: "🌀", name: "Wind Turbine", description: "Generates energy at night/windy weather", effect: "energy", bonus: 1 },
    battery: { price: 250, emoji: "🔋", name: "Battery Storage", description: "Stores energy for continuous operation", effect: "energy", bonus: 1 },
    owl_house: { price: 120, emoji: "🦉", name: "Owl House", description: "Reduces nocturnal pests", effect: "predator", bonus: 0.3 },
    ladybug_garden: { price: 100, emoji: "🐞", name: "Ladybug Garden", description: "Reduces daytime pests", effect: "predator", bonus: 0.2 },
    // Additional upgrades
    irrigation: { price: 350, emoji: "🚿", name: "Irrigation", description: "Auto-waters crops; small growth boost", effect: "growth", bonus: 0.15 },
    composter: { price: 220, emoji: "♻️", name: "Composter", description: "Enhances fertilizer; small growth boost", effect: "fertilizer", bonus: 0.10 },
    tractor: { price: 500, emoji: "🚜", name: "Tractor", description: "+15% harvest value", effect: "harvest", bonus: 0.15 },
    weather_station: { price: 280, emoji: "🌦️", name: "Weather Station", description: "Mitigates bad weather; boosts rain growth", effect: "weather", bonus: 0.05 },

    // Late-game building - high value
    workshop: { price: 600, emoji: "🏭", name: "Workshop", description: "Enables crop processing into valuable products", effect: "processing", bonus: 1 },
    research_lab: { price: 450, emoji: "🔬", name: "Research Lab", description: "Unlock hybrid seeds and research upgrades", effect: "research", bonus: 1 },
    delivery_van: { price: 200, emoji: "🚚", name: "Delivery Van", description: "Reduce decay during deliveries", effect: "delivery", bonus: 0.2 }
  },
  livestock: {
    // Basic livestock - affordable, steady income
    chicken: { price: 60, emoji: "🐔", name: "Chicken", description: "Produces eggs every 3 minutes", product: "egg", interval: 180, value: 10 },
    sheep: { price: 90, emoji: "🐑", name: "Sheep", description: "Produces wool every 6 minutes", product: "wool", interval: 360, value: 20 },

    // Advanced livestock - higher cost, better rewards
    cow: { price: 150, emoji: "🐄", name: "Cow", description: "Produces milk every 5 minutes", product: "milk", interval: 300, value: 30 },
    goat: { price: 140, emoji: "🐐", name: "Goat", description: "Produces milk and can breed", product: "goat_milk", interval: 360, value: 35, breedingTime: 720 },
    pig: { price: 120, emoji: "🐷", name: "Pig", description: "Produces truffles and can breed", product: "truffle", interval: 600, value: 40, breedingTime: 900 },
    rabbit: { price: 70, emoji: "🐰", name: "Rabbit", description: "Fast breeding, produces fur", product: "rabbit_fur", interval: 240, value: 18, breedingTime: 180 },
  },
  processing: {
    // Basic processing (single ingredient)
    "carrot": { output: "carrot_juice", emoji: "🥤", multiplier: 2.5, name: "Carrot Juice" },
    "corn": { output: "popcorn", emoji: "🍿", multiplier: 3.0, name: "Popcorn" },
    "tomato": { output: "tomato_sauce", emoji: "🍅", multiplier: 2.8, name: "Tomato Sauce" },
    "strawberry": { output: "jam", emoji: "🍓", multiplier: 4.0, name: "Strawberry Jam" },
    "pumpkin": { output: "pumpkin_pie", emoji: "🥧", multiplier: 4.5, name: "Pumpkin Pie" },
    "honey": { output: "honey_jar", emoji: "🍯", multiplier: 2.0, name: "Honey Jar" },

    // Advanced processing (multiple ingredients)
    "cheese": {
      output: "aged_cheese",
      emoji: "🧀",
      multiplier: 5.0,
      name: "Aged Cheese",
      requires: ["milk", "salt"],
      quantities: { milk: 2, salt: 1 },
      processingTime: 60
    },
    "bread": {
      output: "artisan_bread",
      emoji: "🍞",
      multiplier: 4.5,
      name: "Artisan Bread",
      requires: ["wheat", "water", "yeast"],
      quantities: { wheat: 3, water: 1, yeast: 1 },
      processingTime: 45
    },
    "preserves": {
      output: "luxury_jam",
      emoji: "🍯",
      multiplier: 6.0,
      name: "Luxury Preserves",
      requires: ["strawberry", "sugar", "honey"],
      quantities: { strawberry: 4, sugar: 2, honey: 1 },
      processingTime: 90
    },
    "wine": {
      output: "fine_wine",
      emoji: "🍷",
      multiplier: 8.0,
      name: "Fine Wine",
      requires: ["grapes", "water", "sugar"],
      quantities: { grapes: 5, water: 2, sugar: 1 },
      processingTime: 120
    },
    "chocolate": {
      output: "dark_chocolate",
      emoji: "🍫",
      multiplier: 7.0,
      name: "Dark Chocolate",
      requires: ["cocoa_beans", "sugar", "milk"],
      quantities: { cocoa_beans: 3, sugar: 2, milk: 1 },
      processingTime: 75
    }
  },
  // Basic tools - early game
  fertilizer: { shopPrice: 6, speedBonusPerStack: 0.4, maxStacks: 3, description: "Speeds up crop growth" },
  pesticide: { shopPrice: 5, description: "Eliminates pest infestations" },

  // Advanced tools - mid game
  wateringCan: { shopPrice: 30, efficiency: 1.3, description: "Enhanced watering efficiency" },
  scarecrow: { shopPrice: 60, protection: 2, description: "Protects crops from pests" },

  // Premium tools - late game
  sprinkler: { shopPrice: 100, radius: 1, description: "Automatic watering system" },
  compostTea: { shopPrice: 10, description: "Improves soil health for faster growth" },
  // NEW: Disease control and bee management
  fungicide: { shopPrice: 12, description: "Treats crop diseases" },
  beeFeed: { shopPrice: 15, description: "Increases bee happiness and pollination" },
  // Basic ingredients for advanced processing
  salt: { shopPrice: 2, description: "Basic seasoning ingredient" },
  sugar: { shopPrice: 4, description: "Sweetener for recipes" },
  yeast: { shopPrice: 6, description: "Essential for baking" },
  water: { shopPrice: 1, description: "Basic processing ingredient" },
  animalFeed: { shopPrice: 8, description: "Food for livestock to increase happiness and production" },
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
  blight: { name: "Blight", emoji: "🦠", effect: "Reduces yield by 30%", spreadChance: 0.08, cureItem: "fungicide" },
  rust: { name: "Rust", emoji: "🟫", effect: "Slows growth by 25%", spreadChance: 0.06, cureItem: "fungicide" },
  wilt: { name: "Wilt", emoji: "🥀", effect: "Increases water needs", spreadChance: 0.05, cureItem: "fungicide" },
  mosaic: { name: "Mosaic", emoji: "🎭", effect: "Minor growth issues", spreadChance: 0.04, cureItem: "fungicide" },
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

// Specializations, quests, and artifacts (MVP)
const SPECIALIZATIONS = {
  organic: { id: "organic", name: "Organic", emoji: "🌱", desc: "+5% sale value; healthier soil" },
  industrial: { id: "industrial", name: "Industrial", emoji: "🏭", desc: "+10% growth speed" },
  artisan: { id: "artisan", name: "Artisan", emoji: "🎨", desc: "+10% sale value for products" },
};

const QUESTS = {
  harvest_20: { id: "harvest_20", name: "First Harvest", desc: "Harvest 20 crops.", target: 20, rewardCoins: 100, rewardArtifact: null },
  restore_barn: { id: "restore_barn", name: "Restore the Barn", desc: "Build the Barn building.", target: 1, rewardCoins: 150, rewardArtifact: "storm_shield" },
};

const ARTIFACTS = {
  stage_skip: { id: "stage_skip", name: "Timekeeper's Seed", emoji: "⏩", desc: "Small extra growth each tick" },
  storm_shield: { id: "storm_shield", name: "Storm Shield", emoji: "🛡️", desc: "Mitigate bad weather effects" },
};

const MAX_SIZE = 5;
const MIN_SIZE = 3;

const EXPANSION_COSTS = {
  4: 80,   // 3x3 -> 4x4
  5: 150,  // 4x4 -> 5x5
};

// Pasture (animal area) expansion
const PASTURE_MIN = 2;
const PASTURE_MAX = 5;
const PASTURE_EXPANSION_COSTS = {
  3: 100,
  4: 200,
  5: 350,
};

// Pasture capacity upgrades (number of animals allowed)
const PASTURE_CAPACITY_COSTS = {
  6: 0,     // starting cap
  8: 120,
  10: 220,
  12: 350,
};

function getNextPastureCapacity(current) {
  const caps = Object.keys(PASTURE_CAPACITY_COSTS).map(n => parseInt(n, 10)).sort((a,b)=>a-b);
  for (const cap of caps) {
    if (cap > current) return cap;
  }
  return current;
}

// Enhanced animal genetics system
const ANIMAL_TRAITS = {
  // Production traits
  fast: { id: "fast", emoji: "⚡", desc: "-20% production interval", type: "production", rarity: "common" },
  quality: { id: "quality", emoji: "⭐", desc: "+20% product value", type: "production", rarity: "uncommon" },
  prolific: { id: "prolific", emoji: "🎯", desc: "+50% production quantity", type: "production", rarity: "rare" },
  
  // Breeding traits
  fertile: { id: "fertile", emoji: "🐣", desc: "-25% breeding time", type: "breeding", rarity: "common" },
  nurturing: { id: "nurturing", emoji: "💖", desc: "Offspring have +1 trait", type: "breeding", rarity: "uncommon" },
  genetic_stability: { id: "genetic_stability", emoji: "🧬", desc: "Passes traits 100%", type: "breeding", rarity: "rare" },
  
  // Health traits
  hardy: { id: "hardy", emoji: "💪", desc: "Never gets sick", type: "health", rarity: "uncommon" },
  longevity: { id: "longevity", emoji: "🕰️", desc: "Ages 50% slower", type: "health", rarity: "rare" },
  
  // Special mutations (very rare)
  golden: { id: "golden", emoji: "🌟", desc: "Products worth 3x more", type: "mutation", rarity: "legendary" },
  rainbow: { id: "rainbow", emoji: "🌈", desc: "Produces random products", type: "mutation", rarity: "legendary" },
  giant: { id: "giant", emoji: "🏔️", desc: "Produces 2x quantity", type: "mutation", rarity: "legendary" }
};

const TRAIT_RARITY_CHANCES = {
  common: 0.30,      // 30% chance
  uncommon: 0.15,    // 15% chance  
  rare: 0.05,        // 5% chance
  legendary: 0.01    // 1% chance
};

function assignAnimalTraits(parent1Traits = [], parent2Traits = []) {
  const traits = [];
  const maxTraits = 3; // Maximum traits per animal
  
  // Inheritance from parents (if breeding)
  if (parent1Traits.length > 0 || parent2Traits.length > 0) {
    const allParentTraits = [...parent1Traits, ...parent2Traits];
    const uniqueParentTraits = [...new Set(allParentTraits)];
    
    uniqueParentTraits.forEach(traitId => {
      const trait = ANIMAL_TRAITS[traitId];
      if (!trait) return;
      
      let inheritChance = 0.5; // Base 50% inheritance chance
      
      // Genetic stability trait increases inheritance
      if (parent1Traits.includes('genetic_stability') || parent2Traits.includes('genetic_stability')) {
        inheritChance = 1.0; // 100% inheritance with genetic stability
      }
      
      if (Math.random() < inheritChance && traits.length < maxTraits) {
        traits.push(traitId);
      }
    });
    
    // Nurturing trait gives offspring extra trait
    if ((parent1Traits.includes('nurturing') || parent2Traits.includes('nurturing')) && traits.length < maxTraits) {
      const availableTraits = Object.keys(ANIMAL_TRAITS).filter(id => 
        !traits.includes(id) && ANIMAL_TRAITS[id].rarity !== 'legendary'
      );
      if (availableTraits.length > 0) {
        const bonusTrait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
        traits.push(bonusTrait);
      }
    }
  }
  
  // Random trait generation (for new animals or additional traits)
  while (traits.length < maxTraits) {
    const availableTraits = Object.keys(ANIMAL_TRAITS).filter(id => !traits.includes(id));
    if (availableTraits.length === 0) break;
    
    // Check for mutations first (very rare)
    const mutationTraits = availableTraits.filter(id => ANIMAL_TRAITS[id].type === 'mutation');
    if (mutationTraits.length > 0 && Math.random() < 0.001) { // 0.1% mutation chance
      traits.push(mutationTraits[Math.floor(Math.random() * mutationTraits.length)]);
      break; // Mutations are exclusive
    }
    
    // Regular trait assignment based on rarity
    let traitAssigned = false;
    for (const [rarity, chance] of Object.entries(TRAIT_RARITY_CHANCES)) {
      if (Math.random() < chance) {
        const rarityTraits = availableTraits.filter(id => 
          ANIMAL_TRAITS[id].rarity === rarity && ANIMAL_TRAITS[id].type !== 'mutation'
        );
        if (rarityTraits.length > 0) {
          traits.push(rarityTraits[Math.floor(Math.random() * rarityTraits.length)]);
          traitAssigned = true;
          break;
        }
      }
    }
    
    if (!traitAssigned) break; // No more traits to assign
  }
  
  return Array.from(new Set(traits));
}

function computeAnimalInterval(animal, rules) {
  const data = (rules.livestock && rules.livestock[animal.type]) || {};
  let interval = Math.max(30, data.interval || 300);
  
  if (animal.traits) {
    // Production traits
    if (animal.traits.includes("fast")) interval = Math.floor(interval * 0.8);
    
    // Health traits
    if (animal.traits.includes("hardy")) {
      // Hardy animals never get sick, so no illness penalty
    } else if (animal.ill) {
      interval = Math.floor(interval * 1.5);
    }
  } else if (animal.ill) {
    interval = Math.floor(interval * 1.5);
  }
  
  return interval;
}

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

// NEW: Farm themes and decorations
const FARM_THEMES = {
  classic: {
    name: "🌾 Classic Farm",
    description: "Traditional farming theme with green fields and wooden buildings",
    bg: "from-green-50 via-emerald-50 to-green-100",
    accent: "emerald",
    buildings: "🏚️🌳🌻"
  },
  modern: {
    name: "🏭 Modern Farm",
    description: "High-tech farming with automated systems and sleek designs",
    bg: "from-blue-50 via-slate-50 to-gray-100",
    accent: "blue",
    buildings: "🏭🤖⚡"
  },
  magical: {
    name: "✨ Magical Farm",
    description: "Enchanted farm with magical plants and mystical buildings",
    bg: "from-purple-50 via-pink-50 to-indigo-100",
    accent: "purple",
    buildings: "🏰🧙‍♀️🌟"
  },
  tropical: {
    name: "🌴 Tropical Farm",
    description: "Lush tropical paradise with exotic plants and palm trees",
    bg: "from-yellow-50 via-orange-50 to-amber-100",
    accent: "orange",
    buildings: "🌴🍍🏝️"
  },
  winter: {
    name: "❄️ Winter Wonderland",
    description: "Cozy winter farm with snow-covered fields and festive decorations",
    bg: "from-blue-50 via-cyan-50 to-indigo-100",
    accent: "cyan",
    buildings: "🏔️⛄🎄"
  }
};

const DECORATIONS = {
  // Basic decorations - early game
  garden_gnome: {
    name: "Garden Gnome",
    emoji: "🧝",
    price: 40,
    description: "Lucky garden gnome for good harvests"
  },
  path: {
    name: "Garden Path",
    emoji: "🪜",
    price: 50,
    description: "Stylish path for farm navigation"
  },

  // Mid-tier decorations
  scarecrow: {
    name: "Scarecrow",
    emoji: "",
    price: 70,
    description: "Classic scarecrow to protect your crops"
  },
  flower_bed: {
    name: "Flower Bed",
    emoji: "🌸",
    price: 80,
    description: "Beautiful flowers to decorate your farm"
  },

  // Premium decorations - late game
  windmill: {
    name: "Decorative Windmill",
    emoji: "🌪️",
    price: 120,
    description: "Beautiful windmill for aesthetic appeal"
  },
  fountain: {
    name: "Garden Fountain",
    emoji: "⛲",
    price: 150,
    description: "Peaceful fountain to beautify your farm"
  },
  statue: {
    name: "Farm Statue",
    emoji: "🗿",
    price: 200,
    description: "Impressive statue for farm prestige"
  }
};

// NEW: Seasonal events and festivals
const SEASONAL_EVENTS = {
  harvest_festival: {
    name: "🎉 Harvest Festival",
    description: "Celebrate the bountiful harvest! Higher crop yields and special bonuses",
    duration: 300, // 5 minutes
    season: "fall",
    bonuses: {
      yieldMultiplier: 1.5,
      qualityBonus: 0.3,
      coinBonus: 100
    },
    requirements: { harvests: 5 },
    rewards: [
      { type: "coins", amount: 500 },
      { type: "item", item: "pumpkin", amount: 5 },
      { type: "achievement", id: "harvest_king" }
    ]
  },
  weather_prediction_contest: {
    name: "🌤️ Weather Prediction Contest",
    description: "Test your weather prediction skills! Accurate forecasts earn bonus rewards",
    duration: 180, // 3 minutes
    season: "all",
    bonuses: {
      predictionBonus: 2.0,
      accuracyReward: 50
    },
    requirements: { predictions: 2 },
    rewards: [
      { type: "coins", amount: 300 },
      { type: "item", item: "beehive", amount: 1 },
      { type: "achievement", id: "weather_master" }
    ]
  },
  spring_blossom: {
    name: "🌸 Spring Blossom Festival",
    description: "Flowers bloom everywhere! Enhanced flower crop yields",
    duration: 240, // 4 minutes
    season: "spring",
    bonuses: {
      flowerMultiplier: 2.0,
      beePollinationBonus: 0.5
    },
    requirements: { flowers: 3 },
    rewards: [
      { type: "coins", amount: 200 },
      { type: "item", item: "sunflower", amount: 3 },
      { type: "item", item: "beehive", amount: 1 }
    ]
  },
  summer_olympics: {
    name: "🏅 Summer Farming Olympics",
    description: "Compete in farming challenges! Fastest growth wins prizes",
    duration: 360, // 6 minutes
    season: "summer",
    bonuses: {
      growthSpeed: 1.8,
      comboMultiplier: 1.5
    },
    requirements: { level: 1 },
    rewards: [
      { type: "coins", amount: 800 },
      { type: "item", item: "greenhouse", amount: 1 },
      { type: "achievement", id: "farming_champion" }
    ]
  }
};

// NEW: Limited-time crops
const LIMITED_TIME_CROPS = {
  golden_wheat: {
    name: "Golden Wheat",
    emoji: "🌟",
    baseValue: 50,
    season: "fall",
    event: "harvest_festival",
    stages: 4,
    secondsPerStage: 12,
    description: "Rare golden wheat - only available during Harvest Festival"
  },
  rainbow_flower: {
    name: "Rainbow Flower",
    emoji: "🌈",
    baseValue: 80,
    season: "spring",
    event: "spring_blossom",
    stages: 5,
    secondsPerStage: 15,
    description: "Magical rainbow flower - exclusive to Spring Blossom Festival"
  }
};

// NEW: Festival System
const FESTIVALS = {
  harvest_festival: {
    id: "harvest_festival",
    name: "Harvest Festival",
    emoji: "🎃",
    season: "fall",
    duration: 300000, // 5 minutes
    bonusMultiplier: 2.0,
    requirements: { totalHarvested: 50 },
    rewards: { coins: 200, reputation: 10, specialSeeds: 3 },
    description: "Celebrate the harvest! Double coin rewards for all harvests.",
    competitionType: "harvest_volume"
  },
  spring_fair: {
    id: "spring_fair",
    name: "Spring Fair",
    emoji: "🌸",
    season: "spring",
    duration: 240000, // 4 minutes
    growthBonus: 0.5, // 50% faster growth
    requirements: { plantsGrown: 30 },
    rewards: { coins: 150, reputation: 8, seeds: 10 },
    description: "Spring planting competition! 50% faster growth for all crops.",
    competitionType: "planting_speed"
  },
  summer_market: {
    id: "summer_market",
    name: "Summer Market",
    emoji: "☀️",
    season: "summer",
    duration: 300000, // 5 minutes
    priceBonus: 0.8, // 80% higher prices
    requirements: { marketSales: 100 },
    rewards: { coins: 300, reputation: 12 },
    description: "Peak market season! 80% higher sell prices.",
    competitionType: "market_sales"
  },
  winter_celebration: {
    id: "winter_celebration",
    name: "Winter Celebration",
    emoji: "❄️",
    season: "winter",
    duration: 180000, // 3 minutes
    animalBonus: 3.0, // Triple animal rewards
    requirements: { animalProducts: 20 },
    rewards: { coins: 250, reputation: 15, specialSeeds: 5 },
    description: "Winter feast! Triple rewards for animal products.",
    competitionType: "animal_products"
  }
};

// NEW: Weather Events System
const WEATHER_EVENTS = {
  drought: {
    id: "drought",
    name: "Drought",
    emoji: "🌵",
    duration: 120000, // 2 minutes
    effects: { growthRate: 0.5, waterCost: 2.0, witherRate: 1.5 },
    preparation: ["irrigation", "water_storage"],
    description: "Crops grow 50% slower and require double water.",
    warningTime: 30000 // 30 second warning
  },
  flood: {
    id: "flood",
    name: "Flash Flood",
    emoji: "🌊",
    duration: 90000, // 1.5 minutes
    effects: { diseaseChance: 0.3, harvestLoss: 0.2, growthRate: 0.8 },
    preparation: ["drainage", "greenhouse"],
    description: "30% chance of crop disease, 20% harvest loss risk.",
    warningTime: 45000 // 45 second warning
  },
  heatwave: {
    id: "heatwave",
    name: "Heat Wave",
    emoji: "🔥",
    duration: 150000, // 2.5 minutes
    effects: { witherRate: 2.0, animalHappiness: 0.7, growthRate: 0.9 },
    preparation: ["shade", "cooling"],
    description: "Crops wither twice as fast, animals less happy.",
    warningTime: 60000 // 1 minute warning
  },
  perfect_weather: {
    id: "perfect_weather",
    name: "Perfect Weather",
    emoji: "🌈",
    duration: 200000, // 3.3 minutes
    effects: { growthRate: 1.5, qualityBonus: 0.2, animalHappiness: 1.2 },
    description: "Ideal conditions! 50% faster growth, 20% quality bonus.",
    warningTime: 15000 // 15 second warning
  }
};

// NEW: Town Projects System
const TOWN_PROJECTS = {
  school: {
    id: "school",
    name: "Town School",
    emoji: "🏫",
    totalCost: 500,
    farmContribution: 200,
    benefits: { xpBonus: 0.15, researchSpeed: 1.2 },
    description: "Increases XP gain and research speed for all farmers.",
    progress: 0,
    contributors: []
  },
  market: {
    id: "market",
    name: "Farmers Market",
    emoji: "🏪",
    totalCost: 800,
    farmContribution: 300,
    benefits: { sellPriceBonus: 0.1, newCustomers: 5 },
    description: "10% better sell prices and access to premium customers.",
    progress: 0,
    contributors: []
  },
  hospital: {
    id: "hospital",
    name: "Veterinary Hospital",
    emoji: "🏥",
    totalCost: 1200,
    farmContribution: 450,
    benefits: { animalHealthBonus: 0.25, fasterHealing: 2.0 },
    description: "Healthier animals and faster recovery from illness.",
    progress: 0,
    contributors: []
  }
};

// NEW: Irrigation Systems
const IRRIGATION_SYSTEMS = {
  sprinkler: {
    id: "sprinkler",
    name: "Sprinkler System",
    emoji: "💦",
    cost: 150,
    coverage: 9, // 3x3 area
    waterSavings: 0.3,
    growthBonus: 0.1,
    autoWater: true,
    description: "Auto-waters 3x3 area, saves 30% water, 10% growth bonus."
  },
  drip_irrigation: {
    id: "drip_irrigation",
    name: "Drip Irrigation",
    emoji: "💧",
    cost: 200,
    coverage: 16, // 4x4 area
    waterSavings: 0.5,
    growthBonus: 0.15,
    autoWater: true,
    description: "Efficient watering for 4x4 area, saves 50% water, 15% growth bonus."
  },
  smart_irrigation: {
    id: "smart_irrigation",
    name: "Smart Irrigation",
    emoji: "🤖",
    cost: 350,
    coverage: 25, // 5x5 area
    waterSavings: 0.6,
    growthBonus: 0.2,
    weatherAdaptive: true,
    autoWater: true,
    description: "AI-controlled watering for 5x5 area, adapts to weather conditions."
  }
};

// NEW: Neighboring Farms (AI Farmers)
const NEIGHBOR_FARMS = [
  {
    id: "neighbor_1",
    name: "Emma's Organic Farm",
    farmer: "Emma",
    emoji: "👩‍🌾",
    specialty: "organic_vegetables",
    reputation: 75,
    tradingItems: ["carrot", "lettuce", "fertilizer"],
    personality: "friendly",
    helpfulness: 0.8
  },
  {
    id: "neighbor_2", 
    name: "Joe's Livestock Ranch",
    farmer: "Joe",
    emoji: "👨‍🌾",
    specialty: "animals",
    reputation: 60,
    tradingItems: ["milk", "eggs", "animalFeed"],
    personality: "gruff_helpful",
    helpfulness: 0.6
  },
  {
    id: "neighbor_3",
    name: "Maria's Flower Garden",
    farmer: "Maria",
    emoji: "👩‍🌾",
    specialty: "flowers",
    reputation: 85,
    tradingItems: ["sunflower", "honey", "seeds"],
    personality: "artistic",
    helpfulness: 0.9
  }
];

// NEW: Wildlife Ecosystem
const WILDLIFE_TYPES = {
  fish_pond: {
    id: "fish_pond",
    name: "Fish Pond",
    emoji: "🐟",
    cost: 200,
    capacity: 10,
    products: ["fish", "algae"],
    productionTime: 300, // 5 minutes
    description: "Produces fish and algae. Requires regular feeding."
  },
  butterfly_garden: {
    id: "butterfly_garden", 
    name: "Butterfly Garden",
    emoji: "🦋",
    cost: 150,
    pollinationBonus: 0.15,
    description: "Attracts butterflies that boost crop pollination by 15%."
  },
  bird_house: {
    id: "bird_house",
    name: "Bird House",
    emoji: "🐦",
    cost: 100,
    pestControl: 0.25,
    description: "Birds reduce pest infestations by 25%."
  },
  bat_house: {
    id: "bat_house",
    name: "Bat House", 
    emoji: "🦇",
    cost: 120,
    nightBonus: 0.2,
    pestControl: 0.3,
    description: "Bats provide 20% night growth bonus and 30% pest control."
  }
};

const WILD_ANIMALS = {
  rabbit: {
    id: "rabbit",
    name: "Wild Rabbit",
    emoji: "🐰",
    rarity: 0.05, // 5% chance to appear
    effect: "crop_damage",
    damage: 0.1, // 10% crop damage
    description: "Cute but eats your crops!"
  },
  deer: {
    id: "deer", 
    name: "Deer",
    emoji: "🦌",
    rarity: 0.02, // 2% chance
    effect: "crop_damage",
    damage: 0.2, // 20% crop damage
    description: "Beautiful but hungry for your vegetables."
  },
  fox: {
    id: "fox",
    name: "Fox", 
    emoji: "🦊",
    rarity: 0.03, // 3% chance
    effect: "livestock_scare",
    happinessReduction: 10,
    description: "Scares livestock, reducing their happiness."
  },
  owl: {
    id: "owl",
    name: "Wise Owl",
    emoji: "🦉",
    rarity: 0.01, // 1% chance
    effect: "wisdom_bonus",
    xpBonus: 1.5,
    description: "Rare visitor that boosts XP gain by 50%."
  },
  ladybug: {
    id: "ladybug",
    name: "Ladybug",
    emoji: "🐞", 
    rarity: 0.08, // 8% chance
    effect: "pest_control",
    pestReduction: 0.5,
    description: "Natural pest control - reduces infestations by 50%."
  }
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
const SAVE_SLOT_KEYS = ["farm_slot_1","farm_slot_2","farm_slot_3"];
function loadSave() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (s && s.trim()) {
      const parsed = JSON.parse(s);
      // Validate essential fields
      if (parsed && typeof parsed === 'object' && parsed.version) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load save:", e);
  }
  return null;
}
function saveState(s) {
  try {
    if (s && typeof s === 'object') {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    }
  } catch (e) {
    console.warn("Failed to save game:", e);
  }
}
function saveToSlot(slot) {
  try {
    const idx = Math.max(1, Math.min(3, slot)) - 1;
    const snapshot = loadSave() || {
      version: 1,
      savedAt: Date.now(),
      rules, gridSize, plots, coins, score, totalEarned, name, inventory, selectedSeed,
      levelId, levelEndsAt, levelStatus, levelStartedAt, achievements, weather, weatherEvents,
      totalHarvests, qualityHarvests, pestEliminations, seasonalPlants,
      buildings, livestock, processedGoods, npcs, events, automation,
      currentSeason, seasonEndsAt, marketTrends, sprinklers, scarecrows, combo, comboTimer, particles,
      soundEnabled, log, gameTime, lastGrowthTick,
      researchLevel, geneBank, contracts, lastContractsAt,
      merchants, supplyContracts, pastureSize, pastureCapacity,
      autoCollect, breedingQueue, activeFestival, festivalProgress,
      neighboringFarms, townProjects, farmReputation, activeWeatherEvents, irrigationSystems,
      wildlifeStructures, wildAnimalVisits, fishPonds
    };
    localStorage.setItem(SAVE_SLOT_KEYS[idx], JSON.stringify(snapshot));
    addNotification(`💾 Saved to Slot ${idx+1}`, "success");
  } catch (e) { console.error(e); addNotification("Save to slot failed","error"); }
}
function loadFromSlot(slot) {
  try {
    const idx = Math.max(1, Math.min(3, slot)) - 1;
    const raw = localStorage.getItem(SAVE_SLOT_KEYS[idx]);
    if (!raw) { addNotification("Empty slot","warning"); return; }
    const parsed = JSON.parse(raw);
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    window.location.reload();
  } catch (e) { console.error(e); addNotification("Load from slot failed","error"); }
}

export default function FarmSimCanvas() {
  // --- config ---
  const [useApi, setUseApi] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:5000");

  // --- game state ---
  const saved = useMemo(() => loadSave(), []);

  const initialRules = useMemo(() => {
    const sr = saved?.rules;
    if (!sr) return DEFAULT_RULES;
    return {
      ...DEFAULT_RULES,
      ...sr,
      seeds: { ...DEFAULT_RULES.seeds, ...(sr.seeds || {}) },
      buildings: { ...DEFAULT_RULES.buildings, ...(sr.buildings || {}) },
      livestock: { ...DEFAULT_RULES.livestock, ...(sr.livestock || {}) },
      processing: { ...DEFAULT_RULES.processing, ...(sr.processing || {}) },
    };
  }, []);
  const [rules, setRules] = useState(initialRules);
  const [gridSize, setGridSize] = useState(saved?.gridSize || MIN_SIZE);
  const [plots, setPlots] = useState(saved?.plots || makeGrid(saved?.gridSize || MIN_SIZE));
  const [coins, setCoins] = useState(saved?.coins || 75);
  const [score, setScore] = useState(saved?.score || 0);
  const [totalEarned, setTotalEarned] = useState(saved?.totalEarned || 0);
  const [name, setName] = useState(saved?.name || "Farmer");
    const [inventory, setInventory] = useState(saved?.inventory || {
    // Basic crops - good starting variety
    carrot: 8, lettuce: 5, potato: 4, garlic: 3,

    // Mid-tier crops
    corn: 2, tomato: 2, bellPepper: 1,

    // Advanced crops (limited)
    strawberry: 1, sunflower: 1, pumpkin: 0,

    // Processing ingredients
    wheat: 2, grapes: 1, cocoa_beans: 0,

    // Basic ingredients
    salt: 5, sugar: 3, yeast: 2, water: 8, animalFeed: 3,

    // Basic tools
    fertilizer: 5, pesticide: 3, fungicide: 3,

    // Advanced tools (limited)
    wateringCan: 1, scarecrow: 0, sprinkler: 0, beeFeed: 2,

    // Products
    honey: 0,
    // Preferences
    autoReplant: false,
    autoBuySeeds: false
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
  const [pastureSize, setPastureSize] = useState(saved?.pastureSize || PASTURE_MIN);
  const [pastureCapacity, setPastureCapacity] = useState(saved?.pastureCapacity || 6);
  const [autoCollect, setAutoCollect] = useState(saved?.autoCollect || false);
  const [breedingQueue, setBreedingQueue] = useState(saved?.breedingQueue || []); // [{id,type,readyAt}]
  const [breedingPairs, setBreedingPairs] = useState(saved?.breedingPairs || []);
  const [animalFeed, setAnimalFeed] = useState(saved?.animalFeed || 100);

  // NEW: Business management system
  const [businessReputation, setBusinessReputation] = useState(saved?.businessReputation || 50);
  const [farmDebt, setFarmDebt] = useState(saved?.farmDebt || 0);
  const [supplyContracts, setSupplyContracts] = useState(saved?.supplyContracts || []);
  const [merchants, setMerchants] = useState(saved?.merchants || [
    { id: "stable", name: "Greenfield Market", persona: "stable", reputation: 50, prices: { multiplier: 1.0, negotiation: 0 }, history: [] },
    { id: "premium", name: "Coastal Traders", persona: "premium", reputation: 75, prices: { multiplier: 1.2, negotiation: 10 }, history: [] },
    { id: "bulk", name: "Mountain Merchants", persona: "bulk", reputation: 65, prices: { multiplier: 0.9, negotiation: 5 }, history: [] },
  ]);
  const [currentMerchant, setCurrentMerchant] = useState(null);

  const [processedGoods, setProcessedGoods] = useState(saved?.processedGoods || {});
  const [npcs, setNpcs] = useState(saved?.npcs || []);
  const [events, setEvents] = useState(saved?.events || []);
  const [automation, setAutomation] = useState(saved?.automation || {});

  // NEW: Enhanced visual and gameplay state
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState(saved?.currentTimeOfDay || "day");
  const [weatherForecast, setWeatherForecast] = useState(saved?.weatherForecast || []);
  const [beeHappiness, setBeeHappiness] = useState(saved?.beeHappiness || 100);
  const [soilHealth, setSoilHealth] = useState(saved?.soilHealth || 100);
  const [diseasesCured, setDiseasesCured] = useState(saved?.diseasesCured || 0);
  const [rotationUses, setRotationUses] = useState(saved?.rotationUses || 0);
  const [weatherPredictions, setWeatherPredictions] = useState(saved?.weatherPredictions || 0);
  const [honeyProduced, setHoneyProduced] = useState(saved?.honeyProduced || 0);
  const [reducedMotion, setReducedMotion] = useState(saved?.reducedMotion || false);
  const [fontScale, setFontScale] = useState(saved?.fontScale || 100);
  const [darkMode, setDarkMode] = useState(saved?.darkMode || false);
  const [specialization, setSpecialization] = useState(saved?.specialization || null);
  const [activeQuests, setActiveQuests] = useState(saved?.activeQuests || ["harvest_20"]);
  const [completedQuests, setCompletedQuests] = useState(saved?.completedQuests || []);
  const [artifacts, setArtifacts] = useState(saved?.artifacts || []);
  const [researchLevel, setResearchLevel] = useState(saved?.researchLevel || 0);
  const [geneBank, setGeneBank] = useState(saved?.geneBank || []); // [{seed, traits}]
  const [researchTree, setResearchTree] = useState(saved?.researchTree || { growth: 0, value: 0, weather: 0, breeding: 0 });
  const [researchJob, setResearchJob] = useState(saved?.researchJob || null); // { id, endsAt }
  const [contracts, setContracts] = useState(saved?.contracts || []);
  const [lastContractsAt, setLastContractsAt] = useState(saved?.lastContractsAt || 0);
  const [deliveries, setDeliveries] = useState(saved?.deliveries || []); // [{id,tier,item,count,endsAt,payout,status,vanId}]
  const [vans, setVans] = useState(saved?.vans || [
    { id: 'van1', name: 'Van A', capacity: 10, decayBonus: 0.0, level: 1 },
    { id: 'van2', name: 'Van B', capacity: 10, decayBonus: 0.0, level: 1 }
  ]);
  const [selectedVanId, setSelectedVanId] = useState(saved?.selectedVanId || 'van1');
  const [deliveriesLeaderboard, setDeliveriesLeaderboard] = useState(saved?.deliveriesLeaderboard || []); // [{id,tier,time,payout,date}]
  const [autoSellRules, setAutoSellRules] = useState(saved?.autoSellRules || {}); // seed -> boolean

  // NEW: Seasonal events and festivals system
  const [currentEvent, setCurrentEvent] = useState(saved?.currentEvent || null);
  const [eventEndsAt, setEventEndsAt] = useState(saved?.eventEndsAt || null);
  const [eventProgress, setEventProgress] = useState(saved?.eventProgress || 0);
  const [eventRewards, setEventRewards] = useState(saved?.eventRewards || []);

  // NEW: Festival and Community Features
  const [activeFestival, setActiveFestival] = useState(saved?.activeFestival || null);
  const [festivalProgress, setFestivalProgress] = useState(saved?.festivalProgress || 0);
  const [neighboringFarms, setNeighboringFarms] = useState(saved?.neighboringFarms || []);
  const [townProjects, setTownProjects] = useState(saved?.townProjects || Object.values(TOWN_PROJECTS));
  const [farmReputation, setFarmReputation] = useState(saved?.farmReputation || 50);
  const [activeWeatherEvents, setActiveWeatherEvents] = useState(saved?.activeWeatherEvents || []);
  const [irrigationSystems, setIrrigationSystems] = useState(saved?.irrigationSystems || []);

  // NEW: Wildlife Ecosystem
  const [wildlifeStructures, setWildlifeStructures] = useState(saved?.wildlifeStructures || []);
  const [wildAnimalVisits, setWildAnimalVisits] = useState(saved?.wildAnimalVisits || []);
  const [fishPonds, setFishPonds] = useState(saved?.fishPonds || []);

  // NEW: Farm customization system
  const [farmTheme, setFarmTheme] = useState(saved?.farmTheme || "classic");
  const [decorations, setDecorations] = useState(saved?.decorations || []);
  const [farmLayout, setFarmLayout] = useState(saved?.farmLayout || "grid");
  const [farmName, setFarmName] = useState(saved?.farmName || "My Farm");
  const [farmLevel, setFarmLevel] = useState(saved?.farmLevel || 1);
  const [farmExperience, setFarmExperience] = useState(saved?.farmExperience || 0);

  // Quick-win features: planner, storage, batch selection, skills
  const [plannerOpen, setPlannerOpen] = useState(saved?.plannerOpen || false);
  const [harvestMode, setHarvestMode] = useState(saved?.harvestMode || "sell"); // 'sell' | 'store'
  const [storage, setStorage] = useState(saved?.storage || {}); // { seed: { count, firstStoredAt } }
  const gridRef = useRef(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null); // {x1,y1,x2,y2}
  const [selectedPlots, setSelectedPlots] = useState([]);
  const [skillPoints, setSkillPoints] = useState(saved?.skillPoints || 0);
  const [skills, setSkills] = useState(saved?.skills || { horticulture: 0, economics: 0 }); // max 3 each

  // NEW: Multiplayer farming system
  const [players, setPlayers] = useState(saved?.players || [
    { id: "player1", name: "You", farmLevel: 1, coins: coins, crops: totalHarvests, online: true },
    { id: "player2", name: "FarmerJoe", farmLevel: 3, coins: 2500, crops: 45, online: true },
    { id: "player3", name: "GreenThumb", farmLevel: 2, coins: 1800, crops: 32, online: false },
    { id: "player4", name: "CropKing", farmLevel: 5, coins: 5200, crops: 89, online: true },
  ]);
  const [trades, setTrades] = useState(saved?.trades || []);
  const [leaderboards, setLeaderboards] = useState(saved?.leaderboards || {
    coins: players.slice().sort((a, b) => b.coins - a.coins),
    crops: players.slice().sort((a, b) => b.crops - a.crops),
    level: players.slice().sort((a, b) => b.farmLevel - a.farmLevel)
  });
  const [currentView, setCurrentView] = useState(saved?.currentView || "farm");
  const [shopView, setShopView] = useState(saved?.shopView || "main");
  const [selectedTrade, setSelectedTrade] = useState(null);

  // New advanced features
  const [currentSeason, setCurrentSeason] = useState(saved?.currentSeason || "spring");
  const [seasonEndsAt, setSeasonEndsAt] = useState(saved?.seasonEndsAt || nowSec() + 120);
  const [marketTrends, setMarketTrends] = useState(saved?.marketTrends || {});
  const [sprinklers, setSprinklers] = useState(saved?.sprinklers || []);
  const [scarecrows, setScarecrows] = useState(saved?.scarecrows || []);
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
          rules, gridSize, plots, // save all plots
          coins, score, totalEarned, name, inventory, selectedSeed,
          levelId, levelEndsAt, levelStatus, levelStartedAt,
          achievements, weather, currentSeason,
          buildings,
          plannerOpen, harvestMode, storage,
          skillPoints, skills, soilHealth, researchLevel, geneBank, researchTree, researchJob,
          specialization, activeQuests, completedQuests, artifacts,
          reducedMotion, fontScale, darkMode,
          contracts, lastContractsAt, deliveries, vans, selectedVanId, deliveriesLeaderboard,
          merchants, supplyContracts, autoSellRules,
          pastureSize, pastureCapacity,
          autoCollect, breedingQueue, activeFestival, festivalProgress,
          neighboringFarms, townProjects, farmReputation, activeWeatherEvents, irrigationSystems,
          wildlifeStructures, wildAnimalVisits, fishPonds
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
  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp} ${msg}`;
    setLog(l => [logMessage, ...l].slice(0, 100));
  };

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

  // Safe helpers
  const getSeedEmoji = (seed) => (rules.seeds && rules.seeds[seed] && rules.seeds[seed].emoji) ? rules.seeds[seed].emoji : "🌱";
  const getLivestockEmoji = (type) => (rules.livestock && rules.livestock[type] && rules.livestock[type].emoji) ? rules.livestock[type].emoji : "🐾";

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
    
    // Only pollinate if plot was recently watered
    if (!plot.watered) return false;

    if (Math.random() < 0.3) { // 30% chance per tick
      setPlots(prev => prev.map((p, idx) =>
        idx === plotIndex ? { ...p, beePollinated: true } : p
      ));

      // Trigger flying bees for this pollination event
      triggerPollinationBees(plotIndex);

      // Produce honey
      if (Math.random() < 0.1) { // 10% chance for honey
        setInventory(prev => ({ ...prev, honey: (prev.honey || 0) + 1 }));
        setHoneyProduced(prev => prev + 1);
        addLog(`🍯 Bees produced honey! (+1 honey)`);
      }

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

  // NEW: Seasonal event management functions
  const startSeasonalEvent = (eventId) => {
    const event = SEASONAL_EVENTS[eventId];
    if (!event) return false;

    // Check requirements
    if (event.requirements.harvests && totalHarvests < event.requirements.harvests) {
      addNotification(`Need ${event.requirements.harvests} harvests for ${event.name}`, "warning");
      return false;
    }
    if (event.requirements.predictions && weatherPredictions < event.requirements.predictions) {
      addNotification(`Need ${event.requirements.predictions} weather predictions for ${event.name}`, "warning");
      return false;
    }
    if (event.requirements.flowers && (inventory.sunflower || 0) < event.requirements.flowers) {
      addNotification(`Need ${event.requirements.flowers} flowers for ${event.name}`, "warning");
      return false;
    }
    if (event.requirements.level && level < event.requirements.level) {
      addNotification(`Need to reach level ${event.requirements.level} for ${event.name}`, "warning");
      return false;
    }

    setCurrentEvent(eventId);
    setEventEndsAt(nowSec() + event.duration);
    setEventProgress(0);
    addLog(`🎉 ${event.name} has started! ${event.description}`);
    addNotification(`${event.name} started! 🎉`, "success");

    // Add limited-time crops if applicable
    if (eventId === "harvest_festival") {
      setInventory(prev => ({ ...prev, golden_wheat: 3 }));
      addNotification("Golden Wheat seeds added to inventory! 🌟", "success");
    } else if (eventId === "spring_blossom") {
      setInventory(prev => ({ ...prev, rainbow_flower: 2 }));
      addNotification("Rainbow Flower seeds added to inventory! 🌈", "success");
    }

    return true;
  };

  const checkEventCompletion = () => {
    if (!currentEvent || !eventEndsAt) return;

    const event = SEASONAL_EVENTS[currentEvent];
    if (!event) return;

    // Check if event should end
    if (nowSec() >= eventEndsAt) {
      // Award rewards based on progress
      let rewardMultiplier = Math.min(eventProgress / 100, 2.0); // Max 2x multiplier

      event.rewards.forEach(reward => {
        if (reward.type === "coins") {
          const coinReward = Math.floor(reward.amount * rewardMultiplier);
          setCoins(prev => prev + coinReward);
          addLog(`🏆 Event reward: ${coinReward}🪙`);
        } else if (reward.type === "item") {
          setInventory(prev => ({
            ...prev,
            [reward.item]: (prev[reward.item] || 0) + reward.amount
          }));
          addLog(`🏆 Event reward: ${reward.amount}x ${reward.item}`);
        } else if (reward.type === "achievement") {
          checkAchievement(reward.id);
        }
      });

      addNotification(`${event.name} completed! Check rewards! 🎉`, "success");
      setCurrentEvent(null);
      setEventEndsAt(null);
      setEventProgress(0);
    }
  };

  const getEventBonus = (type) => {
    if (!currentEvent) return 0;

    const event = SEASONAL_EVENTS[currentEvent];
    if (!event) return 0;

    switch (type) {
      case "yield":
        return event.bonuses?.yieldMultiplier || 1;
      case "quality":
        return event.bonuses?.qualityBonus || 0;
      case "growth":
        return event.bonuses?.growthSpeed || 1;
      case "coins":
        return event.bonuses?.coinBonus || 0;
      case "flower":
        return event.bonuses?.flowerMultiplier || 1;
      case "prediction":
        return event.bonuses?.predictionBonus || 1;
      default:
        return 1;
    }
  };

  const checkRequirements = (requirements) => {
    if (!requirements) return true;

    if (requirements.harvests && totalHarvests < (requirements.harvests || 0)) return false;
    if (requirements.predictions && weatherPredictions < (requirements.predictions || 0)) return false;
    if (requirements.flowers && (inventory.sunflower || 0) < (requirements.flowers || 0)) return false;
    if (requirements.level && level < (requirements.level || 0)) return false;
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
    console.log("🏗️ Available buildings:");
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

  const simulateGrowth = () => {
    const TICK_SECONDS = 5; // matches interval cadence
    setPlots(prev => prev.map(p => {
      if (p.state !== "growing" && p.state !== "planted") return p;
      if (!p.seed) return p;

      const spec = rules.seeds[p.seed];
      if (!spec) return p;

      // Convert time to stage progress using secondsPerStage()
      const secPerStage = Math.max(1, secondsPerStage(p));
      const deltaStages = Math.max(0.01, TICK_SECONDS / secPerStage);
      const newGrowthStages = Math.min(spec.stages, (p.growth || 0) + deltaStages);
      const newState = newGrowthStages >= spec.stages ? "grown" : "growing";

      return {
        ...p,
        watered: buildings.irrigation ? true : p.watered,
        growth: artifacts.includes("stage_skip") ? Math.min(spec.stages, newGrowthStages + 0.02) : newGrowthStages,
        state: newState
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
      // Auto-collect livestock products if enabled
      if (autoCollect && livestock.length > 0) {
        let collectedCount = 0;
        setLivestock(prev => prev.map(animal => {
          const data = rules.livestock[animal.type] || {};
          const interval = computeAnimalInterval(animal, rules);
          if (nowSec() - (animal.lastProduced || 0) >= interval) {
            const happinessMult = 1 + Math.min(1, (animal.happiness || 0) / 200); // up to +50%
            const qualityMult = Math.max(1, Number(animal.quality || 1));
            let value = Math.round((data.value || 10) * happinessMult * qualityMult);
            let quantity = 1;
            
            // Apply trait bonuses
            if (animal.traits) {
              if (animal.traits.includes("quality")) value = Math.round(value * 1.2);
              if (animal.traits.includes("prolific")) quantity = Math.floor(quantity * 1.5);
              if (animal.traits.includes("golden")) value = Math.round(value * 3);
              if (animal.traits.includes("giant")) quantity = quantity * 2;
            }
            setInventory(inv => ({ ...inv, [data.product]: (inv[data.product] || 0) + quantity }));
            setCoins(c => c + value);
            collectedCount++;
            
            // NEW: Festival progress tracking for animal products
            if (activeFestival) {
              const festival = FESTIVALS[activeFestival.id];
              if (festival && festival.competitionType === "animal_products") {
                setFestivalProgress(prev => prev + quantity);
              }
            }
            
            return { ...animal, lastProduced: nowSec(), happiness: Math.max(0, (animal.happiness||0) - 2) };
          }
          return animal;
        }));
        if (collectedCount > 0) {
          addNotification(`Auto-collected from ${collectedCount} animals`, "success");
        }
      }

      // Simple illness tick: small chance an animal becomes ill without feed
      if (livestock.length > 0) {
        setLivestock(prev => prev.map(a => {
          // Hardy animals never get sick
          if (a.traits && a.traits.includes("hardy")) return a;
          
          if (a.happiness <= 10 && Math.random() < 0.01) return { ...a, ill: true };
          return a;
        }));
      }

      // Breeding queue completion
      if (breedingQueue.length > 0) {
        const now = nowSec();
        const ready = breedingQueue.filter(b => b.readyAt <= now);
        if (ready.length > 0) {
          setBreedingQueue(queue => queue.filter(b => b.readyAt > now));
          setLivestock(prev => ([...prev, ...ready.map(b => ({ 
            id: Date.now()+Math.random(), 
            type: b.type, 
            lastProduced: now, 
            happiness: 80, 
            quality: 1,
            traits: b.traits || assignAnimalTraits(),
            age: 0
          }))]));
          addNotification(`🐣 ${ready.length} new offspring joined the farm!`, "success");
        }
      }

      // NEW: Festival System Logic
      if (activeFestival) {
        const festival = FESTIVALS[activeFestival.id];
        if (festival && nowSec() > activeFestival.endsAt) {
          // Festival ended
          const progress = festivalProgress;
          const requirement = Object.values(festival.requirements)[0] || 0;
          if (progress >= requirement) {
            // Festival completed successfully
            const rewards = festival.rewards;
            if (rewards.coins) setCoins(c => c + rewards.coins);
            if (rewards.reputation) setFarmReputation(r => Math.min(100, r + rewards.reputation));
            if (rewards.seeds) setInventory(inv => ({ ...inv, seeds: (inv.seeds || 0) + rewards.seeds }));
            addNotification(`🎉 ${festival.name} completed! Rewards earned!`, "success");
          } else {
            addNotification(`😔 ${festival.name} ended. Try harder next time!`, "info");
          }
          setActiveFestival(null);
          setFestivalProgress(0);
        }
      } else {
        // Check if we should start a new festival (10% chance every minute)
        if (Math.random() < 0.1 && currentTime % 60 === 0) {
          const currentSeasonFestivals = Object.values(FESTIVALS).filter(f => f.season === currentSeason);
          if (currentSeasonFestivals.length > 0) {
            const festival = currentSeasonFestivals[Math.floor(Math.random() * currentSeasonFestivals.length)];
            setActiveFestival({
              id: festival.id,
              endsAt: nowSec() + Math.floor(festival.duration / 1000)
            });
            setFestivalProgress(0);
            addNotification(`🎪 ${festival.name} has started! ${festival.description}`, "success");
          }
        }
      }

      // NEW: Weather Events System
      if (Math.random() < 0.05 && currentTime % 45 === 0) { // 5% chance every 45 seconds
        const eventTypes = Object.keys(WEATHER_EVENTS);
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event = WEATHER_EVENTS[eventType];
        
        // Start weather event with warning
        setTimeout(() => {
          setActiveWeatherEvents(prev => [...prev, {
            id: eventType + '_' + Date.now(),
            type: eventType,
            endsAt: nowSec() + Math.floor(event.duration / 1000)
          }]);
          addNotification(`⚠️ ${event.name} incoming! ${event.description}`, "warning");
        }, event.warningTime);
      }

      // Process active weather events
      setActiveWeatherEvents(prev => prev.filter(event => {
        if (nowSec() > event.endsAt) {
          addNotification(`🌤️ ${WEATHER_EVENTS[event.type]?.name} has ended`, "info");
          return false;
        }
        return true;
      }));

      // NEW: Irrigation System Automation
      if (irrigationSystems.length > 0 && currentTime % 30 === 0) { // Every 30 seconds
        let irrigatedPlots = 0;
        irrigationSystems.forEach(system => {
          const systemData = IRRIGATION_SYSTEMS[system.type];
          if (systemData && systemData.autoWater) {
            // Auto-water plots in coverage area (simplified - water all unwatered plots)
            setPlots(prev => prev.map(p => {
              if ((p.state === 'planted' || p.state === 'growing') && !p.watered) {
                irrigatedPlots++;
                return { ...p, watered: true };
              }
              return p;
            }));
          }
        });
        if (irrigatedPlots > 0) {
          addNotification(`💧 Irrigation systems watered ${irrigatedPlots} plots`, "info");
        }
      }

      // NEW: Wildlife System Logic
      // Wild animal visits (every 2 minutes, random chance)
      if (currentTime % 120 === 0) {
        Object.values(WILD_ANIMALS).forEach(animal => {
          if (Math.random() < animal.rarity) {
            // Add wild animal visit
            setWildAnimalVisits(prev => [...prev, {
              id: animal.id + '_' + Date.now(),
              type: animal.id,
              appearedAt: nowSec(),
              duration: 180, // 3 minutes
              active: true
            }]);
            
            // Apply immediate effects
            if (animal.effect === "crop_damage") {
              setPlots(prev => prev.map(p => {
                if (p.state === "growing" || p.state === "grown") {
                  if (Math.random() < animal.damage) {
                    addNotification(`${animal.emoji} ${animal.name} damaged your crops!`, "warning");
                    return { ...p, state: "withered" };
                  }
                }
                return p;
              }));
            } else if (animal.effect === "livestock_scare") {
              setLivestock(prev => prev.map(a => ({
                ...a,
                happiness: Math.max(0, (a.happiness || 0) - animal.happinessReduction)
              })));
              addNotification(`${animal.emoji} ${animal.name} scared your animals!`, "warning");
            } else {
              addNotification(`${animal.emoji} ${animal.name} visited your farm!`, "info");
            }
          }
        });
      }

      // Process active wild animal visits
      setWildAnimalVisits(prev => prev.filter(visit => {
        if (nowSec() - visit.appearedAt > visit.duration) {
          return false; // Remove expired visits
        }
        return true;
      }));

      // Fish pond production
      if (fishPonds.length > 0 && currentTime % 300 === 0) { // Every 5 minutes
        let totalFishProduced = 0;
        fishPonds.forEach(pond => {
          const pondData = WILDLIFE_TYPES.fish_pond;
          if (pond.lastFed && nowSec() - pond.lastFed < 600) { // Fed within 10 minutes
            const fishCount = Math.floor(Math.random() * 3) + 1; // 1-3 fish
            setInventory(inv => ({ 
              ...inv, 
              fish: (inv.fish || 0) + fishCount,
              algae: (inv.algae || 0) + 1
            }));
            totalFishProduced += fishCount;
          }
        });
        if (totalFishProduced > 0) {
          addNotification(`🐟 Fish ponds produced ${totalFishProduced} fish!`, "success");
        }
      }

      // NEW: Combo timer decay
      if (comboTimer > 0 && nowSec() > comboTimer) {
        setCombo(0);
        setComboTimer(0);
      }

      // NEW: Update time of day for visual effects
      const newTimeOfDay = getTimeOfDay();
      if (newTimeOfDay !== currentTimeOfDay) {
        setCurrentTimeOfDay(newTimeOfDay);
      }

      // NEW: Generate weather forecast every 30 seconds
      if (currentTime % 30 === 0) {
        setWeatherForecast(generateWeatherForecast());
      }

      // NEW: Night cycle effects - nocturnal pests, moonflower bonus
      if (currentTimeOfDay === "night") {
        setPlots(prev => prev.map(p => {
          if (!p.seed) return p;
          // Moonflower grows faster at night
          if (p.seed === "moonflower" && (p.state === "planted" || p.state === "growing")) {
            const spec = rules.seeds[p.seed];
            const secPerStage = Math.max(1, secondsPerStage(p) * 0.8);
            const delta = 1 / secPerStage; // ~1s tick
            return { ...p, growth: Math.min(spec.stages, (p.growth || 0) + delta), state: ((p.growth || 0) + delta) >= spec.stages ? "grown" : "growing" };
          }
          return p;
        }));
        // Nocturnal pests chance on some crops
        if (Math.random() < 0.02) {
          const idx = Math.floor(Math.random() * plots.length);
          setPlots(prev => prev.map((pl, i) => i === idx && (pl.state === "planted" || pl.state === "growing") ? { ...pl, infested: true } : pl));
          addNotification("🌙 Nocturnal pests spotted on a plot!", "warning");
        }
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

      // NEW: Event checking and progress updates
      checkEventCompletion();

      // Research job completion
      if (researchJob && nowSec() >= (researchJob.endsAt||0)) {
        setResearchJob(null);
        setResearchTree(prev => ({ ...prev, [researchJob.id]: Math.min(3, (prev[researchJob.id]||0)+1) }));
        addNotification(`🔬 Research completed: ${researchJob.id} +1`, 'success');
      }

      // Delivery completion
      if (deliveries && deliveries.length > 0) {
        const now = nowSec();
        setDeliveries(prev => prev.map(d => (d.status==='in_progress' && now>=d.endsAt) ? { ...d, status:'arrived' } : d));
      }

      if (currentEvent) {
        // Update event progress based on activity
        const event = SEASONAL_EVENTS[currentEvent];
        if (event && totalHarvests > 0) {
          const progressIncrease = Math.min(100 - eventProgress, 0.5); // Slow progress increase
          setEventProgress(prev => Math.min(100, prev + progressIncrease));
        }
      }

      // NEW: Update multiplayer leaderboards
      setPlayers(prev => prev.map(p =>
        p.id === "player1" ? { ...p, coins: coins, crops: totalHarvests } : p
      ));

      setLeaderboards(prev => ({
        coins: [...players.filter(p => p.online)].sort((a, b) => b.coins - a.coins),
        crops: [...players.filter(p => p.online)].sort((a, b) => b.crops - a.crops),
        level: [...players.filter(p => p.online)].sort((a, b) => b.farmLevel - a.farmLevel)
      }));

    }, 1000);
    return () => clearInterval(id);
  }, [currentTime, currentTimeOfDay, plots, buildings.beehive, beeHappiness, coins, totalHarvests]);

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
    setCombo(c => {
      const newCombo = c + 1;
      setComboTimer(nowSec() + 5); // 5 second combo window
      if (newCombo >= 3) {
        const bonus = Math.floor(newCombo * 2);
        setCoins(coins => coins + bonus);
        addNotification(`🔥 ${newCombo}x Combo! +${bonus}🪙`, "success");
        playSound("combo");
      }
      return newCombo;
    });
  };

  // Simple time system
  const getGameTimeString = () => {
    return "Game Running"; // Static for now
  };

  // Market price calculation with seasonal and trend modifiers
  const getMarketPrice = (seedType) => {
    const spec = getSeedSpec(seedType) || rules.seeds[seedType];
    if (!spec) return 0;
    const base = spec.baseValue;
    const trend = marketTrends[seedType] || "normal";
    const trendMultiplier = MARKET_TRENDS[trend]?.multiplier ?? 1.0;
    const seasonBonus = spec.season === currentSeason ? 1.3 : 1.0;
    return Math.max(1, Math.round(base * trendMultiplier * seasonBonus));
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

  // Research synergies
  const getActiveSynergies = () => {
    const act = [];
    if ((researchTree.growth||0) >= 2 && (researchTree.weather||0) >= 2) act.push({ id:'night_boost', label:'Night Growth +10%' });
    if ((researchTree.value||0) >= 2 && (researchTree.growth||0) >= 1) act.push({ id:'quality_plus', label:'Quality Chance +2%' });
    return act;
  };

  // --- Hybridization system ---
  const TRAITS = {
    fast: { id: "fast", emoji: "⚡", desc: "+15% growth speed" },
    drought: { id: "drought", emoji: "🏜️", desc: "+20% wither tolerance" },
    quality: { id: "quality", emoji: "⭐", desc: "+20% value" }
  };

  const [hybrids, setHybrids] = useState(saved?.hybrids || {}); // seedId -> { traits: ["fast", ...] }

  function getSeedSpec(seed) {
    const base = rules.seeds[seed];
    const h = hybrids[seed];
    if (!h) return base;
    // Apply simple trait effects to derived spec for UI calculations
    const speedMult = h.traits.includes("fast") ? 0.85 : 1;
    const valueMult = h.traits.includes("quality") ? 1.2 : 1;
    return {
      ...base,
      secondsPerStage: Math.max(1, Math.round(base.secondsPerStage * speedMult)),
      baseValue: Math.round(base.baseValue * valueMult)
    };
  }

  function replacePlot(i, updater) {
    setPlots(prev => prev.map((p, idx) => idx === i ? updater({ ...p }) : p));
  }

  function harvestValue(p) {
    if (!p.seed) return 0;
    const base = getSeedSpec(p.seed).baseValue;
    const fertBonus = 0.3 * (p.fertilized || 0);
    const qualityBonus = (p.quality - 1) * 0.2;
    const pestPenalty = p.infested ? 0.4 : 0;
    const boostBonus = p.boosted ? 0.5 : 0;
    let multiplier = 1 + fertBonus + qualityBonus + boostBonus - pestPenalty;
    if (buildings.tractor) multiplier *= (1 + (rules.buildings.tractor?.bonus || 0.15));
    // Skills: Economics increases sale value
    if (skills.economics > 0) multiplier *= 1 + 0.05 * skills.economics;
    // Research: Value
    if (researchTree && (researchTree.value||0) > 0) multiplier *= 1 + 0.05 * (researchTree.value||0);
    // Specialization modifiers
    if (specialization === "organic") multiplier *= 1.05;
    if (specialization === "artisan" && processedGoods[p.seed]) multiplier *= 1.1;
    // NEW: Festival bonuses
    if (activeFestival) {
      const festival = FESTIVALS[activeFestival.id];
      if (festival) {
        if (festival.bonusMultiplier && festival.competitionType === "harvest_volume") {
          multiplier *= festival.bonusMultiplier;
        }
        if (festival.priceBonus && festival.competitionType === "market_sales") {
          multiplier *= (1 + festival.priceBonus);
        }
      }
    }
    return Math.max(1, Math.round(base * multiplier));
  }

  function secondsPerStage(p) {
    if (!p.seed) return 999999;
    const base = getSeedSpec(p.seed).secondsPerStage;
    const fertSpeed = 1 + Math.min(p.fertilized, rules.fertilizer.maxStacks) * rules.fertilizer.speedBonusPerStack;
    let weatherSpeed = weather.type === "Rain" ? 1.2 : weather.type === "Drought" ? 0.8 : 1;
    if (buildings.weather_station) {
      if (weather.type === "Rain") weatherSpeed += (rules.buildings.weather_station?.bonus || 0.05);
      if (weather.type === "Drought") weatherSpeed = Math.max(0.7, weatherSpeed + (rules.buildings.weather_station?.bonus || 0.05));
      if (weather.type === "Frost") weatherSpeed = Math.max(0.6, weatherSpeed + (rules.buildings.weather_station?.bonus || 0.05));
    }
    // Research: Weather mitigation slightly improves speed in adverse weather
    if (researchTree && (researchTree.weather||0) > 0 && (weather.type === "Drought" || weather.type === "Frost" || weather.type === "Storm")) {
      weatherSpeed *= 1 + 0.05 * (researchTree.weather||0);
    }
    const boostSpeed = p.boosted ? 1.3 : 1;
    const greenhouseSpeed = buildings.greenhouse ? 1.3 : 1;
    let irrigationSpeed = buildings.irrigation ? (1 + (rules.buildings.irrigation?.bonus || 0.15)) : 1;
    // NEW: Add irrigation system bonuses
    irrigationSystems.forEach(system => {
      const systemData = IRRIGATION_SYSTEMS[system.type];
      if (systemData) {
        irrigationSpeed *= (1 + systemData.growthBonus);
      }
    });
    const composterSpeed = buildings.composter ? (1 + (rules.buildings.composter?.bonus || 0.10)) : 1;
    const skillSpeed = skills.horticulture ? 1 + 0.05 * skills.horticulture : 1;
    // Research: Growth
    const researchSpeed = 1 + 0.05 * ((researchTree && researchTree.growth) || 0);
    // Synergy: Night boost
    const nightBoost = (getActiveSynergies().find(s=>s.id==='night_boost') && currentTimeOfDay==='night') ? 1.10 : 1;
    const soilSpeed = 1 + Math.max(-0.3, Math.min(0.5, (soilHealth - 100) / 200));
    return base / (fertSpeed * weatherSpeed * boostSpeed * greenhouseSpeed * irrigationSpeed * composterSpeed * skillSpeed * researchSpeed * nightBoost * soilSpeed);
  }

  function witherLimit(p) {
    let base = rules.dryWitherSeconds;
    if (weather.type === "Drought") base = Math.floor(base * 0.5);
    if (weather.type === "Rain") base = Math.floor(base * 1.6);
    if (weather.type === "Frost") base = Math.floor(base * 0.7);
    if (buildings.weather_station) {
      base = Math.floor(base * 1.1);
    }
    if (researchTree && (researchTree.weather||0) > 0) {
      base = Math.floor(base * (1 + 0.05 * (researchTree.weather||0)));
    }
    return base;
  }

  // --- enhanced actions ---
    function plant(i, seed) {
    if (!seed || i < 0 || i >= plots.length) return;

    replacePlot(i, (p) => {
      if (p.state !== "empty") return p;

      const seedCount = inventory[seed] || 0;
      console.log(`🌱 Attempting to plant ${seed}: current count = ${seedCount}`);

      // Auto-buy single seed if out of stock and have enough coins
      if (seedCount <= 0 && inventory.autoBuySeeds) {
        const price = rules.seeds?.[seed]?.shopPrice || 0;
        if (coins >= price && price > 0) {
          setCoins(c => Math.max(0, c - price));
          addNotification(`🛒 Bought 1 ${seed} for ${price}🪙`, "success");
        } else {
          addNotification(`No ${seed} seeds available! Need ${Math.max(0, price - coins)}🪙`, "warning");
          console.log(`❌ Cannot plant ${seed}: insufficient seeds and/or coins`);
          return p;
        }
      } else {
        // Use one from inventory
        setInventory(inv => ({ ...inv, [seed]: (inv[seed] || 0) - 1 }));
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

      addLog(`🌱 Planted ${getSeedEmoji(seed)} ${seed} in plot ${i + 1}${isOptimalSeason ? " 🌟" : ""}${greenhouseBonus}${rotationText}`);
      const quality = Math.random() > 0.8 ? 1.2 : 1; // 20% chance for higher quality
      playSound("plant");

      // NEW: Festival progress tracking for planting
      if (activeFestival) {
        const festival = FESTIVALS[activeFestival.id];
        if (festival && festival.competitionType === "planting_speed") {
          setFestivalProgress(prev => prev + 1);
        }
      }

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
    if (i < 0 || i >= plots.length) return;

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
    if (i < 0 || i >= plots.length) return;

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
    if (i < 0 || i >= plots.length) return;

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
    if (i < 0 || i >= plots.length) return;

    replacePlot(i, (p) => {
      if (p.state !== "withered") return p;
      addLog(`🗑️ Cleared withered plot ${i + 1}`);
      return newPlot("empty");
    });
  }

  function harvest(i) {
    if (i < 0 || i >= plots.length) return;

    replacePlot(i, (p) => {
      if (p.state !== "grown") return p;

      const marketPrice = Math.max(1, getMarketPrice(p.seed));
      const base = Math.max(1, (rules.seeds[p.seed]?.baseValue) || 1);
      let val = Math.round(harvestValue(p) * (marketPrice / base));

      // NEW: Apply rotation bonus
      if (p.rotationBonus > 0) {
        val = Math.round(val * (1 + p.rotationBonus));
      }

      // NEW: Apply bee pollination bonus
      if (p.beePollinated && buildings.beehive) {
        val = Math.round(val * (1 + rules.buildings.beehive.bonus));
      }

      // NEW: Apply event bonuses
      const eventYieldBonus = getEventBonus("yield");
      val = Math.round(val * eventYieldBonus);

      const eventCoinBonus = getEventBonus("coins");
      val = Math.round(val + eventCoinBonus);

      // Building bonuses
      if (buildings.barn) {
        val = Math.round(val * (1 + rules.buildings.barn.bonus)); // +20% harvest value
      }

      // Research: Value bonus on sale
      if (researchTree && (researchTree.value||0) > 0) {
        val = Math.round(val * (1 + 0.05 * (researchTree.value||0)));
      }

      if (harvestMode === "store") {
        setStorage(prev => {
          const prevEntry = prev[p.seed] || { count: 0, firstStoredAt: nowSec() };
          return {
            ...prev,
            [p.seed]: {
              count: prevEntry.count + 1,
              firstStoredAt: prevEntry.count === 0 ? nowSec() : prevEntry.firstStoredAt
            }
          };
        });
        addNotification(`📦 Stored ${getSeedEmoji(p.seed)} ${p.seed}`, "info");
      } else {
        if (val > 0) {
          setCoins(c => c + val);
          setScore(s => s + val);
        }
      }
      setTotalEarned(t => t + val);
      setTotalHarvests(h => h + 1);

      // NEW: Festival progress tracking
      if (activeFestival) {
        const festival = FESTIVALS[activeFestival.id];
        if (festival && festival.competitionType === "harvest_volume") {
          setFestivalProgress(prev => prev + 1);
        }
        if (festival && festival.competitionType === "market_sales") {
          setFestivalProgress(prev => prev + val);
        }
      }

      // NEW: Farm XP system
      setFarmExperience(prev => {
        const newXP = prev + Math.floor(val / 10);
        const newLevel = Math.floor(newXP / 100) + 1;
        if (newLevel > farmLevel) {
          setFarmLevel(newLevel);
          setSkillPoints(sp => sp + 1);
          addNotification(`🌟 Farm leveled up to level ${newLevel}! (+1 Skill Point)`, "success");
        }
        return newXP;
      });

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

      if (val > 0) {
        addLog(`🎉 Harvested ${emoji} ${p.seed} (+${val}🪙)${qualityText}${seasonText}${trendText}${buildingText}${rotationText}${beeText}`);
        addNotification(`+${val}🪙 ${emoji}${qualityText}`, "success");
      } else {
        addLog(`🎉 Harvested ${emoji} ${p.seed}${qualityText}${seasonText}${trendText}${buildingText}${rotationText}${beeText}`);
      }

      // NEW: Update last crop family for rotation system
      const lastCropFamily = rules.seeds[p.seed].family;

      // Auto-replant basic behavior
      if (inventory.autoReplant && rules.seeds[p.seed]) {
        setTimeout(() => plant(i, p.seed), 0);
      }

      // Trigger combo and effects
      triggerCombo();
      playSound("harvest");
      if (val > 0) {
        addParticle(i % gridSize * 120 + 60, Math.floor(i / gridSize) * 120 + 60, "coins", `+${val}`);
      }

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
        addNotification(`You already have a ${(rules.buildings[item]?.name)||"building"}!`, "warning");
        return;
      }
      price = rules.buildings[item]?.price || 0;
      if (coins < price) return;

      setCoins(c => c - price);
      setBuildings(prev => ({ ...prev, [item]: true }));
      addLog(`🏗️ Built ${(rules.buildings[item]?.emoji)||"🏗️"} ${(rules.buildings[item]?.name)||"Building"}!`);
      addNotification(`${(rules.buildings[item]?.name)||"Building"} constructed!`, "success");
      // Immediate effects for certain upgrades
      if (item === "irrigation") {
        // Auto-water all planted/growing plots once
        setPlots(prev => prev.map(p => (p.state === "planted" || p.state === "growing") ? { ...p, watered: true } : p));
      }
      return;
    } else if (item in rules.livestock) {
      price = rules.livestock[item].price;
      if (coins < price) return;
      // enforce capacity
      if (livestock.length >= pastureCapacity) {
        addNotification("Pasture is full! Expand capacity to add more animals.", "warning");
        return;
      }

      setCoins(c => c - price);
      const newAnimal = {
        id: Date.now(),
        type: item,
        lastProduced: nowSec(),
        happiness: 100,
        quality: 1,
        traits: assignAnimalTraits(),
        ill: false
      };
      setLivestock(prev => [...prev, newAnimal]);
      addLog(`🐾 Bought ${getLivestockEmoji(item)} ${(rules.livestock[item]?.name)||"Animal"}!`);
      addNotification(`New ${(rules.livestock[item]?.name)||"animal"} added to farm!`, "success");
      return;
    } else if (item === "fungicide") {
      price = rules.fungicide.shopPrice * qty;
    } else if (item === "beeFeed") {
      price = rules.beeFeed.shopPrice * qty;
    } else if (["salt","sugar","yeast","water","animalFeed"].includes(item)) {
      // Basic ingredients
      price = (rules[item]?.shopPrice || 0) * qty;
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

    setCoins(c => Math.max(0, c - price));

    setInventory(inv => {
      const next = { ...inv };
      if (item in rules.seeds || ["fertilizer","pesticide","fungicide","beeFeed","salt","sugar","yeast","water","animalFeed"].includes(item)) {
        next[item] = Math.max(0, (next[item] || 0) + qty);
      }
      return next;
    });

    const emoji = (rules.seeds[item]?.emoji) || "📦";
    addLog(`🛒 Bought ${qty}x ${emoji} ${item} for ${price}🪙`);
    addNotification(`Bought ${qty}x ${item}`, "info");
  }

    // Process crops into higher-value products
  function processCrop(crop, qty = 1) {
    if (!buildings.workshop) {
      addNotification("Need a Workshop to process crops!", "warning");
      return;
    }

    if (!crop || qty < 1) {
      addNotification("Invalid processing request!", "warning");
      return;
    }

    const processing = rules.processing[crop];
    if (!processing) {
      addNotification(`Cannot process ${crop}!`, "warning");
      return;
    }

    // Handle basic processing (single ingredient)
    if (!processing.requires) {
      if ((inventory[crop] || 0) < qty) {
        addNotification(`Not enough ${crop} to process!`, "warning");
        return;
      }

      setInventory(prev => ({
        ...prev,
        [crop]: (prev[crop] || 0) - qty,
        [processing.output]: (prev[processing.output] || 0) + qty
      }));

      const value = Math.round((rules.seeds[crop]?.baseValue || 10) * processing.multiplier * qty);
      addLog(`🏭 Processed ${qty}x ${crop} into ${processing.emoji} ${processing.name} (+${value}🪙 value)`);
      addNotification(`Processed ${qty}x ${processing.name}!`, "success");
      return;
    }

    // Handle advanced processing (multiple ingredients)
    const requiredItems = processing.requires || [];
    const quantities = processing.quantities || {};

    // Check if all required ingredients are available
    for (const item of requiredItems) {
      const requiredQty = (quantities[item] || 1) * qty;
      if ((inventory[item] || 0) < requiredQty) {
        addNotification(`Need ${requiredQty}x ${item} for ${processing.name}!`, "warning");
        return;
      }
    }

    // Process the recipe
    setInventory(prev => {
      const newInventory = { ...prev };

      // Remove input ingredients
      for (const item of requiredItems) {
        const requiredQty = (quantities[item] || 1) * qty;
        newInventory[item] = (newInventory[item] || 0) - requiredQty;
      }

      // Add output product
      newInventory[processing.output] = (newInventory[processing.output] || 0) + qty;

      return newInventory;
    });

    const baseValue = rules.seeds[crop]?.baseValue || 20;
    const value = Math.round(baseValue * processing.multiplier * qty);
    addLog(`🏭 Advanced processing: Created ${qty}x ${processing.emoji} ${processing.name} (+${value}🪙 value)`);
    addNotification(`Created ${qty}x ${processing.name}!`, "success");

    // Add particle effect for advanced processing
    addParticle(300, 200, "processing", processing.emoji);
  }

  // Collect livestock products
  function collectLivestock() {
    const now = nowSec();
    let collected = 0;

    setLivestock(prev => prev.map(animal => {
      const data = rules.livestock[animal.type] || {};
      const interval = computeAnimalInterval(animal, rules);
      if (now - animal.lastProduced >= interval) {
        const product = data.product;
        const happinessMult = 1 + Math.min(1, (animal.happiness || 0) / 200); // up to +50%
        const qualityMult = Math.max(1, Number(animal.quality || 1));
        let value = Math.round((data.value || 10) * happinessMult * qualityMult);
        let quantity = 1;
        
        // Apply trait bonuses
        if (animal.traits) {
          if (animal.traits.includes("quality")) value = Math.round(value * 1.2);
          if (animal.traits.includes("prolific")) quantity = Math.floor(quantity * 1.5);
          if (animal.traits.includes("golden")) value = Math.round(value * 3);
          if (animal.traits.includes("giant")) quantity = quantity * 2;
        }
        
        setInventory(inv => ({ ...inv, [product]: (inv[product] || 0) + quantity }));
        setCoins(c => c + value);
        collected++;
        
        // NEW: Festival progress tracking for animal products
        if (activeFestival) {
          const festival = FESTIVALS[activeFestival.id];
          if (festival && festival.competitionType === "animal_products") {
            setFestivalProgress(prev => prev + quantity);
          }
        }
        
        return { ...animal, lastProduced: now, happiness: Math.max(0, (animal.happiness||0) - 3) };
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
    const seasonData = SEASON_EFFECTS[currentSeason] || { name: String(currentSeason||"Unknown"), color: "" };

    return (
      <div className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-white/80 border-2 border-white/50 backdrop-blur-sm shadow-lg">
        <span className={`font-semibold ${seasonData.color}`}>{seasonData.name}</span>
      </div>
    );
  }

  function MarketDisplay() {
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2">📊 Market & Planner</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(rules.seeds).slice(0, 4).map(([seed, data]) => {
            const trend = marketTrends[seed] || "normal";
            const trendData = MARKET_TRENDS[trend];
            const price = getMarketPrice(seed);
            return (
              <div key={seed} className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border" title={`${data.stages} stages • ~${(data.secondsPerStage*data.stages/60)|0}m • season ${data.season}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    {data.emoji || "🌱"} {price}🪙
                  </span>
                  <span className={`text-xs ${trendData.color}`}>
                    {trend === "high" ? "📈" : trend === "low" ? "📉" : "📊"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={() => setPlannerOpen(v => !v)}>
            {plannerOpen ? "✕ Hide Planner" : "🧠 Open Planner"}
          </Button>
          <select value={harvestMode} onChange={(e)=> setHarvestMode(e.target.value)} className="text-xs border rounded px-2 py-1">
            <option value="sell">Sell on harvest</option>
            <option value="store">Store on harvest</option>
          </select>
        </div>
        {plannerOpen && (
          <div className="mt-2 p-2 rounded border bg-emerald-50 text-xs">
            <div className="font-semibold mb-1">Recommended Crops</div>
            {Object.entries(rules.seeds).filter(([,d])=> d.season===currentSeason).slice(0,4).map(([seed, data]) => (
              <div key={seed} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2"><span className="text-lg">{data.emoji || "🌱"}</span><span className="capitalize">{seed}</span></div>
                <div className="text-right">
                  <div>ROI: {getMarketPrice(seed)}🪙</div>
                  <div className="opacity-60">Time: ~{(data.secondsPerStage*data.stages/60)|0}m</div>
                </div>
              </div>
            ))}
            <div className="text-[10px] opacity-70 mt-1">Hover for details. Shift-drag in field to batch plant/water.</div>
          </div>
        )}
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

  // Simple storage display with decay and sell buttons
  function StorageDisplay() {
    const entries = Object.entries(storage);
    if (entries.length === 0) return null;

    const getQuality = (seed, firstStoredAt) => {
      const minutes = Math.max(0, Math.floor((nowSec() - firstStoredAt) / 60));
      // After 30m, start losing value gradually to 70%; cold storage halves decay rate
      const decayRate = (buildings.cold_storage ? 0.0025 : 0.005);
      const decay = minutes <= 30 ? 1 : Math.max(0.7, 1 - (minutes - 30) * decayRate);
      return decay;
    };

    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2">📦 Storage</div>
        <div className="text-xs opacity-70">Capacity: {Object.values(storage).reduce((a,b)=>a+(b?.count||0),0)} / {(buildings.barn ? 50 : 25)}</div>
        {Object.values(storage).reduce((a,b)=>a+(b?.count||0),0) >= (buildings.barn?50:25) && (
          <div className="text-xs text-red-700">Storage full! Consider selling or building Cold Storage.</div>
        )}
        <div className="space-y-1 text-xs">
          {entries.map(([seed, info]) => (
            <div key={seed} className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{rules.seeds[seed]?.emoji || "📦"}</span>
                <span className="capitalize">{seed}</span>
                <Badge variant="secondary" className="ml-1">{info.count}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">Quality: {(getQuality(seed, info.firstStoredAt)*100|0)}%{buildings.cold_storage?" (slowed)":""}</span>
                <Button size="sm" variant="outline" className="text-xs" onClick={()=> setAutoSellRules(r=> ({ ...r, [seed]: !r[seed] }))}>{autoSellRules[seed]?"Autosell: On":"Autosell: Off"}</Button>
                <Button size="sm" className="text-xs" onClick={() => {
                  setStorage(prev => {
                    const q = getQuality(seed, prev[seed].firstStoredAt);
                    const base = getMarketPrice(seed);
                    const total = Math.round(base * q) * prev[seed].count;
                    setCoins(c => c + total);
                    addNotification(`Sold ${prev[seed].count}x ${seed} for ${total}🪙`, "success");
                    const { [seed]: _, ...rest } = prev;
                    return rest;
                  });
                }}>Sell All</Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  // Deliver to first matching open contract if available
                  setSupplyContracts(prev => {
                    const idx = prev.findIndex(c => c.item === seed && c.progress < c.amount);
                    if (idx === -1) return prev;
                    const deliver = Math.min(info.count, prev[idx].amount - prev[idx].progress);
                    if (deliver <= 0) return prev;
                    const arr = prev.slice();
                    arr[idx] = { ...arr[idx], progress: arr[idx].progress + deliver };
                    setStorage(s => {
                      const left = info.count - deliver;
                      if (left <= 0) { const { [seed]: __, ...rest } = s; return rest; }
                      return { ...s, [seed]: { ...s[seed], count: left } };
                    });
                    if (arr[idx].progress >= arr[idx].amount) {
                      setCoins(c => c + (arr[idx].reward||0));
                      addNotification(`Contract delivered to ${arr[idx].merchant}! +${arr[idx].reward||0}🪙`, "success");
                    } else {
                      addNotification(`Delivered ${deliver}x ${seed} to contract`, "success");
                    }
                    return arr;
                  });
                }}>Deliver to Contract</Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                  // Auto-sell rule: if storage over capacity, sell this stack
                  const capacity = (buildings.barn ? 50 : 25);
                  const totalCount = Object.values(storage).reduce((a,b)=>a+(b?.count||0),0);
                  if (totalCount <= capacity) { addNotification("Storage not full.", "info"); return; }
                  setStorage(prev => {
                    const q = getQuality(seed, prev[seed].firstStoredAt);
                    const base = getMarketPrice(seed);
                    const toSell = Math.min(prev[seed].count, totalCount - capacity);
                    const total = Math.round(base * q) * toSell;
                    setCoins(c => c + total);
                    addNotification(`Auto-sold ${toSell}x ${seed} for ${total}🪙`, "success");
                    const left = prev[seed].count - toSell;
                    if (left <= 0) { const { [seed]: __, ...rest } = prev; return rest; }
                    return { ...prev, [seed]: { ...prev[seed], count: left } };
                  });
                }}>Auto-sell overflow</Button>
              </div>
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

  // NEW: Flying Bees System - only appear during pollination
  const [flyingBees, setFlyingBees] = useState([]);
  const [pollinationActive, setPollinationActive] = useState(false);

  // Trigger bees during pollination
  const triggerPollinationBees = (plotIndex) => {
    if (!buildings.beehive || beeHappiness < 50) return;
    
    setPollinationActive(true);
    
    // Create 2-3 bees for this pollination event
    const beeCount = 2 + Math.floor(Math.random() * 2);
    const newBees = Array.from({ length: beeCount }, (_, index) => ({
      id: `pollination_bee_${plotIndex}_${Date.now()}_${index}`,
      plotIndex,
      x: (plotIndex % gridSize) * 90 + 45 + Math.random() * 30 - 15,
      y: Math.floor(plotIndex / gridSize) * 90 + 45 + Math.random() * 30 - 15,
      opacity: 1,
      startTime: Date.now()
    }));
    
    setFlyingBees(newBees);
    
    // Remove bees after 3 seconds
    setTimeout(() => {
      setFlyingBees([]);
      setPollinationActive(false);
    }, 3000);
  };

  function FlyingBees() {
    if (!pollinationActive || flyingBees.length === 0) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {flyingBees.map(bee => {
          const elapsed = Date.now() - bee.startTime;
          const fadeOut = elapsed > 2000 ? (3000 - elapsed) / 1000 : 1;
          
          return (
            <div
              key={bee.id}
              className="absolute text-lg pointer-events-none"
              style={{
                left: bee.x,
                top: bee.y,
                opacity: fadeOut,
                transition: 'opacity 0.5s ease-out'
              }}
            >
              <span className="inline-block animate-bee-buzz">🐝</span>
            </div>
          );
        })}
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
    if (!p || typeof p !== 'object') return null;

    const spec = p.seed ? getSeedSpec(p.seed) : null;
    const pct = spec ? Math.round((Math.min(p.growth || 0, spec.stages) / spec.stages) * 100) : 0;
    const emoji = spec?.emoji || "🌱";
    const [menuPos, setMenuPos] = useState(null);
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
      setMenuPos({ x: e.clientX, y: e.clientY });
    }

    return (
      <div
        onClick={leftClick}
        onContextMenu={rightClick}
        onMouseDown={(e) => {
          if (e.shiftKey && (p.state === "planted" || p.state === "growing" || p.state === "empty")) {
            setIsSelecting(true);
            const rect = gridRef.current?.getBoundingClientRect?.();
            if (!rect) return;
            setSelectionRect({ x1: e.clientX - rect.left, y1: e.clientY - rect.top, x2: e.clientX - rect.left, y2: e.clientY - rect.top });
            setSelectedPlots([]);
            e.preventDefault();
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelecting || !selectionRect) return;
          // While dragging, add to selection
          setSelectedPlots(prev => Array.from(new Set([...prev, i])));
        }}
        onMouseUp={(e) => {
          if (!isSelecting) return;
          setIsSelecting(false);
          // Batch action: if empty -> plant; else water
          setSelectedPlots(prev => {
            const arr = prev.length ? prev : [i];
            arr.forEach(idx => {
              const plot = plots[idx];
              if (plot.state === "empty") plant(idx, selectedSeed);
              else if (plot.state === "planted" || plot.state === "growing") water(idx);
            });
            return [];
          });
          setSelectionRect(null);
        }}
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
                  {Math.floor(Math.min(p.growth || 0, spec.stages))}/{spec.stages} stages
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
            <div className="w-full" title={`${spec.stages} stages • ~${(spec.secondsPerStage*spec.stages/60)|0}m • season ${spec.season}`}>
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
                Click: Plant {getSeedEmoji(selectedSeed)} {selectedSeed}
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
        {menuPos && (
          <div className="absolute z-50" style={{ left: 8, top: 8 }} onClick={(e)=> e.stopPropagation()}>
            <div className="bg-white/90 border rounded-lg shadow p-2 flex gap-1 text-xs">
              {(p.state==="empty") && <Button size="sm" variant="outline" onClick={()=>{ plant(i, selectedSeed); setMenuPos(null); }}>Plant</Button>}
              {(p.state==="planted"||p.state==="growing") && <Button size="sm" variant="outline" onClick={()=>{ water(i); setMenuPos(null); }}>Water</Button>}
              {(p.state==="planted"||p.state==="growing") && <Button size="sm" variant="outline" onClick={()=>{ fertilize(i); setMenuPos(null); }}>Fertilize</Button>}
              {p.infested && <Button size="sm" variant="outline" onClick={()=>{ spray(i); setMenuPos(null); }}>Spray</Button>}
              {(p.state==="withered") && <Button size="sm" variant="outline" onClick={()=>{ clearPlot(i); setMenuPos(null); }}>Clear</Button>}
              <Button size="sm" variant="outline" onClick={()=> setMenuPos(null)}>Close</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Enhanced Layout ---
  const currentTheme = FARM_THEMES[farmTheme] || FARM_THEMES.classic;
  const backgroundClass = farmTheme === "classic"
    ? `${DAY_NIGHT_CYCLE[currentTimeOfDay].bg}`
    : `${currentTheme.bg}`;

  // Hotkeys 1-8 to select seeds in quick bar
  useEffect(() => {
    const handler = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable)) return;
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= 8) {
        const entries = Object.keys(rules.seeds).slice(0,8);
        const seed = entries[n-1];
        if (seed) setSelectedSeed(seed);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rules.seeds]);

  // Ensure critical buildings exist (in case of very old saves)
  useEffect(() => {
    if (!rules?.buildings?.research_lab) {
      setRules(r => ({
        ...r,
        buildings: {
          ...r.buildings,
          research_lab: { price: 450, emoji: "🔬", name: "Research Lab", description: "Unlock hybrid seeds and research upgrades", effect: "research", bonus: 1 }
        }
      }));
    }
    if (!rules?.buildings?.delivery_van) {
      setRules(r => ({
        ...r,
        buildings: { ...r.buildings, delivery_van: { price: 200, emoji: "🚚", name: "Delivery Van", description: "Reduce decay during deliveries", effect: "delivery", bonus: 0.2 } }
      }));
    }
  }, []);

  function generateContracts() {
    const seeds = Object.keys(rules.seeds || {});
    if (seeds.length === 0) return [];
    const pick = () => seeds[Math.floor(Math.random()*seeds.length)];
    const now = nowSec();
    const make = () => {
      const item = pick();
      const amount = 5 + Math.floor(Math.random()*8);
      const price = getMarketPrice(item);
      const reward = Math.max(5, Math.round(price * amount * 1.2));
      const eta = 180 + Math.floor(Math.random()*180);
      return { id: `c_${now}_${Math.random().toString(36).slice(2,7)}`, item, amount, reward, eta, expiresAt: now + eta, status: "open", premium: 0 };
    };
    return [make(), make(), make()];
  }

  useEffect(() => {
    // Initial contracts
    if (!contracts || contracts.length === 0) {
      const cs = generateContracts();
      setContracts(cs);
      setLastContractsAt(nowSec());
    }
    // Ensure Cold Storage building exists in rules list (not built by default)
    if (!rules?.buildings?.cold_storage) {
      setRules(r => ({
        ...r,
        buildings: { ...r.buildings, cold_storage: { price: 220, emoji: "❄️", name: "Cold Storage", description: "Slows storage decay by 50%", effect: "storage_slow", bonus: 0.5 } }
      }));
    }
  }, []);

  useEffect(() => {
    // Rotate contracts every 5 minutes
    if (currentTime % 300 === 0) {
      const cs = generateContracts();
      setContracts(cs);
      setLastContractsAt(nowSec());
    }
  }, [currentTime]);

  const [seedSearch, setSeedSearch] = useState("");
  const [seedSeasonFilter, setSeedSeasonFilter] = useState("all");
  const [seedSort, setSeedSort] = useState("roi");

  return (
    <div className={`min-h-screen ${darkMode?"bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100":"bg-gradient-to-br "+backgroundClass+" text-slate-800"} relative overflow-hidden ${reducedMotion?"": "transition-all duration-1000"}`} style={{ fontSize: `${fontScale}%` }}>
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

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
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
            {/* Quick actions under header for convenience */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-2 py-2 shadow-lg border border-white/50 flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="text-xs" onClick={()=>{
                setPlots(prev=> prev.map((p,i)=> (p.state==='grown') ? (harvest(i), p) : p));
              }}>Harvest All</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={()=>{
                if (coins < 0) return; // placeholder cost could be added
                setPlots(prev=> prev.map(p=> (p.state==='planted'||p.state==='growing') ? { ...p, watered: true, state:'growing' } : p));
                addNotification('All planted plots watered', 'success');
              }}>Water All</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={()=>{
                const costPer = 1; // fertilizer item per plot
                let needed = 0;
                plots.forEach(p=>{ if (p.state==='planted'||p.state==='growing') needed++; });
                if ((inventory.fertilizer||0) < needed) { addNotification(`Need ${Math.max(0, needed-(inventory.fertilizer||0))} fertilizer`, 'warning'); return; }
                setInventory(inv => ({ ...inv, fertilizer: (inv.fertilizer||0) - needed }));
                setPlots(prev=> prev.map(p=> (p.state==='planted'||p.state==='growing') ? { ...p, fertilized: Math.min((p.fertilized||0)+1, rules.fertilizer.maxStacks) } : p));
                addNotification('All planted plots fertilized', 'success');
              }}>Fertilize All</Button>
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

            {/* Quick Save/Load */}
            <div className="hidden md:flex items-center gap-1">
              {[1,2,3].map(n => (
                <Button key={n} size="sm" variant="outline" onClick={()=> saveToSlot(n)} title={`Save Slot ${n}`}>S{n}</Button>
              ))}
              {[1,2,3].map(n => (
                <Button key={`l${n}`} size="sm" variant="outline" onClick={()=> loadFromSlot(n)} title={`Load Slot ${n}`}>L{n}</Button>
              ))}
            </div>

            <SeasonBadge/>
            <WeatherBadge/>

            {/* NEW: Time of Day Badge */}
            <div className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-white/80 border-2 border-white/50 backdrop-blur-sm shadow-lg">
              <span className="font-semibold text-slate-700">{DAY_NIGHT_CYCLE[currentTimeOfDay].name}</span>
            </div>
            {/* Synergy badges */}
            {getActiveSynergies().length>0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50 text-xs flex gap-2">
                {getActiveSynergies().map(s=> <Badge key={s.id} variant="secondary">{s.label}</Badge>)}
              </div>
            )}
          </div>
        </div>

        {/* NEW: Festival Display */}
        {activeFestival && (
          <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-xl">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">{FESTIVALS[activeFestival.id]?.emoji}</div>
                  <h3 className="font-bold text-lg text-purple-800">{FESTIVALS[activeFestival.id]?.name}</h3>
                  <p className="text-sm text-purple-600 mb-2">{FESTIVALS[activeFestival.id]?.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress: {festivalProgress}/{Object.values(FESTIVALS[activeFestival.id]?.requirements || {})[0] || 0}</span>
                    <span>Time: {Math.max(0, activeFestival.endsAt - currentTime)}s</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (festivalProgress / (Object.values(FESTIVALS[activeFestival.id]?.requirements || {})[0] || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* NEW: Weather Events Display */}
        {activeWeatherEvents.length > 0 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            {activeWeatherEvents.map(event => (
              <Card key={event.id} className="mb-2 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{WEATHER_EVENTS[event.type]?.emoji}</span>
                    <div>
                      <div className="font-bold text-orange-800">{WEATHER_EVENTS[event.type]?.name}</div>
                      <div className="text-xs text-orange-600">
                        {WEATHER_EVENTS[event.type]?.description}
                      </div>
                      <div className="text-xs">Ends in: {Math.max(0, event.endsAt - currentTime)}s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* HUD Pin: Auto toggles */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white/90 border rounded-xl shadow p-2 text-xs flex items-center gap-2">
            <span>Auto‑replant</span>
            <Button size="sm" variant="outline" onClick={()=> setInventory(inv => ({ ...inv, autoReplant: !inv.autoReplant }))}>{inventory.autoReplant?"On":"Off"}</Button>
            <span>Auto‑buy</span>
            <Button size="sm" variant="outline" onClick={()=> setInventory(inv => ({ ...inv, autoBuySeeds: !inv.autoBuySeeds }))}>{inventory.autoBuySeeds?"On":"Off"}</Button>
          </div>
        </div>

        <ParticleSystem/>
        <ComboDisplay/>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
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
                <StorageDisplay/>
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

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-yellow-500" size={20}/>
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Horticulture</div>
                    <div className="opacity-70">+5% growth speed per level</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Lv {skills.horticulture}</Badge>
                    <Button size="sm" variant="outline" disabled={skillPoints<=0 || skills.horticulture>=3} onClick={()=>{setSkills(s=>({...s,horticulture:Math.min(3,(s.horticulture||0)+1)})); setSkillPoints(p=>p-1);}}>+</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Economics</div>
                    <div className="opacity-70">+5% sale value per level</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Lv {skills.economics}</Badge>
                    <Button size="sm" variant="outline" disabled={skillPoints<=0 || skills.economics>=3} onClick={()=>{setSkills(s=>({...s,economics:Math.min(3,(s.economics||0)+1)})); setSkillPoints(p=>p-1);}}>+</Button>
                  </div>
                </div>
                <div className="text-right opacity-70">Points: {skillPoints}</div>
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
                <Tabs value={shopView} onValueChange={setShopView}>
                  <TabsList className="flex-wrap w-full gap-1 overflow-x-auto justify-start sticky top-0 z-10">
                    <TabsTrigger value="main" className="text-xs px-2 py-1">🌱 Main Shop</TabsTrigger>
                    <TabsTrigger value="ingredients" className="text-xs px-2 py-1">🥘 Ingredients</TabsTrigger>
                    <TabsTrigger value="processing" className="text-xs px-2 py-1">🏭 Processing</TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs px-2 py-1">🛠️ Tools</TabsTrigger>
                    <TabsTrigger value="buildings" className="text-xs px-2 py-1">🏗️ Buildings</TabsTrigger>
                    <TabsTrigger value="livestock" className="text-xs px-2 py-1">🐄 Animals</TabsTrigger>
                    <TabsTrigger value="business" className="text-xs px-2 py-1">💼 Business</TabsTrigger>
                    <TabsTrigger value="community" className="text-xs px-2 py-1">🏘️ Community</TabsTrigger>
                    <TabsTrigger value="events" className="text-xs px-2 py-1">🎉 Events</TabsTrigger>
                  </TabsList>

                  <TabsContent value="main" className="space-y-4">
                    {/* Main shop with core items */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold mb-2">🌱 Popular Crops</div>
                      {Object.entries(rules.seeds).slice(0, 6).map(([seed, data]) => (
                        <Button
                          key={seed}
                          onClick={() => buy(seed, 1)}
                          variant="outline"
                          className="w-full justify-between h-auto p-3"
                          disabled={coins < data.shopPrice}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{data.emoji || "🌱"}</span>
                            <div className="text-left">
                              <div className="font-semibold capitalize">{seed}</div>
                              <div className="text-xs opacity-70">{data.season} • {data.rarity}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{data.shopPrice}🪙</div>
                            <div className="text-xs opacity-70">{data.baseValue} value</div>
                          </div>
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold mb-2">🛠️ Essential Tools</div>
                      {["fertilizer", "pesticide", "fungicide"].map(tool => (
                        <Button
                          key={tool}
                          onClick={() => buy(tool, 1)}
                          variant="outline"
                          className="w-full justify-between h-auto p-3"
                          disabled={coins < rules[tool]?.shopPrice}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🛠️</span>
                            <div className="text-left">
                              <div className="font-semibold capitalize">{tool}</div>
                              <div className="text-xs opacity-70">{rules[tool]?.description}</div>
                            </div>
                          </div>
                          <div className="font-bold">{rules[tool]?.shopPrice}🪙</div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="seeds" className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Input value={seedSearch} onChange={e=> setSeedSearch(e.target.value)} placeholder="Search seeds" className="flex-1"/>
                      <select className="border rounded px-2 py-1" value={seedSeasonFilter} onChange={e=> setSeedSeasonFilter(e.target.value)}>
                        <option value="all">All seasons</option>
                        {SEASONS.map(s=> <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="border rounded px-2 py-1" value={seedSort} onChange={e=> setSeedSort(e.target.value)}>
                        <option value="roi">Sort: ROI</option>
                        <option value="time">Sort: Time</option>
                        <option value="value">Sort: Value</option>
                      </select>
                    </div>
                    {Object.entries(rules.seeds)
                      .filter(([seed, data]) => seed.toLowerCase().includes(seedSearch.toLowerCase()))
                      .filter(([seed, data]) => seedSeasonFilter === "all" || data.season === seedSeasonFilter)
                      .sort((a,b)=>{
                        const [sa, da] = a; const [sb, db] = b;
                        const roiA = getMarketPrice(sa) / Math.max(1, da.secondsPerStage*da.stages);
                        const roiB = getMarketPrice(sb) / Math.max(1, db.secondsPerStage*db.stages);
                        if (seedSort === "roi") return roiB - roiA;
                        if (seedSort === "time") return (da.secondsPerStage*da.stages) - (db.secondsPerStage*db.stages);
                        return getMarketPrice(sb) - getMarketPrice(sa);
                      })
                      .map(([seed, data]) => (
                        <Button
                          key={seed}
                          onClick={() => buy(seed, 1)}
                          variant="outline"
                          className="w-full justify-between h-auto p-3"
                          disabled={coins < data.shopPrice}
                          title={`ROI ${(getMarketPrice(seed)/Math.max(1,data.secondsPerStage*data.stages)).toFixed(2)}/s • Season ${data.season} • Est. ${getMarketPrice(seed)}🪙`}
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

                  <TabsContent value="ingredients" className="space-y-2">
                    <div className="text-sm text-amber-700 mb-2 p-2 bg-amber-50 rounded border border-amber-200">
                      🥘 Basic ingredients for advanced recipe processing
                    </div>

                    <Button
                      onClick={() => buy("salt", 1)}
                      variant="outline"
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.salt.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🧂</span>
                        <div>
                          <div className="font-semibold">Salt</div>
                          <div className="text-xs opacity-70">Basic seasoning</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.salt.shopPrice}🪙</div>
                    </Button>

                    <Button
                      onClick={() => buy("sugar", 1)}
                      variant="outline"
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.sugar.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍚</span>
                        <div>
                          <div className="font-semibold">Sugar</div>
                          <div className="text-xs opacity-70">Sweetener for recipes</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.sugar.shopPrice}🪙</div>
                    </Button>

                    <Button
                      onClick={() => buy("yeast", 1)}
                      variant="outline"
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.yeast.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍞</span>
                        <div>
                          <div className="font-semibold">Yeast</div>
                          <div className="text-xs opacity-70">Essential for baking</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.yeast.shopPrice}🪙</div>
                    </Button>

                    <Button
                      onClick={() => buy("water", 1)}
                      variant="outline"
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.water.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💧</span>
                        <div>
                          <div className="font-semibold">Water</div>
                          <div className="text-xs opacity-70">Basic processing ingredient</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.water.shopPrice}🪙</div>
                    </Button>

                    <Button
                      onClick={() => buy("animalFeed", 1)}
                      variant="outline"
                      className="w-full justify-between h-auto p-3"
                      disabled={coins < rules.animalFeed.shopPrice}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌾</span>
                        <div>
                          <div className="font-semibold">Animal Feed</div>
                          <div className="text-xs opacity-70">Food for livestock happiness</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.animalFeed.shopPrice}🪙</div>
                    </Button>
                                      </TabsContent>

                  <TabsContent value="processing" className="space-y-2">
                    {!buildings.workshop ? (
                      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-red-600 font-semibold">Workshop Required</div>
                        <div className="text-sm text-red-500">Build a Workshop to process advanced recipes!</div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-emerald-700 mb-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                          🏭 Advanced recipe processing - combine ingredients for valuable products
                        </div>

                        {/* Advanced Recipes */}
                        {Object.entries(rules.processing)
                          .filter(([, recipe]) => recipe.requires)
                          .map(([recipeKey, recipe]) => (
                          <Button
                            key={recipeKey}
                            onClick={() => processCrop(recipeKey, 1)}
                            variant="outline"
                            className="w-full justify-between h-auto p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                            disabled={!recipe.requires?.every(item => (inventory[item] || 0) >= (recipe.quantities?.[item] || 1))}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{recipe.emoji || "🏭"}</span>
                              <div className="text-left">
                                <div className="font-semibold">{recipe.name}</div>
                                <div className="text-xs opacity-70">
                                  {recipe.requires?.map(item => `${recipe.quantities?.[item] || 1}x ${item}`).join(", ")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{Math.round((rules.seeds[recipeKey]?.baseValue || 20) * recipe.multiplier)}🪙</div>
                              <div className="text-xs opacity-70">{recipe.processingTime || 30}s</div>
                            </div>
                          </Button>
                        ))}

                        {/* Basic Processing */}
                        <div className="border-t pt-2 mt-2">
                          <div className="text-xs text-slate-600 mb-2">Basic Processing:</div>
                          {Object.entries(rules.processing)
                            .filter(([, recipe]) => !recipe.requires)
                            .slice(0, 3)
                            .map(([crop, recipe]) => (
                            <Button
                              key={crop}
                              onClick={() => processCrop(crop, 1)}
                              variant="outline"
                              className="w-full justify-between h-auto p-2 text-sm"
                              disabled={(inventory[crop] || 0) < 1}
                            >
                              <div className="flex items-center gap-2">
                                <span>{recipe.emoji || "🏭"}</span>
                                <div>{recipe.name}</div>
                              </div>
                              <div className="font-bold">{Math.round((rules.seeds[crop]?.baseValue || 10) * recipe.multiplier)}🪙</div>
                            </Button>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="events" className="space-y-2">
                    <div className="text-sm text-purple-700 mb-2 p-2 bg-purple-50 rounded border border-purple-200">
                      🎉 Seasonal events and festivals - limited-time bonuses and rewards!
                    </div>

                    {/* Current Event Display */}
                    {currentEvent && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 border border-purple-200 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-purple-800">{SEASONAL_EVENTS[currentEvent].name}</div>
                          <div className="text-xs text-purple-600">
                            {eventEndsAt ? formatTimeRemaining(eventEndsAt, currentTime) : "Active"}
                          </div>
                        </div>
                        <div className="text-xs text-purple-700 mb-2">{SEASONAL_EVENTS[currentEvent].description}</div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, eventProgress)}%` }}
                          />
                        </div>
                        <div className="text-xs text-center mt-1 text-purple-600">Progress: {eventProgress}%</div>
                      </div>
                    )}

                    {/* Available Events */}
                    {Object.entries(SEASONAL_EVENTS).map(([eventId, event]) => (
                      <div key={eventId} className="border rounded-lg p-3 bg-white/80">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-sm">{event.name}</div>
                            <div className="text-xs text-slate-600">{event.description}</div>
                          </div>
                          <div className="text-xs text-right text-slate-500">
                            <div>{Math.floor(event.duration / 60)}min duration</div>
                            <div>{event.season === "all" ? "Any season" : `${event.season} season`}</div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 mb-2">
                          <div>Requirements: {Object.entries(event.requirements).map(([req, val]) => `${val} ${req}`).join(", ")}</div>
                          <div>Bonuses: {Object.entries(event.bonuses).map(([bonus, val]) => `${bonus} ${typeof val === 'number' && val > 1 ? `+${Math.round((val-1)*100)}%` : val}`).join(", ")}</div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            onClick={() => startSeasonalEvent(eventId)}
                            disabled={currentEvent !== null || !checkRequirements(event.requirements)}
                            className="flex-1 text-xs"
                            size="sm"
                          >
                            🎉 Start Event
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Limited Time Crops */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-slate-600 mb-2">🌟 Limited-Time Crops</div>
                      {Object.entries(LIMITED_TIME_CROPS).map(([cropId, crop]) => (
                        <div key={cropId} className="text-xs bg-yellow-50 rounded p-2 border border-yellow-200">
                          <div className="flex items-center gap-1">
                            <span>{crop.emoji || "🌱"}</span>
                            <span className="font-semibold">{crop.name}</span>
                            <span>{crop.baseValue}🪙</span>
                          </div>
                          <div className="text-yellow-700">{crop.description}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="livestock" className="space-y-4">
                    <div className="text-sm text-green-700 mb-2 p-2 bg-green-50 rounded border border-green-200">
                      🐄 Manage your livestock - feed animals, breed them, and collect quality products!
                    </div>

                    {/* Settings */}
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={autoCollect} onChange={e=> setAutoCollect(e.target.checked)} />
                        Auto‑collect products hourly
                      </label>
                      <div className="ml-auto flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => collectLivestock()}>Collect All</Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                          if ((inventory.animalFeed||0) <= 0) { addNotification("No animal feed available!", "warning"); return; }
                          setInventory(prev => ({ ...prev, animalFeed: Math.max(0, (prev.animalFeed||0) - 1) }));
                          setLivestock(prev => prev.map(a => ({ ...a, happiness: Math.min(100, (a.happiness||0) + 10) })));
                          addNotification("Fed all animals! +10% happiness", "success");
                        }}>Feed All</Button>
                      </div>
                    </div>

                    {/* Animal Feed Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Animal Feed</div>
                        <div className="text-xs">{animalFeed}%</div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${animalFeed}%` }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if ((inventory.animalFeed || 0) > 0) {
                              setInventory(prev => ({ ...prev, animalFeed: (prev.animalFeed || 0) - 1 }));
                              setAnimalFeed(prev => Math.min(100, prev + 25));
                              addNotification("Fed the animals! +25% happiness", "success");
                            } else {
                              addNotification("No animal feed available!", "warning");
                            }
                          }}
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          🍽️ Feed Animals
                        </Button>
                        <div className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {inventory.animalFeed || 0} bags
                        </div>
                      </div>
                    </div>

                    {/* Buy Animals */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Buy Animals</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(rules.livestock).map(([type, data]) => (
                          <div key={type} className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{data.emoji || "🐾"}</span>
                              <div className="text-xs">
                                <div className="font-semibold">{data.name}</div>
                                <div className="opacity-70">{data.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm">{data.price}🪙</div>
                              <Button size="sm" className="text-xs mt-1" disabled={coins < (data.price||0)} onClick={() => buy(type, 1)}>Buy</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Livestock */}
                    {livestock.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Your Animals ({livestock.length})</div>
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(4, pastureSize)}, minmax(0, 1fr))` }}>
                          {livestock.map(animal => {
                            const data = rules.livestock[animal.type] || {};
                            return (
                              <div key={animal.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{data.emoji || "🐄"}</span>
                                    <div>
                                      <div className="font-semibold text-sm">{data.name}</div>
                                      <div className="text-xs opacity-70">
                                        Happiness: {(animal.happiness ?? 0)}% | Quality: {Number(animal.quality ?? 1).toFixed(1)}x {animal.traits && animal.traits.length>0 && `• ${animal.traits.map(t=>ANIMAL_TRAITS[t]?.emoji||"" ).join("")}`}
                                        {animal.ill && <span className="text-red-600 ml-1">(ill)</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => {
                                        setAnimalFeed(prev => Math.max(0, prev - 5));
                                        setLivestock(prev => prev.map(a =>
                                          a.id === animal.id
                                            ? { ...a, happiness: Math.min(100, a.happiness + 20) }
                                            : a
                                        ));
                                        addNotification(`${data.name} is happier!`, "success");
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1"
                                      disabled={animalFeed < 5}
                                    >
                                      ❤️
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        // Find partner for breeding
                                        const partner = livestock.find(a => 
                                          a.type === animal.type && 
                                          a.id !== animal.id && 
                                          !a.ill && 
                                          (a.happiness || 0) >= 50
                                        );
                                        
                                        if (partner) {
                                          const breedTime = Math.max(120, (data.breedingTime||600));
                                          const actual = animal.traits && animal.traits.includes("fertile") ? Math.floor(breedTime*0.75) : breedTime;
                                          
                                          // Generate offspring traits using genetic inheritance
                                          const offspringTraits = assignAnimalTraits(animal.traits || [], partner.traits || []);
                                          
                                          setBreedingQueue(q => [...q, { 
                                            id: animal.id + '_' + partner.id + '_' + Date.now(), 
                                            type: animal.type, 
                                            readyAt: nowSec() + actual,
                                            traits: offspringTraits,
                                            parents: [animal.id, partner.id]
                                          }]);
                                          addNotification(`${data.name} breeding with genetic traits! (${(actual/60)|0}m)`, "success");
                                        } else {
                                          addNotification("Need another healthy, happy animal of same type for breeding", "warning");
                                        }
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1"
                                    >
                                      🐣 Breed
                                    </Button>
                                    {animal.ill ? (
                                      <Button
                                        onClick={() => {
                                          const fee = 15;
                                          if (coins < fee) { addNotification("Need 15🪙 for vet visit", "warning"); return; }
                                          setCoins(c=>c-fee);
                                          setLivestock(prev => prev.map(a => a.id===animal.id ? { ...a, ill:false, happiness: Math.min(100, (a.happiness||0)+10) } : a));
                                          addNotification(`${data.name} cured by vet (-15🪙)`, "success");
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="text-xs px-2 py-1"
                                      >
                                        🩺 Vet
                                      </Button>
                                    ) : null}
                                    <Button
                                      onClick={() => {
                                        const base = (rules.livestock[animal.type]?.price || 50);
                                        const sale = Math.max(1, Math.round(base * 0.7 * (animal.quality||1) * (1 + (animal.happiness||0)/200)));
                                        setLivestock(prev => prev.filter(a => a.id !== animal.id));
                                        setCoins(c => c + sale);
                                        addNotification(`Sold ${data.name} for ${sale}🪙`, "success");
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1"
                                    >
                                      💰 Sell
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pasture area & expansion */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Pasture Area</div>
                      <div className="text-xs opacity-70">Current pens: {pastureSize} columns • Capacity: {pastureCapacity} animals</div>
                      {pastureSize < PASTURE_MAX && (
                        <Button size="sm" className="text-xs" disabled={coins < (PASTURE_EXPANSION_COSTS[pastureSize+1]||0)} onClick={() => {
                          const price = PASTURE_EXPANSION_COSTS[pastureSize+1]||0;
                          if (coins < price) return;
                          setCoins(c => c - price);
                          setPastureSize(s => Math.min(PASTURE_MAX, s + 1));
                          addNotification(`Pasture expanded to ${pastureSize+1} columns!`, "success");
                        }}>Expand Pasture ({PASTURE_EXPANSION_COSTS[pastureSize+1]||0}🪙)</Button>
                      )}
                      {getNextPastureCapacity(pastureCapacity) > pastureCapacity && (
                        <Button size="sm" variant="outline" className="text-xs" disabled={coins < (PASTURE_CAPACITY_COSTS[getNextPastureCapacity(pastureCapacity)]||0)} onClick={() => {
                          const next = getNextPastureCapacity(pastureCapacity);
                          const cost = PASTURE_CAPACITY_COSTS[next]||0;
                          if (coins < cost) return;
                          setCoins(c=>c-cost);
                          setPastureCapacity(next);
                          addNotification(`Pasture capacity upgraded to ${next}!`, "success");
                        }}>Increase Capacity ({PASTURE_CAPACITY_COSTS[getNextPastureCapacity(pastureCapacity)]||0}🪙)</Button>
                      )}
                    </div>

                    {/* Breeding Queue */}
                    {breedingQueue.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">Breeding Queue</div>
                        {breedingQueue.map(b => {
                          const d = rules.livestock[b.type] || {}; 
                          const timeLeft = Math.max(0, (b.readyAt - currentTime));
                          const totalTime = (d.breedingTime || 600);
                          const progress = Math.min(100, Math.max(0, (1 - timeLeft / totalTime) * 100));
                          return (
                            <div key={b.id} className="text-xs bg-white/80 p-2 border rounded space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><span className="text-lg">{d.emoji||"🐾"}</span><span>{d.name||b.type}</span></div>
                                <div>Ready in {timeLeft}s</div>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4">
                    <div className="text-sm text-blue-700 mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                      💼 Manage your farm business - trade with merchants, manage debt, and build reputation!
                    </div>

                    {/* Business Overview */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                        <div className="text-sm font-semibold text-blue-800">Business Reputation</div>
                        <div className="text-lg font-bold">{businessReputation}/100</div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${businessReputation}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                        <div className="text-sm font-semibold text-red-800">Farm Debt</div>
                        <div className="text-lg font-bold">{farmDebt}🪙</div>
                        {farmDebt > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2 text-xs"
                            onClick={() => {
                              if (coins >= farmDebt) {
                                setCoins(prev => prev - farmDebt);
                                setFarmDebt(0);
                                setBusinessReputation(prev => Math.min(100, prev + 10));
                                addNotification("Debt repaid! Reputation increased.", "success");
                              } else {
                                addNotification("Not enough coins to repay debt!", "warning");
                              }
                            }}
                          >
                            Repay Debt
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Merchants */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🏪 Available Merchants</div>
                      <div className="space-y-2">
                        {merchants.map(merchant => (
                          <div key={merchant.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold text-sm">{merchant.name}</div>
                                <div className="text-xs opacity-70 capitalize">{merchant.persona} market</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs">Rep: {merchant.reputation}/100</div>
                                <div className="text-xs">Bonus: +{Math.round((merchant.prices.multiplier - 1) * 100)}%</div>
                                <div className="flex gap-0.5 justify-end mt-1" title="Recent price index">
                                  {(merchant.history||[]).slice(-10).map((h,i)=> (
                                    <div key={i} className="w-1 bg-blue-400" style={{height: `${Math.max(2, Math.min(10, 2 + h))}px`}}/>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => setCurrentMerchant(merchant)}
                              className="w-full text-xs"
                              size="sm"
                            >
                              Visit Merchant
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Merchant Negotiation */}
                    {currentMerchant && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold">{currentMerchant.name}</div>
                            <div className="text-sm opacity-70">Negotiation Level: {currentMerchant.prices.negotiation}%</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentMerchant(null)}
                          >
                            ✕
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Button
                            onClick={() => {
                              // Loan option
                              const loanAmount = 1000;
                              if (farmDebt >= 500) {
                                addNotification("Maximum debt reached!", "warning");
                                return;
                              }
                              setFarmDebt(prev => prev + loanAmount);
                              setCoins(prev => prev + loanAmount);
                              setBusinessReputation(prev => Math.max(0, prev - 5));
                              addNotification(`Received ${loanAmount}🪙 loan from ${currentMerchant.name}`, "info");
                            }}
                            className="w-full text-xs"
                            size="sm"
                            disabled={farmDebt > 500}
                          >
                            💰 Take Business Loan (1000🪙)
                          </Button>

                          <Button
                            onClick={() => {
                              // Investment opportunity
                              const investment = 500;
                              if (businessReputation >= 90) {
                                addNotification("Reputation is already at maximum!", "warning");
                                return;
                              }
                              if (coins >= investment) {
                                setCoins(prev => prev - investment);
                                setBusinessReputation(prev => Math.min(100, prev + 15));
                                addNotification(`Investment successful! Reputation +15`, "success");
                              } else {
                                addNotification("Need 500🪙 for investment!", "warning");
                              }
                            }}
                            className="w-full text-xs"
                            size="sm"
                          >
                            📈 Make Business Investment
                          </Button>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => {
                                // Simple negotiation increases price multiplier slightly
                                setMerchants(list => list.map(m => m.id === currentMerchant.id ? { ...m, prices: { ...m.prices, negotiation: Math.min(20, (m.prices.negotiation||0) + 1), multiplier: (m.prices.multiplier||1), premium: Math.min(0.25, (m.prices.premium||0) + 0.01) } } : m));
                                addNotification("Negotiation improved rates slightly", "success");
                              }}
                            >
                              🤝 Negotiate
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                // Bulk sell all storage to merchant
                                setStorage(prev => {
                                  let total = 0;
                                  const next = {};
                                  Object.entries(prev).forEach(([seed, info]) => {
                                    const base = getMarketPrice(seed);
                                    const mult = (currentMerchant?.prices?.multiplier || 1);
                                    const premium = (currentMerchant?.prices?.premium || 0);
                                    total += Math.round(base * (mult + premium)) * (info.count || 0);
                                  });
                                  if (total > 0) {
                                    setCoins(c => c + total);
                                    addNotification(`Sold all storage to ${currentMerchant.name} for ${total}🪙`, "success");
                                  }
                                  return next; // cleared
                                });
                              }}
                            >
                              🧺 Sell All Storage
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Supply Contracts */}
                    {supplyContracts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">📋 Active Contracts</div>
                        <div className="space-y-2">
                          {supplyContracts.map(contract => (
                            <div key={contract.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <div><strong>{contract.item}</strong> to {contract.merchant}</div>
                                  <div>{contract.amount} units • {contract.reward}🪙 reward</div>
                                  <div>Progress: {contract.progress}/{contract.amount}</div>
                                </div>
                                <div className="text-xs">
                                  {contract.progress >= contract.amount ? (
                                    <Button size="sm" className="text-xs">✅ Complete</Button>
                                  ) : (
                                    "In Progress"
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="auction" className="space-y-2">
                    <div className="text-xs text-purple-700 mb-2 p-2 bg-purple-50 rounded border border-purple-200">Bid on rare seeds and livestock. Highest bid wins at close.</div>
                    {(() => {
                      const lots = ["moonflower","strawberry","cow"];
                      const lotId = lots[Math.floor((currentTime/30)%lots.length)];
                      const isSeed = !!(rules.seeds && rules.seeds[lotId]);
                      const livestockName = rules.livestock && rules.livestock[lotId] ? (rules.livestock[lotId].name||lotId) : lotId;
                      const label = isSeed ? `${getSeedEmoji(lotId)} ${lotId} seed` : `${getLivestockEmoji(lotId)} ${livestockName}`;
                      const endsIn = 30 - (currentTime % 30);
                      return (
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2"><span className="text-lg">{isSeed ? getSeedEmoji(lotId) : getLivestockEmoji(lotId)}</span><span className="capitalize">{label}</span></div>
                          <div className="flex items-center gap-2">
                            <span>Ends in {Math.floor(endsIn)}s</span>
                            <Button size="sm" variant="outline" onClick={()=> addNotification("Bid placed!", "success")}>Bid +10🪙</Button>
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="community" className="space-y-4">
                    <div className="text-sm text-green-700 mb-2 p-2 bg-green-50 rounded border border-green-200">
                      🏘️ Connect with neighboring farms and contribute to town development!
                    </div>

                    {/* Farm Reputation */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                      <div className="text-sm font-semibold text-green-800 mb-2">🌟 Farm Reputation</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold">{farmReputation}/100</span>
                        <Badge variant={farmReputation >= 80 ? "default" : farmReputation >= 50 ? "secondary" : "destructive"}>
                          {farmReputation >= 80 ? "Excellent" : farmReputation >= 50 ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${farmReputation}%` }}
                        />
                      </div>
                    </div>

                    {/* Neighboring Farms */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🏡 Neighboring Farms</div>
                      <div className="grid gap-2">
                        {NEIGHBOR_FARMS.map(neighbor => (
                          <div key={neighbor.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{neighbor.emoji}</span>
                                <div>
                                  <div className="font-semibold text-xs">{neighbor.name}</div>
                                  <div className="text-xs text-slate-600">Specialty: {neighbor.specialty}</div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Rep: {neighbor.reputation}
                              </Badge>
                            </div>
                            <div className="flex gap-1 flex-wrap mb-2">
                              {neighbor.tradingItems.slice(0, 3).map(item => (
                                <Badge key={item} variant="outline" className="text-xs">
                                  {rules.seeds[item]?.emoji || "📦"} {item}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs flex-1" 
                                onClick={() => addNotification(`Visited ${neighbor.name}!`, "info")}>
                                🏠 Visit
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs flex-1"
                                onClick={() => addNotification(`Trading with ${neighbor.farmer}...`, "info")}>
                                🤝 Trade
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Town Projects */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🏛️ Town Development Projects</div>
                      <div className="grid gap-2">
                        {Object.values(TOWN_PROJECTS).map(project => (
                          <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{project.emoji}</span>
                                <div>
                                  <div className="font-semibold text-xs">{project.name}</div>
                                  <div className="text-xs text-slate-600">{project.description}</div>
                                </div>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Progress: {project.progress}/{project.totalCost}🪙</span>
                                <span>Your part: {project.farmContribution}🪙</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (project.progress / project.totalCost) * 100)}%` }}
                                />
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full text-xs" 
                              disabled={coins < project.farmContribution || project.progress >= project.totalCost}
                              onClick={() => {
                                if (coins >= project.farmContribution) {
                                  setCoins(c => c - project.farmContribution);
                                  // Update project progress
                                  setTownProjects(prev => prev.map(p => 
                                    p.id === project.id 
                                      ? { ...p, progress: Math.min(p.totalCost, p.progress + project.farmContribution) }
                                      : p
                                  ));
                                  setFarmReputation(r => Math.min(100, r + 5));
                                  addNotification(`Contributed to ${project.name}! +5 reputation`, "success");
                                }
                              }}
                            >
                              {project.progress >= project.totalCost ? "✅ Completed" : 
                               coins < project.farmContribution ? "💰 Need more coins" : 
                               `💝 Contribute ${project.farmContribution}🪙`}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Irrigation Systems */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">💧 Irrigation Systems</div>
                      <div className="text-xs text-blue-600 mb-2">Automate watering and boost crop growth!</div>
                      <div className="grid gap-2">
                        {Object.values(IRRIGATION_SYSTEMS).map(system => (
                          <div key={system.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{system.emoji}</span>
                                <div>
                                  <div className="font-semibold text-xs">{system.name}</div>
                                  <div className="text-xs text-slate-600">{system.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-sm">{system.cost}🪙</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                              <Badge variant="outline">Coverage: {system.coverage} plots</Badge>
                              <Badge variant="outline">+{Math.round(system.growthBonus * 100)}% growth</Badge>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full text-xs" 
                              disabled={coins < system.cost}
                              onClick={() => {
                                if (coins >= system.cost) {
                                  setCoins(c => c - system.cost);
                                  setIrrigationSystems(prev => [...prev, {
                                    id: system.id + '_' + Date.now(),
                                    type: system.id,
                                    installedAt: nowSec()
                                  }]);
                                  addNotification(`${system.name} installed!`, "success");
                                }
                              }}
                            >
                              {coins < system.cost ? "💰 Need more coins" : `🛠️ Install ${system.cost}🪙`}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wildlife Ecosystem */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🦋 Wildlife Ecosystem</div>
                      <div className="text-xs text-green-600 mb-2">Attract beneficial wildlife to your farm!</div>
                      
                      {/* Wildlife Structures */}
                      <div className="grid gap-2">
                        {Object.values(WILDLIFE_TYPES).map(wildlife => (
                          <div key={wildlife.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{wildlife.emoji}</span>
                                <div>
                                  <div className="font-semibold text-xs">{wildlife.name}</div>
                                  <div className="text-xs text-slate-600">{wildlife.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-sm">{wildlife.cost}🪙</div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full text-xs" 
                              disabled={coins < wildlife.cost}
                              onClick={() => {
                                if (coins >= wildlife.cost) {
                                  setCoins(c => c - wildlife.cost);
                                  if (wildlife.id === 'fish_pond') {
                                    setFishPonds(prev => [...prev, {
                                      id: wildlife.id + '_' + Date.now(),
                                      type: wildlife.id,
                                      installedAt: nowSec(),
                                      lastFed: 0,
                                      fishCount: 0
                                    }]);
                                  } else {
                                    setWildlifeStructures(prev => [...prev, {
                                      id: wildlife.id + '_' + Date.now(),
                                      type: wildlife.id,
                                      installedAt: nowSec()
                                    }]);
                                  }
                                  addNotification(`${wildlife.name} built!`, "success");
                                }
                              }}
                            >
                              {coins < wildlife.cost ? "💰 Need more coins" : `🏗️ Build ${wildlife.cost}🪙`}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Active Fish Ponds */}
                      {fishPonds.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">🐟 Your Fish Ponds</div>
                          {fishPonds.map(pond => (
                            <div key={pond.id} className="bg-blue-50 rounded-lg p-2 border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🐟</span>
                                  <div className="text-xs">
                                    <div>Fish Pond</div>
                                    <div className="opacity-70">
                                      {pond.lastFed && nowSec() - pond.lastFed < 600 ? 
                                        `Fed ${Math.floor((nowSec() - pond.lastFed)/60)}m ago` : 
                                        "Needs feeding"
                                      }
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={() => {
                                    if (coins >= 5) {
                                      setCoins(c => c - 5);
                                      setFishPonds(prev => prev.map(p => 
                                        p.id === pond.id ? { ...p, lastFed: nowSec() } : p
                                      ));
                                      addNotification("Fish pond fed!", "success");
                                    }
                                  }}
                                  disabled={coins < 5}
                                >
                                  Feed (5🪙)
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Wild Animal Visits */}
                      {wildAnimalVisits.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">🦉 Wild Animal Visitors</div>
                          {wildAnimalVisits.map(visit => {
                            const animal = WILD_ANIMALS[visit.type];
                            const timeLeft = Math.max(0, visit.duration - (nowSec() - visit.appearedAt));
                            return (
                              <div key={visit.id} className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{animal?.emoji}</span>
                                    <div className="text-xs">
                                      <div className="font-semibold">{animal?.name}</div>
                                      <div className="opacity-70">{animal?.description}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-right">
                                    <div>Leaves in</div>
                                    <div className="font-semibold">{Math.floor(timeLeft/60)}m {timeLeft%60}s</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="customization" className="space-y-4">
                    <div className="text-sm text-pink-700 mb-2 p-2 bg-pink-50 rounded border border-pink-200">
                      🎨 Customize your farm's appearance and add decorative items!
                    </div>

                    {/* Farm Name */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🏠 Farm Name</div>
                      <div className="flex gap-2">
                        <Input
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          placeholder="Enter farm name"
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => addNotification(`Farm renamed to ${farmName}!`, "success")}>
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Farm Themes */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🎨 Farm Themes</div>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(FARM_THEMES).map(([themeId, theme]) => (
                          <Button
                            key={themeId}
                            onClick={() => {
                              setFarmTheme(themeId);
                              addNotification(`Theme changed to ${theme.name}!`, "success");
                            }}
                            variant={farmTheme === themeId ? "default" : "outline"}
                            className="w-full justify-between h-auto p-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{theme.buildings}</span>
                              <div className="text-left">
                                <div className="font-semibold">{theme.name}</div>
                                <div className="text-xs opacity-70">{theme.description}</div>
                              </div>
                            </div>
                            <div className="text-xs">
                              {farmTheme === themeId ? "✅ Active" : "Select"}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Decorations */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🏺 Decorations ({decorations.length}/10)</div>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(DECORATIONS).map(([decorationId, decoration]) => {
                          const isOwned = decorations.includes(decorationId);
                          return (
                            <Button
                              key={decorationId}
                              onClick={() => {
                                if (!isOwned) {
                                  if (coins >= decoration.price) {
                                    setCoins(prev => prev - decoration.price);
                                    setDecorations(prev => [...prev, decorationId]);
                                    addNotification(`Purchased ${decoration.name}!`, "success");
                                  } else {
                                    addNotification(`Need ${decoration.price} coins for ${decoration.name}`, "warning");
                                  }
                                }
                              }}
                              variant={isOwned ? "default" : "outline"}
                              className="w-full justify-between h-auto p-3"
                              disabled={isOwned || decorations.length >= 10}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{decoration.emoji || "🏺"}</span>
                                <div className="text-left">
                                  <div className="font-semibold">{decoration.name}</div>
                                  <div className="text-xs opacity-70">{decoration.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{isOwned ? "Owned" : `${decoration.price}🪙`}</div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Owned Decorations Display */}
                    {decorations.length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
                        <div className="text-sm font-semibold mb-2">Your Decorations</div>
                        <div className="flex flex-wrap gap-2">
                          {decorations.map(decorationId => {
                            const decoration = DECORATIONS[decorationId];
                            return (
                              <div key={decorationId} className="text-2xl" title={decoration.name}>
                                {decoration.emoji || "🏺"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Farm Level Progress */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">🌟 Farm Level {farmLevel}</div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(farmExperience % 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-center opacity-70">
                        {farmExperience % 100}/100 XP to next level
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

                    <Button
                      onClick={() => { if (coins >= (rules.compostTea?.shopPrice||10)) { setCoins(c=>c - (rules.compostTea?.shopPrice||10)); setSoilHealth(h=> Math.min(150, h+5)); addNotification("🫖 Applied compost tea! Soil +5.", "success"); }}}
                      variant="outline"
                      className="w-full justify-between h-auto p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🫖</span>
                        <div>
                          <div className="font-semibold">Compost Tea</div>
                          <div className="text-xs opacity-70">Boost soil health</div>
                        </div>
                      </div>
                      <div className="font-bold">{rules.compostTea?.shopPrice||10}🪙</div>
                    </Button>
                  </TabsContent>

                                    <TabsContent value="buildings" className="space-y-2">
                    {(() => {
                      const keys = ["research_lab", ...Object.keys(rules.buildings || {}).filter(k => k !== "research_lab")];
                      return keys.map(buildingType => {
                        const data = rules.buildings?.[buildingType];
                        if (!data) return null;
                        return (
                          <Button
                            key={buildingType}
                            onClick={() => buy(buildingType, 1)}
                            variant="outline"
                            className="w-full justify-between h-auto p-3"
                            disabled={coins < (data.price||0) || buildings[buildingType]}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{data.emoji || "🏗️"}</span>
                              <div className="text-left">
                                <div className="font-semibold">{data.name || buildingType}</div>
                                <div className="text-xs opacity-70">{data.description || ""}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{data.price || 0}🪙</div>
                              <div className="text-xs opacity-70">
                                {buildings[buildingType] ? "✅ Owned" : "Available"}
                              </div>
                            </div>
                          </Button>
                        );
                      });
                    })()}
                  </TabsContent>

                  <TabsContent value="multiplayer" className="space-y-4">
                    <Tabs value={currentView} onValueChange={setCurrentView}>
                      <TabsList className="flex flex-wrap w-full gap-1">
                        <TabsTrigger value="farm" className="text-xs px-2 py-1">🏠 Farm</TabsTrigger>
                        <TabsTrigger value="marketplace" className="text-xs px-2 py-1">🏪 Marketplace</TabsTrigger>
                        <TabsTrigger value="leaderboard" className="text-xs px-2 py-1">🏆 Leaderboard</TabsTrigger>
                      </TabsList>

                      <TabsContent value="farm" className="space-y-2">
                        <div className="text-sm font-semibold mb-2">🌐 Online Farmers</div>
                        <div className="space-y-2">
                          {players.filter(p => p.online).map(player => (
                            <div key={player.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${player.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                  <span className="font-semibold">{player.name}</span>
                                </div>
                                <div className="text-xs text-right">
                                  <div>Level {player.farmLevel} • {player.coins}🪙</div>
                                  <div>{player.crops} crops harvested</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="marketplace" className="space-y-2">
                        <div className="flex gap-2 mb-2">
                          <Button
                            onClick={() => {
                              const trade = {
                                id: Date.now(),
                                from: "You",
                                to: players.find(p => p.online && p.id !== "player1")?.name || "FarmerJoe",
                                item: "carrot",
                                quantity: 5,
                                price: 50,
                                status: "pending"
                              };
                              setTrades(prev => [...prev, trade]);
                              addNotification(`Trade offer sent to ${trade.to}!`, "success");
                            }}
                            className="flex-1 text-xs"
                          >
                            📤 Create Trade Offer
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {trades.map(trade => (
                            <div key={trade.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <div><strong>{trade.from}</strong> → <strong>{trade.to}</strong></div>
                                  <div>{trade.quantity}x {trade.item} for {trade.price}🪙</div>
                                </div>
                                <div className="flex gap-1">
                                  {trade.status === "pending" && (
                                    <>
                                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">✓ Accept</Button>
                                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">✗ Decline</Button>
                                    </>
                                  )}
                                  <Badge variant={trade.status === "completed" ? "success" : "secondary"} className="text-xs">
                                    {trade.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="leaderboard" className="space-y-2">
                        <Tabs value="coins" onValueChange={() => {}}>
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="coins">💰 Coins</TabsTrigger>
                            <TabsTrigger value="crops">🌾 Crops</TabsTrigger>
                            <TabsTrigger value="level">🏆 Level</TabsTrigger>
                          </TabsList>

                          {["coins", "crops", "level"].map(category => (
                            <TabsContent key={category} value={category} className="space-y-2">
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
                                <div className="text-sm font-semibold mb-2">🏆 {category.charAt(0).toUpperCase() + category.slice(1)} Leaderboard</div>
                                <div className="space-y-1">
                                  {leaderboards[category].slice(0, 10).map((player, index) => (
                                    <div key={player.id} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-yellow-500">#{index + 1}</span>
                                        <span>{player.name}</span>
                                      </div>
                                      <div className="font-semibold">
                                        {category === "coins" && `${player.coins}🪙`}
                                        {category === "crops" && `${player.crops} crops`}
                                        {category === "level" && `Level ${player.farmLevel}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </TabsContent>
                    </Tabs>
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
                          onClick={() => {
                            // Comprehensive feature test
                            console.log("🧪=== COMPREHENSIVE FEATURE TEST ===");

                            // Test 1: Basic Resources
                            console.log("💰 Coins:", coins);
                            console.log("🌱 Inventory:", inventory);
                            console.log("🏆 Level:", farmLevel, "XP:", farmExperience);

                            // Test 2: Buildings
                            console.log("🏗️ Buildings:", buildings);

                            // Test 3: Livestock
                            console.log("🐄 Livestock:", livestock.length, "animals");
                            if (livestock.length > 0) {
                              console.log("   - Sample animal:", livestock[0]);
                            }

                            // Test 4: Active Systems
                            console.log("🌤️ Current Weather:", weather.type);
                            console.log("🌸 Current Season:", currentSeason);
                            console.log("🎉 Active Event:", currentEvent);
                            console.log("🐝 Bee Happiness:", beeHappiness);

                            // Test 5: Plots Status
                            const plotStats = plots.reduce((acc, plot) => {
                              acc[plot.state] = (acc[plot.state] || 0) + 1;
                              return acc;
                            }, {});
                            console.log("📊 Plot Status:", plotStats);

                            // Test 6: Processing
                            console.log("🏭 Workshop Available:", !!buildings.workshop);
                            console.log("🥘 Processing Recipes:", Object.keys(rules.processing).length);

                            // Test 7: Business
                            console.log("💼 Reputation:", businessReputation);
                            console.log("🏦 Farm Debt:", farmDebt);
                            console.log("📋 Supply Contracts:", supplyContracts.length);

                            console.log("✅=== FEATURE TEST COMPLETE ===");
                            addNotification("✅ Feature test completed! Check console for details.", "success");
                          }}
                          className="w-full text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                        >
                          🧪 Test All Features
                        </Button>
                        <Button
                          onClick={() => {
                            // Quick start with balanced setup
                            setCoins(prev => prev + 200);
                            setInventory(prev => ({
                              ...prev,
                              carrot: (prev.carrot || 0) + 10,
                              lettuce: (prev.lettuce || 0) + 8,
                              fertilizer: (prev.fertilizer || 0) + 10,
                              pesticide: (prev.pesticide || 0) + 5,
                              fungicide: (prev.fungicide || 0) + 5
                            }));
                            addNotification("🎁 Quick start bonus added!", "success");
                          }}
                          className="w-full text-xs bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                        >
                          🎁 Quick Start Bonus
                        </Button>

                        <Button
                          onClick={clearSaveData}
                          className="w-full text-xs bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                        >
                          🗑️ Reset Game Data
                        </Button>

                        {/* NEW: Event testing buttons */}
                        <Button
                          onClick={() => startSeasonalEvent("harvest_festival")}
                          className="w-full text-xs bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        >
                          🎉 Test Harvest Festival
                        </Button>

                        <Button
                          onClick={() => startSeasonalEvent("spring_blossom")}
                          className="w-full text-xs bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          🌸 Test Spring Blossom
                        </Button>

                        <Button
                          onClick={() => startSeasonalEvent("weather_prediction_contest")}
                          className="w-full text-xs bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                        >
                          🌤️ Test Weather Contest
                        </Button>

                        <Button
                          onClick={() => startSeasonalEvent("summer_olympics")}
                          className="w-full text-xs bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                        >
                          🏅 Test Summer Olympics
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

                  <TabsContent value="research" className="space-y-2">
                    {!buildings.research_lab ? (
                      <div className="text-xs text-slate-600">
                        <div className="mb-2">Build a Research Lab to unlock hybridization and tech upgrades.</div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={coins < ((rules.buildings?.research_lab?.price)|| (DEFAULT_RULES.buildings.research_lab.price))}
                          onClick={() => {
                            const data = (rules.buildings && rules.buildings.research_lab) || DEFAULT_RULES.buildings.research_lab;
                            const price = data?.price || 0;
                            if (!buildings.research_lab && coins >= price) {
                              setCoins(c => Math.max(0, c - price));
                              setBuildings(prev => ({ ...prev, research_lab: true }));
                              // Ensure rules has the lab so Buildings tab shows it
                              if (!rules.buildings?.research_lab) {
                                setRules(r => ({ ...r, buildings: { ...r.buildings, research_lab: data } }));
                              }
                              addLog(`🏗️ Built ${data?.emoji || "🔬"} ${data?.name || "Research Lab"}!`);
                              addNotification(`Research Lab constructed!`, "success");
                            } else {
                              addNotification(`Need ${Math.max(0, price - coins)}🪙 to build Research Lab`, "warning");
                            }
                          }}
                        >
                          🔬 Build Research Lab ({(rules.buildings?.research_lab?.price) || (DEFAULT_RULES.buildings.research_lab.price)}🪙)
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">Lab Level</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Lv {researchLevel}</Badge>
                            <Button size="sm" variant="outline" disabled={coins < 150} onClick={()=>{ setCoins(c=>c-150); setResearchLevel(l=>l+1); addNotification("🔧 Lab upgraded!","success"); }}>Upgrade (150🪙)</Button>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold mb-1">Hybridization</div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.keys(rules.seeds).slice(0,4).map(seed => (
                              <div key={seed} className="bg-white/80 border rounded p-2">
                                <div className="flex items-center justify-between">
                                  <span className="capitalize">{seed}</span>
                                  <div className="flex items-center gap-1">
                                    <span>{hybrids[seed]?.traits?.map(t=>TRAITS[t].emoji).join("") || "—"}</span>
                                    <Button size="sm" variant="outline" onClick={()=>{
                                      const pool = Object.keys(TRAITS);
                                      const roll = () => pool[Math.floor(Math.random()*pool.length)];
                                      const traits = [roll(), roll()];
                                      if (researchLevel >= 2) traits.push(roll());
                                      setHybrids(prev => ({ ...prev, [seed]: { traits } }));
                                      addNotification(`🔁 Rerolled ${seed}: ${traits.map(t=>TRAITS[t].emoji).join("")}`,"success");
                                    }}>Reroll (20🪙)</Button>
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={()=>{
                                    setGeneBank(gb => gb.length < 3 ? [...gb, { seed, traits: hybrids[seed]?.traits||[] }] : gb);
                                    addNotification("📦 Saved to Gene Bank","success");
                                  }}>Save</Button>
                                  <Button size="sm" variant="outline" disabled={!geneBank.find(g=>g.seed===seed)} onClick={()=>{
                                    const entry = geneBank.find(g=>g.seed===seed);
                                    if (entry) setHybrids(prev => ({ ...prev, [seed]: { traits: entry.traits } }));
                                  }}>Restore</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] opacity-70">Lv2 labs unlock a third trait slot.</div>
                          <div className="mt-3">
                            <div className="font-semibold mb-1">Research Tree</div>
                            {['growth','value','weather','breeding'].map(key=> (
                              <div key={key} className="flex items-center justify-between mb-1">
                                <div className="capitalize">{key}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">Lv {researchTree[key]||0}</Badge>
                                  <Button size="sm" variant="outline" disabled={!!researchJob || coins < 100 || (researchTree[key]||0)>=3} onClick={()=>{ setCoins(c=>c-100); setResearchJob({ id:key, endsAt: nowSec()+60 }); addNotification('Research started (1m)','info'); }}>Start (100🪙)</Button>
                                </div>
                              </div>
                            ))}
                            {researchJob && (
                              <div className="text-xs space-y-1">
                                <div className="opacity-70">In progress: {researchJob.id} • {formatTimeRemaining(researchJob.endsAt, currentTime)}</div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${Math.min(100, Math.max(0, (1 - (researchJob.endsAt - currentTime) / 60) * 100))}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {getActiveSynergies().length>0 && (
                              <div className="mt-2 text-xs">
                                <div className="font-semibold">Synergies</div>
                                <div className="flex flex-wrap gap-1">{getActiveSynergies().map(s=> <Badge key={s.id} variant="outline">{s.label}</Badge>)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Inventory */}
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <div className="text-sm font-semibold mb-2">🌱 Selected Seed</div>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm"
                    value={selectedSeed}
                    onChange={(e) => setSelectedSeed(e.target.value)}
                  >
                    {Object.entries(rules.seeds).map(([seed, data]) => (
                      <option key={seed} value={seed}>
                        {(data.emoji || "🌱")} {seed} ({data.stages} stages, +{data.baseValue}🪙)
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 grid grid-cols-4 gap-1">
                    {Object.entries(rules.seeds).slice(0,8).map(([seed, data], idx) => (
                      <Button key={seed} size="sm" variant={selectedSeed===seed?"default":"outline"} className="text-xs" onClick={()=> setSelectedSeed(seed)} title={`Hotkey ${idx+1}`}>
                        {(data.emoji||"🌱")} {seed}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span>Auto‑replant harvested seed</span>
                  <Button size="sm" variant="outline" onClick={()=> setInventory(inv => ({ ...inv, autoReplant: !inv.autoReplant }))}>
                    {inventory.autoReplant ? "On" : "Off"}
                  </Button>
                </div>
+                <div className="mt-1 flex items-center justify-between text-xs">
+                  <span>Auto‑buy seeds when out</span>
+                  <Button size="sm" variant="outline" onClick={()=> setInventory(inv => ({ ...inv, autoBuySeeds: !inv.autoBuySeeds }))}>
+                    {inventory.autoBuySeeds ? "On" : "Off"}
+                  </Button>
+                </div>
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
                  <TabsList className="flex flex-wrap w-full gap-1">
                    {LEVELS.slice(0, 2).map(L => (
                      <TabsTrigger key={L.id} value={L.id} className="text-xs">
                        {L.id.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsList className="flex flex-wrap w-full gap-1 mt-2">
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

            {/* Deliveries Mini-game */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-blue-600">🚚</span>
                  Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>Van:</span>
                    <select className="border rounded px-2 py-1" value={selectedVanId} onChange={e=> setSelectedVanId(e.target.value)}>
                      {vans.map(v=> <option key={v.id} value={v.id}>{v.name} (Lv{v.level})</option>)}
                    </select>
                    <Button size="sm" variant="outline" onClick={()=>{
                      setVans(list => list.map(v => v.id===selectedVanId ? { ...v, level: v.level+1, capacity: v.capacity+5, decayBonus: Math.min(0.2, v.decayBonus+0.02) } : v));
                      addNotification('🚚 Van upgraded (+capacity, +decay bonus)','success');
                    }}>Upgrade Van</Button>
                  </div>
                  <div className="opacity-70">Active: {deliveries.filter(d=>d.status==='in_progress').length}</div>
                </div>
                <div className="flex gap-2">
                  {[{id:'local',label:'Local',time:60,cap:10,decay:0.0,premium:0.05},{id:'regional',label:'Regional',time:120,cap:20,decay:0.05,premium:0.1},{id:'long',label:'Long-haul',time:240,cap:30,decay:0.1,premium:0.2}].map(t => (
                    <Button key={t.id} size="sm" variant="outline" onClick={()=>{
                      // create a delivery using current storage mix
                      const items = Object.entries(storage);
                      if (items.length===0) { addNotification('Nothing in storage to deliver', 'warning'); return; }
                      const van = vans.find(v=> v.id===selectedVanId) || vans[0];
                      let count = 0; let payout = 0; const cap = t.cap + (buildings.delivery_van?10:0) + (van?.capacity||0) - 10; // base 10 already counted
                      items.slice(0).forEach(([seed,info])=>{
                        if (count>=cap) return;
                        const take = Math.min(info.count, cap-count);
                        const price = getMarketPrice(seed);
                        const dec = Math.max(0, t.decay - (van?.decayBonus||0));
                        const mult = (1 + t.premium + (rules.buildings?.delivery_van?.bonus||0)) * (1 - dec);
                        payout += Math.round(price * mult) * take;
                        count += take;
                      });
                      if (count<=0) { addNotification('Not enough goods to fill the van', 'warning'); return; }
                      setStorage(prev=>{
                        let left = cap; const next = {...prev};
                        for (const [seed,info] of Object.entries(prev)) {
                          if (left<=0) break; const take = Math.min(info.count, left);
                          next[seed] = { ...info, count: info.count - take };
                          if (next[seed].count<=0) delete next[seed];
                          left -= take;
                        }
                        return next;
                      });
                      const id = 'd_'+Date.now();
                      setDeliveries(d => [...d, { id, tier:t.id, count, payout, endsAt: nowSec()+t.time, status:'in_progress', vanId: van?.id }]);
                      addNotification(`Delivery started: ${t.label} (${count} items)`, 'success');
                    }}>{t.label}</Button>
                  ))}
                </div>
                <div className="space-y-1">
                  {deliveries.length===0 ? <div className="opacity-70">No active deliveries.</div> : deliveries.slice(-5).map(d => (
                    <div key={d.id} className="bg-white/80 border rounded p-2 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{d.tier}</div>
                        <div>Items: {d.count} • Payout: {d.payout}🪙</div>
                      </div>
                      <div>
                        {d.status==='in_progress' ? `ETA ${formatTimeRemaining(d.endsAt, currentTime)}` : (
                          <Button size="sm" onClick={()=>{ setCoins(c=>c+d.payout); setDeliveries(list=> list.map(x=> x.id===d.id ? { ...x, status:'paid' } : x)); setDeliveriesLeaderboard(lb=> [{ id:d.id, tier:d.tier, time: (d.endsAt - (d.startedAt||d.endsAt)), payout:d.payout, date: Date.now() }, ...lb].slice(0,10)); addNotification('Delivery paid out!', 'success'); }}>Claim</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {deliveriesLeaderboard.length>0 && (
                  <div className="mt-2">
                    <div className="font-semibold">Fastest Routes</div>
                    <div className="grid grid-cols-3 gap-1 opacity-80">
                      {deliveriesLeaderboard.map((r,i)=> (
                        <div key={i} className="bg-slate-50 border rounded p-1 flex items-center justify-between">
                          <span className="capitalize">{r.tier}</span>
                          <span>{formatTime(Math.max(0, r.time))}</span>
                          <span>{r.payout}🪙</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  ref={gridRef}
                  className="grid gap-4 p-2 relative"
                  style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                  <FlyingBees/>
                  {plots.map((p, i) => <PlotCard key={i} p={p} i={i} />)}
                  {isSelecting && selectionRect && (
                    <div
                      className="absolute border-2 border-emerald-400 bg-emerald-200/20 pointer-events-none"
                      style={{
                        left: Math.min(selectionRect.x1, selectionRect.x2),
                        top: Math.min(selectionRect.y1, selectionRect.y2),
                        width: Math.abs(selectionRect.x2 - selectionRect.x1),
                        height: Math.abs(selectionRect.y2 - selectionRect.y1)
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Visual Pasture under Field */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-700 text-xl">🐄</span>
                  Pasture ({livestock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {livestock.length === 0 ? (
                  <div className="text-xs opacity-70 p-2">No animals yet. Buy animals in the Animals tab, then they will appear here.</div>
                ) : (
                  <div className="grid gap-2 p-2" style={{ gridTemplateColumns: `repeat(${Math.min(4, pastureSize)}, minmax(0, 1fr))` }}>
                    {livestock.map(animal => {
                      const data = rules.livestock[animal.type] || {};
                      return (
                        <div key={animal.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{data.emoji || "🐾"}</span>
                            <div className="text-xs">
                              <div className="font-semibold">{data.name || animal.type}</div>
                              <div className="opacity-70">{Math.round(animal.happiness||0)}% happy</div>
                            </div>
                          </div>
                          <div className="text-xs text-right">
                            <div>Quality {Number(animal.quality||1).toFixed(1)}×</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
            <div>• <strong>Seasons:</strong> Each season lasts 2 minutes. Plant crops in their optimal season for +30% bonus!</div>
            <div>📊 <strong>Market:</strong> Crop prices fluctuate - watch for high demand (📈) to maximize profits</div>
            <div>🔥 <strong>Combos:</strong> Harvest crops quickly for combo multipliers and bonus coins</div>
            <div>⭐ <strong>Quality:</strong> 20% chance for high-quality crops worth extra coins</div>
            <div>🌧️ <strong>Weather:</strong> Rain boosts growth, drought increases withering, frost stops growth</div>
            <div>🧪 <strong>Fertilizer:</strong> Stacks up to {rules.fertilizer.maxStacks}x for maximum growth speed</div>
            <div>💧 <strong>Watering Can:</strong> Provides enhanced watering with growth bonuses</div>
            <div>🏆 <strong>Achievements:</strong> Complete farming milestones for coin rewards and bragging rights</div>
            <div className="mt-2 p-2 bg-emerald-50 rounded border-emerald-200 border">
              <strong>🎯 Current Season:</strong> {SEASON_EFFECTS[currentSeason]?.name || currentSeason} •
              <strong> Optimal Crops:</strong> {Object.entries(rules.seeds).filter(([,data]) => data.season === currentSeason).map(([,data]) => (data.emoji||"🌱")).join(" ")}
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
