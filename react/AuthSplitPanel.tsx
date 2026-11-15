import React from "react";

export interface AuthSplitPanelProps {
  media?: React.ReactNode;
  mediaSide?: "left" | "right";
  mediaTitle?: string;
  mediaSubtitle?: string;
  mediaBackground?: "tinted" | "cover";
  footerLinks?: { label: string; href: string }[];
  children?: React.ReactNode;
  className?: string;
}

/**
 * AuthSplitPanel - two-column welcome/auth shell with a tinted brand panel or full-bleed photo beside the auth content.
 */
export default function AuthSplitPanel({
  media,
  mediaSide = "left",
  mediaTitle,
  mediaSubtitle,
  mediaBackground = "tinted",
  footerLinks = [],
  children,
  className = "",
}: AuthSplitPanelProps) {
  const mediaPanel = (
    <div
      data-auth-media
      className={`relative hidden md:flex flex-col items-center justify-center overflow-hidden ${
        mediaBackground === "cover" ? "bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"
      }`}
    >
      {media}
      {mediaTitle ? (
        <p className={`px-8 text-center text-2xl font-bold ${mediaBackground === "cover" ? "text-white" : "text-zinc-900 dark:text-zinc-50"}`}>
          {mediaTitle}
        </p>
      ) : null}
      {mediaSubtitle ? (
        <p className={`mt-2 max-w-xs px-8 text-center text-sm leading-relaxed ${mediaBackground === "cover" ? "text-zinc-300" : "text-zinc-500 dark:text-zinc-400"}`}>
          {mediaSubtitle}
        </p>
      ) : null}
    </div>
  );

  return (
    <div data-auth-split className={`grid min-h-[480px] md:grid-cols-2 ${className}`}>
      {mediaSide === "left" ? mediaPanel : null}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          {children}
          {footerLinks.length ? (
            <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-blue-600 dark:text-blue-400">
              {footerLinks.map((link) => (
                <a key={link.label} href={link.href} className="hover:underline">
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {mediaSide === "right" ? mediaPanel : null}
    </div>
  );
}
