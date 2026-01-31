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
      const weatherTypes = ['sunny', 'rainy', 'cloudy', 'stormy', 'heatwave'];
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
    const weatherTypes = ['sunny', 'rainy', 'cloudy', 'stormy', 'heatwave'];

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
    const plots = this.gameState.plots;
    let updatedPlots = null;
    for (let i = 0; i < plots.length; i += 1) {
      const plot = plots[i];
      if (!plot || plot.state === 'empty') {
        continue;
      }

      let updatedPlot = plot;
      
      // Calculate protection level (0.0 = no protection, 1.0 = full protection)
      const weatherProtection = (hasGreenhouse ? 0.7 : 0) + (hasWell ? 0.3 : 0);

      // Water level changes (well reduces water drain/adds water)
      if (effects.waterChange) {
        const waterBonus = hasWell ? 5 : 0;
        const nextWaterLevel = Math.max(0, Math.min(100,
          (updatedPlot.waterLevel || 0) + effects.waterChange + waterBonus
        ));
        if (nextWaterLevel !== updatedPlot.waterLevel) {
          if (!updatedPlots) updatedPlots = plots.slice();
          updatedPlot = { ...updatedPlot, waterLevel: nextWaterLevel };
        }
      }

      // Set weather modifier (greenhouse reduces negative effects)
      let growthMod = effects.growthModifier || 1.0;
      if (hasGreenhouse && growthMod < 1.0) {
        // Greenhouse reduces negative growth modifiers
        growthMod = 1.0 - ((1.0 - growthMod) * (1 - weatherProtection));
      }
      if (updatedPlot.weatherModifier !== growthMod) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlot = { ...updatedPlot, weatherModifier: growthMod };
      }

      // Disease risk (barn reduces disease risk)
      const diseaseReduction = hasBarn ? 0.5 : 0;
      const actualDiseaseRisk = effects.diseaseRisk ? effects.diseaseRisk * (1 - diseaseReduction) : 0;
      if (actualDiseaseRisk && Math.random() < actualDiseaseRisk) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlot = { ...updatedPlot, disease: 'weather-induced' };
      }

      // Storm damage risk (greenhouse provides protection)
      if (effects.damageRisk && !hasGreenhouse) {
        const damageChance = effects.damageRisk * (1 - weatherProtection);
        if (Math.random() < damageChance) {
          // Only damage growing crops, not ready ones
          if (updatedPlot.state === 'growing' || updatedPlot.state === 'planted') {
            if (!updatedPlots) updatedPlots = plots.slice();
            updatedPlot = {
              ...updatedPlot,
              state: 'withered',
              witheredAt: Date.now(),
              weatherDamage: true,
            };
            
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
      if (updatedPlot.currentWeather !== weather) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlot = { ...updatedPlot, currentWeather: weather };
      }

      if (updatedPlots) {
        updatedPlots[i] = updatedPlot;
      }
    }

    if (updatedPlots) {
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

    const plots = this.gameState.plots;
    let updatedPlots = null;
    for (let i = 0; i < plots.length; i += 1) {
      const plot = plots[i];
      if (!plot || plot.state === 'empty') continue;

      let updatedPlot = plot;

      // Apply gradual water drain (if any), reduced by well
      if (effects.waterDrainRate) {
        const drainReduction = hasWell ? 0.5 : 0;
        const actualDrain = effects.waterDrainRate * (1 - drainReduction);
        const nextWaterLevel = Math.max(0,
          (updatedPlot.waterLevel || 0) - actualDrain * 0.02 // Very gentle drain
        );
        if (nextWaterLevel !== updatedPlot.waterLevel) {
          if (!updatedPlots) updatedPlots = plots.slice();
          updatedPlot = { ...updatedPlot, waterLevel: nextWaterLevel };
        }
      }

      // DROUGHT WITHERING: Only during actual drought weather, much less aggressive
      if ((plot.state === 'growing' || plot.state === 'planted') && !hasGreenhouse) {
        const isActualDrought = ['drought', 'heatwave'].includes(this.gameState.weather);
        const isVeryLowWater = (updatedPlot.waterLevel || 0) < 5; // Much lower threshold

        if (isActualDrought && isVeryLowWater) {
          // Very low chance of withering during drought with critically low water
          const witherChance = 0.0025; // 0.25% per tick (extra cozy)
          if (Math.random() < witherChance) {
            if (!updatedPlots) updatedPlots = plots.slice();
            updatedPlot = {
              ...updatedPlot,
              state: 'withered',
              witheredAt: Date.now(),
              droughtDamage: true,
            };

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
      const nextWeatherModifier = effects.growthModifier || 1.0;
      if (updatedPlot.weatherModifier !== nextWeatherModifier) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlot = { ...updatedPlot, weatherModifier: nextWeatherModifier };
      }
      if (updatedPlot.currentWeather !== this.gameState.weather) {
        if (!updatedPlots) updatedPlots = plots.slice();
        updatedPlot = { ...updatedPlot, currentWeather: this.gameState.weather };
      }

      if (updatedPlots) {
        updatedPlots[i] = updatedPlot;
      }
    }

    if (updatedPlots) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  getWeatherEffects(weather) {
    const effects = {
      sunny: {
        waterDrainRate: 0.3,
        growthModifier: 1.15,
        diseaseRisk: 0.01,
        description: 'Clear skies with gentle growth'
      },
      rainy: {
        waterChange: 6,
        growthModifier: 1.1,
        diseaseRisk: 0.02,
        description: 'Cozy rain with free watering'
      },
      cloudy: {
        waterDrainRate: 0.2,
        growthModifier: 1.05,
        diseaseRisk: 0.01,
        description: 'Soft light and steady growth'
      },
      stormy: {
        waterChange: 3,
        growthModifier: 0.95,
        diseaseRisk: 0.04,
        damageRisk: 0.01,
        description: 'A brief storm with mild impact'
      },
      drought: {
        waterDrainRate: 0.8,
        growthModifier: 0.85,
        diseaseRisk: 0.03,
        description: 'Dry spell, keep an eye on water'
      },
      heatwave: {
        waterDrainRate: 0.7,
        growthModifier: 0.95,
        diseaseRisk: 0.02,
        description: 'Warm breeze with extra thirst'
      },
      snow: {
        waterChange: 2,
        growthModifier: 0.8,
        diseaseRisk: 0.0,
        description: 'Snowy calm with slower growth'
      },
      windy: {
        waterDrainRate: 0.4,
        growthModifier: 0.95,
        diseaseRisk: 0.02,
        description: 'Breezy weather with tiny effects'
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
