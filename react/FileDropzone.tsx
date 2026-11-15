import React, { useRef, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface DropzoneFile {
  /** Stable key; falls back to name+index. */
  id?: string | number;
  name: string;
  /** Bytes. */
  size: number;
  type?: string;
}

export interface RejectedFile {
  name: string;
  reason: "type" | "size";
}

export interface FileDropzoneProps {
  files?: DropzoneFile[];
  /** Comma separated extensions or MIME wildcards, e.g. ".png,image/*". */
  accept?: string;
  multiple?: boolean;
  /** Reject files larger than this. */
  maxSizeMb?: number;
  hint?: string;
  disabled?: boolean;
  onFiles?: (accepted: File[]) => void;
  onReject?: (rejected: RejectedFile[]) => void;
  onRemove?: (file: DropzoneFile, index: number) => void;
  className?: string;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exp;
  return `${value >= 10 || exp === 0 ? Math.round(value) : value.toFixed(1)} ${units[exp]}`;
};

export const matchesAccept = (file: { name: string; type?: string }, accept?: string) => {
  if (!accept) return true;
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token);
      if (token.endsWith("/*")) return Boolean(file.type && file.type.toLowerCase().startsWith(token.slice(0, -1)));
      return file.type?.toLowerCase() === token;
    });
};

const fileIcon = (file: DropzoneFile) => {
  if (file.type?.startsWith("image/")) return "image" as const;
  if (/\.(ts|tsx|js|jsx|py|go|rs|json|css|html)$/i.test(file.name)) return "code" as const;
  return "paperclip" as const;
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  files = [],
  accept,
  multiple = true,
  maxSizeMb,
  hint,
  disabled = false,
  onFiles,
  onReject,
  onRemove,
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (incoming: FileList | File[] | null) => {
    const list = Array.from(incoming || []);
    if (list.length === 0) return;

    const rejected: RejectedFile[] = [];
    const accepted = list.filter((file) => {
      if (!matchesAccept(file, accept)) {
        rejected.push({ name: file.name, reason: "type" });
        return false;
      }
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        rejected.push({ name: file.name, reason: "size" });
        return false;
      }
      return true;
    });

    if (rejected.length) {
      const first = rejected[0];
      setError(
        first.reason === "size"
          ? `${first.name} is larger than ${maxSizeMb} MB`
          : `${first.name} is not an accepted file type`
      );
      onReject?.(rejected);
    } else {
      setError(null);
    }

    if (accepted.length) onFiles?.(multiple ? accepted : accepted.slice(0, 1));
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={hint || "Drop files here or browse"}
        aria-disabled={disabled || undefined}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer?.files ?? null);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          dragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
          <UiIcon name="upload" size={16} />
        </span>
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
          Drag & drop {multiple ? "files" : "a file"} here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
        </p>
        <p className="text-[11px] text-zinc-400">
          {hint || [accept ? `Accepts ${accept}` : null, maxSizeMb ? `up to ${maxSizeMb} MB` : null].filter(Boolean).join(" · ") || "Any file type"}
        </p>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400">
          <UiIcon name="alert-triangle" size={12} />
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((file, index) => (
            <li
              key={file.id ?? `${file.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
            >
              <span className="shrink-0 text-zinc-400">
                <UiIcon name={fileIcon(file)} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-200">{file.name}</span>
                <span className="block text-[10px] tabular-nums text-zinc-400">{formatBytes(file.size)}</span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(file, index);
                }}
                className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <UiIcon name="x" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileDropzone;
