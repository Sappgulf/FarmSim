import React, { useRef } from "react";

export function Button({ children, onClick, variant = "default", size = "default", className = "", ...props }) {
  const buttonRef = useRef(null);
  
  const baseClasses = "relative overflow-hidden inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] shadow-sm hover:shadow-md";
  
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus-visible:ring-emerald-500",
    default: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus-visible:ring-emerald-500",
    destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500",
    secondary: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 border border-slate-300",
    outline: "border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 hover:border-slate-400",
    ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 shadow-none",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  const createRipple = (event) => {
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleClick = (event) => {
    createRipple(event);
    if (onClick) onClick(event);
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
