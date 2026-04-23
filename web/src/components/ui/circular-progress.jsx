import React from 'react';

const COLOR_CLASSES = {
  emerald: 'text-emerald-500',
  green: 'text-green-500',
  amber: 'text-amber-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  rose: 'text-rose-500',
  blue: 'text-blue-500',
  sky: 'text-sky-500',
  violet: 'text-violet-500',
  purple: 'text-purple-500',
  slate: 'text-slate-500',
};

export function CircularProgress({
  value = 0,
  size = 64,
  strokeWidth = 4,
  color = 'emerald',
  showText = true,
  children,
  className = '',
}) {
  const safeValue = Math.min(100, Math.max(0, value || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.emerald;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        />
      </svg>
      {showText && !children && (
        <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-200">
          {Math.round(safeValue)}%
        </span>
      )}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

CircularProgress.displayName = 'CircularProgress';
