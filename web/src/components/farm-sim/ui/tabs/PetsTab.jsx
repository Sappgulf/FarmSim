import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { TabHero, MetricTile, TabSection, TabEmptyState } from './TabSurface';

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

// Aggregate all pet bonuses into a single summary
export const getPetBonuses = (pets) => {
  const bonuses = {};
  if (!Array.isArray(pets)) return bonuses;

  pets.forEach(pet => {
    const petData = PET_TYPES[pet.type];
    if (!petData) return;

    // Happiness factor: pets below 40% happiness give reduced bonuses
    const happinessFactor = Math.max(0.2, (pet.happiness || 0) / 100);
    const levelBonuses = petData.levelBonuses[pet.level] || petData.levelBonuses[1] || {};

    Object.entries(levelBonuses).forEach(([key, value]) => {
      bonuses[key] = (bonuses[key] || 0) + value * happinessFactor;
    });
  });

  return bonuses;
};

// Bonus display labels for UI
const BONUS_LABELS = {
  pest_prevention: { label: 'Pest Prevention', emoji: '🛡️', format: 'percent' },
  pest_elimination: { label: 'Pest Removal', emoji: '🐛', format: 'percent' },
  pest_reduction: { label: 'Pest Reduction', emoji: '🐛', format: 'percent' },
  security: { label: 'Farm Security', emoji: '🔒', format: 'percent' },
  loyalty: { label: 'Loyalty', emoji: '❤️', format: 'percent' },
  crop_quality: { label: 'Crop Quality', emoji: '✨', format: 'percent' },
  luck_boost: { label: 'Luck', emoji: '🍀', format: 'percent' },
  happiness_boost: { label: 'Happiness', emoji: '😊', format: 'percent' },
  daily_eggs: { label: 'Daily Eggs', emoji: '🥚', format: 'number' },
  fertilizer_production: { label: 'Fertilizer', emoji: '💩', format: 'number' },
  theft_protection: { label: 'Theft Guard', emoji: '🔐', format: 'percent' },
};

const formatBonusValue = (key, value) => {
  const info = BONUS_LABELS[key];
  if (!info) return `+${value.toFixed(1)}`;
  if (info.format === 'percent') return `+${Math.round(value * 100)}%`;
  return `+${value.toFixed(1)}`;
};

/* ── Circular bond progress ring ── */
const BondRing = ({ value, size = 56, stroke = 5, color = '#8b5cf6' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="bond-ring-circle"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-violet-700 dark:text-violet-300">
        {Math.round(value)}%
      </span>
    </div>
  );
};

