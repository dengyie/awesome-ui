/**
 * ProfileHeader - Vanilla Web Component
 * Usage:
 *   <profile-header name="Ada Lovelace" handle="ada" headline="…" cover-class="from-indigo-500 to-sky-400"
 *     status-text="Available" tabs="Overview,Projects,Activity" active-tab="Overview"></profile-header>
 * Properties: stats, actions
 * Attributes: name, handle, headline, avatar-url, initials, cover-class, status-text, status-tone,
 *             tabs (comma-separated), active-tab
 * Events: action (detail: { label, variant }), tab-change (detail: { tab })
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const ACTION_VARIANT = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
  secondary:
    'border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
  ghost:
    'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400',
};

export class ProfileHeaderElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'name', 'handle', 'headline', 'avatar-url', 'initials', 'cover-class',
      'status-text', 'status-tone', 'tabs', 'active-tab',
    ];
  }

  constructor() {
    super();
    this._stats = [];
    this._actions = [];
  }

  get stats() {
    return this._stats;
  }

  set stats(value) {
    this._stats = Array.isArray(value) ? value : [];
    this.render();
  }

  get actions() {
    return this._actions;
  }

  set actions(value) {
    this._actions = Array.isArray(value) ? value : [];
    this.render();
  }

  get tabs() {
    return (this.getAttribute('tabs') || '').split(',').map((t) => t.trim()).filter(Boolean);
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
    const name = this.getAttribute('name') || '';
    const handle = this.getAttribute('handle') || '';
    const headline = this.getAttribute('headline') || '';
    const avatarUrl = this.getAttribute('avatar-url');
    const initialsAttr = this.getAttribute('initials');
    const coverClass = this.getAttribute('cover-class') || 'from-indigo-500 via-violet-500 to-sky-400';
    const statusText = this.getAttribute('status-text') || '';
    const statusTone = this.getAttribute('status-tone') === 'away' ? 'away' : 'ok';
    const tabs = this.tabs;
    const activeTab = this.getAttribute('active-tab') || (tabs[0] || '');

    const initials = ((initialsAttr || name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('') || '?').toUpperCase();

    const avatar = avatarUrl
      ? `<img src="${escapeAttribute(avatarUrl)}" alt="${escapeAttribute(name)}" class="h-16 w-16 rounded-full border-4 border-white object-cover dark:border-zinc-900" />`
      : `<span class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-lg font-bold text-indigo-600 dark:border-zinc-900 dark:bg-indigo-950/60 dark:text-indigo-300">${escapeAttribute(initials)}</span>`;

    const actionButtons = this._actions
      .map(
        (action) => `<button type="button" data-action-label="${escapeAttribute(action.label)}" data-action-variant="${escapeAttribute(action.variant || 'secondary')}"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${ACTION_VARIANT[action.variant || 'secondary']}">${escapeAttribute(action.label)}</button>`
      )
      .join('');

    const status = statusText
      ? `<p class="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full ${statusTone === 'ok' ? 'bg-emerald-500' : 'bg-zinc-400'}"></span>${escapeAttribute(statusText)}</p>`
      : '';

    const statsHtml = this._stats.length
      ? `<dl class="mt-3 flex flex-wrap gap-x-5 gap-y-1">${this._stats
          .map(
            (stat) => `<div class="flex items-baseline gap-1">
              <dt class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(stat.value)}</dt>
              <dd class="text-[11px] text-zinc-400">${escapeAttribute(stat.label)}</dd>
            </div>`
          )
          .join('')}</dl>`
      : '';

    const tabsHtml = tabs.length
      ? `<nav aria-label="Profile sections" class="-mb-px mt-4 flex gap-1 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800">${tabs
          .map((tab) => {
            const active = tab === activeTab;
            return `<button type="button" data-tab-label="${escapeAttribute(tab)}" ${active ? 'aria-current="page"' : ''}
              class="whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none ${
                active
                  ? 'border-indigo-600 text-zinc-900 dark:border-indigo-400 dark:text-zinc-50'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }">${escapeAttribute(tab)}</button>`;
          })
          .join('')}</nav>`
      : '';

    this.innerHTML = `<div class="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div class="relative h-28 bg-gradient-to-r ${escapeAttribute(coverClass)}">
        <span class="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">Pro</span>
      </div>
      <div class="px-5 pb-4">
        <div class="-mt-8 mb-3 flex items-end justify-between">
          ${avatar}
          <div class="flex items-center gap-1.5">${actionButtons}</div>
        </div>
        <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(name)}</h2>
        ${handle ? `<p class="text-xs text-zinc-400">@${escapeAttribute(handle)}</p>` : ''}
        ${headline ? `<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(headline)}</p>` : ''}
        ${status}
        ${statsHtml}
        ${tabsHtml}
      </div>
    </div>`;

    this.querySelectorAll('[data-action-label]').forEach((button) => {
      button.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('action', { detail: { label: button.getAttribute('data-action-label'), variant: button.getAttribute('data-action-variant') } }));
      });
    });
    this.querySelectorAll('[data-tab-label]').forEach((button) => {
      button.addEventListener('click', () => {
        this.setAttribute('active-tab', button.getAttribute('data-tab-label'));
        this.dispatchEvent(new CustomEvent('tab-change', { detail: { tab: button.getAttribute('data-tab-label') } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('profile-header')) {
  customElements.define('profile-header', ProfileHeaderElement);
}
export default ProfileHeaderElement;
