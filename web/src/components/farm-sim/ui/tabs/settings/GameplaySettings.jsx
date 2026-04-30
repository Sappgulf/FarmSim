import React, { memo } from 'react';
import { SettingToggleRow } from './SettingToggleRow';
import { TabSection } from '../TabSurface';

export const GameplaySettings = memo(({
  autoSaveEnabled,
  animationsEnabled,
  graphicsQuality,
  showFPS,
  reducedMotion,
  showTooltips,
  showAlmanacHints,
  showWelcomeBackSummary,
  fastMode,
  particleEffects,
  darkMode,
  handleToggleAnimations,
  handleGraphicsQualityChange,
  handleToggleAutoSave,
  handleToggleShowFps,
  handleToggleReducedMotion,
  handleToggleTooltips,
  handleToggleAlmanacHints,
  handleToggleWelcomeBackSummary,
  handleToggleFastMode,
  handleToggleParticleEffects,
  handleToggleDarkMode
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
    {
      key: 'dark-mode',
      title: 'Dark Mode',
      description: 'Switch to a darker color theme for low-light comfort.',
      enabled: darkMode,
      onToggle: handleToggleDarkMode,
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
      <TabSection
        title={
          <span className="inline-flex items-center gap-2">
            <span className="text-lg leading-none" aria-hidden="true">🎮</span>
            <span>Gameplay preferences</span>
          </span>
        }
        description="Core simulation and comfort settings."
        tone="violet"
        bodyClassName="space-y-4"
      >
        <div
          className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/40"
          role="group"
          aria-label="Visual quality preset"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 dark:text-slate-100">Visual quality</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Matches rain/snow particle density and burst effects. Saves with your farm.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: 'low', label: 'Low', hint: 'Best for older phones' },
              { id: 'medium', label: 'Balanced', hint: 'Default feel' },
              { id: 'high', label: 'High', hint: 'Full effects' },
            ].map(({ id, label, hint }) => (
              <button
                key={id}
                type="button"
                title={hint}
                onClick={() => handleGraphicsQualityChange(id)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                  graphicsQuality === id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-50'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
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

      <TabSection
        title={
          <span className="inline-flex items-center gap-2">
            <span className="text-lg leading-none" aria-hidden="true">💡</span>
            <span>Assistance and polish</span>
          </span>
        }
        description="Hints, overlays, and other supporting affordances."
        tone="sky"
        bodyClassName="space-y-4"
      >
        <div className="space-y-4">
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
