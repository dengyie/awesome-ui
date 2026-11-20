/**
 * McpConnectPanel - Vanilla Web Component
 * MCP (Model Context Protocol) server connection guide: per-client tabs,
 * numbered setup steps and a copyable config snippet block.
 *
 * Usage: <mcp-connect-panel title="Connection guide"></mcp-connect-panel>
 * Property: clients ([{id, label, mark?, steps: [...], snippet?}])
 * Attributes: title, description
 * Events: copy (detail {client})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class McpConnectPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description'];
  }

  constructor() {
    super();
    this._clients = [];
    this._active = '';
    this._copied = false;
    this._copyTimer = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._active && this._clients.length > 0) this._active = this._clients[0].id;
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const tab = event.target.closest('[data-mcp-tab]');
        if (tab) {
          this._active = tab.getAttribute('data-mcp-tab') || '';
          this._copied = false;
          this.render();
          return;
        }
        if (event.target.closest('[data-mcp-copy]')) {
          this._copied = true;
          const client = this._clients.find((c) => c.id === this._active) || this._clients[0];
          if (client) this.dispatchEvent(new CustomEvent('copy', { detail: { client } }));
          if (this._copyTimer) clearTimeout(this._copyTimer);
          this._copyTimer = setTimeout(() => { this._copied = false; this.render(); }, 1600);
          this.render();
        }
      });
    }
  }

  disconnectedCallback() {
    if (this._copyTimer) { clearTimeout(this._copyTimer); this._copyTimer = null; }
  }

  get clients() { return this._clients; }
  set clients(v) {
    this._clients = Array.isArray(v) ? v.map((c) => ({ ...c })) : [];
    if (!this._clients.find((c) => c.id === this._active)) {
      this._active = this._clients[0]?.id || '';
    }
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before clients are captured.
    if (this._clients.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Connection guide');
    const description = escapeAttribute(this.getAttribute('description') || 'Connect to the MCP server to access workspace data directly from your preferred AI assistant.');
    const client = this._clients.find((c) => c.id === this._active) || this._clients[0];

    const tabs = this._clients.map((c) => `
      <button type="button" data-mcp-tab="${escapeAttribute(c.id)}" aria-selected="${c.id === client?.id}" class="-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${c.id === client?.id ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}">${c.mark ? `<span aria-hidden="true">${escapeAttribute(c.mark)}</span>` : ''}${escapeAttribute(c.label)}</button>`
    ).join('');

    const steps = client ? (client.steps || []).map((step, i) => `
      <li data-mcp-step class="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-50 font-mono text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">${i + 1}</span>
        <span class="min-w-0">${escapeAttribute(step)}</span>
      </li>`
    ).join('') : '';

    const snippet = client?.snippet ? `
      <div data-mcp-snippet class="mt-3">
        <div class="relative">
          <pre class="overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200"><code>${escapeAttribute(client.snippet)}</code></pre>
          <button type="button" data-mcp-copy class="absolute right-2 top-2 rounded-md border border-zinc-700 bg-zinc-900/90 px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:border-teal-500 hover:text-teal-300">${this._copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>` : '';

    this.innerHTML = `<div data-mcp-panel class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <p data-mcp-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
  <p data-mcp-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${description}</p>
  <div data-mcp-tabs class="mt-3 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">${tabs}</div>
  <ol data-mcp-steps class="mt-3 space-y-2">${steps}</ol>
  ${snippet}
</div>`;
  }
}

if (!customElements.get('mcp-connect-panel')) {
  customElements.define('mcp-connect-panel', McpConnectPanelElement);
}
