import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { logDebugAction } from '../../../utils/debugTools';

/** Fallback duration; reducer assigns type-based defaults when omitted. */
const AUTO_DISMISS_MS = 3800;
const MAX_VISIBLE = 5;
const EXPIRY_SWEEP_MS = 850;
const EXPIRY_GRACE_MS = 1500;
const SWIPE_DISMISS_THRESHOLD_PX = 76;

const NOTIFICATION_CONFIG = {
  success: {
    gradient:
      'bg-gradient-to-br from-emerald-50 via-white/93 to-teal-50/88 ring-1 ring-emerald-200/50',
    border: 'border-l-[3px] border-l-emerald-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    title: 'text-emerald-950',
    muted: 'text-emerald-900/70',
    barColor: 'bg-emerald-500',
    icon: CheckCircle,
  },
  error: {
    gradient: 'bg-gradient-to-br from-rose-50 via-white/93 to-red-50/88 ring-1 ring-rose-200/52',
    border: 'border-l-[3px] border-l-rose-500',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
    title: 'text-rose-950',
    muted: 'text-rose-900/72',
    barColor: 'bg-rose-500',
    icon: AlertCircle,
  },
  warning: {
    gradient: 'bg-gradient-to-br from-amber-50 via-white/93 to-orange-50/86 ring-1 ring-amber-200/48',
    border: 'border-l-[3px] border-l-amber-500',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    title: 'text-amber-950',
    muted: 'text-amber-950/72',
    barColor: 'bg-amber-500',
    icon: AlertTriangle,
  },
  info: {
    gradient: 'bg-gradient-to-br from-sky-50 via-white/93 to-cyan-50/84 ring-1 ring-sky-200/48',
    border: 'border-l-[3px] border-l-sky-500',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    title: 'text-slate-950',
    muted: 'text-sky-950/72',
    barColor: 'bg-sky-500',
    icon: Info,
  },
};

const DARK_NOTIFICATION_CONFIG = {
  success: {
    gradient:
      'dark:from-emerald-950/90 dark:via-slate-900/95 dark:to-teal-950/78 dark:ring-emerald-800/45',
    border: 'dark:border-l-emerald-400',
    iconBg: 'dark:bg-gradient-to-br dark:from-emerald-600 dark:to-teal-700',
    title: 'dark:text-emerald-50',
    muted: 'dark:text-emerald-100/78',
    barColor: 'dark:bg-emerald-400',
  },
  error: {
    gradient: 'dark:from-red-950/90 dark:via-slate-900/95 dark:to-rose-950/76 dark:ring-rose-800/42',
    border: 'dark:border-l-rose-400',
    iconBg: 'dark:bg-gradient-to-br dark:from-red-600 dark:to-rose-700',
    title: 'dark:text-rose-50',
    muted: 'dark:text-rose-100/75',
    barColor: 'dark:bg-rose-400',
  },
  warning: {
    gradient: 'dark:from-amber-950/86 dark:via-slate-900/93 dark:to-orange-950/72 dark:ring-amber-800/40',
    border: 'dark:border-l-amber-400',
    iconBg: 'dark:bg-gradient-to-br dark:from-amber-600 dark:to-orange-600',
    title: 'dark:text-amber-50',
    muted: 'dark:text-amber-100/76',
    barColor: 'dark:bg-amber-400',
  },
  info: {
    gradient: 'dark:from-slate-950/95 dark:via-slate-900/96 dark:to-sky-950/74 dark:ring-sky-800/38',
    border: 'dark:border-l-sky-400',
    iconBg: 'dark:bg-gradient-to-br dark:from-sky-600 dark:to-blue-700',
    title: 'dark:text-slate-50',
    muted: 'dark:text-slate-200/75',
    barColor: 'dark:bg-sky-400',
  },
};

const NotificationStyles = memo(() => (
  <style>{`
    @keyframes toastEnterDesktop {
      0% { opacity: 0; transform: translateX(52px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes toastExitDesktop {
      0% { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(44px); }
    }
    @keyframes toastEnterMobile {
      0% { opacity: 0; transform: translateY(28px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes toastExitMobile {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(20px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .toast-anim-enter, .toast-anim-exit { animation-duration: 0.01ms !important; }
    }
    @media (min-width: 1024px) {
      .toast-anim-enter { animation: toastEnterDesktop 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .toast-anim-exit { animation: toastExitDesktop 0.32s cubic-bezier(0.4, 0, 1, 1) forwards; pointer-events: none; }
    }
    @media (max-width: 1023.98px) {
      .toast-anim-enter { animation: toastEnterMobile 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .toast-anim-exit { animation: toastExitMobile 0.26s cubic-bezier(0.4, 0, 1, 1) forwards; pointer-events: none; }
    }
  `}</style>
));
NotificationStyles.displayName = 'NotificationStyles';

/** @typedef {{ sticky?: boolean, important?: boolean, duration?: number, timestamp?: number, count?: number, id?: string }} Notif */

