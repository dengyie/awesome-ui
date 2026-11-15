import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface SideNavEntry {
  id: string;
  label: string;
  icon?: UiIconName;
  count?: number;
}

export interface SideNavGroup {
  title?: string;
  items: SideNavEntry[];
}

export interface SideNavProps {
  groups: SideNavGroup[];
  activeId?: string;
  heading?: string;
  onNavigate?: (id: string, entry: SideNavEntry) => void;
  className?: string;
}

export const SideNav: React.FC<SideNavProps> = ({
  groups,
  activeId,
  heading,
  onNavigate,
  className = "",
}) => {
  const renderEntry = (entry: SideNavEntry) => {
    const active = entry.id === activeId;
    return (
      <button
        key={entry.id}
        type="button"
        data-nav-id={entry.id}
        aria-current={active ? "page" : undefined}
        onClick={() => onNavigate?.(entry.id, entry)}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          active
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
        }`}
      >
        {entry.icon ? (
          <UiIcon
            name={entry.icon}
            size={14}
            className={active ? "text-indigo-500" : "text-zinc-400"}
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{entry.label}</span>
        {entry.count !== undefined ? (
          <span
            className={`rounded-full px-1.5 py-px font-mono text-[9.5px] font-semibold ${
              entry.count > 0
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {entry.count}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <nav
      data-side-nav
      aria-label={heading || "Side navigation"}
      className={`flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {heading ? (
        <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{heading}</p>
      ) : null}
      {groups.map((group, groupIndex) => (
        <div key={group.title || groupIndex} className="flex flex-col gap-0.5">
          {group.title ? (
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{group.title}</p>
          ) : null}
          {group.items.map(renderEntry)}
        </div>
      ))}
    </nav>
  );
};

export default SideNav;
