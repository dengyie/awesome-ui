/**
 * ArtifactCanvas - Vanilla Web Component
 * Usage: <artifact-canvas title="Preview" language="html" code="<h1>Hello</h1>"></artifact-canvas>
 */
class ArtifactCanvas extends HTMLElement {
  static get observedAttributes() {
    return ["title", "language", "code", "is-open"];
  }

  connectedCallback() {
    this.tab = "preview";
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const isOpen = this.hasAttribute("is-open");
    if (!isOpen) {
      this.innerHTML = "";
      return;
    }

    const title = this.getAttribute("title") || "Artifact Preview";
    const language = this.getAttribute("language") || "html";
    const code = this.getAttribute("code") || "";

    this.innerHTML = `
      <div class="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[680px] z-40 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300">
        <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
          <div class="flex items-center gap-3">
            <span class="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[240px]">${title}</span>
            <div class="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <button type="button" id="tab-preview" class="px-2.5 py-1 rounded-md transition-colors ${this.tab === 'preview' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' : ''}">Preview</button>
              <button type="button" id="tab-code" class="px-2.5 py-1 rounded-md transition-colors ${this.tab === 'code' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' : ''}">Code</button>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" id="copy-btn" class="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-xs font-mono">Copy</button>
            <button type="button" id="close-btn" class="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded-lg transition-colors">✕</button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden relative">
          <iframe id="preview-frame" class="w-full h-full border-0 bg-white ${this.tab === 'preview' ? '' : 'hidden'}" sandbox="allow-scripts allow-modals"></iframe>
          <pre id="code-view" class="w-full h-full p-4 m-0 overflow-auto bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed ${this.tab === 'code' ? '' : 'hidden'}"><code>${this.escapeHtml(code)}</code></pre>
        </div>
      </div>
    `;

    let sandboxedDoc = code;
    if (language === "svg") {
      sandboxedDoc = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#09090b;">${code}</div>`;
    } else if (language === "html") {
      sandboxedDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>body { margin: 0; padding: 1rem; font-family: ui-sans-serif, system-ui, sans-serif; }</style>
          </head>
          <body>
            ${code}
          </body>
        </html>
      `;
    }

    this.querySelector("#tab-preview").addEventListener("click", () => {
      this.tab = "preview";
      this.render();
    });

    this.querySelector("#tab-code").addEventListener("click", () => {
      this.tab = "code";
      this.render();
    });

    this.querySelector("#copy-btn").addEventListener("click", async () => {
      await navigator.clipboard.writeText(code);
      const btn = this.querySelector("#copy-btn");
      btn.innerText = "✓ Copied";
      setTimeout(() => (btn.innerText = "Copy"), 2000);
    });

    this.querySelector("#close-btn").addEventListener("click", () => {
      this.removeAttribute("is-open");
      this.dispatchEvent(new CustomEvent("close"));
    });
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

if (!customElements.get("artifact-canvas")) {
  customElements.define("artifact-canvas", ArtifactCanvas);
}
export default ArtifactCanvas;
