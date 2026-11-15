/**
 * AiTemplatePicker - Vanilla Web Component
 * Usage: <ai-template-picker title="AI Research templates"></ai-template-picker>
 * Attributes: open, title, active-category, categories (JSON), templates (JSON)
 * Events: category-change (detail {id}), try (detail {template}), run-custom, close
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const parseJsonAttr = (raw, fallback) => {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

export class AiTemplatePickerElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'active-category', 'categories', 'templates'];
  }

  constructor() {
    super();
    this._bound = false;
    this._templates = [];
    this._categories = [];
  }

  connectedCallback() {
    if (!this._templates.length) this._templates = parseJsonAttr(this.getAttribute('templates'), []);
    if (!this._categories.length) this._categories = parseJsonAttr(this.getAttribute('categories'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-ai-templates-close]')) {
          this.setAttribute('open', 'false');
          this.dispatchEvent(new CustomEvent('close'));
          return;
        }
        const catEl = event.target.closest('[data-ai-templates-category]');
        if (catEl) {
          const id = catEl.getAttribute('data-ai-templates-category');
          this.setAttribute('active-category', id);
          this.dispatchEvent(new CustomEvent('category-change', { detail: { id } }));
          return;
        }
        const tryEl = event.target.closest('[data-ai-template-try]');
        if (tryEl) {
          const card = tryEl.closest('[data-ai-template-card]');
          const tpl = this._templates.find((t) => t.id === card?.getAttribute('data-ai-template-card'));
          if (tpl) this.dispatchEvent(new CustomEvent('try', { detail: { template: tpl } }));
          return;
        }
        if (event.target.closest('[data-ai-templates-custom]')) {
          this.dispatchEvent(new CustomEvent('run-custom'));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'templates' && !this._templates.length) {
      this._templates = parseJsonAttr(this.getAttribute('templates'), []);
    }
    if (name === 'categories' && !this._categories.length) {
      this._categories = parseJsonAttr(this.getAttribute('categories'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get templates() { return this._templates; }
  set templates(v) {
    this._templates = Array.isArray(v) ? v.map((t) => ({ ...t })) : [];
    this.render();
  }

  get categories() { return this._categories; }
  set categories(v) {
    this._categories = Array.isArray(v) ? v.map((c) => ({ ...c })) : [];
    this.render();
  }

  render() {
    if ((this.getAttribute('open') || 'true') === 'false') {
      this.innerHTML = '';
      return;
    }
    const title = escapeAttribute(this.getAttribute('title') || 'AI Research templates');
    const active = this.getAttribute('active-category') || this._categories[0]?.id || '';
    const visible = active ? this._templates.filter((t) => !t.category || t.category === active) : this._templates;

    const rail = this._categories.length > 0 ? `
      <div data-ai-templates-rail class="w-52 shrink-0 overflow-y-auto border-r border-zinc-200 p-2 dark:border-zinc-800">
        ${this._categories.map((cat) => `
        <button type="button" data-ai-templates-category="${escapeAttribute(cat.id)}" class="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors ${cat.id === active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60'}">
          <span class="min-w-0 truncate">${escapeAttribute(cat.label)}</span>
          <span class="ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${cat.id === active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}">${cat.count}</span>
        </button>`).join('')}
      </div>` : '';

    const grid = visible.length === 0
      ? '<p data-ai-templates-empty class="px-2 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">No templates in this category yet.</p>'
      : `<div data-ai-templates-grid class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        ${visible.map((tpl) => `
        <div data-ai-template-card="${escapeAttribute(tpl.id)}" class="flex flex-col rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <p class="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-100">${escapeAttribute(tpl.name)}</p>
          <p class="mt-1.5 flex-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(tpl.description)}</p>
          <button type="button" data-ai-template-try class="mt-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">Try it</button>
        </div>`).join('')}
      </div>`;

    this.innerHTML = `<div data-ai-template-picker role="dialog" aria-modal="true" class="w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
    <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</h3>
    <button type="button" data-ai-templates-close aria-label="Close" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
  </div>
  <div class="flex max-h-[26rem]">${rail}<div class="min-w-0 flex-1 overflow-y-auto p-3">${grid}</div></div>
  <div class="flex items-center justify-end border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
    <button type="button" data-ai-templates-custom class="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">Run custom AI prompt</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ai-template-picker')) {
  customElements.define('ai-template-picker', AiTemplatePickerElement);
}

export default AiTemplatePickerElement;
