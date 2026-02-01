import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { CROP_DATA } from '../../constants/cropData';

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
      <Card className="p-6 bg-gradient-to-br from-purple-100/90 via-indigo-50/95 to-blue-100/90 backdrop-blur-xl border-purple-200/60 shadow-xl shadow-purple-200/40 relative overflow-hidden">
        {/* DNA Helix Decoration - Enhanced */}
        <div className="absolute -right-6 -top-6 w-32 h-32 opacity-20 lab-icon-float">
          <div className="text-8xl">🧬</div>
        </div>
        <div className="absolute -left-4 -bottom-4 w-24 h-24 opacity-10 rotate-45">
          <div className="text-6xl">🧪</div>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-purple-800 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
              🧬 Genetics Laboratory
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 border-purple-200">
                Lab Level {Math.floor(state.level / 2) + 1}
              </Badge>
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                {state.xp} XP
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-purple-600 drop-shadow-sm">
              {Object.keys(state.genetics?.discoveredHybrids || {}).length}
            </div>
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Hybrids Found</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="breeding" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200/60 transition-all hover:bg-white/80">
          <TabsTrigger value="breeding" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">🧪 Breeding</TabsTrigger>
          <TabsTrigger value="hybrids" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">🌱 Hybrids</TabsTrigger>
          <TabsTrigger value="traits" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">⚡ Traits</TabsTrigger>
        </TabsList>

        {/* Breeding Tab Content */}
        <TabsContent value="breeding" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="p-6 bg-white/80 backdrop-blur-md shadow-2xl border-slate-200/50 rounded-3xl relative overflow-hidden">
            <h4 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-purple-100 rounded-lg">🧪</span> Select Parent Crops
            </h4>

            {/* Parent Selection Slots - Premium DNA Theme */}
            <div className="flex justify-center gap-4 sm:gap-12 mb-8 items-center">
              {/* Parent 1 Slot */}
              <div
                className={`
                  w-24 h-24 sm:w-32 sm:h-32 border-4 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer 
                  transition-all duration-500 ease-out relative overflow-hidden
                  ${selectedParent1
                    ? 'border-purple-500 bg-gradient-to-bl from-purple-50 to-indigo-50 shadow-2xl shadow-purple-300 lab-slot-active'
                    : 'border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-100/30 hover:scale-105 hover:rotate-2'
                  }
                `}
                onClick={() => !selectedParent1 && document.getElementById('parent1-select')?.click()}
              >
                {selectedParent1 ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-5xl mb-1 animate-bounce-subtle drop-shadow-md">
                      {CROP_DATA[selectedParent1]?.emoji || '🌱'}
                    </div>
                    <div className="font-black text-[10px] uppercase tracking-wider text-purple-700">{selectedParent1}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedParent1(null); }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-md rounded-full text-red-500 flex items-center justify-center hover:bg-red-50 hover:scale-110 active:scale-95 z-20"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-slate-300 text-4xl mb-1 font-thin">+</div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">DNA A</div>
                  </>
                )}
              </div>

              {/* Fusion Icon */}
              <div className="flex flex-col items-center">
                <div className="text-3xl text-purple-400 animate-spin-slow">⚛️</div>
                <div className="h-8 w-px bg-gradient-to-b from-purple-200 to-transparent my-1" />
              </div>

              {/* Parent 2 Slot */}
              <div
                className={`
                  w-24 h-24 sm:w-32 sm:h-32 border-4 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer 
                  transition-all duration-500 ease-out relative overflow-hidden
                  ${selectedParent2
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-2xl shadow-indigo-300 lab-slot-active'
                    : 'border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-100/30 hover:scale-105 hover:-rotate-2'
                  }
                `}
                onClick={() => !selectedParent2 && document.getElementById('parent2-select')?.click()}
              >
                {selectedParent2 ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-5xl mb-1 animate-bounce-subtle drop-shadow-md">
                      {CROP_DATA[selectedParent2]?.emoji || '🌱'}
                    </div>
                    <div className="font-black text-[10px] uppercase tracking-wider text-indigo-700">{selectedParent2}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedParent2(null); }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-md rounded-full text-red-500 flex items-center justify-center hover:bg-red-50 hover:scale-110 active:scale-95 z-20"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-slate-300 text-4xl mb-1 font-thin">+</div>
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">DNA B</div>
                  </>
                )}
              </div>
            </div>

            {/* Selection Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Parent 1 Crops Selection */}
              <div className="p-4 rounded-3xl bg-slate-50/80 border border-slate-100 shadow-inner">
                <div className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" /> Source Nucleotide A
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {availableCrops.map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedParent1(crop)}
                      className={`
                        p-3 rounded-2xl text-left transition-all duration-300 border-2 flex items-center gap-3 relative overflow-hidden
                        ${selectedParent1 === crop
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-400 shadow-xl scale-[1.03] z-10'
                          : 'bg-white hover:bg-purple-50 border-slate-100 hover:border-purple-200 hover:shadow-lg'
                        }
                      `}
                    >
                      <span className="text-2xl">{CROP_DATA[crop]?.emoji || '🌱'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm capitalize truncate">{crop}</div>
                        <div className={`text-[10px] font-bold ${selectedParent1 === crop ? 'text-purple-200' : 'text-slate-400'}`}>
                          {state.inventory[crop] || 0} STOCK
                        </div>
                      </div>
                      {selectedParent1 === crop && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-full flex items-center justify-center">
                          <span className="text-[10px]">✨</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parent 2 Crops Selection */}
              <div className="p-4 rounded-3xl bg-slate-50/80 border border-slate-100 shadow-inner">
                <div className="text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" /> Source Nucleotide B
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {availableCrops.map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedParent2(crop)}
                      className={`
                        p-3 rounded-2xl text-left transition-all duration-300 border-2 flex items-center gap-3 relative overflow-hidden
                        ${selectedParent2 === crop
                          ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-indigo-400 shadow-xl scale-[1.03] z-10'
                          : 'bg-white hover:bg-indigo-50 border-slate-100 hover:border-indigo-200 hover:shadow-lg'
                        }
                      `}
                    >
                      <span className="text-2xl">{CROP_DATA[crop]?.emoji || '🌱'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm capitalize truncate">{crop}</div>
                        <div className={`text-[10px] font-bold ${selectedParent2 === crop ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {state.inventory[crop] || 0} STOCK
                        </div>
                      </div>
                      {selectedParent2 === crop && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-full flex items-center justify-center">
                          <span className="text-[10px]">✨</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FUSION PREVIEW - Premium Event View */}
            {selectedParent1 && selectedParent2 && (
              <Card className="p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-4 border-purple-400/50 shadow-[0_20px_60px_rgba(147,51,234,0.4)] relative overflow-hidden group">
                {/* Animated energy lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.4)_0%,transparent_70%)] animate-pulse" />
                </div>

                <div className="text-center relative z-10">
                  {(() => {
                    const recipeKey = Object.keys(BREEDING_RECIPES).find(key => {
                      const recipe = BREEDING_RECIPES[key];
                      const parents = recipe.parents;
                      if (parents[0] === parents[1]) return selectedParent1 === parents[0] && selectedParent2 === parents[0] && recipe.unlockLevel <= state.level;
                      return (parents.includes(selectedParent1) && parents.includes(selectedParent2)) && recipe.unlockLevel <= state.level;
                    });

                    if (recipeKey) {
                      const recipe = BREEDING_RECIPES[recipeKey];
                      return (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                          <div className="flex items-center justify-center gap-6 mb-2">
                            <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-bounce-subtle">{CROP_DATA[selectedParent1]?.emoji}</div>
                            <div className="text-3xl text-purple-400 font-black animate-pulse">⚡</div>
                            <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-bounce-subtle" style={{ animationDelay: '0.2s' }}>{CROP_DATA[selectedParent2]?.emoji}</div>
                          </div>

                          <div className="relative inline-block">
                            <div className="text-8xl mb-4 animate-dna-pulse filter drop-shadow-[0_0_25px_rgba(167,139,250,0.6)]">{recipe.emoji}</div>
                            <Badge className="absolute -bottom-2 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-none font-black px-4 py-1.5 shadow-lg transform rotate-6">
                              NEW HYBRID
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="text-3xl font-black text-white tracking-tight uppercase tracking-widest">{recipe.name}</div>
                            <div className="text-indigo-200/80 font-medium px-4">{recipe.description}</div>
                          </div>

                          <div className="flex justify-center gap-3 flex-wrap">
                            {recipe.traits.map(trait => (
                              <Badge key={trait} className="bg-white/10 text-purple-200 border-white/20 backdrop-blur-sm text-xs px-3 py-1 font-bold uppercase tracking-widest">
                                ✴️ {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>

                          <Button
                            onClick={handleBreed}
                            className="w-full max-w-sm h-16 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 hover:from-purple-400 hover:via-indigo-400 hover:to-blue-500 text-white font-black text-xl rounded-2xl shadow-[0_10px_40px_rgba(147,51,234,0.5)] transform transition-all duration-300 hover:scale-105 active:scale-95 group-hover:shadow-[0_20px_60px_rgba(147,51,234,0.6)]"
                          >
                            <span className="flex items-center gap-3">
                              🔬 INITIATE FUSION
                              <span className="text-sm opacity-60 font-medium tracking-normal">+25 XP</span>
                            </span>
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="py-10 text-indigo-200/60 animate-in fade-in duration-500">
                          <div className="text-6xl mb-4 opacity-40">❔</div>
                          <div className="text-2xl font-black grayscale opacity-50 uppercase tracking-widest">Incompatible Sequence</div>
                          <div className="text-sm font-medium mt-2">Try different DNA samples or elevate Lab Level</div>
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
        <TabsContent value="hybrids" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="p-6 bg-white/80 backdrop-blur-md shadow-2xl border-emerald-100 rounded-3xl">
            <h4 className="font-bold text-xl text-emerald-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-emerald-100 rounded-lg">🌱</span> Discovered Hybrids
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {Object.entries(BREEDING_RECIPES).map(([key, recipe]) => {
                const owned = state.inventory[key] || 0;
                const unlocked = recipe.unlockLevel <= state.level;

                return (
                  <Card
                    key={key}
                    className={`
                      p-5 transition-all duration-300 relative overflow-hidden group/hybrid
                      ${unlocked
                        ? 'bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-xl hover:scale-[1.02] border-slate-200 rounded-2xl'
                        : 'bg-slate-50 opacity-40 border-slate-200 border-dashed rounded-2xl'
                      }
                      ${recipe.quality >= 3.0 ? 'ring-2 ring-purple-400/30' : ''}
                      ${recipe.quality >= 2.0 && recipe.quality < 3.0 ? 'ring-2 ring-blue-400/20' : ''}
                    `}
                  >
                    {/* Rarity glow for legendary */}
                    {recipe.quality >= 3.0 && unlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10 animate-pulse opacity-0 group-hover/hybrid:opacity-100 transition-opacity" />
                    )}

                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`text-5xl transition-transform duration-300 group-hover/hybrid:scale-110 group-hover/hybrid:rotate-3 ${unlocked ? 'drop-shadow-md' : 'grayscale opacity-60'}`}>
                          {recipe.emoji}
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-slate-800 text-lg uppercase tracking-tight">{recipe.name}</div>
                          <div className="text-sm text-slate-500 font-medium">{recipe.description}</div>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {recipe.traits.map(trait => (
                              <Badge
                                key={trait}
                                className="text-[10px] bg-slate-100 text-slate-700 border-slate-200/60 px-2 py-0.5 font-bold uppercase tracking-widest"
                              >
                                {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <Badge
                          className={`
                            font-black px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] shadow-lg
                            ${recipe.quality >= 3.0
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-purple-300/40'
                              : recipe.quality >= 2.0
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-300/30'
                                : recipe.quality >= 1.5
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-300/30'
                                  : 'bg-slate-300 text-white shadow-slate-200'
                            }
                          `}
                        >
                          {getRarityLabel(recipe.quality)}
                        </Badge>
                        <div className="text-sm mt-1">
                          {unlocked ? (
                            <div className="flex flex-col items-end">
                              <div className="font-black text-slate-800 text-[11px] uppercase tracking-wide">Stock {owned}</div>
                              <div className="font-black text-emerald-600 flex items-center gap-1 text-base">
                                <span className="text-lg">💰</span> {recipe.baseValue}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200 text-[10px] font-bold">
                              LOCK LV. {recipe.unlockLevel}
                            </Badge>
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
        <TabsContent value="traits" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="p-6 bg-white/80 backdrop-blur-md shadow-2xl border-yellow-100 rounded-3xl overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

            <h4 className="font-black text-xl text-yellow-800 mb-6 flex items-center gap-2 relative z-10">
              <span className="p-2 bg-yellow-100 rounded-lg">⚡</span> Genetic Traits Guide
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[
                { name: 'Fast Growth', icon: '🚀', effect: '25% faster growth', color: 'from-green-400 to-emerald-600', description: 'Metabolic acceleration allows for rapid harvest cycles.' },
                { name: 'High Value', icon: '💎', effect: '50% higher price', color: 'from-blue-400 to-indigo-600', description: 'Premium visual appeal increases market demand significantly.' },
                { name: 'Resistance', icon: '🛡️', effect: '75% less disease risk', color: 'from-purple-400 to-violet-600', description: 'Hardened cellular walls prevent common agricultural blights.' },
                { name: 'Weather Frost', icon: '❄️', effect: 'Winter bonus', color: 'from-cyan-400 to-blue-600', description: 'Thrives in freezing temperatures where others wither.' },
                { name: 'Pest Guard', icon: '🦇', effect: 'No insect damage', color: 'from-red-400 to-rose-600', description: 'Natural pheromones deter unwanted garden visitors.' },
                { name: 'Legendary', icon: '👑', effect: 'Extreme stats', color: 'from-amber-400 to-orange-600', description: 'The pinnacle of genetic engineering. Perfection.' },
              ].map(trait => (
                <Card
                  key={trait.name}
                  className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl group/trait"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${trait.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover/trait:rotate-6 transition-transform`}>
                    {trait.icon}
                  </div>
                  <div className="font-black text-slate-800 text-base uppercase tracking-tight">{trait.name}</div>
                  <Badge variant="secondary" className="mt-1 mb-3 bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">{trait.effect}</Badge>
                  <div className="text-xs text-slate-500 font-medium leading-relaxed">{trait.description}</div>
                </Card>
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
