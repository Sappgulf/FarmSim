import React, { memo } from 'react';

const ToggleSwitch = memo(({ enabled, label, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={enabled}
    aria-label={label}
    className={`
      relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
      ${enabled
        ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm shadow-emerald-200/70'
        : 'border-slate-300 bg-slate-300 shadow-inner'}
    `}
  >
    <span
      aria-hidden="true"
      className={`
        inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200
        ${enabled ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
));

ToggleSwitch.displayName = 'ToggleSwitch';

export const SettingToggleRow = memo(({
  title,
  description,
  enabled,
  onToggle,
  label,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-3 shadow-sm ${className}`}>
      <div className="min-w-0">
        <div className="font-medium text-slate-900">{title}</div>
        {description && (
          <div className="text-sm leading-snug text-slate-600">
            {description}
          </div>
        )}
      </div>
      <ToggleSwitch
        enabled={enabled}
        label={label || title}
        onToggle={onToggle}
      />
    </div>
  );
});

SettingToggleRow.displayName = 'SettingToggleRow';
