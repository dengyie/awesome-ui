import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const BASE_BUTTON =
  'flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * RichToolbar - Vanilla Web Component
 * Usage: <rich-toolbar></rich-toolbar>
 * Properties: groups (RichToolbarGroup[])
 * Events: action (detail: item id)
 */
export class RichToolbarElement extends HTMLElement {
  constructor() {
    super();
    this._groups = [];
  }

  get groups() {
    return this._groups;
  }

  set groups(value) {
    this._groups = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
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

    const groups = this._groups
      .map((group, groupIndex) => {
        const buttons = group.items
          .map((item) => {
            const tone = item.active
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800';
            const title = item.shortcut ? `${item.label} (${item.shortcut})` : item.label;
            const inner = item.text
              ? `<span class="font-semibold leading-none">${escapeAttribute(item.text)}</span>`
              : uiIcon(item.icon || 'square', { size: 15 });
            return `<button type="button" class="toolbar-item ${BASE_BUTTON} ${tone}"
              data-action="${escapeAttribute(item.id)}" aria-label="${escapeAttribute(item.label)}"
              ${item.active ? 'aria-pressed="true"' : ''} ${item.disabled ? 'disabled' : ''}
              title="${escapeAttribute(title)}">${inner}</button>`;
          })
          .join('');
        const divider =
          groupIndex > 0
            ? '<span aria-hidden="true" class="mx-0.5 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700"></span>'
            : '';
        return `${divider}<div role="group" aria-label="${escapeAttribute(group.label || group.id)}" class="flex items-center gap-0.5">${buttons}</div>`;
      })
      .join('');

    this.innerHTML = `<div role="toolbar" aria-label="Formatting"
      class="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">${groups}</div>`;

    this.querySelectorAll('.toolbar-item').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.hasAttribute('disabled')) return;
        this.dispatchEvent(new CustomEvent('action', { detail: button.getAttribute('data-action') }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('rich-toolbar')) {
  customElements.define('rich-toolbar', RichToolbarElement);
}
export default RichToolbarElement;