/**
 * RAF-based countdown with cooperative pause via hover / pointer-down (duration subtracts paused time).
 * @param {Notif} notification
 * @param {() => void} scheduleExit - runs exit animation (sets state + RAF clear); does not mutate props
 */
function useDismissTimer(notification, scheduleExit) {
  const progressBarRef = useRef(null);
  const rafRef = useRef(null);
  const closingRef = useRef(false);

  const startTsRef = useRef(Date.now());
  const durationMsRef = useRef(notification.duration ?? AUTO_DISMISS_MS);
  const pauseAccumRef = useRef(0);
  const pauseAtRef = useRef(null);

  const scheduleExitRef = useRef(scheduleExit);
  scheduleExitRef.current = scheduleExit;

  const getElapsedMs = useCallback(() => {
    const now = Date.now();
    const pausedNow = pauseAtRef.current !== null ? now - pauseAtRef.current : 0;
    return now - startTsRef.current - pauseAccumRef.current - pausedNow;
  }, []);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tickLoop = useCallback(() => {
    if (closingRef.current) return;

    const sticky = notification.sticky || notification.important;
    if (sticky) {
      cancelRaf();
      return;
    }

    const dur = durationMsRef.current;
    const remaining = Math.max(0, dur - getElapsedMs());

    const bar = progressBarRef.current;
    if (bar && dur > 0) {
      bar.style.width = `${Math.min(100, (remaining / dur) * 100)}%`;
    }

    if (remaining <= 0) {
      if (!closingRef.current) {
        closingRef.current = true;
        cancelRaf();
        scheduleExitRef.current();
      }
      return;
    }

    rafRef.current = requestAnimationFrame(tickLoop);
  }, [cancelRaf, getElapsedMs, notification.sticky, notification.important]);

  const pause = useCallback(() => {
    if (notification.sticky || notification.important || pauseAtRef.current !== null) return;
    pauseAtRef.current = Date.now();
    cancelRaf();
  }, [cancelRaf, notification.sticky, notification.important]);

  const resume = useCallback(() => {
    if (pauseAtRef.current === null) return;
    pauseAccumRef.current += Date.now() - pauseAtRef.current;
    pauseAtRef.current = null;
    if (!closingRef.current && !notification.sticky && !notification.important) {
      cancelRaf();
      rafRef.current = requestAnimationFrame(tickLoop);
    }
  }, [cancelRaf, tickLoop, notification.sticky, notification.important]);

  useEffect(() => {
    closingRef.current = false;
    durationMsRef.current = notification.duration ?? AUTO_DISMISS_MS;
    startTsRef.current = Date.now();
    pauseAccumRef.current = 0;
    pauseAtRef.current = null;

    cancelRaf();
    const bar = progressBarRef.current;
    if (!notification.sticky && !notification.important) {
      if (bar && durationMsRef.current > 0) {
        bar.style.width = '100%';
      }
      rafRef.current = requestAnimationFrame(tickLoop);
    }
    return cancelRaf;
  }, [
    notification.id,
    notification.timestamp,
    notification.duration,
    notification.sticky,
    notification.important,
    notification.count,
    tickLoop,
    cancelRaf,
  ]);

  return { progressBarRef, pause, resume, closingRef, cancelRaf };
}

