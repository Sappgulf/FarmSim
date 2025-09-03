import React from "react";
import ReactDOM from "react-dom/client";
import FarmSimCanvas from "./components/FarmSimCanvas";
// import FarmSimCanvas from "./components/FarmSimCanvasSimple";
import "./index.css";

// Register a basic service worker for PWA/offline support (no precache list here)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Use relative path so file:// or static hosting also works
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Farm Game Error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Backup save data before clearing
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saveData = localStorage.getItem('farm_sim_enhanced_v2');
        if (saveData) {
          localStorage.setItem('farm_sim_backup_' + Date.now(), saveData);
        }
      }
    } catch (e) {
      console.error('Failed to backup save:', e);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚜</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! The farm needs attention!</h1>
              <p className="text-gray-600">The game encountered an error, but don't worry - your farm is safe!</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                🔄 Reload Game
              </button>
              
              <button 
                onClick={() => { 
                  try {
                    localStorage.removeItem('farm_sim_enhanced_v2'); 
                    localStorage.clear(); // Clear all localStorage to ensure clean state
                  } catch (e) {
                    console.error('Failed to clear storage:', e);
                  }
                  window.location.reload(); 
                }}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                🌱 Start Fresh Farm (Clear All Data)
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                Your save has been automatically backed up. If problems persist, try a different browser.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 bg-gray-100 p-3 rounded-lg">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                  Developer Info
                </summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap overflow-auto max-h-40">
                  {String(this.state.error)}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FarmSimCanvas />
    </ErrorBoundary>
  </React.StrictMode>
);
