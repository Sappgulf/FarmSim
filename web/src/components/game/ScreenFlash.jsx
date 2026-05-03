/**
 * ScreenFlash Component
 * Full-screen flash effect for big moments
 */
import React, { useState, useEffect, useCallback } from 'react';

export function ScreenFlash({ trigger, color = 'gold' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger > 0) {
      setKey((k) => k + 1);
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!isVisible) return null;

  const colorClasses = {
    gold: 'screen-flash-gold',
    green: 'screen-flash-green',
    purple: 'screen-flash-purple',
  };

  return (
    <div
      key={key}
      className={`screen-flash ${colorClasses[color] || colorClasses.gold}`}
      aria-hidden="true"
    />
  );
}

// Hook for triggering screen flashes
export function useScreenFlash() {
  const [trigger, setTrigger] = useState(0);
  const [color, setColor] = useState('gold');

  const flash = useCallback((flashColor = 'gold') => {
    setColor(flashColor);
    setTrigger((t) => t + 1);
  }, []);

  const flashGold = useCallback(() => flash('gold'), [flash]);
  const flashGreen = useCallback(() => flash('green'), [flash]);
  const flashPurple = useCallback(() => flash('purple'), [flash]);

  return {
    trigger,
    color,
    flash,
    flashGold,
    flashGreen,
    flashPurple,
  };
}
