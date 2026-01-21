/**
 * FEEDBACK POLISHER
 * Premium animation system for farming game feedback loops
 * 
 * Design Philosophy:
 * - Subtle luxury over arcade-carnival
 * - Perceived smoothness > raw performance
 * - Easing curves based on player perception studies (Juul 2010, Isbister 2016)
 * 
 * Easing Rationale:
 * - easeOutBack: Creates anticipation without overshoot (perceived as premium)
 * - easeInSine: Natural deceleration (matches organic growth perception)
 * - 0.35s entry + 0.18s settle: Optimal for 60fps without feeling sluggish
 */

// DESIGNER CONFIG - Tweak without code changes
export const FEEDBACK_CONFIG = {
  // Timing (ms) - Based on 60fps frame timing (16.67ms per frame)
  entryDuration: 350,        // 21 frames - enough for smooth easing
  settleDuration: 180,      // 11 frames - quick settle feels responsive
  comboPulseDuration: 50,   // 3 frames - micro-feedback feels premium
  comboFadeDelay: 1200,    // Auto-fade if no new combo within 1.2s
  
  // Amplitude - Subtlety is key (player perception threshold ~10px)
  maxScale: 1.18,           // 18% overshoot - visible but not jarring
  maxYOffset: 12,           // 12px max movement - stays within plot bounds
  comboPulseScale: 1.08,    // 8% pulse - micro-feedback
  
  // Sound
  baseVolume: 0.30,         // 30% - audible but not aggressive
  pitchStep: 0.05,          // +5% per combo step
  maxPitchBoost: 0.25,      // Cap at +25% to avoid chipmunk effect
  
  // Coin arc
  coinArcDuration: 450,     // 0.45s - smooth bezier arc
  coinArcHeight: 60,        // Peak arc height in px
  
  // Plant animation
  seedDropDuration: 280,    // 0.28s - quick but visible
  stemGrowDuration: 900,    // 0.9s - organic growth feel
  leafFlickAt: 0.60,        // 60% growth - natural timing
  
  // Screen shake (disabled by default, only for 5x+ combo)
  shakeEnabled: false,
  shakeThreshold: 5,         // Only shake at 5x combo or higher
  shakeAmount: 1,           // 1px micro-shake - barely perceptible
};

/**
 * Easing functions
 * Cubic bezier approximations for CSS compatibility
 */
export const EASING = {
  // easeOutBack - Overshoot then settle (premium feel)
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  // easeInSine - Natural deceleration
  easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
  
  // easeOutQuad - Smooth deceleration
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  
  // easeInOutCubic - Balanced for transitions
  easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
};

/**
 * Calculate bezier curve points for coin arc
 * @param {number} t - Progress (0-1)
 * @param {number} startX - Start X position
 * @param {number} startY - Start Y position
 * @param {number} endX - End X position
 * @param {number} endY - End Y position
 * @param {number} height - Arc peak height
 * @returns {Object} {x, y}
 */
export function bezierArc(t, startX, startY, endX, endY, height) {
  // Quadratic bezier with control point at peak
  const controlX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - height;
  
  const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
  const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
  
  return { x, y };
}

/**
 * Interpolate value with easing
 * @param {number} t - Progress (0-1)
 * @param {string} easingType - Easing function name
 * @returns {number} Eased progress
 */
export function ease(t, easingType = 'easeOutQuad') {
  // Simplified easing calculations (full implementation would use proper curves)
  switch (easingType) {
    case 'easeOutBack':
      // Overshoot cubic approximation
      return 1 + --t * t * (2.70158 * t + 1.70158);
    case 'easeInSine':
      return 1 - Math.cos((t * Math.PI) / 2);
    case 'easeOutQuad':
      return t * (2 - t);
    default:
      return t;
  }
}

/**
 * Calculate coin counter lerp
 * Smooth number roll instead of instant jump
 * @param {number} current - Current displayed value
 * @param {number} target - Target value
 * @param {number} deltaTime - Time since last frame (ms)
 * @returns {number} Next displayed value
 */
export function lerpCoinCounter(current, target, deltaTime) {
  const speed = 0.15; // Lerp speed (15% per frame at 60fps)
  const diff = target - current;
  if (Math.abs(diff) < 0.01) return target;
  return current + diff * speed * (deltaTime / 16.67); // Normalize to 60fps
}

/**
 * Calculate sound pitch with combo multiplier
 * @param {number} combo - Current combo count
 * @returns {number} Pitch multiplier (1.0 = normal, 1.25 = max boost)
 */
export function getComboPitch(combo) {
  const boost = Math.min(combo * FEEDBACK_CONFIG.pitchStep, FEEDBACK_CONFIG.maxPitchBoost);
  return 1.0 + boost;
}

/**
 * FeedbackPolisher Class
 * Centralized feedback system for premium feel
 */
export class FeedbackPolisher {
  constructor(handlers) {
    this.handlers = handlers; // { addParticle, playSfx, setCoins, etc }
    this.comboBadgeTimeout = null;
    this.coinLerpValue = 0;
    this.lastFrameTime = performance.now();
  }

