import React from "react";

export interface EmptyStateStarterProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "plain" | "dashed" | "card";
  size?: "md" | "sm";
  actionVariant?: "solid" | "outline" | "link";
  className?: string;
}

const ACTION_CLASS: Record<string, string> = {
  solid: "rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  outline: "rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
  link: "text-sm font-medium text-blue-600 hover:underline dark:text-blue-400",
};

/**
 * EmptyStateStarter - first-run "nothing here yet" starter block with illustration slot, dashed-card variant and flexible action styling.
 */
export default function EmptyStateStarter({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  variant = "plain",
  size = "md",
  actionVariant = "solid",
  className = "",
}: EmptyStateStarterProps) {
  const sm = size === "sm";
  const shell =
    variant === "dashed"
      ? "rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700"
      : variant === "card"
        ? "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        : "";
  const pad = shell ? (sm ? "p-5" : "p-8") : "";

  return (
    <div
      data-empty-starter
      className={`flex flex-col items-center justify-center text-center ${shell} ${pad} ${className}`}
    >
      {illustration ? (
        <div data-empty-illustration className={`mb-3 flex items-center justify-center ${sm ? "text-3xl" : "text-5xl"}`} aria-hidden="true">
          {illustration}
        </div>
      ) : null}
      <p data-empty-title className={`${sm ? "text-sm" : "text-xl"} font-semibold text-zinc-900 dark:text-zinc-50`}>
        {title}
      </p>
      {description ? (
        <p className={`mt-1 max-w-xs leading-relaxed text-zinc-500 dark:text-zinc-400 ${sm ? "text-xs" : "text-sm"}`}>
          {description}
        </p>
      ) : null}
      {actionLabel ? (
        <button
          type="button"
          data-empty-action
          onClick={() => onAction?.()}
          className={`mt-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${ACTION_CLASS[actionVariant] || ACTION_CLASS.solid}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
