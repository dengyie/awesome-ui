import React, { useState } from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface ContextUsageTokenBreakdown {
  label: string;
  count: number;
  colorClass?: string;
}

export interface ContextUsageProps {
  usedTokens: number;
  maxTokens: number;
  modelName?: string;
  contextWindow?: number;
  breakdown?: ContextUsageTokenBreakdown[];
  compact?: boolean;
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
};

export const ContextUsageBadge: React.FC<ContextUsageProps> = ({
  usedTokens,
  maxTokens,
  modelName,
  breakdown = [],
  compact = false,
  className = "",
}) => {
  const [showPopover, setShowPopover] = useState(false);

  const safeMax = Math.max(1, maxTokens);
  const safeUsed = Math.max(0, usedTokens);
  const percentage = Math.min(100, Math.round((safeUsed / safeMax) * 100));

  let statusColor = "bg-emerald-500 text-emerald-500 border-emerald-500/20";
  let barColor = "bg-emerald-500";
  if (percentage >= 90) {
    statusColor = "bg-rose-500 text-rose-500 border-rose-500/20";
    barColor = "bg-rose-500";
  } else if (percentage >= 70) {
    statusColor = "bg-amber-500 text-amber-500 border-amber-500/20";
    barColor = "bg-amber-500";
  }

  return (
    <div className={`relative inline-block text-xs font-sans select-none ${className}`}>
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        onBlur={() => setTimeout(() => setShowPopover(false), 200)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors shadow-sm"
        aria-label="Context Window Usage"
        aria-expanded={showPopover}
      >
        <UiIcon name="cpu" size={14} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
        {modelName && !compact && (
          <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[120px]">
            {modelName}
          </span>
        )}
        <div className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
          {percentage}%
        </span>
      </button>

      {showPopover && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Context Window</span>
            <span className="font-mono text-[11px] text-zinc-500">
              {formatNumber(safeUsed)} / {formatNumber(safeMax)}
            </span>
          </div>

          {modelName && (
            <div className="pt-2 text-[11px] text-zinc-500 flex justify-between">
              <span>Model</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">{modelName}</span>
            </div>
          )}

          {breakdown.length > 0 && (
            <div className="pt-2.5 space-y-1.5">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Breakdown</div>
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                    <span className={`w-2 h-2 rounded-full ${item.colorClass || 'bg-zinc-400'}`} />
                    {item.label}
                  </span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {formatNumber(item.count)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ContextUsageBadge;
