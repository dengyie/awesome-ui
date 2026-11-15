import React, { useState } from "react";
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "./UiIcon";

export interface MessageActionToolbarProps {
  content: string;
  role?: "assistant" | "user" | string;
  onRetry?: () => void;
  onFeedback?: (type: "up" | "down") => void;
  branchIndex?: number;
  totalBranches?: number;
  onBranchChange?: (nextIndex: number) => void;
  className?: string;
}

export const MessageActionToolbar: React.FC<MessageActionToolbarProps> = ({
  content,
  role = "assistant",
  onRetry,
  onFeedback,
  branchIndex,
  totalBranches,
  onBranchChange,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThumb = (type: "up" | "down") => {
    const next = feedback === type ? null : type;
    setFeedback(next);
    if (onFeedback && next) onFeedback(next);
  };

  return (
    <div
      className={`flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 select-none ${className}`}
    >
      {/* Branch Navigator (if multiple versions exist) */}
      {totalBranches && totalBranches > 1 && branchIndex !== undefined && onBranchChange && (
        <div className="flex items-center gap-0.5 mr-2 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <button
            type="button"
            disabled={branchIndex <= 0}
            onClick={() => onBranchChange(branchIndex - 1)}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none p-0.5"
            title="Previous version"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span>
            {branchIndex + 1}/{totalBranches}
          </span>
          <button
            type="button"
            disabled={branchIndex >= totalBranches - 1}
            onClick={() => onBranchChange(branchIndex + 1)}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none p-0.5"
            title="Next version"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors"
        title="Copy response"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Retry / Regenerate */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors"
          title="Regenerate response"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Thumbs Up / Down */}
      {role === "assistant" && (
        <>
          <button
            type="button"
            onClick={() => handleThumb("up")}
            className={`p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors ${
              feedback === "up" ? "text-blue-500" : "hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
            title="Good response"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleThumb("down")}
            className={`p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors ${
              feedback === "down" ? "text-rose-500" : "hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
            title="Bad response"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
