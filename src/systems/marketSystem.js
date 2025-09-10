/**
 * Dynamic Market System
 * Fluctuating prices based on supply/demand, seasons, and events
 */

// Market trends and price modifiers
export const MARKET_TRENDS = {
  HIGH_DEMAND: { multiplier: 1.5, name: "High Demand", emoji: "📈" },
  NORMAL: { multiplier: 1.0, name: "Normal", emoji: "➡️" },
  LOW_DEMAND: { multiplier: 0.7, name: "Low Demand", emoji: "📉" },
  SURPLUS: { multiplier: 0.5, name: "Market Surplus", emoji: "⬇️" },
  SHORTAGE: { multiplier: 2.0, name: "Critical Shortage", emoji: "🚨" }
};

// Seasonal price modifiers
export const SEASONAL_MODIFIERS = {
  spring: { 
    vegetables: 1.2, 
    fruits: 0.8, 
    grains: 1.0, 
    exotic: 1.1 
  },
  summer: { 
    vegetables: 0.9, 
    fruits: 1.3, 
    grains: 1.1, 
    exotic: 1.2 
  },
  fall: { 
    vegetables: 1.1, 
    fruits: 1.1, 
    grains: 1.3, 
    exotic: 0.9 
  },
  winter: { 
    vegetables: 1.4, 
    fruits: 1.0, 
    grains: 0.8, 
    exotic: 1.5 
  }
};

// Market events that affect prices
export const MARKET_EVENTS = [
  {
    id: 'harvest_festival',
    name: 'Harvest Festival',
    description: 'Local festival increases demand for fresh produce',
    duration: 3, // days
    effects: { vegetables: 1.3, fruits: 1.4 },
    probability: 0.15
  },
  {
    id: 'export_boom',
    name: 'Export Boom',
    description: 'International demand drives up grain prices',
    duration: 5,
    effects: { grains: 1.6, exotic: 1.2 },
    probability: 0.1
  },
  {
    id: 'health_trend',
    name: 'Health Food Trend',
    description: 'Organic produce in high demand',
    duration: 7,
    effects: { vegetables: 1.4, fruits: 1.3 },
    probability: 0.12
  },
  {
    id: 'bad_weather_elsewhere',
    name: 'Regional Crop Failure',
    description: 'Poor harvests in neighboring regions boost local prices',
    duration: 4,
    effects: { vegetables: 1.5, grains: 1.4, fruits: 1.2 },
    probability: 0.08
  },
  {
    id: 'oversupply',
    name: 'Market Oversupply',
    description: 'Bumper crops flood the market',
    duration: 3,
    effects: { vegetables: 0.6, grains: 0.7, fruits: 0.8 },
    probability: 0.1
  }
];

// Contract system for guaranteed sales
export const CONTRACTS = [
  {
    id: 'restaurant_chain',
    name: 'Restaurant Chain Contract',
    description: 'Supply premium vegetables to restaurant chain',
    requirements: { vegetables: 50, quality: 'gold' },
    reward: 2000,
    bonus: 1.5, // price multiplier
    duration: 5, // days to complete
    probability: 0.2
  },
  {
    id: 'juice_factory',
    name: 'Juice Factory Order',
    description: 'Large fruit order for juice production',
    requirements: { fruits: 100, quality: 'silver' },
    reward: 3000,
    bonus: 1.3,
    duration: 7,
    probability: 0.15
  },
  {
    id: 'grain_export',
    name: 'Grain Export Deal',
    description: 'International grain export opportunity',
    requirements: { grains: 200, quality: 'any' },
    reward: 5000,
    bonus: 1.4,
    duration: 10,
    probability: 0.1
  },
  {
    id: 'specialty_store',
    name: 'Gourmet Store',
    description: 'Exotic crops for high-end market',
    requirements: { exotic: 20, quality: 'platinum' },
    reward: 4000,
    bonus: 2.0,
    duration: 3,
    probability: 0.08
  }
];

export class MarketSystem {
  constructor() {
    this.currentPrices = {};
    this.trends = {};
    this.activeEvents = [];
    this.activeContracts = [];
    this.priceHistory = {};
    this.lastUpdate = Date.now();
  }

  // Initialize market with base prices
  initializeMarket(crops) {
    Object.keys(crops).forEach(cropId => {
      const crop = crops[cropId];
      this.currentPrices[cropId] = crop.baseValue || crop.price;
      this.trends[cropId] = 'NORMAL';
      this.priceHistory[cropId] = [this.currentPrices[cropId]];
    });
  }

