import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Target } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { PerfectHarvestEngine } from '../../minigames/PerfectHarvestEngine';

const getResultTier = (position, sweetSpot, zoneWidth) => {
  const distance = Math.abs(position - sweetSpot);
  if (distance <= zoneWidth * 0.35) return 'perfect';
  if (distance <= zoneWidth * 0.8) return 'good';
  if (distance <= zoneWidth * 1.3) return 'okay';
  return 'miss';
};

const RESULT_COPY = {
  perfect: { title: 'Perfect Harvest!', helper: 'Flawless timing. The town is impressed.' },
  good: { title: 'Great Harvest!', helper: 'Nice timing. Your crops shine.' },
  okay: { title: 'Good Harvest', helper: 'Solid timing. A cozy result.' },
  miss: { title: 'Early Harvest', helper: 'Still a win—good effort!' },
};

export default function PerfectHarvestModal({
  isOpen,
  onClose,
  onComplete,
  reducedMotion = false,
}) {
  const engineRef = useRef(null);
  const [engineState, setEngineState] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState(null);

  const speed = reducedMotion ? 0.35 : 0.6;
  const zoneWidth = reducedMotion ? 0.22 : 0.18;
  const sweetSpot = useMemo(() => 0.35 + Math.random() * 0.3, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const engine = new PerfectHarvestEngine({
      onUpdate: (nextState) => setEngineState(nextState),
      onEnd: (finalState) => {
        if (!finalState) return;
        const tier = getResultTier(finalState.position, finalState.sweetSpot, finalState.zoneWidth);
        setResult({ tier, finalState });
        onComplete?.(tier);
      },
    });
    engine.init({ speed, zoneWidth, sweetSpot });
    engineRef.current = engine;
    setEngineState(engine.state);
    setHasStarted(false);
    setResult(null);

    return () => {
      engine.cleanup();
      engineRef.current = null;
    };
  }, [isOpen, onComplete, speed, zoneWidth, sweetSpot]);

  if (!isOpen) return null;

  const handleStart = () => {
    if (!engineRef.current) return;
    setHasStarted(true);
    engineRef.current.start();
  };

  const handleStop = () => {
    if (!engineRef.current || result) return;
    engineRef.current.end();
  };

  const handleClose = () => {
    if (engineRef.current) {
      engineRef.current.cleanup();
      engineRef.current = null;
    }
    onClose?.();
  };

  const barPosition = engineState?.position ?? 0;
  const zoneLeft = Math.max(0, ((engineState?.sweetSpot ?? sweetSpot) - (engineState?.zoneWidth ?? zoneWidth) / 2) * 100);
  const zoneWidthPct = (engineState?.zoneWidth ?? zoneWidth) * 100;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6">
      <Card className="w-full max-w-md rounded-2xl border border-white/40 bg-white/95 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
            <Target className="icon-20" />
            Perfect Harvest
          </div>
          <Button size="icon-sm" variant="ghost" onClick={handleClose} aria-label="Close mini-game">
            <X className="icon-16" />
          </Button>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          Stop the marker inside the sweet spot for bonus rewards. Tap “Stop” anytime.
        </p>

        <div className="mt-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
          <div className="relative h-4 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="absolute top-0 h-full rounded-full bg-emerald-200/80"
              style={{ left: `${zoneLeft}%`, width: `${zoneWidthPct}%` }}
            />
            <div
              className="absolute top-0 h-full w-2 rounded-full bg-emerald-600 shadow-md transition-transform duration-75"
              style={{ left: `calc(${barPosition * 100}% - 4px)` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Too early</span>
            <span>Sweet spot</span>
            <span>Too late</span>
          </div>
        </div>

        {result ? (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-800">
            <div className="font-semibold">{RESULT_COPY[result.tier].title}</div>
            <div className="text-xs text-emerald-700">{RESULT_COPY[result.tier].helper}</div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Button className="flex-1" onClick={hasStarted ? handleStop : handleStart}>
              {hasStarted ? 'Stop' : 'Start'}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={handleStop} disabled={!hasStarted}>
              Tap to Stop
            </Button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{reducedMotion ? 'Reduced motion enabled' : 'Smooth mode'}</span>
          <span>{result ? 'Reward applied' : 'Play once per event or day'}</span>
        </div>
      </Card>
    </div>
  );
}
