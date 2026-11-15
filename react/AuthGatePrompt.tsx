import React from "react";

export interface AuthGateProvider {
  id: string;
  label: string;
  tone?: "white" | "brand" | "dark";
}

export interface AuthGatePromptProps {
  title: string;
  providers?: AuthGateProvider[];
  onProvider?: (id: string) => void;
  secondaryAction?: { label: string; onClick?: () => void };
  dividerText?: string;
  skipLabel?: string;
  onSkip?: () => void;
  className?: string;
}

const DEFAULT_PROVIDERS: AuthGateProvider[] = [
  { id: "google", label: "Continue with Google", tone: "white" },
  { id: "facebook", label: "Continue with Facebook", tone: "brand" },
  { id: "apple", label: "Continue with Apple", tone: "dark" },
];

const TONE_CLASS: Record<string, string> = {
  white: "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
  brand: "bg-[#1877F2] text-white hover:bg-[#166fe0]",
  dark: "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900",
};

/**
 * AuthGatePrompt - soft contextual sign-in gate with pill providers, hairline divider and a guest-skip text link.
 */
export default function AuthGatePrompt({
  title,
  providers = DEFAULT_PROVIDERS,
  onProvider,
  secondaryAction,
  dividerText = "or",
  skipLabel = "Not now",
  onSkip,
  className = "",
}: AuthGatePromptProps) {
  return (
    <div
      data-auth-gate
      className={`mx-auto w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <p data-auth-gate-title className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {title}
      </p>
      <div className="mt-5 space-y-2.5">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            data-auth-provider={provider.id}
            onClick={() => onProvider?.(provider.id)}
            className={`w-full rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${TONE_CLASS[provider.tone || "white"]}`}
          >
            {provider.label}
          </button>
        ))}
      </div>
      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs text-zinc-400">{dividerText}</span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>
      {secondaryAction ? (
        <button
          type="button"
          data-auth-secondary
          onClick={() => secondaryAction.onClick?.()}
          className="w-full rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {secondaryAction.label}
        </button>
      ) : null}
      <button
        type="button"
        data-auth-skip
        onClick={() => onSkip?.()}
        className="mt-4 text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        {skipLabel}
      </button>
    </div>
  );
}
