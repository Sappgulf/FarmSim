import React from 'react';
import TabErrorBoundary from './TabErrorBoundary';

/**
 * Wrapper component for lazy-loaded tabs
 * Error boundary is inside this wrapper to preserve context chain
 */
function TabWrapper({ children }) {
  return (
    <TabErrorBoundary>
      {children}
    </TabErrorBoundary>
  );
}

export default TabWrapper;

