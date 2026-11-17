/**
 * BottomTabBar - Mobile-style bottom navigation bar: icon + label tabs,
 * active indicator, optional badge count and safe-area padding
 * (mobile web navigation pattern).
 */
import React, { useState } from "react";

export interface BottomTab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export interface BottomTabBarProps {
  tabs?: BottomTab[];
  active?: string;
  label?: string;
  className?: string;
  onChange?: (id: string) => void;
}

const DEFAULT_TABS: BottomTab[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "search", label: "Search", icon: "⌕", badge: 3 },
  { id: "create", label: "Create", icon: "+" },
  { id: "inbox", label: "Inbox", icon: "✉", badge: 12 },
  { id: "profile", label: "Profile", icon: "◉" },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs = DEFAULT_TABS,
  active: activeProp,
  label = "Primary navigation",
  className = "",
  onChange,
}) => {
  const list = Array.isArray(tabs) ? tabs : [];
  const [internalActive, setInternalActive] = useState(activeProp || list[0]?.id || "home");
  const active = activeProp ?? internalActive;

  return (
    <nav data-bottomtab-bar aria-label={label} className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-bottomtab-items className="flex items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        {list.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              data-bottomtab-item={tab.id}
              aria-current={isActive ? "page" : "false"}
              onClick={() => { setInternalActive(tab.id); onChange?.(tab.id); }}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              <span data-bottomtab-icon={tab.id} aria-hidden="true" className="text-lg leading-5">{tab.icon || ""}</span>
              <span data-bottomtab-label={tab.id} className="text-[10px] font-medium">{tab.label}</span>
              {tab.badge ? (
                <span data-bottomtab-badge={tab.id} className="absolute -right-2 -top-1.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">{tab.badge}</span>
              ) : null}
              <span data-bottomtab-indicator={tab.id} aria-hidden="true" className={`${isActive ? "block" : "hidden"} absolute -top-px inset-x-4 h-0.5 rounded-full bg-violet-600 dark:bg-violet-400`}></span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
