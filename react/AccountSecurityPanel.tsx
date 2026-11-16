/**
 * AccountSecurityPanel - Account settings security tab: settings tabs,
 * Password row with edit CTA and a "Manage verified sessions" card with
 * per-device rows and remove buttons (Podia account security pattern).
 */
import React from "react";

export interface AccountSession {
  id: string;
  device: string;
  detail: string;
}

export interface AccountSecurityPanelProps {
  tabs?: string[];
  passwordValue?: string;
  sessionsTitle?: string;
  sessionsDescription?: string;
  sessions?: AccountSession[];
  className?: string;
  onTabClick?: (tab: string) => void;
  onEditPassword?: () => void;
  onRemoveSession?: (session: AccountSession) => void;
}

export default function AccountSecurityPanel({
  tabs = ["Personal", "Notifications", "Security", "Billing"],
  passwordValue = "••••••••",
  sessionsTitle = "Manage verified sessions",
  sessionsDescription = "Each time you login to your account, a verification code is emailed to you to proceed. You may have up to 5 login sessions verified at any given time, each of which expire after 30 days.",
  sessions = [
    { id: "s1", device: "Chrome on Mac 10.15.7", detail: "Nov 12 at 4:52 AM EST" },
    { id: "s2", device: "Firefox on Windows 11", detail: "Nov 8 at 9:18 AM EST" },
  ],
  className = "",
  onTabClick,
  onEditPassword,
  onRemoveSession,
}: AccountSecurityPanelProps) {
  const [tab, setTab] = React.useState("Security");

  return (
    <div data-acctsec className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 ${className}`}>
      <h2 data-acctsec-heading className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">Account</h2>

      {/* tabs */}
      <div data-acctsec-tabs className="mt-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            data-acctsec-tab={t}
            onClick={() => {
              setTab(t);
              onTabClick?.(t);
            }}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-zinc-800 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Security" ? (
        <div data-acctsec-panel className="mt-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p data-acctsec-panel-title className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Security</p>

          {/* password row */}
          <div data-acctsec-password className="mt-5 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Password</span>
            <span data-acctsec-password-value className="font-mono text-sm tracking-widest text-zinc-700 dark:text-zinc-200">{passwordValue}</span>
            <button
              type="button"
              data-acctsec-edit-password
              onClick={() => onEditPassword?.()}
              className="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
          </div>

          {/* sessions card */}
          <div data-acctsec-sessions className="mt-6 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p data-acctsec-sessions-title className="font-bold text-zinc-900 dark:text-zinc-50">{sessionsTitle}</p>
            <p data-acctsec-sessions-desc className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{sessionsDescription}</p>
            <div data-acctsec-session-list className="mt-4 space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  data-acctsec-session={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
                >
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">
                    <span data-acctsec-session-device className="font-semibold">{s.device}</span>
                    <span className="text-zinc-400 dark:text-zinc-500"> • {s.detail}</span>
                  </p>
                  <button
                    type="button"
                    data-acctsec-remove={s.id}
                    onClick={() => onRemoveSession?.(s)}
                    aria-label={`Remove ${s.device}`}
                    className="text-zinc-400 transition-colors hover:text-rose-500 dark:hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                data-acctsec-done
                className="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p data-acctsec-placeholder className="mt-5 rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {tab} settings are not part of this demo.
        </p>
      )}
    </div>
  );
}
