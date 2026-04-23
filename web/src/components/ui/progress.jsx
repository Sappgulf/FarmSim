import React from "react";

export function Progress({
  value = 0,
  className = "",
  variant = "default",
  stripes = false,
  ...props
}) {
  const clampedValue = Math.min(100, Math.max(0, value || 0));
  const isNearComplete = clampedValue >= 90;

  const getGradient = () => {
    switch (variant) {
      case "xp":
        return "from-blue-400 via-blue-500 to-blue-700";
      case "health":
        return "from-red-400 via-red-500 to-red-700";
      case "energy":
        return "from-yellow-400 via-yellow-500 to-amber-600";
      case "growth":
        return "from-green-400 via-emerald-500 to-green-700";
      default:
        return "from-emerald-400 via-emerald-500 to-green-700";
    }
  };

  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] dark:bg-slate-700/80 ${className}`}
      {...props}
    >
      {/* Track inner highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />

      {/* Progress bar */}
      <div
        className={`
          relative h-full bg-gradient-to-r ${getGradient()}
          transition-[width,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${stripes ? "progress-striped" : ""}
          ${isNearComplete ? "shadow-[0_0_14px_rgba(16,185,129,0.5)]" : "shadow-[0_0_8px_rgba(16,185,129,0.25)]"}
        `}
        style={{ width: `${clampedValue}%` }}
      >
        {/* Subtle top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/40 dark:bg-white/20" />

        {/* Shine overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          style={{ animation: "shine 2.5s ease-in-out infinite" }}
        />

        {/* Glow on the right edge */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-5"
          style={{
            background:
              "radial-gradient(ellipse at right, rgba(255,255,255,0.5), transparent)",
            filter: "blur(2px)",
          }}
        />
      </div>
    </div>
  );
}
