/**
 * AddonPicker - Vanilla Web Component
 * Usage: <addon-picker options='[{"id":"doc","label":"Document signing","price:"+$600 / year"}]' selected-ids='["doc"]'></addon-picker>
 * Attributes: title, options (JSON [{id,label,price?,disabled?,contactInstead?}]), selected-ids (JSON string[]), total-label, total-text
 * Property: options, selectedIds
 * Events: change (detail.selectedIds)
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="none" width="12" height="12" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export class AddonPickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['options', 'selected-ids', 'title', 'total-text'];
  }

  constructor() {
    super();
    this._options = [];
    this._selectedIds = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._options.length) {
      const raw = this.getAttribute('options');
      if (raw) { try { this._options = JSON.parse(raw); } catch { this._options = []; } }
    }
    if (!this._selectedIds.length) {
      const raw = this.getAttribute('selected-ids');
      if (raw) { try { this._selectedIds = JSON.parse(raw); } catch { this._selectedIds = []; } }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const row = event.target.closest('[data-addon-row]');
        if (!row) return;
        const id = row.getAttribute('data-addon-row');
        const option = this._options.find((o) => String(o.id) === id);
        if (!option || option.disabled) return;
        this._selectedIds = this._selectedIds.includes(id)
          ? this._selectedIds.filter((x) => x !== id)
          : [...this._selectedIds, id];
        this.render();
        this.dispatchEvent(new CustomEvent('change', { detail: { selectedIds: [...this._selectedIds] } }));
      });
    }
  }

  get options() { return this._options; }
  set options(v) {
    this._options = Array.isArray(v) ? v : [];
    this.render();
  }

  get selectedIds() { return this._selectedIds; }
  set selectedIds(v) {
    this._selectedIds = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'options' && this.getAttribute(name)) {
      try { this._options = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    if (name === 'selected-ids' && this.getAttribute(name)) {
      try { this._selectedIds = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    if (this._options.length) this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Add-ons');
    const totalLabel = escapeAttribute(this.getAttribute('total-label') || 'Estimated total');
    const totalText = escapeAttribute(this.getAttribute('total-text') || '');

    const rows = this._options.map((option) => {
      const checked = this._selectedIds.includes(String(option.id));
      return `
      <div data-addon-row="${escapeAttribute(String(option.id))}" role="checkbox" aria-checked="${checked}" class="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${checked ? 'border-indigo-300 bg-indigo-50' : 'border-zinc-200 hover:border-zinc-300'} ${option.disabled ? 'cursor-not-allowed opacity-60' : ''}">
        <span class="flex items-center gap-3">
          <span data-addon-check class="flex h-5 w-5 items-center justify-center rounded border transition-colors ${checked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 bg-white text-transparent'}">${CHECK_SVG}</span>
          <span class="text-sm font-medium text-zinc-800">${escapeAttribute(option.label)}</span>
        </span>
        ${option.contactInstead ? `<a href="#" data-addon-contact class="text-xs font-semibold text-indigo-600 hover:underline">Let's talk</a>` : `<span data-addon-price class="text-xs text-zinc-500">${escapeAttribute(option.price || '')}</span>`}
      </div>`;
    }).join('');

    this.innerHTML = `<div data-addon-picker class="rounded-lg border border-zinc-200 bg-white p-4">
  <p class="text-sm font-semibold text-zinc-900">${title}</p>
  <div class="mt-3 space-y-2">${rows}
  </div>
  ${totalText ? `<div class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-sm">
    <span class="text-zinc-600">${totalLabel}</span>
    <span data-addon-total class="font-semibold text-zinc-900">${totalText}</span>
  </div>` : ''}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('addon-picker')) {
  customElements.define('addon-picker', AddonPickerElement);
}

export default AddonPickerElement;
