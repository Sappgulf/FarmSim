/**
 * Tutorial Component
 * Onboarding overlay with step-by-step guidance
 */
import React, { memo, useEffect, useState } from 'react';
import { X, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';

function TutorialComponent({
  showTutorial,
  currentStep,
  tutorialStep,
  totalSteps,
  progress,
  highlightedElement,
  onNext,
  onSkip,
}) {
  const [targetRect, setTargetRect] = useState(null);

  // Update target element position
  useEffect(() => {
    if (highlightedElement) {
      const element = document.getElementById(highlightedElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [highlightedElement, tutorialStep]);

  if (!showTutorial || !currentStep) return null;

  const isCenter = currentStep.position === 'center' || !targetRect;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop with spotlight cutout */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto"
        onClick={onSkip}
      />

      {/* Spotlight on target element */}
      {targetRect && (
        <div
          className="absolute ring-4 ring-blue-400 ring-opacity-75 rounded-lg pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Tutorial card */}
      <div
        className={`
          absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-5 max-w-sm w-[90%]
          pointer-events-auto
          transition-all duration-300
          ${isCenter
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : currentStep.position === 'top'
              ? 'bottom-4 left-1/2 -translate-x-1/2'
              : 'top-4 left-1/2 -translate-x-1/2'
          }
        `}
      >
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step counter */}
        <div className="text-xs text-gray-500 mb-2">
          Step {tutorialStep + 1} of {totalSteps}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {currentStep.title}
        </h3>

        {/* Content */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {currentStep.content}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onSkip}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <SkipForward size={14} />
            Skip
          </button>

          <Button
            onClick={onNext}
            className="flex items-center gap-1"
          >
            {tutorialStep === totalSteps - 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tutorial"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export const Tutorial = memo(TutorialComponent);
