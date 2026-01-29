import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getXPTrackingState, getXPConfig } from '../services/XPService';
import { isDebugEnabled } from '../services/DebugService';
import { addTrackedEventListener } from '../services/EventListenerService';

/**
 * Developer Debug Overlay - Shows game state and XP tracking info
 * Only visible in development mode, toggled with backtick (`) key
 */
const DevDebugOverlay = memo(() => {
    const { state } = useGame();
    const [isVisible, setIsVisible] = useState(false);
    const [xpState, setXpState] = useState(null);
    const debugEnabled = isDebugEnabled();

    // Toggle overlay with backtick key
    useEffect(() => {
        if (!debugEnabled) return () => {};
        const handleKeyDown = (e) => {
            if (e.key === '`') {
                setIsVisible((prev) => !prev);
            }
        };

        return addTrackedEventListener(window, 'keydown', handleKeyDown);
    }, [debugEnabled]);

    // Update XP state every second
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setXpState(getXPTrackingState());
        }, 1000);

        // Initial update
        setXpState(getXPTrackingState());

        return () => clearInterval(interval);
    }, [isVisible]);

    // Don't render in production
    if (!debugEnabled) {
        return null;
    }

    if (!isVisible) {
        return (
            <div className="fixed bottom-2 left-2 text-xs text-gray-400 opacity-50 z-50">
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
        <div className="fixed bottom-2 left-2 z-50 bg-black bg-opacity-90 text-white text-xs font-mono p-3 rounded-lg shadow-2xl max-w-xs">
            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                <span className="font-bold text-yellow-400">🔧 Debug Overlay</span>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            {/* Level & XP */}
            <div className="mb-2">
                <div className="text-green-400 font-semibold">📊 Progression</div>
                <div className="ml-2 space-y-0.5">
                    <div>Level: <span className="text-yellow-300">{state.level}</span></div>
                    <div>XP: <span className="text-yellow-300">{state.xp}</span> / {xpForNextLevel}</div>
                    <div>To Next: <span className="text-yellow-300">{xpNeeded}</span> XP ({xpProgress.toFixed(1)}%)</div>
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
                        <div>Level-ups/min: <span className="text-yellow-300">{xpState.levelUpsThisMinute}</span> / {xpConfig.maxLevelUpsPerMinute}</div>
                        <div>Idle: {xpState.isIdle ? <span className="text-red-400">Yes</span> : <span className="text-green-400">No</span>} ({Math.floor(xpState.timeSinceInteraction / 1000)}s)</div>
                    </div>
                </div>
            )}

            {/* Recent XP Grants */}
            {xpState?.recentGrants && xpState.recentGrants.length > 0 && (
                <div className="mb-2">
                    <div className="text-purple-400 font-semibold">📝 Recent XP</div>
                    <div className="ml-2 max-h-20 overflow-y-auto">
                        {xpState.recentGrants.map((grant, i) => (
                            <div key={i} className="text-gray-300 truncate">
                                +{grant.amount} <span className="text-gray-500">({grant.source})</span>
                            </div>
                        ))}
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
                    <div>FPS: <span className="text-yellow-300">{state.gameLoop?.fps || '-'}</span></div>
                </div>
            </div>

            {/* Farm Stats */}
            <div>
                <div className="text-cyan-400 font-semibold">🌾 Farm Stats</div>
                <div className="ml-2 space-y-0.5">
                    <div>Grid: <span className="text-yellow-300">{state.gridSize}×{state.gridSize}</span></div>
                    <div>Plots Active: <span className="text-yellow-300">{state.plots?.filter(p => p.state !== 'empty').length || 0}</span></div>
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
