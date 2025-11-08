import React from 'react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';

/**
 * Error boundary for tab components
 * Preserves React context chain - error boundaries don't break context propagation
 */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Return new state to trigger error UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('[farm]', 'Tab Error', error, errorInfo);
    // Store error info for display
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Reset error state to allow retry
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 bg-red-50 border-red-200">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-800 mb-2">Tab Error</h3>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <details className="text-left bg-white p-4 rounded mb-4">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
            <Button
              onClick={this.handleReset}
              variant="destructive"
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    // Render children normally - context is preserved through error boundaries
    return this.props.children;
  }
}

export default TabErrorBoundary;

