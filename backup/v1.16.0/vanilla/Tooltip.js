const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const SIDE_CLASS = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
  right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
};

let tooltipSeq = 0;

/**
 * Tooltip - Vanilla Web Component
 * Usage: <tooltip-hint content="Save changes"><button>…</button></tooltip-hint>
 * Attributes: content, side (top|bottom|left|right)
 */
export class TooltipElement extends HTMLElement {
  static get observedAttributes() {
    return ['content', 'side'];
  }

  constructor() {
    super();
    this._content = null;
    this._side = null;
    this._tooltipId = `tooltip-${++tooltipSeq}`;
  }

  get content() {
    return this._content ?? this.getAttribute('content') ?? '';
  }

  set content(value) {
    this._content = value == null ? '' : String(value);
    this.render();
  }

  get side() {
    const value = this._side ?? this.getAttribute('side') ?? 'top';
    return SIDE_CLASS[value] ? value : 'top';
  }

  set side(value) {
    this._side = value;
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
    const existing = this.querySelector(`#${this._tooltipId}`);
    const slots = Array.from(this.childNodes).filter((node) => node !== existing);

    this._applyHostClass('group relative inline-flex');
    this.setAttribute('aria-describedby', this._tooltipId);

    this.innerHTML = `<span id="${this._tooltipId}" role="tooltip"
      class="pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 ${SIDE_CLASS[this.side]}">${escapeAttribute(this.content)}</span>`;

    const tooltip = this.firstChild;
    slots.forEach((node) => this.insertBefore(node, tooltip));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tooltip-hint')) {
  customElements.define('tooltip-hint', TooltipElement);
}
export default TooltipElement;
