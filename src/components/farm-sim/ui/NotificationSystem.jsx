import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { getSoundSystem } from '../systems/SoundSystem';

const DEFAULT_NOTIFICATION_DURATION_MS = 4000;
const getNotificationDurationMs = (notification) => {
  if (!notification) return DEFAULT_NOTIFICATION_DURATION_MS;
  if (Number.isFinite(notification.durationMs)) return notification.durationMs;
  if (Number.isFinite(notification.duration)) return notification.duration;
  return DEFAULT_NOTIFICATION_DURATION_MS;
};

// Individual Notification Component
const NotificationItem = memo(({ notification, onClose, isExiting }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          // Glassmorphism: semi-transparent green bg with blur
          className: 'bg-green-50/90 dark:bg-green-900/40 border-green-200/50 dark:border-green-800/50 ring-green-500/10',
          icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
          titleColor: 'text-green-900 dark:text-green-100',
          textColor: 'text-green-700 dark:text-green-300'
        };
      case 'error':
        return {
          className: 'bg-red-50/90 dark:bg-red-900/40 border-red-200/50 dark:border-red-800/50 ring-red-500/10',
          icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          titleColor: 'text-red-900 dark:text-red-100',
          textColor: 'text-red-700 dark:text-red-300'
        };
      case 'warning':
        return {
          className: 'bg-amber-50/90 dark:bg-amber-900/40 border-amber-200/50 dark:border-amber-800/50 ring-amber-500/10',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          titleColor: 'text-amber-900 dark:text-amber-100',
          textColor: 'text-amber-700 dark:text-amber-300'
        };
      default:
        return {
          className: 'bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50 ring-slate-500/10',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          titleColor: 'text-slate-900 dark:text-slate-100',
          textColor: 'text-slate-600 dark:text-slate-400'
        };
    }
  };

  const style = getNotificationStyle(notification.type);

  // Animation classes
  const animationClass = isExiting
    ? 'animate-out fade-out slide-out-to-right-1/2 duration-300'
    : 'animate-in slide-in-from-right-1/2 fade-in duration-300';

  return (
    <div
      className={`
        relative w-full max-w-sm rounded-xl border backdrop-blur-md shadow-lg ring-1 transition-all
        p-4 mb-2 overflow-hidden ${style.className} ${animationClass}
      `}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* Icon container with subtle glow */}
        <div className={`
          flex-shrink-0 mt-0.5 p-1 rounded-full
          bg-white/40 dark:bg-black/20 backdrop-blur-sm
        `}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className={`text-sm font-semibold leading-none mb-1 ${style.titleColor}`}>
            {notification.message}
          </h4>

          {notification.details && (
            <p className={`text-xs leading-relaxed opacity-90 ${style.textColor}`}>
              {notification.details}
            </p>
          )}

          {/* Timestamp/duration indicator could go here */}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(notification.id, 'manual');
          }}
          className={`
            flex-shrink-0 -mr-2 -mt-2 p-2 rounded-full
            opacity-60 hover:opacity-100 transition-opacity
            text-slate-500 hover:bg-black/5 dark:hover:bg-white/10
          `}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Optional: Progress bar for timeout duration */}
      {/* <div className="absolute bottom-0 left-0 h-1 bg-black/5 dark:bg-white/10 w-full">
            <div className="h-full bg-current opacity-20 w-full origin-left animate-shrink" />
          </div> */}
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Main Notification System Component
const NotificationSystem = memo(() => {
  const { state, actions } = useGame();
  const timersRef = useRef(new Map());
  const [exitingIds, setExitingIds] = React.useState(new Set()); // Track exiting notifications for animation

  const debugNotifications = import.meta.env.MODE === 'development'
    && typeof window !== 'undefined'
    && window.__farmDebug?.notifications;

  const handleCloseNotification = useCallback((id, reason = 'manual') => {
    // 1. Mark as exiting first to trigger animation
    setExitingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    const timers = timersRef.current;
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }

    // 2. Wait for animation then remove from state
    setTimeout(() => {
      actions.clearNotification(id);
      setExitingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      if (debugNotifications) {
        console.debug('[farm]', 'Notification dismissed', { id, reason });
      }
    }, 300); // 300ms matches animation duration

  }, [actions, debugNotifications]);

  // Centralized auto-dismiss handling
  useEffect(() => {
    const timers = timersRef.current;
    const activeIds = new Set(state.notifications.map(n => n.id));

    // Cleanup timers for removed notifications
    timers.forEach((timer, id) => {
      if (!activeIds.has(id)) {
        clearTimeout(timer);
        timers.delete(id);
      }
    });

    // Schedule timers for new notifications
    state.notifications.forEach(notification => {
      if (notification.sticky) return;
      if (timers.has(notification.id)) return;
      if (exitingIds.has(notification.id)) return; // Don't schedule if already exiting

      const durationMs = getNotificationDurationMs(notification);
      if (durationMs <= 0) return;

      const timerId = setTimeout(() => {
        handleCloseNotification(notification.id, 'timeout');
      }, durationMs);

      timers.set(notification.id, timerId);
    });
  }, [state.notifications, exitingIds, handleCloseNotification]);

  // Sound Effect Trigger
  const processedIdsRef = useRef(new Set());
  useEffect(() => {
    const activeIds = new Set(state.notifications.map(notification => notification.id));
    processedIdsRef.current.forEach((id) => {
      if (!activeIds.has(id)) {
        processedIdsRef.current.delete(id);
      }
    });
  }, [state.notifications]);

  useEffect(() => {
    state.notifications.forEach(notification => {
      if (!processedIdsRef.current.has(notification.id)) {
        processedIdsRef.current.add(notification.id);

        // Play sound (only if not in initial batch to prevent spam on load)
        // We can assume if it's hitting this effect it's "new" in this session
        // unless it was hydrated from save (which loads notifications: [] anyway)
        const soundSystem = getSoundSystem();
        if (soundSystem) {
          soundSystem.playNotificationSound(notification.type);
        }
      }
    });
  }, [state.notifications]);

  useEffect(() => {
    return () => {
      const timers = timersRef.current;
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  if (state.notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] w-full max-w-[var(--notification-width,24rem)] pointer-events-none flex flex-col items-end space-y-2 sm:p-4"
      style={{
        paddingTop: 'env(safe-area-inset-top, 16px)',
        paddingRight: 'env(safe-area-inset-right, 16px)',
      }}
      role="status"
    >
      {/* Render notifications including those that are 'exiting' but still in state */}
      {state.notifications.slice(0, 5).map(notification => (
        <div key={notification.id} className="pointer-events-auto w-full flex justify-end">
          <NotificationItem
            notification={notification}
            onClose={handleCloseNotification}
            isExiting={exitingIds.has(notification.id)}
          />
        </div>
      ))}

      {state.notifications.length > 5 && (
        <div className="pointer-events-auto bg-white/90 backdrop-blur border rounded-full px-4 py-1 text-xs font-medium text-slate-600 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          +{state.notifications.length - 5} more
        </div>
      )}
    </div>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

export default NotificationSystem;
