import React from "react";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className = "",
}) => {
  const track = size === "sm" ? "h-4 w-8" : "h-5 w-9";
  const knob = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const shift = size === "sm" ? "translate-x-4" : "translate-x-4";

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? "true" : "false"}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
      } ${track}`}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? shift : "translate-x-0.5"
        } ${knob}`}
      />
    </button>
  );

  if (!label && !description) {
    return <span className={`inline-flex ${className}`}>{control}</span>;
  }

  return (
    <label className={`flex items-start gap-2.5 ${disabled ? "opacity-60" : ""} ${className}`}>
      {control}
      <span className="min-w-0">
        {label && <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-100">{label}</span>}
        {description && (
          <span className="mt-0.5 block text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</span>
        )}
      </span>
    </label>
  );
};

export default ToggleSwitch;
