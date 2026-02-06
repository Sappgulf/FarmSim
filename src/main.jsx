import React from "react";
import ReactDOM from "react-dom/client";
import FarmSim from "./components/farm-sim/core/FarmSim";
import GameErrorBoundary from "./components/GameErrorBoundary";
import "./index.css";

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
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// PWA install prompt - store the event so the app can trigger install later
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
});

// Load the full game with error boundary
ReactDOM.createRoot(document.getElementById("root")).render(
  <GameErrorBoundary>
    <FarmSim />
  </GameErrorBoundary>
);
