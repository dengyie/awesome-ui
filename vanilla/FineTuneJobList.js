/**
 * FineTuneJobList - Vanilla Web Component
 * Usage: <finetune-job-list title="Fine-tuning jobs" new-text="New fine-tune"></finetune-job-list>
 * Property: jobs ([{id, model, status: queued|training|completed|failed, progress?, cost?, eta?, baseModel?}])
 * Attributes: title, new-text
 * Events: new, cancel (detail {job})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class FineTuneJobListElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'new-text'];
  }

  constructor() {
    super();
    this._jobs = [];
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-finetune-new]')) {
          this.dispatchEvent(new CustomEvent('new'));
          return;
        }
        const cancelBtn = event.target.closest('[data-finetune-cancel]');
        if (cancelBtn) {
          const card = cancelBtn.closest('[data-finetune-job]');
          const job = this._jobs.find((j) => j.id === card?.getAttribute('data-finetune-job'));
          if (job) this.dispatchEvent(new CustomEvent('cancel', { detail: { job } }));
        }
      });
    }
  }

  get jobs() { return this._jobs; }
  set jobs(v) {
    this._jobs = Array.isArray(v) ? v.map((j) => ({ ...j })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before jobs are captured.
    if (this._jobs.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Fine-tuning jobs');
    const newText = escapeAttribute(this.getAttribute('new-text') || 'New fine-tune');
    const STATUS_STYLE = {
      queued: { chip: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300', label: 'Queued' },
      training: { chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300', label: 'Training' },
      completed: { chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', label: 'Completed' },
      failed: { chip: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300', label: 'Failed' },
    };

    const rows = this._jobs.map((job) => {
      const style = STATUS_STYLE[job.status] || STATUS_STYLE.queued;
      const active = job.status === 'queued' || job.status === 'training';
      const meta = job.cost || job.eta
        ? `<p class="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">${job.cost ? `<span data-finetune-cost>${escapeAttribute(job.cost)}</span>` : ''}${job.cost && job.eta ? '<span aria-hidden="true">·</span>' : ''}${job.eta ? `<span data-finetune-eta>ETA ${escapeAttribute(job.eta)}</span>` : ''}</p>`
        : '';
      const progress = job.status === 'training'
        ? `<div class="mt-2 flex items-center gap-2">
            <div data-finetune-progress class="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div class="h-full rounded-full bg-indigo-600 transition-all" style="width:${job.progress ?? 0}%"></div></div>
            <span class="w-8 text-right font-mono text-[10px] text-zinc-500 dark:text-zinc-400">${job.progress ?? 0}%</span>
          </div>`
        : '';
      const cancel = active
        ? `<div class="mt-2 flex justify-end"><button type="button" data-finetune-cancel class="text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400">Cancel job</button></div>`
        : '';
      return `
        <div data-finetune-job="${escapeAttribute(job.id)}" class="rounded-lg border border-zinc-200 px-3 py-2.5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
          <div class="flex items-center justify-between gap-2">
            <p class="flex min-w-0 items-center gap-2">
              <code data-finetune-model class="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(job.model)}</code>
              ${job.baseModel ? `<span class="truncate text-[11px] text-zinc-400 dark:text-zinc-500">from ${escapeAttribute(job.baseModel)}</span>` : ''}
            </p>
            <span data-finetune-status="${escapeAttribute(job.status)}" class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.chip}">${style.label}</span>
          </div>
          ${meta}${progress}${cancel}
        </div>`;
    }).join('');

    this.innerHTML = `<div data-finetune-list class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
    <button type="button" data-finetune-new class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">${newText}</button>
  </div>
  <div class="mt-3 space-y-2">${rows}
    ${this._jobs.length === 0 ? '<div data-finetune-empty class="rounded-lg border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">No fine-tuning jobs yet.</div>' : ''}
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('finetune-job-list')) {
  customElements.define('finetune-job-list', FineTuneJobListElement);
}

export default FineTuneJobListElement;
