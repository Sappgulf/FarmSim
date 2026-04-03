import React, { memo, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Leaf, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';

export const START_SCREEN_STORAGE_KEY = 'farmSim_start_screen_seen_v1';

function StartScreenComponent({ onStart }) {
  const [stage, setStage] = useState(0);
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setStage(2);
      return undefined;
    }

    const timers = [
      setTimeout(() => setStage(1), 250),
      setTimeout(() => setStage(2), 750),
    ];

    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden bg-[#071911] text-white"
      data-qa="start-screen"
      data-testid="start-screen"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_28%),radial-gradient(circle_at_20%_80%,_rgba(16,185,129,0.16),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(245,158,11,0.12),_transparent_22%),linear-gradient(180deg,_#0c291c_0%,_#071911_56%,_#04110b_100%)]" />
      <div className="absolute inset-0 opacity-70 pointer-events-none">
        <div className="absolute left-[12%] top-[12%] h-52 w-52 rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="absolute right-[18%] top-[20%] h-48 w-48 rounded-full bg-amber-300/12 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center">
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8 lg:px-10">
          <section
            className={`rounded-[2rem] border border-white/12 bg-white/7 px-6 py-8 text-center shadow-[0_26px_90px_-34px_rgba(15,23,42,0.9)] backdrop-blur-xl transition-[opacity,transform] duration-700 ${
              stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-100/75">
              <Sparkles size={12} />
              FarmSim
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight text-balance sm:text-6xl">
              Build a farm that feels alive.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-emerald-50/80 sm:text-lg">
              Start small, read the season, and grow into something bigger.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={onStart}
                size="xl"
                className="group w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 shadow-[0_18px_38px_-18px_rgba(255,255,255,0.7)]"
                aria-label="Start farming"
              >
                Start farming
                <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export const StartScreen = memo(StartScreenComponent);
