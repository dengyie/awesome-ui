/**
 * ApprovalCard - Vanilla Web Component
 * Usage: <approval-card title="…" approved-count="1" due-date="3 Jun" decision="pending"></approval-card> with `approvers` property
 * Attributes: title, approved-count, due-date, decision (approved|rejected|pending), note
 * Properties: approvers ({ initials, tone? }[])
 * Events: approve, reject, request-change
 */
import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_AVATAR = {
  indigo: 'bg-indigo-600',
  emerald: 'bg-emerald-600',
  rose: 'bg-rose-600',
  amber: 'bg-amber-500',
};

const DECISION_TONE = {
  approved: { icon: 'check-circle', className: 'text-emerald-600' },
  rejected: { icon: 'circle-x', className: 'text-rose-600' },
  pending: { icon: 'clock', className: 'text-zinc-400' },
};

export class ApprovalCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'approved-count', 'due-date', 'decision', 'note'];
  }

  constructor() {
    super();
    this._approvers = [];
  }

  get approvers() {
    return this._approvers;
  }

  set approvers(value) {
    this._approvers = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    this._applyHostClass('block');
    const title = this.getAttribute('title') || '';
    const approvedCount = Number(this.getAttribute('approved-count')) || 0;
    const dueDate = this.getAttribute('due-date') || '';
    const note = this.getAttribute('note') || '';
    const decision = this.getAttribute('decision') || 'pending';
    const tone = DECISION_TONE[decision] || DECISION_TONE.pending;
    const hasButtons = decision === 'pending'
      ? true
      : typeof this.onApprove === 'function' || typeof this.onReject === 'function';

    this.innerHTML = `<section data-approval-card class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-start justify-between gap-3">
        <h3 class="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          ${uiIcon('check-circle', { size: 14, className: 'shrink-0 text-zinc-400' })}
          <span class="truncate">${escapeAttribute(title)}</span>
        </h3>
        <span class="shrink-0 font-mono text-[10px] font-medium text-zinc-400">${approvedCount}/${this._approvers.length}</span>
      </div>
      <dl class="mt-3 space-y-2 text-xs">
        <div class="flex items-center gap-2">
          <dt class="w-20 shrink-0 text-zinc-400">Approvers</dt>
          <dd class="flex items-center -space-x-1">
            ${this._approvers
              .map(
                (approver) =>
                  `<span title="${escapeAttribute(approver.initials)}" class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white ring-2 ring-white dark:border-zinc-900 dark:ring-zinc-900 ${TONE_AVATAR[approver.tone || 'indigo']}">${escapeAttribute(approver.initials)}</span>`,
              )
              .join('')}
            ${
              typeof this.onRequestChange === 'function'
                ? `<button type="button" data-request-change aria-label="Add approver" class="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-600">${uiIcon('plus', { size: 11 })}</button>`
                : ''
            }
          </dd>
        </div>
        ${
          dueDate
            ? `<div class="flex items-center gap-2">
          <dt class="w-20 shrink-0 text-zinc-400">Due date</dt>
          <dd class="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-200">${uiIcon('calendar', { size: 12, className: 'text-zinc-400' })}${escapeAttribute(dueDate)}</dd>
        </div>`
            : ''
        }
        <div class="flex items-center gap-2">
          <dt class="w-20 shrink-0 text-zinc-400">Decision</dt>
          <dd data-approval-decision class="flex items-center gap-1 font-medium capitalize ${tone.className}">
            ${uiIcon(tone.icon, { size: 12 })}${escapeAttribute(decision)}
          </dd>
        </div>
      </dl>
      ${
        note
          ? `<p class="mt-3 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">${escapeAttribute(note)}</p>`
          : ''
      }
      ${
        hasButtons
          ? `<div class="mt-3 flex items-center gap-2">
        ${
          hasButtons && decision !== 'rejected'
            ? '<button type="button" data-approval-reject class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Request change</button>'
            : ''
        }
        ${
          hasButtons && decision !== 'approved'
            ? '<button type="button" data-approval-approve class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Approve</button>'
            : ''
        }
      </div>`
          : ''
      }
    </section>`;

    const fire = (type, propName) => {
      if (typeof this[propName] === 'function') this[propName]();
      this.dispatchEvent(new CustomEvent(type));
    };
    const approveBtn = this.querySelector('[data-approval-approve]');
    if (approveBtn) approveBtn.addEventListener('click', () => fire('approve', 'onApprove'));
    const rejectBtn = this.querySelector('[data-approval-reject]');
    if (rejectBtn) rejectBtn.addEventListener('click', () => fire('reject', 'onReject'));
    const addBtn = this.querySelector('[data-request-change]');
    if (addBtn) addBtn.addEventListener('click', () => fire('request-change', 'onRequestChange'));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('approval-card')) {
  customElements.define('approval-card', ApprovalCardElement);
}
export default ApprovalCardElement;
