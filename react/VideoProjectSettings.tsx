/**
 * VideoProjectSettings - Video project settings side panel: Chapters side
 * panel with bookmark icon and empty state + "Add a chapter" action, main
 * form with Title input, Description textarea, Thumbnail selector and a
 * storage usage badge
 * (Vimeo video project settings pattern).
 */
import React from "react";

export interface VideoChapter {
  id: string;
  label: string;
  timestamp: string;
}

export interface VideoThumbnail {
  id: string;
  src?: string;
  gradient?: string;
}

export interface VideoProjectSettingsProps {
  panelTitle?: string;
  panelEmptyText?: string;
  chapters?: VideoChapter[];
  addChapterLabel?: string;
  titleLabel?: string;
  titleValue?: string;
  descriptionLabel?: string;
  descriptionValue?: string;
  thumbnailLabel?: string;
  thumbnails?: VideoThumbnail[];
  selectedThumbnailId?: string;
  storageUsed?: string;
  storageTotal?: string;
  className?: string;
  onAddChapter?: () => void;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onThumbnailSelect?: (thumbnail: VideoThumbnail) => void;
}

const DEFAULT_GRADIENTS = [
  "bg-gradient-to-br from-violet-400 via-fuchsia-400 to-rose-400 dark:from-violet-700 dark:via-fuchsia-700 dark:to-rose-700",
  "bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 dark:from-sky-700 dark:via-cyan-700 dark:to-emerald-700",
];

export default function VideoProjectSettings({
  panelTitle = "Chapters",
  panelEmptyText = "Add chapters so your viewers can find specific parts of your video",
  chapters = [],
  addChapterLabel = "Add a chapter",
  titleLabel = "Title",
  titleValue = "Video project",
  descriptionLabel = "Description",
  descriptionValue = "",
  thumbnailLabel = "Thumbnail",
  thumbnails = [
    { id: "t1", gradient: DEFAULT_GRADIENTS[0] },
    { id: "t2", gradient: DEFAULT_GRADIENTS[1] },
  ],
  selectedThumbnailId = "t1",
  storageUsed = "31MB",
  storageTotal = "7TB",
  className = "",
  onAddChapter,
  onTitleChange,
  onDescriptionChange,
  onThumbnailSelect,
}: VideoProjectSettingsProps) {
  const [selectedId, setSelectedId] = React.useState(selectedThumbnailId);

  return (
    <div data-video-settings className={`flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* chapters side panel */}
      <aside data-video-chapters className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button data-video-back type="button" aria-label="Back" className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">←</button>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{panelTitle}</span>
          </div>
          <button data-video-close type="button" aria-label="Close panel" className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
        </div>
        <div className="mx-4 flex items-center justify-center rounded-lg bg-zinc-200/70 py-3 text-lg dark:bg-zinc-800/70" aria-hidden="true">🔖</div>
        <div data-video-chapters-body className="flex-1 px-4 py-3">
          {chapters.length === 0 ? (
            <p data-video-chapters-empty className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{panelEmptyText}</p>
          ) : (
            <ul data-video-chapter-list className="space-y-2">
              {chapters.map((chapter) => (
                <li key={chapter.id} data-video-chapter={chapter.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm dark:bg-zinc-900">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">{chapter.label}</span>
                  <span className="font-mono text-zinc-400 dark:text-zinc-500">{chapter.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          data-video-add-chapter
          type="button"
          onClick={() => onAddChapter?.()}
          className="mx-4 mb-4 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
        >
          ＋ {addChapterLabel}
        </button>
      </aside>

      {/* main form */}
      <div data-video-form className="flex-1 space-y-5 p-6">
        <div data-video-field-title>
          <label data-video-title-label className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="video-title-input">{titleLabel}</label>
          <input
            id="video-title-input"
            data-video-title-input
            type="text"
            value={titleValue}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50"
          />
        </div>

        <div data-video-field-description>
          <label data-video-description-label className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="video-description-input">{descriptionLabel}</label>
          <textarea
            id="video-description-input"
            data-video-description-input
            rows={3}
            value={descriptionValue}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50"
          ></textarea>
        </div>

        <div data-video-field-thumbnail>
          <span data-video-thumbnail-label className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">{thumbnailLabel}</span>
          <div data-video-thumbnails className="flex items-center gap-3">
            <button
              data-video-thumbnail-add
              type="button"
              aria-label="Upload thumbnail"
              className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-lg text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              ＋
            </button>
            {thumbnails.map((thumb) => {
              const selected = thumb.id === selectedId;
              return (
                <button
                  key={thumb.id}
                  data-video-thumbnail={thumb.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(thumb.id);
                    onThumbnailSelect?.(thumb);
                  }}
                  className={`h-16 w-24 overflow-hidden rounded-lg transition-all ${thumb.gradient ?? "bg-zinc-300 dark:bg-zinc-700"} ${
                    selected ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900" : "opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`Thumbnail ${thumb.id}`}
                ></button>
              );
            })}
          </div>
        </div>

        <div data-video-storage className="flex items-center">
          <span data-video-storage-badge className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            💾 {storageUsed} / {storageTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
