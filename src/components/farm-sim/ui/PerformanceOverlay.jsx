import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { clearDebugError, getDebugMetrics, isDebugMode } from '../../../utils/debugTools';

/**
 * Performance Overlay Component
 * Dev-only overlay showing comprehensive performance metrics
 * Toggle with backtick (`) key
 */
const PerformanceOverlay = memo(() => {
    const { state } = useGame();
    const debugEnabled = isDebugMode();
    const [isVisible, setIsVisible] = useState(debugEnabled);
    const [metrics, setMetrics] = useState({
        avgFps: 0,
        avgFrameTime: 0,
        worstFrameTime: 0,
        updateTime: 0,
        renderTime: 0,
        memory: 0,
        plots: 0,
        buildings: 0,
        decorations: 0,
        notifications: 0,
        particleCount: 0,
        timers: 0,
        listeners: 0,
    });
    const [debugInfo, setDebugInfo] = useState(getDebugMetrics());
    const [copyStatus, setCopyStatus] = useState(null);

    const frameTimesRef = useRef([]);
    const lastFrameTimeRef = useRef(performance.now());

    const lastActions = useMemo(() => {
        const trace = debugInfo?.lastError?.trace || debugInfo?.actionTrace || [];
        return trace.slice(-100);
    }, [debugInfo]);

    const buildDebugReport = () => {
        const now = new Date().toISOString();
        const error = debugInfo?.lastError;
        const report = {
            timestamp: now,
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            metrics: {
                fpsAvg: Math.round(metrics.avgFps || 0),
                frameAvgMs: metrics.avgFrameTime,
                frameWorstMs: metrics.worstFrameTime,
                updateMs: metrics.updateTime,
                renderMs: metrics.renderTime,
                memoryMb: metrics.memory,
            },
            counts: {
                plots: metrics.plots,
                buildings: metrics.buildings,
                decorations: metrics.decorations,
                notifications: metrics.notifications,
                timers: metrics.timers,
                listeners: metrics.listeners,
                particles: metrics.particleCount,
            },
            state: {
                coins: state.coins,
                level: state.level,
                gridSize: state.gridSize,
                weather: state.weather,
                season: state.season?.current,
                paused: state.gameLoop?.paused,
            },
            error: error ? {
                source: error.source,
                message: error.message,
                stack: error.stack,
                time: error.time,
            } : null,
            recentActions: lastActions,
        };
        return JSON.stringify(report, null, 2);
    };

    const handleCopyReport = async () => {
        try {
            const report = buildDebugReport();
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(report);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = report;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
            }
            setCopyStatus('copied');
        } catch (error) {
            setCopyStatus('failed');
        } finally {
            setTimeout(() => setCopyStatus(null), 2000);
        }
    };

    // Toggle visibility with backtick key
    useEffect(() => {
        if (!debugEnabled) return;
        const handleKeyPress = (e) => {
            if (e.key === '`' || e.key === '~') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [debugEnabled]);

    useEffect(() => {
        if (!debugEnabled) return;
        setIsVisible(true);
    }, [debugEnabled]);

    useEffect(() => {
        if (!debugEnabled) return;
        let rafId = null;

        const trackFrame = (now) => {
            const delta = now - lastFrameTimeRef.current;
            lastFrameTimeRef.current = now;
            frameTimesRef.current.push({ time: now, delta });
            const cutoff = now - 5000;
            frameTimesRef.current = frameTimesRef.current.filter(sample => sample.time >= cutoff);
            rafId = requestAnimationFrame(trackFrame);
        };

        rafId = requestAnimationFrame(trackFrame);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [debugEnabled]);

    // Collect metrics at lower frequency (2Hz instead of 60Hz)
    useEffect(() => {
        if (!debugEnabled) return;

        const collectMetrics = () => {
            const samples = frameTimesRef.current;
            const frameSum = samples.reduce((sum, sample) => sum + sample.delta, 0);
            const avgFrameTime = samples.length ? frameSum / samples.length : 0;
            const worstFrameTime = samples.reduce((max, sample) => Math.max(max, sample.delta), 0);
            const avgFps = avgFrameTime > 0 ? (1000 / avgFrameTime) : 0;

            // Memory (Chrome only)
            const memory = performance.memory
                ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))
                : 0;

            const plots = state.plots?.length || 0;
            const buildings = Object.keys(state.buildings || {}).length;
            const decorations = Array.isArray(state.decorations)
                ? state.decorations.length
                : Object.keys(state.decorations || {}).length;
            const notifications = state.notifications?.length || 0;

            // Particle count (from global)
            const particleCount = window.__particleCount || 0;

            const updateTime = window.__lastUpdateTime || 0;
            const renderTime = Math.max(0, avgFrameTime - updateTime);
            const debugMetrics = getDebugMetrics();

            const snapshot = {
                avgFps,
                avgFrameTime,
                worstFrameTime,
                updateTime,
                renderTime,
                memory,
                plots,
                buildings,
                decorations,
                notifications,
                particleCount,
                timers: debugMetrics?.timerCount || 0,
                listeners: debugMetrics?.listenerCount || 0,
                timestamp: Date.now(),
            };

            if (typeof window !== 'undefined') {
                window.__farmPerfMetrics = snapshot;
            }

            if (isVisible) {
                setDebugInfo(debugMetrics);
                setMetrics({
                    avgFps,
                    avgFrameTime: avgFrameTime.toFixed(1),
                    worstFrameTime: worstFrameTime.toFixed(1),
                    updateTime: updateTime.toFixed(1),
                    renderTime: renderTime.toFixed(1),
                    memory,
                    plots,
                    buildings,
                    decorations,
                    notifications,
                    particleCount,
                    timers: debugMetrics?.timerCount || 0,
                    listeners: debugMetrics?.listenerCount || 0,
                });
            }
        };

        // Update at 2Hz instead of 60Hz
        const intervalId = setInterval(collectMetrics, 500);
        collectMetrics(); // Initial call

        return () => clearInterval(intervalId);
    }, [debugEnabled, isVisible, state.plots?.length, state.notifications?.length, state.buildings]);

    if (!debugEnabled) {
        return null;
    }

    if (!isVisible) {
        return (
            <div className="fixed bottom-2 right-2 text-xs text-gray-400 pointer-events-none z-50">
                Debug overlay hidden (` to toggle)
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
        <>
            {debugInfo?.lastError && (
                <div className="fixed inset-4 sm:inset-8 z-[10000] overflow-auto rounded-2xl border border-red-500/70 bg-black/90 p-4 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-red-300">⚠️ Debug Crash Capture</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCopyReport}
                                className="text-xs text-gray-200 hover:text-white border border-gray-600/60 rounded-md px-2 py-1"
                            >
                                {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy failed' : 'Copy Debug Report'}
                            </button>
                            <button
                                onClick={clearDebugError}
                                className="text-xs text-gray-300 hover:text-white"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div><span className="text-gray-400">Source:</span> {debugInfo.lastError.source}</div>
                        <div><span className="text-gray-400">Time:</span> {debugInfo.lastError.time}</div>
                        <div className="rounded-lg bg-black/60 p-3 text-[11px] whitespace-pre-wrap">
                            {debugInfo.lastError.message}
                            {debugInfo.lastError.stack ? `\n\n${debugInfo.lastError.stack}` : ''}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-xs text-gray-400 mb-2">Recent Actions (last 100)</div>
                        <div className="space-y-1 text-[11px] max-h-48 overflow-auto pr-2">
                            {lastActions.map((entry) => (
                                <div key={entry.id} className="text-gray-200">
                                    {entry.time} • {entry.type}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed top-2 left-2 bg-black/90 backdrop-blur-sm text-white font-mono text-xs p-3 rounded-lg z-[9999] min-w-[240px] shadow-xl border border-gray-700">
            <div className="text-gray-400 mb-2 flex justify-between items-center">
                <span>⚙️ DEBUG PERF</span>
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
                    <span>FPS (avg):</span>
                    <span className={getFPSColor(metrics.avgFps)}>{Math.round(metrics.avgFps)}</span>
                </div>

                {/* Frame Time */}
                <div className="flex justify-between">
                    <span>Frame (avg):</span>
                    <span className={getFrameTimeColor(parseFloat(metrics.avgFrameTime))}>
                        {metrics.avgFrameTime}ms
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Frame (worst):</span>
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
                    <span>Plots:</span>
                    <span className={metrics.plots > 100 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.plots}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Buildings:</span>
                    <span className="text-gray-300">
                        {metrics.buildings}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Decor:</span>
                    <span className="text-gray-300">
                        {metrics.decorations}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Notifs:</span>
                    <span className="text-gray-300">
                        {metrics.notifications}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Timers:</span>
                    <span className="text-gray-300">
                        {metrics.timers}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Listeners:</span>
                    <span className="text-gray-300">
                        {metrics.listeners}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Particles:</span>
                    <span className={metrics.particleCount > 50 ? 'text-yellow-400' : 'text-gray-300'}>
                        {metrics.particleCount}
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

            <div className="mt-2 border-t border-gray-700 pt-2">
                <div className="text-gray-400 text-[10px] mb-1">Recent actions</div>
                <div className="space-y-1 text-[10px] text-gray-300 max-h-20 overflow-auto">
                    {debugInfo?.actionTrace?.slice(-6).map((entry) => (
                        <div key={entry.id}>
                            {entry.time.split('T')[1]?.replace('Z', '')} • {entry.type}
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-gray-500 text-[10px] mt-2 border-t border-gray-700 pt-2">
                Press ` to toggle. Debug actions: {debugInfo?.actionTrace?.length || 0}
            </div>
        </div>
        </>
    );
});

PerformanceOverlay.displayName = 'PerformanceOverlay';

export default PerformanceOverlay;
