import React from "react";
import { UiIcon } from "./UiIcon";

export interface HeroSectionProps {
  /** Small pill above the headline. */
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
  /** Short proof points rendered as a check list under the CTAs. */
  highlights?: string[];
  align?: "left" | "center";
  onPrimary?: () => void;
  onSecondary?: () => void;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  highlights = [],
  align = "center",
  onPrimary,
  onSecondary,
  className = "",
}) => {
  const centered = align === "center";
  return (
    <section
      className={`flex flex-col ${centered ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
          <UiIcon name="sparkles" size={12} />
          {eyebrow}
        </span>
      )}

      <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
        {title}
      </h1>

      {description && (
        <p className={`mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 ${centered ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}

      {(primaryCta || secondaryCta) && (
        <div className={`mt-6 flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}>
          {primaryCta && (
            <button
              type="button"
              onClick={onPrimary}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              {primaryCta}
            </button>
          )}
          {secondaryCta && (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {secondaryCta}
            </button>
          )}
        </div>
      )}

      {highlights.length > 0 && (
        <ul className={`mt-6 flex flex-wrap gap-x-4 gap-y-2 ${centered ? "justify-center" : ""}`}>
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <UiIcon name="check" size={13} className="shrink-0 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HeroSection;
