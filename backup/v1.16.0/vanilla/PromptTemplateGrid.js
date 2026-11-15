import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class PromptTemplateGridElement extends HTMLElement {
  constructor() {
    super();
    this._templates = [];
  }

  get templates() {
    return this._templates;
  }

  set templates(val) {
    this._templates = Array.isArray(val) ? val : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    if (this._templates.length === 0) {
      this.innerHTML = '';
      return;
    }

    this._applyHostClass('grid grid-cols-1 sm:grid-cols-2 gap-3');
    this.innerHTML = this._templates
      .map(
        (t) => `
        <button
          type="button"
          data-template-id="${escapeAttribute(t.id)}"
          class="template-card group flex flex-col text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-2 w-full">
            <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">${escapeAttribute(t.title)}</span>
            ${
              t.tag
                ? `<span class="ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">${escapeAttribute(t.tag)}</span>`
                : ''
            }
          </div>
          ${t.description ? `<div class="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">${escapeAttribute(t.description)}</div>` : ''}
          <div class="mt-2 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            ${uiIcon('arrow-right', { size: 12 })}
            Use template
          </div>
        </button>`
      )
      .join('');

    this.querySelectorAll('.template-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-template-id');
        const template = this._templates.find((t) => String(t.id) === String(id));
        if (template) this.dispatchEvent(new CustomEvent('use', { detail: template }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('prompt-template-grid')) {
  customElements.define('prompt-template-grid', PromptTemplateGridElement);
}
export default PromptTemplateGridElement;
