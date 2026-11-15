import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface RichToolbarItem {
  id: string;
  /** Accessible name, also used as the tooltip. */
  label: string;
  /** UiIcon name; ignored when `text` is set. */
  icon?: UiIconName;
  /** Short glyph rendered instead of an icon (e.g. "B", "I", "U"). */
  text?: string;
  /** Keyboard hint shown in the tooltip, e.g. "⌘B". */
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface RichToolbarGroup {
  id: string;
  label?: string;
  items: RichToolbarItem[];
}

export interface RichToolbarProps {
  groups?: RichToolbarGroup[];
  onAction?: (id: string) => void;
  className?: string;
}

const BASE_BUTTON =
  "flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40";

export const RichToolbar: React.FC<RichToolbarProps> = ({ groups = [], onAction, className = "" }) => {
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className={`flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && (
            <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />
          )}
          <div role="group" aria-label={group.label || group.id} className="flex items-center gap-0.5">
            {group.items.map((item) => {
              const tone = item.active
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={item.active ? true : undefined}
                  title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                  disabled={item.disabled}
                  onClick={() => onAction?.(item.id)}
                  className={`${BASE_BUTTON} ${tone}`}
                >
                  {item.text ? (
                    <span className="font-semibold leading-none">{item.text}</span>
                  ) : (
                    <UiIcon name={item.icon || "square"} size={15} />
                  )}
                </button>
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default RichToolbar;
