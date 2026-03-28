import React, { memo } from 'react';
import { Card } from '../../../../ui/card';
import { SettingToggleRow } from './SettingToggleRow';

export const AudioSettings = memo(({
  soundEnabled,
  musicEnabled,
  handleToggleSound,
  handleToggleMusic,
  handleSoundVolumeChange,
  handleMusicVolumeChange,
  soundVolume,
  musicVolume
}) => {
  const rows = [
    {
      key: 'sound',
      title: 'Sound Effects',
      description: 'Action feedback for harvests, clicks, and rewards.',
      enabled: soundEnabled,
      onToggle: handleToggleSound,
    },
    {
      key: 'music',
      title: 'Background Music',
      description: 'Seasonal themes that follow the farm rhythm.',
      enabled: musicEnabled,
      onToggle: handleToggleMusic,
    },
  ];

  return (
    <>
      <Card className="overflow-hidden border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Audio
            </div>
            <h4 className="text-base font-semibold text-slate-900">Sound and music</h4>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
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

      <Card className="overflow-hidden border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Volume
            </div>
            <h4 className="text-base font-semibold text-slate-900">Fine-tune the mix</h4>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="sound-effects-volume" className="font-medium text-slate-800">
                Sound Effects
              </label>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
            <input
              id="sound-effects-volume"
              name="soundEffectsVolume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              disabled={!soundEnabled}
              aria-describedby="sound-effects-volume-help"
              aria-label="Sound effects volume"
              className="w-full cursor-pointer accent-emerald-500"
            />
            <p id="sound-effects-volume-help" className="text-xs leading-relaxed text-slate-500">
              Sets the mix for clicks, harvests, and other direct action sounds.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="music-volume" className="font-medium text-slate-800">
                Music
              </label>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
            <input
              id="music-volume"
              name="musicVolume"
              type="range"
              min="0"
              max="0.5"
              step="0.025"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!musicEnabled}
              aria-describedby="music-volume-help"
              aria-label="Music volume"
              className="w-full cursor-pointer accent-sky-500"
            />
            <p id="music-volume-help" className="text-xs leading-relaxed text-slate-500">
              Seasonal background tracks stay softer so they support, not compete.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
});

AudioSettings.displayName = 'AudioSettings';
