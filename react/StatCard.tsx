import React from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  trend?: number[];
  icon?: UiIconName;
  className?: string;
}

const Sparkline: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => {
  if (data.length < 2) return null;
  const width = 96;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-24" fill="none" aria-hidden="true">
      <polyline
        points={points}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "stroke-emerald-500" : "stroke-red-500"}
      />
    </svg>
  );
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  deltaLabel,
  trend,
  icon,
  className = "",
}) => {
  const positive = (delta ?? 0) >= 0;
  return (
    <div
      className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        {icon && (
          <span className="text-zinc-400 dark:text-zinc-500">
            <UiIcon name={icon} size={16} />
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</div>
          {typeof delta === "number" && (
            <div className="mt-1 flex items-center gap-1">
              <UiIcon
                name={positive ? "trending-up" : "trending-down"}
                size={13}
                className={positive ? "text-emerald-500" : "text-red-500"}
              />
              <span className={`text-[11px] font-medium ${positive ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                {positive ? "+" : ""}
                {delta}%
              </span>
              {deltaLabel && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{deltaLabel}</span>
              )}
            </div>
          )}
        </div>
        {trend && trend.length > 1 && <Sparkline data={trend} positive={positive} />}
      </div>
    </div>
  );
};

export default StatCard;
