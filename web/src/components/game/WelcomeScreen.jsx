/**
 * WelcomeScreen Component
 * A focused, full-bleed intro that sets tone without overwhelming the player.
 */
import React, { useEffect, useMemo, useState, memo } from 'react';
import { Leaf, Droplet, Sun, Coins, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

const FEATURES = [
  {
    icon: Leaf,
    label: 'Grow crops',
    desc: 'Plant, water, and harvest at your own pace.',
    accent: 'from-emerald-400/30 to-lime-400/10',
  },
  {
    icon: Droplet,
    label: 'Read the weather',
    desc: 'Plan around rain, storms, and seasonal shifts.',
    accent: 'from-sky-400/25 to-cyan-400/10',
  },
  {
    icon: Sun,
    label: 'Expand the farm',
    desc: 'Unlock buildings, animals, and new systems.',
    accent: 'from-amber-300/25 to-orange-300/10',
  },
  {
    icon: Coins,
    label: 'Earn momentum',
    desc: 'Stack rewards, prestige, and long-term growth.',
    accent: 'from-yellow-300/25 to-amber-400/10',
  },
];

const HIGHLIGHTS = [
  { label: 'Fast loops', value: 'Plant, harvest, expand' },
  { label: 'Dynamic world', value: 'Weather and seasons matter' },
  { label: 'Long-term play', value: 'Progress carries forward' },
];

const DECORATIVE_EMOJIS = ['🌾', '🌱', '🌿', '🍃', '✨', '🌻'];

const createSeededValue = (seed, min, max) => {
  const normalized = (Math.sin(seed * 97.13) + 1) / 2;
  return min + normalized * (max - min);
};

function WelcomeScreenComponent({ onStart, onSkip }) {
  const [stage, setStage] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const left = createSeededValue(index + 1, 4, 96);
      const top = createSeededValue(index + 11, 6, 92);
      const duration = createSeededValue(index + 21, 9, 15);
      const delay = createSeededValue(index + 31, 0, 6);
      return {
        left: `${left.toFixed(2)}%`,
        top: `${top.toFixed(2)}%`,
        animationDuration: `${duration.toFixed(2)}s`,
        animationDelay: `${delay.toFixed(2)}s`,
      };
    });
  }, []);

  const featureRows = useMemo(() => FEATURES, []);

  useEffect(() => {
    if (reduceMotion) {
      setStage(2);
      setFeatureIndex(featureRows.length);
      return undefined;
    }

    const timers = [];
    timers.push(setTimeout(() => setStage(1), 650));
    featureRows.forEach((_, index) => {
      timers.push(setTimeout(() => setFeatureIndex(index + 1), 1100 + index * 220));
    });
    timers.push(setTimeout(() => setStage(2), 1900));

    return () => timers.forEach(clearTimeout);
  }, [featureRows.length, reduceMotion]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#071b13] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_30%),radial-gradient(circle_at_20%_80%,_rgba(34,197,94,0.18),_transparent_25%),radial-gradient(circle_at_80%_20%,_rgba(250,204,21,0.14),_transparent_24%),linear-gradient(180deg,_#0c281b_0%,_#071b13_58%,_#04110c_100%)]" />

      <div className="absolute inset-0 opacity-70 pointer-events-none">
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute select-none text-white/25 animate-bob"
            style={particle}
          >
            {DECORATIVE_EMOJIS[index % DECORATIVE_EMOJIS.length]}
          </div>
        ))}

        <div className="absolute -top-24 left-[-8rem] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse-slow" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-amber-300/12 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.1s' }} />
        <div className="absolute bottom-[-7rem] left-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.7s' }} />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:px-10">
          <section
            className={`max-w-2xl transition-[transform,opacity] duration-700 ${
              stage >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-100/70">
              <Sparkles size={12} />
              FarmSim
            </div>

            <h1 className="mt-5 text-5xl font-black tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Build a farm that feels alive.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/80 sm:text-lg">
              FarmSim turns routine farm work into a living loop of weather, harvests,
              upgrades, and long-term progression. Start small, read the season, and grow into
              something bigger.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={onStart}
                size="xl"
                className="group w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 shadow-[0_18px_38px_-18px_rgba(255,255,255,0.65)]"
              >
                Start farming
                <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </Button>

              <button
                onClick={onSkip}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Skip intro and jump in
              </button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-100/55">
                    {highlight.label}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/85">
                    {highlight.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside
            className={`relative transition-[transform,opacity] duration-700 delay-150 ${
              stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/35 p-5 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.85)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-yellow-200/16 to-transparent" />
              <div className="absolute -right-6 top-2 text-6xl opacity-70 animate-bob">🌄</div>

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-100/55">
                      Today&apos;s conditions
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                      Spring morning
                    </div>
                    <div className="mt-1 text-sm text-emerald-50/70">
                      Calm weather, strong growth, and room to expand.
                    </div>
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-emerald-50/75">
                    Ready to plant
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/12 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featureRows.map((feature, index) => {
                      const Icon = feature.icon;
                      const visible = index < featureIndex;

                      return (
                        <div
                          key={feature.label}
                          className={`
                            rounded-2xl border border-white/10 bg-gradient-to-br ${feature.accent}
                            p-4 transition-[transform,opacity] duration-500
                            ${visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                          `}
                          style={{ transitionDelay: `${index * 60}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-white shadow-inner">
                              <Icon size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{feature.label}</div>
                              <div className="text-xs leading-5 text-white/75">{feature.desc}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Growth', value: 'Reactive' },
                    { label: 'Loop', value: 'Quick' },
                    { label: 'Depth', value: 'Long-term' },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className={`rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-center transition-[transform,opacity] duration-500 ${
                        stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                      style={{ transitionDelay: `${400 + index * 80}ms` }}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-100/50">
                        {item.label}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white/90">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export const WelcomeScreen = memo(WelcomeScreenComponent);
