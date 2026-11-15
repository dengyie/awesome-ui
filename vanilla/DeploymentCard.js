/**
 * DeploymentCard - Vanilla Web Component
 * Usage: <deployment-card deploy-id="Deploy #128" status="building" sha="2d300ac" commit-message="Add files via upload" created-at="Just now · 4s"></deployment-card>
 * Attributes: deploy-id, status (queued|building|live|failed|canceled), sha, commit-message, created-at, source, url, cancel-label, visit-label
 * Events: cancel, visit (detail {url})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_TONE = {
  queued: { pill: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300', dot: 'bg-zinc-400', label: 'Queued' },
  building: { pill: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', dot: 'bg-sky-500 animate-pulse', label: 'Building' },
  live: { pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Live' },
  failed: { pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300', dot: 'bg-rose-500', label: 'Failed' },
  canceled: { pill: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400', dot: 'bg-zinc-400', label: 'Canceled' },
};

export class DeploymentCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['deploy-id', 'status', 'sha', 'commit-message', 'created-at', 'source', 'url', 'cancel-label', 'visit-label'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-deploy-cancel]')) this.dispatchEvent(new CustomEvent('cancel'));
        if (event.target.closest('[data-deploy-visit]')) this.dispatchEvent(new CustomEvent('visit', { detail: { url: this.getAttribute('url') || '' } }));
      });
    }
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
    const deployId = this.getAttribute('deploy-id') || '';
    const status = this.getAttribute('status') || 'queued';
    const sha = this.getAttribute('sha') || '';
    const commitMessage = this.getAttribute('commit-message') || '';
    const createdAt = this.getAttribute('created-at') || '';
    const source = this.getAttribute('source') || '';
    const url = this.getAttribute('url') || '';
    const cancelLabel = this.getAttribute('cancel-label') || 'Cancel deploy';
    const visitLabel = this.getAttribute('visit-label') || 'Visit';
    const tone = STATUS_TONE[status] || STATUS_TONE.queued;
    const terminal = status === 'live' || status === 'failed' || status === 'canceled';

    this.innerHTML = `<div data-deployment-card class="w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(deployId)}</p>
            <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone.pill}">
              <span class="h-1.5 w-1.5 rounded-full ${tone.dot}"></span>
              ${tone.label}
            </span>
          </div>
          <p class="mt-1 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(sha)}${commitMessage ? `<span class="text-zinc-700 dark:text-zinc-200"> ${escapeAttribute(commitMessage)}</span>` : ''}</p>
          <p class="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute([source, createdAt].filter(Boolean).join(' · '))}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          ${!terminal ? `<button type="button" data-deploy-cancel class="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/60 dark:text-rose-400 dark:hover:bg-rose-950/40">${escapeAttribute(cancelLabel)}</button>` : ''}
          ${terminal && url ? `<button type="button" data-deploy-visit class="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">${escapeAttribute(visitLabel)} ↗</button>` : ''}
        </div>
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('deployment-card')) {
  customElements.define('deployment-card', DeploymentCardElement);
}
export default DeploymentCardElement;
