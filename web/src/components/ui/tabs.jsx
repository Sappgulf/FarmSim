import React, { useState, useRef, useLayoutEffect, useCallback } from "react";

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [activeTab, setActiveTab] = useState(defaultValue || value);

  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const currentTab = value !== undefined ? value : activeTab;

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== "string") {
          return React.cloneElement(child, {
            activeTab: currentTab,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({
  children,
  className = "",
  activeTab,
  onValueChange,
  variant = "default",
}) {
  const layoutOverride = /\b(grid|flex|inline-flex|block|flow-root)\b/.test(className);
  const listRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  const updateIndicator = useCallback(() => {
    if (variant !== "underline" || !listRef.current) return;
    const activeButton = listRef.current.querySelector('[data-active="true"]');
    if (activeButton) {
      const rect = activeButton.getBoundingClientRect();
      const listRect = listRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - listRect.left,
        width: rect.width,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((s) => ({ ...s, opacity: 0 }));
    }
  }, [variant]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeTab, updateIndicator]);

  useLayoutEffect(() => {
    if (variant !== "underline") return;
    const ro = new ResizeObserver(() => updateIndicator());
    if (listRef.current) ro.observe(listRef.current);
    window.addEventListener("resize", updateIndicator);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [variant, updateIndicator]);

  const baseClasses =
    variant === "underline"
      ? "relative items-center justify-start border-b border-slate-200/70 text-slate-500 dark:border-slate-700/70 dark:text-slate-400"
      : variant === "pills"
        ? "items-center justify-start rounded-full border border-slate-200/60 bg-slate-100/60 p-1 text-slate-600 shadow-[0_8px_20px_-20px_rgba(15,23,42,0.2)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300"
        : "items-center justify-start rounded-[22px] border border-slate-200/60 bg-white/72 p-1.5 text-slate-600 shadow-[0_8px_20px_-20px_rgba(15,23,42,0.2)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/72 dark:text-slate-300";

  const layoutClasses = layoutOverride ? "" : "flex flex-wrap gap-1";

  const tabValues = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && typeof child.type !== "string")
    .map((child) => child.props?.value)
    .filter((tabValue) => tabValue !== undefined && tabValue !== null);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      className={`${layoutClasses} ${baseClasses} ${className}`.trim()}
    >
      {variant === "underline" && (
        <span
          className="absolute bottom-0 h-0.5 rounded-full bg-emerald-500 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={indicatorStyle}
        />
      )}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== "string") {
          return React.cloneElement(child, {
            activeTab,
            onValueChange,
            tabValues,
            variant,
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
  activeTab,
  onValueChange,
  tabValues = [],
  variant = "default",
}) {
  const isActive = activeTab === value;
  const currentIndex = tabValues.indexOf(value);

  const focusTab = (tabValue) => {
    const focusAction = () => {
      const tab = document.getElementById(`tab-${tabValue}`);
      if (tab && typeof tab.focus === "function") {
        tab.focus();
      }
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(focusAction);
      return;
    }
    setTimeout(focusAction, 0);
  };

  const selectTab = (nextValue) => {
    if (!onValueChange || nextValue === undefined || nextValue === null) {
      return;
    }
    onValueChange(nextValue);
    focusTab(nextValue);
  };

  const handleKeyDown = (event) => {
    if (!tabValues.length || currentIndex < 0) return;
    let nextValue = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextValue = tabValues[(currentIndex + 1) % tabValues.length];
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextValue = tabValues[(currentIndex - 1 + tabValues.length) % tabValues.length];
    } else if (event.key === "Home") {
      nextValue = tabValues[0];
    } else if (event.key === "End") {
      nextValue = tabValues[tabValues.length - 1];
    }
    if (nextValue === null || nextValue === value) return;
    event.preventDefault();
    selectTab(nextValue);
  };

  const variantClasses =
    variant === "underline"
      ? `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation ${
          isActive
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        }`
      : variant === "pills"
        ? `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation ${
            isActive
              ? "bg-emerald-500 text-white shadow-[0_4px_12px_-4px_rgba(16,185,129,0.4)] scale-[1.02]"
              : "text-slate-600 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100"
          }`
        : `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation ${
            isActive
              ? "border border-emerald-100 bg-white text-emerald-700 shadow-[0_8px_18px_-18px_rgba(16,185,129,0.3)] ring-1 ring-emerald-100 scale-[1.02] dark:border-emerald-800 dark:bg-slate-700 dark:text-emerald-300 dark:shadow-[0_8px_18px_-18px_rgba(16,185,129,0.2)] dark:ring-emerald-800"
              : "border border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100"
          }`;

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-controls={`panel-${value}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      data-active={isActive}
      className={`${variantClasses} ${className}`}
      onClick={() => selectTab(value)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "", activeTab }) {
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 animate-tab-slide-in ${className}`}
    >
      {children}
    </div>
  );
}
