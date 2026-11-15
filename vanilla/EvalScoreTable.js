/**
 * EvalScoreTable - Vanilla Web Component
 * Usage: <eval-score-table title="Evaluation report" runs='[...]' criteria='[...]'></eval-score-table>
 * Attributes: title, runs (JSON: [{id,name,score,grader?,tone?}]),
 *             criteria (JSON: [{id,title,description}]), add-criteria ("true"|"false")
 * Events: run-select (detail {run}), add-criteria
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const parseJsonAttr = (raw, fallback) => {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

const toneClasses = (tone) => {
  switch (tone) {
    case 'warn':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    case 'fail':
      return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
    default:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
  }
};

const toneBar = (tone) =>
  tone === 'warn' ? 'bg-amber-500' : tone === 'fail' ? 'bg-red-500' : 'bg-emerald-500';

export class EvalScoreTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'runs', 'criteria', 'add-criteria'];
  }

  constructor() {
    super();
    this._bound = false;
    this._runs = [];
    this._criteria = [];
  }

  connectedCallback() {
    if (!this._runs.length) this._runs = parseJsonAttr(this.getAttribute('runs'), []);
    if (!this._criteria.length) this._criteria = parseJsonAttr(this.getAttribute('criteria'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-eval-add-criteria]')) {
          this.dispatchEvent(new CustomEvent('add-criteria'));
          return;
        }
        const row = event.target.closest('[data-eval-run]');
        if (row) {
          const run = this._runs.find((r) => r.id === row.getAttribute('data-eval-run'));
          if (run) this.dispatchEvent(new CustomEvent('run-select', { detail: { run } }));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'runs' && !this._runs.length) {
      this._runs = parseJsonAttr(this.getAttribute('runs'), []);
    }
    if (name === 'criteria' && !this._criteria.length) {
      this._criteria = parseJsonAttr(this.getAttribute('criteria'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get runs() { return this._runs; }
  set runs(v) {
    this._runs = Array.isArray(v) ? v.map((r) => ({ ...r })) : [];
    this.render();
  }

  get criteria() { return this._criteria; }
  set criteria(v) {
    this._criteria = Array.isArray(v) ? v.map((c) => ({ ...c })) : [];
    this.render();
  }

  render() {
    const runs = this._runs;
    const criteria = this._criteria;
    const title = escapeAttribute(this.getAttribute('title') || 'Evaluation report');
    const showAdd = (this.getAttribute('add-criteria') || 'false') === 'true';

    const runRows = runs.map((run) => `
      <tr data-eval-run="${escapeAttribute(run.id)}" class="cursor-pointer border-b border-zinc-50 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
        <td class="py-2 pr-3 font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(run.name)}</td>
        <td class="py-2 pr-3">
          <span class="flex items-center gap-2">
            <span data-eval-score class="rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums ${toneClasses(run.tone)}">${run.score}%</span>
            <span class="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <span data-eval-score-bar class="block h-full rounded-full ${toneBar(run.tone)}" style="width: ${Math.min(Math.max(run.score, 0), 100)}%;"></span>
            </span>
          </span>
        </td>
        <td class="py-2 text-zinc-500 dark:text-zinc-400">${escapeAttribute(run.grader ?? '—')}</td>
      </tr>`).join('');

    const criteriaCards = criteria.map((c) => `
      <div data-eval-criterion="${escapeAttribute(c.id)}" class="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
        <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(c.title)}</p>
        <p class="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(c.description)}</p>
      </div>`).join('');

    this.innerHTML = `<div data-eval-score-table class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${title}</span>
    <span class="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">${runs.length} runs</span>
  </div>
  <div class="px-4 py-3">
    <table data-eval-runs class="w-full text-left">
      <thead>
        <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <th class="py-1.5 pr-3 font-medium">Run</th>
          <th class="py-1.5 pr-3 font-medium">Score</th>
          <th class="py-1.5 font-medium">Grader</th>
        </tr>
      </thead>
      <tbody>${runRows}</tbody>
    </table>
    ${criteria.length > 0 ? `<div data-eval-criteria class="mt-4 grid gap-3 sm:grid-cols-2">${criteriaCards}</div>` : ''}
    ${showAdd ? `<button type="button" data-eval-add-criteria class="mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60">
      <span class="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-sm dark:bg-zinc-800">+</span>
      Add criteria
    </button>` : ''}
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('eval-score-table')) {
  customElements.define('eval-score-table', EvalScoreTableElement);
}

export default EvalScoreTableElement;
