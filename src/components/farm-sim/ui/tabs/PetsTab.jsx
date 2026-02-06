import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';

// Pet types from original system
const PET_TYPES = {
  dog: {
    name: "Farm Dog",
    emoji: "🐕",
    cost: 200,
    maxLevel: 5,
    traits: ["pest_detection", "security", "loyalty"],
    bonuses: {
      pest_prevention: 0.3,
      theft_protection: 0.5,
      happiness_boost: 0.1
    },
    needs: {
      food: { type: "pet_food", consumption: 1, interval: 3600 },
      play: { type: "attention", consumption: 1, interval: 7200 },
      health: { type: "vet_care", consumption: 1, interval: 86400 }
    },
    levelBonuses: {
      1: { pest_prevention: 0.1 },
      2: { pest_prevention: 0.15, security: 0.1 },
      3: { pest_prevention: 0.2, security: 0.15, loyalty: 0.1 },
      4: { pest_prevention: 0.25, security: 0.2, loyalty: 0.15 },
      5: { pest_prevention: 0.3, security: 0.25, loyalty: 0.2 }
    }
  },
  cat: {
    name: "Farm Cat",
    emoji: "🐱",
    cost: 150,
    maxLevel: 5,
    traits: ["pest_hunter", "independence", "curiosity"],
    bonuses: {
      pest_elimination: 0.4,
      crop_quality: 0.15,
      luck_boost: 0.05
    },
    needs: {
      food: { type: "pet_food", consumption: 1, interval: 4800 },
      play: { type: "attention", consumption: 1, interval: 10800 },
      health: { type: "vet_care", consumption: 1, interval: 86400 }
    },
    levelBonuses: {
      1: { pest_elimination: 0.2 },
      2: { pest_elimination: 0.25, crop_quality: 0.05 },
      3: { pest_elimination: 0.3, crop_quality: 0.1, luck_boost: 0.02 },
      4: { pest_elimination: 0.35, crop_quality: 0.12, luck_boost: 0.03 },
      5: { pest_elimination: 0.4, crop_quality: 0.15, luck_boost: 0.05 }
    }
  },
  chicken: {
    name: "Farm Chicken",
    emoji: "🐔",
    cost: 100,
    maxLevel: 3,
    traits: ["egg_production", "pest_control", "fertilizer_production"],
    bonuses: {
      daily_eggs: 2,
      pest_reduction: 0.2,
      fertilizer_production: 1
    },
    needs: {
      food: { type: "grain", consumption: 2, interval: 3600 },
      shelter: { type: "coop", consumption: 0, interval: 0 }
    },
    levelBonuses: {
      1: { daily_eggs: 1 },
      2: { daily_eggs: 2, fertilizer_production: 0.5 },
      3: { daily_eggs: 3, fertilizer_production: 1, pest_reduction: 0.2 }
    }
  }
};

