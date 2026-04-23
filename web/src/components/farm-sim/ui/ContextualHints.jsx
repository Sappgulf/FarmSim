import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useGameSelector } from '../context/GameContext';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'farmSim_contextHints_v1';

const HINT_CONFIGS = [
  {
    id: 'hint_shop',
    minLevel: 1,
    maxLevel: 2,
    message: 'You unlocked the Shop! Tap here.',
    targetSelector: 'button[title="Open Shop"], [data-onboard="shop-tab"]',
    fallbackSelector: '[aria-label*="Shop" i]',
  },
  {
    id: 'hint_buildings',
    minLevel: 2,
    maxLevel: 3,
    message: 'Buildings are now available! Tap Build.',
    targetSelector: 'button[aria-label*="Build" i]',
    fallbackSelector: '[aria-label*="Build" i]',
  },
  {
    id: 'hint_inventory',
    minLevel: 2,
    maxLevel: 3,
    message: 'Check your Items tab for tools and seeds.',
    targetSelector: 'button[aria-label*="Items" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_animals',
    minLevel: 4,
    maxLevel: 5,
    message: 'Animals unlocked! Tap Animals to adopt.',
    targetSelector: 'button[aria-label*="Animals" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_processing',
    minLevel: 5,
    maxLevel: 6,
    message: 'Processing unlocked! Turn crops into goods.',
    targetSelector: '[data-onboard="processing-tab"]',
    fallbackSelector: null,
  },
  {
    id: 'hint_research',
    minLevel: 6,
    maxLevel: 7,
    message: 'Research unlocked! Upgrade your farm tech.',
    targetSelector: '[data-onboard="research-tab"]',
    fallbackSelector: null,
  },
  {
    id: 'hint_fishing',
    minLevel: 7,
    maxLevel: 8,
    message: 'Fishing unlocked! Cast a line in the Animals tab.',
    targetSelector: 'button[aria-label*="Animals" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_analytics',
    minLevel: 3,
    maxLevel: 4,
    message: 'Analytics unlocked! Track your farm stats.',
    targetSelector: 'button[title="Open Analytics"]',
    fallbackSelector: null,
  },
  {
    id: 'hint_achievements',
    minLevel: 2,
    maxLevel: 3,
    message: 'Achievements unlocked! Earn rewards.',
    targetSelector: 'button[title="Open Achievements"]',
    fallbackSelector: null,
  },
];

function getShownHints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveShownHints(shownSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(shownSet)));
  } catch {
    // ignore quota errors
  }
}

function findTargetRect(selector, fallbackSelector) {
  let el = selector ? document.querySelector(selector) : null;
  if (!el && fallbackSelector) {
    el = document.querySelector(fallbackSelector);
  }
  if (!el) return null;
  return el.getBoundingClientRect();
}

const ContextualHint = memo(function ContextualHint({
  hint,
  onDismiss,
  containerRect,
}) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const duration = 6000;

  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (elapsed < duration) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss(hint.id);
      }
    };

    timerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(timerRef.current);
  }, [hint.id, onDismiss]);

  const targetRect = findTargetRect(hint.targetSelector, hint.fallbackSelector);
  if (!targetRect || !containerRect) return null;

  // Position above the target by default
  const top = targetRect.top - containerRect.top - 40;
  const left = targetRect.left + targetRect.width / 2 - containerRect.left;

  return (
    <div
      className="absolute z-[90] flex flex-col items-center"
      style={{
        top,
        left,
        transform: 'translateX(-50%)',
        animation: 'hint-pop-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="relative flex items-center gap-2 rounded-full border border-amber-300/70
                   bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50
                   px-3.5 py-2 text-xs font-bold text-amber-900 shadow-lg
                   backdrop-blur-sm animate-pulse-slow"
      >
        <span className="text-sm">💡</span>
        <span className="whitespace-nowrap">{hint.message}</span>
        <button
          type="button"
          onClick={() => onDismiss(hint.id)}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full
                     bg-amber-200/60 text-amber-800 hover:bg-amber-300/80 transition-colors"
          aria-label="Dismiss hint"
        >
          ✕
        </button>

        {/* Auto-dismiss progress ring */}
        <div className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-amber-200/40 overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{
              width: `${100 - progress}%`,
              transition: 'width 50ms linear',
            }}
          />
        </div>
      </div>

      {/* Arrow */}
      <div className="w-2 h-2 bg-amber-50 rotate-45 border-r border-b border-amber-300/70 -mt-1" />
    </div>
  );
});

const ContextualHints = memo(function ContextualHints() {
  const level = useGameSelector((state) => state.level || 1);
  const [activeHints, setActiveHints] = useState([]);
  const [containerRect, setContainerRect] = useState(null);
  const containerRef = useRef(null);
  const shownRef = useRef(getShownHints());
  const levelRef = useRef(level);

  // Keep container rect updated for positioning
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    const id = setInterval(updateRect, 500);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearInterval(id);
    };
  }, []);

  const dismissHint = useCallback((hintId) => {
    setActiveHints((prev) => prev.filter((h) => h.id !== hintId));
    shownRef.current.add(hintId);
    saveShownHints(shownRef.current);
  }, []);

  useEffect(() => {
    // Only evaluate when level increases
    if (level <= levelRef.current) return;
    levelRef.current = level;

    // Find newly eligible hints that haven't been shown
    const newlyEligible = HINT_CONFIGS.filter((hint) => {
      if (shownRef.current.has(hint.id)) return false;
      return level >= hint.minLevel && level <= hint.maxLevel;
    });

    if (newlyEligible.length === 0) return;

    // Stagger hints so they don't all appear at once
    newlyEligible.forEach((hint, index) => {
      setTimeout(() => {
        setActiveHints((prev) => {
          if (prev.some((h) => h.id === hint.id)) return prev;
          return [...prev, hint];
        });
      }, index * 800);
    });
  }, [level]);

  if (activeHints.length === 0) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[80] pointer-events-none"
      aria-live="polite"
    >
      {activeHints.map((hint) => (
        <ContextualHint
          key={hint.id}
          hint={hint}
          onDismiss={dismissHint}
          containerRect={containerRect}
        />
      ))}

      <style>{`
        @keyframes hint-pop-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
});

export default ContextualHints;
