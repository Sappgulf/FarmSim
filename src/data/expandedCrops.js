/**
 * Expanded Crop System - 50+ Crop Varieties
 * Each crop has unique mechanics, seasons, and special properties
 */

export const EXPANDED_CROPS = {
  // === BASIC CROPS ===
  carrot: {
    name: "Carrot",
    emoji: "🥕",
    price: 8,
    baseValue: 15,
    growthTime: 45,
    season: "spring",
    category: "vegetable",
    rarity: "common",
    description: "Fast-growing root vegetable perfect for beginners",
    specialProperties: {
      droughtResistant: 0.2,
      pestResistant: 0.1
    },
    qualityFactors: ["water", "fertilizer"],
    crossBreeding: ["parsnip", "radish"]
  },
  
  wheat: {
    name: "Wheat",
    emoji: "🌾",
    price: 12,
    baseValue: 25,
    growthTime: 60,
    season: "summer",
    category: "grain",
    rarity: "common",
    description: "Staple grain crop with high yield potential",
    specialProperties: {
      windPollinated: true,
      bulkHarvest: true
    },
    qualityFactors: ["soil", "weather"],
    crossBreeding: ["barley", "rye"]
  },

  // === PREMIUM CROPS ===
  truffle: {
    name: "Black Truffle",
    emoji: "🍄",
    price: 500,
    baseValue: 1000,
    growthTime: 720, // 12 hours
    season: "fall",
    category: "fungus",
    rarity: "legendary",
    description: "Rare underground fungus requiring specific tree roots",
    specialProperties: {
      underground: true,
      requiresTrees: ["oak", "hazelnut"],
      seasonal: true,
      qualityBonus: 0.5
    },
    qualityFactors: ["soil", "treeHealth", "season"],
    crossBreeding: []
  },

  saffron: {
    name: "Saffron",
    emoji: "🌺",
    price: 200,
    baseValue: 400,
    growthTime: 180,
    season: "fall",
    category: "spice",
    rarity: "epic",
    description: "Most expensive spice in the world, hand-harvested",
    specialProperties: {
      handHarvest: true,
      laborIntensive: true,
      exportValue: 2.0
    },
    qualityFactors: ["handling", "timing"],
    crossBreeding: ["crocus"]
  },

  // === TROPICAL CROPS ===
  dragonFruit: {
    name: "Dragon Fruit",
    emoji: "🐉",
    price: 80,
    baseValue: 150,
    growthTime: 300,
    season: "summer",
    category: "fruit",
    rarity: "rare",
    description: "Exotic cactus fruit with vibrant colors",
    specialProperties: {
      tropical: true,
      requiresHeat: 25,
      nightBlooming: true
    },
    qualityFactors: ["temperature", "humidity"],
    crossBreeding: ["pitaya"]
  },

  vanilla: {
    name: "Vanilla Bean",
    emoji: "🌿",
    price: 150,
    baseValue: 300,
    growthTime: 480,
    season: "summer",
    category: "spice",
    rarity: "epic",
    description: "Orchid vine producing the world's most popular flavoring",
    specialProperties: {
      vine: true,
      requiresPollination: true,
      curingTime: 120
    },
    qualityFactors: ["pollination", "curing"],
    crossBreeding: []
  },

  // === ANCIENT GRAINS ===
  quinoa: {
    name: "Quinoa",
    emoji: "🌾",
    price: 25,
    baseValue: 50,
    growthTime: 90,
    season: "summer",
    category: "grain",
    rarity: "uncommon",
    description: "Ancient superfood grain from the Andes",
    specialProperties: {
      altitudePreference: true,
      completeProtein: true,
      droughtResistant: 0.4
    },
    qualityFactors: ["altitude", "soil"],
    crossBreeding: ["amaranth"]
  },

  amaranth: {
    name: "Amaranth",
    emoji: "🌿",
    price: 20,
    baseValue: 40,
    growthTime: 75,
    season: "summer",
    category: "grain",
    rarity: "uncommon",
    description: "Ancient grain with exceptional nutritional value",
    specialProperties: {
      heatTolerant: true,
      selfSeeding: true,
      completeProtein: true
    },
    qualityFactors: ["heat", "soil"],
    crossBreeding: ["quinoa"]
  },

  // === MEDICINAL PLANTS ===
  ginseng: {
    name: "Ginseng",
    emoji: "🌿",
    price: 300,
    baseValue: 600,
    growthTime: 1080, // 18 hours
    season: "fall",
    category: "herb",
    rarity: "legendary",
    description: "Slow-growing medicinal root with incredible value",
    specialProperties: {
      slowGrowing: true,
      ageValue: true,
      medicinal: true,
      forestFloor: true
    },
    qualityFactors: ["age", "shade", "soil"],
    crossBreeding: []
  },

  echinacea: {
    name: "Echinacea",
    emoji: "🌸",
    price: 40,
    baseValue: 80,
    growthTime: 120,
    season: "summer",
    category: "herb",
    rarity: "uncommon",
    description: "Purple coneflower with immune-boosting properties",
    specialProperties: {
      perennial: true,
      attractsBees: true,
      medicinal: true
    },
    qualityFactors: ["pollination", "soil"],
    crossBreeding: ["purpleConeflower"]
  },

  // === EXOTIC FRUITS ===
  durian: {
    name: "Durian",
    emoji: "🌰",
    price: 100,
    baseValue: 200,
    growthTime: 360,
    season: "summer",
    category: "fruit",
    rarity: "rare",
    description: "King of fruits with controversial aroma",
    specialProperties: {
      tropical: true,
      strongOdor: true,
      seasonal: true,
      exportValue: 1.5
    },
    qualityFactors: ["ripeness", "handling"],
    crossBreeding: []
  },

  mangosteen: {
    name: "Mangosteen",
    emoji: "🍇",
    price: 120,
    baseValue: 240,
    growthTime: 420,
    season: "summer",
    category: "fruit",
    rarity: "rare",
    description: "Queen of fruits with sweet, tangy flavor",
    specialProperties: {
      tropical: true,
      delicate: true,
      shortShelfLife: true
    },
    qualityFactors: ["handling", "timing"],
    crossBreeding: []
  },

  // === NUTS ===
  macadamia: {
    name: "Macadamia Nut",
    emoji: "🥜",
    price: 60,
    baseValue: 120,
    growthTime: 240,
    season: "fall",
    category: "nut",
    rarity: "uncommon",
    description: "Creamy, buttery nut from Australia",
    specialProperties: {
      tree: true,
      longTerm: true,
      highOil: true
    },
    qualityFactors: ["treeAge", "climate"],
    crossBreeding: []
  },

  pistachio: {
    name: "Pistachio",
    emoji: "🥜",
    price: 45,
    baseValue: 90,
    growthTime: 180,
    season: "fall",
    category: "nut",
    rarity: "uncommon",
    description: "Green nut that splits naturally when ripe",
    specialProperties: {
      tree: true,
      splitsNaturally: true,
      droughtTolerant: 0.3
    },
    qualityFactors: ["ripeness", "climate"],
    crossBreeding: []
  },

  // === SPICES ===
  cardamom: {
    name: "Cardamom",
    emoji: "🌿",
    price: 80,
    baseValue: 160,
    growthTime: 200,
    season: "summer",
    category: "spice",
    rarity: "rare",
    description: "Aromatic spice pods from tropical regions",
    specialProperties: {
      tropical: true,
      podHarvest: true,
      aromatic: true
    },
    qualityFactors: ["ripeness", "drying"],
    crossBreeding: []
  },

  starAnise: {
    name: "Star Anise",
    emoji: "⭐",
    price: 70,
    baseValue: 140,
    growthTime: 160,
    season: "fall",
    category: "spice",
    rarity: "rare",
    description: "Star-shaped spice with licorice flavor",
    specialProperties: {
      tropical: true,
      starShaped: true,
      aromatic: true
    },
    qualityFactors: ["ripeness", "drying"],
    crossBreeding: []
  },

  // === LEGUMES ===
  chickpea: {
    name: "Chickpea",
    emoji: "🫘",
    price: 15,
    baseValue: 30,
    growthTime: 100,
    season: "spring",
    category: "legume",
    rarity: "common",
    description: "Protein-rich legume with many culinary uses",
    specialProperties: {
      nitrogenFixing: true,
      droughtResistant: 0.3,
      proteinRich: true
    },
    qualityFactors: ["soil", "water"],
    crossBreeding: ["lentil"]
  },

  lentil: {
    name: "Lentil",
    emoji: "🫘",
    price: 12,
    baseValue: 24,
    growthTime: 80,
    season: "spring",
    category: "legume",
    rarity: "common",
    description: "Small but mighty protein source",
    specialProperties: {
      nitrogenFixing: true,
      fastGrowing: true,
      proteinRich: true
    },
    qualityFactors: ["soil", "timing"],
    crossBreeding: ["chickpea"]
  },

  // === ROOT VEGETABLES ===
  parsnip: {
    name: "Parsnip",
    emoji: "🥕",
    price: 18,
    baseValue: 35,
    growthTime: 90,
    season: "fall",
    category: "vegetable",
    rarity: "uncommon",
    description: "Sweet root vegetable that improves with frost",
    specialProperties: {
      frostSweetening: true,
      winterHarvest: true,
      storageFriendly: true
    },
    qualityFactors: ["frost", "soil"],
    crossBreeding: ["carrot"]
  },

  rutabaga: {
    name: "Rutabaga",
    emoji: "🥬",
    price: 16,
    baseValue: 32,
    growthTime: 110,
    season: "fall",
    category: "vegetable",
    rarity: "uncommon",
    description: "Hardy root vegetable perfect for winter storage",
    specialProperties: {
      winterHardy: true,
      storageFriendly: true,
      coldSweetening: true
    },
    qualityFactors: ["cold", "soil"],
    crossBreeding: ["turnip"]
  },

  // === LEAFY GREENS ===
  kale: {
    name: "Kale",
    emoji: "🥬",
    price: 14,
    baseValue: 28,
    growthTime: 50,
    season: "fall",
    category: "vegetable",
    rarity: "common",
    description: "Superfood green that thrives in cool weather",
    specialProperties: {
      coldTolerant: true,
      cutAndComeAgain: true,
      nutrientDense: true
    },
    qualityFactors: ["cold", "soil"],
    crossBreeding: ["cabbage"]
  },

  arugula: {
    name: "Arugula",
    emoji: "🌿",
    price: 20,
    baseValue: 40,
    growthTime: 30,
    season: "spring",
    category: "vegetable",
    rarity: "uncommon",
    description: "Peppery green that grows quickly",
    specialProperties: {
      fastGrowing: true,
      peppery: true,
      cutAndComeAgain: true
    },
    qualityFactors: ["timing", "soil"],
    crossBreeding: ["mustard"]
  },

  // === FLOWERS ===
  lavender: {
    name: "Lavender",
    emoji: "💜",
    price: 35,
    baseValue: 70,
    growthTime: 120,
    season: "summer",
    category: "herb",
    rarity: "uncommon",
    description: "Aromatic herb with calming properties",
    specialProperties: {
      perennial: true,
      aromatic: true,
      attractsBees: true,
      droughtResistant: 0.4
    },
    qualityFactors: ["drainage", "sun"],
    crossBreeding: []
  },

  chamomile: {
    name: "Chamomile",
    emoji: "🌼",
    price: 25,
    baseValue: 50,
    growthTime: 60,
    season: "summer",
    category: "herb",
    rarity: "common",
    description: "Gentle herb perfect for tea",
    specialProperties: {
      selfSeeding: true,
      tea: true,
      calming: true
    },
    qualityFactors: ["soil", "timing"],
    crossBreeding: []
  },

  // === TUBERS ===
  yam: {
    name: "Yam",
    emoji: "🍠",
    price: 22,
    baseValue: 44,
    growthTime: 150,
    season: "summer",
    category: "vegetable",
    rarity: "uncommon",
    description: "Sweet tuber from tropical regions",
    specialProperties: {
      tropical: true,
      climbing: true,
      storageFriendly: true
    },
    qualityFactors: ["heat", "soil"],
    crossBreeding: ["sweetPotato"]
  },

  taro: {
    name: "Taro",
    emoji: "🍠",
    price: 28,
    baseValue: 56,
    growthTime: 180,
    season: "summer",
    category: "vegetable",
    rarity: "uncommon",
    description: "Starchy root vegetable with large leaves",
    specialProperties: {
      tropical: true,
      waterLoving: true,
      largeLeaves: true
    },
    qualityFactors: ["water", "heat"],
    crossBreeding: []
  },

  // === CITRUS ===
  yuzu: {
    name: "Yuzu",
    emoji: "🍋",
    price: 90,
    baseValue: 180,
    growthTime: 300,
    season: "winter",
    category: "fruit",
    rarity: "rare",
    description: "Japanese citrus with unique flavor",
    specialProperties: {
      citrus: true,
      coldHardy: true,
      aromatic: true
    },
    qualityFactors: ["cold", "soil"],
    crossBreeding: ["lemon"]
  },

  kumquat: {
    name: "Kumquat",
    emoji: "🍊",
    price: 50,
    baseValue: 100,
    growthTime: 200,
    season: "winter",
    category: "fruit",
    rarity: "uncommon",
    description: "Small citrus fruit eaten whole",
    specialProperties: {
      citrus: true,
      edibleSkin: true,
      ornamental: true
    },
    qualityFactors: ["soil", "climate"],
    crossBreeding: ["orange"]
  },

  // === BERRIES ===
  gojiBerry: {
    name: "Goji Berry",
    emoji: "🍒",
    price: 40,
    baseValue: 80,
    growthTime: 120,
    season: "summer",
    category: "fruit",
    rarity: "uncommon",
    description: "Superfood berry with antioxidant properties",
    specialProperties: {
      superfood: true,
      droughtResistant: 0.3,
      perennial: true
    },
    qualityFactors: ["drainage", "sun"],
    crossBreeding: []
  },

  elderberry: {
    name: "Elderberry",
    emoji: "🫐",
    price: 35,
    baseValue: 70,
    growthTime: 100,
    season: "summer",
    category: "fruit",
    rarity: "uncommon",
    description: "Medicinal berry with immune-boosting properties",
    specialProperties: {
      medicinal: true,
      shrub: true,
      attractsBirds: true
    },
    qualityFactors: ["soil", "pollination"],
    crossBreeding: []
  },

  // === GOURDS ===
  bottleGourd: {
    name: "Bottle Gourd",
    emoji: "🥒",
    price: 30,
    baseValue: 60,
    growthTime: 120,
    season: "summer",
    category: "vegetable",
    rarity: "uncommon",
    description: "Versatile gourd used for containers and food",
    specialProperties: {
      climbing: true,
      versatile: true,
      storageFriendly: true
    },
    qualityFactors: ["support", "soil"],
    crossBreeding: ["cucumber"]
  },

  bitterMelon: {
    name: "Bitter Melon",
    emoji: "🥒",
    price: 25,
    baseValue: 50,
    growthTime: 100,
    season: "summer",
    category: "vegetable",
    rarity: "uncommon",
    description: "Bitter gourd with medicinal properties",
    specialProperties: {
      climbing: true,
      bitter: true,
      medicinal: true
    },
    qualityFactors: ["support", "timing"],
    crossBreeding: ["cucumber"]
  },

  // === SPECIALTY CROPS ===
  wasabi: {
    name: "Wasabi",
    emoji: "🌿",
    price: 200,
    baseValue: 400,
    growthTime: 240,
    season: "spring",
    category: "herb",
    rarity: "epic",
    description: "Pungent Japanese horseradish requiring perfect conditions",
    specialProperties: {
      waterGrown: true,
      pungent: true,
          shortShelfLife: true,
      laborIntensive: true
    },
    qualityFactors: ["water", "temperature"],
    crossBreeding: []
  },

  lotus: {
    name: "Lotus",
    emoji: "🪷",
    price: 60,
    baseValue: 120,
    growthTime: 150,
    season: "summer",
    category: "aquatic",
    rarity: "rare",
    description: "Sacred aquatic plant with edible seeds and roots",
    specialProperties: {
      aquatic: true,
      sacred: true,
      edibleSeeds: true,
      ornamental: true
    },
    qualityFactors: ["water", "depth"],
    crossBreeding: []
  },

  // === MUSHROOMS ===
  shiitake: {
    name: "Shiitake",
    emoji: "🍄",
    price: 45,
    baseValue: 90,
    growthTime: 90,
    season: "fall",
    category: "fungus",
    rarity: "uncommon",
    description: "Premium mushroom grown on hardwood logs",
    specialProperties: {
      logGrown: true,
      umami: true,
      medicinal: true
    },
    qualityFactors: ["logType", "humidity"],
    crossBreeding: []
  },

  oysterMushroom: {
    name: "Oyster Mushroom",
    emoji: "🍄",
    price: 30,
    baseValue: 60,
    growthTime: 60,
    season: "fall",
    category: "fungus",
    rarity: "common",
    description: "Fast-growing mushroom with delicate flavor",
    specialProperties: {
      fastGrowing: true,
      versatile: true,
      easyGrowing: true
    },
    qualityFactors: ["substrate", "humidity"],
    crossBreeding: []
  },

  // === GRAINS ===
  teff: {
    name: "Teff",
    emoji: "🌾",
    price: 35,
    baseValue: 70,
    growthTime: 80,
    season: "summer",
    category: "grain",
    rarity: "uncommon",
    description: "Tiny grain from Ethiopia with high nutrition",
    specialProperties: {
      tinyGrain: true,
      glutenFree: true,
      droughtResistant: 0.5
    },
    qualityFactors: ["soil", "drainage"],
    crossBreeding: []
  },

  buckwheat: {
    name: "Buckwheat",
    emoji: "🌾",
    price: 28,
    baseValue: 56,
    growthTime: 70,
    season: "summer",
    category: "grain",
    rarity: "uncommon",
    description: "Pseudo-grain that's actually a fruit seed",
    specialProperties: {
      pseudoGrain: true,
      glutenFree: true,
      fastGrowing: true
    },
    qualityFactors: ["soil", "timing"],
    crossBreeding: []
  },

  // === LEGENDARY CROPS ===
  goldenRice: {
    name: "Golden Rice",
    emoji: "🌾",
    price: 1000,
    baseValue: 2000,
    growthTime: 120,
    season: "summer",
    category: "grain",
    rarity: "legendary",
    description: "Genetically enhanced rice with vitamin A",
    specialProperties: {
      geneticallyEnhanced: true,
      vitaminA: true,
      humanitarian: true,
      researchRequired: true
    },
    qualityFactors: ["research", "soil"],
    crossBreeding: []
  },

  moonflower: {
    name: "Moonflower",
    emoji: "🌙",
    price: 500,
    baseValue: 1000,
    growthTime: 180,
    season: "summer",
    category: "flower",
    rarity: "legendary",
    description: "Mystical flower that blooms only at night",
    specialProperties: {
      nightBlooming: true,
      mystical: true,
      rare: true,
      lunarCycle: true
    },
    qualityFactors: ["lunarCycle", "moonlight"],
    crossBreeding: []
  }
};

