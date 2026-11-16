/**
 * AudioPlaylistPage - Music playlist page with gradient cover, track rows,
 * version/remix controls, reactions, bottom player bar and a right Queue
 * panel (Suno audio workspace pattern).
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

const DEFAULT_TRACKS = () => [
  { id: 't1', title: 'Neon after rain', artist: 'Mira Sol', duration: '3:42', version: 'v5', liked: true },
  { id: 't2', title: 'Soft focus', artist: 'Mira Sol', duration: '2:58', version: 'v3' },
  { id: 't3', title: 'Signals in the dark', artist: 'Mira Sol', duration: '4:16', version: 'v2' },
  { id: 't4', title: 'Morning light', artist: 'Mira Sol', duration: '3:05', version: 'v1' },
];

const DEFAULT_QUEUE = () => [
  { id: 'q1', title: 'City windows', artist: 'Mira Sol', duration: '3:10' },
  { id: 'q2', title: 'Static bloom', artist: 'Theo Park', duration: '2:46' },
  { id: 'q3', title: 'Almost home', artist: 'Mira Sol', duration: '3:31' },
];

class AudioPlaylistPageElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'cover-url', 'tracks', 'queue', 'active-track-id'];
  }

  constructor() {
    super();
    this._bound = false;
    this._playing = false;
    this._liked = new Set();
    this._likedInitialized = false;
  }

  connectedCallback() {
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
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _tracks() {
    const tracks = parseJsonAttr(this.getAttribute('tracks'), DEFAULT_TRACKS());
    if (!this._likedInitialized) {
      this._liked = new Set(tracks.filter((t) => t.liked).map((t) => t.id));
      this._likedInitialized = true;
    }
    return tracks;
  }

  _onClick(event) {
    const trackPlay = event.target.closest('[data-audioplaylist-track-play]');
    if (trackPlay) {
      const id = trackPlay.getAttribute('data-audioplaylist-track-play');
      const found = this._tracks().find((t) => t.id === id);
      if (found) this.dispatchEvent(new CustomEvent('track-click', { detail: { track: found }, bubbles: true }));
      return;
    }
    const remix = event.target.closest('[data-audioplaylist-remix]');
    if (remix) {
      const id = remix.getAttribute('data-audioplaylist-remix');
      const found = this._tracks().find((t) => t.id === id);
      if (found) this.dispatchEvent(new CustomEvent('remix', { detail: { track: found }, bubbles: true }));
      return;
    }
    const like = event.target.closest('[data-audioplaylist-like-track]');
    if (like) {
      const id = like.getAttribute('data-audioplaylist-like-track');
      const found = this._tracks().find((t) => t.id === id);
      if (found) {
        if (this._liked.has(id)) this._liked.delete(id);
        else this._liked.add(id);
        this.dispatchEvent(new CustomEvent('like', { detail: { track: found }, bubbles: true }));
        this._render();
      }
      return;
    }
    const queueItem = event.target.closest('[data-audioplaylist-queue-item]');
    if (queueItem) {
      const id = queueItem.getAttribute('data-audioplaylist-queue-item');
      const found = parseJsonAttr(this.getAttribute('queue'), DEFAULT_QUEUE()).find((t) => t.id === id);
      if (found) this.dispatchEvent(new CustomEvent('queue-click', { detail: { track: found }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-audioplaylist-play]') || event.target.closest('[data-audioplaylist-player-toggle]')) {
      this._playing = !this._playing;
      this._render();
    }
  }

  _render() {
    const title = this.getAttribute('title') || 'Late night sketches';
    const subtitle = this.getAttribute('subtitle') || 'A collection of new ideas and alternate versions';
    const coverUrl = this.getAttribute('cover-url') || '';
    const tracks = this._tracks();
    const queue = parseJsonAttr(this.getAttribute('queue'), DEFAULT_QUEUE());
    const activeId = this.getAttribute('active-track-id') || tracks[0]?.id || '';
    const active = tracks.find((t) => t.id === activeId) ?? tracks[0];

    const tracksHtml = tracks
      .map((track, index) => {
        const isActive = track.id === active?.id;
        const isLiked = this._liked.has(track.id);
        return `<div data-audioplaylist-track="${escapeAttribute(track.id)}" data-audioplaylist-active="${isActive ? 'true' : 'false'}" class="group flex items-center gap-3 px-5 py-3.5 transition-colors sm:px-7 ${isActive ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}">
            <button data-audioplaylist-track-play="${escapeAttribute(track.id)}" aria-label="Play ${escapeAttribute(track.title)}" type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">${isActive && this._playing ? '<span class="text-xs">❚❚</span>' : `<span class="text-xs">${String(index + 1).padStart(2, '0')}</span>`}</button>
            <div class="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-200 to-fuchsia-200 dark:from-indigo-950 dark:to-fuchsia-950">${track.coverUrl ? `<img src="${escapeAttribute(track.coverUrl)}" alt="" class="h-full w-full object-cover" />` : '<span class="flex h-full items-center justify-center text-lg">♫</span>'}</div>
            <button type="button" class="min-w-0 flex-1 text-left" data-audioplaylist-track-play="${escapeAttribute(track.id)}">
              <p class="truncate text-sm font-semibold">${escapeAttribute(track.title)}</p>
              <p class="truncate text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(track.artist)}</p>
            </button>
            ${track.version ? `<span data-audioplaylist-version class="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(track.version)}</span>` : ''}
            <span class="hidden text-xs tabular-nums text-zinc-400 sm:inline">${escapeAttribute(track.duration)}</span>
            <button data-audioplaylist-remix="${escapeAttribute(track.id)}" type="button" class="hidden rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 sm:inline dark:hover:bg-zinc-800">Remix ▾</button>
            <button data-audioplaylist-like-track="${escapeAttribute(track.id)}" aria-label="${isLiked ? 'Unlike' : 'Like'}" type="button" class="rounded-md px-1.5 py-1 text-base ${isLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-400'}">${isLiked ? '♥' : '♡'}</button>
          </div>`;
      })
      .join('');

    const queueHtml = queue
      .map(
        (track, index) => `<button data-audioplaylist-queue-item="${escapeAttribute(track.id)}" type="button" class="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-white dark:hover:bg-zinc-800">
            <span class="w-4 text-center text-[10px] text-zinc-400">${index + 1}</span>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-200 to-indigo-200 text-sm dark:from-cyan-950 dark:to-indigo-950">♫</span>
            <span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold">${escapeAttribute(track.title)}</span><span class="block truncate text-[11px] text-zinc-400">${escapeAttribute(track.artist)}</span></span>
            <span class="text-[10px] tabular-nums text-zinc-400">${escapeAttribute(track.duration)}</span>
          </button>`
      )
      .join('');

    this.innerHTML = `
      <div data-audioplaylist class="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
        <div class="grid lg:grid-cols-[minmax(0,1fr)_240px]">
          <main data-audioplaylist-main class="min-w-0">
            <div class="flex flex-col gap-5 border-b border-zinc-200 p-5 sm:flex-row sm:items-end sm:p-7 dark:border-zinc-800">
              <div data-audioplaylist-cover class="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-indigo-600 to-cyan-400 shadow-lg">${coverUrl ? `<img src="${escapeAttribute(coverUrl)}" alt="" class="h-full w-full object-cover" />` : '<div class="absolute inset-0 opacity-40" style="background-image:radial-gradient(circle at 25% 25%, white 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, white 0 1px, transparent 2px);background-size:22px 22px"></div>'}<span class="absolute bottom-3 left-3 text-3xl" aria-hidden="true">♫</span></div>
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Playlist</p>
                <h2 data-audioplaylist-title class="mt-1 truncate text-3xl font-black tracking-tight">${escapeAttribute(title)}</h2>
                <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(subtitle)}</p>
                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <button data-audioplaylist-play type="button" class="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">${this._playing ? '❚❚ Pause' : '▶ Play'}</button>
                  <button data-audioplaylist-share type="button" class="rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">↗ Share</button>
                </div>
              </div>
            </div>
            <div data-audioplaylist-toolbar class="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800/70">
              <p class="text-xs text-zinc-500 dark:text-zinc-400">${tracks.length} songs · originals and versions</p>
              <div class="flex items-center gap-2">
                <button data-audioplaylist-like type="button" class="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">♡ Like</button>
                <button data-audioplaylist-comment type="button" class="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">◌ Comment</button>
              </div>
            </div>
            <div data-audioplaylist-tracks class="divide-y divide-zinc-100 dark:divide-zinc-800/70">${tracksHtml}</div>
          </main>
          <aside data-audioplaylist-queue class="border-t border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:border-l lg:border-t-0">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold">Queue</h3>
              <span class="text-xs text-zinc-400">${queue.length}</span>
            </div>
            <div class="mt-4 space-y-2.5">${queueHtml}</div>
            <p class="mt-6 rounded-lg border border-dashed border-zinc-300 p-3 text-center text-xs text-zinc-400 dark:border-zinc-700">Drag songs here to build your queue</p>
          </aside>
        </div>
        <div data-audioplaylist-player class="flex items-center gap-3 border-t border-zinc-200 bg-zinc-900 px-4 py-3 text-white dark:border-zinc-800">
          <button data-audioplaylist-player-toggle type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs text-zinc-900">${this._playing ? '❚❚' : '▶'}</button>
          <div class="min-w-0 w-36 sm:w-48"><p class="truncate text-xs font-semibold">${escapeAttribute(active?.title ?? 'Nothing playing')}</p><p class="truncate text-[10px] text-zinc-400">${escapeAttribute(active?.artist ?? 'Choose a track')}</p></div>
          <div class="hidden flex-1 items-center gap-3 sm:flex"><span class="text-[10px] tabular-nums text-zinc-400">0:42</span><div class="h-1.5 flex-1 rounded-full bg-zinc-700"><div class="h-full w-1/4 rounded-full bg-indigo-400"></div></div><span class="text-[10px] tabular-nums text-zinc-400">${escapeAttribute(active?.duration ?? '0:00')}</span></div>
          <div class="ml-auto flex items-center gap-2 text-zinc-300"><button type="button" class="rounded p-1 hover:bg-zinc-800">↶</button><button type="button" class="rounded p-1 hover:bg-zinc-800">↷</button><button type="button" class="rounded p-1 hover:bg-zinc-800">🔊</button></div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('audio-playlist-page')) {
  customElements.define('audio-playlist-page', AudioPlaylistPageElement);
}

export default AudioPlaylistPageElement;
