const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class TypingIndicatorElement extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'variant', 'size'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const label = this.getAttribute('label') || '';
    const variant = this.getAttribute('variant') || 'dots';
    const size = this.getAttribute('size') || 'md';

    const dotClass = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';
    const gapClass = size === 'sm' ? 'gap-1' : size === 'lg' ? 'gap-2' : 'gap-1.5';
    const animClass = variant === 'pulse' ? 'animate-pulse' : 'animate-bounce';

    const dots = [0, 1, 2]
      .map(
        (i) =>
          `<span class="${dotClass} rounded-full bg-current ${animClass}" style="animation-delay: ${i * 160}ms"></span>`
      )
      .join('');

    this.className = 'inline-flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400';
    this.setAttribute('role', 'status');
    this.setAttribute('aria-label', label || 'Loading');

    this.innerHTML = `
      <span class="inline-flex items-center ${gapClass}">${dots}</span>
      ${label ? `<span class="text-xs font-sans">${escapeAttribute(label)}</span>` : ''}
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('typing-indicator')) {
  customElements.define('typing-indicator', TypingIndicatorElement);
}
export default TypingIndicatorElement;
