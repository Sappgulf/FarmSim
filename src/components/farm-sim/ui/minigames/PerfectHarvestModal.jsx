import React, { useEffect, useRef, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { createGame } from '../../minigames/PerfectHarvestEngine';
import { isDebugMode } from '../../../../utils/debugTools';

const DEFAULT_RULE = {
  id: 'town_board_daily',
  title: 'Town Board Timing',
  instructions: 'Stop the marker in the sweet spot. Best of 2 rounds.',
  rounds: 2,
  speedCurve: [0.5, 0.65],
  targetWindows: { gold: 0.05, silver: 0.08, bronze: 0.1 },
  theme: { icon: '📌', panel: 'from-amber-50 to-orange-50' },
};

const getTierForDistance = (distance, windows) => {
  if (distance <= windows.gold) return 'gold';
  if (distance <= windows.silver) return 'silver';
  if (distance <= windows.bronze) return 'bronze';
  return 'miss';
};

const RESULT_COPY = {
  gold: { title: 'Golden Timing!', helper: 'Flawless rhythm. The town cheers.' },
  silver: { title: 'Silver Timing!', helper: 'Strong focus. The crowd smiles.' },
  bronze: { title: 'Bronze Timing', helper: 'Cozy effort. Nicely done.' },
  miss: { title: 'Early Harvest', helper: 'Still a win—good effort!' },
};

export default function PerfectHarvestModal({
  isOpen,
  onClose,
  onComplete,
  reducedMotion = false,
  ruleSet,
  rewardSummary,
}) {
  const engineRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const [engineState, setEngineState] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [finalTier, setFinalTier] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const activeRule = ruleSet || DEFAULT_RULE;
  const rounds = Math.max(1, Math.min(activeRule.rounds || 1, 3));
  const speedCurve = Array.isArray(activeRule.speedCurve) && activeRule.speedCurve.length
    ? activeRule.speedCurve
    : DEFAULT_RULE.speedCurve;
  const windows = activeRule.targetWindows || DEFAULT_RULE.targetWindows;
  const zoneWidth = Math.min(0.3, (windows.bronze || 0.1) * 2);
  const panelClass = activeRule.theme?.panel || DEFAULT_RULE.theme.panel;
  const icon = activeRule.theme?.icon || DEFAULT_RULE.theme.icon;
  const sfx = activeRule.sfx || {};
  const qaSeed = activeRule.qaSeed;
  const debugMode = isDebugMode();

  useEffect(() => {
    if (!isOpen) return;
    setRoundIndex(0);
    setRoundResults([]);
    setFinalTier(null);
    setFeedback(null);
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || finalTier) return;

    const speed = speedCurve[Math.min(roundIndex, speedCurve.length - 1)];
    const engine = createGame({
      speed,
      zoneWidth,
      reducedMotion,
      deterministicSeed: debugMode && Number.isFinite(qaSeed) ? qaSeed + roundIndex : undefined,
      onUpdate: (nextState) => setEngineState(nextState),
    });

    engineRef.current = engine;
    setEngineState(engine.state);
    setHasStarted(false);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [isOpen, roundIndex, finalTier, speedCurve, zoneWidth, reducedMotion, qaSeed, debugMode]);

  if (!isOpen) return null;

  const playSfx = (token) => {
    if (!token || typeof window === 'undefined' || !window.soundSystem) return;
    const map = {
      harvest: 'playHarvestSound',
      money: 'playMoneySound',
      error: 'playErrorSound',
      click: 'playClickSound',
      water: 'playWaterSound',
      build: 'playBuildSound',
    };
    const method = map[token];
    if (method && typeof window.soundSystem[method] === 'function') {
      window.soundSystem[method]();
    }
  };

  const triggerFeedback = (tier) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    const next = tier === 'miss' ? 'miss' : 'hit';
    setFeedback(next);
    const timeout = reducedMotion ? 180 : 320;
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, timeout);
  };

  const handleStart = () => {
    if (!engineRef.current) return;
    setHasStarted(true);
    engineRef.current.start();
  };

  const advanceRound = (result) => {
    const nextResults = [...roundResults, result];
    setRoundResults(nextResults);

    if (roundIndex < rounds - 1) {
      setRoundIndex(roundIndex + 1);
      setHasStarted(false);
      triggerFeedback(result.tier);
      playSfx(result.tier === 'miss' ? (sfx.miss || 'error') : (sfx.hit || 'harvest'));
      return;
    }

    const averageDistance = nextResults.reduce((sum, entry) => sum + entry.distance, 0) / nextResults.length;
    const tier = getTierForDistance(averageDistance, windows);
    setFinalTier(tier);
    onComplete?.(tier, {
      averageDistance,
      rounds: nextResults,
      ruleId: activeRule.id,
    });
    triggerFeedback(tier);
    playSfx(tier === 'miss' ? (sfx.miss || 'error') : (sfx.hit || 'harvest'));
    playSfx(sfx.reward || 'money');
  };

  const handleStop = () => {
    if (!engineRef.current || finalTier) return;
    if (!hasStarted) return;
    const result = engineRef.current.stop();
    if (!result) return;
    const tier = getTierForDistance(result.distance, windows);
    advanceRound({ ...result, tier });
  };

  const handleAuto = () => {
    if (!engineRef.current || finalTier) return;
    setHasStarted(true);
    engineRef.current.start();
    const result = engineRef.current.stop();
    if (!result) return;
    const tier = getTierForDistance(result.distance, windows);
    advanceRound({ ...result, tier });
  };

  const handleClose = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    onClose?.();
  };

  const barPosition = engineState?.position ?? 0;
  const zoneLeft = Math.max(0, ((engineState?.sweetSpot ?? 0.5) - (engineState?.zoneWidth ?? zoneWidth) / 2) * 100);
  const zoneWidthPct = (engineState?.zoneWidth ?? zoneWidth) * 100;
  const roundLabel = `Round ${Math.min(roundIndex + 1, rounds)} of ${rounds}`;
  const feedbackClass = feedback === 'hit'
    ? 'ring-2 ring-emerald-300/80'
    : feedback === 'miss'
      ? 'ring-2 ring-rose-300/80'
      : '';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6" data-qa="festival-game-modal">
      <Card className="w-full max-w-md rounded-2xl border border-white/40 bg-white/95 p-5 shadow-2xl">
        <div className={`rounded-xl bg-gradient-to-r ${panelClass} p-3`}> 
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-emerald-800">
              <span className="text-lg">{icon}</span>
              <span>{activeRule.title || 'Festival Timing'}</span>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleClose}
              aria-label="Close mini-game"
              data-qa="festival-game-close"
            >
              <X className="icon-16" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-emerald-700">{activeRule.instructions}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
            <span>{roundLabel}</span>
            <span className="flex items-center gap-1">
              <Trophy className="icon-14" /> {finalTier ? RESULT_COPY[finalTier].title : 'Aim for Gold'}
            </span>
          </div>
        </div>

        <div
          className={`mt-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-4 transition-shadow ${feedbackClass}`}
        >
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

        {finalTier ? (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-800" aria-live="polite">
            <div className="font-semibold">{RESULT_COPY[finalTier].title}</div>
            <div className="text-xs text-emerald-700">{RESULT_COPY[finalTier].helper}</div>
            {rewardSummary && (
              <div className="mt-2 text-xs text-emerald-700">
                Reward: {rewardSummary.text}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button className="flex-1" onClick={hasStarted ? handleStop : handleStart} data-qa="festival-game-start">
                {hasStarted ? 'Stop' : 'Start'}
              </Button>
              <Button
                className="flex-1"
                variant="secondary"
                onClick={handleStop}
                disabled={!hasStarted}
                data-qa="festival-game-stop"
              >
                Tap to Stop
              </Button>
            </div>
            {debugMode && (
              <Button variant="outline" size="sm" onClick={handleAuto} data-qa="festival-game-auto">
                QA Auto-Stop
              </Button>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{reducedMotion ? 'Reduced motion enabled' : 'Smooth mode'}</span>
          <span>{finalTier ? 'Reward applied' : 'Play once per festival day'}</span>
        </div>
      </Card>
    </div>
  );
}
