import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { ACHIEVEMENTS } from '../../../data/achievements';
import { Trophy, Coins } from 'lucide-react';

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

const AchievementUnlockModal = memo(() => {
  const achievements = useGameSelector((state) => state.achievements || []);
  const prevAchievementsRef = useRef(achievements);
  const [isOpen, setIsOpen] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const prev = prevAchievementsRef.current;
    const prevMap = new Map(prev.map((a) => [a.id, a.unlocked]));

    for (const achievement of achievements) {
      if (achievement.unlocked && !prevMap.get(achievement.id)) {
        const meta = ACHIEVEMENTS.find((a) => a.id === achievement.id);
        if (meta) {
          setUnlockedAchievement(meta);
          setIsOpen(true);
          setIsHovered(false);
          break;
        }
      }
    }

    prevAchievementsRef.current = achievements;
  }, [achievements]);

  useEffect(() => {
    if (isOpen && !isHovered) {
      timerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 4000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, isHovered]);

  const handleClaim = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!isOpen || !unlockedAchievement) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-qa="achievement-unlock-modal"
    >
      <ConfettiBurst />

      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 opacity-80" />
        <div className="relative w-full overflow-hidden rounded-[32px] border border-amber-200/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 shadow-[0_24px_60px_-16px_rgba(124,45,18,0.35)]">
          {/* Shine effect */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute inset-0 animate-[shine-sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Trophy icon */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/50">
            <Trophy className="h-8 w-8 text-white animate-[achievementUnlock_0.8s_ease-out_forwards]" />
          </div>

          {/* Achievement info */}
          <div className="relative mt-4 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
              Achievement Unlocked
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-amber-950 animate-[bounce-in_0.5s_ease-out]">
              {unlockedAchievement.icon} {unlockedAchievement.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-amber-700/80">
              {unlockedAchievement.desc}
            </p>
          </div>

          {/* Reward */}
          <div className="relative mt-4 flex items-center justify-center gap-2 rounded-2xl border border-amber-200/50 bg-amber-100/50 py-3">
            <Coins className="h-5 w-5 text-amber-600" />
            <span className="text-lg font-bold text-amber-900">
              +{unlockedAchievement.reward}
            </span>
            <span className="text-sm font-medium text-amber-700">coins</span>
          </div>

          {/* Claim button */}
          <div className="relative mt-5 flex justify-center">
            <Button
              size="sm"
              variant="gold"
              shine
              elevated
              onClick={handleClaim}
              data-qa="achievement-claim-reward"
            >
              Claim Reward
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

AchievementUnlockModal.displayName = 'AchievementUnlockModal';

export default AchievementUnlockModal;
