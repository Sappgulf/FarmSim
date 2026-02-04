import React, { memo, useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { getDailyAlmanacInsight, getDayKey } from '../../../../systems/almanac';
import { getContentManager } from '../../../../content/ContentManager';
import PerfectHarvestModal from '../minigames/PerfectHarvestModal';

const EventsTab = memo(() => {
  const { state, actions } = useGame();
  const content = getContentManager();
  const [eventHistory, setEventHistory] = useState([]);
  const [showPerfectHarvest, setShowPerfectHarvest] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  const stateRef = useRef(state);
  const eventTimersRef = useRef(new Map());
  const packHighlights = (content.report?.packs || [])
    .filter((pack) => pack.highlights?.length)
    .map((pack) => ({ packName: pack.name, items: pack.highlights }));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      eventTimersRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      eventTimersRef.current.clear();
    };
  }, []);
  
  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const currentSeason = getCurrentSeason();
  const seasonEvents = content.festivals.filter((event) =>
    event.season === currentSeason || event.seasonTags?.includes(currentSeason)
  );

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
      endsAt: Date.now() + (randomEvent.durationSeconds * 1000),
      season: currentSeason,
    };

    // Start the event
    actions.updateActiveEvents([eventWithTimer]);

    actions.addNotification({
      message: `${randomEvent.emoji} ${randomEvent.name} has begun!`,
      type: 'success'
    });
    actions.recordAlmanacEvent('festival_start', { eventId: randomEvent.id, season: currentSeason });

    // Auto-end event after duration
    const timeoutId = setTimeout(() => {
      endSeasonalEvent(eventWithTimer.id);
    }, randomEvent.durationSeconds * 1000);
    eventTimersRef.current.set(eventWithTimer.id, timeoutId);
  };

  // End seasonal event and grant rewards
  const endSeasonalEvent = (eventId) => {
    const currentState = stateRef.current;
    const activeEvent = currentState.activeSeasonalEvents?.find((event) => event.id === eventId);
    if (!activeEvent) return;

    // Grant rewards
    actions.setCoins(currentState.coins + activeEvent.rewards.coins);
    actions.setXp(currentState.xp + Math.floor(activeEvent.rewards.coins * 0.5));

    // Add to event history
    const completedEvent = {
      ...activeEvent,
      completedAt: Date.now(),
      rewards: activeEvent.rewards
    };

    setEventHistory(prev => [completedEvent, ...prev.slice(0, 9)]); // Keep last 10
    actions.recordMemoryEvent('festival_attended', { eventId: activeEvent.id });
    actions.recordAlmanacEvent('festival_attended', { eventId: activeEvent.id, season: activeEvent.season });

    // Clear active event
    actions.updateActiveEvents([]);
    const timeoutId = eventTimersRef.current.get(eventId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      eventTimersRef.current.delete(eventId);
    }

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
  const almanacInsight = getDailyAlmanacInsight(state.almanac, state.philosophy);
  const whatsNewTitle = content.strings?.ui?.whatsNewTitle || "What's New";
  const dayKey = getDayKey();
  const minigameState = state.minigames?.perfectHarvest || {};
  const reducedMotion = state.settings?.animationsEnabled === false;
  const canPlayFestival = activeEvent && minigameState.lastFestivalId !== activeEvent.id;
  const canPlayBoard = !activeEvent && minigameState.lastPlayedDayKey !== dayKey;

  const rewardTable = {
    festival: {
      perfect: { coins: 60, reputation: 3 },
      good: { coins: 40, reputation: 2 },
      okay: { coins: 25, reputation: 1 },
      miss: { coins: 10, reputation: 0 },
    },
    board: {
      perfect: { coins: 35, reputation: 2 },
      good: { coins: 25, reputation: 1 },
      okay: { coins: 15, reputation: 1 },
      miss: { coins: 8, reputation: 0 },
    },
  };

  const handleMiniGameComplete = (tier) => {
    const mode = activeEvent ? 'festival' : 'board';
    const reward = rewardTable[mode][tier];
    const newCoins = Math.max(0, (stateRef.current.coins || 0) + reward.coins);
    const currentSocial = stateRef.current.social || { friends: [], reputation: 0, marketListings: [] };
    actions.setCoins(newCoins);
    actions.updateSocial({
      ...currentSocial,
      reputation: (currentSocial.reputation || 0) + reward.reputation,
    });
    actions.updateMinigames({
      ...stateRef.current.minigames,
      perfectHarvest: {
        lastPlayedDayKey: dayKey,
        lastFestivalId: activeEvent ? activeEvent.id : minigameState.lastFestivalId || null,
        lastResult: tier,
        lastPlayedAt: Date.now(),
      },
    });
    setLastReward({ tier, reward, mode });
    actions.addNotification({
      message: `🌾 ${reward.coins}🪙 earned${reward.reputation ? ` +${reward.reputation} rep` : ''}!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Town Board Insight */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-amber-800">📌 Town Board</h3>
            <p className="text-sm text-amber-700">Almanac insight of the day</p>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            Almanac
          </Badge>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          {almanacInsight
            ? (
              <>
                <span className="font-semibold">{almanacInsight.page.title}:</span> {almanacInsight.text}
              </>
            )
            : 'No Almanac pages yet. Keep farming to uncover gentle insights.'
          }
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-lime-50 border-emerald-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-emerald-800">🌾 Perfect Harvest</h3>
            <p className="text-sm text-emerald-700">
              Stop the marker in the sweet spot for a cozy reward.
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
            {activeEvent ? 'Festival Bonus' : 'Town Board'}
          </Badge>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-emerald-700">
            {activeEvent
              ? `Available once during ${activeEvent.name}.`
              : 'Available once per day.'}
          </div>
          <Button
            size="sm"
            onClick={() => setShowPerfectHarvest(true)}
            disabled={!(canPlayFestival || canPlayBoard)}
          >
            {canPlayFestival || canPlayBoard ? 'Play Challenge' : 'Already Played'}
          </Button>
        </div>
        {lastReward && (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-white/70 p-2 text-xs text-emerald-800">
            Last result: <span className="font-semibold capitalize">{lastReward.tier}</span> •
            {' '}+{lastReward.reward.coins}🪙
            {lastReward.reward.reputation ? ` +${lastReward.reward.reputation} rep` : ''}
            {' '}({lastReward.mode === 'festival' ? 'Festival' : 'Board'})
          </div>
        )}
      </Card>

      {packHighlights.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 border-rose-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-rose-800">✨ {whatsNewTitle}</h3>
              <p className="text-sm text-rose-700">Season packs just landed on the Town Board.</p>
            </div>
            <Badge variant="outline" className="bg-rose-100 text-rose-700">
              {content.report?.packs?.length || 0} Packs
            </Badge>
          </div>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            {packHighlights.map((highlight, index) => (
              <div key={`${highlight.packName}-${index}`}>
                <div className="font-semibold text-rose-700">{highlight.packName}</div>
                <ul className="list-disc list-inside space-y-1">
                  {highlight.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

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

      <PerfectHarvestModal
        isOpen={showPerfectHarvest}
        onClose={() => setShowPerfectHarvest(false)}
        onComplete={(tier) => {
          handleMiniGameComplete(tier);
          setShowPerfectHarvest(false);
        }}
        reducedMotion={reducedMotion}
      />

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
              value={((activeEvent.endsAt - Date.now()) / (activeEvent.durationSeconds * 1000)) * 100}
              className="h-2"
            />
          </div>

          {/* Event Effects */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(activeEvent.effects).map(([effect, value]) => (
              <div key={effect} className="flex justify-between p-2 bg-white rounded">
                <span className="capitalize">{formatDisplayLabel(effect)}:</span>
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
                <span>Duration: {Math.round(event.durationSeconds / 60)}m</span>
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
