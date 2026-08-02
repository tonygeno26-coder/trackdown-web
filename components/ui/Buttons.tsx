"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  session = false,
  ...props
}: HTMLMotionProps<"button"> & { session?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`flex w-full min-h-[52px] items-center justify-center gap-2.5 rounded-td-lg bg-td-gradient-red font-display text-[13.5px] font-bold uppercase tracking-[1.5px] text-td-cream shadow-td-glow-sm hover:shadow-td-glow disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
        session ? "py-[18px] text-[14px]" : "py-4"
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`flex w-full min-h-[52px] items-center justify-center gap-2 rounded-td border border-td-border/90 bg-td-surface2/80 py-3.5 font-semibold text-[13px] text-td-cream hover:border-td-gold/40 disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function DestructiveButton({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <SecondaryButton
      className={`border-td-red/40 text-red-300 hover:border-td-red/60 ${className}`}
      {...props}
    >
      {children}
    </SecondaryButton>
  );
}

export function IconButton({
  children,
  label,
  className = "",
  ...props
}: HTMLMotionProps<"button"> & { label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-td-border/80 bg-td-surface2/70 text-td-muted transition-colors hover:border-td-gold/30 hover:text-td-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
