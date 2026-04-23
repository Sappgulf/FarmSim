import React, { useState, useEffect } from 'react';
import { CloudOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setOnline(false);
      setShowBackOnline(false);
    };

    const handleOnline = () => {
      setOnline(true);
      setShowBackOnline(true);
    };

    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!showBackOnline) return;
    const timer = setTimeout(() => setShowBackOnline(false), 2500);
    return () => clearTimeout(timer);
  }, [showBackOnline]);

  if (!online) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] safe-area-pt animate-slide-down">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center justify-center gap-2">
          <CloudOff className="w-4 h-4" aria-hidden="true" />
          <span>You're offline — progress will be saved locally</span>
        </div>
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] safe-area-pt animate-slide-down">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" aria-hidden="true" />
          <span>Back online!</span>
        </div>
      </div>
    );
  }

  return null;
}
