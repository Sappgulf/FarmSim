import React, { useState } from "react";

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  
  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  // Use current active tab value (controlled or uncontrolled)
  const currentTab = value !== undefined ? value : activeTab;

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        // Only pass props to React components, not DOM elements
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child, { 
            activeTab: currentTab, 
            onValueChange: handleValueChange 
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = "", activeTab, onValueChange }) {
  const layoutOverride = /\b(grid|flex|inline-flex|block|flow-root)\b/.test(className);
  const baseClasses = "items-center justify-start rounded-[22px] border border-slate-200/60 bg-white/72 p-1.5 text-slate-600 shadow-[0_8px_20px_-20px_rgba(15,23,42,0.2)] backdrop-blur-sm";
  const layoutClasses = layoutOverride ? "" : "flex flex-wrap gap-1.5";
  const tabValues = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && typeof child.type !== "string")
    .map((child) => child.props?.value)
    .filter((tabValue) => tabValue !== undefined && tabValue !== null);

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`${layoutClasses} ${baseClasses} ${className}`.trim()}
    >
      {React.Children.map(children, child => {
        // Only pass props to React components, not DOM elements
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child, { activeTab, onValueChange, tabValues });
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

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-controls={`panel-${value}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-[transform,background-color,border-color,box-shadow,color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation ${
        isActive
          ? "border border-emerald-100 bg-white text-emerald-700 shadow-[0_8px_18px_-18px_rgba(16,185,129,0.3)] ring-1 ring-emerald-100"
          : "border border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 active:scale-95"
      } ${className}`}
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
