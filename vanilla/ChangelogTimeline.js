/**
 * ChangelogTimeline - Product changelog: left date rail with category tag,
 * rich entry body, reaction meta row, search box and filters control
 * (Canny Changelog pattern).
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

const DEFAULT_ENTRIES = () => [
  {
    id: 'c1',
    date: 'Nov 15, 2026',
    tag: 'Improved',
    tone: 'sky',
    title: 'Dashboard widgets now reflow smoothly on every screen size',
    body: 'The home grid previously felt cramped on narrower viewports. We shipped a layout pass that makes widget reads 40% faster and keeps the most important metric pinned in view — no more unnecessary scrolling. Thanks to everyone who sent feedback!',
    likes: 24,
    views: 1832,
  },
  {
    id: 'c2',
    date: 'Nov 12, 2026',
    tag: 'New',
    tone: 'emerald',
    title: 'Skip the onboarding tour when you return',
    body: "Most of you already know your way around, and returning on a new device shouldn't mean retaking the product tour. The first-run checklist now collapses into a single card and can be reopened any time from Help.",
    likes: 61,
    views: 2914,
  },
  {
    id: 'c3',
    date: 'Nov 8, 2026',
    tag: 'Fixed',
    tone: 'amber',
    title: 'CSV export no longer drops trailing rows',
    body: 'Exports with exactly 1000 rows were truncated by an off-by-one pagination guard. Full rows now land in the file, and the download toast confirms the row count.',
    likes: 12,
    views: 764,
  },
];

const TONE_STYLES = {
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
};

class ChangelogTimelineElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'search-placeholder', 'filter-label', 'entries'];
  }

  constructor() {
    super();
    this._bound = false;
    this._title = 'Changelog';
    this._subtitle = 'Follow up on the latest improvements and updates.';
    this._searchPlaceholder = 'Search entries...';
    this._filterLabel = 'Filters';
    this._entries = DEFAULT_ENTRIES();
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const s = this.getAttribute('subtitle');
    if (s) this._subtitle = s;
    const sp = this.getAttribute('search-placeholder');
    if (sp) this._searchPlaceholder = sp;
    const fl = this.getAttribute('filter-label');
    if (fl) this._filterLabel = fl;
    this._entries = parseJsonAttr(this.getAttribute('entries'), DEFAULT_ENTRIES());
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
    if (name === 'title') this._title = newValue || 'Changelog';
    if (name === 'subtitle') this._subtitle = newValue || '';
    if (name === 'search-placeholder') this._searchPlaceholder = newValue || 'Search entries...';
    if (name === 'filter-label') this._filterLabel = newValue || 'Filters';
    if (name === 'entries') this._entries = parseJsonAttr(newValue, DEFAULT_ENTRIES());
    this._render();
  }

  get entries() { return this._entries; }
  set entries(value) { this._entries = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const entryEl = event.target.closest('[data-changelog-entry]');
    if (!entryEl) return;
    const entry = this._entries.find((e) => e.id === entryEl.getAttribute('data-changelog-entry'));
    if (entry) this.dispatchEvent(new CustomEvent('entry-click', { detail: { entry }, bubbles: true }));
  }

  _render() {
    const entriesHtml = this._entries
      .map((entry, i) => {
        const tone = TONE_STYLES[entry.tone] ?? TONE_STYLES.sky;
        const divider = i < this._entries.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : '';
        return `<li data-changelog-entry="${escapeAttribute(entry.id)}" tabindex="0" class="grid cursor-pointer grid-cols-[7rem_1fr] gap-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${divider}">
          <div class="text-xs text-zinc-500 dark:text-zinc-400"><time data-changelog-date="${escapeAttribute(entry.date)}">${escapeAttribute(entry.date)}</time></div>
          <article>
            <span data-changelog-tag="${escapeAttribute(entry.tag)}" class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}">${escapeAttribute(entry.tag)}</span>
            <h3 data-changelog-entry-title="${escapeAttribute(entry.title)}" class="mt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(entry.title)}</h3>
            <p data-changelog-entry-body="${escapeAttribute(entry.title)}" class="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">${escapeAttribute(entry.body)}</p>
            <div data-changelog-meta="${escapeAttribute(entry.title)}" class="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
              <span data-changelog-likes="${entry.likes ?? 0}" class="inline-flex items-center gap-1">♡ ${entry.likes ?? 0}</span>
              <span data-changelog-views="${entry.views ?? 0}" class="inline-flex items-center gap-1">👁 ${entry.views ?? 0}</span>
              <span class="inline-flex items-center gap-1" aria-hidden="true">🔗 Share</span>
            </div>
          </article>
        </li>`;
      })
      .join('');

    this.innerHTML = `
      <div data-changelog class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-changelog-header class="px-5 pb-3 pt-5">
          <p data-changelog-title class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
          <p data-changelog-subtitle class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._subtitle)}</p>
        </div>
        <div data-changelog-controls class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 pb-3 dark:border-zinc-800">
          <label data-changelog-search class="flex w-full max-w-sm items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400 transition-colors focus-within:border-zinc-400 dark:border-zinc-700 dark:focus-within:border-zinc-500">
            <span aria-hidden="true">⌕</span>
            <input type="text" placeholder="${escapeAttribute(this._searchPlaceholder)}" class="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
          </label>
          <button data-changelog-filter type="button" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"><span aria-hidden="true">⚙</span> ${escapeAttribute(this._filterLabel)} <span class="text-zinc-400" aria-hidden="true">▾</span></button>
        </div>
        <ol data-changelog-list class="flex flex-col px-5">${entriesHtml}</ol>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('changelog-timeline')) {
  customElements.define('changelog-timeline', ChangelogTimelineElement);
}

export default ChangelogTimelineElement;
