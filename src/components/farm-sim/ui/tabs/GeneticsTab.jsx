import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';

// Breeding recipes from original system
const BREEDING_RECIPES = {
  super_carrot: {
    name: "Super Carrot",
    emoji: "🥕✨",
    parents: ["carrot", "carrot"],
    growthTime: 45,
    baseValue: 25,
    shopPrice: 40,
    quality: 1.5,
    description: "Enhanced carrot with faster growth and higher value",
    traits: ["fast_growth", "high_value"],
    unlockLevel: 2
  },
  rainbow_corn: {
    name: "Rainbow Corn",
    emoji: "🌽🌈",
    parents: ["corn", "sunflower"],
    growthTime: 70,
    baseValue: 45,
    shopPrice: 65,
    quality: 2.0,
    description: "Colorful hybrid corn with premium market appeal",
    traits: ["premium_quality", "weather_resistant"],
    unlockLevel: 3
  },
  golden_tomato: {
    name: "Golden Tomato",
    emoji: "🍅✨",
    parents: ["tomato", "sunflower"],
    growthTime: 55,
    baseValue: 35,
    shopPrice: 50,
    quality: 1.8,
    description: "Luxurious golden tomato with enhanced flavor",
    traits: ["luxury_appeal", "disease_resistant"],
    unlockLevel: 3
  },
  frost_potato: {
    name: "Frost Potato",
    emoji: "🥔❄️",
    parents: ["potato", "winter_seeds"],
    growthTime: 40,
    baseValue: 20,
    shopPrice: 35,
    quality: 1.3,
    description: "Cold-resistant potato that thrives in winter",
    traits: ["frost_resistant", "winter_bonus"],
    unlockLevel: 4
  },
  dragon_pepper: {
    name: "Dragon Pepper",
    emoji: "🌶️🔥",
    parents: ["bellPepper", "super_carrot"],
    growthTime: 90,
    baseValue: 80,
    shopPrice: 120,
    quality: 3.0,
    description: "Legendary spicy pepper with incredible value",
    traits: ["legendary", "pest_repellent", "high_value"],
    unlockLevel: 5
  }
};

