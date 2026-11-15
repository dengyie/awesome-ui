import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export type TagTone = "neutral" | "indigo" | "emerald" | "amber" | "rose" | "sky";
export type TagSize = "sm" | "md";

export interface TagProps {
  label: string;
  tone?: TagTone;
  size?: TagSize;
  icon?: UiIconName;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const TONE: Record<TagTone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
};

export const Tag: React.FC<TagProps> = ({ label, tone = "neutral", size = "md", icon, removable = false, onRemove, onClick, className = "" }) => {
  const sizing = size === "sm" ? "px-1.5 py-0.5 text-[9.5px]" : "px-2 py-0.5 text-[10.5px]";
  const content = (
    <>
      {icon && <UiIcon name={icon} size={size === "sm" ? 10 : 11} className="shrink-0 opacity-70" />}
      <span className="truncate">{label}</span>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
          className="-mr-0.5 shrink-0 rounded-full p-0.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current dark:hover:bg-white/10"
        >
          <UiIcon name="x" size={size === "sm" ? 9 : 10} />
        </button>
      )}
    </>
  );

  const cls = `inline-flex max-w-full items-center gap-1 rounded-full font-medium ${TONE[tone]} ${sizing} ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cls} cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}>
        {content}
      </button>
    );
  }
  return <span className={cls}>{content}</span>;
};

export default Tag;
