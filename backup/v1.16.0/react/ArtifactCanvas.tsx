import React, { useState } from "react";
import { X, Code2, Eye, Copy, Check } from "./UiIcon";

export interface ArtifactCanvasProps {
  title?: string;
  code: string;
  language?: "html" | "svg" | "react" | "javascript" | string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ArtifactCanvas: React.FC<ArtifactCanvasProps> = ({
  title = "Artifact Preview",
  code,
  language = "html",
  isOpen = true,
  onClose,
  className = "",
}) => {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[680px] z-40 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[240px]">
            {title}
          </span>
          {/* Tabs */}
          <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                tab === "preview"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("code")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                tab === "code"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-hidden relative">
        {tab === "preview" ? (
          <iframe
            srcDoc={
              language === "svg"
                ? `<div style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#09090b;">${code}</div>`
                : language === "html"
                ? `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>body { margin: 0; padding: 1rem; font-family: ui-sans-serif, system-ui, sans-serif; }</style></head><body>${code}</body></html>`
                : code
            }
            sandbox="allow-scripts allow-modals"
            title="Artifact Preview Frame"
            className="w-full h-full border-0 bg-white"
          />
        ) : (
          <pre className="w-full h-full p-4 m-0 overflow-auto bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
