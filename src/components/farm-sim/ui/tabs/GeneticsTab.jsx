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
      {/* Lab Status */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-purple-800">🧬 Genetics Laboratory</h3>
            <p className="text-sm text-purple-600">Level {Math.floor(state.level / 2) + 1} • XP: {state.xp}</p>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            {Object.keys(state.genetics?.discoveredHybrids || {}).length} Hybrids Discovered
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
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Select Parent Crops</h4>

            {/* Parent Selection Slots */}
            <div className="flex justify-center gap-8 mb-6 items-center">
              {/* Parent 1 Slot */}
              <div
                className={`
                        w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                        ${selectedParent1 ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'}
                    `}
                onClick={() => !selectedParent1 && document.getElementById('parent1-select')?.click()}
              >
                {selectedParent1 ? (
                  <>
                    <div className="text-4xl mb-2">🥕</div>    {/* Dynamic emoji would be better if mapped */}
                    <div className="font-semibold text-sm capitalize">{selectedParent1}</div>
                    <Button size="xs" variant="ghost" className="mt-1 h-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setSelectedParent1(null); }}>
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 text-2xl mb-1">+</div>
                    <div className="text-gray-500 text-xs font-medium">Select Parent 1</div>
                  </>
                )}
              </div>

              <div className="text-2xl text-gray-400 font-bold">+</div>

              {/* Parent 2 Slot */}
              <div
                className={`
                        w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                        ${selectedParent2 ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'}
                    `}
                onClick={() => !selectedParent2 && document.getElementById('parent2-select')?.click()}
              >
                {selectedParent2 ? (
                  <>
                    <div className="text-4xl mb-2">🌽</div> {/* Dynamic emoji placeholder */}
                    <div className="font-semibold text-sm capitalize">{selectedParent2}</div>
                    <Button size="xs" variant="ghost" className="mt-1 h-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setSelectedParent2(null); }}>
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-gray-400 text-2xl mb-1">+</div>
                    <div className="text-gray-500 text-xs font-medium">Select Parent 2</div>
                  </>
                )}
              </div>
            </div>

            {/* Hidden Selectors (Visible controls below) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Available Crops (Parent 1)</h5>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableCrops.map(crop => (
                    <Button
                      key={crop}
                      variant={selectedParent1 === crop ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedParent1(crop)}
                      className={`text-xs justify-start px-2 ${selectedParent1 === crop ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      disabled={selectedParent2 === crop && (state.inventory[crop] || 0) < 2} // Prevent selecting same single crop twice if only 1 owned
                    >
                      <span className="mr-1">{crop === 'carrot' ? '🥕' : '📦'}</span> {/* Simplified emoji logic for now */}
                      {crop} <span className="ml-auto opacity-70">x{state.inventory[crop] || 0}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Available Crops (Parent 2)</h5>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableCrops.map(crop => (
                    <Button
                      key={crop}
                      variant={selectedParent2 === crop ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedParent2(crop)}
                      className={`text-xs justify-start px-2 ${selectedParent2 === crop ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      disabled={selectedParent1 === crop && (state.inventory[crop] || 0) < 2}
                    >
                      <span className="mr-1">{crop === 'carrot' ? '🥕' : '📦'}</span>
                      {crop} <span className="ml-auto opacity-70">x{state.inventory[crop] || 0}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Breeding Preview */}
            {selectedParent1 && selectedParent2 && (
              <Card className="p-3 bg-yellow-50 border-yellow-200">
                <div className="text-center">
                  <div className="text-lg mb-2">
                    {selectedParent1} + {selectedParent2}
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
                        <div>
                          <div className="text-xl mb-1">{recipe.emoji}</div>
                          <div className="font-semibold">{recipe.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{recipe.description}</div>
                          <div className="flex justify-center gap-2 mb-3">
                            {recipe.traits.map(trait => (
                              <Badge key={trait} variant="outline" className="text-xs">
                                {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                          <Button onClick={handleBreed} className="w-full">
                            Breed Hybrid (+25 XP)
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-gray-600">
                          <div className="text-lg mb-1">❓</div>
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
          <Card className="p-4">
            <h4 className="font-semibold mb-3">🌱 Discovered Hybrids</h4>

            <div className="grid grid-cols-1 gap-3">
              {Object.entries(BREEDING_RECIPES).map(([key, recipe]) => {
                const owned = state.inventory[key] || 0;
                const unlocked = recipe.unlockLevel <= state.level;

                return (
                  <Card key={key} className={`p-3 ${unlocked ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{recipe.emoji}</span>
                        <div>
                          <div className="font-semibold">{recipe.name}</div>
                          <div className="text-sm text-gray-600">{recipe.description}</div>
                          <div className="flex gap-1 mt-1">
                            {recipe.traits.map(trait => (
                              <Badge key={trait} variant="outline" className="text-xs">
                                {trait.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={getRarityColor(recipe.quality)}
                        >
                          {getRarityLabel(recipe.quality)}
                        </Badge>
                        <div className="text-sm mt-1">
                          {unlocked ? (
                            <>
                              <div>Owned: {owned}</div>
                              <div className="text-green-600">Value: {recipe.baseValue}🪙</div>
                            </>
                          ) : (
                            <div className="text-gray-500">Unlock at level {recipe.unlockLevel}</div>
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
          <Card className="p-4">
            <h4 className="font-semibold mb-3">⚡ Genetic Traits</h4>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-medium text-green-800">Fast Growth</div>
                  <div className="text-green-600">25% faster growth time</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="font-medium text-blue-800">High Value</div>
                  <div className="text-blue-600">50% higher selling price</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="font-medium text-purple-800">Disease Resistant</div>
                  <div className="text-purple-600">75% less disease risk</div>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <div className="font-medium text-orange-800">Weather Resistant</div>
                  <div className="text-orange-600">Immune to weather damage</div>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <div className="font-medium text-red-800">Pest Repellent</div>
                  <div className="text-red-600">Natural pest protection</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="font-medium text-yellow-800">Premium Quality</div>
                  <div className="text-yellow-600">Higher quality grades</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

GeneticsTab.displayName = 'GeneticsTab';
export default GeneticsTab;
