/**
 * NotificationStack Component
 * Displays toast notifications with smooth animations
 *
 * Features:
 * - Auto-dismiss after configurable duration (default 4s)
 * - "sticky" notifications that don't auto-dismiss
 * - Large, visible close button (44px minimum touch target)
 * - Proper timer cleanup on unmount
 * - Mobile-friendly with safe area support
 */
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Coins, Sparkles } from 'lucide-react';

/** Default auto-dismiss duration in ms */
const AUTO_DISMISS_MS = 4000;
/** Exit animation duration in ms */
const EXIT_ANIMATION_MS = 250;

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400',
    text: 'text-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    glow: 'shadow-emerald-200/50',
    closeBg: 'hover:bg-emerald-200/60 active:bg-emerald-300/60',
    closeIcon: 'text-emerald-700',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400',
    text: 'text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600',
    glow: 'shadow-red-200/50',
    closeBg: 'hover:bg-red-200/60 active:bg-red-300/60',
    closeIcon: 'text-red-700',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    glow: 'shadow-amber-200/50',
    closeBg: 'hover:bg-amber-200/60 active:bg-amber-300/60',
    closeIcon: 'text-amber-700',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
    glow: 'shadow-blue-200/50',
    closeBg: 'hover:bg-blue-200/60 active:bg-blue-300/60',
    closeIcon: 'text-blue-700',
  },
  coins: {
    bg: 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-500',
    text: 'text-amber-900',
    icon: Coins,
    iconColor: 'text-amber-700',
    glow: 'shadow-amber-300/50',
    closeBg: 'hover:bg-amber-300/60 active:bg-amber-400/60',
    closeIcon: 'text-amber-800',
  },
  harvest: {
    bg: 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-500',
    text: 'text-green-900',
    icon: Sparkles,
    iconColor: 'text-green-700',
    glow: 'shadow-green-300/50',
    closeBg: 'hover:bg-green-300/60 active:bg-green-400/60',
    closeIcon: 'text-green-800',
  },
};

function NotificationComponent({ notification, onDismiss, index }) {
  const [isExiting, setIsExiting] = useState(false);
  const dismissTimerRef = useRef(null);
  const exitTimerRef = useRef(null);

  // Determine notification type from message content or explicit type
  const type = (() => {
    if (notification.type && NOTIFICATION_STYLES[notification.type]) {
      return notification.type;
    }
    // Auto-detect from message content
    const msg = notification.message || '';
    if (msg.includes('🪙') || msg.toLowerCase().includes('coins')) return 'coins';
    if (msg.includes('🎉') || msg.toLowerCase().includes('harvest')) return 'harvest';
    return notification.type || 'info';
  })();

  const style = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info;
  const Icon = style.icon;

  // Whether this notification should auto-dismiss
  const isSticky = notification.sticky === true;

  // Handle manual dismiss with exit animation
  const handleDismiss = useCallback(() => {
    if (isExiting) return;

    // Clear any pending auto-dismiss
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    setIsExiting(true);

    // After exit animation, remove from state
    exitTimerRef.current = setTimeout(() => {
      onDismiss?.(notification.id);
    }, EXIT_ANIMATION_MS);
  }, [isExiting, notification.id, onDismiss]);

  // Auto-dismiss timer (only for non-sticky notifications)
  useEffect(() => {
    if (isSticky) return;

    const duration = notification.duration || AUTO_DISMISS_MS;

    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [isSticky, notification.duration, handleDismiss]);

  // Animation duration for progress bar (matches dismiss timer)
  const progressDuration = isSticky ? 0 : notification.duration || AUTO_DISMISS_MS;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border-2
        shadow-lg ${style.glow} backdrop-blur-sm
        ${style.bg}
        transform transition-all duration-200 ease-out
        ${isExiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'}
      `}
      style={{
        animation: `slideInRight 0.3s ease-out ${index * 50}ms both`,
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className={`
        p-1.5 rounded-full bg-white/70 shadow-sm flex-shrink-0
        ${type === 'coins' || type === 'harvest' ? 'animate-pulse' : ''}
      `}
      >
        <Icon size={18} className={style.iconColor} />
      </div>

      {/* Message */}
      <span className={`text-sm font-medium flex-1 ${style.text} leading-tight`}>
        {notification.message}
      </span>

      {/* Close button - Large touch target (44px minimum) */}
      <button
        onClick={handleDismiss}
        className={`
          flex-shrink-0
          w-11 h-11 min-w-[44px] min-h-[44px]
          flex items-center justify-center
          rounded-full
          ${style.closeBg}
          transition-all duration-150
          active:scale-90
          touch-manipulation
          z-10
        `}
        aria-label="Dismiss notification"
        type="button"
      >
        <X size={20} className={`${style.closeIcon} drop-shadow-sm`} strokeWidth={2.5} />
      </button>

      {/* Progress bar for auto-dismiss (hidden for sticky) */}
      {!isSticky && progressDuration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl bg-black/5">
          <div
            className="h-full bg-black/15 animate-shrink-progress origin-left"
            style={{
              animationDuration: `${progressDuration}ms`,
              animationPlayState: isExiting ? 'paused' : 'running',
            }}
          />
        </div>
      )}

      {/* Sticky indicator */}
      {isSticky && (
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse"
          title="This notification won't auto-dismiss"
        />
      )}
    </div>
  );
}

function NotificationStackComponent({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  // Limit visible notifications to prevent screen overflow
  const maxVisible = 4;
  const visibleNotifications = notifications.slice(0, maxVisible);
  const hiddenCount = Math.max(0, notifications.length - maxVisible);

  return (
    <div
      className="
        fixed z-50
        flex flex-col gap-2
        pointer-events-none
        
        /* Desktop: top-right corner */
        top-4 right-4
        max-w-sm w-full
        
        /* Mobile: full width with safe area padding */
        max-sm:top-0 max-sm:right-0 max-sm:left-0 
        max-sm:max-w-none max-sm:px-2
      "
      style={{
        // Respect safe area on mobile (notch, dynamic island, etc.)
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
      }}
      role="region"
      aria-label="Notifications"
    >
      {visibleNotifications.map((notification, index) => (
        <div key={notification.id} className="pointer-events-auto relative">
          <NotificationComponent notification={notification} onDismiss={onDismiss} index={index} />
        </div>
      ))}

      {/* Overflow indicator */}
      {hiddenCount > 0 && (
        <div
          className="
          pointer-events-none
          text-center text-xs font-medium
          text-gray-600 bg-white/80 
          rounded-full px-3 py-1
          shadow-sm backdrop-blur-sm
          self-center
        "
        >
          +{hiddenCount} more notification{hiddenCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export const NotificationStack = memo(NotificationStackComponent);
