import React, { useEffect, useRef, useState } from 'react';

/**
 * Advanced Particle System for Enhanced Visual Effects
 * Creates beautiful particle effects for farming actions
 */

class Particle {
  constructor(x, y, type, options = {}) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = options.life || 1.0;
    this.maxLife = this.life;
    this.velocity = options.velocity || { x: 0, y: 0 };
    this.acceleration = options.acceleration || { x: 0, y: 0.1 };
    this.size = options.size || 4;
    this.color = options.color || '#4ade80';
    this.opacity = 1;
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
    this.scale = 1;
    this.emoji = options.emoji || null;
  }

  update(deltaTime) {
    // Update position
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;

    // Update life
    this.life -= deltaTime;
    this.opacity = Math.max(0, this.life / this.maxLife);
    
    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;
    
    // Scale based on life
    this.scale = 0.5 + (this.life / this.maxLife) * 0.5;

    return this.life > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    if (this.emoji) {
      ctx.font = `${this.size * 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      
      switch (this.type) {
        case 'sparkle':
          // Draw sparkle
          ctx.moveTo(-this.size, 0);
          ctx.lineTo(-this.size/3, -this.size/3);
          ctx.lineTo(0, -this.size);
          ctx.lineTo(this.size/3, -this.size/3);
          ctx.lineTo(this.size, 0);
          ctx.lineTo(this.size/3, this.size/3);
          ctx.lineTo(0, this.size);
          ctx.lineTo(-this.size/3, this.size/3);
          ctx.closePath();
          break;
        case 'circle':
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          break;
        case 'leaf':
          // Draw leaf shape
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.quadraticCurveTo(this.size, -this.size/2, this.size/2, 0);
          ctx.quadraticCurveTo(this.size, this.size/2, 0, this.size);
          ctx.quadraticCurveTo(-this.size, this.size/2, -this.size/2, 0);
          ctx.quadraticCurveTo(-this.size, -this.size/2, 0, -this.size);
          break;
        default:
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      }
      
      ctx.fill();
    }

    ctx.restore();
  }
}

export function AdvancedParticleSystem({ width, height, className = "" }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Particle presets for different actions
  const PARTICLE_PRESETS = {
    plant: {
      count: 15,
      life: 2,
      velocity: () => ({
        x: (Math.random() - 0.5) * 100,
        y: -Math.random() * 80 - 20
      }),
      acceleration: { x: 0, y: 30 },
      color: '#22c55e',
      type: 'leaf',
      size: () => Math.random() * 6 + 2
    },
    harvest: {
      count: 25,
      life: 2.5,
      velocity: () => ({
        x: (Math.random() - 0.5) * 120,
        y: -Math.random() * 100 - 40
      }),
      acceleration: { x: 0, y: 40 },
      color: '#fbbf24',
      type: 'sparkle',
      size: () => Math.random() * 8 + 3,
      rotationSpeed: () => (Math.random() - 0.5) * 10
    },
    coins: {
      count: 10,
      life: 2,
      emoji: '💰',
      velocity: () => ({
        x: (Math.random() - 0.5) * 80,
        y: -Math.random() * 60 - 30
      }),
      acceleration: { x: 0, y: 25 },
      size: () => Math.random() * 4 + 8
    },
    achievement: {
      count: 30,
      life: 3,
      velocity: () => ({
        x: (Math.random() - 0.5) * 150,
        y: -Math.random() * 120 - 50
      }),
      acceleration: { x: 0, y: 20 },
      color: '#f59e0b',
      type: 'sparkle',
      size: () => Math.random() * 10 + 4,
      rotationSpeed: () => (Math.random() - 0.5) * 15
    },
    weather: {
      count: 50,
      life: 4,
      velocity: () => ({
        x: Math.random() * 40 - 20,
        y: Math.random() * 100 + 50
      }),
      acceleration: { x: 0, y: 10 },
      color: '#3b82f6',
      type: 'circle',
      size: () => Math.random() * 3 + 1
    },
    magic: {
      count: 20,
      life: 2.5,
      velocity: () => ({
        x: (Math.random() - 0.5) * 100,
        y: -Math.random() * 80 - 20
      }),
      acceleration: { x: 0, y: -10 }, // Float upward
      color: '#a855f7',
      type: 'sparkle',
      size: () => Math.random() * 6 + 3,
      rotationSpeed: () => (Math.random() - 0.5) * 20
    }
  };

  const addParticles = (x, y, preset) => {
    const config = PARTICLE_PRESETS[preset];
    if (!config) return;

    for (let i = 0; i < config.count; i++) {
      const particle = new Particle(x, y, config.type, {
        life: config.life + Math.random() * 0.5,
        velocity: typeof config.velocity === 'function' ? config.velocity() : config.velocity,
        acceleration: config.acceleration,
        size: typeof config.size === 'function' ? config.size() : config.size,
        color: config.color,
        emoji: config.emoji,
        rotationSpeed: typeof config.rotationSpeed === 'function' ? config.rotationSpeed() : config.rotationSpeed
      });
      particlesRef.current.push(particle);
    }
  };

  const animate = (currentTime) => {
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and render particles
    particlesRef.current = particlesRef.current.filter(particle => {
      const alive = particle.update(deltaTime);
      if (alive) {
        particle.render(ctx);
      }
      return alive;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Expose particle system to parent
  useEffect(() => {
    window.particleSystem = { addParticles };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none absolute top-0 left-0 z-10 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

// Utility function to trigger particles from anywhere in the game
export const triggerParticles = (x, y, type) => {
  if (window.particleSystem) {
    window.particleSystem.addParticles(x, y, type);
  }
};

export default AdvancedParticleSystem;
