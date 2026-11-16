/**
 * TaskCardModal - Task card modal overlay: backdrop with centered dialog,
 * header with completion checkbox and close button, Members/Labels/Dates
 * attribute rows, description textarea, link/file attachments, checklist
 * with progress bar, and a right activity column with comment composer
 * (Trello card modal pattern).
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

const DEFAULT_MEMBERS = () => [
  { id: 'm1', name: 'Jane Smith', initials: 'JS' },
  { id: 'm2', name: 'Omar Diallo', initials: 'OD' },
];

const DEFAULT_LABELS = () => [
  { id: 'l1', label: 'Design', color: 'bg-violet-500' },
  { id: 'l2', label: 'Web', color: 'bg-emerald-500' },
];

const DEFAULT_ATTACHMENTS = () => [
  { id: 'a1', name: 'Brand guidelines', meta: 'notion.so/brand', kind: 'link' },
  { id: 'a2', name: 'hero-spec.pdf', meta: '1.2 MB · added Nov 12', kind: 'file' },
];

const DEFAULT_CHECKLIST = () => [
  { id: 'c1', text: 'Collect references', done: true },
  { id: 'c2', text: 'Wireframe variants', done: true },
  { id: 'c3', text: 'High-fidelity mockup', done: false },
  { id: 'c4', text: 'Dev handoff notes', done: false },
];

const DEFAULT_COMMENTS = () => [
  { id: 'k1', author: 'Jane Smith', initials: 'JS', text: 'Draft uploaded, take a look at the spacing pass.', time: '2 hours ago' },
  { id: 'k2', author: 'Omar Diallo', initials: 'OD', text: "Looks great — let's swap the CTA copy before handoff.", time: '1 hour ago' },
];

class TaskCardModalElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'completed', 'members', 'labels', 'dates', 'description', 'attachments', 'checklist', 'comments', 'comment-placeholder'];
  }

  constructor() {
    super();
    this._bound = false;
    this._done = new Set();
    this._doneInitialized = false;
    this._draft = '';
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('input', this._onInput);
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('input', this._onInput);
    this.removeEventListener('keydown', this._onKeydown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _checklist() {
    const list = parseJsonAttr(this.getAttribute('checklist'), DEFAULT_CHECKLIST());
    if (!this._doneInitialized) {
      this._done = new Set(list.filter((i) => i.done).map((i) => i.id));
      this._doneInitialized = true;
    }
    return list.map((i) => ({ ...i, done: this._done.has(i.id) }));
  }

  _onClick(event) {
    if (event.target.closest('[data-taskcard-close]')) {
      this.dispatchEvent(new CustomEvent('card-close', { bubbles: true }));
      return;
    }
    const complete = event.target.closest('[data-taskcard-complete]');
    if (complete) {
      const next = complete.getAttribute('aria-pressed') !== 'true';
      complete.setAttribute('aria-pressed', String(next));
      this.dispatchEvent(new CustomEvent('complete-toggle', { detail: { completed: next }, bubbles: true }));
      this._render();
      return;
    }
    const checkitem = event.target.closest('[data-taskcard-checkitem]');
    if (checkitem) {
      const id = checkitem.getAttribute('data-taskcard-checkitem');
      const list = this._checklist();
      const found = list.find((i) => i.id === id);
      if (found) {
        if (this._done.has(id)) this._done.delete(id);
        else this._done.add(id);
        this.dispatchEvent(new CustomEvent('checklist-toggle', { detail: { item: { ...found, done: !found.done } }, bubbles: true }));
        this._render();
      }
    }
  }

  _onInput(event) {
    if (event.target.hasAttribute && event.target.hasAttribute('data-taskcard-input')) {
      this._draft = event.target.value ?? '';
    }
  }

  _onKeydown(event) {
    if (event.target.hasAttribute && event.target.hasAttribute('data-taskcard-input') && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this._submitComment();
    }
  }

  _submitComment() {
    const text = String(this._draft ?? '').trim();
    if (!text) return;
    this._draft = '';
    this.dispatchEvent(new CustomEvent('comment-submit', { detail: { text }, bubbles: true }));
    const input = this.querySelector('[data-taskcard-input]');
    if (input) input.value = '';
    this._render();
  }

  _render() {
    const title = this.getAttribute('title') || 'Design landing page hero';
    const completed = this.getAttribute('completed') === 'true';
    const members = parseJsonAttr(this.getAttribute('members'), DEFAULT_MEMBERS());
    const labels = parseJsonAttr(this.getAttribute('labels'), DEFAULT_LABELS());
    const dates = this.getAttribute('dates') || 'Nov 10 – Nov 24';
    const description = this.getAttribute('description') || 'Hero section with headline, product screenshot and a primary CTA.';
    const attachments = parseJsonAttr(this.getAttribute('attachments'), DEFAULT_ATTACHMENTS());
    const checklist = this._checklist();
    const comments = parseJsonAttr(this.getAttribute('comments'), DEFAULT_COMMENTS());
    const placeholder = this.getAttribute('comment-placeholder') || 'Write a comment…';

    const doneCount = checklist.filter((i) => i.done).length;
    const pct = checklist.length === 0 ? 0 : Math.round((doneCount / checklist.length) * 100);

    const membersHtml = members
      .map(
        (m) => `<span data-taskcard-member="${escapeAttribute(m.id)}" title="${escapeAttribute(m.name)}" class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">${m.avatarUrl ? `<img src="${escapeAttribute(m.avatarUrl)}" alt="${escapeAttribute(m.name)}" class="h-8 w-8 rounded-full object-cover" />` : escapeAttribute(m.initials ?? m.name.slice(0, 2).toUpperCase())}</span>`
      )
      .join('');

    const labelsHtml = labels
      .map(
        (l) => `<span data-taskcard-label="${escapeAttribute(l.id)}" class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold text-white ${escapeAttribute(l.color ?? 'bg-zinc-500')}">${escapeAttribute(l.label)}</span>`
      )
      .join('');

    const attachmentsHtml = attachments
      .map(
        (a) => `<div data-taskcard-attachment="${escapeAttribute(a.id)}" class="flex items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <span aria-hidden="true" class="text-sm">${a.kind === 'file' ? '📄' : '🔗'}</span>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(a.name)}</p>
              <p class="truncate text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(a.meta)}</p>
            </div>
          </div>`
      )
      .join('');

    const checklistHtml = checklist
      .map(
        (item) => `<button data-taskcard-checkitem="${escapeAttribute(item.id)}" data-taskcard-checkitem-done="${item.done ? 'true' : 'false'}" type="button" class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
            <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-transparent dark:border-zinc-600'}">✓</span>
            <span class="text-sm ${item.done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200'}">${escapeAttribute(item.text)}</span>
          </button>`
      )
      .join('');

    const commentsHtml = comments
      .map(
        (c) => `<div data-taskcard-comment="${escapeAttribute(c.id)}" class="flex gap-2">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(c.initials ?? c.author.slice(0, 2).toUpperCase())}</span>
            <div class="min-w-0">
              <p class="text-xs"><span class="font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(c.author)}</span> <span class="text-zinc-400 dark:text-zinc-500">${escapeAttribute(c.time)}</span></p>
              <p class="mt-0.5 text-xs leading-5 text-zinc-600 dark:text-zinc-300">${escapeAttribute(c.text)}</p>
            </div>
          </div>`
      )
      .join('');

    this.innerHTML = `
      <div data-taskcard class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/60 p-4 sm:p-8">
        <div data-taskcard-dialog role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" class="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
          <div class="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div class="flex min-w-0 items-center gap-3">
              <button data-taskcard-complete aria-pressed="${completed ? 'true' : 'false'}" type="button" class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors ${completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-transparent hover:border-zinc-400 dark:border-zinc-600'}">✓</button>
              <h2 data-taskcard-title class="truncate text-lg font-bold ${completed ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-50'}">${escapeAttribute(title)}</h2>
            </div>
            <button data-taskcard-close type="button" aria-label="Close" class="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">✕</button>
          </div>
          <div class="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <div class="min-w-0 space-y-5">
              <div data-taskcard-attrs class="flex flex-wrap gap-6">
                <div data-taskcard-members>
                  <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Members</p>
                  <div class="mt-1.5 flex gap-1.5">${membersHtml}</div>
                </div>
                ${labels.length > 0 ? `<div data-taskcard-labels>
                  <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Labels</p>
                  <div class="mt-1.5 flex flex-wrap gap-1.5">${labelsHtml}</div>
                </div>` : ''}
                ${dates ? `<div data-taskcard-dates>
                  <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Dates</p>
                  <p class="mt-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">${escapeAttribute(dates)}</p>
                </div>` : ''}
              </div>
              <div data-taskcard-description>
                <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Description</p>
                <p class="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">${escapeAttribute(description)}</p>
              </div>
              ${attachments.length > 0 ? `<div data-taskcard-attachments>
                <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Attachments</p>
                <div class="mt-1.5 space-y-1.5">${attachmentsHtml}</div>
              </div>` : ''}
              <div data-taskcard-checklist>
                <div class="flex items-center justify-between">
                  <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Checklist</p>
                  <span data-taskcard-checklist-count class="text-xs font-medium text-zinc-500 dark:text-zinc-400">${pct}%</span>
                </div>
                <div data-taskcard-checklist-bar class="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div class="h-full rounded-full bg-emerald-500 transition-all" style="width:${pct}%"></div>
                </div>
                <div class="mt-2 space-y-1">${checklistHtml}</div>
              </div>
            </div>
            <aside data-taskcard-activity class="md:border-l md:border-zinc-200 md:pl-6 dark:md:border-zinc-800">
              <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Comments &amp; activity</p>
              <form data-taskcard-composer class="mt-3">
                <textarea data-taskcard-input rows="3" placeholder="${escapeAttribute(placeholder)}" class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"></textarea>
                <button data-taskcard-send type="button" class="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">Comment</button>
              </form>
              <div data-taskcard-feed class="mt-4 space-y-3">${commentsHtml}</div>
            </aside>
          </div>
        </div>
      </div>`;

    const send = this.querySelector('[data-taskcard-send]');
    if (send) {
      send.addEventListener('click', () => this._submitComment());
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('task-card-modal')) {
  customElements.define('task-card-modal', TaskCardModalElement);
}

export default TaskCardModalElement;
