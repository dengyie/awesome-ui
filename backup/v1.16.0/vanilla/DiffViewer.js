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

/**
 * Walks the diff once and produces render rows. Long runs of context lines
 * (> contextSize*2) become a collapsible gap that keeps `contextSize` lines
 * visible on each side; the hidden middle travels with the row so expanding
 * needs no second pass over the source.
 */
const buildRows = (lines, contextSize) => {
  const rows = [];
  let oldNo = 0;
  let newNo = 0;
  let contextRun = [];

  const pushLine = (entry) => {
    rows.push({ kind: 'line', line: entry.line, meta: LINE_STYLE.context, oldNo: entry.oldNo, newNo: entry.newNo, key: `l-${entry.oldNo}-${entry.newNo}` });
  };

  const flushContext = (isTail) => {
    if (contextRun.length <= contextSize * 2) {
      contextRun.forEach(pushLine);
    } else {
      const hidden = isTail
        ? contextRun.slice(contextSize)
        : contextRun.slice(contextSize, contextRun.length - contextSize);
      contextRun.slice(0, contextSize).forEach(pushLine);
      rows.push({ kind: 'collapsed', count: hidden.length, hidden, key: `gap-${rows.length}-${hidden.length}` });
      if (!isTail) contextRun.slice(contextRun.length - contextSize).forEach(pushLine);
    }
    contextRun = [];
  };

  lines.forEach((line) => {
    if (line.type !== 'add') oldNo += 1;
    if (line.type !== 'remove') newNo += 1;

    if (line.type === 'context') {
      contextRun.push({ line, oldNo, newNo });
      return;
    }
    flushContext(false);
    rows.push({
      kind: 'line',
      line,
      meta: LINE_STYLE[line.type] || LINE_STYLE.context,
      oldNo: line.type !== 'add' ? oldNo : '',
      newNo: line.type !== 'remove' ? newNo : '',
      key: `c-${rows.length}`,
    });
  });

  flushContext(true);
  return rows;
};

/**
 * DiffViewer - Vanilla Web Component
 * Usage: <diff-viewer filename="app.ts" language="ts"></diff-viewer>
 * Legacy: `lines` property/attr (JSON). Multi-file: `files` property
 * [{ filename, language?, lines }] renders a tab bar. Long unchanged context
 * runs fold into "⋯ N unchanged lines" rows that expand in place
 * (`context-size` attribute, default 3). Toggle state is internal view state.
 */
class DiffViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ['filename', 'language', 'show-line-numbers', 'context-size', 'lines', 'files'];
  }

  constructor() {
    super();
    this._lines = [];
    this._files = [];
    this._activeFileIdx = 0;
    this._expandedGaps = new Set();
  }

  get lines() {
    if (this._lines) return this._lines;
    try {
      return JSON.parse(this.getAttribute('lines') || '[]');
    } catch {
      return [];
    }
  }

  set lines(val) {
    this._lines = Array.isArray(val) ? val : [];
    this.render();
  }

  get files() {
    if (this._files) return this._files;
    try {
      return JSON.parse(this.getAttribute('files') || '[]');
    } catch {
      return [];
    }
  }

  set files(val) {
    this._files = Array.isArray(val) ? val : [];
    this._activeFileIdx = 0;
    this._expandedGaps = new Set();
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'lines') this._lines = null; // re-read from attribute
    if (name === 'files') {
      this._files = null; // re-read from attribute
      this._activeFileIdx = 0;
      this._expandedGaps = new Set();
    }
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
    const multiFile = this.files.length > 0;
    const activeIdx = multiFile ? Math.min(this._activeFileIdx, this.files.length - 1) : 0;
    const active = multiFile ? this.files[activeIdx] : null;
    const activeLines = active ? active.lines || [] : this.lines;
    const activeFilename = active ? active.filename : this.getAttribute('filename') || '';
    const activeLanguage = active ? active.language : this.getAttribute('language') || '';
    const showLineNumbers = this.getAttribute('show-line-numbers') !== 'false';
    const contextSize = Math.max(0, parseInt(this.getAttribute('context-size') || '3', 10) || 0);

    const added = activeLines.filter((l) => l.type === 'add').length;
    const removed = activeLines.filter((l) => l.type === 'remove').length;

    // Multi-file tab bar
    const tabsHtml = multiFile
      ? `<div role="tablist" class="flex gap-1 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 pt-1.5">
          ${this.files
            .map((file, idx) => {
              const isActive = idx === activeIdx;
              const fAdded = (file.lines || []).filter((l) => l.type === 'add').length;
              const fRemoved = (file.lines || []).filter((l) => l.type === 'remove').length;
              return `<button type="button" role="tab" aria-selected="${isActive}" data-file-idx="${idx}"
                  class="diff-tab flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-1.5 font-mono text-[11px] transition-colors ${
                    isActive
                      ? 'border border-b-0 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }">
                  <span class="max-w-[10rem] truncate">${escapeAttribute(file.filename)}</span>
                  <span class="text-emerald-600 dark:text-emerald-400">+${fAdded}</span>
                  <span class="text-rose-600 dark:text-rose-400">-${fRemoved}</span>
                </button>`;
            })
            .join('')}
        </div>`
      : '';

    const headerHtml = `
      <div class="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
        ${uiIcon('git-branch', { size: 14, className: 'text-zinc-400 shrink-0' })}
        ${activeFilename ? `<span class="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">${escapeAttribute(activeFilename)}</span>` : ''}
        ${activeLanguage ? `<span class="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">${escapeAttribute(activeLanguage)}</span>` : ''}
        <span class="ml-auto flex items-center gap-2 font-mono text-[11px]">
          <span class="text-emerald-600 dark:text-emerald-400">+${added}</span>
          <span class="text-rose-600 dark:text-rose-400">-${removed}</span>
        </span>
      </div>`;

    const rows = buildRows(activeLines, contextSize);

    const lineRow = (line, meta, oldNo, newNo) => `
      <div class="flex ${meta.row}">
        ${
          showLineNumbers
            ? `<span class="w-16 shrink-0 select-none px-2 text-right text-[11px] text-zinc-400 dark:text-zinc-600 tabular-nums">${oldNo} ${newNo}</span>`
            : ''
        }
        <span class="w-5 shrink-0 select-none text-center ${meta.gutter}">${meta.sign}</span>
        <span class="flex-1 min-w-0 whitespace-pre-wrap break-words pr-3">${escapeAttribute(line.content)}</span>
      </div>`;

    const rowsHtml = rows
      .map((row) => {
        if (row.kind === 'collapsed') {
          if (!this._expandedGaps.has(row.key)) {
            return `<button type="button" data-gap-key="${escapeAttribute(row.key)}"
                class="diff-gap-toggle flex w-full items-center gap-2 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors select-none">
                ${uiIcon('chevron-down', { size: 12 })}
                <span class="font-mono">⋯ ${row.count} unchanged lines</span>
              </button>`;
          }
          return `${(row.hidden || [])
            .map((entry) => lineRow(entry.line, LINE_STYLE.context, entry.oldNo, entry.newNo))
            .join('')}
            <button type="button" data-gap-key="${escapeAttribute(row.key)}"
              class="diff-gap-toggle flex w-full items-center gap-2 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors select-none">
              ${uiIcon('minus', { size: 12 })}
              <span class="font-mono">Collapse unchanged lines</span>
            </button>`;
        }
        return lineRow(row.line, row.meta, row.oldNo, row.newNo);
      })
      .join('');

    this._applyHostClass('block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden');
    this.innerHTML = `
      ${tabsHtml}
      ${headerHtml}
      <div class="overflow-x-auto text-[13px] font-mono leading-relaxed">
        ${rowsHtml || '<div class="p-4 text-center text-xs text-zinc-400">No changes</div>'}
      </div>`;

    this.querySelectorAll('.diff-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._activeFileIdx = parseInt(btn.getAttribute('data-file-idx') || '0', 10);
        this._expandedGaps = new Set();
        this.render();
      });
    });
    this.querySelectorAll('.diff-gap-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-gap-key');
        if (this._expandedGaps.has(key)) this._expandedGaps.delete(key);
        else this._expandedGaps.add(key);
        this.render();
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('diff-viewer')) {
  customElements.define('diff-viewer', DiffViewerElement);
}
export default DiffViewerElement;
