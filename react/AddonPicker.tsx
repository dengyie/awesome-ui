import React from "react";

export interface AddonOption {
  id: string;
  label: string;
  price?: string;
  disabled?: boolean;
  contactInstead?: boolean;
}

export interface AddonPickerProps {
  title?: string;
  options: AddonOption[];
  selectedIds?: string[];
  onChange?: (selectedIds: string[]) => void;
  totalLabel?: string;
  totalText?: string;
  className?: string;
}

const CHECK_SVG = (
  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
    <path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * AddonPicker - User Interviews/Attio style add-on selector: checkbox rows with
 * price (or "Let's talk" contact link) and a running total row.
 */
export default function AddonPicker({
  title = "Add-ons",
  options,
  selectedIds = [],
  onChange,
  totalLabel = "Estimated total",
  totalText,
  className = "",
}: AddonPickerProps) {
  const toggle = (id: string) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange?.(next);
  };
  return (
    <div data-addon-picker className={`rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <div className="mt-3 space-y-2">
        {options.map((option) => {
          const checked = selectedIds.includes(option.id);
          return (
            <label
              key={option.id}
              data-addon-row={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${
                checked
                  ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/50"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              } ${option.disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="flex items-center gap-3">
                <span
                  data-addon-check
                  aria-checked={checked}
                  role="checkbox"
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    checked
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-transparent dark:border-zinc-600 dark:bg-zinc-800"
                  }`}
                >
                  {CHECK_SVG}
                </span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{option.label}</span>
              </span>
              {option.contactInstead ? (
                <a href="#" data-addon-contact className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Let's talk</a>
              ) : (
                <span data-addon-price className="text-xs text-zinc-500 dark:text-zinc-400">{option.price}</span>
              )}
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={option.disabled}
                onChange={() => !option.disabled && toggle(option.id)}
              />
            </label>
          );
        })}
      </div>
      {totalText && (
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
          <span className="text-zinc-600 dark:text-zinc-300">{totalLabel}</span>
          <span data-addon-total className="font-semibold text-zinc-900 dark:text-zinc-50">{totalText}</span>
        </div>
      )}
    </div>
  );
}
