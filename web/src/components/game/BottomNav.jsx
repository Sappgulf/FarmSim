/**
 * BottomNav Component
 * Mobile bottom tab navigation - simplified to 3 core items
 */
import React, { memo } from 'react';
import { Leaf, ShoppingCart, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'farm', label: 'Farm', icon: Leaf, color: 'text-green-600' },
  { id: 'shop', label: 'Shop', icon: ShoppingCart, color: 'text-blue-600' },
  { id: 'menu', label: 'Menu', icon: Menu, color: 'text-gray-600' },
];

function BottomNavComponent({ activeTab, onTabChange, badges = {} }) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg
        sm:hidden
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[56px] px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badges[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center
                flex-1 min-h-[56px] min-w-[56px]
                transition-colors relative
                touch-manipulation
                ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 active:text-gray-700 active:bg-gray-50'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-0.5 bg-blue-600 rounded-full" />
              )}

              {/* Icon with badge */}
              <span className="relative">
                <Icon size={22} className={isActive ? item.color : 'text-gray-500'} />
                {badge && (
                  <span
                    className="
                    absolute -top-1 -right-1.5
                    min-w-[16px] h-4 px-1
                    flex items-center justify-center
                    text-[10px] font-bold text-white
                    bg-red-500 rounded-full
                  "
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>

              {/* Label */}
              <span
                className={`
                text-[10px] mt-1 font-medium
                ${isActive ? 'text-blue-600' : 'text-gray-500'}
              `}
              >
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
