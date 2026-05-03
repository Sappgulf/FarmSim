import React, { memo } from 'react';
import { Card } from '../../../ui/card';

const TONES = {
  emerald: {
    shell: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    title: 'text-emerald-900',
    description: 'text-emerald-700',
  },
  sky: {
    shell: 'from-sky-50 to-indigo-50',
    border: 'border-sky-100',
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-700',
    title: 'text-sky-900',
    description: 'text-sky-700',
  },
  amber: {
    shell: 'from-amber-50 to-orange-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    title: 'text-amber-900',
    description: 'text-amber-700',
  },
  violet: {
    shell: 'from-violet-50 to-fuchsia-50',
    border: 'border-violet-100',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-700',
    title: 'text-violet-900',
    description: 'text-violet-700',
  },
  rose: {
    shell: 'from-rose-50 to-pink-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
    title: 'text-rose-900',
    description: 'text-rose-700',
  },
  slate: {
    shell: 'from-slate-50 to-zinc-50',
    border: 'border-slate-100',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
    title: 'text-slate-900',
    description: 'text-slate-700',
  },
};

const METRIC_TONES = {
  emerald: {
    chip: 'bg-emerald-100 text-emerald-700',
    label: 'text-emerald-700',
    value: 'text-emerald-950',
  },
  sky: {
    chip: 'bg-sky-100 text-sky-700',
    label: 'text-sky-700',
    value: 'text-sky-950',
  },
  amber: {
    chip: 'bg-amber-100 text-amber-700',
    label: 'text-amber-700',
    value: 'text-amber-950',
  },
  violet: {
    chip: 'bg-violet-100 text-violet-700',
    label: 'text-violet-700',
    value: 'text-violet-950',
  },
  rose: {
    chip: 'bg-rose-100 text-rose-700',
    label: 'text-rose-700',
    value: 'text-rose-950',
  },
  slate: {
    chip: 'bg-slate-100 text-slate-700',
    label: 'text-slate-700',
    value: 'text-slate-950',
  },
};

const getTone = (tone, palette) => palette[tone] || palette.slate;

export const TabSection = memo(
  ({
    title,
    description,
    tone = 'slate',
    action,
    children,
    className = '',
    bodyClassName = '',
  }) => {
    const theme = getTone(tone, TONES);

    return (
      <Card
        className={`overflow-hidden border ${theme.border} bg-white/90 shadow-sm transition-shadow duration-200 hover:shadow-md animate-fade-in ${className}`}
      >
        <div
          className={`flex flex-wrap items-start justify-between gap-3 border-b border-white/70 bg-gradient-to-r ${theme.shell} px-4 py-3`}
        >
          <div className="space-y-1">
            <h4 className={`text-base font-semibold ${theme.title}`}>{title}</h4>
            {description ? <p className={`text-sm ${theme.description}`}>{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>
      </Card>
    );
  }
);

TabSection.displayName = 'TabSection';

export const TabEmptyState = memo(
  ({ icon = '📭', title, description, tone = 'slate', action, className = '' }) => {
    const theme = getTone(tone, TONES);

    return (
      <div
        className={`rounded-2xl border ${theme.border} bg-white/90 px-4 py-5 text-center shadow-sm transition-transform duration-200 animate-fade-in ${className}`}
      >
        <div
          className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${theme.iconBg} ${theme.iconText} shadow-sm`}
        >
          <span className="text-xl leading-none">{icon}</span>
        </div>
        <div className={`mt-3 text-base font-semibold ${theme.title}`}>{title}</div>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    );
  }
);

TabEmptyState.displayName = 'TabEmptyState';

export const TabHero = memo(
  ({ icon, title, description, tone = 'slate', badge, actions, children, className = '' }) => {
    const theme = getTone(tone, TONES);

    return (
      <Card
        className={`overflow-hidden border ${theme.border} shadow-sm transition-shadow duration-200 hover:shadow-md animate-fade-in ${className}`}
      >
        <div className={`bg-gradient-to-r ${theme.shell} px-4 py-4`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {icon ? (
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${theme.iconBg} ${theme.iconText} shadow-sm`}
                >
                  <span className="text-lg leading-none">{icon}</span>
                </div>
              ) : null}
              <div className="space-y-1">
                <h3 className={`text-lg font-semibold ${theme.title}`}>{title}</h3>
                <p className={`text-sm ${theme.description}`}>{description}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              {badge}
              {actions}
            </div>
          </div>
        </div>
        {children ? (
          <div className="border-t border-white/70 bg-white/75 px-4 py-4">{children}</div>
        ) : null}
      </Card>
    );
  }
);

TabHero.displayName = 'TabHero';

export const MetricTile = memo(({ label, value, hint, tone = 'slate', icon, className = '' }) => {
  const theme = getTone(tone, METRIC_TONES);

  return (
    <div
      className={`rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-fade-in ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-wide ${theme.label}`}>
            {label}
          </div>
          <div className={`mt-1 text-lg font-semibold leading-none ${theme.value}`}>{value}</div>
        </div>
        {icon ? (
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${theme.chip}`}>
            <span className="text-sm leading-none">{icon}</span>
          </div>
        ) : null}
      </div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
});

MetricTile.displayName = 'MetricTile';
