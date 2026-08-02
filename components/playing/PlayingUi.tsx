"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

export const playingFadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export const playingStagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export function PlayingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative pt-3 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20px] -top-6 bottom-0 bg-playing-radial"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20px] -top-6 bottom-0 bg-playing-radial-bottom opacity-60"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function PlayingCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-td-lg border border-td-border/80 bg-td-surface/90 shadow-td-card backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryPlayingButton({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`flex w-full items-center justify-center gap-2.5 rounded-td-lg bg-td-gradient-red py-4 font-display text-[13.5px] font-bold uppercase tracking-[1.5px] text-td-cream shadow-td-glow-sm hover:shadow-td-glow disabled:opacity-45 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryPlayingButton({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`flex w-full items-center justify-center gap-2 rounded-td border border-td-border/90 bg-td-surface2/80 py-3.5 font-semibold text-[13px] text-td-cream hover:border-td-gold/40 disabled:opacity-45 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function PlayingBottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-[520px] flex-col gap-4 overflow-y-auto rounded-t-td-lg border border-td-border/80 bg-td-surface px-6 pb-8 pt-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold uppercase tracking-[1px] text-td-cream">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-td-muted transition-colors hover:bg-td-surface2 hover:text-td-cream"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function PlayingField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-[11.5px] font-medium uppercase tracking-[0.8px] text-td-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const playingInputClass =
  "rounded-xl border border-td-border bg-td-bg/80 px-3.5 py-3 text-[15px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60";
