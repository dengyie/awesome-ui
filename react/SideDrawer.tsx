import React, { useEffect } from "react";
import { UiIcon } from "./UiIcon";

export interface SideDrawerProps {
  isOpen: boolean;
  title: string;
  description?: string;
  /** Which edge the panel slides in from. */
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  onClose?: () => void;
  /** Optional sticky footer row. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<SideDrawerProps["size"]>, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-xl",
};

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  title,
  description,
  side = "right",
  size = "md",
  onClose,
  footer,
  children,
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${className}`}>
      <div
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]"
        aria-hidden="true"
        onClick={() => onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex h-full w-full ${SIZE_CLASS[size]} flex-col border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 ${
          side === "right" ? "ml-auto border-l" : "mr-auto border-r"
        }`}
      >
        <header className="flex items-start gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
            {description && (
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close drawer"
            className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <UiIcon name="x" size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">{footer}</footer>
        )}
      </div>
    </div>
  );
};

export default SideDrawer;
