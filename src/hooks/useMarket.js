import { useState, useEffect, useCallback } from 'react';
import { SEED_TYPES } from '../utils/gameConstants';

/**
 * Market and Economy Management Hook
 * Handles dynamic pricing, market trends, and economic events
 */
export function useMarket(gameState) {
  const { addNotification, addLog, nowSec } = gameState;

  const [marketPrices, setMarketPrices] = useState({});
  const [marketTrends, setMarketTrends] = useState({});
  const [economicEvents, setEconomicEvents] = useState([]);
  const [marketHistory, setMarketHistory] = useState([]);

  // Generate initial market prices
  const generateInitialPrices = useCallback(() => {
    const prices = {};
    Object.keys(SEED_TYPES).forEach(seedType => {
      const baseValue = SEED_TYPES[seedType].baseValue;
      prices[seedType] = baseValue + (Math.random() - 0.5) * baseValue * 0.3; // ±30% variation
    });
    return prices;
  }, []);

  // Generate market trends
  const generateTrends = useCallback(() => {
    const trends = {};
    Object.keys(SEED_TYPES).forEach(seedType => {
      const roll = Math.random();
      if (roll < 0.2) trends[seedType] = "rising";
      else if (roll < 0.4) trends[seedType] = "falling";
      else trends[seedType] = "stable";
    });
    return trends;
  }, []);

  // Update market prices based on trends and events
  const updatePrices = useCallback(() => {
    setMarketPrices(prev => {
      const newPrices = { ...prev };
      
      Object.keys(newPrices).forEach(seedType => {
        const baseValue = SEED_TYPES[seedType].baseValue;
        const trend = marketTrends[seedType] || "stable";
        let change = 0;
        
        // Apply trend changes
        switch (trend) {
          case "rising":
            change = 0.02 + Math.random() * 0.03; // 2-5% increase
            break;
          case "falling":
            change = -(0.02 + Math.random() * 0.03); // 2-5% decrease
            break;
          default:
            change = (Math.random() - 0.5) * 0.02; // ±1% random
        }
        
        // Apply economic event effects
        economicEvents.forEach(event => {
          if (event.effects && event.effects[seedType]) {
            change += event.effects[seedType];
          }
        });
        
        // Update price
        newPrices[seedType] = Math.max(
          baseValue * 0.5, // Minimum 50% of base value
          Math.min(
            baseValue * 2.0, // Maximum 200% of base value
            newPrices[seedType] * (1 + change)
          )
        );
      });
      
      return newPrices;
    });
    
    // Record price history
    setMarketHistory(prev => [
      { timestamp: nowSec(), prices: { ...marketPrices } },
      ...prev.slice(0, 99) // Keep last 100 records
    ]);
  }, [marketTrends, economicEvents, marketPrices, nowSec]);

  // Generate economic events
  const generateEconomicEvent = useCallback(() => {
    const events = [
      {
        name: "Drought Warning",
        description: "Water shortages expected to affect crop yields",
        duration: 120,
        effects: { 
          carrot: 0.1, 
          wheat: 0.15,
          corn: 0.2 
        }
      },
      {
        name: "Harvest Festival",
        description: "Increased demand for all crops",
        duration: 180,
        effects: Object.keys(SEED_TYPES).reduce((acc, key) => {
          acc[key] = 0.05 + Math.random() * 0.1;
          return acc;
        }, {})
      },
      {
        name: "Export Boom",
        description: "International demand drives prices up",
        duration: 300,
        effects: {
          wheat: 0.25,
          corn: 0.3,
          tomato: 0.15
        }
      },
      {
        name: "Market Crash",
        description: "Economic downturn affects crop prices",
        duration: 240,
        effects: Object.keys(SEED_TYPES).reduce((acc, key) => {
          acc[key] = -(0.1 + Math.random() * 0.15);
          return acc;
        }, {})
      }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const event = {
      ...randomEvent,
      id: Date.now(),
      startTime: nowSec(),
      endTime: nowSec() + randomEvent.duration
    };
    
    setEconomicEvents(prev => [...prev, event]);
    addNotification(`📈 Economic Event: ${event.name}`, "info");
    addLog(`💼 ${event.name}: ${event.description}`);
    
    return event;
  }, [nowSec, addNotification, addLog]);

  // Get current price for a crop
  const getCurrentPrice = useCallback((seedType) => {
    return marketPrices[seedType] || SEED_TYPES[seedType]?.baseValue || 0;
  }, [marketPrices]);

  // Get price trend for a crop
  const getPriceTrend = useCallback((seedType) => {
    const history = marketHistory.slice(0, 10); // Last 10 records
    if (history.length < 2) return "stable";
    
    const latestPrice = history[0]?.prices[seedType] || 0;
    const olderPrice = history[history.length - 1]?.prices[seedType] || 0;
    
    if (latestPrice > olderPrice * 1.05) return "rising";
    if (latestPrice < olderPrice * 0.95) return "falling";
    return "stable";
  }, [marketHistory]);

  // Calculate sell bonus based on market conditions
  const calculateSellBonus = useCallback((seedType, baseValue) => {
    const currentPrice = getCurrentPrice(seedType);
    const multiplier = currentPrice / SEED_TYPES[seedType].baseValue;
    return Math.floor(baseValue * multiplier);
  }, [getCurrentPrice]);

  // Initialize market data
  useEffect(() => {
    if (Object.keys(marketPrices).length === 0) {
      setMarketPrices(generateInitialPrices());
      setMarketTrends(generateTrends());
    }
  }, [marketPrices, generateInitialPrices, generateTrends]);

  // Update prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updatePrices();
      
      // 5% chance to generate economic event every update
      if (Math.random() < 0.05) {
        generateEconomicEvent();
      }
      
      // Update trends every 5 minutes
      if (Math.random() < 0.1) {
        setMarketTrends(generateTrends());
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [updatePrices, generateEconomicEvent, generateTrends]);

  // Clean up expired events
  useEffect(() => {
    const now = nowSec();
    setEconomicEvents(prev => prev.filter(event => event.endTime > now));
  }, [nowSec]);

  return {
    // State
    marketPrices,
    marketTrends,
    economicEvents,
    marketHistory,
    
    // Utilities
    getCurrentPrice,
    getPriceTrend,
    calculateSellBonus,
    generateEconomicEvent,
    
    // Market analysis
    bestCropToSell: Object.keys(SEED_TYPES).reduce((best, current) => {
      const currentMultiplier = getCurrentPrice(current) / SEED_TYPES[current].baseValue;
      const bestMultiplier = getCurrentPrice(best) / SEED_TYPES[best].baseValue;
      return currentMultiplier > bestMultiplier ? current : best;
    }, Object.keys(SEED_TYPES)[0]),
    
    averageMultiplier: Object.keys(SEED_TYPES).reduce((sum, seedType) => {
      return sum + (getCurrentPrice(seedType) / SEED_TYPES[seedType].baseValue);
    }, 0) / Object.keys(SEED_TYPES).length,
    
    activeEvents: economicEvents.filter(event => event.endTime > nowSec())
  };
}
