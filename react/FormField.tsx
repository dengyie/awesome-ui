import React from "react";
import { UiIcon } from "./UiIcon";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  counter?: { value: number; max: number };
  helperFooter?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  optional = false,
  hint,
  error,
  counter,
  helperFooter,
  children,
  className = "",
}) => (
  <div
    data-form-field
    className={`flex flex-col gap-1.5 ${className}`}
    aria-invalid={error ? "true" : undefined}
  >
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200"
    >
      {required ? (
        <span aria-hidden="true" className="text-rose-500">*</span>
      ) : null}
      {label}
      {optional ? (
        <span className="text-xs font-normal text-zinc-400">(Optional)</span>
      ) : null}
    </label>
    {children}
    {error ? (
      <p className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
        <UiIcon name="alert-triangle" size={12} />
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-zinc-400">{hint}</p>
    ) : null}
    {counter ? (
      <p className="self-end text-xs tabular-nums text-zinc-400">
        {counter.value}/{counter.max}
      </p>
    ) : null}
    {helperFooter ? (
      <p className="text-xs text-zinc-400">{helperFooter}</p>
    ) : null}
  </div>
);

export default FormField;
