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
 * Tabs - Vanilla Web Component
 * Usage: <tabs-bar active-id="overview" variant="underline"></tabs-bar>
 * Properties: tabs (TabItem[])
 * Events: change (detail: { id })
 */
export class TabsElement extends HTMLElement {
  static get observedAttributes() {
    return ['active-id', 'variant', 'aria-label'];
  }

  constructor() {
    super();
    this._tabs = [];
    this._internalId = null;
  }

  get tabs() {
    return this._tabs;
  }

  set tabs(value) {
    this._tabs = Array.isArray(value) ? value : [];
    if (this._internalId === null) this._internalId = this._tabs[0] ? this._tabs[0].id : '';
    this.render();
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

  _current() {
    return this.getAttribute('active-id') ?? this._internalId ?? '';
  }

  _select(tab) {
    if (!tab || tab.disabled) return;
    if (!this.hasAttribute('active-id')) this._internalId = tab.id;
    this.render();
    this.dispatchEvent(new CustomEvent('change', { detail: { id: tab.id } }));
  }

  _move(event, index) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const enabled = this._tabs.map((tab, i) => ({ tab, i })).filter((entry) => !entry.tab.disabled);
    if (enabled.length === 0) return;
    const position = enabled.findIndex((entry) => entry.i === index);
    let next = position;
    if (event.key === 'ArrowRight') next = (position + 1) % enabled.length;
    if (event.key === 'ArrowLeft') next = (position - 1 + enabled.length) % enabled.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = enabled.length - 1;
    const target = enabled[next];
    if (target) {
      this._select(target.tab);
      const node = this.querySelector(`[data-tab-id="${target.tab.id}"]`);
      if (node) node.focus();
    }
  }

  render() {
    const pills = this.getAttribute('variant') === 'pills';
    this._applyHostClass(pills ? 'inline-flex' : 'flex');

    const current = this._current();
    const label = this.getAttribute('aria-label') || 'Tabs';

    const buttons = this._tabs
      .map((tab, index) => {
        const active = tab.id === current;
        const tone = pills
          ? active
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          : active
            ? '-mb-px border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : '-mb-px border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200';
        const shape = pills ? 'rounded-md px-3 py-1.5' : 'border-b-2 px-3 py-2';
        return `<button type="button" role="tab" id="tab-${escapeAttribute(tab.id)}" data-tab-id="${escapeAttribute(tab.id)}"
          aria-selected="${active}" aria-controls="panel-${escapeAttribute(tab.id)}" tabindex="${active ? 0 : -1}"
          ${tab.disabled ? 'disabled' : ''}
          class="inline-flex items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${shape} ${tone}">
          ${tab.icon ? uiIcon(tab.icon, { size: 13 }) : ''}
          <span>${escapeAttribute(tab.label)}</span>
          ${tab.badge !== undefined ? `<span class="rounded-full bg-zinc-100 px-1.5 text-[10px] tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(tab.badge)}</span>` : ''}
        </button>`;
      })
      .join('');

    this.innerHTML = `<div role="tablist" aria-label="${escapeAttribute(label)}" class="${
      pills
        ? 'inline-flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800'
        : 'flex items-center gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800'
    }">${buttons}</div>`;

    this.querySelectorAll('[data-tab-id]').forEach((node, index) => {
      const tab = this._tabs.find((entry) => String(entry.id) === node.getAttribute('data-tab-id'));
      node.addEventListener('click', () => this._select(tab));
      node.addEventListener('keydown', (event) => this._move(event, index));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tabs-bar')) {
  customElements.define('tabs-bar', TabsElement);
}
export default TabsElement;
