import React from "react";

export interface StreamingProgressBarProps {
  value?: number | null;
  label?: string;
  status?: "streaming" | "done" | "error";
  className?: string;
}

const STATUS_BAR: Record<string, string> = {
  streaming: "bg-indigo-500",
  done: "bg-emerald-500",
  error: "bg-rose-500",
};

export const StreamingProgressBar: React.FC<StreamingProgressBarProps> = ({
  value = null,
  label,
  status = "streaming",
  className = "",
}) => {
  const clamped = value === null || value === undefined ? null : Math.min(100, Math.max(0, value));
  const indeterminate = clamped === null;
  const barColor = STATUS_BAR[status] || STATUS_BAR.streaming;

  return (
    <div className={`w-full ${className}`}>
      {(label || !indeterminate) && (
        <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-zinc-400">
          <span className="truncate">{label}</span>
          {!indeterminate && <span className="tabular-nums shrink-0">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
        aria-label={label || "Progress"}
        className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
      >
        {indeterminate ? (
          <div className={`h-full w-1/3 rounded-full ${barColor} animate-pulse`} />
        ) : (
          <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${clamped}%` }} />
        )}
      </div>
    </div>
  );
};
export default StreamingProgressBar;
