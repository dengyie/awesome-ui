import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  icon?: UiIconName;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Collapse the middle into an ellipsis when the trail is longer than this. 0 disables. */
  maxItems?: number;
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  ariaLabel?: string;
  className?: string;
}

const collapse = (items: BreadcrumbItem[], maxItems: number): (BreadcrumbItem | null)[] => {
  if (maxItems <= 0 || items.length <= maxItems) return items;
  const tail = Math.max(1, maxItems - 1);
  return [items[0], null, ...items.slice(items.length - tail)];
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  maxItems = 0,
  onNavigate,
  ariaLabel = "Breadcrumb",
  className = "",
}) => {
  const trail = collapse(items, maxItems);

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          const content = (
            <>
              {item?.icon && <UiIcon name={item.icon} size={12} />}
              <span>{item ? item.label : "…"}</span>
            </>
          );
          const base = "inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors";
          return (
            <li key={item ? item.id ?? `${item.label}-${index}` : `ellipsis-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
                  <UiIcon name="chevron-right" size={11} />
                </span>
              )}
              {!item ? (
                <span className="px-1 text-zinc-400" aria-hidden="true">
                  …
                </span>
              ) : last ? (
                <span aria-current="page" className={`${base} font-medium text-zinc-800 dark:text-zinc-100`}>
                  {content}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  onClick={(event) => {
                    if (!onNavigate) return;
                    event.preventDefault();
                    onNavigate(item, index);
                  }}
                  className={`${base} text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate?.(item, index)}
                  className={`${base} text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
