/**
 * ModelPricingCard - Vanilla Web Component
 * Usage: <model-pricing-card model-name="Glm 4.7 Flash" model-id="workers-ai/@cf/..." input-per-million="0.06" output-per-million="0.40"></model-pricing-card>
 * Attributes: model-name, model-id, input-per-million, output-per-million
 * Events: copy-id (detail {modelId})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const fmtPrice = (raw) => {
  const n = Number(raw);
  return raw !== null && Number.isFinite(n) ? `$ ${n.toFixed(2)} / million tokens` : '—';
};

export class ModelPricingCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['model-name', 'model-id', 'input-per-million', 'output-per-million'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const copyBtn = event.target.closest('[data-model-pricing-copy]');
        if (!copyBtn) return;
        const modelId = this.getAttribute('model-id') || '';
        if (modelId) this.dispatchEvent(new CustomEvent('copy-id', { detail: { modelId } }));
      });
    }
  }

  attributeChangedCallback() {
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const modelName = escapeAttribute(this.getAttribute('model-name') || '');
    const modelId = this.getAttribute('model-id') || '';
    const inputPrice = fmtPrice(this.getAttribute('input-per-million'));
    const outputPrice = fmtPrice(this.getAttribute('output-per-million'));

    this.innerHTML = `<div data-model-pricing-card class="w-full rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
  <h4 data-model-pricing-name class="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">${modelName}</h4>
  <dl class="mt-3 space-y-2.5 text-xs">
    <div class="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
      <dt class="shrink-0 text-zinc-500 dark:text-zinc-400">Model ID</dt>
      <dd data-model-pricing-id class="flex min-w-0 items-center gap-1.5 font-mono text-zinc-800 dark:text-zinc-200">
        <span class="truncate">${escapeAttribute(modelId || '—')}</span>
        ${modelId ? '<button type="button" data-model-pricing-copy aria-label="Copy model ID" class="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">⧉</button>' : ''}
      </dd>
    </div>
    <div data-model-pricing-input class="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
      <dt class="text-zinc-500 dark:text-zinc-400">Input pricing</dt>
      <dd class="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">${inputPrice}</dd>
    </div>
    <div data-model-pricing-output class="flex items-center justify-between gap-3">
      <dt class="text-zinc-500 dark:text-zinc-400">Output pricing</dt>
      <dd class="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">${outputPrice}</dd>
    </div>
  </dl>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('model-pricing-card')) {
  customElements.define('model-pricing-card', ModelPricingCardElement);
}

export default ModelPricingCardElement;
