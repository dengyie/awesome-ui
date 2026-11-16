/**
 * AuditLogTable - Audit log: filter bar, mini bar-chart trend, view
 * segmented switch and a four-column event table with status badges
 * (Okta System Log pattern).
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

const DEFAULT_TREND = () => [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 28 },
  { label: 'Wed', value: 19 },
  { label: 'Thu', value: 41 },
  { label: 'Fri', value: 33 },
  { label: 'Sat', value: 9 },
  { label: 'Sun', value: 5 },
];

const DEFAULT_EVENTS = () => [
  { id: 'e1', time: '2026-11-16 09:41:22', actor: 'admin@mango.dev', event: 'user.session.login', status: 'success', target: 'Web session (Chrome 141, macOS)' },
  { id: 'e2', time: '2026-11-16 09:38:04', actor: 'svc-deploy@github', event: 'app.oauth2.token.grant', status: 'success', target: 'deploy-bot client' },
  { id: 'e3', time: '2026-11-16 08:57:51', actor: 'unknown@203.0.113.7', event: 'user.session.login', status: 'failure', target: 'Sign-in attempt — invalid password' },
  { id: 'e4', time: '2026-11-16 08:12:10', actor: 'admin@mango.dev', event: 'group.membership.add', status: 'success', target: 'engineering → sso-everyone' },
  { id: 'e5', time: '2026-11-16 07:44:36', actor: 'audit-daemon', event: 'policy.rule.evaluate', status: 'pending', target: 'mfa-required rule (draft)' },
];

const STATUS_STYLES = {
  success: { label: 'SUCCESS', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  failure: { label: 'FAILURE', cls: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
  pending: { label: 'PENDING', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
};

class AuditLogTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'filters', 'trend', 'views', 'active-view', 'events'];
  }

  constructor() {
    super();
    this._bound = false;
    this._title = 'System Log';
    this._filters = [
      { label: 'Date range', value: 'Last 24 hours' },
      { label: 'Keyword', value: 'user.session' },
    ];
    this._trend = DEFAULT_TREND();
    this._views = ['Events', 'Raw export'];
    this._activeView = 'Events';
    this._events = DEFAULT_EVENTS();
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    this._filters = parseJsonAttr(this.getAttribute('filters'), this._filters);
    this._trend = parseJsonAttr(this.getAttribute('trend'), DEFAULT_TREND());
    this._views = parseJsonAttr(this.getAttribute('views'), this._views);
    const av = this.getAttribute('active-view');
    if (av) this._activeView = av;
    this._events = parseJsonAttr(this.getAttribute('events'), DEFAULT_EVENTS());
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'title') this._title = newValue || 'System Log';
    if (name === 'filters') this._filters = parseJsonAttr(newValue, this._filters);
    if (name === 'trend') this._trend = parseJsonAttr(newValue, DEFAULT_TREND());
    if (name === 'views') this._views = parseJsonAttr(newValue, this._views);
    if (name === 'active-view') this._activeView = newValue || 'Events';
    if (name === 'events') this._events = parseJsonAttr(newValue, DEFAULT_EVENTS());
    this._render();
  }

  get events() { return this._events; }
  set events(value) { this._events = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const viewEl = event.target.closest('[data-audit-view]');
    if (viewEl) {
      this._activeView = viewEl.getAttribute('data-audit-view');
      this._render();
      this.dispatchEvent(new CustomEvent('view-change', { detail: { view: this._activeView }, bubbles: true }));
      return;
    }
    const row = event.target.closest('[data-audit-row]');
    if (row) {
      const item = this._events.find((e) => e.id === row.getAttribute('data-audit-row'));
      if (item) this.dispatchEvent(new CustomEvent('event-click', { detail: { event: item }, bubbles: true }));
    }
  }

  _render() {
    const max = Math.max(...this._trend.map((t) => t.value), 1);
    const trendHtml = this._trend
      .map((t) => {
        const h = Math.round((t.value / max) * 36) + 4;
        return `<span data-audit-trend-bar="${escapeAttribute(t.label)}" class="flex w-4 flex-col items-center gap-0.5"><span class="w-full rounded-sm bg-zinc-200 dark:bg-zinc-700" style="height:${h}px"></span><span class="text-[9px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(t.label)}</span></span>`;
      })
      .join('');

    const viewsHtml = this._views
      .map((v) => {
        const active = v === this._activeView;
        return `<button type="button" data-audit-view="${escapeAttribute(v)}" aria-pressed="${active}" class="${active ? 'rounded bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'rounded px-2 py-0.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}">${escapeAttribute(v)}</button>`;
      })
      .join('');

    const filtersHtml = this._filters
      .map((f) => `<button type="button" data-audit-filter="${escapeAttribute(f.label)}" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"><span class="text-zinc-400" aria-hidden="true">◷</span><span class="font-medium">${escapeAttribute(f.label)}:</span> ${escapeAttribute(f.value)}<span class="text-zinc-400" aria-hidden="true">▾</span></button>`)
      .join('');

    const rowsHtml = this._events
      .map((e) => {
        const style = STATUS_STYLES[e.status] ?? STATUS_STYLES.pending;
        return `<tr data-audit-row="${escapeAttribute(e.id)}" tabindex="0" class="cursor-pointer border-b border-zinc-50 align-top transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td data-audit-row-time="${escapeAttribute(e.time)}" class="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(e.time)}</td>
          <td data-audit-row-actor="${escapeAttribute(e.actor)}" class="px-2 py-2.5 text-zinc-700 dark:text-zinc-200">${escapeAttribute(e.actor)}</td>
          <td data-audit-row-event="${escapeAttribute(e.event)}" class="px-2 py-2.5"><span class="font-mono text-zinc-800 dark:text-zinc-100">${escapeAttribute(e.event)}</span><span data-audit-row-status="${escapeAttribute(e.status)}" class="ml-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${style.cls}">${style.label}</span></td>
          <td data-audit-row-target="${escapeAttribute(e.target)}" class="max-w-[18rem] truncate px-4 py-2.5 text-zinc-500 dark:text-zinc-400" title="${escapeAttribute(e.target)}">${escapeAttribute(e.target)}</td>
        </tr>`;
      })
      .join('');

    this.innerHTML = `
      <div data-audit-log class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-audit-header class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p data-audit-title class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(this._title)}</p>
          <div data-audit-filters class="flex flex-wrap items-center gap-2">${filtersHtml}</div>
        </div>
        <div data-audit-overview class="flex flex-wrap items-end justify-between gap-4 px-4 py-3">
          <div data-audit-trend class="flex items-end gap-1.5" aria-hidden="true">${trendHtml}</div>
          <div class="flex items-center gap-3">
            <p data-audit-count class="text-sm text-zinc-500 dark:text-zinc-400"><span class="font-semibold text-zinc-900 dark:text-zinc-50">${this._events.length}</span> events</p>
            <div data-audit-views class="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">${viewsHtml}</div>
          </div>
        </div>
        <table data-audit-table class="w-full text-left text-xs">
          <thead>
            <tr class="border-y border-zinc-100 text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <th class="px-4 py-2 font-medium">Time</th>
              <th class="px-2 py-2 font-medium">Actor</th>
              <th class="px-2 py-2 font-medium">Event info</th>
              <th class="px-4 py-2 font-medium">Targets</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('audit-log-table')) {
  customElements.define('audit-log-table', AuditLogTableElement);
}

export default AuditLogTableElement;
