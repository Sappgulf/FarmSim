/**
 * Advanced Economy and Market System
 * Complex supply/demand dynamics, futures trading, and economic events
 */

export const MARKET_TYPES = {
  local: {
    name: "Local Market",
    emoji: "🏪",
    volatility: 0.1,
    basePremium: 0,
    accessibility: 1.0,
    description: "Small-scale local trading with stable prices"
  },
  
  regional: {
    name: "Regional Market",
    emoji: "🏬",
    volatility: 0.2,
    basePremium: 0.1,
    accessibility: 0.8,
    description: "Medium-scale regional trading with moderate volatility"
  },
  
  national: {
    name: "National Market",
    emoji: "🏢",
    volatility: 0.3,
    basePremium: 0.2,
    accessibility: 0.6,
    description: "Large-scale national trading with higher volatility"
  },
  
  international: {
    name: "International Market",
    emoji: "🌍",
    volatility: 0.4,
    basePremium: 0.3,
    accessibility: 0.4,
    description: "Global trading with high volatility and premium prices"
  },
  
  luxury: {
    name: "Luxury Market",
    emoji: "💎",
    volatility: 0.5,
    basePremium: 0.5,
    accessibility: 0.2,
    description: "Premium market for high-value specialty products"
  }
};

export const ECONOMIC_EVENTS = {
  // === POSITIVE EVENTS ===
  economicBoom: {
    name: "Economic Boom",
    emoji: "📈",
    probability: 0.15,
    duration: 120, // 2 minutes
    effects: {
      demandIncrease: 1.3,
      priceIncrease: 1.2,
      marketAccess: 1.1
    },
    description: "Strong economic growth increases demand for all products"
  },
  
  harvestFestival: {
    name: "Harvest Festival",
    emoji: "🎉",
    probability: 0.1,
    duration: 60,
    effects: {
      localDemand: 1.5,
      priceIncrease: 1.3,
      reputation: 50
    },
    description: "Local celebration increases demand for fresh produce"
  },
  
  exportOpportunity: {
    name: "Export Opportunity",
    emoji: "🚢",
    probability: 0.08,
    duration: 180,
    effects: {
      internationalAccess: true,
      priceIncrease: 1.4,
      volumeBonus: 1.2
    },
    description: "International buyers are seeking your products"
  },
  
  // === NEGATIVE EVENTS ===
  recession: {
    name: "Economic Recession",
    emoji: "📉",
    probability: 0.12,
    duration: 240,
    effects: {
      demandDecrease: 0.7,
      priceDecrease: 0.8,
      marketAccess: 0.9
    },
    description: "Economic downturn reduces demand and prices"
  },
  
  drought: {
    name: "Regional Drought",
    emoji: "🏜️",
    probability: 0.1,
    duration: 300,
    effects: {
      supplyDecrease: 0.6,
      priceIncrease: 1.5,
      waterCost: 2.0
    },
    description: "Drought reduces supply and increases water costs"
  },
  
  pestOutbreak: {
    name: "Pest Outbreak",
    emoji: "🐛",
    probability: 0.15,
    duration: 180,
    effects: {
      yieldDecrease: 0.5,
      pesticideCost: 1.5,
      qualityDecrease: 0.8
    },
    description: "Pest outbreak damages crops and increases costs"
  },
  
  // === NEUTRAL EVENTS ===
  weatherChange: {
    name: "Weather Pattern Change",
    emoji: "🌤️",
    probability: 0.2,
    duration: 120,
    effects: {
      seasonalAdjustment: 1.2,
      cropRotation: 1.1
    },
    description: "Weather patterns shift, affecting different crops"
  },
  
  newRegulation: {
    name: "New Regulation",
    emoji: "📋",
    probability: 0.08,
    duration: 360,
    effects: {
      complianceCost: 1.2,
      marketAccess: 0.9,
      qualityRequirement: 1.1
    },
    description: "New regulations affect farming practices and market access"
  }
};

