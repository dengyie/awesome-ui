import React, { useEffect, useRef, useState } from "react";
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

const TYPE_META: Record<string, { icon: UiIconName; color: string; bar: string }> = {
  success: { icon: "check-circle", color: "text-emerald-500", bar: "bg-emerald-500" },
  error: { icon: "circle-x", color: "text-rose-500", bar: "bg-rose-500" },
  warning: { icon: "alert-triangle", color: "text-amber-500", bar: "bg-amber-500" },
  info: { icon: "sparkles", color: "text-sky-500", bar: "bg-sky-500" },
};

const ToastCard: React.FC<{
  toast: ToastItem;
  duration: number;
  onDismiss?: (id: string | number) => void;
}> = ({ toast, duration, onDismiss }) => {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  // 100 → 0 over `duration` ms; paused while hovering. duration <= 0 = sticky.
  const [remaining, setRemaining] = useState(duration > 0 ? 100 : 0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;
    if (paused) return;
    const started = Date.now();
    const remainingPct = remaining;
    const total = (duration * remainingPct) / 100;
    if (total <= 0) return;
    const timer = setTimeout(() => {
      setRemaining(0);
      onDismissRef.current?.(toast.id);
    }, total);
    const raf = setInterval(() => {
      const left = Math.max(0, 100 - ((Date.now() - started) / total) * remainingPct);
      setRemaining(left);
    }, 100);
    return () => {
      clearTimeout(timer);
      clearInterval(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, duration, paused]);

  const meta = TYPE_META[toast.type || "info"] || TYPE_META.info;

  return (
    <div
      className="relative overflow-hidden flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg text-sm text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-right fade-in duration-200"
      role="alert"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
      {duration > 0 && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 left-0 h-0.5 ${meta.bar} transition-[width] duration-100 ease-linear`}
          style={{ width: `${remaining}%` }}
        />
      )}
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
