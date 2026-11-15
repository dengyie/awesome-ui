/**
 * PrReviewQueue - Grouped pull-request review list: collapsible section rows
 * with counts, PR rows with avatar, title and repo branch line (Graphite).
 */
import React, { useState } from "react";

export interface PrQueueGroup {
  id: string;
  label: string;
  prs: Array<{ id: string; title: string; repo: string; number: number; author: string }>;
}

export interface PrReviewQueueProps {
  groups?: PrQueueGroup[];
  className?: string;
  onPrClick?: (pr: PrQueueGroup["prs"][number]) => void;
}

export default function PrReviewQueue({
  groups = [
    {
      id: "waiting",
      label: "Waiting for reviewers",
      prs: [{ id: "p1", title: "Add activity feed API", repo: "mini-landing-page", number: 4, author: "Sam Lee" }],
    },
    {
      id: "drafts",
      label: "Drafts",
      prs: [
        { id: "p2", title: "Add user search", repo: "mini-landing-page", number: 7, author: "Sam Lee" },
        { id: "p3", title: "Add frontend for search", repo: "mini-landing-page", number: 6, author: "Sam Lee" },
      ],
    },
  ],
  className = "",
  onPrClick,
}: PrReviewQueueProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  return (
    <div data-pr-review-queue className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {groups.map((group) => {
        const isCollapsed = collapsed[group.id] ?? false;
        return (
          <div key={group.id} data-pr-group={group.id} className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
            <button
              type="button"
              data-pr-group-toggle={group.id}
              onClick={() => setCollapsed((prev) => ({ ...prev, [group.id]: !isCollapsed }))}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span data-pr-group-caret className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {isCollapsed ? "▶" : "▼"}
              </span>
              <span data-pr-group-count className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {group.prs.length}
              </span>
              <span data-pr-group-label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                {group.label}
              </span>
            </button>
            {!isCollapsed ? (
              <div data-pr-group-items className="pb-2">
                {group.prs.map((pr) => (
                  <button
                    key={pr.id}
                    type="button"
                    data-pr-row={pr.id}
                    onClick={() => onPrClick?.(pr)}
                    className="flex w-full items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <span data-pr-avatar className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {pr.author.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span data-pr-title className="block truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
                        {pr.title}
                      </span>
                      <span data-pr-meta className="block truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                        {pr.author} · {pr.repo} #{pr.number}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
