import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const formatDuration = (ms) => {
  if (typeof ms !== 'number') return '';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
};

/**
 * ThinkingBlock - Vanilla Web Component
 * Usage: <thinking-block is-thinking duration="3.2"></thinking-block>
 * Optional: steps property [{ id, label, durationMs? }] renders a vertical
 * step timeline with connectors; collapsed state shows a one-line summary.
 */
class ThinkingBlock extends HTMLElement {
  static get observedAttributes() {
    return ["content", "is-thinking", "duration"];
  }

  connectedCallback() {
    if (this._expanded === undefined) this._expanded = this.hasAttribute("is-thinking");
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get steps() {
    if (this._steps) return this._steps;
    try {
      return JSON.parse(this.getAttribute('steps') || '[]');
    } catch {
      return [];
    }
  }

  set steps(value) {
    this._steps = Array.isArray(value) ? value : [];
    this.render();
  }

  render() {
    const isThinking = this.hasAttribute("is-thinking");
    const duration = this.getAttribute("duration");
    const content = this.getAttribute("content") || this.textContent || "";
    const steps = this.steps;
    const expanded = !!this._expanded;

    const runningStep = steps.find((step) => step.durationMs === undefined);
    const lastStep = steps[steps.length - 1];

    let summaryHtml = '';
    if (!expanded && steps.length) {
      summaryHtml = runningStep
        ? `<div class="px-3.5 pb-2.5 -mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
             <span class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
             <span class="truncate">${escapeAttribute(runningStep.label)}</span>
           </div>`
        : `<div class="px-3.5 pb-2.5 -mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
             <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
             <span class="truncate">${escapeAttribute(lastStep.label)}</span>
             ${lastStep.durationMs !== undefined ? `<span class="tabular-nums">${formatDuration(lastStep.durationMs)}</span>` : ''}
           </div>`;
    }

    const stepsHtml = steps
      .map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = step.durationMs !== undefined;
        return `
          <li class="relative pl-5">
            ${isLast ? '' : '<span aria-hidden="true" class="absolute left-[5px] top-4 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700"></span>'}
            <span class="absolute left-0 top-1.5">
              ${
                done
                  ? '<span class="block h-[11px] w-[11px] rounded-full bg-emerald-500"></span>'
                  : '<span class="block h-[11px] w-[11px] rounded-full border-2 border-amber-400 animate-pulse"></span>'
              }
            </span>
            <div class="pb-2.5 flex items-center gap-2">
              <span class="truncate ${done ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}">${escapeAttribute(step.label)}</span>
              ${done ? `<span class="ml-auto shrink-0 tabular-nums text-[10px] text-zinc-400 dark:text-zinc-500">${formatDuration(step.durationMs)}</span>` : ''}
            </div>
          </li>`;
      })
      .join('');

    this.innerHTML = `
      <div class="my-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs overflow-hidden transition-all">
        <button type="button" id="toggle-btn" aria-expanded="${expanded}" class="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium transition-colors select-none text-left">
          <div class="flex items-center gap-2">
            <span class="${isThinking ? 'animate-spin text-amber-500' : 'text-zinc-400'} inline-flex">${uiIcon('sparkles', { size: 14 })}</span>
            <span>${isThinking ? "Deeply thinking..." : duration ? `Thought for ${duration}s` : "Thought process"}</span>
          </div>
          <span id="chevron" class="inline-flex text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}">${uiIcon('chevron-down', { size: 14 })}</span>
        </button>
        ${summaryHtml}
        <div id="content-body" class="${expanded ? '' : 'hidden'} border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20">
          ${
            steps.length
              ? `<ol class="px-4 pt-3 pb-1">${stepsHtml}</ol><div class="px-4 py-3 border-t border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap text-[13px]">${escapeAttribute(content) || '<span class="italic text-zinc-400">Processing thoughts...</span>'}</div>`
              : `<div class="px-4 py-3 text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap text-[13px]">${escapeAttribute(content) || '<span class="italic text-zinc-400">Processing thoughts...</span>'}</div>`
          }
        </div>
      </div>
    `;

    this.querySelector("#toggle-btn").addEventListener("click", () => {
      this._expanded = !this._expanded;
      this.querySelector("#content-body").classList.toggle("hidden", !this._expanded);
      this.querySelector("#chevron").classList.toggle("rotate-180", this._expanded);
    });
  }
}

if (!customElements.get("thinking-block")) {
  customElements.define("thinking-block", ThinkingBlock);
}
export default ThinkingBlock;
