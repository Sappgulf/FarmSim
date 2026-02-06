import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import FarmCardShareButton from '../FarmCardShareButton';
import { decodeSeed, encodeSeed, SEED_CODE_VERSION } from '../../../../utils/seedCode';
import { exportFarmSnapshot, hydrateSnapshotPlots, validateSnapshotPayload } from '../../../../utils/farmSnapshot';
import { MILESTONE_DEFINITIONS } from '../../../../data/milestones';
import { getContentManager } from '../../../../content/ContentManager';

const SocialTab = memo(() => {
  const { state, actions } = useGame();
  const [seedCodeInput, setSeedCodeInput] = useState('');

  const social = state.social || { friends: [], reputation: 0, marketListings: [] };
  const milestones = state.milestones || { progress: {}, unlocked: {}, recent: [] };

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

  const nextMilestones = useMemo(() => (
    MILESTONE_DEFINITIONS
      .filter((definition) => !milestones.unlocked?.[definition.id])
      .slice(0, 3)
  ), [milestones.unlocked]);

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">👥 Social Hub</h3>
            <p className="text-sm text-blue-700">Reputation: {social.reputation} • Friends: {social.friends.length}</p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">Level {state.level}</Badge>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <h4 className="font-semibold">🌱 Seed Codes</h4>
        <div className="flex gap-2">
          <Button onClick={handleShareSeedCode} variant="outline" size="sm" className="flex-1">Share Seed Code</Button>
          <Button onClick={handleStartFromSeed} variant="outline" size="sm" className="flex-1">Start from Seed Code</Button>
        </div>
        <textarea value={seedCodeInput} onChange={(e) => setSeedCodeInput(e.target.value)} className="w-full rounded border p-2 text-xs" rows={3} placeholder="Paste Seed Code or Snapshot JSON" />
      </Card>

      <Card className="p-4 space-y-2">
        <h4 className="font-semibold">👻 Ghost Visits</h4>
        <div className="flex gap-2">
          <Button onClick={handleExportSnapshot} variant="outline" size="sm" className="flex-1">Export Farm Snapshot</Button>
          <Button onClick={handleImportSnapshot} variant="outline" size="sm" className="flex-1">Import Snapshot</Button>
        </div>
        {state.ghostVisit?.active && (
          <Button onClick={actions.exitGhostVisit} size="sm" className="w-full">Exit Ghost Visit</Button>
        )}
      </Card>

      <Card className="p-4 space-y-2">
        <h4 className="font-semibold">🏁 Milestones</h4>
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

      <FarmCardShareButton className="w-full" label="📸 Share Farm Card" />
    </div>
  );
});

SocialTab.displayName = 'SocialTab';
export default SocialTab;
