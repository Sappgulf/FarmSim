import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useGameSelector } from '../context/GameContext';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'farmSim_contextHints_v1';

const HINT_CONFIGS = [
  {
    id: 'hint_shop',
    message: 'Nice find in the Shop! Tap Items or Shop anytime from the bar.',
    targetSelector: '[data-onboard="shop-tab"]',
    fallbackSelector: 'button[title="Open Shop"], button[aria-label*="Shop" i]',
  },
  {
    id: 'hint_buildings',
    message: 'Buildings are live! Tap Build to expand your homestead.',
    targetSelector: 'button[aria-label*="Build" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_inventory',
    message: 'Check your Items tab for tools and leftover seeds.',
    targetSelector: 'button[aria-label*="Items" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_animals',
    message: 'You have animals now! Tap Animals to care for them.',
    targetSelector: 'button[aria-label*="Animals" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_processing',
    message: 'Processing is open! Turn crops into goods here.',
    targetSelector: '[data-onboard="processing-tab"]',
    fallbackSelector: null,
  },
  {
    id: 'hint_research',
    message: 'Research is buzzing! Tune upgrades in the Build section.',
    targetSelector: '[data-onboard="research-tab"]',
    fallbackSelector: null,
  },
  {
    id: 'hint_fishing',
    message: 'You caught fish! Fishing lives under Animals.',
    targetSelector: 'button[aria-label*="Animals" i]',
    fallbackSelector: null,
  },
  {
    id: 'hint_analytics',
    message: 'You opened Events — peek at Analytics anytime in More.',
    targetSelector: 'button[title="Open Analytics"]',
    fallbackSelector: null,
  },
  {
    id: 'hint_achievements',
    message: 'Chasing goals? Claim Achievements under More.',
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

  const top = targetRect.top - containerRect.top - 40;
  const left = targetRect.left + targetRect.width / 2 - containerRect.left;

  const ih = typeof window !== 'undefined' ? window.innerHeight : 640;
  const topResolved = Math.max(8, Math.min(top, ih - 130));

  return (
    <div
      className="pointer-events-auto absolute z-[90] flex flex-col items-center max-w-[min(92vw,20rem)]"
      style={{
        top: topResolved,
        left,
        transform: 'translateX(-50%)',
        animation: 'hint-pop-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="relative flex flex-wrap items-center justify-center gap-2 rounded-full border border-amber-300/70
                   bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50
                   px-3.5 py-2 text-xs font-bold text-amber-900 shadow-lg
                   backdrop-blur-sm animate-pulse-slow text-center sm:flex-nowrap"
      >
        <span className="text-sm">💡</span>
        <span className="text-center text-[11px] font-bold leading-snug text-amber-900 sm:text-xs">
          {hint.message}
        </span>
        <button
          type="button"
          onClick={() => onDismiss(hint.id)}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full
                     bg-amber-200/60 text-amber-800 hover:bg-amber-300/80 transition-colors"
          aria-label="Dismiss hint"
        >
          ✕
        </button>

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

      <div className="w-2 h-2 bg-amber-50 rotate-45 border-r border-b border-amber-300/70 -mt-1" />
    </div>
  );
});

const ContextualHints = memo(function ContextualHints() {
  const shopEligible = useGameSelector((s) => !!s.memoryFlags?.first_shop_purchase);
  const buildingEligible = useGameSelector((s) => !!s.memoryFlags?.first_building);
  const harvestEligible = useGameSelector((s) => !!s.memoryFlags?.first_harvest);
  const animalEligible = useGameSelector((s) => (s.livestock?.animals?.length || 0) > 0);
  const processingEligible = useGameSelector((s) => (s.processingFacilities?.length || 0) > 0);
  const researchEligible = useGameSelector(
    (s) => ((s.research?.completed?.length || 0) > 0) || (s.research?.active != null)
  );
  const fishingEligible = useGameSelector((s) => (s.fishing?.stats?.totalCaught || 0) > 0);
  const boardEligible = useGameSelector((s) => !!s.memoryFlags?.first_board_visit);

  const [activeHints, setActiveHints] = useState([]);
  const [containerRect, setContainerRect] = useState(null);
  const containerRef = useRef(null);
  const shownRef = useRef(getShownHints());

  /** Rising-edge tracking per hint id — mirrors unlockWhen without allocating state objects per frame. */
  const prevEligibleRef = useRef({
    hint_shop: false,
    hint_buildings: false,
    hint_inventory: false,
    hint_animals: false,
    hint_processing: false,
    hint_research: false,
    hint_fishing: false,
    hint_analytics: false,
    hint_achievements: false,
  });

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
    const map = {
      hint_shop: shopEligible,
      hint_buildings: buildingEligible,
      hint_inventory: harvestEligible,
      hint_animals: animalEligible,
      hint_processing: processingEligible,
      hint_research: researchEligible,
      hint_fishing: fishingEligible,
      hint_analytics: boardEligible,
      hint_achievements: !!(shopEligible && boardEligible),
    };

    const prev = prevEligibleRef.current;
    const risen = [];

    HINT_CONFIGS.forEach((config) => {
      const next = map[config.id];
      const was = prev[config.id];
      prev[config.id] = next;
      if (!next || was || shownRef.current.has(config.id)) return;
      risen.push(config);
    });

    if (risen.length === 0) return;

    risen.forEach((hint, index) => {
      window.setTimeout(() => {
        setActiveHints((prev) => {
          if (prev.some((h) => h.id === hint.id)) return prev;
          return [...prev, hint];
        });
      }, index * 800);
    });
  }, [
    shopEligible,
    buildingEligible,
    harvestEligible,
    animalEligible,
    processingEligible,
    researchEligible,
    fishingEligible,
    boardEligible,
  ]);

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
