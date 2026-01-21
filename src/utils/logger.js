/**
 * Centralized Logging Utility
 * 
 * Provides consistent logging across the application with environment-aware
 * output levels and prefixed messages for better debugging.
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

/**
 * Logger class for consistent application logging
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Log an error message
   * @param {string} message - The error message
   * @param {*} data - Optional data to log
   */
  error(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(`[${this.context}] ${message}`, data || '');
    }
  }

  /**
   * Log a warning message
   * @param {string} message - The warning message
   * @param {*} data - Optional data to log
   */
  warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(`[${this.context}] ${message}`, data || '');
    }
  }

  /**
   * Log an info message
   * @param {string} message - The info message
   * @param {*} data - Optional data to log
   */
  info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      console.info(`[${this.context}] ${message}`, data || '');
    }
  }

  /**
   * Log a debug message (only in development)
   * @param {string} message - The debug message
   * @param {*} data - Optional data to log
   */
  debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.debug(`[${this.context}] ${message}`, data || '');
    }
  }

  /**
   * Create a child logger with a new context
   * @param {string} childContext - The child context name
   * @returns {Logger} New logger instance
   */
  child(childContext) {
    return new Logger(`${this.context}:${childContext}`);
  }
}

/**
 * Create a logger instance for a specific context
 * @param {string} context - The context name (e.g., 'FarmGame', 'SaveSystem')
 * @returns {Logger} Logger instance
 */
export function createLogger(context) {
  return new Logger(context);
}

// Export default logger for general use
export default new Logger('FarmLife');