const NotificationItem = memo(({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.info;
  const darkCfg = DARK_NOTIFICATION_CONFIG[notification.type] || DARK_NOTIFICATION_CONFIG.info;
  const Icon = config.icon;
  const stacks = typeof notification.count === 'number' && notification.count > 1 ? notification.count : 0;

  const touchRef = useRef({ x: 0, y: 0 });

  const runClose = useCallback(() => {
    onClose(notification.id);
  }, [notification.id, onClose]);

  const beginExitVisual = useCallback(() => {
    setIsExiting(true);
    setTimeout(runClose, 320);
  }, [runClose]);

  const toastTime = useDismissTimer(notification, beginExitVisual);
  const { progressBarRef, pause, resume, closingRef, cancelRaf } = toastTime;

  const handleDismissTap = useCallback(
    (e) => {
      e.stopPropagation();
      if (closingRef.current) return;
      closingRef.current = true;
      cancelRaf();
      beginExitVisual();
    },
    [beginExitVisual, closingRef, cancelRaf]
  );

  const onTouchStart = useCallback((e) => {
    const t = e.changedTouches?.[0] || e.touches?.[0];
    if (!t) return;
    touchRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      const t = e.changedTouches?.[0];
      if (!t) return;
      const dx = t.clientX - touchRef.current.x;
      const dy = Math.abs(t.clientY - touchRef.current.y);
      if (Math.abs(dx) > SWIPE_DISMISS_THRESHOLD_PX && dy < 52) {
        handleDismissTap(e);
      }
    },
    [handleDismissTap]
  );

  return (
    <Card
      data-qa="toast-item"
      className={[
        'relative touch-pan-y overflow-hidden p-3.5 sm:p-3.5 rounded-2xl backdrop-blur-md',
        'border border-white/50 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.35)]',
        'dark:border-white/10 dark:shadow-[0_12px_44px_-16px_rgba(0,0,0,0.55)]',
        'transition-shadow duration-300 hover:shadow-xl',
        config.gradient,
        darkCfg.gradient,
        config.border,
        darkCfg.border,
        isExiting ? 'toast-anim-exit' : 'toast-anim-enter',
      ].join(' ')}
      role={notification.type === 'error' || notification.important ? 'alert' : 'status'}
      aria-atomic="true"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex gap-3">
        <div
          className={[
            'relative flex-shrink-0 mt-px h-11 w-11 rounded-2xl flex items-center justify-center shadow-md',
            config.iconBg,
            darkCfg.iconBg,
          ].join(' ')}
        >
          <Icon className="h-6 w-6 text-white" aria-hidden />
          {stacks >= 2 ? (
            <span className="absolute -right-1.5 -top-1.5 min-w-[1.35rem] rounded-full border border-white bg-slate-900 px-1.5 py-[1px] text-center text-[10px] font-extrabold leading-4 text-white shadow-sm dark:bg-white dark:text-slate-950 dark:border-slate-800">
              ×{Math.min(stacks, 99)}
            </span>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 pt-0.5 pr-1">
          <p className={`text-[0.935rem] font-semibold leading-snug ${config.title} ${darkCfg.title}`}>
            {notification.message}
          </p>
          {notification.details ? (
            <p className={`mt-1 text-[0.8125rem] leading-relaxed ${config.muted} ${darkCfg.muted}`}>
              {notification.details}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleDismissTap}
          className="flex-shrink-0 mt-[-2px] h-10 w-10 rounded-xl p-0 text-slate-500 hover:bg-black/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
          aria-label="Dismiss toast"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!notification.sticky && !notification.important ? (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-black/[0.05] dark:bg-white/[0.07]">
          <div
            ref={progressBarRef}
            className={`${config.barColor} ${darkCfg.barColor} h-full rounded-r-full opacity-70`}
            style={{ width: '100%' }}
          />
        </div>
      ) : null}
    </Card>
  );
});
NotificationItem.displayName = 'NotificationItem';

const NotificationSystem = memo(() => {
  const actions = useGameActions();
  const notifications = useGameSelector((state) => (Array.isArray(state.notifications) ? state.notifications : []));

  const visibleNotifications = useMemo(() => notifications.slice(-MAX_VISIBLE), [notifications]);

  /** Oldest nearer nav, youngest toward center — clearer on phones. */
  const orderedVisible = useMemo(() => [...visibleNotifications].reverse(), [visibleNotifications]);

  const overflowCount = notifications.length - visibleNotifications.length;

  const handleCloseNotification = useCallback(
    (id) => {
      logDebugAction('notification_close', { id });
      actions.clearNotification(id);
    },
    [actions]
  );

  const hasSeverity = notifications.some((n) => n && (n.type === 'error' || n.important));

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
        const durationRaw = Number(n.duration);
        const safeDuration =
          Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : AUTO_DISMISS_MS;
        const stamp = Number(n.timestamp);
        if (!Number.isFinite(stamp)) return;
        if (now >= stamp + safeDuration + EXPIRY_GRACE_MS) {
          actions.clearNotification(n.id);
        }
      });
    }, EXPIRY_SWEEP_MS);

    return () => clearInterval(sweepId);
  }, [actions, notifications]);

  if (notifications.length === 0) return null;

  return (
    <>
      <NotificationStyles />
      <div
        className={[
          'fixed z-[92] flex w-full pointer-events-none max-lg:justify-center lg:justify-end px-4',
          /** Mobile: anchored above Tab bar + safe area — matches `<main>` padding philosophy */
          'max-lg:bottom-[max(5.75rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))] lg:bottom-auto',
          /** Desktop / large: tuck under sticky header zone */
          'lg:top-[max(6rem,calc(env(safe-area-inset-top,0px)+4.75rem))] lg:right-4 lg:w-[min(408px,calc(100vw-7rem))] lg:max-w-none',
        ].join(' ')}
        role="region"
        aria-label="Game notifications"
        aria-live={hasSeverity ? 'assertive' : 'polite'}
        aria-relevant="additions text"
      >
        <div className="flex w-full max-w-xl flex-col gap-2 lg:gap-3">
          {orderedVisible.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationItem notification={notification} onClose={handleCloseNotification} />
            </div>
          ))}

          {overflowCount > 0 ? (
            <div className="pointer-events-auto">
              <Card
                data-qa="toast-overflow-summary"
                className="rounded-2xl border border-white/55 bg-white/88 px-4 py-2 text-center backdrop-blur-md shadow-md dark:bg-slate-900/92 dark:border-slate-700/70"
              >
                <div className="flex items-center justify-center gap-2">
                  <Bell className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden />
                  <p className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                    +{overflowCount} more notification{overflowCount > 1 ? 's' : ''}
                  </p>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

export default NotificationSystem;
