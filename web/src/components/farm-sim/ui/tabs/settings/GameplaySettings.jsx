import React, { memo } from 'react';
import { Card } from '../../../../ui/card';
import { SettingToggleRow } from './SettingToggleRow';

export const GameplaySettings = memo(({
  autoSaveEnabled,
  animationsEnabled,
  showFPS,
  reducedMotion,
  showTooltips,
  showAlmanacHints,
  showWelcomeBackSummary,
  fastMode,
  particleEffects,
  handleToggleAnimations,
  handleToggleAutoSave,
  handleToggleShowFps,
  handleToggleReducedMotion,
  handleToggleTooltips,
  handleToggleAlmanacHints,
  handleToggleWelcomeBackSummary,
  handleToggleFastMode,
  handleToggleParticleEffects
}) => {
  const experienceRows = [
    {
      key: 'auto-save',
      title: 'Auto-Save',
      description: 'Persists progress in the background while you play (about every 30s when the game is running).',
      enabled: autoSaveEnabled,
      onToggle: handleToggleAutoSave,
    },
    {
      key: 'animations',
      title: 'Animations',
      description: 'Keep interface motion active and responsive.',
      enabled: animationsEnabled,
      onToggle: handleToggleAnimations,
    },
    {
      key: 'fps',
      title: 'Show FPS Overlay',
      description: 'Expose a lightweight performance indicator.',
      enabled: showFPS,
      onToggle: handleToggleShowFps,
    },
    {
      key: 'reduced-motion',
      title: 'Reduced Motion',
      description: 'Reduce heavier motion for comfort or testing.',
      enabled: reducedMotion,
      onToggle: handleToggleReducedMotion,
    },
  ];

  const guidanceRows = [
    {
      key: 'tooltips',
      title: 'Show Tooltips',
      description: 'Keep in-context hints available while exploring.',
      enabled: showTooltips,
      onToggle: handleToggleTooltips,
    },
    {
      key: 'almanac-hints',
      title: 'Almanac Hints',
      description: 'Show hints for locked pages and missing entries.',
      enabled: showAlmanacHints,
      onToggle: handleToggleAlmanacHints,
    },
    {
      key: 'welcome-back',
      title: 'Welcome Back Summary',
      description: 'Show the return recap on the Town Board.',
      enabled: showWelcomeBackSummary,
      onToggle: handleToggleWelcomeBackSummary,
    },
    {
      key: 'fast-mode',
      title: 'Fast Mode',
      description: 'Speed up growth for test and tuning loops.',
      enabled: fastMode,
      onToggle: handleToggleFastMode,
    },
    {
      key: 'particles',
      title: 'Particle Effects',
      description: 'Show harvest and level-up particles.',
      enabled: particleEffects,
      onToggle: handleToggleParticleEffects,
    },
  ];

  return (
    <>
      <Card className="overflow-hidden border-violet-200/70 bg-gradient-to-br from-white via-violet-50/30 to-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600">
              Core
            </div>
            <h4 className="text-base font-semibold text-slate-900">Gameplay preferences</h4>
          </div>
        </div>

        <div className="space-y-3">
          {experienceRows.map((row) => (
            <SettingToggleRow
              key={row.key}
              title={row.title}
              description={row.description}
              enabled={row.enabled}
              onToggle={row.onToggle}
              label={`${row.title} ${row.enabled ? 'on' : 'off'}`}
            />
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden border-sky-200/70 bg-gradient-to-br from-white via-sky-50/30 to-emerald-50/40 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600">
              Guidance
            </div>
            <h4 className="text-base font-semibold text-slate-900">Assistance and polish</h4>
          </div>
        </div>

        <div className="space-y-3">
          {guidanceRows.map((row) => (
            <SettingToggleRow
              key={row.key}
              title={row.title}
              description={row.description}
              enabled={row.enabled}
              onToggle={row.onToggle}
              label={`${row.title} ${row.enabled ? 'on' : 'off'}`}
            />
          ))}
        </div>
      </Card>
    </>
  );
});

GameplaySettings.displayName = 'GameplaySettings';
