/**
 * FEEDBACK CORE
 * Senior UX Animation System - Ex-Riot, Ex-Supercell
 * 
 * Philosophy: Inform without intrude. Surgical calm.
 * 
 * Eliminates:
 * - Growth shake/jitter
 * - Notification spam
 * - Over-eager scale pops
 * 
 * Replaces with:
 * - Subtle breathe animations
 * - Smart notification queue
 * - Capped, gentle pops
 */

export const FeedbackCore = {
  CONFIG: {
    // Growth - subtle breathe replaces shake
    growth: {
      duration: 1100, // 1.1s - organic feel
      ease: 'easeOutQuart',
      breathe: 0.03, // 3% scale variation - barely perceptible
    },
    
    // Notifications - queue + debounce
    notify: {
      maxQueue: 3, // Max 3 visible notifications
      fadeIn: 220, // 0.22s entry
      hold: 900, // 0.9s visible
      fadeOut: 350, // 0.35s exit
      debounceMs: 300, // Minimum time between notifications
    },
    
    // Pop animations - capped at 1.12
    pop: {
      scale: 1.11, // 11% max - satisfying but not startling
      duration: 320, // 0.32s total
      ease: 'easeOutBack',
    },
    
    // Coin animations
    coin: {
      arcDuration: 450,
      scaleMax: 1.08, // Smaller than pop
    },
    
    // Combo badge
    combo: {
      scale: 1.12, // Capped at 12%
      pulseScale: 1.06, // 6% pulse - micro feedback
    },
  },

  // Internal state
  queue: [],
  lastNotificationTime: 0,
  activeNotifications: new Set(),

  /**
   * Subtle growth breathe (replaces shake)
   * @param {HTMLElement} plotElement - Plot DOM element
   */
  grow(plotElement) {
    if (!plotElement) return;
    
    const { duration, breathe } = this.CONFIG.growth;
    
    // Apply CSS animation class
    plotElement.classList.add('growing-breathe');
    
    // Remove after animation completes
    setTimeout(() => {
      plotElement.classList.remove('growing-breathe');
    }, duration);
  },

  /**
   * Gentle pop animation (combo, coin, etc.)
   * @param {HTMLElement} element - Element to pop
   * @param {Object} options - { scale, duration }
   */
  pop(element, options = {}) {
    if (!element) return;
    
    const scale = options.scale || this.CONFIG.pop.scale;
    const duration = options.duration || this.CONFIG.pop.duration;
    
    // Cap scale at 1.12
    const cappedScale = Math.min(scale, 1.12);
    
    // Apply inline animation
    element.style.transition = `transform ${duration * 0.5}ms ${this.CONFIG.pop.ease}, opacity ${duration * 0.5}ms ease-out`;
    element.style.transform = `scale(${cappedScale})`;
    element.style.opacity = '1';
    
    // Settle
    setTimeout(() => {
      element.style.transition = `transform ${duration * 0.5}ms ease-out`;
      element.style.transform = 'scale(1)';
    }, duration * 0.5);
  },

  /**
   * Smart notification queue
   * @param {string} message - Notification text
   * @param {string} type - 'info' | 'success' | 'warning' | 'error'
   * @param {Function} createElement - Function to create notification DOM element
   * @param {Function} removeElement - Function to remove notification DOM element
   */
  notify(message, type = 'info', createElement, removeElement) {
    const now = Date.now();
    const { debounceMs, maxQueue } = this.CONFIG.notify;
    
    // Debounce rapid notifications
    if (now - this.lastNotificationTime < debounceMs) {
      return;
    }
    
    // Limit queue size
    if (this.queue.length >= maxQueue) {
      const oldest = this.queue.shift();
      if (oldest && removeElement) {
        removeElement(oldest.id);
      }
    }
    
    // Create notification element
    const notification = {
      id: `notify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      element: null,
      createdAt: now,
    };
    
    if (createElement) {
      notification.element = createElement(notification);
    }
    
    this.queue.push(notification);
    this.activeNotifications.add(notification.id);
    this.lastNotificationTime = now;
    
    // Show with animation
    this.showQueued(notification, removeElement);
    
    return notification;
  },

  /**
   * Show queued notification with smooth animation
   * @param {Object} notification - Notification object
   * @param {Function} removeElement - Function to remove element
   */
  showQueued(notification, removeElement) {
    if (!notification.element) return;
    
    const { fadeIn, hold, fadeOut } = this.CONFIG.notify;
    const el = notification.element;

    // Defensive: callers in React-land may pass non-DOM "elements".
    // In that case, skip animation rather than crashing the whole app.
    if (!el || !el.style) {
      this.queue = this.queue.filter(n => n.id !== notification.id);
      this.activeNotifications.delete(notification.id);
      if (removeElement) removeElement(notification.id);
      return;
    }
    
    // Initial state (off-screen, transparent)
    el.style.transform = 'translateY(-40px)';
    el.style.opacity = '0';
    el.style.transition = `transform ${fadeIn}ms ease-out, opacity ${fadeIn}ms ease-out`;
    
    // Fade in
    requestAnimationFrame(() => {
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    });
    
    // Hold, then fade out
    setTimeout(() => {
      el.style.transition = `transform ${fadeOut}ms ease-in, opacity ${fadeOut}ms ease-in`;
      el.style.transform = 'translateY(-20px)';
      el.style.opacity = '0';
      
      // Remove after fade out
      setTimeout(() => {
        this.queue = this.queue.filter(n => n.id !== notification.id);
        this.activeNotifications.delete(notification.id);
        if (removeElement) {
          removeElement(notification.id);
        }
      }, fadeOut);
    }, fadeIn + hold);
  },

  /**
   * Clean growth animation (no shake, just breathe)
   * Replaces all growth stage animations
   */
  onGrowthStage(plotElement, stage) {
    if (!plotElement) return;
    
    // Use subtle breathe instead of jitter
    this.grow(plotElement);
    
    // Optional: gentle stem sway (1.5deg max)
    const stem = plotElement.querySelector('.stem');
    if (stem) {
      const rotation = stage % 2 === 0 ? 1.5 : -1.5;
      stem.style.transform = `rotate(${rotation}deg)`;
      stem.style.transition = 'transform 0.4s ease-out';
    }
  },

  /**
   * Clear all notifications
   */
  clearQueue() {
    this.queue = [];
    this.activeNotifications.clear();
  },
};

// Export config for CSS generation
export const FEEDBACK_CORE_CSS = `
/* FeedbackCore - Subtle Breathe Animation */
@keyframes subtleBreathe {
  0%, 100% { 
    transform: scale(1); 
  }
  60% { 
    transform: scale(1.03); 
  }
}

.growing-breathe {
  animation: subtleBreathe 1.1s ease-out;
  will-change: transform;
}

/* Notification polish */
.notify-core {
  will-change: transform, opacity;
  pointer-events: none;
  font-weight: 500;
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.12);
}
`;
