import React from "react";

export function Progress({ value = 0, className = "", variant = "default", ...props }) {
  const getGradient = () => {
    switch (variant) {
      case "xp":
        return "from-blue-400 via-blue-500 to-blue-600";
      case "health":
        return "from-red-400 via-red-500 to-red-600";
      case "energy":
        return "from-yellow-400 via-yellow-500 to-yellow-600";
      case "growth":
        return "from-green-400 via-emerald-500 to-green-600";
      default:
        return "from-emerald-400 via-emerald-500 to-green-600";
    }
  };

  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner ${className}`}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      {...props}
    >
      {/* Progress bar with shine effect */}
      <div
        className={`h-full bg-gradient-to-r ${getGradient()} transition-[width,background-color,box-shadow] duration-500 ease-out relative`}
        style={{ 
          width: `${Math.min(100, Math.max(0, value || 0))}%`,
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
        }}
      >
        {/* Shine overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          style={{
            animation: 'shine 2s ease-in-out infinite'
          }}
        />
        {/* Glow on the right edge */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-4"
          style={{
            background: 'radial-gradient(ellipse at right, rgba(255, 255, 255, 0.6), transparent)',
            filter: 'blur(2px)'
          }}
        />
      </div>
    </div>
  );
}
