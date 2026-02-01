import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getXPTrackingState, getXPConfig } from '../services/XPService';
import { isDebugEnabled, getPerfMetrics } from '../services/DebugService';
import { addTrackedEventListener } from '../services/EventListenerService';
import { getDebugStoreSnapshot, formatDebugReport } from '../services/DebugTraceService';

/**
 * Developer Debug Overlay - Shows game state and XP tracking info
 * Only visible in development mode, toggled with backtick (`) key
 */
const DevDebugOverlay = memo(() => {
    const { state } = useGame();
    const [isVisible, setIsVisible] = useState(false);
    const [xpState, setXpState] = useState(null);
    const [perfState, setPerfState] = useState(null);
    const debugEnabled = isDebugEnabled();

    // Toggle overlay with backtick key
    useEffect(() => {
        if (!debugEnabled) return () => { };
        const handleKeyDown = (e) => {
            if (e.key === '`') {
                setIsVisible((prev) => !prev);
            }
        };

        return addTrackedEventListener(window, 'keydown', handleKeyDown);
    }, [debugEnabled]);

    // Update stats every second
    useEffect(() => {
        if (!isVisible) return;

        const updateStats = () => {
            setXpState(getXPTrackingState());

            const metrics = getPerfMetrics();
            if (metrics) {
                // Calculate worst frame in last 5s
                const now = Date.now();
                const recentFrames = metrics.frameTimes?.filter(f => f.t > now - 5000) || [];
                const worstFrame = recentFrames.reduce((max, f) => Math.max(max, f.dt), 0);

                setPerfState({
                    listenerCount: metrics.listenerCount || 0,
                    activeTimers: metrics.activeTimers || 0,
                    lastRenderTime: metrics.lastRenderTime || 0,
                    lastTickTime: metrics.lastTickTime || 0,
                    worstFrame
                });
            }
        };

        const interval = setInterval(updateStats, 1000);
        updateStats(); // Initial update

        return () => clearInterval(interval);
    }, [isVisible]);

    const handleCopyReport = async () => {
        try {
            const store = getDebugStoreSnapshot();
            const report = formatDebugReport(store);
            await navigator.clipboard.writeText(report);
            alert('Debug report copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy report:', err);
        }
    };

    // Don't render in production
    if (!debugEnabled) {
        return null;
    }

    if (!isVisible) {
        return (
            <div className="fixed bottom-2 left-2 text-xs text-gray-400 opacity-50 z-50 select-none pointer-events-none">
                Press ` for debug
            </div>
        );
    }

    const xpConfig = getXPConfig();
    const xpForCurrentLevel = state.level > 1 ? 50 * Math.pow(state.level - 1, 2) : 0;
    const xpForNextLevel = 50 * Math.pow(state.level, 2);
    const xpNeeded = xpForNextLevel - state.xp;
    const xpProgress = ((state.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    return (
        <div className="fixed bottom-2 left-2 z-50 bg-black bg-opacity-90 text-white text-xs font-mono p-3 rounded-lg shadow-2xl max-w-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                <span className="font-bold text-yellow-400">🔧 Debug Overlay</span>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopyReport}
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-white"
                        title="Copy State Report"
                    >
                        📋
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-white px-1"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Performance Metrics */}
            {perfState && (
                <div className="mb-2">
                    <div className="text-pink-400 font-semibold">⚡ Performance</div>
                    <div className="ml-2 space-y-0.5 grid grid-cols-2 gap-x-2">
                        <div>FPS: <span className={state.gameLoop?.fps < 30 ? 'text-red-400' : 'text-green-400'}>{state.gameLoop?.fps || '-'}</span></div>
                        <div>Worst: <span className={perfState.worstFrame > 50 ? 'text-red-400' : 'text-green-400'}>{perfState.worstFrame.toFixed(1)}ms</span></div>
                        <div>Render: <span className="text-yellow-300">{perfState.lastRenderTime.toFixed(1)}ms</span></div>
                        <div>Tick: <span className="text-yellow-300">{perfState.lastTickTime.toFixed(1)}ms</span></div>
                        <div>Listeners: <span className="text-blue-300">{perfState.listenerCount}</span></div>
                        <div>Timers: <span className="text-blue-300">{perfState.activeTimers}</span></div>
                        <div className="col-span-2">Notifs: <span className="text-yellow-300">{state.notifications?.length || 0}</span></div>
                    </div>
                </div>
            )}

            {/* Level & XP */}
            <div className="mb-2">
                <div className="text-green-400 font-semibold">📊 Progression</div>
                <div className="ml-2 space-y-0.5">
                    <div>Level: <span className="text-yellow-300">{state.level}</span></div>
                    <div>XP: <span className="text-yellow-300">{state.xp}</span> / {xpForNextLevel}</div>
                    <div>Progress: <span className="text-yellow-300">{xpProgress.toFixed(1)}%</span></div>
                    <div>Coins: <span className="text-yellow-300">{state.coins}</span>🪙</div>
                </div>
            </div>

            {/* XP Tracking */}
            {xpState && (
                <div className="mb-2">
                    <div className="text-blue-400 font-semibold">⚡ XP Rate</div>
                    <div className="ml-2 space-y-0.5">
                        <div>
                            XP/min: <span className={
                                xpState.xpThisMinute > xpConfig.maxXpPerMinute * 0.8
                                    ? 'text-red-400'
                                    : xpState.xpThisMinute > xpConfig.maxXpPerMinute * 0.5
                                        ? 'text-yellow-400'
                                        : 'text-green-400'
                            }>{xpState.xpThisMinute}</span> / {xpConfig.maxXpPerMinute}
                        </div>
                        <div>LvlUp/min: <span className="text-yellow-300">{xpState.levelUpsThisMinute}</span></div>
                        <div>Idle: {xpState.isIdle ? <span className="text-red-400">Yes</span> : <span className="text-green-400">No</span>} ({Math.floor(xpState.timeSinceInteraction / 1000)}s)</div>
                    </div>
                </div>
            )}

            {/* Game State */}
            <div className="mb-2">
                <div className="text-orange-400 font-semibold">🎮 Game State</div>
                <div className="ml-2 space-y-0.5">
                    <div>Weather: <span className="text-yellow-300">{state.weather}</span></div>
                    <div>Season: <span className="text-yellow-300">{state.season?.current}</span></div>
                    <div>Paused: {state.gameLoop?.paused ? <span className="text-red-400">Yes</span> : <span className="text-green-400">No</span>}</div>
                </div>
            </div>

            {/* Farm Stats */}
            <div>
                <div className="text-cyan-400 font-semibold">🌾 Farm Stats</div>
                <div className="ml-2 space-y-0.5">
                    <div>Grid: <span className="text-yellow-300">{state.gridSize}×{state.gridSize}</span></div>
                    <div>Active Plots: <span className="text-yellow-300">{state.plots?.filter(p => p.state !== 'empty').length || 0}</span></div>
                    <div>Buildings: <span className="text-yellow-300">{Object.keys(state.buildings || {}).filter(k => state.buildings[k]?.built).length}</span></div>
                </div>
            </div>

            <div className="mt-2 pt-1 border-t border-gray-700 text-gray-500 text-center">
                Press ` to close
            </div>
        </div>
    );
});

DevDebugOverlay.displayName = 'DevDebugOverlay';
export default DevDebugOverlay;
