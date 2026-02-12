/**
 * BreedingPanel Component
 * Breed and discover hybrid crops
 */
import React, { memo, useState, useMemo } from 'react';
import { Dna, FlaskConical, Sparkles, Lock, Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { BREEDING_RECIPES } from '../../data/buildings';
import { ALL_CROPS } from '../../data/crops';
import { formatDisplayLabel } from '../../utils/textFormat';

function BreedingPanelComponent({
  inventory,
  discoveredHybrids = [],
  breedingQueue = [],
  prestige = 0,
  onStartBreeding,
  onCollectHybrid,
}) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Get available recipes based on prestige level
  const availableRecipes = useMemo(() => {
    return Object.entries(BREEDING_RECIPES).map(([id, recipe]) => ({
      id,
      ...recipe,
      discovered: discoveredHybrids.includes(id),
      unlocked: prestige >= (recipe.unlockLevel - 1),
    }));
  }, [discoveredHybrids, prestige]);

  // Check if player has required crops
  const canBreed = (recipe) => {
    if (!recipe.unlocked) return { can: false, reason: 'Locked' };

    for (const parent of recipe.parents) {
      const required = recipe.minQuantity || 3;
      if ((inventory[parent] || 0) < required) {
        return { can: false, reason: `Need ${required} ${parent}` };
      }
    }
    return { can: true, reason: null };
  };

  // Active breeding
  const activeBreeding = breedingQueue[0] || null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dna size={20} className="text-purple-600" />
          Crop Breeding Lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lab Status */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical size={16} className="text-purple-600" />
            <span className="font-medium text-purple-800">Breeding Lab</span>
          </div>

          {activeBreeding ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{activeBreeding.name}</span>
                <span className="text-purple-600">{activeBreeding.progress}%</span>
              </div>
              <Progress value={activeBreeding.progress} className="h-2" />
              <p className="text-xs text-purple-600">
                Breeding in progress...
              </p>
            </div>
          ) : (
            <p className="text-sm text-purple-600">
              Select a recipe below to start breeding
            </p>
          )}
        </div>

        {/* Discovery Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {discoveredHybrids.length}
            </div>
            <div className="text-xs text-amber-700">Discovered</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Object.keys(BREEDING_RECIPES).length}
            </div>
            <div className="text-xs text-gray-600">Total Hybrids</div>
          </div>
        </div>

        {/* Recipes List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700">Breeding Recipes</h4>

          {availableRecipes.map((recipe) => {
            const { can, reason } = canBreed(recipe);
            const isSelected = selectedRecipe === recipe.id;

            return (
              <div
                key={recipe.id}
                className={`
                  p-3 rounded-lg border transition-all cursor-pointer
                  ${recipe.discovered
                    ? 'bg-green-50 border-green-200'
                    : recipe.unlocked
                      ? 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      : 'bg-gray-100 border-gray-200 opacity-60'
                  }
                  ${isSelected ? 'ring-2 ring-purple-400' : ''}
                `}
                onClick={() => recipe.unlocked && setSelectedRecipe(recipe.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{recipe.emoji}</span>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1">
                        {recipe.name}
                        {recipe.discovered && (
                          <Check size={14} className="text-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recipe.description}
                      </div>
                    </div>
                  </div>

                  {!recipe.unlocked && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Lock size={14} />
                      <span className="text-xs">Prestige {recipe.unlockLevel}</span>
                    </div>
                  )}
                </div>

                {/* Recipe details */}
                {recipe.unlocked && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <span>Requires:</span>
                      {recipe.parents.map((parent, i) => (
                        <React.Fragment key={parent}>
                          {i > 0 && <span>+</span>}
                          <span className="flex items-center gap-0.5">
                            {ALL_CROPS[parent]?.emoji || '🌱'}
                            <span>×{recipe.minQuantity || 3}</span>
                          </span>
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(recipe.successRate * 100)}% success
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recipe.baseValue}🪙 value
                        </Badge>
                      </div>

                      {!recipe.discovered && (
                        <Button
                          size="sm"
                          disabled={!can || !!activeBreeding}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartBreeding?.(recipe.id);
                          }}
                        >
                          {can ? 'Breed' : reason}
                        </Button>
                      )}
                    </div>

                    {/* Traits */}
                    {recipe.traits && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {recipe.traits.map(trait => (
                          <Badge
                            key={trait}
                            className="text-[10px] bg-purple-100 text-purple-700"
                          >
                            {formatDisplayLabel(trait)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <Sparkles size={12} className="inline mr-1" />
          <strong>Tip:</strong> Higher quality parent crops increase breeding success rates!
        </div>
      </CardContent>
    </Card>
  );
}

export const BreedingPanel = memo(BreedingPanelComponent);
