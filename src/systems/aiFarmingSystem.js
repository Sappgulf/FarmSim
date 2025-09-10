/**
 * AI Farming & Automation System
 * Advanced autonomous farming with AI-powered decision making
 */

// AI Bot Types with different capabilities
export const AI_BOTS = {
  seedBot: {
    id: 'seedBot',
    name: 'AI Seed Bot',
    emoji: '🤖',
    description: 'Automatically plants optimal crops based on market conditions',
    cost: 15000,
    unlockLevel: 15,
    energyConsumption: 25,
    capabilities: ['auto_plant', 'crop_optimization', 'market_analysis'],
    efficiency: 1.2, // 20% faster than manual
    aiLevel: 1,
    maxLevel: 5,
    upgrades: {
      2: { cost: 8000, newCapability: 'seasonal_optimization' },
      3: { cost: 12000, newCapability: 'genetic_selection' },
      4: { cost: 18000, newCapability: 'pest_prediction' },
      5: { cost: 25000, newCapability: 'quantum_farming' }
    }
  },
  
  harvestBot: {
    id: 'harvestBot',
    name: 'AI Harvest Bot',
    emoji: '🚜',
    description: 'Harvests crops at optimal ripeness for maximum value',
    cost: 18000,
    unlockLevel: 18,
    energyConsumption: 30,
    capabilities: ['auto_harvest', 'quality_optimization', 'timing_analysis'],
    efficiency: 1.3,
    aiLevel: 1,
    maxLevel: 5,
    upgrades: {
      2: { cost: 9000, newCapability: 'bulk_processing' },
      3: { cost: 14000, newCapability: 'selective_harvesting' },
      4: { cost: 20000, newCapability: 'preservation_tech' },
      5: { cost: 30000, newCapability: 'molecular_analysis' }
    }
  },
  
  careBot: {
    id: 'careBot',
    name: 'AI Care Bot',
    emoji: '💧',
    description: 'Provides precision watering, fertilizing, and pest control',
    cost: 12000,
    unlockLevel: 12,
    energyConsumption: 20,
    capabilities: ['auto_water', 'auto_fertilize', 'pest_control'],
    efficiency: 1.4,
    aiLevel: 1,
    maxLevel: 5,
    upgrades: {
      2: { cost: 6000, newCapability: 'soil_analysis' },
      3: { cost: 10000, newCapability: 'micro_dosing' },
      4: { cost: 15000, newCapability: 'disease_immunity' },
      5: { cost: 22000, newCapability: 'nano_enhancement' }
    }
  },
  
  analyticsBot: {
    id: 'analyticsBot',
    name: 'AI Analytics Bot',
    emoji: '🧠',
    description: 'Provides market predictions and optimization strategies',
    cost: 25000,
    unlockLevel: 20,
    energyConsumption: 35,
    capabilities: ['market_prediction', 'profit_optimization', 'risk_analysis'],
    efficiency: 1.5,
    aiLevel: 1,
    maxLevel: 5,
    upgrades: {
      2: { cost: 12000, newCapability: 'weather_forecasting' },
      3: { cost: 18000, newCapability: 'global_market_sync' },
      4: { cost: 25000, newCapability: 'quantum_computing' },
      5: { cost: 35000, newCapability: 'ai_consciousness' }
    }
  },
  
  droneSwarm: {
    id: 'droneSwarm',
    name: 'Drone Swarm Network',
    emoji: '🚁',
    description: 'Aerial monitoring and precision agriculture from above',
    cost: 35000,
    unlockLevel: 25,
    energyConsumption: 50,
    capabilities: ['aerial_monitoring', 'precision_spraying', 'crop_mapping'],
    efficiency: 2.0,
    aiLevel: 1,
    maxLevel: 5,
    upgrades: {
      2: { cost: 15000, newCapability: 'satellite_integration' },
      3: { cost: 25000, newCapability: 'ai_swarm_coordination' },
      4: { cost: 35000, newCapability: 'atmospheric_control' },
      5: { cost: 50000, newCapability: 'weather_manipulation' }
    }
  }
};

