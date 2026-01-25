/**
 * XP Service - Single Source of Truth for XP Granting
 * 
 * All XP grants MUST go through this service to ensure:
 * - Source tracking (for debugging)
 * - Rate limiting (max XP per minute)
 * - Level-up gating (max level-ups per minute)
 * - Dev-mode warnings when limits exceeded
 * 
 * @module XPService
 */

// Configuration
const XP_CONFIG = {
    maxXpPerMinute: 200,      // Cap on XP earnable per minute
    maxLevelUpsPerMinute: 3,  // Cap on level-ups per minute
    grantHistorySize: 10,     // Number of recent grants to track
    smoothingThreshold: 50,   // XP amounts above this get smoothed
    smoothingChunkSize: 5,    // Size of chunks for smoothed grants
    smoothingIntervalMs: 100, // Interval between smoothed chunks
};

// State for tracking (module-level singleton)
let xpGrantHistory = [];
let xpThisMinute = 0;
let levelUpsThisMinute = 0;
let lastMinuteReset = Date.now();
let lastPlayerInteraction = Date.now();
let pendingSmoothGrants = [];
let smoothingIntervalId = null;

/**
 * Resets per-minute counters if a minute has passed
 * @private
 */
function maybeResetMinuteCounters() {
    const now = Date.now();
    if (now - lastMinuteReset >= 60000) {
        xpThisMinute = 0;
        levelUpsThisMinute = 0;
        lastMinuteReset = now;
    }
}

/**
 * Records a player interaction (call on click, keypress, touch)
 */
export function recordPlayerInteraction() {
    lastPlayerInteraction = Date.now();
}

/**
 * Gets time since last player interaction in ms
 * @returns {number} Milliseconds since last interaction
 */
export function getTimeSinceLastInteraction() {
    return Date.now() - lastPlayerInteraction;
}

/**
 * Checks if player is considered "idle" (no interaction for 60s)
 * @returns {boolean} True if player is idle
 */
export function isPlayerIdle() {
    return getTimeSinceLastInteraction() > 60000;
}

/**
 * Gets the current XP per minute (rolling window)
 * @returns {number} XP earned in the current minute window
 */
export function getXpPerMinute() {
    maybeResetMinuteCounters();
    return xpThisMinute;
}

/**
 * Gets the last N XP grant records
 * @param {number} count - Number of records to return (default: 5)
 * @returns {Array<{amount: number, source: string, timestamp: number}>}
 */
export function getRecentXpGrants(count = 5) {
    return xpGrantHistory.slice(-count);
}

/**
 * Gets level-ups this minute
 * @returns {number}
 */
export function getLevelUpsThisMinute() {
    maybeResetMinuteCounters();
    return levelUpsThisMinute;
}

/**
 * Records a level-up (called by reducer when level increases)
 * @returns {boolean} True if level-up is allowed, false if capped
 */
export function recordLevelUp() {
    maybeResetMinuteCounters();

    if (levelUpsThisMinute >= XP_CONFIG.maxLevelUpsPerMinute) {
        if (import.meta.env.MODE === 'development') {
            console.warn('[XP] Level-up rate limit exceeded:', levelUpsThisMinute, '/', XP_CONFIG.maxLevelUpsPerMinute);
        }
        return false;
    }

    levelUpsThisMinute++;
    return true;
}

/**
 * Creates XP grant action with source tracking and rate limiting
 * 
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} getState - Function to get current state
 * @param {string} SET_XP_ACTION - Action type for setting XP
 * @returns {Function} grantXP function bound to dispatch
 */
export function createXPGranter(dispatch, getState, SET_XP_ACTION) {
    /**
     * Grants XP to the player with source tracking and rate limiting
     * 
     * @param {number} amount - Amount of XP to grant
     * @param {string} source - Source tag for debugging (e.g., 'harvest', 'quest')
     * @param {Object} meta - Optional metadata about the grant
     * @returns {number} Actual XP granted (may be less if rate limited)
     */
    return function grantXP(amount, source, meta = {}) {
        if (typeof amount !== 'number' || amount <= 0) {
            if (import.meta.env.MODE === 'development') {
                console.warn('[XP] Invalid XP amount:', amount, 'from', source);
            }
            return 0;
        }

        maybeResetMinuteCounters();

        // Check idle penalty (reduce XP if player idle for >60s)
        let adjustedAmount = amount;
        if (isPlayerIdle() && !meta.ignoreIdle) {
            adjustedAmount = Math.floor(amount * 0.1); // 90% reduction when idle
            if (import.meta.env.MODE === 'development' && adjustedAmount !== amount) {
                console.debug('[XP] Idle penalty applied:', amount, '->', adjustedAmount);
            }
        }

        // Check rate limit
        const remainingCapacity = XP_CONFIG.maxXpPerMinute - xpThisMinute;
        if (remainingCapacity <= 0) {
            if (import.meta.env.MODE === 'development') {
                console.warn('[XP] Rate limit exceeded. Blocked:', adjustedAmount, 'XP from', source);
            }
            return 0;
        }

        // Cap to remaining capacity
        const actualAmount = Math.min(adjustedAmount, remainingCapacity);
        if (actualAmount < adjustedAmount && import.meta.env.MODE === 'development') {
            console.warn('[XP] Rate limited:', adjustedAmount, '->', actualAmount, 'from', source);
        }

        // Update tracking
        xpThisMinute += actualAmount;
        xpGrantHistory.push({
            amount: actualAmount,
            source,
            meta,
            timestamp: Date.now(),
        });

        // Trim history
        if (xpGrantHistory.length > XP_CONFIG.grantHistorySize) {
            xpGrantHistory = xpGrantHistory.slice(-XP_CONFIG.grantHistorySize);
        }

        // Log in dev mode
        if (import.meta.env.MODE === 'development') {
            console.debug(`[XP] +${actualAmount} (${source})`, meta.cropId ? `crop:${meta.cropId}` : '');
        }

        // Dispatch the XP grant
        dispatch({
            type: SET_XP_ACTION,
            payload: (currentXp) => currentXp + actualAmount,
            meta: { source, ...meta }
        });

        return actualAmount;
    };
}

/**
 * Resets all XP tracking state (for testing or prestige)
 */
export function resetXPTracking() {
    xpGrantHistory = [];
    xpThisMinute = 0;
    levelUpsThisMinute = 0;
    lastMinuteReset = Date.now();
    pendingSmoothGrants = [];
    if (smoothingIntervalId) {
        clearInterval(smoothingIntervalId);
        smoothingIntervalId = null;
    }
}

/**
 * Gets XP configuration (for debug overlay)
 * @returns {Object} Current XP configuration
 */
export function getXPConfig() {
    return { ...XP_CONFIG };
}

/**
 * Gets current XP tracking state (for debug overlay)
 * @returns {Object} Current tracking state
 */
export function getXPTrackingState() {
    maybeResetMinuteCounters();
    return {
        xpThisMinute,
        levelUpsThisMinute,
        recentGrants: getRecentXpGrants(5),
        timeSinceInteraction: getTimeSinceLastInteraction(),
        isIdle: isPlayerIdle(),
    };
}
