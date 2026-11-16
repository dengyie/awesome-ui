/**
 * StreamMarkdown - Vanilla Web Component (Powered by marked & Prism CDN)
 * Usage: <stream-markdown is-streaming content="# Hello World"></stream-markdown>
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Lightweight sanitizer for marked output — keeps gfm/code-fence rendering intact
// while stripping the dangerous surface: script containers, sandbox-escape tags,
// on* event handlers (tag-scoped, so prose text like "online=1" survives) and
// javascript:/vbscript:/non-image data: URLs. No external dependencies.
const unsafeUrl = (value) =>
  /^\s*(javascript|vbscript):/i.test(value) || /^\s*data:(?!image\/)/i.test(value);

const sanitizeTag = (tag) =>
  tag
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(
      /(\s(?:href|src|srcset|action|formaction)\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/gi,
      (m, pre, lit) => {
        const value = lit[0] === '"' || lit[0] === "'" ? lit.slice(1, -1) : lit;
        return unsafeUrl(value) ? `${pre}""` : m;
      }
    );

const sanitizeMarkdownHtml = (html) =>
  String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/<(iframe|object|embed|base|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(iframe|object|embed|base|form)\b[^>]*\/?>/gi, '')
    .replace(/<[a-z][^>]*>/gi, (tag) => sanitizeTag(tag));

class StreamMarkdown extends HTMLElement {
  static get observedAttributes() {
    return ["content", "is-streaming"];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  disconnectedCallback() {
    if (this._clickHandler) {
      this.removeEventListener("click", this._clickHandler);
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const isStreaming = this.hasAttribute("is-streaming");
    const content = this.getAttribute("content") || this.textContent || "";
    
    // Parse Markdown safely (falls back to text if marked not loaded)
    let parsedHtml = content;
    if (window.marked) {
      const renderer = new window.marked.Renderer();
      renderer.code = function ({ text, lang }) {
        const language = lang && window.Prism && window.Prism.languages[lang] ? lang : "javascript";
        let highlighted = text;
        try {
          if (window.Prism && window.Prism.languages[language]) {
            highlighted = window.Prism.highlight(text, window.Prism.languages[language], language);
          }
        } catch {
          highlighted = text;
        }

        return `
          <div class="relative group my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
            <div class="flex items-center justify-between px-4 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
              <span>${escapeAttribute(lang || "code")}</span>
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
      parsedHtml = window.marked.parse(content, { renderer, breaks: true, gfm: true });
    }

    parsedHtml = sanitizeMarkdownHtml(parsedHtml);

    this.innerHTML = `
      <div class="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed">
        <div class="inline-block w-full">${parsedHtml}</div>
        ${isStreaming ? '<span class="inline-block w-2 h-4 ml-1 -mb-0.5 bg-zinc-900 dark:bg-zinc-100 animate-pulse rounded-sm"></span>' : ''}
      </div>
    `;
  }

  bindEvents() {
    this._clickHandler = (e) => {
      const target = e.target.closest(".copy-btn");
      if (!target) return;
      const rawCode = target.getAttribute("data-code");
      if (rawCode) {
        navigator.clipboard.writeText(decodeURIComponent(rawCode));
        target.textContent = "Copied";
        setTimeout(() => {
          target.textContent = "Copy";
        }, 2000);
      }
    };
    this.addEventListener("click", this._clickHandler);
  }
}

if (!customElements.get("stream-markdown")) {
  customElements.define("stream-markdown", StreamMarkdown);
}
export default StreamMarkdown;
