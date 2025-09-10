import React from 'react';

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('FarmLife Game Error:', error, errorInfo);
  }

  handleRestart = () => {
    // Clear error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Optionally clear save data if corrupted
    if (window.confirm('Would you like to reset your save data? This might fix the error but will delete your progress.')) {
      localStorage.removeItem('farmLifeSave');
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Game Error</h1>
              <p className="text-gray-600">
                Something went wrong with FarmLife. Don't worry, your progress might still be saved!
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🔄 Restart Game
              </button>
              
              <button
                onClick={this.handleRestart}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Reset Save Data
              </button>
              
              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {this.state.showDetails ? '📄 Hide' : '📄 Show'} Error Details
              </button>
            </div>
            
            {this.state.showDetails && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
                <div className="text-red-600 font-semibold mb-2">Error:</div>
                <div className="mb-2">{this.state.error && this.state.error.toString()}</div>
                <div className="text-red-600 font-semibold mb-2">Stack Trace:</div>
                <div className="whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </div>
              </div>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-500">
              FarmLife v2.3.0 - If this persists, try refreshing your browser
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;
