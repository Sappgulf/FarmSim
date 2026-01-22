/**
 * DebugOverlay Component
 * Shows FPS, entity count, state info - toggle with backtick (`) key
 */
import React, { useState, useEffect, useCallback, memo } from 'react';

function DebugOverlayComponent({ gameState, farmState, weatherState }) {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(null);

  // Toggle with backtick key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '`') {
        setVisible(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // FPS counter
  useEffect(() => {
    if (!visible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId;

    const measureFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;

        // Try to get memory info (Chrome only)
        if (performance.memory) {
          setMemory(Math.round(performance.memory.usedJSHeapSize / 1024 / 1024));
        }
      }
      rafId = requestAnimationFrame(measureFps);
    };

    rafId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafId);
  }, [visible]);

  if (!visible) return null;

  const plotsWithCrops = farmState?.plots?.filter(p => p.crop)?.length || 0;
  const totalPlots = farmState?.plots?.length || 0;

  return (
    <div className="fixed bottom-20 left-2 z-50 bg-black/80 text-green-400 font-mono text-xs p-2 rounded-lg max-w-[200px]">
      <div className="font-bold text-green-300 mb-1">Debug (` to close)</div>
      <div>FPS: {fps}</div>
      {memory && <div>Memory: {memory}MB</div>}
      <div className="border-t border-green-800 mt-1 pt-1">
        <div>Coins: {gameState?.coins || 0}</div>
        <div>Level: {gameState?.levelId || 'none'}</div>
        <div>Plots: {plotsWithCrops}/{totalPlots}</div>
        <div>Season: {weatherState?.currentSeason || 'none'}</div>
        <div>Weather: {weatherState?.currentWeather || 'none'}</div>
      </div>
    </div>
  );
}

export const DebugOverlay = memo(DebugOverlayComponent);
