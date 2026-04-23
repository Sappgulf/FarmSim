import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { logDebugAction } from '../../../utils/debugTools';

const AUTO_DISMISS_MS = 3500;
const MAX_VISIBLE = 5;
const EXPIRY_SWEEP_MS = 700;
const EXPIRY_GRACE_MS = 1000;

const NOTIFICATION_CONFIG = {
  success: {
    gradient: 'bg-gradient-to-br from-green-50 via-emerald-50/90 to-teal-50/80',
    border: 'border-l-emerald-400',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-green-900',
    barColor: 'bg-emerald-500',
    icon: CheckCircle,
  },
  error: {
    gradient: 'bg-gradient-to-br from-red-50 via-rose-50/90 to-pink-50/80',
    border: 'border-l-rose-400',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    textColor: 'text-red-900',
    barColor: 'bg-rose-500',
    icon: AlertCircle,
  },
  warning: {
    gradient: 'bg-gradient-to-br from-amber-50 via-yellow-50/90 to-orange-50/80',
    border: 'border-l-amber-400',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    textColor: 'text-amber-900',
    barColor: 'bg-amber-500',
    icon: AlertTriangle,
  },
  info: {
    gradient: 'bg-gradient-to-br from-blue-50 via-sky-50/90 to-cyan-50/80',
    border: 'border-l-sky-400',
    iconBg: 'bg-gradient-to-br from-blue-500 to-sky-600',
    textColor: 'text-blue-900',
    barColor: 'bg-sky-500',
    icon: Info,
  },
};

// Inline keyframe styles for enter/exit animations
const NotificationStyles = memo(() => (
  <style>{`
    @keyframes notificationSlideIn {
      0% { opacity: 0; transform: translateX(40px) scale(0.96); }
      60% { opacity: 1; transform: translateX(-4px) scale(1.01); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes notificationSlideOut {
      0% { opacity: 1; transform: translateX(0) scale(1); }
      100% { opacity: 0; transform: translateX(60px) scale(0.96); }
    }
    .notification-enter {
      animation: notificationSlideIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .notification-exit {
      animation: notificationSlideOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      pointer-events: none;
    }
  `}</style>
));
NotificationStyles.displayName = 'NotificationStyles';

