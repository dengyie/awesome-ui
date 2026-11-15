/**
 * VoiceOrb - Vanilla Web Component
 * Usage: <voice-orb state="listening" size="md" muted="false"></voice-orb>
 * Attributes: state (listening|speaking|thinking|idle), label, hint, size (sm|md|lg), show-controls, muted
 * Events: toggle-mute, end
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class VoiceOrbElement extends HTMLElement {
  static get observedAttributes() {
    return ['state', 'label', 'hint', 'size', 'show-controls', 'muted'];
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
        if (event.target.closest('[data-voice-orb-mute]')) {
          const muted = this.getAttribute('muted') === 'true';
          this.setAttribute('muted', muted ? 'false' : 'true');
          this.dispatchEvent(new CustomEvent('toggle-mute', { detail: { muted: !muted } }));
          return;
        }
        if (event.target.closest('[data-voice-orb-end]')) {
          this.dispatchEvent(new CustomEvent('end'));
        }
      });
    }
  }

  attributeChangedCallback() {
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const STATE = {
      listening: 'bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 animate-pulse',
      speaking: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 animate-pulse',
      thinking: 'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 animate-pulse',
      idle: 'bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700',
    };
    const STATE_LABEL = {
      listening: 'Listening…',
      speaking: 'Speaking…',
      thinking: 'Thinking…',
      idle: 'Tap to talk',
    };
    const SIZE = { sm: 'h-20 w-20', md: 'h-36 w-36', lg: 'h-56 w-56' };
    const state = this.getAttribute('state') || 'idle';
    const label = this.getAttribute('label') || STATE_LABEL[state];
    const hint = this.getAttribute('hint');
    const size = SIZE[this.getAttribute('size')] || SIZE.md;
    const showControls = (this.getAttribute('show-controls') || 'true') !== 'false';
    const muted = this.getAttribute('muted') === 'true';
    const BARS = [10, 18, 26, 34, 26, 18, 10];
    const wave = state !== 'idle' ? `
      <div data-voice-orb-wave class="flex h-8 items-end gap-1" aria-hidden="true">
        ${BARS.map((h) => `<span class="w-1 rounded-full ${state === 'idle' ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-500 dark:bg-indigo-400'}" style="height:${h}px"></span>`).join('')}
      </div>` : '';

    this.innerHTML = `<div data-voice-orb class="flex flex-col items-center gap-4">
  <div class="flex flex-col items-center gap-3">
    <div data-voice-orb-disc data-orb-state="${escapeAttribute(state)}" class="${size} rounded-full ${STATE[state]} shadow-lg shadow-indigo-500/20"></div>
    ${wave}
    <p data-voice-orb-label class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(label)}</p>
    ${hint ? `<p class="text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(hint)}</p>` : ''}
  </div>
  ${showControls ? `<div class="flex items-center gap-3">
    <button type="button" data-voice-orb-mute aria-pressed="${muted}" class="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${muted ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'}">${muted ? 'Unmute' : 'Mute'}</button>
    <button type="button" data-voice-orb-end class="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500">End call</button>
  </div>` : ''}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voice-orb')) {
  customElements.define('voice-orb', VoiceOrbElement);
}

export default VoiceOrbElement;