const PetsTab = memo(() => {
  const { state, actions } = useGame();
  // Use pet supplies from global state
  const petSupplies = state.inventory.petSupplies || {
    pet_food: 5,
    attention: 3,
    vet_care: 2
  };

  const handleAdoptPet = (petType) => {
    const petData = PET_TYPES[petType];
    if (state.coins >= petData.cost) {
      actions.spendMoney(petData.cost);

      const newPet = {
        id: Date.now(),
        type: petType,
        name: `${petData.name} ${state.pets.length + 1}`,
        level: 1,
        happiness: 100,
        health: 100,
        hunger: 0,
        playfulness: 100,
        lastFed: Date.now(),
        lastPlayed: Date.now(),
        lastVetVisit: Date.now(),
        experience: 0
      };

      actions.updatePets([...state.pets, newPet]);

      actions.addNotification({
        message: `Adopted a ${petData.name}!`,
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: 'Not enough coins to adopt this pet!',
        type: 'error'
      });
    }
  };

  const handleCarePet = (petId, careType) => {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;

    const petData = PET_TYPES[pet.type];
    const need = petData.needs[careType];

    if (!need) return;

    // Check if we have the required supplies
    if (petSupplies[need.type] >= need.consumption) {
      // Update pet stats
      const updatedPets = state.pets.map(p => {
        if (p.id === petId) {
          let updatedPet = { ...p };

          switch (careType) {
            case 'food':
              updatedPet.hunger = Math.max(0, p.hunger - 30);
              updatedPet.lastFed = Date.now();
              break;
            case 'play':
              updatedPet.playfulness = Math.min(100, p.playfulness + 30);
              updatedPet.happiness = Math.min(100, p.happiness + 20);
              updatedPet.lastPlayed = Date.now();
              break;
            case 'health':
              updatedPet.health = Math.min(100, p.health + 50);
              updatedPet.lastVetVisit = Date.now();
              break;
          }

          // Gain experience and potentially level up
          updatedPet.experience += 10;
          const expForNextLevel = pet.level * 100;
          if (updatedPet.experience >= expForNextLevel && updatedPet.level < petData.maxLevel) {
            updatedPet.level += 1;
            updatedPet.experience = 0;
            actions.addNotification({
              message: `${updatedPet.name} leveled up to ${updatedPet.level}!`,
              type: 'success'
            });
          }

          return updatedPet;
        }
        return p;
      });

      actions.updatePets(updatedPets);

      // Consume supplies from global inventory
      const updatedInventory = {
        ...state.inventory,
        petSupplies: {
          ...petSupplies,
          [need.type]: petSupplies[need.type] - need.consumption
        }
      };
      actions.updateInventory(updatedInventory);

      actions.recordCozyGoalEvent('pet_cared', { petId, careType });
      actions.recordAlmanacEvent('pet_cared', { petId, careType });

      actions.addNotification({
        message: `Cared for ${pet.name}!`,
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: `Not enough ${formatDisplayLabel(need.type)} supplies!`,
        type: 'warning'
      });
    }
  };

  const handleBuySupplies = (supplyType, cost) => {
    if (state.coins >= cost) {
      actions.spendMoney(cost);

      let quantity = 5; // Default quantity
      if (supplyType === 'vet_care') quantity = 1; // Vet care is more expensive

      // Update pet supplies in global inventory
      const updatedInventory = {
        ...state.inventory,
        petSupplies: {
          ...petSupplies,
          [supplyType]: petSupplies[supplyType] + quantity
        }
      };
      actions.updateInventory(updatedInventory);

      actions.addNotification({
        message: `Bought ${quantity} ${formatDisplayLabel(supplyType)}!`,
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: 'Not enough coins!',
        type: 'error'
      });
    }
  };

  const getHappinessEmoji = (happiness) => {
    if (happiness >= 80) return '😊';
    if (happiness >= 60) return '🙂';
    if (happiness >= 40) return '😐';
    return '😢';
  };

  const getHealthStatus = (health) => {
    if (health >= 80) return { text: 'Healthy', color: 'text-green-600' };
    if (health >= 60) return { text: 'Good', color: 'text-yellow-600' };
    if (health >= 40) return { text: 'Poor', color: 'text-orange-600' };
    return { text: 'Critical', color: 'text-red-600' };
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white/80 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">🐾 Farm Companions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Adopt loyal helpers, keep them happy, and earn cozy farm bonuses.
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">Pets</Badge>
        </div>
      </Card>

      {/* Pet Adoption */}
      {state.pets.length === 0 && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">✨</div>
            <div>
              <h3 className="font-semibold text-orange-800">Adopt Your First Pet</h3>
              <p className="text-sm text-orange-700">
                Pets provide bonuses, protect your crops, and add personality to your farm.
              </p>
              <p className="text-xs text-orange-600 mt-2">
                How to get a pet: earn coins → choose a companion → stock up on supplies.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(PET_TYPES).map(([petType, pet]) => (
              <div key={petType} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-white/70">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{pet.emoji || '🐾'}</span>
                  <div>
                    <div className="font-medium text-gray-900">{pet.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pet.traits.map((trait) => (
                        <Badge key={trait} variant="outline" className="text-[10px]">
                          {formatDisplayLabel(trait)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleAdoptPet(petType)}
                  size="sm"
                  disabled={state.coins < pet.cost}
                  className="sm:self-center"
                >
                  Adopt ({pet.cost}🪙)
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Pets */}
      {state.pets.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="font-semibold mb-3 text-green-800">🐾 Your Pets ({state.pets.length})</h3>

            <div className="space-y-3">
              {state.pets.map(pet => {
                const petData = PET_TYPES[pet.type];
                const healthStatus = getHealthStatus(pet.health);
                const petIcon = petData?.emoji || '🐾';

                return (
                  <Card key={pet.id} className="p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{petIcon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{pet.name}</div>
                          <div className="text-sm text-gray-600">
                            {petData?.name || 'Pet'} • Level {pet.level}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Mood: {getHappinessEmoji(pet.happiness)} {Math.round(pet.happiness)}% happy
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={healthStatus.color}>
                        {healthStatus.text}
                      </Badge>
                    </div>

                    {/* Pet Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Health</span>
                          <span>{pet.health}%</span>
                        </div>
                        <Progress value={pet.health} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Hunger</span>
                          <span>{100 - pet.hunger}%</span>
                        </div>
                        <Progress value={100 - pet.hunger} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Play</span>
                          <span>{pet.playfulness}%</span>
                        </div>
                        <Progress value={pet.playfulness} className="h-2" />
                      </div>
                    </div>

                    {petData?.traits?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {petData.traits.map((trait) => (
                          <Badge key={trait} variant="secondary" className="text-[10px]">
                            {formatDisplayLabel(trait)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Care Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleCarePet(pet.id, 'food')}
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1 min-w-[110px]"
                        disabled={petSupplies.pet_food < 1}
                      >
                        🍖 Feed
                      </Button>
                      <Button
                        onClick={() => handleCarePet(pet.id, 'play')}
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1 min-w-[110px]"
                        disabled={petSupplies.attention < 1}
                      >
                        🎾 Play
                      </Button>
                      <Button
                        onClick={() => handleCarePet(pet.id, 'health')}
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1 min-w-[110px]"
                        disabled={petSupplies.vet_care < 1}
                      >
                        🏥 Checkup
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Pet Supplies */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-semibold mb-3 text-blue-800">🛍️ Pet Supplies</h3>

            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div className="text-center p-2 bg-white rounded">
                <div className="font-medium">🍖 Pet Food</div>
                <div className="text-lg font-bold text-blue-600">{petSupplies.pet_food}</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-medium">❤️ Attention</div>
                <div className="text-lg font-bold text-blue-600">{petSupplies.attention}</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-medium">🏥 Vet Care</div>
                <div className="text-lg font-bold text-blue-600">{petSupplies.vet_care}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleBuySupplies('pet_food', 20)}
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                disabled={state.coins < 20}
              >
                Buy Food (20🪙)
              </Button>
              <Button
                onClick={() => handleBuySupplies('attention', 15)}
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                disabled={state.coins < 15}
              >
                Buy Attention (15🪙)
              </Button>
              <Button
                onClick={() => handleBuySupplies('vet_care', 30)}
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                disabled={state.coins < 30}
              >
                Vet Care (30🪙)
              </Button>
            </div>
          </Card>

          {/* Adopt More Pets */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="font-semibold mb-3 text-purple-800">➕ Adopt More Pets</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(PET_TYPES).map(([petType, pet]) => (
                <Button
                  key={petType}
                  onClick={() => handleAdoptPet(petType)}
                  variant="outline"
                  size="sm"
                  disabled={state.coins < pet.cost}
                  className="justify-between"
                >
                  <span>{pet.emoji} Adopt {pet.name}</span>
                  <span>{pet.cost}🪙</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
});

PetsTab.displayName = 'PetsTab';
export default PetsTab;
