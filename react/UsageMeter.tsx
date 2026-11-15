import React from "react";
import { UiIcon } from "./UiIcon";

export type UsageMeterTone = "ok" | "warning" | "danger";

export interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  showLegend?: boolean;
  className?: string;
}

export const usageTone = (used: number, limit: number): UsageMeterTone => {
  if (limit <= 0) return "danger";
  const ratio = used / limit;
  if (ratio >= 0.9) return "danger";
  if (ratio >= 0.7) return "warning";
  return "ok";
};

const TONE = {
  ok: { bar: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  warning: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  danger: { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

export const UsageMeter: React.FC<UsageMeterProps> = ({
  label,
  used,
  limit,
  unit = "",
  showLegend = true,
  className = "",
}) => {
  const tone = usageTone(used, limit);
  const ratio = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 1;
  const percent = Math.round(ratio * 100);
  const remaining = Math.max(0, limit - used);
  const styles = TONE[tone];

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{label}</p>
        <p className={`text-xs font-bold tabular-nums ${styles.text}`}>{percent}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className={`h-full rounded-full transition-[width] duration-500 ${styles.bar}`} style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10.5px] tabular-nums text-zinc-500 dark:text-zinc-400">
        <span>
          {used.toLocaleString()} / {limit.toLocaleString()}
          {unit && ` ${unit}`}
        </span>
        {showLegend && remaining > 0 && (
          <span className="inline-flex items-center gap-1">
            <UiIcon name="clock" size={10} />
            {remaining.toLocaleString()} left
          </span>
        )}
        {showLegend && remaining <= 0 && <span className="font-semibold text-rose-500">Limit reached</span>}
      </div>
    </div>
  );
};

export default UsageMeter;
