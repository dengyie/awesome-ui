/**
 * AgentSessionTimeline - Agent browser-session timeline: summary header with
 * status/duration/steps chips, a segmented activity strip, a step list with
 * Reason/Tool badges and a request panel (Browserbase session pattern).
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

const KIND_STYLES = {
  prompt: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  reason: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  tool: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
};

const STRIP_COLORS = {
  prompt: 'bg-emerald-400 dark:bg-emerald-500',
  reason: 'bg-sky-400 dark:bg-sky-500',
  tool: 'bg-orange-400 dark:bg-orange-500',
};

const DEFAULT_STEPS = () => [
  { id: 's1', kind: 'prompt', label: 'Summarize the top 5 trending tech articles', at: '0:00' },
  { id: 's2', kind: 'reason', label: 'Plan fetch strategy', at: '0:03' },
  { id: 's3', kind: 'tool', label: 'HTTP probe', at: '0:03' },
  { id: 's4', kind: 'tool', label: 'Fetch API', at: '0:14' },
  { id: 's5', kind: 'reason', label: 'Need to actually fetch the pages', at: '0:14' },
  { id: 's6', kind: 'tool', label: 'Search HTML', at: '0:26' },
  { id: 's7', kind: 'tool', label: 'Run code', at: '0:31' },
];

const DEFAULT_REQUESTS = () => [
  { id: 'q1', url: 'techcrunch.com', method: 'HTTP probe', status: 'HTTP 200', duration: '0:03', ok: true },
  { id: 'q2', url: 'techcrunch.com/2026/08/02/sam-altman-an…', method: 'Fetch API', status: 'HTTP 200', duration: '0:50', ok: true },
  { id: 'q3', url: 'techcrunch.com/2026/08/01/inside-one-lond…', method: 'Fetch API', status: 'HTTP 200', duration: '0:50', ok: true },
  { id: 'q4', url: 'techcrunch.com/2026/08/02/the-global-me…', method: 'Fetch API', status: 'HTTP 429', duration: '0:50', ok: false },
];

class AgentSessionTimelineElement extends HTMLElement {
  static get observedAttributes() {
    return ['steps', 'requests', 'title', 'status', 'duration', 'steps-count'];
  }

  constructor() {
    super();
    this._bound = false;
    this._steps = [];
    this._requests = [];
    this._title = 'Go to techcrunch.com and summarize the top 5 trending tech articles';
    this._status = 'Complete';
    this._duration = '1m 11s';
    this._stepsCount = 11;
  }

  connectedCallback() {
    if (!this._steps.length) this._steps = parseJsonAttr(this.getAttribute('steps'), DEFAULT_STEPS());
    if (!this._requests.length) this._requests = parseJsonAttr(this.getAttribute('requests'), DEFAULT_REQUESTS());
    this._title = this.getAttribute('title') || this._title;
    this._status = this.getAttribute('status') || this._status;
    this._duration = this.getAttribute('duration') || this._duration;
    const sc = this.getAttribute('steps-count');
    if (sc) this._stepsCount = Number(sc) || this._stepsCount;
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
    if (name === 'steps' && !this._steps.length) this._steps = parseJsonAttr(newValue, []);
    if (name === 'requests' && !this._requests.length) this._requests = parseJsonAttr(newValue, []);
    if (name === 'title') this._title = newValue || '';
    if (name === 'status') this._status = newValue || '';
    if (name === 'duration') this._duration = newValue || '';
    if (name === 'steps-count') this._stepsCount = Number(newValue) || 0;
    this._render();
  }

  get steps() { return this._steps; }
  set steps(value) { this._steps = Array.isArray(value) ? value : []; this._render(); }

  get requests() { return this._requests; }
  set requests(value) { this._requests = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const stepEl = event.target.closest('[data-agent-step]');
    if (stepEl) {
      const step = this._steps.find((s) => s.id === stepEl.getAttribute('data-agent-step'));
      if (step) {
        this.dispatchEvent(new CustomEvent('step-click', { detail: { step }, bubbles: true }));
      }
    }
  }

  _render() {
    const stripHtml = this._steps
      .slice(0, 24)
      .map(
        (s) =>
          `<span title="${escapeAttribute(s.kind)} · ${escapeAttribute(s.label)}" class="flex-1 rounded-sm ${STRIP_COLORS[s.kind] || STRIP_COLORS.tool}"></span>`
      )
      .join('');

    const stepsHtml = this._steps
      .map(
        (step) => `
        <li>
          <button type="button" data-agent-step="${escapeAttribute(step.id)}" class="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
            <span data-agent-step-badge="${escapeAttribute(step.kind)}" class="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${KIND_STYLES[step.kind] || KIND_STYLES.tool}">${escapeAttribute(step.kind)}</span>
            <span data-agent-step-label class="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">${escapeAttribute(step.label)}</span>
            <span data-agent-step-at class="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(step.at)}</span>
          </button>
        </li>`
      )
      .join('');

    const requestsHtml = this._requests
      .map(
        (req) => `
        <div data-agent-request="${escapeAttribute(req.id)}" class="flex items-center gap-2 px-4 py-2">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" aria-hidden="true">⌾</span>
          <span class="min-w-0 flex-1">
            <span data-agent-request-url class="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(req.url)}</span>
            <span data-agent-request-status class="block truncate text-[10px] ${(req.ok ?? true) ? 'text-zinc-400 dark:text-zinc-500' : 'text-red-500 dark:text-red-400'}">${escapeAttribute(req.status)}${req.method ? ' · ' + escapeAttribute(req.method) : ''}</span>
          </span>
          <span data-agent-request-duration class="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(req.duration)}</span>
        </div>`
      )
      .join('');

    this.innerHTML = `
      <div data-agent-session-timeline class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-agent-session-header class="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p data-agent-session-title class="mb-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <div class="flex flex-wrap items-center gap-2">
            <span data-agent-session-status class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">${escapeAttribute(this._status)}</span>
            <span data-agent-session-duration class="text-[11px] text-zinc-400 dark:text-zinc-500">⏱ ${escapeAttribute(this._duration)}</span>
            <span data-agent-session-steps-count class="text-[11px] text-zinc-400 dark:text-zinc-500">≡ ${this._stepsCount} steps</span>
          </div>
          <div data-agent-session-strip class="mt-3 flex h-2 items-stretch gap-0.5 overflow-hidden rounded-full">${stripHtml}</div>
        </div>
        <div data-agent-session-body class="grid grid-cols-1 md:grid-cols-2">
          <ol data-agent-steps class="divide-y divide-zinc-50 border-b border-zinc-100 md:border-b-0 md:border-r dark:divide-zinc-800/60 dark:border-zinc-800">${stepsHtml}</ol>
          <div data-agent-requests class="divide-y divide-zinc-50 dark:divide-zinc-800/60">${requestsHtml}</div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('agent-session-timeline')) {
  customElements.define('agent-session-timeline', AgentSessionTimelineElement);
}

export default AgentSessionTimelineElement;
