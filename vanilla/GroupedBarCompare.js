/**
 * GroupedBarCompare - Vanilla Web Component
 * Usage: <grouped-bar-compare title="Estimated vs actual" legend-estimated="Estimated" legend-actual="Actual" unit="h"> with `rows` property
 * Attributes: title, legend-estimated, legend-actual, unit
 * Properties: rows ({ name, estimated, actual, unit? }[])
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class GroupedBarCompareElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'legend-estimated', 'legend-actual', 'unit'];
  }

  constructor() {
    super();
    this._rows = [];
  }

  get rows() {
    return this._rows;
  }

  set rows(value) {
    this._rows = Array.isArray(value) ? value : [];
    this.render();
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
    const title = this.getAttribute('title') || 'Estimated vs actual';
    const legendEstimated = this.getAttribute('legend-estimated') || 'Estimated';
    const legendActual = this.getAttribute('legend-actual') || 'Actual';
    const unit = this.getAttribute('unit') || 'h';
    const rows = this._rows;
    const max = Math.max(...rows.flatMap((row) => [row.estimated, row.actual]), 0.0001);
    const heightOf = (value) => Math.max(4, Math.round((value / max) * 100));

    this.innerHTML = `<div data-grouped-bar-compare role="table" class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(title)}</p>
        <div class="flex items-center gap-3 text-[10px] text-zinc-400">
          <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-violet-400"></span>${escapeAttribute(legendEstimated)}</span>
          <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-lime-400"></span>${escapeAttribute(legendActual)}</span>
        </div>
      </div>
      <div class="mt-4 flex items-end justify-between gap-3" aria-label="Grouped bar chart">
        ${rows
          .map((row, index) => {
            const estimatedHeight = heightOf(row.estimated);
            const actualHeight = heightOf(row.actual);
            return `<div data-bar-row="${index}" role="row" class="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div class="flex h-28 w-full items-end justify-center gap-1">
                <div class="flex h-full w-1/3 flex-col items-center justify-end">
                  <span class="mb-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">${escapeAttribute(row.estimated)}${escapeAttribute(row.unit ?? unit)}</span>
                  <div class="w-full rounded-t-md bg-violet-400 transition-all duration-300" style="height:${estimatedHeight}%" title="${escapeAttribute(legendEstimated)}: ${escapeAttribute(row.estimated + (row.unit ?? unit))}"></div>
                </div>
                <div class="flex h-full w-1/3 flex-col items-center justify-end">
                  <span class="mb-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">${escapeAttribute(row.actual)}${escapeAttribute(row.unit ?? unit)}</span>
                  <div class="w-full rounded-t-md bg-lime-400 transition-all duration-300" style="height:${actualHeight}%" title="${escapeAttribute(legendActual)}: ${escapeAttribute(row.actual + (row.unit ?? unit))}"></div>
                </div>
              </div>
              <span class="w-full truncate text-center text-[10px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(row.name)}</span>
            </div>`;
          })
          .join('')}
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('grouped-bar-compare')) {
  customElements.define('grouped-bar-compare', GroupedBarCompareElement);
}
export default GroupedBarCompareElement;
