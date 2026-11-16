/**
 * MapActivityList - Map + activity list split view: left column with
 * filter chips, scrollable activity cards (image, title, duration,
 * rating, price) and right map placeholder with pin bubbles and a close
 * button (GetYourGuide map-search pattern).
 */
import React from "react";

export interface MapActivity {
  id: string;
  title: string;
  image?: string;
  emoji?: string;
  city: string;
  duration: string;
  rating: number;
  reviews: number;
  price: string;
  oldPrice?: string;
  x: number; // % position on map
  y: number; // % position on map
}

export interface MapActivityListProps {
  title?: string;
  activities?: MapActivity[];
  filters?: string[];
  className?: string;
  onActivityClick?: (activity: MapActivity) => void;
  onFilterClick?: (filter: string) => void;
  onCloseMap?: () => void;
}

const MAP_SVG = `<svg viewBox="0 0 400 300" class="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="300" fill="#e8f0e4"/><path d="M0 210 C90 190 150 240 260 220 S360 250 400 230 L400 300 L0 300 Z" fill="#a5d0e8"/><path d="M-10 40 C60 70 120 30 200 60 S330 40 410 80" stroke="#f6d5a7" stroke-width="10" fill="none"/><path d="M-10 120 C70 100 160 150 250 110 S350 130 410 110" stroke="#f6d5a7" stroke-width="8" fill="none"/><rect x="40" y="30" width="50" height="34" fill="#d5e6c8"/><rect x="290" y="40" width="60" height="40" fill="#d5e6c8"/><rect x="180" y="150" width="44" height="30" fill="#d5e6c8"/></svg>`;

export default function MapActivityList({
  title = "Paris",
  activities = [
    { id: "a1", title: "Seine River Sightseeing Evening Cruise with Champagne", emoji: "🥂", city: "Paris", duration: "1 hour", rating: 4.5, reviews: 341, price: "$43", x: 62, y: 24 },
    { id: "a2", title: "Seine River Sightseeing Guided Cruise Vedettes du Pont Neuf", emoji: "🗼", city: "Paris", duration: "1 hour", rating: 4.2, reviews: 55, price: "$19", x: 44, y: 44 },
    { id: "a3", title: "Sainte-Chapelle Small Group Guided Tour", emoji: "⛪", city: "Paris", duration: "1.5 hours · Small group", rating: 4.7, reviews: 174, price: "$102", x: 30, y: 60 },
    { id: "a4", title: "Louvre Museum Tour Mona Lisa & Iconic Masterpieces", emoji: "🖼️", city: "Paris", duration: "2 - 3 hours · Skip the line", rating: 4.7, reviews: 5873, price: "$95", oldPrice: "$112", x: 70, y: 66 },
    { id: "a5", title: "Louvre Museum Entry & Seine River Cruise with Photos", emoji: "📸", city: "Paris", duration: "2 hours", rating: 3.9, reviews: 37, price: "$72", oldPrice: "$89", x: 52, y: 82 },
  ],
  filters = ["Filters", "Water activities", "Entry tickets"],
  className = "",
  onActivityClick,
  onFilterClick,
  onCloseMap,
}: MapActivityListProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  return (
    <div data-mapact className={`w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="grid lg:grid-cols-[300px_1fr]">
        {/* left column: filters + activity cards */}
        <div data-mapact-list className="border-b border-zinc-200 p-4 lg:border-b-0 lg:border-r dark:border-zinc-800">
          <div data-mapact-filters className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                data-mapact-filter={f}
                type="button"
                onClick={() => onFilterClick?.(f)}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {f === "Filters" && <span aria-hidden="true">⚙</span>}
                {f}
              </button>
            ))}
          </div>
          <div data-mapact-cards className="mt-4 max-h-96 space-y-3 overflow-y-auto lg:max-h-[520px]">
            {activities.map((a) => (
              <button
                key={a.id}
                data-mapact-item={a.id}
                type="button"
                onClick={() => {
                  setActiveId(a.id);
                  onActivityClick?.(a);
                }}
                className={`flex w-full gap-3 rounded-xl p-2 text-left transition-colors ${
                  activeId === a.id ? "bg-indigo-50 dark:bg-indigo-950/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-200 to-indigo-200 text-2xl dark:from-sky-900 dark:to-indigo-900">
                  {a.image ? <img src={a.image} alt={a.title} className="h-full w-full object-cover" /> : a.emoji ?? "📍"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{a.city}</span>
                  <span data-mapact-item-title={a.id} className="block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{a.title}</span>
                  <span className="block truncate text-[11px] text-zinc-400 dark:text-zinc-500">{a.duration}</span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="font-bold text-zinc-800 dark:text-zinc-100">{a.rating} ★</span> ({a.reviews})
                    </span>
                    <span className="whitespace-nowrap text-xs font-bold text-rose-600 dark:text-rose-400">
                      {a.oldPrice && <s className="mr-1 font-normal text-zinc-400 dark:text-zinc-500">From {a.oldPrice}</s>}From {a.price}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* right column: map placeholder with pins */}
        <div data-mapact-map className="relative min-h-64">
          <div data-mapact-mapcanvas className="h-full w-full" dangerouslySetInnerHTML={{ __html: MAP_SVG }} />
          <button
            data-mapact-close
            type="button"
            onClick={() => onCloseMap?.()}
            className="absolute right-3 top-3 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Close map ✕
          </button>
          {activities.map((a) => (
            <button
              key={a.id}
              data-mapact-pin={a.id}
              type="button"
              title={a.title}
              onClick={() => {
                setActiveId(a.id);
                onActivityClick?.(a);
              }}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              className={`absolute z-[5] -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[11px] font-bold shadow transition-transform hover:scale-110 ${
                activeId === a.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              }`}
            >
              {a.rating}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
