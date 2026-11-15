import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "./UiIcon";

export type ThemeMode = "auto" | "light" | "dark";

export interface ThemeToggleProps {
  storageKey?: string;
  onChange?: (mode: ThemeMode, resolved: "light" | "dark") => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  storageKey = "mango-theme",
  onChange,
  className = "",
}) => {
  const [mode, setMode] = useState<ThemeMode>("auto");

  const resolveTheme = (m: ThemeMode): "light" | "dark" => {
    if (m === "light" || m === "dark") return m;
    const hour = new Date().getHours();
    const isNight =
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      hour >= 19 ||
      hour < 7;
    return isNight ? "dark" : "light";
  };

  const applyTheme = (nextMode: ThemeMode) => {
    const resolved = resolveTheme(nextMode);
    document.documentElement.dataset.theme = nextMode;
    document.documentElement.dataset.resolvedTheme = resolved;
    document.documentElement.style.colorScheme = resolved;
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setMode(nextMode);
    localStorage.setItem(storageKey, nextMode);
    if (onChange) onChange(nextMode, resolved);
  };

  useEffect(() => {
    const saved = (localStorage.getItem(storageKey) as ThemeMode) || "auto";
    applyTheme(saved);
  }, []);

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-medium text-zinc-500 dark:text-zinc-400 select-none ${className}`}
      role="group"
      aria-label="Theme toggle"
    >
      <button
        type="button"
        onClick={() => applyTheme("auto")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          mode === "auto"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
            : "hover:text-zinc-900 dark:hover:text-zinc-100"
        }`}
        title="Follow System/Time"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Auto</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme("light")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          mode === "light"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
            : "hover:text-zinc-900 dark:hover:text-zinc-100"
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          mode === "dark"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
            : "hover:text-zinc-900 dark:hover:text-zinc-100"
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
    </div>
  );
};
