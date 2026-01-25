/**
 * Notification Service - Enhanced notification management
 * 
 * Provides:
 * - Priority levels (critical > warning > success > info)
 * - Merging of duplicate notifications
 * - Sticky notifications that persist until closed
 * - Duration customization
 * 
 * @module NotificationService
 */

// Priority levels (higher = more important)
export const NOTIFICATION_PRIORITY = {
    info: 0,
    success: 1,
    warning: 2,
    error: 3,
    critical: 4,
};

// Default durations by type
const DEFAULT_DURATIONS = {
    info: 3000,
    success: 4000,
    warning: 5000,
    error: 6000,
    critical: 10000,
};

/**
 * Generates a unique notification ID
 * @returns {string}
 */
function generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates an enhanced notification object
 * 
 * @param {string} type - Notification type: info, success, warning, error, critical
 * @param {string} message - Notification message
 * @param {Object} options - Optional configuration
 * @param {number} options.duration - Display duration in ms (default based on type)
 * @param {boolean} options.sticky - If true, notification persists until closed
 * @param {string} options.mergeKey - If set, merges with existing notification with same key
 * @param {Object} options.details - Additional details to display
 * @returns {Object} Enhanced notification object
 */
export function createNotification(type, message, options = {}) {
    const {
        duration = DEFAULT_DURATIONS[type] || 5000,
        sticky = false,
        mergeKey = null,
        details = null,
    } = options;

    return {
        id: generateId(),
        type,
        message,
        priority: NOTIFICATION_PRIORITY[type] || 0,
        duration: sticky ? null : duration,
        sticky,
        mergeKey,
        details,
        createdAt: Date.now(),
        expiresAt: sticky ? null : Date.now() + duration,
    };
}

/**
 * Merges a new notification into an existing list
 * - If mergeKey matches, updates existing notification
 * - If critical, ensures only one critical visible
 * - Sorts by priority (highest first)
 * 
 * @param {Array} existingNotifications - Current notification list
 * @param {Object} newNotification - New notification to add
 * @param {number} maxVisible - Maximum notifications to keep (default: 5)
 * @returns {Array} Updated notification list
 */
export function mergeNotification(existingNotifications, newNotification, maxVisible = 5) {
    let notifications = [...existingNotifications];

    // Handle merging by mergeKey
    if (newNotification.mergeKey) {
        const existingIndex = notifications.findIndex(n => n.mergeKey === newNotification.mergeKey);
        if (existingIndex >= 0) {
            // Update existing notification (refresh timer and count)
            const existing = notifications[existingIndex];
            notifications[existingIndex] = {
                ...existing,
                message: newNotification.message,
                createdAt: Date.now(),
                expiresAt: newNotification.sticky ? null : Date.now() + (newNotification.duration || 5000),
                count: (existing.count || 1) + 1,
            };
            return sortByPriority(notifications);
        }
    }

    // For critical notifications, remove existing criticals
    if (newNotification.priority === NOTIFICATION_PRIORITY.critical) {
        notifications = notifications.filter(n => n.priority !== NOTIFICATION_PRIORITY.critical);
    }

    // Add new notification
    notifications.push(newNotification);

    // Sort by priority and trim to max visible
    notifications = sortByPriority(notifications);
    if (notifications.length > maxVisible) {
        // Keep higher priority notifications, remove oldest low priority
        notifications = notifications.slice(0, maxVisible);
    }

    return notifications;
}

/**
 * Sorts notifications by priority (highest first), then by creation time
 * @param {Array} notifications 
 * @returns {Array}
 */
export function sortByPriority(notifications) {
    return [...notifications].sort((a, b) => {
        // Higher priority first
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        // More recent first
        return b.createdAt - a.createdAt;
    });
}

/**
 * Removes expired notifications
 * @param {Array} notifications 
 * @returns {Array}
 */
export function removeExpired(notifications) {
    const now = Date.now();
    return notifications.filter(n => n.sticky || !n.expiresAt || n.expiresAt > now);
}

/**
 * Removes a notification by ID
 * @param {Array} notifications 
 * @param {string} id 
 * @returns {Array}
 */
export function removeNotification(notifications, id) {
    return notifications.filter(n => n.id !== id);
}

/**
 * Gets visible notifications (filtered and sorted)
 * @param {Array} notifications 
 * @param {number} maxVisible 
 * @returns {Array}
 */
export function getVisibleNotifications(notifications, maxVisible = 5) {
    const active = removeExpired(notifications);
    const sorted = sortByPriority(active);
    return sorted.slice(0, maxVisible);
}

/**
 * Creates a pushNotification action creator for use with dispatch
 * @param {Function} dispatch - Redux-style dispatch function
 * @param {string} ADD_NOTIFICATION_ACTION - Action type
 * @returns {Function} pushNotification function
 */
export function createNotificationPusher(dispatch, ADD_NOTIFICATION_ACTION) {
    /**
     * Pushes a notification with enhanced options
     * 
     * @param {string} type - info, success, warning, error, critical
     * @param {string} message - Notification message
     * @param {Object} options - { duration, sticky, mergeKey, details }
     */
    return function pushNotification(type, message, options = {}) {
        const notification = createNotification(type, message, options);

        if (import.meta.env.MODE === 'development') {
            console.debug('[Notification]', type, message, options.mergeKey ? `(merge:${options.mergeKey})` : '');
        }

        dispatch({
            type: ADD_NOTIFICATION_ACTION,
            payload: notification,
        });

        return notification.id;
    };
}
