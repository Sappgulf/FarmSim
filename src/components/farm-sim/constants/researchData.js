export const UNLOCK_NAMES = {
    premium_seeds: 'Premium Seeds',
    auto_irrigation: 'Auto Irrigation',
    resistant_crops: 'Pest-Resistant Crops',
    price_alerts: 'Price Alerts',
    trend_analysis: 'Trend Analysis',
    weather_immunity: 'Weather Immunity',
    fertility_boost: 'Fertility Boost',
    basic_automation: 'Basic Automation'
};

export const RESEARCH_NAMES = {
    hybrid_crops: 'Hybrid Crops',
    irrigation_system: 'Advanced Irrigation',
    pest_genetics: 'Pest Genetics',
    market_analytics: 'Market Analytics',
    climate_control: 'Climate Control',
    soil_enhancement: 'Soil Enhancement',
    automation_core: 'Automation Core'
};

export const RESEARCH_PROJECTS = {
    hybrid_crops: {
        id: 'hybrid_crops',
        name: "Hybrid Crops",
        emoji: "🧬",
        description: "Develop superior crop varieties",
        cost: 100,
        time: 300, // 5 minutes
        unlocks: ["premium_seeds"],
        prerequisites: [],
        category: "genetics",
        completed: false,
        progress: 0,
        started: false
    },
    irrigation_system: {
        id: 'irrigation_system',
        name: "Advanced Irrigation",
        emoji: "💧",
        description: "Automated watering systems",
        cost: 150,
        time: 480,
        unlocks: ["auto_irrigation"],
        prerequisites: ["hybrid_crops"],
        category: "technology",
        completed: false,
        progress: 0,
        started: false
    },
    pest_genetics: {
        id: 'pest_genetics',
        name: "Pest Genetics",
        emoji: "🧪",
        description: "Genetic pest resistance",
        cost: 200,
        time: 600,
        unlocks: ["resistant_crops"],
        prerequisites: ["hybrid_crops"],
        category: "genetics",
        completed: false,
        progress: 0,
        started: false
    },
    market_analytics: {
        id: 'market_analytics',
        name: "Market Analytics",
        emoji: "📊",
        description: "Advanced market prediction AI",
        cost: 250,
        time: 720,
        unlocks: ["price_alerts", "trend_analysis"],
        prerequisites: [],
        category: "economics",
        completed: false,
        progress: 0,
        started: false
    },
    climate_control: {
        id: 'climate_control',
        name: "Climate Control",
        emoji: "🌡️",
        description: "Weather-independent farming",
        cost: 400,
        time: 900,
        unlocks: ["weather_immunity"],
        prerequisites: ["irrigation_system", "pest_genetics"],
        category: "technology",
        completed: false,
        progress: 0,
        started: false
    },
    soil_enhancement: {
        id: 'soil_enhancement',
        name: "Soil Enhancement",
        emoji: "🌱",
        description: "Advanced soil fertility techniques",
        cost: 180,
        time: 540,
        unlocks: ["fertility_boost"],
        prerequisites: [],
        category: "agriculture",
        completed: false,
        progress: 0,
        started: false
    },
    automation_core: {
        id: 'automation_core',
        name: "Automation Core",
        emoji: "🤖",
        description: "Foundation for automated farming",
        cost: 300,
        time: 800,
        unlocks: ["basic_automation"],
        prerequisites: ["irrigation_system"],
        category: "technology",
        completed: false,
        progress: 0,
        started: false
    }
};
