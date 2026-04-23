import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { getLevelBandRewards } from '../systems/progression';
import { Star } from 'lucide-react';

const CONFETTI_COLORS = [
  '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#ef4444',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

const ConfettiBurst = memo(() => {
  const pieces = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      rotation: Math.random() * 360,
      endX: (Math.random() - 0.5) * 60,
    }))
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.current.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
            opacity: 0,
            '--end-x': `${p.endX}px`,
            '--rotation': `${p.rotation + 720}deg`,
          }}
        />
      ))}
    </div>
  );
});

ConfettiBurst.displayName = 'ConfettiBurst';

const LevelUpModal = memo(() => {
  const level = useGameSelector((state) => state.level || 1);
  const prevLevelRef = useRef(level);
  const [isOpen, setIsOpen] = useState(false);
  const [shownLevel, setShownLevel] = useState(level);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setShownLevel(level);
      setIsOpen(true);
      setIsHovered(false);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    if (isOpen && !isHovered) {
      timerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 5000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, isHovered]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  const reward = getLevelBandRewards(shownLevel);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-qa="level-up-modal"
    >
      <ConfettiBurst />

      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-br from-emerald-300 via-green-400 to-teal-400 opacity-80" />
        <div className="relative w-full overflow-hidden rounded-[32px] border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 shadow-[0_24px_60px_-16px_rgba(6,78,59,0.35)]">
          {/* Shine effect */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute inset-0 animate-[shine-sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Icon */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-300/50">
            <Star className="h-8 w-8 text-white animate-[bounce_1s_infinite]" />
          </div>

          {/* Level number */}
          <div className="relative mt-4 text-center">
            <div className="animate-[bounce-in_0.6s_ease-out] text-6xl font-black tracking-tighter text-emerald-900">
              {shownLevel}
            </div>
            <h2 className="mt-1 text-xl font-bold text-emerald-950">
              Level {shownLevel} Reached!
            </h2>
            <p className="mt-1 text-sm font-medium text-emerald-700/80">
              Your farm is growing stronger!
            </p>
          </div>

          {/* Unlocks */}
          {reward && (
            <div className="relative mt-4 rounded-2xl border border-emerald-200/50 bg-emerald-100/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                New Unlocks
              </div>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    ✓
                  </span>
                  {reward.unlock}
                </li>
                {reward.cosmeticTokens > 0 && (
                  <li className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                      ✓
                    </span>
                    +{reward.cosmeticTokens} Cosmetic Token{reward.cosmeticTokens > 1 ? 's' : ''}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Continue button */}
          <div className="relative mt-5 flex justify-center">
            <Button
              size="sm"
              variant="default"
              elevated
              onClick={handleClose}
              data-qa="level-up-continue"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

LevelUpModal.displayName = 'LevelUpModal';

export default LevelUpModal;
