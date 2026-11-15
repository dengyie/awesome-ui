import React from "react";

export interface EditableHeadingProps {
  value?: string;
  defaultValue?: string;
  breadcrumb?: React.ReactNode;
  meta?: React.ReactNode;
  size?: "md" | "lg";
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * EditableHeading - inline-editable object title: heading when idle, highlighted input on click; Enter/blur commits, Esc cancels.
 */
export default function EditableHeading({
  value,
  defaultValue = "Untitled",
  breadcrumb,
  meta,
  size = "lg",
  onChange,
  className = "",
}: EditableHeadingProps) {
  const [current, setCurrent] = React.useState(value ?? defaultValue);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(current);

  React.useEffect(() => {
    if (value !== undefined) setCurrent(value);
  }, [value]);

  const commit = () => {
    const next = draft.trim() || current;
    setCurrent(next);
    setEditing(false);
    if (next !== current) onChange?.(next);
  };

  const cancel = () => {
    setDraft(current);
    setEditing(false);
  };

  const sizeClass = size === "lg" ? "text-2xl" : "text-base";

  return (
    <div data-editable-heading className={className}>
      {breadcrumb ? <div className="mb-1 text-xs text-zinc-400">{breadcrumb}</div> : null}
      {editing ? (
        <input
          data-heading-input
          type="text"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape") cancel();
          }}
          className={`w-full rounded-md border-2 border-teal-500 bg-yellow-50 px-2 py-1 font-semibold text-zinc-900 outline-none dark:bg-yellow-950/40 dark:text-zinc-50 ${sizeClass}`}
        />
      ) : (
        <button
          type="button"
          data-heading-display
          title="Click to rename"
          onClick={() => {
            setDraft(current);
            setEditing(true);
          }}
          className={`-mx-2 w-full rounded-md px-2 py-1 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-50 dark:hover:bg-zinc-800 ${sizeClass}`}
        >
          {current}
        </button>
      )}
      {meta ? <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">{meta}</div> : null}
    </div>
  );
}
