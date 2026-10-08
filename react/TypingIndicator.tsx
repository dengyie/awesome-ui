import React from "react";

export interface TypingIndicatorProps {
  label?: string;
  variant?: "dots" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP: Record<string, { dot: string; gap: string }> = {
  sm: { dot: "w-1.5 h-1.5", gap: "gap-1" },
  md: { dot: "w-2 h-2", gap: "gap-1.5" },
  lg: { dot: "w-2.5 h-2.5", gap: "gap-2" },
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label,
  variant = "dots",
  size = "md",
  className = "",
}) => {
  const { dot, gap } = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`inline-flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400 ${className}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <span className={`inline-flex items-center ${gap}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`${dot} rounded-full bg-current ${
              variant === "pulse" ? "animate-pulse" : "animate-bounce"
            }`}
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
      {label && <span className="text-xs font-sans">{label}</span>}
    </div>
  );
};
export default TypingIndicator;
