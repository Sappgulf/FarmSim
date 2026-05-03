import React from 'react';
import { useGameSelector } from '../../context/GameContext';
import TabErrorBoundary from './TabErrorBoundary';

/**
 * Wrapper for lazy-loaded tabs: error boundary + optional panel entrance motion.
 * Honors in-game Reduced Motion (OS preference is handled in CSS for animate-tab-panel-in).
 *
 * @param {{ children: React.ReactNode, panelKey?: string }} props
 */
function TabWrapper({ children, panelKey = 'panel' }) {
  const reducedMotion = useGameSelector((state) => state.settings?.reducedMotion === true);

  return (
    <TabErrorBoundary>
      <div
        key={panelKey}
        className={reducedMotion ? '' : 'animate-tab-panel-in'}
      >
        {children}
      </div>
    </TabErrorBoundary>
  );
}

export default TabWrapper;
