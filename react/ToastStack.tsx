import React, { useEffect, useRef } from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface ToastItem {
  id: string | number;
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss?: (id: string | number) => void;
  duration?: number;
  className?: string;
}

const TYPE_META: Record<string, { icon: UiIconName; color: string }> = {
  success: { icon: "check-circle", color: "text-emerald-500" },
  error: { icon: "circle-x", color: "text-rose-500" },
  warning: { icon: "alert-triangle", color: "text-amber-500" },
  info: { icon: "sparkles", color: "text-sky-500" },
};

const ToastCard: React.FC<{
  toast: ToastItem;
  duration: number;
  onDismiss?: (id: string | number) => void;
}> = ({ toast, duration, onDismiss }) => {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismissRef.current?.(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration]);

  const meta = TYPE_META[toast.type || "info"] || TYPE_META.info;

  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg text-sm text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-right fade-in duration-200"
      role="alert"
    >
      <UiIcon name={meta.icon} size={16} className={`${meta.color} shrink-0`} />
      <span className="flex-1 min-w-0">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss?.(toast.id)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <UiIcon name="x" size={14} />
      </button>
    </div>
  );
};

export const ToastStack: React.FC<ToastStackProps> = ({
  toasts = [],
  onDismiss,
  duration = 4000,
  className = "",
}) => {
  if (toasts.length === 0) return null;
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] ${className}`}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} duration={duration} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
export default ToastStack;
