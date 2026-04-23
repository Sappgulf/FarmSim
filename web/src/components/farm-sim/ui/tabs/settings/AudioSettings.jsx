import React, { memo } from 'react';
import { SettingToggleRow } from './SettingToggleRow';
import { TabSection } from '../TabSurface';

const VolumeSlider = memo(({
  id,
  name,
  value,
  min = 0,
  max = 1,
  step = 0.05,
  onChange,
  disabled,
  fillColor = '#10b981',
  label,
  helpId,
  helpText,
  badgeClass,
}) => {
  const percent = Math.round(((value - min) / (max - min)) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-medium text-slate-800">
          {label}
        </label>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-slate-400"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        </svg>
        <input
          id={id}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={helpId}
          aria-label={label}
          className="range-premium w-full"
          style={{
            '--range-value': `${percent}%`,
            '--range-fill': fillColor,
          }}
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-slate-400"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </div>
      <p id={helpId} className="text-xs leading-relaxed text-slate-500">
        {helpText}
      </p>
    </div>
  );
});

VolumeSlider.displayName = 'VolumeSlider';

export const AudioSettings = memo(({
  soundEnabled,
  musicEnabled,
  handleToggleSound,
  handleToggleMusic,
  handleSoundVolumeChange,
  handleMusicVolumeChange,
  soundVolume,
  musicVolume,
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
        action={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-5 w-5 text-emerald-500/60"
            aria-hidden="true"
          >
            <path d="M2 10v4" />
            <path d="M6 8v8" />
            <path d="M10 6v12" />
            <path d="M14 9v6" />
            <path d="M18 11v2" />
          </svg>
        }
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
          <VolumeSlider
            id="sound-effects-volume"
            name="soundEffectsVolume"
            value={soundVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={handleSoundVolumeChange}
            disabled={!soundEnabled}
            fillColor="#10b981"
            label="Sound Effects"
            helpId="sound-effects-volume-help"
            helpText="Sets the mix for clicks, harvests, and other direct action sounds."
            badgeClass="bg-emerald-100 text-emerald-700"
          />

          <VolumeSlider
            id="music-volume"
            name="musicVolume"
            value={musicVolume}
            min={0}
            max={0.5}
            step={0.025}
            onChange={handleMusicVolumeChange}
            disabled={!musicEnabled}
            fillColor="#0ea5e9"
            label="Music"
            helpId="music-volume-help"
            helpText="Seasonal background tracks stay softer so they support, not compete."
            badgeClass="bg-sky-100 text-sky-700"
          />
        </div>
      </TabSection>
    </>
  );
});

AudioSettings.displayName = 'AudioSettings';
