import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const ratingOf = (testimonial) => Math.max(0, Math.min(5, Math.round(testimonial.rating ?? 0)));

/**
 * TestimonialGrid - Vanilla Web Component
 * Usage: <testimonial-grid columns="3"></testimonial-grid>
 * Properties: testimonials (Testimonial[])
 * Events: select (detail: testimonial)
 */
export class TestimonialGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['columns'];
  }

  constructor() {
    super();
    this._testimonials = [];
  }

  get testimonials() {
    return this._testimonials;
  }

  set testimonials(value) {
    this._testimonials = Array.isArray(value) ? value : [];
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

    if (this._testimonials.length === 0) {
      this.innerHTML = `<div class="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">No testimonials yet.</div>`;
      return;
    }

    const columns = this.getAttribute('columns') === '2' ? 2 : 3;
    const gridClass = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';

    const cards = this._testimonials
      .map((testimonial) => {
        const rating = ratingOf(testimonial);
        const stars =
          rating > 0
            ? `<div class="flex items-center gap-0.5" aria-label="${rating} out of 5 stars">${Array.from(
                { length: 5 },
                (_, index) =>
                  uiIcon('star', {
                    size: 13,
                    className: index < rating ? 'text-amber-500' : 'text-zinc-200 dark:text-zinc-700',
                  })
              ).join('')}</div>`
            : '';
        const avatar = testimonial.avatar
          ? `<img src="${escapeAttribute(testimonial.avatar)}" alt="" class="h-7 w-7 shrink-0 rounded-full object-cover" />`
          : `<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">${escapeAttribute(initials(testimonial.name))}</span>`;
        const meta = [testimonial.role, testimonial.company].filter(Boolean).join(', ');
        return `<figure class="testimonial-card flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          data-testimonial="${escapeAttribute(testimonial.id)}">
          ${stars}
          <blockquote class="mt-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">“${escapeAttribute(testimonial.quote)}”</blockquote>
          <figcaption class="mt-4 flex items-center gap-2">
            ${avatar}
            <span class="min-w-0">
              <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(testimonial.name)}</span>
              ${meta ? `<span class="block truncate text-[10px] text-zinc-400">${escapeAttribute(meta)}</span>` : ''}
            </span>
          </figcaption>
        </figure>`;
      })
      .join('');

    this.innerHTML = `<div class="grid gap-4 ${gridClass}">${cards}</div>`;

    this.querySelectorAll('.testimonial-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-testimonial');
        const testimonial = this._testimonials.find((entry) => String(entry.id) === String(id));
        if (testimonial) this.dispatchEvent(new CustomEvent('select', { detail: testimonial }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('testimonial-grid')) {
  customElements.define('testimonial-grid', TestimonialGridElement);
}
export default TestimonialGridElement;
