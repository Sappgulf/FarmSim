import React, { useRef, useState, useCallback, useEffect } from "react";

function LoadingSpinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Premium Button component with juicy animations, ripple effects,
 * shine animation, loading state, and elevated variants.
 */
export function Button({
  children,
  onClick,
  type = "button",
  variant = "default",
  size = "default",
  className = "",
  juicy = false,
  shine = false,
  loading = false,
  elevated = false,
  disabled,
  ...props
}) {
  const buttonRef = useRef(null);
  const pressTimeoutRef = useRef(null);
  const rippleTimeoutsRef = useRef([]);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    rippleTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    rippleTimeoutsRef.current = [];
  }, []);

  const isDisabled = disabled || loading;

  const baseClasses = `
    relative overflow-hidden inline-flex items-center justify-center gap-2
    rounded-xl text-sm font-semibold
    transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-150 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    transform-gpu
    ${juicy ? "btn-juicy" : ""}
    ${isPressed && !juicy ? "scale-[0.97]" : ""}
    ${isPressed && juicy ? "scale-[0.96]" : ""}
  `;

  const variants = {
    default: `
      bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 text-white
      hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-600
      focus-visible:ring-emerald-500
      shadow-emerald-200/60 hover:shadow-emerald-300/50
      dark:shadow-emerald-900/40 dark:hover:shadow-emerald-800/50
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_24px_-6px_rgba(16,185,129,0.45)]" : "shadow-sm hover:shadow-lg"}
    `,
    destructive: `
      bg-gradient-to-br from-red-400 via-red-500 to-red-700 text-white
      hover:from-red-300 hover:via-red-400 hover:to-red-600
      focus-visible:ring-red-500
      shadow-red-200/60 hover:shadow-red-300/50
      dark:shadow-red-900/40 dark:hover:shadow-red-800/50
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_24px_-6px_rgba(239,68,68,0.45)]" : "shadow-sm hover:shadow-lg"}
    `,
    secondary: `
      bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-700
      hover:from-white hover:via-slate-50 hover:to-slate-100
      border border-slate-200/80
      shadow-slate-200/50
      dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 dark:text-slate-200
      dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-600
      dark:border-slate-600/80 dark:shadow-slate-900/50
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(100,116,139,0.2)] hover:shadow-[0_8px_24px_-6px_rgba(100,116,139,0.25)]" : "shadow-sm"}
    `,
    outline: `
      border-2 border-slate-200/80 bg-white/90 backdrop-blur-sm text-slate-700
      hover:bg-slate-50/90 hover:border-slate-300
      shadow-sm
      dark:bg-slate-800/90 dark:border-slate-600/80 dark:text-slate-200
      dark:hover:bg-slate-700/90 dark:hover:border-slate-500
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(100,116,139,0.15)] hover:shadow-[0_8px_24px_-6px_rgba(100,116,139,0.2)]" : ""}
    `,
    ghost: `
      text-slate-600 hover:bg-slate-100/80 hover:text-slate-900
      shadow-none hover:shadow-none
      dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100
    `,
    success: `
      bg-gradient-to-br from-green-400 via-green-500 to-emerald-700 text-white
      hover:from-green-300 hover:via-green-400 hover:to-emerald-600
      focus-visible:ring-green-500
      shadow-green-200/60 hover:shadow-green-300/50
      dark:shadow-green-900/40 dark:hover:shadow-green-800/50
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(34,197,94,0.4)] hover:shadow-[0_8px_24px_-6px_rgba(34,197,94,0.45)]" : "shadow-sm hover:shadow-lg"}
    `,
    warning: `
      bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white
      hover:from-amber-300 hover:via-amber-400 hover:to-orange-500
      focus-visible:ring-amber-500
      shadow-amber-200/60 hover:shadow-amber-300/50
      dark:shadow-amber-900/40 dark:hover:shadow-amber-800/50
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_24px_-6px_rgba(245,158,11,0.45)]" : "shadow-sm hover:shadow-lg"}
    `,
    premium: `
      bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-700 text-white
      hover:from-purple-300 hover:via-violet-400 hover:to-indigo-600
      focus-visible:ring-purple-500
      shadow-purple-200/60 hover:shadow-purple-300/50
      dark:shadow-purple-900/40 dark:hover:shadow-purple-800/50
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_24px_-6px_rgba(139,92,246,0.45)]" : "shadow-sm hover:shadow-lg"}
    `,
    gold: `
      bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-amber-900
      hover:from-amber-200 hover:via-yellow-300 hover:to-amber-500
      focus-visible:ring-amber-500
      shadow-amber-200/60 hover:shadow-amber-300/50
      dark:shadow-amber-900/40 dark:hover:shadow-amber-800/50
      font-bold
      ${elevated ? "shadow-[0_4px_14px_-4px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_24px_-6px_rgba(245,158,11,0.45)]" : "shadow-sm hover:shadow-lg"}
    `,
    elevated: `
      bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-700
      hover:from-white hover:via-slate-50 hover:to-slate-50
      border border-slate-200/60
      shadow-[0_4px_14px_-4px_rgba(100,116,139,0.25)] hover:shadow-[0_8px_24px_-6px_rgba(100,116,139,0.3)]
      dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 dark:text-slate-200
      dark:hover:from-slate-700 dark:hover:via-slate-700 dark:hover:to-slate-600
      dark:border-slate-600/60
    `,
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "min-h-[44px] px-3 text-xs",
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
    const size = Math.max(rect.width, rect.height) * 1.2;
    const hasPointerPosition =
      Number.isFinite(event?.clientX) &&
      Number.isFinite(event?.clientY) &&
      (event.clientX !== 0 || event.clientY !== 0);
    const centerX = rect.width / 2 - size / 2;
    const centerY = rect.height / 2 - size / 2;
    const x = hasPointerPosition
      ? event.clientX - rect.left - size / 2
      : centerX;
    const y = hasPointerPosition
      ? event.clientY - rect.top - size / 2
      : centerY;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 70%, transparent 100%);
      transform: scale(0);
      animation: ripple-animation 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      pointer-events: none;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    button.appendChild(ripple);
    const timeoutId = setTimeout(() => {
      ripple.remove();
      rippleTimeoutsRef.current = rippleTimeoutsRef.current.filter(
        (id) => id !== timeoutId
      );
    }, 800);
    rippleTimeoutsRef.current.push(timeoutId);
  }, []);

  const handleClick = useCallback(
    (event) => {
      if (loading) return;
      setIsPressed(true);
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
      pressTimeoutRef.current = setTimeout(() => {
        setIsPressed(false);
        pressTimeoutRef.current = null;
      }, 100);
      createRipple(event);
      onClick?.(event);
    },
    [onClick, createRipple, loading]
  );

  return (
    <button
      type={type}
      ref={buttonRef}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Shine overlay */}
      {shine && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
        >
          <span className="absolute inset-0 -translate-x-full animate-[shine-sweep_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </span>
      )}
      {loading && (
        <LoadingSpinner className="h-4 w-4 opacity-80" />
      )}
      <span className={`${loading ? "opacity-80" : ""} inline-flex items-center gap-2`}>
        {children}
      </span>
    </button>
  );
}