export const FUTURES_CONTRACTS = {
  // === CROP FUTURES ===
  wheatFutures: {
    name: "Wheat Futures",
    underlying: "wheat",
    contractSize: 100, // bushels
    tickSize: 0.25, // cents per bushel
    margin: 0.1, // 10% margin requirement
    expiration: 30, // days
    volatility: 0.3
  },
  
  cornFutures: {
    name: "Corn Futures",
    underlying: "corn",
    contractSize: 100,
    tickSize: 0.25,
    margin: 0.1,
    expiration: 30,
    volatility: 0.35
  },
  
  soybeanFutures: {
    name: "Soybean Futures",
    underlying: "soybean",
    contractSize: 100,
    tickSize: 0.25,
    margin: 0.1,
    expiration: 30,
    volatility: 0.4
  },
  
  // === LIVESTOCK FUTURES ===
  cattleFutures: {
    name: "Cattle Futures",
    underlying: "cattle",
    contractSize: 1, // head
    tickSize: 0.025, // cents per pound
    margin: 0.15,
    expiration: 60,
    volatility: 0.25
  },
  
  hogFutures: {
    name: "Hog Futures",
    underlying: "hogs",
    contractSize: 1,
    tickSize: 0.025,
    margin: 0.15,
    expiration: 45,
    volatility: 0.3
  },
  
  // === SPECIALTY FUTURES ===
  organicFutures: {
    name: "Organic Premium Futures",
    underlying: "organic",
    contractSize: 50,
    tickSize: 0.5,
    margin: 0.2,
    expiration: 45,
    volatility: 0.5
  }
};

export const SUPPLY_CHAIN = {
  // === SUPPLY CHAIN STAGES ===
  production: {
    name: "Production",
    description: "Growing and raising products",
    costs: ["seeds", "feed", "labor", "equipment"],
    time: 1,
    qualityFactors: ["soil", "weather", "care"]
  },
  
  processing: {
    name: "Processing",
    description: "Converting raw products to marketable goods",
    costs: ["processing", "packaging", "labor"],
    time: 0.5,
    qualityFactors: ["handling", "timing", "equipment"]
  },
  
  distribution: {
    name: "Distribution",
    description: "Transporting products to markets",
    costs: ["transportation", "storage", "handling"],
    time: 0.3,
    qualityFactors: ["speed", "temperature", "handling"]
  },
  
  retail: {
    name: "Retail",
    description: "Selling products to consumers",
    costs: ["marketing", "display", "labor"],
    time: 0.2,
    qualityFactors: ["presentation", "freshness", "service"]
  }
};

export const MARKET_DYNAMICS = {
  // === SUPPLY FACTORS ===
  supplyFactors: {
    weather: {
      name: "Weather Conditions",
      impact: 0.4,
      description: "Weather affects crop yields and quality"
    },
    
    seasonality: {
      name: "Seasonal Patterns",
      impact: 0.3,
      description: "Different crops have seasonal availability"
    },
    
    technology: {
      name: "Technology Adoption",
      impact: 0.2,
      description: "Advanced technology increases supply efficiency"
    },
    
    inputCosts: {
      name: "Input Costs",
      impact: 0.3,
      description: "Cost of seeds, fertilizer, and other inputs"
    }
  },
  
  // === DEMAND FACTORS ===
  demandFactors: {
    population: {
      name: "Population Growth",
      impact: 0.2,
      description: "Growing population increases food demand"
    },
    
    income: {
      name: "Income Levels",
      impact: 0.3,
      description: "Higher income increases demand for quality products"
    },
    
    preferences: {
      name: "Consumer Preferences",
      impact: 0.4,
      description: "Changing tastes affect demand for different products"
    },
    
    healthTrends: {
      name: "Health Trends",
      impact: 0.3,
      description: "Health consciousness affects product demand"
    }
  },
  
  // === PRICE MECHANICS ===
  priceMechanics: {
    elasticity: {
      name: "Price Elasticity",
      description: "How demand changes with price",
      range: [0.5, 2.0]
    },
    
    volatility: {
      name: "Price Volatility",
      description: "How much prices fluctuate",
      range: [0.1, 0.8]
    },
    
    seasonality: {
      name: "Seasonal Price Patterns",
      description: "Regular price changes throughout the year",
      amplitude: [0.1, 0.5]
    }
  }
};

