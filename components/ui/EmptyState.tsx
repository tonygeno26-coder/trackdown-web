"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { PrimaryButton } from "./Buttons";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center px-4 py-12 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-td-border/80 bg-td-surface/60">
        <Icon size={28} className="text-td-muted" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="font-display text-xl font-bold uppercase tracking-[2px] text-td-cream">{title}</h2>
      <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-td-muted">{description}</p>
      {action}
      {!action && actionLabel && onAction && (
        <div className="mt-6 w-full max-w-[280px]">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </motion.div>
  );
}
