/**
 * AiNoteAnswer - Voicenotes "Ask AI" answer card: a waveform question row,
 * the answer paragraph, an "Other sources" link list and a Copy pill.
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

class AiNoteAnswerElement extends HTMLElement {
  static get observedAttributes() {
    return ['question', 'answer', 'sources', 'waveform'];
  }

  constructor() {
    super();
    this._bound = false;
    this._sources = [];
    this._waveform = [];
  }

  connectedCallback() {
    if (!this._sources.length) {
      this._sources = parseJsonAttr(this.getAttribute('sources'), []);
    }
    if (!this._waveform.length) {
      this._waveform = parseJsonAttr(this.getAttribute('waveform'), []);
    }
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'sources' && !this._sources.length) {
      this._sources = parseJsonAttr(this.getAttribute('sources'), []);
    }
    if (name === 'waveform' && !this._waveform.length) {
      this._waveform = parseJsonAttr(this.getAttribute('waveform'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get question() {
    return this.getAttribute('question') ?? 'What improvements should I prioritize for Homepage?';
  }
  set question(value) {
    this.setAttribute('question', value);
  }

  get answer() {
    return this.getAttribute('answer') ?? '';
  }
  set answer(value) {
    this.setAttribute('answer', value);
  }

  get sources() {
    return this._sources;
  }
  set sources(value) {
    this._sources = Array.isArray(value) ? value : [];
    this._render();
  }

  get waveform() {
    return this._waveform;
  }
  set waveform(value) {
    this._waveform = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-note-answer-play]')) {
      this.dispatchEvent(new CustomEvent('play', { bubbles: true }));
      return;
    }
    if (event.target.closest('[data-note-answer-copy]')) {
      this.dispatchEvent(new CustomEvent('copy', { detail: { answer: this.answer }, bubbles: true }));
      return;
    }
    const sourceEl = event.target.closest('[data-note-answer-source]');
    if (sourceEl) {
      const source = this._sources.find((s) => String(s) === sourceEl.getAttribute('data-note-answer-source-text'));
      this.dispatchEvent(new CustomEvent('source-click', { detail: { source: source ?? sourceEl.textContent }, bubbles: true }));
    }
  }

  _render() {
    const bars = this._waveform.length
      ? this._waveform
      : Array.from({ length: 48 }, (_, i) => 30 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70));
    const wave = bars
      .map((h) => `<span class="w-[3px] shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" style="height:${Math.max(15, Math.min(100, h))}%"></span>`)
      .join('');
    const sources = this._sources.length
      ? `<div data-note-answer-sources class="mt-4">
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Other sources</span>
            <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></span>
          </div>
          ${this._sources
            .map(
              (s) => `
            <button type="button" data-note-answer-source data-note-answer-source-text="${escapeAttribute(s)}" class="mt-2 flex w-full items-center gap-1.5 truncate text-left text-xs text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span aria-hidden="true" class="shrink-0">↗</span>
              <span class="truncate">${escapeAttribute(s)}</span>
            </button>`
            )
            .join('')}
        </div>`
      : '';

    this.innerHTML = `
      <div data-note-answer-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-note-answer-question class="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">
          <button type="button" data-note-answer-play aria-label="Play question audio" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">▶</button>
          <div data-note-answer-waveform class="flex h-6 min-w-0 flex-1 items-center gap-[2px]" aria-hidden="true">${wave}</div>
        </div>
        <p data-note-answer-question-text class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(this.question)}</p>
        <p data-note-answer-text class="mt-3 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">${escapeAttribute(this.answer)}</p>
        ${sources}
        <div class="mt-4">
          <button type="button" data-note-answer-copy class="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <span aria-hidden="true">⧉</span>
            Copy
          </button>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ai-note-answer')) {
  customElements.define('ai-note-answer', AiNoteAnswerElement);
}

export default AiNoteAnswerElement;
