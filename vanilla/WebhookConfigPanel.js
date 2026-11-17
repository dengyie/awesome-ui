/**
 * WebhookConfigPanel - Webhook endpoint management: header, endpoint rows
 * with active toggle / mono URL / event chips / last-delivery status badge
 * and a Test action, plus an events legend (webhook settings pattern).
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

const DEFAULT_ENDPOINTS = () => [
  { id: 'wh1', url: 'https://api.example.com/hooks/deploy', events: ['build.finished', 'deploy.failed'], lastStatus: 200, lastDelivery: '2 minutes ago', active: true },
  { id: 'wh2', url: 'https://hooks.slack.com/services/T00/B00/XYZ', events: ['alert.triggered'], lastStatus: 503, lastDelivery: '1 hour ago', active: true },
  { id: 'wh3', url: 'https://staging.example.com/hooks', events: ['build.finished'], lastStatus: 404, lastDelivery: '3 days ago', active: false },
];

const DEFAULT_EVENTS = () => ['build.finished', 'deploy.failed', 'alert.triggered'];

const DELIVERY_STYLES = {
  ok: { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  warn: { cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  fail: { cls: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
};

const deliveryStyle = (status) => {
  const code = Number.parseInt(String(status), 10);
  if (Number.isNaN(code)) return DELIVERY_STYLES.fail;
  if (code < 300) return DELIVERY_STYLES.ok;
  if (code < 500) return DELIVERY_STYLES.warn;
  return DELIVERY_STYLES.fail;
};

class WebhookConfigPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'endpoints', 'events', 'test-label', 'events-label'];
  }

  constructor() {
    super();
    this._title = 'Webhooks';
    this._description = 'Send real-time event notifications to your own services.';
    this._endpoints = DEFAULT_ENDPOINTS();
    this._events = DEFAULT_EVENTS();
    this._testLabel = 'Test';
    this._eventsLabel = 'Available events';
    this._onClick = this._onClick.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const d = this.getAttribute('description');
    if (d) this._description = d;
    const tl = this.getAttribute('test-label');
    if (tl) this._testLabel = tl;
    const el = this.getAttribute('events-label');
    if (el) this._eventsLabel = el;
    this._endpoints = parseJsonAttr(this.getAttribute('endpoints'), DEFAULT_ENDPOINTS());
    this._events = parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('change', this._onChange);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('change', this._onChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'title') this._title = newValue || 'Webhooks';
    if (name === 'description') this._description = newValue || '';
    if (name === 'test-label') this._testLabel = newValue || 'Test';
    if (name === 'events-label') this._eventsLabel = newValue || 'Available events';
    if (name === 'endpoints') this._endpoints = parseJsonAttr(newValue, DEFAULT_ENDPOINTS());
    if (name === 'events') this._events = parseJsonAttr(newValue, DEFAULT_EVENTS());
    this._render();
  }

  get endpoints() { return this._endpoints; }
  set endpoints(value) { this._endpoints = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const test = event.target.closest('[data-webhook-test]');
    if (test) {
      const endpoint = this._endpoints.find((ep) => ep.id === test.getAttribute('data-webhook-test'));
      if (endpoint) this.dispatchEvent(new CustomEvent('webhook-test', { detail: { endpoint }, bubbles: true }));
    }
  }

  _onChange(event) {
    const toggle = event.target.closest('input[data-webhook-toggle]');
    if (toggle) {
      const endpoint = this._endpoints.find((ep) => ep.id === toggle.getAttribute('data-webhook-toggle'));
      if (endpoint) {
        endpoint.active = toggle.checked;
        this.dispatchEvent(new CustomEvent('webhook-toggle', { detail: { endpoint, active: toggle.checked }, bubbles: true }));
      }
    }
  }

  _render() {
    const endpoints = Array.isArray(this._endpoints) ? this._endpoints : [];
    const rowsHtml = endpoints
      .map((ep) => {
        const style = deliveryStyle(ep.lastStatus);
        const chips = (Array.isArray(ep.events) ? ep.events : [])
          .map((ev) => `<span data-webhook-event="${escapeAttribute(ev)}" class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(ev)}</span>`)
          .join('');
        const rowCls = ep.active === false ? 'opacity-50' : '';
        return `<div data-webhook-endpoint="${escapeAttribute(ep.id)}" class="flex flex-wrap items-center gap-3 border-b border-zinc-50 px-5 py-4 last:border-b-0 dark:border-zinc-800/60 ${rowCls}">
          <label data-webhook-active-wrapper="${escapeAttribute(ep.id)}" class="flex cursor-pointer items-center">
            <input type="checkbox" data-webhook-toggle="${escapeAttribute(ep.id)}" ${ep.active === false ? '' : 'checked'} class="h-4 w-4 accent-violet-600" aria-label="Toggle endpoint" />
          </label>
          <div class="min-w-0 flex-1">
            <p data-webhook-url="${escapeAttribute(ep.url)}" class="truncate font-mono text-xs text-zinc-800 dark:text-zinc-100">${escapeAttribute(ep.url)}</p>
            <div data-webhook-events="${escapeAttribute(ep.id)}" class="mt-1.5 flex flex-wrap gap-1.5">${chips}</div>
          </div>
          <div class="flex items-center gap-3">
            <span data-webhook-delivery="${escapeAttribute(ep.id)}" class="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span class="inline-block rounded px-2 py-0.5 font-semibold ${style.cls}">${escapeAttribute(String(ep.lastStatus ?? '—'))}</span>
              ${escapeAttribute(ep.lastDelivery || '')}
            </span>
            <button type="button" data-webhook-test="${escapeAttribute(ep.id)}" class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(this._testLabel)}</button>
          </div>
        </div>`;
      })
      .join('');

    const legendHtml = (Array.isArray(this._events) ? this._events : [])
      .map((ev) => `<span class="rounded-md border border-dashed border-zinc-300 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">${escapeAttribute(ev)}</span>`)
      .join('');

    this.innerHTML = `
      <div data-webhook-panel class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-webhook-header class="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p data-webhook-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <p data-webhook-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._description)}</p>
        </div>
        <div data-webhook-list>${rowsHtml}</div>
        <div data-webhook-footer class="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p data-webhook-events-label class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${escapeAttribute(this._eventsLabel)}</p>
          <div data-webhook-events-legend class="flex flex-wrap gap-1.5">${legendHtml}</div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('webhook-config-panel')) {
  customElements.define('webhook-config-panel', WebhookConfigPanelElement);
}

export default WebhookConfigPanelElement;
