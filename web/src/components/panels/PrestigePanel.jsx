/**
 * Prestige Panel Component
 * End-game prestige system with bonuses and unlockables
 */
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Crown,
  Star,
  Zap,
  TrendingUp,
  Lock,
  Check,
  Gift,
  Sparkles,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import { PRESTIGE_LEVELS, PRESTIGE_BONUSES } from '../../data/constants';

// Prestige unlockables
const PRESTIGE_UNLOCKS = {
  1: [
    {
      type: 'bonus',
      name: 'Coin Multiplier',
      value: '1.15x',
      icon: Coins,
      desc: 'All earnings increased',
    },
    {
      type: 'feature',
      name: 'Quality Boost',
      value: '+3%',
      icon: Star,
      desc: 'Better crop quality chance',
    },
    {
      type: 'recipe',
      name: 'Super Carrot',
      icon: () => <span>🥕✨</span>,
      desc: 'Breeding recipe unlocked',
    },
  ],
  2: [
    {
      type: 'bonus',
      name: 'Coin Multiplier',
      value: '1.35x',
      icon: Coins,
      desc: 'All earnings increased',
    },
    { type: 'feature', name: 'Growth Speed', value: '+8%', icon: Zap, desc: 'Faster crop growth' },
    {
      type: 'recipe',
      name: 'Rainbow Corn',
      icon: () => <span>🌽🌈</span>,
      desc: 'Breeding recipe unlocked',
    },
    {
      type: 'feature',
      name: 'Mutation Boost',
      value: '+15%',
      icon: Sparkles,
      desc: 'Higher mutation chance',
    },
  ],
  3: [
    {
      type: 'bonus',
      name: 'Coin Multiplier',
      value: '1.6x',
      icon: Coins,
      desc: 'All earnings increased',
    },
    {
      type: 'feature',
      name: 'Quality Boost',
      value: '+9%',
      icon: Star,
      desc: 'Better crop quality chance',
    },
    {
      type: 'recipe',
      name: 'Golden Tomato',
      icon: () => <span>🍅✨</span>,
      desc: 'Breeding recipe unlocked',
    },
    {
      type: 'feature',
      name: 'Auto-Water',
      value: 'Enhanced',
      icon: () => <span>💧</span>,
      desc: 'Wells water 50% faster',
    },
  ],
  4: [
    {
      type: 'bonus',
      name: 'Coin Multiplier',
      value: '2.0x',
      icon: Coins,
      desc: 'All earnings increased',
    },
    { type: 'feature', name: 'Growth Speed', value: '+24%', icon: Zap, desc: 'Faster crop growth' },
    {
      type: 'recipe',
      name: 'Frost Potato',
      icon: () => <span>🥔❄️</span>,
      desc: 'Breeding recipe unlocked',
    },
    {
      type: 'feature',
      name: 'Perfect Chance',
      value: '+12%',
      icon: Star,
      desc: 'Higher perfect quality',
    },
  ],
  5: [
    {
      type: 'bonus',
      name: 'Coin Multiplier',
      value: '2.5x',
      icon: Coins,
      desc: 'Maximum earnings boost',
    },
    {
      type: 'feature',
      name: 'All Bonuses',
      value: 'MAX',
      icon: Crown,
      desc: 'All bonuses maxed out',
    },
    {
      type: 'recipe',
      name: 'Dragon Pepper',
      icon: () => <span>🌶️🔥</span>,
      desc: 'Legendary recipe unlocked',
    },
    { type: 'feature', name: 'Legend Status', value: '👑', icon: Crown, desc: 'You are a legend!' },
  ],
};

