import React from "react";

export function Badge({ className = "", variant = "default", children, ...props }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 border shadow-sm";
  
  const variants = {
    default: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800",
    secondary: "border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700",
    destructive: "border-red-200 bg-gradient-to-r from-red-50 to-red-100 text-red-800",
    success: "border-green-200 bg-gradient-to-r from-green-50 to-green-100 text-green-800",
    warning: "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800",
    info: "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800",
    outline: "border-slate-300 bg-white/80 backdrop-blur-sm text-slate-600",
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
