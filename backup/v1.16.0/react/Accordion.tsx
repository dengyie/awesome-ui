import React, { useState } from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  icon?: UiIconName;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several panels open at once. Defaults to false (single-open). */
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  onToggle?: (id: string, open: boolean) => void;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds,
  onToggle,
  className = "",
}) => {
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenIds ?? items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggle = (id: string) => {
    const isOpen = openIds.includes(id);
    const next = isOpen
      ? openIds.filter((entry) => entry !== id)
      : allowMultiple
        ? [...openIds, id]
        : [id];
    setOpenIds(next);
    onToggle?.(id, !isOpen);
  };

  return (
    <div
      className={`divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {items.map((item) => {
        const open = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={`accordion-trigger-${item.id}`}
                aria-expanded={open}
                aria-controls={`accordion-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/50"
              >
                {item.icon && (
                  <span className="shrink-0 text-indigo-600 dark:text-indigo-400">
                    <UiIcon name={item.icon} size={14} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-100">
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </span>
                  )}
                </span>
                <span
                  className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  <UiIcon name="chevron-down" size={14} />
                </span>
              </button>
            </h3>
            {open && (
              <div
                id={`accordion-panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-trigger-${item.id}`}
                className="px-4 pb-3 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
