/**
 * PlotTile Component
 * Individual farm plot with crop display and interactions
 */
import React, { useMemo, memo, useState, useCallback, useEffect } from 'react';
import { Droplets, Bug, AlertTriangle, Check } from 'lucide-react';

const GROWTH_EMOJIS = {
  0: '🌱',
  1: '🌿',
  2: '🪴',
  3: '🌾',
};

// Haptic feedback utility
const triggerHaptic = (pattern = 'light') => {
  if (!navigator.vibrate) return;
  switch (pattern) {
    case 'light': navigator.vibrate(10); break;
    case 'medium': navigator.vibrate(25); break;
    case 'heavy': navigator.vibrate([30, 20, 30]); break;
    case 'success': navigator.vibrate([10, 50, 20]); break;
    default: navigator.vibrate(10);
  }
};

// Premium coin burst animation component
function CoinBurst({ isActive, isBig = false }) {
  if (!isActive) return null;

  const coinCount = isBig ? 8 : 6;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-visible z-20 ${isBig ? 'coin-burst-big' : ''}`}>
      {[...Array(coinCount)].map((_, i) => (
        <span
          key={i}
          className="absolute text-base animate-coin-burst drop-shadow-md"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          🪙
        </span>
      ))}
    </div>
  );
}

// Water splash effect
function WaterSplash({ isActive }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
      {/* Central ripple */}
      <div
        className="water-ripple"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      {/* Water droplets */}
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="water-droplet"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            animationDelay: `${i * 50}ms`,
          }}
        >
          💧
        </span>
      ))}
    </div>
  );
}

// Sparkle effect for fertilizer
function SparkleEffect({ isActive }) {
  if (!isActive) return null;

  const sparkles = ['✨', '⭐', '💫', '✨', '⭐', '💫'];
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
      {sparkles.map((sparkle, i) => {
        const angle = angles[i] * (Math.PI / 180);
        const distance = 25;
        return (
          <span
            key={i}
            className="sparkle-particle"
            style={{
              '--tx': `${Math.cos(angle) * distance}px`,
              '--ty': `${Math.sin(angle) * distance}px`,
              animationDelay: `${i * 40}ms`,
            }}
          >
            {sparkle}
          </span>
        );
      })}
    </div>
  );
}

// Floating text for value display
function FloatingText({ text, isActive, color = 'text-amber-500' }) {
  if (!isActive || !text) return null;

  return (
    <div
      className={`float-up-text ${color} text-sm`}
      style={{ left: '50%', top: '30%', transform: 'translateX(-50%)' }}
    >
      {text}
    </div>
  );
}

// Animated quality stars with count-up effect
function QualityStars({ quality, isReady }) {
  const [visibleStars, setVisibleStars] = useState(0);

  useEffect(() => {
    if (isReady && quality > 0) {
      // Animate stars appearing one by one
      setVisibleStars(0);
      const timers = [];
      for (let i = 1; i <= Math.min(quality, 3); i++) {
        timers.push(setTimeout(() => setVisibleStars(i), i * 150));
      }
      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleStars(0);
    }
  }, [isReady, quality]);

  if (!isReady || quality <= 0) return null;

  return (
    <div className="absolute top-1 left-1 flex">
      {[...Array(Math.min(quality, 3))].map((_, i) => (
        <span
          key={i}
          className={`
            text-[10px] -ml-0.5 first:ml-0 drop-shadow-md
            transition-all duration-300
            ${i < visibleStars ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            ${quality >= 3 ? 'animate-star-glow' : ''}
          `}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

// Cured effect overlay
function CuredEffect({ isActive }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center animate-cured-flash">
      <div className="bg-green-500/20 rounded-xl absolute inset-0" />
      <div className="bg-white rounded-full p-1 shadow-lg">
        <Check size={16} className="text-green-500" />
      </div>
    </div>
  );
}

// Fertilizer glow effect
function FertilizerGlow({ isActive }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-xl animate-fertilizer-glow">
      <div className="absolute inset-0 bg-yellow-400/20 rounded-xl" />
    </div>
  );
}

function PlotTileComponent({
  plot,
  index,
  cropData,
  status,
  progress,
  stage,
  onPlant,
  onHarvest,
  onWater,
  onTreatPest,
  onTreatDisease,
  onFertilize,
  disabled = false,
}) {
  const [showCoinBurst, setShowCoinBurst] = useState(false);
  const [showWaterSplash, setShowWaterSplash] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [floatingText, setFloatingText] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [justPlanted, setJustPlanted] = useState(false);
  const [harvestValue, setHarvestValue] = useState(0);
  const [showCured, setShowCured] = useState(false);
  const [showFertilizerGlow, setShowFertilizerGlow] = useState(false);

  // Determine visual state
  const visualState = useMemo(() => {
    if (!plot.crop) return 'empty';
    if (plot.hasPest) return 'pest';
    if (plot.hasDisease) return 'disease';
    if (status === 'ready') return 'ready';
    return 'growing';
  }, [plot.crop, plot.hasPest, plot.hasDisease, status]);

  // Get display emoji
  const displayEmoji = useMemo(() => {
    if (!plot.crop || !cropData) {
      return '🟫'; // Empty plot
    }

    if (status === 'ready') {
      return cropData.emoji;
    }

    // Growing stages
    return GROWTH_EMOJIS[Math.min(stage, 3)] || '🌱';
  }, [plot.crop, cropData, status, stage]);

  // Handle click with enhanced animations and haptic feedback
  const handleClick = useCallback(() => {
    if (disabled) return;

    // Press feedback with haptic
    setIsPressed(true);
    triggerHaptic('light');
    setTimeout(() => setIsPressed(false), 150);

    if (!plot.crop) {
      onPlant?.(index);
      setJustPlanted(true);
      triggerHaptic('medium');
      setTimeout(() => setJustPlanted(false), 400);
      return;
    }

    if (plot.hasPest) {
      onTreatPest?.(index);
      setShowSparkle(true);
      setShowCured(true);
      triggerHaptic('success');
      setTimeout(() => {
        setShowSparkle(false);
        setShowCured(false);
      }, 800);
      return;
    }

    if (plot.hasDisease) {
      onTreatDisease?.(index);
      setShowSparkle(true);
      setShowCured(true);
      triggerHaptic('success');
      setTimeout(() => {
        setShowSparkle(false);
        setShowCured(false);
      }, 800);
      return;
    }

    if (status === 'ready') {
      // Get harvest value for display
      const baseValue = cropData?.baseValue || 10;
      const isBigHarvest = baseValue >= 40;

      setHarvestValue(baseValue);
      setShowCoinBurst(true);
      setFloatingText(`+${baseValue}🪙`);
      triggerHaptic(isBigHarvest ? 'heavy' : 'success');

      setTimeout(() => {
        setShowCoinBurst(false);
        setFloatingText(null);
      }, 700);

      onHarvest?.(index);
      return;
    }

    // Growing - offer water
    setShowWaterSplash(true);
    triggerHaptic('light');
    setTimeout(() => setShowWaterSplash(false), 600);
    onWater?.(index);
  }, [disabled, plot.crop, plot.hasPest, plot.hasDisease, status, index, onPlant, onTreatPest, onTreatDisease, onHarvest, onWater, cropData]);

  // Handle long press for fertilize
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (plot.crop && status !== 'ready' && !plot.hasPest && !plot.hasDisease) {
      onFertilize?.(index);
      setShowSparkle(true);
      setShowFertilizerGlow(true);
      triggerHaptic('medium');
      setTimeout(() => {
        setShowSparkle(false);
      }, 600);
      setTimeout(() => {
        setShowFertilizerGlow(false);
      }, 2000);
    }
  }, [plot.crop, plot.hasPest, plot.hasDisease, status, index, onFertilize]);

  // Base classes
  const baseClasses = `
    relative w-full aspect-square rounded-xl border-2 cursor-pointer
    transition-all duration-200 ease-out
    flex flex-col items-center justify-center
    text-2xl sm:text-3xl
    select-none
    plot-enhanced
    touch-manipulation min-h-[44px]
    transform-gpu
  `;

  // State-specific classes with enhanced styling
  const stateClasses = {
    empty: 'bg-gradient-to-br from-amber-100/90 to-amber-200/70 border-amber-300 hover:border-amber-400 hover:shadow-md hover:shadow-amber-200/50',
    growing: 'bg-gradient-to-br from-green-100/90 to-emerald-100/70 border-green-300 hover:border-green-400 hover:shadow-md hover:shadow-green-200/50',
    ready: 'bg-gradient-to-br from-emerald-100 to-green-200/80 border-emerald-400 shadow-lg shadow-emerald-300/50 ready-glow',
    pest: 'bg-gradient-to-br from-red-100/90 to-red-200/70 border-red-400 infested',
    disease: 'bg-gradient-to-br from-purple-100/90 to-purple-200/70 border-purple-400 diseased',
  };

  // Watered indicator
  const isWatered = plot.wateredAt && (Date.now() / 1000 - plot.wateredAt) < 30;

  // Fertilized indicator
  const isFertilized = plot.fertilizedCount > 0;

  // Pollinated indicator
  const isPollinated = plot.pollinated;

  // Dynamic scale based on state
  const scaleClass = isPressed ? 'scale-95' : status === 'ready' ? 'hover:scale-105' : 'hover:scale-102';

  return (
    <div
      className={`${baseClasses} ${stateClasses[visualState]} ${scaleClass} ${justPlanted ? 'bounce-in' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      aria-label={plot.crop ? `${plot.crop} - ${status}` : 'Empty plot'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
        if (e.key === 'f' && plot.crop && status !== 'ready') {
          e.preventDefault();
          handleContextMenu(e);
        }
      }}
    >
      {/* Subtle inner glow for depth */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-white/20 pointer-events-none" />

      {/* Main emoji display */}
      <span className={`
        relative z-10
        transition-transform duration-200
        ${status === 'ready' ? 'float-idle' : ''}
        ${visualState === 'growing' ? 'growing-breathe' : ''}
        ${showCoinBurst ? 'harvest-burst' : ''}
        drop-shadow-sm
      `}>
        {displayEmoji}
      </span>

      {/* Particle Effects */}
      <CoinBurst isActive={showCoinBurst} isBig={harvestValue >= 40} />
      <WaterSplash isActive={showWaterSplash} />
      <SparkleEffect isActive={showSparkle} />
      <FloatingText text={floatingText} isActive={!!floatingText} />
      <CuredEffect isActive={showCured} />
      <FertilizerGlow isActive={showFertilizerGlow} />

      {/* Progress bar for growing crops - Enhanced */}
      {plot.crop && status !== 'ready' && progress < 1 && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 h-2 bg-gray-200/80 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 transition-all duration-500 relative"
            style={{ width: `${progress * 100}%` }}
          >
            {/* Shimmer effect on progress */}
            <div className="absolute inset-0 progress-shimmer" />
          </div>
        </div>
      )}

      {/* Status indicators - Enhanced */}
      <div className="absolute top-1 right-1 flex gap-0.5">
        {isWatered && (
          <span className="w-5 h-5 flex items-center justify-center bg-blue-100/90 rounded-full shadow-sm border border-blue-200" title="Watered">
            <Droplets size={11} className="text-blue-500" />
          </span>
        )}
        {isFertilized && (
          <span className="w-5 h-5 flex items-center justify-center bg-yellow-100/90 rounded-full shadow-sm border border-yellow-200 text-[9px]" title="Fertilized">
            ✨
          </span>
        )}
        {isPollinated && (
          <span className="w-5 h-5 flex items-center justify-center bg-amber-100/90 rounded-full shadow-sm border border-amber-200 text-[9px] animate-bee-buzz" title="Pollinated">
            🐝
          </span>
        )}
      </div>

      {/* Quality star preview for ready crops - animated */}
      <QualityStars quality={plot.quality || 0} isReady={status === 'ready'} />

      {/* Pest/Disease overlay - Enhanced */}
      {plot.hasPest && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/25 to-red-600/20 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
          <Bug size={26} className="text-red-600 drop-shadow-md wiggle" />
        </div>
      )}
      {plot.hasDisease && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/25 to-purple-600/20 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
          <AlertTriangle size={26} className="text-purple-600 drop-shadow-md wiggle" />
        </div>
      )}

      {/* Ready glow ring effect */}
      {status === 'ready' && (
        <>
          <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/60 pointer-events-none" />
          <div className="absolute -inset-1 rounded-xl bg-emerald-400/10 blur-sm pointer-events-none" />
        </>
      )}
    </div>
  );
}

// Custom comparison function for memo - ignore handler changes
function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.index === nextProps.index &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.status === nextProps.status &&
    prevProps.progress === nextProps.progress &&
    prevProps.stage === nextProps.stage &&
    prevProps.cropData === nextProps.cropData &&
    prevProps.plot.crop === nextProps.plot.crop &&
    prevProps.plot.hasPest === nextProps.plot.hasPest &&
    prevProps.plot.hasDisease === nextProps.plot.hasDisease &&
    prevProps.plot.wateredAt === nextProps.plot.wateredAt &&
    prevProps.plot.fertilizedCount === nextProps.plot.fertilizedCount &&
    prevProps.plot.pollinated === nextProps.plot.pollinated
  );
}

export const PlotTile = memo(PlotTileComponent, arePropsEqual);
