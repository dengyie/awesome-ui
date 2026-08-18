/**
 * StreamMarkdown - Vanilla Web Component (Powered by marked & Prism CDN)
 * Usage: <stream-markdown is-streaming content="# Hello World"></stream-markdown>
 */
class StreamMarkdown extends HTMLElement {
  static get observedAttributes() {
    return ["content", "is-streaming"];
  }

  connectedCallback() {
    this.render();
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
      parsedHtml = window.marked.parse(content, { breaks: true, gfm: true });
    }

    this.innerHTML = `
      <div class="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed">
        <div class="inline-block w-full">${parsedHtml}</div>
        ${isStreaming ? '<span class="inline-block w-2 h-4 ml-1 -mb-0.5 bg-zinc-900 dark:bg-zinc-100 animate-pulse rounded-sm"></span>' : ''}
      </div>
    `;
  }
}

if (!customElements.get("stream-markdown")) {
  customElements.define("stream-markdown", StreamMarkdown);
}
export default StreamMarkdown;
