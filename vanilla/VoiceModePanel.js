import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATE_META = {
  idle: {
    label: 'Tap to speak',
    hint: 'Voice mode is ready',
    ring: 'bg-zinc-200/60 dark:bg-zinc-700/40',
    orb: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300',
    inner: 'bg-zinc-200/50 dark:bg-zinc-700/40',
  },
  listening: {
    label: 'Listening…',
    hint: 'Speak now — tap again to stop',
    ring: 'bg-indigo-400/40',
    orb: 'bg-indigo-600 text-white',
    inner: 'bg-indigo-400/40',
  },
  thinking: {
    label: 'Thinking…',
    hint: 'Working on a response',
    ring: 'bg-amber-400/40',
    orb: 'bg-amber-500 text-white',
    inner: 'animate-pulse bg-amber-400/50',
  },
  speaking: {
    label: 'Speaking…',
    hint: 'Tap to interrupt',
    ring: 'bg-emerald-400/40',
    orb: 'bg-emerald-500 text-white',
    inner: 'bg-emerald-400/40',
  },
};

const BAR_COUNT = 9;

/**
 * VoiceModePanel - Vanilla Web Component
 * Usage: <voice-mode-panel state="listening" transcript="Hey there"></voice-mode-panel>
 * Events: toggle, end
 */
export class VoiceModePanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['state', 'transcript', 'reply', 'show-end'];
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

    const rawState = this.getAttribute('state') || 'idle';
    const state = STATE_META[rawState] ? rawState : 'idle';
    const meta = STATE_META[state];
    const transcript = this.getAttribute('transcript') || '';
    const reply = this.getAttribute('reply') || '';
    const showEnd = this.hasAttribute('show-end');

    const animated = state === 'listening' || state === 'speaking';
    const bars = Array.from({ length: BAR_COUNT }, (_, index) => {
      const style = animated ? `animation-delay:${(index * 0.07).toFixed(2)}s;` : '';
      const cls = animated
        ? 'w-1 rounded-full animate-[voice-bar_0.9s_ease-in-out_infinite_alternate] bg-indigo-500'
        : 'w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700';
      return `<span class="${cls}" style="${style}"></span>`;
    }).join('');

    this.innerHTML = `<div class="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="relative flex h-28 w-28 items-center justify-center">
        <span aria-hidden="true" class="absolute inset-0 rounded-full ${meta.ring} ${animated ? 'animate-ping' : 'opacity-0'}"></span>
        <span aria-hidden="true" class="absolute inset-3 rounded-full ${meta.ring} opacity-60"></span>
        <span aria-hidden="true" class="absolute inset-6 rounded-full transition-colors ${meta.inner}"></span>
        <button type="button" class="voice-toggle relative flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${meta.orb}"
          aria-label="${state === 'idle' ? 'Start voice mode' : 'Stop voice mode'}" aria-pressed="${state !== 'idle'}">
          ${uiIcon(state === 'idle' ? 'mic' : 'square', { size: 24 })}
        </button>
      </div>

      <div class="mt-4 flex h-6 items-end gap-1" aria-hidden="true">${bars}</div>

      <p class="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">${meta.label}</p>
      <p class="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">${meta.hint}</p>

      ${transcript ? `<p class="mt-4 max-w-sm text-center text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">“${escapeAttribute(transcript)}”</p>` : ''}
      ${reply ? `<p class="mt-2 max-w-sm text-center text-xs leading-relaxed text-indigo-600 dark:text-indigo-400">${escapeAttribute(reply)}</p>` : ''}

      ${
        showEnd
          ? `<button type="button" class="voice-end mt-6 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              ${uiIcon('x', { size: 12 })}End voice session
            </button>`
          : ''
      }
    </div>`;

    this.querySelector('.voice-toggle').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toggle'));
    });
    const end = this.querySelector('.voice-end');
    if (end) end.addEventListener('click', () => this.dispatchEvent(new CustomEvent('end')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('voice-mode-panel')) {
  customElements.define('voice-mode-panel', VoiceModePanelElement);
}
export default VoiceModePanelElement;
