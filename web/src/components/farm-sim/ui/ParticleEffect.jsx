import React, { memo, useState, useEffect, useRef } from 'react';

/** HARD CAP per burst keeps DOM + physics work predictable under rapid harvest spam */
const MAX_PARTICLES_PER_BURST = 52;

/**
 * Particle Effect Component
 * Creates visual particle effects for actions like harvesting, watering, fertilizing
 */
const ParticleEffect = memo(({ x, y, type, onComplete, text, intensity = 1 }) => {
  // Store particles data in ref to avoid re-renders
  const particlesRef = React.useRef([]);
  // Store DOM refs to manipulate styles directly
  const domRefs = React.useRef({});
  // Only one render to setup initial state
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Generate particles with variety ONCE
    const rawCount = Math.round((type === 'harvest' ? 60 : type === 'levelup' ? 100 : 25) * Math.max(0.6, intensity));
    const particleCount = Math.min(MAX_PARTICLES_PER_BURST, Math.max(8, rawCount));

    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const baseVelocity = (type === 'harvest' ? 120 : type === 'levelup' ? 80 : 60) * Math.max(0.75, intensity);
      const velocityVariation = Math.random() * 80;
      const velocity = baseVelocity + velocityVariation;
      const upwardBias = (type === 'levelup' ? -120 : type === 'harvest' ? -50 : -40) * Math.max(0.8, intensity);

      return {
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity + upwardBias,
        life: 1,
        size: type === 'harvest' ? 12 + Math.random() * 8 : type === 'levelup' ? 10 + Math.random() * 6 : 6 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
        color: type === 'levelup' ? ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)] : null,
        delay: Math.random() * 0.1,
      };
    });

    setIsReady(true);

    // Animation Loop
    let animationFrame;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const animationDurationMs = Math.max(900, 1200 / Math.max(0.85, intensity));
      const progress = elapsed / animationDurationMs;

      if (progress >= 1) {
        if (onComplete) onComplete();
        return;
      }

      // Direct DOM manipulation - NO REACT RENDERS HERE
      particlesRef.current.forEach(p => {
        const domNode = domRefs.current[p.id];
        if (!domNode) return;

        // Apply delay
        const actualProgress = Math.max(0, progress - (p.delay || 0));
        if (actualProgress <= 0) return;

        // Physics math
        const lifeProgress = 1 - Math.pow(1 - actualProgress, 2);
        const airResistance = 0.98;

        p.vx *= airResistance;
        p.vy *= airResistance;

        const gravity = (type === 'levelup' ? 12 : 15) * (2 - Math.min(1.25, intensity));

        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016 + (gravity * actualProgress * 60);
        p.rotation += p.rotationSpeed * (1 - actualProgress * 0.5);
        p.life = 1 - lifeProgress;

        // Update DOM Styles directly
        domNode.style.opacity = p.life;
        domNode.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.life * 1.5})`;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    // Wait for next frame to ensure DOM refs are bound (React 18 concurrent mode safety)
    requestAnimationFrame(() => {
      animationFrame = requestAnimationFrame(animate);
    });

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [intensity, onComplete, type]);

  // Helper for styles (static stuff)
  const getParticleStaticStyle = (p) => {
    const isEmoji = (type === 'harvest' && p.id % 5 === 0) || (type === 'levelup' && p.id % 3 === 0);

    const baseStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: isEmoji ? 'auto' : `${p.size}px`,
      height: isEmoji ? 'auto' : `${p.size}px`,
      pointerEvents: 'none',
      fontSize: isEmoji ? '16px' : undefined,
      lineHeight: 1,
      willChange: 'transform, opacity', // Hint to browser compositor
    };

    if (isEmoji) return baseStyle;

    // Visual styles based on type
    if (type === 'harvest') {
      return {
        ...baseStyle,
        background: `radial-gradient(circle, #fbbf24 0%, #f59e0b 60%, #ea580c 100%)`,
        borderRadius: '50%',
        boxShadow: `0 0 10px rgba(251, 191, 36, 0.5)`, // Simplified shadow for perf
      };
    }
    if (type === 'levelup') {
      return {
        ...baseStyle,
        background: `radial-gradient(circle, ${p.color} 0%, ${p.color}dd 100%)`,
        borderRadius: '50%',
        boxShadow: `0 0 10px ${p.color}`,
      };
    }
    // Default simple styles for others
    const colors = {
      water: '#3b82f6',
      fertilize: '#10b981',
      plant: '#84cc16'
    };
    return {
      ...baseStyle,
      backgroundColor: colors[type] || '#fff',
      borderRadius: '50%',
    };
  };

  const getParticleContent = (p) => {
    if (type === 'harvest' && p.id % 5 === 0) return '🪙';
    if (type === 'levelup' && p.id % 3 === 0) return ['✨', '⭐', '💫', '🌟'][p.id % 4];
    return null;
  };

  if (!isReady) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '0px',
        height: '0px',
        overflow: 'visible' // Allow particles to fly out
      }}
    >
      {particlesRef.current.map(p => (
        <div
          key={p.id}
          ref={el => domRefs.current[p.id] = el}
          style={getParticleStaticStyle(p)}
        >
          {getParticleContent(p)}
        </div>
      ))}

      {/* Floating text - kept as CSS animation since it's simple */}
      {text && (
        <div
          className="absolute whitespace-nowrap font-bold text-2xl sm:text-3xl animate-float-up"
          style={{
            left: '0',
            top: '-20px',
            transform: 'translateX(-50%)',
            color: type === 'harvest' ? '#fbbf24' : type === 'levelup' ? '#a855f7' : '#ef4444',
            textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
            animation: 'float-up-fade 2s cubic-bezier(0.33, 1, 0.68, 1) forwards',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
});

ParticleEffect.displayName = 'ParticleEffect';

/**
 * Screen Shake Utility
 * Triggers a subtle screen shake effect
 */
const triggerScreenShake = (intensity = 1) => {
  const gameContainer = document.querySelector('.min-h-screen');
  if (!gameContainer) return;

  // REBALANCED: Much gentler shake - reduced intensity and longer duration for smoother effect
  const reducedIntensity = intensity * 0.3; // Reduce shake by 70%

  const keyframes = [
    { transform: 'translate(0, 0)' },
    { transform: `translate(${0.5 * reducedIntensity}px, ${-0.5 * reducedIntensity}px)` },
    { transform: `translate(${-0.5 * reducedIntensity}px, ${0.5 * reducedIntensity}px)` },
    { transform: `translate(${0.3 * reducedIntensity}px, ${0.2 * reducedIntensity}px)` },
    { transform: `translate(${-0.3 * reducedIntensity}px, ${-0.2 * reducedIntensity}px)` },
    { transform: 'translate(0, 0)' },
  ];

  gameContainer.animate(keyframes, {
    duration: 400, // Longer duration for smoother, less jarring effect
    easing: 'ease-out',
  });
};

/**
 * Particle Effects Manager Component
 * Manages multiple particle effects with performance cap
 * @param {{ reducedMotion?: boolean, particleEffectsEnabled?: boolean }} props
 */
export const ParticleEffectsManager = memo(function ParticleEffectsManager({
  reducedMotion = false,
  particleEffectsEnabled = true,
} = {}) {
  const reducedMotionRef = useRef(reducedMotion);
  const particleFxRef = useRef(particleEffectsEnabled);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);
  useEffect(() => {
    particleFxRef.current = particleEffectsEnabled;
  }, [particleEffectsEnabled]);

  const [effects, setEffects] = useState([]);

  // PERF: Max concurrent effects to prevent FPS drops during rapid harvesting
  const MAX_CONCURRENT_EFFECTS = 5;

  // Track particle count for performance overlay
  useEffect(() => {
    window.__particleCount = effects.length;
  }, [effects.length]);

  // Expose method to trigger effects globally
  useEffect(() => {
    window.triggerParticleEffect = (x, y, type, options = {}) => {
      if (!particleFxRef.current) return;

      setEffects(prev => {
        // PERF: Cap concurrent effects to prevent FPS drops
        if (prev.length >= MAX_CONCURRENT_EFFECTS) {
          // Remove oldest effect to make room
          const trimmed = prev.slice(1);
          const id = Date.now() + Math.random();
          return [...trimmed, { id, x, y, type, text: options.text, value: options.value, intensity: options.intensity || 1 }];
        }
        const id = Date.now() + Math.random();
        return [...prev, { id, x, y, type, text: options.text, value: options.value, intensity: options.intensity || 1 }];
      });

      const osReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Trigger screen shake for harvest and levelup (very subtle!)
      if (
        (type === 'harvest' || type === 'levelup') &&
        options.shake !== false &&
        !reducedMotionRef.current &&
        !osReducedMotion
      ) {
        // REBALANCED: Level up shake is now very gentle (0.5 instead of 1.5)
        triggerScreenShake(type === 'levelup' ? 0.5 : 0.2); // Much gentler shake
      }
    };

    // Also expose screen shake globally
    window.triggerScreenShake = triggerScreenShake;

    return () => {
      delete window.triggerParticleEffect;
      delete window.triggerScreenShake;
      delete window.__particleCount;
    };
  }, []);

  const handleEffectComplete = (id) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      {effects.map(effect => (
        <ParticleEffect
          key={effect.id}
          x={effect.x}
          y={effect.y}
          type={effect.type}
          text={effect.text}
          value={effect.value}
          intensity={effect.intensity}
          onComplete={() => handleEffectComplete(effect.id)}
        />
      ))}
    </>
  );
});

ParticleEffectsManager.displayName = 'ParticleEffectsManager';

export default ParticleEffect;

