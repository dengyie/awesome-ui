import React from "react";
import { UiIcon } from "./UiIcon";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  /** 1–5; omitted hides the star row. */
  rating?: number;
}

export interface TestimonialGridProps {
  testimonials?: Testimonial[];
  columns?: 2 | 3;
  onSelect?: (testimonial: Testimonial) => void;
  className?: string;
}

const COLUMN_CLASS: Record<2 | 3, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export const TestimonialGrid: React.FC<TestimonialGridProps> = ({
  testimonials = [],
  columns = 3,
  onSelect,
  className = "",
}) => {
  if (testimonials.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 ${className}`}
      >
        No testimonials yet.
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${COLUMN_CLASS[columns]} ${className}`}>
      {testimonials.map((testimonial) => {
        const rating = Math.max(0, Math.min(5, Math.round(testimonial.rating ?? 0)));
        return (
          <figure
            key={testimonial.id}
            onClick={() => onSelect?.(testimonial)}
            className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {rating > 0 && (
              <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <UiIcon
                    key={index}
                    name="star"
                    size={13}
                    className={index < rating ? "text-amber-500" : "text-zinc-200 dark:text-zinc-700"}
                  />
                ))}
              </div>
            )}

            <blockquote className="mt-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              “{testimonial.quote}”
            </blockquote>

            <figcaption className="mt-4 flex items-center gap-2">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
                  {initials(testimonial.name)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">
                  {testimonial.name}
                </span>
                {(testimonial.role || testimonial.company) && (
                  <span className="block truncate text-[10px] text-zinc-400">
                    {[testimonial.role, testimonial.company].filter(Boolean).join(", ")}
                  </span>
                )}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
};

export default TestimonialGrid;
