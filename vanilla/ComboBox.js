import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

let comboSeq = 0;

/**
 * ComboBox - Vanilla Web Component
 * Usage: <combo-select placeholder="Search models…"></combo-select>
 * Properties: options ({ value, label, description?, icon? }[])
 * Attributes: placeholder, empty-text
 * Events: change (detail: { value })
 */
export class ComboBoxElement extends HTMLElement {
  static get observedAttributes() {
    return ['placeholder', 'empty-text'];
  }

  constructor() {
    super();
    this._options = [];
    this._open = false;
    this._query = '';
    this._active = 0;
    this._selected = null;
    this._id = `combo-${++comboSeq}`;
    this._boundDocMouseDown = (event) => {
      if (!this.contains(event.target)) this._setOpen(false);
    };
    this._boundDocKeyDown = (event) => {
      if (event.key === 'Escape') this._setOpen(false);
    };
  }

  get options() {
    return this._options;
  }

  set options(value) {
    this._options = Array.isArray(value) ? value : [];
    this.render();
  }

  get placeholder() {
    return this.getAttribute('placeholder') || 'Search…';
  }

  get emptyText() {
    return this.getAttribute('empty-text') || 'No matches found.';
  }

  connectedCallback() {
    document.addEventListener('mousedown', this._boundDocMouseDown);
    document.addEventListener('keydown', this._boundDocKeyDown);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this._boundDocMouseDown);
    document.removeEventListener('keydown', this._boundDocKeyDown);
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
    const q = this._query.trim().toLowerCase();
    if (!q) return this._options;
    return this._options.filter(
      (option) =>
        String(option.label).toLowerCase().includes(q) ||
        String(option.description ?? '').toLowerCase().includes(q)
    );
  }

  _setOpen(open) {
    this._open = open;
    this.render();
  }

  _choose(option) {
    this._selected = option.value;
    this._query = option.label;
    this._open = false;
    this.render();
    this.dispatchEvent(new CustomEvent('change', { detail: { value: option.value } }));
  }

  _renderField() {
    const focused = this.contains(document.activeElement) && document.activeElement?.tagName === 'INPUT';
    return `<div class="flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2 text-xs transition-colors dark:bg-zinc-900 ${
      this._open
        ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400'
        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
    }">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-zinc-400"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input data-combo-input role="combobox" aria-expanded="${this._open}" aria-controls="${this._id}-listbox"
        aria-autocomplete="list" aria-label="${escapeAttribute(this.placeholder)}" value="${escapeAttribute(this._query)}"
        placeholder="${escapeAttribute(this.placeholder)}"
        class="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100" />
      ${
        this._query
          ? `<button type="button" data-combo-clear aria-label="Clear" class="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`
          : ''
      }
    </div>`;
  }

  _renderListbox(filtered) {
    if (!this._open) return '';
    const items = filtered
      .map((option, index) => {
        const isActive = index === this._active;
        const isSelected = this._selected === option.value;
        return `<li data-combo-index="${index}" role="option" aria-selected="${isSelected}"
          class="flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-xs ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}">
          ${option.icon ? `<span class="mt-0.5 shrink-0 text-zinc-400">${uiIcon(option.icon, { size: 13 })}</span>` : ''}
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(option.label)}</span>
            ${option.description ? `<span class="mt-0.5 block text-[10.5px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(option.description)}</span>` : ''}
          </span>
          ${isSelected ? `<span class="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400">${uiIcon('check', { size: 13 })}</span>` : ''}
        </li>`;
      })
      .join('');
    const body = filtered.length
      ? items
      : `<li role="option" aria-disabled="true" class="px-2.5 py-2 text-[11px] text-zinc-400">${escapeAttribute(this.emptyText)}</li>`;
    return `<ul id="${this._id}-listbox" role="listbox" aria-label="${escapeAttribute(this.placeholder)}"
      class="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">${body}</ul>`;
  }

  render() {
    this._applyHostClass('relative block');
    const filtered = this._filtered();
    if (this._active >= filtered.length) this._active = Math.max(0, filtered.length - 1);

    this.innerHTML = `${this._renderField()}${this._renderListbox(filtered)}`;

    const input = this.querySelector('[data-combo-input]');
    if (input) {
      if (this.contains(document.activeElement) && document.activeElement?.tagName === 'INPUT') input.focus();
      input.addEventListener('input', () => {
        this._query = input.value;
        this._open = true;
        this._active = 0;
        this.render();
      });
      input.addEventListener('focus', () => this._setOpen(true));
      input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          this._open = true;
          this._active = Math.min(this._active + 1, this._filtered().length - 1);
          this.render();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          this._active = Math.max(this._active - 1, 0);
          this.render();
        } else if (event.key === 'Enter') {
          const option = this._filtered()[this._active];
          if (option && this._open) {
            event.preventDefault();
            this._choose(option);
          }
        }
      });
    }
    const clear = this.querySelector('[data-combo-clear]');
    if (clear) {
      clear.addEventListener('click', () => {
        this._query = '';
        this._selected = null;
        this.render();
      });
    }
    this.querySelectorAll('[data-combo-index]').forEach((node) => {
      node.addEventListener('mousedown', (event) => event.preventDefault());
      node.addEventListener('click', () => this._choose(this._filtered()[Number(node.getAttribute('data-combo-index'))]));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('combo-select')) {
  customElements.define('combo-select', ComboBoxElement);
}
export default ComboBoxElement;
