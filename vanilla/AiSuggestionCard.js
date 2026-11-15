/**
 * AiSuggestionCard - Proactive AI suggestion card: sparkle avatar, message
 * paragraph, follow-up action chips and a dismiss close button (Mindtrip).
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

const DEFAULT_MESSAGE =
  'Looking ahead to tomorrow in Tokyo. Want a quick rundown of the plan and a weather check?';
const DEFAULT_CHIPS = () => [
  'Weather for tomorrow',
  'Summarize tomorrow',
  'View Senso-ji details',
];

class AiSuggestionCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['message', 'chips'];
  }

  constructor() {
    super();
    this._bound = false;
    this._message = DEFAULT_MESSAGE;
    this._chips = [];
  }

  connectedCallback() {
    if (!this._message || this._message === DEFAULT_MESSAGE) {
      this._message = this.getAttribute('message') || DEFAULT_MESSAGE;
    }
    if (!this._chips.length) {
      this._chips = parseJsonAttr(this.getAttribute('chips'), DEFAULT_CHIPS());
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
    if (name === 'message' && newValue) {
      this._message = newValue;
    }
    if (name === 'chips' && !this._chips.length) {
      this._chips = parseJsonAttr(this.getAttribute('chips'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get message() {
    return this._message;
  }
  set message(value) {
    this._message = String(value ?? '');
    this.setAttribute('message', this._message);
    this._render();
  }

  get chips() {
    return this._chips;
  }
  set chips(value) {
    this._chips = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const closeEl = event.target.closest('[data-ai-suggestion-close]');
    if (closeEl) {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      return;
    }
    const chipEl = event.target.closest('[data-ai-suggestion-chip]');
    if (chipEl) {
      this.dispatchEvent(new CustomEvent('chip-click', { detail: { chip: chipEl.textContent.trim() }, bubbles: true }));
    }
  }

  _render() {
    const chipsHtml = this._chips
      .map(
        (chip) => `
        <button type="button" data-ai-suggestion-chip class="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800">${escapeAttribute(chip)}</button>`
      )
      .join('');

    this.innerHTML = `
      <div data-ai-suggestion-card class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-start gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">✦</span>
          <p data-ai-suggestion-message class="flex-1 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._message)}</p>
          <button type="button" data-ai-suggestion-close aria-label="Dismiss suggestion" class="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
        </div>
        ${this._chips.length ? `<div class="mt-3 flex flex-wrap gap-2">${chipsHtml}</div>` : ''}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ai-suggestion-card')) {
  customElements.define('ai-suggestion-card', AiSuggestionCardElement);
}

export default AiSuggestionCardElement;
