import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { CROP_DATA } from '../../constants/cropData';
import { CROP_COLLECTION_MILESTONES, getCropLore } from '../../constants/collectionData';

const CollectionsTab = memo(() => {
  const { state } = useGame();
  const collections = state.collections || { crops: {}, totals: { harvested: 0 } };

  const crops = useMemo(() => (
    Object.values(CROP_DATA).sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    })
  ), []);

  const discoveredCount = crops.filter(crop => collections.crops?.[crop.id]?.discovered).length;
  const completionPercent = Math.round((discoveredCount / crops.length) * 100);
  const totalHarvested = collections.totals?.harvested || 0;

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
          <div className="text-sm text-emerald-900 mt-1">
            Keep harvesting to unlock more cozy notes and town praise!
          </div>
        </Card>
      </div>

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
