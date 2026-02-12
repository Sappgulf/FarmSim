/**
 * DebugOverlay Component
 * Shows FPS, entity count, state info - toggle with backtick (`) key
 */
import React, { useState, useEffect, memo, useMemo } from 'react';

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
      if (e.key === 'Escape') {
        setVisible(false);
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

  const [plotsWithCrops, totalPlots] = useMemo(() => {
    const plots = Array.isArray(farmState?.plots) ? farmState.plots : [];
    let withCrops = 0;
    for (let i = 0; i < plots.length; i++) {
      if (plots[i]?.crop) withCrops += 1;
    }
    return [withCrops, plots.length];
  }, [farmState?.plots]);

  const levelLabel = gameState?.level ?? gameState?.levelId ?? 'none';

  return (
    <div className="fixed bottom-20 left-2 z-50 bg-black/80 text-green-400 font-mono text-xs p-2 rounded-lg max-w-[220px]" role="status" aria-live="polite">
      <div className="font-bold text-green-300 mb-1">Debug (` / Esc to close)</div>
      <div>FPS: {fps}</div>
      {memory !== null && <div>Memory: {memory}MB</div>}
      <div className="border-t border-green-800 mt-1 pt-1">
        <div>Coins: {gameState?.coins || 0}</div>
        <div>Level: {levelLabel}</div>
        <div>Plots: {plotsWithCrops}/{totalPlots}</div>
        <div>Season: {weatherState?.currentSeason || 'none'}</div>
        <div>Weather: {weatherState?.currentWeather || 'none'}</div>
      </div>
    </div>
  );
}

export const DebugOverlay = memo(DebugOverlayComponent);
