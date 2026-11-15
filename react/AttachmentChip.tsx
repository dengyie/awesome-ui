import React from "react";

export interface AttachmentChipProps {
  name: string;
  kind?: "pdf" | "doc" | "csv" | "image";
  size?: string;
  meta?: string;
  onRemove?: () => void;
}

const KIND_TONE: Record<string, { badge: string; glyph: string }> = {
  pdf: { badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300", glyph: "PDF" },
  doc: { badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300", glyph: "DOC" },
  csv: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", glyph: "CSV" },
  image: { badge: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300", glyph: "IMG" },
};

/**
 * AttachmentChip - compact file chip with kind badge, size and remove button.
 */
export default function AttachmentChip({ name, kind = "doc", size, meta, onRemove }: AttachmentChipProps) {
  const tone = KIND_TONE[kind] || KIND_TONE.doc;
  return (
    <span data-attachment-chip className="inline-flex max-w-xs items-center gap-2 rounded-lg border border-zinc-200 bg-white py-1.5 pl-2.5 pr-7 dark:border-zinc-700 dark:bg-zinc-900" title={name}>
      <span className={`flex h-6 shrink-0 items-center justify-center rounded px-1.5 font-mono text-[10px] font-bold ${tone.badge}`}>{tone.glyph}</span>
      <span className="min-w-0">
        <span className="block max-w-[160px] truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">{name}</span>
        {size || meta ? <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">{[size, meta].filter(Boolean).join(" · ")}</span> : null}
      </span>
      <button
        type="button"
        data-attachment-remove
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        className="relative -ml-5 h-4 w-4 shrink-0 rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mx-auto h-2.5 w-2.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
