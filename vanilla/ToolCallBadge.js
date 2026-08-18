/**
 * ToolCallBadge - Vanilla Web Component
 * Usage: <tool-call-badge name="web_search" status="running"></tool-call-badge>
 */
class ToolCallBadge extends HTMLElement {
  static get observedAttributes() {
    return ["name", "status", "args", "output", "error"];
  }

  connectedCallback() {
    this.isOpen = false;
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute("name") || "tool";
    const status = this.getAttribute("status") || "running";
    const args = this.getAttribute("args");
    const output = this.getAttribute("output");
    const error = this.getAttribute("error");

    let statusHtml = '<span class="text-amber-600 dark:text-amber-400 font-medium">⏳ Running...</span>';
    if (status === "success") {
      statusHtml = '<span class="text-emerald-600 dark:text-emerald-400 font-medium">✓ Success</span>';
    } else if (status === "error") {
      statusHtml = '<span class="text-rose-600 dark:text-rose-400 font-medium">✕ Failed</span>';
    }

    this.innerHTML = `
      <div class="my-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm overflow-hidden text-xs transition-all">
        <button type="button" id="toggle-btn" class="w-full flex items-center justify-between px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left select-none">
          <div class="flex items-center gap-2.5">
            <div class="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">🛠</div>
            <span class="font-mono font-medium text-zinc-800 dark:text-zinc-200">${name}</span>
          </div>
          <div class="flex items-center gap-2">
            ${statusHtml}
            <span id="chevron" class="text-[10px] text-zinc-400 transition-transform ${this.isOpen ? 'rotate-90' : ''}">▶</span>
          </div>
        </button>
        <div id="drawer" class="${this.isOpen ? '' : 'hidden'} px-3.5 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2 font-mono text-[11px]">
          ${args ? `<div><div class="text-zinc-400 font-semibold mb-1">Arguments:</div><pre class="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 overflow-x-auto m-0">${args}</pre></div>` : ''}
          ${output ? `<div><div class="text-zinc-400 font-semibold mb-1">Output:</div><pre class="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-48 m-0">${output}</pre></div>` : ''}
          ${error ? `<div><div class="text-rose-500 font-semibold mb-1">Error:</div><pre class="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 overflow-x-auto m-0">${error}</pre></div>` : ''}
        </div>
      </div>
    `;

    this.querySelector("#toggle-btn").addEventListener("click", () => {
      this.isOpen = !this.isOpen;
      this.querySelector("#drawer").classList.toggle("hidden", !this.isOpen);
      this.querySelector("#chevron").classList.toggle("rotate-90", this.isOpen);
    });
  }
}

if (!customElements.get("tool-call-badge")) {
  customElements.define("tool-call-badge", ToolCallBadge);
}
export default ToolCallBadge;
