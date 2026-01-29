import React, { memo, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getPerfMetrics, getProfilerStats, isDebugEnabled } from '../services/DebugService';
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
        avgFps: 0,
        frameTime: 0,
        worstFrameTime: 0,
        updateTime: 0,
        renderTime: 0,
        memory: 0,
        entityCount: 0,
        plotCount: 0,
        notificationCount: 0,
        activeTiles: 0,
        particleCount: 0,
        listenerCount: 0,
        activeTimers: 0,
        tickTime: 0,
        profiles: [],
    });

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
            const fps = window.__currentFPS || 60;
            const perfMetrics = getPerfMetrics();
            const now = Date.now();
            const frameSamples = perfMetrics?.frameTimes || [];
            let frameTotal = 0;
            let frameCount = 0;
            let worstFrame = 0;
            const cutoff = now - 5000;
            for (let i = frameSamples.length - 1; i >= 0; i -= 1) {
                const sample = frameSamples[i];
                if (sample.t < cutoff) break;
                frameTotal += sample.dt;
                frameCount += 1;
                if (sample.dt > worstFrame) worstFrame = sample.dt;
            }
            const avgFrameTime = frameCount > 0 ? frameTotal / frameCount : 16.67;
            const avgFps = avgFrameTime > 0 ? Math.min(999, Math.round(1000 / avgFrameTime)) : 0;

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
                avgFps,
                frameTime: avgFrameTime.toFixed(1),
                worstFrameTime: worstFrame.toFixed(1),
                updateTime: (perfMetrics?.lastUpdateTime || window.__lastUpdateTime || 0).toFixed(1),
                renderTime: (perfMetrics?.lastRenderTime || 0).toFixed(1),
                memory,
                entityCount,
                plotCount: plots,
                notificationCount: notifications,
                activeTiles,
                particleCount,
                listenerCount: perfMetrics?.listenerCount || 0,
                activeTimers: perfMetrics?.activeTimers || 0,
                tickTime: (perfMetrics?.lastTickTime || 0).toFixed(1),
                profiles: getProfilerStats(5000).slice(0, 3),
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

                <div className="flex justify-between">
                    <span>FPS (avg):</span>
                    <span className={getFPSColor(metrics.avgFps)}>{metrics.avgFps}</span>
                </div>

                {/* Frame Time */}
                <div className="flex justify-between">
                    <span>Frame:</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.frameTime))}>
                        {metrics.frameTime}ms
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Worst (5s):</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.worstFrameTime))}>
                        {metrics.worstFrameTime}ms
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
                    <span>Plots:</span>
                    <span className="text-gray-300">{metrics.plotCount}</span>
                </div>

                <div className="flex justify-between">
                    <span>Notifs:</span>
                    <span className="text-gray-300">{metrics.notificationCount}</span>
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

                <div className="flex justify-between">
                    <span>Timers:</span>
                    <span className={metrics.activeTimers > 50 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.activeTimers}
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

            {metrics.profiles.length > 0 && (
                <>
                    <div className="border-t border-gray-700 my-2" />
                    <div className="text-gray-400 text-[10px] mb-1">Top 3 hot sections (avg/ms)</div>
                    <div className="space-y-1">
                        {metrics.profiles.map(profile => (
                            <div key={profile.name} className="flex justify-between">
                                <span className="truncate max-w-[120px]" title={profile.name}>
                                    {profile.name}
                                </span>
                                <span className="text-gray-300">
                                    {profile.avg.toFixed(2)} / {profile.max.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="text-gray-500 text-[10px] mt-2 border-t border-gray-700 pt-2">
                Press ` to toggle
            </div>
        </div>
    );
});

PerformanceOverlay.displayName = 'PerformanceOverlay';

export default PerformanceOverlay;
