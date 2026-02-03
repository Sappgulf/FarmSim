import React, { Suspense, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import GameErrorBoundary from "./components/GameErrorBoundary";
import { GameLauncher } from "./components/GameLauncher";
import "./index.css";

const FarmSim = React.lazy(() => import("./components/farm-sim/core/FarmSim"));
const FarmGame = React.lazy(() => import("./components/FarmGame"));

// Register service worker for PWA/offline support (production only)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // In dev, unregister service workers to avoid caching issues
    if (import.meta.env.DEV) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          .catch(() => {});
      }
      return;
    }

    // Production: register service worker
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const forcedMode = params.get("mode");
  const [mode, setMode] = useState(() => {
    if (forcedMode && forcedMode !== "select") return forcedMode;
    return localStorage.getItem("farmSim_mode");
  });

  useEffect(() => {
    if (forcedMode && forcedMode !== "select") {
      setMode(forcedMode);
      localStorage.setItem("farmSim_mode", forcedMode);
    }
  }, [forcedMode]);

  const handleSelect = (nextMode) => {
    localStorage.setItem("farmSim_mode", nextMode);
    setMode(nextMode);
  };

  if (!mode || forcedMode === "select") {
    return <GameLauncher onSelect={handleSelect} />;
  }

  const fallback = (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
      Loading farm...
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      {mode === "cozy" ? <FarmGame /> : <FarmSim />}
    </Suspense>
  );
}

// Load the full game with error boundary
ReactDOM.createRoot(document.getElementById("root")).render(
  <GameErrorBoundary>
    <App />
  </GameErrorBoundary>
);
