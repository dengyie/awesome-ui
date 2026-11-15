/**
 * PromptChips - Vanilla Web Component
 * Usage: <prompt-chips suggestions='["Summarize this article", "Find bugs in code"]'></prompt-chips>
 */
class PromptChips extends HTMLElement {
  static get observedAttributes() {
    return ["suggestions"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    let suggestions = [];
    try {
      suggestions = JSON.parse(this.getAttribute("suggestions") || "[]");
    } catch {
      suggestions = [];
    }

    if (!suggestions || suggestions.length === 0) {
      this.innerHTML = "";
      return;
    }

    this.innerHTML = `
      <div class="flex flex-wrap gap-2 my-3">
        ${suggestions.map((item, idx) => `
          <button type="button" data-idx="${idx}" class="chip-item group flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left">
            <span class="text-amber-500/70 group-hover:text-amber-500 transition-colors">✨</span>
            <span class="truncate max-w-[280px]">${item}</span>
          </button>
        `).join("")}
      </div>
    `;

    this.querySelectorAll(".chip-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx") || "0", 10);
        this.dispatchEvent(new CustomEvent("select", { detail: suggestions[idx] }));
      });
    });
  }
}

if (!customElements.get("prompt-chips")) {
  customElements.define("prompt-chips", PromptChips);
}
export default PromptChips;
