import React, { memo, useState, useEffect } from 'react';

const PHRASES = [
  'Watering the crops...',
  'Feeding the chickens...',
  'Polishing the tractor...',
  'Baking fresh apple pie...',
  'Chasing off the crows...',
  'Harvesting golden wheat...',
  'Tending to the greenhouse...',
  'Gathering fresh eggs...',
  'Planting morning seeds...',
  'Welcoming the sunrise...',
  'Checking the weather vane...',
  'Repairing the fence...',
  'Milking the cows...',
  'Picking ripe berries...',
];

const LoadingScreen = memo(function LoadingScreen({
  progress = 0,
  message,
  showLogo = true,
  inline = false,
  className = '',
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [message]);

  const currentPhrase = message || PHRASES[phraseIndex];
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`${inline ? 'absolute inset-0' : 'fixed inset-0 z-[9999]'} flex flex-col items-center justify-center
                  bg-slate-950/90 backdrop-blur-md ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        {showLogo && (
          <div className="relative">
            <img
              src="/icons/cozy-farms-logo.svg"
              alt=""
              className="h-20 w-auto animate-pulse-slow"
              aria-hidden="true"
            />
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/60 blur-[2px]" />
            </div>
          </div>
        )}

        <div className="w-64 sm:w-80">
          {/* Progress track */}
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
            {/* Progress fill with shimmer */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-shimmer relative"
              style={{
                width: `${clampedProgress}%`,
                transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Progress text */}
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>{currentPhrase}</span>
            <span className="tabular-nums">{Math.round(clampedProgress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LoadingScreen;
