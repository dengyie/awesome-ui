import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface PageHeaderAction {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: UiIconName;
}

export interface PageHeaderTab {
  label: string;
  count?: number;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  statusText?: string;
  actions?: PageHeaderAction[];
  tabs?: PageHeaderTab[];
  activeTab?: string;
  onAction?: (action: PageHeaderAction) => void;
  onTabChange?: (tab: PageHeaderTab) => void;
  className?: string;
}

const ACTION_VARIANT: Record<string, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500",
  secondary:
    "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  statusText,
  actions = [],
  tabs = [],
  activeTab,
  onAction,
  onTabChange,
  className = "",
}) => (
  <header data-page-header className={`flex flex-col gap-3 ${className}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
          {statusText ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {statusText}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 max-w-2xl text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {actions.length ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              data-action-label={action.label}
              onClick={() => onAction?.(action)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${ACTION_VARIANT[action.variant || "secondary"]}`}
            >
              {action.icon ? <UiIcon name={action.icon} size={13} /> : null}
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
    {tabs.length ? (
      <nav data-page-header-tabs className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const active = tab.label === activeTab;
          return (
            <button
              key={tab.label}
              type="button"
              data-tab-label={tab.label}
              aria-current={active ? "page" : undefined}
              onClick={() => onTabChange?.(tab)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-px font-mono text-[9.5px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    ) : null}
  </header>
);

export default PageHeader;
