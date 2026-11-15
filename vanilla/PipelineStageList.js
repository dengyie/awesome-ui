/**
 * PipelineStageList - Vanilla Web Component
 * Usage: <pipeline-stage-list></pipeline-stage-list>
 * Attributes: show-duration (true|false), collapsible (true|false), expanded (JSON array of group ids)
 * Properties: groups (Array<{id, title, currentStep?, stages: [{id, label, status, durationMs?}]}
 * Events: stage-click (detail {stage}), group-toggle (detail {id, open})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STAGE_STATUS = {
  pending: { text: 'Pending', tone: 'text-zinc-400' },
  running: { text: 'Running', tone: 'text-sky-600 dark:text-sky-400' },
  success: { text: 'Completed', tone: 'text-emerald-600 dark:text-emerald-400' },
  failed: { text: 'Failed', tone: 'text-rose-600 dark:text-rose-400' },
};

const durationLabel = (ms) => {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

export class PipelineStageListElement extends HTMLElement {
  static get observedAttributes() {
    return ['show-duration', 'collapsible', 'expanded'];
  }

  constructor() {
    super();
    this._groups = [];
    this._expanded = new Set();
    this._bound = false;
  }

  get groups() {
    return this._groups;
  }

  set groups(list) {
    this._groups = Array.isArray(list) ? list : [];
    this.render();
  }

  get expanded() {
    return [...this._expanded];
  }

  set expanded(ids) {
    this._expanded = new Set(Array.isArray(ids) ? ids : []);
    this.render();
  }

  connectedCallback() {
    if (!this._groups.length) {
      const raw = this.getAttribute('groups');
      if (raw) {
        try { this._groups = JSON.parse(raw); } catch { this._groups = []; }
      }
    }
    if (!this._expanded.size) {
      const raw = this.getAttribute('expanded');
      if (raw) {
        try { this._expanded = new Set(JSON.parse(raw)); } catch { this._expanded = new Set(); }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const header = event.target.closest('[data-pipeline-group-header]');
        if (header) {
          const groupEl = header.closest('[data-pipeline-group]');
          const id = groupEl?.getAttribute('data-pipeline-group');
          if (id && this.getAttribute('collapsible') !== 'false') {
            if (this._expanded.has(id)) this._expanded.delete(id);
            else this._expanded.add(id);
            this.dispatchEvent(new CustomEvent('group-toggle', { detail: { id, open: this._expanded.has(id) } }));
            this.render();
          }
          return;
        }
        const stage = event.target.closest('[data-pipeline-stage]');
        if (stage) {
          const groupEl = stage.closest('[data-pipeline-group]');
          const group = this._groups.find((item) => item.id === groupEl?.getAttribute('data-pipeline-group'));
          const stageData = group?.stages.find((item) => item.id === stage.getAttribute('data-pipeline-stage'));
          if (stageData) this.dispatchEvent(new CustomEvent('stage-click', { detail: { stage: stageData } }));
        }
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
    const showDuration = this.getAttribute('show-duration') !== 'false';
    const collapsible = this.getAttribute('collapsible') !== 'false';
    const groups = Array.isArray(this._groups) ? this._groups : [];

    this.innerHTML = `<div data-pipeline-list class="w-full divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      ${groups
        .map((group) => {
          const open = this._expanded.has(group.id);
          const running = (group.stages || []).some((stage) => stage.status === 'running');
          const totalMs = (group.stages || []).reduce((sum, stage) => sum + (stage.durationMs || 0), 0) || undefined;
          return `<div data-pipeline-group="${escapeAttribute(group.id)}">
            <button type="button" data-pipeline-group-header class="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60">
              ${
                running
                  ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 shrink-0 animate-spin text-sky-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>'
                  : '<span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-400"></span>'
              }
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(group.title)}</span>
                ${group.currentStep ? `<span class="block truncate text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(group.currentStep)}</span>` : ''}
              </span>
              ${showDuration ? `<span class="shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400">${durationLabel(totalMs)}</span>` : ''}
              ${collapsible ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-90' : ''}"><path d="m9 18 6-6-6-6" /></svg>` : ''}
            </button>
            ${
              open
                ? `<div class="mx-3 mb-3 rounded-md bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/60">
                    ${(group.stages || [])
                      .map((stage) => {
                        const tone = STAGE_STATUS[stage.status] || STAGE_STATUS.pending;
                        return `<button type="button" data-pipeline-stage="${escapeAttribute(stage.id)}" data-stage-status="${escapeAttribute(stage.status)}" class="flex w-full items-center justify-between gap-2 border-b border-zinc-200 py-2 text-left last:border-b-0 focus-visible:outline-none dark:border-zinc-700/60">
                          <span class="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(stage.label)}</span>
                          <span class="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                            ${showDuration && stage.durationMs != null ? `<span class="text-zinc-400">${durationLabel(stage.durationMs)}</span>` : ''}
                            <span class="${tone.tone}">${tone.text}</span>
                          </span>
                        </button>`;
                      })
                      .join('')}
                  </div>`
                : ''
            }
          </div>`;
        })
        .join('')}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('pipeline-stage-list')) {
  customElements.define('pipeline-stage-list', PipelineStageListElement);
}
export default PipelineStageListElement;
