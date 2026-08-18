import React, { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

export interface SourceItem {
  id?: string | number;
  title: string;
  url: string;
  snippet?: string;
  siteName?: string;
  favicon?: string;
}

export interface SourcesCitationProps {
  sources: SourceItem[];
  className?: string;
}

export const SourcesCitation: React.FC<SourcesCitationProps> = ({
  sources,
  className = "",
}) => {
  const [activeHoverId, setActiveHoverId] = useState<string | number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className={`my-3 space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <Globe className="w-3.5 h-3.5" />
        <span>Sources ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {sources.map((item, idx) => {
          const indexNum = idx + 1;
          const domain = (() => {
            try {
              return new URL(item.url).hostname.replace("www.", "");
            } catch {
              return item.siteName || "web";
            }
          })();

          return (
            <a
              key={item.id || idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setActiveHoverId(item.id || idx)}
              onMouseLeave={() => setActiveHoverId(null)}
              className="group relative flex flex-col justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition-all no-underline"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[10px]">
                    {indexNum}
                  </span>
                  <span className="truncate max-w-[120px]">{domain}</span>
                </div>
                <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </div>
              </div>

              {item.snippet && (
                <div className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                  {item.snippet}
                </div>
              )}

              <div className="mt-2 flex items-center justify-end text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