// Crop categories for organization
export const CROP_CATEGORIES = {
  vegetable: { name: "Vegetables", emoji: "🥕", color: "text-green-600" },
  fruit: { name: "Fruits", emoji: "🍎", color: "text-red-600" },
  grain: { name: "Grains", emoji: "🌾", color: "text-yellow-600" },
  herb: { name: "Herbs", emoji: "🌿", color: "text-emerald-600" },
  spice: { name: "Spices", emoji: "🌶️", color: "text-orange-600" },
  nut: { name: "Nuts", emoji: "🥜", color: "text-amber-600" },
  legume: { name: "Legumes", emoji: "🫘", color: "text-brown-600" },
  fungus: { name: "Mushrooms", emoji: "🍄", color: "text-purple-600" },
  aquatic: { name: "Aquatic", emoji: "🪷", color: "text-blue-600" },
  flower: { name: "Flowers", emoji: "🌸", color: "text-pink-600" }
};

// Rarity levels
export const CROP_RARITY = {
  common: { name: "Common", color: "text-gray-600", multiplier: 1.0 },
  uncommon: { name: "Uncommon", color: "text-green-600", multiplier: 1.2 },
  rare: { name: "Rare", color: "text-blue-600", multiplier: 1.5 },
  epic: { name: "Epic", color: "text-purple-600", multiplier: 2.0 },
  legendary: { name: "Legendary", color: "text-yellow-600", multiplier: 3.0 }
};

