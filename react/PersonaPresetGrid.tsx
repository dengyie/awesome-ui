import React from "react";

export interface PersonaPreset {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  temperature?: number;
  selected?: boolean;
}

export interface PersonaPresetGridProps {
  title?: string;
  presets: PersonaPreset[];
  onSelect?: (preset: PersonaPreset) => void;
  className?: string;
}

const GRADIENTS = [
  "from-indigo-500 to-purple-500",
  "from-sky-500 to-cyan-400",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-violet-500 to-fuchsia-500",
];

/**
 * PersonaPresetGrid - Persona/voice picker: gradient emoji cards with name,
 * description and temperature hint; selected card gets an indigo ring + check.
 */
export default function PersonaPresetGrid({
  title = "Persona presets",
  presets,
  onSelect,
  className = "",
}: PersonaPresetGridProps) {
  return (
    <div data-persona-grid className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {presets.map((preset, i) => {
          const selected = !!preset.selected;
          return (
            <button
              key={preset.id}
              type="button"
              data-persona-card={preset.id}
              onClick={() => onSelect?.(preset)}
              className={`group relative rounded-lg border p-3 text-left transition-all ${
                selected
                  ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900"
                  : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              {selected && (
                <span data-persona-check className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
              <span
                data-persona-emoji
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-lg text-white ${GRADIENTS[i % GRADIENTS.length]}`}
              >
                {preset.emoji || "🤖"}
              </span>
              <p data-persona-name className="mt-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{preset.name}</p>
              {preset.description && (
                <p data-persona-desc className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{preset.description}</p>
              )}
              {typeof preset.temperature === "number" && (
                <span data-persona-temp className="mt-1.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">temp {preset.temperature}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
