/**
 * SessionDiagnosticsPanel - Connection diagnostics: Browser / OS info cards,
 * media quality timeline bars (Camera / Microphone / Screenshare / Poor
 * network) and a searchable event log table (Whereby insights pattern).
 */
import React from "react";

export interface SessionDevice {
  label: string;
  value: string;
  emoji: string;
}

export interface QualityTrack {
  id: string;
  label: string;
  emoji: string;
  /** 0-1 relative quality windows: { start, width, level } */
  windows: { start: number; width: number; level: "good" | "poor" | "bad" }[];
}

export interface DiagEvent {
  id: string;
  no: number;
  message: string;
  time: string;
}

export interface SessionDiagnosticsPanelProps {
  title?: string;
  devices?: SessionDevice[];
  tracks?: QualityTrack[];
  events?: DiagEvent[];
  className?: string;
  onEventClick?: (event: DiagEvent) => void;
  onSearch?: (query: string) => void;
}

const LEVEL_CLS: Record<string, string> = {
  good: "bg-emerald-400 dark:bg-emerald-500",
  poor: "bg-amber-400 dark:bg-amber-500",
  bad: "bg-rose-400 dark:bg-rose-500",
};

export default function SessionDiagnosticsPanel({
  title = "Events Timeline",
  devices = [
    { label: "Browser", value: "Chrome 126.0.0.0", emoji: "🌐" },
    { label: "Operating system", value: "Mac OS", emoji: "💻" },
  ],
  tracks = [
    { id: "camera", label: "Camera", emoji: "📷", windows: [{ start: 0, width: 100, level: "good" }] },
    { id: "microphone", label: "Microphone", emoji: "🎙", windows: [{ start: 0, width: 100, level: "good" }] },
    { id: "screenshare", label: "Screenshare", emoji: "🖥", windows: [{ start: 0, width: 100, level: "good" }] },
    { id: "network", label: "Poor Network", emoji: "📶", windows: [{ start: 20, width: 12, level: "bad" }, { start: 55, width: 8, level: "poor" }] },
  ],
  events = [
    { id: "e1", no: 1, message: 'organizationId: "244198"', time: "6/25/2024, 4:10:24 PM" },
    { id: "e2", no: 2, message: 'clientId: "c43b3dfc-62e9-43f6-887f-d07c6ac9eddb"', time: "6/25/2024, 4:10:26 PM" },
    { id: "e3", no: 3, message: 'roomSessionId: "bdc6cb01-24a4-4132-b23a-8ad28d049a76"', time: "6/25/2024, 4:16:23 PM" },
    { id: "e4", no: 4, message: 'displayName: "Alex Smith"', time: "6/25/2024, 4:10:24 PM" },
    { id: "e5", no: 5, message: 'userRole: "owner"', time: "6/25/2024, 4:10:26 PM" },
  ],
  className = "",
  onEventClick,
  onSearch,
}: SessionDiagnosticsPanelProps) {
  const [query, setQuery] = React.useState("");

  const filtered = events.filter((e) => e.message.toLowerCase().includes(query.toLowerCase()));

  return (
    <div data-sdiag className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 ${className}`}>
      {/* device cards */}
      <div data-sdiag-devices className="grid gap-4 sm:grid-cols-2">
        {devices.map((d) => (
          <div key={d.label} data-sdiag-device={d.label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{d.label}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <span aria-hidden="true">{d.emoji}</span>
              {d.value}
            </p>
          </div>
        ))}
      </div>

      <h3 data-sdiag-title className="mt-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>

      {/* quality tracks */}
      <div data-sdiag-tracks className="mt-4 space-y-2.5">
        {tracks.map((t) => (
          <div key={t.id} data-sdiag-track={t.id} className="flex items-center gap-3">
            <span className="flex w-40 shrink-0 items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <span aria-hidden="true">{t.emoji}</span>
              {t.label}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
              {t.windows.map((w, i) => (
                <div
                  key={i}
                  data-sdiag-window={w.level}
                  className={`absolute inset-y-0 rounded-sm ${LEVEL_CLS[w.level] ?? LEVEL_CLS.good}`}
                  style={{ left: `${w.start}%`, width: `${w.width}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* event log */}
      <div data-sdiag-log className="mt-6 flex items-center justify-between gap-4">
        <div className="grid flex-1 gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-100 sm:grid-cols-[60px_1fr]">
          <span>Event no.</span>
          <span>Event message</span>
        </div>
        <input
          type="search"
          data-sdiag-search
          value={query}
          placeholder="Search for an event"
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-56 rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </div>
      <div data-sdiag-events className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {filtered.length === 0 ? (
          <p data-sdiag-empty className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No events match your search.</p>
        ) : (
          filtered.map((e) => (
            <button
              key={e.id}
              type="button"
              data-sdiag-event={e.no}
              onClick={() => onEventClick?.(e)}
              className="grid w-full grid-cols-[60px_1fr_auto] items-center gap-2 py-3 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:text-[13px]"
            >
              <span className="text-zinc-400 dark:text-zinc-500">{e.no}</span>
              <span className="truncate font-mono text-[13px] text-zinc-700 dark:text-zinc-200">{e.message}</span>
              <span className="whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500">{e.time}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
