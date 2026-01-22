/**
 * NotificationStack Component
 * Displays toast notifications with smooth animations
 */
import React, { memo, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Coins, Sparkles } from 'lucide-react';

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300',
    text: 'text-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    glow: 'shadow-emerald-200',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300',
    text: 'text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    glow: 'shadow-red-200',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    glow: 'shadow-amber-200',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
    glow: 'shadow-blue-200',
  },
  coins: {
    bg: 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-400',
    text: 'text-amber-900',
    icon: Coins,
    iconColor: 'text-amber-600',
    glow: 'shadow-amber-300',
  },
  harvest: {
    bg: 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400',
    text: 'text-green-900',
    icon: Sparkles,
    iconColor: 'text-green-600',
    glow: 'shadow-green-300',
  },
};

function NotificationComponent({ notification, onDismiss, index }) {
  const [isExiting, setIsExiting] = useState(false);

  // Determine notification type from message content
  let type = notification.type || 'info';
  if (notification.message?.includes('🪙') || notification.message?.includes('coins')) {
    type = 'coins';
  } else if (notification.message?.includes('Harvest') || notification.message?.includes('🎉')) {
    type = 'harvest';
  }

  const style = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info;
  const Icon = style.icon;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.(notification.id);
    }, 200);
  };

  // Auto-dismiss visual feedback
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsExiting(true);
    }, 3500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border-2
        shadow-lg backdrop-blur-sm
        ${style.bg} ${style.glow}
        transform transition-all duration-200 ease-out
        ${isExiting
          ? 'opacity-0 translate-x-8 scale-95'
          : 'opacity-100 translate-x-0 scale-100'
        }
      `}
      style={{
        animation: `slideInRight 0.3s ease-out ${index * 50}ms both`,
      }}
      role="alert"
    >
      <div className={`
        p-1.5 rounded-full bg-white/60
        ${type === 'coins' || type === 'harvest' ? 'animate-pulse' : ''}
      `}>
        <Icon size={18} className={style.iconColor} />
      </div>
      <span className={`text-sm font-medium flex-1 ${style.text}`}>
        {notification.message}
      </span>
      <button
        onClick={handleDismiss}
        className="
          p-1 hover:bg-black/10 rounded-full transition-colors
          active:scale-90
        "
        aria-label="Dismiss"
      >
        <X size={16} className="text-gray-600" />
      </button>

      {/* Progress bar for auto-dismiss */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
        <div
          className="h-full bg-black/10 animate-shrink-progress"
          style={{ animationDuration: '4s' }}
        />
      </div>
    </div>
  );
}

function NotificationStackComponent({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="
      fixed top-4 right-4 z-50
      flex flex-col gap-2
      max-w-sm w-full
      pointer-events-none
      sm:top-4 sm:right-4
      max-sm:top-2 max-sm:right-2 max-sm:left-2 max-sm:max-w-none
    ">
      {notifications.slice(0, 5).map((notification, index) => (
        <div key={notification.id} className="pointer-events-auto relative">
          <NotificationComponent
            notification={notification}
            onDismiss={onDismiss}
            index={index}
          />
        </div>
      ))}
      {notifications.length > 5 && (
        <div className="text-center text-xs text-gray-500 pointer-events-none">
          +{notifications.length - 5} more
        </div>
      )}
    </div>
  );
}

export const NotificationStack = memo(NotificationStackComponent);
