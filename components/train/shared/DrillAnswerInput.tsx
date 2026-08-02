"use client";

import { FormField, NumericInput } from "@/components/ui";

export function DrillAnswerInput({
  value,
  onChange,
  label,
  prefix = "$",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  prefix?: string;
}) {
  return (
    <FormField label={label}>
      <NumericInput
        prefix={prefix || undefined}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="font-plex text-[18px]"
        style={{ fontFamily: "var(--font-plex-mono, 'IBM Plex Mono', monospace)" }}
      />
    </FormField>
  );
}
