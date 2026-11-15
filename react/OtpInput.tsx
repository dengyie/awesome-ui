import React from "react";
import { useRef } from "react";

export interface OtpInputProps {
  length?: number;
  value?: string;
  heading?: string;
  subtext?: string;
  status?: "idle" | "error";
  errorText?: string;
  continueLabel?: string;
  resendHint?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

/**
 * OtpInput - verification code entry with per-cell auto-advance and error state.
 */
export default function OtpInput({
  length = 6,
  value = "",
  heading,
  subtext,
  status = "idle",
  errorText,
  continueLabel = "Continue",
  resendHint,
  onChange,
  onComplete,
}: OtpInputProps) {
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const errored = status === "error";

  const commit = (next: string) => {
    onChange?.(next);
    if (next.length >= length) onComplete?.(next.slice(0, length));
  };

  const setAt = (index: number, char: string) => {
    const digits = chars.slice();
    digits[index] = char;
    commit(digits.join("").slice(0, length));
  };

  const cellClass = (filled: boolean) =>
    `h-12 w-11 rounded-lg border text-center text-lg font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      errored
        ? "border-rose-400 bg-rose-50/60 text-rose-700 dark:border-rose-500/70 dark:bg-rose-950/40 dark:text-rose-200"
        : filled
          ? "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          : "border-zinc-300 bg-white text-zinc-400 placeholder:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
    }`;

  return (
    <div className="w-full max-w-sm" data-otp-input>
      {heading ? <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{heading}</h2> : null}
      {subtext ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtext}</p> : null}

      <div className={`flex gap-1.5 ${heading || subtext ? "mt-4" : ""}`} data-otp-cells>
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={char}
            aria-label={`Digit ${index + 1}`}
            data-otp-cell={index}
            onChange={(event) => {
              const char = event.target.value.replace(/\D/g, "").slice(-1);
              if (!char) return;
              setAt(index, char);
              refs.current[Math.min(index + 1, length - 1)]?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                if (chars[index]) {
                  setAt(index, "");
                } else if (index > 0) {
                  setAt(index - 1, "");
                  refs.current[index - 1]?.focus();
                }
              }
            }}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
              if (pasted.length > 1) {
                event.preventDefault();
                commit(pasted);
                refs.current[Math.min(pasted.length, length - 1)]?.focus();
              }
            }}
            className={cellClass(Boolean(char))}
          />
        ))}
      </div>

      {errored && errorText ? (
        <p data-otp-error className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="m10.29 3.86 1.58-2.75a1 1 0 0 1 1.74 0l1.58 2.75 3.18.55a1 1 0 0 1 .6 1.62l-2.2 2.5 2.2 2.5a1 1 0 0 1-.6 1.62l-3.18.55-1.58 2.75a1 1 0 0 1-1.74 0l-1.58-2.75-3.18-.55a1 1 0 0 1-.6-1.62l2.2-2.5-2.2-2.5a1 1 0 0 1 .6-1.62Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          {errorText}
        </p>
      ) : null}

      <button
        type="button"
        data-otp-continue
        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {continueLabel}
      </button>

      {resendHint ? (
        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <a href="#" data-otp-resend className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">
            Resend code
          </a>{" "}
          · {resendHint}
        </p>
      ) : null}
    </div>
  );
}
