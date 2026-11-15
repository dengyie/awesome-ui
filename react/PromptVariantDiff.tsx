import React from "react";

export interface PromptVariant {
  id: string;
  label: string;
  text: string;
}

export interface PromptVariantDiffProps {
  variants: PromptVariant[];
  variables?: string[];
  title?: string;
  className?: string;
  onApply?: (variant: PromptVariant) => void;
}

const VAR_CHIP =
  "inline rounded bg-indigo-50 px-1 py-0.5 font-mono text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300";

/** Render prompt text with {{var}} tokens as chips. */
const renderText = (text: string) =>
  text.split(/(\{\{\s*[\w.]+\s*\}\})/g).map((part, i) =>
    /^\{\{/.test(part) ? (
      <span key={i} className={VAR_CHIP}>
        {part.replace(/^\{\{\s*|\s*\}\}$/g, "")}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

/**
 * PromptVariantDiff - side-by-side prompt version A/B comparison with
 * variable-chip highlighting and change stats (Braintrust playground /
 * LangSmith compare pattern).
 */
export default function PromptVariantDiff({
  variants,
  variables = [],
  title = "Prompt variants",
  className = "",
  onApply,
}: PromptVariantDiffProps) {
  const [base, compare] = variants;
  if (!base || !compare) return null;

  const baseVars = (base.text.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []).map((v) => v.replace(/^\{\{\s*|\s*\}\}$/g, ""));
  const cmpVars = (compare.text.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []).map((v) => v.replace(/^\{\{\s*|\s*\}\}$/g, ""));
  const addedVars = cmpVars.filter((v) => !baseVars.includes(v));
  const removedVars = baseVars.filter((v) => !cmpVars.includes(v));
  const changedText = base.text !== compare.text;

  return (
    <div
      data-prompt-variant-diff
      className={`w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
        <span className="flex items-center gap-2 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          <span data-diff-added className="text-emerald-600 dark:text-emerald-400">+{addedVars.length}</span>
          <span data-diff-removed className="text-red-500 dark:text-red-400">−{removedVars.length}</span>
          {changedText && <span data-diff-text className="text-amber-600 dark:text-amber-400">~text</span>}
        </span>
      </div>

      <div className="grid gap-0 divide-x divide-zinc-100 sm:grid-cols-2 dark:divide-zinc-800">
        {variants.map((variant, index) => (
          <div key={variant.id} data-variant-panel={variant.id} className="flex flex-col p-4">
            <div className="flex items-center gap-2 pb-2">
              <span
                className={`h-2 w-2 rounded-full ${index === 0 ? "bg-zinc-400" : "bg-violet-500"}`}
                aria-hidden="true"
              />
              <span data-variant-label className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                {variant.label}
              </span>
              {index === 0 && (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Base
                </span>
              )}
            </div>
            <p
              data-variant-text
              className="min-h-16 flex-1 whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
            >
              {renderText(variant.text)}
            </p>
            <button
              type="button"
              data-variant-apply
              onClick={() => onApply?.(variant)}
              className="mt-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Use this version
            </button>
          </div>
        ))}
      </div>

      {(addedVars.length > 0 || removedVars.length > 0) && (
        <div data-variant-varlist className="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          {addedVars.map((v) => (
            <span key={`add-${v}`} data-var-added className="inline rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              + {v}
            </span>
          ))}
          {removedVars.map((v) => (
            <span key={`rm-${v}`} data-var-removed className="inline rounded bg-red-50 px-1.5 py-0.5 font-mono text-[11px] text-red-700 dark:bg-red-950/60 dark:text-red-300">
              − {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
