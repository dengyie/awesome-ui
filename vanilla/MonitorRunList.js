/**
 * MonitorRunList - LLM monitor run history: filter + time-range pills over a
 * mini request histogram, then run rows with success icon, timestamp, name
 * and latency (Adaline Monitor pattern).
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

const DEFAULT_RUNS = () => [
  { id: 'r1', name: 'Product Performance Metrics', startedAt: 'Oct 14, 1:00 AM', latencyMs: 7000, ok: true },
  { id: 'r2', name: 'Q2 Financial Overview', startedAt: 'Oct 14, 12:59 AM', latencyMs: 6688, ok: true },
  { id: 'r3', name: 'Customer Retention Strategy', startedAt: 'Oct 14, 12:37 AM', latencyMs: 1819, ok: true },
  { id: 'r4', name: 'Employee Satisfaction Survey 2025', startedAt: 'Oct 13, 10:44 PM', latencyMs: 903, ok: true },
];

const DEFAULT_HISTOGRAM = () => [
  { label: '13:00', value: 40 }, { label: '15:00', value: 25 }, { label: '17:00', value: 55 },
  { label: '19:00', value: 30 }, { label: '21:00', value: 70 }, { label: '23:00', value: 45 },
  { label: '01:00', value: 60 }, { label: '03:00', value: 35 }, { label: '05:00', value: 80 },
  { label: '07:00', value: 50 }, { label: '09:00', value: 65 }, { label: '11:00', value: 20 },
];

const formatLatency = (ms) => {
  if (ms < 1000) return `${ms} ms`;
  const s = Math.floor(ms / 1000);
  const rem = ms % 1000;
  return rem === 0 ? `${s} s` : `${s} s ${rem} ms`;
};

class MonitorRunListElement extends HTMLElement {
  static get observedAttributes() {
    return ['runs', 'histogram', 'ranges', 'active-range'];
  }

  constructor() {
    super();
    this._bound = false;
    this._runs = [];
    this._histogram = [];
    this._ranges = [];
    this._activeRange = '24 hrs';
  }

  connectedCallback() {
    if (!this._runs.length) this._runs = parseJsonAttr(this.getAttribute('runs'), DEFAULT_RUNS());
    if (!this._histogram.length) this._histogram = parseJsonAttr(this.getAttribute('histogram'), DEFAULT_HISTOGRAM());
    if (!this._ranges.length) this._ranges = parseJsonAttr(this.getAttribute('ranges'), ['24 hrs', '7 days', '30 days', '6 months']);
    const ar = this.getAttribute('active-range');
    if (ar) this._activeRange = ar;
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
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'runs' && !this._runs.length) this._runs = parseJsonAttr(newValue, []);
    if (name === 'histogram' && !this._histogram.length) this._histogram = parseJsonAttr(newValue, []);
    if (name === 'ranges' && !this._ranges.length) this._ranges = parseJsonAttr(newValue, []);
    if (name === 'active-range') this._activeRange = newValue || '24 hrs';
    this._render();
  }

  get runs() { return this._runs; }
  set runs(value) { this._runs = Array.isArray(value) ? value : []; this._render(); }

  get histogram() { return this._histogram; }
  set histogram(value) { this._histogram = Array.isArray(value) ? value : []; this._render(); }

  get activeRange() { return this._activeRange; }
  set activeRange(value) { this._activeRange = String(value); this._render(); }

  _onClick(event) {
    const rangeEl = event.target.closest('[data-monitor-range]');
    if (rangeEl) {
      this._activeRange = rangeEl.getAttribute('data-monitor-range');
      this._render();
      this.dispatchEvent(new CustomEvent('range-change', { detail: { range: this._activeRange }, bubbles: true }));
      return;
    }
    const runEl = event.target.closest('[data-monitor-run]');
    if (runEl) {
      const run = this._runs.find((r) => r.id === runEl.getAttribute('data-monitor-run'));
      if (run) {
        this.dispatchEvent(new CustomEvent('run-click', { detail: { run }, bubbles: true }));
      }
    }
  }

  _render() {
    const max = Math.max(1, ...this._histogram.map((b) => b.value));
    const barsHtml = this._histogram
      .map(
        (bar) => `
        <div data-monitor-bar="${escapeAttribute(bar.label)}" class="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div class="w-full rounded-sm bg-emerald-600/85 transition-colors hover:bg-emerald-500" style="height:${Math.max(4, (bar.value / max) * 56)}px" title="${escapeAttribute(bar.label)} · ${bar.value}"></div>
          <span class="w-full truncate text-center text-[9px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(bar.label)}</span>
        </div>`
      )
      .join('');

    const rangesHtml = this._ranges
      .map((range) => {
        const active = range === this._activeRange;
        return `<button type="button" data-monitor-range="${escapeAttribute(range)}" aria-pressed="${active}" class="${active ? 'rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white' : 'rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}">${escapeAttribute(range)}</button>`;
      })
      .join('');

    const rowsHtml = this._runs
      .map(
        (run) => `
        <tr data-monitor-run="${escapeAttribute(run.id)}" tabindex="0" class="cursor-pointer border-b border-zinc-50 text-xs transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td data-monitor-run-time class="whitespace-nowrap px-4 py-2.5 text-zinc-400 dark:text-zinc-500"><span class="mr-1.5 inline-flex items-center" aria-hidden="true">${run.ok !== false ? '✅' : '⚠️'}</span>${escapeAttribute(run.startedAt)}</td>
          <td data-monitor-run-name class="max-w-0 truncate px-2 py-2.5 font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(run.name)}</td>
          <td data-monitor-run-latency class="whitespace-nowrap px-4 py-2.5 text-right text-zinc-500 dark:text-zinc-400">${escapeAttribute(formatLatency(run.latencyMs))}</td>
        </tr>`
      )
      .join('');

    this.innerHTML = `
      <div data-monitor-run-list class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-monitor-toolbar class="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <button type="button" data-monitor-filter class="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"><span aria-hidden="true">⏳</span> Filter</button>
          <div data-monitor-ranges class="inline-flex items-center gap-1">${rangesHtml}</div>
        </div>
        <div data-monitor-histogram class="flex h-20 items-end gap-1 border-b border-zinc-100 px-4 pt-3 dark:border-zinc-800">${barsHtml}</div>
        <table data-monitor-runs class="w-full">
          <thead>
            <tr class="border-b border-zinc-100 text-left text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <th class="px-4 py-2 font-medium">Started At</th>
              <th class="px-2 py-2 font-medium">Name</th>
              <th class="px-4 py-2 text-right font-medium">Latency</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('monitor-run-list')) {
  customElements.define('monitor-run-list', MonitorRunListElement);
}

export default MonitorRunListElement;
