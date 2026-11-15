import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

/**
 * HeroSection - Vanilla Web Component
 * Usage: <hero-section title="Ship faster" eyebrow="New" primary-cta="Start" align="center"></hero-section>
 * Properties: highlights (string[])
 * Events: primary, secondary
 */
export class HeroSectionElement extends HTMLElement {
  static get observedAttributes() {
    return ['eyebrow', 'title', 'description', 'primary-cta', 'secondary-cta', 'align'];
  }

  constructor() {
    super();
    this._highlights = [];
  }

  get highlights() {
    return this._highlights;
  }

  set highlights(value) {
    this._highlights = Array.isArray(value) ? value : [];
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

    const eyebrow = this.getAttribute('eyebrow') || '';
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const primaryCta = this.getAttribute('primary-cta') || '';
    const secondaryCta = this.getAttribute('secondary-cta') || '';
    const centered = (this.getAttribute('align') || 'center') !== 'left';

    const eyebrowHtml = eyebrow
      ? `<span class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
          ${uiIcon('sparkles', { size: 12 })}${escapeAttribute(eyebrow)}</span>`
      : '';

    const descriptionHtml = description
      ? `<p class="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 ${centered ? 'mx-auto' : ''}">${escapeAttribute(description)}</p>`
      : '';

    const buttons = [
      primaryCta
        ? `<button type="button" class="hero-primary rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950">${escapeAttribute(primaryCta)}</button>`
        : '',
      secondaryCta
        ? `<button type="button" class="hero-secondary rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">${escapeAttribute(secondaryCta)}</button>`
        : '',
    ].join('');
    const buttonsHtml = buttons
      ? `<div class="mt-6 flex flex-wrap items-center gap-2 ${centered ? 'justify-center' : ''}">${buttons}</div>`
      : '';

    const highlightsHtml = this._highlights.length
      ? `<ul class="mt-6 flex flex-wrap gap-x-4 gap-y-2 ${centered ? 'justify-center' : ''}">
          ${this._highlights
            .map(
              (item) =>
                `<li class="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">${uiIcon('check', { size: 13, className: 'shrink-0 text-emerald-500' })}${escapeAttribute(item)}</li>`
            )
            .join('')}
        </ul>`
      : '';

    this.innerHTML = `<section class="flex flex-col ${centered ? 'items-center text-center' : 'items-start text-left'}">
      ${eyebrowHtml}
      <h1 class="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">${escapeAttribute(title)}</h1>
      ${descriptionHtml}
      ${buttonsHtml}
      ${highlightsHtml}
    </section>`;

    const primary = this.querySelector('.hero-primary');
    if (primary) primary.addEventListener('click', () => this.dispatchEvent(new CustomEvent('primary')));
    const secondary = this.querySelector('.hero-secondary');
    if (secondary) secondary.addEventListener('click', () => this.dispatchEvent(new CustomEvent('secondary')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('hero-section')) {
  customElements.define('hero-section', HeroSectionElement);
}
export default HeroSectionElement;
