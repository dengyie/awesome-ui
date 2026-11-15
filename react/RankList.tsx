import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface RankListItem {
  label: string;
  value: string | number;
  ratio?: number;
  icon?: UiIconName;
}

export interface RankListProps {
  items: RankListItem[];
  title?: string;
  valueHeader?: string;
  showRatio?: boolean;
  maxItems?: number;
  emptyText?: string;
  onSelect?: (index: number, item: RankListItem) => void;
  className?: string;
}

export const RankList: React.FC<RankListProps> = ({
  items,
  title,
  valueHeader = "Value",
  showRatio = false,
  maxItems,
  emptyText = "No data yet",
  onSelect,
  className = "",
}) => {
  const visible = typeof maxItems === "number" ? items.slice(0, maxItems) : items;
  const peak = Math.max(...visible.map((item) => Number(item.ratio ?? item.value) || 0), 1);

  return (
    <section
      data-rank-list
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {title || valueHeader ? (
        <header className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          {title ? <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3> : <span />}
          {valueHeader ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{valueHeader}</span>
          ) : null}
        </header>
      ) : null}
      {visible.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-zinc-400">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
          {visible.map((item, index) => {
            const ratio = Math.max(4, Math.min(100, ((Number(item.ratio ?? item.value) || 0) / peak) * 100));
            return (
              <li
                key={`${item.label}-${index}`}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                data-rank-index={index}
                onClick={() => onSelect?.(index, item)}
                onKeyDown={(event) => {
                  if (onSelect && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onSelect(index, item);
                  }
                }}
                className={`relative flex items-center gap-2 px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                  onSelect ? "cursor-pointer" : ""
                }`}
              >
                {showRatio ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-2 rounded bg-zinc-100 dark:bg-zinc-800"
                    style={{ width: `calc((100% - 1rem) * ${ratio / 100})` }}
                  />
                ) : null}
                <span
                  className={`relative z-10 flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium text-zinc-800 dark:text-zinc-200 ${
                    showRatio ? "px-1.5 py-0.5" : ""
                  }`}
                >
                  {item.icon ? <UiIcon name={item.icon} size={13} className="shrink-0 text-zinc-400" /> : null}
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="relative z-10 shrink-0 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                  {item.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RankList;
