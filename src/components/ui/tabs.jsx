import React, { useState } from "react";

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  
  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          activeTab: value || activeTab, 
          onValueChange: handleValueChange 
        })
      )}
    </div>
  );
}

export function TabsList({ children, className = "", activeTab, onValueChange }) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`inline-flex h-auto items-center justify-start rounded-md bg-slate-100 p-1 text-slate-600 ${className}`}
      style={{ rowGap: 4, columnGap: 4 }}
    >
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, onValueChange })
      )}
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
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? "bg-white text-slate-900 shadow-sm" 
          : "hover:bg-white/80"
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
      className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
}
