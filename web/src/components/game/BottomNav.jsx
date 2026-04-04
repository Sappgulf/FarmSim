/**
 * BottomNav Component
 * Mobile bottom tab navigation - simplified to 3 core items
 */
import React, { memo } from 'react';
import { Leaf, ShoppingCart, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'farm', label: 'Farm', icon: Leaf, activeColor: 'text-emerald-600', activeBg: 'bg-emerald-50' },
  { id: 'shop', label: 'Shop', icon: ShoppingCart, activeColor: 'text-amber-600', activeBg: 'bg-amber-50' },
  { id: 'menu', label: 'Menu', icon: Menu, activeColor: 'text-slate-700', activeBg: 'bg-slate-100' },
];

function BottomNavComponent({ activeTab, onTabChange, badges = {} }) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]
        sm:hidden
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around h-[56px] px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'menu' && activeTab === 'menu');
          const badge = badges[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                relative flex flex-col items-center justify-center
                flex-1 min-h-[56px] min-w-[56px] rounded-none
                transition-all duration-150
                touch-manipulation select-none
                ${isActive
                  ? `${item.activeColor} ${item.activeBg}`
                  : 'text-gray-400 hover:text-gray-600 active:bg-gray-50'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className={`
                    absolute top-0 left-3 right-3 h-[3px] rounded-b-full
                    ${item.id === 'farm' ? 'bg-emerald-500' : item.id === 'shop' ? 'bg-amber-500' : 'bg-slate-500'}
                  `}
                />
              )}

              {/* Icon with badge */}
              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
                />
                {badge != null && badge > 0 && (
                  <span className="
                    absolute -top-1.5 -right-2
                    min-w-[16px] h-4 px-1
                    flex items-center justify-center
                    text-[10px] font-bold text-white
                    bg-red-500 rounded-full leading-none
                  ">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>

              {/* Label */}
              <span className={`
                text-[10px] mt-0.5 font-semibold tracking-wide
                ${isActive ? '' : 'text-gray-400'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export const BottomNav = memo(BottomNavComponent);
