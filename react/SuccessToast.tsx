import React from "react";

export interface SuccessToastProps {
  message: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
  position?: "top-right" | "bottom-right";
  className?: string;
}

const CHECK_SVG = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z" />
  </svg>
);

const CLOSE_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * SuccessToast - self-dismissing mint confirmation toast with check icon and close button for copy/success feedback.
 */
export default function SuccessToast({
  message,
  icon,
  onClose,
  duration = 3000,
  position = "top-right",
  className = "",
}: SuccessToastProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    setVisible(true);
    if (duration > 0) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!visible) return null;
  const posClass = position === "bottom-right" ? "bottom-4" : "top-4";

  return (
    <div
      data-success-toast
      className={`fixed right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 shadow-sm dark:bg-emerald-950 ${posClass} ${className}`}
      role="status"
    >
      <span className="shrink-0 text-emerald-700 dark:text-emerald-400">{icon || CHECK_SVG}</span>
      <span className="text-sm text-zinc-900 dark:text-zinc-50">{message}</span>
      <button
        type="button"
        data-toast-close
        title="Dismiss"
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-emerald-800/70 hover:bg-emerald-200 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900"
      >
        {CLOSE_SVG}
      </button>
    </div>
  );
}
