/**
 * LogoCloud - "Trusted by" customer logo wall: optional kicker line, a
 * responsive grid of grayscale logo tiles (name or image), hover restores
 * color emphasis (logo cloud social proof pattern).
 */
import React from "react";

export interface LogoItem {
  name: string;
  src?: string;
}

export interface LogoCloudProps {
  kicker?: string;
  logos?: LogoItem[];
  className?: string;
}

const DEFAULT_LOGOS: LogoItem[] = [
  { name: "Acme Corp" },
  { name: "Globex" },
  { name: "Initech" },
  { name: "Umbrella" },
  { name: "Stark Industries" },
  { name: "Wayne Enterprises" },
];

export const LogoCloud: React.FC<LogoCloudProps> = ({
  kicker = "Trusted by teams at",
  logos = DEFAULT_LOGOS,
  className = "",
}) => {
  const list = Array.isArray(logos) ? logos : [];

  return (
    <div data-logocloud className={`w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 ${className}`}>
      {kicker ? <p data-logocloud-kicker className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{kicker}</p> : null}
      <div data-logocloud-grid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {list.map((logo) => (
          <div key={logo.name} data-logocloud-item={logo.name} className="group flex h-14 items-center justify-center rounded-lg border border-zinc-100 bg-white px-4 transition-colors dark:border-zinc-800 dark:bg-zinc-900">
            {logo.src ? (
              <img src={logo.src} alt={logo.name || "logo"} loading="lazy" className="max-h-7 w-auto object-contain" />
            ) : (
              <span data-logocloud-name={logo.name} className="text-sm font-semibold tracking-tight text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300">{logo.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCloud;
