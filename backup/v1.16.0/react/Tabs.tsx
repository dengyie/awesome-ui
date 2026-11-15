import React, { useRef, useState } from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface TabItem {
  id: string;
  label: string;
  icon?: UiIconName;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Controlled active tab id. Omit for uncontrolled behavior. */
  activeId?: string;
  defaultActiveId?: string;
  variant?: "underline" | "pills";
  onChange?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

const BASE_TAB =
  "inline-flex items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40";

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  defaultActiveId,
  variant = "underline",
  onChange,
  ariaLabel = "Tabs",
  className = "",
}) => {
  const [internalId, setInternalId] = useState(defaultActiveId ?? tabs[0]?.id ?? "");
  const current = activeId ?? internalId;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isPills = variant === "pills";

  const select = (tab: TabItem) => {
    if (tab.disabled) return;
    if (activeId === undefined) setInternalId(tab.id);
    onChange?.(tab.id);
  };

  const move = (event: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const enabled = tabs.map((tab, i) => ({ tab, i })).filter((entry) => !entry.tab.disabled);
    if (enabled.length === 0) return;
    const position = enabled.findIndex((entry) => entry.i === index);
    let next = position;
    if (event.key === "ArrowRight") next = (position + 1) % enabled.length;
    if (event.key === "ArrowLeft") next = (position - 1 + enabled.length) % enabled.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = enabled.length - 1;
    const target = enabled[next];
    if (target) {
      select(target.tab);
      refs.current[target.tab.id]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={
        isPills
          ? `inline-flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 ${className}`
          : `flex items-center gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 ${className}`
      }
    >
      {tabs.map((tab, index) => {
        const active = tab.id === current;
        const tone = isPills
          ? active
            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          : active
            ? "-mb-px border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
            : "-mb-px border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200";
        const shape = isPills ? "rounded-md px-3 py-1.5" : "border-b-2 px-3 py-2";
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => select(tab)}
            onKeyDown={(event) => move(event, index)}
            className={`${BASE_TAB} ${shape} ${tone}`}
          >
            {tab.icon && <UiIcon name={tab.icon} size={13} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="rounded-full bg-zinc-100 px-1.5 text-[10px] tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