const NotificationItem = memo(({ notification, onClose, groupCount }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.info;
  const Icon = config.icon;

  const progressBarRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const totalDurationRef = useRef(notification.duration ?? AUTO_DISMISS_MS);
  const remainingRef = useRef(notification.duration ?? AUTO_DISMISS_MS);
  const isPausedRef = useRef(false);
  const isClosingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const updateBar = useCallback(() => {
    if (!progressBarRef.current) return;
    const pct = Math.max(0, (remainingRef.current / totalDurationRef.current) * 100);
    progressBarRef.current.style.width = `${pct}%`;
  }, []);

  const performClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setIsExiting(true);
    setTimeout(() => {
      onCloseRef.current(notification.id);
    }, 360);
  }, [notification.id]);

  const tick = useCallback(() => {
    if (isPausedRef.current || isClosingRef.current) {
      rafRef.current = null;
      return;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, totalDurationRef.current - elapsed);
    updateBar();
    if (remainingRef.current <= 0) {
      rafRef.current = null;
      performClose();
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [updateBar, performClose]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    if (notification.sticky || notification.important || isClosingRef.current) return;
    if (remainingRef.current <= 0) {
      performClose();
      return;
    }
    isPausedRef.current = false;
    startTimeRef.current = Date.now() - (totalDurationRef.current - remainingRef.current);
    clearTimer();
    timerRef.current = setTimeout(performClose, remainingRef.current);
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [clearTimer, performClose, tick, notification.sticky, notification.important]);

  const pauseTimer = useCallback(() => {
    if (notification.sticky || notification.important) return;
    isPausedRef.current = true;
    if (timerRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clearTimer();
      updateBar();
    }
  }, [clearTimer, updateBar, notification.sticky, notification.important]);

  useEffect(() => {
    remainingRef.current = notification.duration ?? AUTO_DISMISS_MS;
    totalDurationRef.current = notification.duration ?? AUTO_DISMISS_MS;
    updateBar();
    startTimer();
    return clearTimer;
  }, [notification.duration, notification.id, startTimer, clearTimer, updateBar]);

  return (
    <Card
      className={[
        'relative overflow-hidden p-3 border-l-4 backdrop-blur-md rounded-2xl',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-2xl',
        'shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]',
        config.gradient,
        config.border,
        isExiting ? 'notification-exit' : 'notification-enter',
      ].join(' ')}
      role={notification.type === 'error' || notification.important ? 'alert' : 'status'}
      aria-atomic="true"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onPointerDown={pauseTimer}
      onPointerUp={startTimer}
      onPointerCancel={startTimer}
    >
      <div className="flex items-start gap-3">
        <div className={[
          'relative flex-shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shadow-md',
          config.iconBg,
        ].join(' ')}>
          <Icon className="w-5 h-5 text-white" aria-hidden="true" />
          {groupCount > 1 && (
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-[10px] font-bold shadow-sm border-2 border-white">
              {groupCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <p className={`text-sm font-semibold ${config.textColor} leading-snug`}>
            {notification.message}
          </p>
          {notification.details && (
            <p className="text-xs text-gray-600/90 mt-1 leading-relaxed">
              {notification.details}
            </p>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            performClose();
          }}
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-white/60 rounded-lg text-gray-600 hover:text-gray-900 transition-all"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {!notification.sticky && !notification.important && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
          <div
            ref={progressBarRef}
            className={`h-full ${config.barColor} opacity-60`}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </Card>
  );
});
NotificationItem.displayName = 'NotificationItem';

const NotificationSystem = memo(() => {
  const actions = useGameActions();
  const notifications = useGameSelector((state) => (Array.isArray(state.notifications) ? state.notifications : []));
  const visibleNotifications = useMemo(() => notifications.slice(0, MAX_VISIBLE), [notifications]);
  const overflowCount = notifications.length - visibleNotifications.length;

  const handleCloseNotification = useCallback((id) => {
    logDebugAction('notification_close', { id });
    actions.clearNotification(id);
  }, [actions]);

  useEffect(() => {
    if (notifications.length === 0) return undefined;
    const hasExpiring = notifications.some((n) => (
      n && !n.sticky && !n.important && Number.isFinite(Number(n.timestamp))
    ));
    if (!hasExpiring) return undefined;

    const sweepId = setInterval(() => {
      const now = Date.now();
      notifications.forEach((n) => {
        if (!n || n.sticky || n.important) return;
        const duration = Number(n.duration);
        const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : AUTO_DISMISS_MS;
        const timestamp = Number(n.timestamp);
        if (!Number.isFinite(timestamp)) return;
        if (now >= timestamp + safeDuration + EXPIRY_GRACE_MS) {
          actions.clearNotification(n.id);
        }
      });
    }, EXPIRY_SWEEP_MS);

    return () => clearInterval(sweepId);
  }, [actions, notifications]);

  const typeCounts = useMemo(() => {
    const counts = {};
    visibleNotifications.forEach((n) => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [visibleNotifications]);

  const firstOfTypeSet = useMemo(() => {
    const seen = new Set();
    const result = new Set();
    visibleNotifications.forEach((n) => {
      if (!seen.has(n.type)) {
        seen.add(n.type);
        result.add(n.id);
      }
    });
    return result;
  }, [visibleNotifications]);

  if (notifications.length === 0) return null;

  return (
    <>
      <NotificationStyles />
      <div
        className="fixed top-16 sm:top-20 inset-x-2 sm:inset-x-auto sm:right-4 z-50 sm:w-96 max-w-[calc(100vw-1rem)] pointer-events-none"
        role="region"
        aria-label="Game notifications"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <div className="flex flex-col gap-0">
          {visibleNotifications.map((notification, index) => {
            const stackScale = Math.max(0.88, 1 - index * 0.035);
            const stackOpacity = Math.max(0.55, 1 - index * 0.12);
            const stackOffset = index * -6;

            return (
              <div
                key={notification.id}
                className="pointer-events-auto"
                style={{
                  transform: `scale(${stackScale}) translateY(${stackOffset}px)`,
                  opacity: stackOpacity,
                  zIndex: MAX_VISIBLE - index,
                  transformOrigin: 'top center',
                  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
                }}
              >
                <NotificationItem
                  notification={notification}
                  onClose={handleCloseNotification}
                  groupCount={firstOfTypeSet.has(notification.id) ? (typeCounts[notification.type] || 1) : 0}
                />
              </div>
            );
          })}

          {overflowCount > 0 && (
            <div
              className="pointer-events-auto"
              style={{
                transform: `scale(0.88) translateY(${visibleNotifications.length * -6}px)`,
                opacity: 0.7,
                zIndex: 0,
                transformOrigin: 'top center',
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
              }}
            >
              <Card className="relative overflow-hidden p-3 bg-gradient-to-br from-slate-50 via-gray-50/90 to-zinc-50/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                <div className="relative flex items-center justify-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
                  <p className="text-xs text-gray-600 font-semibold tracking-wide">
                    +{overflowCount} more notification{overflowCount > 1 ? 's' : ''}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

export default NotificationSystem;
