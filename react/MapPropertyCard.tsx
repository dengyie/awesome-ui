/**
 * MapPropertyCard - Map property bubble: price pins over a map placeholder
 * and a floating preview card with image dots, like/close buttons, title +
 * rating, subtitle and price range with dates
 * (Airbnb map property pattern).
 */
import React from "react";

export interface MapPin {
  id: string;
  price: string;
  x: number;
  y: number;
}

export interface MapPropertyCardProps {
  pins?: MapPin[];
  activePinId?: string;
  card?: {
    id?: string;
    images?: string[];
    title: string;
    rating: string;
    reviews: number;
    subtitle: string;
    price: string;
    dates?: string;
  } | null;
  likeLabel?: string;
  closeLabel?: string;
  className?: string;
  onPinClick?: (pin: MapPin) => void;
  onCardClose?: () => void;
  onCardLike?: () => void;
}

const DEFAULT_PINS: MapPin[] = [
  { id: "p1", price: "$148", x: 22, y: 30 },
  { id: "p2", price: "$111", x: 68, y: 48 },
  { id: "p3", price: "$136", x: 40, y: 70 },
  { id: "p4", price: "$137", x: 58, y: 82 },
  { id: "p5", price: "$112", x: 82, y: 25 },
];

export default function MapPropertyCard({
  pins = DEFAULT_PINS,
  activePinId = "p2",
  card = {
    id: "p2",
    images: [],
    title: "Home in Kecamatan Denpasar",
    rating: "4.93",
    reviews: 27,
    subtitle: "Private Joglo in heart of Sanur",
    price: "$111 for 2 nights",
    dates: "Jun 20 – 22",
  },
  likeLabel = "♡",
  closeLabel = "✕",
  className = "",
  onPinClick,
  onCardClose,
  onCardLike,
}: MapPropertyCardProps) {
  return (
    <div data-mappin-card className={`relative min-h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-sky-50 shadow-sm dark:border-zinc-800 dark:bg-sky-950/30 ${className}`}>
      {/* map placeholder */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,#a7f3d0_0%,transparent_35%),radial-gradient(circle_at_70%_70%,#bfdbfe_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_25%_30%,#065f46_0%,transparent_35%),radial-gradient(circle_at_70%_70%,#1e40af_0%,transparent_40%)]" aria-hidden="true" />

      {/* price pins */}
      {pins.map((pin) => {
        const active = pin.id === activePinId;
        return (
          <button
            key={pin.id}
            data-mappin-pin={pin.id}
            data-mappin-price={pin.price}
            type="button"
            onClick={() => onPinClick?.(pin)}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-semibold shadow-md transition-transform hover:scale-105 ${
              active
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            {pin.price}
          </button>
        );
      })}

      {/* floating preview card */}
      {card && (
        <div data-mappin-preview className="absolute bottom-8 left-1/2 z-20 w-72 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
          <div data-mappin-image className="relative h-36 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 dark:from-amber-900 dark:via-orange-900 dark:to-rose-900">
            <div className="absolute right-3 top-3 flex gap-2">
              <button data-mappin-like type="button" onClick={() => onCardLike?.()} aria-label="Save" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">{likeLabel}</button>
              <button data-mappin-close type="button" onClick={() => onCardClose?.()} aria-label="Close preview" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">{closeLabel}</button>
            </div>
            <div data-mappin-dots className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true" />
            </div>
            <button data-mappin-next aria-label="Next image" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xs text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">›</button>
          </div>
          <div className="space-y-0.5 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p data-mappin-title className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{card.title}</p>
              <p data-mappin-rating className="shrink-0 text-xs text-zinc-700 dark:text-zinc-200">★ {card.rating} ({card.reviews})</p>
            </div>
            <p data-mappin-subtitle className="truncate text-sm text-zinc-500 dark:text-zinc-400">{card.subtitle}</p>
            <p data-mappin-price className="text-sm text-zinc-900 dark:text-zinc-50">
              {card.price}{card.dates ? <span className="text-zinc-500 dark:text-zinc-400"> · {card.dates}</span> : null}
            </p>
          </div>
        </div>
      )}

      {/* floating zoom controls */}
      <div data-mappin-zoom className="absolute right-4 top-4 z-20 flex flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
        <button className="border-b border-zinc-100 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300" aria-label="Zoom in">＋</button>
        <button className="px-3 py-2 text-zinc-600 dark:text-zinc-300" aria-label="Zoom out">－</button>
      </div>
    </div>
  );
}
