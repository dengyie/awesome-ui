/**
 * EntityMultiSelectPicker - Vanilla Web Component
 * Usage: <entity-picker options='[...]' selected='[...]'></entity-picker>
 * Attributes: options (JSON [{id,label,avatar?,initials?,system?}]), selected (JSON), searchable, empty-message, confirm-label, cancel-label
 * Properties: options, selected
 * Events: select (detail {ids}), search (detail {query}), dismiss
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const AVATAR_TONES = ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

const initialsOf = (label) =>
  String(label)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');

export class EntityMultiSelectPickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['options', 'selected', 'searchable', 'empty-message', 'confirm-label', 'cancel-label'];
  }

  constructor() {
    super();
    this._options = [];
    this._selected = [];
    this._picked = null;
    this._query = '';
    this._bound = false;
  }

  connectedCallback() {
    if (!this._options.length) {
      const raw = this.getAttribute('options');
      if (raw) {
        try { this._options = JSON.parse(raw); } catch { this._options = []; }
      }
    }
    if (!this._selected.length) {
      const raw = this.getAttribute('selected');
      if (raw) {
        try { this._selected = JSON.parse(raw); } catch { this._selected = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const option = event.target.closest('[data-picker-option]');
        if (option) {
          const id = option.getAttribute('data-picker-option');
          if (!this._picked) this._picked = new Set(this._selected);
          if (this._picked.has(id)) this._picked.delete(id);
          else this._picked.add(id);
          this.render();
          return;
        }
        if (event.target.closest('[data-picker-cancel]')) {
          this.dispatchEvent(new CustomEvent('dismiss'));
          return;
        }
        if (event.target.closest('[data-picker-confirm]')) {
          const ids = [...(this._picked || new Set(this._selected))];
          this.dispatchEvent(new CustomEvent('select', { detail: { ids } }));
        }
      });
      this.addEventListener('input', (event) => {
        const target = event.target;
        if (target && target.tagName === 'INPUT' && target.hasAttribute('data-picker-search')) {
          this._query = target.value;
          this.dispatchEvent(new CustomEvent('search', { detail: { query: this._query } }));
          this.render();
        }
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  get options() {
    return this._options;
  }

  set options(value) {
    this._options = Array.isArray(value) ? value : [];
    this._picked = null;
    this.render();
  }

  get selected() {
    return this._picked ? [...this._picked] : this._selected;
  }

  set selected(value) {
    this._selected = Array.isArray(value) ? value : [];
    this._picked = null;
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

  filtered() {
    if (!this._query) return this._options;
    const needle = this._query.toLowerCase();
    return this._options.filter((option) => String(option.label).toLowerCase().includes(needle));
  }

  render() {
    this._applyHostClass('block');
    const searchable = this.getAttribute('searchable') !== 'false';
    const emptyMessage = this.getAttribute('empty-message') || 'No matches found.';
    const confirmLabel = this.getAttribute('confirm-label') || 'Insert results';
    const cancelLabel = this.getAttribute('cancel-label') || 'Cancel';
    if (!this._picked) this._picked = new Set(this._selected);
    const filtered = this.filtered();
    const searchHtml = searchable
      ? `<div class="border-b border-zinc-100 p-2.5 dark:border-zinc-800">
          <div class="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input type="text" data-picker-search value="${escapeAttribute(this._query)}" placeholder="Search people…" class="w-full rounded-lg border border-zinc-300 py-1.5 pl-8 pr-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>`
      : '';
    const listHtml = filtered.length
      ? filtered
          .map((option, index) => {
            const checked = this._picked.has(option.id);
            const rowClass = checked ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60';
            const checkboxClass = checked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800';
            const checkSvg = checked ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></svg>' : '';
            let avatarHtml;
            if (option.avatar) {
              avatarHtml = `<img src="${escapeAttribute(option.avatar)}" alt="" class="h-6 w-6 shrink-0 rounded-full" />`;
            } else if (option.system) {
              avatarHtml = '<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700"><span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span></span>';
            } else {
              avatarHtml = `<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${AVATAR_TONES[index % AVATAR_TONES.length]}">${escapeAttribute(option.initials || initialsOf(option.label))}</span>`;
            }
            return `<li>
              <button type="button" data-picker-option="${escapeAttribute(option.id)}" aria-pressed="${checked}" class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${rowClass}">
                <span data-picker-checkbox class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checkboxClass}">${checkSvg}</span>
                ${avatarHtml}
                <span class="min-w-0 flex-1 truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(option.label)}</span>
              </button>
            </li>`;
          })
          .join('')
      : `<li data-picker-empty class="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(emptyMessage)}</li>`;

    this.innerHTML = `<div data-entity-picker class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      ${searchHtml}
      <ul class="max-h-64 overflow-y-auto p-1.5">${listHtml}</ul>
      <div class="flex items-center justify-end gap-2 border-t border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
        <button type="button" data-picker-cancel class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(cancelLabel)}</button>
        <button type="button" data-picker-confirm class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(confirmLabel)}</button>
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('entity-picker')) {
  customElements.define('entity-picker', EntityMultiSelectPickerElement);
}

export default EntityMultiSelectPickerElement;
