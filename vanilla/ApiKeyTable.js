/**
 * ApiKeyTable - OpenAI Platform "API keys" management table: rows with name,
 * masked key preview, created date and status badge, plus per-row Copy /
 * Revoke actions and a Create key CTA.
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

class ApiKeyTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'keys', 'create-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._keys = [];
  }

  connectedCallback() {
    if (!this._keys.length) {
      this._keys = parseJsonAttr(this.getAttribute('keys'), []);
    }
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
    if (name === 'keys' && !this._keys.length) {
      this._keys = parseJsonAttr(this.getAttribute('keys'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'API keys';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get createLabel() {
    return this.getAttribute('create-label') ?? 'Create new secret key';
  }
  set createLabel(value) {
    this.setAttribute('create-label', value);
  }

  get keys() {
    return this._keys;
  }
  set keys(value) {
    this._keys = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const rowEl = event.target.closest('[data-api-key-row]');
    if (!rowEl) return;
    const row = this._keys.find((k) => String(k.id) === rowEl.getAttribute('data-api-key-row'));
    if (!row) return;
    if (event.target.closest('[data-api-key-copy]')) {
      this.dispatchEvent(new CustomEvent('copy', { detail: { row }, bubbles: true }));
    } else if (event.target.closest('[data-api-key-revoke]')) {
      this.dispatchEvent(new CustomEvent('revoke', { detail: { row }, bubbles: true }));
    }
  }

  _render() {
    const keys = this._keys;
    const active = keys.filter((k) => k.status !== 'revoked').length;
    const rows = keys.length
      ? keys
          .map((k) => {
            const revoked = k.status === 'revoked';
            const statusClass = revoked
              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
            const meta = k.created ? `${k.preview} · created ${k.created}` : k.preview;
            const actions = revoked
              ? ''
              : `
            <div class="flex shrink-0 items-center gap-1.5">
              <button type="button" data-api-key-copy class="rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Copy</button>
              <button type="button" data-api-key-revoke class="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40">Revoke</button>
            </div>`;
            return `
          <div data-api-key-row="${escapeAttribute(k.id)}" class="flex items-center gap-3 px-4 py-2.5">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p data-api-key-name class="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(k.name)}</p>
                <span data-api-key-status class="rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusClass}">${revoked ? 'Revoked' : 'Active'}</span>
              </div>
              <p data-api-key-preview class="mt-0.5 truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(meta)}</p>
            </div>
            ${actions}
          </div>`;
          })
          .join('')
      : `<p data-api-key-empty class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No API keys yet.</p>`;

    this.innerHTML = `
      <div data-api-key-table class="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)} <span data-api-key-count class="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${active} active</span></h4>
          <button type="button" data-api-key-create class="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500">+ ${escapeAttribute(this.createLabel)}</button>
        </div>
        <div data-api-key-list class="divide-y divide-zinc-100 dark:divide-zinc-800">${rows}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('api-key-table')) {
  customElements.define('api-key-table', ApiKeyTableElement);
}

export default ApiKeyTableElement;
