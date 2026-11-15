import React from "react";
export interface ConsentCategory {
  id: string;
  label: string;
  description?: string;
  alwaysActive?: boolean;
  cookies?: string[];
}

export interface CookieConsentProps {
  title?: string;
  description?: string;
  policyLabel?: string;
  categories?: ConsentCategory[];
  acceptLabel?: string;
  rejectLabel?: string;
  saveLabel?: string;
  onConfirm?: (accepted: string[]) => void;
}

/**
 * CookieConsent - granular cookie preference dialog with collapsible categories and bulk actions.
 */
export default function CookieConsent({
  title = "Choose how we use your personal information",
  description = "We use cookies to personalize content, run analytics and improve your experience.",
  policyLabel = "Privacy Policy",
  categories = [],
  acceptLabel = "Accept All",
  rejectLabel = "Reject All",
  saveLabel = "Confirm",
  onConfirm,
}: CookieConsentProps) {
  const optional = categories.filter((category) => !category.alwaysActive);
  const always = categories.filter((category) => category.alwaysActive);

  return (
    <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" data-cookie-consent role="dialog" aria-label={title}>
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}{" "}
        <a href="#" className="font-medium text-indigo-600 underline underline-offset-2 dark:text-indigo-400">
          {policyLabel}
        </a>
      </p>

      <div className="mt-4 space-y-2">
        {[...always, ...optional].map((category) => (
          <details key={category.id} className="group rounded-lg border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/50" data-consent-category={category.id}>
            <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180">
                <path d="m6 9 6 6 6-6" />
              </svg>
              {category.label}
              <span className="ml-auto shrink-0 text-[10px] font-medium text-zinc-400">
                {category.alwaysActive ? "Always Active" : ""}
              </span>
              {!category.alwaysActive ? (
                <span className="flex h-4 w-7 shrink-0 items-center rounded-full bg-indigo-600 px-0.5" data-consent-toggle aria-hidden="true">
                  <span className="ml-auto flex h-3 w-3 items-center justify-center rounded-full bg-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2 w-2 text-indigo-600">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                </span>
              ) : null}
            </summary>
            <div className="border-t border-zinc-200 px-3 py-2.5 text-xs leading-relaxed text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              {category.description || "Used to deliver core functionality."}
              {category.cookies?.length ? (
                <p className="mt-1.5 text-[10px] font-mono text-zinc-400">{category.cookies.join(", ")}</p>
              ) : null}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2" data-consent-actions>
        {rejectLabel ? (
          <button
            type="button"
            data-consent-reject
            onClick={() => onConfirm?.(categories.filter((category) => category.alwaysActive).map((category) => category.id))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {rejectLabel}
          </button>
        ) : null}
        <button
          type="button"
          data-consent-accept
          onClick={() => onConfirm?.(categories.map((category) => category.id))}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {acceptLabel}
        </button>
        <button
          type="button"
          data-consent-save
          onClick={() => onConfirm?.(categories.filter((category) => category.alwaysActive).map((category) => category.id))}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
