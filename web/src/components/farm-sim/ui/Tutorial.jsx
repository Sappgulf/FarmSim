import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Tutorial — polished guided tour with glassmorphism, progress dots,
 * Next/Back navigation, spotlight overlay, and spring animations.
 */

const ONBOARDING_STEPS = [
  {
    id: 'plant',
    title: 'Plant Your First Crop',
    description: 'Choose a seed from your pouch, then tap any empty soil patch to sow it.',
    emoji: '🌱',
    target: '[data-onboard="farm-grid"]',
    placement: 'right',
  },
  {
    id: 'harvest',
    title: 'Harvest & Earn',
    description: 'When your crops glow, tap them to gather produce and earn coins.',
    emoji: '🧺',
    target: '[data-onboard="farm-grid"]',
    placement: 'right',
  },
  {
    id: 'board',
    title: 'Visit the Town Board',
    description: 'Open the menu and head to Events to see today\'s plan and special quests.',
    emoji: '📋',
    target: '[data-onboard="events-tab"]',
    placement: 'top',
  },
];

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export const isTutorialInteractiveTarget = (target) => Boolean(
  target?.closest?.('button, input, textarea, select, a, label, [role="button"]')
);

const Tutorial = memo(() => {
  const actions = useGameActions();
  const onboardingStep = useGameSelector((state) => state.onboardingStep || 0);
  const onboardingSkipped = useGameSelector((state) => Boolean(state.onboardingSkipped));
  const onboardingSeen = useGameSelector((state) => Boolean(state.onboardingSeen));
  const [targetRect, setTargetRect] = useState(null);
  const [manualPosition, setManualPosition] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const dragStateRef = useRef(null);
  const prevStepRef = useRef(onboardingStep);

  const stepIndex = onboardingStep;
  const currentStep = ONBOARDING_STEPS[stepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const shouldShow = !onboardingSkipped && stepIndex < totalSteps;

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
    if (!shouldShow || !currentStep?.target) {
      setTargetRect(null);
      return;
    }

    let frame = null;
    const updateRect = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = document.querySelector(currentStep.target);
        if (!target) {
          setTargetRect(null);
          return;
        }
        const rect = target.getBoundingClientRect();
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
  }, [shouldShow, currentStep]);

  /* Reset manual drag on step change -------------------------------- */
  useEffect(() => {
    setManualPosition(null);
  }, [stepIndex]);

  /* Position calculation -------------------------------------------- */
  const defaultPosition = useMemo(() => {
    if (!shouldShow) return null;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 640;
    const margin = 16;
    const cardWidth = Math.min(340, viewportWidth - margin * 2);
    const cardHeight = 220;

    if (!targetRect) {
      return {
        top: clamp(viewportHeight - cardHeight - 140, margin, viewportHeight - cardHeight - margin),
        left: clamp((viewportWidth - cardWidth) / 2, margin, viewportWidth - cardWidth - margin),
        width: cardWidth,
      };
    }

    const placements = {
      right: {
        top: targetRect.top + targetRect.height / 2 - cardHeight / 2,
        left: targetRect.left + targetRect.width + margin,
      },
      left: {
        top: targetRect.top + targetRect.height / 2 - cardHeight / 2,
        left: targetRect.left - cardWidth - margin,
      },
      top: {
        top: targetRect.top - cardHeight - margin,
        left: targetRect.left + targetRect.width / 2 - cardWidth / 2,
      },
      bottom: {
        top: targetRect.top + targetRect.height + margin,
        left: targetRect.left + targetRect.width / 2 - cardWidth / 2,
      },
    };

    const placement = placements[currentStep?.placement] || placements.bottom;
    return {
      top: clamp(placement.top, margin, viewportHeight - cardHeight - margin),
      left: clamp(placement.left, margin, viewportWidth - cardWidth - margin),
      width: cardWidth,
    };
  }, [shouldShow, targetRect, currentStep]);

  const position = manualPosition || defaultPosition;

  /* Drag handlers --------------------------------------------------- */
  const handlePointerDown = (event) => {
    if (!position) return;
    if (isTutorialInteractiveTarget(event.target)) {
      return;
    }
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originLeft: position.left,
      originTop: position.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current) return;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 640;
    const margin = 16;
    const cardWidth = position?.width || 280;
    const cardHeight = 220;

    const dx = event.clientX - dragStateRef.current.startX;
    const dy = event.clientY - dragStateRef.current.startY;

    const nextLeft = clamp(dragStateRef.current.originLeft + dx, margin, viewportWidth - cardWidth - margin);
    const nextTop = clamp(dragStateRef.current.originTop + dy, margin, viewportHeight - cardHeight - margin);

    setManualPosition({ left: nextLeft, top: nextTop, width: cardWidth });
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
  };

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

  if (!shouldShow || !currentStep || !position) return null;

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none">
      {/* ── Spotlight overlay ── */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-500" />

      {/* Target highlight ring + glow */}
      {targetRect && (
        <>
          <div
            className="absolute rounded-2xl ring-1 ring-white/20 shadow-[0_0_32px_-8px_rgba(255,255,255,0.14)] pointer-events-none transition-all duration-500"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
          {/* Soft inner glow behind target */}
          <div
            className="absolute rounded-2xl bg-white/8 pointer-events-none transition-all duration-500"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        </>
      )}

      {/* ── Tutorial card ── */}
      <div
        className="absolute"
        style={{ top: position.top, left: position.left, width: position.width }}
      >
        <div
          className={`pointer-events-auto rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] touch-manipulation ${
            cardVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-[0.96]'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          {/* Top bar: emoji + title + close */}
          <div className="flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl shadow-inner">
                {currentStep.emoji}
              </span>
              <div>
                <div className="text-sm font-bold text-white">{currentStep.title}</div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-200/60">
                  Step {stepIndex + 1} of {totalSteps}
                </div>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
              aria-label="Skip tutorial"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-6 text-emerald-50/80">
            {currentStep.description}
          </p>

          {/* Progress dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {ONBOARDING_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => actions.updateOnboarding({ onboardingStep: i, onboardingSeen: true })}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? 'w-6 bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.5)]'
                    : i < stepIndex
                    ? 'w-2 bg-emerald-300/50'
                    : 'w-2 bg-white/20 hover:bg-white/30'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Footer: Don't show again + Nav buttons */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
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

            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 px-2.5 text-emerald-100/70 hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft size={16} className="mr-0.5" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
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
  );
});

Tutorial.displayName = 'Tutorial';

export default Tutorial;
