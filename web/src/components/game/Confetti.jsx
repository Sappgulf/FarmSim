/**
 * Confetti Component
 * Celebratory confetti explosion for big wins
 */
import React, { memo, useEffect, useState, useCallback, useRef } from 'react';

const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
];

const CONFETTI_SHAPES = ['●', '■', '▲', '★', '♦', '🎉', '✨', '🌟'];

function ConfettiPiece({ delay, duration, startX, color, shape }) {
  const endX = startX + (Math.random() - 0.5) * 200;
  const rotation = Math.random() * 720 - 360;

  return (
    <div
      className="absolute pointer-events-none text-lg confetti-piece"
      style={{
        left: `${startX}%`,
        top: '-5%',
        color,
        animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
        '--end-x': `${endX - startX}%`,
        '--rotation': `${rotation}deg`,
      }}
    >
      {shape}
    </div>
  );
}

function ConfettiComponent({ trigger, intensity = 'medium', disabled = false }) {
  const [pieces, setPieces] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const cleanupRef = useRef(null);

  const counts = { low: 20, medium: 40, high: 80 };
  const count = counts[intensity] || counts.medium;

  const createConfetti = useCallback(() => {
    if (disabled) return;

    const newPieces = [];
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1.5,
        startX: 10 + Math.random() * 80,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      });
    }
    setPieces(newPieces);
    setIsActive(true);

    // Clean up after animation
    if (cleanupRef.current) {
      clearTimeout(cleanupRef.current);
    }
    cleanupRef.current = setTimeout(() => {
      setIsActive(false);
      setPieces([]);
    }, 4000);
  }, [count, disabled]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (trigger > 0 && !disabled) {
      createConfetti();
    }
  }, [trigger, createConfetti, disabled]);

  if (!isActive || disabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </div>
  );
}

export const Confetti = memo(ConfettiComponent);

// Hook for easy confetti triggering
export function useConfetti() {
  const [state, setState] = useState({ trigger: 0, intensity: 'medium' });

  const fire = useCallback((intensity = 'medium') => {
    setState((prev) => ({
      trigger: prev.trigger + 1,
      intensity,
    }));
  }, []);

  return { trigger: state.trigger, intensity: state.intensity, fire, Confetti };
}
