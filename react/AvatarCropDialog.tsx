import React, { useState } from "react";

export interface AvatarCropDialogProps {
  title?: string;
  hint?: string;
  initials?: string;
  avatarUrl?: string;
  /** zoom slider range 0-100 */
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  /** render the dialog open on first mount (SSR/testing) */
  defaultOpen?: boolean;
  onConfirm?: (detail: { zoom: number }) => void;
  onCancel?: () => void;
  className?: string;
}

export default function AvatarCropDialog({
  title = "Avatar preview",
  hint = "For best results, upload images of at least 1000×1000 pixels.",
  initials = "AS",
  avatarUrl,
  defaultZoom = 50,
  minZoom = 0,
  maxZoom = 100,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  defaultOpen = false,
  onConfirm,
  onCancel,
  className = "",
}: AvatarCropDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [zoom, setZoom] = useState(defaultZoom);
  const [saved, setSaved] = useState<number | null>(null);

  const step = (delta: number) => {
    setZoom((z) => Math.min(maxZoom, Math.max(minZoom, z + delta)));
  };

  const close = () => {
    setOpen(false);
    setSaved(null);
    setZoom(defaultZoom);
  };

  const handleConfirm = () => {
    setSaved(zoom);
    onConfirm?.({ zoom });
  };

  const scale = 0.8 + (zoom / 100) * 0.6;

  return (
    <div data-avatar-crop-dialog className={className}>
      <button
        type="button"
        data-avatar-crop-open
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        {title}
      </button>

      {open ? (
        <div
          data-avatar-crop-overlay
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            data-avatar-crop-panel
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            {saved !== null ? (
              <>
                <p data-avatar-crop-saved className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Avatar updated
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Your new profile picture has been saved.
                </p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    data-avatar-crop-done
                    onClick={close}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p data-avatar-crop-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
                  <button
                    type="button"
                    data-avatar-crop-close
                    aria-label="Close"
                    onClick={close}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>

                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>

                <div data-avatar-crop-preview className="mt-3 flex justify-center">
                  <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-inner dark:border-zinc-800 dark:bg-zinc-800">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        style={{ transform: `scale(${scale.toFixed(2)})` }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        style={{ transform: `scale(${scale.toFixed(2)})` }}
                        className="flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                      >
                        {initials}
                      </span>
                    )}
                  </div>
                </div>

                <div data-avatar-crop-zoom-row className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    data-avatar-crop-zoom-out
                    aria-label="Zoom out"
                    onClick={() => step(-10)}
                    className="h-6 w-6 rounded border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    −
                  </button>
                  <input
                    data-avatar-crop-zoom
                    type="range"
                    min={minZoom}
                    max={maxZoom}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    aria-label="Zoom"
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700"
                  />
                  <button
                    type="button"
                    data-avatar-crop-zoom-in
                    aria-label="Zoom in"
                    onClick={() => step(10)}
                    className="h-6 w-6 rounded border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    data-avatar-crop-cancel
                    onClick={onCancel ?? close}
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    data-avatar-crop-confirm
                    onClick={handleConfirm}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    {confirmLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
