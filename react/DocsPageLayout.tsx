/**
 * DocsPageLayout - Documentation page shell: left nav with top links and
 * grouped sections, center article with title, Copy page button, callout,
 * cards grid and code examples, right "On this page" table of contents
 * with active highlight (Mintlify docs pattern).
 */
import React from "react";

export interface DocsNavItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
}

export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export interface DocsCard {
  title: string;
  description: string;
  icon?: string;
  href?: string;
}

export interface DocsCodeExample {
  filename: string;
  language: string;
  code: string;
}

export type DocsBlock =
  | { type: "paragraph"; text: string }
  | { type: "callout"; tone?: "info" | "success" | "warning"; title?: string; text: string }
  | { type: "heading"; text: string; anchor: string }
  | { type: "cards"; cards: DocsCard[] }
  | { type: "code"; example: DocsCodeExample };

export interface DocsTocItem {
  id: string;
  label: string;
}

export interface DocsPageLayoutProps {
  topLinks?: DocsNavItem[];
  navGroups?: DocsNavGroup[];
  title?: string;
  copyLabel?: string;
  blocks?: DocsBlock[];
  toc?: DocsTocItem[];
  activeTocId?: string;
  className?: string;
  onNavClick?: (item: DocsNavItem) => void;
  onTocClick?: (item: DocsTocItem) => void;
  onCopyPage?: () => void;
}

export default function DocsPageLayout({
  topLinks = [
    { id: "documentation", label: "Documentation", icon: "📘" },
    { id: "blog", label: "Blog", icon: "📰" },
  ],
  navGroups = [
    {
      label: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction" },
        { id: "quickstart", label: "Quickstart", badge: "Start here" },
        { id: "development", label: "Development" },
      ],
    },
    {
      label: "Essentials",
      items: [
        { id: "routing", label: "Routing" },
        { id: "metadata", label: "Metadata" },
        { id: "images", label: "Images" },
      ],
    },
  ],
  title = "Quickstart",
  copyLabel = "Copy page",
  blocks = [
    {
      type: "callout",
      tone: "info",
      title: "New to Mintlify?",
      text: "Start here to learn how to build, preview and deploy your documentation.",
    },
    {
      type: "paragraph",
      text: "This guide walks you through setting up a local development environment, writing your first page and deploying to production.",
    },
    {
      type: "heading",
      text: "Create a new project",
      anchor: "create-a-new-project",
    },
    {
      type: "code",
      example: {
        filename: "Terminal",
        language: "bash",
        code: 'npx mintlify init && npx mintlify dev',
      },
    },
    {
      type: "heading",
      text: "Cards",
      anchor: "cards",
    },
    {
      type: "cards",
      cards: [
        { title: "Quickstart", description: "Get your docs running in minutes.", icon: "🚀", href: "/quickstart" },
        { title: "Theming", description: "Customize colors, fonts and layout.", icon: "🎨", href: "/theming" },
      ],
    },
  ],
  toc = [
    { id: "create-a-new-project", label: "Create a new project" },
    { id: "cards", label: "Cards" },
  ],
  activeTocId = "",
  className = "",
  onNavClick,
  onTocClick,
  onCopyPage,
}: DocsPageLayoutProps) {
  const [activeId, setActiveId] = React.useState(activeTocId || toc[0]?.id || "");
  const [copied, setCopied] = React.useState(false);

  const calloutStyles: Record<string, string> = {
    info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  };
  const calloutIcon: Record<string, string> = { info: "ℹ️", success: "✅", warning: "⚠️" };

  const renderBlock = (block: DocsBlock, index: number) => {
    if (block.type === "paragraph") {
      return <p key={index} className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{block.text}</p>;
    }
    if (block.type === "callout") {
      return (
        <div key={index} data-docspage-callout className={`rounded-xl border p-4 ${calloutStyles[block.tone ?? "info"]}`}>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden="true">{calloutIcon[block.tone ?? "info"]}</span>
            {block.title}
          </p>
          <p className="mt-1 text-sm leading-6 opacity-90">{block.text}</p>
        </div>
      );
    }
    if (block.type === "heading") {
      return (
        <h2 key={index} id={block.anchor} data-docspage-heading={block.anchor} className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {block.text}
        </h2>
      );
    }
    if (block.type === "cards") {
      return (
        <div key={index} data-docspage-cards className="grid gap-3 sm:grid-cols-2">
          {block.cards.map((card) => (
            <a
              key={card.title}
              data-docspage-card={card.title}
              href={card.href ?? "#"}
              className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {card.icon && <span aria-hidden="true">{card.icon}</span>}
                {card.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{card.description}</p>
            </a>
          ))}
        </div>
      );
    }
    return (
      <div key={index} data-docspage-code className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <span className="text-xs font-medium text-zinc-400">{block.example.filename}</span>
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">{block.example.language}</span>
        </div>
        <pre className="overflow-x-auto px-4 py-3 text-xs leading-5 text-zinc-200"><code>{block.example.code}</code></pre>
      </div>
    );
  };

  return (
    <div data-docspage className={`grid w-full gap-8 lg:grid-cols-[220px_minmax(0,1fr)_200px] ${className}`}>
      {/* left nav */}
      <nav data-docspage-nav className="hidden lg:block">
        <div className="space-y-1">
          {topLinks.map((link) => (
            <button
              key={link.id}
              data-docspage-toplink={link.id}
              type="button"
              onClick={() => onNavClick?.(link)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {link.icon && <span aria-hidden="true">{link.icon}</span>}
              {link.label}
            </button>
          ))}
        </div>
        {navGroups.map((group) => (
          <div key={group.label} data-docspage-group={group.label} className="mt-5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{group.label}</p>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  data-docspage-navitem={item.id}
                  type="button"
                  onClick={() => onNavClick?.(item)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">{item.badge}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* center article */}
      <article data-docspage-article className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h1 data-docspage-title className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
          <button
            data-docspage-copy
            type="button"
            onClick={() => {
              setCopied(true);
              onCopyPage?.();
              window.setTimeout(() => setCopied(false), 1500);
            }}
            className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {copied ? "✓ Copied" : `⧉ ${copyLabel}`}
          </button>
        </div>
        <div data-docspage-content className="mt-6 space-y-4">{blocks.map(renderBlock)}</div>
      </article>

      {/* right toc */}
      <aside data-docspage-toc className="hidden lg:block">
        <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">On this page</p>
        <div className="mt-3 space-y-1 border-l border-zinc-200 dark:border-zinc-800">
          {toc.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                data-docspage-tocitem={item.id}
                data-docspage-toc-active={active ? "true" : "false"}
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                  onTocClick?.(item);
                }}
                className={`-ml-px block w-full border-l-2 px-3 py-1 text-left text-xs transition-colors ${
                  active
                    ? "border-zinc-900 font-semibold text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
