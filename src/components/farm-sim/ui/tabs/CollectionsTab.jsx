import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { CROP_DATA } from '../../constants/cropData';
import { CROP_COLLECTION_MILESTONES, getCollectionRewardLabel, getCropLore } from '../../constants/collectionData';
import { MEMORY_TYPES } from '../../constants/identityData';

const CollectionsTab = memo(() => {
  const { state } = useGame();
  const collections = state.collections || { crops: {}, totals: { harvested: 0 } };
  const memories = Array.isArray(state.identity?.memories) ? state.identity.memories : [];
  const [memoryFilter, setMemoryFilter] = useState('all');

  const crops = useMemo(() => (
    Object.values(CROP_DATA).sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    })
  ), []);

  const discoveredCount = crops.filter(crop => collections.crops?.[crop.id]?.discovered).length;
  const completionPercent = Math.round((discoveredCount / crops.length) * 100);
  const totalHarvested = collections.totals?.harvested || 0;
  const nextMilestone = useMemo(() => {
    let best = null;

    crops.forEach((crop) => {
      const entry = collections.crops?.[crop.id];
      if (!entry) return;

      const next = CROP_COLLECTION_MILESTONES.find((milestone) => !entry.milestones?.[milestone.id]);
      if (!next) return;

      const harvested = entry.harvested || 0;
      const remaining = next.target - harvested;
      if (remaining <= 0) return;

      if (!best || remaining < best.remaining || (remaining === best.remaining && crop.level < best.crop.level)) {
        best = {
          crop,
          milestone: next,
          harvested,
          remaining,
          discovered: entry.discovered,
        };
      }
    });

    return best;
  }, [collections, crops]);

  const filteredMemories = useMemo(() => {
    if (memoryFilter === 'all') return memories;
    if (['spring', 'summer', 'fall', 'winter'].includes(memoryFilter)) {
      return memories.filter((memory) => memory.season === memoryFilter);
    }
    return memories.filter((memory) => memory.type === memoryFilter);
  }, [memories, memoryFilter]);

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📚</span> Crop Encyclopedia
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              Track every crop discovery and milestone from your cozy farm.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{completionPercent}%</div>
            <div className="text-xs uppercase tracking-widest text-emerald-100">Complete</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-emerald-100">
          <div className="text-xs uppercase font-semibold text-emerald-700">Discovered Crops</div>
          <div className="text-2xl font-bold text-emerald-900">{discoveredCount}/{crops.length}</div>
          <Progress value={completionPercent} className="h-2 mt-2 bg-emerald-100" />
        </Card>
        <Card className="p-4 border-emerald-100">
          <div className="text-xs uppercase font-semibold text-emerald-700">Total Harvested</div>
          <div className="text-2xl font-bold text-emerald-900">{totalHarvested}</div>
          <div className="text-xs text-emerald-600 mt-1">Across all crops</div>
        </Card>
        <Card className="p-4 border-emerald-100">
          <div className="text-xs uppercase font-semibold text-emerald-700">Next Milestone</div>
          {nextMilestone ? (
            <div className="mt-2 space-y-2">
              <div>
                <div className="text-sm font-semibold text-emerald-900">
                  {(nextMilestone.discovered && nextMilestone.crop.name) || 'Unknown Crop'} · {nextMilestone.milestone.label}
                </div>
                <div className="text-xs text-emerald-600">
                  {Math.min(nextMilestone.harvested, nextMilestone.milestone.target)}/{nextMilestone.milestone.target} harvested
                </div>
              </div>
              <Progress
                value={Math.min(100, (nextMilestone.harvested / nextMilestone.milestone.target) * 100)}
                className="h-2 bg-emerald-100"
              />
              <div className="text-[11px] text-emerald-600">
                {getCollectionRewardLabel(nextMilestone.milestone.id)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-emerald-900 mt-1">
              All crop milestones completed. Enjoy the town’s admiration!
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <span className="text-2xl">📖</span> Farm Scrapbook
            </h4>
            <p className="text-sm text-indigo-700">
              Cozy moments captured as your farm grows.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'spring', label: 'Spring' },
              { id: 'summer', label: 'Summer' },
              { id: 'fall', label: 'Fall' },
              { id: 'winter', label: 'Winter' },
              { id: MEMORY_TYPES.DECOR, label: 'Decor' },
              { id: MEMORY_TYPES.FESTIVAL, label: 'Festival' },
              { id: MEMORY_TYPES.REPUTATION, label: 'Rep' },
              { id: MEMORY_TYPES.COLLECTION, label: 'Collections' },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setMemoryFilter(filter.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  memoryFilter === filter.id
                    ? 'border-indigo-500 bg-indigo-100 text-indigo-900'
                    : 'border-white/60 bg-white/70 text-indigo-700 hover:bg-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredMemories.length === 0 ? (
            <div className="text-sm text-indigo-600 italic">
              No scrapbook pages yet. Cozy moments will appear as you play.
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="p-4 bg-white/80 border border-indigo-100 rounded-xl shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="font-semibold text-indigo-900">{memory.title}</div>
                  <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                    {memory.season ? `${memory.season} • Day ${memory.dayCount || 1}` : 'Milestone'}
                  </Badge>
                </div>
                <p className="text-sm text-indigo-700 mt-2">{memory.text}</p>
                {memory.stats && (
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-indigo-600">
                    <span>🪙 {memory.stats.coins}</span>
                    <span>⭐ {memory.stats.reputation} rep</span>
                    <span>🌾 {memory.stats.totalHarvested} harvested</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {crops.map((crop) => {
          const entry = collections.crops?.[crop.id];
          const discovered = Boolean(entry?.discovered);
          const harvested = entry?.harvested || 0;
          const lore = getCropLore(crop);

          return (
            <Card
              key={crop.id}
              className={`p-4 border ${discovered ? 'border-emerald-100 bg-white' : 'border-gray-200 bg-gray-50/70'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${discovered ? '' : 'opacity-40 grayscale'}`}>
                    {discovered ? crop.emoji : '❔'}
                  </div>
                  <div>
                    <div className={`font-bold ${discovered ? 'text-gray-900' : 'text-gray-400'}`}>
                      {discovered ? crop.name : 'Unknown Crop'}
                    </div>
                    <div className="text-xs text-gray-500">Level {crop.level} • {crop.season}</div>
                  </div>
                </div>
                <Badge variant="outline" className={discovered ? 'border-emerald-200 text-emerald-700' : 'border-gray-200 text-gray-400'}>
                  {discovered ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>

              <p className={`text-xs mt-3 ${discovered ? 'text-gray-600' : 'text-gray-400'}`}>
                {discovered ? lore : 'Harvest this crop to reveal its story.'}
              </p>

              <div className="mt-4 space-y-2">
                {CROP_COLLECTION_MILESTONES.map((milestone) => {
                  const progress = Math.min(100, (harvested / milestone.target) * 100);
                  const achieved = Boolean(entry?.milestones?.[milestone.id]);
                  return (
                    <div key={milestone.id} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>{milestone.label}</span>
                        <span className={achieved ? 'text-emerald-600 font-semibold' : ''}>
                          {Math.min(harvested, milestone.target)}/{milestone.target}
                        </span>
                      </div>
                      <Progress value={progress} className={`h-2 ${achieved ? 'bg-emerald-100' : 'bg-gray-100'}`} />
                      <div className={`text-[10px] ${achieved ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {getCollectionRewardLabel(milestone.id)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

CollectionsTab.displayName = 'CollectionsTab';
export default CollectionsTab;
