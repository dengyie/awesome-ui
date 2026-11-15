import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface FooterLink {
  label: string;
  href?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSectionProps {
  brand?: string;
  tagline?: string;
  columns?: FooterColumn[];
  socials?: { label: string; icon?: UiIconName }[];
  copyright?: string;
  onLinkClick?: (link: FooterLink) => void;
  className?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  brand,
  tagline,
  columns = [],
  socials = [],
  copyright,
  onLinkClick,
  className = "",
}) => {
  return (
    <footer className={`border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-12">
        {(brand || tagline) && (
          <div className="md:w-56 md:shrink-0">
            {brand && (
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <UiIcon name="layers" size={15} />
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{brand}</span>
              </div>
            )}
            {tagline && <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{tagline}</p>}
          </div>
        )}

        {columns.length > 0 && (
          <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {column.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => onLinkClick?.(link)}
                        className="rounded text-xs text-zinc-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:text-indigo-400"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{copyright || `© ${new Date().getFullYear()} ${brand || ""}`.trim()}</p>
          {socials.length > 0 && (
            <ul className="flex items-center gap-1">
              {socials.map((social) => (
                <li key={social.label}>
                  <button
                    type="button"
                    aria-label={social.label}
                    title={social.label}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <UiIcon name={social.icon || "globe"} size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
