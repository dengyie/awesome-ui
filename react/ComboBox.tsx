import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { UiIcon, type UiIconName } from "./UiIcon";

export interface ComboBoxOption {
  value: string;
  label: string;
  description?: string;
  icon?: UiIconName;
}

export interface ComboBoxProps {
  options: ComboBoxOption[];
  placeholder?: string;
  emptyText?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  options,
  placeholder = "Search…",
  emptyText = "No matches found.",
  onChange,
  className = "",
}) => {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        (option.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onDocKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  const choose = (option: ComboBoxOption) => {
    setSelected(option.value);
    setQuery(option.label);
    setOpen(false);
    onChange?.(option.value);
  };

  const onFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const option = filtered[active];
      if (option && open) {
        event.preventDefault();
        choose(option);
      }
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2 text-xs transition-colors dark:bg-zinc-900 ${
          open
            ? "border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400"
            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
        }`}
      >
        <UiIcon name="search" size={13} className="shrink-0 text-zinc-400" />
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-label={placeholder}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onFieldKeyDown}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => {
              setQuery("");
              setSelected(null);
            }}
            className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <UiIcon name="x" size={12} />
          </button>
        )}
      </div>
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={placeholder}
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {filtered.length === 0 && (
            <li role="option" aria-disabled="true" className="px-2.5 py-2 text-[11px] text-zinc-400">
              {emptyText}
            </li>
          )}
          {filtered.map((option, index) => {
            const isActive = index === active;
            const isSelected = selected === option.value;
            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                className={`flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                  isActive ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
                }`}
              >
                {option.icon && <UiIcon name={option.icon} size={13} className="mt-0.5 shrink-0 text-zinc-400" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-800 dark:text-zinc-100">{option.label}</span>
                  {option.description && (
                    <span className="mt-0.5 block text-[10.5px] text-zinc-500 dark:text-zinc-400">{option.description}</span>
                  )}
                </span>
                {isSelected && <UiIcon name="check" size={13} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ComboBox;
