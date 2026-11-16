/**
 * BlogPostArticle - Blog article page: top bar with logo and search, left
 * "On this page" nav highlight, article body with headings, paragraphs,
 * inline code, and a dark code block with Copy button (Hashnode article
 * pattern).
 */
import React from "react";

export interface ArticleHeading {
  id: string;
  text: string;
  level?: 2 | 3;
}

export interface ArticleCodeBlock {
  language: string;
  code: string;
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id: string; level?: 2 | 3 }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; code: string };

export interface BlogPostArticleProps {
  siteName?: string;
  title?: string;
  subtitle?: string;
  meta?: string;
  blocks?: ArticleBlock[];
  toc?: ArticleHeading[];
  activeHeadingId?: string;
  codeLabel?: string;
  copiedLabel?: string;
  className?: string;
  onHeadingClick?: (heading: ArticleHeading) => void;
  onCopyCode?: () => void;
}

export default function BlogPostArticle({
  siteName = "SLMobbin",
  title = "Introduction to Front-End Development: A Beginner's Guide",
  subtitle = "What is Front-End Development?",
  meta = "8 min read · Nov 14, 2026",
  blocks = [
    {
      type: "paragraph",
      text: "Front-end development is the process of designing and building the part of a website or web application that users interact with directly. It involves creating the structure, layout, and interactive features of a webpage, ensuring a seamless user experience.",
    },
    { type: "heading", text: "Key Technologies in Front-End Development", id: "key-technologies", level: 2 },
    { type: "paragraph", text: "Front-end development primarily relies on three core technologies: HTML, CSS and JavaScript." },
    { type: "list", items: ["HTML provides the basic structure of a webpage.", "CSS controls the presentation and layout.", "JavaScript adds interactivity and dynamic behavior."] },
    { type: "heading", text: "1. HTML (HyperText Markup Language)", id: "html", level: 3 },
    { type: "paragraph", text: "HTML provides the basic structure of a webpage. It defines elements such as headings, paragraphs, images, links, and forms." },
    {
      type: "code",
      language: "html",
      code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Web Page</title>\n  </head>\n  <body>\n    <h1>Welcome to Front-End Development</h1>\n    <p>This is an example of HTML structure.</p>\n  </body>\n</html>',
    },
  ] as ArticleBlock[],
  toc = [
    { id: "key-technologies", text: "Key Technologies in Front-End Development", level: 2 },
    { id: "html", text: "1. HTML (HyperText Markup Language)", level: 3 },
  ] as ArticleHeading[],
  activeHeadingId = "",
  codeLabel = "Copy",
  copiedLabel = "Copied!",
  className = "",
  onHeadingClick,
  onCopyCode,
}: BlogPostArticleProps) {
  const [activeId, setActiveId] = React.useState(activeHeadingId || toc[0]?.id || "");
  const [copied, setCopied] = React.useState(false);

  const codeBlocks = blocks.filter((b): b is Extract<ArticleBlock, { type: "code" }> => b.type === "code");

  return (
    <div data-blogpost className={`w-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      {/* top bar */}
      <header data-blogpost-topbar className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <p data-blogpost-site className="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50">{siteName}</p>
        <div className="hidden min-w-0 flex-1 justify-center sm:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 text-xs text-zinc-400 dark:border-zinc-800">
            <span aria-hidden="true">⌕</span>
            <span className="flex-1">Search</span>
            <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘ K</kbd>
          </div>
        </div>
        <button type="button" aria-label="Toggle theme" className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">☾</button>
      </header>

      <div className="grid lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* left toc */}
        <nav data-blogpost-toc className="hidden border-r border-zinc-200 p-5 lg:block dark:border-zinc-800">
          <div className="space-y-1">
            {toc.map((h) => {
              const active = h.id === activeId;
              return (
                <button
                  key={h.id}
                  data-blogpost-tocitem={h.id}
                  data-blogpost-toc-active={active ? "true" : "false"}
                  type="button"
                  onClick={() => {
                    setActiveId(h.id);
                    onHeadingClick?.(h);
                  }}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs leading-5 transition-colors ${
                    h.level === 3 ? "pl-6" : ""
                  } ${
                    active
                      ? "bg-sky-50 font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {h.text}
                </button>
              );
            })}
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
            <span aria-hidden="true">⇥</span> Collapse
            <kbd className="ml-auto rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘ \</kbd>
          </p>
        </nav>

        {/* article */}
        <article data-blogpost-article className="min-w-0 px-6 py-8 sm:px-10">
          <h1 data-blogpost-title className="text-3xl font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300">{subtitle}</p>}
          {meta && <p data-blogpost-meta className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{meta}</p>}

          <div data-blogpost-content className="mt-6 space-y-4">
            {blocks.map((block, i) => {
              if (block.type === "paragraph") {
                return <p key={i} className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{block.text}</p>;
              }
              if (block.type === "heading") {
                const Tag = block.level === 3 ? "h3" : "h2";
                return (
                  <Tag
                    key={i}
                    id={block.id}
                    data-blogpost-heading={block.id}
                    className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${block.level === 3 ? "text-lg mt-8" : "text-xl mt-10"}`}
                  >
                    {block.text}
                  </Tag>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="list-disc space-y-1.5 pl-6 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <div key={i} data-blogpost-code className="overflow-hidden rounded-xl bg-zinc-950 dark:bg-black">
                  <div className="flex items-center justify-between px-4 pt-3">
                    <span className="text-[10px] uppercase tracking-wide text-zinc-500">{block.language}</span>
                    <button
                      data-blogpost-code-copy
                      type="button"
                      onClick={() => {
                        setCopied(true);
                        onCopyCode?.();
                        window.setTimeout(() => setCopied(false), 1500);
                      }}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                      <span aria-hidden="true">⧉</span> {copied ? copiedLabel : codeLabel}
                    </button>
                  </div>
                  <pre className="overflow-x-auto px-4 pb-4 pt-1 text-xs leading-5 text-zinc-200"><code>{block.code}</code></pre>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
