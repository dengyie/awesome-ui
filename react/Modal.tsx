import React, { useEffect, useRef } from "react";
import { UiIcon } from "./UiIcon";

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  /** Close on backdrop click / Escape. Defaults to true. */
  dismissible?: boolean;
  /** Close button in the header. Defaults to true. */
  showClose?: boolean;
  /** Footer actions; rendered right-aligned. */
  footer?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  dismissible = true,
  showClose = true,
  footer,
  onClose,
  children,
  className = "",
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      onMouseDown={(event) => {
        if (dismissible && panelRef.current && !panelRef.current.contains(event.target as Node)) onClose?.();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
          {showClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
            >
              <UiIcon name="x" size={14} />
            </button>
          )}
        </div>
        {children && <div className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-400">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
