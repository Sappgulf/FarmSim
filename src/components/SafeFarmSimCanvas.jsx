import React, { Component } from 'react';
import FarmSimCanvas from './FarmSimCanvas';

class SafeFarmSimCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    console.error('[SafeFarmSimCanvas] Error caught:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SafeFarmSimCanvas] Error details:', error, errorInfo);
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({ hasError: false, errorCount: 0 });
  };

  render() {
    if (this.state.hasError) {
      // If error persists after 3 attempts, show permanent error
      if (this.state.errorCount > 3) {
        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Critical Error in Farm Game
              </h2>
              <p className="text-gray-700 mb-4">
                The game is experiencing a critical error. Please try:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-600">
                <li>Clearing your browser cache</li>
                <li>Using a different browser</li>
                <li>Disabling browser extensions</li>
              </ul>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Clear All Data & Reload
              </button>
            </div>
          </div>
        );
      }

      // Auto-retry after a short delay
      setTimeout(() => {
        this.handleReset();
      }, 1000);

      return (
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Loading Farm...</h2>
            <p className="text-gray-600">Attempting to recover (Attempt {this.state.errorCount}/3)</p>
          </div>
        </div>
      );
    }

    return <FarmSimCanvas />;
  }
}

export default SafeFarmSimCanvas;