import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

// Seasonal events from original system
const SEASONAL_EVENTS = {
  spring: [
    {
      id: "spring_festival",
      name: "Spring Planting Festival",
      emoji: "🌸",
      description: "Celebrate new growth! Double XP for planting and 25% faster growth.",
      duration: 300, // 5 minutes
      effects: { growth_speed: 1.25, planting_xp: 2.0 },
      rewards: { coins: 100, items: { "spring_seeds": 3 } },
      rarity: "common"
    },
    {
      id: "flower_bloom",
      name: "Flower Bloom Event",
      emoji: "🌺",
      description: "Flowers are in bloom! Decorative crops give bonus coins.",
      duration: 240,
      effects: { flower_bonus: 1.5 },
      rewards: { coins: 75, items: { "decorative_seeds": 2 } },
      rarity: "uncommon"
    },
    {
      id: "seed_swap_social",
      name: "Seed Swap Social",
      emoji: "🧺",
      description: "Neighbors trade tips! Planting XP +50% and growth +10%.",
      duration: 240,
      effects: { planting_xp: 1.5, growth_speed: 1.1 },
      rewards: { coins: 90, items: { "spring_seeds": 2 } },
      rarity: "common"
    }
  ],
  summer: [
    {
      id: "harvest_moon",
      name: "Harvest Moon Festival",
      emoji: "🌕",
      description: "Under the harvest moon, all crops give 50% more coins!",
      duration: 180,
      effects: { harvest_bonus: 1.5 },
      rewards: { coins: 200, items: { "moon_fertilizer": 1 } },
      rarity: "rare"
    },
    {
      id: "summer_solstice",
      name: "Summer Solstice",
      emoji: "☀️",
      description: "Longest day of the year! No watering needed and faster growth.",
      duration: 360,
      effects: { no_watering: true, growth_speed: 1.3 },
      rewards: { coins: 150, items: { "solar_seeds": 2 } },
      rarity: "uncommon"
    }
  ],
  autumn: [
    {
      id: "pumpkin_fest",
      name: "Pumpkin Festival",
      emoji: "🎃",
      description: "Pumpkins and gourds sell for triple value!",
      duration: 420,
      effects: { pumpkin_bonus: 3.0 },
      rewards: { coins: 300, items: { "giant_pumpkin_seeds": 1 } },
      rarity: "epic"
    },
    {
      id: "thanksgiving",
      name: "Thanksgiving Feast",
      emoji: "🦃",
      description: "Share the harvest! Bonus coins for every crop type in inventory.",
      duration: 240,
      effects: { diversity_bonus: 50 },
      rewards: { coins: 250, items: { "feast_crops": 5 } },
      rarity: "rare"
    }
  ],
  winter: [
    {
      id: "winter_wonder",
      name: "Winter Wonderland",
      emoji: "❄️",
      description: "Greenhouse crops immune to frost and grow 2x faster!",
      duration: 300,
      effects: { greenhouse_boost: 2.0, frost_immunity: true },
      rewards: { coins: 175, items: { "winter_seeds": 3 } },
      rarity: "uncommon"
    },
    {
      id: "snow_lantern_market",
      name: "Snow Lantern Market",
      emoji: "🏮",
      description: "Lanterns glow across the farm. Harvests gain a small bonus.",
      duration: 240,
      effects: { harvest_bonus: 1.2 },
      rewards: { coins: 140, items: { "winter_seeds": 2 } },
      rarity: "rare"
    }
  ]
};

