import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE = {
  info: {
    icon: 'info',
    iconClass: 'text-indigo-500',
    wrapClass: 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/40',
    titleClass: 'text-indigo-800 dark:text-indigo-200',
    bodyClass: 'text-indigo-700 dark:text-indigo-300',
    actionClass: 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200',
    dismissClass: 'text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300',
    role: 'status',
  },
  success: {
    icon: 'check-circle',
    iconClass: 'text-emerald-500',
    wrapClass: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40',
    titleClass: 'text-emerald-800 dark:text-emerald-200',
    bodyClass: 'text-emerald-700 dark:text-emerald-300',
    actionClass: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200',
    dismissClass: 'text-emerald-400 hover:text-emerald-600 dark:text-emerald-500 dark:hover:text-emerald-300',
    role: 'status',
  },
  warning: {
    icon: 'alert-triangle',
    iconClass: 'text-amber-500',
    wrapClass: 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40',
    titleClass: 'text-amber-800 dark:text-amber-200',
    bodyClass: 'text-amber-700 dark:text-amber-300',
    actionClass: 'text-amber-600 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200',
    dismissClass: 'text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300',
    role: 'alert',
  },
  danger: {
    icon: 'circle-x',
    iconClass: 'text-rose-500',
    wrapClass: 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40',
    titleClass: 'text-rose-800 dark:text-rose-200',
    bodyClass: 'text-rose-700 dark:text-rose-300',
    actionClass: 'text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200',
    dismissClass: 'text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300',
    role: 'alert',
  },
};

/**
 * AlertBanner - Vanilla Web Component
 * Usage: <alert-banner tone="warning" title="…" description="…"></alert-banner>
 * Properties: (none; driven by attributes)
 * Attributes: tone, title, description, action-text, dismissible
 * Events: action, dismiss
 */
export class AlertBannerElement extends HTMLElement {
  static get observedAttributes() {
    return ['tone', 'title', 'description', 'action-text', 'dismissible'];
  }

  constructor() {
    super();
    this._title = null;
    this._description = null;
    this._actionText = null;
  }

  get title() {
    return this._title ?? this.getAttribute('title') ?? '';
  }

  set title(value) {
    this._title = value == null ? '' : String(value);
    this.render();
  }

  get description() {
    return this._description ?? this.getAttribute('description') ?? '';
  }

  set description(value) {
    this._description = value == null ? '' : String(value);
    this.render();
  }

  get actionText() {
    return this._actionText ?? this.getAttribute('action-text') ?? '';
  }

  set actionText(value) {
    this._actionText = value == null ? '' : String(value);
    this.render();
  }

  get tone() {
    const value = this.getAttribute('tone') || 'info';
    return TONE[value] ? value : 'info';
  }

  get dismissible() {
    return this.hasAttribute('dismissible');
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
    const styles = TONE[this.tone];
    const title = this.title;
    const description = this.description;
    const actionText = this.actionText;

    const actions = [
      actionText
        ? `<button type="button" data-alert-action class="rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${styles.actionClass}">${escapeAttribute(actionText)}</button>`
        : '',
      this.dismissible
        ? `<button type="button" data-alert-dismiss aria-label="Dismiss" class="rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${styles.dismissClass}">${uiIcon('x', { size: 13 })}</button>`
        : '',
    ].join('');

    this.innerHTML = `<div role="${styles.role}" class="flex items-start gap-2.5 rounded-lg border px-3.5 py-3 ${styles.wrapClass}">
      ${uiIcon(styles.icon, { size: 16, className: `mt-0.5 shrink-0 ${styles.iconClass}` })}
      <div class="min-w-0 flex-1">
        <p class="text-[13px] font-semibold ${styles.titleClass}">${escapeAttribute(title)}</p>
        ${description ? `<p class="mt-0.5 text-[11.5px] leading-relaxed ${styles.bodyClass}">${escapeAttribute(description)}</p>` : ''}
      </div>
      ${actions ? `<div class="flex shrink-0 items-center gap-1.5">${actions}</div>` : ''}
    </div>`;

    const actionButton = this.querySelector('[data-alert-action]');
    if (actionButton) {
      actionButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('action')));
    }
    const dismissButton = this.querySelector('[data-alert-dismiss]');
    if (dismissButton) {
      dismissButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('dismiss')));
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('alert-banner')) {
  customElements.define('alert-banner', AlertBannerElement);
}
export default AlertBannerElement;
