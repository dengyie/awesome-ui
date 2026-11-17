import React from "react";
export interface SettingsRow {
  label: string;
  description?: string;
  control?: "toggle" | "select" | "button" | "none";
  value?: string;
  options?: string[];
  buttonLabel?: string;
  buttonTone?: "indigo" | "danger" | "outline";
  enabled?: boolean;
}

export interface SettingsSection {
  title?: string;
  rows: SettingsRow[];
}

export interface SideDrawerProps {
  /** Render the fixed overlay; closed by default (inset-0 would blanket the page). */
  isOpen?: boolean;
  title?: string;
  side?: "right" | "left";
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  sections?: SettingsSection[];
  footerPrimary?: string;
  footerSecondary?: string;
  onTabChange?: (id: string) => void;
  onRowToggle?: (label: string, enabled: boolean) => void;
  onRowAction?: (label: string) => void;
  onClose?: () => void;
  onFooterPrimary?: () => void;
}

const BUTTON_TONE: Record<string, string> = {
  indigo: "bg-indigo-600 text-white hover:bg-indigo-500",
  danger: "border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/50 dark:hover:bg-rose-950/40",
  outline:
    "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

/**
 * SettingsSideDrawer - side-anchored settings panel with tabs, setting rows and a sticky footer.
 */
export default function SettingsSideDrawer({
  title = "Settings",
  side = "right",
  tabs = [],
  activeTab = "",
  sections = [],
  footerPrimary = "",
  footerSecondary = "",
  onTabChange,
  onRowToggle,
  onRowAction,
  onClose,
  isOpen = false,
  onFooterPrimary,
}: SideDrawerProps) {
  const sideClass = side === "left" ? "left-0 rounded-r-2xl" : "right-0 rounded-l-2xl";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" data-side-drawer data-side={side}>
      <div className="absolute inset-0 bg-zinc-950/50" data-drawer-overlay onClick={() => onClose?.()} />
      <aside
        className={`absolute top-0 flex h-full w-full max-w-md flex-col border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 ${sideClass}`}
        data-drawer-panel
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
          <button
            type="button"
            data-drawer-close
            aria-label="Close settings"
            onClick={() => onClose?.()}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {tabs.length ? (
          <div className="flex gap-1 border-b border-zinc-200 px-5 pt-1 dark:border-zinc-800" role="tablist" data-drawer-tabs>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeTab}
                data-drawer-tab={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  tab.id === activeTab
                    ? "border-indigo-500 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4" data-drawer-body>
          {sections.map((section, sectionIndex) => (
            <section key={sectionIndex} className={sectionIndex > 0 ? "mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800" : ""}>
              {section.title ? <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{section.title}</h3> : null}
              <ul className={section.title ? "mt-2 space-y-3" : "space-y-3"}>
                {section.rows.map((row, rowIndex) => (
                  <li key={rowIndex} className="flex items-center justify-between gap-4" data-settings-row={row.label}>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">{row.label}</span>
                      {row.description ? <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{row.description}</span> : null}
                    </span>
                    {row.control === "toggle" ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(row.enabled)}
                        data-row-toggle
                        onClick={() => onRowToggle?.(row.label, !row.enabled)}
                        className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          row.enabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${row.enabled ? "translate-x-4" : ""}`} />
                      </button>
                    ) : null}
                    {row.control === "select" ? (
                      <select
                        data-row-select
                        value={row.value}
                        onChange={() => {}}
                        className="shrink-0 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        {(row.options || []).map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : null}
                    {row.control === "button" ? (
                      <button
                        type="button"
                        data-row-button
                        onClick={() => onRowAction?.(row.label)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${BUTTON_TONE[row.buttonTone || "outline"]}`}
                      >
                        {row.buttonLabel || "Open"}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {footerPrimary || footerSecondary ? (
          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800" data-drawer-footer>
            {footerSecondary ? (
              <button type="button" data-drawer-secondary className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                {footerSecondary}
              </button>
            ) : null}
            {footerPrimary ? (
              <button
                type="button"
                data-drawer-primary
                onClick={() => onFooterPrimary?.()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {footerPrimary}
              </button>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
