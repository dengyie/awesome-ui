import React from "react";
import { UiIcon } from "./UiIcon";

export interface ProfileStat {
  label: string;
  value: string | number;
}

export interface ProfileHeaderProps {
  name: string;
  /** Handle shown under the name (without @). */
  handle?: string;
  /** Role or short bio line. */
  headline?: string;
  avatarUrl?: string;
  /** Initials fallback when no avatarUrl is given. */
  initials?: string;
  /** Cover gradient class, e.g. "from-indigo-500 to-sky-400". */
  coverClass?: string;
  stats?: ProfileStat[];
  actions?: { label: string; variant?: "primary" | "secondary" | "ghost" }[];
  /** Status line under the actions, e.g. "Available for work". */
  statusText?: string;
  statusTone?: "ok" | "away";
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onAction?: (label: string) => void;
  className?: string;
}

const ACTION_VARIANT: Record<string, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500",
  secondary:
    "border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400",
  ghost:
    "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400",
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  handle,
  headline,
  avatarUrl,
  initials,
  coverClass = "from-indigo-500 via-violet-500 to-sky-400",
  stats = [],
  actions = [],
  statusText,
  statusTone = "ok",
  tabs = [],
  activeTab,
  onTabChange,
  onAction,
  className = "",
}) => {
  const initialsFallback = (initials || name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* Cover */}
      <div className={`relative h-28 bg-gradient-to-r ${coverClass}`}>
        <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          Pro
        </span>
      </div>

      <div className="px-5 pb-4">
        {/* Avatar overlaps the cover */}
        <div className="-mt-8 mb-3 flex items-end justify-between">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-16 w-16 rounded-full border-4 border-white object-cover dark:border-zinc-900"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-lg font-bold text-indigo-600 dark:border-zinc-900 dark:bg-indigo-950/60 dark:text-indigo-300">
              {initialsFallback}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onAction?.(action.label)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
                  ACTION_VARIANT[action.variant || "secondary"]
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Identity */}
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{name}</h2>
        {handle && (
          <p className="text-xs text-zinc-400">
@{handle}
          </p>
        )}
        {headline && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{headline}</p>}

        {/* Status line */}
        {statusText && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusTone === "ok" ? "bg-emerald-500" : "bg-zinc-400"}`}
              aria-hidden="true"
            />
            {statusText}
          </p>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-1">
                <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{stat.value}</dt>
                <dd className="text-[11px] text-zinc-400">{stat.label}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Tabs */}
        {tabs.length > 0 && (
          <nav aria-label="Profile sections" className="-mb-px mt-4 flex gap-1 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800">
            {tabs.map((tab) => {
              const active = tab === (activeTab ?? tabs[0]);
              return (
                <button
                  key={tab}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => onTabChange?.(tab)}
                  className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none ${
                    active
                      ? "border-indigo-600 text-zinc-900 dark:border-indigo-400 dark:text-zinc-50"
                      : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};
export default ProfileHeader;
