import React, { useMemo, useState } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { Check, Copy } from "lucide-react";

export interface StreamMarkdownProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const StreamMarkdown: React.FC<StreamMarkdownProps> = ({
  content,
  isStreaming = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Configure marked renderer for syntax highlighting & clean markup
  const htmlContent = useMemo(() => {
    const renderer = new marked.Renderer();

    renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
      const language = lang && Prism.languages[lang] ? lang : "javascript";
      let highlighted = text;
      try {
        if (Prism.languages[language]) {
          highlighted = Prism.highlight(text, Prism.languages[language], language);
        }
      } catch {
        highlighted = text;
      }

      return `
        <div class="relative group my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
          <div class="flex items-center justify-between px-4 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
            <span>${lang || "code"}</span>
            <button 
              type="button" 
              data-code="${encodeURIComponent(text)}" 
              class="copy-btn hover:text-zinc-100 flex items-center gap-1 transition-colors"
            >
              Copy
            </button>
          </div>
          <pre class="p-4 overflow-x-auto text-sm text-zinc-100 font-mono leading-normal m-0 bg-transparent"><code>${highlighted}</code></pre>
        </div>
      `;
    };

    return marked.parse(content || "", { renderer, breaks: true, gfm: true });
  }, [content]);

  // Delegated safe copy handler (CSP safe, avoids inline onclick)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest(".copy-btn");
    if (!target) return;
    const rawCode = target.getAttribute("data-code");
    if (rawCode) {
      navigator.clipboard.writeText(decodeURIComponent(rawCode));
      target.textContent = "✓ Copied";
      setTimeout(() => {
        target.textContent = "Copy";
      }, 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed ${className}`}
    >
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="inline-block w-full"
      />
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 -mb-0.5 bg-zinc-900 dark:bg-zinc-100 animate-pulse rounded-sm" />
      )}
    </div>
  );
};
