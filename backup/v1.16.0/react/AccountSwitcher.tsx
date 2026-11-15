import React, { useEffect, useRef, useState } from "react";
import { UiIcon } from "./UiIcon";

export interface Account {
  id: string;
  name: string;
  email?: string;
  /** Avatar image URL; falls back to initials. */
  avatar?: string;
  role?: string;
  plan?: string;
}

export interface AccountSwitcherProps {
  accounts?: Account[];
  currentId?: string;
  onSwitch?: (account: Account) => void;
  onAddAccount?: () => void;
  onSignOut?: () => void;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  accounts = [],
  currentId,
  onSwitch,
  onAddAccount,
  onSignOut,
  onOpenChange,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = accounts.find((account) => account.id === currentId) || accounts[0];

  const setOpenState = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenState(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenState(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!current) return null;

  return (
    <div ref={rootRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpenState(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          {current.avatar ? (
            <img src={current.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(current.name)
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">{current.name}</span>
          {current.email && (
            <span className="block truncate text-[10px] text-zinc-400">{current.email}</span>
          )}
        </span>
        <UiIcon name="chevron-down" size={12} className="shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Switch account"
          className="absolute left-0 z-30 mt-1 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <ul className="max-h-64 overflow-y-auto py-1">
            {accounts.map((account) => {
              const active = account.id === current.id;
              return (
                <li key={account.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      onSwitch?.(account);
                      setOpenState(false);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
                      {account.avatar ? (
                        <img src={account.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials(account.name)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">
                        {account.name}
                      </span>
                      <span className="block truncate text-[10px] text-zinc-400">
                        {[account.role, account.plan].filter(Boolean).join(" · ") || account.email}
                      </span>
                    </span>
                    {active && <UiIcon name="check" size={12} className="shrink-0 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-zinc-100 py-1 dark:border-zinc-800">
            {onAddAccount && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onAddAccount();
                  setOpenState(false);
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
              >
                <UiIcon name="plus" size={12} className="text-zinc-400" />
                Add account
              </button>
            )}
            {onSignOut && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onSignOut();
                  setOpenState(false);
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <UiIcon name="arrow-right" size={12} />
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;
