import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export type ActivityFeedKind = "event" | "comment" | "merge" | "deploy" | "flag" | "alert";

export interface ActivityEntry {
  id: string;
  kind: ActivityFeedKind;
  actor: string;
  action: string;
  target?: string;
  time: string;
  detail?: string;
}

export interface ActivityFeedProps {
  entries: ActivityEntry[];
  title?: string;
  className?: string;
}

const KIND: Record<ActivityFeedKind, { icon: UiIconName; iconClass: string }> = {
  event: { icon: "sparkles", iconClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300" },
  comment: { icon: "user", iconClass: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300" },
  merge: { icon: "git-branch", iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" },
  deploy: { icon: "zap", iconClass: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300" },
  flag: { icon: "star", iconClass: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300" },
  alert: { icon: "alert-triangle", iconClass: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300" },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ entries, title, className = "" }) => {
  return (
    <section className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {title && (
        <h3 className="mb-3 text-xs font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      )}
      <ol className="relative space-y-3.5 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-zinc-100 dark:before:bg-zinc-800">
        {entries.map((entry) => {
          const kind = KIND[entry.kind] ?? KIND.event;
          return (
            <li key={entry.id} className="relative flex items-start gap-3">
              <span className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-900 ${kind.iconClass}`}>
                <UiIcon name={kind.icon} size={12} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{entry.actor}</span>{" "}
                  {entry.action}
                  {entry.target && (
                    <span className="ml-1 rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {entry.target}
                    </span>
                  )}
                </p>
                {entry.detail && (
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-zinc-400 dark:text-zinc-500">{entry.detail}</p>
                )}
              </div>
              <time className="shrink-0 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">{entry.time}</time>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default ActivityFeed;
