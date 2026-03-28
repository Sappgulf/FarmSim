import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import FarmCardShareButton from '../FarmCardShareButton';
import { TabHero, MetricTile } from './TabSurface';
import { decodeSeed, encodeSeed, SEED_CODE_VERSION } from '../../../../utils/seedCode';
import { exportFarmSnapshot, hydrateSnapshotPlots, validateSnapshotPayload } from '../../../../utils/farmSnapshot';
import { MILESTONE_DEFINITIONS } from '../../../../data/milestones';
import { getContentManager } from '../../../../content/ContentManager';
import { formatDisplayLabel } from '../../../../utils/textFormat';

// Reputation tier thresholds and perks
const REPUTATION_TIERS = [
  { tier: 0, name: 'Newcomer', minRep: 0, emoji: '🌱', perk: null },
  { tier: 1, name: 'Friendly Neighbor', minRep: 25, emoji: '🤝', perk: 'Shop discount 5%' },
  { tier: 2, name: 'Trusted Farmer', minRep: 75, emoji: '⭐', perk: 'Better trade offers' },
  { tier: 3, name: 'Community Pillar', minRep: 200, emoji: '🏆', perk: 'Rare visitor events' },
  { tier: 4, name: 'Legendary Grower', minRep: 500, emoji: '👑', perk: 'Premium trade rates' },
];

const getReputationTier = (reputation) => {
  for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
    if (reputation >= REPUTATION_TIERS[i].minRep) return REPUTATION_TIERS[i];
  }
  return REPUTATION_TIERS[0];
};

const getNextTier = (reputation) => {
  const current = getReputationTier(reputation);
  return REPUTATION_TIERS[current.tier + 1] || null;
};

// NPC visitor pool - deterministic based on day + reputation
const NPC_VISITORS = [
  { id: 'merchant_mara', name: 'Merchant Mara', emoji: '🧑‍🌾', minRep: 0,
    offers: [
      { give: 'coins', giveAmount: 30, want: 'lettuce', wantAmount: 5, label: 'Buy 5 Lettuce for 30🪙' },
      { give: 'coins', giveAmount: 50, want: 'carrot', wantAmount: 4, label: 'Buy 4 Carrots for 50🪙' },
    ]},
  { id: 'chef_carlo', name: 'Chef Carlo', emoji: '👨‍🍳', minRep: 25,
    offers: [
      { give: 'coins', giveAmount: 80, want: 'tomato', wantAmount: 6, label: 'Buy 6 Tomatoes for 80🪙' },
      { give: 'coins', giveAmount: 120, want: 'potato', wantAmount: 8, label: 'Buy 8 Potatoes for 120🪙' },
    ]},
  { id: 'botanist_lily', name: 'Botanist Lily', emoji: '🔬', minRep: 75,
    offers: [
      { give: 'coins', giveAmount: 150, want: 'sunflower', wantAmount: 5, label: 'Buy 5 Sunflowers for 150🪙' },
      { give: 'coins', giveAmount: 200, want: 'pumpkin', wantAmount: 4, label: 'Buy 4 Pumpkins for 200🪙' },
    ]},
  { id: 'collector_rex', name: 'Collector Rex', emoji: '🎩', minRep: 200,
    offers: [
      { give: 'coins', giveAmount: 300, want: 'strawberry', wantAmount: 10, label: 'Buy 10 Strawberries for 300🪙' },
      { give: 'coins', giveAmount: 500, want: 'watermelon', wantAmount: 5, label: 'Buy 5 Watermelons for 500🪙' },
    ]},
];

const getTodayVisitors = (reputation, dayKey) => {
  const seed = (dayKey || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const eligible = NPC_VISITORS.filter(v => reputation >= v.minRep);
  if (eligible.length === 0) return [NPC_VISITORS[0]];
  const count = Math.min(eligible.length, seed % 2 === 0 ? 2 : 1);
  const shuffled = [...eligible].sort((a, b) => {
    const ha = a.id.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), seed) % 1000;
    const hb = b.id.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), seed) % 1000;
    return ha - hb;
  });
  return shuffled.slice(0, count);
};

