import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Star, Unlock, X } from 'lucide-react';
import { getAvailableCrops } from '../constants/cropData';
import { getSoundSystem } from '../systems/SoundSystem';

const LevelUpModal = ({ level, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Calculate what was just unlocked
    const unlocks = useMemo(() => {
        const currentCrops = getAvailableCrops(level);
        const prevCrops = getAvailableCrops(level - 1);

        // Find crops that are in current but not in prev
        const newCrops = currentCrops.filter(
            crop => !prevCrops.find(p => p.id === crop.id)
        );

        return {
            crops: newCrops,
            // Placeholder for future features (buildings, mechanics)
            features: []
        };
    }, [level]);

    useEffect(() => {
        // Entrance animation delay
        const timer = setTimeout(() => setIsVisible(true), 100);

        // Play sound
        const soundSystem = getSoundSystem();
        if (soundSystem) {
            soundSystem.playSound('achievement_unlock'); // Fallback to existing sound
        }

        return () => clearTimeout(timer);
    }, [level]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className={`
        w-full max-w-md bg-white/95 dark:bg-slate-900/95 border-2 border-yellow-400 shadow-2xl overflow-hidden
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        transition-all duration-500 ease-out
      `}>
                {/* Header with Burst Background */}
                <div className="relative pt-8 pb-6 text-center overflow-hidden bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900">
                    {/* Decorative circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 ring-4 ring-yellow-200 dark:ring-yellow-700 shadow-lg">
                            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-[spin_3s_linear_infinite]" />
                        </div>

                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 drop-shadow-sm mb-1">
                            LEVEL UP!
                        </h2>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                            You reached Level <span className="text-yellow-600 dark:text-yellow-400">{level}</span>
                        </p>
                    </div>
                </div>

                {/* Unlocks Section */}
                <div className="p-6 space-y-4">
                    {unlocks.crops.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                <Unlock className="w-4 h-4" /> Unlocked Items
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {unlocks.crops.map(crop => (
                                    <div key={crop.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <span className="text-2xl">{crop.emoji}</span>
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{crop.name}</div>
                                            <div className="text-xs text-slate-500">{crop.category}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 italic py-2">
                            Keep growing your farm to unlock new crops!
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <Button
                        onClick={onClose}
                        className="w-full max-w-xs bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        Awesome!
                    </Button>
                </div>
            </Card>

            {/* Confetti Setup (Pure CSS or existing particle system invoked elsewhere) */}
        </div>
    );
};

export default LevelUpModal;
