import React, { useState } from "react";

export interface FollowSuggestion {
  id: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface FollowSuggestionsCardProps {
  title?: string;
  suggestions?: FollowSuggestion[];
  followLabel?: string;
  followingLabel?: string;
  emptyText?: string;
  /** follow new people on follow-click instead of toggling in place */
  onFollow?: (person: FollowSuggestion) => void;
  onDismiss?: (person: FollowSuggestion) => void;
  className?: string;
}

export default function FollowSuggestionsCard({
  title = "Discover more people",
  suggestions = [],
  followLabel = "Follow",
  followingLabel = "Following",
  emptyText = "No more suggestions right now — check back later.",
  onFollow,
  onDismiss,
  className = "",
}: FollowSuggestionsCardProps) {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  const visible = suggestions.filter((s) => !dismissed[s.id]);

  const toggleFollow = (person: FollowSuggestion) => {
    setFollowed((prev) => ({ ...prev, [person.id]: !prev[person.id] }));
    if (!followed[person.id]) onFollow?.(person);
  };

  const initialsOf = (person: FollowSuggestion) =>
    person.initials ??
    person.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div data-follow-suggestions className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <button
        type="button"
        data-follow-suggestions-toggle
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span data-follow-suggestions-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</span>
        <span aria-hidden="true" className={`text-xs text-zinc-400 transition-transform ${collapsed ? "" : "rotate-180"}`}>▾</span>
      </button>

      {!collapsed ? (
        visible.length > 0 ? (
          <div data-follow-suggestions-grid className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">
            {visible.map((person) => (
              <div
                key={person.id}
                data-follow-suggestions-card={person.id}
                className="relative flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 text-center dark:border-zinc-700"
              >
                <button
                  type="button"
                  data-follow-suggestions-dismiss={person.id}
                  aria-label={`Dismiss ${person.name}`}
                  onClick={() => {
                    setDismissed((prev) => ({ ...prev, [person.id]: true }));
                    onDismiss?.(person);
                  }}
                  className="absolute right-1.5 top-1.5 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  ✕
                </button>
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt="" className="h-10 w-10 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {initialsOf(person)}
                  </span>
                )}
                <p className="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{person.name}</p>
                {person.handle ? (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{person.handle}</p>
                ) : null}
                <button
                  type="button"
                  data-follow-suggestions-follow={person.id}
                  aria-pressed={!!followed[person.id]}
                  onClick={() => toggleFollow(person)}
                  className={`mt-2.5 w-full rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    followed[person.id]
                      ? "border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                >
                  {followed[person.id] ? followingLabel : followLabel}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p data-follow-suggestions-empty className="px-4 pb-4 text-[11px] text-zinc-400 dark:text-zinc-500">
            {emptyText}
          </p>
        )
      ) : null}
    </div>
  );
}
