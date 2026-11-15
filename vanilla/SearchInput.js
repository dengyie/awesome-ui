import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

/**
 * SearchInput - Vanilla Web Component
 * Usage: <search-field placeholder="Search…" shortcut="⌘K"></search-field>
 * Properties: value
 * Attributes: value, placeholder, shortcut, loading, autofocus
 * Events: change (detail: { value }), search (detail: { value }), clear
 */
export class SearchInputElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'placeholder', 'shortcut', 'loading', 'autofocus'];
  }

  constructor() {
    super();
    this._value = null;
  }

  get value() {
    if (this._value !== null) return this._value;
    return this.getAttribute('value') || '';
  }

  set value(value) {
    this._value = value == null ? '' : String(value);
    this.render();
  }

  get placeholder() {
    return this.getAttribute('placeholder') || 'Search…';
  }

  get loading() {
    return this.hasAttribute('loading');
  }

  connectedCallback() {
    this.render();
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

  render() {
    this._applyHostClass('block');
    const current = this.value;
    const loading = this.loading;
    const shortcut = this.getAttribute('shortcut') || '';

    const suffix = loading
      ? `<span class="shrink-0 text-zinc-400">${uiIcon('loader', { size: 13, className: 'animate-spin' })}</span>`
      : current
        ? `<button type="button" data-search-clear aria-label="Clear search" class="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">${uiIcon('x', { size: 12 })}</button>`
        : shortcut
          ? `<kbd class="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">${escapeAttribute(shortcut)}</kbd>`
          : '';

    this.innerHTML = `<div class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <span class="shrink-0 text-zinc-400">${uiIcon('search', { size: 13 })}</span>
      <input data-search-input type="text" role="searchbox" aria-label="${escapeAttribute(this.placeholder)}"
        value="${escapeAttribute(current)}" placeholder="${escapeAttribute(this.placeholder)}"
        class="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100" />
      ${suffix}
    </div>`;

    const input = this.querySelector('[data-search-input]');
    if (input) {
      input.addEventListener('input', () => {
        this._value = input.value;
        this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
        this.render();
        const fresh = this.querySelector('[data-search-input]');
        if (fresh && this.contains(document.activeElement)) {
          fresh.focus();
          fresh.setSelectionRange(fresh.value.length, fresh.value.length);
        }
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.dispatchEvent(new CustomEvent('search', { detail: { value: this.value } }));
        } else if (event.key === 'Escape' && this.value) {
          this._value = '';
          this.dispatchEvent(new CustomEvent('clear'));
          this.render();
        }
      });
    }
    const clear = this.querySelector('[data-search-clear]');
    if (clear) {
      clear.addEventListener('click', () => {
        this._value = '';
        this.dispatchEvent(new CustomEvent('clear'));
        this.render();
        const fresh = this.querySelector('[data-search-input]');
        if (fresh) fresh.focus();
      });
    }
    if (this.hasAttribute('autofocus')) {
      const fresh = this.querySelector('[data-search-input]');
      if (fresh) fresh.focus();
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('search-field')) {
  customElements.define('search-field', SearchInputElement);
}
export default SearchInputElement;
