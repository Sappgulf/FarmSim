import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import FarmSim from "./components/farm-sim/core/FarmSim";
import StartScreen from "./components/farm-sim/ui/StartScreen";
import GameErrorBoundary from "./components/GameErrorBoundary";
import { initializeDebugGlobals } from "./components/farm-sim/services/DebugService";
import "./index.css";

initializeDebugGlobals();

// Register service worker for PWA/offline support (production only)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => { });
  });
}

// App wrapper to manage start screen vs game
function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);

  // Check for existing save data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('farm-sim-save');
      setHasSaveData(!!saved);
    } catch {
      setHasSaveData(false);
    }
  }, []);

  const handleStartGame = (isNewGame) => {
    if (isNewGame) {
      // Clear save data for new game
      try {
        localStorage.removeItem('farm-sim-save');
      } catch {
        // Ignore storage errors
      }
    }
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} hasSaveData={hasSaveData} />;
  }

  return <FarmSim />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <GameErrorBoundary>
    <App />
  </GameErrorBoundary>
);
