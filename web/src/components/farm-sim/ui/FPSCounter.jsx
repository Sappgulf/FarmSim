import React, { memo, useState, useEffect } from 'react';
import { useGameSelector } from '../context/GameContext';
import { isReleaseMode } from '../../../config/release';

const FPSCounter = memo(() => {
    const [fps, setFps] = useState(60);
    const showFPS = useGameSelector((state) => Boolean(state.settings?.showFPS));

    // PERF FIX: Read FPS from window global, not React state
    // This avoids triggering React re-renders from GameContext
    useEffect(() => {
        if (!showFPS) return;
        const interval = setInterval(() => {
            setFps(window.__currentFPS || 60);
        }, 500); // Update display 2x/sec (not 60x!)
        return () => clearInterval(interval);
    }, [showFPS]);

    if (isReleaseMode() || !showFPS) return null;

    const getColor = (fps) => {
        if (fps >= 50) return 'text-green-400';
        if (fps >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed z-50 rounded-lg border border-white/10 bg-black/70 p-2 font-mono shadow-lg backdrop-blur-sm pointer-events-none select-none top-[max(0.5rem,env(safe-area-inset-top,0px))] left-[max(0.5rem,env(safe-area-inset-left,0px))]">
            <div className={`font-mono font-bold text-sm ${getColor(fps)}`}>
                FPS: {fps}
            </div>
        </div>
    );
});

FPSCounter.displayName = 'FPSCounter';
export default FPSCounter;
