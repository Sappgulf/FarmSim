import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  ONBOARDING_TUTORIAL_BOARD_STEP_INDEX,
  ONBOARDING_TUTORIAL_STEPS as ONBOARDING_STEPS,
} from '../data/onboardingTutorialSteps';

/**
 * Tutorial — guided tour with focus management (optional Tab trap) and onboarding hooks.
 */

const SIDE_MARGIN = 16;
/** Room for fixed bottom nav + home-indicator band — pairs with `<main>` bottom padding. */
const BOTTOM_NAV_RESERVE = 120;
function collectFocusables(root) {
  if (!root) return [];
  const nodes = root.querySelectorAll(
    [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')
  );
  return Array.from(nodes).filter((n) => {
    const el = n;
    if (!el.offsetParent && el.getAttribute('type') !== 'hidden') return true;
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ opacityProperty: false });
    }
    return Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
}

/**
 * Chooses first matching element with non-trivial geometry (handles `hidden sm:*` onboarding anchors).
 * @param {string[]} selectors
 * @returns {HTMLElement | null}
 */
export function resolveTutorialTarget(selectors) {
  if (typeof document === 'undefined' || !Array.isArray(selectors)) return null;
  const minDim = 6;
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (!el) continue;
    try {
      const style =
        typeof window !== 'undefined' && typeof window.getComputedStyle === 'function'
          ? window.getComputedStyle(el)
          : null;
      if (style && (style.display === 'none' || style.visibility === 'hidden')) continue;
    } catch {
      continue;
    }
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, el.offsetWidth || 0, el.clientWidth || 0);
    const height = Math.max(rect.height, el.offsetHeight || 0, el.clientHeight || 0);
    if (width >= minDim && height >= minDim) {
      return /** @type {HTMLElement | null} */ (el);
    }
  }
  return null;
}

export const isTutorialInteractiveTarget = (target) =>
  Boolean(target?.closest?.('button, input, textarea, select, a, label, [role="button"]'));

