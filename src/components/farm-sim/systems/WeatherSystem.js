/**
 * Weather System - Handles weather changes and effects
 * Includes forecasting and weather impact calculations
 */

export class WeatherSystem {
  constructor(gameState, gameActions) {
    this.gameState = gameState;
    this.actions = gameActions;
    this.lastWeatherChange = Date.now();
    this.weatherCycleDuration = 25000; // 25 seconds per weather type
  }

  update(currentState) {
    // FIXED: Update our reference to current state with validation
    if (!currentState) {
      console.error('[farm] WeatherSystem: update() called with null/undefined state');
      return;
    }
    
    this.gameState = currentState;

    const now = Date.now();

    // Change weather periodically
    if (now - this.lastWeatherChange > this.weatherCycleDuration) {
      this.changeWeather();
      this.lastWeatherChange = now;
    }

    // Update weather effects on crops
    this.applyWeatherEffects();
  }

  changeWeather() {
    // Use seasonal weather patterns if available
    let newWeather;
    if (this.gameState.season?.config?.weatherWeights) {
      // Weighted random selection based on season
      const weights = this.gameState.season.config.weatherWeights;
      const random = Math.random();
      let cumulative = 0;

      for (const [weather, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (random <= cumulative && weight > 0) {
          newWeather = weather;
          break;
        }
      }
    }

    // Fallback to simple cycle if no season or selection failed
    if (!newWeather) {
      const weatherTypes = ['sunny', 'rainy', 'cloudy', 'stormy'];
      const currentIndex = weatherTypes.indexOf(this.gameState.weather);
      const nextIndex = (currentIndex + 1) % weatherTypes.length;
      newWeather = weatherTypes[nextIndex];
    }

    this.actions.setWeather(newWeather);

    // Update weather forecast
    this.updateForecast();

    // Apply immediate weather effects
    this.applyImmediateWeatherEffects(newWeather);
  }

  updateForecast() {
    const forecast = [];
    const weatherTypes = ['sunny', 'rainy', 'cloudy', 'stormy'];

    for (let i = 0; i < 3; i++) {
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      forecast.push({
        type: randomWeather,
        duration: Math.floor(Math.random() * 20) + 15, // 15-35 seconds
        effects: this.getWeatherEffects(randomWeather)
      });
    }

    this.actions.updateWeatherForecast(forecast);
  }

  applyImmediateWeatherEffects(weather) {
    const effects = this.getWeatherEffects(weather);
    
    // Safety check
    if (!this.gameState || !Array.isArray(this.gameState.plots)) {
      console.warn('[farm] WeatherSystem: No valid plots array for immediate weather effects');
      return;
    }
    
    // Check building protections
    const hasGreenhouse = this.gameState.buildings?.greenhouse?.built;
    const hasWell = this.gameState.buildings?.well?.built;
    const hasBarn = this.gameState.buildings?.barn?.built;

    // Apply to all plots - only modify weather-related properties, not growth state
    const updatedPlots = this.gameState.plots.map(plot => {
      if (plot.state === 'empty') return plot;

      let updatedPlot = { ...plot };
      
      // Calculate protection level (0.0 = no protection, 1.0 = full protection)
      const weatherProtection = (hasGreenhouse ? 0.7 : 0) + (hasWell ? 0.3 : 0);

      // Water level changes (well reduces water drain/adds water)
      if (effects.waterChange) {
        const waterBonus = hasWell ? 5 : 0;
        updatedPlot.waterLevel = Math.max(0, Math.min(100,
          updatedPlot.waterLevel + effects.waterChange + waterBonus
        ));
      }

      // Set weather modifier (greenhouse reduces negative effects)
      let growthMod = effects.growthModifier || 1.0;
      if (hasGreenhouse && growthMod < 1.0) {
        // Greenhouse reduces negative growth modifiers
        growthMod = 1.0 - ((1.0 - growthMod) * (1 - weatherProtection));
      }
      updatedPlot.weatherModifier = growthMod;

      // Disease risk (barn reduces disease risk)
      const diseaseReduction = hasBarn ? 0.5 : 0;
      const actualDiseaseRisk = effects.diseaseRisk ? effects.diseaseRisk * (1 - diseaseReduction) : 0;
      if (actualDiseaseRisk && Math.random() < actualDiseaseRisk) {
        updatedPlot.disease = 'weather-induced';
      }

      // Storm damage risk (greenhouse provides protection)
      if (effects.damageRisk && !hasGreenhouse) {
        const damageChance = effects.damageRisk * (1 - weatherProtection);
        if (Math.random() < damageChance) {
          // Only damage growing crops, not ready ones
          if (updatedPlot.state === 'growing' || updatedPlot.state === 'planted') {
            updatedPlot.state = 'withered';
            updatedPlot.witheredAt = Date.now();
            updatedPlot.weatherDamage = true; // Mark as weather-damaged for visual feedback
            
            // Trigger notification for storm damage
            if (this.actions.addNotification && Math.random() < 0.3) { // Only sometimes to avoid spam
              this.actions.addNotification({
                message: `⚡ Storm damaged ${updatedPlot.crop?.emoji || '🌾'} ${updatedPlot.crop?.name || 'crop'}!`,
                type: 'warning'
              });
            }
          }
        }
      }
      
      // Mark current weather on plot for visual feedback
      updatedPlot.currentWeather = weather;

      return updatedPlot;
    });

    if (updatedPlots.some((plot, index) => {
      const originalPlot = this.gameState.plots?.[index];
      return originalPlot && plot !== originalPlot;
    })) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  applyWeatherEffects() {
    // Safety check
    if (!this.gameState || !Array.isArray(this.gameState.plots)) {
      console.warn('[farm] WeatherSystem: No valid plots array for weather effects');
      return;
    }
    
    // Continuous weather effects - called periodically
    const effects = this.getWeatherEffects(this.gameState.weather || 'sunny');
    const hasWell = this.gameState.buildings?.well?.built;
    const hasGreenhouse = this.gameState.buildings?.greenhouse?.built;

    // Only apply gradual changes, not state-changing effects
    const updatedPlots = this.gameState.plots.map(plot => {
      if (plot.state === 'empty') return plot;

      let updatedPlot = { ...plot };

      // Apply gradual water drain (if any), reduced by well
      if (effects.waterDrainRate) {
        const drainReduction = hasWell ? 0.5 : 0;
        const actualDrain = effects.waterDrainRate * (1 - drainReduction);
        updatedPlot.waterLevel = Math.max(0,
          updatedPlot.waterLevel - actualDrain * 0.02 // Very gentle drain
        );
      }

      // DROUGHT WITHERING: Only during actual drought weather, much less aggressive
      if ((plot.state === 'growing' || plot.state === 'planted') && !hasGreenhouse) {
        const isActualDrought = this.gameState.weather === 'drought';
        const isVeryLowWater = updatedPlot.waterLevel < 10; // Much lower threshold

        if (isActualDrought && isVeryLowWater) {
          // Very low chance of withering during drought with critically low water
          const witherChance = 0.005; // 0.5% per tick (much less aggressive)
          if (Math.random() < witherChance) {
            updatedPlot.state = 'withered';
            updatedPlot.witheredAt = Date.now();
            updatedPlot.droughtDamage = true; // Mark as drought-damaged

            // Trigger notification
            if (this.actions.addNotification && Math.random() < 0.3) {
              this.actions.addNotification({
                message: `🏜️💧 ${updatedPlot.crop?.emoji || '🌾'} ${updatedPlot.crop?.name || 'Crop'} withered from extreme drought!`,
                type: 'warning'
              });
            }
          }
        }
      }

      // Ensure weather modifier is set
      updatedPlot.weatherModifier = effects.growthModifier || 1.0;
      updatedPlot.currentWeather = this.gameState.weather;

      return updatedPlot;
    });

    // Only update if something actually changed
    const hasChanges = updatedPlots.some((plot, index) => {
      const originalPlot = this.gameState.plots?.[index];
      if (!originalPlot) return false;
      
      return plot.waterLevel !== originalPlot.waterLevel ||
        plot.weatherModifier !== originalPlot.weatherModifier ||
        plot.state !== originalPlot.state;
    });

    if (hasChanges) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  getWeatherEffects(weather) {
    const effects = {
      sunny: {
        waterDrainRate: 0.4, // Gentle water drain in sun
        growthModifier: 1.2, // Faster growth in sun
        diseaseRisk: 0.02, // Low disease risk
        description: 'Fast growth, moderate water needs'
      },
      rainy: {
        waterChange: 8, // Water crops when raining
        growthModifier: 1.1, // Moderate growth boost
        diseaseRisk: 0.05, // Higher disease risk
        description: 'Automatic watering, higher disease risk'
      },
      cloudy: {
        waterDrainRate: 0.5, // Slow water drain
        growthModifier: 1.0, // Normal growth
        diseaseRisk: 0.01, // Very low disease risk
        description: 'Normal conditions'
      },
      stormy: {
        waterChange: 4, // Some water from storm
        growthModifier: 0.8, // Slower growth in storms
        diseaseRisk: 0.1, // High disease risk
        damageRisk: 0.05, // Chance of crop damage
        description: 'Slow growth, high disease risk, possible damage'
      },
      drought: {
        waterDrainRate: 1.2, // Moderate water drain in drought
        growthModifier: 0.6, // Very slow growth
        diseaseRisk: 0.08, // High disease risk
        description: 'Very dry, crops struggle without irrigation'
      },
      snow: {
        waterChange: 2, // Snow provides some water
        growthModifier: 0.3, // Very slow growth in snow
        diseaseRisk: 0.0, // No disease in snow
        description: 'Freezing conditions, minimal growth'
      },
      windy: {
        waterDrainRate: 1.2, // Slightly higher drain
        growthModifier: 0.9, // Slightly slower growth
        diseaseRisk: 0.03, // Moderate disease risk
        description: 'Windy conditions, minor effects'
      }
    };

    return effects[weather] || effects.cloudy;
  }

  getWeatherForecast() {
    return this.gameState.weatherForecast;
  }

  getCurrentWeather() {
    return {
      type: this.gameState.weather,
      effects: this.getWeatherEffects(this.gameState.weather),
      timeRemaining: Math.max(0,
        this.weatherCycleDuration - (Date.now() - this.lastWeatherChange)
      )
    };
  }
}
