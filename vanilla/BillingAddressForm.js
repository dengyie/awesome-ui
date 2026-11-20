/**
 * BillingAddressForm - Vanilla Web Component
 * Billing address form: country select, address lines, optional rows with
 * "optional" tags, required-field validation, submit + saved feedback.
 *
 * Usage: <billing-address-form title="Billing details"></billing-address-form>
 * Properties: defaultValue ({country?,address1?,address2?,city?,state?,zip?}), countries, labels
 * Attributes: title, submit-label, show-optional ("false" hides optional rows)
 * Events: billing-address-submit (detail {address})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const DEFAULT_COUNTRIES = ['United States', 'Singapore', 'United Kingdom', 'Germany', 'Japan'];

export class BillingAddressFormElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'submit-label', 'show-optional'];
  }

  constructor() {
    super();
    this._defaultValue = {};
    this._countries = DEFAULT_COUNTRIES;
    this._labels = {};
    this._submitted = null;
    this._bound = false;
    this._values = { country: '', address1: '', address2: '', city: '', state: '', zip: '' };
  }

  get defaultValue() {
    return this._defaultValue;
  }

  set defaultValue(value) {
    this._defaultValue = value && typeof value === 'object' ? { ...value } : {};
    this._resetValues();
    this._skipPreserve = true;
    this.render();
  }

  get countries() {
    return this._countries;
  }

  set countries(value) {
    this._countries = Array.isArray(value) && value.length ? value.map(String) : DEFAULT_COUNTRIES;
    this.render();
  }

  get labels() {
    return this._labels;
  }

  set labels(value) {
    this._labels = value && typeof value === 'object' ? { ...value } : {};
    this.render();
  }

  _resetValues() {
    const d = this._defaultValue;
    this._values = {
      country: d.country || this._countries[0] || '',
      address1: d.address1 || '',
      address2: d.address2 || '',
      city: d.city || '',
      state: d.state || '',
      zip: d.zip || '',
    };
    this._submitted = null;
    this._skipPreserve = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'show-optional' && newValue === null) return;
    this.render();
  }

  connectedCallback() {
    this._resetValues();
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('input', (event) => {
        const input = event.target.closest('[data-billing-input]');
        if (!input) return;
        const key = input.getAttribute('data-billing-input');
        if (key in this._values) {
          this._values[key] = input.value;
        }
        this._refreshValidity();
      });
      this.addEventListener('change', (event) => {
        const select = event.target.closest('[data-billing-country]');
        if (!select) return;
        this._values.country = select.value;
      });
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-billing-address-submit]');
        if (!btn) return;
        if (btn.disabled) return;
        this._submit();
      });
    }
  }

  get _valid() {
    return (
      this._values.address1.trim() !== '' &&
      this._values.city.trim() !== '' &&
      this._values.zip.trim() !== ''
    );
  }

  _refreshValidity() {
    const btn = this.querySelector('[data-billing-address-submit]');
    if (btn) btn.disabled = !this._valid;
    const hint = this.querySelector('[data-billing-address-hint]');
    if (hint && this._valid) {
      hint.textContent = 'All required fields filled.';
      hint.setAttribute('data-billing-ready', '');
    } else if (hint) {
      hint.removeAttribute('data-billing-ready');
    }
  }

  _submit() {
    if (!this._valid) return;
    const v = this._values;
    const address = {
      country: v.country,
      address1: v.address1,
      address2: v.address2 || undefined,
      city: v.city,
      state: v.state || undefined,
      zip: v.zip,
    };
    this._submitted = address;
    this.render();
    this.dispatchEvent(new CustomEvent('billing-address-submit', { detail: { address: { ...address } } }));
  }

  render() {
    if (this._bound && !this._submitted && !this._skipPreserve) {
      // preserve live input state across re-renders
      const current = {};
      this.querySelectorAll('[data-billing-input]').forEach((el) => {
        const key = el.getAttribute('data-billing-input');
        current[key] = el.value;
      });
      Object.keys(current).forEach((key) => {
        if (current[key] !== undefined) this._values[key] = current[key];
      });
      const countryEl = this.querySelector('[data-billing-country]');
      if (countryEl) this._values.country = countryEl.value;
    }
    this._skipPreserve = false;
    const title = this.getAttribute('title') || 'Billing details';
    const submitLabel = this.getAttribute('submit-label') || 'Continue to next step';
    const showOptional = this.getAttribute('show-optional') !== 'false';
    const labels = this._labels;
    const v = this._values;

    const inputClass =
      'min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200';
    const labelClass = 'w-24 shrink-0 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400';

    const optionalTag = '<span class="text-[10px] text-zinc-400 dark:text-zinc-500">optional</span>';

    const options = this._countries
      .map((c) => `<option value="${escapeAttribute(c)}" ${c === v.country ? 'selected' : ''}>${escapeAttribute(c)}</option>`)
      .join('');

    const feedback = this._submitted
      ? `<span data-billing-address-saved class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Saved ${escapeAttribute(this._submitted.city)}, ${escapeAttribute(this._submitted.country)}</span>`
      : `<span data-billing-address-hint class="text-[11px] text-zinc-400 dark:text-zinc-500">Address, city and ZIP are required.</span>`;

    this.innerHTML = `
      <div data-billing-address-form class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p data-billing-address-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>

        <label data-billing-country-wrap class="mt-3 flex items-center gap-2">
          <span class="${labelClass}">Country</span>
          <select data-billing-country class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${options}</select>
        </label>

        <label data-billing-field-wrap class="mt-2 flex items-center gap-2">
          <span class="${labelClass}">${escapeAttribute(labels.address1 || 'Address line 1')}</span>
          <input data-billing-input="address1" data-billing-address1 value="${escapeAttribute(v.address1)}" placeholder="Street address" class="${inputClass}" />
        </label>

        ${showOptional ? `
        <label data-billing-field-wrap class="mt-2 flex items-center gap-2">
          <span class="${labelClass}">${escapeAttribute(labels.address2 || 'Address line 2')}</span>
          ${optionalTag}
          <input data-billing-input="address2" data-billing-address2 value="${escapeAttribute(v.address2)}" placeholder="Apt, suite, unit" class="${inputClass}" />
        </label>` : ''}

        <div class="mt-2 grid grid-cols-2 gap-2">
          <label data-billing-city-wrap class="flex items-center gap-2">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(labels.city || 'City')}</span>
            <input data-billing-input="city" data-billing-city value="${escapeAttribute(v.city)}" class="${inputClass}" />
          </label>
          <label data-billing-zip-wrap class="flex items-center gap-2">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(labels.zip || 'ZIP')}</span>
            <input data-billing-input="zip" data-billing-zip value="${escapeAttribute(v.zip)}" class="${inputClass}" />
          </label>
        </div>

        ${showOptional ? `
        <label data-billing-state-wrap class="mt-2 flex items-center gap-2">
          <span class="${labelClass}">${escapeAttribute(labels.state || 'State')}</span>
          ${optionalTag}
          <input data-billing-input="state" data-billing-state value="${escapeAttribute(v.state)}" class="${inputClass}" />
        </label>` : ''}

        <div class="mt-3 flex items-center justify-between">
          ${feedback}
          <button type="button" data-billing-address-submit ${this._valid ? '' : 'disabled'}
            class="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40">${escapeAttribute(submitLabel)}</button>
        </div>
      </div>`;
  }
}

export default BillingAddressFormElement;

if (!customElements.get('billing-address-form')) {
  customElements.define('billing-address-form', BillingAddressFormElement);
}
