"use client";

import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "min-h-[48px] w-full rounded-xl border border-td-border bg-td-bg/80 px-3.5 py-3 text-[15px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60 disabled:opacity-45";

export function FormField({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-[11.5px] font-medium uppercase tracking-[0.8px] text-td-muted">
      <span>{label}</span>
      {children}
      {error && (
        <span role="alert" className="normal-case tracking-normal text-[12px] text-red-300">
          {error}
        </span>
      )}
      {hint && !error && (
        <span className="normal-case tracking-normal text-[12px] text-td-muted/80">{hint}</span>
      )}
    </label>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function NumericInput({
  prefix,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  return (
    <div className="flex min-h-[48px] items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
      {prefix && <span className="font-mono text-td-muted">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        className={`flex-1 border-none bg-transparent py-3 pl-1 font-mono text-[15px] font-semibold text-td-cream focus:outline-none disabled:opacity-45 ${className}`}
        {...props}
      />
    </div>
  );
}

export function CurrencyInput({
  value,
  onChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <NumericInput
      prefix="$"
      step="0.01"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function SelectInput({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function TextareaInput({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputClass} min-h-[80px] resize-none ${className}`}
      {...props}
    />
  );
}
