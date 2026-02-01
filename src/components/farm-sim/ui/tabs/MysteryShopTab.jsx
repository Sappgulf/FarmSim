import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Sparkles, Gift, TrendingUp } from 'lucide-react';
import { MYSTERY_SEED_PACKS, rollMysterySeed, rollMysterySeedWithGuarantee, getRarityColor } from '../../constants/mysterySeedData';
import { CROP_DATA } from '../../constants/cropData';

/**
 * Mystery Shop Tab - Gambling mechanics with mystery seed packs
 */
const MysteryShopTab = memo(() => {
  const { state, actions } = useGame();
  const [lastReveals, setLastReveals] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealAnimation, setRevealAnimation] = useState(null);

  const handleBuyPack = (pack) => {
    if (state.coins < pack.cost) {
      actions.addNotification({
        message: `Not enough coins! Need ${pack.cost}🪙`,
        type: 'error',
      });
      return;
    }

    // Deduct coins
    actions.setCoins(state.coins - pack.cost);

    // Roll the mystery seed
    const result = pack.guaranteedRarity
      ? rollMysterySeedWithGuarantee(pack.guaranteedRarity)
      : rollMysterySeed();

    const crop = CROP_DATA[result.cropId];

    // Animate reveal
    setIsRevealing(true);
    setRevealAnimation(result);

    // Play sound
    actions.playSound('playPlantSound');

    setTimeout(() => {
      // Add to inventory
      const updatedInventory = {
        ...state.inventory,
        [result.cropId]: (state.inventory[result.cropId] || 0) + 1,
      };
      actions.updateInventory(updatedInventory);

      // Show notification
      actions.addNotification({
        message: `${result.rarityData.emoji} Got ${crop.emoji} ${crop.name} (${result.rarityData.name})!`,
        type: 'success',
      });

      // Add to recent reveals
      setLastReveals(prev => [
        {
          ...result,
          crop,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);

      setIsRevealing(false);
      setRevealAnimation(null);

      // Level up for legendary drops
      if (result.rarity === 'legendary') actions.triggerParticles(window.innerWidth / 2, window.innerHeight / 2, 'levelup');

    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-800 to-indigo-900 text-white relative overflow-hidden shadow-xl border-purple-700">
        <div className="absolute top-0 right-0 p-8 opacity-20 text-9xl pointer-events-none animate-pulse-slow">✨</div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 filter drop-shadow">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              Mystery Seed Shop
            </h3>
            <p className="text-purple-200 mt-2 font-medium">Rare and legendary seeds await the bold!</p>
          </div>
          <div className="text-right bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-3xl font-bold text-yellow-300">{lastReveals.length}</div>
            <div className="text-xs text-purple-200 uppercase tracking-widest">Opened</div>
          </div>
        </div>
      </Card>

      {/* Reveal Animation Area */}
      {isRevealing && revealAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="p-12 bg-gradient-to-br from-indigo-900 to-purple-900 border-4 border-yellow-400 shadow-2xl flex flex-col items-center justify-center gap-6 max-w-md w-full mx-4 relative overflow-hidden">
            {/* Rays background */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_20deg,#fbbf24_20deg_40deg,transparent_40deg_60deg,#fbbf24_60deg_80deg,transparent_80deg_100deg,#fbbf24_100deg_120deg,transparent_120deg_140deg,#fbbf24_140deg_160deg,transparent_160deg_180deg,#fbbf24_180deg_200deg,transparent_200deg_220deg,#fbbf24_220deg_240deg,transparent_240deg_260deg,#fbbf24_260deg_280deg,transparent_280deg_300deg,#fbbf24_300deg_320deg,transparent_320deg_340deg,#fbbf24_340deg_360deg)] opacity-10 animate-spin-slow"></div>

            <div className="text-8xl animate-bounce filter drop-shadow-2xl">📦</div>
            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">Revealing...</h2>
              <p className="text-purple-200">Fingers crossed for Legendary!</p>
            </div>
          </Card>
        </div>
      )}

      {/* Mystery Packs */}
      <Card className="p-6 border-none bg-transparent shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(MYSTERY_SEED_PACKS).map((pack) => {
            const isLegendary = pack.id.includes('legendary') || pack.guaranteedRarity === 'rare';
            const borderColor = pack.guaranteedRarity ? getRarityColor(pack.guaranteedRarity) : '#cbd5e1';

            return (
              <Card
                key={pack.id}
                className={`
                 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group
                 ${isLegendary ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-yellow-500/50' : 'bg-white hover:border-purple-300'}
              `}
                style={{
                  borderWidth: '2px',
                  borderColor: isLegendary ? '#fbbf24' : borderColor,
                }}
              >
                {/* Shine effect for premium cards */}
                {isLegendary && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                )}

                <div className="p-5 flex flex-col h-full bg-opacity-90">
                  <div className="text-center mb-4 flex-grow">
                    <div className={`text-5xl mb-3 transform transition-transform group-hover:scale-110 drop-shadow-md`}>{pack.emoji}</div>
                    <div className={`font-bold text-xl mb-1 ${isLegendary ? 'text-yellow-400' : 'text-gray-800'}`}>{pack.name}</div>
                    <div className={`text-xs ${isLegendary ? 'text-gray-400' : 'text-gray-500'}`}>{pack.description}</div>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {pack.guaranteedRarity && (
                      <div className="flex justify-center">
                        <Badge
                          className="px-3 py-1 text-xs uppercase tracking-wider font-bold shadow-sm"
                          style={{
                            backgroundColor: getRarityColor(pack.guaranteedRarity),
                            color: 'white',
                          }}
                        >
                          Min: {pack.guaranteedRarity}
                        </Badge>
                      </div>
                    )}

                    <Button
                      onClick={() => handleBuyPack(pack)}
                      disabled={state.coins < pack.cost || isRevealing}
                      className={`
                        w-full font-bold h-10 transition-all shadow-md
                        ${state.coins >= pack.cost
                          ? isLegendary
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white border-0'
                            : 'bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-50'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }
                    `}
                    >
                      {state.coins >= pack.cost ? (
                        <span className="flex items-center gap-2">
                          {isLegendary ? '🎰 High Stakes' : '🎲 Open Pack'} <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full">{pack.cost}🪙</span>
                        </span>
                      ) : `Need ${pack.cost}🪙`}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </Card>

      {/* Drop Rate Information */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">📊 Drop Rates</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2">
              ⚪ Common
            </span>
            <Badge variant="outline">60%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2">
              🟢 Uncommon
            </span>
            <Badge variant="outline">25%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2">
              🔵 Rare
            </span>
            <Badge variant="outline">10%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2">
              🟣 Epic
            </span>
            <Badge variant="outline">4%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2">
              🟡 Legendary
            </span>
            <Badge variant="outline">1%</Badge>
          </div>
        </div>
      </Card>

      {/* Recent Reveals */}
      {lastReveals.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            🎉 Recent Reveals
          </h4>
          <div className="space-y-2">
            {lastReveals.slice(0, 5).map((reveal, idx) => (
              <div
                key={`${reveal.cropId}-${reveal.timestamp}`}
                className="flex items-center justify-between p-2 rounded"
                style={{
                  backgroundColor: `${getRarityColor(reveal.rarity)}20`,
                  borderLeft: `4px solid ${getRarityColor(reveal.rarity)}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{reveal.crop.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{reveal.crop.name}</div>
                    <div className="text-xs text-gray-600">
                      {reveal.rarityData.emoji} {reveal.rarityData.name}
                    </div>
                  </div>
                </div>
                {idx === 0 && (
                  <Badge className="bg-green-600 animate-pulse">NEW</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-800">💡 Pro Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Premium packs guarantee better odds!</li>
          <li>Legendary seeds are incredibly rare (1%)</li>
          <li>All seeds go directly to your inventory</li>
          <li>Higher rarity = better crop stats</li>
        </ul>
      </Card>
    </div>
  );
});

MysteryShopTab.displayName = 'MysteryShopTab';
export default MysteryShopTab;

