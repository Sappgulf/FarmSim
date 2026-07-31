import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { ONBOARDING_STEPS } from '../../../constants/onboardingWalkthrough';

/** Re-export for lazy-loaded modules that resolve via Tutorial barrel. */
export { ONBOARDING_STEP_COUNT } from '../../../constants/onboardingWalkthrough';

/**
 * Tutorial - Soft onboarding overlay for first-time users
 * Event-driven steps, non-blocking, and skippable
 */

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const Tutorial = memo(() => {
  const actions = useGameActions();
  const onboardingStep = useGameSelector((state) => state.onboardingStep || 0);
  const onboardingSkipped = useGameSelector((state) => Boolean(state.onboardingSkipped));
  const [targetRect, setTargetRect] = useState(null);
  const [manualPosition, setManualPosition] = useState(null);
  const dragStateRef = useRef(null);

  const stepIndex = onboardingStep;
  const currentStep = ONBOARDING_STEPS[stepIndex];
  const totalSteps = ONBOARDING_STEPS.length;

  const shouldShow = !onboardingSkipped && stepIndex < totalSteps;

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

  useEffect(() => {
    setManualPosition(null);
  }, [stepIndex]);

  const defaultPosition = useMemo(() => {
    if (!shouldShow) return null;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 640;
    const margin = 12;
    const cardWidth = Math.min(320, viewportWidth - margin * 2);
    const cardHeight = 190;

    if (viewportWidth < 640) {
      return {
        top: clamp(viewportHeight - cardHeight - 96, margin, viewportHeight - cardHeight - margin),
        left: clamp((viewportWidth - cardWidth) / 2, margin, viewportWidth - cardWidth - margin),
        width: cardWidth,
      };
    }

    if (!targetRect) {
      return {
        top: clamp(viewportHeight - cardHeight - 120, margin, viewportHeight - cardHeight - margin),
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

  const handlePointerDown = (event) => {
    if (!position) return;
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
    const margin = 12;
    const cardWidth = position?.width || 280;
    const cardHeight = 190;

    const dx = event.clientX - dragStateRef.current.startX;
    const dy = event.clientY - dragStateRef.current.startY;

    const nextLeft = clamp(
      dragStateRef.current.originLeft + dx,
      margin,
      viewportWidth - cardWidth - margin
    );
    const nextTop = clamp(
      dragStateRef.current.originTop + dy,
      margin,
      viewportHeight - cardHeight - margin
    );

    setManualPosition({ left: nextLeft, top: nextTop, width: cardWidth });
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
  };

  const handleSkipPointerDown = (event) => {
    // The card only captures pointers from its dedicated drag handle. Keep
    // touch/click events on controls from being swallowed by the drag surface.
    event.stopPropagation();
  };

  const handleSkip = () => {
    actions.updateOnboarding({
      onboardingSkipped: true,
      onboardingStep: totalSteps,
      onboardingSeen: true,
    });
  };

  if (!shouldShow || !currentStep || !position) return null;

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none">
      {targetRect && (
        <div
          className="absolute rounded-2xl border-2 border-emerald-300/80 ring-2 ring-emerald-200/60 shadow-lg pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      <div
        className="absolute"
        style={{ top: position.top, left: position.left, width: position.width }}
      >
        <Card className="pointer-events-auto p-4 bg-white/95 shadow-xl border border-emerald-100">
          <div
            className="flex cursor-grab touch-none items-center justify-between gap-3 rounded-lg px-1 py-0.5 active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label="Drag tutorial card"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentStep.emoji}</span>
              <div className="text-sm font-semibold text-gray-900">{currentStep.title}</div>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              Step {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-600">{currentStep.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Drag the title to move</span>
            <Button
              variant="outline"
              size="sm"
              onPointerDown={handleSkipPointerDown}
              onClick={handleSkip}
            >
              Skip
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

Tutorial.displayName = 'Tutorial';

export default Tutorial;
