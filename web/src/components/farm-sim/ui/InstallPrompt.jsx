import React, { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../../ui/button';

const DISMISS_KEY = 'farmSim_installPromptDismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || 'ontouchstart' in window;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true
  );
}

function wasDismissedRecently() {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return Number.isFinite(ts) && Date.now() - ts < DISMISS_DURATION_MS;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.__pwaInstallPrompt;
    if (stored) {
      setDeferredPrompt((prev) => prev || stored);
      if (!isStandalone() && !wasDismissedRecently() && isMobile()) {
        setVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsMobileDevice(isMobile());
    const onResize = () => setIsMobileDevice(isMobile());
    window.addEventListener('resize', onResize);

    if (isStandalone() || wasDismissedRecently()) {
      return () => window.removeEventListener('resize', onResize);
    }

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!wasDismissedRecently() && isMobile()) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaInstallPrompt : null);
    if (!promptEvent) return;
    try {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setVisible(false);
    } catch {
      /* prompt unavailable or dismissed abruptly */
    }
    setDeferredPrompt(null);
    if (typeof window !== 'undefined') {
      window.__pwaInstallPrompt = undefined;
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore storage errors
    }
  }, []);

  if (!visible || !isMobileDevice) return null;

  const canPrompt = Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__pwaInstallPrompt));

  return (
    <div className="relative z-[45] w-full animate-fade-in">
      <div className="mx-2 mb-2 rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-500 to-teal-500 p-3 shadow-xl dark:border-emerald-800/60 dark:from-emerald-700 dark:to-teal-700">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
            <span className="text-lg" aria-hidden="true">🌾</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">Install FarmSim</div>
            <div className="text-xs text-emerald-50/90 leading-snug">
              Home-screen icon and offline shell; reload after updates for the newest features.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleInstall}
              variant="default"
              size="sm"
              disabled={!canPrompt}
              className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-sm disabled:opacity-60"
            >
              <Download className="w-4 h-4 mr-1" />
              Install
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors touch-manipulation"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
