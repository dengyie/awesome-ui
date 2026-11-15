/**
 * GammaImageDetail - Gamma AI-images detail pane: large preview with a
 * download / zoom / delete icon row and like / dislike pair, plus the full
 * generation prompt in a bordered reading block.
 */
import React from "react";

export interface GammaImageDetailProps {
  title?: string;
  preview?: string;
  prompt?: string;
  liked?: boolean;
  className?: string;
  onDownload?: () => void;
  onZoom?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
}

export default function GammaImageDetail({
  title = "AI images",
  preview = "",
  prompt = "Generate the following image: Mobile-first social media carousel content slide with professional creative aesthetic.",
  liked = false,
  className = "",
  onDownload,
  onZoom,
  onDelete,
  onLike,
  onDislike,
}: GammaImageDetailProps) {
  return (
    <div data-gamma-image-detail className={`w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 data-gamma-detail-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <button type="button" data-gamma-detail-close aria-label="Close detail" className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
      </div>
      <div data-gamma-detail-preview className="mt-3 flex items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800" style={{ minHeight: 160 }}>
        {preview ? (
          <img src={preview} alt={title} className="max-h-64 w-auto object-cover" />
        ) : (
          <span aria-hidden="true" className="text-3xl text-zinc-300 dark:text-zinc-600">🖼</span>
        )}
      </div>
      <div data-gamma-detail-toolbar className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button type="button" data-gamma-detail-download aria-label="Download image" onClick={() => onDownload?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">↓</button>
          <button type="button" data-gamma-detail-zoom aria-label="Zoom image" onClick={() => onZoom?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">🔍</button>
          <button type="button" data-gamma-detail-delete aria-label="Delete image" onClick={() => onDelete?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-red-950/40">🗑</button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" data-gamma-detail-dislike aria-label="Dislike image" onClick={() => onDislike?.()} className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">👎</button>
          <button type="button" data-gamma-detail-like aria-pressed={liked} aria-label="Like image" onClick={() => onLike?.()} className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${liked ? "text-rose-500" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}>👍</button>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Prompt</p>
        <p data-gamma-detail-prompt className="mt-1.5 rounded-lg border border-zinc-200 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">{prompt}</p>
      </div>
    </div>
  );
}
