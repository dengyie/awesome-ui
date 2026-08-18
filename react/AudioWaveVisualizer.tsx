import React, { useEffect, useRef } from "react";

export interface AudioWaveVisualizerProps {
  isActive?: boolean;
  barCount?: number;
  color?: string;
  className?: string;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isActive = false,
  barCount = 16,
  color = "bg-amber-500",
  className = "",
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      className={`inline-flex items-center justify-center gap-1 h-8 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 select-none ${className}`}
      role="status"
      aria-label={isActive ? "Audio active" : "Audio idle"}
    >
      {bars.map((idx) => {
        // Pseudo-random animation delays and scales for a natural voice waveform
        const delay = (idx * 0.08) % 0.8;
        const duration = 0.6 + ((idx % 4) * 0.15);

        return (
          <span
            key={idx}
            style={{
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
            className={`w-1 rounded-full transition-all duration-300 ${color} ${
              isActive
                ? "h-full animate-[audio-pulse_0.8s_ease-in-out_infinite_alternate]"
                : "h-1.5 opacity-40"
            }`}
          />
        );
      })}
    </div>
  );
};
