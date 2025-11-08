import React from "react";
import ReactDOM from "react-dom/client";
import FarmSim from "./components/farm-sim/core/FarmSim";
import GameErrorBoundary from "./components/GameErrorBoundary";
import "./index.css";

// Register service worker for PWA/offline support (production only)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// Load the full game directly
// Temporarily disabled StrictMode to test context propagation with lazy loading
ReactDOM.createRoot(document.getElementById("root")).render(
  <GameErrorBoundary>
    <FarmSim />
  </GameErrorBoundary>
);
