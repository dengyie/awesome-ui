import React, { useState } from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  value?: string;
  actionText?: string;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon?: UiIconName;
  description?: string;
  items: SettingsItem[];
}

export interface SettingsPanelProps {
  sections: SettingsSection[];
  activeId?: string;
  saving?: boolean;
  saveText?: string;
  onSectionChange?: (id: string) => void;
  onItemAction?: (sectionId: string, item: SettingsItem) => void;
  onSave?: (sectionId: string) => void;
  className?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  sections,
  activeId,
  saving = false,
  saveText = "Save changes",
  onSectionChange,
  onItemAction,
  onSave,
  className = "",
}) => {
  const [currentId, setCurrentId] = useState(() => activeId || sections[0]?.id || "");
  const section = sections.find((item) => item.id === currentId) || sections[0];

  const select = (id: string) => {
    setCurrentId(id);
    onSectionChange?.(id);
  };

  return (
    <div className={`md:flex md:gap-6 ${className}`}>
      <nav className="flex gap-1 overflow-x-auto pb-2 md:w-44 md:shrink-0 md:flex-col md:overflow-visible md:pb-0">
        {sections.map((item) => {
          const active = item.id === section?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {item.icon && <UiIcon name={item.icon} size={14} className="shrink-0" />}
              <span className="whitespace-nowrap">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {section && (
        <div className="mt-3 min-w-0 flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:mt-0">
          <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</div>
            {section.description && (
              <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{section.description}</div>
            )}
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {section.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-800 dark:text-zinc-200">{item.label}</div>
                  {item.description && (
                    <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{item.description}</div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.value && (
                    <span className="max-w-[12rem] truncate text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                      {item.value}
                    </span>
                  )}
                  {item.actionText && (
                    <button
                      type="button"
                      onClick={() => onItemAction?.(section.id, item)}
                      className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {item.actionText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {onSave && (
            <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <button
                type="button"
                onClick={() => onSave(section.id)}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
              >
                {saving && <UiIcon name="loader" size={12} className="animate-spin" />}
                {saveText}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
