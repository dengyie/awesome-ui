import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class CommandPaletteElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'placeholder'];
  }

  constructor() {
    super();
    this._items = [];
    this._query = '';
    this._activeIndex = 0;
    this._handleKey = this._handleKey.bind(this);
  }

  get items() {
    return this._items;
  }

  set items(val) {
    this._items = Array.isArray(val) ? val : [];
    this.render();
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(val) {
    if (val) this.setAttribute('open', '');
    else this.removeAttribute('open');
  }

  connectedCallback() {
    document.addEventListener('keydown', this._handleKey);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKey);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open' && this.open && oldVal !== newVal) {
      this._query = '';
      this._activeIndex = 0;
    }
    this.render();
    if (name === 'open' && this.open) {
      const input = this.querySelector('.cmd-input');
      if (input) input.focus();
    }
  }

  _getFiltered() {
    if (!this._query.trim()) return this._items;
    const q = this._query.toLowerCase();
    return this._items.filter(
      (i) =>
        (i.label && i.label.toLowerCase().includes(q)) ||
        (i.hint && i.hint.toLowerCase().includes(q)) ||
        (i.group && i.group.toLowerCase().includes(q))
    );
  }

  _handleKey(e) {
    if (!this.open) return;
    const filtered = this._getFiltered();
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._activeIndex = Math.min(filtered.length - 1, this._activeIndex + 1);
      this._renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._activeIndex = Math.max(0, this._activeIndex - 1);
      this._renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[this._activeIndex];
      if (item) this._select(item);
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close'));
  }

  _select(item) {
    this.dispatchEvent(new CustomEvent('select', { detail: item }));
    this._close();
  }

  _itemHtml(item, idx, showGroup) {
    const isActive = idx === this._activeIndex;
    return `
      ${showGroup ? `<div class="px-2.5 pt-2.5 pb-1 text-[10px] uppercase font-semibold tracking-wider text-zinc-400">${escapeAttribute(item.group)}</div>` : ''}
      <button
        type="button"
        data-item-id="${escapeAttribute(item.id)}"
        class="cmd-item w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
          isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'
        }"
        role="option"
        aria-selected="${isActive}"
      >
        ${item.icon ? `<span class="p-1 rounded-md bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 shrink-0">${uiIcon(item.icon, { size: 14 })}</span>` : ''}
        <span class="flex-1 min-w-0">
          <span class="block truncate font-medium">${escapeAttribute(item.label)}</span>
          ${item.hint ? `<span class="block truncate text-[11px] text-zinc-400">${escapeAttribute(item.hint)}</span>` : ''}
        </span>
        ${item.shortcut ? `<kbd class="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 shrink-0">${escapeAttribute(item.shortcut)}</kbd>` : ''}
      </button>
    `;
  }

  _renderList() {
    const listbox = this.querySelector('[role="listbox"]');
    if (!listbox) return;
    const filtered = this._getFiltered();
    if (filtered.length === 0) {
      listbox.innerHTML = '<div class="p-4 text-center text-sm text-zinc-400">No results found</div>';
      return;
    }
    let lastGroup;
    listbox.innerHTML = filtered
      .map((item, idx) => {
        const showGroup = item.group && item.group !== lastGroup;
        lastGroup = item.group;
        return this._itemHtml(item, idx, showGroup);
      })
      .join('');
    this._bindItems();
  }

  _bindItems() {
    this.querySelectorAll('.cmd-item').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const item = this._items.find((i) => i.id === btn.getAttribute('data-item-id'));
        if (item) this._select(item);
      });
      btn.addEventListener('mouseenter', () => {
        this._activeIndex = idx;
        this.querySelectorAll('.cmd-item').forEach((b, i) => {
          b.classList.toggle('bg-zinc-100', i === idx);
          b.classList.toggle('dark:bg-zinc-800', i === idx);
        });
      });
    });
  }

  render() {
    if (!this.open) {
      this.innerHTML = '';
      return;
    }
    const placeholder = this.getAttribute('placeholder') || 'Type a command or search...';

    this.innerHTML = `
      <div class="cmd-backdrop fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="w-full max-w-lg mx-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            ${uiIcon('search', { size: 16, className: 'text-zinc-400 shrink-0' })}
            <input
              type="text"
              class="cmd-input w-full bg-transparent border-none text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
              placeholder="${escapeAttribute(placeholder)}"
              value="${escapeAttribute(this._query)}"
            />
            <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">ESC</kbd>
          </div>
          <div class="max-h-72 overflow-y-auto p-1.5" role="listbox"></div>
        </div>
      </div>
    `;

    const backdrop = this.querySelector('.cmd-backdrop');
    const panel = backdrop?.querySelector('div');
    if (backdrop && panel) {
      backdrop.addEventListener('click', () => this._close());
      panel.addEventListener('click', (e) => e.stopPropagation());
    }

    const input = this.querySelector('.cmd-input');
    if (input) {
      input.addEventListener('input', (e) => {
        this._query = e.target.value;
        this._activeIndex = 0;
        this._renderList();
      });
    }

    this._renderList();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('command-palette')) {
  customElements.define('command-palette', CommandPaletteElement);
}
export default CommandPaletteElement;
