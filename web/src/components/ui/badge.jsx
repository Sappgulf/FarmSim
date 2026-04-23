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
    `,
    secondary: `
      border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-700
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
    destructive: `
      border-red-200/80 bg-gradient-to-r from-red-50 to-red-100/80 text-red-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
    success: `
      border-green-200/80 bg-gradient-to-r from-green-50 to-green-100/80 text-green-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
    warning: `
      border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
    info: `
      border-blue-200/80 bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-800
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
    outline: `
      border-slate-300/80 bg-white/80 backdrop-blur-sm text-slate-600
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
    premium: `
      border-purple-200/80 bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 text-purple-800
      shadow-[0_2px_6px_-2px_rgba(139,92,246,0.2)]
    `,
    ghost: `
      border-transparent bg-transparent text-slate-600
      hover:bg-slate-100/60
    `,
    "outline-strong": `
      border-2 border-slate-300 bg-white/90 backdrop-blur-sm text-slate-700
      shadow-[0_1px_2px_rgba(0,0,0,0.04)]
    `,
  };

  const textContent = (
    <span
      className={
        gradientText
          ? "bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent"
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
