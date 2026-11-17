/**
 * CancelRetentionFlow - Plan-cancellation retention flow: step 1 pick a
 * reason from radio cards, step 2 shows a discounted keep-plan offer card
 * (or a bare confirmation when no offer is configured) with Keep plan as
 * the primary action and Confirm cancel as the destructive ghost action
 * (SaaS downgrade retention pattern).
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

const DEFAULT_REASONS = () => [
  { id: 'price', label: 'Too expensive' },
  { id: 'features', label: 'Missing features I need' },
  { id: 'switching', label: 'Switching to another tool' },
  { id: 'pause', label: 'Only needed it temporarily' },
];

const DEFAULT_OFFER = () => ({
  title: 'Before you go — 30% off for 3 months',
  description: 'Stay on your current plan at a reduced price. Your data and integrations stay untouched.',
  discountedPrice: '$34.30',
  originalPrice: '$49.00',
  periodLabel: '/ month',
});

class CancelRetentionFlowElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'step-label', 'reasons-label', 'reasons', 'offer', 'keep-label', 'confirm-label'];
  }

  constructor() {
    super();
    this._title = 'Cancel your plan';
    this._stepLabel = 'Step';
    this._reasonsLabel = 'Help us improve — why are you cancelling?';
    this._reasons = DEFAULT_REASONS();
    this._offer = DEFAULT_OFFER();
    this._keepLabel = 'Keep my plan';
    this._confirmLabel = 'Confirm cancellation';
    this._step = 1;
    this._reason = '';
    this._onClick = this._onClick.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const s = this.getAttribute('step-label');
    if (s) this._stepLabel = s;
    const r = this.getAttribute('reasons-label');
    if (r) this._reasonsLabel = r;
    const k = this.getAttribute('keep-label');
    if (k) this._keepLabel = k;
    const c = this.getAttribute('confirm-label');
    if (c) this._confirmLabel = c;
    this._reasons = parseJsonAttr(this.getAttribute('reasons'), DEFAULT_REASONS());
    this._offer = parseJsonAttr(this.getAttribute('offer'), DEFAULT_OFFER());
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
    if (name === 'title') this._title = newValue || 'Cancel your plan';
    if (name === 'step-label') this._stepLabel = newValue || 'Step';
    if (name === 'reasons-label') this._reasonsLabel = newValue || '';
    if (name === 'keep-label') this._keepLabel = newValue || 'Keep my plan';
    if (name === 'confirm-label') this._confirmLabel = newValue || 'Confirm cancellation';
    if (name === 'reasons') this._reasons = parseJsonAttr(newValue, DEFAULT_REASONS());
    if (name === 'offer') this._offer = parseJsonAttr(newValue, null);
    this._render();
  }

  get step() { return this._step; }
  set step(value) { this._step = value === 2 ? 2 : 1; this._render(); }

  _setStep(step) {
    this._step = step;
    this.dispatchEvent(new CustomEvent('step-change', { detail: { step }, bubbles: true }));
    this._render();
  }

  _onClick(event) {
    const next = event.target.closest('[data-cancel-next]');
    if (next) {
      if (this._reason) this._setStep(2);
      return;
    }
    if (event.target.closest('[data-cancel-back]')) {
      this._setStep(1);
      return;
    }
    if (event.target.closest('[data-cancel-keep]')) {
      this.dispatchEvent(new CustomEvent('keep', { bubbles: true }));
      return;
    }
    const confirm = event.target.closest('[data-cancel-confirm]');
    if (confirm) {
      this.dispatchEvent(new CustomEvent('confirm-cancel', { detail: { reason: this._reason }, bubbles: true }));
    }
  }

  _onChange(event) {
    const input = event.target.closest('input[data-cancel-reason]');
    if (input) {
      this._reason = input.value || '';
      const continueBtn = this.querySelector('[data-cancel-next]');
      if (continueBtn) continueBtn.disabled = !this._reason;
    }
  }

  _renderStep1() {
    const cardsHtml = (Array.isArray(this._reasons) ? this._reasons : [])
      .map((reason) => {
        const id = `reason-${escapeAttribute(reason.id)}`;
        return `<label data-cancel-reason-card="${escapeAttribute(reason.id)}" for="${id}" class="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition-colors hover:border-violet-300 hover:bg-violet-50/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-violet-700 dark:hover:bg-violet-950/30">
          <input type="radio" name="cancel-reason" data-cancel-reason="${escapeAttribute(reason.id)}" id="${id}" value="${escapeAttribute(reason.id)}" class="h-4 w-4 accent-violet-600" />
          <span>${escapeAttribute(reason.label)}</span>
        </label>`;
      })
      .join('');

    return `
      <div data-cancel-step1 class="space-y-3">
        <p data-cancel-reasons-label class="text-sm font-medium text-zinc-700 dark:text-zinc-200">${escapeAttribute(this._reasonsLabel)}</p>
        <div data-cancel-reasons class="grid gap-2">${cardsHtml}</div>
        <div class="flex justify-end pt-2">
          <button type="button" data-cancel-next disabled class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">Continue</button>
        </div>
      </div>`;
  }

  _renderStep2() {
    const offer = this._offer;
    const offerHtml = offer
      ? `<div data-cancel-offer class="rounded-xl border border-violet-200 bg-violet-50/70 p-5 dark:border-violet-800 dark:bg-violet-950/40">
          <p data-cancel-offer-title class="text-base font-semibold text-violet-900 dark:text-violet-200">${escapeAttribute(offer.title || '')}</p>
          <p data-cancel-offer-description class="mt-1 text-sm leading-5 text-violet-700 dark:text-violet-300">${escapeAttribute(offer.description || '')}</p>
          <p data-cancel-offer-price class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(offer.discountedPrice || '')}</span>
            <span class="text-sm text-zinc-400 line-through">${escapeAttribute(offer.originalPrice || '')}</span>
            <span class="text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(offer.periodLabel || '')}</span>
          </p>
        </div>`
      : '';

    return `
      <div data-cancel-step2 class="space-y-4">
        ${offerHtml}
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" data-cancel-back class="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Back</button>
          <button type="button" data-cancel-confirm class="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40">${escapeAttribute(this._confirmLabel)}</button>
          <button type="button" data-cancel-keep class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500">${escapeAttribute(this._keepLabel)}</button>
        </div>
      </div>`;
  }

  _render() {
    this.innerHTML = `
      <div data-cancel-flow class="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-cancel-header class="mb-4 flex items-center justify-between">
          <p data-cancel-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <span data-cancel-step-indicator class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(this._stepLabel)} ${this._step} / 2</span>
        </div>
        ${this._step === 2 ? this._renderStep2() : this._renderStep1()}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('cancel-retention-flow')) {
  customElements.define('cancel-retention-flow', CancelRetentionFlowElement);
}

export default CancelRetentionFlowElement;
