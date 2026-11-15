import React, { useMemo, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface PromptItem {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  category?: string;
  tags?: string[];
  favorite?: boolean;
}

export interface PromptLibraryProps {
  prompts?: PromptItem[];
  /** Extra categories shown even when no prompt uses them yet. */
  categories?: string[];
  searchable?: boolean;
  onUse?: (prompt: PromptItem) => void;
  onToggleFavorite?: (prompt: PromptItem) => void;
  className?: string;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  prompts = [],
  categories = [],
  searchable = true,
  onUse,
  onToggleFavorite,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allCategories = useMemo(() => {
    const seen = new Set<string>(categories);
    for (const prompt of prompts) if (prompt.category) seen.add(prompt.category);
    return Array.from(seen);
  }, [prompts, categories]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const inCategory = activeCategory === "all" || prompt.category === activeCategory;
      if (!inCategory) return false;
      if (!needle) return true;
      return [prompt.title, prompt.description, prompt.prompt, ...(prompt.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [prompts, activeCategory, query]);

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-col gap-2 border-b border-zinc-100 p-3 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
          <UiIcon name="sparkles" size={14} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-semibold">Prompt library</h3>
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {visible.length}
          </span>
        </div>
        {searchable && (
          <div className="relative sm:ml-auto sm:w-56">
            <UiIcon
              name="search"
              size={12}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search prompts…"
              aria-label="Search prompts"
              className="w-full rounded-lg border border-zinc-200 bg-white py-1 pl-6 pr-2 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
        {["all", ...allCategories].map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="px-3 py-8 text-center text-[11px] text-zinc-400">No prompts match your filters.</p>
      ) : (
        <ul className="grid gap-2 p-3 sm:grid-cols-2">
          {visible.map((prompt) => (
            <li
              key={prompt.id}
              className="group flex flex-col rounded-lg border border-zinc-200 p-3 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:hover:border-indigo-700"
            >
              <div className="flex items-start gap-1.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">
                      {prompt.title}
                    </span>
                    {prompt.category && (
                      <span className="shrink-0 rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        {prompt.category}
                      </span>
                    )}
                  </div>
                  {prompt.description && (
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {prompt.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={prompt.favorite ? `Unfavorite ${prompt.title}` : `Favorite ${prompt.title}`}
                  aria-pressed={!!prompt.favorite}
                  onClick={() => onToggleFavorite?.(prompt)}
                  className={`shrink-0 rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    prompt.favorite
                      ? "text-amber-500"
                      : "text-zinc-300 hover:text-amber-500 dark:text-zinc-600 dark:hover:text-amber-400"
                  }`}
                >
                  <UiIcon name="star" size={13} />
                </button>
              </div>

              <p className="mt-2 line-clamp-2 rounded bg-zinc-50 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                {prompt.prompt}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(prompt.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded bg-zinc-100 px-1 py-0.5 text-[9px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onUse?.(prompt)}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Use
                  <UiIcon name="arrow-right" size={10} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PromptLibrary;
