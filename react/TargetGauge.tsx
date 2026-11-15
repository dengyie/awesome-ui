import React from "react";

export interface TargetGaugeZone {
  /** Raw start of the zone on the 0–100 scale. */
  from: number;
  tone: "rose" | "amber" | "emerald";
}

export interface TargetGaugeProps {
  value: number;
  target: number;
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  zones?: TargetGaugeZone[];
  remainingLabel?: string;
  className?: string;
}

const ZONE_COLOR: Record<NonNullable<TargetGaugeZone["tone"]>, string> = {
  rose: "bg-rose-500",
  amber: "bg-amber-400",
  emerald: "bg-emerald-500",
};

const clamp01 = (value: number) => Math.min(100, Math.max(0, value));

export const TargetGauge: React.FC<TargetGaugeProps> = ({
  value,
  target,
  label = "Progress",
  valuePrefix = "",
  valueSuffix = "",
  zones = [
    { from: 0, tone: "rose" },
    { from: 60, tone: "amber" },
    { from: 85, tone: "emerald" },
  ],
  remainingLabel,
  className = "",
}) => {
  const percent = target > 0 ? (value / target) * 100 : 0;
  const angle = (clamp01(percent) / 100) * 180 - 90;
  const remaining = Math.max(0, target - value);
  const sorted = [...zones].sort((a, b) => a.from - b.from);
  const segments = sorted.map((zone, index) => {
    const end = index + 1 < sorted.length ? sorted[index + 1].from : 100;
    return { ...zone, width: `${Math.max(0, end - zone.from)}%` };
  });
  const currentTone = [...segments].reverse().find((zone) => clamp01(percent) >= zone.from)?.tone || "rose";

  return (
    <div
      data-target-gauge
      role="img"
      aria-label={`${label}: ${valuePrefix}${value}${valueSuffix} of ${valuePrefix}${target}${valueSuffix}`}
      className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <div className="relative mx-auto mt-3 h-[70px] w-[140px] overflow-hidden">
        {/* Zone band (top half of a 140px circle) */}
        <div className="absolute inset-x-0 top-0 flex h-[70px] w-[140px] overflow-hidden rounded-t-full">
          {segments.map((zone, index) => (
            <span key={index} className={`h-full ${ZONE_COLOR[zone.tone]}`} style={{ width: zone.width }} />
          ))}
        </div>
        {/* Inner cut-out to make it an arc */}
        <div className="absolute left-1/2 top-[18px] h-[52px] w-[104px] -translate-x-1/2 rounded-t-full bg-white dark:bg-zinc-900" />
        {/* Needle */}
        <div
          data-gauge-needle
          className="absolute bottom-0 left-1/2 h-[54px] w-0.5 origin-bottom bg-zinc-900 dark:bg-zinc-100"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <span className="absolute -top-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
        </div>
        <div className="absolute bottom-[-4px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 dark:border-zinc-900 dark:bg-zinc-100" />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-zinc-400">
        <span>
          {valuePrefix}0{valueSuffix}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${ZONE_COLOR[currentTone]}`}
          data-gauge-value
        >
          {valuePrefix}
          {value}
          {valueSuffix}
        </span>
        <span>
          {valuePrefix}
          {target}
          {valueSuffix}
        </span>
      </div>
      {remainingLabel ? (
        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {remaining > 0 ? `Remaining: ${valuePrefix}${remaining}${valueSuffix} — ` : ""}
          {remainingLabel}
        </p>
      ) : null}
      <span className="hidden" data-gauge-percent>
        {Math.round(percent)}%
      </span>
    </div>
  );
};

export default TargetGauge;
