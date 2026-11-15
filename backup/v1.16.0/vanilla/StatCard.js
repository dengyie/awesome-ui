import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const sparkline = (data, positive) => {
  if (!Array.isArray(data) || data.length < 2) return '';
  const width = 96;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" class="h-7 w-24" fill="none" aria-hidden="true"><polyline points="${points}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="${positive ? 'stroke-emerald-500' : 'stroke-red-500'}"/></svg>`;
};

export class StatCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'value', 'delta', 'delta-label', 'trend', 'icon'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
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
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '';
    const deltaAttr = this.getAttribute('delta');
    const delta = deltaAttr === null || deltaAttr === '' ? undefined : Number(deltaAttr);
    const deltaLabel = this.getAttribute('delta-label') || '';
    const icon = this.getAttribute('icon') || '';
    let trend;
    try {
      trend = this.getAttribute('trend') ? JSON.parse(this.getAttribute('trend')) : undefined;
    } catch {
      trend = undefined;
    }

    const hasDelta = typeof delta === 'number' && !Number.isNaN(delta);
    const positive = (delta ?? 0) >= 0;

    this._applyHostClass('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4');

    this.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(label)}</span>
        ${icon ? `<span class="text-zinc-400 dark:text-zinc-500">${uiIcon(icon, { size: 16 })}</span>` : ''}
      </div>
      <div class="mt-2 flex items-end justify-between gap-3">
        <div>
          <div class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(value)}</div>
          ${
            hasDelta
              ? `<div class="mt-1 flex items-center gap-1">
                  <span class="${positive ? 'text-emerald-500' : 'text-red-500'}">${uiIcon(positive ? 'trending-up' : 'trending-down', { size: 13 })}</span>
                  <span class="text-[11px] font-medium ${positive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}">${positive ? '+' : ''}${delta}%</span>
                  ${deltaLabel ? `<span class="text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(deltaLabel)}</span>` : ''}
                </div>`
              : ''
          }
        </div>
        ${sparkline(trend, positive)}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('stat-card')) {
  customElements.define('stat-card', StatCardElement);
}
export default StatCardElement;
