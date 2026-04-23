import React from "react";
import ReactDOM from "react-dom/client";
import FarmSim from "./components/farm-sim/core/FarmSim";
import GameErrorBoundary from "./components/GameErrorBoundary";
import "./index.css";

// Apply dark mode before first paint to avoid flash
(function applyDarkMode() {
  try {
    const darkMode = window.localStorage.getItem('farmSim_darkMode');
    if (darkMode === 'true') {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // Ignore storage failures in restrictive browsers or private mode.
  }
})();

// Global error capture buffer for QA and postmortems
window.__farmErrorBuffer = window.__farmErrorBuffer || [];
const pushGlobalError = (entry) => {
  const buffer = window.__farmErrorBuffer || [];
  buffer.push({ at: Date.now(), ...entry });
  window.__farmErrorBuffer = buffer.slice(-100);
};

window.addEventListener('error', (event) => {
  pushGlobalError({
    type: 'error',
    message: event?.message || 'Unknown error',
    source: event?.filename || 'unknown',
    line: event?.lineno || null,
    column: event?.colno || null,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason;
  pushGlobalError({
    type: 'unhandledrejection',
    message: reason?.message || String(reason || 'Unknown rejection'),
  });
});

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
