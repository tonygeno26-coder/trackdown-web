"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useMotionSafe } from "./motion";

export function ResultPanel({
  variant = "neutral",
  label,
  value,
  children,
}: {
  variant?: "win" | "loss" | "neutral";
  label?: string;
  value?: ReactNode;
  children?: ReactNode;
}) {
  const motionSafe = useMotionSafe();
  const glow =
    variant === "win"
      ? "bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,#2ecc71_12%,transparent),transparent_60%)]"
      : variant === "loss"
        ? "bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,#8a1620_18%,transparent),transparent_60%)]"
        : "";

  return (
    <motion.div
      initial={motionSafe ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-td border border-td-border/80 bg-td-surface px-6 py-10 text-center shadow-td-card"
    >
      {glow && <div aria-hidden className={`pointer-events-none absolute inset-0 ${glow}`} />}
      {label && (
        <span className="relative text-[10px] font-semibold uppercase tracking-[2.5px] text-td-muted">
          {label}
        </span>
      )}
      {value && (
        <div
          className={`relative mt-3 font-mono text-[44px] font-semibold leading-none ${
            variant === "win" ? "text-td-goldsoft" : variant === "loss" ? "text-red-300" : "text-td-cream"
          }`}
        >
          {value}
        </div>
      )}
      {children && <div className="relative mt-4">{children}</div>}
    </motion.div>
  );
}
