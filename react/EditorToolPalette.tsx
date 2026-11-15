import React from "react";

export interface PaletteTool {
  id: string;
  icon: React.ReactNode;
  label: string;
  kbd?: string;
  badge?: number;
  disabled?: boolean;
}

export interface EditorToolPaletteProps {
  tools: PaletteTool[];
  orientation?: "horizontal" | "vertical";
  activeId?: string | null;
  activeCount?: number;
  showKbdHints?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * EditorToolPalette - floating canvas tool picker with keyboard hints, active-tool highlight and count badge.
 */
export default function EditorToolPalette({
  tools,
  orientation = "horizontal",
  activeId = null,
  activeCount,
  showKbdHints = true,
  onSelect,
  className = "",
}: EditorToolPaletteProps) {
  const vertical = orientation === "vertical";
  const containerClass = vertical
    ? "inline-flex flex-col items-center gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    : "inline-flex items-center gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900";

  return (
    <div data-tool-palette className={`${containerClass} ${className}`} role="toolbar" aria-orientation={orientation}>
      {tools.map((tool) => {
        const active = tool.id === activeId;
        return (
          <button
            key={tool.id}
            type="button"
            data-tool={tool.id}
            title={tool.label}
            disabled={tool.disabled}
            onClick={() => {
              if (!tool.disabled) onSelect?.(tool.id);
            }}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${
              active
                ? "bg-blue-500 text-white dark:bg-blue-500"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            }`}
          >
            <span className="pointer-events-none flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">{tool.icon}</span>
            {showKbdHints && tool.kbd ? (
              <span
                className={`absolute -right-0.5 -top-0.5 rounded px-1 text-[9px] font-semibold leading-tight ${
                  active ? "bg-white/90 text-blue-600" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {tool.kbd}
              </span>
            ) : null}
            {active && activeCount != null && activeCount > 0 ? (
              <span data-tool-badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-1.5 text-[9px] font-semibold leading-tight text-white">
                {activeCount}
              </span>
            ) : null}
            <span className="sr-only">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
