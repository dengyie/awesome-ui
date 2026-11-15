/**
 * ModelComparePane - Vanilla Web Component
 * Usage: <model-compare-pane prompt="..." model-a="GPT-5" model-b="Claude"></model-compare-pane>
 * Attributes: prompt, model-a, model-b, vote-label-a, vote-label-b, vote-label-tie
 * Properties: outputA/outputB (string), statusA/statusB ('done'|'streaming'|'error')
 * Events: vote (detail {choice: 'A'|'B'|'tie'})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ModelComparePaneElement extends HTMLElement {
  static get observedAttributes() {
    return ['prompt', 'model-a', 'model-b', 'vote-label-a', 'vote-label-b', 'vote-label-tie'];
  }

  constructor() {
    super();
    this._outputA = '';
    this._outputB = '';
    this._statusA = 'done';
    this._statusB = 'done';
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-compare-vote]');
        if (btn) {
          const choice = btn.getAttribute('data-compare-vote');
          this.dispatchEvent(new CustomEvent('vote', { detail: { choice } }));
        }
      });
    }
  }

  get outputA() { return this._outputA; }
  set outputA(v) { this._outputA = String(v || ''); this.render(); }
  get outputB() { return this._outputB; }
  set outputB(v) { this._outputB = String(v || ''); this.render(); }
  get statusA() { return this._statusA; }
  set statusA(v) { this._statusA = String(v || 'done'); this.render(); }
  get statusB() { return this._statusB; }
  set statusB(v) { this._statusB = String(v || 'done'); this.render(); }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before outputs are captured.
    if (this._outputA === '' && this._outputB === '' && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const prompt = escapeAttribute(this.getAttribute('prompt') || '');
    const modelA = escapeAttribute(this.getAttribute('model-a') || 'Model A');
    const modelB = escapeAttribute(this.getAttribute('model-b') || 'Model B');
    const voteLabelA = escapeAttribute(this.getAttribute('vote-label-a') || 'A is better');
    const voteLabelB = escapeAttribute(this.getAttribute('vote-label-b') || 'B is better');
    const voteLabelTie = escapeAttribute(this.getAttribute('vote-label-tie') || 'Tie');
    const ERROR_TEXT = 'Generation failed — try again.';

    const column = (side) => {
      const model = side === 'a' ? modelA : modelB;
      const output = side === 'a' ? this._outputA : this._outputB;
      const status = side === 'a' ? this._statusA : this._statusB;
      const statusChip = status === 'streaming'
        ? `<span data-compare-status="${side}" class="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">streaming<span class="flex gap-0.5" aria-hidden="true"><span class="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]"></span><span class="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]"></span><span class="h-1 w-1 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]"></span></span></span>`
        : status === 'error'
          ? `<span data-compare-status="${side}" class="text-[11px] font-medium text-red-600 dark:text-red-400">error</span>`
          : '';
      return `
        <div data-compare-col="${side}" class="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div class="flex items-center justify-between">
            <span data-compare-model="${side}" class="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-900">${model}</span>
            ${statusChip}
          </div>
          <p data-compare-output="${side}" class="mt-2 min-h-16 whitespace-pre-wrap text-sm leading-relaxed ${status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-100'}">${status === 'error' ? ERROR_TEXT : escapeAttribute(output)}</p>
        </div>`;
    };

    this.innerHTML = `<div data-model-compare class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  ${prompt ? `<p data-compare-prompt class="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-zinc-800 dark:bg-indigo-950/40 dark:text-zinc-100"><span class="mr-1.5 font-semibold text-indigo-700 dark:text-indigo-300">Prompt</span>${prompt}</p>` : ''}
  <div class="grid gap-3 md:grid-cols-2">${column('a')}${column('b')}</div>
  <div data-compare-votebar class="mt-3 grid grid-cols-3 gap-2">
    <button type="button" data-compare-vote="A" class="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">👈 ${voteLabelA}</button>
    <button type="button" data-compare-vote="tie" class="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200">🤝 ${voteLabelTie}</button>
    <button type="button" data-compare-vote="B" class="rounded-md border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-200">👉 ${voteLabelB}</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('model-compare-pane')) {
  customElements.define('model-compare-pane', ModelComparePaneElement);
}

export default ModelComparePaneElement;
