import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

export interface ThinkingBlockProps {
  content: string;
  isThinking?: boolean;
  durationSeconds?: number;
  defaultExpanded?: boolean;
  className?: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  content,
  isThinking = false,
  durationSeconds,
  defaultExpanded = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isThinking);

  if (!content && !isThinking) return null;

  return (
    <div
      className={`my-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium transition-colors select-none text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles
            className={`w-3.5 h-3.5 ${
              isThinking ? "text-amber-500 animate-spin" : "text-zinc-400"
            }`}
          />
          <span>
            {isThinking
              ? "Deeply thinking..."
              : durationSeconds
              ? `Thought for ${durationSeconds}s`
              : "Thought process"}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable Reasoning Content */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap text-[13px] bg-white/40 dark:bg-zinc-950/20">
          {content || (
            <span className="italic text-zinc-400">Processing thoughts...</span>
          )}
        </div>
      )}
    </div>
  );
};