const EventsTab = memo(() => {
  const { state, actions } = useGame();
  const [eventHistory, setEventHistory] = useState([]);
  
  // Ensure event-related state exists
  const activeSeasonalEvents = state.activeSeasonalEvents || [];
  const seasonalEvents = state.seasonalEvents || [];

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const currentSeason = getCurrentSeason();
  const seasonEvents = SEASONAL_EVENTS[currentSeason] || [];

  // Trigger random seasonal event
  const triggerSeasonalEvent = () => {
    if (seasonEvents.length === 0) return;

    // Check if there's already an active event
    if (state.activeSeasonalEvents && state.activeSeasonalEvents.length > 0) {
      actions.addNotification({
        message: 'An event is already active!',
        type: 'warning'
      });
      return;
    }

    // Select random event
    const randomEvent = seasonEvents[Math.floor(Math.random() * seasonEvents.length)];
    const eventWithTimer = {
      ...randomEvent,
      startedAt: Date.now(),
      endsAt: Date.now() + (randomEvent.duration * 1000),
      season: currentSeason
    };

    // Start the event
    actions.updateActiveEvents([eventWithTimer]);

    actions.addNotification({
      message: `${randomEvent.emoji} ${randomEvent.name} has begun!`,
      type: 'success'
    });

    // Auto-end event after duration
    setTimeout(() => {
      endSeasonalEvent(eventWithTimer.id);
    }, randomEvent.duration * 1000);
  };

  // End seasonal event and grant rewards
  const endSeasonalEvent = (eventId) => {
    const activeEvent = state.activeSeasonalEvents?.find(e => e.id === eventId);
    if (!activeEvent) return;

    // Grant rewards
    actions.setCoins(state.coins + activeEvent.rewards.coins);
    actions.setXp(state.xp + Math.floor(activeEvent.rewards.coins * 0.5));

    // Add to event history
    const completedEvent = {
      ...activeEvent,
      completedAt: Date.now(),
      rewards: activeEvent.rewards
    };

    setEventHistory(prev => [completedEvent, ...prev.slice(0, 9)]); // Keep last 10
    actions.recordMemoryEvent('festival_attended', { eventId: activeEvent.id });

    // Clear active event
    actions.updateActiveEvents([]);

    actions.addNotification({
      message: `${activeEvent.emoji} ${activeEvent.name} ended! +${activeEvent.rewards.coins}🪙`,
      type: 'success'
    });
  };

  const getEventTimeLeft = (event) => {
    const timeLeft = Math.max(0, event.endsAt - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'epic': return 'border-purple-500 bg-purple-50 text-purple-700';
      case 'rare': return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'uncommon': return 'border-green-500 bg-green-50 text-green-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const activeEvent = state.activeSeasonalEvents?.[0];

  return (
    <div className="space-y-4">
      {/* Season Header */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-800">🎉 Seasonal Events</h3>
            <p className="text-sm text-green-700 capitalize">
              Current Season: {currentSeason} {currentSeason === 'spring' ? '🌸' :
                                              currentSeason === 'summer' ? '☀️' :
                                              currentSeason === 'autumn' ? '🍂' : '❄️'}
            </p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700">
            {seasonEvents.length} Events Available
          </Badge>
        </div>
      </Card>

      {/* Active Event */}
      {activeEvent && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeEvent.emoji}</span>
              <div>
                <h4 className="font-semibold text-lg">{activeEvent.name}</h4>
                <p className="text-sm text-gray-600">{activeEvent.description}</p>
              </div>
            </div>
            <Badge className={getRarityColor(activeEvent.rarity)}>
              {activeEvent.rarity}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Time Remaining</span>
              <span className="font-mono">{getEventTimeLeft(activeEvent)}</span>
            </div>
            <Progress
              value={((activeEvent.endsAt - Date.now()) / (activeEvent.duration * 1000)) * 100}
              className="h-2"
            />
          </div>

          {/* Event Effects */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(activeEvent.effects).map(([effect, value]) => (
              <div key={effect} className="flex justify-between p-2 bg-white rounded">
                <span className="capitalize">{effect.replace('_', ' ')}:</span>
                <span className="font-semibold">
                  {typeof value === 'boolean' ? (value ? '✓' : '✗') :
                   typeof value === 'number' && value > 1 ? `+${Math.round((value - 1) * 100)}%` :
                   value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trigger Event */}
      {!activeEvent && (
        <Card className="p-4">
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">🎲</div>
              <p>No active seasonal events</p>
              <p className="text-sm">Trigger a random event to earn rewards!</p>
            </div>
            <Button
              onClick={triggerSeasonalEvent}
              className="w-full"
              disabled={seasonEvents.length === 0}
            >
              🎲 Trigger {currentSeason} Event
            </Button>
            {seasonEvents.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No events available for this season
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Available Events */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📅 Available {currentSeason} Events</h4>

        <div className="space-y-3">
          {seasonEvents.map(event => (
            <div key={event.id} className="p-3 border rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{event.emoji}</span>
                  <span className="font-medium">{event.name}</span>
                </div>
                <Badge variant="outline" className={getRarityColor(event.rarity)}>
                  {event.rarity}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">{event.description}</p>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Duration: {Math.round(event.duration / 60)}m</span>
                <span>Reward: {event.rewards.coins}🪙</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event History */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📜 Recent Events</h4>

        {eventHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No completed events yet</p>
        ) : (
          <div className="space-y-2">
            {eventHistory.slice(0, 5).map((event, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span>{event.emoji} {event.name}</span>
                  <span className="text-green-600 font-semibold">+{event.rewards.coins}🪙</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(event.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Season Info */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">🌸 Season Information</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Spring (Mar-May):</strong> Focus on planting and growth bonuses</p>
          <p><strong>Summer (Jun-Aug):</strong> Harvest festivals and heat events</p>
          <p><strong>Autumn (Sep-Nov):</strong> Epic festivals and crop bonuses</p>
          <p><strong>Winter (Dec-Feb):</strong> Frost resistance and greenhouse boosts</p>
        </div>
      </Card>
    </div>
  );
});

EventsTab.displayName = 'EventsTab';
export default EventsTab;
