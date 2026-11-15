import React from "react";

export type VoiceOrbState = "listening" | "speaking" | "thinking" | "idle";

export interface VoiceOrbProps {
  state?: VoiceOrbState;
  label?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  showControls?: boolean;
  muted?: boolean;
  onToggleMute?: () => void;
  onEnd?: () => void;
  className?: string;
}

const SIZE_CLASS = {
  sm: "h-20 w-20",
  md: "h-36 w-36",
  lg: "h-56 w-56",
} as const;

const STATE_RING = {
  listening: "bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 animate-pulse",
  speaking: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 animate-pulse",
  thinking: "bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 animate-pulse",
  idle: "bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700",
} as const;

const STATE_LABEL = {
  listening: "Listening…",
  speaking: "Speaking…",
  thinking: "Thinking…",
  idle: "Tap to talk",
} as const;

const BARS = [10, 18, 26, 34, 26, 18, 10] as const;

/**
 * VoiceOrb - ElevenLabs / Grok / Mindtrip style voice conversation orb: a
 * centered gradient disc whose color tracks the conversation state, with an
 * optional waveform readout and Mute / End controls beneath.
 */
export default function VoiceOrb({
  state = "idle",
  label,
  hint,
  size = "md",
  showControls = true,
  muted = false,
  onToggleMute,
  onEnd,
  className = "",
}: VoiceOrbProps) {
  return (
    <div data-voice-orb className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div
          data-voice-orb-disc
          data-orb-state={state}
          className={`${SIZE_CLASS[size]} rounded-full ${STATE_RING[state]} shadow-lg shadow-indigo-500/20`}
        />
        {state !== "idle" && (
          <div data-voice-orb-wave className="flex h-8 items-end gap-1" aria-hidden="true">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-indigo-500 dark:bg-indigo-400"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}
        <p data-voice-orb-label className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {label ?? STATE_LABEL[state]}
        </p>
        {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
      </div>
      {showControls && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-voice-orb-mute
            aria-pressed={muted}
            onClick={onToggleMute}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              muted
                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            data-voice-orb-end
            onClick={onEnd}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
          >
            End call
          </button>
        </div>
      )}
    </div>
  );
}
