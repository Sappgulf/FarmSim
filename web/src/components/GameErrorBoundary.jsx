import React from 'react';
import { clearFarmCache } from './farm-sim/context/GamePersistence';
import { Button } from './ui/button';

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
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
    console.error('[farm]', 'Game Error', error, errorInfo);
  }

  handleRestart = () => {
    // Clear error state
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });

    // Optionally clear save data if corrupted
    if (window.confirm('Would you like to reset your save data? This might fix the error but will delete your progress.')) {
      clearFarmCache({ preserveKeys: [] });
      window.location.reload();
    }
  };

  handleReportIssue = () => {
    const errorText = this.state.error ? this.state.error.toString() : 'Unknown error';
    const stackText = this.state.errorInfo ? this.state.errorInfo.componentStack : 'No stack trace';
    const body = encodeURIComponent(
      `Error:\n${errorText}\n\nStack Trace:\n${stackText}\n\nBrowser: ${navigator.userAgent}`
    );
    window.location.href = `mailto:support@example.com?subject=${encodeURIComponent('FarmSim Bug Report')}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 text-slate-100">
          <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <span className="wilted-crop">🌾</span>
                <span className="absolute -bottom-1 -right-2 text-2xl">😢</span>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-100">Something went wrong on the farm...</h1>
              <p className="mt-2 text-sm text-slate-400">
                Don't worry, your progress is saved locally. Try reloading the game.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                size="lg"
                className="w-full"
                juicy
              >
                🔄 Reload Game
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleReportIssue}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  📧 Report Issue
                </Button>
                <Button
                  onClick={this.handleRestart}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  🗑️ Reset Save
                </Button>
              </div>

              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
              >
                {this.state.showDetails ? 'Hide technical details' : 'Show technical details'}
              </button>
            </div>

            {this.state.showDetails && (
              <div className="mt-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50 text-left">
                <div className="text-xs font-mono text-red-400 mb-1">Error:</div>
                <div className="text-xs font-mono text-slate-300 mb-3 whitespace-pre-wrap break-words">
                  {this.state.error && this.state.error.toString()}
                </div>
                <div className="text-xs font-mono text-red-400 mb-1">Stack Trace:</div>
                <div className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-words overflow-auto max-h-40">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-slate-600">
              FarmSim v5.5.4 — If this keeps happening, try clearing your browser cache.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;
