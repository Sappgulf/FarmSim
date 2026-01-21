/**
 * BottomNav Component
 * Mobile bottom tab navigation
 */
import React, { memo } from 'react';
import {
  Leaf,
  ShoppingCart,
  Trophy,
  Dna,
  Building2,
  Settings,
  CloudSun,
  Target,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'farm', label: 'Farm', icon: Leaf, color: 'text-green-600' },
  { id: 'shop', label: 'Shop', icon: ShoppingCart, color: 'text-blue-600' },
  { id: 'goals', label: 'Goals', icon: Target, color: 'text-amber-600' },
  { id: 'breeding', label: 'Breed', icon: Dna, color: 'text-purple-600' },
  { id: 'buildings', label: 'Build', icon: Building2, color: 'text-orange-600' },
];

function BottomNavComponent({ activeTab, onTabChange, badges = {} }) {
  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-40
      bg-white border-t border-gray-200 shadow-lg
      safe-area-pb
      sm:hidden
    ">
      <div className="flex items-center justify-around h-16 px-2">
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
                flex-1 h-full min-w-0
                transition-colors relative
                ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 active:text-gray-700'
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
                <Icon
                  size={22}
                  className={isActive ? item.color : 'text-gray-500'}
                />
                {badge && (
                  <span className="
                    absolute -top-1 -right-1.5
                    min-w-[16px] h-4 px-1
                    flex items-center justify-center
                    text-[10px] font-bold text-white
                    bg-red-500 rounded-full
                  ">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>

              {/* Label */}
              <span className={`
                text-[10px] mt-1 font-medium
                ${isActive ? 'text-blue-600' : 'text-gray-500'}
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
