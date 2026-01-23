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
  const layoutOverride = /(grid|flex|inline-flex|block|flow-root)/.test(className);
  const baseClasses = "items-center justify-start rounded-xl bg-slate-100/80 backdrop-blur-sm p-1.5 text-slate-600 shadow-inner";
  const layoutClasses = layoutOverride ? "" : "flex flex-wrap gap-1.5";

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`${layoutClasses} ${baseClasses} ${className}`.trim()}
    >
      {React.Children.map(children, child => {
        // Only pass props to React components, not DOM elements
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child, { activeTab, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "", activeTab, onValueChange }) {
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      id={`tab-${value}`}
      aria-controls={`panel-${value}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 touch-manipulation ${
        isActive
          ? "bg-white text-emerald-700 shadow-md ring-1 ring-emerald-100"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900 active:scale-95"
      } ${className}`}
      onClick={() => onValueChange && onValueChange(value)}
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
      className={`mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 animate-tab-slide-in ${className}`}
    >
      {children}
    </div>
  );
}
