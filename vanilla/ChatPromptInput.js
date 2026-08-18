/**
 * ChatPromptInput - Vanilla HTML & Web Component
 * Usage: <chat-prompt-input placeholder="Ask anything..."></chat-prompt-input>
 */
class ChatPromptInput extends HTMLElement {
  constructor() {
    super();
    this.attachments = [];
    this.isGenerating = false;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const placeholder = this.getAttribute("placeholder") || "Ask anything... (Enter to send, Shift+Enter for newline)";
    
    this.innerHTML = `
      <div class="relative w-full max-w-4xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-400 transition-all">
        <div id="attachments-container" class="flex flex-wrap gap-2 p-3 pb-0 hidden"></div>
        <div class="flex items-end px-3 py-2.5 gap-2">
          <input type="file" multiple class="hidden" id="file-input" />
          <button type="button" id="attach-btn" class="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors" title="Add attachment">📎</button>
          <textarea id="prompt-textarea" rows="1" placeholder="${placeholder}" class="flex-1 bg-transparent resize-none border-0 p-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-0 leading-relaxed max-h-[240px] min-h-[36px]"></textarea>
          <button type="button" id="submit-btn" class="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm flex-shrink-0 font-bold" title="Send message">↑</button>
        </div>
      </div>
    `;

    const textarea = this.querySelector("#prompt-textarea");
    const submitBtn = this.querySelector("#submit-btn");
    const fileInput = this.querySelector("#file-input");
    const attachBtn = this.querySelector("#attach-btn");

    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(Math.min(textarea.scrollHeight, 240), 48)}px`;
    });

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (e.isComposing) return;
        e.preventDefault();
        this.triggerSubmit();
      }
    });

    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      this.dispatchEvent(new CustomEvent("attachments", { detail: files }));
      e.target.value = "";
    });

    submitBtn.addEventListener("click", () => this.triggerSubmit());
  }

  triggerSubmit() {
    const textarea = this.querySelector("#prompt-textarea");
    const val = textarea.value.trim();
    if (val) {
      this.dispatchEvent(new CustomEvent("submit", { detail: val }));
      textarea.value = "";
      textarea.style.height = "48px";
    }
  }
}

if (!customElements.get("chat-prompt-input")) {
  customElements.define("chat-prompt-input", ChatPromptInput);
}
export default ChatPromptInput;
