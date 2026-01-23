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
    if (typeof window.soundSystem !== 'undefined') {
      window.soundSystem.playPlantSound();
    }

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
      if (result.rarity === 'legendary') {
        if (typeof window.triggerParticleEffect === 'function') {
          window.triggerParticleEffect(window.innerWidth / 2, window.innerHeight / 2, 'levelup');
        }
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              🎰 Mystery Seed Shop
            </h3>
            <p className="text-sm text-purple-600 mt-1">Test your luck! Rare seeds await...</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{lastReveals.length}</div>
            <div className="text-xs text-gray-600">Seeds Revealed</div>
          </div>
        </div>
      </Card>

      {/* Reveal Animation */}
      {isRevealing && revealAnimation && (
        <Card className="p-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-4 border-yellow-400 animate-pulse">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📦</div>
            <div className="text-xl font-bold text-gray-800">Opening...</div>
            <div className="mt-2 text-sm text-gray-600">What will you get?</div>
          </div>
        </Card>
      )}

      {/* Mystery Packs */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4" />
          🎁 Available Packs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(MYSTERY_SEED_PACKS).map((pack) => (
            <Card
              key={pack.id}
              className="p-4 border-2 hover:shadow-lg transition-all"
              style={{
                borderColor: pack.guaranteedRarity ? getRarityColor(pack.guaranteedRarity) : '#9ca3af',
              }}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{pack.emoji}</div>
                <div className="font-semibold text-lg">{pack.name}</div>
                <div className="text-xs text-gray-600 mt-1">{pack.description}</div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-center">
                  <Badge className="bg-yellow-600">{pack.cost}🪙</Badge>
                </div>
                {pack.guaranteedRarity && (
                  <div className="text-center">
                    <Badge
                      style={{
                        backgroundColor: getRarityColor(pack.guaranteedRarity),
                        color: 'white',
                      }}
                    >
                      Min: {pack.guaranteedRarity}
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleBuyPack(pack)}
                disabled={state.coins < pack.cost || isRevealing}
                className="w-full"
                style={{
                  backgroundColor: state.coins >= pack.cost && !isRevealing ? getRarityColor(pack.guaranteedRarity || 'common') : undefined,
                }}
              >
                {state.coins >= pack.cost ? '🎰 Try Luck' : `Need ${pack.cost}🪙`}
              </Button>
            </Card>
          ))}
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

