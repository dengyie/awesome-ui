import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class SettingsPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['sections', 'active-id', 'saving', 'save-text', 'allow-save'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'active-id' && this._sections) this._current = this.getAttribute('active-id') || this._current;
    this.render();
  }

  get sections() {
    if (this._sections) return this._sections;
    try {
      return JSON.parse(this.getAttribute('sections') || '[]');
    } catch {
      return [];
    }
  }

  set sections(value) {
    this._sections = Array.isArray(value) ? value : [];
    if (!this._current) this._current = this.getAttribute('active-id') || this._sections[0]?.id || '';
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
    const sections = this.sections;
    this._applyHostClass('block');

    if (!sections.length) {
      this.innerHTML = '';
      return;
    }

    if (!this._current) this._current = this.getAttribute('active-id') || sections[0].id;
    const current = sections.find((item) => item.id === this._current) || sections[0];
    const saving = this.getAttribute('saving') === 'true';
    const saveText = this.getAttribute('save-text') || 'Save changes';
    const allowSave = this.hasAttribute('allow-save') ? this.getAttribute('allow-save') !== 'false' : true;

    const nav = sections
      .map((item) => {
        const active = item.id === current.id;
        return `<button type="button" data-section="${escapeAttribute(item.id)}" aria-current="${active ? 'page' : 'false'}"
          class="settings-nav flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
            active
              ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200'
          }">
          ${item.icon ? uiIcon(item.icon, { size: 14 }) : ''}
          <span class="whitespace-nowrap">${escapeAttribute(item.title)}</span>
        </button>`;
      })
      .join('');

    const items = (current.items || [])
      .map(
        (item) => `
        <div class="flex items-start justify-between gap-4 px-4 py-3">
          <div class="min-w-0">
            <div class="text-xs text-zinc-800 dark:text-zinc-200">${escapeAttribute(item.label)}</div>
            ${item.description ? `<div class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(item.description)}</div>` : ''}
          </div>
          <div class="flex shrink-0 items-center gap-2">
            ${item.value ? `<span class="max-w-[12rem] truncate text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">${escapeAttribute(item.value)}</span>` : ''}
            ${
              item.actionText
                ? `<button type="button" data-item="${escapeAttribute(item.id)}" class="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(item.actionText)}</button>`
                : ''
            }
          </div>
        </div>`)
      .join('');

    this.innerHTML = `
      <div class="md:flex md:gap-6">
        <nav class="flex gap-1 overflow-x-auto pb-2 md:w-44 md:shrink-0 md:flex-col md:overflow-visible md:pb-0">${nav}</nav>
        <div class="mt-3 min-w-0 flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:mt-0">
          <div class="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(current.title)}</div>
            ${current.description ? `<div class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(current.description)}</div>` : ''}
          </div>
          <div class="divide-y divide-zinc-100 dark:divide-zinc-800">${items}</div>
          ${
            allowSave
              ? `<div class="flex justify-end border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
                   <button type="button" data-save ${saving ? 'disabled' : ''}
                     class="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900">
                     ${saving ? `<span class="animate-spin inline-flex">${uiIcon('loader', { size: 12 })}</span>` : ''}
                     ${escapeAttribute(saveText)}
                   </button>
                 </div>`
              : ''
          }
        </div>
      </div>`;

    this.querySelectorAll('[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-section');
        this._current = id;
        this.dispatchEvent(new CustomEvent('section-change', { detail: { id } }));
        this.render();
      });
    });

    this.querySelectorAll('[data-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = (current.items || []).find((entry) => entry.id === btn.getAttribute('data-item'));
        this.dispatchEvent(new CustomEvent('item-action', { detail: { sectionId: current.id, item } }));
      });
    });

    const save = this.querySelector('[data-save]');
    if (save) {
      save.addEventListener('click', () => this.dispatchEvent(new CustomEvent('save', { detail: { id: current.id } })));
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('settings-panel')) {
  customElements.define('settings-panel', SettingsPanelElement);
}
export default SettingsPanelElement;
