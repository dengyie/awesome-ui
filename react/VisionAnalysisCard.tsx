/**
 * VisionAnalysisCard - AI image-analysis structured reply block: key/value
 * attribute table rows and section headings like "Design Strengths" (Claude).
 */
import React from "react";

export interface VisionAnalysisSection {
  heading: string;
  rows: Array<{ key: string; value: string }>;
}

export interface VisionAnalysisCardProps {
  sections?: VisionAnalysisSection[];
  className?: string;
  onSectionClick?: (section: VisionAnalysisSection) => void;
}

export default function VisionAnalysisCard({
  sections = [
    {
      heading: "Image Details",
      rows: [
        { key: "Lighting", value: "Strong overhead sunlight creating sharp shadows on sand; excellent clarity suggests midday conditions" },
        { key: "Beach Activity", value: "Scattered groups of swimmers and sunbathers distributed across the sand and shallow water" },
        { key: "Wave Patterns", value: "Multiple rolling waves with consistent whitecaps indicate moderate, consistent swell" },
      ],
    },
  ],
  className = "",
  onSectionClick,
}: VisionAnalysisCardProps) {
  return (
    <div data-vision-analysis-card className={`w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {sections.map((section) => (
        <div key={section.heading} data-vision-section className="mb-4 last:mb-0">
          <button
            type="button"
            data-vision-section-heading={section.heading}
            onClick={() => onSectionClick?.(section)}
            className="mb-2 text-left text-sm font-semibold text-zinc-900 transition-colors hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
          >
            {section.heading}
          </button>
          <dl data-vision-rows className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            {section.rows.map((row) => (
              <div
                key={row.key}
                data-vision-row={row.key}
                className="grid grid-cols-[minmax(0,9rem)_1fr] gap-3 border-b border-zinc-100 px-3 py-2 last:border-b-0 dark:border-zinc-800/60"
              >
                <dt data-vision-row-key className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  {row.key}
                </dt>
                <dd data-vision-row-value className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
