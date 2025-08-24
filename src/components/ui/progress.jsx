import React from "react";

export function Progress({ value = 0, className = "", ...props }) {
  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
      />
    </div>
  );
}