const PetsTab = memo(() => {
  const { state, actions } = useGame();
  const petSupplies = state.inventory.petSupplies || {
    pet_food: 5,
    attention: 3,
    vet_care: 2
  };

  const activeBonuses = useMemo(() => getPetBonuses(state.pets), [state.pets]);
  const hasBonuses = Object.keys(activeBonuses).length > 0;

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
      actions.addXP(20);
      actions.addNotification({ message: `Adopted a ${petData.name}!`, type: 'success' });
    } else {
      actions.addNotification({ message: 'Not enough coins to adopt this pet!', type: 'error' });
    }
  };

  const handleCarePet = (petId, careType) => {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return;

    const petData = PET_TYPES[pet.type];
    const need = petData.needs[careType];
    if (!need) return;

    if (petSupplies[need.type] >= need.consumption) {
      const updatedPets = state.pets.map(p => {
        if (p.id !== petId) return p;
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
          actions.addXP(15);
        }

        return updatedPet;
      });

      actions.updatePets(updatedPets);

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
      actions.addNotification({ message: `Cared for ${pet.name}!`, type: 'success' });
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
      let quantity = 5;
      if (supplyType === 'vet_care') quantity = 1;

      const updatedInventory = {
        ...state.inventory,
        petSupplies: {
          ...petSupplies,
          [supplyType]: petSupplies[supplyType] + quantity
        }
      };
      actions.updateInventory(updatedInventory);
      actions.addNotification({ message: `Bought ${quantity} ${formatDisplayLabel(supplyType)}!`, type: 'success' });
    } else {
      actions.addNotification({ message: 'Not enough coins!', type: 'error' });
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

  /* ── Owned pet types set ── */
  const ownedTypes = new Set(state.pets.map(p => p.type));

  return (
    <div className="space-y-4">
      <TabHero
        icon="🐾"
        tone="violet"
        title="Farm Companions"
        description="Adopt loyal helpers, keep them happy, and earn cozy farm bonuses."
        badge={(
          <Badge variant="secondary" className="shrink-0 bg-white/80 text-violet-700">
            {state.pets.length} Pets
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="violet"
            label="Pets"
            value={state.pets.length}
            hint="Currently adopted"
            icon="🐾"
          />
          <MetricTile
            tone="amber"
            label="Bonuses"
            value={Object.keys(activeBonuses).length}
            hint="Active pet perks"
            icon="✨"
          />
          <MetricTile
            tone="sky"
            label="Supplies"
            value={Object.values(petSupplies).reduce((sum, value) => sum + value, 0)}
            hint="Combined stock"
            icon="🛍️"
          />
        </div>
      </TabHero>

      {/* Active Bonuses Summary */}
      {hasBonuses && (
        <TabSection
          title="Active Pet Bonuses"
          description="Bonuses scale with pet level and happiness."
          tone="amber"
        >
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(activeBonuses).map(([key, value]) => {
              const info = BONUS_LABELS[key] || { label: formatDisplayLabel(key), emoji: '📊' };
              return (
                <div key={key} className="flex items-center gap-2 p-2 bg-white/70 dark:bg-slate-800/60 rounded-xl text-sm border border-slate-100 dark:border-slate-700">
                  <span className="text-base">{info.emoji}</span>
                  <span className="text-gray-700 dark:text-gray-300">{info.label}</span>
                  <span className="ml-auto font-semibold text-amber-700 dark:text-amber-300">{formatBonusValue(key, value)}</span>
                </div>
              );
            })}
          </div>
        </TabSection>
      )}

      {/* Pet Adoption (first pet) */}
      {state.pets.length === 0 && (
        <TabSection
          title="Adopt Your First Pet"
          description="Pets provide bonuses, protect your crops, and add personality to your farm."
          tone="amber"
        >
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(PET_TYPES).map(([petType, pet]) => (
              <Card key={petType} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-[24px] bg-white/70 dark:bg-slate-800/60 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="relative grid h-16 w-16 place-items-center rounded-full bg-violet-100 dark:bg-violet-900/40 text-3xl shadow-inner">
                    {pet.emoji || '🐾'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{pet.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
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
                  juicy
                >
                  Adopt ({pet.cost}🪙)
                </Button>
              </Card>
            ))}
          </div>
        </TabSection>
      )}

      {/* Active Pets */}
      {state.pets.length > 0 && (
        <>
          <TabSection
            title="Your Pets"
            description={`Manage ${state.pets.length} active companions.`}
            tone="emerald"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.pets.map(pet => {
                const petData = PET_TYPES[pet.type];
                const healthStatus = getHealthStatus(pet.health);
                const petIcon = petData?.emoji || '🐾';
                const expForNext = pet.level * 100;
                const expPct = petData && pet.level < petData.maxLevel
                  ? Math.min(100, Math.round((pet.experience / expForNext) * 100))
                  : 100;
                // Bond = weighted combo of level progress + happiness
                const bondValue = Math.min(100, Math.round(
                  ((pet.level / (petData?.maxLevel || 1)) * 50) +
                  ((pet.happiness / 100) * 30) +
                  ((pet.health / 100) * 20)
                ));

                return (
                  <Card key={pet.id} className="p-4 overflow-hidden">
                    {/* Top row: emoji, info, bond ring */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="pet-bounce grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/30 text-4xl shadow-md select-none">
                            {petIcon}
                          </div>
                          <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white dark:bg-slate-800 text-xs shadow border border-slate-100 dark:border-slate-700">
                            {getHappinessEmoji(pet.happiness)}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-gray-100">{pet.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {petData?.name || 'Pet'} • Level {pet.level}{petData && pet.level >= petData.maxLevel ? ' (MAX)' : ''}
                          </div>
                          <Badge variant="outline" className={`mt-1 text-[10px] ${healthStatus.color}`}>
                            {healthStatus.text}
                          </Badge>
                        </div>
                      </div>
                      <BondRing value={bondValue} color="#8b5cf6" />
                    </div>

                    {/* Stats bars */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 text-gray-500 dark:text-gray-400">
                          <span>Health</span>
                          <span className="font-medium">{pet.health}%</span>
                        </div>
                        <Progress value={pet.health} className="h-1.5" variant="health" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 text-gray-500 dark:text-gray-400">
                          <span>Hunger</span>
                          <span className="font-medium">{100 - pet.hunger}%</span>
                        </div>
                        <Progress value={100 - pet.hunger} className="h-1.5" variant="energy" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 text-gray-500 dark:text-gray-400">
                          <span>Play</span>
                          <span className="font-medium">{pet.playfulness}%</span>
                        </div>
                        <Progress value={pet.playfulness} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 text-gray-500 dark:text-gray-400">
                          <span>XP</span>
                          <span className="font-medium">{pet.experience}/{expForNext}</span>
                        </div>
                        <Progress value={expPct} className="h-1.5" variant="xp" />
                      </div>
                    </div>

                    {/* Bonuses */}
                    {petData?.levelBonuses?.[pet.level] && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {Object.entries(petData.levelBonuses[pet.level]).map(([key, value]) => {
                          const info = BONUS_LABELS[key] || { label: formatDisplayLabel(key), emoji: '✨' };
                          return (
                            <Badge key={key} variant="premium" className="text-[10px]">
                              <span className="mr-0.5">{info.emoji}</span>
                              {info.label} {formatBonusValue(key, value)}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    {/* Trait pills */}
                    {petData?.traits?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {petData.traits.map((trait) => (
                          <span key={trait} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {formatDisplayLabel(trait)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Interact pill buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCarePet(pet.id, 'food')}
                        className="pill-btn flex-1 min-w-[80px] inline-flex items-center justify-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold py-2 px-3 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={petSupplies.pet_food < 1}
                      >
                        🍖 Feed
                      </button>
                      <button
                        onClick={() => handleCarePet(pet.id, 'play')}
                        className="pill-btn flex-1 min-w-[80px] inline-flex items-center justify-center gap-1 rounded-full bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold py-2 px-3 hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={petSupplies.attention < 1}
                      >
                        🎾 Play
                      </button>
                      <button
                        onClick={() => handleCarePet(pet.id, 'health')}
                        className="pill-btn flex-1 min-w-[80px] inline-flex items-center justify-center gap-1 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold py-2 px-3 hover:bg-sky-100 dark:hover:bg-sky-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={petSupplies.vet_care < 1}
                      >
                        🏥 Checkup
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabSection>

          {/* Pet Supplies — inventory cards */}
          <TabSection
            title="Pet Supplies"
            description="Stock up on food, attention, and vet care."
            tone="sky"
          >
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 mb-4">
              {[
                { key: 'pet_food', label: 'Food', icon: '🍖', tone: 'amber', color: 'from-amber-400 to-orange-500' },
                { key: 'attention', label: 'Attention', icon: '❤️', tone: 'rose', color: 'from-rose-400 to-pink-500' },
                { key: 'vet_care', label: 'Vet Care', icon: '🏥', tone: 'sky', color: 'from-sky-400 to-blue-500' },
              ].map(supply => (
                <div key={supply.key} className="supply-card relative overflow-hidden rounded-[20px] border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${supply.color}`} />
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-700 text-lg">
                      {supply.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{supply.label}</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{petSupplies[supply.key]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleBuySupplies('pet_food', 20)}
                size="sm" variant="outline" className="text-xs flex-1"
                disabled={state.coins < 20}
                juicy
              >
                Buy Food (20🪙)
              </Button>
              <Button
                onClick={() => handleBuySupplies('attention', 15)}
                size="sm" variant="outline" className="text-xs flex-1"
                disabled={state.coins < 15}
                juicy
              >
                Buy Attention (15🪙)
              </Button>
              <Button
                onClick={() => handleBuySupplies('vet_care', 30)}
                size="sm" variant="outline" className="text-xs flex-1"
                disabled={state.coins < 30}
                juicy
              >
                Vet Care (30🪙)
              </Button>
            </div>
          </TabSection>

          {/* Adopt More Pets — mystery silhouettes for unowned */}
          <TabSection
            title="Adopt More Pets"
            description="Expand your farm family."
            tone="violet"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(PET_TYPES).map(([petType, pet]) => {
                const isOwned = ownedTypes.has(petType);
                return (
                  <Card
                    key={petType}
                    className={`p-4 transition-all duration-200 ${
                      isOwned
                        ? 'opacity-40 bg-slate-50 dark:bg-slate-900/40'
                        : 'bg-white dark:bg-slate-800 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => !isOwned && handleAdoptPet(petType)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-violet-50 dark:bg-violet-900/30 text-2xl">
                        {isOwned ? (
                          <span className="opacity-40 grayscale">{pet.emoji}</span>
                        ) : (
                          <>
                            <span className="mystery-silhouette select-none">{pet.emoji}</span>
                            <span className="absolute inset-0 grid place-items-center text-lg font-bold text-white drop-shadow-md">?</span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm ${isOwned ? 'text-slate-400 dark:text-slate-600' : 'text-gray-900 dark:text-gray-100'}`}>
                          {pet.name} {isOwned && <span className="text-[10px] font-normal text-slate-400">(owned)</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pet.traits.map(trait => (
                            <Badge key={trait} variant="outline" className="text-[9px]">
                              {formatDisplayLabel(trait)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {!isOwned && (
                        <Button
                          size="sm"
                          disabled={state.coins < pet.cost}
                          className="shrink-0"
                          juicy
                        >
                          {pet.cost}🪙
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabSection>
        </>
      )}
    </div>
  );
});

PetsTab.displayName = 'PetsTab';
export default PetsTab;
