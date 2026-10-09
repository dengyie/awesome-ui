import React from "react";
import { UiIcon, UiIconName } from "./UiIcon";

export interface AttachmentItem {
  id: string | number;
  name: string;
  size?: number;
  type?: string;
}

export interface FileAttachmentListProps {
  files: AttachmentItem[];
  onRemove?: (id: string | number) => void;
  className?: string;
}

export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const iconForType = (type?: string, name?: string): UiIconName => {
  if (type?.startsWith("image/")) return "image";
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (["js", "ts", "tsx", "jsx", "py", "java", "go", "rs", "vue", "html", "css", "json", "sh"].includes(ext)) return "code";
  return "paperclip";
};

export const FileAttachmentList: React.FC<FileAttachmentListProps> = ({ files = [], onRemove, className = "" }) => {
  if (files.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {files.map((f) => {
        const sizeText = formatFileSize(f.size);
        return (
          <div
            key={f.id}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300"
          >
            <UiIcon name={iconForType(f.type, f.name)} size={14} className="text-zinc-400 shrink-0" />
            <span className="max-w-40 truncate font-medium">{f.name}</span>
            {sizeText && <span className="text-[10px] font-mono text-zinc-400 shrink-0">{sizeText}</span>}
            {onRemove && (
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onRemove(f.id)}
                className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              >
                <UiIcon name="x" size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default FileAttachmentList;
