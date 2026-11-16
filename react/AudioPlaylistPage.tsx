/**
 * AudioPlaylistPage - Music playlist page with gradient cover, track rows,
 * version/remix controls, reactions, bottom player bar and a right Queue
 * panel (Suno audio workspace pattern).
 */
import React from "react";

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl?: string;
  version?: string;
  liked?: boolean;
}

export interface AudioPlaylistPageProps {
  title?: string;
  subtitle?: string;
  coverUrl?: string;
  tracks?: PlaylistTrack[];
  queue?: PlaylistTrack[];
  activeTrackId?: string;
  className?: string;
  onTrackClick?: (track: PlaylistTrack) => void;
  onLike?: (track: PlaylistTrack) => void;
  onRemix?: (track: PlaylistTrack) => void;
  onQueueClick?: (track: PlaylistTrack) => void;
}

export default function AudioPlaylistPage({
  title = "Late night sketches",
  subtitle = "A collection of new ideas and alternate versions",
  coverUrl = "",
  tracks = [
    { id: "t1", title: "Neon after rain", artist: "Mira Sol", duration: "3:42", version: "v5", liked: true },
    { id: "t2", title: "Soft focus", artist: "Mira Sol", duration: "2:58", version: "v3" },
    { id: "t3", title: "Signals in the dark", artist: "Mira Sol", duration: "4:16", version: "v2" },
    { id: "t4", title: "Morning light", artist: "Mira Sol", duration: "3:05", version: "v1" },
  ],
  queue = [
    { id: "q1", title: "City windows", artist: "Mira Sol", duration: "3:10" },
    { id: "q2", title: "Static bloom", artist: "Theo Park", duration: "2:46" },
    { id: "q3", title: "Almost home", artist: "Mira Sol", duration: "3:31" },
  ],
  activeTrackId = tracks[0]?.id,
  className = "",
  onTrackClick,
  onLike,
  onRemix,
  onQueueClick,
}: AudioPlaylistPageProps) {
  const active = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];
  const [liked, setLiked] = React.useState(() => new Set(tracks.filter((t) => t.liked).map((t) => t.id)));
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div data-audioplaylist className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${className}`}>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_240px]">
        <main data-audioplaylist-main className="min-w-0">
          <div className="flex flex-col gap-5 border-b border-zinc-200 p-5 sm:flex-row sm:items-end sm:p-7 dark:border-zinc-800">
            <div data-audioplaylist-cover className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-indigo-600 to-cyan-400 shadow-lg">
              {coverUrl ? <img src={coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, white 0 1px, transparent 2px)", backgroundSize: "22px 22px" }} />}
              <span className="absolute bottom-3 left-3 text-3xl" aria-hidden="true">♫</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Playlist</p>
              <h2 data-audioplaylist-title className="mt-1 truncate text-3xl font-black tracking-tight">{title}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button data-audioplaylist-play type="button" onClick={() => setIsPlaying((v) => !v)} className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                  {isPlaying ? "❚❚ Pause" : "▶ Play"}
                </button>
                <button data-audioplaylist-share type="button" className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">↗ Share</button>
              </div>
            </div>
          </div>

          <div data-audioplaylist-toolbar className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800/70">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{tracks.length} songs · {tracks.reduce((total, track) => total + Number(track.duration.split(":")[0]) * 60 + Number(track.duration.split(":")[1] ?? 0), 0) > 0 ? "originals and versions" : ""}</p>
            <div className="flex items-center gap-2">
              <button data-audioplaylist-like type="button" className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">♡ Like</button>
              <button data-audioplaylist-comment type="button" className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">◌ Comment</button>
            </div>
          </div>

          <div data-audioplaylist-tracks className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {tracks.map((track, index) => {
              const isActive = track.id === active?.id;
              const isLiked = liked.has(track.id);
              return (
                <div key={track.id} data-audioplaylist-track={track.id} data-audioplaylist-active={isActive ? "true" : "false"} className={`group flex items-center gap-3 px-5 py-3.5 transition-colors sm:px-7 ${isActive ? "bg-indigo-50/70 dark:bg-indigo-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
                  <button data-audioplaylist-track-play={track.id} type="button" aria-label={`Play ${track.title}`} onClick={() => onTrackClick?.(track)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                    {isActive && isPlaying ? "❚❚" : <span className="text-xs">{String(index + 1).padStart(2, "0")}</span>}
                  </button>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-200 to-fuchsia-200 dark:from-indigo-950 dark:to-fuchsia-950">
                    {track.coverUrl ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-lg">♫</span>}
                  </div>
                  <button type="button" onClick={() => onTrackClick?.(track)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold">{track.title}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{track.artist}</p>
                  </button>
                  {track.version && <span data-audioplaylist-version className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{track.version}</span>}
                  <span className="hidden text-xs tabular-nums text-zinc-400 sm:inline">{track.duration}</span>
                  <button data-audioplaylist-remix={track.id} type="button" onClick={() => onRemix?.(track)} className="hidden rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 sm:inline dark:hover:bg-zinc-800">Remix ▾</button>
                  <button data-audioplaylist-like-track={track.id} type="button" aria-label={isLiked ? "Unlike" : "Like"} onClick={() => { setLiked((prev) => { const next = new Set(prev); if (next.has(track.id)) next.delete(track.id); else next.add(track.id); return next; }); onLike?.(track); }} className={`rounded-md px-1.5 py-1 text-base ${isLiked ? "text-rose-500" : "text-zinc-400 hover:text-rose-400"}`}>{isLiked ? "♥" : "♡"}</button>
                </div>
              );
            })}
          </div>
        </main>

        <aside data-audioplaylist-queue className="border-t border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Queue</h3>
            <span className="text-xs text-zinc-400">{queue.length}</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {queue.map((track, index) => (
              <button key={track.id} data-audioplaylist-queue-item={track.id} type="button" onClick={() => onQueueClick?.(track)} className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-white dark:hover:bg-zinc-800">
                <span className="w-4 text-center text-[10px] text-zinc-400">{index + 1}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-200 to-indigo-200 text-sm dark:from-cyan-950 dark:to-indigo-950">♫</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{track.title}</span><span className="block truncate text-[11px] text-zinc-400">{track.artist}</span></span>
                <span className="text-[10px] tabular-nums text-zinc-400">{track.duration}</span>
              </button>
            ))}
          </div>
          <p className="mt-6 rounded-lg border border-dashed border-zinc-300 p-3 text-center text-xs text-zinc-400 dark:border-zinc-700">Drag songs here to build your queue</p>
        </aside>
      </div>

      <div data-audioplaylist-player className="flex items-center gap-3 border-t border-zinc-200 bg-zinc-900 px-4 py-3 text-white dark:border-zinc-800">
        <button data-audioplaylist-player-toggle type="button" onClick={() => setIsPlaying((v) => !v)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs text-zinc-900">{isPlaying ? "❚❚" : "▶"}</button>
        <div className="min-w-0 w-36 sm:w-48"><p className="truncate text-xs font-semibold">{active?.title ?? "Nothing playing"}</p><p className="truncate text-[10px] text-zinc-400">{active?.artist ?? "Choose a track"}</p></div>
        <div className="hidden flex-1 items-center gap-3 sm:flex"><span className="text-[10px] tabular-nums text-zinc-400">0:42</span><div className="h-1.5 flex-1 rounded-full bg-zinc-700"><div className="h-full w-1/4 rounded-full bg-indigo-400" /></div><span className="text-[10px] tabular-nums text-zinc-400">{active?.duration ?? "0:00"}</span></div>
        <div className="ml-auto flex items-center gap-2 text-zinc-300"><button type="button" className="rounded p-1 hover:bg-zinc-800">↶</button><button type="button" className="rounded p-1 hover:bg-zinc-800">↷</button><button type="button" className="rounded p-1 hover:bg-zinc-800">🔊</button></div>
      </div>
    </div>
  );
}
