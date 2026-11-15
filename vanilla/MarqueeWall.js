/**
 * MarqueeWall - Vanilla Web Component
 * Usage: <marquee-wall speed-seconds="40"></marquee-wall> with `rows` property
 * Attributes: speed-seconds, paused
 * Properties: rows ({ name, handle?, text, anonymous? }[][]) — outer array = rows, alternating direction
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const AVATAR_TONES = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500'];

const initialsOf = (name) =>
  String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');

export class MarqueeWallElement extends HTMLElement {
  static get observedAttributes() {
    return ['speed-seconds', 'paused'];
  }

  constructor() {
    super();
    this._rows = [];
  }

  get rows() {
    return this._rows;
  }

  set rows(value) {
    this._rows = Array.isArray(value) ? value : [];
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
    const rows = this._rows;
    if (!rows.length) {
      this.innerHTML = '';
      return;
    }
    const speed = Number(this.getAttribute('speed-seconds')) || 40;
    const paused = this.hasAttribute('paused');

    const rowHtml = rows
      .map((row, rowIndex) => {
        const reverse = rowIndex % 2 === 1;
        const cards = [...row, ...row]
          .map((card, index) => {
            const tone = AVATAR_TONES[index % AVATAR_TONES.length];
            return `<figure data-marquee-card="${index}" class="w-64 shrink-0 rounded-xl bg-white p-4 dark:bg-zinc-900">
              <div class="flex items-center gap-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${tone}">${escapeAttribute(initialsOf(card.name))}</span>
                <span class="min-w-0">
                  <span class="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(card.name)}</span>
                  ${card.handle && !card.anonymous ? `<span class="block truncate text-[11px] text-indigo-500">@${escapeAttribute(card.handle)}</span>` : ''}
                </span>
              </div>
              <blockquote class="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">${escapeAttribute(card.text)}</blockquote>
            </figure>`;
          })
          .join('');
        return `<div data-marquee-row="${rowIndex}" class="flex overflow-hidden">
          <div class="flex min-w-full shrink-0 gap-3 marquee-track" style="animation:marquee-scroll ${speed}s linear infinite${reverse ? ' reverse' : ''};animation-play-state:${paused ? 'paused' : 'running'}">${cards}</div>
        </div>`;
      })
      .join('');

    this.innerHTML = `<div data-marquee-wall class="space-y-3 overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-violet-950 via-zinc-950 to-zinc-950 p-4 dark:border-zinc-800">
      ${rowHtml}
      <style>@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } } .marquee-track:hover { animation-play-state: paused !important; }</style>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('marquee-wall')) {
  customElements.define('marquee-wall', MarqueeWallElement);
}
export default MarqueeWallElement;
