import React, { useState } from "react";
import { UiIcon } from "./UiIcon";

export interface AuthProvider {
  name: string;
  icon?: string;
}

export interface AuthSubmitPayload {
  name?: string;
  email: string;
  password: string;
}

export interface AuthFormProps {
  mode?: "signin" | "signup";
  providers?: AuthProvider[];
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
  submitText?: string;
  footerText?: string;
  onSubmit?: (payload: AuthSubmitPayload) => void;
  onProviderClick?: (provider: AuthProvider) => void;
  onFooterClick?: () => void;
  className?: string;
}

const providerFallback = (name: string) => (name || "?").trim().charAt(0).toUpperCase();

export const AuthForm: React.FC<AuthFormProps> = ({
  mode = "signin",
  providers = [],
  loading = false,
  error,
  title,
  subtitle,
  submitText,
  footerText,
  onSubmit,
  onProviderClick,
  onFooterClick,
  className = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = mode === "signup";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    onSubmit?.({ ...(isSignup ? { name } : {}), email, password });
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors";

  return (
    <div
      className={`w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 ${className}`}
    >
      <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {title || (isSignup ? "Create your account" : "Welcome back")}
      </div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {subtitle || (isSignup ? "Start free, no card required." : "Sign in to continue to your workspace.")}
      </div>

      {providers.length > 0 && (
        <div className="mt-5 space-y-2">
          {providers.map((provider) => (
            <button
              key={provider.name}
              type="button"
              onClick={() => onProviderClick?.(provider)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {provider.icon ? (
                <img src={provider.icon} alt="" className="h-4 w-4 shrink-0" />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {providerFallback(provider.name)}
                </span>
              )}
              <span>Continue with {provider.name}</span>
            </button>
          ))}
        </div>
      )}

      {providers.length > 0 && (
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">or</span>
          <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        </div>
      )}

      <form className={providers.length > 0 ? "space-y-3" : "mt-5 space-y-3"} onSubmit={handleSubmit} noValidate>
        {isSignup && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
              className={inputClass}
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Password</span>
          <input
            type="password"
            name="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2">
            <UiIcon name="alert-triangle" size={14} className="mt-0.5 shrink-0 text-red-500" />
            <span className="text-[11px] leading-relaxed text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
        >
          {loading && <UiIcon name="loader" size={14} className="animate-spin" />}
          {submitText || (isSignup ? "Create account" : "Sign in")}
        </button>
      </form>

      {footerText && (
        <button
          type="button"
          onClick={() => onFooterClick?.()}
          className="mt-4 w-full text-center text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          {footerText}
        </button>
      )}
    </div>
  );
};

export default AuthForm;
