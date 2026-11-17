/**
 * IntegrationConnectGrid - Settings integrations: category filter tabs and
 * a responsive grid of service cards with logo placeholder, connected
 * badge and Connect / Disconnect action (integration settings pattern).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_INTEGRATIONS = () => [
  { id: 'gh', name: 'GitHub', category: 'Code', connected: true },
  { id: 'sl', name: 'Slack', category: 'Chat', connected: true },
  { id: 'li', name: 'Linear', category: 'Code', connected: false },
  { id: 'no', name: 'Notion', category: 'Docs', connected: false },
  { id: 'fg', name: 'Figma', category: 'Design', connected: false },
  { id: 'sn', name: 'Sentry', category: 'Monitoring', connected: true },
];

const CATEGORY_ALL = 'All';

class IntegrationConnectGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'integrations', 'connect-label', 'disconnect-label'];
  }

  constructor() {
    super();
    this._title = 'Integrations';
    this._description = 'Connect third-party services to extend your workspace.';
    this._integrations = DEFAULT_INTEGRATIONS();
    this._connectLabel = 'Connect';
    this._disconnectLabel = 'Disconnect';
    this._category = CATEGORY_ALL;
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const d = this.getAttribute('description');
    if (d) this._description = d;
    const c = this.getAttribute('connect-label');
    if (c) this._connectLabel = c;
    const dc = this.getAttribute('disconnect-label');
    if (dc) this._disconnectLabel = dc;
    this._integrations = parseJsonAttr(this.getAttribute('integrations'), DEFAULT_INTEGRATIONS());
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'Integrations';
    if (name === 'description') this._description = newValue || '';
    if (name === 'connect-label') this._connectLabel = newValue || 'Connect';
    if (name === 'disconnect-label') this._disconnectLabel = newValue || 'Disconnect';
    if (name === 'integrations') this._integrations = parseJsonAttr(newValue, DEFAULT_INTEGRATIONS());
    this._render();
  }

  get integrations() { return this._integrations; }
  set integrations(value) { this._integrations = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const tab = event.target.closest('[data-integration-tab]');
    if (tab) {
      this._category = tab.getAttribute('data-integration-tab') || CATEGORY_ALL;
      this._render();
      return;
    }
    const action = event.target.closest('[data-integration-action]');
    if (action) {
      const integration = this._integrations.find((it) => it.id === action.getAttribute('data-integration-action'));
      if (!integration) return;
      integration.connected = !integration.connected;
      this.dispatchEvent(new CustomEvent('integration-toggle', {
        detail: { integration, connected: integration.connected },
        bubbles: true,
      }));
      this._render();
    }
  }

  _render() {
    const all = Array.isArray(this._integrations) ? this._integrations : [];
    const categories = [CATEGORY_ALL, ...new Set(all.map((it) => it.category).filter(Boolean))];
    const visible = this._category === CATEGORY_ALL ? all : all.filter((it) => it.category === this._category);

    const tabsHtml = categories
      .map((cat) => {
        const activeCls = cat === this._category
          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300'
          : 'border-zinc-200 text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200';
        return `<button type="button" data-integration-tab="${escapeAttribute(cat)}" class="rounded-full border px-3 py-1 text-xs font-medium transition-colors ${activeCls}">${escapeAttribute(cat)}</button>`;
      })
      .join('');

    const cardsHtml = visible
      .map((it) => {
        const badge = it.connected
          ? '<span data-integration-state="connected" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>Connected</span>'
          : '<span data-integration-state="not-connected" class="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Not connected</span>';
        const actionCls = it.connected
          ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
          : 'border-violet-300 bg-violet-600 text-white hover:bg-violet-500 dark:border-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500';
        const actionLabel = it.connected ? this._disconnectLabel : this._connectLabel;
        const initial = escapeAttribute((it.name || '?').slice(0, 1).toUpperCase());
        return `<div data-integration-card="${escapeAttribute(it.id)}" class="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div class="flex items-center gap-3">
            <span data-integration-logo="${escapeAttribute(it.name)}" aria-hidden="true" class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">${initial}</span>
            <div class="min-w-0">
              <p data-integration-name="${escapeAttribute(it.name)}" class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(it.name)}</p>
              <p data-integration-category="${escapeAttribute(it.category || '')}" class="text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(it.category || '')}</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            ${badge}
            <button type="button" data-integration-action="${escapeAttribute(it.id)}" class="rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${actionCls}">${escapeAttribute(actionLabel)}</button>
          </div>
        </div>`;
      })
      .join('');

    this.innerHTML = `
      <div data-integration-grid class="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-integration-header class="mb-4">
          <p data-integration-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <p data-integration-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._description)}</p>
          <div data-integration-tabs class="mt-3 flex flex-wrap gap-2">${tabsHtml}</div>
        </div>
        <div data-integration-cards class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${cardsHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('integration-connect-grid')) {
  customElements.define('integration-connect-grid', IntegrationConnectGridElement);
}

export default IntegrationConnectGridElement;