function PrestigePanelComponent({ prestige = 0, totalEarned = 0, onPrestige }) {
  // Current and next prestige data
  const currentPrestige = PRESTIGE_LEVELS[prestige] || PRESTIGE_LEVELS[0];
  const nextPrestige = PRESTIGE_LEVELS[prestige + 1];

  // Calculate progress to next prestige
  const progressToNext = useMemo(() => {
    if (!nextPrestige) return 100;
    const current = totalEarned - (currentPrestige.requirement || 0);
    const needed = nextPrestige.requirement - (currentPrestige.requirement || 0);
    return Math.min(100, Math.max(0, (current / needed) * 100));
  }, [totalEarned, currentPrestige, nextPrestige]);

  // Can prestige?
  const canPrestige = nextPrestige && totalEarned >= nextPrestige.requirement;

  // Calculate current bonuses
  const currentBonuses = useMemo(() => {
    const level = prestige;
    return {
      coinMultiplier: currentPrestige.multiplier,
      growthSpeed: 1 + level * PRESTIGE_BONUSES.growth_speed,
      qualityChance: level * PRESTIGE_BONUSES.quality_chance,
      mutationBoost: level * 0.05,
    };
  }, [prestige, currentPrestige]);

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentPrestige.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-amber-800">{currentPrestige.name}</h3>
                <p className="text-xs text-amber-600">Prestige Level {prestige}</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-amber-300">
              {currentPrestige.multiplier}x
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current bonuses */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <Coins size={16} className="mx-auto text-yellow-500 mb-1" />
              <div className="text-xs text-gray-500">Coin Bonus</div>
              <div className="font-bold text-amber-700">{currentBonuses.coinMultiplier}x</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <Zap size={16} className="mx-auto text-blue-500 mb-1" />
              <div className="text-xs text-gray-500">Growth</div>
              <div className="font-bold text-blue-700">
                +{Math.round((currentBonuses.growthSpeed - 1) * 100)}%
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <Star size={16} className="mx-auto text-purple-500 mb-1" />
              <div className="text-xs text-gray-500">Quality</div>
              <div className="font-bold text-purple-700">
                +{Math.round(currentBonuses.qualityChance * 100)}%
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <Sparkles size={16} className="mx-auto text-pink-500 mb-1" />
              <div className="text-xs text-gray-500">Mutations</div>
              <div className="font-bold text-pink-700">
                +{Math.round(currentBonuses.mutationBoost * 100)}%
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center text-sm text-amber-700 bg-white/40 rounded-lg py-2">
            Total Earned: <span className="font-bold">{totalEarned.toLocaleString()}</span> coins
          </div>
        </CardContent>
      </Card>

      {/* Next Prestige */}
      {nextPrestige ? (
        <Card className={canPrestige ? 'border-2 border-green-300 bg-green-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <TrendingUp size={16} />
              Next Prestige: {nextPrestige.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{totalEarned.toLocaleString()} earned</span>
                <span>{nextPrestige.requirement.toLocaleString()} required</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
            </div>

            {/* Unlocks preview */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Gift size={12} />
                Unlocks at {nextPrestige.name}:
              </div>
              <div className="space-y-1">
                {(PRESTIGE_UNLOCKS[prestige + 1] || []).slice(0, 3).map((unlock, i) => {
                  const Icon = unlock.icon;
                  return (
                    <div
                      key={i}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg text-xs
                        ${canPrestige ? 'bg-green-100' : 'bg-gray-100'}
                      `}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${canPrestige ? 'bg-green-200' : 'bg-gray-200'}`}
                      >
                        {typeof Icon === 'function' ? <Icon /> : <Icon size={14} />}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{unlock.name}</span>
                        {unlock.value && (
                          <span className="text-green-600 ml-1">{unlock.value}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prestige button */}
            {canPrestige ? (
              <Button
                onClick={onPrestige}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold"
              >
                <Crown size={18} className="mr-2" />
                Prestige to {nextPrestige.name}!
              </Button>
            ) : (
              <div className="text-center text-sm text-gray-500">
                <Lock size={14} className="inline mr-1" />
                Earn {(nextPrestige.requirement - totalEarned).toLocaleString()} more coins
              </div>
            )}

            {/* Warning */}
            {canPrestige && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  Prestiging resets your coins to 50, but you keep all bonuses permanently!
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="py-8 text-center">
            <Crown size={48} className="mx-auto text-purple-500 mb-4" />
            <h3 className="text-xl font-bold text-purple-800 mb-2">Maximum Prestige!</h3>
            <p className="text-purple-600 text-sm">
              You've reached the pinnacle of farming mastery. All bonuses are maxed out!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prestige roadmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Star size={16} />
            Prestige Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PRESTIGE_LEVELS.map((level) => {
              const isUnlocked = prestige >= level.level;
              const isCurrent = prestige === level.level;

              return (
                <div
                  key={level.level}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg transition-colors
                    ${isCurrent ? 'bg-amber-100 border border-amber-300' : isUnlocked ? 'bg-green-50' : 'bg-gray-50'}
                  `}
                >
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-lg
                    ${isUnlocked ? 'bg-green-100' : 'bg-gray-200'}
                  `}
                  >
                    {isUnlocked ? level.emoji : <Lock size={14} className="text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {level.name}
                      {isCurrent && <Badge className="text-xs">Current</Badge>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {level.multiplier}x multiplier • {level.requirement.toLocaleString()} coins
                    </div>
                  </div>
                  {isUnlocked && <Check size={16} className="text-green-500" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const PrestigePanel = memo(PrestigePanelComponent);
