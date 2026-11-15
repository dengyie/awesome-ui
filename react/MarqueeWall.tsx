import React from "react";

export interface MarqueeCard {
  name: string;
  handle?: string;
  text: string;
  /** Renders an anonymous NPS-style card (initials avatar, no handle link). */
  anonymous?: boolean;
}

export interface MarqueeWallProps {
  rows: MarqueeCard[][];
  speedSeconds?: number;
  paused?: boolean;
  className?: string;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const AVATAR_TONES = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
];

export const MarqueeWall: React.FC<MarqueeWallProps> = ({ rows, speedSeconds = 40, paused, className = "" }) => {
  if (!rows.length) return null;
  return (
    <div
      data-marquee-wall
      className={`space-y-3 overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-violet-950 via-zinc-950 to-zinc-950 p-4 dark:border-zinc-800 ${className}`}
    >
      {rows.map((row, rowIndex) => {
        const reverse = rowIndex % 2 === 1;
        return (
          <div
            key={rowIndex}
            data-marquee-row={rowIndex}
            className="group flex overflow-hidden"
            style={
              paused
                ? { animationPlayState: "paused" }
                : undefined
            }
          >
            <div
              className={`flex min-w-full shrink-0 gap-3 marquee-track${reverse ? " marquee-track-reverse" : ""}`}
              style={{
                animation: `marquee-scroll ${speedSeconds}s linear infinite${reverse ? " reverse" : ""}`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {[...row, ...row].map((card, index) => (
                <figure
                  key={`${card.name}-${index}`}
                  data-marquee-card={index}
                  className="w-64 shrink-0 rounded-xl bg-white p-4 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                        AVATAR_TONES[index % AVATAR_TONES.length]
                      }`}
                    >
                      {initialsOf(card.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{card.name}</span>
                      {card.handle && !card.anonymous ? (
                        <span className="block truncate text-[11px] text-indigo-500">@{card.handle}</span>
                      ) : null}
                    </span>
                  </div>
                  <blockquote className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {card.text}
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>
        );
      })}
      <style>{`@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } } .marquee-track:hover { animation-play-state: paused !important; }`}</style>
    </div>
  );
};

export default MarqueeWall;
