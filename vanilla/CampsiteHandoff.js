/**
 * CampsiteHandoff - Campsite design handoff panel: checklist entries with
 * done state, assignee initials avatar and due date, plus an AI summary
 * block recapping the handoff.
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

class CampsiteHandoffElement extends HTMLElement {
  static get observedAttributes() {
    return ['items', 'summary'];
  }

  constructor() {
    super();
    this._bound = false;
    this._items = [];
  }

  connectedCallback() {
    if (!this._items.length) {
      this._items = parseJsonAttr(this.getAttribute('items'), [
        { id: 'h1', label: 'Redlines attached for spacing scale', done: true, assignee: 'Alex Smith', due: 'Nov 12' },
        { id: 'h2', label: 'Empty states exported to Lottie', done: true, assignee: 'Brook Taylor', due: 'Nov 13' },
        { id: 'h3', label: 'Motion spec review with eng', done: false, assignee: 'Casey Morgan', due: 'Nov 15' },
      ]);
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
    if (name === 'items' && !this._items.length) {
      this._items = parseJsonAttr(this.getAttribute('items'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get items() {
    return this._items;
  }
  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    this._render();
  }

  get summary() {
    return this.getAttribute('summary') ?? '3 handoff tasks, 2 done. Motion spec review is still open and due Nov 15 — the only blocker for a clean handoff.';
  }
  set summary(value) {
    this.setAttribute('summary', value);
  }

  _onClick(event) {
    const itemEl = event.target.closest('[data-campsite-handoff-item]');
    if (!itemEl) return;
    const item = this._items.find((i) => String(i.id) === itemEl.getAttribute('data-campsite-handoff-item'));
    if (item) {
      item.done = !item.done;
      this._render();
      this.dispatchEvent(new CustomEvent('toggle', { detail: { item }, bubbles: true }));
    }
  }

  _render() {
    const doneCount = this._items.filter((i) => i.done).length;
    const initialsFor = (name) =>
      String(name ?? '')
        .split(/\s+/)
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const itemsHtml = this._items
      .map((item) => {
        const assignee = item.assignee
          ? `<span data-campsite-handoff-assignee title="${escapeAttribute(item.assignee)}" class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">${escapeAttribute(initialsFor(item.assignee))}</span>`
          : '';
        const due = item.due
          ? `<span data-campsite-handoff-due class="shrink-0 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">${escapeAttribute(item.due)}</span>`
          : '';
        return `
        <label data-campsite-handoff-item="${escapeAttribute(item.id)}" class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-100 px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60">
          <input type="checkbox" data-campsite-handoff-check ${item.done ? 'checked' : ''} class="h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-indigo-500" />
          <span class="min-w-0 flex-1 text-xs ${item.done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}">${escapeAttribute(item.label)}</span>
          ${assignee}
          ${due}
        </label>`;
      })
      .join('');

    this.innerHTML = `
      <div data-campsite-handoff class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between">
          <h3 data-campsite-handoff-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Design handoff</h3>
          <span data-campsite-handoff-count class="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${doneCount}/${this._items.length} done</span>
        </div>
        <div data-campsite-handoff-items class="mt-3 space-y-2">${itemsHtml}</div>
        <div data-campsite-handoff-summary class="mt-3 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/40">
          <p class="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
            <span aria-hidden="true">✦</span>
            AI summary
          </p>
          <p class="mt-1 text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">${escapeAttribute(this.summary)}</p>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('campsite-handoff')) {
  customElements.define('campsite-handoff', CampsiteHandoffElement);
}

export default CampsiteHandoffElement;
