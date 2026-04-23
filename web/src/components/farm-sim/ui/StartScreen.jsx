import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Leaf, Sparkles, TrendingUp, Play, RotateCcw } from 'lucide-react';
import { Button } from '../../ui/button';

export const START_SCREEN_STORAGE_KEY = 'farmSim_start_screen_seen_v1';
const GAME_SAVE_KEY = 'farmSim_save';
const APP_VERSION = '5.5.4';

/* ------------------------------------------------------------------ */
/*  Floating particles — pure CSS + tiny inline JS (no libraries)      */
/* ------------------------------------------------------------------ */
const PARTICLE_COUNT = 28;
const PARTICLE_TYPES = ['leaf', 'sparkle', 'dot'];

function useParticles() {
  return useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      type: PARTICLE_TYPES[i % PARTICLE_TYPES.length],
      size: 4 + Math.random() * 10,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 14,
      opacity: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 120,
    }));
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function StartScreenComponent({ onStart }) {
  const [stage, setStage] = useState(0);
  const [hasSave, setHasSave] = useState(false);
  const particles = useParticles();
  const particleWrapRef = useRef(null);

  const launchHighlights = useMemo(
    () => [
      {
        icon: Leaf,
        label: 'Seasonal Play',
        detail: 'Weather, growth, and colour stay perfectly in sync with the real world.',
      },
      {
        icon: Sparkles,
        label: 'Touch First',
        detail: 'Silky smooth on desktop, phone, and tablet — one-tap play anywhere.',
      },
      {
        icon: TrendingUp,
        label: 'Auto-Save',
        detail: 'Your homestead keeps its momentum, even when life gets busy.',
      },
    ],
    []
  );

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /* Entrance staging ------------------------------------------------ */
  useEffect(() => {
    // Check for existing save
    try {
      const raw = localStorage.getItem(GAME_SAVE_KEY);
      if (raw && raw.length > 2) setHasSave(true);
    } catch {
      /* ignore */
    }

    if (reduceMotion) {
      setStage(3);
      return undefined;
    }

    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 700),
      setTimeout(() => setStage(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  /* Parallax on mouse move ------------------------------------------ */
  useEffect(() => {
    if (reduceMotion) return;
    const handler = (e) => {
      const wrap = particleWrapRef.current;
      if (!wrap) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      wrap.style.transform = `translate(${dx * -12}px, ${dy * -12}px)`;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [reduceMotion]);

  const handleContinue = () => onStart?.('continue');
  const handleNewGame = () => onStart?.('new');

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden bg-[#05140e] text-white select-none"
      data-qa="start-screen"
      data-testid="start-screen"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_20%_85%,_rgba(245,158,11,0.14),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#0a2e1f_0%,_#05140e_55%,_#020a06_100%)]" />

      {/* Soft ambient orbs */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute left-[10%] top-[10%] h-64 w-64 rounded-full bg-emerald-400/10 blur-[80px] animate-pulse" />
        <div className="absolute right-[15%] top-[18%] h-56 w-56 rounded-full bg-amber-300/10 blur-[72px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute left-[45%] top-[60%] h-48 w-48 rounded-full bg-teal-300/8 blur-[64px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating particles */}
      <div
        ref={particleWrapRef}
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out will-change-transform"
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute will-change-transform"
            style={{
              left: `${p.left}%`,
              top: '-5%',
              opacity: p.opacity,
              animation: `particleFloat ${p.duration}s linear ${p.delay}s infinite`,
            }}
          >
            {p.type === 'leaf' && (
              <Leaf
                size={p.size}
                className="text-emerald-300/70"
                style={{ animation: `particleSpin ${p.duration * 0.8}s ease-in-out infinite` }}
              />
            )}
            {p.type === 'sparkle' && (
              <Sparkles
                size={p.size}
                className="text-amber-200/60"
                style={{ animation: `particlePulse ${p.duration * 0.6}s ease-in-out infinite` }}
              />
            )}
            {p.type === 'dot' && (
              <span
                className="block rounded-full bg-white/30"
                style={{ width: p.size * 0.45, height: p.size * 0.45 }}
              />
            )}
          </span>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex min-h-dvh items-center">
        <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
          <section
            className={`relative overflow-hidden rounded-[2.5rem] border border-white/[0.09] bg-white/[0.04] px-6 py-10 text-center shadow-[0_32px_100px_-40px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-[opacity,transform] duration-1000 sm:px-10 sm:py-14 ${
              stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            {/* Subtle inner sheen */}
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_50%,rgba(255,255,255,0.03)_100%)]" />

            {/* Badge */}
            <div
              className={`relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-100/70 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)] transition-all duration-700 ${
                stage >= 2 ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <Sparkles size={13} className="text-emerald-300/80" />
              FarmSim
              <span className="mx-1 h-3 w-px bg-white/15" />
              <span className="text-[10px] tracking-widest text-emerald-100/40">v{APP_VERSION}</span>
            </div>

            {/* Title */}
            <h1
              className={`relative mt-8 text-[clamp(2.6rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-balance text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-50 to-emerald-200/70 transition-all duration-700 ${
                stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              Build a farm
              <br className="hidden sm:block" /> that feels alive.
            </h1>

            {/* Subtitle */}
            <p
              className={`relative mx-auto mt-6 max-w-lg text-base leading-7 text-emerald-100/65 sm:text-lg transition-all duration-700 ${
                stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: '350ms' }}
            >
              Start small, read the season, and grow into something bigger — one tap at a time.
            </p>

            {/* Highlight cards */}
            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {launchHighlights.map(({ icon: Icon, label, detail }, idx) => (
                <div
                  key={label}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-5 py-4 text-left shadow-[0_16px_42px_-28px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] hover:border-white/15 ${
                    stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                  }`}
                  style={{ transitionDelay: `${450 + idx * 120}ms` }}
                >
                  {/* Card hover gradient sweep */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none" />

                  <div className="relative flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-100/60">
                    <span className="inline-flex items-center justify-center rounded-lg bg-white/5 p-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
                      <Icon size={14} className="text-emerald-300/80" />
                    </span>
                    {label}
                  </div>
                  <p className="relative mt-2.5 text-sm leading-6 text-emerald-50/75">
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div
              className={`relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row transition-all duration-700 ${
                stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              <Button
                onClick={handleNewGame}
                size="xl"
                className="group relative w-full overflow-hidden sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 shadow-[0_20px_50px_-18px_rgba(255,255,255,0.5)]"
                aria-label="Start farming"
              >
                <span className="relative z-10 flex items-center">
                  <Play className="mr-2 transition-transform duration-300 group-hover:scale-110" size={20} />
                  Start farming
                  <ChevronRight
                    className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
                    size={20}
                  />
                </span>
              </Button>

              {hasSave && (
                <Button
                  onClick={handleContinue}
                  size="xl"
                  variant="outline"
                  className="group w-full sm:w-auto border-white/15 bg-white/5 text-emerald-50 hover:bg-white/10 hover:border-white/25 backdrop-blur-md shadow-[0_12px_30px_-16px_rgba(0,0,0,0.5)]"
                  aria-label="Continue saved game"
                >
                  <RotateCcw className="mr-2 transition-transform duration-300 group-hover:-rotate-90" size={18} />
                  Continue
                </Button>
              )}
            </div>

            {/* Footer text */}
            <p
              className={`relative mt-6 text-[10px] font-medium uppercase tracking-[0.28em] text-emerald-100/35 transition-all duration-700 ${
                stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
              style={{ transitionDelay: '950ms' }}
            >
              Built for one-tap play across desktop and mobile
            </p>
          </section>

          {/* Copyright */}
          <p
            className={`mt-6 text-center text-[10px] tracking-wider text-emerald-100/20 transition-all duration-700 ${
              stage >= 3 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '1100ms' }}
          >
            &copy; {new Date().getFullYear()} FarmSim. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Keyframe styles (injected once) ── */}
      <style>{`
        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: var(--particle-opacity, 0.4);
          }
          92% {
            opacity: var(--particle-opacity, 0.4);
          }
          100% {
            transform: translateY(110vh) translateX(var(--particle-drift, 40px)) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes particleSpin {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes particlePulse {
          0%, 100% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export const StartScreen = memo(StartScreenComponent);
