/**
 * MasonryDensityControls - Immersive masonry gallery with a floating
 * Size / Padding dual-slider control bar that live-adjusts column count and
 * gutter (Savee discovery wall pattern).
 */
import React from "react";

export interface MasonryItem {
  id: string;
  url: string;
  alt: string;
  /** relative visual weight 1 (short) - 3 (tall) */
  span?: number;
}

export interface MasonryDensityControlsProps {
  title?: string;
  items?: MasonryItem[];
  /** initial column count 2-6 */
  columns?: number;
  /** initial gutter in px 4-32 */
  padding?: number;
  className?: string;
  onItemClick?: (item: MasonryItem) => void;
  onClose?: () => void;
}

export default function MasonryDensityControls({
  title = "Discovery wall",
  items = [
    { id: "m1", url: "https://images.unsplash.com/photo-1493397212122-2b1dda949c8a?w=400&q=60", alt: "Architecture facade", span: 3 },
    { id: "m2", url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=60", alt: "Surf wave", span: 2 },
    { id: "m3", url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=60", alt: "Flowers", span: 2 },
    { id: "m4", url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=60", alt: "Microphone", span: 3 },
    { id: "m5", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=60", alt: "Mountains at night", span: 2 },
    { id: "m6", url: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&q=60", alt: "City dusk", span: 3 },
    { id: "m7", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=60", alt: "Desk with notes", span: 1 },
    { id: "m8", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=60", alt: "Writing", span: 2 },
  ],
  columns = 4,
  padding = 12,
  className = "",
  onItemClick,
  onClose,
}: MasonryDensityControlsProps) {
  const [size, setSize] = React.useState(columns);
  const [gap, setGap] = React.useState(padding);
  const [close, setClose] = React.useState(false);

  if (close) return null;

  return (
    <div data-masn className={`relative w-full overflow-hidden rounded-2xl bg-zinc-950 dark:bg-black ${className}`}>
      {/* floating control bar */}
      <div data-masn-controls className="absolute inset-x-0 top-0 z-10 flex items-center justify-around gap-6 bg-black/80 px-6 py-4 backdrop-blur-sm">
        <label data-masn-size-group className="flex flex-1 items-center gap-3 text-sm text-zinc-200">
          <span>Size</span>
          <input
            type="range"
            data-masn-size
            min={2}
            max={6}
            step={1}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-600 accent-white"
          />
        </label>
        <label data-masn-padding-group className="flex flex-1 items-center gap-3 text-sm text-zinc-200">
          <span>Padding</span>
          <input
            type="range"
            data-masn-padding
            min={4}
            max={32}
            step={2}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded bg-zinc-600 accent-white"
          />
        </label>
        <button
          type="button"
          data-masn-close
          onClick={() => {
            setClose(true);
            onClose?.();
          }}
          aria-label="Close gallery"
          className="text-lg text-zinc-300 transition-colors hover:text-white"
        >
          ✕
        </button>
      </div>

      <p data-masn-title className="absolute left-5 top-16 z-10 text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
      <p data-masn-meta className="absolute right-5 top-16 z-10 text-xs font-medium text-zinc-500">
        {size} cols · {gap}px
      </p>

      {/* masonry via CSS columns */}
      <div
        data-masn-grid
        className="pt-28"
        style={{ columnCount: size, columnGap: `${gap}px` }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-masn-item={item.id}
            onClick={() => onItemClick?.(item)}
            className="mb-[var(--masn-gap)] block w-full break-inside-avoid overflow-hidden rounded-sm bg-zinc-900"
            style={{ ["--masn-gap" as string]: `${gap}px` }}
          >
            <img
              src={item.url}
              alt={item.alt}
              loading="lazy"
              style={{ aspectRatio: item.span === 3 ? "3 / 4" : item.span === 2 ? "4 / 5" : "1 / 1" }}
              className="w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
