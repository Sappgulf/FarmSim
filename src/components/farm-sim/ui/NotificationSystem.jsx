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
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-200 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-3 h-3" />
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