const getCommunityChallenge = (state) => {
  const totalCrops = Object.entries(state.inventory || {}).reduce(
    (sum, [key, val]) => sum + (typeof val === 'number' && key !== 'fertilizer' && key !== 'water_boost' && key !== 'starter_flag' ? Math.max(0, val) : 0), 0
  );
  const petsCount = (state.pets || []).length;
  const facilitiesCount = (state.processingFacilities || []).length;
  const challenges = [];

  if (totalCrops < 20) {
    challenges.push({
      id: 'harvest_20', title: 'Community Harvest Drive',
      description: `Grow your crop inventory to 20+ items (currently ${totalCrops})`,
      progress: Math.min(100, Math.round((totalCrops / 20) * 100)),
      reward: { type: 'reputation', amount: 10 }, complete: totalCrops >= 20,
    });
  }
  if (petsCount < 2) {
    challenges.push({
      id: 'adopt_2', title: 'Companion Outreach',
      description: `Adopt 2 farm pets (currently ${petsCount})`,
      progress: Math.min(100, Math.round((petsCount / 2) * 100)),
      reward: { type: 'reputation', amount: 15 }, complete: petsCount >= 2,
    });
  }
  if (facilitiesCount < 2) {
    challenges.push({
      id: 'facilities_2', title: 'Processing Pioneer',
      description: `Own 2 processing facilities (currently ${facilitiesCount})`,
      progress: Math.min(100, Math.round((facilitiesCount / 2) * 100)),
      reward: { type: 'reputation', amount: 12 }, complete: facilitiesCount >= 2,
    });
  }
  if (state.level < 5) {
    challenges.push({
      id: 'level_5', title: 'Rising Farmer',
      description: `Reach Level 5 (currently Level ${state.level})`,
      progress: Math.min(100, Math.round((state.level / 5) * 100)),
      reward: { type: 'reputation', amount: 20 }, complete: state.level >= 5,
    });
  }
  if (challenges.length === 0) {
    challenges.push({
      id: 'veteran', title: 'Farm Veteran',
      description: 'You\'ve completed all community challenges!',
      progress: 100, reward: { type: 'reputation', amount: 0 }, complete: true,
    });
  }
  return challenges;
};