// AI Capabilities and their effects
export const AI_CAPABILITIES = {
  auto_plant: {
    name: 'Automatic Planting',
    description: 'Automatically plants crops in empty plots',
    effect: 'Plants highest value crops automatically',
    icon: '🌱'
  },
  
  crop_optimization: {
    name: 'Crop Optimization',
    description: 'Selects best crops based on market conditions',
    effect: '+15% profit from AI-planted crops',
    icon: '📈'
  },
  
  market_analysis: {
    name: 'Market Analysis',
    description: 'Analyzes market trends for optimal selling',
    effect: 'Sells crops at peak prices automatically',
    icon: '💰'
  },
  
  auto_harvest: {
    name: 'Automatic Harvesting',
    description: 'Harvests crops at optimal ripeness',
    effect: '+20% crop quality from AI harvesting',
    icon: '🚜'
  },
  
  quality_optimization: {
    name: 'Quality Enhancement',
    description: 'Maximizes crop quality through precision timing',
    effect: '+25% chance for higher quality crops',
    icon: '⭐'
  },
  
  auto_water: {
    name: 'Precision Watering',
    description: 'Waters crops with perfect timing and amount',
    effect: '+30% growth speed, no over-watering',
    icon: '💧'
  },
  
  auto_fertilize: {
    name: 'Smart Fertilization',
    description: 'Applies fertilizer based on soil analysis',
    effect: '+40% fertilizer efficiency',
    icon: '🌿'
  },
  
  pest_control: {
    name: 'AI Pest Control',
    description: 'Prevents and treats pest infestations',
    effect: '90% pest resistance',
    icon: '🛡️'
  },
  
  market_prediction: {
    name: 'Market Prediction',
    description: 'Predicts market trends 3 days in advance',
    effect: 'Early warning for price changes',
    icon: '🔮'
  },
  
  aerial_monitoring: {
    name: 'Aerial Surveillance',
    description: 'Monitors entire farm from above',
    effect: 'Real-time health monitoring of all crops',
    icon: '👁️'
  },
  
  quantum_farming: {
    name: 'Quantum Agriculture',
    description: 'Uses quantum mechanics for crop enhancement',
    effect: '+100% yield from quantum-enhanced crops',
    icon: '⚛️'
  }
};

export class AIFarmingSystem {
  constructor() {
    this.activeBots = {};
    this.aiEnergy = 100; // AI system energy level
    this.automationQueue = [];
    this.aiDecisions = [];
    this.efficiency = 1.0;
    this.lastUpdate = Date.now();
  }

  // Purchase and deploy an AI bot
  deployBot(botId, gameState) {
    const bot = AI_BOTS[botId];
    if (!bot) return { success: false, error: 'Unknown bot type' };

    if (gameState.level < bot.unlockLevel) {
      return { success: false, error: `Requires level ${bot.unlockLevel}` };
    }

    if (gameState.money < bot.cost) {
      return { success: false, error: 'Insufficient funds' };
    }

    if (this.aiEnergy < bot.energyConsumption) {
      return { success: false, error: 'Insufficient AI energy' };
    }

    // Deploy the bot
    this.activeBots[botId] = {
      ...bot,
      deployedAt: Date.now(),
      tasksCompleted: 0,
      status: 'active'
    };

    this.aiEnergy -= bot.energyConsumption;

    return { 
      success: true, 
      cost: bot.cost,
      bot: this.activeBots[botId]
    };
  }

  // Update AI system - runs every game tick
  updateAI(gameState) {
    const now = Date.now();
    if (now - this.lastUpdate < 5000) return; // Update every 5 seconds

    this.lastUpdate = now;

    // Regenerate AI energy
    this.aiEnergy = Math.min(100, this.aiEnergy + 5);

    // Process each active bot
    Object.entries(this.activeBots).forEach(([botId, bot]) => {
      if (bot.status === 'active') {
        this.processBotActions(botId, bot, gameState);
      }
    });

    // Execute queued automation tasks
    this.executeAutomationQueue(gameState);
  }

