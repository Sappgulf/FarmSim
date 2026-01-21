/**
 * Buildings & Infrastructure Data Module
 */

export const BUILDINGS = {
  barn: {
    price: 200,
    emoji: "🏚️",
    name: "Barn",
    description: "Stores crops and provides +20% harvest value",
    effect: "storage",
    bonus: 0.2,
    category: "storage"
  },
  greenhouse: {
    price: 350,
    emoji: "🏡",
    name: "Greenhouse",
    description: "All crops grow 50% faster regardless of weather",
    effect: "growth",
    bonus: 0.5,
    category: "production"
  },
  silo: {
    price: 150,
    emoji: "🗼",
    name: "Silo",
    description: "Automatically sells crops when storage is full",
    effect: "auto_sell",
    bonus: 1,
    category: "storage"
  },
  workshop: {
    price: 500,
    emoji: "🏭",
    name: "Workshop",
    description: "Enables crop processing into valuable products",
    effect: "processing",
    bonus: 1,
    category: "production"
  },
  windmill: {
    price: 400,
    emoji: "🌪️",
    name: "Windmill",
    description: "Generates +5 coins per minute passively",
    effect: "income",
    bonus: 5,
    category: "income"
  },
  beehive: {
    price: 250,
    emoji: "🐝",
    name: "Beehive",
    description: "Bees pollinate crops for +25% yield and produce honey",
    effect: "pollination",
    bonus: 0.25,
    category: "production"
  },
  well: {
    price: 180,
    emoji: "🪣",
    name: "Well",
    description: "Automatic watering for adjacent plots",
    effect: "water",
    bonus: 1,
    category: "utility"
  },
  compost: {
    price: 120,
    emoji: "♻️",
    name: "Compost Bin",
    description: "Converts waste to fertilizer automatically",
    effect: "fertilizer",
    bonus: 1,
    category: "utility"
  }
};

export const LIVESTOCK = {
  chicken: {
    price: 80,
    emoji: "🐔",
    name: "Chicken",
    description: "Produces eggs every 2 minutes",
    product: "egg",
    productEmoji: "🥚",
    interval: 120,
    value: 8,
    maxCount: 10
  },
  cow: {
    price: 200,
    emoji: "🐄",
    name: "Cow",
    description: "Produces milk every 5 minutes",
    product: "milk",
    productEmoji: "🥛",
    interval: 300,
    value: 25,
    maxCount: 5
  },
  pig: {
    price: 150,
    emoji: "🐷",
    name: "Pig",
    description: "Finds truffles every 10 minutes",
    product: "truffle",
    productEmoji: "🍄",
    interval: 600,
    value: 45,
    maxCount: 5
  },
  sheep: {
    price: 120,
    emoji: "🐑",
    name: "Sheep",
    description: "Produces wool every 8 minutes",
    product: "wool",
    productEmoji: "🧶",
    interval: 480,
    value: 35,
    maxCount: 8
  },
};

export const PROCESSING_RECIPES = {
  carrot: { output: "carrot_juice", emoji: "🥤", multiplier: 2.5, name: "Carrot Juice", time: 30 },
  corn: { output: "popcorn", emoji: "🍿", multiplier: 3.0, name: "Popcorn", time: 45 },
  tomato: { output: "tomato_sauce", emoji: "🥫", multiplier: 2.8, name: "Tomato Sauce", time: 40 },
  strawberry: { output: "jam", emoji: "🍓", multiplier: 4.0, name: "Strawberry Jam", time: 60 },
  pumpkin: { output: "pumpkin_pie", emoji: "🥧", multiplier: 4.5, name: "Pumpkin Pie", time: 90 },
  sunflower: { output: "sunflower_oil", emoji: "🫒", multiplier: 3.2, name: "Sunflower Oil", time: 75 },
  potato: { output: "fries", emoji: "🍟", multiplier: 2.2, name: "French Fries", time: 25 },
  milk: { output: "cheese", emoji: "🧀", multiplier: 3.5, name: "Cheese", time: 120 },
  egg: { output: "omelette", emoji: "🍳", multiplier: 2.0, name: "Omelette", time: 20 },
};

export const BREEDING_RECIPES = {
  super_carrot: {
    name: "Super Carrot",
    emoji: "🥕✨",
    parents: ["carrot", "carrot"],
    minQuantity: 5,
    growthTime: 45,
    baseValue: 25,
    quality: 1.5,
    description: "Enhanced carrot with faster growth",
    traits: ["fast_growth", "high_value"],
    unlockLevel: 2,
    successRate: 0.7
  },
  rainbow_corn: {
    name: "Rainbow Corn",
    emoji: "🌽🌈",
    parents: ["corn", "sunflower"],
    minQuantity: 3,
    growthTime: 70,
    baseValue: 45,
    quality: 2.0,
    description: "Colorful hybrid with premium appeal",
    traits: ["premium_quality", "weather_resistant"],
    unlockLevel: 3,
    successRate: 0.5
  },
  golden_tomato: {
    name: "Golden Tomato",
    emoji: "🍅✨",
    parents: ["tomato", "sunflower"],
    minQuantity: 3,
    growthTime: 55,
    baseValue: 35,
    quality: 1.8,
    description: "Luxurious golden tomato",
    traits: ["luxury_appeal", "disease_resistant"],
    unlockLevel: 3,
    successRate: 0.6
  },
  frost_potato: {
    name: "Frost Potato",
    emoji: "🥔❄️",
    parents: ["potato", "lettuce"],
    minQuantity: 4,
    growthTime: 40,
    baseValue: 20,
    quality: 1.3,
    description: "Cold-resistant potato",
    traits: ["frost_resistant", "winter_bonus"],
    unlockLevel: 4,
    successRate: 0.65
  },
  dragon_pepper: {
    name: "Dragon Pepper",
    emoji: "🌶️🔥",
    parents: ["bellPepper", "tomato"],
    minQuantity: 5,
    growthTime: 90,
    baseValue: 80,
    quality: 3.0,
    description: "Legendary spicy pepper",
    traits: ["legendary", "pest_repellent", "high_value"],
    unlockLevel: 5,
    successRate: 0.3
  }
};

export const PETS = {
  dog: {
    name: "Farm Dog",
    emoji: "🐕",
    cost: 200,
    description: "Protects farm and detects pests early",
    bonuses: {
      pest_prevention: 0.3,
      theft_protection: 0.5,
      happiness_boost: 0.1
    },
    needs: ["food", "play", "health"]
  },
  cat: {
    name: "Farm Cat",
    emoji: "🐱",
    cost: 150,
    description: "Hunts pests and improves crop quality",
    bonuses: {
      pest_elimination: 0.4,
      crop_quality: 0.15,
      luck_boost: 0.05
    },
    needs: ["food", "play", "health"]
  },
  chicken_pet: {
    name: "Pet Chicken",
    emoji: "🐔",
    cost: 100,
    description: "Produces eggs and natural fertilizer",
    bonuses: {
      daily_eggs: 2,
      pest_reduction: 0.2,
      fertilizer_production: 1
    },
    needs: ["food", "shelter"]
  }
};

export const BUILDING_CATEGORIES = {
  storage: { name: "Storage", emoji: "📦", color: "bg-amber-100" },
  production: { name: "Production", emoji: "⚙️", color: "bg-blue-100" },
  income: { name: "Income", emoji: "💰", color: "bg-green-100" },
  utility: { name: "Utility", emoji: "🔧", color: "bg-gray-100" },
};
