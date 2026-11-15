import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const kbd = (key) =>
  `<kbd class="inline-flex min-w-[1.4rem] items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-300">${escapeAttribute(key)}</kbd>`;

/**
 * ShortcutsOverlay - Vanilla Web Component
 * Usage: <shortcuts-overlay open></shortcuts-overlay>
 * Properties: groups (ShortcutGroup[]) | shortcuts (ShortcutItem[])
 * Events: close
 */
export class ShortcutsOverlayElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'placeholder'];
  }

  constructor() {
    super();
    this._groups = [];
    this._shortcuts = [];
    this._query = '';
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  get isOpen() {
    return this.hasAttribute('open');
  }

  set isOpen(value) {
    if (value) this.setAttribute('open', '');
    else this.removeAttribute('open');
  }

  get groups() {
    return this._groups;
  }

  set groups(value) {
    this._groups = Array.isArray(value) ? value : [];
    this.render();
  }

  get shortcuts() {
    return this._shortcuts;
  }

  set shortcuts(value) {
    this._shortcuts = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  attributeChangedCallback() {
    if (this.isOpen) this._query = '';
    this.render();
  }

  _onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent('close'));
    }
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  /** Flat list → groups bucketed by item.group, or the provided groups. */
  _normalized() {
    if (this._groups.length > 0) return this._groups;
    const buckets = [];
    this._shortcuts.forEach((item) => {
      const label = item.group || 'General';
      const bucket = buckets.find((group) => group.label === label);
      if (bucket) bucket.items.push(item);
      else buckets.push({ id: label.toLowerCase().replace(/\s+/g, '-'), label, items: [item] });
    });
    return buckets;
  }

  _filtered(groups) {
    const query = this._query.trim().toLowerCase();
    if (!query) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            String(item.label).toLowerCase().includes(query) ||
            (item.keys || []).join('').toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }

  render() {
    const title = this.getAttribute('title') || 'Keyboard shortcuts';
    const placeholder = this.getAttribute('placeholder') || 'Search shortcuts...';
    const normalized = this._normalized();
    const filtered = this._filtered(normalized);
    const total = normalized.reduce((sum, group) => sum + (group.items || []).length, 0);

    this._applyHostClass('block');

    if (!this.isOpen) {
      this.innerHTML = '';
      document.removeEventListener('keydown', this._onKeyDown);
      return;
    }

    document.removeEventListener('keydown', this._onKeyDown);
    document.addEventListener('keydown', this._onKeyDown);

    const body = filtered.length
      ? `<div class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          ${filtered
            .map(
              (group) => `
            <section>
              <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">${escapeAttribute(group.label)}</h3>
              <ul class="space-y-1.5">
                ${(group.items || [])
                  .map(
                    (item) => `
                  <li class="flex items-center gap-2 text-xs">
                    <span class="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-300">${escapeAttribute(item.label)}</span>
                    <span class="flex shrink-0 items-center gap-0.5">${(item.keys || []).map(kbd).join('')}</span>
                  </li>`
                  )
                  .join('')}
              </ul>
            </section>`
            )
            .join('')}
        </div>`
      : `<div class="py-8 text-center text-xs text-zinc-400">No shortcuts match &ldquo;${escapeAttribute(this._query)}&rdquo;</div>`;

    this.innerHTML = `
      <div class="shortcuts-overlay fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}">
        <div class="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl">
          <div class="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <span class="shrink-0 text-zinc-400">${uiIcon('terminal', { size: 16 })}</span>
            <h2 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(title)}</h2>
            <span class="text-[11px] font-mono text-zinc-400">${total}</span>
            <button type="button" class="shortcuts-close ml-auto rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Close">${uiIcon('x', { size: 14 })}</button>
          </div>

          <div class="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
            <div class="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5">
              <span class="shrink-0 text-zinc-400">${uiIcon('search', { size: 13 })}</span>
              <input type="text" class="shortcuts-search w-full border-none bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none" placeholder="${escapeAttribute(placeholder)}" value="${escapeAttribute(this._query)}" />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4">${body}</div>

          <div class="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 px-4 py-2 text-[10px] text-zinc-400">
            <span class="flex items-center gap-1">${kbd('esc')}<span>Close</span></span>
          </div>
        </div>
      </div>`;

    const search = this.querySelector('.shortcuts-search');
    if (search) {
      search.addEventListener('input', (event) => {
        this._query = event.target.value;
        // Keep focus + caret while re-rendering the list.
        const caret = event.target.selectionStart;
        this.render();
        const next = this.querySelector('.shortcuts-search');
        if (next) {
          next.focus();
          if (caret != null) next.setSelectionRange(caret, caret);
        }
      });
      search.focus();
    }

    this.querySelector('.shortcuts-close').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close'));
    });

    this.querySelector('.shortcuts-overlay').addEventListener('click', (event) => {
      if (event.target === event.currentTarget) this.dispatchEvent(new CustomEvent('close'));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('shortcuts-overlay')) {
  customElements.define('shortcuts-overlay', ShortcutsOverlayElement);
}
export default ShortcutsOverlayElement;
