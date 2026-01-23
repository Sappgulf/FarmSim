import React, { memo, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const DEFAULT_DURATION_MS = 4000;

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

  const style = getNotificationStyle(notification.type);

  return (
    <Card className={`p-3 mb-2 ${style.bgColor} ${style.borderColor} border-l-4 shadow-sm transition-all duration-300 animate-in slide-in-from-right-2`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.textColor}`}>
            {notification.message}
          </p>

          {notification.details && (
            <p className="text-xs text-gray-600 mt-1">
              {notification.details}
            </p>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onClose(notification.id);
          }}
          className="flex-shrink-0 h-6 w-6 p-0 text-gray-700 hover:text-gray-900 hover:bg-white/70 border border-transparent hover:border-gray-200"
          aria-label="Close notification"
        >
          <X className="w-3 h-3 text-current" />
        </Button>
      </div>
    </Card>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Main Notification System Component
const NotificationSystem = memo(() => {
  const { state, actions } = useGame();
  const autoDismissTimersRef = useRef(new Map());

  const handleCloseNotification = (id) => {
    actions.clearNotification(id);
  };

  useEffect(() => {
    const timers = autoDismissTimersRef.current;
    const notifications = state.notifications || [];

    notifications.forEach((notification) => {
      if (!notification?.id || timers.has(notification.id)) return;
      const duration = Number.isFinite(notification.duration) && notification.duration > 0
        ? notification.duration
        : DEFAULT_DURATION_MS;

      const timer = setTimeout(() => {
        actions.clearNotification(notification.id);
        timers.delete(notification.id);
      }, duration);

      timers.set(notification.id, timer);
    });

    // Clean up timers for notifications that are gone
    timers.forEach((timer, id) => {
      if (!notifications.some((notification) => notification.id === id)) {
        clearTimeout(timer);
        timers.delete(id);
      }
    });
  }, [actions, state.notifications]);

  // Don't render if no notifications
  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-sm">
      <div className="space-y-2">
        {state.notifications.slice(0, 5).map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={handleCloseNotification}
          />
        ))}

        {/* Show notification count if more than 5 */}
        {state.notifications.length > 5 && (
          <Card className="p-2 bg-gray-50 border border-gray-200 text-center">
            <p className="text-xs text-gray-600">
              +{state.notifications.length - 5} more notifications
            </p>
          </Card>
        )}
      </div>
    </div>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

export default NotificationSystem;
