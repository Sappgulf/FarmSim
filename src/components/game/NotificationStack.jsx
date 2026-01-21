/**
 * NotificationStack Component
 * Displays toast notifications
 */
import React, { memo } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
  },
};

function NotificationComponent({ notification, onDismiss }) {
  const style = NOTIFICATION_STYLES[notification.type] || NOTIFICATION_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm
        ${style.bg}
        notification-enhanced
        animate-slide-down
      `}
      role="alert"
    >
      <Icon size={16} className={style.iconColor} />
      <span className={`text-sm font-medium flex-1 ${style.text}`}>
        {notification.message}
      </span>
      <button
        onClick={() => onDismiss?.(notification.id)}
        className="p-0.5 hover:bg-black/5 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} className="text-gray-500" />
      </button>
    </div>
  );
}

function NotificationStackComponent({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationComponent
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}

export const NotificationStack = memo(NotificationStackComponent);
