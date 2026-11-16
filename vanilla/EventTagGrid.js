/**
 * EventTagGrid - Grouped key/value tag grid for a single event: tags are
 * grouped into columns and rendered as mono label/value rows with link
 * styling for searchable values (Sentry Tags pattern).
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

const DEFAULT_GROUPS = () => [
  {
    id: 'left',
    title: 'left',
    tags: [
      { key: 'browser', value: 'Chrome 141.0.0', link: true },
      { key: 'browser.name', value: 'Chrome' },
      { key: 'device', value: 'Mac', link: true },
      { key: 'device.family', value: 'Mac' },
      { key: 'environment', value: 'development', link: true },
      { key: 'handled', value: 'no' },
      { key: 'level', value: 'error' },
    ],
  },
  {
    id: 'right',
    title: 'right',
    tags: [
      { key: 'mechanism', value: 'auto.browser.global_handlers.onunhandledrejection' },
      { key: 'os', value: 'Mac OS X >=10.15.7', link: true },
      { key: 'os.name', value: 'Mac OS X' },
      { key: 'release', value: 'b95a49d8d5b3', link: true },
      { key: 'transaction', value: '/sentry-example-page', link: true },
      { key: 'turbopack', value: 'True' },
      { key: 'url', value: 'http://localhost:3000/sentry-example-page', link: true },
    ],
  },
];

class EventTagGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['groups', 'scopes', 'active-scope', 'title'];
  }

  constructor() {
    super();
    this._bound = false;
    this._groups = [];
    this._scopes = ['All', 'Custom', 'Application', 'Client', 'Other'];
    this._activeScope = 'All';
    this._title = 'Tags';
  }

  connectedCallback() {
    if (!this._groups.length) this._groups = parseJsonAttr(this.getAttribute('groups'), DEFAULT_GROUPS());
    const scopes = parseJsonAttr(this.getAttribute('scopes'), null);
    if (Array.isArray(scopes) && scopes.length) this._scopes = scopes;
    const as = this.getAttribute('active-scope');
    if (as) this._activeScope = as;
    const t = this.getAttribute('title');
    if (t) this._title = t;
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
    if (name === 'groups' && !this._groups.length) this._groups = parseJsonAttr(newValue, []);
    if (name === 'scopes') {
      const scopes = parseJsonAttr(newValue, null);
      if (Array.isArray(scopes) && scopes.length) this._scopes = scopes;
    }
    if (name === 'active-scope') this._activeScope = newValue || 'All';
    if (name === 'title') this._title = newValue || 'Tags';
    this._render();
  }

  get groups() { return this._groups; }
  set groups(value) { this._groups = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const scopeEl = event.target.closest('[data-tag-scope]');
    if (scopeEl) {
      this._activeScope = scopeEl.getAttribute('data-tag-scope');
      this._render();
      this.dispatchEvent(new CustomEvent('scope-change', { detail: { scope: this._activeScope }, bubbles: true }));
      return;
    }
    const valueEl = event.target.closest('[data-tag-value]');
    if (valueEl) {
      const groupEl = valueEl.closest('[data-tag-group]');
      const group = this._groups.find((g) => g.id === groupEl?.getAttribute('data-tag-group'));
      const tag = group?.tags.find((t) => t.value === valueEl.getAttribute('data-tag-value'));
      if (group && tag) {
        this.dispatchEvent(new CustomEvent('tag-click', { detail: { tag, group }, bubbles: true }));
      }
    }
  }

  _render() {
    const scopesHtml = this._scopes
      .map((scope) => {
        const active = scope === this._activeScope;
        return `<button type="button" data-tag-scope="${escapeAttribute(scope)}" aria-pressed="${active}" class="${active ? 'rounded bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'rounded px-2 py-0.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}">${escapeAttribute(scope)}</button>`;
      })
      .join('');

    const groupsHtml = this._groups
      .map((group) => {
        const rowsHtml = group.tags
          .map((tag) => {
            const valueClass = tag.link
              ? 'block max-w-full truncate rounded bg-zinc-50 px-1 py-0.5 text-left text-zinc-800 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800'
              : 'block max-w-full truncate rounded px-1 py-0.5 text-left text-zinc-800 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60';
            return `
            <div data-tag-row class="grid grid-cols-[9rem_1fr] items-baseline gap-2 text-xs">
              <dt data-tag-key class="truncate font-mono text-zinc-500 dark:text-zinc-400" title="${escapeAttribute(tag.key)}">${escapeAttribute(tag.key)}</dt>
              <dd class="min-w-0"><button type="button" data-tag-value="${escapeAttribute(tag.value)}" class="${valueClass}" title="${escapeAttribute(tag.value)}">${escapeAttribute(tag.value)}</button></dd>
            </div>`;
          })
          .join('');
        return `<dl data-tag-group="${escapeAttribute(group.id)}" class="flex flex-col gap-1.5">${rowsHtml}</dl>`;
      })
      .join('');

    this.innerHTML = `
      <div data-tag-grid class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-tag-grid-header class="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <p data-tag-grid-title class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(this._title)}</p>
          <div data-tag-grid-scopes class="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">${scopesHtml}</div>
        </div>
        <div data-tag-grid-body class="grid grid-cols-1 gap-x-6 px-4 py-3 md:grid-cols-2">${groupsHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('event-tag-grid')) {
  customElements.define('event-tag-grid', EventTagGridElement);
}

export default EventTagGridElement;
