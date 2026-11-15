/**
 * EditableHeading - Vanilla Web Component
 * Usage: <editable-heading value="My list" meta="<span>List · 42 members</span>"></editable-heading>
 * Attributes: value, size (md|lg), breadcrumb (HTML), meta (HTML)
 * Property: value
 * Events: change (detail {value}), cancel
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class EditableHeadingElement extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'size', 'breadcrumb', 'meta'];
  }

  constructor() {
    super();
    this._editing = false;
    this._draft = '';
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const display = event.target.closest('[data-heading-display]');
        if (display) {
          this._draft = this.value;
          this._editing = true;
          this.render();
          const input = this.querySelector('[data-heading-input]');
          if (input) {
            input.focus();
            input.select();
          }
        }
      });
      this.addEventListener('keydown', (event) => {
        const input = event.target;
        if (!input || !input.hasAttribute || !input.hasAttribute('data-heading-input')) return;
        if (event.key === 'Enter') {
          this._commit(input.value);
        } else if (event.key === 'Escape') {
          this._editing = false;
          this.render();
          this.dispatchEvent(new CustomEvent('cancel'));
        }
      });
      this.addEventListener('focusout', (event) => {
        const input = event.target;
        if (input && input.hasAttribute && input.hasAttribute('data-heading-input') && this._editing) {
          this._commit(input.value);
        }
      });
    }
  }

  attributeChangedCallback(name) {
    this.render();
  }

  get value() {
    return this._value !== undefined ? this._value : this.getAttribute('value') || 'Untitled';
  }

  set value(v) {
    this._value = v;
    this.setAttribute('value', v || '');
    this.render();
  }

  _commit(raw) {
    const next = String(raw || '').trim() || this.value;
    const changed = next !== this.value;
    this._value = next;
    this.setAttribute('value', next);
    this._editing = false;
    this.render();
    if (changed) this.dispatchEvent(new CustomEvent('change', { detail: { value: next } }));
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
    const size = this.getAttribute('size') || 'lg';
    const sizeClass = size === 'lg' ? 'text-2xl' : 'text-base';
    const breadcrumb = this.getAttribute('breadcrumb') || '';
    const meta = this.getAttribute('meta') || '';
    const hostClass = '';
    this._applyHostClass(hostClass);

    const heading = this._editing
      ? `<input data-heading-input type="text" value="${escapeAttribute(this._draft)}" class="w-full rounded-md border-2 border-teal-500 bg-yellow-50 px-2 py-1 font-semibold text-zinc-900 outline-none ${sizeClass}"/>`
      : `<button type="button" data-heading-display title="Click to rename" class="-mx-2 w-full rounded-md px-2 py-1 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${sizeClass}">${escapeAttribute(this.value)}</button>`;

    this.innerHTML = `<div data-editable-heading>
${breadcrumb ? `<div class="mb-1 text-xs text-zinc-400">${breadcrumb}</div>` : ''}
${heading}
${meta ? `<div class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">${meta}</div>` : ''}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('editable-heading')) {
  customElements.define('editable-heading', EditableHeadingElement);
}

export default EditableHeadingElement;
