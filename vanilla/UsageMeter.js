import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE = {
  ok: { bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  warning: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  danger: { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
};

export const usageTone = (used, limit) => {
  if (limit <= 0) return 'danger';
  const ratio = used / limit;
  if (ratio >= 0.9) return 'danger';
  if (ratio >= 0.7) return 'warning';
  return 'ok';
};

/**
 * UsageMeter - Vanilla Web Component
 * Usage: <usage-meter label="Context window" used="68500" limit="128000" unit="tokens"></usage-meter>
 * Attributes: label, used, limit, unit, show-legend
 */
export class UsageMeterElement extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'used', 'limit', 'unit', 'show-legend'];
  }

  get label() {
    return this.getAttribute('label') || '';
  }

  get used() {
    const value = Number(this.getAttribute('used'));
    return Number.isFinite(value) ? value : 0;
  }

  get limit() {
    const value = Number(this.getAttribute('limit'));
    return Number.isFinite(value) ? value : 0;
  }

  get unit() {
    return this.getAttribute('unit') || '';
  }

  get showLegend() {
    return this.getAttribute('show-legend') !== 'false';
  }

  connectedCallback() {
    this.render();
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
    const used = this.used;
    const limit = this.limit;
    const tone = usageTone(used, limit);
    const styles = TONE[tone];
    const ratio = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 1;
    const percent = Math.round(ratio * 100);
    const remaining = Math.max(0, limit - used);

    const legend =
      remaining > 0
        ? `<span class="inline-flex items-center gap-1">${uiIcon('clock', { size: 10 })} ${remaining.toLocaleString()} left</span>`
        : '<span class="font-semibold text-rose-500">Limit reached</span>';

    this.innerHTML = `<div class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-baseline justify-between gap-2">
        <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(this.label)}</p>
        <p class="text-xs font-bold tabular-nums ${styles.text}">${percent}%</p>
      </div>
      <div class="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div class="h-full rounded-full transition-[width] duration-500 ${styles.bar}" style="width:${ratio * 100}%"></div>
      </div>
      <div class="mt-1.5 flex items-center justify-between text-[10.5px] tabular-nums text-zinc-500 dark:text-zinc-400">
        <span>${used.toLocaleString()} / ${limit.toLocaleString()}${this.unit ? ` ${escapeAttribute(this.unit)}` : ''}</span>
        ${this.showLegend ? legend : ''}
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('usage-meter')) {
  customElements.define('usage-meter', UsageMeterElement);
}
export default UsageMeterElement;
