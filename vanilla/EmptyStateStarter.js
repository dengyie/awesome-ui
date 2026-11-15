/**
 * EmptyStateStarter - Vanilla Web Component
 * Usage: <empty-state-starter title="No forms yet" description="..." action-label="Create form" variant="dashed"></empty-state-starter>
 * Attributes: title, description, action-label, variant (plain|dashed|card), size (md|sm), action-variant (solid|outline|link)
 * Events: action
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const ACTION_CLASS = {
  solid: 'rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700',
  outline: 'rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50',
  link: 'text-sm font-medium text-blue-600 hover:underline',
};

export class EmptyStateStarterElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'action-label', 'variant', 'size', 'action-variant'];
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
        if (event.target.closest('[data-empty-action]')) {
          this.dispatchEvent(new CustomEvent('action'));
        }
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  get illustration() { return this._illustration || ''; }
  set illustration(v) {
    this._illustration = v || '';
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
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const actionLabel = this.getAttribute('action-label') || '';
    const variant = this.getAttribute('variant') || 'plain';
    const size = this.getAttribute('size') || 'md';
    const actionVariant = this.getAttribute('action-variant') || 'solid';

    const shell =
      variant === 'dashed'
        ? 'rounded-lg border-2 border-dashed border-zinc-300'
        : variant === 'card'
          ? 'rounded-xl border border-zinc-200 bg-white shadow-sm'
          : '';
    const pad = shell ? (size === 'sm' ? 'p-5' : 'p-8') : '';
    const hostClass = `flex flex-col items-center justify-center text-center ${shell} ${pad}`;
    this._applyHostClass(hostClass);

    const illustration = this._illustration
      ? `<div data-empty-illustration class="mb-3 flex items-center justify-center ${size === 'sm' ? 'text-3xl' : 'text-5xl'}" aria-hidden="true">${this._illustration}</div>`
      : '';
    const action = actionLabel
      ? `<button type="button" data-empty-action class="mt-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${ACTION_CLASS[actionVariant] || ACTION_CLASS.solid}">${escapeAttribute(actionLabel)}</button>`
      : '';

    this.innerHTML = `<div data-empty-starter class="${hostClass}">
  ${illustration}
  <p data-empty-title class="${size === 'sm' ? 'text-sm' : 'text-xl'} font-semibold text-zinc-900">${escapeAttribute(title)}</p>
  ${description ? `<p class="mt-1 max-w-xs leading-relaxed text-zinc-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}">${escapeAttribute(description)}</p>` : ''}
  ${action}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('empty-state-starter')) {
  customElements.define('empty-state-starter', EmptyStateStarterElement);
}

export default EmptyStateStarterElement;
