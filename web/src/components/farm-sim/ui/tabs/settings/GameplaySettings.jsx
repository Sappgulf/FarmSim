import React, { memo } from 'react';
import { SettingToggleRow } from './SettingToggleRow';
import { TabSection } from '../TabSurface';

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
      description: 'Persist progress every 30 seconds.',
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
      <TabSection title="Gameplay preferences" description="Core simulation and comfort settings." tone="violet" bodyClassName="space-y-3">
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
      </TabSection>

      <TabSection title="Assistance and polish" description="Hints, overlays, and other supporting affordances." tone="sky" bodyClassName="space-y-3">
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
      </TabSection>
    </>
  );
});

GameplaySettings.displayName = 'GameplaySettings';
