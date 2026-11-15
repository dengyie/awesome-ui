/**
 * ConnectorGrid - Vanilla Web Component
 * Usage: <connector-grid title="Apps & Connectors"></connector-grid>
 * Properties: connectors ([{id, name, description?, icon?, connected?}])
 * Attributes: title, connect-text, connected-text
 * Events: toggle (detail {id, connected})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ConnectorGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'connect-text', 'connected-text'];
  }

  constructor() {
    super();
    this._connectors = [];
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-connector-toggle]');
        if (btn) {
          const card = btn.closest('[data-connector]');
          if (card) {
            const id = card.getAttribute('data-connector');
            const current = this._connectors.find((c) => c.id === id);
            const connected = !current?.connected;
            // toggle local state so re-render shows the new label
            if (current) current.connected = connected;
            this.dispatchEvent(new CustomEvent('toggle', { detail: { id, connected } }));
            this.render();
          }
        }
      });
    }
  }

  get connectors() { return this._connectors; }
  set connectors(v) {
    this._connectors = Array.isArray(v) ? v.map((c) => ({ ...c })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before connectors are captured.
    if (this._connectors.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Apps & Connectors');
    const connectText = escapeAttribute(this.getAttribute('connect-text') || 'Connect');
    const connectedText = escapeAttribute(this.getAttribute('connected-text') || 'Connected');
    const connectedCount = this._connectors.filter((c) => c.connected).length;

    const cards = this._connectors.map((connector) => `
      <div data-connector="${escapeAttribute(connector.id)}" class="flex items-start justify-between gap-3 rounded-lg border px-3 py-3 transition-colors ${connector.connected ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/40' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'}">
        <div class="flex min-w-0 items-start gap-2.5">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-base dark:bg-zinc-800" aria-hidden="true">${escapeAttribute(connector.icon || '🔌')}</span>
          <div class="min-w-0">
            <p data-connector-name class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(connector.name)}</p>
            ${connector.description ? `<p data-connector-desc class="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(connector.description)}</p>` : ''}
          </div>
        </div>
        <button type="button" data-connector-toggle class="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${connector.connected ? 'border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200' : 'bg-indigo-600 text-white hover:bg-indigo-500'}">${connector.connected ? `<span class="flex items-center gap-1"><svg viewBox="0 0 20 20" fill="none" class="h-3 w-3" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>${connectedText}</span>` : connectText}</button>
      </div>`).join('');

    this.innerHTML = `<div data-connector-grid class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
    <span data-connector-count class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${connectedCount}/${this._connectors.length} connected</span>
  </div>
  <div class="mt-3 grid gap-3 sm:grid-cols-2">${cards}</div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('connector-grid')) {
  customElements.define('connector-grid', ConnectorGridElement);
}

export default ConnectorGridElement;
