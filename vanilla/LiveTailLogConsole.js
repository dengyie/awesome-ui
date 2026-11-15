/**
 * LiveTailLogConsole - Vanilla Web Component
 * Usage: <live-tail-log-console timezone="GMT+7"></live-tail-log-console>
 * Attributes: search-placeholder, timezone, sources (JSON array), max-lines, live-tail (true|false)
 * Properties: lines (Array<{ts?, level: info|warn|error|success, message, source?}>)
 * Events: search (detail {query}), source-change (detail {source}), live-tail-change (detail {enabled})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const LEVEL_DOT = {
  info: 'bg-sky-500',
  warn: 'bg-amber-500',
  error: 'bg-rose-500',
  success: 'bg-emerald-500',
};

export class LiveTailLogConsoleElement extends HTMLElement {
  static get observedAttributes() {
    return ['search-placeholder', 'timezone', 'max-lines', 'live-tail'];
  }

  constructor() {
    super();
    this._lines = [];
    this._sources = [];
    this._query = '';
    this._follow = true;
    this._bound = false;
  }

  get lines() {
    return this._lines;
  }

  set lines(list) {
    this._lines = Array.isArray(list) ? list : [];
    this.render();
  }

  get sources() {
    return this._sources;
  }

  set sources(list) {
    this._sources = Array.isArray(list) ? list : [];
    this.render();
  }

  get liveTail() {
    return this._follow;
  }

  set liveTail(flag) {
    this._follow = Boolean(flag);
    this.render();
  }

  connectedCallback() {
    if (!this._lines.length) {
      const raw = this.getAttribute('lines');
      if (raw) {
        try { this._lines = JSON.parse(raw); } catch { this._lines = []; }
      }
    }
    if (!this._sources.length) {
      const raw = this.getAttribute('sources');
      if (raw) {
        try { this._sources = JSON.parse(raw); } catch { this._sources = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('input', (event) => {
        const search = event.target.closest('[data-tail-search]');
        if (search) {
          this._query = search.value;
          this.dispatchEvent(new CustomEvent('search', { detail: { query: this._query } }));
          this._renderLines();
        }
      });
      this.addEventListener('change', (event) => {
        const select = event.target.closest('[data-tail-source]');
        if (select) {
          this._query = select.value === 'all' ? '' : select.value;
          this.dispatchEvent(new CustomEvent('source-change', { detail: { source: select.value } }));
          this._renderLines();
        }
      });
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-tail-follow]')) {
          this._follow = !this._follow;
          this.dispatchEvent(new CustomEvent('live-tail-change', { detail: { enabled: this._follow } }));
          this.render();
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

  _filtered() {
    const maxLines = Number(this.getAttribute('max-lines')) || 200;
    const query = this._query.toLowerCase();
    const base = query
      ? this._lines.filter((line) => (line.message || '').toLowerCase().includes(query) || (line.source || '').toLowerCase().includes(query))
      : this._lines;
    return maxLines > 0 ? base.slice(-maxLines) : base;
  }

  _renderLines() {
    const container = this.querySelector('[data-tail-lines]');
    if (!container) return;
    const filtered = this._filtered();
    if (!filtered.length) {
      container.innerHTML = '<p class="py-4 text-center text-neutral-500">No log lines match.</p>';
      return;
    }
    container.innerHTML = filtered
      .map(
        (line) => `<div data-tail-line class="flex items-start gap-2 whitespace-pre-wrap break-all">
          ${line.ts ? `<span class="shrink-0 text-neutral-500">${escapeAttribute(line.ts)}</span>` : ''}
          <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[line.level] || LEVEL_DOT.info}"></span>
          <span class="min-w-0 flex-1 text-neutral-300">${escapeAttribute(line.message)}</span>
          ${line.source ? `<span class="shrink-0 rounded bg-neutral-800 px-1 text-[10px] text-neutral-400">${escapeAttribute(line.source)}</span>` : ''}
        </div>`,
      )
      .join('');
  }

  render() {
    this._applyHostClass('block');
    const searchPlaceholder = this.getAttribute('search-placeholder') || 'Search logs…';
    const timezone = this.getAttribute('timezone') || '';
    const sources = this._sources;
    const follow = this._follow;

    this.innerHTML = `<div data-live-tail-console class="w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
      <div class="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
        ${
          sources.length
            ? `<select data-tail-source class="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus-visible:outline-none">
                <option value="all">All sources</option>
                ${sources.map((source) => `<option value="${escapeAttribute(source)}">${escapeAttribute(source)}</option>`).join('')}
              </select>`
            : ''
        }
        <div class="relative min-w-0 flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" placeholder="${escapeAttribute(searchPlaceholder)}" data-tail-search class="w-full rounded-md border border-neutral-700 bg-neutral-900 py-1 pl-7 pr-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500" />
        </div>
        <button type="button" data-tail-follow class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 ${
          follow ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400' : 'border border-neutral-700 bg-neutral-900 text-neutral-300'
        }">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
          Live tail
        </button>
        ${timezone ? `<span class="shrink-0 rounded-md border border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">${escapeAttribute(timezone)}</span>` : ''}
      </div>
      <div data-tail-lines class="max-h-72 overflow-y-auto px-3 py-2 font-mono text-xs leading-5 text-neutral-300"></div>
    </div>`;
    this._renderLines();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('live-tail-log-console')) {
  customElements.define('live-tail-log-console', LiveTailLogConsoleElement);
}
export default LiveTailLogConsoleElement;