  // Update market prices based on various factors
  updateMarket(gameState) {
    const now = Date.now();
    const hoursSinceUpdate = (now - this.lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) return; // Update only every hour
    
    this.lastUpdate = now;
    
    // Remove expired events
    this.activeEvents = this.activeEvents.filter(event => event.endTime > now);
    
    // Generate new market events
    this.generateMarketEvents();
    
    // Generate new contracts
    this.generateContracts(gameState);
    
    // Update prices
    this.updatePrices(gameState);
  }

  generateMarketEvents() {
    MARKET_EVENTS.forEach(eventTemplate => {
      if (Math.random() < eventTemplate.probability && 
          !this.activeEvents.find(e => e.id === eventTemplate.id)) {
        
        const event = {
          ...eventTemplate,
          startTime: Date.now(),
          endTime: Date.now() + (eventTemplate.duration * 24 * 60 * 60 * 1000)
        };
        
        this.activeEvents.push(event);
      }
    });
  }

  generateContracts(gameState) {
    if (this.activeContracts.length >= 3) return; // Max 3 active contracts
    
    CONTRACTS.forEach(contractTemplate => {
      if (Math.random() < contractTemplate.probability &&
          !this.activeContracts.find(c => c.id === contractTemplate.id)) {
        
        const contract = {
          ...contractTemplate,
          startTime: Date.now(),
          endTime: Date.now() + (contractTemplate.duration * 24 * 60 * 60 * 1000)
        };
        
        this.activeContracts.push(contract);
      }
    });
  }

  updatePrices(gameState) {
    Object.keys(this.currentPrices).forEach(cropId => {
      let newPrice = this.getBasePrice(cropId);
      
      // Apply seasonal modifiers
      const season = this.getCurrentSeason();
      const crop = this.getCropData(cropId);
      if (crop && SEASONAL_MODIFIERS[season] && SEASONAL_MODIFIERS[season][crop.category]) {
        newPrice *= SEASONAL_MODIFIERS[season][crop.category];
      }
      
      // Apply market events
      this.activeEvents.forEach(event => {
        if (event.effects[crop.category]) {
          newPrice *= event.effects[crop.category];
        }
      });
      
      // Add random fluctuation
      const randomFactor = 0.9 + (Math.random() * 0.2); // ±10%
      newPrice *= randomFactor;
      
      // Update trend
      const oldPrice = this.currentPrices[cropId];
      if (newPrice > oldPrice * 1.1) {
        this.trends[cropId] = 'HIGH_DEMAND';
      } else if (newPrice < oldPrice * 0.9) {
        this.trends[cropId] = 'LOW_DEMAND';
      } else {
        this.trends[cropId] = 'NORMAL';
      }
      
      this.currentPrices[cropId] = Math.round(newPrice);
      
      // Store price history (keep last 24 hours)
      if (!this.priceHistory[cropId]) this.priceHistory[cropId] = [];
      this.priceHistory[cropId].push(this.currentPrices[cropId]);
      if (this.priceHistory[cropId].length > 24) {
        this.priceHistory[cropId].shift();
      }
    });
  }

  // Get current price for a crop
  getPrice(cropId) {
    return this.currentPrices[cropId] || 0;
  }

  // Get trend for a crop
  getTrend(cropId) {
    return MARKET_TRENDS[this.trends[cropId]] || MARKET_TRENDS.NORMAL;
  }

  // Get price history for charts
  getPriceHistory(cropId) {
    return this.priceHistory[cropId] || [];
  }

  // Helper methods
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getBasePrice(cropId) {
    // This would get base price from crop data
    return this.currentPrices[cropId] || 10;
  }

  getCropData(cropId) {
    // This would get crop data - placeholder for now
    return { category: 'vegetables' };
  }

  // Contract management
  completeContract(contractId, deliveredGoods) {
    const contract = this.activeContracts.find(c => c.id === contractId);
    if (!contract) return null;

    // Check if requirements are met
    const meetsRequirements = this.checkContractRequirements(contract, deliveredGoods);
    
    if (meetsRequirements) {
      this.activeContracts = this.activeContracts.filter(c => c.id !== contractId);
      return {
        success: true,
        reward: contract.reward,
        bonus: contract.bonus
      };
    }
    
    return { success: false, reason: 'Requirements not met' };
  }

  checkContractRequirements(contract, deliveredGoods) {
    // Implementation would check if delivered goods meet contract requirements
    return true; // Simplified for now
  }
}

export default MarketSystem;
