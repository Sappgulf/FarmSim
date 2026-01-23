import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

/**
 * Tutorial - Simple onboarding overlay for first-time users
 * Shows 4 quick steps, skippable, remembers completion in localStorage
 */

const TUTORIAL_STEPS = [
    {
        id: 1,
        title: 'Welcome to FarmSim! 🌾',
        description: 'Build your dream farm by planting crops, raising animals, and expanding your land.',
        emoji: '🚜',
        tip: 'Tap anywhere to continue'
    },
    {
        id: 2,
        title: 'Plant Your First Crop',
        description: 'Select a crop from the Farming tab, then tap an empty plot to plant it. Watch it grow!',
        emoji: '🌱',
        tip: 'Crops need time to grow'
    },
    {
        id: 3,
        title: 'Harvest for Coins',
        description: 'When crops are ready (glowing green), tap them to harvest and earn coins. Use coins to buy more seeds!',
        emoji: '🪙',
        tip: 'Don\'t let crops wither!'
    },
    {
        id: 4,
        title: 'Explore & Expand',
        description: 'Unlock animals, fishing, buildings, and more as you level up. Complete daily quests for bonus rewards.',
        emoji: '🏆',
        tip: 'Use the bottom nav to explore'
    }
];

const STORAGE_KEY = 'farm_tutorial_complete';

const Tutorial = memo(() => {
    const { state } = useGame();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Check if tutorial should show
    useEffect(() => {
        // Don't show if already completed
        const completed = localStorage.getItem(STORAGE_KEY);
        if (completed === 'true') {
            setIsVisible(false);
            return;
        }

        // Show tutorial for new players (level 1, few coins)
        if (state.level === 1 && state.coins < 200) {
            // Small delay for smoother appearance after game loads
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [state.level, state.coins]);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setIsExiting(true);
        localStorage.setItem(STORAGE_KEY, 'true');
        setTimeout(() => setIsVisible(false), 300);
    };

    if (!isVisible) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleNext}
        >
            <Card
                className={`max-w-sm w-full p-6 bg-white shadow-2xl transform transition-all duration-300 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-4">
                    {TUTORIAL_STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                    ? 'w-6 bg-green-500'
                                    : idx < currentStep
                                        ? 'bg-green-300'
                                        : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Step content */}
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce-slow">{step.emoji}</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <p className="text-sm text-green-600 font-medium">💡 {step.tip}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSkip}
                        className="flex-1"
                    >
                        Skip Tutorial
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNext}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLastStep ? 'Start Farming! 🌾' : 'Next →'}
                    </Button>
                </div>

                {/* Step counter */}
                <div className="text-center text-xs text-gray-400 mt-4">
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </div>
            </Card>
        </div>
    );
});

Tutorial.displayName = 'Tutorial';

// Export function to reset tutorial (for testing/settings)
export const resetTutorial = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export default Tutorial;
