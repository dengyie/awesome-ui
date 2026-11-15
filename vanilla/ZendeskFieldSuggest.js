/**
 * ZendeskFieldSuggest - Zendesk AI ticket-field suggestion bar: recommended
 * field chips (type + confidence) that can be applied or dismissed.
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

class ZendeskFieldSuggestElement extends HTMLElement {
  static get observedAttributes() {
    return ['fields'];
  }

  constructor() {
    super();
    this._bound = false;
    this._fields = [];
  }

  connectedCallback() {
    if (!this._fields.length) {
      this._fields = parseJsonAttr(this.getAttribute('fields'), [
        { id: 'f1', label: 'Priority', value: 'Urgent', confidence: 0.94 },
        { id: 'f2', label: 'Type', value: 'Incident', confidence: 0.87 },
        { id: 'f3', label: 'Group', value: 'Payments', confidence: 0.72 },
      ]);
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
    if (name === 'fields' && !this._fields.length) {
      this._fields = parseJsonAttr(this.getAttribute('fields'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get fields() {
    return this._fields;
  }
  set fields(value) {
    this._fields = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const fieldEl = event.target.closest('[data-zendesk-suggest-field]');
    if (fieldEl) {
      const field = this._fields.find((f) => String(f.id) === fieldEl.getAttribute('data-zendesk-suggest-field'));
      if (field) {
        // applying a suggestion removes it from the bar
        this._fields = this._fields.filter((f) => f !== field);
        this._render();
        this.dispatchEvent(new CustomEvent('apply', { detail: { field }, bubbles: true }));
      }
      return;
    }
    if (event.target.closest('[data-zendesk-suggest-dismiss]')) {
      this._fields = [];
      this._render();
      this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
    }
  }

  _render() {
    const fieldsHtml = this._fields
      .map(
        (field) => `
        <button type="button" data-zendesk-suggest-field="${escapeAttribute(field.id)}" class="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-800 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-amber-900/40">
          <span class="text-zinc-500 dark:text-zinc-400">${escapeAttribute(field.label)}:</span>
          <span>${escapeAttribute(field.value)}</span>
          <span class="font-mono text-[9px] text-amber-600 dark:text-amber-400">${Math.round((field.confidence ?? 0) * 100)}%</span>
        </button>`
      )
      .join('');

    this.innerHTML = `
      <div data-zendesk-field-suggest class="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm dark:border-amber-800 dark:bg-amber-950/40">
        <p data-zendesk-suggest-label class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          <span aria-hidden="true">✦</span>
          Suggested fields
        </p>
        <div data-zendesk-suggest-fields class="mt-2 flex flex-wrap gap-1.5">${fieldsHtml}</div>
        <div class="mt-2.5 flex items-center justify-end gap-2">
          <button type="button" data-zendesk-suggest-dismiss class="rounded-md px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-amber-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-amber-900/40">Ignore</button>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('zendesk-field-suggest')) {
  customElements.define('zendesk-field-suggest', ZendeskFieldSuggestElement);
}

export default ZendeskFieldSuggestElement;
