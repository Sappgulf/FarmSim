import React from "react";

export function Card({ className = "", children, hover = false, ...props }) {
  return (
    <div
      className={`
        relative rounded-[32px] border border-white/40 text-slate-800
        bg-white/75 backdrop-blur-xl
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(15,23,42,0.18),0_2px_6px_-2px_rgba(15,23,42,0.08)]
        transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out
        dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100
        dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-8px_rgba(0,0,0,0.4),0_2px_6px_-2px_rgba(0,0,0,0.3)]
        ${hover ? "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-12px_rgba(15,23,42,0.22),0_4px_12px_-4px_rgba(15,23,42,0.1)] cursor-pointer" : ""}
        before:pointer-events-none before:absolute before:inset-0 before:rounded-[32px]
        before:bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_40%)]
        before:opacity-60
        dark:before:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_40%)]
        after:pointer-events-none after:absolute after:inset-0 after:rounded-[32px]
        after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]
        dark:after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, gradient = false, ...props }) {
  return (
    <h3
      className={`
        text-lg font-bold leading-none tracking-wide
        ${gradient
          ? "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent dark:from-slate-100 dark:via-slate-200 dark:to-slate-100"
          : "text-slate-800 dark:text-slate-100"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return <div className={`p-5 pt-0 ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div className={`flex items-center p-5 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
