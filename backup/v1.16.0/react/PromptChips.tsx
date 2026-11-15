import React from "react";
import { Sparkles } from "./UiIcon";

export interface PromptChipsProps {
  suggestions: string[];
  onSelect: (prompt: string) => void;
  className?: string;
}

export const PromptChips: React.FC<PromptChipsProps> = ({
  suggestions,
  onSelect,
  className = "",
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 my-3 ${className}`}>
      {suggestions.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(item)}
          className="group flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left"
        >
          <Sparkles className="w-3 h-3 text-amber-500/70 group-hover:text-amber-500 transition-colors flex-shrink-0" />
          <span className="truncate max-w-[280px]">{item}</span>
        </button>
      ))}
    </div>
  );
};
