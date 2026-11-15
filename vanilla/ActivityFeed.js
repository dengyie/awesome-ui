import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const KIND = {
  event: { icon: 'sparkles', iconClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300' },
  comment: { icon: 'user', iconClass: 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300' },
  merge: { icon: 'git-branch', iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300' },
  deploy: { icon: 'zap', iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300' },
  flag: { icon: 'star', iconClass: 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300' },
  alert: { icon: 'alert-triangle', iconClass: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300' },
};

/**
 * ActivityFeed - Vanilla Web Component
 * Usage: <activity-feed title="Recent activity"></activity-feed>
 * Properties: entries ({ id, kind, actor, action, target?, time, detail? }[])
 * Attributes: title
 */
export class ActivityFeedElement extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._entries = [];
  }

  get entries() {
    return this._entries;
  }

  set entries(value) {
    this._entries = Array.isArray(value) ? value : [];
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

    const rows = this._entries
      .map((entry) => {
        const kind = KIND[entry.kind] || KIND.event;
        return `<li class="relative flex items-start gap-3">
          <span class="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-900 ${kind.iconClass}">${uiIcon(kind.icon, { size: 12 })}</span>
          <div class="min-w-0 flex-1">
            <p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <span class="font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(entry.actor)}</span>
              ${escapeAttribute(entry.action)}
              ${entry.target ? `<span class="ml-1 rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(entry.target)}</span>` : ''}
            </p>
            ${entry.detail ? `<p class="mt-0.5 text-[10.5px] leading-relaxed text-zinc-400 dark:text-zinc-500">${escapeAttribute(entry.detail)}</p>` : ''}
          </div>
          <time class="shrink-0 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">${escapeAttribute(entry.time)}</time>
        </li>`;
      })
      .join('');

    this.innerHTML = `<section class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      ${title ? `<h3 class="mb-3 text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(title)}</h3>` : ''}
      <ol class="relative space-y-3.5 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-zinc-100 dark:before:bg-zinc-800">${rows}</ol>
    </section>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('activity-feed')) {
  customElements.define('activity-feed', ActivityFeedElement);
}
export default ActivityFeedElement;
