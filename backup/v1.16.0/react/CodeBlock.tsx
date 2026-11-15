import React, { useState } from "react";
import { UiIcon } from "./UiIcon";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  maxHeight?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "",
  filename,
  showLineNumbers = false,
  showCopy = true,
  maxHeight,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const lines = String(code ?? "").replace(/\n$/, "").split("\n");

  return (
    <div
      className={`group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-sm font-mono ${className}`}
    >
      {/* Header */}
      {(language || filename || showCopy) && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 min-w-0 text-xs text-zinc-500 dark:text-zinc-400">
            <UiIcon name="terminal" size={13} className="shrink-0" />
            {filename && (
              <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {filename}
              </span>
            )}
            {language && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[10px] uppercase font-semibold tracking-wide shrink-0">
                {language}
              </span>
            )}
          </div>
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors shrink-0"
              aria-label="Copy code"
            >
              <UiIcon name={copied ? "check" : "copy"} size={13} className={copied ? "text-emerald-500" : ""} />
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      )}

      {/* Body */}
      <div
        className="overflow-auto p-3.5 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <pre className="whitespace-pre">
          {showLineNumbers ? (
            <code>
              {lines.map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="w-8 shrink-0 select-none text-right pr-3 text-zinc-400 dark:text-zinc-600">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{line || " "}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};
export default CodeBlock;