  processBotActions(botId, bot, gameState) {
    const actions = [];

    // Seed Bot Actions
    if (botId === 'seedBot' && bot.capabilities.includes('auto_plant')) {
      const emptyPlots = Object.entries(gameState.plots).filter(([_, plot]) => plot.state === 'empty');
      
      if (emptyPlots.length > 0) {
        // AI decides which crop to plant based on market analysis
        const optimalCrop = this.analyzeBestCrop(gameState);
        
        emptyPlots.slice(0, 2).forEach(([plotId, _]) => {
          if (gameState.seeds[optimalCrop] > 0) {
            actions.push({
              type: 'plant',
              plotId: parseInt(plotId),
              crop: optimalCrop,
              aiBonus: bot.efficiency
            });
          }
        });
      }
    }

    // Harvest Bot Actions
    if (botId === 'harvestBot' && bot.capabilities.includes('auto_harvest')) {
      const readyPlots = Object.entries(gameState.plots).filter(([_, plot]) => plot.state === 'ready');
      
      readyPlots.forEach(([plotId, plot]) => {
        actions.push({
          type: 'harvest',
          plotId: parseInt(plotId),
          qualityBonus: bot.efficiency,
          aiOptimized: true
        });
      });
    }

    // Care Bot Actions
    if (botId === 'careBot') {
      const needsCare = Object.entries(gameState.plots).filter(([_, plot]) => 
        plot.state === 'planted' && (!plot.watered || !plot.fertilized)
      );

      needsCare.forEach(([plotId, plot]) => {
        if (!plot.watered && bot.capabilities.includes('auto_water')) {
          actions.push({
            type: 'water',
            plotId: parseInt(plotId),
            efficiency: bot.efficiency
          });
        }
        
        if (!plot.fertilized && bot.capabilities.includes('auto_fertilize')) {
          actions.push({
            type: 'fertilize',
            plotId: parseInt(plotId),
            efficiency: bot.efficiency
          });
        }
      });
    }

    // Add actions to queue
    this.automationQueue.push(...actions);

    // Update bot stats
    bot.tasksCompleted += actions.length;
  }

  analyzeBestCrop(gameState) {
    // AI analysis to determine most profitable crop
    const availableCrops = Object.keys(gameState.seeds).filter(crop => gameState.seeds[crop] > 0);
    
    if (availableCrops.length === 0) return 'wheat'; // fallback

    // Calculate profitability score for each crop
    const scores = availableCrops.map(crop => {
      const cropData = gameState.ALL_CROPS?.[crop] || { value: 25, growTime: 60 };
      const marketPrice = gameState.marketPrices?.[crop] || 1.0;
      const profitPerMinute = (cropData.value * marketPrice) / cropData.growTime;
      
      return { crop, score: profitPerMinute };
    });

    // Return highest scoring crop
    scores.sort((a, b) => b.score - a.score);
    return scores[0].crop;
  }

  executeAutomationQueue(gameState) {
    // Execute up to 5 automation tasks per update
    const tasksToExecute = this.automationQueue.splice(0, 5);
    
    tasksToExecute.forEach(task => {
      this.aiDecisions.push({
        timestamp: Date.now(),
        action: task.type,
        details: task,
        efficiency: task.aiBonus || task.efficiency || 1.0
      });
    });

    return tasksToExecute;
  }

  // Upgrade an AI bot
  upgradeBot(botId, gameState) {
    const bot = this.activeBots[botId];
    if (!bot) return { success: false, error: 'Bot not deployed' };

    if (bot.aiLevel >= bot.maxLevel) {
      return { success: false, error: 'Bot already at max level' };
    }

    const nextLevel = bot.aiLevel + 1;
    const upgrade = AI_BOTS[botId].upgrades[nextLevel];
    
    if (!upgrade) return { success: false, error: 'No upgrade available' };

    if (gameState.money < upgrade.cost) {
      return { success: false, error: 'Insufficient funds' };
    }

    // Apply upgrade
    bot.aiLevel = nextLevel;
    bot.capabilities.push(upgrade.newCapability);
    bot.efficiency *= 1.1; // 10% efficiency boost per level

    return {
      success: true,
      cost: upgrade.cost,
      newLevel: nextLevel,
      newCapability: upgrade.newCapability
    };
  }

  // Get AI system status
  getAIStatus() {
    return {
      energy: this.aiEnergy,
      activeBots: Object.keys(this.activeBots).length,
      totalTasks: Object.values(this.activeBots).reduce((sum, bot) => sum + bot.tasksCompleted, 0),
      efficiency: this.efficiency,
      recentDecisions: this.aiDecisions.slice(-10)
    };
  }

  // Get bot-specific status
  getBotStatus(botId) {
    const bot = this.activeBots[botId];
    if (!bot) return null;

    return {
      ...bot,
      energyUsage: bot.energyConsumption,
      uptime: Date.now() - bot.deployedAt,
      efficiency: bot.efficiency,
      capabilities: bot.capabilities.map(cap => AI_CAPABILITIES[cap])
    };
  }
}

export default AIFarmingSystem;