  /**
   * Show combo badge with gentle pop
   * @param {number} multiplier - Combo multiplier (1x, 2x, etc)
   * @param {Object} position - {x, y} screen coordinates
   */
  popBadge(multiplier, position) {
    // Clear existing timeout
    if (this.comboBadgeTimeout) {
      clearTimeout(this.comboBadgeTimeout);
    }

    // Trigger badge appearance
    if (this.handlers.onComboBadge) {
      this.handlers.onComboBadge({
        multiplier,
        x: position.x,
        y: position.y,
        // Animation config
        scale: [0, FEEDBACK_CONFIG.maxScale, 1.0],
        duration: FEEDBACK_CONFIG.entryDuration,
        settleDuration: FEEDBACK_CONFIG.settleDuration,
        easing: EASING.easeOutBack,
      });
    }

    // Pulse on multiplier increase
    if (multiplier > 1 && this.handlers.onComboPulse) {
      setTimeout(() => {
        this.handlers.onComboPulse({
          scale: FEEDBACK_CONFIG.comboPulseScale,
          opacity: [1, 0.92, 1],
          duration: FEEDBACK_CONFIG.comboPulseDuration,
        });
      }, FEEDBACK_CONFIG.entryDuration);
    }

    // Auto-fade after delay
    this.comboBadgeTimeout = setTimeout(() => {
      if (this.handlers.onComboFade) {
        this.handlers.onComboFade();
      }
    }, FEEDBACK_CONFIG.comboFadeDelay);

    // Sound feedback
    if (this.handlers.playSfx) {
      const pitch = getComboPitch(multiplier);
      this.handlers.playSfx('combo', {
        volume: FEEDBACK_CONFIG.baseVolume,
        pitch,
      });
    }
  }

  /**
   * Plant crop with premium animation
   * @param {number} plotId - Plot index
   * @param {string} cropType - Crop seed type
   * @param {Object} position - {x, y} plot screen coordinates
   */
  plantCrop(plotId, cropType, position) {
    // Seed drop animation
    if (this.handlers.onPlantSeed) {
      this.handlers.onPlantSeed({
        plotId,
        cropType,
        x: position.x,
        y: position.y,
        // Drop animation
        dropDuration: FEEDBACK_CONFIG.seedDropDuration,
        landingBounce: true,
        easing: EASING.easeOutBack,
      });
    }

    // Stem growth animation (triggered after seed lands)
    setTimeout(() => {
      if (this.handlers.onStemGrow) {
        this.handlers.onStemGrow({
          plotId,
          duration: FEEDBACK_CONFIG.stemGrowDuration,
          easing: EASING.easeOutQuad,
          leafFlickAt: FEEDBACK_CONFIG.leafFlickAt,
        });
      }
    }, FEEDBACK_CONFIG.seedDropDuration);

    // Sound feedback
    if (this.handlers.playSfx) {
      this.handlers.playSfx('plant', {
        volume: FEEDBACK_CONFIG.baseVolume,
      });
    }
  }

  /**
   * Spawn coin with bezier arc to HUD
   * @param {number} plotId - Plot index
   * @param {number} value - Coin value
   * @param {Object} startPos - {x, y} plot screen coordinates
   * @param {Object} endPos - {x, y} coin counter HUD position
   */
  spawnCoin(plotId, value, startPos, endPos) {
    const coinId = `coin_${plotId}_${Date.now()}`;
    
    // Animate coin arc
    if (this.handlers.onCoinArc) {
      this.handlers.onCoinArc({
        id: coinId,
        value,
        startX: startPos.x,
        startY: startPos.y,
        endX: endPos.x,
        endY: endPos.y,
        arcHeight: FEEDBACK_CONFIG.coinArcHeight,
        duration: FEEDBACK_CONFIG.coinArcDuration,
        easing: EASING.easeInOutCubic,
        // 3D flip effect (if WebGL available)
        rotateY: 180,
      });
    }

    // Smooth coin counter increment
    // Update counter gradually instead of instant jump
    const targetCoins = (this.handlers.getCoins?.() || 0) + value;
    this.animateCoinCounter(targetCoins);

    // Sound feedback
    if (this.handlers.playSfx) {
      this.handlers.playSfx('coin', {
        volume: FEEDBACK_CONFIG.baseVolume * 0.8, // Slightly quieter
      });
    }
  }

  /**
   * Animate coin counter with smooth lerp
   * @param {number} targetValue - Target coin count
   */
  animateCoinCounter(targetValue) {
    const current = this.coinLerpValue || this.handlers.getCoins?.() || 0;
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Lerp towards target
    this.coinLerpValue = lerpCoinCounter(current, targetValue, deltaTime);
    
    // Update coins (round for display)
    if (this.handlers.setCoins) {
      this.handlers.setCoins(Math.round(this.coinLerpValue));
    }

    // Continue lerping if not at target
    if (Math.abs(this.coinLerpValue - targetValue) > 0.1) {
      requestAnimationFrame(() => this.animateCoinCounter(targetValue));
    } else {
      // Snap to final value
      if (this.handlers.setCoins) {
        this.handlers.setCoins(targetValue);
      }
      this.coinLerpValue = targetValue;
    }
  }

  /**
   * Micro screen shake (only for high combos)
   * @param {number} combo - Combo multiplier
   */
  screenShake(combo) {
    if (!FEEDBACK_CONFIG.shakeEnabled || combo < FEEDBACK_CONFIG.shakeThreshold) {
      return;
    }

    // 1px micro-shake - barely perceptible
    if (this.handlers.onScreenShake) {
      this.handlers.onScreenShake({
        amount: FEEDBACK_CONFIG.shakeAmount,
        duration: 100, // Quick shake
      });
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.comboBadgeTimeout) {
      clearTimeout(this.comboBadgeTimeout);
    }
  }
}