const GeneticsTab = memo(() => {
  const { state, actions } = useGame();
  const [selectedParent1, setSelectedParent1] = useState(null);
  const [selectedParent2, setSelectedParent2] = useState(null);

  // Get available crops for breeding
  const availableCrops = Object.keys(state.inventory).filter(crop =>
    crop in state.inventory && (state.inventory[crop] || 0) >= 2
  );

  const handleBreed = () => {
    if (!selectedParent1 || !selectedParent2) return;

    // Find matching breeding recipe
    const recipeKey = Object.keys(BREEDING_RECIPES).find(key => {
      const recipe = BREEDING_RECIPES[key];
      const parents = recipe.parents;
      const parentCount = parents.length;

      // Handle same parent breeding (e.g., carrot + carrot)
      if (parentCount === 2 && parents[0] === parents[1]) {
        return selectedParent1 === parents[0] && selectedParent2 === parents[0] && recipe.unlockLevel <= state.level;
      }

      // Handle different parent breeding
      return (
        (parents.includes(selectedParent1) && parents.includes(selectedParent2)) &&
        recipe.unlockLevel <= state.level
      );
    });

    if (recipeKey) {
      const recipe = BREEDING_RECIPES[recipeKey];

      // Check if we have enough parent crops
      if ((state.inventory[selectedParent1] || 0) < 2) {
        actions.addNotification({
          message: `Not enough ${selectedParent1}s to breed!`,
          type: 'error'
        });
        return;
      }

      // Update inventory in a single call to avoid conflicts
      const updatedInventory = {
        ...state.inventory,
        [selectedParent1]: (state.inventory[selectedParent1] || 0) - 2,
        [recipeKey]: (state.inventory[recipeKey] || 0) + 1
      };
      actions.updateInventory(updatedInventory);

      // Grant XP for successful breeding
      actions.grantXP(25, 'genetics_breed', { hybridId: recipeKey });

      actions.addNotification({
        message: `Successfully bred ${recipe.name}!`,
        type: 'success'
      });

      // Reset selection
      setSelectedParent1(null);
      setSelectedParent2(null);
    } else {
      actions.addNotification({
        message: 'No breeding recipe found for these crops!',
        type: 'warning'
      });
    }
  };

  const getRarityColor = (quality) => {
    if (quality >= 3.0) return 'border-purple-500 text-purple-700';
    if (quality >= 2.0) return 'border-blue-500 text-blue-700';
    if (quality >= 1.5) return 'border-green-500 text-green-700';
    return 'border-gray-500 text-gray-700';
  };

  const getRarityLabel = (quality) => {
    if (quality >= 3.0) return 'Legendary';
    if (quality >= 2.0) return 'Rare';
    if (quality >= 1.5) return 'Uncommon';
    return 'Common';
  };

  return (
    <div className="space-y-4">
      {/* Lab Status - Premium Styling */}
      <Card className="p-5 bg-gradient-to-br from-purple-50/95 via-indigo-50/90 to-blue-50/95 backdrop-blur-sm border-purple-200/60 shadow-lg shadow-purple-200/30 relative overflow-hidden">
        {/* DNA Helix Decoration */}
        <div className="absolute -right-4 top-0 bottom-0 w-24 opacity-10">
          <div className="text-6xl animate-pulse">🧬</div>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              🧬 Genetics Laboratory
            </h3>
            <p className="text-sm text-purple-600/80 font-medium mt-1">
              Lab Level {Math.floor(state.level / 2) + 1} • <span className="text-indigo-600">{state.xp} XP</span>
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-300/50 shadow-sm px-3 py-1.5 font-semibold">
            ✨ {Object.keys(state.genetics?.discoveredHybrids || {}).length} Hybrids
          </Badge>
        </div>
      </Card>

      <Tabs defaultValue="breeding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breeding">🧪 Breeding</TabsTrigger>
          <TabsTrigger value="hybrids">🌱 Hybrids</TabsTrigger>
          <TabsTrigger value="traits">⚡ Traits</TabsTrigger>
        </TabsList>

        {/* Breeding Tab */}
        <TabsContent value="breeding" className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-sm shadow-lg border-slate-200/60">
            <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              🧪 Select Parent Crops
            </h4>

            {/* Parent Selection Slots - Premium */}
            <div className="flex justify-center gap-6 sm:gap-10 mb-6 items-center">
              {/* Parent 1 Slot */}
              <div
                className={`
                  w-28 h-28 sm:w-36 sm:h-36 border-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer 
                  transition-all duration-300 ease-out relative overflow-hidden
                  ${selectedParent1
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-200/50 scale-105'
                    : 'border-dashed border-slate-300 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-md hover:scale-[1.02]'
                  }
                `}
                onClick={() => !selectedParent1 && document.getElementById('parent1-select')?.click()}
              >
                {/* Glow effect when selected */}
                {selectedParent1 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 animate-pulse" />
                )}

                {selectedParent1 ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-5xl mb-2 drop-shadow-sm">🥕</div>
                    <div className="font-bold text-sm capitalize text-purple-800">{selectedParent1}</div>
                    <Button size="xs" variant="ghost" className="mt-2 h-6 text-xs text-red-500 hover:text-red-700 hover:bg-red-50/80" onClick={(e) => { e.stopPropagation(); setSelectedParent1(null); }}>
                      ✕ Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-slate-400 text-3xl mb-1 font-light">+</div>
                    <div className="text-slate-500 text-xs font-semibold">Parent 1</div>
                  </>
                )}
              </div>

              {/* Plus Icon */}
              <div className="text-3xl text-purple-300 font-black">×</div>

              {/* Parent 2 Slot */}
              <div
                className={`
                  w-28 h-28 sm:w-36 sm:h-36 border-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer 
                  transition-all duration-300 ease-out relative overflow-hidden
                  ${selectedParent2
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-200/50 scale-105'
                    : 'border-dashed border-slate-300 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-md hover:scale-[1.02]'
                  }
                `}
                onClick={() => !selectedParent2 && document.getElementById('parent2-select')?.click()}
              >
                {/* Glow effect when selected */}
                {selectedParent2 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 animate-pulse" />
                )}

                {selectedParent2 ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-5xl mb-2 drop-shadow-sm">🌽</div>
                    <div className="font-bold text-sm capitalize text-purple-800">{selectedParent2}</div>
                    <Button size="xs" variant="ghost" className="mt-2 h-6 text-xs text-red-500 hover:text-red-700 hover:bg-red-50/80" onClick={(e) => { e.stopPropagation(); setSelectedParent2(null); }}>
                      ✕ Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-slate-400 text-3xl mb-1 font-light">+</div>
                    <div className="text-slate-500 text-xs font-semibold">Parent 2</div>
                  </>
                )}
              </div>
            </div>

            {/* Crop Selection Grid - Premium */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/80 to-indigo-50/60 border border-purple-100">
                <h5 className="text-xs font-bold text-purple-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Parent 1 Crops
                </h5>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {availableCrops.map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedParent1(crop)}
                      disabled={selectedParent2 === crop && (state.inventory[crop] || 0) < 2}
                      className={`
                        p-2.5 rounded-xl text-left transition-all duration-200 border-2
                        ${selectedParent1 === crop
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-300/40 scale-[1.02]'
                          : 'bg-white/80 hover:bg-purple-50 border-slate-200 hover:border-purple-300 hover:shadow-md'
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌱</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm capitalize truncate ${selectedParent1 === crop ? 'text-white' : 'text-slate-800'}`}>
                            {crop}
                          </div>
                          <div className={`text-xs ${selectedParent1 === crop ? 'text-purple-200' : 'text-slate-500'}`}>
                            ×{state.inventory[crop] || 0} available
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border border-indigo-100">
                <h5 className="text-xs font-bold text-indigo-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Parent 2 Crops
                </h5>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {availableCrops.map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedParent2(crop)}
                      disabled={selectedParent1 === crop && (state.inventory[crop] || 0) < 2}
                      className={`
                        p-2.5 rounded-xl text-left transition-all duration-200 border-2
                        ${selectedParent2 === crop
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-indigo-400 shadow-lg shadow-indigo-300/40 scale-[1.02]'
                          : 'bg-white/80 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌱</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm capitalize truncate ${selectedParent2 === crop ? 'text-white' : 'text-slate-800'}`}>
                            {crop}
                          </div>
                          <div className={`text-xs ${selectedParent2 === crop ? 'text-indigo-200' : 'text-slate-500'}`}>
                            ×{state.inventory[crop] || 0} available
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Breeding Preview - Premium */}
            {selectedParent1 && selectedParent2 && (
              <Card className="p-4 bg-gradient-to-br from-amber-50/95 via-yellow-50/90 to-orange-50/80 border-amber-200/70 shadow-lg shadow-amber-200/30 relative overflow-hidden">
                {/* Sparkle decoration */}
                <div className="absolute top-2 right-3 text-2xl opacity-30 animate-pulse">✨</div>

                <div className="text-center relative z-10">
                  <div className="text-lg mb-3 font-semibold text-amber-800 flex items-center justify-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <span className="capitalize">{selectedParent1}</span>
                    <span className="text-amber-400 font-black">×</span>
                    <span className="capitalize">{selectedParent2}</span>
                    <span className="text-2xl">🌱</span>
                  </div>

                  {(() => {
                    const recipeKey = Object.keys(BREEDING_RECIPES).find(key => {
                      const recipe = BREEDING_RECIPES[key];
                      return recipe.parents.includes(selectedParent1) &&
                        recipe.parents.includes(selectedParent2) &&
                        recipe.unlockLevel <= state.level;
                    });

                    if (recipeKey) {
                      const recipe = BREEDING_RECIPES[recipeKey];
                      return (
                        <div className="space-y-3">
                          <div className="text-4xl mb-2 drop-shadow-sm">{recipe.emoji}</div>
                          <div className="font-bold text-lg text-amber-900">{recipe.name}</div>
                          <div className="text-sm text-amber-700/80">{recipe.description}</div>
                          <div className="flex justify-center gap-2 flex-wrap">
                            {recipe.traits.map(trait => (
                              <Badge key={trait} className="bg-amber-100 text-amber-800 border-amber-300/50 text-xs px-2 py-0.5">
                                ⚡ {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            onClick={handleBreed}
                            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-300/40 py-5"
                          >
                            🧬 Breed Hybrid (+25 XP)
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="py-4 text-amber-700/70">
                          <div className="text-3xl mb-2 opacity-60">❓</div>
                          <div className="font-semibold">Unknown Combination</div>
                          <div className="text-sm">Try different crops or level up!</div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </Card>
            )}
          </Card>
        </TabsContent>

        {/* Hybrids Tab */}
        <TabsContent value="hybrids" className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-white/95 to-emerald-50/30 backdrop-blur-sm shadow-lg border-emerald-100">
            <h4 className="font-bold text-lg text-emerald-800 mb-4 flex items-center gap-2">
              🌱 Discovered Hybrids
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {Object.entries(BREEDING_RECIPES).map(([key, recipe]) => {
                const owned = state.inventory[key] || 0;
                const unlocked = recipe.unlockLevel <= state.level;

                return (
                  <Card
                    key={key}
                    className={`
                      p-4 transition-all duration-300 relative overflow-hidden
                      ${unlocked
                        ? 'bg-gradient-to-br from-white to-slate-50/80 shadow-md hover:shadow-lg hover:scale-[1.01] border-slate-200'
                        : 'bg-slate-100/60 opacity-50 border-slate-200'
                      }
                      ${recipe.quality >= 3.0 ? 'ring-2 ring-purple-300/50' : ''}
                      ${recipe.quality >= 2.0 && recipe.quality < 3.0 ? 'ring-1 ring-blue-300/40' : ''}
                    `}
                  >
                    {/* Rarity glow for legendary */}
                    {recipe.quality >= 3.0 && unlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 animate-pulse" />
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl ${unlocked ? 'drop-shadow-sm' : 'grayscale opacity-60'}`}>
                          {recipe.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{recipe.name}</div>
                          <div className="text-sm text-slate-600">{recipe.description}</div>
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {recipe.traits.map(trait => (
                              <Badge
                                key={trait}
                                className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200/50 px-2 py-0.5"
                              >
                                ⚡ {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <Badge
                          className={`
                            font-semibold px-2.5 py-1
                            ${recipe.quality >= 3.0
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-300/40'
                              : recipe.quality >= 2.0
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-300/30'
                                : recipe.quality >= 1.5
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
                                  : 'bg-slate-200 text-slate-700'
                            }
                          `}
                        >
                          {getRarityLabel(recipe.quality)}
                        </Badge>
                        <div className="text-sm mt-1">
                          {unlocked ? (
                            <>
                              <div className="font-medium text-slate-700">Owned: {owned}</div>
                              <div className="font-semibold text-emerald-600">💰 {recipe.baseValue}</div>
                            </>
                          ) : (
                            <div className="text-slate-500 text-xs">🔒 Level {recipe.unlockLevel}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Traits Tab */}
        <TabsContent value="traits" className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-white/95 to-yellow-50/30 backdrop-blur-sm shadow-lg border-yellow-100">
            <h4 className="font-bold text-lg text-yellow-800 mb-4 flex items-center gap-2">
              ⚡ Genetic Traits Guide
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Fast Growth', icon: '🚀', effect: '25% faster growth', color: 'from-green-400 to-emerald-500' },
                { name: 'High Value', icon: '💎', effect: '50% higher price', color: 'from-blue-400 to-indigo-500' },
                { name: 'Disease Resistant', icon: '🛡️', effect: '75% less disease risk', color: 'from-purple-400 to-violet-500' },
                { name: 'Weather Resistant', icon: '☀️', effect: 'Immune to weather', color: 'from-orange-400 to-amber-500' },
                { name: 'Pest Repellent', icon: '🐛', effect: 'Natural protection', color: 'from-red-400 to-rose-500' },
                { name: 'Premium Quality', icon: '⭐', effect: 'Higher quality grades', color: 'from-yellow-400 to-orange-400' },
              ].map(trait => (
                <div
                  key={trait.name}
                  className="p-3 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trait.color} flex items-center justify-center text-xl mb-2 shadow-md`}>
                    {trait.icon}
                  </div>
                  <div className="font-bold text-sm text-slate-800">{trait.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{trait.effect}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

GeneticsTab.displayName = 'GeneticsTab';
export default GeneticsTab;
