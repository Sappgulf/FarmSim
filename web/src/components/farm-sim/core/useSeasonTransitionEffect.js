import { useEffect } from 'react';

const createGradient = (seasonConfig) => {
  const gradientStops = Array.isArray(seasonConfig?.overlayGradient)
    ? seasonConfig.overlayGradient
    : ['#dcfce7', '#dbeafe'];
  return `linear-gradient(135deg, ${gradientStops.join(', ')})`;
};

export function useSeasonTransitionEffect() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let activeNodes = [];
    let activeTimers = [];

    const clearActiveTransition = () => {
      activeTimers.forEach((timerId) => clearTimeout(timerId));
      activeTimers = [];
      activeNodes.forEach((node) => {
        if (node && typeof node.remove === 'function') {
          node.remove();
        }
      });
      activeNodes = [];
    };

    window.triggerSeasonTransition = (seasonConfig = {}) => {
      clearActiveTransition();

      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        background: ${createGradient(seasonConfig)};
        opacity: 0;
        transition: opacity ${prefersReducedMotion ? '300ms' : '1.5s'} ease-in-out;
      `;
      document.body.appendChild(overlay);
      activeNodes.push(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = prefersReducedMotion ? '0.7' : '0.95';
      });

      const icon = document.createElement('div');
      icon.textContent = seasonConfig.emoji || '🌱';
      icon.style.cssText = `
        position: fixed;
        top: 40%;
        left: 50%;
        transform: ${
          prefersReducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0)'
        };
        font-size: clamp(64px, 12vw, 150px);
        z-index: 10000;
        pointer-events: none;
        filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.9));
        animation: ${
          prefersReducedMotion
            ? 'fade-in 300ms ease-out forwards'
            : 'season-icon-pop 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        };
      `;
      document.body.appendChild(icon);
      activeNodes.push(icon);

      const text = document.createElement('div');
      text.textContent = seasonConfig.name || 'Season';
      text.style.cssText = `
        position: fixed;
        top: 55%;
        left: 50%;
        transform: ${
          prefersReducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0)'
        };
        font-size: clamp(28px, 6vw, 48px);
        font-weight: bold;
        color: rgba(255, 255, 255, 0.95);
        z-index: 10000;
        pointer-events: none;
        text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        animation: ${
          prefersReducedMotion
            ? 'fade-in 300ms ease-out 80ms forwards'
            : 'season-text-appear 2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards'
        };
      `;
      document.body.appendChild(text);
      activeNodes.push(text);

      const desc = document.createElement('div');
      desc.textContent = seasonConfig.description || '';
      desc.style.cssText = `
        position: fixed;
        top: 62%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: clamp(14px, 2.8vw, 18px);
        color: rgba(255, 255, 255, 0.85);
        z-index: 10000;
        pointer-events: none;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        text-align: center;
        max-width: min(80%, 560px);
        opacity: 0;
        animation: fade-in 1s ease-in 0.8s forwards;
      `;
      document.body.appendChild(desc);
      activeNodes.push(desc);

      if (!prefersReducedMotion) {
        const particleCount = 24;
        for (let i = 0; i < particleCount; i += 1) {
          const particle = document.createElement('div');
          particle.textContent = seasonConfig.icon || seasonConfig.emoji || '✨';
          particle.style.cssText = `
            position: fixed;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            font-size: ${20 + Math.random() * 30}px;
            z-index: 9998;
            pointer-events: none;
            opacity: 0;
            animation: season-particle-float ${3 + Math.random() * 2}s ease-in-out ${
              Math.random() * 0.5
            }s forwards;
          `;
          document.body.appendChild(particle);
          activeNodes.push(particle);
        }
      }

      const fadeTimer = setTimeout(
        () => {
          overlay.style.opacity = '0';
          icon.style.opacity = '0';
          text.style.opacity = '0';
          desc.style.opacity = '0';
          icon.style.transform = 'translate(-50%, -50%) scale(0.5)';
          text.style.transform = 'translate(-50%, -50%) scale(0.5)';

          const cleanupTimer = setTimeout(
            () => {
              clearActiveTransition();
            },
            prefersReducedMotion ? 400 : 1500
          );
          activeTimers.push(cleanupTimer);
        },
        prefersReducedMotion ? 1200 : 2500
      );

      activeTimers.push(fadeTimer);
    };

    return () => {
      clearActiveTransition();
      delete window.triggerSeasonTransition;
    };
  }, []);
}
