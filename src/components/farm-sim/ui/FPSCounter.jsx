import React, { memo, useState, useEffect } from 'react';

const FPSCounter = memo(() => {
    const [fps, setFps] = useState(60);
    const [showFPS, setShowFPS] = useState(false);

    // Check settings from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('farm_sim_enhanced_v2');
            if (saved) {
                const data = JSON.parse(saved);
                setShowFPS(data?.settings?.showFPS ?? false);
            }
        } catch (e) { /* ignore */ }
    }, []);

    // PERF FIX: Read FPS from window global, not React state
    // This avoids triggering React re-renders from GameContext
    useEffect(() => {
        if (!showFPS) return;
        const interval = setInterval(() => {
            setFps(window.__currentFPS || 60);
        }, 500); // Update display 2x/sec (not 60x!)
        return () => clearInterval(interval);
    }, [showFPS]);

    if (!showFPS) return null;

    const getColor = (fps) => {
        if (fps >= 50) return 'text-green-400';
        if (fps >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed top-2 left-2 bg-black/70 backdrop-blur-sm p-2 rounded-lg z-50 pointer-events-none select-none border border-white/10 shadow-lg">
            <div className={`font-mono font-bold text-sm ${getColor(fps)}`}>
                FPS: {fps}
            </div>
        </div>
    );
});

FPSCounter.displayName = 'FPSCounter';
export default FPSCounter;
