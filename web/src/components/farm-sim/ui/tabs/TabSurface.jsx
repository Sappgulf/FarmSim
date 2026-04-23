import React, { memo } from 'react';

const TONES = {
  emerald: {
    shell: 'from-emerald-300 via-emerald-200 to-teal-200',
    border: 'border-emerald-100/90',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    title: 'text-emerald-950',
    description: 'text-emerald-700',
  },
  sky: {
    shell: 'from-sky-300 via-sky-200 to-indigo-200',
    border: 'border-sky-100/90',
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-700',
    title: 'text-sky-950',
    description: 'text-sky-700',
  },
  amber: {
    shell: 'from-amber-300 via-amber-200 to-orange-200',
    border: 'border-amber-100/90',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    title: 'text-amber-950',
    description: 'text-amber-700',
  },
  violet: {
    shell: 'from-violet-300 via-violet-200 to-fuchsia-200',
    border: 'border-violet-100/90',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-700',
    title: 'text-violet-950',
    description: 'text-violet-700',
  },
  rose: {
    shell: 'from-rose-300 via-rose-200 to-pink-200',
    border: 'border-rose-100/90',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
    title: 'text-rose-950',
    description: 'text-rose-700',
  },
  slate: {
    shell: 'from-slate-300 via-slate-200 to-zinc-200',
    border: 'border-slate-200/80',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
    title: 'text-slate-950',
    description: 'text-slate-700',
  },
};

