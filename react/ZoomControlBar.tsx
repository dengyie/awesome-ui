import React from "react";

export interface ZoomControlBarProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  variant?: "stepper" | "dropdown" | "slider";
  presets?: number[];
  showFit?: boolean;
  showUndoRedo?: boolean;
  onZoomChange?: (value: number) => void;
  onFit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

const UNDO_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M7 5 3.5 8.5 7 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 8.5H12a4.5 4.5 0 0 1 0 9h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const REDO_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="m13 5 3.5 3.5L13 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 8.5H8a4.5 4.5 0 0 0 0 9h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const FIT_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M3 6V3h3M17 6V3h-3M3 14v3h3M17 14v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const iconButton =
  "flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

/**
 * ZoomControlBar - canvas viewport zoom control with stepper / dropdown / slider variants and optional undo-redo pair.
 */
export default function ZoomControlBar({
  value = 100,
  min = 10,
  max = 400,
  step = 10,
  variant = "stepper",
  presets = [25, 50, 75, 100, 200],
  showFit = false,
  showUndoRedo = false,
  onZoomChange,
  onFit,
  onUndo,
  onRedo,
  className = "",
}: ZoomControlBarProps) {
  const [zoom, setZoom] = React.useState(() => clamp(value, min, max));
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setZoom(value);
  }, [value]);

  const change = (next: number) => {
    const clamped = clamp(Math.round(next), min, max);
    setZoom(clamped);
    onZoomChange?.(clamped);
  };

  const container =
    "inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-1 py-0.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
  const percent = (
    <button
      type="button"
      data-zoom-value
      onClick={() => variant === "dropdown" && setOpen((prev) => !prev)}
      className={`rounded px-1.5 py-0.5 text-xs font-medium text-zinc-700 tabular-nums dark:text-zinc-200 ${variant === "dropdown" ? "hover:bg-zinc-100 dark:hover:bg-zinc-800" : ""}`}
    >
      {zoom}%{variant === "dropdown" ? <span aria-hidden="true"> ▾</span> : null}
    </button>
  );

  return (
    <div data-zoom-control className={`${container} ${className}`}>
      {showUndoRedo ? (
        <>
          <button type="button" data-zoom-undo title="Undo" onClick={() => onUndo?.()} className={iconButton}>{UNDO_SVG}</button>
          <button type="button" data-zoom-redo title="Redo" onClick={() => onRedo?.()} className={iconButton}>{REDO_SVG}</button>
          <span className="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
        </>
      ) : null}
      {variant === "stepper" ? (
        <>
          <button type="button" data-zoom-out title="Zoom out" disabled={zoom <= min} onClick={() => change(zoom - step)} className={iconButton}>
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M5 10h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          {percent}
          <button type="button" data-zoom-in title="Zoom in" disabled={zoom >= max} onClick={() => change(zoom + step)} className={iconButton}>
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </>
      ) : null}
      {variant === "dropdown" ? (
        <div className="relative">
          {percent}
          {open ? (
            <div data-zoom-menu className="absolute bottom-full right-0 mb-1 w-24 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  data-zoom-preset={preset}
                  onClick={() => {
                    change(preset);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-1 text-left text-xs tabular-nums hover:bg-zinc-50 dark:hover:bg-zinc-800 ${preset === zoom ? "font-semibold text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-200"}`}
                >
                  {preset}%
                </button>
              ))}
              {showFit ? (
                <button
                  type="button"
                  data-zoom-fit
                  onClick={() => {
                    onFit?.();
                    setOpen(false);
                  }}
                  className="block w-full border-t border-zinc-100 px-3 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  Fit
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {variant === "slider" ? (
        <>
          <input
            data-zoom-slider
            type="range"
            min={min}
            max={max}
            step={step}
            value={zoom}
            onChange={(e) => change(Number(e.target.value))}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-blue-600 dark:bg-zinc-700"
            aria-label="Zoom level"
          />
          {percent}
        </>
      ) : null}
      {showFit && variant !== "dropdown" ? (
        <button type="button" data-zoom-fit title="Fit to page" onClick={() => onFit?.()} className={iconButton}>{FIT_SVG}</button>
      ) : null}
    </div>
  );
}
