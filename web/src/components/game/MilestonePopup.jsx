/**
 * Milestone Popup Component
 * Celebration modal for major achievements and milestones
 */
import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Coins, ChevronRight, Trophy, Sparkles, Gift } from 'lucide-react';
import { Button } from '../ui/button';

// Milestone definitions
export const MILESTONES = {
  first_plant: {
    id: 'first_plant',
    title: 'First Steps!',
    subtitle: 'You planted your first crop',
    emoji: '🌱',
    reward: 5,
    message: 'Every great farm starts with a single seed. Keep growing!',
    color: 'green',
  },
  first_harvest: {
    id: 'first_harvest',
    title: 'First Harvest!',
    subtitle: 'You harvested your first crop',
    emoji: '🌾',
    reward: 10,
    message: 'The satisfaction of a successful harvest! Many more to come.',
    color: 'amber',
  },
  first_perfect: {
    id: 'first_perfect',
    title: 'Perfect Crop!',
    subtitle: 'You grew a Perfect quality crop',
    emoji: '⭐',
    reward: 25,
    message: 'Outstanding! Your farming skills are truly exceptional.',
    color: 'purple',
  },
  first_building: {
    id: 'first_building',
    title: 'Builder!',
    subtitle: 'You constructed your first building',
    emoji: '🏗️',
    reward: 20,
    message: 'Your farm is growing! Buildings unlock new possibilities.',
    color: 'blue',
  },
  first_mutation: {
    id: 'first_mutation',
    title: 'Rare Discovery!',
    subtitle: 'You discovered a crop mutation',
    emoji: '✨',
    reward: 50,
    message: 'Amazing! You found a rare genetic variant. These are valuable!',
    color: 'pink',
  },
  combo_master: {
    id: 'combo_master',
    title: 'Combo Master!',
    subtitle: 'Reached a 10x harvest combo',
    emoji: '🔥',
    reward: 30,
    message: "Lightning fast harvesting! You're on fire!",
    color: 'orange',
  },
  hundred_coins: {
    id: 'hundred_coins',
    title: 'Growing Wealth!',
    subtitle: 'Earned 100 coins total',
    emoji: '💰',
    reward: 15,
    message: 'Your hard work is paying off! Keep farming for more.',
    color: 'yellow',
  },
  farm_expansion: {
    id: 'farm_expansion',
    title: 'Expansion!',
    subtitle: 'You expanded your farm',
    emoji: '📐',
    reward: 20,
    message: 'More plots mean more possibilities! Plant wisely.',
    color: 'teal',
  },
  level_complete: {
    id: 'level_complete',
    title: 'Level Complete!',
    subtitle: 'You completed a level',
    emoji: '🏆',
    reward: 0, // Set dynamically
    message: 'Excellent work! Ready for the next challenge?',
    color: 'gold',
  },
  first_prestige: {
    id: 'first_prestige',
    title: 'Prestige!',
    subtitle: 'You reached your first prestige level',
    emoji: '👑',
    reward: 100,
    message: "You've proven yourself a master farmer! Enjoy your permanent bonuses.",
    color: 'gradient',
  },
  first_animal: {
    id: 'first_animal',
    title: 'Animal Friend!',
    subtitle: 'You bought your first animal',
    emoji: '🐄',
    reward: 15,
    message: 'Animals provide steady income. Keep them happy and fed!',
    color: 'brown',
  },
  first_process: {
    id: 'first_process',
    title: 'Processor!',
    subtitle: 'You processed your first crop',
    emoji: '🏭',
    reward: 20,
    message: 'Processed goods sell for more! Use the workshop wisely.',
    color: 'slate',
  },
};

const COLOR_CLASSES = {
  green: 'from-green-400 to-emerald-500',
  amber: 'from-amber-400 to-orange-500',
  purple: 'from-purple-400 to-pink-500',
  blue: 'from-blue-400 to-indigo-500',
  pink: 'from-pink-400 to-rose-500',
  orange: 'from-orange-400 to-red-500',
  yellow: 'from-yellow-400 to-amber-500',
  teal: 'from-teal-400 to-cyan-500',
  gold: 'from-yellow-300 to-amber-500',
  gradient: 'from-purple-400 via-pink-500 to-amber-500',
  brown: 'from-amber-600 to-orange-700',
  slate: 'from-slate-400 to-gray-600',
};

function MilestonePopupComponent({ milestone, reward = 0, onClose, onClaim }) {
  const [isVisible, setIsVisible] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [particles, setParticles] = useState([]);

  // Animate in
  useEffect(() => {
    if (milestone) {
      setIsVisible(true);
      setClaimed(false);

      // Generate celebration particles
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 1 + Math.random() * 1,
          size: 8 + Math.random() * 16,
          emoji: ['✨', '🌟', '⭐', '💫', '🎉'][Math.floor(Math.random() * 5)],
        });
      }
      setParticles(newParticles);
    }
  }, [milestone]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (!claimed && onClaim) {
        onClaim(finalReward);
      }
      onClose?.();
    }, 300);
  };

  const handleClaim = () => {
    setClaimed(true);
    if (onClaim) {
      onClaim(finalReward);
    }
    handleClose();
  };

  if (!milestone) return null;

  const milestoneData = MILESTONES[milestone.id] || milestone;
  const finalReward = reward || milestoneData.reward;
  const colorClass = COLOR_CLASSES[milestoneData.color] || COLOR_CLASSES.green;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-[150] flex items-center justify-center p-4
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-milestone-particle"
            style={{
              left: `${p.x}%`,
              fontSize: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden
          transform transition-all duration-300
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${colorClass} p-6 text-center relative overflow-hidden`}>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shine" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Emoji with glow */}
          <div className="relative inline-block mb-2">
            <div className="absolute inset-0 text-6xl blur-lg opacity-50 animate-pulse">
              {milestoneData.emoji}
            </div>
            <span className="text-6xl relative animate-bounce-slow">{milestoneData.emoji}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{milestoneData.title}</h2>
          <p className="text-white/90 text-sm mt-1">{milestoneData.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">{milestoneData.message}</p>

          {/* Reward */}
          {finalReward > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Gift className="text-amber-500" size={20} />
                <span className="font-medium">Reward</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Coins className="text-yellow-500" size={24} />
                <span className="text-3xl font-bold text-amber-600">+{finalReward}</span>
              </div>
            </div>
          )}

          {/* Claim button */}
          <Button
            onClick={handleClaim}
            className={`w-full bg-gradient-to-r ${colorClass} hover:opacity-90 text-white font-bold py-3`}
          >
            <Sparkles size={18} className="mr-2" />
            {finalReward > 0 ? 'Claim Reward!' : 'Awesome!'}
          </Button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes milestone-particle {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-milestone-particle {
          animation: milestone-particle 2s ease-out forwards;
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
}

export const MilestonePopup = memo(MilestonePopupComponent);
