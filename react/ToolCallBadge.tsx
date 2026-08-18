import React, { useState } from "react";
import { Wrench, CheckCircle2, XCircle, Loader2, ChevronRight } from "lucide-react";

export interface ToolCallBadgeProps {
  name: string;
  status: "running" | "success" | "error";
  args?: Record<string, any> | string;
  output?: any;
  error?: string;
  className?: string;
}

export const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({
  name,
  status,
  args,
  output,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formattedArgs = typeof args === "object" ? JSON.stringify(args, null, 2) : args;
  const formattedOutput =
    typeof output === "object" ? JSON.stringify(output, null, 2) : output;

  return (
    <div
      className={`my-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm overflow-hidden text-xs transition-all ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
            {name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "running" && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </span>
          )}
          {status === "success" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Success</span>
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <XCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </span>
          )}

          <ChevronRight
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2 font-mono text-[11px]">
          {args && (
            <div>
              <div className="text-zinc-400 font-semibold mb-1">Arguments:</div>
              <pre className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 overflow-x-auto m-0">
                {formattedArgs}
              </pre>
            </div>
          )}

          {output !== undefined && (
            <div>
              <div className="text-zinc-400 font-semibold mb-1">Output:</div>
              <pre className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-48 m-0">
                {formattedOutput}
              </pre>
            </div>
          )}

          {error && (
            <div>
              <div className="text-rose-500 font-semibold mb-1">Error:</div>
              <pre className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 overflow-x-auto m-0">
                {error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
