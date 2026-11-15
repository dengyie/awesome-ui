/**
 * ImageGenMetaBar - fal generation result footer bar: model badge pill
 * overlaying the image bottom-left plus a mono metadata row with the job id,
 * wall-clock duration and per-image cost.
 */
import React from "react";

export interface ImageGenMetaBarProps {
  model?: string;
  jobId?: string;
  duration?: string;
  cost?: string;
  className?: string;
}

export default function ImageGenMetaBar({
  model = "openai/gpt-image-2",
  jobId = "# 019f1ba4",
  duration = "169.0s",
  cost = "$ 0.211",
  className = "",
}: ImageGenMetaBarProps) {
  return (
    <div data-image-gen-meta className={`w-full border-t border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
        <span data-image-gen-job>{jobId}</span>
        <span data-image-gen-clock aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">◷</span>
        <span data-image-gen-duration>{duration}</span>
        <span className="ml-auto" />
        <span data-image-gen-cost className="font-medium text-zinc-600 dark:text-zinc-300">{cost}</span>
      </div>
      <span data-image-gen-model className="absolute left-2 bottom-11 inline-flex items-center rounded bg-zinc-900/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-100 backdrop-blur dark:bg-zinc-950/70">{model}</span>
    </div>
  );
}
