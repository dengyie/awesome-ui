import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ToolApprovalCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['tool-name', 'description', 'risk', 'status'];
  }

  constructor() {
    super();
    this._args = null;
  }

  get args() {
    return this._args;
  }

  set args(val) {
    this._args = val;
    this.render();
  }

  get status() {
    return this.getAttribute('status') || 'pending';
  }

  set status(val) {
    this.setAttribute('status', String(val));
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _resolve(nextStatus, eventName) {
    this.dispatchEvent(new CustomEvent(eventName));
    this.status = nextStatus;
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
    const toolName = this.getAttribute('tool-name') || '';
    const description = this.getAttribute('description') || '';
    const isHigh = this.getAttribute('risk') === 'high';
    const status = this.status;

    const argsText =
      typeof this._args === 'string' ? this._args : this._args ? JSON.stringify(this._args, null, 2) : '';

    const actionsHtml =
      status === 'pending'
        ? `
          <button type="button" class="approval-approve flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
            ${uiIcon('check', { size: 13 })}
            Approve
          </button>
          <button type="button" class="approval-reject flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors">
            ${uiIcon('x', { size: 13 })}
            Reject
          </button>`
        : `
          <span class="flex items-center gap-1.5 text-xs font-medium ${
            status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }">
            ${uiIcon(status === 'approved' ? 'check-circle' : 'circle-x', { size: 14 })}
            ${status === 'approved' ? 'Approved' : 'Rejected'}
          </span>`;

    this._applyHostClass(`block rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden ${
      isHigh ? 'border-amber-300 dark:border-amber-700/60' : 'border-zinc-200 dark:border-zinc-700'
    }`);
    this.innerHTML = `
      <div class="flex items-center gap-2.5 px-3.5 py-2.5">
        <span class="p-1.5 rounded-lg shrink-0 ${
          isHigh
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
        }">${uiIcon(isHigh ? 'lock' : 'tool', { size: 15 })}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            <span class="font-mono truncate">${escapeAttribute(toolName)}</span>
            ${
              isHigh
                ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">high risk</span>'
                : ''
            }
          </div>
          ${description ? `<div class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${escapeAttribute(description)}</div>` : ''}
        </div>
      </div>
      ${
        argsText
          ? `<pre class="mx-3.5 mb-2.5 max-h-40 overflow-auto rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words">${escapeAttribute(argsText)}</pre>`
          : ''
      }
      <div class="flex items-center gap-2 px-3.5 pb-3">${actionsHtml}</div>`;

    const approveBtn = this.querySelector('.approval-approve');
    const rejectBtn = this.querySelector('.approval-reject');
    if (approveBtn) approveBtn.addEventListener('click', () => this._resolve('approved', 'approve'));
    if (rejectBtn) rejectBtn.addEventListener('click', () => this._resolve('rejected', 'reject'));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tool-approval-card')) {
  customElements.define('tool-approval-card', ToolApprovalCardElement);
}
export default ToolApprovalCardElement;
