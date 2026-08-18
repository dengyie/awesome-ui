/**
 * MessageActionToolbar - Vanilla Web Component
 * Usage: <message-action-toolbar content="Hello" total-branches="3" branch-index="0"></message-action-toolbar>
 */
class MessageActionToolbar extends HTMLElement {
  static get observedAttributes() {
    return ["content", "role", "total-branches", "branch-index"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const content = this.getAttribute("content") || "";
    const role = this.getAttribute("role") || "assistant";
    const totalBranches = parseInt(this.getAttribute("total-branches") || "0", 10);
    const branchIndex = parseInt(this.getAttribute("branch-index") || "0", 10);

    const hasBranches = totalBranches > 1;

    this.innerHTML = `
      <div class="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 select-none">
        ${hasBranches ? `
          <div class="flex items-center gap-0.5 mr-2 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <button type="button" id="prev-branch" ${branchIndex <= 0 ? 'disabled' : ''} class="hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none p-0.5">‹</button>
            <span>${branchIndex + 1}/${totalBranches}</span>
            <button type="button" id="next-branch" ${branchIndex >= totalBranches - 1 ? 'disabled' : ''} class="hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none p-0.5">›</button>
          </div>
        ` : ''}
        <button type="button" id="copy-btn" class="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors" title="Copy response">📋</button>
        <button type="button" id="retry-btn" class="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors" title="Regenerate response">🔄</button>
        ${role === 'assistant' ? `
          <button type="button" id="thumb-up" class="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors hover:text-zinc-700" title="Good response">👍</button>
          <button type="button" id="thumb-down" class="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors hover:text-zinc-700" title="Bad response">👎</button>
        ` : ''}
      </div>
    `;

    this.querySelector("#copy-btn")?.addEventListener("click", async () => {
      await navigator.clipboard.writeText(content);
      const btn = this.querySelector("#copy-btn");
      btn.innerText = "✓";
      setTimeout(() => (btn.innerText = "📋"), 2000);
    });

    this.querySelector("#retry-btn")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("retry"));
    });

    this.querySelector("#prev-branch")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("branchChange", { detail: branchIndex - 1 }));
    });

    this.querySelector("#next-branch")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("branchChange", { detail: branchIndex + 1 }));
    });
  }
}

if (!customElements.get("message-action-toolbar")) {
  customElements.define("message-action-toolbar", MessageActionToolbar);
}
export default MessageActionToolbar;
