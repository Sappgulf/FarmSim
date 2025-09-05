import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Timer, Coins, Trophy, Star, Pause, Play } from 'lucide-react';

/**
 * Game Header Component
 * Displays player stats, level progress, and game controls
 */
export function GameHeader({ 
  coins,
  score,
  name,
  levelId,
  level,
  levelEndsAt,
  levelStatus,
  currentTime,
  prestigeLevel,
  paused,
  onPauseToggle,
  onSettingsClick 
}) {
  const timeRemaining = Math.max(0, levelEndsAt - currentTime);
  const timeRemainingMins = Math.floor(timeRemaining / 60);
  const timeRemainingSecs = timeRemaining % 60;
  
  const progressPercent = level ? 
    Math.min(100, (coins / level.targetCoins) * 100) : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Player Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🧑‍🌾</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">{name}</h1>
            <div className="flex items-center gap-2 text-sm opacity-90">
              {prestigeLevel > 0 && (
                <Badge variant="outline" className="text-yellow-300 border-yellow-300">
                  ⭐ P{prestigeLevel}
                </Badge>
              )}
              <span>Score: {score}</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="text-center">
          {level && (
            <>
              <div className="text-sm opacity-90 mb-1">
                {level.label} • {level.difficulty}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4" />
                <span className="font-mono">
                  {coins} / {level.targetCoins}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/20" />
              <div className="text-xs opacity-75 mt-1">
                {progressPercent.toFixed(1)}% Complete
              </div>
            </>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex items-center justify-end gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg">
            <Timer className="w-4 h-4" />
            <span className="font-mono">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Level Status */}
          <Badge 
            variant={
              levelStatus === "won" ? "success" : 
              levelStatus === "lost" ? "destructive" : 
              "secondary"
            }
          >
            {levelStatus === "playing" && "🎮 Playing"}
            {levelStatus === "won" && "🏆 Won"}
            {levelStatus === "lost" && "💔 Lost"}
            {levelStatus === "paused" && "⏸️ Paused"}
          </Badge>

          {/* Pause/Play Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPauseToggle}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            ⚙️
          </Button>
        </div>
      </div>

      {/* Achievement Banner */}
      {levelStatus === "won" && (
        <div className="mt-4 p-3 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
          <div className="flex items-center gap-2 text-yellow-100">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Level Complete!</span>
            <span>Reward: +{level.reward} coins</span>
          </div>
        </div>
      )}
    </div>
  );
}
