import React from "react";

export interface AiTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface AiTemplatePickerProps {
  open?: boolean;
  title?: string;
  categories?: { id: string; label: string; count: number }[];
  templates: AiTemplate[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  onTry?: (template: AiTemplate) => void;
  onRunCustom?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * AiTemplatePicker - Apollo style AI research templates modal: category rail
 * with counts, template cards each with a Try it CTA, and a Run custom AI
 * prompt footer action.
 */
export default function AiTemplatePicker({
  open = true,
  title = "AI Research templates",
  categories,
  templates,
  activeCategory,
  onCategoryChange,
  onTry,
  onRunCustom,
  onClose,
  className = "",
}: AiTemplatePickerProps) {
  if (!open) return null;
  const active = activeCategory ?? categories?.[0]?.id;
  const visible = active
    ? templates.filter((t) => !t.category || t.category === active)
    : templates;
  return (
    <div
      data-ai-template-picker
      role="dialog"
      aria-modal="true"
      className={`w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <button
          type="button"
          data-ai-templates-close
          aria-label="Close"
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
      <div className="flex max-h-[26rem]">
        {categories && categories.length > 0 && (
          <div data-ai-templates-rail className="w-52 shrink-0 overflow-y-auto border-r border-zinc-200 p-2 dark:border-zinc-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-ai-templates-category={cat.id}
                onClick={() => onCategoryChange?.(cat.id)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                  cat.id === active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span className="min-w-0 truncate">{cat.label}</span>
                <span
                  className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    cat.id === active
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1 overflow-y-auto p-3">
          {visible.length === 0 ? (
            <p data-ai-templates-empty className="px-2 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No templates in this category yet.
            </p>
          ) : (
            <div data-ai-templates-grid className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visible.map((tpl) => (
                <div
                  key={tpl.id}
                  data-ai-template-card={tpl.id}
                  className="flex flex-col rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <p className="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-100">{tpl.name}</p>
                  <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {tpl.description}
                  </p>
                  <button
                    type="button"
                    data-ai-template-try
                    onClick={() => onTry?.(tpl)}
                    className="mt-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Try it
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <button
          type="button"
          data-ai-templates-custom
          onClick={onRunCustom}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Run custom AI prompt
        </button>
      </div>
    </div>
  );
}
