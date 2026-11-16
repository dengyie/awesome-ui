/**
 * EventTagGrid - Grouped key/value tag grid for a single event: tags are
 * grouped under collapsible-looking group headers (browser, device, os…) and
 * rendered as label/value rows in a two-column layout (Sentry Tags pattern).
 */
import React from "react";

export interface EventTag {
  key: string;
  value: string;
  link?: boolean;
}

export interface EventTagGroup {
  id: string;
  title: string;
  tags: EventTag[];
}

export interface EventTagGridProps {
  title?: string;
  scopes?: string[];
  activeScope?: string;
  groups?: EventTagGroup[];
  className?: string;
  onTagClick?: (tag: EventTag, group: EventTagGroup) => void;
}

const DEFAULT_GROUPS: EventTagGroup[] = [
  {
    id: "left",
    title: "left",
    tags: [
      { key: "browser", value: "Chrome 141.0.0", link: true },
      { key: "browser.name", value: "Chrome" },
      { key: "device", value: "Mac", link: true },
      { key: "device.family", value: "Mac" },
      { key: "environment", value: "development", link: true },
      { key: "handled", value: "no" },
      { key: "level", value: "error" },
    ],
  },
  {
    id: "right",
    title: "right",
    tags: [
      { key: "mechanism", value: "auto.browser.global_handlers.onunhandledrejection" },
      { key: "os", value: "Mac OS X >=10.15.7", link: true },
      { key: "os.name", value: "Mac OS X" },
      { key: "release", value: "b95a49d8d5b3", link: true },
      { key: "transaction", value: "/sentry-example-page", link: true },
      { key: "turbopack", value: "True" },
      { key: "url", value: "http://localhost:3000/sentry-example-page", link: true },
    ],
  },
];

export default function EventTagGrid({
  title = "Tags",
  scopes = ["All", "Custom", "Application", "Client", "Other"],
  activeScope = "All",
  groups = DEFAULT_GROUPS,
  className = "",
  onTagClick,
}: EventTagGridProps) {
  return (
    <div data-tag-grid className={`w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div data-tag-grid-header className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <p data-tag-grid-title className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</p>
        <div data-tag-grid-scopes className="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
          {scopes.map((scope) => {
            const active = scope === activeScope;
            return (
              <button
                key={scope}
                type="button"
                data-tag-scope={scope}
                aria-pressed={active}
                onClick={() => onTagClick?.({ key: scope, value: scope }, { id: "scope", title: scope, tags: [] })}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-white text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {scope}
              </button>
            );
          })}
        </div>
      </div>
      <div data-tag-grid-body className="grid grid-cols-1 gap-x-6 px-4 py-3 md:grid-cols-2">
        {groups.map((group) => (
          <dl key={group.id} data-tag-group={group.id} className="flex flex-col gap-1.5">
            {group.tags.map((tag) => (
              <div key={tag.key} data-tag-row className="grid grid-cols-[9rem_1fr] items-baseline gap-2 text-xs">
                <dt data-tag-key className="truncate font-mono text-zinc-500 dark:text-zinc-400" title={tag.key}>{tag.key}</dt>
                <dd className="min-w-0">
                  <button
                    type="button"
                    data-tag-value={tag.value}
                    onClick={() => onTagClick?.(tag, group)}
                    className={`block max-w-full truncate rounded px-1 py-0.5 text-left transition-colors ${
                      tag.link
                        ? "bg-zinc-50 text-sky-600 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-sky-400 dark:hover:bg-zinc-800"
                        : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
                    }`}
                    title={tag.value}
                  >
                    {tag.value}
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </div>
  );
}