// Seasonal requirements
export const SEASONAL_REQUIREMENTS = {
  spring: {
    crops: ["carrot", "chickpea", "lentil", "arugula", "wasabi"],
    temperature: [10, 20],
    humidity: [60, 80]
  },
  summer: {
    crops: ["wheat", "dragonFruit", "vanilla", "quinoa", "amaranth", "echinacea", "durian", "mangosteen", "cardamom", "gojiBerry", "elderberry", "bottleGourd", "bitterMelon", "lotus", "teff", "buckwheat", "goldenRice", "moonflower"],
    temperature: [20, 35],
    humidity: [50, 70]
  },
  fall: {
    crops: ["truffle", "saffron", "ginseng", "macadamia", "pistachio", "starAnise", "parsnip", "rutabaga", "kale", "lavender", "shiitake", "oysterMushroom"],
    temperature: [5, 20],
    humidity: [65, 85]
  },
  winter: {
    crops: ["yuzu", "kumquat"],
    temperature: [0, 15],
    humidity: [70, 90]
  }
};

// Cross-breeding combinations
export const CROSS_BREEDING = {
  "carrot + parsnip": "rainbowCarrot",
  "wheat + barley": "triticale",
  "quinoa + amaranth": "superGrain",
  "chickpea + lentil": "proteinLegume",
  "kale + cabbage": "kaleCabbage",
  "arugula + mustard": "spicyGreen",
  "yam + sweetPotato": "tropicalTuber",
  "yuzu + lemon": "citrusHybrid",
  "kumquat + orange": "citrusGold"
};

export default EXPANDED_CROPS;
