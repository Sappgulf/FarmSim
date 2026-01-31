/**
 * Calendar System - In-game day/week tracking with event-driven day rollover
 * Day duration is configurable via settings (Slow/Normal/Fast)
 * This is the source of truth for rotations and festivals
 */

// Day names for display
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Configuration
export const CALENDAR_CONFIG = {
    dayDurationMs: 8 * 60 * 1000, // Default: 8 minutes per in-game day
    daysPerWeek: 7,
    daysPerSeason: 28, // 4 weeks per season
};

// Day length options for user setting
export const DAY_LENGTH_OPTIONS = {
    slow: { label: 'Slow', durationMs: 12 * 60 * 1000, description: '12 minutes per day' },
    normal: { label: 'Normal', durationMs: 8 * 60 * 1000, description: '8 minutes per day' },
    fast: { label: 'Fast', durationMs: 4 * 60 * 1000, description: '4 minutes per day' },
};

/**
 * Get day duration in milliseconds based on setting
 * @param {string} dayLengthSetting - 'slow', 'normal', or 'fast'
 * @returns {number} Duration in milliseconds
 */
export function getDayDurationMs(dayLengthSetting) {
    return DAY_LENGTH_OPTIONS[dayLengthSetting]?.durationMs || CALENDAR_CONFIG.dayDurationMs;
}

/**
 * Get day name from dayOfWeek (1-7)
 * @param {number} dayOfWeek - Day of week (1 = Monday, 7 = Sunday)
 * @param {boolean} short - Use short name
 * @returns {string} Day name
 */
export function getDayName(dayOfWeek, short = false) {
    const index = Math.max(0, Math.min(6, dayOfWeek - 1));
    return short ? DAY_NAMES_SHORT[index] : DAY_NAMES[index];
}

/**
 * Seeded random number generator for deterministic selection
 * @param {number} seed - Seed value
 * @returns {function} Random function that returns 0-1
 */
function seededRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

/**
 * Calendar System Class
 * Tracks in-game days and triggers day rollover events
 */
export class CalendarSystem {
    constructor(gameState, gameActions) {
        this.gameState = gameState;
        this.actions = gameActions;
    }

    /**
     * Update calendar state - called from game loop
     * Only advances day when enough real time has passed
     * @param {Object} currentState - Current game state
     */
    update(currentState) {
        this.gameState = currentState;

        // Initialize calendar if not present
        if (!this.gameState.calendar) {
            this.actions.updateCalendar({
                dayNumber: 1,
                dayOfWeek: 1,
                weekNumber: 1,
                seasonDay: 1,
                lastAdvance: Date.now(),
            });
            return;
        }

        // Check if it's time to advance the day
        const now = Date.now();
        const timeSinceLastAdvance = now - (this.gameState.calendar.lastAdvance || now);

        // Get day duration from user settings (supports Slow/Normal/Fast)
        const dayLengthSetting = this.gameState.settings?.dayLength || 'normal';
        const dayDuration = getDayDurationMs(dayLengthSetting);

        if (timeSinceLastAdvance >= dayDuration) {
            this.advanceDay();
        }
    }

    /**
     * Advance to the next day
     * Triggers rotation and festival updates
     */
    advanceDay() {
        const calendar = this.gameState.calendar || {
            dayNumber: 1,
            dayOfWeek: 1,
            weekNumber: 1,
            seasonDay: 1,
        };

        const newDayNumber = calendar.dayNumber + 1;
        const newDayOfWeek = ((calendar.dayOfWeek % CALENDAR_CONFIG.daysPerWeek) + 1) || 1;
        const newSeasonDay = ((calendar.seasonDay % CALENDAR_CONFIG.daysPerSeason) + 1) || 1;

        // Check if we're starting a new week (dayOfWeek wraps from 7 to 1)
        const isNewWeek = newDayOfWeek === 1;
        const newWeekNumber = isNewWeek ? calendar.weekNumber + 1 : calendar.weekNumber;

        const newCalendar = {
            dayNumber: newDayNumber,
            dayOfWeek: newDayOfWeek,
            weekNumber: newWeekNumber,
            seasonDay: newSeasonDay,
            lastAdvance: Date.now(),
        };

        if (import.meta.env.MODE === 'development') {
            console.debug('[farm] Day advanced:', newDayNumber, 'Week:', newWeekNumber, 'DayOfWeek:', getDayName(newDayOfWeek));
        }

        // Update calendar state
        this.actions.updateCalendar(newCalendar);

        // Trigger day rollover notification
        this.actions.addNotification({
            message: `☀️ Day ${newDayNumber} begins! (${getDayName(newDayOfWeek)})`,
            type: 'info',
        });

        // If new week, update festival
        if (isNewWeek) {
            this.updateWeeklyFestival(newWeekNumber);
        }

        // Emit global event for other systems (rotation engine, etc.)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('farm:dayRollover', {
                detail: { calendar: newCalendar, isNewWeek },
            }));
        }
    }

    /**
     * Update weekly festival based on week number
     * Uses seeded RNG for deterministic selection
     * @param {number} weekNumber - Current week number
     */
    updateWeeklyFestival(weekNumber) {
        const festivals = [
            { id: 'harvest_festival', name: 'Harvest Festival', emoji: '🌾', effect: 'harvest_bonus', value: 1.15 },
            { id: 'rain_week', name: 'Rain Week', emoji: '🌧️', effect: 'auto_water', value: true },
            { id: 'market_week', name: 'Market Week', emoji: '💰', effect: 'sell_bonus', value: 1.20 },
            { id: 'growth_spurt', name: 'Growth Spurt', emoji: '🌱', effect: 'growth_bonus', value: 1.25 },
        ];

        // Seeded selection based on week number
        const random = seededRandom(weekNumber * 7919);
        const festivalIndex = Math.floor(random() * festivals.length);
        const selectedFestival = festivals[festivalIndex];

        if (import.meta.env.MODE === 'development') {
            console.debug('[farm] Festival changed:', selectedFestival.name, 'for week', weekNumber);
        }

        this.actions.updateFestival(selectedFestival);

        this.actions.addNotification({
            message: `${selectedFestival.emoji} ${selectedFestival.name} begins! Enjoy the week's bonus!`,
            type: 'success',
        });
    }

    /**
     * Get current calendar state
     * @returns {Object} Calendar state
     */
    getCalendar() {
        return this.gameState.calendar || {
            dayNumber: 1,
            dayOfWeek: 1,
            weekNumber: 1,
            seasonDay: 1,
        };
    }

    /**
     * Get time remaining until next day (for UI display)
     * @returns {Object} Time remaining in ms, seconds, minutes
     */
    getTimeUntilNextDay() {
        const lastAdvance = this.gameState.calendar?.lastAdvance || Date.now();
        const elapsed = Date.now() - lastAdvance;
        const dayLengthSetting = this.gameState.settings?.dayLength || 'normal';
        const dayDuration = getDayDurationMs(dayLengthSetting);
        const remaining = Math.max(0, dayDuration - elapsed);

        return {
            milliseconds: remaining,
            seconds: Math.floor(remaining / 1000),
            minutes: Math.floor(remaining / 60000),
            formatted: `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`,
        };
    }
}

export default CalendarSystem;
