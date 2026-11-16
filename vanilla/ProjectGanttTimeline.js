/**
 * ProjectGanttTimeline - Project gantt timeline: month tick header with
 * week sub-ticks and a Today pill, project rows with emoji/status/count
 * badges and horizontal duration bars spanning start..end month positions,
 * current-date marker line and a bottom scrollbar hint
 * (Linear projects timeline pattern).
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

const DEFAULT_MONTHS = () => [
  { label: 'AUG', weeks: 4 },
  { label: 'SEP', weeks: 5 },
  { label: 'OCT', weeks: 4 },
  { label: 'NOV', weeks: 4 },
  { label: 'DEC', weeks: 5 },
  { label: 'JAN 2026', weeks: 4 },
  { label: 'FEB', weeks: 4 },
  { label: 'MAR', weeks: 4 },
  { label: 'APR', weeks: 4 },
  { label: 'MAY', weeks: 5 },
  { label: 'JUN', weeks: 4 },
  { label: 'JUL', weeks: 4 },
];

const DEFAULT_PROJECTS = () => [
  { id: 'p1', emoji: '🎧', name: 'AI UX Research Assistant', status: 'Planning', points: 34, start: 8, end: 9.5, tone: 'violet' },
  { id: 'p2', emoji: '📊', name: 'User Insight & Behavior Analytics Dashboard', status: 'In Progress', points: 68, start: 8.5, end: 12, tone: 'sky' },
  { id: 'p3', emoji: '🧩', name: 'Design System Expansion', status: 'In Progress', points: 65, start: 6, end: 11, tone: 'sky' },
  { id: 'p4', emoji: '🚀', name: 'E-commerce Platform Launch', status: 'Review', points: 90, start: 4, end: 9, tone: 'emerald' },
];

const TONE_STYLES = {
  sky: 'bg-sky-200 dark:bg-sky-900/70',
  violet: 'bg-violet-200 dark:bg-violet-900/70',
  emerald: 'bg-emerald-200 dark:bg-emerald-900/70',
  amber: 'bg-amber-200 dark:bg-amber-900/70',
};

const STATUS_STYLES = {
  'In Progress': 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  Planning: 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
  Review: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  Done: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

class ProjectGanttTimelineElement extends HTMLElement {
  static get observedAttributes() {
    return ['months', 'projects', 'today-month', 'today-fraction'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
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
    this._render();
  }

  _onClick(event) {
    const row = event.target.closest('[data-gantt-project]');
    if (row) {
      const found = this._projects().find((p) => p.id === row.getAttribute('data-gantt-project'));
      if (found) this.dispatchEvent(new CustomEvent('project-click', { detail: { project: found }, bubbles: true }));
    }
  }

  _months() {
    return parseJsonAttr(this.getAttribute('months'), DEFAULT_MONTHS());
  }

  _projects() {
    return parseJsonAttr(this.getAttribute('projects'), DEFAULT_PROJECTS());
  }

  _render() {
    const months = this._months();
    const projects = this._projects();
    const todayMonth = Number(this.getAttribute('today-month') ?? 8);
    const todayFraction = Number(this.getAttribute('today-fraction') ?? 0.25);
    const totalWeeks = months.reduce((sum, m) => sum + m.weeks, 0) || 1;

    const offsets = [];
    let acc = 0;
    for (const m of months) {
      offsets.push(acc);
      acc += m.weeks;
    }
    const todayLeft = (((offsets[todayMonth] ?? 0) + (months[todayMonth]?.weeks ?? 1) * todayFraction) / totalWeeks) * 100;

    const headerHtml = months
      .map((m, i) => {
        const width = (m.weeks / totalWeeks) * 100;
        const ticks = Array.from({ length: m.weeks }, () => '<span class="h-1 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800"></span>').join('');
        return `<div class="shrink-0 border-r border-zinc-100 px-2 py-2 dark:border-zinc-800" style="width:${width}%">
            <p class="text-[11px] font-bold tracking-wide text-zinc-500 dark:text-zinc-400">${escapeAttribute(m.label)}</p>
            <div class="mt-1 flex gap-1">${ticks}</div>
          </div>`;
      })
      .join('');

    const rowsHtml = projects
      .map((project) => {
        const left = ((offsets[project.start] ?? 0) / totalWeeks) * 100;
        const span = Math.max(((project.end - project.start) / totalWeeks) * 100, 2);
        const barCls = TONE_STYLES[project.tone ?? 'sky'] ?? TONE_STYLES.sky;
        const statusCls = STATUS_STYLES[project.status] ?? STATUS_STYLES['In Progress'];
        return `<button data-gantt-project="${escapeAttribute(project.id)}" type="button" class="relative flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
            <div data-gantt-label class="w-64 shrink-0">
              <p class="flex items-center gap-2 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100"><span aria-hidden="true">${escapeAttribute(project.emoji)}</span><span class="truncate">${escapeAttribute(project.name)}</span></p>
              <p class="mt-1 flex items-center gap-2 text-[11px]">
                <span class="rounded px-1.5 py-0.5 font-medium ${statusCls}">${escapeAttribute(project.status)}</span>
                <span class="text-zinc-400 dark:text-zinc-500">· ${Number(project.points)} pts</span>
              </p>
            </div>
            <div data-gantt-bar class="relative h-9 flex-1">
              <div class="absolute top-1/2 h-6 -translate-y-1/2 rounded-lg ${barCls}" style="left:${left}%;width:${span}%"></div>
            </div>
          </button>`;
      })
      .join('');

    this.innerHTML = `
      <div data-gantt class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-gantt-header class="relative flex border-b border-zinc-100 dark:border-zinc-800">
          ${headerHtml}
          <span data-gantt-today-pill class="absolute -top-0.5 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white" style="left:calc(${todayLeft}% - 24px)">Today</span>
        </div>
        <div data-gantt-rows class="relative">
          <div data-gantt-today-line class="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-red-400/70" style="left:${todayLeft}%"></div>
          ${rowsHtml}
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('project-gantt-timeline')) {
  customElements.define('project-gantt-timeline', ProjectGanttTimelineElement);
}

export default ProjectGanttTimelineElement;
