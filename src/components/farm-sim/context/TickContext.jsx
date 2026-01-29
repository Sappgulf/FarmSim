import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getPerfMetrics, isDebugEnabled } from '../services/DebugService';
import { addTrackedEventListener } from '../services/EventListenerService';

/**
 * TickContext - Provides a centralized 1-second tick for UI updates
 * Consolidates multiple setInterval calls into a single timer
 * PERF: Reduces CPU overhead from N intervals to 1 interval
 */
const TickContext = createContext(0);

/**
 * TickProvider - Wraps components that need periodic updates
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} [props.interval=1000] - Tick interval in ms (default 1 second)
 */
export function TickProvider({ children, interval = 1000 }) {
    const [tick, setTick] = useState(0);
    const visibilityRef = useRef(typeof document === 'undefined' ? true : !document.hidden);
    const debugEnabled = isDebugEnabled();

    useEffect(() => {
        let id = null;

        const startTick = () => {
            if (id) return;
            id = setInterval(() => {
                const start = performance.now();
                setTick(t => t + 1);
                if (debugEnabled) {
                    const metrics = getPerfMetrics();
                    if (metrics) {
                        metrics.lastTickTime = performance.now() - start;
                    }
                }
            }, interval);
        };

        const stopTick = () => {
            if (!id) return;
            clearInterval(id);
            id = null;
        };

        const handleVisibilityChange = () => {
            if (typeof document === 'undefined') return;
            visibilityRef.current = !document.hidden;
            if (!visibilityRef.current) {
                stopTick();
            } else {
                startTick();
            }
        };

        startTick();
        const cleanupVisibility = typeof document === 'undefined'
            ? () => {}
            : addTrackedEventListener(document, 'visibilitychange', handleVisibilityChange);

        return () => {
            stopTick();
            cleanupVisibility();
        };
    }, [debugEnabled, interval]);

    return (
        <TickContext.Provider value={tick}>
            {children}
        </TickContext.Provider>
    );
}

/**
 * useTick - Hook to subscribe to the centralized tick
 * @returns {number} Current tick count (increments every interval)
 */
export function useTick() {
    return useContext(TickContext);
}

export default TickContext;
