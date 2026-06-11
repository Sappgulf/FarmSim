import React, { memo } from 'react';
import { Card } from '../../../../ui/card';
import { Badge } from '../../../../ui/badge';
import { SettingToggleRow } from './SettingToggleRow';

const HOTKEY_ROWS = [
  { keys: ['1', '9'], description: 'Switch to tabs 1–9 (Farming, Inventory, Shop, …)' },
  { keys: ['W'], description: 'Water all plots' },
  { keys: ['H'], description: 'Harvest all ready crops' },
  { keys: ['F'], description: 'Fertilize all plots' },
  { keys: ['T'], description: 'Treat diseased plots' },
  { keys: ['Space'], description: 'Pause / resume the game loop' },
  { keys: ['⌘', 'S'], description: 'Save manually' },
  { keys: ['Alt', 'Shift', 'P'], description: 'Toggle the dev performance HUD' },
];

export const GameplaySettings = memo(
  ({
    autoSaveEnabled,
    animationsEnabled,
    showFPS,
    reducedMotion,
    showTooltips,
    showAlmanacHints,
    showWelcomeBackSummary,
    fastMode,
    particleEffects,
    keyboardShortcutsEnabled,
    handleToggleAnimations,
    handleToggleAutoSave,
    handleToggleShowFps,
    handleToggleReducedMotion,
    handleToggleTooltips,
    handleToggleAlmanacHints,
    handleToggleWelcomeBackSummary,
    handleToggleFastMode,
    handleToggleParticleEffects,
    handleToggleKeyboardShortcuts,
  }) => {
    const experienceRows = [
      {
        key: 'auto-save',
        title: 'Auto-Save',
        description:
          'Persists progress in the background while you play (about every 30s when the game is running).',
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
        key: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Number keys jump between tabs; W/H/F/T run board-wide actions; Space pauses.',
        enabled: keyboardShortcutsEnabled,
        onToggle: handleToggleKeyboardShortcuts,
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

        <Card
          className="overflow-hidden border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-4"
          aria-labelledby="hotkey-cheatsheet-heading"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                Hotkeys
              </div>
              <h4 id="hotkey-cheatsheet-heading" className="text-base font-semibold text-slate-900">
                Cheat sheet
              </h4>
            </div>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
              {keyboardShortcutsEnabled ? 'Shortcuts on' : 'Shortcuts paused'}
            </Badge>
          </div>
          <p className="mb-3 text-xs text-slate-600">
            Shortcuts are disabled while you are typing in a field. Toggle them off in Core
            preferences if you need to free the keys.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2" aria-label="Keyboard shortcuts">
            {HOTKEY_ROWS.map((row) => (
              <li
                key={row.description}
                className="flex items-center gap-2 rounded-md border border-amber-100 bg-white/70 px-2 py-1.5"
              >
                <span className="flex flex-wrap gap-1">
                  {row.keys.map((key) => (
                    <kbd
                      key={key}
                      className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-900 shadow-sm"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
                <span className="text-xs text-slate-700">{row.description}</span>
              </li>
            ))}
          </ul>
        </Card>
      </>
    );
  }
);

GameplaySettings.displayName = 'GameplaySettings';
