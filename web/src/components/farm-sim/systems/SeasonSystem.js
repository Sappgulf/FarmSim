/**
 * Season System - Handles seasonal cycles and bonuses
 * 4 seasons, each lasting 2 minutes (120 seconds)
 */
import { isDevelopmentMode } from '../../../config/release';

export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  FALL: 'fall',
  WINTER: 'winter'
};

export const SEASON_CONFIG = {
  [SEASONS.SPRING]: {
    name: 'Spring',
    emoji: '🌸',
    duration: 120000, // 2 minutes in milliseconds
    overlayGradient: ['#fdf2f8', '#dcfce7'],
    colors: {
      primary: 'from-pink-100 to-green-100',
      accent: 'from-pink-200 to-green-200',
      text: 'text-green-700',
      border: 'border-pink-300'
    },
    bonuses: {
      growthSpeed: 1.25, // 25% faster growth
      cropQuality: 1.0,
      marketPrices: 1.0,
      diseaseResistance: 1.1 // 10% more resistant
    },
    weatherWeights: {
      sunny: 0.4,
      rainy: 0.35,
      cloudy: 0.2,
      stormy: 0.05,
      drought: 0,
      snow: 0,
      windy: 0
    },
    description: 'Perfect growing conditions! Crops grow 25% faster.',
    icon: '🌷'
  },
  [SEASONS.SUMMER]: {
    name: 'Summer',
    emoji: '☀️',
    duration: 120000,
    overlayGradient: ['#fef3c7', '#ffedd5'],
    colors: {
      primary: 'from-yellow-100 to-orange-100',
      accent: 'from-yellow-200 to-orange-200',
      text: 'text-orange-700',
      border: 'border-yellow-300'
    },
    bonuses: {
      growthSpeed: 1.15, // 15% faster growth
      cropQuality: 1.2, // 20% better quality
      marketPrices: 1.3, // 30% higher prices!
      diseaseResistance: 0.9 // 10% less resistant
    },
    weatherWeights: {
      sunny: 0.6,
      rainy: 0.1,
      cloudy: 0.15,
      stormy: 0.05,
      drought: 0.1,
      snow: 0,
      windy: 0
    },
    description: 'Hot weather! Crops sell for 30% more, but watch for droughts.',
    icon: '🌻'
  },
  [SEASONS.FALL]: {
    name: 'Fall',
    emoji: '🍂',
    duration: 120000,
    overlayGradient: ['#fed7aa', '#fef3c7'],
    colors: {
      primary: 'from-orange-100 to-amber-100',
      accent: 'from-orange-200 to-amber-200',
      text: 'text-amber-700',
      border: 'border-orange-300'
    },
    bonuses: {
      growthSpeed: 1.0, // Normal speed
      cropQuality: 1.3, // 30% better quality
      marketPrices: 1.4, // 40% higher prices! (harvest season)
      diseaseResistance: 1.0
    },
    weatherWeights: {
      sunny: 0.3,
      rainy: 0.2,
      cloudy: 0.35,
      stormy: 0.1,
      drought: 0,
      snow: 0,
      windy: 0.05
    },
    description: 'Harvest season! Best prices (40% more) and quality (+30%).',
    icon: '🎃'
  },
  [SEASONS.WINTER]: {
    name: 'Winter',
    emoji: '❄️',
    duration: 120000,
    overlayGradient: ['#dbeafe', '#e2e8f0'],
    colors: {
      primary: 'from-blue-100 to-slate-100',
      accent: 'from-blue-200 to-slate-200',
      text: 'text-blue-700',
      border: 'border-blue-300'
    },
    bonuses: {
      growthSpeed: 0.7, // 30% slower growth
      cropQuality: 0.8, // 20% lower quality
      marketPrices: 1.1, // 10% higher (scarcity)
      diseaseResistance: 1.3 // 30% more resistant (cold kills pests)
    },
    weatherWeights: {
      sunny: 0.2,
      rainy: 0.1,
      cloudy: 0.4,
      stormy: 0.05,
      drought: 0,
      snow: 0.2,
      windy: 0.05
    },
    description: 'Cold weather. Growth is 30% slower, but diseases are rare.',
    icon: '⛄'
  }
};

