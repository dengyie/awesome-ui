import React, { useRef, useEffect, useState, KeyboardEvent } from "react";
import { ArrowUp, Square, Paperclip, X, Image as ImageIcon } from "lucide-react";

export interface Attachment {
  id: string;
  name: string;
  url?: string;
  type: "image" | "file";
}

export interface ChatPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isGenerating?: boolean;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  attachments?: Attachment[];
  onAddAttachment?: (file: File) => void;
  onRemoveAttachment?: (id: string) => void;
  className?: string;
}

export const ChatPromptInput: React.FC<ChatPromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  onStop,
  isGenerating = false,
  placeholder = "Ask anything... (Enter to send, Shift+Enter for newline)",
  disabled = false,
  allowAttachments = true,
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  className = "",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 240); // Max ~8 lines
    textarea.style.height = `${Math.max(nextHeight, 48)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return; // Ignore IME composition (Chinese/Japanese)
      e.preventDefault();
      if (!isGenerating && value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onAddAttachment) return;
    Array.from(files).forEach((file) => onAddAttachment(file));
    e.target.value = ""; // Reset input
  };

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all ${className}`}
    >
      {/* Attachments Preview Area */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 pb-0">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="group relative flex items-center gap-2 pl-2 pr-1.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80"
            >
              {att.type === "image" ? (
                <ImageIcon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              )}
              <span className="max-w-[140px] truncate font-medium">{att.name}</span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att.id)}
                  className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end px-3 py-2.5 gap-2">
        {allowAttachments && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || isGenerating}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isGenerating}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-40"
              title="Add attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none border-0 p-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-0 leading-relaxed max-h-[240px] min-h-[36px]"
        />

        {/* Action Button: Send or Stop */}
        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm flex-shrink-0"
            title="Stop generation"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim() || disabled}
            className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm flex-shrink-0"
            title="Send message"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