const SocialTab = memo(() => {
  const { state, actions } = useGame();
  const [seedCodeInput, setSeedCodeInput] = useState('');
  const [completedTrades, setCompletedTrades] = useState({});
  const [claimedChallenges, setClaimedChallenges] = useState({});

  const social = state.social || { friends: [], reputation: 0, marketListings: [] };
  const milestones = state.milestones || { progress: {}, unlocked: {}, recent: [] };
  const reputation = social.reputation || 0;
  const currentTier = useMemo(() => getReputationTier(reputation), [reputation]);
  const nextTier = useMemo(() => getNextTier(reputation), [reputation]);

  const dayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }, []);

  const visitors = useMemo(() => getTodayVisitors(reputation, dayKey), [reputation, dayKey]);
  const challenges = useMemo(() => getCommunityChallenge(state), [
    state.inventory, state.pets, state.processingFacilities, state.level
  ]);

  const nextMilestones = useMemo(() => (
    MILESTONE_DEFINITIONS
      .filter((definition) => !milestones.unlocked?.[definition.id])
      .slice(0, 3)
  ), [milestones.unlocked]);

  // --- Seed Code / Ghost Visit handlers (upstream) ---
  const handleShareSeedCode = () => {
    const content = getContentManager();
    const code = encodeSeed({
      version: SEED_CODE_VERSION,
      seed: state.almanac?.counters?.dayCount || 1,
      season: state.season?.current || 'spring',
      packs: (content.packs || []).map((pack) => pack.id).sort(),
      theme: state.farmTheme,
    });
    navigator.clipboard?.writeText(code).catch(() => {});
    actions.addNotification({ message: '🌱 Seed Code copied to clipboard.', type: 'success' });
  };

  const handleStartFromSeed = () => {
    const parsed = decodeSeed(seedCodeInput.trim());
    if (parsed.error) {
      actions.addNotification({ message: parsed.error, type: 'error' });
      return;
    }
    const payload = parsed.payload;
    actions.updateSeason({ ...state.season, current: payload.season });
    if (payload.theme) actions.setFarmTheme(payload.theme);
    actions.setSeedProvenance({ ...payload, importedAt: Date.now() });
    actions.addNotification({ message: 'Seed start applied. Reset farm to begin fresh from this vibe.', type: 'info' });
  };

  const handleExportSnapshot = () => {
    const snapshot = exportFarmSnapshot(state);
    const data = JSON.stringify(snapshot);
    navigator.clipboard?.writeText(data).catch(() => {});
    actions.addNotification({ message: '👻 Farm snapshot copied.', type: 'success' });
  };

  const handleImportSnapshot = () => {
    try {
      const parsed = JSON.parse(seedCodeInput);
      const validation = validateSnapshotPayload(parsed);
      if (!validation.ok) {
        actions.addNotification({ message: validation.errors[0] || 'Snapshot invalid.', type: 'error' });
        return;
      }
      const plots = hydrateSnapshotPlots(parsed.plots || []);
      actions.enterGhostVisit({ ...parsed, plots });
      actions.addNotification({ message: '👻 Ghost Visit loaded.', type: 'success' });
    } catch {
      actions.addNotification({ message: 'Paste a valid snapshot JSON to import.', type: 'error' });
    }
  };

  // --- Trade / challenge handlers (new) ---
  const handleTrade = (visitor, offer) => {
    const tradeKey = `${visitor.id}_${offer.label}`;
    if (completedTrades[tradeKey]) {
      actions.addNotification({ message: 'Already completed this trade today!', type: 'warning' });
      return;
    }
    const available = state.inventory[offer.want] || 0;
    if (available < offer.wantAmount) {
      actions.addNotification({
        message: `Not enough ${formatDisplayLabel(offer.want)}! Need ${offer.wantAmount}, have ${available}.`,
        type: 'error'
      });
      return;
    }
    actions.updateInventory({
      ...state.inventory,
      [offer.want]: available - offer.wantAmount
    });
    actions.earnMoney(offer.giveAmount);
    actions.addXP(Math.floor(offer.giveAmount * 0.1));
    const repGain = Math.floor(offer.giveAmount * 0.1);
    actions.updateSocial({ ...social, reputation: reputation + repGain });
    setCompletedTrades(prev => ({ ...prev, [tradeKey]: true }));
    actions.addNotification({
      message: `Traded ${offer.wantAmount} ${formatDisplayLabel(offer.want)} with ${visitor.name} for ${offer.giveAmount}🪙 (+${repGain} rep)`,
      type: 'success'
    });
  };

  const handleClaimChallenge = (challenge) => {
    if (!challenge.complete || claimedChallenges[challenge.id]) return;
    if (challenge.reward.amount > 0) {
      actions.updateSocial({ ...social, reputation: reputation + challenge.reward.amount });
      actions.addXP(challenge.reward.amount);
    }
    setClaimedChallenges(prev => ({ ...prev, [challenge.id]: true }));
    actions.addNotification({
      message: `Challenge complete: ${challenge.title}! +${challenge.reward.amount} rep`,
      type: 'success'
    });
  };

  const progressToNext = nextTier
    ? Math.min(100, Math.round(((reputation - currentTier.minRep) / (nextTier.minRep - currentTier.minRep)) * 100))
    : 100;

  return (
    <div className="space-y-4">
      <TabHero
        icon="🤝"
        tone="violet"
        title="Social Hub"
        description="Trade with visitors, share snapshots, and grow your reputation."
        badge={(
          <Badge variant="outline" className="bg-white/80 text-violet-700 border-violet-200">
            Tier {currentTier.tier}
          </Badge>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            tone="violet"
            label="Reputation"
            value={reputation}
            hint={`${currentTier.emoji} ${currentTier.name}`}
            icon="⭐"
          />
          <MetricTile
            tone="sky"
            label="Visitors"
            value={visitors.length}
            hint="Today’s trading contacts"
            icon="🚶"
          />
          <MetricTile
            tone="emerald"
            label="Next Tier"
            value={nextTier ? nextTier.name : 'Max'}
            hint={nextTier ? `${nextTier.minRep} rep needed` : 'Highest reputation reached'}
            icon="🏆"
          />
        </div>
        {nextTier && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{currentTier.name}</span>
              <span>{nextTier.name} ({nextTier.minRep} rep)</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
        {currentTier.perk && (
          <div className="mt-3 rounded-2xl border border-violet-200/70 bg-violet-50/80 px-3 py-2 text-xs text-violet-700">
            Active Perk: {currentTier.perk}
          </div>
        )}
      </TabHero>

      {/* Your Profile */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4">
        <h4 className="mb-3 font-semibold text-slate-900">Your profile</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-3 text-center shadow-sm">
            <div className="font-bold text-green-600">{state.level}</div>
            <div className="text-xs uppercase tracking-wide text-green-700">Farm level</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-3 text-center shadow-sm">
            <div className="font-bold text-blue-600">{reputation}</div>
            <div className="text-xs uppercase tracking-wide text-blue-700">Reputation</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-3 text-center shadow-sm">
            <div className="font-bold text-yellow-600">{state.coins}🪙</div>
            <div className="text-xs uppercase tracking-wide text-yellow-700">Coins</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-3 text-center shadow-sm">
            <div className="font-bold text-purple-600">{state.xp} XP</div>
            <div className="text-xs uppercase tracking-wide text-purple-700">Experience</div>
          </div>
        </div>
      </Card>

      {/* Today's Visitors */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4">
        <h4 className="mb-3 font-semibold text-slate-900">Today's visitors</h4>
        <p className="mb-3 text-xs text-slate-500">Visitors rotate daily. Higher reputation attracts more traders.</p>
        <div className="space-y-3">
          {visitors.map(visitor => (
            <Card key={visitor.id} className="overflow-hidden border-amber-200/70 bg-white/90 p-3 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{visitor.emoji}</span>
                <div>
                  <div className="font-medium text-slate-900">{visitor.name}</div>
                  <div className="text-xs text-slate-500">Wants to trade with you</div>
                </div>
              </div>
              <div className="space-y-2">
                {visitor.offers.map((offer, idx) => {
                  const tradeKey = `${visitor.id}_${offer.label}`;
                  const done = !!completedTrades[tradeKey];
                  const hasEnough = (state.inventory[offer.want] || 0) >= offer.wantAmount;
                  return (
                    <div key={idx} className="flex flex-col justify-between gap-2 rounded-2xl border border-white/80 bg-white/85 p-2 shadow-sm sm:flex-row sm:items-center">
                      <div className="text-sm">
                        <span className="font-medium">{offer.giveAmount}🪙</span>
                        <span className="text-slate-500"> for </span>
                        <span className="font-medium">{offer.wantAmount} {formatDisplayLabel(offer.want)}</span>
                        <span className="ml-1 text-xs text-slate-400">(have {state.inventory[offer.want] || 0})</span>
                      </div>
                      <Button onClick={() => handleTrade(visitor, offer)} size="sm" disabled={done || !hasEnough} className="shrink-0">
                        {done ? '✓ Done' : 'Trade'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Community Challenges */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4">
        <h4 className="mb-3 font-semibold text-slate-900">Community challenges</h4>
        <div className="space-y-3">
          {challenges.map(challenge => {
            const claimed = !!claimedChallenges[challenge.id];
            return (
              <Card key={challenge.id} className={`overflow-hidden p-3 shadow-sm ${challenge.complete ? 'border-emerald-200/70 bg-emerald-50/80' : 'border-slate-200/70 bg-white/90'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{challenge.title}</div>
                    <div className="text-sm text-slate-600">{challenge.description}</div>
                  </div>
                  {challenge.reward.amount > 0 && (
                    <Badge variant="outline" className="shrink-0">+{challenge.reward.amount} rep</Badge>
                  )}
                </div>
                <Progress value={challenge.progress} className="h-2 mb-2" />
                {challenge.complete && challenge.reward.amount > 0 && (
                  <Button onClick={() => handleClaimChallenge(challenge)} size="sm" disabled={claimed} className="w-full">
                    {claimed ? '✓ Claimed' : 'Claim Reward'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Seed Codes */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4 space-y-2">
        <h4 className="font-semibold text-slate-900">Seed codes</h4>
        <div className="flex gap-2">
          <Button onClick={handleShareSeedCode} variant="outline" size="sm" className="flex-1">Share Seed Code</Button>
          <Button onClick={handleStartFromSeed} variant="outline" size="sm" className="flex-1">Start from Seed Code</Button>
        </div>
        <textarea value={seedCodeInput} onChange={(e) => setSeedCodeInput(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs shadow-sm focus:border-emerald-300 focus:outline-none" rows={3} placeholder="Paste Seed Code or Snapshot JSON" />
      </Card>

      {/* Ghost Visits */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4 space-y-2">
        <h4 className="font-semibold text-slate-900">Ghost visits</h4>
        <div className="flex gap-2">
          <Button onClick={handleExportSnapshot} variant="outline" size="sm" className="flex-1">Export Farm Snapshot</Button>
          <Button onClick={handleImportSnapshot} variant="outline" size="sm" className="flex-1">Import Snapshot</Button>
        </div>
        {state.ghostVisit?.active && (
          <Button onClick={actions.exitGhostVisit} size="sm" className="w-full">Exit Ghost Visit</Button>
        )}
      </Card>

      {/* Milestones */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4 space-y-2">
        <h4 className="font-semibold text-slate-900">Milestones</h4>
        {(milestones.recent || []).slice(-3).reverse().map((id) => {
          const def = MILESTONE_DEFINITIONS.find((entry) => entry.id === id);
          return <div key={id} className="text-xs text-emerald-700">Unlocked: {def?.name || id}</div>;
        })}
        {nextMilestones.map((definition) => {
          const value = milestones.progress?.[definition.type] || 0;
          const pct = Math.min(100, Math.round((value / definition.target) * 100));
          return (
            <div key={definition.id}>
              <div className="text-xs text-gray-700">{definition.name} ({value}/{definition.target})</div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </Card>

      {/* Reputation Tiers */}
      <Card className="overflow-hidden border-slate-200/70 bg-slate-50/80 p-4">
        <h4 className="mb-3 font-semibold text-slate-900">Reputation tiers</h4>
        <div className="space-y-2">
          {REPUTATION_TIERS.map(tier => {
            const unlocked = reputation >= tier.minRep;
            return (
              <div key={tier.tier} className={`flex items-center justify-between rounded-2xl border p-2 ${unlocked ? 'border-slate-200/70 bg-white/90 shadow-sm' : 'border-slate-200/60 bg-slate-100/70 opacity-60'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tier.emoji}</span>
                  <div>
                    <div className="text-sm font-medium">{tier.name}</div>
                    {tier.perk && <div className="text-xs text-slate-500">{tier.perk}</div>}
                  </div>
                </div>
                <span className="text-xs text-slate-500">{tier.minRep} rep</span>
              </div>
            );
          })}
        </div>
      </Card>

      <FarmCardShareButton className="w-full" label="📸 Share Farm Card" />
    </div>
  );
});

SocialTab.displayName = 'SocialTab';
export default SocialTab;
