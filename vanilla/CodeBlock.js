import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const escapeText = escapeAttribute;

export class CodeBlockElement extends HTMLElement {
  static get observedAttributes() {
    return ['language', 'filename', 'show-line-numbers', 'show-copy', 'max-height'];
  }

  constructor() {
    super();
    this._code = '';
    this._copied = false;
  }

  get code() {
    return this._code;
  }

  set code(val) {
    this._code = String(val ?? '');
    this.render();
  }

  connectedCallback() {
    if (!this._code && this.textContent.trim()) {
      this._code = this.textContent;
    }
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  async _handleCopy() {
    try {
      await navigator.clipboard.writeText(this._code);
      this._copied = true;
      this.render();
      setTimeout(() => {
        this._copied = false;
        this.render();
      }, 2000);
    } catch {
      this._copied = false;
    }
  }

  render() {
    const language = this.getAttribute('language') || '';
    const filename = this.getAttribute('filename') || '';
    const showLineNumbers = this.hasAttribute('show-line-numbers');
    const showCopy = this.getAttribute('show-copy') !== 'false';
    const maxHeight = this.getAttribute('max-height') || '';
    const customClass = this.getAttribute('class') || '';

    const lines = this._code.replace(/\n$/, '').split('\n');

    const bodyHtml = showLineNumbers
      ? `<code>${lines
          .map(
            (line, idx) =>
              `<div class="flex"><span class="w-8 shrink-0 select-none text-right pr-3 text-zinc-400 dark:text-zinc-600">${idx + 1}</span><span class="flex-1">${escapeText(line) || ' '}</span></div>`
          )
          .join('')}</code>`
      : `<code>${escapeText(this._code)}</code>`;

    this.innerHTML = `
      <div class="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-sm font-mono ${escapeAttribute(customClass)}">
        ${(language || filename || showCopy) ? `
          <div class="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60">
            <div class="flex items-center gap-2 min-w-0 text-xs text-zinc-500 dark:text-zinc-400">
              ${uiIcon('terminal', { size: 13, className: 'shrink-0' })}
              ${filename ? `<span class="font-medium text-zinc-700 dark:text-zinc-300 truncate">${escapeText(filename)}</span>` : ''}
              ${language ? `<span class="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[10px] uppercase font-semibold tracking-wide shrink-0">${escapeText(language)}</span>` : ''}
            </div>
            ${showCopy ? `
              <button
                type="button"
                class="cb-copy-btn flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors shrink-0"
                aria-label="Copy code"
              >
                ${uiIcon(this._copied ? 'check' : 'copy', { size: 13, className: this._copied ? 'text-emerald-500' : '' })}
                <span class="hidden sm:inline">${this._copied ? 'Copied' : 'Copy'}</span>
              </button>
            ` : ''}
          </div>
        ` : ''}
        <div class="overflow-auto p-3.5 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200" ${maxHeight ? `style="max-height: ${escapeAttribute(maxHeight)}"` : ''}>
          <pre class="whitespace-pre">${bodyHtml}</pre>
        </div>
      </div>
    `;

    const copyBtn = this.querySelector('.cb-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this._handleCopy());
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('code-block')) {
  customElements.define('code-block', CodeBlockElement);
}
export default CodeBlockElement;
