/**
 * ThinkingBlock - Vanilla Web Component
 * Usage: <thinking-block is-thinking duration="3.2"></thinking-block>
 */
class ThinkingBlock extends HTMLElement {
  static get observedAttributes() {
    return ["content", "is-thinking", "duration"];
  }

  connectedCallback() {
    this.isExpanded = this.hasAttribute("is-thinking");
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const isThinking = this.hasAttribute("is-thinking");
    const duration = this.getAttribute("duration");
    const content = this.getAttribute("content") || this.textContent || "";

    this.innerHTML = `
      <div class="my-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs overflow-hidden transition-all">
        <button type="button" id="toggle-btn" class="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium transition-colors select-none text-left">
          <div class="flex items-center gap-2">
            <span class="${isThinking ? 'animate-spin' : ''}">✨</span>
            <span>${isThinking ? "Deeply thinking..." : duration ? `Thought for ${duration}s` : "Thought process"}</span>
          </div>
          <span id="chevron" class="text-[10px] text-zinc-400 transition-transform ${this.isExpanded ? 'rotate-180' : ''}">▼</span>
        </button>
        <div id="content-body" class="${this.isExpanded ? '' : 'hidden'} px-4 py-3 border-t border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap text-[13px] bg-white/40 dark:bg-zinc-950/20">
          ${content || '<span class="italic text-zinc-400">Processing thoughts...</span>'}
        </div>
      </div>
    `;

    this.querySelector("#toggle-btn").addEventListener("click", () => {
      this.isExpanded = !this.isExpanded;
      this.querySelector("#content-body").classList.toggle("hidden", !this.isExpanded);
      this.querySelector("#chevron").classList.toggle("rotate-180", this.isExpanded);
    });
  }
}

if (!customElements.get("thinking-block")) {
  customElements.define("thinking-block", ThinkingBlock);
}
export default ThinkingBlock;
