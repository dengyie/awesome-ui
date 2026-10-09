import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_META = {
  pending: { icon: 'clock', cls: 'text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800' },
  running: { icon: 'loader', cls: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60', pulse: true },
  done: { icon: 'check-circle', cls: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60' },
  error: { icon: 'circle-x', cls: 'text-rose-500 bg-rose-100 dark:bg-rose-950/60' },
};

export class AgentStepTimelineElement extends HTMLElement {
  constructor() {
    super();
    this._steps = [];
  }

  get steps() {
    return this._steps;
  }

  set steps(val) {
    this._steps = Array.isArray(val) ? val : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this._steps.length === 0) {
      this.innerHTML = '';
      return;
    }

    this.className = 'block';
    const items = this._steps
      .map((step, i) => {
        const meta = STATUS_META[step.status] || STATUS_META.pending;
        const isLast = i === this._steps.length - 1;
        return `
          <li class="relative flex gap-3">
            ${
              !isLast
                ? `<span aria-hidden="true" class="absolute left-[13px] top-7 bottom-[-16px] w-px ${
                    step.status === 'done' ? 'bg-emerald-300 dark:bg-emerald-800' : 'bg-zinc-200 dark:bg-zinc-700'
                  }"></span>`
                : ''
            }
            <span class="relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${meta.cls}">
              ${uiIcon(meta.icon, { size: 15, className: meta.pulse ? 'animate-spin' : '' })}
            </span>
            <div class="flex-1 min-w-0 pb-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium ${
                  step.status === 'pending' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'
                }">${escapeAttribute(step.title)}</span>
                ${step.duration ? `<span class="text-[10px] font-mono text-zinc-400">${escapeAttribute(step.duration)}</span>` : ''}
              </div>
              ${step.description ? `<div class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(step.description)}</div>` : ''}
            </div>
          </li>`;
      })
      .join('');

    this.innerHTML = `<ol class="relative space-y-4">${items}</ol>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('agent-step-timeline')) {
  customElements.define('agent-step-timeline', AgentStepTimelineElement);
}
export default AgentStepTimelineElement;
