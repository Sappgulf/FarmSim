import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-[28px] border border-slate-200/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.82))] text-slate-800 shadow-[0_8px_22px_-22px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color] duration-300 hover:shadow-[0_12px_28px_-24px_rgba(15,23,42,0.28)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={`text-lg font-bold leading-none tracking-tight text-slate-800 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return <div className={`p-4 pt-0 ${className}`} {...props}>{children}</div>;
}
