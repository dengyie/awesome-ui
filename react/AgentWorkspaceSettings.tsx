import React from "react";

export interface AgentSettingToggle {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export interface AgentSettingsSection {
  id: string;
  title: string;
  description?: string;
  toggles: AgentSettingToggle[];
}

export interface AgentWorkspaceSettingsProps {
  title?: string;
  subtitle?: string;
  tabs?: { id: string; label: string }[];
  sections: AgentSettingsSection[];
  onToggle?: (toggle: AgentSettingToggle, enabled: boolean) => void;
  className?: string;
}

/**
 * AgentWorkspaceSettings - agent workspace settings page body: optional
 * section tabs, titled groups with description and description-led toggle
 * rows (Uxcel/Contra settings style).
 */
export default function AgentWorkspaceSettings({
  title = "Settings",
  subtitle = "Manage and update your agent workspace.",
  tabs,
  sections,
  onToggle,
  className = "",
}: AgentWorkspaceSettingsProps) {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.flatMap((s) => s.toggles.map((t) => [t.id, t.enabled])))
  );

  const flip = (toggle: AgentSettingToggle) => {
    const next = !enabled[toggle.id];
    setEnabled((e) => ({ ...e, [toggle.id]: next }));
    onToggle?.(toggle, next);
  };

  return (
    <div data-agent-settings className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p data-agent-settings-title className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p data-agent-settings-subtitle className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>

      {tabs && tabs.length > 0 && (
        <div data-agent-settings-tabs className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              data-agent-settings-tab={tab.id}
              aria-selected={i === 0}
              className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors aria-selected:border-transparent aria-selected:bg-zinc-900 aria-selected:text-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:aria-selected:bg-zinc-50 dark:aria-selected:text-zinc-900"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div data-agent-settings-sections className="mt-5 space-y-6">
        {sections.map((section) => (
          <section key={section.id} data-agent-settings-section={section.id}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{section.title}</p>
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                {section.toggles.filter((t) => enabled[t.id]).length}/{section.toggles.length} on
              </span>
            </div>
            {section.description && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{section.description}</p>}
            <div className="mt-3 space-y-3">
              {section.toggles.map((toggle) => {
                const on = !!enabled[toggle.id];
                return (
                  <div key={toggle.id} data-agent-setting-row={toggle.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">{toggle.label}</p>
                      {toggle.description && <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{toggle.description}</p>}
                    </div>
                    <button
                      type="button"
                      data-agent-setting-toggle
                      role="switch"
                      aria-checked={on}
                      aria-label={toggle.label}
                      onClick={() => flip(toggle)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-4" : "left-0.5"}`}></span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
