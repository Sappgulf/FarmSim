/**
 * Economic System - Handles market dynamics, pricing, and economic calculations
 */

export class EconomicSystem {
  constructor(gameState, gameActions) {
    this.state = gameState;
    this.actions = gameActions;
    this.lastMarketUpdate = Date.now();
    this.marketUpdateInterval = 30000; // Update market every 30 seconds
  }

  update(currentState) {
    // FIXED: Update internal state reference
    if (!currentState) {
      console.error('[farm] EconomicSystem: update() called with null/undefined state');
      return;
    }
    
    this.state = currentState;
    
    const now = Date.now();

    if (now - this.lastMarketUpdate > this.marketUpdateInterval) {
      this.updateMarketPrices();
      this.lastMarketUpdate = now;
    }

    // Process any pending economic events
    this.processEconomicEvents();
  }

  updateMarketPrices() {
    // Safety check
    if (!this.state || !this.state.inventory) {
      console.warn('[farm] EconomicSystem: No state or inventory available');
      return;
    }
    
    // Simple market fluctuation system
    const crops = ['carrot', 'potato', 'corn', 'tomato'];
    const updatedInventory = { ...this.state.inventory };

    crops.forEach(crop => {
      // Random price fluctuation (-20% to +30%)
      const fluctuation = (Math.random() - 0.4) * 0.5;
      const basePrice = this.getBasePrice(crop);
      const newPrice = Math.max(1, Math.round(basePrice * (1 + fluctuation)));

      updatedInventory[`${crop}_price`] = newPrice;
    });

    this.actions.updateInventory(updatedInventory);
  }

  processEconomicEvents() {
    // Process contracts, market events, etc.
    // DISABLED: No automatic coin generation - coins should only come from player actions
    // This would be more complex in a full implementation
  }

  calculateCropValue(cropType, quality = 1.0) {
    // Safety check
    if (!this.state) {
      return this.getBasePrice(cropType);
    }
    
    const basePrice = this.getBasePrice(cropType);
    const marketPrice = (this.state.inventory || {})[`${cropType}_price`] || basePrice;

    // Apply quality multiplier
    const finalPrice = Math.round(marketPrice * quality);

    return Math.max(1, finalPrice);
  }

  getBasePrice(cropType) {
    const prices = {
      carrot: 12,
      potato: 15,
      corn: 22,
      tomato: 28
    };

    return prices[cropType] || 10;
  }

  processSale(cropType, quantity, quality = 1.0) {
    const valuePerUnit = this.calculateCropValue(cropType, quality);
    const totalValue = valuePerUnit * quantity;

    // Safety check
    if (!this.state) {
      console.warn('[farm] EconomicSystem: No state available for sellCrops');
      return { success: false, message: 'State not available' };
    }
    
    // Update inventory
    const currentInventory = this.state.inventory || {};
    const updatedInventory = {
      ...currentInventory,
      [cropType]: Math.max(0, (currentInventory[cropType] || 0) - quantity)
    };

    this.actions.updateInventory(updatedInventory);
    this.actions.earnMoney(totalValue);

    return {
      earnings: totalValue,
      valuePerUnit: valuePerUnit
    };
  }

  canAfford(cost) {
    if (!this.state) return false;
    return (this.state.coins || 0) >= cost;
  }

  getMarketInfo() {
    return {
      trends: this.getMarketTrends(),
      prices: this.getCurrentPrices(),
      recommendations: this.getTradingRecommendations()
    };
  }

  getMarketTrends() {
    // Simplified trend analysis
    return {
      overall: 'stable',
      recommendations: [
        'Consider selling high-value crops when prices peak',
        'Stock up on supplies during price dips'
      ]
    };
  }

  getCurrentPrices() {
    // Safety check
    if (!this.state) {
      return {};
    }
    
    const crops = ['carrot', 'potato', 'corn', 'tomato'];
    const prices = {};
    const inventory = this.state.inventory || {};

    crops.forEach(crop => {
      prices[crop] = inventory[`${crop}_price`] || this.getBasePrice(crop);
    });

    return prices;
  }

  getTradingRecommendations() {
    const prices = this.getCurrentPrices();
    const recommendations = [];

    // Simple recommendation logic
    Object.entries(prices).forEach(([crop, price]) => {
      const basePrice = this.getBasePrice(crop);
      const ratio = price / basePrice;

      if (ratio > 1.2) {
        recommendations.push(`High prices for ${crop} - consider selling!`);
      } else if (ratio < 0.8) {
        recommendations.push(`Low prices for ${crop} - good time to sell.`);
      }
    });

    return recommendations;
  }
}
