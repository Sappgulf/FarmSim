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
    // Use the in-game season from state
    if (state.season && state.season.current) {
      return state.season.current;
    }
    return 'spring'; // Fallback
  };

  const currentSeason = getCurrentSeason();

  // Filter events for current season
  const currentSeasonEvents = SEASONAL_EVENTS[currentSeason] || [];

  // Trigger random seasonal event
  const triggerSeasonalEvent = () => {
    if (currentSeasonEvents.length === 0) return;

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
      <Card className={`p-6 bg-gradient-to-r ${currentSeason === 'spring' ? 'from-green-400 to-emerald-600' :
        currentSeason === 'summer' ? 'from-yellow-400 to-orange-500' :
          currentSeason === 'autumn' ? 'from-orange-500 to-red-600' :
            'from-blue-400 to-indigo-600'
        } text-white shadow-lg overflow-hidden relative`}>
        <div className="absolute top-0 right-0 p-8 opacity-20 text-9xl pointer-events-none animate-spin-slow">
          {currentSeason === 'spring' ? '🌸' :
            currentSeason === 'summer' ? '☀️' :
              currentSeason === 'autumn' ? '🍂' : '❄️'}
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-2 drop-shadow-md">
              🎉 Seasonal Events
            </h3>
            <p className="text-white/90 font-medium capitalize mt-1 flex items-center gap-2">
              Current Season: <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">{currentSeason}</Badge>
            </p>
          </div>
          <div className="text-right bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold">{seasonEvents.length}</div>
            <div className="text-xs text-white/80 uppercase tracking-widest">Available</div>
          </div>
        </div>
      </Card>

      {/* Active Event - Hero Card */}
      {activeEvent && (
        <Card className="p-1 border-0 shadow-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 animate-in zoom-in-95 duration-500">
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-5 h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-bounce filter drop-shadow-md">{activeEvent.emoji}</div>
                <div>
                  <h4 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                    {activeEvent.name}
                  </h4>
                  <p className="text-sm font-medium text-gray-600 max-w-md">{activeEvent.description}</p>
                </div>
              </div>
              <Badge className={`px-3 py-1 shadow-sm ${getRarityColor(activeEvent.rarity)}`}>
                {activeEvent.rarity}
              </Badge>
            </div>

            <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                <span>Event Duration</span>
                <span className="font-mono text-amber-600">{getEventTimeLeft(activeEvent)}</span>
              </div>
              <Progress
                value={((activeEvent.endsAt - Date.now()) / (activeEvent.duration * 1000)) * 100}
                className="h-3"
              />
            </div>

            {/* Event Effects Grid */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(activeEvent.effects).map(([effect, value]) => (
                <div key={effect} className="flex justify-between items-center p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 rounded-lg">
                  <span className="capitalize text-sm font-medium text-amber-900">{effect.replace('_', ' ')}:</span>
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    {typeof value === 'boolean' ? (value ? 'ACTIVE' : 'INACTIVE') :
                      typeof value === 'number' && value > 1 ? `+${Math.round((value - 1) * 100)}%` :
                        value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Trigger Event / Empty State */}
      {!activeEvent && (
        <Card className="p-8 border-dashed border-2 border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-4 hover:border-blue-300 transition-colors group">
          <div className="transform transition-transform group-hover:scale-110 duration-300">
            <div className="text-6xl mb-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">🎲</div>
          </div>

          <div className="max-w-sm">
            <h4 className="text-xl font-bold text-gray-700">No Event Active</h4>
            <p className="text-gray-500 mt-1">Roll the dice to trigger a seasonal event and earn special bonuses!</p>
          </div>

          <Button
            onClick={triggerSeasonalEvent}
            className={`
                 font-bold text-lg px-8 py-6 shadow-lg transition-all hover:-translate-y-1 rounded-xl gap-2
                 ${seasonEvents.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            disabled={seasonEvents.length === 0}
          >
            {seasonEvents.length > 0 ? (
              <>🎲 Trigger {currentSeason} Event</>
            ) : (
              'No Events Available'
            )}
          </Button>
        </Card>
      )}

      {/* Available Events List */}
      <Card className="p-6 border-white shadow-sm bg-white/80 backdrop-blur-sm">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-gray-100 p-1.5 rounded-lg">📅</span> Available {currentSeason} Events
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {seasonEvents.map(event => (
            <div key={event.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all hover:border-blue-200 bg-white group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl transform group-hover:scale-110 transition-transform">{event.emoji}</span>
                  <div>
                    <span className="font-bold text-gray-800 block leading-tight">{event.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">
                      {Math.round(event.duration / 60)} Minutes
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getRarityColor(event.rarity)}`}>
                  {event.rarity}
                </Badge>
              </div>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed border-t border-gray-50 pt-2 mt-2">
                {event.description}
              </p>

              <div className="flex items-center justify-end">
                <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  💰 {event.rewards.coins} Coins
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event History */}
      <Card className="p-6">
        <h4 className="font-bold text-gray-800 mb-4">📜 Recent History</h4>

        {eventHistory.length === 0 ? (
          <div className="text-gray-400 text-center py-6 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No completed events recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {eventHistory.slice(0, 5).map((event, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-xl text-sm flex items-center justify-between hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{event.emoji}</span>
                  <span className="font-medium text-gray-700">{event.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold text-xs">+{event.rewards.coins}🪙</div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(event.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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
