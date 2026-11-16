/**
 * StockPhotoPicker - Media picker modal: title bar with close button,
 * search input with clear, "Powered by" caption, masonry photo grid with
 * hover author name + Add button, and optional confirm row (Substack
 * stock-photos pattern).
 */
import React from "react";

export interface StockPhoto {
  id: string;
  url: string;
  alt?: string;
  author?: string;
  span?: 1 | 2; // 2 = taller tile
}

export interface StockPhotoPickerProps {
  title?: string;
  poweredBy?: string;
  placeholder?: string;
  photos?: StockPhoto[];
  open?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
  onAdd?: (photo: StockPhoto) => void;
  onClose?: () => void;
}

export default function StockPhotoPicker({
  title = "Stock photos",
  poweredBy = "Powered by Unsplash",
  placeholder = "Search photos…",
  photos = [
    { id: "p1", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60", alt: "Sunlit forest path", author: "Casey Horner", span: 2 },
    { id: "p2", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60", alt: "Mountain ridge", author: "Sam Tesla" },
    { id: "p3", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60", alt: "Foggy hills", author: "Andreas Gücklhorn", span: 2 },
    { id: "p4", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=60", alt: "Green meadow", author: "Lukasz Szmigiel" },
    { id: "p5", url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60", alt: "Park trail", author: "Jerome Printr" },
    { id: "p6", url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=60", alt: "Autumn bench", author: "Josephine Baran" },
  ],
  open = true,
  className = "",
  onSearch,
  onAdd,
  onClose,
}: StockPhotoPickerProps) {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = query.trim() === "" ? photos : photos.filter((p) => (p.alt ?? "").toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div data-stkpic className={`relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${className}`}>
      {/* title bar */}
      <div data-stkpic-header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <h2 data-stkpic-title className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <button
          data-stkpic-close
          type="button"
          aria-label="Close"
          onClick={() => onClose?.()}
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          ✕
        </button>
      </div>

      {/* search row */}
      <div data-stkpic-searchrow className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 focus-within:ring-2 focus-within:ring-orange-500/40 dark:border-zinc-600">
          <span aria-hidden="true" className="text-zinc-400">⌕</span>
          <input
            data-stkpic-input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
          {query !== "" && (
            <button data-stkpic-clear type="button" aria-label="Clear search" onClick={() => { setQuery(""); onSearch?.(""); }} className="text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200">
              ✕
            </button>
          )}
        </div>
        <p data-stkpic-powered className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">⭳ {poweredBy}</p>
      </div>

      {/* photo grid (CSS columns masonry) */}
      <div data-stkpic-grid className="mt-3 max-h-96 overflow-y-auto px-5 pb-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <figure
              key={p.id}
              data-stkpic-item={p.id}
              className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <img src={p.url} alt={p.alt ?? ""} className={`w-full object-cover ${p.span === 2 ? "h-44" : "h-28"}`} />
              <figcaption data-stkpic-meta={p.id} className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="truncate text-[11px] text-white">{p.author ?? ""}</span>
                <button
                  data-stkpic-add={p.id}
                  type="button"
                  onClick={() => onAdd?.(p)}
                  className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Add
                </button>
              </figcaption>
            </figure>
          ))}
          {filtered.length === 0 && (
            <p data-stkpic-empty className="col-span-full py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">No photos match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
