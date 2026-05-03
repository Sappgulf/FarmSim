/**
 * Performance Settings Module
 * Provides quality presets and runtime performance controls
 *
 * USAGE:
 * import { perfConfig, setQualityPreset } from '@/performance';
 *
 * // Get current setting
 * if (perfConfig.particles.enabled) { ... }
 *
 * // Change preset
 * setQualityPreset('low');
 */

// Default configuration (High quality)
const DEFAULT_CONFIG = {
  quality: 'high', // 'low', 'medium', 'high'

  particles: {
    enabled: true,
    maxCount: 150,
    harvestCount: 60,
    levelupCount: 100,
  },

  animations: {
    enabled: true,
    durationMultiplier: 1.0, // 0.5 for fast, 1.0 for normal
  },

  rendering: {
    targetFPS: 60,
    systemUpdateFPS: 10,
  },

  // Guardrails
  limits: {
    maxEntities: 200,
    maxNotifications: 10,
    maxPlots: 100,
  },

  // Auto-reduce effects on low FPS
  adaptiveQuality: {
    enabled: true,
    fpsThreshold: 30, // If FPS drops below this, reduce effects
  },
};

// Quality presets
const QUALITY_PRESETS = {
  low: {
    quality: 'low',
    particles: { enabled: true, maxCount: 30, harvestCount: 15, levelupCount: 25 },
    animations: { enabled: true, durationMultiplier: 0.5 },
    rendering: { targetFPS: 30, systemUpdateFPS: 5 },
    limits: { maxEntities: 100, maxNotifications: 5, maxPlots: 50 },
    adaptiveQuality: { enabled: true, fpsThreshold: 20 },
  },
  medium: {
    quality: 'medium',
    particles: { enabled: true, maxCount: 75, harvestCount: 30, levelupCount: 50 },
    animations: { enabled: true, durationMultiplier: 0.8 },
    rendering: { targetFPS: 45, systemUpdateFPS: 8 },
    limits: { maxEntities: 150, maxNotifications: 8, maxPlots: 75 },
    adaptiveQuality: { enabled: true, fpsThreshold: 25 },
  },
  high: { ...DEFAULT_CONFIG },
};

// Current active config (mutable)
let perfConfig = { ...DEFAULT_CONFIG };

/**
 * Set quality preset
 * @param {'low' | 'medium' | 'high'} preset - Quality level
 */
function setQualityPreset(preset) {
  const presetConfig = QUALITY_PRESETS[preset];
  if (!presetConfig) {
    console.warn(`[perf] Unknown preset: ${preset}`);
    return;
  }

  perfConfig = { ...presetConfig };

  // Notify global listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('perfConfigChanged', { detail: perfConfig }));
  }

  console.log(`[perf] Quality set to: ${preset}`);
}

/**
 * Get current config value
 * @param {string} path - Dot-notation path (e.g., 'particles.maxCount')
 * @returns {any} Config value
 */
function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], perfConfig);
}

/**
 * Update individual config value
 * @param {string} path - Dot-notation path
 * @param {any} value - New value
 */
function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, perfConfig);
  target[lastKey] = value;
}

/**
 * Check if entity count is within limits
 * @param {number} count - Current entity count
 * @param {string} type - Entity type ('entities', 'notifications', 'plots')
 * @returns {boolean} True if within limits
 */
function withinLimit(count, type = 'entities') {
  const limitKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const limit = perfConfig.limits[limitKey] || 100;

  if (count >= limit * 0.9) {
    console.warn(`[perf] ${type} count (${count}) approaching limit (${limit})`);
  }

  return count < limit;
}

/**
 * Handle low FPS by reducing quality
 * @param {number} currentFPS - Current FPS reading
 */
function handleAdaptiveQuality(currentFPS) {
  if (!perfConfig.adaptiveQuality.enabled) return;

  if (currentFPS < perfConfig.adaptiveQuality.fpsThreshold) {
    // Reduce particle count
    perfConfig.particles.maxCount = Math.max(10, Math.floor(perfConfig.particles.maxCount * 0.8));
    console.log(`[perf] Adaptive: Reduced particles to ${perfConfig.particles.maxCount}`);
  }
}

// Expose globals for overlay
if (typeof window !== 'undefined') {
  window.__perfConfig = perfConfig;
}

export {
  perfConfig,
  setQualityPreset,
  getConfig,
  setConfig,
  withinLimit,
  handleAdaptiveQuality,
  QUALITY_PRESETS,
};

export default perfConfig;
