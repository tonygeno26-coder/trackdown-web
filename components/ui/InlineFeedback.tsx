"use client";

import { ReactNode } from "react";

export function InlineFeedback({
  variant = "info",
  children,
}: {
  variant?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "border-td-border/80 bg-td-surface2/60 text-td-muted",
    error: "border-td-red/40 bg-td-red/10 text-red-300",
    success: "border-td-goldsoft/40 bg-td-goldsoft/10 text-td-goldsoft",
  };
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed ${styles[variant]}`}
    >
      {children}
    </p>
  );
}
