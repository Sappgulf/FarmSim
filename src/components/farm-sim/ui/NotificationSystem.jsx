import React, { memo, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

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

  // Auto-remove notification after 5 seconds (configurable per notification or default)
  // Can be manually closed at any time
  useEffect(() => {
    const duration = notification.duration || 5000; // Default 5 seconds
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onClose]);

  return (
    <Card className={`p-3 ${style.bgColor} ${style.borderColor} border-l-4 shadow-lg backdrop-blur-sm transition-all duration-300 notification-enter rounded-xl`}>
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
            onClose(notification.id);
          }}
          className="flex-shrink-0 h-7 w-7 p-0 hover:bg-white/50 rounded-lg opacity-60 hover:opacity-100 transition-all"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Main Notification System Component
const NotificationSystem = memo(() => {
  const { state, actions } = useGame();

  const handleCloseNotification = (id) => {
    actions.clearNotification(id);
  };

  // Don't render if no notifications
  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 w-72 sm:w-80 max-w-[calc(100vw-1rem)]">
      <div className="space-y-2">
        {state.notifications.slice(0, 4).map((notification, index) => (
          <div
            key={notification.id}
            style={{
              animationDelay: `${index * 50}ms`,
              transform: `translateY(${index * 2}px)`,
            }}
          >
            <NotificationItem
              notification={notification}
              onClose={handleCloseNotification}
            />
          </div>
        ))}

        {/* Show notification count if more than 4 */}
        {state.notifications.length > 4 && (
          <Card className="p-2 bg-gray-50/90 backdrop-blur-sm border border-gray-200 text-center rounded-xl shadow-sm">
            <p className="text-xs text-gray-600 font-medium">
              +{state.notifications.length - 4} more notifications
            </p>
          </Card>
        )}
      </div>
    </div>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

export default NotificationSystem;
