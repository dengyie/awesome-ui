import React, { useEffect, useRef } from "react";
import { UiIcon } from "./UiIcon";

export interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Show ⌘K-style hint chip on the right. */
  shortcut?: string;
  loading?: boolean;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  defaultValue = "",
  placeholder = "Search…",
  shortcut,
  loading = false,
  autoFocus = false,
  onChange,
  onSearch,
  onClear,
  className = "",
}) => {
  const [inner, setInner] = React.useState(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const update = (next: string) => {
    if (!controlled) setInner(next);
    onChange?.(next);
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 ${className}`}
    >
      <UiIcon name="search" size={13} className="shrink-0 text-zinc-400" />
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label={placeholder}
        value={current}
        placeholder={placeholder}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch?.(current);
          if (event.key === "Escape" && current) {
            update("");
            onClear?.();
          }
        }}
        className="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
      />
      {loading ? (
        <UiIcon name="loader" size={13} className="shrink-0 animate-spin text-zinc-400" />
      ) : current ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            update("");
            onClear?.();
            inputRef.current?.focus();
          }}
          className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
        >
          <UiIcon name="x" size={12} />
        </button>
      ) : shortcut ? (
        <kbd className="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
};

export default SearchInput;
