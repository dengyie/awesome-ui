/**
 * PermissionMatrix - Roles × permissions matrix: heading with description,
 * Overview / Permission details tabs, grouped permission rows (group header
 * spans the table) and per-role cells with Edit / View only / No access /
 * N/A states (Vanta roles permission-details pattern).
 */
import React from "react";

export type PermissionCellState = "edit" | "view" | "none" | "na";

export interface PermissionCell {
  state: PermissionCellState;
}

export interface PermissionRow {
  id: string;
  label: string;
  cells: PermissionCellState[]; // aligned with roles order
}

export interface PermissionGroup {
  id: string;
  title: string;
  rows: PermissionRow[];
}

export interface PermissionMatrixProps {
  title?: string;
  description?: string;
  roles?: string[];
  groups?: PermissionGroup[];
  className?: string;
  onCellClick?: (detail: { row: PermissionRow; role: string; state: PermissionCellState; rowIndex: number; roleIndex: number }) => void;
}

const STATE_META: Record<PermissionCellState, { label: string; icon: string; cls: string }> = {
  edit: { label: "Edit", icon: "✔", cls: "text-emerald-600 dark:text-emerald-400" },
  view: { label: "View only", icon: "👁", cls: "text-zinc-600 dark:text-zinc-300" },
  none: { label: "No access", icon: "✖", cls: "text-rose-600 dark:text-rose-400" },
  na: { label: "N / A", icon: "", cls: "text-zinc-400 dark:text-zinc-500" },
};

export default function PermissionMatrix({
  title = "Roles",
  description = "Roles are bundles of permissions related to managing your security and compliance program. They ensure that team members have access to only what they need to complete their work.",
  roles = ["Editor", "Auditor", "View only admin", "Sales admin"],
  groups = [
    {
      id: "employee",
      title: "Employee Experience",
      rows: [
        { id: "onboarding", label: "Can complete new hire onboarding tasks", cells: ["edit", "na", "edit", "edit"] },
        { id: "personal", label: "Can update personal settings", cells: ["edit", "edit", "edit", "edit"] },
      ],
    },
    {
      id: "apps",
      title: "Connected apps",
      rows: [
        { id: "integrations", label: "Integrations", cells: ["edit", "none", "view", "none"] },
        { id: "tokens", label: "API Tokens", cells: ["none", "none", "view", "none"] },
      ],
    },
    {
      id: "compliance",
      title: "Compliance pages",
      rows: [
        { id: "tests", label: "Tests & Documents", cells: ["edit", "view", "view", "none"] },
        { id: "frameworks", label: "Frameworks & Controls", cells: ["edit", "view", "view", "none"] },
        { id: "policies", label: "Policies", cells: ["edit", "view", "view", "none"] },
      ],
    },
  ],
  className = "",
  onCellClick,
}: PermissionMatrixProps) {
  const [tab, setTab] = React.useState<"overview" | "details">("details");

  return (
    <div data-permmtx className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 ${className}`}>
      <h2 data-permmtx-title className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p data-permmtx-description className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>

      {/* tabs */}
      <div data-permmtx-tabs className="mt-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {(["overview", "details"] as const).map((t) => (
          <button
            key={t}
            data-permmtx-tab={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t === "overview" ? "Overview" : "Permission details"}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <div data-permmtx-table className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                <th className="px-4 py-3 font-semibold">Actions</th>
                {roles.map((r) => (
                  <th key={r} data-permmtx-role={r} className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <React.Fragment key={g.id}>
                  <tr data-permmtx-group={g.id} className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <td colSpan={roles.length + 1} className="px-4 py-2.5 text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {g.title}
                    </td>
                  </tr>
                  {g.rows.map((row) => (
                    <tr key={row.id} data-permmtx-row={row.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                      <td className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-200">{row.label}</td>
                      {row.cells.map((state, i) => {
                        const meta = STATE_META[state] ?? STATE_META.na;
                        return (
                          <td key={roles[i] ?? i} className="px-4 py-3 text-center">
                            <button
                              type="button"
                              data-permmtx-cell={`${row.id}:${roles[i]}`}
                              data-permmtx-state={state}
                              onClick={() => onCellClick?.({ row, role: roles[i] ?? "", state, rowIndex: 0, roleIndex: i })}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 ${meta.cls}`}
                            >
                              {meta.icon && <span aria-hidden="true">{meta.icon}</span>}
                              <span>{meta.label}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div data-permmtx-overview className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {roles.length} roles · {groups.reduce((n, g) => n + g.rows.length, 0)} permission rules configured.
          </p>
        </div>
      )}
    </div>
  );
}
