import React, { useId } from "react";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string;
  side?: TooltipSide;
  children: React.ReactNode;
  className?: string;
}

const SIDE_CLASS: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1.5 -translate-x-1/2",
  left: "right-full top-1/2 mr-1.5 -translate-y-1/2",
  right: "left-full top-1/2 ml-1.5 -translate-y-1/2",
};

export const Tooltip: React.FC<TooltipProps> = ({ content, side = "top", children, className = "" }) => {
  const id = useId();

  return (
    <span className={`group relative inline-flex ${className}`} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 ${SIDE_CLASS[side]}`}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
