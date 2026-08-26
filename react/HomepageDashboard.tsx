import React, { useEffect, useMemo, useState } from "react";

/**
 * HomepageDashboard — React
 * A copy-paste, zero-blackbox single-file homelab dashboard with the iconic
 * gethomepage/homepage look: header (title + live clock + search) + responsive
 * grouped service cards with status dots/pills + version footer.
 *
 * ORIGINAL implementation of the visual design language of
 * https://github.com/gethomepage/homepage (GPL-3.0). No GPL source copied.
 */
export type HomepageStatus = "online" | "up" | "down" | "offline" | "warn" | "error" | "unknown";

export interface HomepageService {
  name: string;
  description?: string;
  /** URL, data-URI, relative path, single-emoji, or omitted (letter monogram fallback) */
  icon?: string;
  href?: string;
  status?: HomepageStatus;
  /** Custom status label, e.g. "12ms", "Healthy" (rendered in pill mode) */
  pingText?: string;
}

export interface HomepageGroup {
  name: string;
  icon?: string;
  services: HomepageService[];
}

export interface HomepageDashboardProps {
  title?: string;
  subtitle?: string;
  version?: string;
  groups?: HomepageGroup[];
  headerStyle?: "underlined" | "boxed" | "clean";
  statusStyle?: "pill" | "dot" | "none";
  showClock?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  collapsible?: boolean;
  className?: string;
}

export const statusConfig = (
  status: HomepageStatus = "unknown"
): { dot: string; pill: string; label: string } => {
  switch (status) {
    case "online":
    case "up":
      return { dot: "bg-emerald-500", pill: "text-emerald-500/90", label: "UP" };
    case "down":
    case "offline":
      return { dot: "bg-rose-500", pill: "text-rose-500/90", label: "DOWN" };
    case "warn":
      return { dot: "bg-amber-500", pill: "text-amber-500", label: "WARN" };
    case "error":
      return { dot: "bg-orange-500", pill: "text-orange-500", label: "ERROR" };
    default:
      return { dot: "bg-zinc-400/60 dark:bg-zinc-500/60", pill: "text-zinc-500 dark:text-zinc-400", label: "—" };
  }
};

const ServiceIcon: React.FC<{ service: HomepageService }> = ({ service }) => {
  const monogram = (service.name || "?").trim().charAt(0).toUpperCase();
  const wrap = "shrink-0 my-1.5 ml-1.5 w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-zinc-200/70 dark:bg-white/10";
  if (!service.icon) return <div className={wrap}><span className="text-xl font-bold text-zinc-500 dark:text-zinc-300">{monogram}</span></div>;
  if (/^(https?:|data:|\.|\/)/i.test(service.icon)) {
    return (
      <div className={wrap}>
        <img src={service.icon} alt="" loading="lazy" width={32} height={32} className="w-8 h-8 object-contain" />
      </div>
    );
  }
  return <div className={wrap}><span className="text-xl leading-none">{service.icon}</span></div>;
};

export const HomepageDashboard: React.FC<HomepageDashboardProps> = ({
  title = "Homepage",
  subtitle = "A highly customizable homelab dashboard",
  version = "v2.1.0",
  groups = [],
  headerStyle = "underlined",
  statusStyle = "pill",
  showClock = true,
  showSearch = false,
  searchPlaceholder = "Search services…",
  collapsible = true,
  className = "",
}) => {
  const [now, setNow] = useState(() => new Date());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!showClock) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [showClock]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        services: (g.services || []).filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.description || "").toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.services.length > 0);
  }, [groups, query]);

  const toggleGroup = (name: string) => {
    if (!collapsible) return;
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const headerCls =
    headerStyle === "boxed"
      ? "m-3 sm:m-5 mb-0 rounded-lg bg-white dark:bg-white/5 shadow-md shadow-zinc-900/10 p-4"
      : headerStyle === "clean"
        ? "m-3 sm:m-5 mb-0"
        : "m-3 sm:m-5 mb-1 border-b-2 border-zinc-300/70 dark:border-zinc-700 pb-4";

  const clock = showClock ? (
    <div className="text-right shrink-0 min-w-28">
      <div className="text-2xl sm:text-3xl font-semibold tabular-nums text-zinc-800 dark:text-zinc-100 leading-tight">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  ) : null;

  return (
    <div
      className={`homepage-dashboard relative w-full rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-hidden ${className}`}
      style={{ fontFamily: "'Manrope', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
    >
      <header className={headerCls}>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          {(
            showSearch || showClock
          ) && (
            <div className="flex flex-wrap items-center gap-4">
              {showSearch && (
                <div className="relative w-full sm:w-64">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l2.328 2.328a.75.75 0 1 1-1.06 1.06l-2.328-2.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-white/5 px-9 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                  />
                </div>
              )}
              {clock}
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-wrap items-start px-3 sm:px-5 pb-4">
        {filteredGroups.length === 0 && (
          <p className="p-4 text-sm text-zinc-400">No services configured yet.</p>
        )}
        {filteredGroups.map((group) => {
          const isCollapsed = Boolean(collapsed[group.name]);
          return (
            <div key={group.name} className="services-group w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-1 pb-0">
              <button
                type="button"
                onClick={() => toggleGroup(group.name)}
                className={`group-header flex w-full select-none items-center gap-1 py-0.5 ${collapsible ? "" : "cursor-default"}`}
              >
                {group.icon && (
                  <span className="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-white/10 text-sm leading-none">
                    {group.icon}
                  </span>
                )}
                <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-300">{group.name}</h2>
                {collapsible && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`w-5 h-5 ml-auto transition-transform duration-200 text-zinc-700 dark:text-zinc-300 ${isCollapsed ? "rotate-180" : ""}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </button>
              {!isCollapsed && (
                <ul className="mt-2">
                  {group.services.map((service, i) => {
                    const cfg = statusConfig(service.status);
                    const hasLink = service.href && service.href !== "#";
                    const content = (
                      <>
                        <ServiceIcon service={service} />
                        <div className="flex-1 min-w-0 px-2 py-2.5 text-sm text-left">
                          <div className="truncate font-medium text-zinc-800 dark:text-zinc-200">{service.name}</div>
                          {service.description && (
                            <div className="truncate mt-0.5 text-xs font-light text-zinc-500 dark:text-zinc-300">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </>
                    );
                    return (
                      <li
                        key={`${group.name}-${service.name}-${i}`}
                        data-name={service.name || ""}
                        className="service-card relative overflow-clip rounded-md shadow-md shadow-zinc-900/10 dark:shadow-zinc-900/20 bg-white hover:bg-zinc-50 dark:bg-white/5 dark:hover:bg-white/10 transition-all mb-2 p-0.5"
                      >
                        {hasLink ? (
                          <a
                            href={service.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex select-none items-center"
                          >
                            {content}
                          </a>
                        ) : (
                          <div className="flex select-none items-center">{content}</div>
                        )}
                        {statusStyle === "dot" && (
                          <span
                            title={service.pingText || cfg.label}
                            className={`absolute top-1.5 right-1.5 h-3 w-3 rounded-full ${cfg.dot}`}
                          />
                        )}
                        {statusStyle === "pill" && (
                          <span className={`absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wide px-1.5 py-1 rounded-md bg-zinc-500/10 dark:bg-zinc-400/10 ${cfg.pill}`}>
                            {service.pingText || cfg.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </main>

      <footer className="px-5 py-6 text-right">
        <a
          href="https://github.com/gethomepage/homepage"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.67.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          <span>{version}</span>
        </a>
      </footer>
    </div>
  );
};

export default HomepageDashboard;