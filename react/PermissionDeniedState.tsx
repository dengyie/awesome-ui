/**
 * PermissionDeniedState - Permission-restricted empty state: lock
 * illustration slot, title/description, Request access primary CTA and an
 * optional contact-admin secondary link (permission denied pattern).
 */
import React from "react";

export interface PermissionDeniedStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  contactLabel?: string;
  contactHref?: string;
  children?: React.ReactNode;
  className?: string;
  onRequestAccess?: () => void;
}

export const PermissionDeniedState: React.FC<PermissionDeniedStateProps> = ({
  title = "You don’t have access to this page",
  description = "This space is restricted. Request access and a workspace admin will review your request.",
  ctaLabel = "Request access",
  contactLabel = "or contact a workspace admin",
  contactHref = "#",
  children,
  className = "",
  onRequestAccess,
}) => {
  return (
    <div data-denied-state className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {children || (
        <div data-denied-illustration aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">🔒</div>
      )}
      <div className="space-y-1.5">
        <p data-denied-title className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p data-denied-description className="mx-auto max-w-md text-sm leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <button type="button" data-denied-cta onClick={() => onRequestAccess?.()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500">{ctaLabel}</button>
      {contactLabel ? (
        <a data-denied-contact href={contactHref} className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400">{contactLabel}</a>
      ) : null}
    </div>
  );
};

export default PermissionDeniedState;
