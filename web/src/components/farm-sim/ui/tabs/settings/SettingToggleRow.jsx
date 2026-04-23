import React, { memo } from 'react';

const ToggleSwitch = memo(({ enabled, label, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={enabled}
    aria-label={label}
    className={`
      relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-400 focus-visible:ring-offset-2
      active:scale-95
      ${enabled
        ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm shadow-emerald-200/70 dark:shadow-emerald-900/50'
        : 'border-slate-300 bg-slate-300 shadow-inner dark:border-slate-600 dark:bg-slate-600'}
    `}
  >
    <span
      aria-hidden="true"
      className={`
        inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${enabled ? 'translate-x-6' : 'translate-x-1'}
      `}
    >
      <span className={`text-[10px] font-bold ${enabled ? 'text-emerald-500' : 'text-slate-400'}`}>
        {enabled ? '✓' : '−'}
      </span>
    </span>
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
    <div className={`group flex items-start justify-between gap-4 rounded-[20px] border border-slate-200/60 bg-white/66 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-white/80 dark:bg-slate-800/66 dark:border-slate-700/60 dark:hover:bg-slate-800/80 ${className}`}>
      <div className={`min-w-0 border-l-[3px] pl-3 transition-colors duration-200 ${enabled ? 'border-emerald-400' : 'border-slate-200 dark:border-slate-700'}`}>
        <div className="font-medium text-slate-950 dark:text-slate-100">{title}</div>
        {description && (
          <div className="text-sm leading-snug text-slate-600 dark:text-slate-400">
            {description}
          </div>
        )}
      </div>
      <ToggleSwitch enabled={enabled} label={label || title} onToggle={onToggle} />
    </div>
  );
});

SettingToggleRow.displayName = 'SettingToggleRow';
