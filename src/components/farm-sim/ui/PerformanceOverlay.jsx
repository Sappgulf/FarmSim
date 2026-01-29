import React, { memo, useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getPerfMetrics, isDebugEnabled } from '../services/DebugService';
import { addTrackedEventListener } from '../services/EventListenerService';

/**
 * Performance Overlay Component
 * Dev-only overlay showing comprehensive performance metrics
 * Toggle with backtick (`) key
 */
const PerformanceOverlay = memo(() => {
    const { state } = useGame();
    const [isVisible, setIsVisible] = useState(false);
    const [metrics, setMetrics] = useState({
        fps: 0,
        frameTime: 0,
        updateTime: 0,
        renderTime: 0,
        memory: 0,
        entityCount: 0,
        activeTiles: 0,
        particleCount: 0,
        listenerCount: 0,
        tickTime: 0,
    });

    const frameTimesRef = useRef([]);
    const lastFrameTimeRef = useRef(performance.now());
    const updateStartRef = useRef(0);
    const debugEnabled = isDebugEnabled();

    // Toggle visibility with backtick key
    useEffect(() => {
        if (!debugEnabled) return () => {};
        const handleKeyPress = (e) => {
            if (e.key === '`' || e.key === '~') {
                setIsVisible(prev => !prev);
            }
        };
        return addTrackedEventListener(window, 'keydown', handleKeyPress);
    }, [debugEnabled]);

    // Collect metrics at lower frequency (2Hz instead of 60Hz)
    useEffect(() => {
        if (!isVisible) return;

        const collectMetrics = () => {
            // PERF FIX: Use window globals for FPS
            const fps = window.__currentFPS || 60;
            const avgFrameTime = fps > 0 ? (1000 / fps) : 16.67;
            const perfMetrics = getPerfMetrics();

            // Memory (Chrome only)
            const memory = performance.memory
                ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))
                : 0;

            // Entity counts - read from stateRef to avoid subscription
            const plots = state.plots?.length || 0;
            const animals = state.livestock?.animals?.length || 0;
            const notifications = state.notifications?.length || 0;
            const activeTiles = state.plots?.filter(p => p?.state && p.state !== 'empty').length || 0;
            const entityCount = plots + animals + notifications;

            // Particle count (from global)
            const particleCount = window.__particleCount || 0;

            setMetrics({
                fps,
                frameTime: avgFrameTime.toFixed(1),
                updateTime: (perfMetrics?.lastUpdateTime || window.__lastUpdateTime || 0).toFixed(1),
                renderTime: (perfMetrics?.lastRenderTime || 0).toFixed(1),
                memory,
                entityCount,
                activeTiles,
                particleCount,
                listenerCount: perfMetrics?.listenerCount || 0,
                tickTime: (perfMetrics?.lastTickTime || 0).toFixed(1),
            });
        };

        // Update at 2Hz instead of 60Hz
        const intervalId = setInterval(collectMetrics, 500);
        collectMetrics(); // Initial call

        return () => clearInterval(intervalId);
    }, [isVisible, state.plots?.length, state.livestock?.animals?.length, state.notifications?.length]);

    // Don't render in production unless explicitly enabled
    if (!debugEnabled) {
        return null;
    }

    if (!isVisible) {
        return (
            <div className="fixed bottom-2 right-2 text-xs text-gray-400 pointer-events-none z-50">
                Press ` for perf overlay
            </div>
        );
    }

    // Color coding
    const getFPSColor = (fps) => {
        if (fps >= 55) return 'text-green-400';
        if (fps >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getFrameTimeColor = (ms) => {
        if (ms <= 16.67) return 'text-green-400';
        if (ms <= 33.33) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed top-2 left-2 bg-black/90 backdrop-blur-sm text-white font-mono text-xs p-3 rounded-lg z-[9999] min-w-[200px] shadow-xl border border-gray-700">
            <div className="text-gray-400 mb-2 flex justify-between items-center">
                <span>⚙️ PERF OVERLAY</span>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-500 hover:text-white"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-1">
                {/* FPS */}
                <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
                </div>

                {/* Frame Time */}
                <div className="flex justify-between">
                    <span>Frame:</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.frameTime))}>
                        {metrics.frameTime}ms
                    </span>
                </div>

                {/* Update Time */}
                <div className="flex justify-between">
                    <span>Update:</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.updateTime))}>
                        {metrics.updateTime}ms
                    </span>
                </div>

                {/* Render Time */}
                <div className="flex justify-between">
                    <span>Render:</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.renderTime))}>
                        {metrics.renderTime}ms
                    </span>
                </div>

                {/* Tick Time */}
                <div className="flex justify-between">
                    <span>Tick:</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.tickTime))}>
                        {metrics.tickTime}ms
                    </span>
                </div>

                {/* Memory */}
                {metrics.memory > 0 && (
                    <div className="flex justify-between">
                        <span>Memory:</span>
                        <span className={metrics.memory > 100 ? 'text-yellow-400' : 'text-gray-300'}>
                            {metrics.memory}MB
                        </span>
                    </div>
                )}

                <div className="border-t border-gray-700 my-2" />

                {/* Entity Counts */}
                <div className="flex justify-between">
                    <span>Entities:</span>
                    <span className={metrics.entityCount > 100 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.entityCount}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Active Tiles:</span>
                    <span className={metrics.activeTiles > 50 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.activeTiles}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Particles:</span>
                    <span className={metrics.particleCount > 50 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.particleCount}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Listeners:</span>
                    <span className={metrics.listenerCount > 50 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.listenerCount}
                    </span>
                </div>

                {/* Game State */}
                <div className="border-t border-gray-700 my-2" />
                <div className="flex justify-between">
                    <span>Grid:</span>
                    <span className="text-gray-300">{state.gridSize}×{state.gridSize}</span>
                </div>
                <div className="flex justify-between">
                    <span>Paused:</span>
                    <span className={state.gameLoop?.paused ? 'text-yellow-400' : 'text-green-400'}>
                        {state.gameLoop?.paused ? 'YES' : 'NO'}
                    </span>
                </div>
            </div>

            <div className="text-gray-500 text-[10px] mt-2 border-t border-gray-700 pt-2">
                Press ` to toggle
            </div>
        </div>
    );
});

PerformanceOverlay.displayName = 'PerformanceOverlay';

export default PerformanceOverlay;
