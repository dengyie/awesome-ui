import React, { useState } from "react";
import { ChevronDown, Sparkles } from "./UiIcon";

export interface ThinkingStep {
  id: string;
  label: string;
  durationMs?: number;
}

export interface ThinkingBlockProps {
  content: string;
  isThinking?: boolean;
  durationSeconds?: number;
  steps?: ThinkingStep[];
  defaultExpanded?: boolean;
  className?: string;
}

const formatDuration = (ms?: number) => {
  if (typeof ms !== "number") return "";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
};

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  content,
  isThinking = false,
  durationSeconds,
  steps = [],
  defaultExpanded = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isThinking);

  if (!content && !isThinking && steps.length === 0) return null;

  const runningStep = steps.find((step) => !step.durationMs);
  const collapsedSummary =
    runningStep?.label ||
    (durationSeconds ? `Thought for ${durationSeconds}s` : "Thought process");

  return (
    <div
      className={`my-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
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

      {/* Collapsed summary row: running step or last finished step */}
      {!isExpanded && (runningStep || steps.length > 0) && (
        <div className="px-3.5 pb-2.5 -mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          {runningStep ? (
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="truncate">{runningStep.label}</span>
            </>
          ) : (
            <>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="truncate">{steps[steps.length - 1].label}</span>
              {steps[steps.length - 1].durationMs !== undefined && (
                <span className="tabular-nums">{formatDuration(steps[steps.length - 1].durationMs)}</span>
              )}
            </>
          )}
        </div>
      )}

      {/* Expandable Reasoning Content */}
      {isExpanded && (
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
          {steps.length > 0 && (
            <ol className="px-4 pt-3 pb-1">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const done = typeof step.durationMs === "number";
                return (
                  <li key={step.id} className="relative pl-5">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[5px] top-4 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700"
                      />
                    )}
                    <span className="absolute left-0 top-1.5">
                      {done ? (
                        <span className="block h-[11px] w-[11px] rounded-full bg-emerald-500" />
                      ) : (
                        <span className="block h-[11px] w-[11px] rounded-full border-2 border-amber-400 animate-pulse" />
                      )}
                    </span>
                    <div className="pb-2.5 flex items-center gap-2">
                      <span className={`truncate ${done ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"}`}>
                        {step.label}
                      </span>
                      {step.durationMs !== undefined && (
                        <span className="ml-auto shrink-0 tabular-nums text-[10px] text-zinc-400 dark:text-zinc-500">
                          {formatDuration(step.durationMs)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          <div
            className={`px-4 py-3 text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap text-[13px] ${
              steps.length > 0 ? "border-t border-zinc-200/50 dark:border-zinc-800/50" : ""
            }`}
          >
            {content || <span className="italic text-zinc-400">Processing thoughts...</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;
