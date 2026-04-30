/**
 * Performance Settings Module
 * Provides quality presets and runtime performance controls
 *
 * USAGE:
 * import { perfConfig, setQualityPreset } from '@/performance';
 *
 * if (perfConfig.particles.enabled) { ... }
 * setQualityPreset('low');
 */

const ADAPTIVE_STORAGE_KEY = 'farm.perf.adaptiveOverlay.v1';

/** @param {unknown} value */
export function normalizeGraphicsQuality(value) {
    return value === 'low' || value === 'medium' || value === 'high' ? value : 'high';
}

/**
 * Deep clone preset-like plain objects (no functions).
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function duplicatePerfPreset(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_PERF_BLUEPRINT = Object.freeze({
    quality: 'high',

    particles: Object.freeze({
        enabled: true,
        maxCount: 150,
        harvestCount: 60,
        levelupCount: 100,
    }),

    animations: Object.freeze({
        enabled: true,
        durationMultiplier: 1.0,
    }),

    rendering: Object.freeze({
        targetFPS: 60,
        systemUpdateFPS: 10,
    }),

    limits: Object.freeze({
        maxEntities: 200,
        maxNotifications: 10,
        maxPlots: 100,
    }),

    adaptiveQuality: Object.freeze({
        enabled: true,
        fpsThreshold: 30,
    }),
});

/** Isolated presets for each tier (immutable sources). */
const QUALITY_BLUEPRINT = Object.freeze({
    low: Object.freeze({
        quality: 'low',
        particles: Object.freeze({ enabled: true, maxCount: 30, harvestCount: 15, levelupCount: 25 }),
        animations: Object.freeze({ enabled: true, durationMultiplier: 0.5 }),
        rendering: Object.freeze({ targetFPS: 30, systemUpdateFPS: 5 }),
        limits: Object.freeze({ maxEntities: 100, maxNotifications: 5, maxPlots: 50 }),
        adaptiveQuality: Object.freeze({ enabled: true, fpsThreshold: 20 }),
    }),
    medium: Object.freeze({
        quality: 'medium',
        particles: Object.freeze({ enabled: true, maxCount: 75, harvestCount: 30, levelupCount: 50 }),
        animations: Object.freeze({ enabled: true, durationMultiplier: 0.8 }),
        rendering: Object.freeze({ targetFPS: 45, systemUpdateFPS: 8 }),
        limits: Object.freeze({ maxEntities: 150, maxNotifications: 8, maxPlots: 75 }),
        adaptiveQuality: Object.freeze({ enabled: true, fpsThreshold: 25 }),
    }),
    /** High matches default blueprint (cloned on apply, never mutated in place here). */
    high: duplicatePerfPreset(DEFAULT_PERF_BLUEPRINT),
});

// Current active config (mutable snapshot — replace whole object via setQualityPreset)
let perfConfig = duplicatePerfPreset(QUALITY_BLUEPRINT.high);

/**
 * Bump listener revision when tuning fields change (adaptation, overlays, sliders).
 * @param {Record<string, unknown>} extra
 */
function notifyPerfConfigChanged(extra = {}) {
    if (typeof window === 'undefined') return;
    window.__perfConfig = perfConfig;
    window.dispatchEvent(
        new CustomEvent('perfConfigChanged', { detail: { ...extra, perfConfig } }),
    );
}

function clearAdaptivePersistedOverlay() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(ADAPTIVE_STORAGE_KEY);
    } catch {
        /* private mode / quota */
    }
}

/** Call when switching quality preset so old adaptive trims are discarded. */
export function clearAdaptiveParticlePersistence() {
    clearAdaptivePersistedOverlay();
}

/**
 * Persist adaptive particle trims for the active quality preset (localStorage).
 */
export function persistAdaptiveParticleOverlay() {
    if (typeof window === 'undefined') return;
    try {
        const snapshot = {
            v: 1,
            /** @type {'low'|'medium'|'high'} */
            quality: perfConfig.quality,
            particles: duplicatePerfPreset(perfConfig.particles || {}),
        };
        window.localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
        /* ignore */
    }
}

/**
 * Restore saved adaptive overlay if it matches the game's saved quality preset.
 * @param {'low'|'medium'|'high'} currentQualitySetting
 */
export function restoreAdaptiveParticleOverlayIfMatching(currentQualitySetting) {
    if (typeof window === 'undefined') return false;
    try {
        const raw = window.localStorage.getItem(ADAPTIVE_STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data?.v !== 1 || data?.quality !== currentQualitySetting || !data.particles) return false;
        perfConfig.particles = { ...perfConfig.particles, ...data.particles };
        notifyPerfConfigChanged({ reason: 'hydrateAdaptive' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Set quality preset from UI or save hydrate.
 * @param {'low' | 'medium' | 'high'} preset
 */
function setQualityPreset(preset) {
    const source = QUALITY_BLUEPRINT[preset];
    if (!source) {
        console.warn(`[perf] Unknown preset: ${preset}`);
        return;
    }

    perfConfig = duplicatePerfPreset(source);

    notifyPerfConfigChanged({ reason: 'preset', preset });

    console.log(`[perf] Quality set to: ${preset}`);
}

/**
 * @param {string} path - Dot notation
 * @returns {any}
 */
function getConfig(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], perfConfig);
}

/**
 * Update individual nested value (advanced / debug tooling).
 */
function setConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
    }, perfConfig);
    target[lastKey] = value;
    if (path.includes('particles') || path.includes('animations') || path.includes('rendering')) {
        notifyPerfConfigChanged({ reason: 'setConfig', path });
    }
}

function withinLimit(count, type = 'entities') {
    const limitKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const limit = perfConfig.limits[limitKey] || 100;

    if (count >= limit * 0.9) {
        console.warn(`[perf] ${type} count (${count}) approaching limit (${limit})`);
    }

    return count < limit;
}

/**
 * @param {number} currentFPS
 * @returns {boolean}
 */
function handleAdaptiveQuality(currentFPS) {
    if (!perfConfig.adaptiveQuality.enabled) return false;
    if (currentFPS >= perfConfig.adaptiveQuality.fpsThreshold) return false;

    const prevMax = perfConfig.particles.maxCount;
    const nextMax = Math.max(10, Math.floor(prevMax * 0.8));

    perfConfig.particles.maxCount = nextMax;
    perfConfig.particles.harvestCount = Math.max(
        8,
        Math.floor((perfConfig.particles.harvestCount || 60) * 0.85),
    );
    perfConfig.particles.levelupCount = Math.max(
        10,
        Math.floor((perfConfig.particles.levelupCount || 100) * 0.85),
    );

    if (nextMax === prevMax) return false;

    persistAdaptiveParticleOverlay();
    notifyPerfConfigChanged({ reason: 'adaptive', fps: currentFPS });
    console.log(`[perf] Adaptive: Reduced particles to ${perfConfig.particles.maxCount}`);
    return true;
}

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
    QUALITY_BLUEPRINT as QUALITY_PRESETS,
};

export default perfConfig;
