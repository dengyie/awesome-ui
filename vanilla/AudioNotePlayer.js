/**
 * AudioNotePlayer - Voicenotes audio note player card: a play/pause button,
 * a waveform bar strip and the note title / duration metadata row.
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

class AudioNotePlayerElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'duration', 'playing', 'waveform'];
  }

  constructor() {
    super();
    this._bound = false;
    this._waveform = [];
    this._playing = false;
  }

  connectedCallback() {
    if (!this._waveform.length) {
      this._waveform = parseJsonAttr(this.getAttribute('waveform'), []);
    }
    if (this.getAttribute('playing') === 'true') {
      this._playing = true;
    }
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'waveform' && !this._waveform.length) {
      this._waveform = parseJsonAttr(this.getAttribute('waveform'), []);
    }
    if (name === 'playing') {
      this._playing = newValue === 'true';
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'Homepage walkthrough notes';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get duration() {
    return this.getAttribute('duration') ?? '00:47';
  }
  set duration(value) {
    this.setAttribute('duration', value);
  }

  get playing() {
    return this._playing;
  }
  set playing(value) {
    this._playing = Boolean(value);
    this._render();
  }

  get waveform() {
    return this._waveform;
  }
  set waveform(value) {
    this._waveform = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-audio-note-toggle]')) {
      this._playing = !this._playing;
      this._render();
      this.dispatchEvent(new CustomEvent('toggle-play', { detail: { playing: this._playing }, bubbles: true }));
    }
  }

  _render() {
    const bars = this._waveform.length
      ? this._waveform
      : Array.from({ length: 64 }, (_, i) => 25 + Math.round(Math.abs(Math.sin(i * 1.3)) * 75));
    const wave = bars
      .map((h, i) => {
        const played = this._playing && i < bars.length / 2;
        return `<span class="w-[3px] shrink-0 rounded-full ${played ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}" style="height:${Math.max(15, Math.min(100, h))}%"></span>`;
      })
      .join('');

    this.innerHTML = `
      <div data-audio-note-player class="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center gap-3">
          <button type="button" data-audio-note-toggle aria-label="${this._playing ? 'Pause note' : 'Play note'}" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">${this._playing ? '❚❚' : '▶'}</button>
          <div data-audio-note-waveform class="flex h-8 min-w-0 flex-1 items-center gap-[2px]" aria-hidden="true">${wave}</div>
          <span data-audio-note-duration class="shrink-0 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(this.duration)}</span>
        </div>
        <p data-audio-note-title class="mt-3 truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)}</p>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('audio-note-player')) {
  customElements.define('audio-note-player', AudioNotePlayerElement);
}

export default AudioNotePlayerElement;
