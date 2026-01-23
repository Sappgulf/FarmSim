import React, { useState, useCallback } from "react";

export function Button({ children, onClick, variant = "default", size = "default", className = "", juicy = false, ...props }) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback((e) => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.(e);
  }, [onClick]);

  const baseClasses = `
    inline-flex items-center justify-center rounded-xl text-sm font-semibold
    transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    shadow-sm hover:shadow-lg
    transform-gpu
    ${juicy ? 'btn-juicy' : ''}
    ${isPressed ? 'scale-95' : 'active:scale-95'}
  `;

  const variants = {
    default: `
      bg-gradient-to-br from-emerald-500 to-emerald-600 text-white
      hover:from-emerald-400 hover:to-emerald-600
      focus-visible:ring-emerald-500
      shadow-emerald-200/50 hover:shadow-emerald-300/50
    `,
    destructive: `
      bg-gradient-to-br from-red-500 to-red-600 text-white
      hover:from-red-400 hover:to-red-600
      focus-visible:ring-red-500
      shadow-red-200/50 hover:shadow-red-300/50
    `,
    secondary: `
      bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700
      hover:from-slate-50 hover:to-slate-200
      border border-slate-200
      shadow-slate-200/50
    `,
    outline: `
      border-2 border-slate-200 bg-white/90 backdrop-blur-sm text-slate-700
      hover:bg-slate-50 hover:border-slate-300
      shadow-sm
    `,
    ghost: `
      text-slate-600 hover:bg-slate-100/80 hover:text-slate-900
      shadow-none hover:shadow-none
    `,
    success: `
      bg-gradient-to-br from-green-500 to-emerald-600 text-white
      hover:from-green-400 hover:to-emerald-600
      focus-visible:ring-green-500
      shadow-green-200/50 hover:shadow-green-300/50
    `,
    warning: `
      bg-gradient-to-br from-amber-500 to-orange-600 text-white
      hover:from-amber-400 hover:to-orange-600
      focus-visible:ring-amber-500
      shadow-amber-200/50 hover:shadow-amber-300/50
    `,
    premium: `
      bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 text-white
      hover:from-purple-400 hover:via-violet-500 hover:to-indigo-600
      focus-visible:ring-purple-500
      shadow-purple-200/50 hover:shadow-purple-300/50
    `,
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base font-bold",
    xl: "h-14 px-8 text-lg font-bold",
    icon: "h-10 w-10 p-0",
    "icon-sm": "h-8 w-8 p-0",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
