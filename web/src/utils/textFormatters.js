/**
 * Text Formatting Utilities
 * Safe display formatters for converting internal IDs/keys to user-friendly text
 *
 * IMPORTANT: These formatters are for DISPLAY ONLY. Never use them on:
 * - Database/save IDs
 * - Internal state keys
 * - API parameters
 * - Event names
 */

/**
 * Converts snake_case or SCREAMING_SNAKE_CASE to Title Case
 * Examples:
 *   "pet_food" → "Pet Food"
 *   "pest_prevention" → "Pest Prevention"
 *   "crop_quality" → "Crop Quality"
 *   "DAILY_EGGS" → "Daily Eggs"
 *
 * @param {string} text - The snake_case text to format
 * @returns {string} Title Case text
 */
export function formatDisplayText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts snake_case to Sentence case (first word capitalized)
 * Examples:
 *   "pet_food_needed" → "Pet food needed"
 *   "harvest_all_crops" → "Harvest all crops"
 *
 * @param {string} text - The snake_case text to format
 * @returns {string} Sentence case text
 */
export function formatSentence(text) {
  if (!text || typeof text !== 'string') return '';

  const words = text.toLowerCase().split('_');
  if (words.length === 0) return '';

  // Capitalize first word only
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return words.join(' ');
}

/**
 * Formats a number with commas for readability
 * Examples:
 *   1000 → "1,000"
 *   1000000 → "1,000,000"
 *
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Formats currency with coin symbol
 * Examples:
 *   100 → "100 🪙"
 *   1000 → "1,000 🪙"
 *
 * @param {number} amount - The coin amount
 * @param {string} symbol - Currency symbol (default: 🪙)
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, symbol = '🪙') {
  return `${formatNumber(amount)} ${symbol}`;
}

/**
 * Formats a percentage value
 * Examples:
 *   0.5 → "50%"
 *   0.123 → "12.3%"
 *   1.5 → "150%"
 *
 * @param {number} value - Decimal percentage value (0.5 = 50%)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a time duration in seconds to human-readable format
 * Examples:
 *   30 → "30s"
 *   90 → "1m 30s"
 *   3600 → "1h"
 *   3661 → "1h 1m 1s"
 *
 * @param {number} seconds - Duration in seconds
 * @param {boolean} shortForm - Use short form (h/m/s) vs long (hours/minutes/seconds)
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds, shortForm = true) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}${shortForm ? 'h' : ` hour${hours !== 1 ? 's' : ''}`}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}${shortForm ? 'm' : ` minute${minutes !== 1 ? 's' : ''}`}`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}${shortForm ? 's' : ` second${secs !== 1 ? 's' : ''}`}`);
  }

  return parts.join(' ');
}

/**
 * Truncates text with ellipsis if longer than max length
 * Examples:
 *   truncateText("This is a long text", 10) → "This is a..."
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Creates a good empty state message
 * Examples:
 *   emptyStateMessage("pets", "adopt your first pet from the Shop")
 *   → "No pets yet—here's how to get started: adopt your first pet from the Shop."
 *
 * @param {string} itemName - Name of the missing items (plural)
 * @param {string} helpText - Suggestion for next action
 * @returns {string} Friendly empty state message
 */
export function emptyStateMessage(itemName, helpText) {
  const name = itemName || 'items';
  const help = helpText ? ` Here's how to get started: ${helpText}` : '';
  return `No ${name} yet.${help}`;
}

/**
 * Formats a trait or bonus name with its value
 * Examples:
 *   formatTrait("pest_prevention", 0.3) → "Pest Prevention: 30%"
 *   formatTrait("daily_eggs", 2) → "Daily Eggs: 2"
 *
 * @param {string} traitName - The snake_case trait name
 * @param {number|string} value - The trait value
 * @param {boolean} isPercentage - Whether value is a percentage
 * @returns {string} Formatted trait display
 */
export function formatTrait(traitName, value, isPercentage = false) {
  const displayName = formatDisplayText(traitName);
  const displayValue = isPercentage
    ? formatPercentage(value)
    : typeof value === 'number'
      ? value
      : value;

  return `${displayName}: ${displayValue}`;
}

/**
 * Safe object key formatter - formats display while preserving original
 * Returns an object with both the original key and formatted display text
 *
 * @param {string} key - The original key (preserved)
 * @returns {{ key: string, display: string }} Object with key and display
 */
export function formatKeyDisplay(key) {
  return {
    key: key,
    display: formatDisplayText(key),
  };
}

/**
 * Batch format an array of keys for display
 * @param {string[]} keys - Array of snake_case keys
 * @returns {Array<{key: string, display: string}>} Array of formatted objects
 */
export function formatKeysForDisplay(keys) {
  if (!Array.isArray(keys)) return [];
  return keys.map((key) => formatKeyDisplay(key));
}
