import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface ResourceItem {
  name: string;
  path?: string;
  kind?: string;
  kindTone?: "zinc" | "indigo" | "emerald" | "amber";
  timeLabel?: string;
  icon?: UiIconName;
}

export interface ResourceListProps {
  items: ResourceItem[];
  title?: string;
  emptyText?: string;
  maxItems?: number;
  onSelect?: (item: ResourceItem, index: number) => void;
  className?: string;
}

const KIND_TONE: Record<string, string> = {
  zinc: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
};

export const ResourceList: React.FC<ResourceListProps> = ({
  items,
  title,
  emptyText = "No resources yet",
  maxItems,
  onSelect,
  className = "",
}) => {
  const visible = typeof maxItems === "number" ? items.slice(0, maxItems) : items;

  return (
    <section
      data-resource-list
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {title ? (
        <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
          <span className="font-mono text-[10px] font-medium text-zinc-400">{items.length}</span>
        </header>
      ) : null}
      {visible.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-zinc-400">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
          {visible.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              data-resource-index={index}
              onClick={() => onSelect?.(item, index)}
              onKeyDown={(event) => {
                if (onSelect && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onSelect(item, index);
                }
              }}
              className={`flex items-center gap-3 px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                onSelect ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40" : ""
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <UiIcon name={item.icon || "layers"} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-zinc-800 dark:text-zinc-200">
                  {item.name}
                </span>
                {item.path ? (
                  <span className="block truncate font-mono text-[10px] text-zinc-400">{item.path}</span>
                ) : null}
              </span>
              {item.timeLabel ? (
                <span className="shrink-0 text-[10px] text-zinc-400">{item.timeLabel}</span>
              ) : null}
              {item.kind ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-px text-[10px] font-medium ${
                    KIND_TONE[item.kindTone || "zinc"]
                  }`}
                >
                  {item.kind}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ResourceList;
