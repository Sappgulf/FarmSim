import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Notifications Component
 * Displays toast notifications with auto-dismiss
 */
export function Notifications({ notifications, onDismiss }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationStyles = (type) => {
    const baseStyles = 'border backdrop-blur-sm shadow-lg';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 border-yellow-200 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50/90 border-blue-200 text-blue-800`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg flex items-start gap-3
            animate-slide-down
            ${getNotificationStyles(notification.type)}
          `}
          onClick={() => onDismiss && onDismiss(notification.id)}
        >
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed">{notification.message}</p>
            {notification.timestamp && (
              <p className="text-xs opacity-75 mt-1">
                {new Date(notification.timestamp * 1000).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss && onDismiss(notification.id);
            }}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Simple notification hook for easy usage
 */
export function useNotifications() {
  const [notifications, setNotifications] = React.useState([]);

  const addNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const timestamp = Math.floor(Date.now() / 1000);

    setNotifications((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        timestamp,
      },
    ]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
}
