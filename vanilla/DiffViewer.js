import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const LINE_STYLE = {
  add: { row: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', gutter: 'text-emerald-500', sign: '+' },
  remove: { row: 'bg-rose-500/10 text-rose-700 dark:text-rose-300', gutter: 'text-rose-500', sign: '-' },
  context: { row: 'text-zinc-600 dark:text-zinc-400', gutter: 'text-zinc-300 dark:text-zinc-600', sign: ' ' },
};

export class DiffViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ['filename', 'language', 'show-line-numbers'];
  }

  constructor() {
    super();
    this._lines = [];
  }

  get lines() {
    return this._lines;
  }

  set lines(val) {
    this._lines = Array.isArray(val) ? val : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
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
    const filename = this.getAttribute('filename') || '';
    const language = this.getAttribute('language') || '';
    const showLineNumbers = this.getAttribute('show-line-numbers') !== 'false';

    const added = this._lines.filter((l) => l.type === 'add').length;
    const removed = this._lines.filter((l) => l.type === 'remove').length;

    const headerHtml = `
      <div class="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
        ${uiIcon('git-branch', { size: 14, className: 'text-zinc-400 shrink-0' })}
        ${filename ? `<span class="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">${escapeAttribute(filename)}</span>` : ''}
        ${language ? `<span class="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">${escapeAttribute(language)}</span>` : ''}
        <span class="ml-auto flex items-center gap-2 font-mono text-[11px]">
          <span class="text-emerald-600 dark:text-emerald-400">+${added}</span>
          <span class="text-rose-600 dark:text-rose-400">-${removed}</span>
        </span>
      </div>`;

    let oldLine = 0;
    let newLine = 0;
    const rowsHtml = this._lines
      .map((line) => {
        const meta = LINE_STYLE[line.type] || LINE_STYLE.context;
        if (line.type !== 'add') oldLine += 1;
        if (line.type !== 'remove') newLine += 1;
        return `
          <div class="flex ${meta.row}">
            ${
              showLineNumbers
                ? `<span class="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">${line.type !== 'add' ? oldLine : ''} ${line.type !== 'remove' ? newLine : ''}</span>`
                : ''
            }
            <span class="w-5 shrink-0 select-none text-center ${meta.gutter}">${meta.sign}</span>
            <span class="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">${escapeAttribute(line.content)}</span>
          </div>`;
      })
      .join('');

    this._applyHostClass('block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden');
    this.innerHTML = `
      ${headerHtml}
      <div class="overflow-x-auto text-[13px] font-mono leading-relaxed">
        ${rowsHtml || '<div class="p-4 text-center text-xs text-zinc-400">No changes</div>'}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('diff-viewer')) {
  customElements.define('diff-viewer', DiffViewerElement);
}
export default DiffViewerElement;