export const TRADING_STRATEGIES = {
  // === BASIC STRATEGIES ===
  buyAndHold: {
    name: "Buy and Hold",
    description: "Purchase products and hold for long-term appreciation",
    risk: "medium",
    return: "medium",
    timeHorizon: "long",
    requirements: { capital: 1000, storage: true }
  },
  
  seasonalTrading: {
    name: "Seasonal Trading",
    description: "Buy low in harvest season, sell high in off-season",
    risk: "low",
    return: "medium",
    timeHorizon: "medium",
    requirements: { capital: 500, marketKnowledge: true }
  },
  
  arbitrage: {
    name: "Arbitrage Trading",
    description: "Exploit price differences between markets",
    risk: "low",
    return: "low",
    timeHorizon: "short",
    requirements: { capital: 2000, marketAccess: true }
  },
  
  // === ADVANCED STRATEGIES ===
  futuresHedging: {
    name: "Futures Hedging",
    description: "Use futures contracts to hedge price risk",
    risk: "medium",
    return: "medium",
    timeHorizon: "medium",
    requirements: { capital: 5000, futuresAccess: true }
  },
  
  optionsTrading: {
    name: "Options Trading",
    description: "Use options to limit downside risk",
    risk: "high",
    return: "high",
    timeHorizon: "short",
    requirements: { capital: 10000, optionsAccess: true }
  },
  
  algorithmicTrading: {
    name: "Algorithmic Trading",
    description: "Use algorithms to execute trades automatically",
    risk: "high",
    return: "high",
    timeHorizon: "short",
    requirements: { capital: 20000, technology: true }
  }
};

export const MARKET_INDICATORS = {
  // === TECHNICAL INDICATORS ===
  movingAverage: {
    name: "Moving Average",
    description: "Average price over a specific period",
    periods: [5, 10, 20, 50, 200],
    signals: ["trend", "support", "resistance"]
  },
  
  rsi: {
    name: "Relative Strength Index",
    description: "Measures overbought/oversold conditions",
    range: [0, 100],
    signals: ["overbought", "oversold", "divergence"]
  },
  
  macd: {
    name: "MACD",
    description: "Moving Average Convergence Divergence",
    components: ["macd", "signal", "histogram"],
    signals: ["crossover", "divergence", "momentum"]
  },
  
  // === FUNDAMENTAL INDICATORS ===
  supplyDemand: {
    name: "Supply and Demand",
    description: "Basic economic forces affecting prices",
    factors: ["production", "consumption", "inventory"],
    signals: ["surplus", "shortage", "equilibrium"]
  },
  
  weatherIndex: {
    name: "Weather Index",
    description: "Weather conditions affecting agriculture",
    factors: ["temperature", "precipitation", "drought"],
    signals: ["favorable", "adverse", "extreme"]
  },
  
  economicIndicators: {
    name: "Economic Indicators",
    description: "Broader economic factors",
    factors: ["gdp", "inflation", "employment"],
    signals: ["growth", "recession", "stability"]
  }
};

export const MARKET_REWARDS = {
  // === TRADING ACHIEVEMENTS ===
  firstTrade: {
    name: "First Trade",
    description: "Complete your first market transaction",
    reward: { coins: 100, experience: 50 }
  },
  
  profitableTrader: {
    name: "Profitable Trader",
    description: "Make a profit of 1000 coins from trading",
    reward: { coins: 500, experience: 200, unlock: "advancedTrading" }
  },
  
  marketMaker: {
    name: "Market Maker",
    description: "Complete 100 successful trades",
    reward: { coins: 1000, experience: 500, unlock: "marketMaker" }
  },
  
  futuresTrader: {
    name: "Futures Trader",
    description: "Complete 10 futures contracts",
    reward: { coins: 2000, experience: 1000, unlock: "optionsTrading" }
  },
  
  // === MARKET MASTERY ===
  supplyChainMaster: {
    name: "Supply Chain Master",
    description: "Optimize all supply chain stages",
    reward: { coins: 5000, experience: 2000, unlock: "logisticsOptimization" }
  },
  
  economicForecaster: {
    name: "Economic Forecaster",
    description: "Correctly predict 20 market movements",
    reward: { coins: 3000, experience: 1500, unlock: "predictiveAnalytics" }
  }
};

export const MARKET_RISKS = {
  // === PRICE RISKS ===
  priceRisk: {
    name: "Price Risk",
    description: "Risk of adverse price movements",
    mitigation: ["hedging", "diversification", "futures"],
    impact: "high"
  },
  
  // === CREDIT RISKS ===
  creditRisk: {
    name: "Credit Risk",
    description: "Risk of counterparty default",
    mitigation: ["creditChecks", "collateral", "insurance"],
    impact: "medium"
  },
  
  // === OPERATIONAL RISKS ===
  operationalRisk: {
    name: "Operational Risk",
    description: "Risk from operational failures",
    mitigation: ["backupSystems", "training", "procedures"],
    impact: "medium"
  },
  
  // === MARKET RISKS ===
  marketRisk: {
    name: "Market Risk",
    description: "Risk from market disruptions",
    mitigation: ["diversification", "liquidity", "monitoring"],
    impact: "high"
  }
};

export default MARKET_TYPES;
