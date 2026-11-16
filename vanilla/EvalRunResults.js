/**
 * EvalRunResults - Evaluation run results: pass-rate header with counters,
 * status filter chip and per-evaluator result sections with status pills,
 * reason/response excerpts and variable chips (Adaline Evals pattern).
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

const DEFAULT_SECTIONS = () => [
  {
    id: 'judge',
    name: 'summary_quality_judge',
    subtitle: 'AI-Powered / LLM as a Judge',
    icon: '⚖️',
    results: [
      {
        id: 'j1',
        status: 'passed',
        reason: 'The output provides a summary that captures the key points of the document and presents them in a clear structure.',
        response: 'Key Points: Product launched a pilot feature that enables users to customize dashboards. Insights: This initiative aims to enhance user engagement and satisfaction through personalization.',
        variables: [
          { name: 'EXPECTED_SUMMARY', value: 'Product laun…' },
          { name: 'CONTENT', value: 'Product laun…' },
          { name: 'CATEGORY', value: 'Product' },
        ],
      },
      {
        id: 'j2',
        status: 'passed',
        reason: 'The output summarizes the content well, preserving the key fact that employee satisfaction increased after the policy change.',
        response: 'Key Points: HR reported higher satisfaction among remote employees after implementing flexible working hours. Insights: Flexibility drives retention.',
        variables: [
          { name: 'EXPECTED_SUMMARY', value: 'HR report…' },
          { name: 'CONTENT', value: 'HR report…' },
          { name: 'CATEGORY', value: 'HR' },
        ],
      },
    ],
  },
  {
    id: 'cost',
    name: 'cost_efficiency_guard',
    subtitle: 'Performance / Cost',
    icon: '💰',
    results: [
      {
        id: 'c1',
        status: 'passed',
        reason: 'Response cost is $0.0003 which is less than the required value of $0.0100.',
        response: 'Key Points: A pilot feature has been launched that allows users to customize their dashboards in the product. Insights: Customization may improve engagement.',
        variables: [
          { name: 'COST', value: '$0.0003' },
          { name: 'BUDGET', value: '$0.0100' },
        ],
      },
    ],
  },
];

const STATUS_STYLES = {
  passed: { icon: '✓', label: 'Passed', cell: 'text-emerald-600 dark:text-emerald-400' },
  failed: { icon: '✕', label: 'Failed', cell: 'text-red-600 dark:text-red-400' },
  unknown: { icon: '⊘', label: 'Unknown', cell: 'text-amber-600 dark:text-amber-400' },
};

class EvalRunResultsElement extends HTMLElement {
  static get observedAttributes() {
    return ['sections', 'pass-rate', 'pass-label', 'counters', 'filter-label', 'filter-value'];
  }

  constructor() {
    super();
    this._bound = false;
    this._sections = [];
    this._passRate = '64.00%';
    this._passLabel = 'Passed';
    this._counters = { passed: 64, unknown: 0, failed: 36, total: 100 };
    this._filterLabel = 'has any of';
    this._filterValue = 'Passed';
  }

  connectedCallback() {
    if (!this._sections.length) this._sections = parseJsonAttr(this.getAttribute('sections'), DEFAULT_SECTIONS());
    const pr = this.getAttribute('pass-rate');
    if (pr) this._passRate = pr;
    const pl = this.getAttribute('pass-label');
    if (pl) this._passLabel = pl;
    const counters = parseJsonAttr(this.getAttribute('counters'), null);
    if (counters) this._counters = counters;
    const fl = this.getAttribute('filter-label');
    if (fl) this._filterLabel = fl;
    const fv = this.getAttribute('filter-value');
    if (fv) this._filterValue = fv;
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
    if (name === 'sections' && !this._sections.length) this._sections = parseJsonAttr(newValue, []);
    if (name === 'pass-rate') this._passRate = newValue || '64.00%';
    if (name === 'pass-label') this._passLabel = newValue || 'Passed';
    if (name === 'counters') this._counters = parseJsonAttr(newValue, { passed: 64, unknown: 0, failed: 36, total: 100 });
    if (name === 'filter-label') this._filterLabel = newValue || 'has any of';
    if (name === 'filter-value') this._filterValue = newValue || 'Passed';
    this._render();
  }

  get sections() { return this._sections; }
  set sections(value) { this._sections = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const rowEl = event.target.closest('[data-eval-row]');
    if (!rowEl) return;
    const sectionEl = rowEl.closest('[data-eval-section]');
    const section = this._sections.find((s) => s.id === sectionEl?.getAttribute('data-eval-section'));
    const result = section?.results.find((r) => r.id === rowEl.getAttribute('data-eval-row'));
    if (section && result) {
      this.dispatchEvent(new CustomEvent('result-click', { detail: { result, section }, bubbles: true }));
    }
  }

  _render() {
    const c = this._counters;
    const sectionsHtml = this._sections
      .map((section) => {
        const rowsHtml = section.results
          .map((result) => {
            const style = STATUS_STYLES[result.status] ?? STATUS_STYLES.unknown;
            const varsHtml = (result.variables ?? [])
              .map(
                (v) => `<span data-eval-var="${escapeAttribute(v.name)}" class="max-w-[13rem] truncate rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[9px] text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" title="${escapeAttribute(v.name)}: ${escapeAttribute(v.value)}">${escapeAttribute(v.name)}: ${escapeAttribute(v.value)}</span>`
              )
              .join('');
            return `
            <tr data-eval-row="${escapeAttribute(result.id)}" tabindex="0" class="cursor-pointer border-b border-zinc-50 align-top text-xs transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
              <td data-eval-row-status="${escapeAttribute(result.status)}" class="whitespace-nowrap px-4 py-2.5 font-medium ${style.cell}"><span class="mr-1 inline-flex" aria-hidden="true">${style.icon}</span>${style.label}</td>
              <td data-eval-row-reason class="max-w-[16rem] px-2 py-2.5 text-zinc-600 dark:text-zinc-300">${escapeAttribute(result.reason)}</td>
              <td data-eval-row-response class="max-w-[16rem] px-2 py-2.5 text-zinc-500 dark:text-zinc-400"><span class="line-clamp-2">${escapeAttribute(result.response)}</span></td>
              <td data-eval-row-variables class="px-4 py-2.5"><span class="flex max-w-[14rem] flex-wrap gap-1">${varsHtml}</span></td>
            </tr>`;
          })
          .join('');
        return `
        <div data-eval-section="${escapeAttribute(section.id)}" class="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
          <div data-eval-section-header class="flex items-center gap-2.5 px-4 py-3">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm dark:bg-zinc-800" aria-hidden="true">${escapeAttribute(section.icon ?? '⚖️')}</span>
            <span>
              <span data-eval-section-name class="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(section.name)}</span>
              <span data-eval-section-subtitle class="block text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(section.subtitle)}</span>
            </span>
          </div>
          <table data-eval-section-results class="w-full">
            <thead>
              <tr class="border-b border-zinc-100 text-left text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                <th class="px-4 py-2 font-medium">Status</th>
                <th class="px-2 py-2 font-medium">Reason</th>
                <th class="px-2 py-2 font-medium">Response</th>
                <th class="px-4 py-2 font-medium">Variables</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
      })
      .join('');

    this.innerHTML = `
      <div data-eval-run-results class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-eval-header class="flex flex-wrap items-end justify-between gap-3 px-4 pb-3 pt-4">
          <p data-eval-score class="text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">${escapeAttribute(this._passRate)} <span class="text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._passLabel)}</span></p>
          <div data-eval-counters class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
            <span data-eval-counter="passed" class="text-emerald-600 dark:text-emerald-400">✓ Passed ${c.passed}</span>
            <span data-eval-counter="unknown" class="text-amber-600 dark:text-amber-400">⊘ Unknown ${c.unknown}</span>
            <span data-eval-counter="failed" class="text-red-600 dark:text-red-400">✕ Failed ${c.failed}</span>
            <span data-eval-counter="total" class="text-zinc-400 dark:text-zinc-500">≡ Total ${c.total}</span>
          </div>
        </div>
        <div class="border-b border-zinc-100 px-4 pb-3 dark:border-zinc-800">
          <span data-eval-filter class="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            <span class="text-zinc-400" aria-hidden="true">⊙</span>
            <span class="font-medium">Status</span>
            <span class="text-zinc-400">${escapeAttribute(this._filterLabel)}</span>
            <span class="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <span class="text-emerald-600 dark:text-emerald-400" aria-hidden="true">✓</span> ${escapeAttribute(this._filterValue)}
              <span class="text-zinc-400" aria-hidden="true">✕</span>
            </span>
          </span>
        </div>
        ${sectionsHtml}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('eval-run-results')) {
  customElements.define('eval-run-results', EvalRunResultsElement);
}

export default EvalRunResultsElement;