const DARK_TONES = {
  emerald: {
    border: 'dark:border-emerald-800/70',
    iconBg: 'dark:bg-emerald-900/60',
    iconText: 'dark:text-emerald-300',
    title: 'dark:text-emerald-100',
    description: 'dark:text-emerald-400',
  },
  sky: {
    border: 'dark:border-sky-800/70',
    iconBg: 'dark:bg-sky-900/60',
    iconText: 'dark:text-sky-300',
    title: 'dark:text-sky-100',
    description: 'dark:text-sky-400',
  },
  amber: {
    border: 'dark:border-amber-800/70',
    iconBg: 'dark:bg-amber-900/60',
    iconText: 'dark:text-amber-300',
    title: 'dark:text-amber-100',
    description: 'dark:text-amber-400',
  },
  violet: {
    border: 'dark:border-violet-800/70',
    iconBg: 'dark:bg-violet-900/60',
    iconText: 'dark:text-violet-300',
    title: 'dark:text-violet-100',
    description: 'dark:text-violet-400',
  },
  rose: {
    border: 'dark:border-rose-800/70',
    iconBg: 'dark:bg-rose-900/60',
    iconText: 'dark:text-rose-300',
    title: 'dark:text-rose-100',
    description: 'dark:text-rose-400',
  },
  slate: {
    border: 'dark:border-slate-700/70',
    iconBg: 'dark:bg-slate-800/60',
    iconText: 'dark:text-slate-300',
    title: 'dark:text-slate-100',
    description: 'dark:text-slate-400',
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

const DARK_METRIC_TONES = {
  emerald: {
    chip: 'dark:bg-emerald-900/60 dark:text-emerald-300',
    label: 'dark:text-emerald-400',
    value: 'dark:text-emerald-100',
  },
  sky: {
    chip: 'dark:bg-sky-900/60 dark:text-sky-300',
    label: 'dark:text-sky-400',
    value: 'dark:text-sky-100',
  },
  amber: {
    chip: 'dark:bg-amber-900/60 dark:text-amber-300',
    label: 'dark:text-amber-400',
    value: 'dark:text-amber-100',
  },
  violet: {
    chip: 'dark:bg-violet-900/60 dark:text-violet-300',
    label: 'dark:text-violet-400',
    value: 'dark:text-violet-100',
  },
  rose: {
    chip: 'dark:bg-rose-900/60 dark:text-rose-300',
    label: 'dark:text-rose-400',
    value: 'dark:text-rose-100',
  },
  slate: {
    chip: 'dark:bg-slate-800/60 dark:text-slate-300',
    label: 'dark:text-slate-400',
    value: 'dark:text-slate-100',
  },
};

const getTone = (tone, palette) => palette[tone] || palette.slate;

export const TabSection = memo(({ title, description, tone = 'slate', action, children, className = '', bodyClassName = '', ...props }) => {
  const theme = getTone(tone, TONES);
  const darkTheme = getTone(tone, DARK_TONES);

  return (
    <section className={`relative overflow-hidden rounded-[30px] border ${theme.border} ${darkTheme.border} bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] shadow-[0_10px_26px_-24px_rgba(15,23,42,0.22)] animate-fade-in dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,0.88))] dark:shadow-[0_10px_26px_-24px_rgba(0,0,0,0.4)] ${className}`} {...props}>
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${theme.shell}`} />
      <div className="pointer-events-none absolute -right-16 -top-12 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
      <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-white/80 px-5 py-4 dark:border-slate-700/60`}>
        <div className="space-y-1">
          <div className={`text-[10px] font-semibold uppercase tracking-[0.34em] ${theme.description} ${darkTheme.description} opacity-80`}>Section</div>
          <h4 className={`text-base font-semibold tracking-tight ${theme.title} ${darkTheme.title}`}>{title}</h4>
          {description ? <p className={`max-w-3xl text-sm leading-6 ${theme.description} ${darkTheme.description}`}>{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={`px-5 py-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
});

TabSection.displayName = 'TabSection';

export const TabEmptyState = memo(({ icon = '📭', title, description, tone = 'slate', action, className = '', ...props }) => {
  const theme = getTone(tone, TONES);
  const darkTheme = getTone(tone, DARK_TONES);

  return (
    <div className={`relative overflow-hidden rounded-[24px] border ${theme.border} ${darkTheme.border} bg-white/82 px-4 py-5 text-center shadow-[0_8px_20px_-20px_rgba(15,23,42,0.2)] animate-fade-in dark:bg-slate-800/82 dark:shadow-[0_8px_20px_-20px_rgba(0,0,0,0.4)] ${className}`} {...props}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.shell}`} />
      <div className={`mx-auto grid h-12 w-12 place-items-center rounded-[18px] ${theme.iconBg} ${darkTheme.iconBg} ${theme.iconText} ${darkTheme.iconText}`}>
        <span className="text-xl leading-none" aria-hidden="true">{icon}</span>
      </div>
      <div className={`mt-3 text-base font-semibold ${theme.title} ${darkTheme.title}`}>{title}</div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
});

TabEmptyState.displayName = 'TabEmptyState';

export const TabHero = memo(({ icon, title, description, tone = 'slate', badge, actions, children, className = '', ...props }) => {
  const theme = getTone(tone, TONES);
  const darkTheme = getTone(tone, DARK_TONES);

  return (
    <section className={`relative overflow-hidden rounded-[34px] border ${theme.border} ${darkTheme.border} bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.86))] shadow-[0_12px_28px_-26px_rgba(15,23,42,0.22)] animate-fade-in dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.94),rgba(15,23,42,0.88))] dark:shadow-[0_12px_28px_-26px_rgba(0,0,0,0.4)] ${className}`} {...props}>
      <div className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${theme.shell}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.8),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.05),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.02),_transparent_34%)]" />
      <div className="relative grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-end">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] ${theme.iconBg} ${darkTheme.iconBg} ${theme.iconText} ${darkTheme.iconText}`}>
              <span className="text-lg leading-none" aria-hidden="true">{icon}</span>
            </div>
          ) : null}
          <div className="space-y-1">
            <div className={`text-[10px] font-semibold uppercase tracking-[0.34em] ${theme.description} ${darkTheme.description} opacity-80`}>Overview</div>
            <h3 className={`text-xl font-semibold tracking-tight ${theme.title} ${darkTheme.title}`}>{title}</h3>
            <p className={`max-w-2xl text-sm leading-6 ${theme.description} ${darkTheme.description}`}>{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end lg:text-right">
          {badge}
          {actions}
        </div>
      </div>
      {children ? <div className="relative border-t border-white/80 px-5 py-5 dark:border-slate-700/60">{children}</div> : null}
    </section>
  );
});

TabHero.displayName = 'TabHero';

export const MetricTile = memo(({ label, value, hint, tone = 'slate', icon, className = '', ...props }) => {
  const theme = getTone(tone, METRIC_TONES);
  const darkTheme = getTone(tone, DARK_METRIC_TONES);

  return (
    <div className={`relative overflow-hidden rounded-[22px] border border-slate-200/60 bg-white/80 px-4 py-3 shadow-[0_8px_18px_-20px_rgba(15,23,42,0.18)] animate-fade-in dark:bg-slate-800/80 dark:border-slate-700/60 dark:shadow-[0_8px_18px_-20px_rgba(0,0,0,0.35)] ${className}`} {...props}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.chip}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.label} ${darkTheme.label}`}>{label}</div>
          <div className={`mt-1 text-2xl font-semibold leading-none ${theme.value} ${darkTheme.value}`}>{value}</div>
        </div>
        {icon ? (
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-[14px] ${theme.chip} ${darkTheme.chip}`}>
            <span className="text-sm leading-none" aria-hidden="true">{icon}</span>
          </div>
        ) : null}
      </div>
      {hint ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</div> : null}
    </div>
  );
});

MetricTile.displayName = 'MetricTile';
