import React, { memo, useState, useEffect } from 'react';

/**
 * Particle Effect Component
 * Creates visual particle effects for actions like harvesting, watering, fertilizing
 */
const ParticleEffect = memo(({ x, y, type, onComplete, text, value }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles with variety
    const particleCount = type === 'harvest' ? 60 : type === 'levelup' ? 100 : 25;
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5; // Add randomness
      const baseVelocity = type === 'harvest' ? 120 : type === 'levelup' ? 80 : 60;
      const velocityVariation = Math.random() * 80;
      const velocity = baseVelocity + velocityVariation;
      const upwardBias = type === 'levelup' ? -120 : type === 'harvest' ? -50 : -40;
      
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
        // Add trail effect
        trail: [],
        delay: Math.random() * 0.1, // Stagger spawn slightly
      };
    });

    setParticles(newParticles);

    // Animate particles
    let animationFrame;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 1200; // 1.2 second animation (slightly longer)

      if (progress >= 1) {
        if (onComplete) onComplete();
        return;
      }

      setParticles(prev =>
        prev.map(p => {
          // Apply delay
          const actualProgress = Math.max(0, progress - (p.delay || 0));
          if (actualProgress <= 0) return p;
          
          // Smooth easing for life (ease-out)
          const lifeProgress = 1 - Math.pow(1 - actualProgress, 2);
          
          // Enhanced physics with air resistance
          const airResistance = 0.98;
          const newVx = p.vx * airResistance;
          const newVy = p.vy * airResistance;
          
          // Stronger gravity for more natural fall
          const gravity = type === 'levelup' ? 12 : 15;
          
          return {
            ...p,
            x: p.x + newVx * 0.016,
            y: p.y + newVy * 0.016 + (gravity * actualProgress * 60),
            vx: newVx,
            vy: newVy,
            rotation: p.rotation + p.rotationSpeed * (1 - actualProgress * 0.5), // Slow rotation
            life: 1 - lifeProgress,
          };
        })
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [type, onComplete]);

  const getParticleContent = (particle) => {
    if (type === 'harvest' && particle.id % 5 === 0) {
      // Every 5th particle is a coin emoji
      return '🪙';
    }
    if (type === 'levelup' && particle.id % 3 === 0) {
      // Mix of sparkle emojis
      return ['✨', '⭐', '💫', '🌟'][particle.id % 4];
    }
    return null;
  };

  const getParticleStyle = (particle) => {
    const content = getParticleContent(particle);
    const baseStyle = {
      position: 'absolute',
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      width: content ? 'auto' : `${particle.size}px`,
      height: content ? 'auto' : `${particle.size}px`,
      opacity: particle.life,
      transform: `rotate(${particle.rotation}deg) scale(${particle.life * 1.5})`,
      pointerEvents: 'none',
      transition: 'transform 0.05s ease-out',
      fontSize: content ? '16px' : undefined,
      lineHeight: 1,
    };

    if (content) {
      return baseStyle;
    }

    switch (type) {
      case 'harvest':
        return {
          ...baseStyle,
          background: `radial-gradient(circle, #fbbf24 0%, #f59e0b 60%, #ea580c 100%)`,
          borderRadius: '50%',
          boxShadow: `
            0 0 ${15 * particle.life}px rgba(251, 191, 36, ${particle.life}),
            0 0 ${30 * particle.life}px rgba(251, 191, 36, ${particle.life * 0.5}),
            inset 0 0 ${8 * particle.life}px rgba(255, 255, 255, ${particle.life * 0.6})
          `,
          filter: `brightness(${1 + particle.life * 0.5})`,
        };
      case 'levelup':
        return {
          ...baseStyle,
          background: `radial-gradient(circle, ${particle.color} 0%, ${particle.color}dd 100%)`,
          borderRadius: '50%',
          boxShadow: `
            0 0 ${20 * particle.life}px ${particle.color},
            0 0 ${40 * particle.life}px ${particle.color}66,
            inset 0 0 ${10 * particle.life}px rgba(255, 255, 255, ${particle.life * 0.7})
          `,
          filter: `brightness(${1 + particle.life * 0.8})`,
        };
      case 'water':
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '50%',
          boxShadow: `
            0 0 ${8 * particle.life}px rgba(59, 130, 246, ${particle.life}),
            0 0 ${16 * particle.life}px rgba(59, 130, 246, ${particle.life * 0.5})
          `,
        };
      case 'fertilize':
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          boxShadow: `
            0 0 ${10 * particle.life}px rgba(16, 185, 129, ${particle.life}),
            0 0 ${20 * particle.life}px rgba(16, 185, 129, ${particle.life * 0.5})
          `,
        };
      case 'plant':
        return {
          ...baseStyle,
          background: 'radial-gradient(circle, #84cc16 0%, #65a30d 100%)',
          borderRadius: '50%',
          boxShadow: `
            0 0 ${10 * particle.life}px rgba(132, 204, 22, ${particle.life}),
            0 0 ${20 * particle.life}px rgba(132, 204, 22, ${particle.life * 0.5})
          `,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#ffffff',
          borderRadius: '50%',
        };
    }
  };

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '1px',
        height: '1px',
      }}
    >
      {particles.map(particle => {
        const content = getParticleContent(particle);
        return (
          <div key={particle.id} style={getParticleStyle(particle)}>
            {content}
          </div>
        );
      })}
      {/* Floating text for harvest/level up - Enhanced */}
      {text && (
        <div
          className="absolute whitespace-nowrap font-bold text-2xl sm:text-3xl animate-float-up"
          style={{
            left: '0',
            top: '-20px',
            transform: 'translateX(-50%)',
            color: type === 'harvest' ? '#fbbf24' : type === 'levelup' ? '#a855f7' : '#ef4444',
            textShadow: `
              2px 2px 4px rgba(0,0,0,0.6),
              0 0 15px rgba(255,255,255,0.8),
              0 0 30px ${type === 'harvest' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(168, 85, 247, 0.6)'}
            `,
            animation: 'float-up-fade 2s cubic-bezier(0.33, 1, 0.68, 1) forwards',
            WebkitTextStroke: '1px rgba(0, 0, 0, 0.3)',
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
 * Manages multiple particle effects
 */
export const ParticleEffectsManager = memo(() => {
  const [effects, setEffects] = useState([]);

  // Expose method to trigger effects globally
  useEffect(() => {
    window.triggerParticleEffect = (x, y, type, options = {}) => {
      const id = Date.now() + Math.random();
      setEffects(prev => [...prev, { id, x, y, type, text: options.text, value: options.value }]);
      
      // Trigger screen shake for harvest and levelup (very subtle!)
      if ((type === 'harvest' || type === 'levelup') && options.shake !== false) {
        // REBALANCED: Level up shake is now very gentle (0.5 instead of 1.5)
        triggerScreenShake(type === 'levelup' ? 0.5 : 0.2); // Much gentler shake
      }
    };
    
    // Also expose screen shake globally
    window.triggerScreenShake = triggerScreenShake;

    return () => {
      delete window.triggerParticleEffect;
      delete window.triggerScreenShake;
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
          onComplete={() => handleEffectComplete(effect.id)}
        />
      ))}
    </>
  );
});

ParticleEffectsManager.displayName = 'ParticleEffectsManager';

export default ParticleEffect;

