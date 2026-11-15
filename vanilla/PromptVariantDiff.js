/**
 * PromptVariantDiff - Vanilla Web Component
 * Usage: <prompt-variant-diff title="Prompt variants" variants='[...]'></prompt-variant-diff>
 * Attributes: title, variants (JSON: [{id,label,text}], requires exactly 2: base + compare)
 * Events: apply (detail {variant})
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

const extractVars = (text) =>
  (text.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []).map((v) => v.replace(/^\{\{\s*|\s*\}\}$/g, ''));

/** Render prompt text with {{var}} tokens as chips. */
const renderText = (text) =>
  text
    .split(/(\{\{\s*[\w.]+\s*\}\})/g)
    .map((part) =>
      /^\{\{/.test(part)
        ? `<span class="inline rounded bg-indigo-50 px-1 py-0.5 font-mono text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">${escapeAttribute(part.replace(/^\{\{\s*|\s*\}\}$/g, ''))}</span>`
        : escapeAttribute(part)
    )
    .join('');

export class PromptVariantDiffElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'variants'];
  }

  constructor() {
    super();
    this._bound = false;
    this._variants = [];
  }

  connectedCallback() {
    if (!this._variants.length) this._variants = parseJsonAttr(this.getAttribute('variants'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-variant-apply]');
        if (!btn) return;
        const panel = btn.closest('[data-variant-panel]');
        const variant = this._variants.find((v) => v.id === panel?.getAttribute('data-variant-panel'));
        if (variant) this.dispatchEvent(new CustomEvent('apply', { detail: { variant } }));
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'variants' && !this._variants.length) {
      this._variants = parseJsonAttr(this.getAttribute('variants'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get variants() { return this._variants; }
  set variants(v) {
    this._variants = Array.isArray(v) ? v.map((x) => ({ ...x })) : [];
    this.render();
  }

  render() {
    const variants = this._variants;
    const [base, compare] = variants;
    if (!base || !compare) {
      this.innerHTML = '';
      return;
    }
    const title = escapeAttribute(this.getAttribute('title') || 'Prompt variants');

    const baseVars = extractVars(base.text);
    const cmpVars = extractVars(compare.text);
    const addedVars = cmpVars.filter((v) => !baseVars.includes(v));
    const removedVars = baseVars.filter((v) => !cmpVars.includes(v));
    const changedText = base.text !== compare.text;

    const panels = variants.map((variant, index) => `
      <div data-variant-panel="${escapeAttribute(variant.id)}" class="flex flex-col p-4">
        <div class="flex items-center gap-2 pb-2">
          <span class="h-2 w-2 rounded-full ${index === 0 ? 'bg-zinc-400' : 'bg-violet-500'}" aria-hidden="true"></span>
          <span data-variant-label class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(variant.label)}</span>
          ${index === 0 ? '<span class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Base</span>' : ''}
        </div>
        <p data-variant-text class="min-h-16 flex-1 whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">${renderText(variant.text)}</p>
        <button type="button" data-variant-apply class="mt-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">Use this version</button>
      </div>`).join('');

    const varlist = addedVars.length > 0 || removedVars.length > 0
      ? `<div data-variant-varlist class="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          ${addedVars.map((v) => `<span data-var-added class="inline rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">+ ${escapeAttribute(v)}</span>`).join('')}
          ${removedVars.map((v) => `<span data-var-removed class="inline rounded bg-red-50 px-1.5 py-0.5 font-mono text-[11px] text-red-700 dark:bg-red-950/60 dark:text-red-300">− ${escapeAttribute(v)}</span>`).join('')}
        </div>`
      : '';

    this.innerHTML = `<div data-prompt-variant-diff class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${title}</span>
    <span class="flex items-center gap-2 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
      <span data-diff-added class="text-emerald-600 dark:text-emerald-400">+${addedVars.length}</span>
      <span data-diff-removed class="text-red-500 dark:text-red-400">−${removedVars.length}</span>
      ${changedText ? '<span data-diff-text class="text-amber-600 dark:text-amber-400">~text</span>' : ''}
    </span>
  </div>
  <div class="grid gap-0 divide-x divide-zinc-100 sm:grid-cols-2 dark:divide-zinc-800">${panels}</div>
  ${varlist}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('prompt-variant-diff')) {
  customElements.define('prompt-variant-diff', PromptVariantDiffElement);
}

export default PromptVariantDiffElement;