const Tutorial = memo(() => {
  const actions = useGameActions();
  const onboardingStep = useGameSelector((state) => state.onboardingStep || 0);
  const onboardingSkipped = useGameSelector((state) => Boolean(state.onboardingSkipped));
  const onboardingSeen = useGameSelector((state) => Boolean(state.onboardingSeen));
  const [targetRect, setTargetRect] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const speechPanelRef = useRef(null);
  const onboardingMoreRevealRef = useRef(false);

  const stepIndex = onboardingStep;
  const currentStep = ONBOARDING_STEPS[stepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const shouldShow = !onboardingSkipped && stepIndex < totalSteps;

  /** Land on Farming + widen More strip when the Town Board step is active */
  useEffect(() => {
    if (onboardingSkipped || !shouldShow) onboardingMoreRevealRef.current = false;
  }, [onboardingSkipped, shouldShow]);

  useEffect(() => {
    if (!shouldShow || stepIndex !== ONBOARDING_TUTORIAL_BOARD_STEP_INDEX || onboardingMoreRevealRef.current) return;
    onboardingMoreRevealRef.current = true;
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('farmSim:expandMoreSection'));
      window.dispatchEvent(new CustomEvent('farmSim:expandMoreSubtabs'));
    });
  }, [shouldShow, stepIndex]);

  /* Restore focus after tour closes -------------------------------- */
  useEffect(() => {
    if (!shouldShow) return undefined;
    const prev = document.activeElement;
    const safeFocus = () => {
      if (!(prev instanceof HTMLElement)) return;
      try {
        if (prev.isConnected) prev.focus();
      } catch {
        /* ignore */
      }
    };
    return () => {
      queueMicrotask(safeFocus);
    };
  }, [shouldShow]);

  /* Prefer primary action when each step settles */
  useEffect(() => {
    if (!shouldShow || !cardVisible || !speechPanelRef.current) return undefined;
    const id = window.setTimeout(() => {
      const btn = speechPanelRef.current?.querySelector('[data-tutorial-primary="true"]');
      if (btn && typeof btn.focus === 'function') btn.focus();
    }, 80);
    return () => window.clearTimeout(id);
  }, [shouldShow, cardVisible, stepIndex]);

  /* Tab cycling within tutorial surface (desktop) ------------------- */
  useEffect(() => {
    if (!shouldShow || !speechPanelRef.current) return undefined;
    const root = speechPanelRef.current;

    const onKeyDown = (e) => {
      if (e.key !== 'Tab' || !root.contains(document.activeElement)) return;

      const list = collectFocusables(root);
      if (list.length === 0) return;

      const first = list[0];
      const last = list[list.length - 1];

      const active = document.activeElement;
      if (!active || !root.contains(active)) {
        first.focus();
        e.preventDefault();
        return;
      }

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [shouldShow, stepIndex, cardVisible]);

  /* Animate card in whenever step changes --------------------------- */
  useEffect(() => {
    if (!shouldShow) {
      setCardVisible(false);
      return;
    }
    setCardVisible(false);
    const t = setTimeout(() => setCardVisible(true), 40);
    return () => clearTimeout(t);
  }, [shouldShow, stepIndex]);

  /* Mark as seen ---------------------------------------------------- */
  useEffect(() => {
    if (shouldShow && !onboardingSeen) {
      actions.updateOnboarding({ onboardingSeen: true });
    }
  }, [shouldShow, onboardingSeen, actions]);

  /* Track target element -------------------------------------------- */
  useEffect(() => {
    const selectorList = currentStep?.targetSelectors?.length
      ? currentStep.targetSelectors
      : currentStep?.target
        ? [currentStep.target]
        : [];

    if (!shouldShow || selectorList.length === 0) {
      setTargetRect(null);
      return;
    }

    let frame = null;
    const updateRect = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const targetEl = resolveTutorialTarget(selectorList);
        if (!targetEl) {
          setTargetRect(null);
          return;
        }
        const rect = targetEl.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [shouldShow, currentStep?.id, currentStep?.target, currentStep?.targetSelectors]);

  /** Card width caps — layout is viewport-centered via flex, not anchored to highlights. */
  const cardLayout = useMemo(() => {
    if (!shouldShow) return null;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const cardWidth = Math.min(340, viewportWidth - SIDE_MARGIN * 2);
    return { width: cardWidth };
  }, [shouldShow]);

  /* Navigation ------------------------------------------------------ */
  const handleNext = () => {
    const next = stepIndex + 1;
    if (next >= totalSteps) {
      finish();
    } else {
      actions.updateOnboarding({ onboardingStep: next, onboardingSeen: true });
    }
  };

  const handleBack = () => {
    const prev = Math.max(0, stepIndex - 1);
    actions.updateOnboarding({ onboardingStep: prev, onboardingSeen: true });
  };

  const handleSkip = () => {
    finish();
  };

  const finish = () => {
    actions.updateOnboarding({
      onboardingSkipped: dontShowAgain,
      onboardingStep: totalSteps,
      onboardingSeen: true,
    });
  };

  if (!shouldShow || !currentStep || !cardLayout) return null;

  return (
    <div className="fixed inset-0 z-[95]" data-qa="onboarding-tutorial">
      {/* ── Spotlight overlay (decorative — keep out of accessibility tree; dialog holds semantics) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-500" />

      {/* Target highlight ring + glow */}
      {targetRect && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-2xl ring-1 ring-white/20 shadow-[0_0_32px_-8px_rgba(255,255,255,0.14)] transition-all duration-500"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-2xl bg-white/8 transition-all duration-500"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        </>
      )}

      {/* ── Tutorial card (always centered; target ring above is informational only) ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-4"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
          paddingBottom: `max(5.5rem, calc(${BOTTOM_NAV_RESERVE}px + env(safe-area-inset-bottom, 0px)))`,
        }}
      >
        <div className="w-full pointer-events-none" style={{ maxWidth: cardLayout.width }}>
          <div
            ref={speechPanelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="farm-tutorial-title"
            aria-describedby="farm-tutorial-description"
            className={`outline-none pointer-events-auto max-h-[min(68vh,520px)] overflow-y-auto overscroll-y-contain rounded-[2rem] border border-white/25 bg-white/[0.14] backdrop-blur-2xl shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] ring-2 ring-emerald-400/20 ring-inset sm:ring-offset-0 p-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] touch-manipulation ${
              cardVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-[0.96]'
            }`}
          >
            {/* Top bar: emoji + title + close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl shadow-inner" aria-hidden>
                  {currentStep.emoji}
                </span>
                <div className="min-w-0">
                  <div id="farm-tutorial-title" className="text-sm font-bold text-white">
                    {currentStep.title}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-200/60">
                    Step {stepIndex + 1} of {totalSteps}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors shrink-0"
                aria-label="Skip tutorial"
              >
                <X size={16} />
              </button>
            </div>

            <p id="farm-tutorial-description" className="mt-3 whitespace-pre-line text-sm leading-6 text-emerald-50/90">
              {currentStep.description}
            </p>

            {/* Progress dots */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Tutorial steps">
              {ONBOARDING_STEPS.map((s, i) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() =>
                    actions.updateOnboarding({
                      onboardingStep: i,
                      onboardingSeen: true,
                    })}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === stepIndex
                      ? 'w-6 bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.5)]'
                      : i < stepIndex
                        ? 'w-2 bg-emerald-300/50'
                        : 'w-2 bg-white/20 hover:bg-white/30'
                  }`}
                  aria-label={`Go to step ${i + 1}, ${s.title}`}
                  aria-current={i === stepIndex ? 'step' : undefined}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 select-none group">
                <span className="relative flex h-4 w-4 items-center justify-center rounded border border-white/20 bg-white/5 transition-colors group-hover:border-white/30">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                  />
                  <span className="h-2 w-2 rounded-sm bg-emerald-300 opacity-0 transition-opacity peer-checked:opacity-100" />
                </span>
                <span className="text-[11px] text-white/40 group-hover:text-white/55 transition-colors">
                  Don&apos;t show again
                </span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                {stepIndex > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-8 px-2.5 text-emerald-100/70 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft size={16} className="mr-0.5" />
                    Back
                  </Button>
                ) : (
                  <span className="min-w-[1px] sm:h-8" aria-hidden />
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  data-tutorial-primary="true"
                  className="h-8 bg-white/15 text-white hover:bg-white/25 border border-white/10 backdrop-blur-md"
                >
                  {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                  <ChevronRight size={16} className="ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Tutorial.displayName = 'Tutorial';

export default Tutorial;
