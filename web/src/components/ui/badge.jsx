import React from "react";

export function Badge({
  className = "",
  variant = "default",
  children,
  dot = false,
  pulse = false,
  gradientText = false,
  ...props
}) {
  const dotColors = {
    default: "bg-emerald-500",
    secondary: "bg-slate-400",
    destructive: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    outline: "bg-slate-400",
    premium: "bg-purple-500",
    ghost: "bg-slate-400",
    "outline-strong": "bg-slate-400",
  };

  const baseClasses = `
    inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold
    transition-all duration-200 border
    ${pulse ? "animate-[badge-pulse_2s_ease-in-out_infinite]" : ""}
    ${className}
  `;

  const variants = {
    default: `
      border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-emerald-800/60 dark:from-emerald-950/80 dark:to-emerald-900/70 dark:text-emerald-200
    `,
    secondary: `
      border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-700
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-slate-700/60 dark:from-slate-800/80 dark:to-slate-900/70 dark:text-slate-300
    `,
    destructive: `
      border-red-200/80 bg-gradient-to-r from-red-50 to-red-100/80 text-red-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-red-800/60 dark:from-red-950/80 dark:to-red-900/70 dark:text-red-200
    `,
    success: `
      border-green-200/80 bg-gradient-to-r from-green-50 to-green-100/80 text-green-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-green-800/60 dark:from-green-950/80 dark:to-green-900/70 dark:text-green-200
    `,
    warning: `
      border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-amber-800/60 dark:from-amber-950/80 dark:to-amber-900/70 dark:text-amber-200
    `,
    info: `
      border-blue-200/80 bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-blue-800/60 dark:from-blue-950/80 dark:to-blue-900/70 dark:text-blue-200
    `,
    outline: `
      border-slate-300/80 bg-white/80 backdrop-blur-sm text-slate-600
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-slate-600/60 dark:bg-slate-800/80 dark:text-slate-300
    `,
    premium: `
      border-purple-200/80 bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 text-purple-800
      shadow-[0_2px_6px_-2px_rgba(139,92,246,0.2)]
      dark:border-purple-800/60 dark:from-purple-950/80 dark:via-violet-950/70 dark:to-indigo-950/70 dark:text-purple-200
    `,
    ghost: `
      border-transparent bg-transparent text-slate-600
      hover:bg-slate-100/60
      dark:text-slate-400 dark:hover:bg-slate-800/60
    `,
    "outline-strong": `
      border-2 border-slate-300 bg-white/90 backdrop-blur-sm text-slate-700
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-300
    `,
  };

  const textContent = (
    <span
      className={
        gradientText
          ? "bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400"
          : ""
      }
    >
      {children}
    </span>
  );

  return (
    <div className={`${baseClasses} ${variants[variant] || variants.default}`} {...props}>
      {dot && (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${dotColors[variant] || dotColors.default} ${pulse ? "animate-ping" : ""}`}
        />
      )}
      {textContent}
    </div>
  );
}
