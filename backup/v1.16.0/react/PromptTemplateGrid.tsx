import React from "react";
import { UiIcon } from "./UiIcon";

export interface PromptTemplate {
  id: string | number;
  title: string;
  description?: string;
  prompt: string;
  tag?: string;
}

export interface PromptTemplateGridProps {
  templates: PromptTemplate[];
  onUse?: (template: PromptTemplate) => void;
  className?: string;
}

export const PromptTemplateGrid: React.FC<PromptTemplateGridProps> = ({ templates = [], onUse, className = "" }) => {
  if (templates.length === 0) return null;
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onUse?.(t)}
          className="group flex flex-col text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.title}</span>
            {t.tag && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                {t.tag}
              </span>
            )}
          </div>
          {t.description && (
            <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">{t.description}</div>
          )}
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <UiIcon name="arrow-right" size={12} />
            Use template
          </div>
        </button>
      ))}
    </div>
  );
};
export default PromptTemplateGrid;
