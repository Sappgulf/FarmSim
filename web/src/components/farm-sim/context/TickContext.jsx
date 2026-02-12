import React, { createContext, useContext, useEffect, useState } from 'react';

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

    useEffect(() => {
        const id = setInterval(() => {
            setTick(t => t + 1);
        }, interval);

        return () => clearInterval(id);
    }, [interval]);

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
