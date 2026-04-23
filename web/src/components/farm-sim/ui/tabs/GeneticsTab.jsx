import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { getContentManager } from '../../../../content/ContentManager';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

const buildBreedingRecipes = (items = []) => (
  Object.fromEntries(items.map((item) => [
    item.id,
    {
      name: item.name,
      emoji: item.emoji || item.icon || '🧬',
      parents: [item.parentA, item.parentB],
      growthTime: 60,
      baseValue: 35,
      shopPrice: 50,
      quality: 1.5 + (Math.max(1, Number(item.levelRequirement || 1)) / 20),
      description: item.notes || '',
      traits: [],
      unlockLevel: Number(item.levelRequirement || 1),
      outputId: item.outputCropID || item.id,
    },
  ]))
);

const GeneticsTab = memo(() => {
  const { state, actions } = useGame();
  const content = getContentManager();
  const BREEDING_RECIPES = buildBreedingRecipes(content.genetics || []);
  const [selectedParent1, setSelectedParent1] = useState(null);
  const [selectedParent2, setSelectedParent2] = useState(null);

  const availableCrops = useMemo(() => {
    return Object.keys(state.inventory)
      .filter((crop) => (state.inventory[crop] || 0) > 0)
      .sort((a, b) => formatDisplayLabel(a).localeCompare(formatDisplayLabel(b)));
  }, [state.inventory]);

  const discoveredHybridCount = useMemo(
    () => Object.keys(state.genetics?.discoveredHybrids || {}).length,
    [state.genetics?.discoveredHybrids]
  );

  const matchedRecipe = useMemo(() => {
    if (!selectedParent1 || !selectedParent2) return null;

    const recipeKey = Object.keys(BREEDING_RECIPES).find((key) => {
      const recipe = BREEDING_RECIPES[key];
      const parents = recipe.parents;

      if (parents.length === 2 && parents[0] === parents[1]) {
        return selectedParent1 === parents[0] && selectedParent2 === parents[0];
      }

      return parents.includes(selectedParent1) && parents.includes(selectedParent2);
    });

    if (!recipeKey) return null;

    return {
      key: recipeKey,
      recipe: BREEDING_RECIPES[recipeKey],
      unlocked: BREEDING_RECIPES[recipeKey].unlockLevel <= state.level
    };
  }, [selectedParent1, selectedParent2, state.level]);

  const requiredParents = useMemo(() => {
    if (!selectedParent1 || !selectedParent2) return {};

    if (selectedParent1 === selectedParent2) {
      return { [selectedParent1]: 2 };
    }

    return { [selectedParent1]: 1, [selectedParent2]: 1 };
  }, [selectedParent1, selectedParent2]);

  const handleBreed = () => {
    if (!selectedParent1 || !selectedParent2) return;

    if (!matchedRecipe) {
      actions.addNotification({
        message: 'No breeding recipe found for these crops!',
        type: 'warning'
      });
      return;
    }

    if (!matchedRecipe.unlocked) {
      actions.addNotification({
        message: `Reach level ${matchedRecipe.recipe.unlockLevel} to unlock this hybrid.`,
        type: 'warning'
      });
      return;
    }

    const missingParents = Object.entries(requiredParents)
      .filter(([parent, required]) => (state.inventory[parent] || 0) < required)
      .map(([parent]) => formatDisplayLabel(parent));

    if (missingParents.length > 0) {
      actions.addNotification({
        message: `Not enough ${missingParents.join(' or ')} to breed!`,
        type: 'error'
      });
      return;
    }

    const updatedInventory = {
      ...state.inventory,
      [selectedParent1]: (state.inventory[selectedParent1] || 0) - (requiredParents[selectedParent1] || 0),
      [selectedParent2]: (state.inventory[selectedParent2] || 0) - (requiredParents[selectedParent2] || 0),
      [matchedRecipe.recipe.outputId]: (state.inventory[matchedRecipe.recipe.outputId] || 0) + 1
    };
    actions.updateInventory(updatedInventory);

    actions.addXP(25, { source: 'milestone', label: 'Genetics Breakthrough' });

    actions.addNotification({
      message: `Successfully bred ${matchedRecipe.recipe.name}!`,
      type: 'success'
    });

    setSelectedParent1(null);
    setSelectedParent2(null);
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
      <TabHero
        icon="🧬"
        tone="violet"
        title="Genetics Laboratory"
        description="Breed crops, reveal hybrids, and preview trait combinations."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-violet-700 border-violet-200">
            {discoveredHybridCount} hybrids
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="violet"
            label="Lab Level"
            value={Math.floor(state.level / 2) + 1}
            hint="Progression gates hybrid tiers"
            icon="🧪"
          />
          <MetricTile
            tone="sky"
            label="XP"
            value={state.xp}
            hint="Overall progression"
            icon="✨"
          />
          <MetricTile
            tone="emerald"
            label="Discovered"
            value={discoveredHybridCount}
            hint="Hybrids found so far"
            icon="🌱"
          />
        </div>
      </TabHero>

      <Tabs defaultValue="breeding" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-50/80 p-1.5">
          <TabsTrigger value="breeding">🧪 Breeding</TabsTrigger>
          <TabsTrigger value="hybrids">🌱 Hybrids</TabsTrigger>
          <TabsTrigger value="traits">⚡ Traits</TabsTrigger>
        </TabsList>

        {/* Breeding Tab */}
        <TabsContent value="breeding" className="space-y-4">
          <TabSection
            title="Select Parent Crops"
            description="Combine crops to discover hybrids."
            tone="violet"
          >
            {/* Parent Selection */}
            {availableCrops.length === 0 ? (
              <TabEmptyState
                icon="🧬"
                tone="violet"
                title="No crops available"
                description="Grow or harvest crops to unlock breeding options."
              />
            ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Parent 1</label>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-smart">
                  {availableCrops.map(crop => (
                    <Button
                      key={crop}
                      variant={selectedParent1 === crop ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedParent1(crop)}
                      className="text-xs justify-between w-full"
                    >
                      <span className="truncate">{formatDisplayLabel(crop)}</span>
                      <span className="text-[10px] shrink-0 ml-1 opacity-70">×{state.inventory[crop] || 0}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Parent 2</label>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-smart">
                  {availableCrops.map(crop => (
                    <Button
                      key={crop}
                      variant={selectedParent2 === crop ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedParent2(crop)}
                      className="text-xs justify-between w-full"
                    >
                      <span className="truncate">{formatDisplayLabel(crop)}</span>
                      <span className="text-[10px] shrink-0 ml-1 opacity-70">×{state.inventory[crop] || 0}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Breeding Preview */}
            {selectedParent1 && selectedParent2 && (
              <Card className="p-3 bg-white/90 border border-amber-100 shadow-sm">
                <div className="text-center">
                  <div className="text-lg mb-2">
                    {formatDisplayLabel(selectedParent1)} + {formatDisplayLabel(selectedParent2)}
                  </div>

                  {(() => {
                    if (matchedRecipe) {
                      const { recipe, unlocked } = matchedRecipe;
                      return (
                        <div>
                          <div className="text-xl mb-1">{recipe.emoji}</div>
                          <div className="font-semibold">{recipe.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{recipe.description}</div>
                          <div className="text-xs text-gray-500 mb-2">
                            Requires {Object.entries(requiredParents).map(([parent, count]) => (
                              `${count}× ${formatDisplayLabel(parent)}`
                            )).join(' + ')}
                          </div>
                          <div className="flex justify-center gap-2 mb-3">
                            {recipe.traits.map(trait => (
                              <Badge key={trait} variant="outline" className="text-xs">
                                {formatDisplayLabel(trait)}
                              </Badge>
                            ))}
                          </div>
                          {!unlocked ? (
                            <div className="text-sm text-amber-700">
                              Unlocks at level {recipe.unlockLevel}.
                            </div>
                          ) : (
                            <Button onClick={handleBreed} className="w-full">
                              Breed Hybrid (+25 XP)
                            </Button>
                          )}
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
          </TabSection>
        </TabsContent>

        {/* Hybrids Tab */}
        <TabsContent value="hybrids" className="space-y-4">
          <TabSection
            title="Discovered Hybrids"
            description="Hybrids found and their rarity stats."
            tone="emerald"
          >
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(BREEDING_RECIPES).map(([key, recipe]) => {
                const owned = state.inventory[recipe.outputId || key] || 0;
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
                                {formatDisplayLabel(trait)}
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
          </TabSection>
        </TabsContent>

        {/* Traits Tab */}
        <TabsContent value="traits" className="space-y-4">
          <TabSection
            title="Genetic Traits"
            description="Potential trait bonuses from breeding."
            tone="amber"
          >
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
          </TabSection>
        </TabsContent>
      </Tabs>
    </div>
  );
});

GeneticsTab.displayName = 'GeneticsTab';
export default GeneticsTab;
