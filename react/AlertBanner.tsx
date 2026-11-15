import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export type AlertBannerTone = "info" | "success" | "warning" | "danger";

export interface AlertBannerProps {
  tone?: AlertBannerTone;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const TONE: Record<
  AlertBannerTone,
  {
    icon: UiIconName;
    iconClass: string;
    wrapClass: string;
    titleClass: string;
    bodyClass: string;
    actionClass: string;
    dismissClass: string;
    role: "status" | "alert";
  }
> = {
  info: {
    icon: "info",
    iconClass: "text-indigo-500",
    wrapClass: "border-indigo-200 bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/40",
    titleClass: "text-indigo-800 dark:text-indigo-200",
    bodyClass: "text-indigo-700 dark:text-indigo-300",
    actionClass: "text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200",
    dismissClass: "text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300",
    role: "status",
  },
  success: {
    icon: "check-circle",
    iconClass: "text-emerald-500",
    wrapClass: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40",
    titleClass: "text-emerald-800 dark:text-emerald-200",
    bodyClass: "text-emerald-700 dark:text-emerald-300",
    actionClass: "text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200",
    dismissClass: "text-emerald-400 hover:text-emerald-600 dark:text-emerald-500 dark:hover:text-emerald-300",
    role: "status",
  },
  warning: {
    icon: "alert-triangle",
    iconClass: "text-amber-500",
    wrapClass: "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40",
    titleClass: "text-amber-800 dark:text-amber-200",
    bodyClass: "text-amber-700 dark:text-amber-300",
    actionClass: "text-amber-600 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200",
    dismissClass: "text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300",
    role: "alert",
  },
  danger: {
    icon: "circle-x",
    iconClass: "text-rose-500",
    wrapClass: "border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40",
    titleClass: "text-rose-800 dark:text-rose-200",
    bodyClass: "text-rose-700 dark:text-rose-300",
    actionClass: "text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200",
    dismissClass: "text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300",
    role: "alert",
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  tone = "info",
  title,
  description,
  actionText,
  onAction,
  dismissible = false,
  onDismiss,
  className = "",
}) => {
  const styles = TONE[tone];

  return (
    <div
      role={styles.role}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 ${styles.wrapClass} ${className}`}
    >
      <UiIcon name={styles.icon} size={16} className={`mt-0.5 shrink-0 ${styles.iconClass}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold ${styles.titleClass}`}>{title}</p>
        {description && <p className={`mt-0.5 text-[11.5px] leading-relaxed ${styles.bodyClass}`}>{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${styles.actionClass}`}
          >
            {actionText}
          </button>
        )}
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className={`rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${styles.dismissClass}`}
          >
            <UiIcon name="x" size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
