/**
 * PrReviewQueue - Grouped pull-request review queue with collapsible sections
 * and reviewer rows (Graphite).
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

const DEFAULT_GROUPS = () => [
  {
    id: 'waiting',
    label: 'Waiting for reviewers',
    prs: [{ id: 'p1', title: 'Add activity feed API', repo: 'mini-landing-page', number: 4, author: 'Sam Lee' }],
  },
  {
    id: 'drafts',
    label: 'Drafts',
    prs: [
      { id: 'p2', title: 'Add user search', repo: 'mini-landing-page', number: 7, author: 'Sam Lee' },
      { id: 'p3', title: 'Add frontend for search', repo: 'mini-landing-page', number: 6, author: 'Sam Lee' },
    ],
  },
];

const initials = (author) =>
  String(author || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

class PrReviewQueueElement extends HTMLElement {
  static get observedAttributes() {
    return ['groups'];
  }

  constructor() {
    super();
    this._bound = false;
    this._groups = [];
    this._collapsed = {};
  }

  connectedCallback() {
    if (!this._groups.length) {
      this._groups = parseJsonAttr(this.getAttribute('groups'), DEFAULT_GROUPS());
    }
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
    if (name === 'groups' && !this._groups.length) {
      this._groups = parseJsonAttr(this.getAttribute('groups'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get groups() {
    return this._groups;
  }
  set groups(value) {
    this._groups = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const toggleEl = event.target.closest('[data-pr-group-toggle]');
    if (toggleEl) {
      const id = toggleEl.getAttribute('data-pr-group-toggle');
      this._collapsed = { ...this._collapsed, [id]: !this._collapsed[id] };
      this._render();
      return;
    }
    const rowEl = event.target.closest('[data-pr-row]');
    if (rowEl) {
      const pr = this._groups.flatMap((g) => g.prs).find((p) => p.id === rowEl.getAttribute('data-pr-row'));
      if (pr) {
        this.dispatchEvent(new CustomEvent('pr-click', { detail: { pr }, bubbles: true }));
      }
    }
  }

  _render() {
    const groupsHtml = this._groups
      .map((group) => {
        const isCollapsed = this._collapsed[group.id] ?? false;
        const itemsHtml = isCollapsed
          ? ''
          : `<div data-pr-group-items class="pb-2">${group.prs
              .map(
                (pr) => `
            <button type="button" data-pr-row="${escapeAttribute(pr.id)}" class="flex w-full items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <span data-pr-avatar class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">${escapeAttribute(initials(pr.author))}</span>
              <span class="min-w-0 flex-1">
                <span data-pr-title class="block truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(pr.title)}</span>
                <span data-pr-meta class="block truncate text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(pr.author)} · ${escapeAttribute(pr.repo)} #${escapeAttribute(pr.number)}</span>
              </span>
            </button>`
              )
              .join('')}</div>`;
        return `
        <div data-pr-group="${escapeAttribute(group.id)}" class="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
          <button type="button" data-pr-group-toggle="${escapeAttribute(group.id)}" class="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
            <span data-pr-group-caret class="text-[10px] text-zinc-400 dark:text-zinc-500">${isCollapsed ? '▶' : '▼'}</span>
            <span data-pr-group-count class="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${group.prs.length}</span>
            <span data-pr-group-label class="text-xs font-medium text-zinc-700 dark:text-zinc-200">${escapeAttribute(group.label)}</span>
          </button>
          ${itemsHtml}
        </div>`;
      })
      .join('');

    this.innerHTML = `
      <div data-pr-review-queue class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">${groupsHtml}</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('pr-review-queue')) {
  customElements.define('pr-review-queue', PrReviewQueueElement);
}

export default PrReviewQueueElement;
