/**
 * UsageQuotaCard - Vanilla Web Component
 * Usage: <usage-quota label="Credits Remaining" used="120" total="500" unit="credits"></usage-quota>
 * Attributes: variant (card|banner), label, used, total, unit, summary, upgrade-line, cta-label, cta-tone (dark|primary)
 * Events: cta
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class UsageQuotaCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'label', 'used', 'total', 'unit', 'summary', 'upgrade-line', 'cta-label', 'cta-tone'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-quota-cta]')) this.dispatchEvent(new CustomEvent('cta'));
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    this._applyHostClass('block');
    const banner = this.getAttribute('variant') === 'banner';
    const label = this.getAttribute('label') || '';
    const used = Number(this.getAttribute('used')) || 0;
    const total = Number(this.getAttribute('total')) || 0;
    const unit = this.getAttribute('unit') || '';
    const summary = this.getAttribute('summary') || '';
    const upgradeLine = this.getAttribute('upgrade-line') || '';
    const ctaLabel = this.getAttribute('cta-label') || 'Upgrade';
    const darkTone = (this.getAttribute('cta-tone') || 'dark') !== 'primary';

    const valueLabel = `${used}${unit ? ` ${unit}` : ''}${total ? ` of ${total}${unit ? ` ${unit}` : ''}` : ''}`;
    const percent = total > 0 ? Math.round(((total - used) / total) * 100) : 0;
    const unitText = unit ? ` ${unit}` : '';

    if (banner) {
      this.innerHTML = `<div data-quota-banner class="flex w-full items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/40 dark:bg-emerald-950/40">
        <p class="min-w-0 text-xs text-emerald-900 dark:text-emerald-200">${escapeAttribute(summary)}</p>
        <button type="button" data-quota-cta class="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">${escapeAttribute(ctaLabel)}</button>
      </div>`;
      return;
    }

    this.innerHTML = `<div data-quota-card class="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
      ${label ? `<p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">${escapeAttribute(label)}</p>` : ''}
      <p class="mt-1 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">${escapeAttribute(summary || valueLabel)}</p>
      ${
        total
          ? `<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"><div class="h-full rounded-full bg-sky-500 transition-all" style="width: ${percent}%"></div></div>`
          : ''
      }
      ${upgradeLine ? `<p class="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(upgradeLine)}</p>` : ''}
      <button type="button" data-quota-cta class="mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        darkTone
          ? 'bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white'
          : 'bg-indigo-600 hover:bg-indigo-500'
      }">${escapeAttribute(ctaLabel)}</button>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('usage-quota')) {
  customElements.define('usage-quota', UsageQuotaCardElement);
}
export default UsageQuotaCardElement;
