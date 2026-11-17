import React from "react";

export interface AccessPerson {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ShareAccessDialogProps {
  open?: boolean;
  title?: string;
  description?: string;
  url?: string;
  copyLabel?: string;
  people?: AccessPerson[];
  className?: string;
  onCopyLink?: () => void;
  onClose?: () => void;
  onRemovePerson?: (person: AccessPerson) => void;
}

/**
 * ShareAccessDialog - Superhuman "Share Conversation" dialog: invite-by-email
 * input, a people-with-access list showing avatar / name / email / permission
 * role with per-row remove, plus a Copy link footer action.
 */
export default function ShareAccessDialog({
  open = false,
  title = "Share Conversation",
  description = "Invite teammates to view this conversation. Everyone with access will see future replies.",
  url = "https://example.com/share/abc123",
  copyLabel = "COPY LINK",
  people = [],
  className = "",
  onCopyLink,
  onClose,
  onRemovePerson,
}: ShareAccessDialogProps) {
  if (!open) return null;
  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  return (
    <div
      data-share-access-backdrop
      className={`fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/40 p-4 ${className}`}
    >
      <div
        data-share-access-dialog
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 data-share-access-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </h4>
            <p data-share-access-description className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
          <button
            type="button"
            data-share-access-close
            aria-label="Close share dialog"
            onClick={() => onClose?.()}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <div data-share-access-invite className="mt-4">
          <input
            type="email"
            data-share-access-input
            placeholder="Add people by name or email"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
          />
        </div>

        <div data-share-access-people className="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700">
          {people.length === 0 ? (
            <p data-share-access-empty className="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No people have access yet.
            </p>
          ) : (
            people.map((person) => (
              <div key={person.id} data-access-person={person.id} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  {initials(person.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p data-access-person-name className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {person.name}
                  </p>
                  <p data-access-person-email className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                    {person.email}
                  </p>
                </div>
                {person.role && (
                  <span
                    data-access-person-role
                    className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {person.role}
                  </span>
                )}
                <button
                  type="button"
                  data-access-person-remove
                  aria-label={`Remove ${person.name}`}
                  onClick={() => onRemovePerson?.(person)}
                  className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div data-share-access-url className="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
          <span data-share-access-url-text className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {url}
          </span>
          <button
            type="button"
            data-share-access-copy
            onClick={() => onCopyLink?.()}
            className="shrink-0 rounded bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
