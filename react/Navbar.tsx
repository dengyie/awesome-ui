import React from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface NavbarLink {
  id?: string;
  label: string;
  href?: string;
  icon?: UiIconName;
  badge?: string | number;
}

export interface NavbarMenu {
  id: string;
  label: string;
  columns: { heading?: string; links: NavbarLink[] }[];
}

export interface NavbarProps {
  brand: string;
  links?: NavbarLink[];
  menus?: NavbarMenu[];
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <UiIcon
    name="chevron-down"
    size={12}
    className={`shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  />
);

export const Navbar: React.FC<NavbarProps> = ({ brand, links = [], menus = [], ctaText, onCtaClick, className = "" }) => {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const onDocKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <nav className="flex items-center gap-6 border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{brand}</span>
        <div className="flex items-center gap-1">
          {menus.map((menu) => {
            const open = openMenu === menu.id;
            return (
              <div key={menu.id} className="relative">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : menu.id)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    open
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  {menu.label}
                  <Chevron open={open} />
                </button>
                {open && (
                  <div className="absolute left-0 top-full z-30 mt-2 flex gap-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    {menu.columns.map((column, columnIndex) => (
                      <div key={column.heading ?? columnIndex} className="min-w-36 space-y-1">
                        {column.heading && (
                          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{column.heading}</p>
                        )}
                        {column.links.map((link) => (
                          <a
                            key={link.id ?? link.label}
                            href={link.href ?? "#"}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          >
                            {link.icon && <UiIcon name={link.icon} size={13} className="shrink-0 text-zinc-400" />}
                            <span className="flex-1">{link.label}</span>
                            {link.badge != null && (
                              <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                                {link.badge}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {links.map((link) => (
            <a
              key={link.id ?? link.label}
              href={link.href ?? "#"}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {ctaText && (
            <button
              type="button"
              onClick={onCtaClick}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {ctaText}
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
