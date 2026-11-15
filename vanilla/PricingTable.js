import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class PricingTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['plans'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get plans() {
    if (this._plans) return this._plans;
    try {
      return JSON.parse(this.getAttribute('plans') || '[]');
    } catch {
      return [];
    }
  }

  set plans(value) {
    this._plans = Array.isArray(value) ? value : [];
    this.render();
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    const plans = this.plans;
    this._applyHostClass('grid gap-6 md:grid-cols-3 items-start');

    this.innerHTML = plans
      .map((plan, index) => {
        const highlighted = !!plan.highlighted;
        const cardClass = highlighted
          ? 'border-indigo-600 bg-white dark:bg-zinc-900 ring-2 ring-indigo-600 shadow-sm'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm';
        const buttonClass = highlighted
          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
          : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800';
        const features = (plan.features || [])
          .map(
            (feature) => `
            <li class="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span class="mt-0.5 shrink-0 text-emerald-500">${uiIcon('check', { size: 14 })}</span>
              <span>${escapeAttribute(feature)}</span>
            </li>`
          )
          .join('');

        return `
          <div class="relative flex flex-col rounded-2xl border p-6 transition-shadow ${cardClass}">
            ${
              highlighted
                ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white">${escapeAttribute(plan.badge || 'Most popular')}</span>`
                : ''
            }
            <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(plan.name || '')}</div>
            ${
              plan.description
                ? `<div class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(plan.description)}</div>`
                : ''
            }
            <div class="mt-5 flex items-baseline gap-1">
              <span class="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(plan.price ?? '')}</span>
              <span class="text-xs text-zinc-400 dark:text-zinc-500">/${escapeAttribute(plan.period || 'mo')}</span>
            </div>
            <ul class="mt-5 space-y-2.5 flex-1">${features}</ul>
            <button type="button" data-index="${index}" class="plan-cta mt-6 w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${buttonClass}">
              ${escapeAttribute(plan.ctaText || 'Get started')}
            </button>
          </div>`;
      })
      .join('');

    this.querySelectorAll('.plan-cta').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.getAttribute('data-index'));
        const plan = plans[index];
        this.dispatchEvent(new CustomEvent('select', { detail: plan }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('pricing-table')) {
  customElements.define('pricing-table', PricingTableElement);
}
export default PricingTableElement;
