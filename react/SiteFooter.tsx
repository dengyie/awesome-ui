import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface SiteFooterColumn {
  heading: string;
  links: { label: string; href?: string }[];
}

export interface ComplianceBadge {
  title: string;
  status: string;
  statusTone?: "emerald" | "amber" | "zinc";
  icon?: UiIconName;
}

export interface SiteFooterProps {
  columns: SiteFooterColumn[];
  badges?: ComplianceBadge[];
  copyright?: string;
  tagline?: string;
  className?: string;
}

const STATUS_TONE: Record<NonNullable<ComplianceBadge["statusTone"]>, string> = {
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  zinc: "text-zinc-400",
};

export const SiteFooter: React.FC<SiteFooterProps> = ({
  columns,
  badges = [],
  copyright,
  tagline,
  className = "",
}) => (
  <footer
    data-site-footer
    className={`rounded-xl border border-zinc-200 bg-zinc-950 p-6 text-zinc-400 dark:border-zinc-800 ${className}`}
  >
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {columns.map((column, index) => (
        <nav key={`${column.heading}-${index}`} data-footer-column={index} aria-label={column.heading}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{column.heading}</p>
          <ul className="mt-3 space-y-2">
            {column.links.map((link, linkIndex) => (
              <li key={`${link.label}-${linkIndex}`}>
                <a
                  href={link.href ?? "#"}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ))}
      {badges.length ? (
        <div data-footer-badges>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Compliance</p>
          <ul className="mt-3 space-y-3">
            {badges.map((badge, index) => (
              <li key={`${badge.title}-${index}`} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                  <UiIcon name={badge.icon || "check-circle"} size={14} className="text-zinc-300" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-zinc-200">{badge.title}</span>
                  <span
                    className={`block truncate text-[10px] ${
                      STATUS_TONE[badge.statusTone || "zinc"]
                    }`}
                  >
                    {badge.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
      {tagline ? <p className="text-xs text-zinc-500">{tagline}</p> : <span />}
      {copyright ? <p className="text-[11px] text-zinc-600">{copyright}</p> : null}
    </div>
  </footer>
);

export default SiteFooter;
