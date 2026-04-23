import React, { useState, useRef, useEffect } from "react";

export function Input({
  className = "",
  type = "text",
  label,
  id,
  placeholder,
  ...props
}) {
  const inputId = id || React.useId();
  const hasFloatingLabel = Boolean(label);

  return (
    <div className={`relative w-full ${hasFloatingLabel ? "group" : ""}`}>
      {hasFloatingLabel && (
        <label
          htmlFor={inputId}
          className={`
            absolute left-3 transition-all duration-200 pointer-events-none z-10
            text-slate-400 text-sm top-1/2 -translate-y-1/2
            group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-[10px] group-focus-within:bg-white group-focus-within:px-1 group-focus-within:text-emerald-600
            ${props.value || props.defaultValue ? "top-0 -translate-y-1/2 text-[10px] bg-white px-1 text-slate-500" : ""}
          `}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={hasFloatingLabel ? " " : placeholder}
        className={`
          flex h-11 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm
          text-slate-800 placeholder:italic placeholder:text-slate-400 placeholder:font-normal
          ring-offset-white/50
          transition-all duration-200 ease-out
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          focus-visible:border-emerald-300 focus-visible:bg-white
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30
          focus-visible:shadow-[0_0_0_4px_rgba(16,185,129,0.08),0_1px_2px_rgba(0,0,0,0.04)]
          hover:border-slate-300 hover:bg-white/95
          disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
          ${hasFloatingLabel ? "pt-4 pb-1" : ""}
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
