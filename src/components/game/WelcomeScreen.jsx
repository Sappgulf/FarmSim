/**
 * WelcomeScreen Component
 * Animated welcome experience for new players
 */
import React, { useState, useEffect, memo } from 'react';
import { Leaf, Droplet, Sun, Coins, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

const FEATURES = [
  { icon: Leaf, label: "Grow Crops", desc: "Plant and nurture various crops", color: "text-green-500" },
  { icon: Droplet, label: "Manage Weather", desc: "Adapt to changing seasons", color: "text-blue-500" },
  { icon: Sun, label: "Build Your Farm", desc: "Expand with buildings & animals", color: "text-yellow-500" },
  { icon: Coins, label: "Earn Rewards", desc: "Complete goals and prestige", color: "text-amber-500" },
];

function WelcomeScreenComponent({ onStart, onSkip }) {
  const [stage, setStage] = useState(0); // 0: logo, 1: features, 2: ready
  const [featureIndex, setFeatureIndex] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);

  // Animate through stages
  useEffect(() => {
    const timers = [];

    // Stage 0 -> 1 (show features)
    timers.push(setTimeout(() => {
      setStage(1);
      setShowFeatures(true);
    }, 1500));

    // Animate features appearing
    FEATURES.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setFeatureIndex(i + 1);
      }, 1800 + i * 300));
    });

    // Stage 1 -> 2 (ready to start)
    timers.push(setTimeout(() => {
      setStage(2);
    }, 3200));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            {['🌱', '🌿', '🍃', '✨', '🌾', '🌻'][i % 6]}
          </div>
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-md w-full">
        {/* Logo and title */}
        <div className={`transition-all duration-700 ${stage >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Farm icon */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-2xl rotate-6" />
            <div className="absolute inset-0 bg-white/30 rounded-2xl -rotate-3" />
            <div className="relative bg-white rounded-2xl p-4 shadow-2xl flex items-center justify-center">
              <span className="text-5xl animate-bounce-slow">🌾</span>
            </div>
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" size={24} />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            FarmSim
          </h1>
          <p className="text-emerald-100 text-lg mb-8">
            Build Your Dream Farm
          </p>
        </div>

        {/* Features grid */}
        {showFeatures && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className={`
                  bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20
                  transition-all duration-500
                  ${i < featureIndex ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
                `}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <feature.icon className={`${feature.color} mx-auto mb-1`} size={24} />
                <div className="text-white text-sm font-medium">{feature.label}</div>
                <div className="text-emerald-100 text-xs">{feature.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Start button */}
        <div className={`transition-all duration-500 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            onClick={onStart}
            className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-lg py-6 shadow-xl hover:shadow-2xl transition-all group"
          >
            Start Farming
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>

          <button
            onClick={onSkip}
            className="mt-4 text-emerald-100 hover:text-white text-sm transition-colors"
          >
            Skip intro & start playing
          </button>
        </div>

        {/* Version tag */}
        <div className="absolute bottom-6 left-0 right-0 text-emerald-200/50 text-xs">
          v2.0 - Made with love
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export const WelcomeScreen = memo(WelcomeScreenComponent);
