/**
 * TargetGauge - Vanilla Web Component
 * Usage: <target-gauge value="600" target="700" label="Quarterly revenue" value-prefix="$" value-suffix="k" remaining-label="…">
 * Attributes: value, target, label, value-prefix, value-suffix, remaining-label
 * Zones default to rose (0-60) / amber (60-85) / emerald (85-100); set the `zones` property to override.
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const ZONE_COLOR = {
  rose: 'bg-rose-500',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-500',
};

const clamp01 = (value) => Math.min(100, Math.max(0, value));

export class TargetGaugeElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'target', 'label', 'value-prefix', 'value-suffix', 'remaining-label'];
  }

  constructor() {
    super();
    this._zones = [
      { from: 0, tone: 'rose' },
      { from: 60, tone: 'amber' },
      { from: 85, tone: 'emerald' },
    ];
  }

  get zones() {
    return this._zones;
  }

  set zones(value) {
    this._zones = Array.isArray(value) && value.length ? value : this._zones;
    this.render();
  }

  get value() {
    return Number(this.getAttribute('value')) || 0;
  }

  set value(raw) {
    this.setAttribute('value', String(raw));
  }

  get target() {
    return Number(this.getAttribute('target')) || 0;
  }

  set target(raw) {
    this.setAttribute('target', String(raw));
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
    const value = this.value;
    const target = this.target;
    const label = this.getAttribute('label') || 'Progress';
    const valuePrefix = this.getAttribute('value-prefix') || '';
    const valueSuffix = this.getAttribute('value-suffix') || '';
    const remainingLabel = this.getAttribute('remaining-label') || '';
    const percent = target > 0 ? (value / target) * 100 : 0;
    const angle = (clamp01(percent) / 100) * 180 - 90;
    const remaining = Math.max(0, target - value);
    const sorted = [...this._zones].sort((a, b) => a.from - b.from);
    const segments = sorted.map((zone, index) => {
      const end = index + 1 < sorted.length ? sorted[index + 1].from : 100;
      return { ...zone, width: Math.max(0, end - zone.from) };
    });
    const currentTone = [...segments].reverse().find((zone) => clamp01(percent) >= zone.from)?.tone || 'rose';

    this.innerHTML = `<div data-target-gauge role="img" aria-label="${escapeAttribute(label)}: ${escapeAttribute(valuePrefix + value + valueSuffix)} of ${escapeAttribute(valuePrefix + target + valueSuffix)}" class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">${escapeAttribute(label)}</p>
      <div class="relative mx-auto mt-3 h-[70px] w-[140px] overflow-hidden">
        <div class="absolute inset-x-0 top-0 flex h-[70px] w-[140px] overflow-hidden rounded-t-full">
          ${segments.map((zone) => `<span class="h-full ${ZONE_COLOR[zone.tone]}" style="width:${zone.width}%"></span>`).join('')}
        </div>
        <div class="absolute left-1/2 top-[18px] h-[52px] w-[104px] -translate-x-1/2 rounded-t-full bg-white dark:bg-zinc-900"></div>
        <div data-gauge-needle class="absolute bottom-0 left-1/2 h-[54px] w-0.5 origin-bottom bg-zinc-900 dark:bg-zinc-100" style="transform:rotate(${angle}deg)">
          <span class="absolute -top-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-100"></span>
        </div>
        <div class="absolute bottom-[-4px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 dark:border-zinc-900 dark:bg-zinc-100"></div>
      </div>
      <div class="mt-1 flex items-center justify-between text-[10px] font-medium text-zinc-400">
        <span>${escapeAttribute(valuePrefix)}0${escapeAttribute(valueSuffix)}</span>
        <span data-gauge-value class="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${ZONE_COLOR[currentTone]}">${escapeAttribute(valuePrefix + value + valueSuffix)}</span>
        <span>${escapeAttribute(valuePrefix + target + valueSuffix)}</span>
      </div>
      ${
        remainingLabel
          ? `<p class="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">${remaining > 0 ? `Remaining: ${escapeAttribute(valuePrefix + remaining + valueSuffix)} — ` : ''}${escapeAttribute(remainingLabel)}</p>`
          : ''
      }
      <span class="hidden" data-gauge-percent>${Math.round(percent)}%</span>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('target-gauge')) {
  customElements.define('target-gauge', TargetGaugeElement);
}
export default TargetGaugeElement;
