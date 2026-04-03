import React, { memo } from 'react';
import { SettingToggleRow } from './SettingToggleRow';
import { TabSection } from '../TabSurface';

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
      <TabSection
        title="Sound and music"
        description="Action feedback, seasonal music, and mix levels."
        tone="emerald"
        bodyClassName="space-y-4"
      >
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

        <div className="space-y-5 border-t border-slate-200/70 pt-4">
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
      </TabSection>
    </>
  );
});

AudioSettings.displayName = 'AudioSettings';
