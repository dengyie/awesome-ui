import React from "react";

export interface WorkspaceOption {
  id: string;
  name: string;
  logo?: string;
  memberCount?: number;
  role?: string;
  current?: boolean;
}

export interface WorkspaceSwitcherMenuProps {
  title?: string;
  subtitle?: string;
  workspaces?: WorkspaceOption[];
  footerUser?: { name: string; email: string; initials?: string };
  createLabel?: string;
  logoutLabel?: string;
  variant?: "page" | "dropdown";
  onSelect?: (workspace: WorkspaceOption) => void;
  onCreateNew?: () => void;
  onLogout?: () => void;
}

/**
 * WorkspaceSwitcherMenu - workspace picker with member/role rows, create and logout actions.
 */
export default function WorkspaceSwitcherMenu({
  title = "Workspaces",
  subtitle = "Choose the workspace you want to access",
  workspaces = [],
  footerUser,
  createLabel = "+ Create new workspace",
  logoutLabel = "Log out",
  variant = "page",
  onSelect,
  onCreateNew,
  onLogout,
}: WorkspaceSwitcherMenuProps) {
  const initialsOf = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => (part[0] || "").toUpperCase())
      .join("");

  return (
    <div
      data-workspace-switcher
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${variant === "page" ? "max-w-sm p-5" : "p-3"}`}
    >
      {title ? (
        <div className={variant === "page" ? "" : "px-2 pt-1"}>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
        </div>
      ) : null}

      <ul className={variant === "page" ? "mt-4 space-y-2" : "mt-3 space-y-1"}>
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <button
              type="button"
              data-workspace-option={workspace.id}
              onClick={() => onSelect?.(workspace)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                workspace.current ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              }`}
            >
              {workspace.logo ? (
                <img src={workspace.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg" />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                  {initialsOf(workspace.name)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{workspace.name}</span>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                  {workspace.memberCount ?? 1} member{(workspace.memberCount ?? 1) === 1 ? "" : "s"}
                  {workspace.role ? ` · You are ${workspace.role.startsWith("A") || workspace.role.startsWith("E") ? `an ${workspace.role}` : `a ${workspace.role}`}` : ""}
                </span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-zinc-400">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {createLabel ? (
        <button
          type="button"
          data-workspace-create
          onClick={() => onCreateNew?.()}
          className={`w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 ${variant === "page" ? "mt-4" : "mt-2"}`}
        >
          {createLabel}
        </button>
      ) : null}

      {footerUser ? (
        <div className={`flex items-center gap-2.5 border-t border-zinc-200 pt-3 dark:border-zinc-800 ${variant === "page" ? "mt-4" : "mt-3"}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
            {footerUser.initials || initialsOf(footerUser.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{footerUser.name}</span>
            <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">{footerUser.email}</span>
          </span>
          {logoutLabel ? (
            <button type="button" data-workspace-logout onClick={() => onLogout?.()} className="shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
              {logoutLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
