import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { logDebugAction } from '../../../utils/debugTools';

const AUTO_DISMISS_MS = 3500;
const MAX_VISIBLE = 5;
const EXPIRY_SWEEP_MS = 700;
const EXPIRY_GRACE_MS = 1000;

// Individual Notification Component
const NotificationItem = memo(({ notification, onClose }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
          textColor: 'text-yellow-800'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Info className="w-4 h-4 text-blue-600" />,
          textColor: 'text-blue-800'
        };
    }
  };

  const style = useMemo(() => getNotificationStyle(notification.type), [notification.type]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(notification.duration ?? AUTO_DISMISS_MS);
  const isClosingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onClose(notification.id);
  }, [notification.id, onClose]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (notification.sticky || notification.important) return;
    if (isClosingRef.current) return;
    if (remainingRef.current <= 0) {
      handleClose();
      return;
    }
    startTimeRef.current = Date.now();
    clearTimer();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingRef.current);
  }, [clearTimer, handleClose, notification.important, notification.sticky]);

  const pauseTimer = useCallback(() => {
    if (notification.sticky || notification.important) return;
    if (!timerRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimer();
  }, [clearTimer, notification.important, notification.sticky]);

  useEffect(() => {
    remainingRef.current = notification.duration ?? AUTO_DISMISS_MS;
    startTimer();
    return () => clearTimer();
  }, [notification.duration, notification.id, startTimer, clearTimer]);

  return (
    <Card
      className={`p-3 ${style.bgColor} ${style.borderColor} border-l-4 shadow-lg backdrop-blur-sm transition-all duration-300 notification-enter rounded-xl`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onPointerDown={pauseTimer}
      onPointerUp={startTimer}
      onPointerCancel={startTimer}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/50">
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.textColor} leading-snug`}>
            {notification.message}
          </p>

          {notification.details && (
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {notification.details}
            </p>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="flex-shrink-0 h-11 w-11 p-0 hover:bg-white/70 rounded-lg text-gray-700 hover:text-gray-900 transition-all"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Main Notification System Component
const NotificationSystem = memo(() => {
  const actions = useGameActions();
  const notifications = useGameSelector((state) => (Array.isArray(state.notifications) ? state.notifications : []));

  const handleCloseNotification = (id) => {
    logDebugAction('notification_close', { id });
    actions.clearNotification(id);
  };

  useEffect(() => {
    if (notifications.length === 0) {
      return undefined;
    }

    const sweepId = setInterval(() => {
      const now = Date.now();
      notifications.forEach((notification) => {
        if (!notification || notification.sticky || notification.important) return;
        const duration = Number(notification.duration);
        const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : AUTO_DISMISS_MS;
        const timestamp = Number(notification.timestamp);
        if (!Number.isFinite(timestamp)) return;
        if (now >= timestamp + safeDuration + EXPIRY_GRACE_MS) {
          actions.clearNotification(notification.id);
        }
      });
    }, EXPIRY_SWEEP_MS);

    return () => clearInterval(sweepId);
  }, [actions, notifications]);

  // Don't render if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 sm:top-20 inset-x-2 sm:inset-x-auto sm:right-4 z-50 sm:w-80 max-w-[calc(100vw-1rem)]">
      <div className="space-y-2">
        {notifications.map((notification, index) => {
          const isHidden = index >= MAX_VISIBLE;
          return (
            <div
              key={notification.id}
              className={isHidden ? 'hidden' : undefined}
              style={
                isHidden
                  ? undefined
                  : {
                    animationDelay: `${index * 50}ms`,
                    transform: `translateY(${index * 2}px)`,
                  }
              }
            >
              <NotificationItem
                notification={notification}
                onClose={handleCloseNotification}
              />
            </div>
          );
        })}

        {/* Show notification count if more than 4 */}
        {notifications.length > MAX_VISIBLE && (
          <Card className="p-2 bg-gray-50/90 backdrop-blur-sm border border-gray-200 text-center rounded-xl shadow-sm">
            <p className="text-xs text-gray-600 font-medium">
              +{notifications.length - MAX_VISIBLE} more notifications
            </p>
          </Card>
        )}
      </div>
    </div>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

export default NotificationSystem;
