import React, { useState } from "react";
import { UiIcon } from "./UiIcon";

export interface Invitee {
  email: string;
  role: string;
}

export interface InviteTeammatesCardProps {
  title?: string;
  description?: string;
  roles?: string[];
  defaultRole?: string;
  pending?: Invitee[];
  emailPlaceholder?: string;
  sendLabel?: string;
  skipLabel?: string;
  className?: string;
  onInvite?: (invitee: Invitee) => void;
  onRemove?: (invitee: Invitee) => void;
  onSend?: (invitees: Invitee[]) => void;
  onSkip?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * InviteTeammatesCard - onboarding "Invite your team" card: email input with
 * Enter-to-add validation, role select per pending row, removable chips list
 * and Send invites / Skip footer actions.
 */
export const InviteTeammatesCard: React.FC<InviteTeammatesCardProps> = ({
  title = "Invite your teammates",
  description = "Collaboration is better together. Add teammates by email to get started.",
  roles = ["Admin", "Editor", "Viewer"],
  defaultRole,
  pending = [],
  emailPlaceholder = "teammate@company.com",
  sendLabel = "Send invites",
  skipLabel = "Skip for now",
  className = "",
  onInvite,
  onRemove,
  onSend,
  onSkip,
}) => {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(defaultRole ?? roles[0] ?? "Viewer");

  const submit = () => {
    const email = draft.trim();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (pending.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
      setError("That teammate is already on the list.");
      return;
    }
    setError("");
    setDraft("");
    onInvite?.({ email, role: selectedRole });
  };

  return (
    <div
      data-invite-teammates
      className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}
    >
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
        <h4 data-invite-teammates-title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h4>
        <p data-invite-teammates-description className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="px-5 py-4">
        <div
          data-invite-teammates-composer
          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <input
            type="email"
            data-invite-teammates-input
            value={draft}
            placeholder={emailPlaceholder}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder-zinc-500"
          />
          <select
            data-invite-teammates-role
            value={selectedRole}
            aria-label="Invite role"
            onChange={(e) => setSelectedRole(e.target.value)}
            className="shrink-0 rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-invite-teammates-add
            onClick={submit}
            className="shrink-0 rounded bg-zinc-900 p-1 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Add teammate"
          >
            <UiIcon name="plus" size={12} />
          </button>
        </div>
        {error && (
          <p data-invite-teammates-error role="alert" className="mt-1.5 text-[11px] text-red-500">
            {error}
          </p>
        )}

        {pending.length > 0 && (
          <ul data-invite-teammates-list className="mt-3 space-y-1.5">
            {pending.map((invitee) => (
              <li
                key={invitee.email}
                data-invite-teammates-row={invitee.email}
                className="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/60"
              >
                <UiIcon name="mail" size={13} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
                <span className="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">
                  {invitee.email}
                </span>
                <span className="shrink-0 rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {invitee.role}
                </span>
                <button
                  type="button"
                  data-invite-teammates-remove
                  aria-label={`Remove ${invitee.email}`}
                  onClick={() => onRemove?.(invitee)}
                  className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <UiIcon name="x" size={11} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <button
          type="button"
          data-invite-teammates-send
          disabled={pending.length === 0}
          onClick={() => pending.length > 0 && onSend?.(pending)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            pending.length > 0
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          {sendLabel}
        </button>
        <button
          type="button"
          data-invite-teammates-skip
          onClick={() => onSkip?.()}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {skipLabel}
        </button>
        <span className="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {pending.length} pending
        </span>
      </div>
    </div>
  );
};

export default InviteTeammatesCard;