export class SeasonSystem {
  constructor(gameState, gameActions) {
    this.gameState = gameState;
    this.actions = gameActions;
    this.lastSeasonChange = Date.now();
  }

  update(currentState) {
    this.gameState = currentState;

    // Initialize season config if not set
    if (!this.gameState.season?.config) {
      const currentSeason = this.gameState.season?.current || SEASONS.SPRING;
      const config = SEASON_CONFIG[currentSeason];
      if (this.actions?.recordAlmanacEvent) {
        this.actions.recordAlmanacEvent('season_start', { season: currentSeason });
      }
      this.actions.updateSeason({
        current: currentSeason,
        lastChangeTime: this.gameState.season?.lastChangeTime || Date.now(),
        config: config
      });
      return;
    }

    // Check if we need to change seasons
    const now = Date.now();
    const timeSinceLastChange = now - (this.gameState.season?.lastChangeTime || now);
    const currentSeason = this.gameState.season?.current || SEASONS.SPRING;
    const currentConfig = SEASON_CONFIG[currentSeason];

    // Change season every 2 minutes
    if (timeSinceLastChange >= currentConfig.duration) {
      this.changeSeason();
    }
  }

  changeSeason() {
    const currentSeason = this.gameState.season?.current || SEASONS.SPRING;
    const seasons = Object.values(SEASONS);
    const currentIndex = seasons.indexOf(currentSeason);
    const nextIndex = (currentIndex + 1) % seasons.length;
    const nextSeason = seasons[nextIndex];
    const nextConfig = SEASON_CONFIG[nextSeason];

    if (isDevelopmentMode()) {
      console.debug('[farm]', `Season changed: ${currentSeason} → ${nextSeason}`);
    }

    if (this.actions?.recordAlmanacEvent) {
      this.actions.recordAlmanacEvent('season_end', { season: currentSeason, nextSeason });
      this.actions.recordAlmanacEvent('season_start', { season: nextSeason, previousSeason: currentSeason });
    }

    // Trigger visual season transition effect first
    if (typeof window !== 'undefined' && typeof window.triggerSeasonTransition === 'function') {
      window.triggerSeasonTransition(nextConfig);
    }

    // Update season state
    this.actions.updateSeason({
      current: nextSeason,
      lastChangeTime: Date.now(),
      config: nextConfig
    });

    // Trigger celebration particles
    if (typeof window.triggerParticleEffect === 'function') {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 3;
      window.triggerParticleEffect(centerX, centerY, 'levelup', {
        text: `${nextConfig.emoji} ${nextConfig.name} has arrived!`,
        shake: false
      });
    }

    // Add notification
    this.actions.addNotification({
      message: `${nextConfig.emoji} ${nextConfig.name} has begun! ${nextConfig.description}`,
      type: 'success'
    });
  }

  getCurrentSeason() {
    return this.gameState.season?.current || SEASONS.SPRING;
  }

  getCurrentConfig() {
    const season = this.getCurrentSeason();
    return SEASON_CONFIG[season];
  }

  getSeasonBonus(bonusType) {
    const config = this.getCurrentConfig();
    return config.bonuses[bonusType] || 1.0;
  }

  getSeasonColors() {
    const config = this.getCurrentConfig();
    return config.colors;
  }

  getSeasonalWeather() {
    const config = this.getCurrentConfig();
    const weights = config.weatherWeights;
    
    // Random weighted selection
    const random = Math.random();
    let cumulative = 0;
    
    for (const [weather, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return weather;
      }
    }
    
    return 'sunny'; // Fallback
  }

  // Get time remaining in current season
  getTimeRemaining() {
    const now = Date.now();
    const timeSinceLastChange = now - (this.gameState.season?.lastChangeTime || now);
    const config = this.getCurrentConfig();
    const timeRemaining = Math.max(0, config.duration - timeSinceLastChange);
    
    return {
      milliseconds: timeRemaining,
      seconds: Math.floor(timeRemaining / 1000),
      minutes: Math.floor(timeRemaining / 60000)
    };
  }
}

export default SeasonSystem;
