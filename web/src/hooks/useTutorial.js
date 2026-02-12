/**
 * Tutorial Hook
 * Manages onboarding flow and contextual hints
 */
import { useState, useCallback, useEffect } from 'react';
import { TUTORIAL_STEPS } from '../data/constants';

export function useTutorial(tutorialComplete, tutorialStep, advanceTutorial, completeTutorial) {
  const [showTutorial, setShowTutorial] = useState(!tutorialComplete);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [hints, setHints] = useState([]);

  // Get current step
  const currentStep = TUTORIAL_STEPS[tutorialStep] || null;
  const totalSteps = TUTORIAL_STEPS.length;
  const progress = ((tutorialStep + 1) / totalSteps) * 100;

  // Go to next step
  const nextStep = useCallback(() => {
    if (tutorialStep >= totalSteps - 1) {
      completeTutorial?.();
      setShowTutorial(false);
      return;
    }
    advanceTutorial?.();
  }, [tutorialStep, totalSteps, advanceTutorial, completeTutorial]);

  // Skip tutorial
  const skipTutorial = useCallback(() => {
    completeTutorial?.();
    setShowTutorial(false);
  }, [completeTutorial]);

  // Restart tutorial
  const restartTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  // Show contextual hint
  const showHint = useCallback((message, target = null, duration = 5000) => {
    const id = Date.now();
    const hint = { id, message, target };
    setHints(prev => [...prev, hint]);

    setTimeout(() => {
      setHints(prev => prev.filter(h => h.id !== id));
    }, duration);

    return id;
  }, []);

  // Dismiss hint
  const dismissHint = useCallback((id) => {
    setHints(prev => prev.filter(h => h.id !== id));
  }, []);

  // Update highlighted element when step changes
  useEffect(() => {
    if (currentStep?.target) {
      setHighlightedElement(currentStep.target);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep]);

  // Trigger hints based on game state (can be called from main component)
  const checkForHints = useCallback((gameState) => {
    if (tutorialComplete) return;

    const { coins, plots, inventory } = gameState || {};

    // Hint: Low on seeds
    if (inventory && Object.values(inventory).filter(v => v > 0).length === 0) {
      showHint("💡 You're out of seeds! Visit the shop to buy more.", 'shop-tab');
    }

    // Hint: Crops ready to harvest
    if (plots) {
      const readyPlots = plots.filter(p => p.status === 'ready');
      if (readyPlots.length > 2) {
        showHint("🌾 Multiple crops ready! Click them to harvest.", 'farm-grid');
      }
    }

    // Hint: Lots of coins, suggest upgrades
    if (coins > 100 && !inventory?.fertilizer) {
      showHint("💡 Try buying fertilizer to speed up growth!", 'shop-tab');
    }
  }, [tutorialComplete, showHint]);

  return {
    // State
    showTutorial,
    currentStep,
    totalSteps,
    tutorialStep,
    progress,
    highlightedElement,
    hints,

    // Actions
    nextStep,
    skipTutorial,
    restartTutorial,
    showHint,
    dismissHint,
    checkForHints,

    // Setters
    setShowTutorial,
  };
}
