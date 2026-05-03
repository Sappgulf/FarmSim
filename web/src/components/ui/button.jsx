import React, { useRef, useState, useCallback, forwardRef } from "react";

/**
 * Premium Button component with juicy animations and ripple effects
 */
export const Button = forwardRef(function Button({
  children,
  onClick,
  type = "button",
  variant = "default",
  size = "default",
  className = "",
  juicy = false,
  ...props
}, forwardedRef) {
  const buttonRef = useRef(null);
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `
    relative overflow-hidden inline-flex items-center justify-center
    rounded-xl text-sm font-semibold
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
    gold: `
      bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-amber-900
      hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500
      focus-visible:ring-amber-500
      shadow-amber-200/50 hover:shadow-amber-300/50
      font-bold
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

  const createRipple = useCallback((event) => {
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const hasPointerPosition = Number.isFinite(event?.clientX) && Number.isFinite(event?.clientY)
      && (event.clientX !== 0 || event.clientY !== 0);
    const centerX = rect.width / 2 - size / 2;
    const centerY = rect.height / 2 - size / 2;
    const x = hasPointerPosition ? event.clientX - rect.left - size / 2 : centerX;
    const y = hasPointerPosition ? event.clientY - rect.top - size / 2 : centerY;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  const handleClick = useCallback((event) => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    createRipple(event);
    onClick?.(event);
  }, [onClick, createRipple]);

  return (
    <button
      type={type}
      ref={(node) => {
        buttonRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
